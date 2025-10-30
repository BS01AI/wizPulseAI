# Vercel 部署与配置

## 前置要求
- 3 个 Vercel Project（www / dashboard / auth）
- 自定义域名与子域 CNAME 已解析到 Vercel
- 共用 1 个 Supabase 项目（URL/Anon Key 一致）

## 项目绑定与域名
- 主站 → 绑定 `www.wizpulseai.com`
- 仪表盘 → 绑定 `dashboard.wizpulseai.com`
- 认证站 → 绑定 `auth.wizpulseai.com`

## 环境变量（通用）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com`
- `NEXT_PUBLIC_DEFAULT_REDIRECT_URL=https://dashboard.wizpulseai.com`（auth 站点必填）

## 环境变量（仪表盘专属）
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Supabase 控制台设置
- Authentication → Redirect URLs：加入 `https://auth.wizpulseai.com/api/auth/callback`
- 邮件模板/链接域：使用 `auth.*`

## Stripe 设置
- Products/Prices：与数据库表 `products/prices` 保持 ID 映射
- Webhook：指向 `https://dashboard.wizpulseai.com/api/stripe/webhook`

## 部署检查清单
- ✅ 三站点构建成功且可访问
- ✅ 认证流程：auth 登录 → 回调写 Cookie → 跳转 dashboard 正常
- ✅ dashboard SSR 能获取用户会话/角色
- ✅ Webhook 能被正确触发并校验签名
- ✅ CSP 头生效且不影响正常功能
