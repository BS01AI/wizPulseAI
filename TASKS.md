# 活跃任务清单

> 当前 Sprint: 矩阵网站发布前大扫除

---

## Sprint 概览

**目标**: Dashboard 和 Main 站点达到发布标准

**发现的问题总数**: 25+ 个
**预计总工时**: 40-50h

---

## Phase 1: Dashboard 紧急清理 (P0) - 本周

### P0-1: 删除/隐藏无用页面 🗑️
- **状态**: [x] ✅ 已完成 (2025-12-11)
- **负责**: `multi-site-coder`
- **实际工时**: 1h
- **完成内容**:
  - [x] 删除 `/theme-demo` 页面
  - [x] 删除 `/dashboard/admin/credits` 页面
  - [x] 从 Admin 首页隐藏"功能管理"卡片
  - [x] 从 Admin 首页隐藏"产品管理"卡片
  - [x] 从 Admin 首页隐藏"产品功能关联"卡片
  - [x] 从侧边栏隐藏"产品"菜单项

### P0-2: 清理 console.log (136处→0) 🧹
- **状态**: [x] 已完成 (2025-12-11)
- **负责**: `multi-site-coder`
- **实际工时**: 2h
- **清理结果**:
  - [x] 清理 136+ console.log/debug 到 0
  - [x] 保留 219 console.error（关键错误）
  - [x] 保留 22 console.warn（警告信息）
  - [x] 修改 47 个文件
  - [x] TypeScript 编译通过
  - [x] Next.js 构建成功
- **清理范围**:
  - API 路由 (14个文件)
  - Dashboard 页面 (11个文件)
  - 核心库 (8个文件，language-context.tsx 最多)
  - 认证模块 (3个文件)
- **详细报告**: `CONSOLE_LOG_CLEANUP_REPORT.md`

### P0-3: 修复硬编码 URL 🔗
- **状态**: [x] 已完成 (2025-12-11)
- **负责**: `multi-site-coder`
- **实际工时**: 0.5h
- **修复内容**:
  - [x] `src/lib/utils/redirect.ts` - DEV_ALLOWED_DOMAINS 改为从环境变量获取
  - [x] `src/components/layout/orbital-layout.tsx` - 移除三元运算符，直接用环境变量
  - [x] `src/app/dashboard/layout.tsx` - 移除三元运算符，直接用环境变量
  - [x] `src/lib/email-utils.ts` - localhost:3000 → localhost:3012
  - [x] `.env.example` - 添加完整的环境变量说明（包含示例）
- **环境变量**: NEXT_PUBLIC_MAIN_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_AUTH_URL

### P0-4: 统一错误处理 ⚠️
- **状态**: [ ] 待开始
- **负责**: `multi-site-coder`
- **工时**: 3h
- **问题**: 有的页面有 toast，有的只 console.error
- **方案**: 所有 API 调用都需要 toast 提示用户

---

## Phase 2: Dashboard UI 统一 (P1) - 下周

### P1-1: 国际化硬编码文本 🌐
- **状态**: [ ] 待开始
- **负责**: `translation-manager`
- **工时**: 4h
- **范围**:
  - `/dashboard/admin/features` - 硬编码中文
  - `/dashboard/admin/products` - 硬编码中文
  - `/dashboard/admin/ai-products` - 混合语言
- **方案**: 统一使用 i18n 翻译函数

### P1-2: 统一组件样式系统 🎨
- **状态**: [ ] 待开始
- **负责**: `multi-site-coder`
- **工时**: 4h
- **问题**:
  - Orbital 系统 vs 传统 UI 混用
  - AI Products 页面硬编码颜色 `#1E2A3A`
  - FashionStatsCard 与 KPICard 风格不一致
- **方案**: 统一使用 Orbital CSS 变量

### P1-3: 拆分 AI Products 页面 📦
- **状态**: [ ] 待开始
- **负责**: `multi-site-coder`
- **工时**: 3h
- **问题**: 1200行单文件，重复代码~500行
- **方案**:
  - 提取 `AIProductForm` 组件
  - 合并创建/编辑 Modal
  - 使用统一样式变量

### P1-4: 移动端适配修复 📱
- **状态**: [ ] 待开始
- **负责**: `multi-site-coder`
- **工时**: 2h
- **问题**:
  - Modal 在移动设备超出屏幕
  - 网格布局不响应
- **方案**: 添加响应式断点

---

## Phase 3: Main 站点内容清理 (P0-P1) - 第3周

### P0-5: 重写 WizLife/WizBiz 页面 📝
- **状态**: [ ] 待开始
- **负责**: `content-writer`
- **工时**: 4h
- **问题**: 看起来像已上线，实际是 Coming Soon
- **方案**:
  - 明确标记"Coming Soon"
  - 移除虚假统计数据
  - 添加订阅等待列表

### P1-5: 统一产品描述和定价 💰
- **状态**: [ ] 待开始
- **负责**: `content-writer`
- **工时**: 3h
- **问题**: 各页面描述不一致
- **方案**: 创建统一的产品信息源

### P1-6: 精简 About 页面 ✂️
- **状态**: [ ] 待开始
- **负责**: `content-writer`
- **工时**: 2h
- **问题**: 1000+行，信息过载
- **方案**: 保留核心内容，删除冗余

### P1-7: 完善 SEO metadata 🔍
- **状态**: [ ] 待开始
- **负责**: `seo-expert`
- **工时**: 4h
- **问题**:
  - WizLife/WizBiz 无 metadata
  - OG Image 路径不存在
  - Schema.org 标记不完整

---

## Phase 4: 代码质量 (P2) - 第4周

### P2-1: 添加 TypeScript 类型定义 📝
- **状态**: [ ] 待开始
- **工时**: 4h
- **问题**: 64处使用 `any`
- **方案**: 创建 `types/dashboard.ts`

### P2-2: 删除注释代码和调试痕迹 🧽
- **状态**: [ ] 待开始
- **工时**: 2h
- **范围**: MFA 页面、layout.tsx

### P2-3: 统一 API 响应格式 📋
- **状态**: [ ] 待开始
- **工时**: 4h
- **问题**: 错误响应格式不统一

---

## 执行进度

### 本周目标 (Phase 1)
| 任务 | 状态 | 负责 |
|------|------|------|
| P0-1 删除无用页面 | ✅ 完成 | multi-site-coder |
| P0-2 清理 console.log | ✅ 完成 | multi-site-coder |
| P0-3 修复硬编码 URL | ✅ 完成 | multi-site-coder |
| P0-4 统一错误处理 | ⏳ 待开始 | multi-site-coder |

---

## Dashboard 发布前清单

### 必须完成 ✅
- [x] 删除 theme-demo 页面 ✅ (2025-12-11)
- [x] 删除 admin/credits 页面 ✅ (2025-12-11)
- [x] 隐藏开发者工具（features/products/plan-features）✅ (2025-12-11)
- [x] 清理所有 console.log ✅ (2025-12-11)
- [x] 修复硬编码 URL ✅ (2025-12-11)
- [ ] 统一错误提示

### 建议完成 ⚠️
- [ ] 国际化硬编码文本
- [ ] 统一组件样式
- [ ] 移动端适配

### 可以后续 📅
- [ ] TypeScript 类型完善
- [ ] API 文档
- [ ] 测试覆盖率

---

## 历史完成

### Fashion App Sprint (2025-12-11) ✅
- [x] P0-1 localStorage 设定统一
- [x] P0-2 设定变更流程
- [x] P1-1 历史页面 i18n
- [x] P1-2 积分显示完善
- [x] P1-3 Dashboard Fashion 统计
- [x] P2-1 PWA 图标
- [x] P2-3 登录跳转实验

---

**最后更新**: 2025-12-11
