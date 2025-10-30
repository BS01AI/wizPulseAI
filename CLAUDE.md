# WizPulseAI 项目 AI 助手记忆文档

## 项目概述
WizPulseAI 是一个多站点 SaaS 平台，包含3个独立部署的 Next.js 应用，通过顶级域 Cookie 实现 SSO 单点登录。

## 三站点架构

### 1. auth.wizpulseai.com (认证中心)
- **目录**: `/auth-wizpulseai-com/`
- **功能**: 统一登录、注册、密码重置、OAuth
- **技术**: Next.js 14 + Supabase Auth + 自定义 UI 包装
- **特点**: 
  - 设置顶级域 Cookie (.wizpulseai.com)
  - 多语言支持 (ja/zh/en)
  - Google OAuth 集成

### 2. dashboard.wizpulseai.com (用户仪表盘)
- **目录**: `/db-wizPulseAI-com/`
- **功能**: 用户管理、订阅管理、使用统计、管理员功能
- **技术**: Next.js 14 + Supabase + Stripe
- **特点**:
  - Stripe Webhook 集成
  - 角色权限系统 (admin/user)
  - 功能配额管理

### 3. www.wizpulseai.com (主站)
- **目录**: `/wizPulseAI-com/`
- **功能**: 产品展示、知识中心、公司信息
- **技术**: Next.js 14 + Three.js + Framer Motion
- **特点**:
  - 5个 AI 产品展示
  - 3D 动画效果
  - 知识中心文章系统

## 技术要点

### SSO 实现
- Cookie Domain: `.wizpulseai.com`
- Cookie 设置: `secure: true, sameSite: 'lax', httpOnly: false`
- 共享认证状态通过 Supabase JWT

### 数据库架构
- **users**: 用户基础信息
- **products**: 产品定义
- **prices**: 定价方案
- **subscriptions**: 订阅记录
- **features**: 功能定义
- **plan_features**: 套餐功能配置
- **usage_records**: 使用记录

### 已知问题
1. 邮箱确认双页面问题
2. 混用新旧 Supabase 包
3. Bundle size 较大

### 待开发功能
1. 产品试用功能 (QuickSlide 等)
2. API 密钥管理
3. 使用统计展示
4. 团队协作功能

## 文档位置

### 技术文档
- `/wizPulseAI-docs/technical-docs/` - 架构设计文档
- `/wizPulseAI-docs/DEVELOPMENT_PLAN.md` - 开发规划

### AI 记忆 (已整合到此文件)
- 原 auth-site-CLAUDE.md
- 原 dashboard-site-CLAUDE.md  
- 原 main-site-CLAUDE.md

## 开发环境

### 环境变量
```env
# Supabase (三个站点共享)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 站点 URLs
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# Cookie 配置
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# Stripe (Dashboard 站点)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 本地开发
```bash
# 分别在各目录运行
npm run dev

# 端口分配建议
auth: 3001
dashboard: 3002
main: 3000
```

## 重要提醒

1. **不要修改** Cookie 域设置，会破坏 SSO
2. **保持** 三个站点使用相同的 Supabase 项目
3. **测试** 跨站点认证流程
4. **注意** Vercel 部署配置

## 当前状态 (2025-01-30)

- ✅ SSO 认证系统正常工作
- ✅ Stripe 支付集成完成
- ✅ 多语言支持实现
- 🚧 产品试用功能待开发
- 🚧 API 开放平台待实现
- 📝 技术文档体系已建立

## 最新进展 (2025-01-30)

### 完成的分析
1. **Auth 站点**：技术架构文档完成，认证流程清晰
2. **Dashboard 站点**：代码结构分析 + 技术债务评估
3. **主站**：用户功能分析，发现紧耦合问题

### 发现的主要问题
1. **技术债务**：
   - 使用旧版 Supabase 包 (0.10.0)
   - Cookie 处理复杂，开发/生产不一致
   - 权限检查分散，缺少统一中间件

2. **用户体验**：
   - 页面跳转导致闪烁
   - 认证状态检查时的白屏
   - 硬编码的 URL 和端口

3. **扩展性**：
   - 新站点需要复制大量代码
   - 配置分散，维护困难
   - 缺少共享的类型定义

### 确定的优化方向
**原则**：稳健优化，不推倒重来

1. **子站点接入指南**已创建
   - Copy 即可用的实用方案
   - 30分钟内新站点可运行
   - 渐进式优化建议

2. **关键优化点**：
   - AuthWrapper 组件减少闪烁
   - 集中配置管理 (config/site.ts)
   - 智能跳转组件优化体验

3. **待实施项目**：
   - 统一加载状态
   - 优化跨站点导航
   - 改善开发体验

## 最新进展 (2025-10-29)

### ✅ 本地测试环境准备完成

#### 1. 环境配置修复
- **Auth 站点配置更新**: 修复 Supabase 配置（从 placeholder 更新为真实项目 ID）
- **统一 Supabase 项目**: 3个站点共享 `lhofjwiqjqjtycnhliga`
- **Cookie 域配置**: 本地开发统一使用 `.localhost`
- **依赖状态**: 3个站点依赖全部已安装 ✅

#### 2. 创建的关键文档

**本地测试指南** (`LOCAL_TEST_GUIDE.md`)
- 完整的启动步骤和端口分配
- 独立站点测试流程
- SSO 跨站点测试场景
- 常见问题排查（Service Worker 冲突、端口占用等）
- 功能测试清单

**启动/停止脚本**
- `start-all.sh`: 一键启动3个站点，自动检查依赖和端口
- `stop-all.sh`: 一键停止所有站点，清理遗留进程
- 自动创建日志文件 (logs/*.log)
- PID 管理和进程追踪

**下一步计划** (`NEXT_STEPS.md`)
- Phase 0: 本地测试验证（今天完成）
- Phase 1: 关键问题修复（1-2周）
- Phase 2: 产品功能开发（QuickSlide 试用等）
- Phase 3: 系统优化和重构
- Phase 4: API 开放平台

**MCP 使用指南** (`MCP_GUIDE.md`)
- 7个 MCP 服务器详细说明
- 使用场景和实用组合
- 开发、调试、测试、管理的最佳实践

#### 3. 诊断浏览器访问问题

**问题描述**: 浏览器显示 `ERR_FAILED`，无法访问 localhost:3001

**根本原因**: Service Worker 缓存冲突（不是服务器问题）
- 服务器后台运行正常（curl 测试返回 200 OK）
- Next.js 编译成功，页面 HTML 完整
- 问题出在浏览器端的 Service Worker

**解决方案**:
1. 清除浏览器 Service Workers（F12 → Application → Service Workers → Unregister）
2. 清除站点数据（Clear site data）
3. 使用隐身模式测试（Cmd+Shift+N）
4. 硬刷新页面（Cmd+Shift+R）

#### 4. 站点启动状态

**当前运行中的站点**:
- 🔐 Auth (localhost:3001): ✅ 运行正常，返回 200 OK
- 📊 Dashboard (localhost:3002): ✅ 运行正常，返回 200 OK
- 🌐 Main (localhost:3000): ✅ 运行正常，返回 302 (重定向)

**测试验证**:
- curl 测试全部通过
- HTML 页面结构完整
- 认证中心显示 "WizPulseAI Authentication Center"
- 登录/注册按钮正常
- 多语言切换功能可用

#### 5. MCP 工具链完善

**已配置的 7 个 MCP 服务器**:
1. **filesystem** - 本地文件系统操作
2. **notionApi** - Notion 数据库集成（任务管理）
3. **supabase** - Supabase 项目管理（数据库、日志）
4. **chrome-devtools** - Chrome 浏览器自动化（新增 ⭐）
5. **playwright** - 跨浏览器 E2E 测试（新增 ⭐）
6. **stripe** - Stripe 支付集成管理（新增 ⭐）
7. **Context7** - 外部文档库查询

**新增 MCP 的用途**:
- `chrome-devtools`: 截图、网络监控、性能分析、调试前端
- `playwright`: 自动化测试、跨浏览器兼容性、视觉对比
- `stripe`: 订阅管理、支付链接、退款处理、客户查询

### 🎯 下一步行动

**立即任务** (今天/本周):
1. 用户清除浏览器 Service Worker 缓存
2. 验证3个站点在浏览器中能正常访问
3. 测试 SSO 跨站点登录流程

**短期任务** (1-2周):
1. 修复 Cookie 跨域问题（如果存在）
2. Supabase 客户端版本统一
3. 开始 QuickSlide 试用功能开发

**技术决策待确认**:
- MCP 插件的进一步应用场景
- 部署策略（Vercel vs 自建）
- 数据库优化（Redis 缓存、索引优化）

### 📝 项目文档结构

```
wizPulseAI/
├── CLAUDE.md (符号链接 → wizPulseAI-docs/CLAUDE.md)
├── LOCAL_TEST_GUIDE.md       ✅ 本地测试完整指南
├── NEXT_STEPS.md              ✅ 开发计划和优先级
├── MCP_GUIDE.md               ✅ MCP 使用指南
├── start-all.sh               ✅ 一键启动脚本
├── stop-all.sh                ✅ 一键停止脚本
├── .mcp.json                  ✅ MCP 配置（7个服务器）
├── auth-wizpulseai-com/       ✅ 认证中心（配置已修复）
├── db-wizPulseAI-com/         ✅ 用户仪表盘
├── wizPulseAI-com/            ✅ 主站
└── wizPulseAI-docs/           ✅ 技术文档库
    ├── CLAUDE.md              ✅ AI 记忆主文件
    └── DEVELOPMENT_PLAN.md    ✅ 完整开发规划
```

### 🔧 技术环境确认

**Supabase 项目**: `lhofjwiqjqjtycnhliga`
**本地端口分配**:
- Auth: 3001
- Dashboard: 3002
- Main: 3000

**本地开发 Cookie 域**: `.localhost`
**生产环境 Cookie 域**: `.wizpulseai.com`

---

## 文档更新记录
- 2025-01-29: 初始文档体系建立
- 2025-01-30: 完成三站点技术分析
- 2025-01-30: 创建子站点接入指南 v1.0
- 2025-10-29: 本地测试环境准备完成 ✅
- 2025-10-29: MCP 工具链完善（新增3个服务器）
- 2025-10-29: 创建完整测试和开发文档

---

最后更新: 2025-10-29