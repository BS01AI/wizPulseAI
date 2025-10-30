# Dashboard 站点代码结构分析

## 文档信息
- **版本**: v1.0
- **作者**: WizPulseAI Tech Team
- **创建日期**: 2025-01-29
- **最后更新**: 2025-01-29
- **状态**: 已发布

## 概述
本文档详细分析 dashboard.wizpulseai.com 的现有代码结构，包括目录组织、路由设计、组件架构和数据流。重点是理解现有实现，不涉及重构建议。

## 目录结构分析

### 1. 整体架构
```
db-wizPulseAI-com/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库和配置
│   ├── shared/          # 跨站点共享代码
│   ├── styles/          # 样式文件
│   └── types/           # TypeScript 类型定义
├── public/              # 静态资源
├── supabase/           # 数据库迁移
└── scripts/            # 构建和工具脚本
```

### 2. App Router 结构
Dashboard 使用 Next.js 14 的 App Router，主要路由包括：

#### 页面路由
- `/` - 根页面
- `/dashboard` - 仪表盘主页
- `/dashboard/admin/*` - 管理员功能
- `/dashboard/billing` - 计费页面
- `/dashboard/settings` - 用户设置
- `/dashboard/features` - 功能管理
- `/dashboard/products` - 产品页面

#### API 路由
- `/api/admin/*` - 管理员 API
- `/api/auth/*` - 认证相关
- `/api/subscriptions/*` - 订阅管理
- `/api/webhooks/stripe` - Stripe Webhook
- `/api/check-feature-access` - 功能权限检查
- `/api/record-usage` - 使用记录

## 核心模块分析

### 1. 认证模块 (`/auth` & `/shared/auth`)
- **登录/注册页面**: 实际跳转到 auth.wizpulseai.com
- **共享认证逻辑**: 
  - `useAuth.tsx` - 认证状态 Hook
  - `supabase-browser.ts` - 浏览器端 Supabase 客户端
  - Cookie 基础的 SSO 实现

### 2. Dashboard 模块 (`/dashboard`)
- **布局**: `layout.tsx` 提供统一的仪表盘布局
- **主页**: `page.tsx` 展示用户概览
- **子页面**:
  - `billing/` - 订阅和支付管理
  - `settings/` - 个人设置和密码修改
  - `features/` - 功能使用情况
  - `products/` - 产品信息展示

### 3. 管理员模块 (`/dashboard/admin`)
```
admin/
├── page.tsx              # 管理员概览
├── users/               # 用户管理
├── products/            # 产品管理
├── subscriptions/       # 订阅管理
├── features/            # 功能定义
├── plan-features/       # 套餐功能配置
└── usage-records/       # 使用记录查看
```

### 4. API 架构
API 路由遵循 RESTful 设计：
- GET 获取数据
- POST 创建资源
- PATCH/PUT 更新资源
- DELETE 删除资源

每个 API 都包含：
- 认证检查
- 权限验证
- 错误处理
- 响应格式化

## 组件结构分析

### 1. 组件分类
```
components/
├── admin/              # 管理员专用组件
├── auth/               # 认证相关组件
├── dashboard/          # 仪表盘业务组件
├── feature-access/     # 功能权限组件
├── layout/             # 布局组件
├── providers/          # Context Providers
├── subscription/       # 订阅相关组件
└── ui/                 # 基础 UI 组件
```

### 2. 关键组件
- **DashboardHeader**: 统一的顶部导航
- **CollapsibleSidebar**: 可折叠侧边栏
- **CurrentSubscription**: 当前订阅状态展示
- **SubscriptionCard**: 订阅套餐卡片
- **FeatureGate**: 功能权限控制组件

### 3. UI 组件库
基于 shadcn/ui，包含：
- Button, Card, Dialog, Form
- Table, Input, Select
- Toast, Badge, Avatar
- 等基础组件

## 数据流分析

### 1. 状态管理
- **认证状态**: 通过 AuthContext 全局管理
- **用户数据**: 存储在 Supabase，通过 API 获取
- **本地状态**: 使用 React State 和 Hooks

### 2. 数据获取
- **客户端**: 使用 fetch API 或 Supabase 客户端
- **服务端**: Server Components 直接查询
- **缓存策略**: 依赖 Next.js 的缓存机制

### 3. API 客户端 (`api-client.ts`)
封装了统一的 API 调用方法：
- 自动添加认证头
- 统一错误处理
- 响应类型推断

## 数据库结构

### 主要表（通过 types 推断）
1. **users** - 用户基础信息
2. **products** - 产品定义
3. **prices** - 价格方案
4. **subscriptions** - 订阅记录
5. **features** - 功能定义
6. **plan_features** - 套餐功能映射
7. **usage_records** - 使用记录
8. **profiles** - 用户扩展信息

### 关键字段
- 所有表都有 `id`, `created_at`, `updated_at`
- 外键关系通过 `user_id`, `product_id` 等维护
- 使用 UUID 作为主键

## 集成分析

### 1. Stripe 集成
- **Webhook 处理**: `/api/webhooks/stripe`
- **Checkout 流程**: `/api/subscriptions/checkout`
- **客户门户**: `/api/subscriptions/portal`
- **订阅管理**: 取消、恢复等操作

### 2. Supabase 集成
- **认证**: 通过共享 Cookie
- **数据库**: 直接查询和 RLS
- **实时订阅**: 暂未使用

### 3. 国际化
- 使用 next-intl
- 支持 ja/zh/en
- Cookie 同步语言设置

## 安全措施

### 1. 认证检查
- 所有 Dashboard 页面需要登录
- API 路由验证 session
- 管理员路由额外权限检查

### 2. CORS 和 CSP
- middleware.ts 设置 CSP 头
- 限制脚本和资源来源
- 防止 XSS 攻击

### 3. 输入验证
- 使用 Zod schemas
- API 参数验证
- SQL 注入防护（通过 Supabase）

## 测试结构
- 单元测试: Jest + React Testing Library
- API 测试: 模拟 Supabase 和 Stripe
- 测试覆盖率报告
- 测试工具函数

## 部署相关
- Vercel 配置: vercel.json
- 环境变量管理
- 构建优化配置

## 现有特点总结

### 优点
1. 清晰的目录结构
2. 完整的类型定义
3. 统一的 API 设计
4. 良好的组件抽象
5. 完善的错误处理

### 现状
1. 功能基本完整
2. 管理员功能齐全
3. 支付流程已实现
4. 多语言支持完善
5. 测试框架搭建完成

### 依赖关系
1. 强依赖 auth.wizpulseai.com
2. 与主站共享 Cookie
3. Supabase 作为数据源
4. Stripe 处理支付

---

## 附录：关键文件路径

### 配置文件
- `next.config.js` - Next.js 配置
- `tailwind.config.ts` - Tailwind 配置
- `tsconfig.json` - TypeScript 配置
- `.env.local` - 环境变量

### 核心逻辑
- `src/middleware.ts` - 请求中间件
- `src/app/layout.tsx` - 根布局
- `src/lib/supabase/server.ts` - 服务端 Supabase
- `src/shared/auth/useAuth.tsx` - 认证 Hook

### 类型定义
- `src/types/supabase.types.ts` - 数据库类型
- `src/types/global.d.ts` - 全局类型

---
最后更新: 2025-01-29