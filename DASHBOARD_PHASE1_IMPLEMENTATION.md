# Dashboard Phase 1: 数据库实施指南

**创建日期**: 2025-11-20
**状态**: Ready to Execute
**预计时间**: 1-2小时

---

## ✅ 已完成的工作

### 1. 创建了4个数据库迁移文件

#### 📦 `20251120_create_ai_products.sql`
**AI产品定义表**
- 管理独立子域的AI产品（app1, app2, app3等）
- 支持产品代码、子域名、权限要求
- 配额配置（关联到features）
- 示例数据：QuickSlide, CodeSpark, ChatBot

**关键字段**：
- `code`: 产品代码（quickslide, codespark等）
- `subdomain`: 子域名（app1, app2等）
- `required_product_id`: 需要的订阅套餐
- `quota_config`: 配额配置JSON

#### 🔐 `20251120_create_resource_permissions.sql`
**资源权限控制表（2个表）**

**table 1: resource_permissions** - 权限定义
- 支持多种资源类型：article, article_category, ai_product
- 访问次数限制：monthly_access_limit, daily_access_limit
- 公开/私有控制

**table 2: resource_access_logs** - 访问记录
- 追踪用户访问次数
- 支持月度/日度统计
- 用于配额检查

**示例配置**：
```
✅ 公开文章：所有人可访问
✅ 登录文章：免费用户每月5篇
✅ Pro文章：需要Pro套餐
✅ 高级教程分类：整个分类需要Pro
```

#### 🔑 `20251120_create_api_keys.sql`
**API密钥管理表（2个表）**

**table 1: api_keys** - 密钥定义
- 用户创建和管理API密钥
- 权限配置：允许的产品和功能
- 速率限制：per-minute / per-day
- 格式：`wpa_xxxxxxxx...`

**table 2: api_key_usage** - 使用记录
- 追踪API请求
- 速率限制检查
- 使用统计

#### 📝 `20251120_create_audit_logs.sql`
**审计日志表**
- 记录管理员操作
- 自动审计users表变更
- 数据保留策略（默认1年）

---

## 🚀 执行步骤

### Step 1: 执行数据库迁移

**在Supabase Dashboard中执行**：

1. 登录 Supabase Dashboard
2. 进入你的项目 (spf-demo-dev 或其他)
3. 点击 **SQL Editor**
4. 按顺序执行4个SQL文件：

```sql
-- 1. 执行 ai_products 表
\i supabase/migrations/20251120_create_ai_products.sql

-- 2. 执行 resource_permissions 表
\i supabase/migrations/20251120_create_resource_permissions.sql

-- 3. 执行 api_keys 表
\i supabase/migrations/20251120_create_api_keys.sql

-- 4. 执行 audit_logs 表
\i supabase/migrations/20251120_create_audit_logs.sql
```

**或者使用Supabase CLI**：
```bash
cd db-wizPulseAI-com

# 推送所有迁移到远程数据库
supabase db push

# 或者逐个执行
npx supabase db push --file supabase/migrations/20251120_create_ai_products.sql
npx supabase db push --file supabase/migrations/20251120_create_resource_permissions.sql
npx supabase db push --file supabase/migrations/20251120_create_api_keys.sql
npx supabase db push --file supabase/migrations/20251120_create_audit_logs.sql
```

---

### Step 2: 生成TypeScript类型

执行完迁移后，生成最新的TypeScript类型定义：

```bash
cd db-wizPulseAI-com

# 生成类型
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/supabase.types.ts

# 验证类型文件
cat src/types/supabase.types.ts | grep -A 5 "ai_products"
```

**预期输出**：
```typescript
ai_products: {
  Row: {
    id: string
    code: string
    name: string
    subdomain: string | null
    ...
  }
}
```

---

### Step 3: 更新现有产品配置

由于我们添加了示例AI产品，需要关联到Stripe产品：

```sql
-- 获取Pro套餐的product_id
SELECT id, name FROM products WHERE name ILIKE '%pro%';
-- 假设结果是: pro_plan_id = 'abc-123-def'

-- 更新QuickSlide和CodeSpark，设置为需要Pro套餐
UPDATE ai_products
SET required_product_id = 'abc-123-def'
WHERE code IN ('quickslide', 'codespark');

-- 验证
SELECT code, name, required_product_id FROM ai_products;
```

---

### Step 4: 为AI产品创建功能配额

需要在`features`表中为AI产品创建对应的配额项：

```sql
-- 为QuickSlide创建配额功能
INSERT INTO features (code, name, description, monthly_limit, unit, is_public) VALUES
  ('quickslide_generations', 'QuickSlide PPT生成', '每月可生成的PPT数量', 5, '次', false);

-- 为CodeSpark创建配额功能
INSERT INTO features (code, name, description, monthly_limit, unit, is_public) VALUES
  ('codespark_generations', 'CodeSpark 代码生成', '每月可生成的代码次数', 100, '次', false);

-- 为ChatBot创建配额功能
INSERT INTO features (code, name, description, monthly_limit, unit, is_public) VALUES
  ('chatbot_messages', 'ChatBot 对话消息', '每月可发送的对话消息数', 1000, '条', false);

-- 验证
SELECT code, name, monthly_limit, unit FROM features
WHERE code IN ('quickslide_generations', 'codespark_generations', 'chatbot_messages');
```

---

### Step 5: 配置套餐功能关联

将功能关联到Stripe产品套餐：

```sql
-- 获取产品ID
SELECT id, name FROM products;
-- 假设：
-- free_plan_id = 'xxx-free'
-- pro_plan_id = 'xxx-pro'

-- 获取功能ID
SELECT id, code FROM features
WHERE code IN ('quickslide_generations', 'codespark_generations', 'chatbot_messages');

-- 为Free Plan配置基础配额
INSERT INTO plan_features (product_id, feature_id, monthly_quota, is_public) VALUES
  ('xxx-free', 'quickslide_feature_id', 2, true),    -- 免费用户每月2次QuickSlide
  ('xxx-free', 'chatbot_feature_id', 100, true);     -- 免费用户每月100条ChatBot消息

-- 为Pro Plan配置高级配额
INSERT INTO plan_features (product_id, feature_id, monthly_quota, is_public) VALUES
  ('xxx-pro', 'quickslide_feature_id', 50, true),    -- Pro用户每月50次QuickSlide
  ('xxx-pro', 'codespark_feature_id', 500, true),    -- Pro用户每月500次CodeSpark
  ('xxx-pro', 'chatbot_feature_id', NULL, true);     -- Pro用户无限制ChatBot消息

-- 验证
SELECT
  p.name as product_name,
  f.name as feature_name,
  pf.monthly_quota
FROM plan_features pf
JOIN products p ON p.id = pf.product_id
JOIN features f ON f.id = pf.feature_id
ORDER BY p.name, f.name;
```

---

## ✅ 验证检查清单

执行完成后，请验证以下内容：

### 数据库表
- [ ] `ai_products` 表已创建，有3条示例数据
- [ ] `resource_permissions` 表已创建，有6条示例数据
- [ ] `resource_access_logs` 表已创建
- [ ] `api_keys` 表已创建
- [ ] `api_key_usage` 表已创建
- [ ] `audit_logs` 表已创建

### 数据验证
- [ ] AI产品已关联到正确的订阅套餐
- [ ] features表中有对应的配额功能
- [ ] plan_features表中有正确的配额配置

### 类型生成
- [ ] `supabase.types.ts` 包含新表的类型定义
- [ ] TypeScript编译无错误

### RLS策略
- [ ] 普通用户可以查看激活的AI产品
- [ ] 普通用户只能管理自己的API密钥
- [ ] 管理员可以查看所有数据

---

## 🔍 测试查询

### 查询用户可访问的AI产品
```sql
-- 假设用户ID为 'user_123'，订阅了Pro套餐
SELECT
  ap.code,
  ap.name,
  ap.subdomain,
  ap.product_url,
  p.name as required_plan
FROM ai_products ap
LEFT JOIN products p ON p.id = ap.required_product_id
WHERE ap.is_active = true
  AND (
    ap.required_product_id IS NULL  -- 免费产品
    OR EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN prices pr ON pr.id = s.price_id
      WHERE s.user_id = 'user_123'
        AND s.status = 'active'
        AND pr.product_id = ap.required_product_id
    )
  );
```

### 查询用户本月文章访问次数
```sql
SELECT
  resource_id,
  COUNT(*) as access_count
FROM resource_access_logs
WHERE user_id = 'user_123'
  AND resource_type = 'article'
  AND access_month = to_char(NOW(), 'YYYY-MM')
GROUP BY resource_id;
```

### 查询用户的API密钥
```sql
SELECT
  id,
  key_name,
  key_prefix,
  is_active,
  last_used_at,
  created_at
FROM api_keys
WHERE user_id = 'user_123'
ORDER BY created_at DESC;
```

---

## 🎯 下一步（Phase 2）

数据库准备完成后，下一步是：

1. **权限系统实现**（2-3天）
   - [ ] Middleware权限检查
   - [ ] `checkResourceAccess()` 函数
   - [ ] `requireAdmin()` 函数
   - [ ] `<AdminGuard>` 组件

2. **用户Dashboard开发**（3-4天）
   - [ ] 概览页面（使用统计）
   - [ ] 订阅管理页面
   - [ ] AI产品访问页面
   - [ ] API密钥管理页面

---

## 📚 相关文档

- [DASHBOARD_ARCHITECTURE_DESIGN.md](./DASHBOARD_ARCHITECTURE_DESIGN.md) - 完整架构设计
- [数据库迁移文件目录](./db-wizPulseAI-com/supabase/migrations/)

---

## ⚠️ 重要提醒

1. **备份数据**：执行迁移前，建议备份现有数据
2. **测试环境**：建议先在测试环境执行，验证无误后再应用到生产环境
3. **Stripe产品ID**：需要手动更新`required_product_id`关联到真实的Stripe产品
4. **功能配额**：需要根据实际业务需求调整配额数值

---

**准备好执行了吗？还是有什么疑问？** 🚀
