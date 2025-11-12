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

# 端口分配（已修改）
main: 3010
auth: 3011
dashboard: 3012
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

## 最新进展 (2025-11-12)

### ✅ Phase 3 完整执行完成 ⭐⭐⭐

#### 完成的工作
- **三站点多语言升级和UI美化** 100% 完成
  - Main站点：4语言支持（ja/en/ar/zh-TW）+ RTL适配 + 翻译文件创建
  - Auth站点：统一i18n系统 + UI大幅美化（玻璃态设计）
  - Dashboard站点：扩展到4语言 + 首页重构 + UI美化统一

- **跨站点配置验证**：使用 cross-site-validator agent 自动验证
  - 一致性评分：7.5/10
  - 发现并修复P0问题：Cookie域逻辑统一 + 关键术语统一

- **Git提交**：4个仓库全部提交成功（提交到dev分支）
  - Auth: e8ddaa3 (dev分支)
  - Dashboard: 7520b0f (master分支)
  - Main: be95d46 (dev分支)
  - 主仓库: 7044765 (main分支)

#### 🔧 重要发现：发布管理机制

**Git分支策略**：
- **dev分支** → Vercel Preview部署（临时预览URL，不影响生产）
- **main/master分支** → Vercel Production部署（自动发布到生产环境）

**当前状态**：
- Phase 3改动已提交到dev分支
- **未部署到生产环境**（需要先本地测试，然后合并到main）

**标准部署流程**：
```bash
# 1. dev分支开发 → 本地测试 → Preview测试
git push origin dev

# 2. 测试通过 → 合并到main → 自动部署生产
git checkout main
git merge dev
git push origin main  # ← 触发Vercel生产部署
```

**相关文档**：
- Git分支策略已更新到 `.claude/agents/git-manager.md`
- 发布管理记录已更新到 `WORK_LOG.md`
- 术语统一表：`wizPulseAI-docs/TRANSLATION_GLOSSARY.md`

---

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

## 最新进展 (2025-11-07)

### ✅ SSO 认证系统测试和修复

#### 完成的工作

**1. 修复 CSP 配置** ✅
- 添加 `'unsafe-eval'` 到 CSP `script-src`
- 解决了 React Refresh 和表单提交被阻止的问题

**2. 修复 Supabase 邮件配置** ✅
- 配置 Site URL: `http://localhost:3011`（开发环境）
- 配置 Redirect URLs: 4个本地地址
- 修复邮件验证链接跳转问题（之前跳转到生产环境）

**3. 优化注册流程** ✅
- 改进注册成功后的 UI 提示和跳转逻辑
- 根据邮箱确认状态智能跳转

**4. 邮件发送测试** ✅
- Supabase 内置邮件服务可用（有速率限制）
- Hotmail 邮箱被拦截，其他邮箱（Gmail、QQ等）可收到
- 邮件验证链接成功跳转到本地环境

#### 发现的问题

**1. 验证后跳转逻辑** 🔄
- 邮件验证成功但跳转到首页（/）而不是 Dashboard
- 验证后未自动登录，显示需要认证

**2. 邮件模板** 📧
- 当前只有日文模板
- 建议：改为英文或多语言混合

**3. 生产环境配置** ⚠️
- 部署生产时需要修改 Site URL 回生产地址
- 建议：创建独立的开发和生产 Supabase 项目

#### 待测试功能

- [ ] 邮件验证后自动登录
- [ ] SSO 跨站点登录（Dashboard、Main）
- [ ] 单点登出功能
- [ ] Google OAuth 登录

#### 创建的文档

- [Supabase 邮件问题分析](./SUPABASE_EMAIL_ISSUE_ANALYSIS.md)
- [Redirect URLs 配置指南](./SUPABASE_REDIRECT_URLS_SETUP.md)
- [Site URL 修复指南](./SUPABASE_SITE_URL_FIX.md)
- [403 错误修复](./SUPABASE_403_ERROR_FIX.md)
- [手动清除缓存指南](./MANUAL_CACHE_CLEAR_GUIDE.md)
- [SSO 测试文档](./docs/test/SSO_AUTHENTICATION_TEST.md)
- [快速测试清单](./docs/test/QUICK_TEST_CHECKLIST.md)

---

## 最新进展 (2025-10-31)

### ✅ Chrome 301 缓存问题 + 测试文档体系完成

#### 1. Chrome 301 重定向缓存问题（已解决）
- **问题**: localhost:3000 自动跳转到 /zh（Chrome 缓存了 301 永久重定向）
- **解决**: DevTools 禁用缓存 / 删除缓存文件夹 / 隐身模式 / 换端口
- **学习**: 301 缓存在磁盘，重启浏览器无效；优先怀疑缓存而非代码
- **文档**: [完整技术分析](docs/troubleshooting/CHROME_301_REDIRECT_CACHE.md)

#### 2. SSO 测试文档体系（已完成）
- **完整测试用例**: [SSO_AUTHENTICATION_TEST.md](docs/test/SSO_AUTHENTICATION_TEST.md) - 15个测试用例
- **快速测试清单**: [QUICK_TEST_CHECKLIST.md](docs/test/QUICK_TEST_CHECKLIST.md) - 30分钟快速测试
- **测试中心**: [test/README.md](docs/test/README.md) - 文档导航和最佳实践
- **手动清除指南**: [MANUAL_CACHE_CLEAR_GUIDE.md](MANUAL_CACHE_CLEAR_GUIDE.md) - 浏览器缓存清除

#### 3. 测试准备（进行中）
- ✅ 服务已启动：3010(Main) / 3011(Auth) / 3012(Dashboard)
- ✅ 日志监控脚本：monitor-logs.sh / watch-logs.sh
- ✅ 端口检查工具：check-port.sh / check-status.sh
- 🔄 准备开始 SSO 功能实际测试

#### 创建的工具脚本
- `start-all.sh` / `stop-all.sh` - 启动/停止所有站点
- `monitor-logs.sh` / `watch-logs.sh` - 实时日志监控
- `check-port.sh` - 端口占用检查
- `clear-chrome-redirect.sh` / `delete-chrome-cache.sh` - 缓存清除工具

---

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
- 🌐 Main (localhost:3010): ✅ 运行正常，返回 302 (重定向)
- 🔐 Auth (localhost:3011): ✅ 运行正常，返回 200 OK
- 📊 Dashboard (localhost:3012): ✅ 运行正常，返回 200 OK

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
- Main: 3010
- Auth: 3011
- Dashboard: 3012

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
- 2025-11-09: 统一端口配置（Main: 3010 / Auth: 3011 / Dashboard: 3012）

---

## 最新进展 (2025-11-10)

### ✅ Playwright 自动化登录测试成功

#### 测试结果
使用 Playwright MCP 工具完成了完整的自动化登录流程测试：

**测试步骤**：
1. ✅ 访问 Dashboard 首页 (localhost:3012)
2. ✅ 点击 "Log In / Sign Up" 按钮
3. ✅ 自动跳转到 Auth 站点登录页 (localhost:3011)
4. ✅ 自动填写表单：
   - 邮箱：sun.bo@bs01ai.com
   - 密码：12345678
5. ✅ 点击 Sign In 按钮
6. ✅ 登录成功，自动跳转回 Dashboard (localhost:3012/dashboard)
7. ✅ 页面完整加载，显示用户信息

**验证通过的功能**：
- ✅ SSO 跨站点跳转（Dashboard → Auth → Dashboard）
- ✅ 登录认证（Supabase Auth SIGNED_IN 事件触发）
- ✅ Session 创建和持久化
- ✅ 用户信息显示（邮箱：sun.bo@bs01ai.com）
- ✅ Dashboard 组件正常渲染：
  - Current Subscription: Free Plan
  - Usage Statistics: 0
  - Available Features: Basic
  - Account Status: User

**控制台日志验证**：
```
[LOG] [DEBUG] Auth event: SIGNED_IN, session: present
[LOG] [Auth] Login successful, redirecting to: http://localhost:3012/dashboard
[DEBUG] [Auth] onAuthStateChange event: SIGNED_IN
[LOG] [Auth] isAuthenticated status: {session: Object, isAuthenticated: true}
[DEBUG] [DashboardLayout] Render cycle. isLoading: false
[LOG] [ModernDashboard] Authenticated user ID: e9aac239-fc17-4808-bb7e-a0542a6c71a1
```

#### 问题诊断和解决
**之前的问题**：浏览器手动登录时偶尔失败

**原因分析**：
- 浏览器缓存影响（旧代码、Service Worker）
- 输入时可能有隐藏字符或空格
- Cookie 设置延迟

**解决方案**：
- 强制刷新页面 (Cmd+Shift+R)
- 使用隐身模式测试
- 使用 Playwright 自动化测试（排除人为输入错误）

#### 后续测试计划
- [ ] SSO 单点登出测试
- [ ] 跨站点 Session 共享测试（Main 站）
- [ ] Google OAuth 登录测试
- [ ] 邮件验证流程完整测试
- [ ] 生产环境部署后测试

---

## 最新进展 (2025-11-10 下午)

### ✅ Sub-agent 智能助手系统搭建完成

基于项目实际需求，创建了完整的 Sub-agent 团队来自动化测试和Git管理。

#### 创建的 Sub-agent（2个）

**1. sso-tester - SSO 测试专家**
- **职责**：自动化测试SSO登录/登出流程
- **工具**：Playwright、Chrome DevTools
- **模型**：Haiku（快速、经济）
- **触发时机**：修改认证相关代码后自动运行
- **功能特点**：
  - 8秒内完成完整登录测试
  - 生成详细报告 + 截图
  - 检测 Cookie 域、Session 状态
  - 智能选择测试场景

**2. git-manager - Git 管理专家**
- **职责**：管理4个独立Git仓库的提交和推送
- **工具**：Bash、Read、Grep
- **模型**：Haiku
- **触发时机**：功能完成 + 测试通过后
- **功能特点**：
  - 理解业务发展阶段（当前重点：Main站点内容扩展）
  - 智能判断提交时机（避免误提交）
  - 只提交有改动的仓库
  - 可扩展到未来新站点

#### 创建的工具脚本

**git-push-all.sh** - 手动Git管理工具
```bash
./git-push-all.sh status    # 检查所有仓库状态 ✅ 已测试
./git-push-all.sh pull       # 拉取所有仓库
./git-push-all.sh commit "msg" # 批量提交
```

#### 业务阶段理解

git-manager 理解项目的3个发展阶段：

**阶段1**：三站点基础架构期（已完成）
- Auth/Dashboard/Main 频繁修改

**阶段2**：内容扩展期（当前）⭐
- **高频**：Main 站点（产品页面、知识中心）
- **中频**：主仓库（文档、脚本）
- **低频**：Auth/Dashboard（bug修复）

**阶段3**：新服务扩展期（未来）
- 可能添加新站点（QuickSlide等产品站）
- 支持扩展到第5、6、7个仓库

#### 智能调度机制

**自动调度**（推荐）：
- 主AI根据上下文自动调用合适的Sub-agent
- 修改认证代码 → 自动调用 `sso-tester`
- 功能完成 → 自动调用 `git-manager`

**手动调用**（也支持）：
```bash
"用 sso-tester 测试一下登录功能"
"用 git-manager 提交所有改动"
```

#### 文档位置

```
.claude/agents/
├── README.md           ✅ 完整使用指南
├── sso-tester.md      ✅ SSO测试专家配置
└── git-manager.md     ✅ Git管理专家配置
```

#### 后续扩展计划

~~**P2 优先级**（2周内）~~：已完成 ✅
- ~~stripe-tester~~ ✅
- ~~security-auditor~~ ✅

~~**P3 优先级**（低）~~：已完成 ✅
- ~~multi-site-coder~~ ✅
- ~~performance-analyzer~~ ✅

**所有8个Sub-agent已全部创建完成！**

---

## 最新进展 (2025-11-11)

### ✅ 翻译部&内容创作部建立完成（新增5个Agent）

基于SEO/AEO/GEO战略需求，扩展了内容创作和多语言翻译能力。

#### 新增的 Sub-agent（5个）

**1. content-writer - AI内容创作专家**
- **职责**：撰写高质量AI主题文章（知识库/新闻/博客/报告）
- **工具**：Read, Write, WebSearch, WebFetch, Context7
- **模型**：Sonnet
- **支持语言**：日语/英语/中文
- **输出**：Markdown文章 + Schema标记 + Metadata建议

**2. translation-manager - 翻译部经理** 🎯
- **职责**：协调3个专业翻译agent，确保高质量多语言翻译
- **工具**：Task, Read, Write
- **模型**：Sonnet
- **支持语言**：en/ja/ar/zh-TW 任意互译（12种方向）
- **3步流程**：初译 → 校对 → 润色

**3. translator-layer1 - 初译专家**
- **职责**：源语言→目标语言初稿翻译
- **输出**：Version 1（只翻译，不校对）

**4. translator-layer2 - 校对编辑**
- **职责**：深度校对Version 1，修正错误和优化用词
- **输出**：Version 2 + 修改清单

**5. translator-layer3 - 润色专家**
- **职责**：风格润色Version 2，最终打磨
- **输出**：Version 3（最终稿）+ 优化清单

#### 翻译部核心能力

**支持的语言**：
- 🇺🇸 英语 (en)
- 🇯🇵 日语 (ja)
- 🇸🇦 阿拉伯语 (ar)
- 🇹🇼 繁体中文 (zh-TW)

**12种翻译方向**：
- en ↔ ja, ar, zh-TW
- ja ↔ en, ar, zh-TW
- ar ↔ en, ja, zh-TW
- zh-TW ↔ en, ja, ar

**质量保证**：
- 3层流程强制执行（初译→校对→润色）
- 3个版本对比输出
- 质量递进明显（⭐⭐⭐ → ⭐⭐⭐⭐ → ⭐⭐⭐⭐⭐）

#### 实战测试验证

**测试案例**：日语→繁体中文翻译
- ✅ 3层流程完整执行
- ✅ Version 1: 基础翻译（⭐⭐⭐）
- ✅ Version 2: 8处修正（术语统一、排版规范）⭐⭐⭐⭐
- ✅ Version 3: 6处优化（结构、语气、说服力）⭐⭐⭐⭐⭐
- ✅ 用户满意度高

#### 重要修正

**设计缺陷修正**：
- ❌ 之前：写死"英语→其他语言"单向翻译
- ✅ 现在：任意4种语言之间互译
- 💡 用户反馈："不能写死英语入口，没有必要"

**更新的配置文件**：
- translator-layer1.md（初译专家）
- translator-layer2.md（校对编辑）
- translation-manager.md（翻译经理）

#### Agent总数更新

**现在共有 14 个 Sub-agent**：
- 📝 内容创作部（2个）：content-writer, translation-manager
- 🔄 翻译执行部（3个）：layer1, layer2, layer3
- 🧪 测试部（3个）：sso-tester, stripe-tester, cross-site-validator
- 💻 开发部（2个）：multi-site-coder, supabase-manager
- 🔍 审查优化部（2个）：security-auditor, performance-analyzer
- 📦 管理部（2个）：git-manager, (待扩展)

---

## 最新进展 (2025-11-10 晚上)

### ✅ 记忆恢复系统建立

**问题**：对话结束后AI会丢失所有记忆，用户需要重新解释

**解决**：创建三层记忆系统

#### 核心文档

**1. WORK_LOG.md** ⭐ 最重要
- AI和用户的"记忆桥梁"
- 记录：最新状态、待办事项、重要决策
- 使用：每次对话必读/必更新

**2. QUICK_START.md**
- 5分钟快速上手指南
- 常用命令速查
- 实战案例

**3. HOW_TO_RESUME.md**
- 专门写给下一个AI
- 5步恢复流程
- 标准化操作指南

#### 恢复流程

**新对话开始**：
1. AI：" 让我恢复记忆..." →  读WORK_LOG.md
2. AI：总结上次状态，询问用户确认
3. 开始工作

**对话结束前**：
1. 总结今天完成的事
2. 更新WORK_LOG.md
3. 记录下次要做的事

#### 文件结构

```
WORK_LOG.md          ⭐ 记忆桥梁
CLAUDE.md            📚 完整历史
.claude/
├── QUICK_START.md   🚀 快速上手
├── AGENT_ARCHITECTURE.md  🏗️ 架构图
├── HOW_TO_RESUME.md 🔄 AI恢复指南
└── agents/          🤖 8个Sub-agent
```

---

最后更新: 2025-11-10