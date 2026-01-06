# WizPulseAI 矩阵网站结构图

> 最后更新: 2025-01-06

## 四站点概览

```
wizPulseAI 矩阵网站
│
├─ 1. 主站 www.wizpulseai.com (wizPulseAI-com)
│   └─ 营销/内容展示 - 28页面 - 全公开
│
├─ 2. 认证站 auth.wizpulseai.com (auth-wizpulseai-com)
│   └─ SSO认证中心 - 5页面 - 公开
│
├─ 3. Dashboard dashboard.wizpulseai.com (db-wizPulseAI-com)
│   └─ 用户管理/计费 - 22页面 - 需登录
│
└─ 4. Fashion magicoord.wizpulseai.com (fashion-wizpulseai-com)
    └─ AI产品(穿搭诊断) - 12页面 - 混合
```

---

## 1. 主站 (wizPulseAI-com)

### 公开页面

| 路由 | 说明 | 状态 |
|------|------|------|
| `/[locale]/` | 首页 | ✅ |
| `/[locale]/products` | 产品列表 | ✅ |
| `/[locale]/products/[id]` | 产品详情 | ✅ |
| `/[locale]/knowledge-hub` | 知识中心 | ✅ |
| `/[locale]/knowledge-hub/basics` | 基础教程 | ✅ |
| `/[locale]/knowledge-hub/tutorials` | 使用教程 | ✅ |
| `/[locale]/knowledge-hub/market` | 市场资讯 | ✅ |
| `/[locale]/about` | 关于我们 | ✅ |
| `/[locale]/contact` | 联系我们 | ✅ |
| `/[locale]/life` | WizLife品牌页 | ✅ |
| `/[locale]/biz` | WizBiz品牌页 | ✅ |

### 法律文档 (Stripe认证)

| 路由 | 说明 | 状态 |
|------|------|------|
| `/[locale]/pricing` | 定价页 | ✅ 新增 |
| `/[locale]/privacy` | 隐私政策 | ✅ |
| `/[locale]/terms` | 服务条款 | ✅ |
| `/[locale]/refund` | 退款政策 | ✅ 新增 |
| `/[locale]/cancellation` | 取消政策 | ✅ 新增 |
| `/[locale]/tokusho` | 特商法表示 | ✅ 新增 |

**多语言**: ja / en / ar / zh-TW

---

## 2. 认证站 (auth-wizpulseai-com)

| 路由 | 说明 | 状态 |
|------|------|------|
| `/(auth)/auth` | 统一登录页 | ✅ |
| `/api/auth/callback` | OAuth回调 | ✅ |
| `/(auth)/auth/v1/logout` | 登出 | ✅ |

---

## 3. Dashboard站 (db-wizPulseAI-com)

### 用户页面 (需登录)

| 路由 | 说明 |
|------|------|
| `/dashboard` | 首页 |
| `/dashboard/credits` | 积分管理 |
| `/dashboard/billing` | 订阅管理 |
| `/dashboard/settings` | 账户设置 |
| `/dashboard/referrals` | 推荐系统 |

### 管理员页面

| 路由 | 说明 |
|------|------|
| `/dashboard/admin` | 管理中心 |
| `/dashboard/admin/users` | 用户管理 |
| `/dashboard/admin/products` | 产品管理 |
| `/dashboard/admin/config` | 配置中心 |

---

## 4. Fashion站 (fashion-wizpulseai-com)

### 公开页面

| 路由 | 说明 |
|------|------|
| `/[locale]/` | 首页 |
| `/[locale]/pricing` | 定价页 |
| `/[locale]/about/privacy` | 隐私政策 |
| `/[locale]/about/terms` | 服务条款 |
| `/s/[code]` | 分享页面 |

### 用户页面 (需登录)

| 路由 | 说明 |
|------|------|
| `/[locale]/fashion` | 功能首页 |
| `/[locale]/fashion/onboarding` | 新用户入门 |
| `/[locale]/fashion/history` | 历史记录 |
| `/[locale]/fashion/settings` | 设置 |

---

## 重复内容分析

| 内容 | Main站 | Fashion站 | 建议 |
|------|--------|-----------|------|
| 隐私政策 | `/privacy` | `/about/privacy` | ⚠️ 考虑统一 |
| 服务条款 | `/terms` | `/about/terms` | ⚠️ 考虑统一 |
| 定价页 | `/pricing` | `/pricing` | ✅ 各自独立(产品不同) |

**结论**: Main站法律文档面向平台整体，Fashion站法律文档面向产品专属。当前分离是合理的。

---

## 站点关系流程图

```
用户访问流程:

    www.wizpulseai.com (主站)
           │
           │ 点击"登录"
           ↓
    auth.wizpulseai.com (认证)
           │
           │ OAuth/登录成功
           ↓
    dashboard.wizpulseai.com (仪表盘)
           │
           │ 点击"Fashion"产品
           ↓
    magicoord.wizpulseai.com (Fashion)


Cookie共享: .wizpulseai.com (顶级域)
认证方式: Supabase Auth + SSO
```

---

## API统计

| 站点 | API数量 | 主要功能 |
|------|---------|----------|
| Main | 2 | 联系表单、语言设置 |
| Auth | 1 | OAuth回调 |
| Dashboard | 38 | 用户/订阅/积分/管理 |
| Fashion | 14 | 分析/分享/积分 |
| **总计** | **55** | |

---

## 架构评分

| 指标 | 评分 | 说明 |
|------|------|------|
| 页面结构清晰度 | 8/10 | 四站点职责明确 |
| API设计规范性 | 8/10 | RESTful风格 |
| 多语言实现 | 7/10 | Fashion使用不同方案 |
| 重复内容 | 7/10 | 法律文档有合理重复 |
| 可维护性 | 8/10 | 模块化良好 |

---

## 待清理项

- [ ] Main站调试页面 (`/debug`, `/product-debug`)
- [ ] Auth站空目录 (`/login`, `/signup`)
- [ ] 备份文件 (`*.backup.tsx`, `*.old.tsx`)

---

**文档维护**: 每次添加新页面后更新此文件
