# Magicoord AI 限制体系检讨报告

**日期**: 2026-06-10
**方式**: 全量盘点 7 个 AI/高成本入口 + 精读两套限流器 + 线上实测（service role / 用户态 JWT）
**一句话结论**: **设计是对的，但部署是空的。** 分层防线模型合理、积分扣点这道硬防线质量高；但频率限流与预算帽两道软防线**在当前线上环境全部失效**——限流表没建、Redis 没配，导致免费聊天完全裸奔、付费 AI 无频率上限。公开前必须修。

---

## 一、设计评估：防线模型本身是合理的

每个 AI 入口理论上有 6 层防线，从外到内：

```
认证 → 积分扣点 → 频率限流 → 每日预算帽 → 输入/输出约束 → 失败降级
```

**做得好的部分（无需返工）**：
- **积分扣点（硬防线）**：先扣后用、`consume_magicoord_feature` 服务端权威定价、clientActionId 幂等、AI 失败按 usage 幂等退款。线上 8 项测试已验证。这是当前唯一真正生效的成本闸门。
- **输入约束**：图片 ≤10MB + MIME 白名单、聊天 content 1–4000 字、persona/role/locale 白名单、参数白名单。
- **输出约束**：聊天 `maxOutputTokens=256` + 超 500 字截断、analyze/edit `maxDuration=60s`、角色标签注入剥离。
- **降级**：聊天 AI 失败回退 mock 不中断；analyze 失败退款 + 置 FAILED。

**结论**：防线的"图纸"是专业的，分层、白名单、幂等、降级都到位。问题不在设计，在**实现的两道软防线根本没通电**。

---

## 二、线上实测发现（两个系统性失效）

### 🔴 失效 1：Supabase 频率限流表线上不存在 → analyze/edit-outfit/upload/share 限流静默失效

- `checkRateLimit()`（`src/lib/security/rate-limiter.ts`）查询 `rate_limit_usage` 表。
- **实测**：service role 与用户态 JWT 查该表均返回 `Could not find the table 'public.rate_limit_usage' in the schema cache`——**线上合并库（lhofjwiqjqjtycnhliga）里这张表不存在**。建表 migration 在 fashion 本地 `supabase/migrations/20251202_create_rate_limit_table.sql`，但从未应用到合并库（与既往"fashion migrations 与 db 仓库不同步"的遗留一致）。
- **后果**：`checkRateLimit` 查表失败 → `existing=null` → 计数从 0 起算 → 永远不超限 → 永远 `allowed:true`；末尾 `upsert` 也静默失败（无 error 检查）。**analyze（9/23pt）、edit-outfit（39/98pt）、upload、share-create 的频率限流形同虚设**。
- **缓解**：这几个都是付费功能，积分扣点仍兜底成本（余额耗尽即停），**不会成本失控**；但失去了"短时间高频"防护——单用户可在余额内瞬时打满 Gemini 配额、放大并发竞态。

### 🔴 失效 2：Redis 一个 env 都没配 → 聊天小时限流 + 每日预算帽全部 fail-open

- 聊天限流走 `getHourlyLimiter()`、预算帽走 `getRedis()`（`src/lib/rate-limit/redis.ts`），二者在 `isRedisConfigured()` 为 false 时**返回 null（设计为 fail-open）**。
- **实测**：`.env.local` 中 `KV_REDIS_URL / UPSTASH_REDIS_* / KV_REST_API_*` **一个都没配**。
- **后果**：`getHourlyLimiter` 返回 null → 调用方 `if (limiter)` 跳过限流；`dailyBudgetExceeded` 因 `getRedis()` 为 null 直接 `return false`。**聊天的 30/100 条/小时限制 + 5000 JPY/日 预算帽全部不生效**。
- **后果严重度最高**：聊天是**免费 AI**，没有积分门槛这道兜底。当前 = **任意登录用户可无限调用 Gemini Flash**，唯一约束只剩 256 输出 token。这是真正的成本 + 滥用裸奔点（刷爆 Gemini 配额、prompt 滥用）。
- **缓解**：magicoord `is_active=false` 尚未公开；单次 Flash 成本极低（~$0.0002）。但**公开前必须堵上**。

---

## 三、设计层面的其余缺口（即使两道防线通电也存在）

| # | 缺口 | 说明 | 等级 |
|---|------|------|------|
| 1 | 图像生成不计入预算帽 | edit-outfit 是**最贵**的调用（~$0.01/张），却完全不在 `ai-budget` 计数内；每日成本熔断只覆盖最便宜的聊天 | P1 |
| 2 | 预算帽用固定估算 | `ESTIMATED_JPY_PER_CHAT=0.5` 与实际 token 脱钩；`google.ts` 已有真实 usageMetadata 未回填 | P1 |
| 3 | token-tracker 未连 DB | `token-tracker.ts` 的 DB 落库是 TODO；生产环境**没有真实 AI 成本可见性**，无法做成本告警 | P1 |
| 4 | Supabase 限流器是 read-modify-write 竞态 | 即使建表，select→+1→upsert 非原子，并发可击穿限额 | P2 |
| 5 | 固定窗口非滑窗 | 窗口边界处可双倍突发 | P2 |
| 6 | dev-mode 旁路 | analyze/edit/upload 在 dev-mode 跳过限流且扣真实全局钱包（生产 NODE_ENV 已禁用，预发布 preview 需确认） | P2 |

---

## 四、当前线上真实防线状态（去掉理论、只看实际生效的）

| 入口 | 认证 | 积分门槛 | 频率限流 | 预算帽 | **实际兜底** |
|------|------|---------|---------|--------|-------------|
| analyze（9/23pt） | ✅ | ✅ 硬防线 | ❌ 表不存在 | ❌ | **仅积分** |
| edit-outfit（39/98pt） | ✅ | ✅ 硬防线 | ❌ 表不存在 | ❌ | **仅积分** |
| chat（免费） | ✅ | ❌ 无 | ❌ Redis没配 | ❌ Redis没配 | **🔴 仅 256 token 上限——裸奔** |
| upload（免费） | ✅ | 存储配额 | ❌ 表不存在 | ❌ | 存储配额 |
| outfit-feedback | ✅ | ❌ | ❌ 无 | ❌ | 无（非 AI、低危） |
| test-vision | ✅ + 生产禁用 | ❌ | ❌ 表不存在 | ❌ | 生产禁用 |
| share-create | ✅ | ❌ | ❌ 表不存在 | ❌ | 无 |

**一句话**：付费 AI 靠积分扣点活着（够用，缺频率上限）；**免费聊天没有任何有效闸门**。

---

## 五、修复建议（待决方向）

### 方案 A（推荐）：统一接入矩阵已有的原子限流
矩阵 DB 已有 `public.increment_api_rate_limit`（`api_rate_limit_usage` 表，`ON CONFLICT DO UPDATE count+1` **原子自增、无竞态**，线上已存在 migration 20260525010000）。
- 把 fashion 的两套自建限流（Supabase 表 + Redis）**全部废弃**，统一调矩阵 RPC——与"magicoord 向矩阵基础设施适配"的既定方向一致，且一次解决"表不存在""Redis 没配""竞态"三个问题。
- 限额配置仍在 fashion 侧定义（每功能/每窗口），只是计数落到矩阵原子表。

### 方案 B：补齐自建设施
- 建 `rate_limit_usage` 表到合并库 + 改原子自增 RPC；配 Upstash Redis 给聊天。
- 需要额外维护两套设施 + 一个外部 Redis，不推荐。

### 无论哪个方案，公开前必做（P0）：
1. **给免费聊天加有效闸门**：每日预算帽对 free tier 改 **fail-closed**，或给聊天设每日免费条数上限（超出降级/提示）。这是最大风险点。
2. **付费 AI 补频率上限**：analyze/edit-outfit 接通原子限流（防短时高频打爆 Gemini 配额）。
3. **图像生成计入每日成本熔断**。

### 建议补做（P1）：
4. token-tracker 落库或接矩阵成本归集，建立真实成本可见性 + 告警。
5. 预算帽估算改用真实 usageMetadata。

---

## 六、我的判断

- **不是设计差，是没部署到位**——两道软防线的代码都在，但依赖的表/Redis 在合并库里从未落地。这类"代码写了、设施没上、还 fail-open 静默"的组合最危险，因为看代码以为有防护，实际裸奔且无告警。
- **公开前的硬门槛是免费聊天**：付费功能有积分兜底，可以带病上线；免费聊天必须先有有效闸门，否则一公开就是开放式 Gemini 代理。
- **推荐走方案 A**：既修了限流，又延续矩阵统一基础设施的方向，避免再养一个 Redis。

下一步等定方向：是按方案 A 接矩阵原子限流，还是先只把"免费聊天闸门 + 图像生成预算帽"这两个 P0 堵上。
