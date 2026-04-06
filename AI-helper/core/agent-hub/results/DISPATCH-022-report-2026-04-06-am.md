# DISPATCH-022 巡检报告
- 时间: 2026-04-06 午前
- 触发: DB变更跟进 (017 migration)
- 耗时: ~15min

## 执行摘要
- 检查项: 3个 (DB跟进重点)
- 发现问题: 2个
- 已修复: 2个
- 需人工: 0个

## 详细完成

### [P0] CreditsService.deductCredits 竞态修复 ✅
- 文件: `src/domains/credits/services/credits.service.ts`
- 问题: read-then-write 模式，并发时可双扣或扣负
- 修复: 改为调用 `fashion.deduct_credits` DB RPC (FOR UPDATE 行级锁)
- 验证: TypeScript 编译通过 + Build 成功

### [P1] CreditsService.addCredits 原子化 ✅
- 文件: 同上
- 问题: 同样的 read-then-write 竞态
- 修复: 新建 `fashion.add_credits` DB 函数 + 代码改为 RPC 调用
- 验证: 同上

### [P1] 死代码删除 ✅
- 删除: `src/lib/credits/service.ts` (旧 CreditService, 0 imports)
- 删除: `src/core/payment/credits/` (旧 CreditsService 副本, 0 imports)
- 验证: 零编译错误

### [P2] 废弃函数清理 ✅
- DROP: `public.deduct_credits` (无 schema 前缀，不可用)
- 保留: `fashion.deduct_credits` (正确版本)

## 代码变更
- `src/domains/credits/services/credits.service.ts`: deductCredits → DB RPC, addCredits → DB RPC
- `src/lib/credits/` 删除
- `src/core/payment/credits/` 删除
- `supabase/migrations/017_comprehensive_function_fix.sql` 追加 add_credits + DROP + CHECK

## Build 验证
- `npx tsc --noEmit` ✅ 零错误
- `npm run build` ✅ 成功

## 下轮待办
- [ ] 完整巡检: API安全/环境变量/SEO/i18n
- [ ] P0-1: Migration 基线导出
