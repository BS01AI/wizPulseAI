# 架构总览（Three-app + SSO）

## 站点与职责
- www.wizpulseai.com（主站）
  - 产品与内容展示、多语言、营销页
- dashboard.wizpulseai.com（仪表盘）
  - 账户、订阅、使用统计、管理员能力
- auth.wizpulseai.com（认证中心）
  - 登录/注册/OAuth 回调，设置顶级域 Cookie，完成跳转

三站点共享同一 Supabase 项目（Auth + Postgres），Stripe 仅由仪表盘站点负责服务端交互与 Webhook。

## 关键数据与边界
- 用户与认证：Supabase Auth（JWT + 会话 Cookie）
- 业务数据：Supabase Postgres（public schema）
- 付费与订阅：Stripe（产品/价格/订阅），与 DB 表映射（products/prices/subscriptions/...）
- 跨站 SSO：顶级域 Cookie `.wizpulseai.com`，SSR 读取

## 典型流程
- 登录：auth 回调 → `exchangeCodeForSession` → 写入顶级域 Cookie → 重定向 dashboard
- 仪表盘/主站 SSR：读取会话 Cookie → 拉取用户/权限 → 渲染
- 订阅：dashboard 前端创建支付意图 → 后端/Stripe 完成扣款 → Webhook 写回 DB

## 依赖与版本建议
- Next.js 14（App Router）
- Supabase SDK 统一使用 `@supabase/ssr`（服务端优先）
- UI：Tailwind + shadcn/ui（仪表盘）、主站可含 Framer Motion/Three.js

## 共享代码建议
- 抽取 `shared` 包（后续）：auth 工具、cookie 选项、类型定义、导航与 URL 工具
- 目标：减少三站点复制粘贴与分叉

## 扩展到多子站点（N-app 模式）
- 目标：未来可在同一账户体系下新增多个小型 Web App（如 tools、labs、mini-products）。
- 基线约定：
  - 单一认证源：统一由 `auth.wizpulseai.com` 完成登录/回调。
  - 顶级域 Cookie：`domain=.wizpulseai.com`，所有子域 SSR 读取会话。
  - 同一 Supabase 项目：共享 Auth 与 public schema（必要时以 schema 分区）。
  - 权限模型复用：沿用 `app_role`，新站点如需私有权限，在 DB 中扩展 feature flags/entitlements。
- 新站点最小接入清单：
  - 配置环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_COOKIE_DOMAIN`。
  - 采用服务端 Supabase 客户端（@supabase/ssr），SSR 获取会话。
  - 跨站跳转统一从 auth 发起，成功后重定向到新站点。
  - 遵循共享的 CSP/安全基线。
- 参考：`technical-docs/00-shared/01-ARCH-SSO与Cookie鉴权-v1.0.md`、`technical-docs/00-shared/01-GUIDE-子站点接入指南-v1.0.md`。
