# Magicoord（マジコーデ）客户可用性调查报告

> **状态更新（2026-06-10 当日）**: P0-4（积分链路断裂）已通过「matrix billing 统一积分迁移」修复完毕，
> 连带完成：30pt bonus 统一、全局 points 包切换、顾问聊天接真 AI、2 个新发现的 RPC 权限洞修复。
> 详见 TASKS.md 2026-06-10 段。**剩余待办**: migration 应用到线上 DB、ai_products 激活、诊断 SQL 验证（P0-3）、Stripe Live（bobo 决裁时点）。

**日期**: 2026-06-10
**调查方式**: 4 路并行 Agent 审计（功能完整度 / 积分支付链路 / 数据库安全 / 文档遗留问题）
**结论**: 总体完成度约 80-85%，但存在 **4 个 P0 阻塞项**，其中积分扣分链路疑似已在生产环境断裂（见 P0-4），未处理前不应向客户开放。

---

## 一、总体判断

| 维度 | 完成度 | 评级 |
|------|--------|------|
| 页面与路由（24 个用户路由） | 19 完整 / 4 半成品 / 1 禁用 | 🟢 |
| 核心流程（上传→AI分析→结果展示） | ~85%（穿搭效果图仍是 mock） | 🟡 |
| 积分/支付链路 | ~95%（仅 Stripe Live 切换未做） | 🟢 |
| 顾问聊天系统（Mika/Sofia/Rin） | ~50%（UI+存储完成，**AI 回复未实现**） | 🔴 |
| 多语言（ja/en/ar/zh-TW） | ~95%（premium-chat 缺 ar，但该功能已封禁） | 🟢 |
| 错误处理 | ~70%（error.tsx 齐全，API 错误格式不统一，无服务端监控） | 🟡 |
| PWA / SEO | 85% / 90% | 🟢 |
| 法务合规（特商法/隐私/条款，4 语言） | ~100% | 🟢 |
| 数据库安全 | ⚠️ 无法远程验证（MCP token 401），需人工跑诊断 SQL | 🟡 |

---

## 二、P0 阻塞项（开放客户前必须处理）

### P0-1: magicoord 在 ai_products 表中被显式暂停
- Migration `20260525020000_pause_magicoord_public_launch.sql` 把 `is_active=false, is_beta=true`（注释：等 Geo 和 Dino Kids 先开放）。
- 如果前端依赖此字段，产品入口对用户不可见。上线前需执行激活 SQL 或确认前端不读此字段。

### P0-2: Stripe 仍为 Test 模式
- 所有积分包 `stripeMode: 'test'`，env 为 `sk_test_...`。
- 切换 Live 需要：① Stripe Dashboard 创建 Live Products/Prices（bobo 手动）② 更新 4 个 Fashion 包 + Dashboard 包的 priceId 和 stripeMode ③ Vercel env 更新（SECRET_KEY / PUBLISHABLE_KEY / WEBHOOK_SECRET）④ 完整真实支付测试（LAUNCH-5）。
- 代码已有模式对齐防护（`getStripeCatalogAlignmentError()` 不匹配返回 503），混配会直接挂支付。
- 备注：主公此前指示「Stripe は最後、基本機能優先」——此项时点由 bobo 决定。

### P0-3: fashion schema 的 RLS 状态无法静态确认
- db 仓库 2025-12 之前的 46 个 migration 全是 placeholder（源码丢失），fashion 表的 RLS 策略只能在线上验证。
- 本次 Supabase MCP 返回 401，无法远程检查。**需要在 Supabase Dashboard SQL Editor 跑诊断 SQL**（见附录），确认：fashion 全表 RLS 启用、fashion-thumbnails bucket 为私有、未应用 migration 为零。

### P0-4: 积分扣分链路疑似已断裂（已亲手验证代码层）⚠️ 最高优先

**证据链**（2026-06-10 主调查 grep 验证）：
- db 仓库 migration `20260516006000_drop_legacy_fashion_credit_tables.sql` 明确 DROP 了 `fashion.deduct_credits(uuid,integer,text,text,uuid,text)` 和全部 `fashion.add_credits` 重载，注释写明"积分已迁移到 billing.*，防止旧代码误写"。后续 30+ 个 migration **没有任何一个重建这些函数**。
- 但 Fashion 站 **main 分支（与 origin/main 一致，即线上部署版本）** 仍在调用旧 RPC：
  - `src/domains/credits/services/credits.service.ts:83` → `schema('fashion').rpc('deduct_credits', ...)`
  - `credits.service.ts:125` → `schema('fashion').rpc('add_credits', ...)`
  - `src/lib/security/user-tier.service.ts:26-27, 58-59` → 读 `fashion.user_credits`（已被 drop 的表）
  - `src/app/api/fashion/analyze/route.ts:182` → 走 `CreditsService.deductCredits`（即上述断裂路径）
- Fashion 站代码中**没有任何对 billing.* 新积分系统的调用**（仅类型文件中出现 billing 字样）。

**含义**：若该 migration 已应用到线上 DB（日期 2026-05-16，其后已有大量 migration，大概率已应用），则**照片分析的扣分调用在生产环境会直接报错**，分析功能整体不可用。magicoord 于 05-25 被暂停公开，可能因此无人发现。

**行动**：① 跑附录 SQL #4 确认线上 fashion.credit 表/函数是否真的已删除；② 将 Fashion 站 credits domain + user-tier.service 全面迁移到 billing.* RPC（Dashboard 侧 webhook 充值用的是哪套也需同步核对）；③ 迁移后完整回归测试分析→扣分→余额→Tier。

---

## 三、P1 重要问题（建议上线前/上线一周内处理）

~~1. 积分新旧代码冲突~~ → **已验证升级为 P0-4**，见上。

1. **顾问 AI 聊天未接通**：`/api/fashion/chat/messages` 只保存消息不生成回复；group chat 是 mock 数据（DISPATCH-109 标注 mock-only）。聊天是 Rin（Paid 限定）的核心卖点，若以现状开放会被客户视为坏功能。选项：(a) 接通 Gemini 生成回复；(b) 用 feature flag 暂时封禁 chat 入口（符合「未完成機能は flag で封じる」试运转原则）。
2. **魔法変身（穿搭效果图生成）仍是 mock**：`generateOutfits()` 存在但未接图片生成 API（TASKS.md 的 P0-IMG-1~4 未启动）。定价 39pt/98pt 已挂出，卖 mock 等于收费空气——必须接通或在 UI 隐藏该入口。
3. **初回ボーナス金额三处不一致**：代码 100/50pt（先着100名分界）；bobo 04-11 决策记录 30pt；memory 04-13 改订为 100/50。需最终确认一个权威值并同步 BUSINESS-BIBLE。
4. **定价文档与代码不一致**：BUSINESS-BIBLE 写 コーデ提案 29pt/73pt，代码是 OUTFIT_GENERATION 39pt/98pt。代码与 2026-04-09 决议一致，应更新 BUSINESS-BIBLE。
5. **community_posts/replies 无 DELETE 策略**：软删除设计，需确认前端删帖走 UPDATE status='deleted'，否则静默失败。
6. **API 错误响应格式不统一 + 无 Sentry/监控**：客户侧故障无法及时发现，建议至少接入最简告警。

---

## 四、P2 及遗留（不阻塞）

- localStorage 与 DB 同步冲突（已知 bug，排期发布后）
- 历史记录搜索/筛选未实现；收藏功能 DB 有前端无
- Token 监控（token-tracker.ts）未连数据库
- 购物推荐链接（affiliate）未实现
- Playwright 80 个 E2E 测试未接 CI（待 bobo 决策）
- guard.sh 正则 bug（`rm -rf /` 误匹配）
- fashion-wizpulseai-com/supabase/migrations/（001-024 非时间戳命名）应加 ARCHIVED 标注防混淆

---

## 五、做得好的部分（无需返工）

- **支付防御**：webhook 幂等（唯一索引 + 状态机）、FOR UPDATE 行级锁、服务端价格验证（LAUNCH-3）、速率限制、审计日志——质量高。
- **Feature flag 体系**：半成品（premium-chat、social-interactions）已正确封禁，flag 默认值模式规范。
- **法务合规**：特商法/隐私/条款/退款 4 语言全齐，运营责任者、AI 使用限制、赔偿上限条款均已落实。
- **SEO/PWA**：sitemap、hreflang、OG、Service Worker 缓存分层完整。
- **错误页**：5 个路由级 error.tsx + 全局 error boundary。

---

## 六、建议的上线路线（供 bobo 决裁）

| 阶段 | 内容 | 预估 |
|------|------|------|
| ① 立即验证 | 跑数据库诊断 SQL 确认 P0-3/P0-4 线上实态 | 0.5d |
| ② 积分迁移 | Fashion 站 credits domain + tier 判定迁移到 billing.*（P0-4 修复） | 1-2d |
| ③ 功能补齐 | 顾问 AI 回复接通（或封禁）；魔法変身接图片生成（或隐藏入口） | 2-4d |
| ③ 数据一致 | 初回ボーナス定值、BUSINESS-BIBLE 定价同步、激活 ai_products | 0.5d |
| ④ Stripe Live | bobo 手动建 Live Prices → 更新代码/env → 真实支付测试 | 1d |
| ⑤ 上线守护 | 接最简监控告警、E2E 冒烟、3A review、灰度（先着100名） | 1d |

---

## 附录：数据库诊断 SQL（在 Supabase Dashboard SQL Editor 执行）

```sql
-- 1. fashion/billing/public 全表 RLS 状态
SELECT n.nspname AS schema, c.relname AS table_name, c.relrowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies p WHERE p.schemaname = n.nspname AND p.tablename = c.relname) AS policy_count
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname IN ('fashion','billing','public')
ORDER BY n.nspname, c.relname;

-- 2. Storage bucket（确认 fashion-thumbnails 私有、community-media 公开是刻意）
SELECT id, name, public, file_size_limit FROM storage.buckets ORDER BY name;

-- 3. magicoord 产品状态
SELECT code, is_active, is_beta, metadata->>'public_launch_status'
FROM public.ai_products WHERE code = 'magicoord';

-- 4. 旧积分表是否真的已 drop（验证 P1-3）
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_schema = 'fashion' AND table_name LIKE '%credit%';
SELECT routine_schema, routine_name FROM information_schema.routines
WHERE routine_schema = 'fashion' AND routine_name LIKE '%credit%';

-- 5. 最近 migration
SELECT version, name, inserted_at FROM supabase_migrations.schema_migrations
ORDER BY version DESC LIMIT 15;
```
