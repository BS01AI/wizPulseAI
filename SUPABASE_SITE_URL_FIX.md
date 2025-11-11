# Supabase Site URL 配置修复

**问题**: 邮件验证链接跳转到生产环境而不是本地

**URL**: https://auth.wizpulseai.com/auth?code=... ❌
**应该**: http://localhost:3011/auth?code=... ✅

---

## 🎯 快速修复（2分钟）

### Step 1: 访问 Supabase Dashboard

```
https://supabase.com/dashboard/project/lhofjwiqjqjtycnhliga/auth/url-configuration
```

### Step 2: 找到 "Site URL" 设置

在页面顶部应该有一个输入框：
```
Site URL: https://auth.wizpulseai.com  ← 当前值（错误）
```

### Step 3: 修改为本地地址

**删除** `https://auth.wizpulseai.com`

**输入** `http://localhost:3011`

```
Site URL: http://localhost:3011  ← 正确值 ✅
```

### Step 4: 保存

点击 **"Save"** 按钮

---

## ✅ 验证修改

### 测试步骤

1. **用新邮箱注册**
   ```
   http://localhost:3011/auth?view=sign_up
   ```

2. **检查收到的邮件**

3. **查看邮件中的链接**
   - 应该是 `http://localhost:3011/auth?code=...` ✅
   - 不应该是 `https://auth.wizpulseai.com/...` ❌

4. **点击邮件链接**
   - 应该跳转到本地页面
   - 自动登录并跳转到 Dashboard

---

## 📊 关于"新页面"的说明

### 正常流程

1. **注册页面**（原始标签页）
   ```
   http://localhost:3011/auth?view=sign_up
   你在这里填表注册
   ```

2. **邮件验证链接**（新标签页/窗口）
   ```
   点击邮件链接会打开新标签页
   http://localhost:3011/auth?code=xxx
   ```

3. **验证后行为**
   - 新标签页：显示登录成功，跳转到 Dashboard
   - 原始标签页：可以关闭了（不再需要）

### 为什么UI不一样？

**原始页面**: 注册表单 UI
**新页面**: 验证成功后的 UI（可能是欢迎页或自动跳转）

**这是正常的** ✅

---

## 🔧 关于原始页面

### 用户的记忆是对的

之前的流程可能是：
1. 注册后保持在注册页面
2. 点击邮件链接（新窗口打开）
3. 验证成功后关闭新窗口
4. 在原始页面手动登录

### 现在的流程（更好）

1. 注册后跳转到登录页
2. 点击邮件链接（新窗口打开）
3. 验证成功后自动登录并跳转
4. 原始页面可以关闭（已经不需要了）

---

## 🌍 生产环境配置

### 重要提醒

**部署到生产环境时**，记得改回：
```
Site URL: https://auth.wizpulseai.com  ← 生产环境
```

### 建议

如果需要同时开发和维护生产环境：
1. **创建两个 Supabase 项目**
   - 一个用于开发（Site URL: localhost）
   - 一个用于生产（Site URL: https://...）

2. **或者在切换环境时修改 Site URL**
   - 开发时：`http://localhost:3011`
   - 部署前：`https://auth.wizpulseai.com`

---

## 📝 配置检查清单

修改完成后，确认：

- [ ] Site URL 已改为 `http://localhost:3011`
- [ ] Redirect URLs 包含所有本地地址
- [ ] 已保存配置
- [ ] 用新邮箱测试注册
- [ ] 邮件链接指向本地
- [ ] 点击链接能正确跳转和登录

---

最后更新: 2025-11-07
