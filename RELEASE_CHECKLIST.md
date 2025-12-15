# Fashion App (マジコーデ) 发布前检查清单

> 生成时间: 2025-12-15
> 目标: 一周内发布
> 综合评分: 74/100

---

## 综合评分

| 维度 | 评分 | Agent | P0数 |
|------|------|-------|------|
| 安全审计 | 72/100 | security-auditor | 3 |
| 架构质量 | 72/100 | architecture-guardian | 6 |
| 支付流程 | 78/100 | stripe-tester | 3 |
| SSO系统 | 78/100 | site-validator | 3 |
| 商业准备 | 72/100 | business-analyst | 3 |
| SEO/ASO | 75/100 | seo-expert | 3 |
| **综合** | **74/100** | - | **21** |

---

## P0 必须修复（发布阻塞）

### 1. 安全问题 (security-auditor)

#### 1.1 Debug API 暴露生产环境
- **位置**: `fashion-wizpulseai-com/src/app/api/debug/auth/route.ts`
- **风险**: 泄露环境变量、用户信息、开发凭据
- **修复**: 生产环境禁用或删除
- **时间**: 5分钟

#### 1.2 DEV_MODE 可能意外启用
- **位置**: `fashion-wizpulseai-com/src/config/dev-mode.ts`
- **风险**: 绕过所有认证
- **修复**: 添加 `process.env.NODE_ENV === 'production'` 双重检查
- **时间**: 10分钟

#### 1.3 积分扣除竞态条件
- **位置**: `db-wizPulseAI-com/src/lib/credits/service.ts:88-122`
- **风险**: 并发请求只扣一次积分
- **修复**: 使用数据库 FOR UPDATE 或 RPC 原子函数
- **时间**: 30分钟

---

### 2. SSO安全问题 (site-validator)

#### 2.1 Dashboard Cookie 域不一致
- **位置**: `db-wizPulseAI-com/src/lib/supabase/server.ts:23`
- **风险**: 跨站点登录失败
- **修复**: 统一使用环境变量 `NEXT_PUBLIC_COOKIE_DOMAIN`
- **时间**: 30分钟

#### 2.2 Dashboard 浏览器 SameSite=none
- **位置**: `db-wizPulseAI-com/src/shared/auth/supabase-browser.ts:59,96`
- **风险**: CSRF 攻击
- **修复**: 改为 `SameSite=lax`
- **时间**: 30分钟

#### 2.3 Fashion 服务端 SameSite=none
- **位置**: `fashion-wizpulseai-com/src/infrastructure/supabase/server.ts:48,70`
- **风险**: CSRF 攻击
- **修复**: 改为 `SameSite=lax`
- **时间**: 30分钟

---

### 3. 支付流程问题 (stripe-tester)

#### 3.1 积分不足错误被吞掉
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:184-236`
- **风险**: 用户无感知，分析继续执行
- **修复**: 返回 402 Payment Required
- **时间**: 30分钟

#### 3.2 缺少支付失败页面
- **位置**: 需创建 `/credits/cancel` 和 `/credits/error`
- **风险**: 用户支付失败后跳转空白页
- **修复**: 创建友好的错误页面
- **时间**: 1小时

#### 3.3 CreditService 不统一
- **位置**: Dashboard 和 Fashion 各自实现
- **风险**: 数据不一致
- **修复**: 统一使用 Dashboard API
- **时间**: 1小时

---

### 4. 法律合规问题 (business-analyst)

#### 4.1 隐私政策缺失
- **位置**: 需创建 `/privacy`
- **风险**: GDPR/日本个人情报保护法违规
- **修复**: 创建4语言隐私政策页面
- **时间**: 4小时

#### 4.2 服务条款缺失
- **位置**: 需创建 `/terms`
- **风险**: 消费者契约法违规
- **修复**: 创建4语言服务条款页面
- **时间**: 3小时

#### 4.3 退款政策缺失
- **位置**: 嵌入 Terms 页面
- **风险**: 日本特定商取引法违规（罚款100万日元）
- **修复**: 添加退款条款
- **时间**: 1小时

---

### 5. 架构质量问题 (architecture-guardian)

#### 5.1 Console 日志泄露生产环境
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:218-229`
- **风险**: 泄露 AI 成本等敏感信息
- **修复**: 条件化或删除
- **时间**: 30分钟

#### 5.2 缺少 Error Boundary
- **位置**: `db-wizPulseAI-com/src/app/dashboard/page.tsx`
- **风险**: Supabase 失败时白屏
- **修复**: 创建 `error.tsx`
- **时间**: 2小时

#### 5.3 错误响应泄露 stack trace
- **位置**: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts:464-472`
- **风险**: 泄露代码结构
- **修复**: 生产环境只返回通用错误
- **时间**: 15分钟

#### 5.4 环境变量验证缺失
- **位置**: 各站点启动时
- **风险**: 缺少 API Key 时运行出错
- **修复**: 创建 `validateEnv()` 函数
- **时间**: 1小时

---

### 6. SEO/ASO 问题 (seo-expert)

#### 6.1 OG 图片缺失
- **位置**: 需创建 `public/og-image.jpg`
- **风险**: 社交分享无预览图，降低点击率 20-30%
- **修复**: 生成 1200×630 分享图
- **时间**: 30分钟

#### 6.2 App 截图缺失
- **位置**: 需创建 `public/screenshots/`
- **风险**: PWA 安装提示无预览
- **修复**: 生成4张手机截图
- **时间**: 1小时

#### 6.3 Google Search Console 未配置
- **位置**: 需添加 verification meta
- **风险**: 无法提交 sitemap，无法监控搜索
- **修复**: 配置 GSC 并添加验证码
- **时间**: 30分钟

---

## 修复计划（7天）

### Day 1-2: 法律合规 + 安全 (8h)
- [ ] 隐私政策页面
- [ ] 服务条款页面
- [ ] Debug API 禁用
- [ ] DEV_MODE 双重检查
- [ ] 积分竞态条件修复

### Day 3: SSO 安全 (2h)
- [ ] Dashboard Cookie 域统一
- [ ] Dashboard SameSite 修复
- [ ] Fashion SameSite 修复
- [ ] SSO 登录测试

### Day 4: 支付流程 (3h)
- [ ] 积分不足返回 402
- [ ] 支付失败页面
- [ ] CreditService 统一
- [ ] Stripe 价格调整

### Day 5: 代码质量 (4h)
- [ ] Console 日志清理
- [ ] Error Boundary 添加
- [ ] 错误响应脱敏
- [ ] 环境变量验证

### Day 6: SEO + 营销 (3h)
- [ ] og-image.jpg 生成
- [ ] App 截图生成
- [ ] Google Search Console
- [ ] Core Web Vitals 测试
- [ ] FAQ 页面

### Day 7: 测试 + 发布 (2.5h)
- [ ] 完整支付流程测试
- [ ] SSO 跨站点测试
- [ ] 移动端 PWA 测试
- [ ] 正式发布

---

## 已经做得好的部分

| 模块 | 评分 | 亮点 |
|------|------|------|
| PWA | 88/100 | manifest完整、8种图标、缓存策略 |
| 多语言 | 95/100 | 4语言完整支持 |
| AI分析 | 90/100 | v3.0人话版、成本$0.002/次 |
| Stripe | 85/100 | Webhook幂等性、签名验证 |
| Schema.org | 90/100 | SoftwareApplication标记 |
| Onboarding | 90/100 | 3步引导、5种顾问角色 |

---

## 风险等级

| 风险 | 等级 | 说明 |
|------|------|------|
| 法律合规 | 🔴 高 | 日本特定商取引法要求 |
| CSRF攻击 | 🔴 高 | SameSite=none 允许跨站请求 |
| 积分薅羊毛 | 🔴 高 | 竞态条件可被利用 |
| SSO失败 | 🟡 中 | Cookie域不一致 |
| 用户体验 | 🟡 中 | 错误页面缺失 |

---

**最后更新**: 2025-12-15
