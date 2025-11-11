# Supabase Redirect URLs 配置指南

**项目**: WizPulseAI
**Supabase 项目**: lhofjwiqjqjtycnhliga
**时间**: 2025-11-07

---

## 🎯 为什么需要配置 Redirect URLs

Supabase 使用 Redirect URLs 来：
1. **验证邮件链接的跳转目标** - 防止钓鱼攻击
2. **OAuth 回调验证** - Google 登录后的回调
3. **安全控制** - 只允许白名单内的 URL

如果不配置，邮件中的验证链接**无法跳转**到本地开发环境 ❌

---

## 📋 需要添加的 URLs

### 开发环境（本地）

```
http://localhost:3011/auth
http://localhost:3011/auth/callback
http://localhost:3012
http://localhost:3010
```

### 为什么需要这些 URL？

| URL | 用途 |
|-----|------|
| `http://localhost:3011/auth` | 邮件验证链接跳转（主要） |
| `http://localhost:3011/auth/callback` | OAuth 回调（Google 登录） |
| `http://localhost:3012` | Dashboard 重定向 |
| `http://localhost:3010` | Main 站点重定向 |

---

## 🛠️ 配置步骤（3分钟完成）

### Step 1: 访问 Supabase Dashboard

```
https://supabase.com/dashboard/project/lhofjwiqjqjtycnhliga
```

### Step 2: 导航到 URL 配置

```
左侧菜单 → Authentication → URL Configuration
```

或者直接访问：
```
https://supabase.com/dashboard/project/lhofjwiqjqjtycnhliga/auth/url-configuration
```

### Step 3: 添加 Redirect URLs

找到 **"Redirect URLs"** 部分（通常在页面中部）

**点击 "+ Add URL"** 按钮，逐个添加：

1. 输入：`http://localhost:3011/auth`
   - 点击 "Add" 或按 Enter

2. 输入：`http://localhost:3011/auth/callback`
   - 点击 "Add" 或按 Enter

3. 输入：`http://localhost:3012`
   - 点击 "Add" 或按 Enter

4. 输入：`http://localhost:3010`
   - 点击 "Add" 或按 Enter

### Step 4: 保存配置

- 滚动到页面底部
- 点击 **"Save"** 按钮 ✅

**注意**: 有些 Supabase 版本可能会自动保存

---

## ✅ 验证配置

### 检查清单

配置完成后，确认以下内容：

- [ ] Redirect URLs 列表中包含所有4个 localhost URL
- [ ] 没有拼写错误（特别注意端口号）
- [ ] 已点击保存按钮
- [ ] 页面没有报错

### 预期结果

配置成功后，您应该看到：

```
Redirect URLs:
✓ http://localhost:3011/auth
✓ http://localhost:3011/auth/callback
✓ http://localhost:3012
✓ http://localhost:3010
```

---

## 🧪 测试配置

### 测试1: 注册新用户

1. **访问注册页面**
   ```
   http://localhost:3011/auth?view=sign_up
   ```

2. **填写信息**
   - 使用一个新的邮箱
   - 设置密码

3. **点击注册**

4. **检查邮箱**
   - 应该收到验证邮件
   - 点击邮件中的验证链接

5. **验证跳转**
   - ✅ 应该跳转到 `http://localhost:3011/auth`
   - ✅ 显示登录页面或欢迎页面
   - ❌ 不应该显示错误或无法访问

---

### 测试2: Google OAuth

1. **访问登录页面**
   ```
   http://localhost:3011/auth
   ```

2. **点击 "Sign in with Google"**

3. **选择 Google 账号并授权**

4. **验证回调**
   - ✅ 应该跳转回 `http://localhost:3011/auth/callback`
   - ✅ 然后自动跳转到 Dashboard 或 Main

---

## 🐛 常见问题

### 问题1: 添加 URL 时报错 "Invalid URL"

**原因**: URL 格式不正确

**检查**:
- ✅ 必须以 `http://` 或 `https://` 开头
- ✅ 端口号前面是冒号 `:` 不是其他符号
- ✅ 路径以 `/` 开头（如果有路径）
- ❌ 不要有空格或其他特殊字符

**正确示例**:
```
✓ http://localhost:3011/auth
✗ localhost:3011/auth           (缺少 http://)
✗ http://localhost: 3011/auth   (端口号有空格)
✗ http://localhost:3011 /auth   (路径前有空格)
```

---

### 问题2: 保存后仍然无法跳转

**可能原因**:

1. **浏览器缓存**
   - 清除浏览器缓存
   - 或使用隐身模式测试

2. **配置未生效**
   - 等待 1-2 分钟
   - Supabase 配置可能需要时间同步

3. **URL 不匹配**
   - 检查邮件中的链接
   - 确保链接的域名和端口与配置的一致

---

### 问题3: 邮件链接跳转到错误的 URL

**检查 Site URL 配置**:

在同一页面还有一个 **"Site URL"** 设置：

```
Site URL: http://localhost:3011
```

**作用**:
- 这是默认的跳转地址
- 邮件链接会优先使用这个 URL
- 确保设置为 Auth 站点的地址

---

## 📊 生产环境配置

当部署到生产环境时，需要添加：

### 生产 URLs

```
https://auth.wizpulseai.com
https://auth.wizpulseai.com/auth
https://auth.wizpulseai.com/auth/callback
https://dashboard.wizpulseai.com
https://www.wizpulseai.com
```

### 注意事项

1. **使用 HTTPS** ✅ (生产环境必须)
2. **保留开发环境 URLs** ✅ (可以同时保留)
3. **测试所有 URLs** ✅ (部署后测试)

---

## 🔐 安全建议

### 只添加必要的 URLs

❌ **不要添加**:
- 通配符 URL（如 `http://*.localhost`）
- 不需要的域名
- 第三方域名

✅ **只添加**:
- 您控制的域名
- 实际使用的 URL
- 开发和生产环境的具体地址

### Site URL 设置

```
开发环境: http://localhost:3011
生产环境: https://auth.wizpulseai.com
```

**不要**同时设置多个 Site URL，只设置当前环境的主要 URL。

---

## 📝 配置记录

请在配置完成后填写：

```
配置日期: 2025-11-07
配置人员: _____________
已添加的 URLs:
  □ http://localhost:3011/auth
  □ http://localhost:3011/auth/callback
  □ http://localhost:3012
  □ http://localhost:3010

测试结果:
  □ 邮件验证链接可以跳转
  □ Google OAuth 回调成功
  □ 跨站点重定向正常

问题记录:
  ___________________________
```

---

## 🔗 相关文档

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase URL Configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [项目测试指南](./docs/test/SSO_AUTHENTICATION_TEST.md)
- [邮件问题分析](./SUPABASE_EMAIL_ISSUE_ANALYSIS.md)

---

## ✅ 下一步

配置完成后：

1. ✅ **测试邮件注册** - 验证邮件和链接跳转
2. ✅ **测试 Google 登录** - 验证 OAuth 回调
3. ✅ **测试 SSO** - 跨站点登录测试
4. ✅ **测试单点登出** - 验证登出功能

---

最后更新: 2025-11-07
