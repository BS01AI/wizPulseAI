# WizPulseAI 快速测试清单

快速测试3个站点的 SSO 认证功能（30分钟完成）

---

## 🚀 测试前准备

### 1. 启动所有站点
```bash
./start-all.sh
```

等待启动完成后，确认3个站点都能访问：
- 🔐 Auth: http://localhost:3011
- 📊 Dashboard: http://localhost:3012
- 🌐 Main: http://localhost:3010

### 2. 准备测试账号

**邮件账号**:
- 邮箱: `test@example.com`
- 密码: `TestPass123!`

**Google 账号**:
- 使用您的真实 Google 账号

---

## ✅ 快速测试流程（5个核心场景）

### 场景1: 邮件注册和登录（5分钟）

```
1. 打开 http://localhost:3011/auth/sign-up
2. 输入新邮箱和密码，点击 Sign Up
3. 检查邮件，点击验证链接（或 Supabase 手动验证）
4. 验证成功后自动登录 ✅
5. 检查 Dashboard/Main 是否也已登录 ✅
```

**检查点**:
- [ ] 注册成功
- [ ] 邮件验证完成
- [ ] 自动登录
- [ ] 3个站点都已登录

---

### 场景2: SSO 跨站点登录（3分钟）

```
1. 在 Auth 站点登录（如果未登录）
2. 新标签页打开 http://localhost:3012 (Dashboard)
   → ✅ 应该自动识别已登录，无需再输入密码
3. 新标签页打开 http://localhost:3010 (Main)
   → ✅ 应该自动识别已登录
```

**检查点**:
- [ ] Dashboard 自动登录
- [ ] Main 自动登录
- [ ] 不需要重复输入密码

---

### 场景3: 单点登出（2分钟）

```
1. 确保3个站点都已登录
2. 在 Dashboard 点击右上角用户菜单 → Logout
3. 刷新 Auth 站点（http://localhost:3011）
   → ✅ 应该显示未登录
4. 刷新 Main 站点（http://localhost:3010）
   → ✅ 应该显示未登录
```

**检查点**:
- [ ] Dashboard 已登出
- [ ] Auth 已登出
- [ ] Main 已登出
- [ ] 一处登出，全部登出 ✅

---

### 场景4: 密码修改（仅邮件用户，5分钟）

```
1. 登录邮件注册的账号
2. 访问密码修改页面（Dashboard 或 Auth）
3. 输入当前密码和新密码，提交
4. 登出所有站点
5. 使用新密码重新登录
   → ✅ 应该登录成功
```

**检查点**:
- [ ] 密码修改成功
- [ ] 旧密码无法登录
- [ ] 新密码可以登录

**注意**: Google OAuth 用户没有此功能 ❌

---

### 场景5: Google OAuth 登录（5分钟）

```
1. 访问 http://localhost:3011/auth/sign-in
2. 点击 "Sign in with Google" 按钮
3. 选择 Google 账号，授权
4. 自动返回应用，登录成功 ✅
5. 检查 Dashboard 和 Main 是否也已登录 ✅
6. 在任意站点登出
7. 再次点击 Google 登录
   → ✅ 应该快速登录（无需再次授权）
```

**检查点**:
- [ ] Google 授权成功
- [ ] 自动登录
- [ ] 3个站点都已登录
- [ ] 二次登录更快速
- [ ] 没有密码修改功能 ❌（这是正确的）

---

## 🎯 核心差异对比

### 邮件注册 vs Google OAuth

| 功能 | 邮件注册 | Google OAuth |
|------|---------|--------------|
| 注册 | 手动填表 | 一键授权 ✅ |
| 修改密码 | ✅ 支持 | ❌ 不支持（正确）|
| 忘记密码 | ✅ 支持 | ❌ 不支持（正确）|
| SSO | ✅ 支持 | ✅ 支持 |
| 单点登出 | ✅ 支持 | ✅ 支持 |
| 跨站点跳转 | ✅ 支持 | ✅ 支持 |

**总结**:
- Google OAuth 在"登录方式"不同（无密码）
- 其他功能（SSO、登出、跨站点）完全相同 ✅

---

## 🐛 常见问题排查

### 问题1: 跨站点不能自动登录

**症状**: 在 Auth 登录后，打开 Dashboard 还要再登录

**排查**:
```bash
# 1. 检查 Cookie 域配置
# F12 → Application → Cookies
# 应该看到 .localhost 域的 Cookie

# 2. 检查环境变量
cat auth-wizpulseai-com/.env.local | grep COOKIE_DOMAIN
cat db-wizPulseAI-com/.env.local | grep COOKIE_DOMAIN
cat wizPulseAI-com/.env.local | grep COOKIE_DOMAIN

# 都应该是: NEXT_PUBLIC_COOKIE_DOMAIN=.localhost
```

**解决**: 确保所有 .env.local 的 COOKIE_DOMAIN 都是 `.localhost`

---

### 问题2: 登出后 Cookie 未清除

**症状**: 点击 Logout 后，Cookie 还在

**排查**:
```bash
# F12 → Application → Cookies
# 检查 .localhost 域的 Cookie 是否还存在
```

**解决**:
1. 手动删除 Cookie
2. 清除浏览器缓存
3. 使用隐身模式测试

---

### 问题3: Service Worker 缓存问题

**症状**: 页面加载失败，显示 ERR_FAILED

**解决**:
1. F12 → Application → Service Workers → Unregister
2. Clear site data
3. 硬刷新（Cmd+Shift+R）
4. 使用隐身模式测试

---

## 📝 测试结果记录

完成每个场景后，在下方打勾：

### 邮件注册用户测试

- [ ] ✅ 场景1: 邮件注册和登录
- [ ] ✅ 场景2: SSO 跨站点登录
- [ ] ✅ 场景3: 单点登出
- [ ] ✅ 场景4: 密码修改
- [ ] ✅ 场景5: 跨站点跳转

### Google OAuth 用户测试

- [ ] ✅ 场景5: Google 登录
- [ ] ✅ 场景2: SSO 跨站点登录
- [ ] ✅ 场景3: 单点登出
- [ ] ✅ 场景5: 二次快速登录
- [ ] ❌ 场景4: 密码修改（无此功能，正确）

---

## 🎯 测试完成标准

所有核心场景通过：
- ✅ 邮件注册和登录正常
- ✅ Google OAuth 登录正常
- ✅ SSO 跨站点自动登录
- ✅ 单点登出全部生效
- ✅ 密码管理功能正常（仅邮件用户）

**测试通过** = 10个核心检查点全部 ✅

---

## 📚 完整测试文档

需要更详细的测试用例，请查看：
- [SSO_AUTHENTICATION_TEST.md](./SSO_AUTHENTICATION_TEST.md) - 完整测试用例（15个）
- [LOCAL_TEST_GUIDE.md](../LOCAL_TEST_GUIDE.md) - 本地测试环境搭建

---

测试完成时间: ___________
测试人员: ___________
测试结果: [ ] 全部通过 [ ] 部分失败
