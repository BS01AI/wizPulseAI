# Phase 3: 部署准备

## 📋 阶段概述

**目标**: 配置 Vercel 项目和生产环境，准备部署

**预计时间**: 3小时

**优先级**: 🟡 P2（部署前完成）

**前置条件**:
- Phase 1 和 Phase 2 已完成
- 本地测试全部通过
- 用户管理功能验证正常

## ✅ 前置条件检查

```bash
# 1. 本地测试已完成
# - SSO 登录正常 ✓
# - 用户管理正常 ✓
# - 权限系统正常 ✓

# 2. 准备生产环境资源
# - Vercel 账号 (https://vercel.com)
# - 域名已购买 (wizpulseai.com)
# - Supabase 项目 (lhofjwiqjqjtycnhliga)
# - Stripe 账号（如需支付功能）
```

## 📝 任务清单

- [ ] 任务 3.1: 检查/创建 Vercel 项目
- [ ] 任务 3.2: 配置环境变量
- [ ] 任务 3.3: 配置域名 DNS
- [ ] 任务 3.4: 配置 Supabase 回调 URL
- [ ] 任务 3.5: 配置 Stripe Webhook
- [ ] 任务 3.6: 本地构建测试

---

## 任务 3.1: 检查/创建 Vercel 项目 🚀

### 方法 1: 通过 Vercel Dashboard（推荐）

#### 创建 Auth 站点项目
```
1. 访问 https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. Import Git Repository:
   - 选择 GitHub/GitLab/Bitbucket
   - 选择仓库: wizPulseAI
4. 配置项目:
   - Project Name: wizpulseai-auth
   - Framework Preset: Next.js
   - Root Directory: auth-wizpulseai-com
5. 点击 "Deploy"（先不部署，配置环境变量后再部署）
```

#### 创建 Dashboard 站点项目
```
1. 点击 "Add New" → "Project"
2. Import Git Repository: 同上
3. 配置项目:
   - Project Name: wizpulseai-dashboard
   - Framework Preset: Next.js
   - Root Directory: db-wizPulseAI-com
4. 暂不部署
```

#### 创建 Main 站点项目
```
1. 点击 "Add New" → "Project"
2. Import Git Repository: 同上
3. 配置项目:
   - Project Name: wizpulseai-main
   - Framework Preset: Next.js
   - Root Directory: wizPulseAI-com
4. 暂不部署
```

### 方法 2: 使用 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 在每个站点目录下初始化
cd auth-wizpulseai-com
vercel link  # 创建或链接项目

cd ../db-wizPulseAI-com
vercel link

cd ../wizPulseAI-com
vercel link
cd ..
```

### 验证项目创建
```
访问 Vercel Dashboard:
- [ ] 看到 3 个项目
- [ ] 项目名称正确
- [ ] Root Directory 配置正确
```

---

## 任务 3.2: 配置环境变量 ⚙️

### 环境变量配置清单

参考: [env-templates.md](env-templates.md)

### Auth 站点环境变量

**Vercel Dashboard → wizpulseai-auth → Settings → Environment Variables**

```env
# Supabase 配置（共享）
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（从 Supabase Dashboard 获取）

# Cookie 配置（生产环境）
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# 站点 URLs
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# 默认重定向（登录成功后）
NEXT_PUBLIC_DEFAULT_REDIRECT_URL=https://dashboard.wizpulseai.com

# Google OAuth（如果使用）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**重要**:
- Scope: Production, Preview, Development（全部勾选）
- 或分别为 Production 和 Preview 设置不同值

### Dashboard 站点环境变量

**Vercel Dashboard → wizpulseai-dashboard → Settings → Environment Variables**

```env
# Supabase 配置（与 Auth 相同）
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Cookie 配置（与 Auth 相同）
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# 站点 URLs（与 Auth 相同）
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# Supabase 服务端密钥（⚠️ 仅服务端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（从 Supabase Dashboard → Settings → API）

# Stripe 配置（⚠️ Dashboard 专属）
STRIPE_SECRET_KEY=sk_live_...（或 sk_test_...测试环境）
STRIPE_WEBHOOK_SECRET=whsec_...（后面配置 Webhook 后获取）

# Next Auth Secret（如果使用）
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=https://dashboard.wizpulseai.com
```

### Main 站点环境变量

**Vercel Dashboard → wizpulseai-main → Settings → Environment Variables**

```env
# Supabase 配置（与 Auth 相同）
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Cookie 配置（与 Auth 相同）
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# 站点 URLs（与 Auth 相同）
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com
```

### 获取 Supabase 密钥

```
1. 访问 https://supabase.com/dashboard
2. 选择项目: lhofjwiqjqjtycnhliga
3. Settings → API
4. 复制以下密钥:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role (⚠️ 保密) → SUPABASE_SERVICE_ROLE_KEY
```

### 获取 Stripe 密钥

```
1. 访问 https://dashboard.stripe.com
2. Developers → API keys
3. 复制以下密钥:
   - Secret key → STRIPE_SECRET_KEY
   - (测试环境用 Test mode 的密钥)
```

### 验证环境变量配置
```
访问 Vercel Dashboard → 各项目 → Settings → Environment Variables
- [ ] Auth 站点: 8 个环境变量已配置
- [ ] Dashboard 站点: 12 个环境变量已配置
- [ ] Main 站点: 7 个环境变量已配置
- [ ] 所有 NEXT_PUBLIC_* 变量在 Production/Preview/Development 都有
- [ ] 敏感密钥（service_role, stripe_secret）仅在 Production
```

---

## 任务 3.3: 配置域名 DNS 🌐

### 域名规划

| 子域 | 指向 | 站点 |
|-----|------|------|
| www.wizpulseai.com | Vercel | Main |
| dashboard.wizpulseai.com | Vercel | Dashboard |
| auth.wizpulseai.com | Vercel | Auth |

### DNS 配置步骤

#### 1. 在域名注册商配置 DNS

**假设你的域名在 Cloudflare/GoDaddy/Namecheap:**

```
添加以下 CNAME 记录:

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto

Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
TTL: Auto

Type: CNAME
Name: auth
Value: cname.vercel-dns.com
TTL: Auto
```

#### 2. 在 Vercel 添加自定义域名

**Auth 站点:**
```
1. Vercel Dashboard → wizpulseai-auth → Settings → Domains
2. 添加域名: auth.wizpulseai.com
3. 等待 DNS 验证通过
4. SSL 证书自动配置
```

**Dashboard 站点:**
```
1. Vercel Dashboard → wizpulseai-dashboard → Settings → Domains
2. 添加域名: dashboard.wizpulseai.com
3. 等待验证和 SSL 配置
```

**Main 站点:**
```
1. Vercel Dashboard → wizpulseai-main → Settings → Domains
2. 添加域名: www.wizpulseai.com
3. 可选: 添加 wizpulseai.com (apex) 并重定向到 www
4. 等待验证和 SSL 配置
```

### 验证 DNS 配置

```bash
# 检查 DNS 解析（可能需要等待 5-10 分钟）
nslookup auth.wizpulseai.com
nslookup dashboard.wizpulseai.com
nslookup www.wizpulseai.com

# 应该看到类似输出:
# Non-authoritative answer:
# Name: cname.vercel-dns.com
# Address: 76.76.21.xxx
```

### 验证 SSL 证书
```
1. 等待 Vercel 配置完成（通常 5-10 分钟）
2. Vercel Dashboard → 各项目 → Settings → Domains
3. 检查每个域名旁边显示 "✓ Valid Configuration"
4. SSL 状态显示 "Active"
```

---

## 任务 3.4: 配置 Supabase 回调 URL 🔗

### 添加生产环境回调 URL

```
1. 访问 https://supabase.com/dashboard
2. 选择项目: lhofjwiqjqjtycnhliga
3. Authentication → URL Configuration
4. 在 "Redirect URLs" 添加:
```

```
https://auth.wizpulseai.com/api/auth/callback
```

**注意事项**:
- 确保是 HTTPS（生产环境）
- 路径必须精确匹配：`/api/auth/callback`
- 可以保留本地开发的 `http://localhost:3001/api/auth/callback`

### 配置 Site URL
```
Site URL: https://www.wizpulseai.com
```

### 配置邮件模板（可选但推荐）

```
Authentication → Email Templates

Confirm signup:
- 修改链接指向: https://auth.wizpulseai.com

Reset password:
- 修改链接指向: https://auth.wizpulseai.com

Magic Link:
- 修改链接指向: https://auth.wizpulseai.com
```

### 验证配置
```
Supabase Dashboard → Authentication → URL Configuration
- [ ] Redirect URLs 包含生产环境回调地址
- [ ] Site URL 设置正确
- [ ] 邮件模板指向 auth.wizpulseai.com
```

---

## 任务 3.5: 配置 Stripe Webhook 💳

**注意**: 仅 Dashboard 站点需要配置

### 创建 Webhook Endpoint

```
1. 访问 https://dashboard.stripe.com
2. Developers → Webhooks
3. 点击 "Add endpoint"
4. 配置:
   - Endpoint URL: https://dashboard.wizpulseai.com/api/webhooks/stripe
   - Description: WizPulseAI Dashboard Webhook
   - Events to send:
     ✓ checkout.session.completed
     ✓ customer.subscription.created
     ✓ customer.subscription.updated
     ✓ customer.subscription.deleted
     ✓ invoice.payment_succeeded
     ✓ invoice.payment_failed
5. 点击 "Add endpoint"
```

### 获取 Webhook 签名密钥

```
1. 在 Webhook 详情页面
2. 点击 "Reveal" 按钮
3. 复制 Signing secret (格式: whsec_...)
4. 保存到 Vercel 环境变量:
   - STRIPE_WEBHOOK_SECRET=whsec_...
```

### 测试 Webhook

```
1. Stripe Dashboard → Webhooks
2. 选择刚创建的 Webhook
3. 点击 "Send test webhook"
4. 选择事件类型: checkout.session.completed
5. 点击 "Send test webhook"
6. 检查响应:
   - 状态应为 200 OK
   - 无错误信息
```

### 验证配置
```
- [ ] Webhook endpoint 已创建
- [ ] URL 指向正确: dashboard.wizpulseai.com/api/webhooks/stripe
- [ ] 所需事件已勾选
- [ ] Signing secret 已保存到 Vercel
- [ ] 测试 Webhook 返回 200 OK
```

---

## 任务 3.6: 本地构建测试 🔨

### 在每个站点执行构建测试

```bash
# 1. Auth 站点构建
cd auth-wizpulseai-com
npm run build

# 检查输出:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization

# 2. Dashboard 站点构建
cd ../db-wizPulseAI-com
npm run build

# 3. Main 站点构建
cd ../wizPulseAI-com
npm run build
cd ..
```

### 验证构建产物

```bash
# 检查 .next 目录存在
ls -la auth-wizpulseai-com/.next/
ls -la db-wizPulseAI-com/.next/
ls -la wizPulseAI-com/.next/

# 预期: 看到 standalone, static, server 等目录
```

### 本地预览生产构建（可选）

```bash
# Auth 站点
cd auth-wizpulseai-com
npm run start  # 使用生产构建启动

# 在另一个终端
cd db-wizPulseAI-com
npm run start

# 在第三个终端
cd wizPulseAI-com
npm run start
```

### 常见构建问题

#### 问题 1: TypeScript 错误
```bash
# 检查类型错误
npm run type-check

# 修复后重新构建
npm run build
```

#### 问题 2: ESLint 错误
```bash
# 临时禁用 ESLint 构建检查（不推荐）
# next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true
  }
}
```

#### 问题 3: 环境变量未定义
```bash
# 确保所有 NEXT_PUBLIC_* 变量都有默认值
# 或在构建时传入:
NEXT_PUBLIC_SUPABASE_URL=xxx npm run build
```

---

## ✅ 验收标准

### Vercel 项目配置 ✓
- [ ] 3 个 Vercel 项目已创建
- [ ] 项目名称和 Root Directory 正确
- [ ] 所有环境变量已配置
- [ ] 环境变量作用域正确（Production/Preview）

### 域名配置 ✓
- [ ] DNS CNAME 记录已添加
- [ ] Vercel 域名验证通过
- [ ] SSL 证书已自动配置
- [ ] 域名可以 ping 通（解析正确）

### 第三方服务配置 ✓
- [ ] Supabase 回调 URL 已添加
- [ ] Stripe Webhook 已创建
- [ ] Webhook 签名密钥已保存
- [ ] 测试 Webhook 成功

### 构建测试 ✓
- [ ] 三个站点都能成功构建
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 构建产物正常

---

## 📋 配置检查清单

打印并逐项检查：

```markdown
## Vercel 项目
- [ ] wizpulseai-auth 项目已创建
- [ ] wizpulseai-dashboard 项目已创建
- [ ] wizpulseai-main 项目已创建

## 环境变量 (Auth)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
- [ ] NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
- [ ] NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
- [ ] NEXT_PUBLIC_DEFAULT_REDIRECT_URL

## 环境变量 (Dashboard)
- [ ] 所有 Auth 的变量 +
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET

## 环境变量 (Main)
- [ ] 所有 Supabase 和 URL 变量

## DNS 配置
- [ ] auth.wizpulseai.com → CNAME → cname.vercel-dns.com
- [ ] dashboard.wizpulseai.com → CNAME → cname.vercel-dns.com
- [ ] www.wizpulseai.com → CNAME → cname.vercel-dns.com

## Vercel 域名
- [ ] auth.wizpulseai.com 已添加并验证
- [ ] dashboard.wizpulseai.com 已添加并验证
- [ ] www.wizpulseai.com 已添加并验证
- [ ] SSL 证书状态: Active

## Supabase 配置
- [ ] Redirect URL: https://auth.wizpulseai.com/api/auth/callback
- [ ] Site URL: https://www.wizpulseai.com

## Stripe 配置
- [ ] Webhook URL: https://dashboard.wizpulseai.com/api/webhooks/stripe
- [ ] Events: checkout.session.completed, customer.subscription.*
- [ ] Signing secret 已保存

## 构建测试
- [ ] auth-wizpulseai-com 构建成功
- [ ] db-wizPulseAI-com 构建成功
- [ ] wizPulseAI-com 构建成功
```

---

## 📋 完成 Phase 3 后

### 输出物
- [ ] Vercel 项目配置截图
- [ ] 环境变量清单（不含敏感值）
- [ ] DNS 配置记录
- [ ] Supabase/Stripe 配置截图
- [ ] 构建日志（如有错误）

### 确认所有配置完成
- [ ] 所有检查清单项已完成
- [ ] 配置文档已更新
- [ ] 团队成员已知晓配置

### 准备部署
现在可以开始实际部署了！

### 下一步
✅ Phase 3 完成后，继续 **Phase 4: 生产部署**

👉 [进入 Phase 4](phase4-production.md)

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
