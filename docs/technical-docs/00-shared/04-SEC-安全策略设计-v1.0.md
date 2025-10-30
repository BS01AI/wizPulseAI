# 安全基线（务实可落地）

目标：在个人/小团队可承担的成本下，覆盖 80% 以上常见风险。

## 认证与授权
- 认证：仅使用服务端会话 Cookie（HttpOnly），不在前端暴露 token
- 授权：从会话用户的 `app_role` 判断（admin/user/deleted），在 SSR 和 API Route 均检查
- 最小权限：管理员接口与 Webhook 独立路由，严格鉴权

## CSRF 与请求来源
- 主要 API 均在同站点/同域上下文调用（SameSite=Lax/None），对跨站提交敏感操作：
  - 校验 `Origin/Referer`
  - 或使用简化的 CSRF Token（双重提交 Cookie）

## XSS 与 CSP
- 避免将不可信内容注入 HTML；显示富文本时做白名单过滤
- CSP：在中间件设置 `default-src 'self'`，限制 `script-src`、`connect-src`、`img-src` 等域；生产带 `nonce`

## Secrets 与配置
- 严格区分 `NEXT_PUBLIC_*` 与服务端密钥（如 `SUPABASE_SERVICE_ROLE_KEY`、`STRIPE_SECRET_KEY`）
- Vercel 项目级环境变量管理；预览/生产分离
- Git 仓库禁止提交 `.env*`

## Stripe Webhook
- 仅在仪表盘站点暴露 Webhook 路由
- 校验签名（`STRIPE_WEBHOOK_SECRET`），拒绝未签名请求
- Webhook 幂等：使用事件 ID 做去重

## 速率限制与滥用
- 中间件级别可添加简单限流（如基于 IP/路径的滑动窗口）
- Auth/敏感 API 增加最小限流，避免暴力尝试

## 日志与隐私
- 服务端日志保留关键事件（登录失败、管理员操作、Webhook 处理）
- 避免记录 PII 或完整 Token/Cookie 值

## 备份与恢复
- 延用仓库 `backup_scripts/*`（pg_dump、Supabase导出）
- 周期性备份（至少每日），并验证恢复流程（到预览环境）
