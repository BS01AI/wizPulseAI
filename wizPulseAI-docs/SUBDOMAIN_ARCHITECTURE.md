# WizPulseAI 子域名架构文档

> 创建日期: 2025-11-26
> 状态: 生产中

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                wiz-saas-starter（开发平台）                   │
│                独立目录，用于快速开发 AI App                   │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ Fashion  │  │  Novel   │  │ Research │  │  未来    │   │
│   │ Advisor  │  │  Writer  │  │ Assistant│  │  App N   │   │
│   └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└─────────┼─────────────┼─────────────┼─────────────┼─────────┘
          │             │             │             │
          │ 导出/迁移到发布平台         │             │
          ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                  wizPulseAI（发布平台）                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              共享基础设施（所有 App 复用）              │   │
│   │  • auth.wizpulseai.com ──── SSO 单点登录             │   │
│   │  • Stripe ───────────────── 统一支付系统             │   │
│   │  • Supabase ─────────────── 用户数据 + 积分          │   │
│   │  • shared/auth/ ─────────── 认证接入 SDK             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              品牌入口 (主站子路由)                    │   │
│   │  wizpulseai.com/biz ──── WizPulse 商业版落地页       │   │
│   │  wizpulseai.com/life ─── WizLife 生活版落地页        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   独立产品站点                        │   │
│   │  fashion.wizpulseai.com ── Fashion Advisor (生活)    │   │
│   │  novel.wizpulseai.com ──── Novel Writer (生活)       │   │
│   │  research.wizpulseai.com ─ Research Assistant (商业) │   │
│   │  doc.wizpulseai.com ────── Doc Expert (商业)         │   │
│   │  ...更多产品                                         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   每个产品独立：AI 代码、工具函数、业务逻辑、Vercel 部署      │
└─────────────────────────────────────────────────────────────┘
```

## 2. 子域名清单

### 2.1 基础设施（已上线）

| 子域名 | 用途 | 目录 | 状态 |
|--------|------|------|------|
| `wizpulseai.com` | 主站落地页 | `wizPulseAI-com/` | ✅ 生产 |
| `auth.wizpulseai.com` | SSO 认证中心 | `auth-wizpulseai-com/` | ✅ 生产 |
| `dashboard.wizpulseai.com` | 用户中心 | `db-wizPulseAI-com/` | ✅ 生产 |

### 2.2 品牌入口（主站子路由）

> **决策记录 (2025-11-26)**：
> life/biz 只是落地页（LP），功能简单，决定使用主站子路由而非独立子域名。
> 优势：无需额外 SSO 接入、维护成本低、SEO 权重集中。
> 未来如需独立功能（博客、社区），可再拆分为独立子域名。

| URL | 用途 | 位置 | 状态 |
|-----|------|------|------|
| `wizpulseai.com/life` | WizLife 生活版 LP | `wizPulseAI-com/src/app/[locale]/life/` | 🚧 开发中 |
| `wizpulseai.com/biz` | WizPulse 商业版 LP | `wizPulseAI-com/src/app/[locale]/biz/` | 🚧 开发中 |

### 2.3 产品站点

| 子域名 | 产品名 | 品牌 | 目录 | 状态 |
|--------|--------|------|------|------|
| `fashion.wizpulseai.com` | Fashion Advisor | WizLife | `fashion-wizpulseai-com/` | 🚧 开发中 |
| `novel.wizpulseai.com` | Novel Writer | WizLife | `novel-wizpulseai-com/` | 📋 规划 |
| `research.wizpulseai.com` | Research Assistant | WizPulse | - | 📋 规划 |
| `doc.wizpulseai.com` | Doc Expert | WizPulse | - | 📋 规划 |

## 3. 共享 vs 独立

### 3.1 共享组件（所有 App 必须使用）

| 组件 | 说明 | 位置 |
|------|------|------|
| **SSO 认证** | Cookie 域 `.wizpulseai.com` | `auth.wizpulseai.com` |
| **Stripe 支付** | 统一计费、订阅管理 | `dashboard.wizpulseai.com` |
| **积分系统** ⭐ | 点数购买、余额管理、交易记录 | `dashboard.wizpulseai.com/api/credits/*` |
| **用户数据** | profiles, subscriptions, credits | Supabase 共享项目 |
| **认证 SDK** | 快速接入 SSO 的代码包 | `shared/auth/` |
| **主题系统** | Light/Dark 跨站点同步 | Cookie `WIZPULSE_THEME` |

> **积分系统说明 (2025-11-27)**：
> 产品站点（Fashion 等）的购买 UI 保持在站内，但 API 代理到 Dashboard。
> Webhook 统一由 Dashboard 处理。管理员在 Dashboard 查看所有积分数据。
> 详见 [CREDITS_SYSTEM.md](./CREDITS_SYSTEM.md)

### 3.2 独立组件（每个 App 自带）

| 组件 | 说明 |
|------|------|
| **AI Provider** | 各 App 自己的 AI 调用代码 |
| **业务逻辑** | 各 App 的 domain/service |
| **工具函数** | 各 App 的 lib/utils |
| **UI 组件** | 各 App 的 components |
| **数据库表** | 各 App 的业务数据表 |

## 4. 认证接入 SDK

### 4.1 SDK 位置

```
wizPulseAI/
└── shared/
    └── auth/
        ├── README.md           ← 使用说明
        ├── supabase-browser.ts ← 浏览器端客户端
        ├── supabase-server.ts  ← 服务端客户端
        ├── middleware.ts       ← Next.js 中间件
        ├── useAuth.tsx         ← React Hook
        ├── AuthGuard.tsx       ← 路由保护组件
        └── config.ts           ← Cookie 配置
```

### 4.2 快速接入（5 分钟）

**Step 1: 复制 SDK**

```bash
# 在新 App 目录下
cp -r ../shared/auth ./src/shared/auth
```

**Step 2: 配置环境变量**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
```

**Step 3: 添加中间件**

```typescript
// src/middleware.ts
export { middleware } from '@/shared/auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};
```

**Step 4: 使用认证**

```typescript
// 在组件中
import { useAuth } from '@/shared/auth/useAuth';

export function MyComponent() {
  const { user, isLoading, logout } = useAuth();

  if (!user) {
    // 未登录，跳转到 auth.wizpulseai.com
    window.location.href = `${AUTH_URL}/login?redirect=${window.location.href}`;
    return null;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### 4.3 认证流程

```
用户访问 fashion.wizpulseai.com
           │
           ▼
    检查 Cookie（.wizpulseai.com）
           │
    ┌──────┴──────┐
    │             │
  有 Cookie    无 Cookie
    │             │
    ▼             ▼
 验证 Session   跳转 auth.wizpulseai.com
    │             │
    ▼             ▼
  允许访问      登录成功后设置 Cookie
                  │
                  ▼
              跳转回 fashion.wizpulseai.com
```

## 5. 新 App 接入流程

### 5.1 从 wiz-saas-starter 导出

```bash
# 1. 复制 App 代码
cp -r /path/to/wiz-saas-starter/src/domains/fashion-advisor \
      /path/to/wizPulseAI/fashion-wizpulseai-com/

# 2. 复制必要的配置文件
cp wiz-saas-starter/.env.example fashion-wizpulseai-com/
cp wiz-saas-starter/next.config.ts fashion-wizpulseai-com/
cp wiz-saas-starter/tailwind.config.ts fashion-wizpulseai-com/
```

### 5.2 改造认证系统

```bash
# 1. 删除原有认证代码
rm -rf src/lib/auth/  # wiz-saas-starter 的认证

# 2. 接入 wizPulseAI SSO
cp -r ../shared/auth src/shared/auth

# 3. 更新中间件
# 修改 src/middleware.ts 使用新的认证中间件
```

### 5.3 配置 Vercel 部署

```bash
# 1. 创建新 Vercel 项目
vercel

# 2. 配置域名
# Vercel Dashboard → Domains → Add → fashion.wizpulseai.com

# 3. 配置环境变量
# Vercel Dashboard → Settings → Environment Variables
```

### 5.4 DNS 配置

```
# 在 Cloudflare/DNS 提供商添加
fashion.wizpulseai.com  CNAME  cname.vercel-dns.com
```

## 6. 目录结构

```
wizPulseAI/                          ← 发布平台根目录
│
├── shared/                          ← 共享代码（给所有子站点用）
│   ├── auth/                        ← 认证 SDK ⭐
│   ├── theme/                       ← 主题系统
│   ├── i18n/                        ← 多语言
│   └── components/                  ← 共享 UI 组件
│
├── wizPulseAI-com/                  ← 主站（含 /life 和 /biz 落地页）
├── auth-wizpulseai-com/             ← 认证中心
├── db-wizPulseAI-com/               ← Dashboard
│
├── fashion-wizpulseai-com/          ← Fashion Advisor（开发中）
├── novel-wizpulseai-com/            ← Novel Writer（规划）
│
├── wizPulseAI-docs/                 ← 技术文档
│   ├── SUBDOMAIN_ARCHITECTURE.md    ← 本文档
│   └── ...
│
└── start-all.sh / stop-all.sh       ← 启动脚本
```

## 7. Checklist：新 App 上线

- [ ] 从 wiz-saas-starter 导出代码
- [ ] 删除原有认证，接入 SSO SDK
- [ ] 配置环境变量
- [ ] 本地测试 SSO 登录
- [ ] 创建 Vercel 项目
- [ ] 配置子域名 DNS
- [ ] 配置 Vercel 域名
- [ ] 测试生产环境 SSO
- [ ] 更新本文档的子域名清单

## 8. 相关文档

- [BRAND_STRATEGY.md](../../wiz-saas-starter/docs/BRAND_STRATEGY.md) - 双品牌策略
- [CODE_REUSE_GUIDE.md](../../wiz-saas-starter/docs/CODE_REUSE_GUIDE.md) - 代码复用指南
- [DASHBOARD_THEME_SYSTEM.md](../db-wizPulseAI-com/DASHBOARD_THEME_SYSTEM.md) - 主题系统

---

**维护者**: Claude AI
**最后更新**: 2025-11-26
