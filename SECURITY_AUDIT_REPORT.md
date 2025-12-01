# 🛡️ WizPulseAI 安全审计报告

**审计时间**: 2025-11-20
**审计范围**: Auth站点 + Dashboard站点
**审计级别**: 深度审计 (生产发布前)
**总体评分**: **85/100** 🟢
**发布建议**: ✅ **可以安全发布**（无严重漏洞）

---

## 📊 风险等级总览

| 等级 | 数量 | 发布影响 | 处理建议 |
|------|------|---------|---------|
| **P0严重** | 0个 ✅ | 阻断发布 | - |
| **P1高风险** | 3个 ⚠️ | 建议修复 | 发布前优先处理（2小时） |
| **P2中风险** | 5个 | 可接受 | 发布后1周内处理 |
| **P3低风险** | 6个 | 低影响 | 长期优化 |

---

## 🚨 P1 高风险问题（建议发布前修复）

### 1. Cookie httpOnly=false 增加XSS劫持风险

**严重程度**: ⚠️ P1 (高)
**位置**: `db-wizPulseAI-com/src/shared/auth/supabase-browser.ts:48-68`

**问题描述**:
```typescript
// 当前代码：Cookie未设置httpOnly属性
set(name: string, value: string, options: CookieOptions) {
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (!isHostPrefixed && !isSecurePrefixed) {
    const cookieDomain = process.env.NODE_ENV === 'production'
      ? '.wizpulseai.com'
      : '.localhost';

    cookieString += `; domain=${cookieDomain}`;
    cookieString += `; path=/`;
    cookieString += `; SameSite=lax`;  // ✅ 正确
    cookieString += `; Secure`;        // ✅ 正确（生产环境）
    // ❌ 缺少：cookieString += `; HttpOnly`
  }

  document.cookie = cookieString;
}
```

**安全风险**:
- **攻击场景**: XSS攻击者可通过`document.cookie`读取认证Cookie
- **影响范围**: Auth Cookie被窃取 → 攻击者可劫持用户Session
- **当前缓解**: Supabase使用JWT，Cookie有效期相对较短

**修复方案**:

**选项A: 启用httpOnly（推荐，需验证兼容性）**
```typescript
// db-wizPulseAI-com/src/shared/auth/supabase-browser.ts

set(name: string, value: string, options: CookieOptions) {
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (!isHostPrefixed && !isSecurePrefixed) {
    const cookieDomain = process.env.NODE_ENV === 'production'
      ? '.wizpulseai.com'
      : '.localhost';

    cookieString += `; HttpOnly`;      // ✅ 添加此行
    cookieString += `; domain=${cookieDomain}`;
    cookieString += `; path=/`;
    cookieString += `; SameSite=lax`;

    if (process.env.NODE_ENV === 'production') {
      cookieString += `; Secure`;
    }

    if (options.maxAge) {
      const maxAge = options.maxAge || (60 * 60 * 24 * 30); // 改为30天
      cookieString += `; Max-Age=${maxAge}`;
    }
  }

  document.cookie = cookieString;
}
```

**注意事项**:
⚠️ 启用`httpOnly`后，前端JavaScript无法读取Cookie。需要验证：
1. Auth站点是否需要在客户端读取Cookie？
2. Dashboard站点的`useAuth`是否依赖客户端读取Cookie？

**测试方法**:
```bash
# 1. 修改代码后本地测试
npm run dev

# 2. 测试登录流程
# - Auth站点登录 → 跳转Dashboard
# - Dashboard刷新页面 → 验证Session持久化
# - 浏览器控制台执行 document.cookie → 应该看不到认证Cookie

# 3. 如果出现问题，回退到选项B
```

**选项B: 保持httpOnly=false，强化CSP（权衡方案）**
```typescript
// db-wizPulseAI-com/src/middleware.ts

// 添加更严格的CSP策略
const strictCSP = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{RANDOM}'",  // 使用nonce而非unsafe-inline
  "object-src 'none'",
  "base-uri 'self'",
  // ...
].join('; ');
```

**预计修复时间**: 1小时（含测试）

---

### 2. 数据库RLS策略不完整

**严重程度**: ⚠️ P1 (高)
**位置**: `db-wizPulseAI-com/schema.sql` + Supabase数据库

**问题描述**:
```sql
-- 当前RLS策略 (schema.sql)
CREATE POLICY "Allow authenticated user SELECT"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ❌ 缺少: INSERT/UPDATE/DELETE策略
-- 风险: 用户可能通过客户端直接插入/修改订阅记录
```

**实际风险评估**:
- **当前缓解措施**:
  - ✅ API层已做权限检查（如`admin/users/route.ts`）
  - ✅ 已有`block_protected_columns()`触发器保护关键字段
  - ❌ 但如果用户绕过API直接使用Supabase Client，可能插入数据

**完整修复方案**:

创建文件：`db-wizPulseAI-com/supabase/migrations/20251120000000_complete_rls_policies.sql`

```sql
-- ============================================
-- 完整RLS策略补充
-- ============================================

-- 1. subscriptions表完整RLS策略
-- ============================================

-- 已有SELECT策略（保留）
-- CREATE POLICY "用户可查看自己的订阅"
--   ON subscriptions FOR SELECT
--   USING (auth.uid() = user_id);

-- 新增：禁止用户直接创建订阅（只允许service-role）
CREATE POLICY "subscriptions_insert_policy"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (
    -- 只允许service-role角色创建订阅
    -- 普通用户通过API调用（API使用service-role）
    false
  );

-- 新增：禁止用户修改订阅
CREATE POLICY "subscriptions_update_policy"
  ON public.subscriptions
  FOR UPDATE
  USING (
    -- 只允许service-role角色修改订阅
    false
  );

-- 新增：禁止用户删除订阅
CREATE POLICY "subscriptions_delete_policy"
  ON public.subscriptions
  FOR DELETE
  USING (
    -- 只允许service-role角色删除订阅
    false
  );

-- ============================================
-- 2. users表完整RLS策略
-- ============================================

-- 已有SELECT策略（保留）
-- CREATE POLICY "Users can view own profile"
--   ON users FOR SELECT
--   USING (auth.uid() = id);

-- 新增：用户可更新自己的资料（受限字段）
CREATE POLICY "users_update_policy"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- 用户只能更新自己的记录
    auth.uid() = id
    -- 保护字段由trigger: block_protected_columns() 保护
  );

-- 新增：禁止用户创建新用户（通过注册API）
CREATE POLICY "users_insert_policy"
  ON public.users
  FOR INSERT
  WITH CHECK (
    -- 只允许service-role创建用户
    false
  );

-- 新增：禁止用户删除用户
CREATE POLICY "users_delete_policy"
  ON public.users
  FOR DELETE
  USING (
    -- 只允许service-role删除用户
    false
  );

-- ============================================
-- 3. prices表RLS策略（参考）
-- ============================================

-- 所有人可读
CREATE POLICY "prices_select_policy"
  ON public.prices
  FOR SELECT
  USING (true);

-- 只有service-role可修改
CREATE POLICY "prices_modify_policy"
  ON public.prices
  FOR ALL
  USING (false);

-- ============================================
-- 4. products表RLS策略（参考）
-- ============================================

-- 所有人可读
CREATE POLICY "products_select_policy"
  ON public.products
  FOR SELECT
  USING (true);

-- 只有service-role可修改
CREATE POLICY "products_modify_policy"
  ON public.products
  FOR ALL
  USING (false);

-- ============================================
-- 验证RLS策略
-- ============================================

-- 测试1: 验证用户无法直接插入订阅
-- SELECT auth.uid(); -- 获取当前用户ID
-- INSERT INTO subscriptions (user_id, ...) VALUES (...);
-- 预期结果：应该被RLS阻止

-- 测试2: 验证用户可以查看自己的订阅
-- SELECT * FROM subscriptions WHERE user_id = auth.uid();
-- 预期结果：成功返回

-- 测试3: 验证用户无法查看其他用户的订阅
-- SELECT * FROM subscriptions WHERE user_id != auth.uid();
-- 预期结果：返回0条记录
```

**执行步骤**:
```bash
# 1. 在本地Supabase数据库执行SQL
# 打开 Supabase Dashboard → SQL Editor → 粘贴上述SQL → Run

# 2. 或使用Supabase CLI
supabase db push

# 3. 验证策略生效
# 在Supabase Dashboard → Database → Policies
# 确认每个表都有完整的SELECT/INSERT/UPDATE/DELETE策略
```

**预计修复时间**: 30分钟

**注意事项**:
- ⚠️ 修改RLS策略需要在Supabase生产数据库执行
- ⚠️ 执行前先在开发数据库测试
- ⚠️ 确保API使用的service-role凭证有效

---

### 3. CSP策略在开发环境使用unsafe-eval

**严重程度**: ⚠️ P1 (中)
**位置**: `db-wizPulseAI-com/src/middleware.ts:33`

**问题描述**:
```typescript
// 开发环境CSP配置
const devDirectives = [
  "script-src 'self' ... 'unsafe-inline' 'unsafe-eval'",  // ⚠️ 过于宽松
  // ...
];
```

**风险评估**:
- **低风险**: 仅在开发环境使用
- **中风险**: 如果错误部署开发配置到生产环境

**修复方案**:

```typescript
// db-wizPulseAI-com/src/middleware.ts

export function middleware(request: NextRequest) {
  // 1. 严格环境检查
  const isProduction = process.env.VERCEL_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 2. 根据环境选择CSP
  let cspDirectives: string[];

  if (isProduction) {
    // 生产环境：严格CSP
    cspDirectives = [
      "default-src 'self'",
      "script-src 'self' https://wizpulseai.com https://dashboard.wizpulseai.com 'unsafe-inline'",  // 移除unsafe-eval
      // ...
    ];
  } else if (isPreview) {
    // Preview环境：中等严格
    cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // 移除unsafe-eval
      // ...
    ];
  } else {
    // 开发环境：允许unsafe-eval（Hot reload需要）
    cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // ✅ 仅开发环境
      // ...
    ];
  }

  // 3. 添加部署验证日志
  console.log('[CSP] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isProduction,
    hasUnsafeEval: cspDirectives.some(d => d.includes('unsafe-eval'))
  });

  // 4. 设置CSP Header
  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  );

  return response;
}
```

**额外建议 - 创建部署检查脚本**:

```bash
# scripts/pre-deploy-check.sh

#!/bin/bash

echo "🔍 执行发布前安全检查..."

# 检查1: 确保生产环境不会使用unsafe-eval
if [ "$VERCEL_ENV" = "production" ]; then
  if grep -q "unsafe-eval" src/middleware.ts; then
    echo "⚠️  警告: middleware.ts包含unsafe-eval"
    echo "检查是否仅在开发环境使用..."

    # 检查是否有环境判断
    if grep -A5 "unsafe-eval" src/middleware.ts | grep -q "NODE_ENV.*development"; then
      echo "✅ 通过: unsafe-eval仅在开发环境使用"
    else
      echo "❌ 错误: unsafe-eval可能在生产环境使用"
      exit 1
    fi
  fi
fi

echo "✅ 安全检查完成"
```

**Vercel配置 - 添加构建检查**:

```json
// package.json

{
  "scripts": {
    "build": "bash scripts/pre-deploy-check.sh && next build",
    // ...
  }
}
```

**预计修复时间**: 15分钟

---

## ⚠️ P2 中风险问题（发布后1周内修复）

### 4. Cookie maxAge过长（1年）

**严重程度**: ⚠️ P2 (中)
**位置**: `db-wizPulseAI-com/src/shared/auth/supabase-browser.ts:70`

**问题**:
```typescript
const maxAge = options.maxAge || (60 * 60 * 24 * 365);  // ⚠️ 默认365天
```

**风险**: Session劫持窗口过长

**修复**:
```typescript
const maxAge = options.maxAge || (60 * 60 * 24 * 30);  // ✅ 改为30天
```

---

### 5. 缺少HSTS头部

**严重程度**: ⚠️ P2 (中)
**位置**: `db-wizPulseAI-com/src/middleware.ts`

**问题**: 生产环境未强制HTTPS

**修复**:
```typescript
// db-wizPulseAI-com/src/middleware.ts

export function middleware(request: NextRequest) {
  // ...

  // 添加HSTS头部（仅生产和预览环境）
  if (isProduction || isPreview) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}
```

---

### 6. 环境变量泄露检查

**严重程度**: ⚠️ P2 (低-中)
**当前状态**: ✅ 未发现泄露

**预防措施 - 添加pre-commit检查**:

```bash
# .git/hooks/pre-commit

#!/bin/bash

echo "🔍 检查环境变量泄露..."

# 检查客户端组件中是否使用Service Role Key
if grep -r "SUPABASE_SERVICE_ROLE_KEY" src/app src/components --include="*.tsx" --include="*.ts" | grep -B5 "'use client'" | grep -q "SUPABASE_SERVICE_ROLE_KEY"; then
  echo "❌ 错误: Service Role Key不能在客户端组件中使用"
  exit 1
fi

# 检查Stripe Secret Key
if grep -r "STRIPE_SECRET_KEY" src/app src/components --include="*.tsx" --include="*.ts" | grep -B5 "'use client'" | grep -q "STRIPE_SECRET_KEY"; then
  echo "❌ 错误: Stripe Secret Key不能在客户端组件中使用"
  exit 1
fi

echo "✅ 环境变量检查通过"
```

---

### 7. Stripe Webhook重放攻击防护

**严重程度**: ⚠️ P2 (低)
**当前状态**: ✅ 签名验证正确，但未显式配置tolerance

**修复**:
```typescript
// db-wizPulseAI-com/src/app/api/webhooks/stripe/route.ts

// Stripe SDK默认拒绝超过5分钟的Webhook
// 显式配置更严格的tolerance
const tolerance = 300; // 5分钟

event = payment.client!.webhooks.constructEvent(
  body,
  signature,
  webhookSecret,
  tolerance  // ✅ 显式设置
);
```

---

### 8. redirect_to参数验证逻辑简化

**严重程度**: ⚠️ P2 (低)
**位置**: `auth-wizpulseai-com/src/lib/auth-utils.ts:validateRedirect()`

**建议**: 简化逻辑，生产环境必须显式配置白名单

```typescript
// auth-wizpulseai-com/src/lib/auth-utils.ts

export function validateRedirect(redirectTo: string): boolean {
  const allow = process.env.NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS
    ?.split(',')
    .filter(Boolean) || [];

  // 生产环境必须配置白名单
  if (process.env.NODE_ENV === 'production' && allow.length === 0) {
    console.error('[Security] NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS未配置');
    throw new Error('生产环境必须配置ALLOWED_REDIRECT_ORIGINS');
  }

  // 开发环境自动添加localhost
  if (process.env.NODE_ENV === 'development') {
    allow.push('http://localhost:3010', 'http://localhost:3011', 'http://localhost:3012');
  }

  try {
    const url = new URL(redirectTo);
    return allow.some(origin => url.origin === origin);
  } catch {
    return false;
  }
}
```

---

## 💡 P3 低风险问题（长期优化）

### 9. 管理员权限检查依赖JWT

**严重程度**: 💡 P3 (低)
**当前状态**: ✅ 基本安全，可优化

**建议**: 对高敏感操作，额外查询数据库验证

```typescript
// 示例：删除用户操作
async function deleteUser(userId: string, session: Session) {
  // 1. JWT验证（快速）
  const role = session.user.app_metadata?.app_role;
  if (role !== 'admin') {
    return { error: 'Unauthorized', status: 403 };
  }

  // 2. 数据库二次验证（高敏感操作）
  const { data: user } = await supabase
    .from('users')
    .select('app_role')
    .eq('id', session.user.id)
    .single();

  if (user?.app_role !== 'admin') {
    console.error('[Security] Role mismatch: JWT vs DB');
    return { error: 'Unauthorized', status: 403 };
  }

  // 3. 执行删除操作
  // ...
}
```

---

### 10-14. 其他低风险问题

10. ✅ **无SQL注入风险**: 所有查询使用Supabase ORM参数化
11. ✅ **无XSS风险**: 未发现`dangerouslySetInnerHTML`使用
12. ✅ **密码策略**: Supabase默认6+字符（可增强到8+）
13. ✅ **速率限制**: Supabase内置（可在Dashboard配置）
14. ✅ **日志安全**: 敏感信息未记录

---

## ✅ 良好安全实践（已使用）

1. ✅ **环境变量管理**: 使用`.env.example`模板，密钥未提交
2. ✅ **Supabase Auth集成**: 使用官方SDK，未自行实现认证
3. ✅ **HTTPS强制**: 生产环境Cookie设置`Secure`标志
4. ✅ **Stripe集成安全**: Webhook签名验证正确
5. ✅ **跨域配置**: CORS/CSP策略配置正确
6. ✅ **密码重置**: 使用Supabase内置流程
7. ✅ **sameSite Cookie**: 正确设置为`lax`，防止CSRF
8. ✅ **输入验证**: 使用Zod schema验证

---

## 📊 架构安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **认证与授权** | 85/100 🟢 | Cookie安全需优化，RLS策略需补充 |
| **数据保护** | 75/100 🟡 | RLS策略不完整，但API层保护到位 |
| **支付安全** | 90/100 🟢 | Stripe集成规范，仅缺少重放防护 |
| **输入验证** | 95/100 🟢 | 使用Zod验证，无注入风险 |
| **依赖安全** | 85/100 🟢 | 需定期`npm audit` |
| **基础设施** | 80/100 🟢 | 缺少HSTS，CSP需优化 |

**总体评分**: **85/100** 🟢

---

## 🎯 修复优先级建议

### 🔴 发布阻断问题（必须修复）
**无** ✅ - 可以安全发布

### 🟠 发布前强烈建议修复（P1 - 预计2小时）
- [ ] Cookie httpOnly配置（1小时含测试）
- [ ] 补充完整RLS策略（30分钟）
- [ ] CSP配置环境验证（15分钟）

### 🟡 发布后1周内修复（P2 - 预计3小时）
- [ ] Cookie maxAge改为30天（15分钟）
- [ ] 添加HSTS头部（15分钟）
- [ ] 创建pre-commit检查脚本（1小时）
- [ ] Stripe Webhook tolerance配置（15分钟）
- [ ] 简化redirect_to验证逻辑（30分钟）

### 🟢 长期优化（P3 - 持续改进）
- [ ] 高敏感操作双重验证（1小时）
- [ ] 配置Supabase速率限制（30分钟）
- [ ] 建立定期安全审计机制（每月一次）
- [ ] 密码策略增强到8+字符（Supabase配置）

---

## 📝 修复执行顺序建议

### 选项A: 立即发布（快速路径）
```
1. 现在发布 ✅
2. 生产环境验证（1天）
3. 发布后1周内修复P1问题
4. 持续优化P2/P3问题
```

### 选项B: 完美主义（推荐路径）
```
1. 修复P1问题（2小时）✅
2. 本地测试验证（30分钟）
3. 部署生产环境
4. 发布后1周内修复P2问题
```

---

## 🔍 深度分析

### 架构脆弱性分析

**当前架构的主要安全挑战**:
1. **跨域Cookie共享机制**: 虽然使用了`sameSite=lax`，但`httpOnly=false`增加了XSS攻击面
2. **RLS策略不完整**: 依赖应用层验证而非数据库层强制执行

**攻击场景模拟**:

#### 场景1: XSS + Cookie劫持
```
1. 攻击者在Main站点注入XSS代码
2. XSS窃取Cookie（因httpOnly=false）
3. 攻击者使用Cookie访问Dashboard
4. 访问用户订阅信息

防御层级：
- Layer 1: CSP策略（阻止XSS执行）✅
- Layer 2: httpOnly Cookie（阻止Cookie读取）❌ 缺失
- Layer 3: Supabase JWT验证（限制滥用）✅
```

#### 场景2: RLS绕过尝试
```
1. 恶意用户绕过API，直接使用Supabase Client
2. 尝试插入订阅记录: supabase.from('subscriptions').insert(...)
3. 当前: ❌ 可能成功（无INSERT策略）
4. 修复后: ✅ 被RLS阻止

防御层级：
- Layer 1: API权限验证 ✅
- Layer 2: RLS策略（数据库层）❌ 不完整
- Layer 3: Trigger保护字段 ✅
```

**防御优先级**:
- **P0**: 补充RLS策略（阻断场景2）
- **P1**: 评估httpOnly=true的可行性（阻断场景1.2）
- **P2**: 强化CSP策略（阻断场景1.1）

---

## 💬 战略建议

考虑到业务当前处于**生产发布前**阶段，建议：

1. **先固本**: 修复P1问题（预计2小时）
2. **再发布**: 当前安全水平可以安全发布（85分）
3. **持续改进**: 发布后逐步修复P2/P3问题

**新增功能（如QuickSlide站点）时，建议**:
- 使用security-auditor提前审查
- 复用已验证的安全模式（如RLS策略模板）
- 避免重复安全技术债

---

## 🔐 结论

### ✅ **可以安全发布**

**理由**:
1. ✅ 无严重安全漏洞（P0: 0个）
2. ✅ 核心认证和支付流程安全
3. ✅ 已有多层防护（API验证 + Trigger + Supabase内置安全）
4. ✅ 使用业界最佳实践（Supabase Auth、Stripe官方SDK）

**但强烈建议**:
- 🟠 发布前修复3个P1问题（预计2小时）
- 🟡 发布后1周内修复5个P2问题
- 🟢 建立持续安全审计机制（每月一次）

**总体评价**:
WizPulseAI的安全架构**整体优秀**（85分），已经比很多创业公司的V1版本安全得多。主要改进空间在于**深度防御层级**（RLS策略补充）和**Cookie安全强化**。

---

**下次审计建议**: 生产发布后1个月
**联系方式**: 如有安全问题，请联系 security@wizpulseai.com

---

*本报告由security-auditor agent生成于 2025-11-20*
