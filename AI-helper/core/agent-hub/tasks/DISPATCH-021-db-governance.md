# DISPATCH-021: DB 综合治理 (Loop A - 每2小时)

> **执行者**: Code (Claude Code CLI)
> **频率**: 每2小时启动一次
> **模式**: 有已知问题先修 → 修完后自动进入"发现新问题"模式
> **Supabase项目**: wizPulseAI-Local (ID: `lhofjwiqjqjtycnhliga`)
> **MCP工具**: `mcp__supabase__execute_sql`, `mcp__supabase__list_tables`, `mcp__supabase__list_migrations`

---

## 执行协议

每次启动时：
1. 读取本文件，检查各任务状态
2. 从第一个未完成的 P0 开始执行
3. 每完成一个任务，立即更新本文件的状态标记
4. 所有已知问题完成后，进入"发现模式"
5. 产出报告写入 `AI-helper/core/agent-hub/results/DISPATCH-021-report-{日期}.md`

---

## P0 任务 (必须先做)

### P0-1: Migration 基线导出 ⬜

**目标**: 导出 wizPulseAI-Local 的完整 DDL 作为 `000_baseline.sql`

**步骤**:
1. 用 `mcp__supabase__execute_sql` 查询所有 public schema 的表结构:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```
2. 对每张表导出完整 DDL (列定义、约束、索引、RLS):
   ```sql
   -- 列信息
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = '{表名}';
   
   -- 索引
   SELECT indexname, indexdef FROM pg_indexes
   WHERE schemaname = 'public' AND tablename = '{表名}';
   
   -- RLS策略
   SELECT policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies WHERE schemaname = 'public' AND tablename = '{表名}';
   
   -- 函数
   SELECT proname, prosrc FROM pg_proc p
   JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname = 'public';
   
   -- 触发器
   SELECT trigger_name, event_manipulation, action_statement
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   ```
3. 整合输出到 `fashion-wizpulseai-com/supabase/migrations/000_baseline.sql`
4. 在文件头部加注释: `-- Baseline snapshot from wizPulseAI-Local, exported {日期}`
5. 用 `mcp__supabase__list_migrations` 确认 migration 系统状态

**验收**: 文件存在且包含所有表的完整DDL，能独立重建整个 public schema。

---

### P0-2: 执行 016 Migration ⬜

**目标**: 修复 `give_share_reward` / `give_signup_reward` / `give_purchase_reward` 三个函数的列名错误

**前置检查**:
1. 先确认当前线上函数是否仍有错误列名:
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'give_share_reward';
   ```
   检查是否包含 `credits` (应为 `balance`) 或 `transaction_type` (应为 `type`)

2. 确认 `user_credits` 表的实际列名:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'user_credits' AND table_schema = 'public';
   ```

3. 确认 `credit_transactions` 表的实际列名:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'credit_transactions' AND table_schema = 'public';
   ```

**执行**:
- 如果确认有错误 → 执行 `fashion-wizpulseai-com/supabase/migrations/016_fix_share_reward_column_names.sql` 的内容
- 用 `mcp__supabase__execute_sql` 逐个函数执行 CREATE OR REPLACE
- 每个函数执行后验证:
  ```sql
  SELECT prosrc FROM pg_proc WHERE proname = '{函数名}';
  ```

**验收**: 三个函数的 `prosrc` 中不再包含 `credits` 列名（应为 `balance`），不再包含 `transaction_type`（应为 `type`）。

---

### P0-3: Auth 注册流验证 ⬜

**目标**: 追踪完整链路 `auth.users signup → trigger → public.users → user_credits`

**步骤**:
1. 查询注册触发器:
   ```sql
   SELECT trigger_name, event_manipulation, action_statement
   FROM information_schema.triggers
   WHERE event_object_schema = 'auth' OR event_object_table = 'users';
   ```

2. 查询 `handle_new_user` 或类似触发器函数:
   ```sql
   SELECT proname, prosrc FROM pg_proc
   WHERE proname LIKE '%new_user%' OR proname LIKE '%handle%user%';
   ```

3. 检查触发器是否会:
   - 在 `public.users` 创建记录 ✅/❌
   - 在 `user_credits` 初始化积分 ✅/❌
   - 正确传递 `user_id` ✅/❌

4. 如果链路断裂，记录具体断在哪一步
5. 检查是否有 `initialize_user_credits` 函数:
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'initialize_user_credits';
   ```

**验收**: 文档化完整链路，标记每一步是否正常工作。如有断裂，给出修复SQL。

---

## P1 任务 (P0全部完成后执行)

### P1-1: Credit Deduct 竞态检查 ⬜

**目标**: 检查积分扣除是否为原子操作

**步骤**:
1. 在代码中搜索 `deduct` 或 `balance` 相关的扣除逻辑:
   - `fashion-wizpulseai-com/src/` 下搜索
   - 检查是否使用了 DB 函数还是应用层 read-then-write

2. 如果是应用层 read-then-write 模式（不安全）:
   ```typescript
   // 危险模式:
   const balance = await getBalance(userId);  // 读
   if (balance >= cost) {
     await updateBalance(userId, balance - cost);  // 写
   }
   ```
   → 改为 DB 原子操作:
   ```sql
   CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
   RETURNS BOOLEAN AS $$
   BEGIN
     UPDATE user_credits
     SET balance = balance - p_amount, updated_at = NOW()
     WHERE user_id = p_user_id AND balance >= p_amount;
     RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

3. 如果已经是原子操作 → 记录确认，标记完成

**验收**: 积分扣除为原子操作（DB层面），不存在竞态条件。

---

### P1-2: 旧 CreditService 死代码清理 ⬜

**目标**: 找到并删除 import 为 0 的旧 CreditService

**步骤**:
1. 搜索所有 CreditService 相关文件:
   ```bash
   grep -r "CreditService\|credit.service\|credits/service" fashion-wizpulseai-com/src/ --include="*.ts" --include="*.tsx"
   ```
2. 检查每个文件的被引用次数
3. import 为 0 的文件 → 标记为可删除
4. 确认删除后 build 不报错

**验收**: 无未使用的 CreditService 文件残留。

---

### P1-3: 两库关系梳理 ⬜

**目标**: 确认 Main/Dashboard/Auth/Fashion 各连的是哪个 Supabase 项目

**步骤**:
1. 检查每个站点的 `.env.local` 或 `.env`:
   ```
   auth-wizpulseai-com/.env.local
   db-wizPulseAI-com/.env.local
   wizPulseAI-com/.env.local
   fashion-wizpulseai-com/.env.local
   ```
2. 提取 `NEXT_PUBLIC_SUPABASE_URL` 中的项目ID
3. 对比两个活跃项目:
   - `lhofjwiqjqjtycnhliga` (wizPulseAI-Local, ap-northeast-1)
   - `ekeslmpugrljwarowtyy` (wiz-saas-database, ap-southeast-1)
4. 产出映射表

**验收**: 清晰的站点→数据库映射文档。

---

## 发现模式 (所有已知问题完成后自动进入)

当所有 P0/P1 任务标记为 ✅ 后，自动执行以下巡检:

### 巡检项目

1. **Schema 一致性**
   - TypeScript 类型 (`database.types.ts`) 是否和实际 DB schema 一致
   - 是否有表缺少 `updated_at` 触发器
   - 是否有 `created_at` 没有 `DEFAULT NOW()`

2. **缺失索引**
   - 外键字段是否都有索引
   - 高频查询字段（`user_id`, `app_source`）是否有索引
   - 复合查询是否有复合索引

3. **RLS 漏洞**
   - 是否有表忘记启用 RLS
   - 是否有表有 RLS 但策略不完整（缺 INSERT/UPDATE/DELETE）
   - SECURITY DEFINER 函数是否过多或权限过大

4. **函数健康检查**
   - 所有 public 函数是否可正常调用
   - 是否有引用了不存在的列/表的函数
   - 是否有过时的函数（不再被代码调用）

5. **数据完整性**
   - 外键约束是否完整
   - 是否有孤儿数据
   - 枚举/CHECK 约束是否和代码中的常量一致

### 发现新问题后

1. 评估严重程度 (P0/P1/P2)
2. 如果是 P0 → 直接修复
3. 如果是 P1/P2 → 记录到报告，等下个 Loop 或人工确认
4. 修复后必须验证

---

## 状态追踪

| 任务 | 优先级 | 状态 | 完成时间 | 备注 |
|------|--------|------|----------|------|
| Migration 基线导出 | P0 | ⬜ | - | - |
| 执行 016 migration | P0 | ⬜ | - | SQL已准备好 |
| Auth 注册流验证 | P0 | ⬜ | - | - |
| Credit deduct 竞态 | P1 | ⬜ | - | - |
| 旧 CreditService 清理 | P1 | ⬜ | - | - |
| 两库关系梳理 | P1 | ⬜ | - | - |
| 发现模式巡检 | - | ⬜ | - | P0/P1完成后 |
