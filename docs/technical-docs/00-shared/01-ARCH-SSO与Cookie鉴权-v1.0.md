# SSO 与 Cookie 鉴权（务实方案）

## 目标
- 三站点（www/dashboard/auth）共用同一 Supabase 项目
- 通过顶级域 Cookie `.wizpulseai.com` 跨子域共享登录态
- 服务端优先（SSR 读取会话），避免前端闪烁

## 组件与库
- Supabase：`@supabase/ssr`（建议统一），服务端读写 Cookie
- Next.js 14：App Router，RSC/Route Handlers
- Stripe：仅仪表盘站点涉及服务端交互

## Cookie 策略
- 生产：`domain=.wizpulseai.com; path=/; Secure; SameSite=None; HttpOnly`（由 Supabase SSR 写入）
- 开发：本地域名同样使用顶级域（如 `.local.wiz`），`SameSite=Lax` 可行；若需嵌入/跨站场景，改为 `None + Secure`
- 统一由服务端写入/刷新；前端不直接持有 token

## 回调流程（OAuth/Email 链接）
1) 用户在 `auth.wizpulseai.com` 完成登录授权
2) 回调：`/api/auth/callback?code=...&next=...`
3) 服务器端 `exchangeCodeForSession(code)`
4) 成功后由 SSR 客户端写入顶级域 Cookie
5) 安全重定向至 `next`（默认：仪表盘）

## 关键环境变量（三站点一致）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com`
- `NEXT_PUBLIC_DEFAULT_REDIRECT_URL=https://dashboard.wizpulseai.com`（可按需调整）

## Supabase 控制台设置
- Redirect URLs：加入 `https://auth.wizpulseai.com/api/auth/callback`
- 邮件链接域名优先使用 `auth.*`

## SSR 端读取
- 仪表盘/主站在服务器端创建 Supabase client，读取 Cookie 获取会话与用户（含 `app_role`）
- 页面/接口按需做鉴权与角色校验，避免客户端初始“空会话”抖动

## 边界与注意
- 统一 SDK（避免 `auth-helpers` 与 `@supabase/ssr` 混用）
- Cookie 域名与 SameSite 策略在三站点保持一致
- 本地开发需使用伪子域与自定义 hosts，才能验证 SSO

## 新子站点接入清单（多 App 扩展）
- 站点域名：`<app>.wizpulseai.com`（或相同顶级域下的目录子站），DNS 指向 Vercel。
- 环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com`
  - 可选 `NEXT_PUBLIC_DEFAULT_REDIRECT_URL`（用于从 auth 回跳该站）
- 认证流程：
  - 所有站点跳转到 `auth.wizpulseai.com` 进行登录；回调发生在 auth 站点；由 auth 写顶级域 Cookie 后重定向回目标站。
  - 新站点仅需在 SSR 端读取 Cookie 获取会话，无需实现回调。
- 安全对齐：沿用共享 CSP 策略、跨站导航工具、安全重定向白名单（限制至自有域）。
- 权限与特性：
  - 统一使用 `app_role` 基础权限。
  - 站点特定能力通过 features/plan_features/usage_records 扩展（如需）。
- 测试要点：
  - 登录→回跳→新站 SSR 获取会话。
  - 访问受限页的重定向逻辑。
  - 退出登录后会话失效与跨站同步。
