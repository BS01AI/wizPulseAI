# 决策与路线图

## 关键架构决策（简版 ADR）
- 分站部署：3 个 Next.js 应用分别部署到 Vercel（简化运维，清晰边界）
- 单一认证源：认证站集中处理登录与回调，写入顶级域 Cookie 共享登录态
- 服务端优先：SSR 读取会话，减少前端闪烁与耦合
- Supabase 统一：三个站点共用一个 Supabase 项目与类型定义
- SDK 一致：统一使用 `@supabase/ssr`，避免混用 `auth-helpers`
- 支付边界：Stripe 仅在仪表盘站点服务端交互与 Webhook

## 近期路线图（务实）
1) 统一 Supabase 客户端与 Cookie 选项（迁移到 `@supabase/ssr`）
2) 抽取共享工具与类型（后续可做 workspace 包）
3) 完善 Admin API 守卫与审计日志（角色/操作记录）
4) 增强 CSP 与限流（中间件实现）
5) 本地 SSO 联调脚本（一键配置 hosts 与 env）
6) E2E 冒烟用例（登录→跳转→订阅→Webhook）
