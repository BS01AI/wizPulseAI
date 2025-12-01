# 清除浏览器缓存完整指南

## 问题现象
点击 Google 登录按钮后没有任何反应，控制台没有显示 `[Auth] Starting Google OAuth` 日志。

## 根本原因
浏览器缓存了旧的 JavaScript 代码，新的 `window.location.href` 跳转代码没有生效。

---

## 🔧 解决方案（按优先级）

### 方案 1：硬刷新（最快）⭐

1. **打开登录页**：http://localhost:3011/auth
2. **按快捷键**：
   - **Mac**：`Cmd + Shift + R`
   - **Windows/Linux**：`Ctrl + Shift + R`
3. **点击 Google 登录按钮**

---

### 方案 2：开发者工具禁用缓存

1. **打开浏览器开发者工具**：`F12` 或 `Cmd/Ctrl + Option + I`
2. **切换到 Network 标签页**
3. **勾选 "Disable cache"**（禁用缓存）
4. **保持 DevTools 打开**
5. **刷新页面**（`Cmd/Ctrl + R`）
6. **点击 Google 登录按钮**

---

### 方案 3：清除站点数据（彻底）

1. **打开开发者工具**：`F12`
2. **切换到 Application 标签页**
3. **左侧菜单找到 "Storage"**
4. **点击 "Clear site data"**
5. **确认清除**
6. **关闭浏览器，重新打开**
7. **访问** http://localhost:3011/auth
8. **点击 Google 登录按钮**

---

### 方案 4：隐身模式测试（推荐用于验证）

1. **打开隐身窗口**：
   - **Mac**：`Cmd + Shift + N`
   - **Windows/Linux**：`Ctrl + Shift + N`
2. **访问**：http://localhost:3011/auth
3. **点击 Google 登录按钮**

**优点**：隐身模式不使用缓存，可以确认是否是缓存问题。

---

## ✅ 验证修复成功的标志

点击 Google 登录按钮后，在浏览器控制台（F12 → Console）应该看到：

```
[Auth] Starting Google OAuth with redirect: http://localhost:3012/dashboard
[Auth] Redirecting to Google OAuth URL: https://accounts.google.com/o/oauth2/v2/auth?...
```

然后浏览器会**立即跳转到 Google 授权页面**。

---

## 🐛 如果还是不行

### 检查按钮是否被禁用

打开浏览器开发者工具，切换到 **Elements** 标签，找到 Google 登录按钮，查看是否有 `disabled` 属性。

### 检查控制台错误

打开 **Console** 标签，看是否有红色的 JavaScript 错误。

### 手动测试函数

在浏览器控制台中直接输入：

```javascript
// 测试 Supabase OAuth 调用
const { createBrowserClient } = await import('@supabase/ssr');
const supabase = createBrowserClient(
  'https://lhofjwiqjqjtycnhliga.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2Zqd2lxanFqdHljbmhsaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjg3MzksImV4cCI6MjA1OTg0NDczOX0.h0WMULhXxx0Of_AFyT6l_7EfbbqgfCfnEy6K1VcK7kY'
);

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3011/api/auth/callback?next=http://localhost:3012/dashboard'
  }
});

console.log('Result:', data, error);
if (data?.url) {
  console.log('OAuth URL:', data.url);
  // 手动跳转
  // window.location.href = data.url;
}
```

---

## 📝 最后更新
2025-11-13

**下一步**：如果所有方法都不行，告诉我控制台的完整错误信息。
