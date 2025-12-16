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
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:184-236`
- **修复**: 返回 402 Payment Required + 前端弹窗
- **工时**: 30min

#### P0-PAY-2: 支付失败页面 💳
- **状态**: [ ] 待开始
- **位置**: 需创建 `/credits/cancel` 和 `/credits/error`
- **修复**: 友好错误提示 + 重试按钮
- **工时**: 1h

#### P0-PAY-3: CreditService 统一 💳
- **状态**: [ ] 待开始
- **位置**: Dashboard 和 Fashion 各自实现
- **修复**: Fashion 调用 Dashboard API
- **工时**: 1h

#### P0-PAY-4: Stripe 价格调整 💳
- **状态**: [ ] 待开始
- **内容**: 从占位符改为真实定价
- **工时**: 30min

---

### Day 5: 代码质量修复 (4h)

#### P0-CODE-1: Console 日志清理 🧹
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts`
- **修复**: 生产环境条件化
- **工时**: 30min

#### P0-CODE-2: Error Boundary 添加 🧹
- **状态**: [ ] 待开始
- **位置**: `db-wizPulseAI-com/src/app/dashboard/`
- **修复**: 创建 `error.tsx` 文件
- **工时**: 2h

#### P0-CODE-3: 错误响应脱敏 🧹
- **状态**: [ ] 待开始
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:464-472`
- **修复**: 生产环境移除 stack trace
- **工时**: 15min

#### P0-CODE-4: 环境变量验证 🧹
- **状态**: [ ] 待开始
- **位置**: 各站点 layout.tsx 或 middleware.ts
- **修复**: 创建 `validateEnv()` 函数
- **工时**: 1h

---

### Day 6: SEO + 营销准备 (3h)

#### P0-SEO-1: OG 图片生成 🔍
- **状态**: [ ] 待开始
- **位置**: 需创建 `public/og-image.jpg`
- **规格**: 1200×630，品牌配色
- **工时**: 30min

#### P0-SEO-2: App 截图生成 🔍
- **状态**: [ ] 待开始
- **位置**: 需创建 `public/screenshots/`
- **规格**: 4张手机截图
- **工时**: 1h

#### P0-SEO-3: Google Search Console 🔍
- **状态**: [ ] 待开始
- **内容**: 配置验证 + 提交 sitemap
- **工时**: 30min

#### P0-SEO-4: Core Web Vitals 测试 🔍
- **状态**: [ ] 待开始
- **工具**: Lighthouse
- **目标**: LCP<2.5s, FID<100ms, CLS<0.1
- **工时**: 30min

#### P0-SEO-5: FAQ 帮助页面 🔍
- **状态**: [ ] 待开始
- **位置**: 需创建 `/help`
- **内容**: Top 10 问题
- **工时**: 30min

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

## 执行进度

| 阶段 | 任务数 | 完成 | 进度 |
|------|--------|------|------|
| Day 1-2 法律+安全 | 7 | 7 | 100% ✅ |
| Day 3 SSO安全 | 4 | 4 | 100% ✅ |
| Day 4 支付流程 | 5 | 1 | 20% |
| Day 5 代码质量 | 4 | 0 | 0% |
| Day 6 SEO营销 | 5 | 0 | 0% |
| Day 7 测试发布 | 4 | 0 | 0% |
| **总计** | **29** | **12** | **41%** |

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

**最后更新**: 2025-12-16
