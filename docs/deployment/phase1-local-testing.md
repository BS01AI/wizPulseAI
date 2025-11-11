# Phase 1: 本地环境测试

## 📋 阶段概述

**目标**: 确认三个站点能在本地正常启动并完成 SSO 登录流程

**预计时间**: 2小时

**优先级**: 🔴 P0（必须今天完成）

## ✅ 前置条件检查

在开始之前，确认以下条件已满足：

```bash
# 1. Node.js 版本检查
node -v  # 应该 >= v18.0.0

# 2. 检查三个站点目录存在
ls -la auth-wizpulseai-com/
ls -la db-wizPulseAI-com/
ls -la wizPulseAI-com/

# 3. 检查依赖已安装
cd auth-wizpulseai-com && npm list next
cd ../db-wizPulseAI-com && npm list next
cd ../wizPulseAI-com && npm list next
cd ..

# 4. 检查环境变量文件存在
ls -la auth-wizpulseai-com/.env.local
ls -la db-wizPulseAI-com/.env.local
ls -la wizPulseAI-com/.env.local
```

## 📝 任务清单

- [ ] 任务 1.1: 清除浏览器缓存和 Service Worker
- [ ] 任务 1.2: 验证三个站点正常启动
- [ ] 任务 1.3: 测试 SSO 登录流程
- [ ] 任务 1.4: 测试跨站点状态同步

---

## 任务 1.1: 清除浏览器缓存 🧹

### 问题背景
根据 2025-10-29 的诊断，之前遇到的 `ERR_FAILED` 问题是由 Service Worker 缓存冲突导致的。

### 操作步骤

#### 方法 1: 使用隐身模式（推荐，最简单）
```
1. 打开 Chrome
2. 按 Cmd+Shift+N (Mac) 或 Ctrl+Shift+N (Windows)
3. 直接在隐身窗口中测试
```

#### 方法 2: 清除 Service Worker
```
1. 打开 Chrome DevTools (F12 或 Cmd+Option+I)
2. 切换到 Application 标签
3. 左侧菜单选择 Service Workers
4. 点击每个 Service Worker 旁边的 "Unregister" 按钮
5. 点击 "Clear site data" 按钮
```

#### 方法 3: 完全清除站点数据
```
1. Chrome DevTools (F12)
2. Application → Storage
3. 点击 "Clear site data"
4. 勾选所有选项：
   - Local and session storage
   - IndexedDB
   - Web SQL
   - Cookies
   - Cache storage
5. 点击 "Clear site data" 按钮
6. 硬刷新页面 (Cmd+Shift+R)
```

### 验证清除成功
```
1. DevTools → Application → Service Workers
   - 应该显示 "No service workers"
2. DevTools → Application → Cookies
   - localhost 相关的 Cookie 应该被清空
```

---

## 任务 1.2: 验证三个站点启动 🚀

### 步骤 1: 检查当前运行状态
```bash
# 查看是否有 Next.js 进程在运行
ps aux | grep "next dev"

# 查看端口占用情况
lsof -i :3000  # Main
lsof -i :3001  # Auth
lsof -i :3002  # Dashboard
```

### 步骤 2: 启动所有站点
```bash
# 方法 1: 使用启动脚本（推荐）
./start-all.sh

# 方法 2: 手动启动各站点
# 打开 3 个终端窗口分别运行：
cd auth-wizpulseai-com && npm run dev -- -p 3001
cd db-wizPulseAI-com && npm run dev -- -p 3002
cd wizPulseAI-com && npm run dev
```

### 步骤 3: 验证启动成功

#### 3.1 检查进程
```bash
ps aux | grep "next dev"
# 应该看到 3 个 next dev 进程
```

#### 3.2 检查日志文件
```bash
# 查看最新日志
tail -f logs/auth.log
tail -f logs/dashboard.log
tail -f logs/main.log
```

预期日志内容：
```
✓ Ready in Xms
○ Compiling / ...
✓ Compiled / in XXms
```

#### 3.3 curl 健康检查
```bash
# Auth 站点
curl -I http://localhost:3001
# 预期: HTTP/1.1 200 OK

# Dashboard 站点
curl -I http://localhost:3002
# 预期: HTTP/1.1 200 OK 或 302 (重定向到登录)

# Main 站点
curl -I http://localhost:3000
# 预期: HTTP/1.1 200 OK
```

### 步骤 4: 浏览器访问验证

| 站点 | URL | 预期显示 |
|-----|-----|---------|
| Auth | http://localhost:3001 | 显示重定向或空白（需要访问 /auth） |
| Auth | http://localhost:3001/auth | 显示登录/注册表单 |
| Dashboard | http://localhost:3002 | 未登录则重定向到 Auth |
| Main | http://localhost:3000 | 显示主页，右上角有登录按钮 |

### ❌ 常见问题处理

**问题 1: 端口被占用**
```bash
# 查看占用端口的进程
lsof -i :3001

# 强制停止
./stop-all.sh

# 或手动 kill
kill -9 <PID>
```

**问题 2: 依赖错误**
```bash
# 重新安装依赖
cd auth-wizpulseai-com && rm -rf node_modules && npm install
cd ../db-wizPulseAI-com && rm -rf node_modules && npm install
cd ../wizPulseAI-com && rm -rf node_modules && npm install
```

**问题 3: 环境变量缺失**
```bash
# 检查环境变量文件
cat auth-wizpulseai-com/.env.local
cat db-wizPulseAI-com/.env.local
cat wizPulseAI-com/.env.local

# 参考模板文件
cat docs/deployment/env-templates.md
```

---

## 任务 1.3: 测试 SSO 登录流程 🔐

### 完整测试流程

#### 场景 1: 从 Main 站点登录

```
Step 1: 访问主站
- 打开浏览器（隐身模式）
- 访问 http://localhost:3000
- 验证：右上角显示 "Sign In" 或 "登录" 按钮

Step 2: 点击登录
- 点击 "Sign In" 按钮
- 验证：URL 跳转到 http://localhost:3001/auth?...
- 验证：显示登录表单（Email/Password 输入框）

Step 3: 输入凭据登录
- 输入邮箱和密码
- 点击 "Sign In" 按钮
- 验证：登录成功后跳转

Step 4: 验证跳转到 Dashboard
- 验证：URL 变为 http://localhost:3002
- 验证：显示用户信息（头像、邮箱）
- 验证：能看到仪表盘内容

Step 5: 返回主站验证状态
- 手动访问 http://localhost:3000
- 验证：右上角显示用户头像和邮箱
- 验证：点击头像显示下拉菜单（Dashboard、Logout 等）
```

#### 场景 2: Google OAuth 登录

```
Step 1: 点击 Google 登录
- 在登录页面点击 "Sign in with Google"
- 验证：弹出 Google 授权窗口

Step 2: 授权登录
- 选择 Google 账号
- 授权应用访问
- 验证：回调到 http://localhost:3001/api/auth/callback

Step 3: 验证登录成功
- 验证：自动跳转到 Dashboard
- 验证：显示 Google 账号的头像和邮箱
```

### Cookie 验证

打开 Chrome DevTools (F12) → Application → Cookies → localhost:3001

**检查以下 Cookie 存在**：
| Cookie 名称 | 值示例 | Domain | Path | Secure | SameSite |
|-----------|--------|--------|------|--------|----------|
| sb-lhofj...access-token | eyJhb... | localhost | / | ✓ | Lax |
| sb-lhofj...refresh-token | v1:... | localhost | / | ✓ | Lax |
| NEXT_LOCALE | ja/zh/en | .localhost | / | - | Lax |

**注意**：本地开发时，Cookie domain 应该是 `localhost` 或 `.localhost`

### Session 数据验证

在 Dashboard 页面，打开浏览器控制台，运行：
```javascript
// 方法 1: 检查 Supabase session
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('User:', data.session?.user)
```

预期输出：
```json
{
  "access_token": "eyJhb...",
  "refresh_token": "v1:...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "app_role": "user",
      "avatar_url": "..."
    }
  }
}
```

---

## 任务 1.4: 测试跨站点状态同步 🔄

### 测试场景 1: 登录状态同步

```
1. 确保已在 Dashboard 登录
2. 打开新标签页，访问 http://localhost:3000 (Main站)
3. 验证：Main站右上角显示已登录状态
4. 打开新标签页，访问 http://localhost:3001/auth
5. 验证：Auth站应该已经识别登录状态
```

### 测试场景 2: 登出状态同步

```
Step 1: 在 Dashboard 登出
- 访问 http://localhost:3002
- 点击用户头像 → "Sign out" 或 "登出"
- 验证：返回登录页面或主页

Step 2: 验证 Main 站状态
- 刷新 http://localhost:3000
- 验证：右上角应该显示 "Sign In" 按钮（未登录状态）

Step 3: 验证 Auth 站状态
- 访问 http://localhost:3001/auth
- 验证：显示登录表单（未登录状态）

Step 4: 验证 Cookie 清除
- DevTools → Application → Cookies
- 验证：sb-*access-token 和 sb-*refresh-token 已被删除
```

### 测试场景 3: Session 刷新同步

```
1. 登录后等待 5 分钟
2. 在 Main 站点进行操作（刷新页面）
3. 验证：Session 自动刷新，保持登录状态
4. 切换到 Dashboard
5. 验证：Dashboard 也保持登录状态
```

---

## ✅ 验收标准

### 必须通过的检查项

- [ ] **启动检查**
  - [ ] 三个站点都能正常启动
  - [ ] 没有端口冲突
  - [ ] 没有编译错误
  - [ ] 日志显示 "Ready" 状态

- [ ] **访问检查**
  - [ ] 三个站点都能在浏览器中访问
  - [ ] 没有显示 ERR_FAILED 错误
  - [ ] 页面能正常渲染

- [ ] **登录检查**
  - [ ] 能从 Main 站点跳转到 Auth 站点
  - [ ] 能成功登录（邮箱密码或 Google）
  - [ ] 登录后能跳转到 Dashboard
  - [ ] Dashboard 显示用户信息

- [ ] **Cookie 检查**
  - [ ] Cookie 正确设置在 localhost 域
  - [ ] access_token 和 refresh_token 都存在
  - [ ] Cookie 的 SameSite 和 Secure 属性正确

- [ ] **状态同步检查**
  - [ ] 登录后，三个站点都显示已登录
  - [ ] 登出后，三个站点都显示未登录
  - [ ] 刷新页面后状态保持

---

## 📊 测试记录表

| 测试项 | 预期结果 | 实际结果 | 状态 | 备注 |
|-------|---------|---------|-----|------|
| Auth 站点启动 | 正常启动 | | ⬜ | |
| Dashboard 站点启动 | 正常启动 | | ⬜ | |
| Main 站点启动 | 正常启动 | | ⬜ | |
| 浏览器访问 Auth | 显示登录表单 | | ⬜ | |
| 浏览器访问 Dashboard | 显示或重定向 | | ⬜ | |
| 浏览器访问 Main | 显示主页 | | ⬜ | |
| 邮箱密码登录 | 登录成功 | | ⬜ | |
| Google OAuth 登录 | 登录成功 | | ⬜ | |
| 登录后跳转 Dashboard | 显示用户信息 | | ⬜ | |
| Main 站显示登录状态 | 显示头像 | | ⬜ | |
| Cookie 设置 | 正确设置 | | ⬜ | |
| 登出功能 | 所有站点登出 | | ⬜ | |

---

## 🔧 故障排查

### 问题：浏览器显示白屏
**可能原因**：
1. 编译错误
2. JavaScript 错误
3. 依赖问题

**解决方法**：
```bash
# 1. 查看终端日志
tail -f logs/auth.log

# 2. 查看浏览器控制台
# F12 → Console 标签

# 3. 重新构建
npm run build
```

### 问题：Cookie 不生效
**可能原因**：
1. Domain 设置错误
2. SameSite 策略问题
3. 浏览器安全策略

**解决方法**：
```bash
# 检查 .env.local
cat auth-wizpulseai-com/.env.local | grep COOKIE

# 应该显示：
# NEXT_PUBLIC_COOKIE_DOMAIN=.localhost
```

### 问题：跳转后回不到原站点
**可能原因**：
1. redirect_to 参数丢失
2. URL 验证失败

**解决方法**：
```
1. 检查 URL 参数是否包含 redirect_to
2. 查看 Auth 站点的 redirect.ts 逻辑
3. 确认 isValidRedirectUrl 函数允许 localhost
```

---

## 📋 完成 Phase 1 后

### 输出物
- [ ] 测试记录表已填写
- [ ] 截图保存（登录成功、Cookie 设置等）
- [ ] 遇到的问题已记录

### 下一步
✅ Phase 1 完成后，继续 **Phase 2: 用户管理验证**

👉 [进入 Phase 2](phase2-user-management.md)

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
