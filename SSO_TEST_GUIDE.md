# 🔐 SSO 单点登录测试指南

## ✅ 环境准备完成

所有三个站点已成功启动并修复！

| 站点 | 端口 | 状态 | 访问地址 |
|-----|------|------|---------|
| 🌐 Main | 3010 | ✅ 正常 | http://localhost:3010 |
| 🔐 Auth | 3011 | ✅ 正常 | http://localhost:3011/auth |
| 📊 Dashboard | 3012 | ✅ 正常 | http://localhost:3012 |

**Cookie 域**: `.localhost` (所有站点共享)

---

## 🧪 测试 SSO 功能

### 测试目标
验证用户在 Auth 站点登录后，Cookie 能够共享到所有站点（`.localhost` 域），实现单点登录效果。

---

## 📝 测试步骤

### Step 1: 检查初始状态（未登录）

1. **打开 Chrome 浏览器**（推荐使用隐身模式避免缓存干扰）
   ```
   Cmd+Shift+N (Mac) 或 Ctrl+Shift+N (Windows)
   ```

2. **分别访问三个站点**：
   - Main: http://localhost:3010
     - 预期：右上角显示 "Get Started" 按钮（未登录）

   - Dashboard: http://localhost:3012
     - 预期：显示 "Please log in" 页面

   - Auth: http://localhost:3011/auth
     - 预期：显示登录表单

---

### Step 2: 在 Auth 站点登录

1. **访问 Auth 登录页**：http://localhost:3011/auth

2. **选择登录方式**：

#### 方式 A: Google OAuth 登录
   ```
   点击 "Google でサインイン" 按钮
   → 选择 Google 账号
   → 授权登录
   ```

#### 方式 B: 邮箱密码登录
   ```
   输入邮箱: your-email@example.com
   输入密码: your-password
   点击 "サインイン" 按钮
   ```

3. **登录成功后**：
   - 预期：自动跳转到 Dashboard (http://localhost:3012)
   - 或者显示登录成功的消息

---

### Step 3: 验证 Cookie 设置

**打开 Chrome DevTools**（按 F12 或 Cmd+Option+I）

1. **切换到 Application 标签**

2. **查看 Cookies**：
   - 左侧 Storage → Cookies → http://localhost:3011

3. **检查以下 Cookie 是否存在**：

| Cookie 名称 | Domain | Path | Secure | SameSite |
|------------|--------|------|--------|----------|
| `sb-lhofj...access-token` | `.localhost` | `/` | ✓ | Lax |
| `sb-lhofj...refresh-token` | `.localhost` | `/` | ✓ | Lax |
| `NEXT_LOCALE` | `.localhost` | `/` | - | Lax |

**重要检查**：
- ✅ Domain 必须是 `.localhost` (注意前面的点！)
- ✅ access_token 和 refresh_token 都存在
- ✅ Cookie 的值不为空

---

### Step 4: 验证跨站点状态同步

现在测试最重要的功能：**Cookie 共享和状态同步**

#### 4.1 测试 Dashboard 站点

1. 访问或刷新：http://localhost:3012
2. **预期结果**：
   - ✅ 显示 Dashboard 主页（不再要求登录）
   - ✅ 右上角显示用户邮箱或头像
   - ✅ 能看到用户菜单

#### 4.2 测试 Main 站点

1. 访问或刷新：http://localhost:3010
2. **预期结果**：
   - ✅ 右上角不再显示 "Get Started"
   - ✅ 显示用户头像或用户名
   - ✅ 点击头像能看到下拉菜单（Dashboard、Logout 等）

#### 4.3 测试 Auth 站点

1. 访问：http://localhost:3011/auth
2. **预期结果**：
   - ✅ 不再显示登录表单
   - ✅ 显示 "已登录" 或自动跳转到 Dashboard

---

### Step 5: 测试登出功能

1. **在任意站点点击登出**（推荐在 Dashboard）：
   - 找到用户菜单 → 点击 "Sign Out" 或 "登出"

2. **验证所有站点都登出**：
   - Dashboard (3012): ✅ 显示 "Please log in" 页面
   - Main (3010): ✅ 右上角恢复显示 "Get Started"
   - Auth (3011): ✅ 显示登录表单

3. **检查 Cookie 清除**：
   - DevTools → Application → Cookies
   - ✅ `sb-*access-token` 和 `sb-*refresh-token` 已被删除

---

## 🎯 测试检查清单

打印此清单并逐项测试：

```markdown
## SSO 功能测试

### 登录前验证
- [ ] Main 显示未登录状态
- [ ] Dashboard 要求登录
- [ ] Auth 显示登录表单

### 登录流程
- [ ] 能在 Auth 站点成功登录
- [ ] 登录后自动跳转 Dashboard

### Cookie 验证
- [ ] access_token Cookie 存在
- [ ] refresh_token Cookie 存在
- [ ] Cookie Domain 为 `.localhost`
- [ ] Cookie SameSite 为 Lax

### 跨站点状态同步
- [ ] Dashboard 显示已登录状态
- [ ] Main 显示已登录状态（用户头像）
- [ ] Auth 识别已登录状态

### 登出流程
- [ ] 点击登出按钮成功
- [ ] Dashboard 恢复未登录状态
- [ ] Main 恢复未登录状态
- [ ] Auth 恢复未登录状态
- [ ] Cookie 已被清除
```

---

## 🔍 调试技巧

### 查看浏览器控制台日志

**Main 站点** (localhost:3010)：
```javascript
// 查看认证状态日志
[Auth] isAuthenticated status: {session: null, isLoading: false}
[UserMenu] 认证状态: 未认证
```

**Dashboard 站点** (localhost:3012)：
```javascript
// 查看 Auth State
[HomePage] Auth State: {user: {...}, session: {...}, isAuthenticated: true}
```

### 手动检查 Session

在浏览器控制台执行：
```javascript
// 获取当前 session
const response = await fetch('http://localhost:3012/api/auth/session');
const session = await response.json();
console.log('Current Session:', session);
```

### 查看服务器日志

```bash
# 查看实时日志
tail -f logs/auth.log
tail -f logs/dashboard.log
tail -f logs/main.log

# 查看错误日志
grep -i error logs/*.log
```

---

## ⚠️ 常见问题

### 问题 1: Cookie 不共享（最常见）

**症状**：
- Auth 登录成功
- 但 Dashboard 和 Main 仍显示未登录

**排查**：
```
1. F12 → Application → Cookies
2. 检查 Cookie 的 Domain 字段
3. 如果是 "localhost" 而不是 ".localhost"
   → Cookie 只在当前站点有效
```

**解决**：
- 确认 `.env.local` 中的配置：
  ```
  NEXT_PUBLIC_COOKIE_DOMAIN=.localhost
  ```
- 注意前面的 **点** 很重要！

### 问题 2: 登录后立即失效

**症状**：
- 登录成功
- 几秒后又变成未登录

**排查**：
```javascript
// 浏览器控制台查看 Token 刷新
[Auth] onAuthStateChange event: TOKEN_REFRESHED
```

**可能原因**：
- Token 过期设置太短
- Supabase 配置问题

### 问题 3: CORS 错误

**症状**：
- 浏览器控制台显示 CORS 错误
- Cookie 无法设置

**解决**：
- 本地开发一般不会有 CORS 问题
- 如果出现，检查 Cookie 的 `SameSite` 设置

---

## 🎉 成功标准

你的 SSO 系统工作正常的标志：

✅ **一次登录，处处通行**
- 在 Auth 登录后，Dashboard 和 Main 自动识别

✅ **Cookie 正确共享**
- Domain 为 `.localhost`
- 所有站点都能读取到相同的 Cookie

✅ **状态实时同步**
- 在任意站点登出，其他站点也立即登出
- 刷新页面后状态保持

✅ **用户信息显示正确**
- 邮箱、头像正确显示
- 用户菜单功能正常

---

## 📞 需要帮助？

如果遇到问题：

1. **检查日志**：
   ```bash
   tail -50 logs/auth.log
   tail -50 logs/dashboard.log
   tail -50 logs/main.log
   ```

2. **重启服务**：
   ```bash
   ./stop-all.sh
   ./start-all.sh
   ```

3. **清除浏览器数据**：
   - F12 → Application → Storage → Clear site data
   - 或使用隐身模式

---

## 🚀 下一步

SSO 功能测试通过后，你可以：

1. **开发新功能**：
   - 添加用户 Profile 页面
   - 实现用户设置功能
   - 添加订阅管理

2. **准备部署**：
   - 参考 `docs/deployment/` 中的部署文档
   - 配置生产环境的域名和 Cookie

3. **扩展系统**：
   - 添加更多子站点
   - 实现更复杂的权限控制

---

**测试愉快！** 🎉

如果所有测试都通过，恭喜你！你的 SSO 单点登录系统已经成功运行！

---

**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
**版本**: v1.0
