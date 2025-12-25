# 活跃任务清单

> 当前 Sprint: Fashion App 一周发布冲刺
> 详细检查清单: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

---

## Sprint 概览

**目标**: Fashion App (マジコーデ) 一周内发布
**综合评分**: 74/100 → 目标 90/100
**P0问题数**: 21个
**预估总工时**: 22.5h

---

## 当前阶段: 发布前 P0 修复

### Day 1-2: 法律合规 + 安全修复 (8h) ✅ 完成

#### P0-SEC-1: Debug API 生产禁用 🔒
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `fashion-wizpulseai-com/src/app/api/debug/auth/route.ts`
- **修复**: 生产环境返回 404
- **工时**: 5min

#### P0-SEC-2: DEV_MODE 双重检查 🔒
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `fashion-wizpulseai-com/src/config/dev-mode.ts`
- **修复**: `NODE_ENV === 'production'` 强制返回 false
- **工时**: 10min

#### P0-SEC-3: 积分竞态条件修复 🔒
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `db-wizPulseAI-com/src/lib/credits/service.ts`
- **修复**: 使用数据库 RPC 原子操作 (FOR UPDATE 锁)
- **工时**: 30min

#### P0-LEGAL-1: 隐私政策页面 📜
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `fashion-wizpulseai-com/src/app/privacy/page.tsx`
- **要求**: 4语言、GDPR/日本法合规
- **工时**: 4h

#### P0-LEGAL-2: 服务条款页面 📜
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `fashion-wizpulseai-com/src/app/terms/page.tsx`
- **要求**: 4语言、含退款政策（日本特定商取引法合规）
- **工时**: 3h

#### P0-LEGAL-3: 法律文件 Review + 国际化补充 📜
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **修正内容**:
  - Privacy: 6点修正（屋号统一BS01AI、APPI準拠、委托先明记、Cookie限定、即座删除表现）
  - Terms: 4点修正（有償/無償ポイント区分、返金ポリシー厳格化、サービス終了時払戻し）
  - section12 追加: 言語・適用法令（国際向け補足）- 日本語正本明記
  - section11 追加: 地域別補足（KSA PDPL / 台湾対応）
- **4言語対応**: 🇯🇵🇺🇸🇸🇦🇹🇼
- **Git**: `7dbcfd6` (fashion-wizpulseai-com)
- **工時**: 1.5h

#### P0-LEGAL-4: URL 结构重组 + Footer 层级化 📜
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **变更内容**:
  - URL 移动: `/privacy` → `/about/privacy`, `/terms` → `/about/terms`
  - Footer 简化: privacy/terms 直接链接删除
  - 会社概要网关化: About 页面内からのみアクセス可能
- **修正文件**: page.tsx, about/page.tsx, about/privacy/page.tsx, about/terms/page.tsx
- **工時**: 15min

---

### Day 3: SSO 安全修复 (2h) ✅ 完成

#### P0-SSO-1: Dashboard Cookie 域统一 🔐
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `db-wizPulseAI-com/src/lib/supabase/server.ts`
- **修复**: 使用 `COOKIE_DOMAIN` 常量 (环境变量优先)
- **工时**: 30min

#### P0-SSO-2: Dashboard SameSite 修复 🔐
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `db-wizPulseAI-com/src/shared/auth/supabase-browser.ts`
- **修复**: `__Secure-` Cookie 从 `SameSite=none` → `SameSite=lax`
- **工时**: 30min

#### P0-SSO-3: Fashion SameSite 修复 🔐
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **位置**: `fashion-wizpulseai-com/src/infrastructure/supabase/server.ts`
- **修复**: 统一 `SameSite=lax`
- **工时**: 30min

#### P0-SSO-4: SSO 配置验证 + Main站点修复 🧪
- **状态**: [x] ✅ 已完成 (2025-12-15)
- **内容**: 4站点配置一致性验证 + Main站点SameSite修复
- **额外修复**: `wizPulseAI-com/src/shared/auth/supabase-browser.ts` (发现并修复)
- **工时**: 30min

---

### Day 4: 支付流程修复 (3h)

#### P0-PAY-0: 定价方案确定 💰
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **方案**: 方案B (年轻化命名 + 阶梯赠送)
- **积分包**: ライト¥500 / スタンダード¥1000 / バリュー¥2000 / メガ¥5000
- **消耗**: 分析15pt / 生成35pt / 4K55pt
- **文档**: `fashion-wizpulseai-com/docs/PRICING_PLAN.md`
- **工時**: 30min

#### P0-PAY-1: 积分不足返回 402 💳
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts`
- **修复**: 返回 402 + 前端弹窗 (i18n 4语言)
- **工时**: 30min

#### P0-PAY-2: 支付失败页面 💳
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: `/purchase/cancel` 和 `/purchase/error`
- **修复**: 友好错误提示 + 重试按钮 (i18n 4语言)
- **工时**: 1h

#### P0-PAY-3: CreditService 统一 💳
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **产出**: 调查报告 + 实施计划文档
- **位置**: `wizPulseAI-docs/P0-PAY-3-*.md`
- **备注**: 发现竞态条件风险，建议发布后实施统一
- **工时**: 1h

#### P0-PAY-4: Stripe 价格调整 💳
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **内容**: 4个产品 + 4个价格已创建
- **Price IDs**: 已配置到 credit-packages.ts
- **工时**: 30min

#### P0-PAY-5: Stripe Webhook 积分充值修复 💳
- **状态**: [x] ✅ 已完成 (2025-12-25)
- **问题**: Webhook 不触发，积分不到账
- **根因**: API Key 测试/生产模式混用 + Webhook Secret 来源错误
- **修复**:
  - 统一使用沙盒模式 (`sk_test_`, `whsec_`)
  - `whsec_` 需从 Webhook 详情页获取
  - 创建 `deduct_credits` 数据库 RPC 函数
- **验证**: 测试支付成功，积分自动到账 ✅
- **工时**: 2h

#### P0-PAY-6: 生产环境 Stripe 配置 💳 (待上线)
- **状态**: [ ] 待完成
- **内容**:
  - 切换到生产 API Key (`sk_live_`, `pk_live_`)
  - 创建生产 Webhook，获取新 `whsec_`
  - 更新 Vercel 环境变量并 Redeploy
- **工时**: 30min

---

### Day 5: 代码质量修复 (4h) ✅ 完成

#### P0-CODE-1: Console 日志清理 🧹
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts`
- **修复**: 创建 `logger.ts`，替换 11 处 console.log/error
- **工时**: 15min

#### P0-CODE-2: Error Boundary 添加 🧹
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: `db-wizPulseAI-com/src/app/`
- **修复**: 创建 3 个文件 (dashboard/error.tsx, error.tsx, not-found.tsx)
- **工时**: 30min

#### P0-CODE-3: 错误响应脱敏 🧹
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:470-493`
- **修复**: 生产环境返回用户友好消息，隐藏 stack trace
- **工时**: 10min

#### P0-CODE-4: 环境变量验证 🧹
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **位置**: 4 站点 `src/lib/env.ts`
- **修复**: 创建 `validateEnv()` 函数，定义必需/可选变量
- **工时**: 20min

---

### Day 6: SEO + 营销准备 (3h) ✅ 完成

#### P0-SEO-1~5: SEO 优化
- **状态**: [x] ✅ 已完成 (2025-12-16)
- **内容**: 多语言URL路由 + FAQ + OG图片 + sitemap

---

### Day 7: Dashboard UI 重设计 + 测试 (3h)

#### P0-UI-1: Dashboard Loading 多语言 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **位置**: `db-wizPulseAI-com/src/app/dashboard/layout.tsx`
- **修复**: 硬编码中文 → 4语言翻译 + UI美化
- **工时**: 20min

#### P0-UI-2: 删除侧边栏"系统状态"装饰 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **位置**: `orbital-layout.tsx`
- **修复**: 删除无用的系统状态/性能进度条
- **工时**: 5min

#### P0-UI-3: 隐藏普通用户的"機能"菜单 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **位置**: `orbital-layout.tsx`
- **修复**: 添加 adminOnly: true
- **工时**: 5min

#### P0-UI-4: Dashboard 重设计方案 🎨
- **状态**: [x] ✅ 设计完成 (2025-12-17)
- **位置**: `docs/DASHBOARD_REDESIGN.md`
- **内容**: 简化为3卡片 + 分析历史
- **工时**: 30min

#### P0-UI-5: Dashboard 首页简化实施 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **内容**: 删除4个KPI卡片 + 空表格 + 快速链接，简化为3卡片布局
- **额外完成**: 架构重构（Mapper层+类型安全）
- **工时**: 30min

#### P0-UI-6: 設定页面单列布局 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **位置**: `settings/page.tsx`
- **工时**: 20min

#### P0-UI-7: 隐藏"購読管理"菜单 🎨
- **状态**: [x] ✅ 已完成 (2025-12-17)
- **原因**: 暂无订阅产品
- **工时**: 5min

---

### Day 7: 测试 + 发布 (2.5h)

#### P0-TEST-1: 完整支付流程测试 🧪
- **状态**: [ ] 待开始
- **内容**: Stripe 测试卡购买 + 积分到账
- **工时**: 1h

#### P0-TEST-2: SSO 跨站点测试 🧪
- **状态**: [ ] 待开始
- **内容**: 4站点登录/登出验证
- **工时**: 1h

#### P0-TEST-3: 移动端 PWA 测试 🧪
- **状态**: [ ] 待开始
- **内容**: 安装 + 拍照 + 分析
- **工时**: 30min

#### 🚀 正式发布
- **状态**: [ ] 待开始

---

### Day 8: 法律文档增强 (5.5h) 📜

> 参考分析: [LEGAL_DOCS_ANALYSIS.md](./wizPulseAI-docs/LEGAL_DOCS_ANALYSIS.md)
> 参考网站: https://www.medeo.app/legal/

#### P0-LEGAL-5: 第三方API数据处理说明 📜
- **状态**: [x] ✅ 已完成 (2025-12-18)
- **位置**: `fashion-wizpulseai-com/src/app/[locale]/about/privacy/page.tsx`
- **内容**:
  - 明确我们**不收集**用户数据用于AI训练
  - 说明使用 Google Gemini API，数据处理遵循 Google 政策
  - 添加 Google AI Terms 链接
- **工时**: 1h

#### P0-LEGAL-6: OAuth/Google Login 条款 📜
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/[locale]/about/terms/page.tsx`
- **内容**:
  - Google Login 集成说明（OAuth 2.0）
  - 访问的信息范围（姓名、邮箱、头像）
  - 不存储 Google 密码声明
  - 撤销方法说明
- **工时**: 1h

#### P0-LEGAL-7: AI生成物使用制限 📜
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/[locale]/about/terms/page.tsx`
- **内容**:
  - 禁止政治广告/选举活动使用
  - 禁止色情/违法内容
  - 禁止误导性使用（虚假推荐等）
  - 禁止独立销售（NFT/stock/merchandise）
- **工时**: 1h

#### P0-LEGAL-8: 损害赔偿上限明确化 📜
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/[locale]/about/terms/page.tsx`
- **内容**: 上限 = 12个月费用 或 1万円（取高者）
- **工时**: 0.5h

#### P0-LEGAL-9: 特定商取引法表示 📜
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/[locale]/about/tokushoho/page.tsx` (新建)
- **内容**:
  - 销售者名称/屋号
  - 所在地/联系方式
  - 支付方法/时期
  - 商品交付时期
  - 返品/退款政策
  - 动作环境
- **工时**: 2h

---

### P2: 主站法律页面 (5h) 🌐 ✅ 已完成

#### P2-LEGAL-1: 主站隐私政策
- **状态**: [x] ✅ 已完成 (2025-12-19)
- **位置**: `wizPulseAI-com/src/app/[locale]/privacy/page.tsx`
- **工时**: 30min

#### P2-LEGAL-2: 主站使用条款
- **状态**: [x] ✅ 已完成 (2025-12-19)
- **位置**: `wizPulseAI-com/src/app/[locale]/terms/page.tsx`
- **工时**: 30min

#### P2-LEGAL-3: Dashboard Footer 法律链接
- **状态**: [x] ✅ 已完成 (2025-12-19)
- **位置**: `db-wizPulseAI-com/src/components/DashboardFooter.tsx`
- **工时**: 15min

#### 说明
- 主站使用 WizPulseAI 通用品牌（非 Magicoord 专属）
- 4语言支持 (ja/en/ar/zh-TW)
- Dashboard Footer 链接到主站法律文档
- **特定商取引法保留在 Fashion 站点**（产品专属）

---

## 执行进度

| 阶段 | 任务数 | 完成 | 进度 |
|------|--------|------|------|
| Day 1-2 法律+安全 | 7 | 7 | 100% ✅ |
| Day 3 SSO安全 | 4 | 4 | 100% ✅ |
| Day 4 支付流程 | 5 | 5 | 100% ✅ |
| Day 5 代码质量 | 4 | 4 | 100% ✅ |
| Day 6 SEO营销 | 5 | 5 | 100% ✅ |
| Day 7 UI重设计 | 7 | 7 | 100% ✅ |
| Day 7 测试发布 | 4 | 0 | 0% |
| Day 8 法律增强 | 5 | 5 | 100% ✅ |
| Day 9 设定页增强 | 2 | 2 | 100% ✅ |
| P2 主站法律 | 3 | 3 | 100% ✅ |
| **总计** | **46** | **43** | **93%** |

---

## 历史完成 (Phase 5)

<details>
<summary>点击展开历史任务</summary>

### Phase 1: Dashboard 紧急清理 ✅
- [x] P0-1: 删除无用页面
- [x] P0-2: 清理 console.log (136处)
- [x] P0-3: 修复硬编码 URL
- [x] P0-4: 统一错误处理

### Phase 2: Dashboard UI 视觉修复 ✅
- [x] P0-UI-1: 字体大小规范
- [x] P0-UI-2: 阴影系统
- [x] P0-UI-3: 颜色对比度
- [x] P0-UI-4: 按钮状态区分

### Phase 3: 主题系统集成 ✅
- [x] P0-Theme-1: 三站点 themes.css 集成
- [x] P0-Theme-2: 主题切换 UI
- [x] P0-Theme-3: ThemeScript 同步

### Phase 3.5: Review 问题修复 ✅
- [x] P0-Fix-1~5: 8个问题全部修复
- [x] 主题系统评分 9/10

### Phase 5: 主题统一 + UI 优化 ✅
- [x] B-1: 扫描硬编码颜色 (160+处)
- [x] B-2: 替换为 CSS 变量 (94+处)
- [x] C-1~3: UI 布局 Raycast 风格

### P1-1: Admin 页面 i18n ✅
- [x] 8个 Admin 页面国际化
- [x] 504条翻译 (126键×4语言)
- [x] Toast 提示修复 (19处)

</details>

---

### Day 9: Dashboard 设定页增强 ✅

#### P1-SETTINGS-1: 头像上传功能 📷
- **状态**: [x] ✅ 已完成 (2025-12-19)
- **内容**:
  - Supabase `avatars` bucket 创建 + RLS策略
  - `/api/avatar/upload` API (POST/DELETE)
  - `AvatarUpload` 组件 (点击上传/悬停/删除)
  - `ProfileForm` 集成
  - 多语言翻译 (profile/avatar/validation 4语言)
- **Git**: `dd2475e` (db-wizPulseAI-com)
- **工时**: 1h

#### P1-SETTINGS-2: AccountDeletion Dialog 优化 🎨
- **状态**: [x] ✅ 已完成 (2025-12-19)
- **内容**: AlertDialog → Dialog 组件
- **工时**: 10min

---

### 待办: UI 增强 (Lottie动画) ✅ 已完成

#### P2-UI-1: Lottie 动画框架搭建 🎬
- **状态**: [x] ✅ 已完成 (2025-12-20)
- **内容**: 安装 lottie-react, 创建动画组件
- **工时**: 30min

---

## 新功能: AI 推荐穿搭图片生成 🆕

> 设计文档: [AI_OUTFIT_GENERATION_DESIGN.md](./fashion-wizpulseai-com/docs/AI_OUTFIT_GENERATION_DESIGN.md)
> 预估工时: 3天

### Phase 1: 核心功能 (P0 - 2天)

#### P0-IMG-1: 集成 gemini-3-pro-image-preview 模型 🖼️
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/lib/ai/gemini/`
- **模型**: `gemini-3-pro-image-preview` (4K分辨率, $0.134/张)
- **工时**: 2h

#### P0-IMG-2: 创建 generate-outfit API 路由 🖼️
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/generate-outfit/route.ts`
- **内容**:
  - 验证用户 + 检查积分 (55pt)
  - 构建 Prompt + 调用 Gemini 3
  - 上传 Storage + 返回 URL
- **工时**: 3h

#### P0-IMG-3: 创建 Storage Bucket + 迁移 🖼️
- **状态**: [ ] 待开始
- **位置**: `supabase/migrations/011_generated_outfits_bucket.sql`
- **内容**: `generated-outfits` bucket + `generated_outfits` 表
- **工时**: 30min

#### P0-IMG-4: 添加生成按钮到结果页 🖼️
- **状态**: [ ] 待开始
- **位置**: `PentagonResultCard/index.tsx`
- **内容**: "✨ AIおすすめコーデを生成 [55pt]" 按钮
- **工时**: 1h

### Phase 2: UI完善 (P1 - 1天)

#### P1-IMG-1: 创建生成中动画组件 🎬
- **状态**: [ ] 待开始
- **位置**: `GeneratingOverlay.tsx`
- **工时**: 30min

#### P1-IMG-2: 创建图片画廊组件 🎬
- **状态**: [ ] 待开始
- **位置**: `GeneratedOutfitsGallery.tsx`
- **工时**: 1h

#### P1-IMG-3: 积分不足提示 + 购买引导 🎬
- **状态**: [ ] 待开始
- **工时**: 30min

---

## 今日修复 (2025-12-22)

#### BUG-1: 登录后跳转问题 🔧
- **状态**: [x] ✅ 已修复
- **问题**: 从 magicoord 登录后跳转到主站而非 magicoord
- **原因**: Auth 站点缺少 `NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS` 环境变量
- **修复**:
  - 更新 `.env.example` 和 `.env.local`
  - 需要在 Vercel 添加环境变量并重新部署

#### BUG-2: 新用户注册送积分 🔧
- **状态**: [x] ✅ 已修复
- **问题**: 新用户注册后没有收到初始积分
- **原因**: `handle_new_auth_user` 函数未包含积分初始化逻辑
- **修复**: 更新数据库函数，新用户自动获得 30 积分

---

**最后更新**: 2025-12-22
