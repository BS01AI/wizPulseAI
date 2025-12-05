# Stripe 支付安全审计报告

**审计日期**: 2025-12-05
**审计站点**: Dashboard (db-wizPulseAI-com)
**审计范围**: Stripe 支付集成安全性

---

## 执行摘要

### 总体评分: 78/100 ⭐⭐⭐⭐

**评分分布**:
- Webhook 安全: 85/100 ⭐⭐⭐⭐
- 密钥管理: 90/100 ⭐⭐⭐⭐⭐
- 支付逻辑: 70/100 ⭐⭐⭐
- 客户端安全: 65/100 ⭐⭐⭐

**风险等级**: 中等 (Medium Risk)

**关键发现**:
- ✅ Webhook 签名验证正确实现
- ✅ 密钥存储安全（环境变量）
- ⚠️  价格验证存在客户端信任问题
- ⚠️  Webhook 端点缺少速率限制
- ⚠️  测试模式密钥在开发环境中硬编码

---

## 1. Webhook 安全分析

### 1.1 签名验证 ✅

**文件**: `src/app/api/webhooks/stripe/route.ts`

**实现分析**:
```typescript
// ✅ 正确的签名验证
const signature = headers().get('stripe-signature') as string;

if (!signature) {
  return NextResponse.json(
    { error: 'Webhook签名缺失' },
    { status: 400 }
  );
}

event = payment.constructWebhookEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**优点**:
- ✅ 使用 Stripe SDK 内置验证方法
- ✅ 拒绝无签名的请求（400错误）
- ✅ 错误处理完善
- ✅ 使用环境变量存储 Webhook Secret

**评分**: 85/100

**扣分原因**:
- ⚠️  缺少重放攻击防护（-10分）
- ⚠️  缺少速率限制（-5分）

### 1.2 幂等性处理 ⚠️

**当前实现**:
```typescript
// 订阅创建时检查是否已存在
const { data: existingSubscription } = await supabaseAdmin
  .from('subscriptions')
  .select('id')
  .eq('stripe_subscription_id', subscriptionId)
  .maybeSingle();

if (existingSubscription) {
  // 更新现有订阅
  await supabaseAdmin.from('subscriptions').update(...)
} else {
  // 创建新订阅
  await supabaseAdmin.from('subscriptions').insert(...)
}
```

**优点**:
- ✅ 订阅事件实现了幂等性（upsert逻辑）
- ✅ 避免重复创建订阅记录

**问题**:
- ⚠️  积分充值未检查 `session.id` 是否已处理
- ⚠️  可能导致重复充值（严重漏洞）

**风险**: HIGH 🔴

### 1.3 建议的改进

**P0 - 立即修复**: 积分充值幂等性

```typescript
// ❌ 当前代码（存在重复充值风险）
if (type === 'credits') {
  const creditService = new CreditService(supabaseAdmin);
  const result = await creditService.addCredits(
    userId,
    credits,
    'purchase',
    `購入: ${creditPackage.nameJa} (${credits} ポイント)`,
    product,
    {
      stripeSessionId: session.id,
      // ...
    }
  );
  return;
}

// ✅ 建议的修复
if (type === 'credits') {
  // 1. 检查是否已处理此 session
  const { data: existingTx } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('metadata->stripeSessionId', session.id)
    .maybeSingle();

  if (existingTx) {
    console.log('[Webhook] 此支付会话已处理，跳过');
    return;
  }

  // 2. 充值（带有唯一性约束）
  const creditService = new CreditService(supabaseAdmin);
  const result = await creditService.addCredits(...);
  return;
}
```

**P1 - 高优先级**: 重放攻击防护

```typescript
// 在 Supabase 中创建 webhook_events 表
// 存储最近30天的 event.id，防止重放

const { data: processedEvent } = await supabaseAdmin
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .maybeSingle();

if (processedEvent) {
  console.log('事件已处理，跳过');
  return NextResponse.json({ received: true });
}

// 处理事件...

// 记录事件
await supabaseAdmin.from('webhook_events').insert({
  stripe_event_id: event.id,
  event_type: event.type,
  processed_at: new Date().toISOString(),
});
```

**P2 - 建议**: 速率限制

```typescript
// 使用 Vercel KV 或 Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 每分钟100次
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = await ratelimit.limit(`webhook_${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 继续处理...
}
```

---

## 2. 密钥管理分析

### 2.1 环境变量存储 ✅

**当前配置**:
```env
# .env.local (示例，实际密钥已隐藏)
STRIPE_SECRET_KEY=sk_test_***YOUR_SECRET_KEY***
STRIPE_WEBHOOK_SECRET=whsec_***YOUR_WEBHOOK_SECRET***
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***YOUR_PUBLISHABLE_KEY***
```

**优点**:
- ✅ 密钥存储在环境变量中（不在代码中）
- ✅ `.env.local` 已在 `.gitignore` 中排除
- ✅ 使用测试模式密钥（sk_test_）
- ✅ Publishable Key 正确使用 `NEXT_PUBLIC_` 前缀

**评分**: 90/100

**扣分原因**:
- ⚠️  开发环境 Webhook Secret 使用占位符（-10分）

### 2.2 密钥使用审计

**服务端密钥使用** (9处引用):
```typescript
// ✅ 所有引用都在服务端（API路由或Webhook）
src/lib/payment-service.ts:    const secretKey = process.env.STRIPE_SECRET_KEY;
src/app/api/webhooks/stripe/route.ts:  if (!process.env.STRIPE_WEBHOOK_SECRET) {
```

**客户端密钥**:
- ❓ 未找到 `loadStripe()` 或 Stripe.js 使用
- ✅ Publishable Key 使用 `NEXT_PUBLIC_` 前缀（安全）

**结论**: 密钥使用符合最佳实践

### 2.3 建议的改进

**P1 - 高优先级**: Webhook Secret 管理

```bash
# 1. 本地开发：使用 Stripe CLI
stripe listen --forward-to localhost:3012/api/webhooks/stripe
# 会输出: whsec_xxx (复制到 .env.local)

# 2. 生产环境：在 Vercel 环境变量中配置
# STRIPE_WEBHOOK_SECRET=whsec_live_xxx
```

**P2 - 建议**: 多环境密钥管理

```typescript
// lib/stripe-config.ts
export const getStripeConfig = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY_LIVE,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_LIVE,
    };
  }
  
  return {
    secretKey: process.env.STRIPE_SECRET_KEY_TEST,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST,
  };
};
```

---

## 3. 支付逻辑安全

### 3.1 价格验证 ⚠️

**文件**: `src/app/api/subscriptions/checkout/route.ts`

**当前实现**:
```typescript
const { priceId } = await req.json(); // ❌ 客户端传递

if (!priceId) {
  return NextResponse.json({ error: '缺少价格ID' }, { status: 400 });
}

const checkoutSession = await payment.createCheckoutSession({
  priceId, // ❌ 直接使用客户端数据
  userId: session.user.id,
  customerEmail: session.user.email,
});
```

**问题**:
- ⚠️  价格ID由客户端传递，未在服务端验证
- ⚠️  恶意用户可能传递错误的 priceId（例如：免费套餐的价格）
- ⚠️  缺少金额和产品信息验证

**风险**: MEDIUM 🟡

**评分**: 70/100

### 3.2 积分充值验证 ✅

**文件**: `src/app/api/webhooks/stripe/route.ts`

**当前实现**:
```typescript
// ✅ 从 Webhook metadata 中获取数据（服务端可信）
const packageId = session.metadata?.packageId;
const credits = parseInt(session.metadata?.credits || '0', 10);

if (!packageId || !credits) {
  console.error('[Webhook] 积分购买缺少必要信息');
  return;
}

// ✅ 验证点数包
const creditPackage = getPackageById(packageId);
if (!creditPackage) {
  console.error('[Webhook] 无效的点数包ID:', packageId);
  return;
}
```

**优点**:
- ✅ 验证点数包存在性
- ✅ 解析并验证积分数量
- ✅ 使用 Stripe metadata 传递可信数据

**问题**:
- ⚠️  未验证实际支付金额与点数包价格是否匹配

### 3.3 建议的改进

**P0 - 立即修复**: 服务端价格验证

```typescript
// ❌ 当前代码
const { priceId } = await req.json();

// ✅ 建议的修复
const { planId } = await req.json(); // 改为传递 planId

// 从数据库或配置中获取真实的 priceId
const { data: plan } = await supabase
  .from('plans')
  .select('stripe_price_id, amount, currency')
  .eq('id', planId)
  .single();

if (!plan) {
  return NextResponse.json({ error: '无效的套餐' }, { status: 400 });
}

// 使用服务端验证的 priceId
const checkoutSession = await payment.createCheckoutSession({
  priceId: plan.stripe_price_id,
  metadata: {
    planId,
    expectedAmount: plan.amount,
    expectedCurrency: plan.currency,
  },
  // ...
});
```

**P1 - 高优先级**: Webhook 金额验证

```typescript
// 在 handleCheckoutSessionCompleted 中
if (type === 'credits') {
  const creditPackage = getPackageById(packageId);
  
  // ✅ 验证实际支付金额
  const amountPaid = session.amount_total; // 单位：分
  const expectedAmount = creditPackage.price * 100;
  
  if (amountPaid !== expectedAmount) {
    console.error('[Webhook] 金额不匹配:', {
      paid: amountPaid,
      expected: expectedAmount,
    });
    throw new Error('支付金额验证失败');
  }
  
  // 继续充值...
}
```

---

## 4. 客户端安全

### 4.1 Stripe.js 使用 ❓

**发现**: 未找到 `loadStripe()` 或客户端 Stripe 使用

**分析**:
- ✅ 支付流程使用 Stripe Checkout（重定向模式）
- ✅ 不需要在客户端加载 Stripe.js
- ✅ 减少了客户端安全风险

**评分**: 65/100

**扣分原因**:
- ⚠️  未找到支付按钮组件（-20分）
- ⚠️  无法验证是否有 XSS 防护（-15分）

### 4.2 CSRF 防护

**Next.js 14 内置防护**:
- ✅ API 路由使用 POST 方法
- ✅ Next.js 自动处理 CSRF token

**Supabase Auth**:
- ✅ Session 验证基于 JWT
- ✅ 不依赖 Cookie-based CSRF token

**结论**: CSRF 防护充分

### 4.3 建议的改进

**P2 - 建议**: CSP 头部配置

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'none';",
          },
        ],
      },
    ];
  },
};
```

---

## 5. 风险评估矩阵

| 安全问题 | 风险等级 | 影响范围 | 修复优先级 | 修复成本 |
|---------|---------|---------|----------|---------|
| 积分充值幂等性缺失 | 🔴 HIGH | 财务损失 | P0 | 低 (2小时) |
| 价格验证缺失 | 🟡 MEDIUM | 财务损失 | P0 | 中 (4小时) |
| Webhook 重放攻击 | 🟡 MEDIUM | 数据重复 | P1 | 中 (3小时) |
| Webhook Secret 占位符 | 🟡 MEDIUM | 开发环境 | P1 | 低 (1小时) |
| Webhook 速率限制 | 🟢 LOW | DDoS | P2 | 高 (需外部服务) |
| 金额验证缺失 | 🟡 MEDIUM | 财务损失 | P1 | 低 (2小时) |
| CSP 头部 | 🟢 LOW | XSS | P2 | 低 (1小时) |

---

## 6. 修复计划

### Phase 1: 关键漏洞修复 (P0) - 预计6小时

**任务 1.1**: 积分充值幂等性
- 在 `credit_transactions` 表添加唯一约束
- 在充值前检查 `stripeSessionId`
- 添加单元测试验证幂等性

**任务 1.2**: 服务端价格验证
- 修改 checkout API 接受 `planId` 而非 `priceId`
- 从数据库查询真实价格
- 在 metadata 中记录预期金额

**任务 1.3**: Webhook 金额验证
- 在 `handleCheckoutSessionCompleted` 中验证金额
- 记录金额不匹配的审计日志
- 发送告警通知

**验收标准**:
- ✅ 积分充值重复执行不会重复加分
- ✅ 修改客户端请求无法影响实际支付价格
- ✅ Webhook 金额不匹配会拒绝处理

### Phase 2: 高优先级改进 (P1) - 预计6小时

**任务 2.1**: 重放攻击防护
- 创建 `webhook_events` 表（Supabase 迁移）
- 添加事件去重逻辑
- 设置30天自动清理（Supabase 定时任务）

**任务 2.2**: Webhook Secret 管理
- 安装 Stripe CLI
- 生成本地开发 Webhook Secret
- 更新部署文档

**任务 2.3**: 金额验证
- 在所有充值点添加金额验证
- 记录审计日志

**验收标准**:
- ✅ Webhook 重放攻击被拦截
- ✅ 开发环境 Webhook 签名验证正常工作
- ✅ 所有支付金额被验证

### Phase 3: 可选优化 (P2) - 预计4小时

**任务 3.1**: Webhook 速率限制
- 集成 Upstash Redis（或使用 Vercel KV）
- 实现滑动窗口速率限制
- 配置告警通知

**任务 3.2**: CSP 头部
- 配置严格的 CSP 策略
- 测试 Stripe Checkout 兼容性

**任务 3.3**: 安全测试
- 编写自动化安全测试
- 使用 Stripe CLI 模拟攻击场景

---

## 7. 最佳实践建议

### 7.1 开发环境

1. **使用 Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3012/api/webhooks/stripe
   ```

2. **测试 Webhook**:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **日志记录**:
   - 记录所有 Webhook 事件（包括被拒绝的）
   - 使用结构化日志（JSON格式）
   - 集成日志分析工具（Sentry/LogRocket）

### 7.2 生产环境

1. **Webhook 端点安全**:
   - 启用 HTTPS（Vercel 自动配置）
   - 配置 Vercel 环境变量（非 Git）
   - 定期轮换 Webhook Secret

2. **监控和告警**:
   - 监控 Webhook 失败率
   - 设置金额异常告警（>1000日元的单笔充值）
   - 监控重复事件（潜在攻击）

3. **备份和回滚**:
   - 定期备份 Supabase 数据库
   - 实施财务对账流程（Stripe vs Supabase）
   - 准备退款SOP

### 7.3 代码审查清单

在每次修改支付相关代码时，检查：

- [ ] 是否在服务端验证所有金额？
- [ ] 是否实现幂等性处理？
- [ ] 是否记录审计日志？
- [ ] 是否添加单元测试？
- [ ] 是否更新安全文档？

---

## 8. 合规性检查

### 8.1 PCI DSS

**适用情况**: 使用 Stripe Checkout（重定向模式）

**SAQ A 级别**:
- ✅ 不处理、存储或传输卡号
- ✅ 所有支付由 Stripe 处理
- ✅ 使用 HTTPS（Vercel 自动配置）

**结论**: 符合 PCI DSS SAQ A 要求

### 8.2 GDPR

**个人数据处理**:
- ✅ 用户邮箱通过 Supabase Auth 管理
- ✅ Stripe 客户ID关联用户ID
- ❓ 缺少数据删除SOP（GDPR 第17条）

**建议**:
- 实现用户删除API（同时删除 Stripe 客户数据）
- 更新隐私政策
- 添加 Cookie 同意横幅

### 8.3 日本特定支付法

**资金移动业**:
- ✅ 使用持牌支付服务商（Stripe）
- ✅ 不直接处理用户资金
- ✅ 积分系统属于前付式支付手段（プリペイド）

**建议**:
- 在服务条款中明确积分不可退款政策
- 记录所有积分交易（已实现）

---

## 9. 总结

### 9.1 优势

1. ✅ **Webhook 签名验证**: 使用官方SDK，实现正确
2. ✅ **密钥管理**: 环境变量存储，未硬编码
3. ✅ **订阅幂等性**: 使用upsert逻辑
4. ✅ **架构设计**: PaymentService 封装良好

### 9.2 关键风险

1. 🔴 **积分充值幂等性**: 可能重复充值（P0）
2. 🟡 **价格验证**: 客户端数据未验证（P0）
3. 🟡 **Webhook 重放**: 缺少事件去重（P1）
4. 🟡 **金额验证**: 未检查实际支付金额（P1）

### 9.3 修复时间估算

| Phase | 预计时间 | 优先级 |
|-------|---------|--------|
| Phase 1 (P0修复) | 6小时 | 立即 |
| Phase 2 (P1改进) | 6小时 | 本周 |
| Phase 3 (P2优化) | 4小时 | 本月 |
| **总计** | **16小时** | **2-3天** |

### 9.4 建议的执行顺序

1. **今天**: 修复积分充值幂等性（2小时）
2. **明天**: 实现服务端价格验证（4小时）
3. **本周**: 重放攻击防护 + Webhook Secret（6小时）
4. **下周**: 速率限制 + 安全测试（4小时）

---

## 10. 附录

### 10.1 测试用例

**测试 1: 积分充值幂等性**
```bash
# 模拟 Webhook 重复发送
curl -X POST http://localhost:3012/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: xxx" \
  -d @webhook_payload.json

# 重复发送同一 session.id
curl -X POST http://localhost:3012/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: xxx" \
  -d @webhook_payload.json

# 预期: 第二次返回200但不充值
```

**测试 2: 价格篡改攻击**
```javascript
// 尝试使用错误的 priceId
const response = await fetch('/api/subscriptions/checkout', {
  method: 'POST',
  body: JSON.stringify({
    priceId: 'price_free_plan', // 尝试使用免费套餐价格
  }),
});

// 预期: 400错误或重定向到正确价格
```

### 10.2 相关文档

- [Stripe Webhook 最佳实践](https://stripe.com/docs/webhooks/best-practices)
- [PCI DSS SAQ A](https://www.pcisecuritystandards.org/document_library)
- [GDPR 第17条 - 删除权](https://gdpr-info.eu/art-17-gdpr/)

### 10.3 联系人

- **安全问题**: security@wizpulseai.com
- **Stripe 支持**: https://support.stripe.com/

---

**报告生成**: 2025-12-05 by Security Auditor Agent
**下次审计**: 修复完成后（预计2025-12-08）
