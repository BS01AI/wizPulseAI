# Dispatch Board - WizPulseAI

> **更新时间**: 2026-04-05 (Loop A 第1轮完成)
> **管理者**: Cowork (PM层)
> **执行者**: Code (Claude Code CLI)

---

## 活跃 Loop

| Loop | DISPATCH | 频率 | 任务 | 状态 |
|------|----------|------|------|------|
| **A** | DISPATCH-021 | 每2小时 | DB 综合治理 | 🟢 ACTIVE |
| **B** | DISPATCH-022 | 每1小时 | 执行者巡检 | 🟢 ACTIVE |

---

## Loop A: DB 综合治理 (DISPATCH-021)

**任务文件**: `tasks/DISPATCH-021-db-governance.md`
**报告**: `results/DISPATCH-021-report-2026-04-05.md`

### 当前任务队列

| # | 优先级 | 任务 | 状态 | 说明 |
|---|--------|------|------|------|
| 1 | P0 | Migration 基线导出 (000_baseline.sql) | ⬜ TODO | 下轮执行 |
| 2 | P0 | ~~执行 016 migration~~ → 017 综合修复 | ✅ DONE | 发现10个BUG(原预期3个)，全部修复并验证 |
| 3 | P0 | Auth 注册流验证 | ✅ DONE | 链路断裂已修复: handle_new_auth_user schema/列名 |
| 4 | P1 | Credit deduct 竞态修复 | ⚠️ NEEDS_CODE | DB函数OK，TS代码需改为调用RPC |
| 5 | P1 | 旧 CreditService 删除 | ✅ IDENTIFIED | `lib/credits/` + `core/payment/credits/` 0引用 |
| 6 | P1 | 两库关系梳理 | ✅ DONE | 全4站点→同一库(lhofjwiqjqjtycnhliga) |
| 7 | - | 发现模式 | 🔄 进行中 | 已发现3个新问题 |

### 本轮新发现

| # | 优先级 | 问题 | 状态 |
|---|--------|------|------|
| N1 | P1 | CHECK约束与TS常量不对齐(缺trial/deduction) | ✅ FIXED |
| N2 | P2 | `public.deduct_credits` 废弃函数待DROP | ⬜ TODO |
| N3 | P2 | `wiz-saas-database` 项目未被使用，确认是否删除 | ⬜ NEEDS_HUMAN |

---

## Loop B: 执行者巡检 (DISPATCH-022)

**任务文件**: `tasks/DISPATCH-022-executor-patrol.md`
**报告目录**: `results/DISPATCH-022-report-*.md`

### 待办 (来自 Loop A)

| # | 来源 | 任务 | 优先级 |
|---|------|------|--------|
| 1 | P1-1 | `CreditsService.deductCredits` 改为调用 DB RPC | 高 |
| 2 | P1-2 | 删除 `src/lib/credits/` + `src/core/payment/credits/` | 中 |
| 3 | DB变更 | 017 migration 后 TypeScript 类型可能需要更新 | 高 |

### 巡检清单

| # | 巡检项 | 优先级 | 上次状态 | 说明 |
|---|--------|--------|----------|------|
| 1 | DB变更代码跟进 | 最高 | ⬜ | 017 migration 待跟进 |
| 2 | TS类型一致性 | 高 | ⬜ | database.types.ts vs 实际schema |
| 3 | API路由安全审查 | 高 | ⬜ | 认证/错误泄露/输入验证 |
| 4 | 环境变量硬编码 | 中 | ⬜ | 扫描4站点 |
| 5 | 死代码清理 | 中 | ⬜ | `lib/credits` + `core/payment/credits` |
| 6 | 四站Build验证 | 中 | ⬜ | fashion/dashboard/main/auth |
| 7 | SEO/链接有效性 | 低 | ⬜ | metadata/robots/sitemap |
| 8 | 国际化完整性 | 低 | ⬜ | 4语言翻译key一致性 |

---

## 关键信息速查

### Supabase 项目
| 项目 | ID | 区域 | 连接站点 | 状态 |
|------|-----|------|---------|------|
| wizPulseAI-Local | `lhofjwiqjqjtycnhliga` | ap-northeast-1 | 全4站点 | ACTIVE |
| wiz-saas-database | `ekeslmpugrljwarowtyy` | ap-southeast-1 | **无** | ACTIVE (疑似废弃) |

### Schema 架构
| Schema | 内容 | 表数 |
|--------|------|------|
| public | users, subscriptions, stripe_*, config, share/referral, ai_products, audit | 12 |
| fashion | user_credits, credit_transactions, credit_packages, photos, analyses, generated_outfits, user_profiles, storage_quotas, personalization_options | 9 |

### 4站点目录
| 站点 | 目录 | 端口 |
|------|------|------|
| Auth | `auth-wizpulseai-com/` | 3011 |
| Dashboard | `db-wizPulseAI-com/` | 3012 |
| Main | `wizPulseAI-com/` | 3010 |
| Fashion | `fashion-wizpulseai-com/` | 3013 |

### Migration 文件
- ~~`016_fix_share_reward_column_names.sql`~~ — 被017取代
- `017_comprehensive_function_fix.sql` — ✅ 已执行 (2026-04-05)

---

## 通信协议

- **Code → Cowork**: 报告写入 `results/` 目录
- **Cowork → Code**: 任务写入 `tasks/` 目录，更新本文件
- **紧急问题**: Code 可以直接修复 P0 问题，事后报告
- **需要人工**: 标记 `NEEDS_HUMAN`，等待 bobo 确认
