# Stripe 支付安全修复代码示例

本文档提供所有P0和P1安全问题的完整修复代码。

---

## P0-1: 积分充值幂等性修复

### Step 1: 创建 Supabase 迁移

**文件**: `db-wizPulseAI-com/supabase/migrations/20251205_webhook_idempotency.sql`

```sql
-- 1. 为 credit_transactions 表添加 stripe_session_id 列（如果不存在）
ALTER TABLE credit_transactions 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 2. 创建唯一索引，防止同一 session.id 重复充值
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_stripe_session 
ON credit_transactions(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;

-- 3. 创建 webhook_events 表（防止重放攻击）
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX idx_webhook_events_stripe_event_id 
ON webhook_events(stripe_event_id);

CREATE INDEX idx_webhook_events_created_at 
ON webhook_events(created_at);

-- 5. 定期清理 30 天前的事件（可选，使用 pg_cron 或手动）
-- DELETE FROM webhook_events WHERE created_at < NOW() - INTERVAL '30 days';
```

### Step 2: 修改 Webhook 处理逻辑

**文件**: `db-wizPulseAI-com/src/app/api/webhooks/stripe/route.ts`

在 `POST` 函数开头添加重放攻击防护：

```typescript
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  // 现有的签名验证...
  let event;
  try {
    event = payment.constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    // 错误处理...
  }

  // ✅ 新增：防止重放攻击
  if (!supabaseAdmin) {
    throw new Error('Supabase未初始化');
  }

  const { data: processedEvent } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (processedEvent) {
    console.log(`[Webhook] 事件已处理，跳过: ${event.id}`);
    return NextResponse.json({ received: true });
  }

  try {
    // 处理事件...
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      // 其他事件...
    }

    // ✅ 新增：记录已处理的事件
    await supabaseAdmin.from('webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`处理Webhook事件失败:`, error);
    return NextResponse.json(
      { error: `处理Webhook事件失败: ${error.message}` },
      { status: 500 }
    );
  }
}
```

在 `handleCheckoutSessionCompleted` 函数中修改积分充值逻辑：

```typescript
async function handleCheckoutSessionCompleted(session: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId || session.client_reference_id;
  const type = session.metadata?.type;

  if (!userId) {
    throw new Error('结账会话缺少用户ID');
  }

  // ========== 积分购买处理 ==========
  if (type === 'credits') {
    console.log('[Webhook] 处理积分购买:', {
      sessionId: session.id,
      userId,
      packageId: session.metadata?.packageId,
      credits: session.metadata?.credits,
      product: session.metadata?.product,
    });

    const packageId = session.metadata?.packageId;
    const credits = parseInt(session.metadata?.credits || '0', 10);
    const product = session.metadata?.product || 'unknown';

    if (!packageId || !credits) {
      console.error('[Webhook] 积分购买缺少必要信息');
      return;
    }

    // 验证点数包
    const creditPackage = getPackageById(packageId);
    if (!creditPackage) {
      console.error('[Webhook] 无效的点数包ID:', packageId);
      return;
    }

    // ✅ 新增：验证实际支付金额
    const amountPaid = session.amount_total; // 单位：分
    const expectedAmount = creditPackage.price * 100; // 日元转分

    if (amountPaid !== expectedAmount) {
      console.error('[Webhook] 金额不匹配:', {
        paid: amountPaid,
        expected: expectedAmount,
        package: creditPackage.nameJa,
      });
      throw new Error(`支付金额验证失败: 预期 ${expectedAmount}, 实际 ${amountPaid}`);
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase未初始化');
    }

    // ✅ 新增：检查是否已处理此 session
    const { data: existingTx } = await supabaseAdmin
      .from('credit_transactions')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingTx) {
      console.log('[Webhook] 此支付会话已处理，跳过充值:', session.id);
      return;
    }

    // 使用 CreditService 充值
    const creditService = new CreditService(supabaseAdmin);
    
    // ✅ 修改：添加 stripe_session_id 到 metadata
    const result = await creditService.addCredits(
      userId,
      credits,
      'purchase',
      `購入: ${creditPackage.nameJa} (${credits} ポイント)`,
      product,
      {
        stripeSessionId: session.id, // ← 关键：用于幂等性检查
        stripePaymentIntent: session.payment_intent,
        packageId,
        packageName: creditPackage.nameJa,
        price: creditPackage.price,
        amountPaid: amountPaid / 100, // 存储为日元
      }
    );

    console.log('[Webhook] 积分充值完成:', {
      userId,
      credits,
      newBalance: result.newBalance,
    });

    return;
  }

  // ========== 订阅处理（原有逻辑）==========
  // ...
}
```

### Step 3: 更新 CreditService

**文件**: `db-wizPulseAI-com/src/lib/credits/service.ts`

修改 `recordTransaction` 方法以存储 `stripe_session_id`：

```typescript
private async recordTransaction(
  userId: string,
  amount: number,
  type: CreditTransaction['type'],
  description: string,
  product?: string,
  metadata?: Record<string, any>
) {
  const txData: any = {
    user_id: userId,
    amount,
    type,
    description,
    product: product || null,
    metadata: metadata || {},
  };

  // ✅ 新增：如果 metadata 中有 stripeSessionId，提取到单独的列
  if (metadata?.stripeSessionId) {
    txData.stripe_session_id = metadata.stripeSessionId;
  }

  const { error } = await (this.supabase
    .from('credit_transactions') as any)
    .insert(txData);

  if (error) {
    // ✅ 改进：如果是唯一性冲突，记录但不抛错
    if (error.code === '23505') { // PostgreSQL unique violation
      console.warn('[CreditService] 交易已存在（幂等性），跳过:', metadata?.stripeSessionId);
      return;
    }
    console.error('Failed to record transaction:', error);
    // 不抛出错误，交易记录失败不应该影响主流程
  }
}
```

---

## P0-2: 服务端价格验证修复

### Step 1: 修改 Checkout API

**文件**: `db-wizPulseAI-com/src/app/api/subscriptions/checkout/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandler();

    if (!supabase) {
      console.error('[API][checkout] Failed to initialize Supabase client.');
      return NextResponse.json(
        { error: 'supabase_initialization_failed', message: '无法初始化服务，请稍后再试' },
        { status: 500 }
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    // ✅ 修改：改为接收 planId 而非 priceId
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: '缺少套餐ID' },
        { status: 400 }
      );
    }

    // ✅ 新增：从数据库验证套餐并获取真实 priceId
    const { data: plan, error: planError } = await supabase
      .from('products')
      .select('id, name, prices(id, stripe_id, unit_amount, currency)')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('[Checkout] 无效的套餐ID:', planId, planError);
      return NextResponse.json(
        { error: '无效的套餐' },
        { status: 400 }
      );
    }

    // 获取第一个有效价格（或根据业务逻辑选择）
    const price = Array.isArray(plan.prices) ? plan.prices[0] : plan.prices;

    if (!price || !price.stripe_id) {
      console.error('[Checkout] 套餐缺少价格信息:', planId);
      return NextResponse.json(
        { error: '套餐配置错误' },
        { status: 500 }
      );
    }

    try {
      // ✅ 使用服务端验证的 priceId
      const checkoutSession = await payment.createCheckoutSession({
        priceId: price.stripe_id, // ← 服务端控制的价格
        userId: session.user.id,
        customerEmail: session.user.email,
        metadata: {
          planId,
          planName: plan.name,
          expectedAmount: price.unit_amount.toString(),
          expectedCurrency: price.currency,
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error('Stripe结账会话创建失败:', stripeError);
      return NextResponse.json(
        { error: stripeError.message || 'Stripe操作失败' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('创建结账会话失败:', error);
    return NextResponse.json(
      { error: error.message || '创建结账会话失败' },
      { status: 500 }
    );
  }
}
```

### Step 2: 在 Webhook 中验证金额

**文件**: `db-wizPulseAI-com/src/app/api/webhooks/stripe/route.ts`

在 `handleSubscriptionCreated` 中添加金额验证：

```typescript
async function handleSubscriptionCreated(subscription: any) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0].price.id;
  const productId = subscription.items.data[0].price.product.id;

  if (!supabaseAdmin) {
    throw new Error('Supabase未初始化');
  }

  // 查找用户...
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!users || users.length === 0) {
    throw new Error(`找不到与Stripe客户ID ${customerId} 关联的用户`);
  }

  const userId = users[0].id;

  // 查找价格...
  const { data: prices } = await supabaseAdmin
    .from('prices')
    .select('id, unit_amount, currency')
    .eq('stripe_id', priceId);

  if (!prices || prices.length === 0) {
    throw new Error(`找不到价格ID ${priceId}`);
  }

  const price = prices[0];

  // ✅ 新增：验证金额（从 subscription 元数据获取预期金额）
  const actualAmount = subscription.items.data[0].price.unit_amount;
  const expectedAmount = price.unit_amount;

  if (actualAmount !== expectedAmount) {
    console.error('[Webhook] 订阅金额不匹配:', {
      subscriptionId,
      actual: actualAmount,
      expected: expectedAmount,
    });
    // ⚠️  严重安全问题，拒绝处理
    throw new Error(`订阅金额验证失败: 预期 ${expectedAmount}, 实际 ${actualAmount}`);
  }

  // 创建或更新订阅记录...
  // (原有逻辑)
}
```

---

## P1-1: Webhook Secret 管理

### Step 1: 本地开发配置

**安装 Stripe CLI**:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# 登录
stripe login
```

**启动 Webhook 转发**:
```bash
# 在项目根目录
stripe listen --forward-to localhost:3012/api/webhooks/stripe

# 输出示例：
# > Ready! Your webhook signing secret is whsec_abc123...
```

**更新 `.env.local`**:
```env
# 使用 Stripe CLI 生成的 secret
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz_从_stripe_listen_获取
```

### Step 2: 生产环境配置

**在 Vercel 环境变量中设置**:
```
STRIPE_WEBHOOK_SECRET=whsec_live_从_Stripe_Dashboard_获取
```

**获取生产 Webhook Secret**:
1. 访问 [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. 添加端点: `https://dashboard.wizpulseai.com/api/webhooks/stripe`
3. 选择事件: `checkout.session.completed`, `customer.subscription.*`
4. 复制 "Signing secret" (whsec_xxx)

---

## P2: 速率限制（可选）

### 使用 Vercel KV

**安装依赖**:
```bash
npm install @vercel/kv @upstash/ratelimit
```

**配置环境变量** (Vercel Dashboard):
```
KV_REST_API_URL=your-upstash-url
KV_REST_API_TOKEN=your-upstash-token
```

**修改 Webhook**:
```typescript
// src/app/api/webhooks/stripe/route.ts
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 每分钟100次
});

export async function POST(req: Request) {
  // ✅ 新增：速率限制
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining } = await ratelimit.limit(`webhook_${ip}`);

  if (!success) {
    console.warn(`[Webhook] 速率限制触发: IP ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 继续处理...
}
```

---

## 测试验证

### 测试 1: 幂等性验证

```bash
# 使用 Stripe CLI 触发两次相同的事件
stripe trigger checkout.session.completed

# 检查数据库
# 应该只有一条 credit_transactions 记录
psql -d your_db -c "SELECT COUNT(*) FROM credit_transactions WHERE stripe_session_id = 'cs_test_xxx';"
# 预期: 1
```

### 测试 2: 价格篡改验证

```javascript
// 在浏览器控制台
fetch('/api/subscriptions/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'invalid-plan-id', // 无效的 planId
  }),
})
  .then(r => r.json())
  .then(console.log);
// 预期: { error: '无效的套餐' }
```

### 测试 3: 金额验证

```bash
# 手动修改 Stripe Dashboard 中的价格
# 触发 Webhook
stripe trigger checkout.session.completed

# 检查日志
# 应该看到 "金额不匹配" 错误
```

---

## 部署清单

### 开发环境

- [ ] 安装 Stripe CLI
- [ ] 启动 `stripe listen`
- [ ] 复制 Webhook Secret 到 `.env.local`
- [ ] 运行迁移脚本
- [ ] 测试幂等性
- [ ] 测试价格验证

### 生产环境

- [ ] 在 Stripe Dashboard 配置 Webhook 端点
- [ ] 复制 Webhook Secret 到 Vercel 环境变量
- [ ] 部署代码到 Vercel
- [ ] 运行 Supabase 迁移（生产数据库）
- [ ] 触发测试 Webhook
- [ ] 监控 Webhook 日志
- [ ] 设置告警（金额不匹配、重复事件）

---

## 回滚计划

如果修复导致问题，执行以下步骤：

### Step 1: 代码回滚
```bash
git revert <commit-hash>
git push origin main
```

### Step 2: 数据库回滚
```sql
-- 删除新增的列和表
ALTER TABLE credit_transactions DROP COLUMN stripe_session_id;
DROP TABLE webhook_events;
```

### Step 3: 环境变量恢复
- 恢复旧的 `STRIPE_WEBHOOK_SECRET` (如果修改了)

---

**文档版本**: v1.0
**最后更新**: 2025-12-05
**下次审查**: 修复完成后
