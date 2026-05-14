# WizPulseAI 注册、Cookie、Stripe 代码现状分析

生成日期：2026-05-14  
范围：只读 review，总结注册、子域 Cookie、Stripe/积分/订阅相关代码现状  
结论：注册/auth 方向基本可用，但有重复实现；Stripe/订阅存在明显历史残余和半迁移状态。

## 1. 主要涉及哪些工程

### `auth-wizpulseai-com`

这是认证中心，负责：

- 登录、注册、OAuth callback。
- magic link / token callback。
- logout。
- 登录后跳转回产品站。
- 语言 cookie 同步。
- 给矩阵子域共享登录状态。

这里是注册和 SSO 的核心工程。

### `db-wizPulseAI-com`

这是 dashboard / 用户中心 / 付费中心，负责：

- 用户资料。
- dashboard。
- Stripe checkout。
- Stripe webhook。
- 积分余额和积分交易。
- 订阅记录。
- 管理后台。
- 未来各产品的权益判断。

这里是付费、积分、订阅、权益的核心工程。

### `shared/auth`

这是给多个产品站复用的登录 helper，负责：

- browser Supabase client。
- 读取共享 cookie。
- 登录、注册、退出跳转。
- 产品站中的 auth provider。

如果多个产品 App 都接入矩阵账号，这里需要保持干净和统一。

## 2. 不建议大动的工程

### `wizPulseAI-com`

主站主要负责品牌、内容、SEO、入口。除非要增加登录入口、产品入口、文案或导航，否则不应该把 auth / billing 复杂逻辑放进主站。

### `fashion-wizpulseai-com`

Fashion 是产品站。它可以调用登录和积分能力，但不应该自己承担 Stripe 底层逻辑。只有当它调用了旧 auth helper 或旧付费接口时，才应该做小范围适配。

### `ExpoGeo`

ExpoGeo 应该先保持产品体验独立。后续接入矩阵账号、权益和进度同步，但不应该在 ExpoGeo 内部单独做 Stripe、订阅和账户系统。

## 3. 注册/Auth 代码现状

整体判断：不是特别乱，方向是对的，但存在重复实现和安全细节不统一。

### 3.1 好的部分

- 已经有独立的 `auth-wizpulseai-com`，说明登录注册没有散落在每个 App 中。
- 已经考虑了跨子域共享 cookie。
- 已经有 callback、logout、OAuth flow。
- 已经有更安全的 redirect 校验实现雏形。
- 产品站有共享 auth helper 的方向。

### 3.2 主要问题

#### 问题 1：redirect 校验存在新旧两套逻辑

当前存在一个旧的 `safeRedirect`，使用 `startsWith` 判断 URL 是否在白名单内。这种判断不够安全。

风险例子：

```text
https://www.wizpulseai.com.evil.com
```

它可能通过 `startsWith("https://www.wizpulseai.com")` 判断，但实际不是 WizPulseAI 域名。

同时项目里已有一个更合理的 `validateRedirect` 思路：解析 URL 后比较 `origin`。但 callback/logout 等关键路径还没有完全切过去。

影响：

- 登录完成后的跳转存在开放重定向风险。
- 新 App 接入时容易继续复制旧逻辑。
- 增加 ExpoGeo 域名时，如果继续用旧白名单，会把问题扩大。

#### 问题 2：auth cookie/helper 有重复实现

`auth-wizpulseai-com` 和 `shared/auth` 中都有 browser Supabase client / cookie 处理逻辑。

影响：

- 某个站点修了 cookie，另一个站点可能没修。
- SameSite、Secure、domain 等细节可能慢慢分叉。
- 后续 ExpoGeo、Dino、Fashion 都接入时，维护成本会上升。

#### 问题 3：Cookie 安全文档和真实实现需要统一

当前 browser client 通过 `document.cookie` 写 Supabase auth cookie。这样的 cookie 无法设置为 `HttpOnly`。

这不代表系统不能用，但它和“完全服务端 HttpOnly cookie”的安全模型不是一回事。

影响：

- 如果产品站出现 XSS，登录 token 风险会更大。
- 文档和代码不一致，会让后续 AI 或开发者误判安全边界。

建议：

- 短期先明确文档：当前是 Supabase browser cookie + 子域共享模式。
- 中期再评估是否需要更严格的服务端 session/cookie 策略。

## 4. Stripe / 积分 / 订阅代码现状

整体判断：Stripe/订阅部分比较乱，存在明显历史残余。当前真正业务重点是 point 买断，因此应该优先把积分购买链路做稳。

### 4.1 好的部分

- Stripe webhook 已经有签名校验。
- Webhook 已经考虑 idempotency，避免同一个事件重复处理。
- 积分扣除使用 RPC，方向是对的。
- 积分 package 在服务端获取，不完全相信客户端传入的 credits。
- 付费集中在 dashboard/db，没有分散到每个产品站。

### 4.2 主要问题

#### 问题 1：`PaymentService` 和旧 `lib/stripe` 同时存在

有些 route 已经使用新的 `PaymentService`，有些 route 还在使用旧的 `lib/stripe`。

影响：

- 修改 Stripe 行为时容易漏掉旧入口。
- 测试 mock 和真实代码可能不一致。
- 后续订阅、积分、portal、webhook 的逻辑容易分叉。

#### 问题 2：订阅字段名混用

数据库类型里订阅字段是：

```text
subscriptions.stripe_id
```

但部分代码查询：

```text
stripe_subscription_id
```

影响：

- 取消订阅可能找不到记录。
- 恢复订阅可能找不到记录。
- Webhook 创建/更新订阅时可能判断错误。
- 未来订阅上线时会直接踩坑。

#### 问题 3：Stripe price id 可能查错字段

Stripe subscription 中的 price id 是 Stripe 自己的 price id。数据库里 `prices` 表同时有本地 `id` 和 Stripe `stripe_id`。

如果代码用 Stripe price id 去查本地 `prices.id`，就可能查不到。

建议：

- 明确本地 `prices.id` 和 `prices.stripe_id` 的职责。
- 通常应该使用 `prices.stripe_id` 匹配 Stripe 返回的 price id。

#### 问题 4：订阅 checkout 接收客户端传入的 `priceId`

当前订阅 checkout 直接从 request body 读取 `priceId` 并传给 Stripe。

影响：

- 用户可能传入非公开、测试、旧价格或不属于当前产品的 Stripe price。
- 未来订阅上线时容易产生错误订单。

建议：

- 服务端查询本地 `prices/products`。
- 只允许 `active = true`、`is_public = true`、属于合法 product 的价格。
- Stripe price id 应该由服务端从数据库映射出来。

#### 问题 5：积分充值不是原子操作

积分扣除用了 RPC，但积分充值是：

1. 读取当前余额。
2. 计算新余额。
3. upsert 写回。
4. 记录交易。

影响：

- 两个不同购买 webhook 并发时，理论上可能丢失其中一次增量。

建议：

- 新增数据库 RPC，例如 `add_credits`。
- 在数据库事务中完成余额增加和交易记录。

#### 问题 6：success/cancel URL 可以由客户端传入

积分 checkout 支持客户端传入 successUrl / cancelUrl。

影响：

- 可能跳到非预期域名。
- 对用户体验和安全审计都不友好。

建议：

- 按 product 在服务端生成 URL。
- 或者对 URL 做和 auth redirect 一样的 allowlist 校验。

#### 问题 7：订阅代码处于半成品状态

你当前实际业务是 point 买断，订阅还没有正式上线。代码中却已经有 subscription checkout、cancel、reactivate、webhook、测试残留。

影响：

- 还没上线的功能可能被误调用。
- 后续 AI 容易以为订阅已经可用，然后继续在坏基础上扩展。
- 真实业务重点和代码复杂度不匹配。

建议：

- 短期明确：正式支持 point 买断；subscription 标记为未开放。
- 订阅相关入口要么隐藏，要么修到字段和 service 一致。

## 5. 当前系统是否有很多垃圾残余代码

结论：有残余，但不需要推翻重写。

### 注册/Auth 部分

残余程度：中等偏低。

主要表现：

- redirect 校验新旧两套。
- auth helper 重复。
- cookie 文档和实现边界不完全一致。

处理方式：

- 小范围收口。
- 不需要重写 auth 系统。

### Stripe/订阅部分

残余程度：中等偏高。

主要表现：

- 新旧 Stripe service 混用。
- 订阅字段不一致。
- 订阅功能半迁移。
- 测试里还有旧 mock。
- 当前业务重点是 point，但订阅代码已经占了不少复杂度。

处理方式：

- 不建议直接删除所有订阅代码。
- 先把订阅入口标记为未开放或隐藏。
- 把字段和 service 统一，避免未来继续踩坑。
- 优先加固 point 买断链路。

## 6. 我的总体判断

矩阵架构是值得保留的。真正需要做的是“底座整理”，不是重写。

最重要的原则：

- Auth 统一。
- 付费统一。
- 产品 App 独立。
- App 不直接处理 Stripe 底层。
- Point 买断先稳定。
- Subscription 等要上线时再完整产品化。

