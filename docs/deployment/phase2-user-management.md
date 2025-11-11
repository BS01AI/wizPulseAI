# Phase 2: 用户管理功能验证

## 📋 阶段概述

**目标**: 验证用户管理和权限系统正常工作

**预计时间**: 4小时

**优先级**: 🟠 P1（1-2天内完成）

**前置条件**: Phase 1 已完成，三站点 SSO 登录正常

## ✅ 前置条件检查

```bash
# 1. 确认 Phase 1 已完成
# - 三个站点能正常启动 ✓
# - SSO 登录流程正常 ✓
# - 跨站点状态同步正常 ✓

# 2. 确认能访问 Supabase 项目
echo $NEXT_PUBLIC_SUPABASE_URL
# 应该显示: https://lhofjwiqjqjtycnhliga.supabase.co

# 3. 确认至少有一个测试账号
# 邮箱: test@example.com (或你自己的邮箱)
# 密码: (已知的测试密码)
```

## 📝 任务清单

- [ ] 任务 2.1: 验证 Supabase 数据库用户表结构
- [ ] 任务 2.2: 创建/配置管理员账号
- [ ] 任务 2.3: 测试 Dashboard 用户管理功能
- [ ] 任务 2.4: 验证角色权限系统
- [ ] 任务 2.5: 测试用户 CRUD 操作

---

## 任务 2.1: 验证数据库用户表结构 🗄️

### 使用 Supabase MCP 工具查询

我将使用 MCP 工具帮你检查数据库结构：

```bash
# 列出所有表
supabase list_tables

# 检查用户相关表
# 预期表：
# - auth.users (Supabase Auth 内置)
# - public.users (业务用户表)
# - public.profiles (用户配置表)
```

### 关键字段验证

#### auth.users 表（Supabase 内置）
```sql
-- 关键字段：
- id (uuid) - 用户唯一标识
- email (text) - 用户邮箱
- email_confirmed_at (timestamp) - 邮箱确认时间
- created_at (timestamp) - 创建时间
- user_metadata (jsonb) - 用户元数据
  - app_role: "admin" | "user" | "deleted"
  - avatar_url: string (Google OAuth 头像)
  - full_name: string
```

#### public.users 表（如果存在）
```sql
-- 预期字段：
- id (uuid) - 关联 auth.users.id
- email (text)
- app_role (text) - 权限角色
- created_at (timestamp)
- updated_at (timestamp)
```

### 手动检查（Supabase Dashboard）

```
1. 访问 https://supabase.com/dashboard
2. 选择项目: lhofjwiqjqjtycnhliga
3. 左侧菜单 → Table Editor
4. 查看表结构：
   - Authentication → Users
   - public → users (如果存在)
   - public → profiles (如果存在)
```

### 验收标准
- [ ] auth.users 表存在且有 user_metadata 字段
- [ ] user_metadata.app_role 字段能正常读写
- [ ] 至少有 1 个测试用户记录

---

## 任务 2.2: 创建/配置管理员账号 👤

### 方法 1: 通过 Supabase Dashboard（推荐）

```
Step 1: 进入 Authentication
- https://supabase.com/dashboard → 选择项目
- 左侧菜单 → Authentication → Users

Step 2: 查找或创建测试账号
- 如果已有测试账号，记录其 ID
- 如果没有，点击 "Add user" → Email → 创建新用户

Step 3: 设置为管理员
- 点击用户记录
- 找到 "Raw User Meta Data" 部分
- 编辑 JSON，添加或修改：
```

```json
{
  "app_role": "admin",
  "full_name": "Test Admin",
  "avatar_url": "https://..."
}
```

```
Step 4: 保存并验证
- 点击 "Save" 保存更改
- 重新查看，确认 app_role 为 "admin"
```

### 方法 2: 使用 Supabase SQL Editor

```sql
-- 更新现有用户为管理员
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{app_role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- 验证更新
SELECT
  id,
  email,
  raw_user_meta_data->>'app_role' as role,
  created_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

### 方法 3: 通过 Dashboard API（本地测试）

```bash
# 启动 Dashboard 站点
# 登录后，使用浏览器控制台执行：

fetch('/api/admin/users/[user-id]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_role: 'admin'
  })
})
```

### 验证管理员权限

```
1. 使用管理员账号登录 Dashboard
2. 访问 http://localhost:3002/dashboard/admin
3. 预期：能正常访问管理员页面
4. 如果被拒绝，检查：
   - user_metadata.app_role 是否为 "admin"
   - 权限检查逻辑是否正确
```

---

## 任务 2.3: 测试 Dashboard 用户管理功能 🎛️

### 访问用户管理页面

```
URL: http://localhost:3002/dashboard/admin/users

预期显示：
- 用户列表表格
- 列：邮箱、角色、创建时间、操作
- 分页控件
- 搜索/筛选功能
```

### 功能测试清单

#### 1. 查看用户列表
```
测试步骤：
1. 访问 /dashboard/admin/users
2. 查看用户列表

验证：
- [ ] 显示所有注册用户
- [ ] 显示正确的邮箱
- [ ] 显示正确的角色（admin/user）
- [ ] 显示创建时间
- [ ] 分页功能正常（如果用户超过10个）
```

#### 2. 查看用户详情
```
测试步骤：
1. 点击某个用户的 "View" 或 "详情" 按钮
2. 查看用户详细信息

验证：
- [ ] 显示完整的用户信息
- [ ] 显示订阅状态
- [ ] 显示使用记录
- [ ] 显示登录历史（如果有）
```

#### 3. 编辑用户角色
```
测试步骤：
1. 点击某个用户的 "Edit" 或 "编辑" 按钮
2. 修改角色从 "user" 改为 "admin"
3. 保存更改

验证：
- [ ] 角色下拉菜单显示所有选项
- [ ] 能成功保存更改
- [ ] 页面显示成功提示
- [ ] 列表中角色已更新
```

#### 4. 删除/禁用用户
```
测试步骤：
1. 点击某个用户的 "Delete" 或 "删除" 按钮
2. 确认删除操作

验证：
- [ ] 弹出确认对话框
- [ ] 确认后用户状态变为 "deleted"
- [ ] 该用户无法再登录
- [ ] 或者用户从列表中消失（软删除 vs 硬删除）
```

#### 5. 搜索用户
```
测试步骤：
1. 在搜索框输入邮箱关键词
2. 按回车或点击搜索按钮

验证：
- [ ] 显示匹配的用户
- [ ] 搜索大小写不敏感
- [ ] 支持部分匹配
```

#### 6. 筛选用户
```
测试步骤：
1. 使用角色筛选器（如果有）
2. 选择 "admin" 或 "user"

验证：
- [ ] 只显示对应角色的用户
- [ ] 筛选结果正确
```

---

## 任务 2.4: 验证角色权限系统 🔐

### 权限测试矩阵

| 功能 | admin | user | deleted | 未登录 |
|-----|-------|------|---------|--------|
| 访问 Dashboard 主页 | ✅ | ✅ | ❌ | ❌ |
| 访问 /dashboard/settings | ✅ | ✅ | ❌ | ❌ |
| 访问 /dashboard/billing | ✅ | ✅ | ❌ | ❌ |
| 访问 /dashboard/admin/* | ✅ | ❌ | ❌ | ❌ |
| 管理用户 | ✅ | ❌ | ❌ | ❌ |
| 管理产品 | ✅ | ❌ | ❌ | ❌ |
| 管理订阅 | ✅ | ❌ | ❌ | ❌ |
| 查看使用记录 | ✅ | ✅ (自己的) | ❌ | ❌ |

### 测试场景

#### 场景 1: Admin 用户完整权限
```
1. 使用 admin 账号登录
2. 访问所有 Dashboard 页面
3. 验证：
   - [ ] 能访问 /dashboard
   - [ ] 能访问 /dashboard/admin
   - [ ] 能访问 /dashboard/admin/users
   - [ ] 能访问 /dashboard/admin/products
   - [ ] 侧边栏显示 "Admin" 菜单项
```

#### 场景 2: User 用户受限权限
```
1. 创建一个普通 user 账号
2. 登录 Dashboard
3. 验证：
   - [ ] 能访问 /dashboard
   - [ ] 能访问 /dashboard/settings
   - [ ] 能访问 /dashboard/billing
   - [ ] 不能访问 /dashboard/admin（应返回 403 或重定向）
   - [ ] 侧边栏不显示 "Admin" 菜单项
```

#### 场景 3: Deleted 用户无权限
```
1. 将某个用户角色改为 "deleted"
2. 尝试登录
3. 验证：
   - [ ] 能登录成功（Auth 层面）
   - [ ] 但访问 Dashboard 被拒绝
   - [ ] 显示 "账号已停用" 或类似消息
```

#### 场景 4: 未登录用户重定向
```
1. 清除所有 Cookie
2. 直接访问 http://localhost:3002/dashboard
3. 验证：
   - [ ] 自动重定向到登录页面
   - [ ] 登录成功后返回原页面
```

### API 权限测试

使用浏览器控制台测试 API 权限：

#### 测试 Admin API（需要 admin 权限）
```javascript
// 以 user 身份登录后执行
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log)
// 预期：返回 403 Forbidden

// 以 admin 身份登录后执行
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log)
// 预期：返回用户列表
```

---

## 任务 2.5: 测试用户 CRUD 操作 ✏️

### Create: 创建新用户

#### 方法 1: 通过注册流程
```
1. 登出当前账号
2. 访问 http://localhost:3001/auth?view=sign_up
3. 输入新邮箱和密码
4. 注册成功

验证：
- [ ] 新用户出现在管理员用户列表
- [ ] 默认角色为 "user"
- [ ] 能正常登录
```

#### 方法 2: 通过 Admin 界面（如果有）
```
1. Admin 登录
2. 访问 /dashboard/admin/users
3. 点击 "Add User" 或 "添加用户"
4. 填写邮箱等信息
5. 保存

验证：
- [ ] 新用户创建成功
- [ ] 能设置初始角色
- [ ] 收到邮箱确认邮件
```

### Read: 查看用户信息

```
测试：
1. 在用户列表点击某个用户
2. 查看详细信息

验证：
- [ ] 显示所有用户字段
- [ ] 显示关联的订阅信息
- [ ] 显示使用统计
```

### Update: 更新用户信息

#### 更新角色
```
1. 选择一个 user
2. 将角色改为 admin
3. 保存

验证：
- [ ] 角色更新成功
- [ ] 该用户重新登录后有 admin 权限
```

#### 更新用户元数据
```
1. 编辑用户的 full_name
2. 保存

验证：
- [ ] 元数据更新成功
- [ ] 在 Dashboard 显示新名称
```

### Delete: 删除用户

#### 软删除（推荐）
```
1. 选择一个用户
2. 点击 "Deactivate" 或 "停用"
3. 确认操作

验证：
- [ ] 用户角色变为 "deleted"
- [ ] 该用户无法登录
- [ ] 数据仍保留在数据库
```

#### 硬删除（慎用）
```
1. 选择一个测试用户
2. 点击 "Delete Permanently"
3. 确认操作

验证：
- [ ] 用户从数据库完全删除
- [ ] 相关订阅记录处理正确
- [ ] 无法恢复
```

---

## ✅ 验收标准

### 数据库结构 ✓
- [ ] auth.users 表结构正确
- [ ] user_metadata.app_role 字段存在
- [ ] 至少有 1 个 admin 用户和 1 个 user 用户

### 用户管理功能 ✓
- [ ] 能查看完整的用户列表
- [ ] 能编辑用户角色
- [ ] 能查看用户详细信息
- [ ] 搜索和筛选功能正常

### 权限系统 ✓
- [ ] Admin 能访问所有管理页面
- [ ] User 不能访问管理页面
- [ ] Deleted 用户无法使用 Dashboard
- [ ] 未登录用户被正确重定向

### CRUD 操作 ✓
- [ ] 能创建新用户（通过注册）
- [ ] 能查看用户详情
- [ ] 能更新用户角色和信息
- [ ] 能删除/停用用户

---

## 📊 测试记录表

| 测试项 | 预期结果 | 实际结果 | 状态 | 备注 |
|-------|---------|---------|-----|------|
| 数据库表结构验证 | 表存在且字段正确 | | ⬜ | |
| 管理员账号创建 | 创建成功 | | ⬜ | |
| 访问用户列表 | 显示所有用户 | | ⬜ | |
| 查看用户详情 | 显示完整信息 | | ⬜ | |
| 编辑用户角色 | 更新成功 | | ⬜ | |
| Admin 访问管理页面 | 允许访问 | | ⬜ | |
| User 访问管理页面 | 拒绝访问(403) | | ⬜ | |
| Deleted 用户登录 | 拒绝使用 | | ⬜ | |
| 创建新用户 | 注册成功 | | ⬜ | |
| 软删除用户 | 状态变更 | | ⬜ | |

---

## 🔧 故障排查

### 问题：看不到管理员菜单
**可能原因**：
1. 角色设置错误
2. 前端权限检查失败
3. Session 未刷新

**解决方法**：
```bash
# 1. 验证数据库角色
# Supabase Dashboard → Authentication → Users
# 检查 user_metadata.app_role

# 2. 清除缓存重新登录
# 浏览器: 清除 Cookie → 重新登录

# 3. 检查代码逻辑
# Dashboard 站点 useAuth.tsx
# 确认 user?.user_metadata?.app_role === 'admin'
```

### 问题：API 返回 403 Forbidden
**可能原因**：
1. 角色检查逻辑错误
2. Session 不包含角色信息
3. RLS 策略限制

**解决方法**：
```javascript
// 浏览器控制台调试
const { data } = await supabase.auth.getSession()
console.log('Role:', data.session?.user?.user_metadata?.app_role)
```

### 问题：用户列表显示为空
**可能原因**：
1. 数据库查询失败
2. RLS 策略阻止
3. API 路由错误

**解决方法**：
```bash
# 检查网络请求
# F12 → Network → 查看 /api/admin/users 请求
# 检查响应状态和内容
```

---

## 📋 完成 Phase 2 后

### 输出物
- [ ] 测试记录表已完整填写
- [ ] 截图保存（用户列表、权限测试等）
- [ ] 至少有 1 个 admin 和 2 个 user 测试账号
- [ ] 问题列表（如果有）

### 确认清单
- [ ] 用户管理功能完全正常
- [ ] 权限系统按预期工作
- [ ] 所有角色测试通过
- [ ] CRUD 操作无误

### 下一步
✅ Phase 2 完成后，继续 **Phase 3: 部署准备**

👉 [进入 Phase 3](phase3-deployment-prep.md)

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
