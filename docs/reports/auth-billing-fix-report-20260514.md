# WizPulseAI Auth / Billing 底座修复执行报告

生成日期：2026-05-14  
执行范围：`auth-wizpulseai-com`、`db-wizPulseAI-com`  
说明：本次没有修改主站内容和 ExpoGeo 业务功能。

## 1. 已修改内容

### Auth redirect 安全收口

修改工程：`auth-wizpulseai-com`

已做：

- 将旧的 `startsWith(domain)` redirect 判断改成 `URL.origin` 精确匹配。
- 支持通过 `NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS` 扩展允许跳转域名。
- 默认加入现有矩阵域名和未来 Geo/Expo 域名：
  - `www.wizpulseai.com`
  - `dashboard.wizpulseai.com`
  - `auth.wizpulseai.com`
  - `magicoord.wizpulseai.com`
  - `geo.wizpulseai.com`
  - `expo.wizpulseai.com`
- 开发环境加入 localhost / local.wiz。
- `auth-utils.ts` 同步补齐默认 allowlist，避免 auth 页面和 callback 规则不一致。

主要文件：

- `auth-wizpulseai-com/src/lib/utils/redirect.ts`
- `auth-wizpulseai-com/src/lib/auth-utils.ts`

### Dashboard redirect / Stripe URL 安全收口

修改工程：`db-wizPulseAI-com`

已做：

- 将 dashboard 侧 redirect 判断也改成 origin 精确匹配。
- 保留 Stripe Checkout / Billing Portal 的合法跳转 origin：
  - `checkout.stripe.com`
  - `billing.stripe.com`
- 支持通过环境变量扩展允许域名。

主要文件：

- `db-wizPulseAI-com/src/lib/utils/redirect.ts`

### Point 买断 checkout 加固

修改工程：`db-wizPulseAI-com`

已做：

- `credits/checkout` 不再直接信任客户端传入的 successUrl / cancelUrl。
- success/cancel URL 必须是允许 origin，否则回退 dashboard 默认地址。
- CORS allowlist 增加 Geo/Expo 域名和环境变量扩展能力。

主要文件：

- `db-wizPulseAI-com/src/app/api/credits/checkout/route.ts`
- `db-wizPulseAI-com/src/lib/cors.ts`

### 积分发放改为数据库 RPC

修改工程：`db-wizPulseAI-com`

已做：

- `CreditService.addCredits()` 从“读余额 + upsert 写余额”改为调用 `fashion.add_credits` RPC。
- 新增 migration，增强 `fashion.add_credits`：
  - 保持旧参数兼容。
  - 支持 `reference_type`。
  - 支持 `metadata`。
  - 保持数据库事务内原子增加余额和写交易记录。
  - 拒绝非正数积分。

主要文件：

- `db-wizPulseAI-com/src/lib/credits/service.ts`
- `db-wizPulseAI-com/supabase/migrations/20260514000000_harden_add_credits_rpc.sql`

### 订阅半成品代码收口

修改工程：`db-wizPulseAI-com`

已做：

- 订阅 checkout 默认关闭，除非设置：

```text
ENABLE_SUBSCRIPTIONS=true
```

或：

```text
NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=true
```

- 订阅 checkout 在开放时会先查本地 `prices/products`：
  - price 必须存在。
  - price 必须 active。
  - price 必须 public。
  - price type 必须是 recurring。
  - product 必须 active/public。
  - 最终传给 Stripe 的是服务端查出的 `prices.stripe_id`。
- 取消/恢复订阅统一使用 `subscriptions.stripe_id`。
- Webhook 中 Stripe price id 改为匹配 `prices.stripe_id`。
- Portal / reactivate 改为走 `PaymentService`，减少旧 `lib/stripe` 直接调用。
- 旧测试中的 `stripe_subscription_id` 文本同步改为 `stripe_id`。

主要文件：

- `db-wizPulseAI-com/src/app/api/subscriptions/checkout/route.ts`
- `db-wizPulseAI-com/src/app/api/subscriptions/[id]/cancel/route.ts`
- `db-wizPulseAI-com/src/app/api/subscriptions/[id]/reactivate/route.ts`
- `db-wizPulseAI-com/src/app/api/subscriptions/portal/route.ts`
- `db-wizPulseAI-com/src/app/api/webhooks/stripe/route.ts`
- `db-wizPulseAI-com/src/app/api/subscriptions/*test.ts`

## 2. 验证结果

### TypeScript

通过：

```text
auth-wizpulseai-com: npx tsc --noEmit
db-wizPulseAI-com: npx tsc --noEmit
```

### Build

通过：

```text
auth-wizpulseai-com: npm run build
db-wizPulseAI-com: npm run build
```

Auth build 说明：

- `auth-wizpulseai-com/.env.local` 在本次开始前已经是 deleted 状态。
- 第一次 build 因缺 Supabase env 失败。
- 临时加载 dashboard 的本地 env 后，build 又因 sandbox 无法访问 Google Fonts 失败。
- 允许联网拉取 Next/font 后，auth build 通过。

Dashboard build 说明：

- build 通过，退出码 0。
- 有一些项目原有 warning：
  - caniuse-lite 过期。
  - Tailwind duration class ambiguity。
  - 若干 API route 在静态收集阶段提示 dynamic server usage。
- 这些 warning 不是本次修改引起的阻塞问题。

### Lint

未能执行有效 lint：

```text
npm run lint
```

两个工程都会进入 Next.js “如何配置 ESLint”交互提示，说明当前项目没有可直接运行的 ESLint 配置。

### Jest

尝试运行订阅相关旧测试，未能进入实际用例：

- 测试仍在 mock 旧模块：
  - `@/lib/supabase/server-component`
  - `@supabase/auth-helpers-nextjs`
  - 旧 `@/lib/stripe`
- 结果是 0 个测试用例实际执行。

结论：订阅测试本身属于历史残余，后续应重写为当前 `createRouteHandler` + `PaymentService` 模型。

## 3. 尚未处理的内容

本次没有做：

- 完整重写订阅测试。
- 完整移除旧 `db-wizPulseAI-com/src/lib/stripe.ts`。
- Dashboard middleware 性能优化。
- ExpoGeo 登录/权益接入。
- 真正执行 Supabase migration 到远端数据库。

## 4. 下一步建议

1. 在数据库环境执行新 migration。
2. 用真实 Stripe 测试模式跑一次 point 买断：
   - 创建 checkout。
   - 完成测试支付。
   - webhook 发积分。
   - 重放 webhook 不重复发积分。
3. 重写订阅相关 Jest 测试，删掉旧 auth-helper mock。
4. 再接 ExpoGeo 的登录状态和权益读取。

