# 环境变量配置模板

## 📋 文档说明

本文档提供三个站点的完整环境变量配置模板。

**使用方法**:
1. 复制对应站点的模板到 `.env.local` 文件
2. 替换占位符为实际值
3. 保存文件
4. 重启开发服务器

**安全提示**:
- ⚠️ 永远不要将 `.env.local` 提交到 Git
- ⚠️ 区分公开变量（`NEXT_PUBLIC_*`）和私密变量
- ⚠️ 生产环境使用不同的密钥

---

## 🔐 Auth 站点环境变量

### 本地开发环境

文件路径: `auth-wizpulseai-com/.env.local`

```env
# ==================================================
# Supabase 配置
# ==================================================
# 项目: lhofjwiqjqjtycnhliga
# 获取方式: Supabase Dashboard → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================================================
# Cookie 配置
# ==================================================
# 本地开发: localhost
# 生产环境: .wizpulseai.com

NEXT_PUBLIC_COOKIE_DOMAIN=localhost

# ==================================================
# 站点 URLs
# ==================================================
# 本地开发端口分配:
# - Auth: 3001
# - Dashboard: 3002
# - Main: 3000

NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3002
NEXT_PUBLIC_MAIN_URL=http://localhost:3000

# ==================================================
# 默认重定向
# ==================================================
# 登录成功后跳转到 Dashboard

NEXT_PUBLIC_DEFAULT_REDIRECT_URL=http://localhost:3002

# ==================================================
# Google OAuth（可选）
# ==================================================
# 获取方式: Google Cloud Console → APIs & Services → Credentials
# 如果不使用 Google 登录，可以不设置

# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# ==================================================
# 其他配置
# ==================================================
# 默认语言

NEXT_PUBLIC_DEFAULT_LOCALE=ja

# Node 环境
NODE_ENV=development
```

### 生产环境 (Vercel)

```env
# ==================================================
# Supabase 配置（与本地相同）
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================================================
# Cookie 配置（生产域名）
# ==================================================
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# ==================================================
# 站点 URLs（生产域名）
# ==================================================
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# ==================================================
# 默认重定向（生产域名）
# ==================================================
NEXT_PUBLIC_DEFAULT_REDIRECT_URL=https://dashboard.wizpulseai.com

# ==================================================
# Google OAuth
# ==================================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com

# ==================================================
# 其他配置
# ==================================================
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NODE_ENV=production
```

---

## 📊 Dashboard 站点环境变量

### 本地开发环境

文件路径: `db-wizPulseAI-com/.env.local`

```env
# ==================================================
# Supabase 配置
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================================================
# Supabase 服务端密钥（⚠️ 私密，仅服务端使用）
# ==================================================
# 获取方式: Supabase Dashboard → Settings → API → service_role key
# 用途: 服务端 API 绕过 RLS 策略

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# ==================================================
# Cookie 配置
# ==================================================
NEXT_PUBLIC_COOKIE_DOMAIN=localhost

# ==================================================
# 站点 URLs
# ==================================================
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3002
NEXT_PUBLIC_MAIN_URL=http://localhost:3000

# ==================================================
# Stripe 配置
# ==================================================
# 获取方式: Stripe Dashboard → Developers → API keys
# 测试环境使用 Test mode 的密钥

# 公开密钥（前端使用）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 私密密钥（⚠️ 仅服务端使用）
STRIPE_SECRET_KEY=sk_test_...

# Webhook 签名密钥（⚠️ 仅服务端使用）
# 获取方式: Stripe Dashboard → Webhooks → 选择端点 → Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...

# ==================================================
# NextAuth 配置（如果使用）
# ==================================================
# 生成方式: openssl rand -base64 32

# NEXTAUTH_SECRET=your-random-32-character-secret
# NEXTAUTH_URL=http://localhost:3002

# ==================================================
# 其他配置
# ==================================================
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NODE_ENV=development
```

### 生产环境 (Vercel)

```env
# ==================================================
# Supabase 配置
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# ==================================================
# Cookie 配置
# ==================================================
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# ==================================================
# 站点 URLs
# ==================================================
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# ==================================================
# Stripe 配置（生产密钥）
# ==================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ==================================================
# NextAuth 配置
# ==================================================
# NEXTAUTH_SECRET=your-production-secret
# NEXTAUTH_URL=https://dashboard.wizpulseai.com

# ==================================================
# 其他配置
# ==================================================
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NODE_ENV=production
```

---

## 🌐 Main 站点环境变量

### 本地开发环境

文件路径: `wizPulseAI-com/.env.local`

```env
# ==================================================
# Supabase 配置
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================================================
# Cookie 配置
# ==================================================
NEXT_PUBLIC_COOKIE_DOMAIN=localhost

# ==================================================
# 站点 URLs
# ==================================================
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3002
NEXT_PUBLIC_MAIN_URL=http://localhost:3000

# ==================================================
# 其他配置
# ==================================================
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NODE_ENV=development
```

### 生产环境 (Vercel)

```env
# ==================================================
# Supabase 配置
# ==================================================
NEXT_PUBLIC_SUPABASE_URL=https://lhofjwiqjqjtycnhliga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================================================
# Cookie 配置
# ==================================================
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# ==================================================
# 站点 URLs
# ==================================================
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com
NEXT_PUBLIC_MAIN_URL=https://www.wizpulseai.com

# ==================================================
# 其他配置
# ==================================================
NEXT_PUBLIC_DEFAULT_LOCALE=ja
NODE_ENV=production
```

---

## 📌 环境变量说明

### NEXT_PUBLIC_* 变量
这些变量会被打包到前端代码中，**对用户可见**。

**特点**:
- ✅ 可以在浏览器中使用
- ✅ 在服务端和客户端都可用
- ⚠️ 不要放敏感信息
- 例子: API URL、公开的配置

### 非 NEXT_PUBLIC_* 变量
这些变量**仅在服务端可用**，前端无法访问。

**特点**:
- ✅ 仅服务端可用
- ✅ 可以放敏感信息
- ❌ 浏览器中无法访问
- 例子: 数据库密钥、API 密钥

---

## 🔑 密钥获取指南

### Supabase 密钥

```
1. 访问 https://supabase.com/dashboard
2. 选择项目: lhofjwiqjqjtycnhliga
3. Settings → API
4. 复制:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role (⚠️ 保密) → SUPABASE_SERVICE_ROLE_KEY
```

### Stripe 密钥

```
1. 访问 https://dashboard.stripe.com
2. Developers → API keys
3. 复制:
   - Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Secret key → STRIPE_SECRET_KEY

测试环境: 使用 Test mode 的密钥
生产环境: 使用 Live mode 的密钥
```

### Google OAuth 密钥

```
1. 访问 https://console.cloud.google.com
2. APIs & Services → Credentials
3. 创建 OAuth 2.0 客户端 ID
4. 配置:
   - 应用类型: Web application
   - 授权重定向 URI:
     - http://localhost:3001/api/auth/callback (开发)
     - https://auth.wizpulseai.com/api/auth/callback (生产)
5. 复制 Client ID → NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

---

## ✅ 验证环境变量

### 方法 1: 在代码中打印（仅开发环境）

```javascript
// 服务端（API Route 或 Server Component）
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Not set')

// 客户端
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY) // undefined（正确）
```

### 方法 2: 使用 Vercel CLI

```bash
# 查看环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull .env.local
```

### 方法 3: Vercel Dashboard

```
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 检查所有变量是否存在
3. 检查作用域（Production/Preview/Development）
```

---

## 🚨 常见错误

### 错误 1: 变量未定义
```
Error: process.env.NEXT_PUBLIC_SUPABASE_URL is undefined
```

**原因**: 环境变量未设置或名称拼写错误

**解决**:
1. 检查 `.env.local` 文件是否存在
2. 检查变量名称是否正确
3. 重启开发服务器

### 错误 2: 服务端变量在客户端访问
```
Warning: process.env.SUPABASE_SERVICE_ROLE_KEY is undefined
```

**原因**: 尝试在客户端组件访问服务端变量

**解决**: 只在服务端使用（API Route、Server Component）

### 错误 3: Cookie 域名错误
```
Cookie not set: Domain mismatch
```

**原因**: `NEXT_PUBLIC_COOKIE_DOMAIN` 设置错误

**解决**:
- 本地: `localhost` 或 `.localhost`
- 生产: `.wizpulseai.com`（注意前面的点）

---

## 📋 环境变量检查清单

使用此清单验证配置完整性：

### Auth 站点
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_COOKIE_DOMAIN
- [ ] NEXT_PUBLIC_AUTH_URL
- [ ] NEXT_PUBLIC_DASHBOARD_URL
- [ ] NEXT_PUBLIC_MAIN_URL
- [ ] NEXT_PUBLIC_DEFAULT_REDIRECT_URL

### Dashboard 站点
- [ ] 所有 Auth 的变量 +
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET

### Main 站点
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_COOKIE_DOMAIN
- [ ] NEXT_PUBLIC_AUTH_URL
- [ ] NEXT_PUBLIC_DASHBOARD_URL
- [ ] NEXT_PUBLIC_MAIN_URL

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
