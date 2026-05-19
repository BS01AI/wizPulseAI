# WizPulseAI Matrix 本地环境配置指南

Last updated: 2026-05-19

矩阵根仓库不是统一 Node monorepo。每个 App 保留自己的依赖、lockfile 和本地环境文件。

不要提交 `.env.local`、`.env.*.local`、Apple 私钥、Supabase service role key、Stripe secret、数据库 URL、生成的 OAuth client secret。

## 当前本地 Env 文件

```text
auth-wizpulseai-com/.env.local
db-wizPulseAI-com/.env.local
ExpoGeo/expo-geo/.env.local
ExpoGeo/expo-geo-ios/.env.local
```

这次整理时创建的本地备份：

```text
db-wizPulseAI-com/.env.backup-20260519T043147Z.local
ExpoGeo/expo-geo-ios/.env.backup-20260519T043147Z.local
```

这些备份只留在本机，并被 git 忽略。

## Auth 登录站

路径：

```text
auth-wizpulseai-com/.env.local
```

负责：

```text
注册
登录
Google OAuth
Apple OAuth
SSO callback
矩阵顶级域 cookie
密码重置
```

必需：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_AUTH_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_MAIN_URL
NEXT_PUBLIC_DEFAULT_REDIRECT_URL
NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS
NEXT_PUBLIC_COOKIE_DOMAIN
```

可选：

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

本地默认值：

```text
NEXT_PUBLIC_AUTH_URL=http://localhost:3011
NEXT_PUBLIC_APP_URL=http://localhost:3012
NEXT_PUBLIC_MAIN_URL=http://localhost:3010
NEXT_PUBLIC_COOKIE_DOMAIN=.localhost
```

Google / Apple 的 Provider 凭证在 Supabase Dashboard 配置，不放进这个文件。

## Dashboard / 矩阵账户站

路径：

```text
db-wizPulseAI-com/.env.local
```

负责：

```text
Dashboard
用户中心
积分
权益
Stripe checkout/webhooks
矩阵 App catalog/bootstrap APIs
```

必需：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_AUTH_URL
NEXT_PUBLIC_MAIN_URL
NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS
NEXT_PUBLIC_PAYMENT_REDIRECT_ORIGINS
NEXT_PUBLIC_COOKIE_DOMAIN
```

Stripe / Billing：

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

订阅和旧 billing 功能默认关闭，除非任务明确要求打开：

```text
ENABLE_SUBSCRIPTIONS=false
NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=false
ENABLE_LEGACY_FEATURE_USAGE=false
ENABLE_LEGACY_BILLING_ADMIN=false
ENABLE_STRIPE_CATALOG_SYNC=false
```

可选运维变量：

```text
EMAIL_FROM
EMAIL_TO
SENDGRID_API_KEY
SENDGRID_SENDER_EMAIL
GOOGLE_AI_API_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_URL
```

不要把 Stripe checkout / webhook secrets 放到单个 App 仓库。

## ExpoGeo Web

路径：

```text
ExpoGeo/expo-geo/.env.local
```

负责：

```text
ExpoGeo web app matrix login links
Dashboard bootstrap URL
Optional map provider key
```

当前变量：

```text
NEXT_PUBLIC_MATRIX_DASHBOARD_URL
NEXT_PUBLIC_AUTH_URL
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY
```

ExpoGeo web 不负责 Stripe，也不拥有矩阵 billing。

## ExpoGeo iOS

路径：

```text
ExpoGeo/expo-geo-ios/.env.local
```

负责：

```text
Native Supabase login
Apple/Google OAuth client flow
Dashboard bearer-token bootstrap API
```

当前变量：

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_MATRIX_API_BASE_URL
```

Expo / iOS 客户端只使用 `sb_publishable_` 开头的 Supabase publishable key。

Expo iOS 里不要放：

```text
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
Database URLs
Apple .p8 private keys
Apple OAuth client secrets
OpenAI or provider server keys
```

## Supabase Key 命名

当前代码约定：

```text
Next.js web apps:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Expo iOS:
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

旧的 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 不要再加回 App 的 `.env.local`，除非某个 CLI 或脚本明确需要。

## Apple Sign In

中长期目标：Supabase Apple Provider 使用矩阵账户 Services ID 支持 web 登录：

```text
com.wizpulseai.auth
```

ExpoGeo 在测试阶段可以暂时保留 App 专用 Services ID：

```text
com.wizpulseai.expogeo.auth
```

Supabase Apple Provider 可以填写多个 Client IDs：

```text
com.wizpulseai.auth,com.wizpulseai.expogeo.auth
```

生成的 Apple client secret 不要写入 git。

## 本地端口

```text
Main site:      http://localhost:3010
Auth site:      http://localhost:3011
Dashboard:      http://localhost:3012
ExpoGeo iOS:    Metro / simulator
ExpoGeo web:    app-specific dev server
```

## 清理规则

以后如果 env 文件又变乱，按这个顺序处理：

1. 先把旧 `.env.local` 备份为 `.env.backup-<timestamp>.local`。
2. 重新生成按功能分组的 `.env.local`。
3. review 时只列变量名，不显示变量值。
4. 不把 secret 值贴到聊天、文档、commit、截图或日志。
