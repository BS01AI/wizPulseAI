# WizPulseAI 矩阵网站 — クロスサイト・アーキテクチャ監査

> Generated: 2026-04-08 by architecture-guardian agent
> Scope: 4 sites cross-site analysis

## 重大問題 (P0 — 即修正)

### 1. Auth 站 middleware 不刷新 Supabase session
- **場所**: `auth-wizpulseai-com/src/middleware.ts`
- **影響**: Auth 站是唯一不刷新 JWT token 的站 → session 过期后静默掉线
- **修正**: 加 Supabase SSR session refresh (createServerClient + getUser)

### 2. Dashboard middleware 刷新 cookie 不带域名
- **場所**: `db-wizPulseAI-com/src/middleware.ts:64-108`
- **影響**: 刷新的 cookie 没有 `.wizpulseai.com` 域 → Fashion/Main 丢失刷新后的 session
- **修正**: cookie callback 中注入 `domain: COOKIE_DOMAIN`

### 3. Fashion auth 回调指向自己而非 Auth 站
- **場所**: `fashion-wizpulseai-com/src/infrastructure/auth/client.ts:18,56,88`
- **影響**: email 确认 / OAuth 回调绕过 Auth 站 → SSO cookie 没正确设置
- **修正**: redirectTo 改为 `${AUTH_URL}/api/auth/callback?next=${origin}`

### 4. Dashboard `cookies()` 没 await
- **場所**: `db-wizPulseAI-com/src/lib/supabase/server.ts:23`
- **影響**: Next.js 14 App Router 要求 `await cookies()` → 潜在运行时错误
- **修正**: `const cookieStore = await cookies()`

## 一般問題 (P1)

| # | 問題 | 場所 | 修正 |
|---|------|------|------|
| 5 | Cookie domain 不一致 (Auth=.localhost, 其他=.local.wiz) | .env.local | 统一为 .local.wiz |
| 6 | Default locale 不一致 (Main=en, Fashion=ja) | middleware.ts | 统一默认语言 |
| 7 | next-intl 版本不一致 (Main=v3, Dashboard=v4) | package.json | 统一到 v4 |
| 8 | Dashboard CSP 不含 magicoord.wizpulseai.com | middleware.ts | 加到 connect-src |
| 9 | supabase-browser.ts SameSite 值不一致 | shared/auth/ | 统一为 lax |
| 10 | 废弃 @supabase/auth-helpers-nextjs 仍在依赖 | Auth+Dashboard | 卸载 |
| 11 | Fashion 有死 supabase stub 文件 | lib/supabase/ + core/ | 删除 |
| 12 | Fashion signOut() 不走 Auth 站 | infrastructure/auth/ | 改用共享 logout() |

## SSO Cookie 流现状

| 站点 | 设置域 cookie | middleware 刷新 session | 默认语言 |
|------|-------------|----------------------|---------|
| Auth | ✅ | ❌ 缺失 | ja |
| Dashboard | ✅ | ⚠️ 不带域名 | en |
| Main | ✅ (客户端) | N/A | en |
| Fashion | ✅ | ✅ 正确 | ja |

## 一句话结论

> SSO 核心机制基本正确，但 Auth 不刷新 session + Dashboard 刷新不带域名 + Fashion 自己处理 auth 回调 = 三个 SSO 断裂点。修 P0 1-4 是发布前的必要条件。
