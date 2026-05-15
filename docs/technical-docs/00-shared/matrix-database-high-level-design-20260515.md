# WizPulseAI 矩阵数据库高层设计书

日期：2026-05-15

本文是 WizPulseAI 矩阵网站的长期数据库设计基线，用来指导后续注册用户管理、点数管理、Stripe 管理、用户资料、奖励等级、多 App 专属数据表和 ExpoGeo 接入。

它不是当前数据库现状审计。现有测试阶段的积分数据可以删除、重建或迁移，因此本文按目标架构设计。

## 1. 总体目标

WizPulseAI 后续会有多个 App，但账号、付费、点数、权益不应该每个 App 各做一套。

目标是：

- 一个统一账号系统。
- 一个统一 Stripe/billing 系统。
- 一个统一点数账本。
- 一个统一权益判断层。
- 多个 App 各自拥有自己的业务数据表。

最终效果：

- 用户注册一次，可以访问多个 App。
- 用户购买的点数可以是全站通用，也可以指定某个 App 使用。
- 用户订阅可以带来某些 App 或功能的权益。
- 后台赠送点数、奖励等级、活动奖励、退款、补偿都可以通过账本追踪。
- 新增 App 时，不需要重做账号和 Stripe，只需要注册产品、建 App schema、接统一权益/点数接口。

## 2. 数据库分层

推荐使用一个 Supabase/Postgres 数据库，按 schema 分层。

```text
auth.*              Supabase 身份系统
public.*            矩阵核心：用户、App 注册、共享配置
billing.*           点数、Stripe、订阅、权益、账本
app_fashion.*       Fashion 专属业务数据
app_expo_geo.*      ExpoGeo 专属业务数据
app_xxx.*           未来 App 专属业务数据
ops.*               可选：审计、后台操作、任务日志
```

分层原则：

- `auth` 只管登录身份，不放业务逻辑。
- `public` 放跨 App 的矩阵核心资料。
- `billing` 放所有和钱、点数、订阅、权益有关的表。
- `app_*` 只放某个 App 自己的业务数据。
- App 不直接接 Stripe，不自己维护独立账号系统。

## 3. 用户与注册管理

### 3.1 `auth.users`

Supabase Auth 的身份源。

职责：

- 邮箱注册。
- OAuth 登录。
- session 身份。
- provider identity。

规则：

- 不在这里追加业务字段。
- 不把它当后台用户资料表使用。
- 业务系统只引用它的 `id`。

### 3.2 `public.users`

矩阵用户主表，一名用户一行，`id` 等于 `auth.users.id`。

建议字段：

```text
id
email
display_name
avatar_url
status              active / suspended / deleted
role                user / admin / owner
preferred_language
stripe_customer_id
created_at
updated_at
last_login_at
```

它负责回答：

- 这个用户是谁。
- 账号是否正常。
- 是普通用户还是管理员。
- 对应哪个 Stripe customer。
- 用户基础语言和资料是什么。

不建议放：

- 点数余额。
- 每个 App 的专属偏好。
- 奖励流水。
- 订阅细节。
- Stripe price/subscription 明细。

这些应该放在 `billing` 或 `app_*`。

### 3.3 `public.user_profiles` 可选

如果资料变多，可以从 `public.users` 拆出矩阵级资料。

适合放：

- 昵称。
- 头像。
- 地区。
- 时区。
- 简介。
- 营销偏好。

不适合放：

- Fashion 身材/风格偏好。
- ExpoGeo 学习目标。
- 某个 App 的业务状态。

## 4. App 注册表

### 4.1 `public.ai_products`

这是矩阵 App 注册中心。

每个 App 一条记录，例如：

```text
fashion
expo_geo
quickslide
codespark
chatbot
```

建议字段：

```text
code                稳定 App 代码，例如 expo_geo
name                展示名
slug                URL 或路由短名
primary_domain
status              active / beta / inactive
billing_mode        free / credits / subscription / mixed
metadata
created_at
updated_at
```

规则：

- 新 App 先注册 `product_code`。
- billing、entitlement、usage 都用 `product_code` 关联。
- 不用域名当业务主键，因为域名可能变化。

## 5. 点数系统

点数是用户资产，应该在 `billing` 中统一管理。

点数可以有两种范围：

```text
product_code = null
  全站通用点数，多个 App 都能消耗

product_code = "expo_geo" / "fashion"
  指定 App 点数，只能在对应 App 使用
```

### 5.1 `billing.credit_wallets`

当前余额表。

建议字段：

```text
user_id
product_code        null 表示全站通用
balance
lifetime_purchased
lifetime_granted
lifetime_used
updated_at
```

唯一键：

```text
(user_id, product_code)
```

规则：

- 余额只是缓存结果。
- 不能只改余额不写流水。
- 所有加点、扣点、退款、赠送都必须写 `credit_ledger`。

### 5.2 `billing.credit_ledger`

点数流水表，是最重要的审计来源。

建议字段：

```text
id
user_id
product_code
amount              正数加点，负数扣点
balance_after
type                purchase / usage / reward / subscription_grant / refund / admin_adjustment / expire
source_type         stripe_checkout / app_usage / admin / system / campaign
source_id
stripe_session_id
stripe_payment_intent_id
idempotency_key
metadata
created_at
```

它负责回答：

- 用户点数从哪里来。
- 用户点数花到哪里去。
- 是否重复加点。
- 退款时应该扣回多少。
- 后台赠送或修正是谁做的。

关键约束：

- `idempotency_key` 唯一。
- `stripe_session_id` 唯一。
- 扣点不能导致余额小于 0，除非未来明确支持欠费。

### 5.3 `billing.credit_packages`

售卖点数包。

建议字段：

```text
code
name
product_code        null 表示全站通用包
credits
bonus_credits
currency
unit_amount
stripe_price_id
status              active / archived
sort_order
metadata
```

说明：

- 短期可以继续用代码常量。
- 要做后台动态管理时，再把 package 变成数据库 source of truth。

## 6. Stripe 管理

Stripe 复杂度集中在 `billing`，不要扩散到各 App。

### 6.1 核心流程

```text
用户选择点数包或订阅
  -> Matrix billing API 创建 Checkout Session
  -> Stripe 完成支付
  -> Stripe webhook 回调 Matrix billing
  -> billing.webhook_events 做幂等
  -> 写 credit_ledger / subscriptions / entitlements
  -> App 查询余额或权益
```

### 6.2 `billing.stripe_products`

Stripe Product 镜像。

建议字段：

```text
stripe_product_id
product_code
name
type                credits / subscription / one_time
active
livemode
metadata
```

### 6.3 `billing.stripe_prices`

Stripe Price 镜像。

建议字段：

```text
stripe_price_id
stripe_product_id
currency
unit_amount
type                one_time / recurring
interval            month / year，可空
active
livemode
metadata
```

### 6.4 `billing.checkout_sessions`

记录 checkout 创建和完成状态。

建议字段：

```text
user_id
product_code
checkout_type       credits / subscription
package_code
stripe_session_id
status              created / completed / expired / failed
amount_total
currency
metadata
created_at
completed_at
```

### 6.5 `billing.webhook_events`

Stripe webhook 幂等和审计。

建议字段：

```text
stripe_event_id
event_type
site_source
status              processing / success / failed / skipped
payload
error_message
processed_at
created_at
```

唯一键：

```text
(stripe_event_id, site_source)
```

### 6.6 `billing.subscriptions`

订阅现在不是正式主线，但长期可以保留。

建议字段：

```text
user_id
product_code
stripe_subscription_id
stripe_price_id
status              trialing / active / past_due / canceled / incomplete
current_period_start
current_period_end
cancel_at_period_end
canceled_at
metadata
```

订阅上线前必须完成：

- checkout、portal、cancel、reactivate、webhook 都指向目标表。
- 订阅状态能同步成 `billing.entitlements`。
- 测试和生产 Stripe 数据严格区分。

## 7. 权益系统

权益回答的是：用户能不能使用某个 App 或功能。

点数回答的是：用户还有多少可消费资源。

两者不要混在一起。

### 7.1 `billing.entitlements`

建议字段：

```text
user_id
product_code
feature_code
source_type         subscription / credit_purchase / admin_grant / trial / promo / reward
source_id
status              active / expired / revoked / pending
starts_at
ends_at
metadata
created_at
updated_at
```

例子：

```text
user A 拥有 expo_geo 的 pro_country_pack，有效期到 2026-12-31
user B 拥有 fashion 的 premium_analysis，来源是订阅
user C 拥有全站 beta_access，来源是 admin_grant
```

规则：

- App 不直接判断 Stripe subscription。
- App 调用统一接口：用户是否拥有 `product_code + feature_code`。
- 订阅、活动、后台赠送、奖励等级都可以生成 entitlement。

### 7.2 `billing.feature_definitions` 可选

定义每个 App 的功能点。

建议字段：

```text
product_code
feature_code
name
access_model        free / credits / entitlement / subscription
metadata
```

## 8. 奖励与等级

奖励和等级可以扩展，但不建议直接不断往 `public.users` 加字段。

推荐：

### 8.1 `billing.user_reward_profiles`

保存用户长期奖励状态。

建议字段：

```text
user_id
level
xp
reward_tier
metadata
updated_at
```

适合放：

- 用户等级。
- 成长值。
- 奖励等级。
- 活动分组。
- 长期 badge。

### 8.2 奖励点数仍走账本

例如：

```text
type = reward
source_type = campaign
amount = +100
product_code = null
```

这样奖励点数也能追踪来源、撤销、统计。

## 9. App 专属表

### 9.1 Fashion

目标 schema：

```text
app_fashion
```

典型表：

```text
app_fashion.user_profiles
app_fashion.photos
app_fashion.analyses
app_fashion.generated_outfits
app_fashion.personalization_options
app_fashion.chat_sessions
app_fashion.chat_messages
```

边界：

- Fashion 只管穿搭业务数据。
- Fashion 消费点数时调用 billing。
- Fashion 不保存 Stripe subscription 作为自己的主逻辑。

### 9.2 ExpoGeo

目标 schema：

```text
app_expo_geo
```

典型表：

```text
app_expo_geo.user_profiles
app_expo_geo.country_progress
app_expo_geo.quiz_attempts
app_expo_geo.quiz_answers
app_expo_geo.favorite_countries
app_expo_geo.learning_events
app_expo_geo.content_packs
```

接入顺序：

1. 注册 `expo_geo` 到 `public.ai_products`。
2. 建 `app_expo_geo` schema。
3. 用户登录使用矩阵账号。
4. 高级功能查询 `billing.entitlements`。
5. 点数消费写 `billing.credit_ledger`。
6. 不接 Stripe。

### 9.3 新 App 模板

每个新 App：

```text
1. 分配 product_code
2. 注册 public.ai_products
3. 建 app_{product_code} schema
4. App 表统一使用 user_id
5. 定义 feature_code
6. 通过 billing.entitlements 判断访问
7. 通过 billing.credit_ledger 记录点数消费
```

## 10. 资料管理边界

资料分三层：

```text
auth.users
  身份资料：邮箱、OAuth provider

public.users / public.user_profiles
  矩阵资料：昵称、头像、语言、角色、状态

app_*.user_profiles
  App 资料：Fashion 风格偏好、ExpoGeo 学习目标
```

不要把所有信息塞进 `public.users`。

稳定字段放 `public.users`，扩展型资料放 profile、reward、app schema 或 metadata。

## 11. 后台管理与审计

建议保留：

### `ops.audit_logs`

记录关键操作：

```text
actor_user_id
action
target_type
target_id
before
after
metadata
created_at
```

应该记录：

- 管理员封禁用户。
- 管理员赠送点数。
- 管理员撤销权益。
- 手工修正账本。
- Stripe webhook 失败重试。

## 12. RLS 与安全边界

基本规则：

- 前端只用 anon key 和用户 session。
- service role 只在服务端 API、后台任务、受控脚本使用。
- 普通用户不能直接写 `billing` 表。
- App 前端不能直接修改余额和权益。
- 用户只能访问自己的 App 数据。
- 管理员操作必须经过后端 role 校验。

权限建议：

```text
public.users
  用户可读自己的资料，管理员可读全部

billing.credit_wallets
  用户只读自己的余额

billing.credit_ledger
  用户只读自己的流水，不能直接写

billing.entitlements
  用户只读自己的权益

billing.stripe_*
  普通用户不可直接读写

app_*.*
  用户只能访问自己的数据

ops.audit_logs
  仅服务端或管理员
```

## 13. 执行 Plan

### Phase 1：冻结和确认边界

- 保留当前注册、登录、点数购买可用路径。
- 订阅继续关闭。
- 明确积分测试数据可以重建。
- 确认目标 schema：`public`、`billing`、`app_fashion`、`app_expo_geo`。

### Phase 2：建立 billing 核心

- 新建 `billing` schema。
- 新建 `billing.credit_wallets`。
- 新建 `billing.credit_ledger`。
- 新建 `billing.webhook_events`。
- 视情况新建 `billing.credit_packages`。
- 将测试阶段点数数据重建或迁移到 `billing`。

### Phase 3：整理 Stripe

- 统一 Stripe product/price 表位置和命名。
- 新建 `billing.checkout_sessions`。
- webhook 只写 `billing` 账本、订阅和权益。
- 清理旧 `products/prices/features/plan_features/usage_records` 路径。

### Phase 4：建立权益层

- 新建 `billing.entitlements`。
- 可选新建 `billing.feature_definitions`。
- 实现统一 access check API。
- App 不再直接判断 Stripe。

### Phase 5：接入 ExpoGeo

- 注册 `expo_geo` 到 `public.ai_products`。
- 新建 `app_expo_geo` schema。
- 建学习进度、测验、收藏等业务表。
- ExpoGeo 使用矩阵账号。
- ExpoGeo 使用 `billing.entitlements` 和 `billing.credit_ledger`。

### Phase 6：后台管理产品化

- 用户管理。
- 点数管理。
- 账本查询。
- Stripe webhook 查询。
- 权益发放和撤销。
- 审计日志。

## 14. 最终判断标准

一个新 App 接进来时，如果只需要做这些事，就说明架构是健康的：

```text
注册 product_code
创建 app schema
接矩阵登录
接权益查询
接点数扣费
写自己的业务表
```

不应该再发生：

```text
新 App 自己接 Stripe
新 App 自己维护用户系统
新 App 自己发明点数表
新 App 直接判断 subscription
新 App 把私有字段塞进 public.users
```

这就是 WizPulseAI 矩阵数据库的长期边界。
