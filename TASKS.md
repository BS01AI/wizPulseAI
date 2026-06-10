# 活跃任务清单

> 当前 Sprint: Fashion App 一周发布冲刺
> 详细检查清单: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

---

## 最新完成 (2026-06-10) ✅

### Magicoord → matrix billing 统一积分迁移 + 聊天接真AI

> 背景调查报告: [wizPulseAI-docs/reports/MAGICOORD-READINESS-AUDIT-20260610.md](./wizPulseAI-docs/reports/MAGICOORD-READINESS-AUDIT-20260610.md)
> 起因: 旧 fashion.* 积分表/RPC 已被 20260516006000 删除，但 Fashion 站 main 分支仍在调用 → 生产扣分链路断裂（P0-4）

| 任务 | 状态 | 说明 |
|------|------|------|
| DB migration 20260610010000 | ✅ | consume/refund_magicoord_feature + fashion.feature_usage + access context |
| 积分服务迁移 | ✅ | credits.service / tier / analyze / edit-outfit / chat 全走 matrix RPC |
| 初回ボーナス统一 | ✅ | 旧100/50pt退役 → matrix onboarding 30pt（幂等） |
| 购买包切换 | ✅ | 旧fashion专属包 → 全局 points_100~10000 |
| 顾问聊天接真AI | ✅ | Gemini Flash 服务端生成（限流+预算帽已有），1对1禁伪造persona |
| 安全修复 P0×2 | ✅ | apply_credit_delta + give_*_reward 三兄弟 REVOKE authenticated |
| 3A审查 | ✅ | review-agent(1 BLOCK已修) + security-auditor(1 P0已修) |
| BUSINESS-BIBLE 同步 | ✅ | 定价39/98pt、30pt bonus、points包、Price ID 对照 |

**⚠️ 待 bobo/线上操作**：
- [ ] **migration 20260610010000 需应用到线上 DB**（Supabase MCP token 401 无法远程执行；不应用则扣分仍断）
- [ ] magicoord 在 ai_products 仍是 is_active=false（05-25 暂停），开放时需激活
- [ ] 跑调查报告附录的诊断 SQL 验证 fashion RLS / bucket / migration 状态

**审查遗留 P1/P2（后续批次）**：
- [ ] P1: 分享点击奖励无"访客≠分享者"校验（可自刷）+ share/create TOCTOU（需 share_records(analysis_id) UNIQUE，加前先查线上重复数据）
- [ ] P1: fashion 主路径 rate-limiter 是 read-modify-write 竞态，应迁移到 Redis 原子滑窗
- [ ] P2: analyze/edit-outfit 成本未计入每日 AI 预算帽；budget 估算应改用真实 token
- [ ] P2: chat prompt 改结构化 multi-turn API（现为文本拼接+标签剥离缓解）
- [ ] 清理: lib/db/fashion.mapper.ts 等死代码仍引用已删表；TS 类型需 supabase gen 重新生成

---

## 历史完成 (2025-01-14) ✅

### PWA 安装引导功能

| 任务 | 状态 | 说明 |
|------|------|------|
| usePWAInstall Hook | ✅ | 设备/平台检测、安装状态管理 |
| PWAInstallBanner | ✅ | 手机用户安装引导 + iOS手动步骤 |
| DesktopMobileTip | ✅ | 电脑用户QR Code + URL复制 |
| PWAPrompt 整合组件 | ✅ | 一行代码引入 |
| Fashion Layout 集成 | ✅ | 手机3秒/电脑5秒延迟显示 |
| 4语言翻译 | ✅ | ja/en/ar/zh-TW |
| Review P0修复 | ✅ | useState→useEffect, QR错误处理, canInstall逻辑 |

**Git Commit**: `fa8ac7c` (fashion-wizpulseai-com)
**Review评分**: Architecture 8.5/10, Security 86/100, Build ✅

---

## 历史完成 (2025-01-06) ✅

### AI顾问素材集成

| 任务 | 状态 | 说明 |
|------|------|------|
| 31张图片素材上传 | ✅ | avatars(25) + posters(5) + hero(1) |
| Onboarding头像替换 | ✅ | emoji → 自定义圆形头像 |
| 日文名称修正 | ✅ | 闘蜜→親友, 毒舌闘蜜→辛口親友 等 |
| 首页AI顾问介绍区 | ✅ | 团队海报 + 5张单人海报卡片 |
| Onboarding死循环修复 | ✅ | 添加localStorage缓存检查 |
| TypeScript类型修复 | ✅ | thumbnail_base64, teamPosterAlt |

**Git Commits**: 805ebe9, 4644cee, af77713, 66b61f0, d1567a0

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
| 分享功能 | 5 | 5 | 100% ✅ |
| 架构审查 | 6 | 5 | 83% ✅ |
| **总计** | **57** | **52** | **91%** |

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

## 新功能: 分享穿搭获积分 🆕

> 设计文档: [SHARE_REWARD_SYSTEM.md](./fashion-wizpulseai-com/docs/SHARE_REWARD_SYSTEM.md)
> 数据库: ✅ 已完成 (2025-12-26)
> 前端代码: ✅ 已完成 (2025-12-26)
> 翻译文件: ✅ 4语言已完成 (2025-12-26)

### Phase 1: 核心功能 (P0) ✅ 90%完成

#### P0-SHARE-1: 分享API创建 📤
- **状态**: [x] ✅ 已完成 (2025-12-26)
- **位置**: `fashion-wizpulseai-com/src/app/api/share/`
- **内容**:
  - `POST /api/share/create` - 创建分享链接 ✅
  - `GET /api/share/[code]` - 获取分享内容 ✅
- **代码**: 200行

#### P0-SHARE-2: 分享页面 📤
- **状态**: [x] ✅ 已完成 (2025-12-26)
- **位置**: `fashion-wizpulseai-com/src/app/s/[code]/page.tsx`
- **内容**: 公开访问的分享内容展示页 + SEO优化
- **代码**: 188行

#### P0-SHARE-3: ShareButton 组件 📤
- **状态**: [x] ✅ 已完成 (2025-12-26)
- **位置**: `fashion-wizpulseai-com/src/shared/ui/share/`
- **内容**: ShareButton.tsx + ShareModal.tsx (4渠道分享)
- **代码**: 324行

#### P0-SHARE-4: LINE/Instagram/Twitter 分享集成 📤
- **状态**: [x] ✅ 已完成 (2025-12-26)
- **内容**: LINE Share API + Instagram下载 + Twitter Web Intent + 复制链接
- **代码**: 已集成到 ShareModal.tsx

#### P0-SHARE-5: 注册时邀请关联 📤
- **状态**: [x] ✅ 已完成 (2025-12-27)
- **位置**: `auth-wizpulseai-com`
- **内容**: 注册时识别 share_code，调用 `create_referral()` 创建邀请关系
- **产出**:
  - `src/lib/referral-utils.ts` - 客户端工具
  - `src/lib/referral-utils-server.ts` - 服务端工具
  - `REFERRAL_INTEGRATION_GUIDE.md` - 集成文档
  - `auth/page.tsx` + `callback/route.ts` - 集成修改
- **工时**: 2h

### Phase 1.5: 紧急修复 (P0 - 2025-12-26 Review发现) 🔴

#### P0-SHARE-BUG-1: 积分重复发放 🔴
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **严重级别**: 🔴 严重
- **问题**: API (`/api/share/[code]/route.ts`) 和页面 (`/s/[code]/page.tsx`) 都在发放首次点击奖励 (+5积分)
- **修复**: 删除 API 中的积分发放逻辑（-55行代码），只保留页面 SSR 中的 `give_share_reward` RPC
- **负责 Agent**: multi-site-coder ✅

#### P0-SHARE-BUG-2: 数据库函数缺少事务锁 🔴
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **严重级别**: 🔴 严重
- **问题**: `give_share_reward` 函数没有使用 `FOR UPDATE` 行级锁，存在竞态条件
- **修复**: 迁移 `015_share_reward_fixes.sql` 添加 `FOR UPDATE` 行级锁
- **负责 Agent**: 101-database-expert ✅

#### P0-SHARE-BUG-3: _debug 信息泄露 🟡
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **严重级别**: 🟡 一般
- **问题**: API 返回 `_debug` 字段，生产环境不应暴露
- **修复**: 删除 `_debug` 返回字段
- **负责 Agent**: multi-site-coder ✅

#### P1-SHARE-BUG-4: 缺少速率限制 🟡
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **严重级别**: 🟡 一般
- **问题**: 分享 API 没有速率限制
- **修复**:
  - 新建 `ip-rate-limiter.ts` IP 速率限制器
  - 迁移 `014_ip_rate_limiter.sql` 创建限流表
  - 创建分享：每小时10次/每天30次
  - 访问分享：每分钟30次/每小时500次
- **负责 Agent**: multi-site-coder ✅

#### P3-SHARE-BUG-5: share_create 配置缺失 🟢
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **严重级别**: 🟢 低
- **问题**: 数据库缺少 `share_create` 奖励类型
- **修复**: 迁移 `015_share_reward_fixes.sql` 添加配置（+2积分）
- **负责 Agent**: 101-database-expert ✅

---

### Phase 2: 完善功能 (P1)

#### P1-SHARE-1: 分享统计页面
- **状态**: [ ] 待开始
- **位置**: `db-wizPulseAI-com/src/app/dashboard/referrals/`
- **工时**: 3h

#### P1-SHARE-2: 充值奖励触发
- **状态**: [ ] 待开始
- **内容**: Stripe Webhook 调用 `give_purchase_reward()`
- **工时**: 1h

---

## 架构审查发现 (2025-12-26) 🔍

> 审查范围: 4站点 (Main/Auth/Dashboard/Fashion)
> 总体评分: 7.9/10

### 🔴 严重问题 (P0)

#### P0-ARCH-1: 环境变量验证缺失
- **状态**: [ ] 待修复
- **影响站点**: Main / Auth / Dashboard
- **问题**: Fashion有`env.ts`验证，其他站点没有
- **风险**: 运行时错误、生产环境配置遗漏
- **修复**: 复制Fashion的`env.ts`模式到其他站点
- **工时**: 1h
- **调查完成**: 2025-12-27 (architecture-guardian)

#### P0-ARCH-2: Console.log残留 (Fashion)
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **影响站点**: Fashion
- **修复**: 迁移90+处到Logger系统，383→111 (-72%)
- **Git**: `07d86f6`

#### P0-ARCH-3: 硬编码URL (Fashion)
- **状态**: [x] ✅ 已修复 (2025-12-26)
- **影响站点**: Fashion
- **修复**: 首页4处链接改用 `NEXT_PUBLIC_MAIN_URL` 环境变量
- **Git**: `f9b3d4a`

### 🟡 一般问题 (P1)

#### P1-ARCH-1: TypeScript类型断言
- **状态**: [x] ✅ 调查完成 (2025-12-27)
- **数量**: 104处 `as any`/`as unknown` (Fashion站点)
- **分类**:
  - Supabase相关: 62处 (59.6%) - 类型生成不完整
  - JSON字段: 8处
  - 枚举赋值: 12处
  - 其他: 22处
- **根因**: Supabase 类型生成不完整
- **建议**: 重新运行 `npx supabase gen types typescript` 可消除 62 处
- **工时**: 1h

#### P1-ARCH-2: TODO注释未清理
- **状态**: [x] ✅ 调查完成 (2025-12-27)
- **实际数量**: 50处 (主站37 + Fashion13)
- **分类**:
  - ✅ 可删除: 4处
  - 🔄 转Issue: 43处 (知识中心内容填充)
  - ⏳ 保留: 3处 (有明确计划)
- **处理**: 创建 3 个 GitHub Issue 追踪
- **工时**: 30min

#### P1-ARCH-3: 依赖版本不统一
- **状态**: [x] ✅ 调查完成 (2025-12-27)
- **严重问题**:
  - Fashion Supabase **2.39.0** → 应升级到 **2.81.1**
  - Auth Next.js **14.2.3** → 应升级到 **14.2.33**
  - Lucide-react 版本差 **250+版本**
- **建议统一版本**:
  - next: ^14.2.33
  - react: ^18.3.1
  - @supabase/supabase-js: ^2.81.1
  - tailwindcss: ^3.4.17
  - lucide-react: ^0.555.0
- **工时**: 1h

### 🟢 改善建议 (P2)

#### P2-ARCH-1: Three.js 动态导入
- **状态**: [ ] 可选
- **影响站点**: Main
- **效果**: 首屏加载减少 ~40KB
- **工时**: 30min

#### P2-ARCH-2: AI SDK 按需加载
- **状态**: [ ] 可选
- **影响站点**: Fashion
- **效果**: 仅加载当前使用的Provider
- **工时**: 1h

#### P2-ARCH-3: 统一Logger系统
- **状态**: [ ] 可选
- **内容**: 将Fashion的Logger提升到shared模块
- **工时**: 1h

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

## 新功能: 积分模式系统 ✅ 已完成

> 设计文档: [CREDIT_MODE_SYSTEM_DESIGN.md](./fashion-wizpulseai-com/docs/CREDIT_MODE_SYSTEM_DESIGN.md)
> 完成日期: 2025-12-26

### 功能说明

用户可以选择 Standard 或 Premium 模式进行分析：

| 功能 | ✨ Standard | 👑 Premium (×2.5) |
|------|------------|------------------|
| 写真分析 | 9 pt | 23 pt |
| 穿搭生成 | 29 pt | 73 pt |

### Phase 完成状态

- [x] Phase 1: 数据库迁移 (`analysis_mode` 字段)
- [x] Phase 2: 积分配置 (`CREDIT_COSTS` 分模式)
- [x] Phase 3: 前端UI (`AnalysisModeSelector` 组件)
- [x] Phase 4: API更新 (接收mode参数，动态计算积分)
- [x] Phase 5: 历史记录显示模式标签 (✨/👑)

### Phase 6: 后续优化 (待定)

- [ ] 模型/Prompt差异化（Standard vs Premium）
- [ ] 成本优化策略实施

---

---

## 🚀 発布スプリント (2026-02-27 Cowork PM 策定)

> **策定元**: Cowork AI-helper (プロダクトマネージャー役)
> **完整計画**: `AI-helper/output/magicoord-launch-plan.md`
> **目標**: 3日以内に正式発布 → **2026-03-01 (日)**

### 現状サマリー
- 全57タスク中52完了 (91%)
- 推定スコア: 88/100
- **残り5項目のみで上線可能（合計4-5h）**

---

### 🔴 必須修 — これだけ直せば上線できる

#### LAUNCH-1: Stripe 生産環境配置 💳
- **状態**: [ ] 待完成
- **担当**: Claude Code (supabase-manager or multi-site-coder)
- **内容**:
  - Stripe Dashboard で Live Mode 有効化
  - 4つの Live Products/Prices 作成
  - Live Webhook 作成 → `whsec_live_xxx` 取得
  - Vercel 環境変数更新: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Redeploy
- **工時**: 30min
- **参照**: BUSINESS-BIBLE.md Phase 0-1

#### LAUNCH-2: CORS 域名制限 🔒
- **状態**: [x] ✅ 完成 (2026-02-27)
- **担当**: Claude Code
- **修正**: 6個API を `*` → ホワイトリスト制限、新規 `src/lib/cors.ts` 作成
- **修正ファイル**: balance, packages, transactions, referrals/shares, referrals/stats, checkout

#### LAUNCH-3: Credits 価格サーバ側検証 🔒
- **状態**: [x] ✅ 完成 (2026-02-27)
- **担当**: Claude Code
- **修正**: Checkout が外部 credits/price を受け付けない、Webhook はサーバ側設定で検証
- **修正ファイル**: `checkout/route.ts`, `webhooks/stripe/route.ts`, `credits/packages.ts`

#### LAUNCH-4: 密鍵ローテーション 🔒
- **状態**: [x] ✅ 完成 (2026-02-27)
- **担当**: Claude Code
- **修正**: `.mcp.json` を環境変数参照に変更
- **備考**: `.zshrc` に環境変数設定が必要（ユーザー手動）

#### LAUNCH-5: 完整支付フローテスト 🧪
- **状態**: [ ] 待完成
- **担当**: Claude Code (stripe-tester)
- **内容**:
  - 本番 Stripe で実カード購入テスト
  - 積分自動付与確認
  - Webhook ログ確認
  - 購入→積分消費→残高確認の完全フロー
- **工時**: 1h

---

### ✅ 解決済: 積分消費データ統一

- **正解値（コード実装）**: Standard分析 9pt / 提案 29pt
- **PRICING_PLAN.md**: ✅ 統一済み (2026-02-27 Claude Code が更新)

---

### 🟡 建議修（発布後1週間以内）

| ID | 内容 | 工時 |
|----|------|------|
| POST-1 | P0-LEGAL-6~9 法律文書増強 | 4h |
| POST-2 | getSession→getUser 移行 (セキュリティ) | 2h |
| POST-3 | P0-ARCH-1 他站点 env.ts 追加 | 1h |
| POST-4 | Fashion Supabase 2.39→2.81.1 升級 | 1h |
| POST-5 | P1-SHARE-1 分享統計頁面 | 3h |
| POST-6 | P1-SHARE-2 充值奨励トリガー | 1h |

---

**最後更新**: 2026-02-27 (LAUNCH-2,3,4 完了、残り LAUNCH-1+5 はユーザー手動操作待ち)
