# WizPulseAI 积分系统架构

> 创建日期: 2025-11-27
> 状态: 已实施

## 1. 系统概述

积分系统是 WizPulseAI 的统一计费模块，支持所有产品站点的点数购买和消耗。

### 架构原则

**方案 C：混合模式**

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户视角                                 │
├─────────────────────────────────────────────────────────────────┤
│  Fashion /pricing ──点击购买──▶ Stripe ──完成──▶ /purchase/success │
│  Novel /pricing                                                  │
│  其他产品站点                                                    │
│      (UI 保持在产品站点内，用户无感知跳转)                        │
└─────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────┐
│                         后端实现                                │
├───────────────────────────────┼───────────────────────────────┤
│                               ▼                                │
│  产品站点 /api/credits/* ───▶ Dashboard /api/credits/*         │
│      (代理转发)                    (统一处理)                   │
│                               │                                │
│                               ▼                                │
│                    Supabase (共享数据库)                        │
│                    ├── user_credits        用户余额             │
│                    └── credit_transactions 交易记录             │
│                               │                                │
│                               ▼                                │
│              Dashboard /api/webhooks/stripe                    │
│                    (统一处理所有 Stripe 事件)                   │
└───────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────┐
│                         管理界面                                │
├───────────────────────────────┼───────────────────────────────┤
│  Dashboard /dashboard/credits         ← 用户查看自己的积分       │
│  Dashboard /dashboard/admin/credits   ← 管理员查看所有积分       │
└───────────────────────────────────────────────────────────────┘
```

### 优势

| 优势 | 说明 |
|------|------|
| 用户体验 | UI 在产品站点内，无需跳转 |
| 逻辑集中 | Stripe/Webhook 统一在 Dashboard |
| 便于管理 | 管理员可在 Dashboard 查看所有产品的积分数据 |
| 易于扩展 | 新产品只需代理到 Dashboard API |

## 2. 数据模型

### 2.1 数据库表

```sql
-- 用户积分余额
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 积分交易记录
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,          -- 正数=充值，负数=消耗
  type VARCHAR(20) NOT NULL,        -- purchase, usage, refund, bonus, trial
  description TEXT,
  product VARCHAR(50),              -- fashion, novel, etc
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 点数包配置

```typescript
// Dashboard: src/lib/credits/packages.ts
export const CREDIT_PACKAGES = [
  { id: 'trial', credits: 30, price: 0 },       // 免费试用
  { id: 'starter', credits: 100, price: 100 },  // ¥100
  { id: 'standard', credits: 300, price: 300, popular: true },
  { id: 'value', credits: 1000, price: 800, discount: '20%OFF' },
]
```

## 3. API 设计

### 3.1 Dashboard API（主服务）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/credits/packages` | GET | 获取点数包列表 |
| `/api/credits/balance` | GET | 获取用户余额 |
| `/api/credits/checkout` | POST | 创建支付会话 |
| `/api/credits/transactions` | GET | 获取交易历史 |
| `/api/admin/credits/users` | GET | 管理员：所有用户余额 |
| `/api/admin/credits/transactions` | GET | 管理员：所有交易记录 |

### 3.2 产品站点 API（代理）

产品站点（Fashion, Novel 等）的 `/api/credits/*` 代理到 Dashboard：

```typescript
// Fashion: src/app/api/credits/checkout/route.ts
const res = await fetch(`${DASHBOARD_URL}/api/credits/checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    packageId,
    product: 'fashion',  // 标记来源产品
    successUrl: `${fashionUrl}/purchase/success`,
    cancelUrl: `${fashionUrl}/purchase/cancel`,
  }),
})
```

## 4. 支付流程

```
用户点击「購入する」
        │
        ▼
Fashion /api/credits/checkout
        │ (代理)
        ▼
Dashboard /api/credits/checkout
        │
        ▼
创建 Stripe Checkout Session
  metadata: {
    type: 'credits',     ← 标记为积分购买
    product: 'fashion',  ← 来源产品
    packageId: 'standard',
    credits: '300',
  }
        │
        ▼
用户完成 Stripe 支付
        │
        ▼
Stripe Webhook → Dashboard /api/webhooks/stripe
        │
        ▼
检测 metadata.type === 'credits'
        │
        ▼
CreditService.addCredits()
  - 更新 user_credits.balance
  - 记录 credit_transactions
        │
        ▼
用户跳转回 Fashion /purchase/success
        │
        ▼
显示新余额，引导继续使用
```

## 5. 用户界面

### 5.1 产品站点内（简化版）

**Fashion /pricing**
- 点数包选择
- 购买按钮
- 当前余额显示
- 测试卡号提示（开发环境）

**Fashion 其他页面**
- 右上角显示余额
- 余额不足时提示购买
- 「查看详细」链接到 Dashboard

### 5.2 Dashboard（完整版）

**用户：/dashboard/credits**
- 当前余额（大字显示）
- 点数包购买
- 交易历史（购买/使用/退款）

**管理员：/dashboard/admin/credits**
- 统计概览（总用户、总余额、购买额、使用额）
- 用户余额列表
- 全部交易记录

## 6. 扩展指南

### 6.1 新产品接入

1. 复制 Fashion 的 `/api/credits/*` API 路由
2. 修改 `product` 参数为新产品名
3. 配置 `NEXT_PUBLIC_DASHBOARD_URL`
4. 在产品中调用 CreditService.deduct() 扣除积分

### 6.2 新增点数包

在 Dashboard `src/lib/credits/packages.ts` 添加：

```typescript
{
  id: 'premium',
  name: 'Premium Pack',
  nameJa: 'プレミアム',
  credits: 3000,
  price: 2000,
  discount: '33%OFF',
  product: 'all',  // 或指定产品
}
```

### 6.3 自定义积分消耗

```typescript
// 产品内使用
import { CreditService } from '@/lib/credits/service'

const creditService = new CreditService(supabase)

// 扣除积分
const result = await creditService.deduct(
  userId,
  20,  // 消耗点数
  'AI効果図生成',  // 描述
  'fashion',  // 产品
  { imageId: '...' }  // 元数据
)

if (!result.success) {
  // 余额不足
  return redirect('/pricing')
}
```

## 7. 环境变量

### Dashboard

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 产品站点

```env
# Dashboard URL（积分 API 代理目标）
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3012

# Stripe（可选，仅独立测试时需要）
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

## 8. 测试

### 本地测试

```bash
# 1. 启动 Dashboard (3012)
cd db-wizPulseAI-com && npm run dev

# 2. 启动 Fashion (3013)
cd fashion-wizpulseai-com && npm run dev

# 3. 启动 Stripe CLI
stripe listen --forward-to localhost:3012/api/webhooks/stripe

# 4. 访问 http://localhost:3013/pricing 测试购买
```

### 测试卡号

```
卡号: 4242 4242 4242 4242
有效期: 12/28
CVC: 123
```

---

**相关文档**
- [SUBDOMAIN_ARCHITECTURE.md](./SUBDOMAIN_ARCHITECTURE.md) - 子域名架构
- [EXTENSION_SYSTEM_DESIGN.md](./EXTENSION_SYSTEM_DESIGN.md) - 扩展系统设计

**维护者**: Claude AI
**最后更新**: 2025-11-27
