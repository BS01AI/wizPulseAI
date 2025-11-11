# Supabase 403 错误修复指南

**错误**: `verify?token=...&type=signup Failed to load resource: 403`

**原因**: Redirect URL 不在白名单或 Site URL 配置错误

---

## 🎯 立即检查（2分钟）

### 检查1: Site URL

访问:
```
https://supabase.com/dashboard/project/lhofjwiqjqjtycnhliga/auth/url-configuration
```

**确认 Site URL**:
```
✅ 正确: http://localhost:3011
❌ 错误: https://auth.wizpulseai.com
```

**如果还是生产环境地址，立即改为 `http://localhost:3011`**

---

### 检查2: Redirect URLs

在同一页面，**确认 Redirect URLs 包含**:
```
✓ http://localhost:3011/auth
✓ http://localhost:3011/auth/callback
✓ http://localhost:3012
✓ http://localhost:3010
```

**如果缺少，立即添加**

---

### 检查3: 可能需要添加的 URL

如果还是 403，尝试添加：
```
http://localhost:3011/auth/verify
http://localhost:3011/auth/confirm
```

---

## 🔄 修改后重新测试

### 重要：使用新邮箱注册

**不要用旧邮件的链接**，因为旧 token 包含旧配置！

1. **修改 Site URL** 为 `http://localhost:3011`
2. **保存配置**
3. **用全新的邮箱注册**
4. **检查新邮件**
5. **点击新邮件的链接**

---

## 🐛 如果还是 403

### 临时解决方案：禁用邮箱确认

如果急需测试 SSO 功能：

1. **访问 Supabase Dashboard**
   ```
   Authentication → Settings → Email Auth
   ```

2. **关闭 "Enable email confirmations"**

3. **效果**:
   - 用户注册后立即可用
   - 不发送验证邮件
   - 自动返回 session（可以直接登录）

4. **测试完成后记得重新启用** ⚠️

---

## 📊 调试信息

如果问题持续，检查：

### 在浏览器 Console 中查看

```javascript
// 查看完整的错误 URL
// 应该能看到 redirect_to 参数指向哪里
```

### 在 Supabase Dashboard 查看

```
Authentication → Logs
查看验证失败的详细原因
```

---

最后更新: 2025-11-07
