# Supabase 邮件发送问题分析和解决方案

**日期**: 2025-11-07
**项目**: WizPulseAI Auth 站点
**问题**: 用户注册后没有收到验证邮件

---

## 🔍 发现的问题

### 问题1: Redirect URLs 没有本地配置 ❌

**当前状态**: Supabase Dashboard 的 Redirect URLs 列表中没有本地开发地址

**影响**:
- 邮件中的确认链接可能无法正确跳转
- OAuth 回调可能失败

**需要添加的 URLs**:
```
http://localhost:3011/auth
http://localhost:3011/auth/callback
http://localhost:3012
http://localhost:3010
```

---

### 问题2: 使用 Built-in Email Service（有限制）⚠️

**当前状态**:
```
You're using the built-in email service.
This service has rate limits and is not meant to be used for production apps.
```

**限制**:
- **速率限制**: 每小时/每天发送数量有限
- **可能被标记为垃圾邮件**
- **不适合生产环境**

**可能的原因**:
1. **达到速率限制** - 如果之前测试时发送了很多邮件
2. **邮件服务暂时不可用**
3. **收件箱拦截** - 被标记为垃圾邮件

---

### 问题3: 邮件模板是日文 🇯🇵

**当前模板**:
```html
<h2>wizPulseAI Slide へようこそ！</h2>
<p>ご登録ありがとうございます。</p>
```

**影响**: 如果用户选择中文或英文，仍然收到日文邮件

**需要**: 多语言邮件模板

---

## ✅ 解决方案

### 方案1: 配置 Redirect URLs（必须）⭐

**操作步骤**:

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/lhofjwiqjqjtycnhliga
   ```

2. **导航到认证设置**
   ```
   左侧菜单 → Authentication → URL Configuration
   ```

3. **添加 Redirect URLs**

   在 "Redirect URLs" 部分添加：
   ```
   http://localhost:3011/auth
   http://localhost:3011/auth/callback
   http://localhost:3012
   http://localhost:3010
   ```

4. **保存设置**

---

### 方案2: 检查邮件发送速率限制

**诊断步骤**:

1. **查看 Supabase Dashboard**
   ```
   Authentication → Logs
   查看是否有邮件发送失败的记录
   ```

2. **检查速率限制**
   ```
   Settings → Email → Rate Limiting
   查看当前使用情况
   ```

3. **临时解决**:
   - 等待速率限制重置（通常是1小时或24小时）
   - 或者禁用邮箱确认（仅开发环境）

---

### 方案3: 禁用邮箱确认（开发环境快速解决）

**适用场景**: 仅用于开发和测试

**操作步骤**:

1. **访问 Supabase Dashboard**
   ```
   Authentication → Settings → Email Auth
   ```

2. **找到 "Enable email confirmations"**

3. **关闭开关** ✅

4. **效果**:
   - 用户注册后立即可用
   - 不发送验证邮件
   - 自动返回 session（可以直接登录）

**注意**: ⚠️ 生产环境必须启用邮箱确认！

---

### 方案4: 配置自定义 SMTP（推荐生产环境）

**为什么需要**:
- 无速率限制（取决于 SMTP 提供商）
- 更可靠
- 可以自定义发件人

**推荐的 SMTP 服务**:
- **SendGrid** (免费额度: 100封/天)
- **Mailgun** (免费额度: 5000封/月)
- **AWS SES** (按量付费)
- **Gmail SMTP** (免费，但有限制)

**配置步骤** (以 SendGrid 为例):

1. **注册 SendGrid 账号**
   ```
   https://sendgrid.com/
   ```

2. **获取 API Key**
   ```
   Settings → API Keys → Create API Key
   ```

3. **在 Supabase 配置 SMTP**
   ```
   Dashboard → Settings → Email → SMTP Settings

   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender Email: noreply@wizpulseai.com
   Sender Name: WizPulseAI
   ```

4. **测试发送**

---

### 方案5: 更新邮件模板（多语言）

**当前问题**: 只有日文模板

**解决方案**: Supabase 目前不支持基于用户语言动态切换邮件模板

**替代方案**:
1. **使用英文模板**（国际通用）
2. **使用中日英三语混合模板**
3. **自定义邮件服务**（复杂，不推荐）

**建议的英文模板**:
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Confirm Your Email</title>
</head>
<body>
  <h2>Welcome to WizPulseAI!</h2>
  <p>Thank you for signing up.</p>
  <p>Please click the link below to verify your email address and activate your account.</p>
  <p style="margin: 20px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
  </p>
  <hr>
  <p style="font-size:12px;color:#888;">
    This email was sent to you because you signed up for WizPulseAI.<br>
    If you did not sign up, please ignore this email.
  </p>
</body>
</html>
```

**更新步骤**:
```
Dashboard → Authentication → Email Templates → Confirm signup
```

---

## 🎯 推荐的解决流程

### 立即执行（5分钟）

**Step 1**: 添加 Redirect URLs ✅
```
添加所有本地开发 URLs 到 Supabase
```

**Step 2**: 禁用邮箱确认（临时）✅
```
仅开发环境，快速测试 SSO 功能
```

**Step 3**: 测试注册和登录 ✅
```
用新账号测试完整流程
```

---

### 后续改进（1-2天）

**Step 4**: 配置 SendGrid SMTP
```
注册 → 获取 API Key → 配置 Supabase
```

**Step 5**: 更新邮件模板
```
改为英文或多语言混合模板
```

**Step 6**: 重新启用邮箱确认
```
生产环境必须启用
```

---

## 📊 问题原因总结

### 为什么之前可以发送邮件？

**可能的原因**:

1. **速率限制变化**
   - Supabase 可能调整了免费版的限制
   - 之前的测试邮件消耗了额度

2. **项目设置变化**
   - 有人修改了认证设置
   - Redirect URLs 被清空

3. **邮件服务临时问题**
   - Supabase 的邮件服务可能偶尔不稳定

4. **收件箱拦截**
   - 之前的邮件可能被标记为垃圾邮件
   - 导致后续邮件被自动拦截

---

## 🛠️ 快速诊断清单

运行以下检查：

### 检查1: Redirect URLs
- [ ] 访问 Dashboard → Authentication → URL Configuration
- [ ] 确认包含所有本地开发 URLs

### 检查2: 邮箱确认设置
- [ ] 访问 Dashboard → Authentication → Email Auth
- [ ] 查看 "Enable email confirmations" 状态

### 检查3: 邮件发送日志
- [ ] 访问 Dashboard → Authentication → Logs
- [ ] 查看是否有发送失败记录

### 检查4: SMTP 配置
- [ ] 访问 Dashboard → Settings → Email
- [ ] 确认使用的是内置服务还是自定义 SMTP

### 检查5: 速率限制
- [ ] 查看当前邮件发送量
- [ ] 确认是否达到限制

---

## 🚀 下一步行动

### 选项A: 快速测试（推荐）

```
1. 禁用邮箱确认（开发环境）
2. 添加 Redirect URLs
3. 测试完整的 SSO 流程
4. 后续再配置 SMTP
```

### 选项B: 完整配置

```
1. 添加 Redirect URLs
2. 配置 SendGrid SMTP
3. 更新邮件模板
4. 测试邮件发送
5. 测试 SSO 流程
```

---

## 📝 相关文档

- [Supabase Email Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [SendGrid Setup Guide](https://sendgrid.com/docs/)
- [本地测试指南](./LOCAL_TEST_GUIDE.md)

---

最后更新: 2025-11-07
