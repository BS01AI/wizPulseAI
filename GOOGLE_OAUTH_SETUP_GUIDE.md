# Google OAuth 配置完整指南

## 问题诊断

用户报告：**Google 注册/登录不好用**

可能的原因：
1. ❌ Supabase 项目中未配置 Google OAuth 提供商
2. ❌ Redirect URL 配置不正确
3. ❌ Google Cloud Console 配置缺失或错误
4. ❌ CSP（内容安全策略）阻止

## ✅ 已完成的代码修复

### 1. Cookie 域配置统一 ✅
**文件**：`auth-wizpulseai-com/src/lib/supabase-browser.ts`

**修复内容**：
- 从环境变量读取 Cookie 域（`NEXT_PUBLIC_COOKIE_DOMAIN`）
- 开发环境：`.localhost`
- 生产环境：`.wizpulseai.com`
- 本地开发时不强制 `Secure` 标志（支持 HTTP）

### 2. CSP 配置完善 ✅
**文件**：`auth-wizpulseai-com/next.config.mjs`

**新增支持**：
- ✅ `script-src`: 添加 `https://gstatic.com`（Google 静态资源）
- ✅ `frame-src`: 添加 `https://consent.google.com`（Google 授权页面）
- ✅ `img-src`: 添加 `https://lh3.googleusercontent.com`（用户头像）
- ✅ `form-action`: 添加 `https://accounts.google.com`（OAuth 表单提交）

### 3. 错误提示改进 ✅
**文件**：`auth-wizpulseai-com/src/app/(auth)/auth/page.tsx`

**新增功能**：
- 多语言错误消息（en/zh/ja）
- 智能错误识别（未配置/网络问题/重定向失败）
- 详细的控制台日志（方便调试）

---

## 🔧 必需的 Supabase 配置步骤

### 步骤 1：检查当前配置状态

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：**wizPulseAI-Local** (`lhofjwiqjqjtycnhliga`)
3. 导航到：**Authentication** → **Providers**
4. 找到 **Google** 提供商

**检查清单**：
- [ ] Google Provider 是否启用？
- [ ] Client ID 是否已配置？
- [ ] Client Secret 是否已配置？

### 步骤 2：获取 Google OAuth 凭证

如果还没有 Google OAuth 凭证，需要创建：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目（项目名称：WizPulseAI）
3. 启用 **Google+ API**（已被弃用，但 OAuth 需要）
4. 创建 **OAuth 2.0 客户端 ID**：
   - 应用类型：**Web 应用**
   - 名称：`WizPulseAI Auth`
   - 授权的 JavaScript 来源：
     ```
     http://localhost:3011
     https://auth.wizpulseai.com
     ```
   - 授权的重定向 URI（重要！）：
     ```
     http://localhost:3011/api/auth/callback
     https://auth.wizpulseai.com/api/auth/callback
     https://lhofjwiqjqjtycnhliga.supabase.co/auth/v1/callback
     ```

5. 保存后会得到：
   - **Client ID**（格式：`xxxxx.apps.googleusercontent.com`）
   - **Client Secret**（密钥，需保密）

### 步骤 3：在 Supabase 中配置 Google OAuth

1. 返回 Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. 点击 **Enable**（启用）
3. 填写配置：
   - **Client ID**：粘贴从 Google 获得的 Client ID
   - **Client Secret**：粘贴从 Google 获得的 Client Secret
   - **Authorized redirect URLs**：
     ```
     https://lhofjwiqjqjtycnhliga.supabase.co/auth/v1/callback
     ```
     （Supabase 会自动处理，无需手动添加）

4. **额外设置**（可选）：
   - **Skip nonce check**：保持默认（unchecked）
   - **Additional Scopes**：留空（默认已包含 email 和 profile）

5. 点击 **Save**

### 步骤 4：同步 Redirect URL 到 Google Cloud Console

**关键**：确保 Google Cloud Console 中的 "授权的重定向 URI" 包含：

```
✅ 本地开发：
http://localhost:3011/api/auth/callback

✅ 生产环境：
https://auth.wizpulseai.com/api/auth/callback

✅ Supabase 回调（必需）：
https://lhofjwiqjqjtycnhliga.supabase.co/auth/v1/callback
```

**注意**：
- ⚠️ URL 必须完全匹配（包括 http/https、端口号、路径）
- ⚠️ 不能有尾随斜杠（`/callback/` ❌，`/callback` ✅）

---

## 🧪 测试流程

### 本地开发环境测试

1. 确保所有站点都在运行：
   ```bash
   ./start-all.sh
   ```

2. 打开浏览器访问：`http://localhost:3011/auth`

3. 点击 **"Sign in with Google"** 按钮

4. **预期行为**：
   - ✅ 浏览器跳转到 Google 授权页面
   - ✅ 选择 Google 账户后授权
   - ✅ 自动跳转回 `http://localhost:3012/dashboard`
   - ✅ 显示用户信息（邮箱、头像）

5. **如果出错**：
   - 查看浏览器控制台（F12 → Console）
   - 查看 Auth 站点日志：`tail -f logs/auth.log`
   - 记录错误消息并检查下方的故障排查部分

### 生产环境测试

部署到 Vercel 后：

1. 访问：`https://auth.wizpulseai.com/auth`
2. 点击 Google 登录
3. 验证跳转和会话创建

---

## 🔍 故障排查

### 错误 1："Google login is not configured"

**原因**：Supabase 中未启用 Google Provider 或凭证未配置

**解决**：
1. 检查 Supabase Dashboard → Authentication → Providers → Google
2. 确保 **Enabled** 开关已开启
3. 确保 Client ID 和 Secret 已填写

---

### 错误 2："redirect_uri_mismatch"

**原因**：Google Cloud Console 中的 Redirect URI 配置不匹配

**解决**：
1. 检查浏览器地址栏的错误消息
2. 复制实际使用的 `redirect_uri` 参数
3. 前往 Google Cloud Console → APIs & Services → Credentials
4. 编辑 OAuth 2.0 客户端
5. 添加缺失的 Redirect URI
6. 保存后等待 5 分钟生效

---

### 错误 3："access_blocked" 或 CSP 阻止

**原因**：Content Security Policy 阻止 Google 脚本或 iframe

**解决**：
- ✅ 已修复（见上方 CSP 配置）
- 如果仍有问题，检查浏览器控制台是否有 CSP 违规报告
- 可能需要添加额外的域到 `next.config.mjs`

---

### 错误 4：登录后白屏或会话丢失

**原因**：Cookie 域配置问题

**解决**：
1. 打开浏览器 DevTools → Application → Cookies
2. 检查是否有 `sb-<project-ref>-auth-token` Cookie
3. 检查 Cookie 的 Domain 属性：
   - 本地应该是 `.localhost`
   - 生产应该是 `.wizpulseai.com`
4. 如果 Cookie 不存在或域不对，检查 `.env.local` 中的 `NEXT_PUBLIC_COOKIE_DOMAIN`

---

### 错误 5："User email is not verified"

**原因**：Supabase Email Confirmations 设置要求邮箱验证

**解决**：
1. Supabase Dashboard → Authentication → Settings
2. 找到 **Email Confirmations**
3. 如果启用，Google OAuth 用户也需要验证邮箱
4. 建议：**禁用** Email Confirmations，或在 Google Provider 设置中勾选 "Skip email verification for OAuth users"

---

## 📋 配置检查清单

在报告问题前，请确认以下所有项目：

**Supabase 配置**：
- [ ] Google Provider 已启用
- [ ] Client ID 已配置且正确
- [ ] Client Secret 已配置且正确
- [ ] Redirect URL 包含 Supabase 回调地址

**Google Cloud Console 配置**：
- [ ] OAuth 2.0 客户端已创建
- [ ] 授权的 JavaScript 来源包含站点地址
- [ ] 授权的重定向 URI 包含所有必需的地址（见步骤 2）
- [ ] OAuth 同意屏幕已配置
- [ ] 应用状态为 "In production" 或 "Testing"

**代码配置**：
- [ ] `.env.local` 包含正确的 Supabase 项目 ID
- [ ] `NEXT_PUBLIC_COOKIE_DOMAIN` 设置正确（本地：`.localhost`，生产：`.wizpulseai.com`）
- [ ] 所有站点都在运行（3010/3011/3012）

**浏览器状态**：
- [ ] 清除了浏览器缓存和 Cookies
- [ ] 没有使用隐私模式（可能阻止跨域 Cookie）
- [ ] 浏览器控制台没有 CSP 错误

---

## 🎯 下一步

完成配置后：

1. 重启 Auth 站点：
   ```bash
   ./stop-all.sh
   ./start-all.sh
   ```

2. 使用 Playwright 自动化测试（可选）：
   ```bash
   # 待实现
   # npm run test:google-oauth
   ```

3. 手动测试：
   - 注册新用户（用 Google 账户）
   - 登录已有用户
   - 跨站点会话共享（Main/Dashboard）
   - 单点登出

---

## 📞 支持

如果按照本指南操作后仍无法解决问题：

1. 收集以下信息：
   - 浏览器控制台的完整错误消息
   - `logs/auth.log` 中的相关日志
   - 使用的浏览器和版本
   - 是本地开发还是生产环境

2. 检查 Supabase 日志：
   - Supabase Dashboard → Logs → Auth Logs

3. 创建 GitHub Issue 或联系开发团队

---

**最后更新**：2025-11-13
**相关文档**：
- [SSO 测试文档](docs/test/SSO_AUTHENTICATION_TEST.md)
- [本地测试指南](LOCAL_TEST_GUIDE.md)
- [快速测试清单](docs/test/QUICK_TEST_CHECKLIST.md)
