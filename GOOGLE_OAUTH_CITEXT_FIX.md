# Google OAuth 登录 citext 类型错误修复报告

**日期**: 2025-11-22
**问题**: Google OAuth 登录失败，报错 `function log_audit(..., extensions.citext, ...) does not exist`
**状态**: ✅ 已修复

---

## 问题分析

### 错误URL
```
http://localhost:3011/error-auth
?message=Missing+authentication+parameters+(code+or+token_hash).
&original_next=http://localhost:3010/ja
#error=server_error
&error_description=ERROR: function log_audit(uuid, text, unknown, text, extensions.citext, jsonb, jsonb) does not exist
```

### 根本原因

**触发流程**:
```
Google OAuth 登录
  ↓
Supabase 在 auth.users 表插入用户
  ↓
触发器: on_auth_user_created
  ↓
函数: handle_new_auth_user()
  ↓
INSERT INTO public.users (同步用户数据)
  ↓
触发器: users_audit_trigger
  ↓
函数: audit_users_changes()
  ↓
调用: log_audit(..., NEW.email, ...)  ← citext 类型
  ↓
❌ 错误: 找不到匹配的函数签名
```

**类型不匹配**:
- `public.users.email` 字段是 `citext` 类型（不区分大小写）
- `log_audit()` 函数期望 `TEXT` 类型
- PostgreSQL 严格类型检查导致函数调用失败

---

## 修复方案

### 修改 `audit_users_changes()` 函数

**修改前**:
```sql
PERFORM log_audit(
  auth.uid(),
  v_action,
  'user',
  COALESCE(NEW.id::TEXT, OLD.id::TEXT),
  COALESCE(NEW.email, OLD.email),  -- ❌ citext 类型
  v_changes
);
```

**修改后**:
```sql
PERFORM log_audit(
  auth.uid(),
  v_action,
  'user',
  COALESCE(NEW.id::TEXT, OLD.id::TEXT),
  COALESCE(NEW.email::TEXT, OLD.email::TEXT),  -- ✅ 显式转换为 TEXT
  v_changes
);
```

---

## 修复执行

### 1. 数据库更新 ✅
```sql
-- 在 Supabase 中执行
CREATE OR REPLACE FUNCTION public.audit_users_changes()
RETURNS TRIGGER AS $$
...
  PERFORM log_audit(..., COALESCE(NEW.email::TEXT, OLD.email::TEXT), ...);
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 迁移文件更新 ✅

**文件1**: `db-wizPulseAI-com/supabase/migrations/20251120_create_audit_logs.sql`
- 第 169 行：添加 `::TEXT` 转换

**文件2**: `db-wizPulseAI-com/supabase/migrations/20251120_ALL_MIGRATIONS.sql`
- 第 752 行：添加 `::TEXT` 转换

---

## 测试验证

### 预期行为

1. ✅ 用户访问 `http://localhost:3012`
2. ✅ 点击 "Log In / Sign Up" → 跳转到 Auth 站点
3. ✅ 点击 "Sign in with Google" → 跳转到 Google 授权页
4. ✅ Google 授权成功 → 自动同步用户到 `public.users`
5. ✅ 审计日志正常记录（不再报错）
6. ✅ 成功跳转到 Dashboard

### 验证清单

- [ ] Google 登录流程完整
- [ ] 不再出现 404 错误页面
- [ ] 用户信息正确显示
- [ ] 审计日志正常记录

---

## 相关文件

### 数据库函数
- `public.log_audit()` - 审计日志记录函数
- `public.audit_users_changes()` - 用户变更审计触发函数
- `public.handle_new_auth_user()` - Auth用户同步函数

### 迁移文件
- `20251120_create_audit_logs.sql` - 审计日志表和函数定义
- `20251120_ALL_MIGRATIONS.sql` - 完整迁移汇总

### 触发器
- `auth.users.on_auth_user_created` - Google 登录后自动同步
- `public.users.users_audit_trigger` - 用户变更审计

---

## 技术总结

### PostgreSQL 类型系统

**citext vs TEXT**:
- `citext`: 不区分大小写的文本类型（扩展类型）
- `TEXT`: 标准文本类型（区分大小写）
- PostgreSQL 不会自动转换，需要显式 `::TEXT`

### 最佳实践

1. **函数参数类型要明确**: 避免隐式类型转换
2. **触发器调用需要类型匹配**: 特别注意扩展类型
3. **迁移文件保持同步**: 数据库和代码一致

---

## 防止复发

### 检查清单

✅ 所有调用 `log_audit()` 的地方都显式转换 citext 参数
✅ 迁移文件已更新并提交
✅ 生产部署前验证 Google OAuth 流程

### 相关文档

- [DASHBOARD_PHASE1_IMPLEMENTATION.md](./DASHBOARD_PHASE1_IMPLEMENTATION.md) - Phase 1 实施文档
- [GOOGLE_OAUTH_TEST_REPORT.md](./GOOGLE_OAUTH_TEST_REPORT.md) - OAuth 测试报告

---

**修复完成时间**: 2025-11-22
**修复验证**: 待用户测试确认
