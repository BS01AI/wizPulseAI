# WizPulseAI 矩阵网站 — コード品質監査報告

> Generated: 2026-04-08 by code-nexus v2 + architecture-guardian agent
> Scope: 4 sites (Fashion, Auth, Dashboard, Main)

## 概要

| 站点 | 文件 | 符号 | 解析率 | 健康度 |
|------|------|------|--------|--------|
| Fashion (マジコーデ) | 231 | 2944 | 83% | 7/10 |
| Auth | 51 | 477 | 50% | 5/10 |
| Dashboard | 225 | 2599 | 45% | 4/10 |
| Main (www) | 147 | 1103 | 95% | 8/10 |

循環依存: 全站 **ゼロ** ✅

## 行動項目 (優先順)

### 即時対応 (10分以内、リスクゼロ)

1. **DELETE** `wizPulseAI-com/src/app/[locale]/knowledge-hub/page.old.tsx` — 残留バックアップ
2. **DELETE** `wizPulseAI-com/src/app/[locale]/products/[id]/page.backup.tsx` — 残留バックアップ
3. **DELETE** `wizPulseAI-com/src/app/[locale]/knowledge-hub/basics/[slug]/page.backup.tsx` — 残留バックアップ
4. **DELETE** Dashboard重複テストファイル (3つ→1つに統合):
   - 残す: `db-wizPulseAI-com/src/app/api/subscriptions/cancel-subscription/route.test.ts`
   - 削除: `cancel-sub.test.ts`, `cancel.test.ts`
5. **DELETE** `auth-wizpulseai-com/src/shared/lib/logger/index.ts` から他站logger (dashboardLogger, fashionLogger, mainLogger)
6. **DELETE** `auth-wizpulseai-com/src/lib/env.ts` の未使用関数 (validateEnv, requireValidEnv, env)
7. **DELETE** `fashion-wizpulseai-com/docs/OUTFIT_FEEDBACK_EXAMPLE.tsx`

### 中期対応 (次スプリント)

8. **REFACTOR** `fashion-wizpulseai-com/src/lib/db/fashion.mapper.ts` (90シンボル) → ドメイン別に分割
9. **AUDIT** `fashion-wizpulseai-com/src/config/dev-mode.ts` (11依存先) — セキュリティリスク
   - NEXT_PUBLIC_DEV_MODE が本番に漏れると11箇所の挙動が変わる
   - ハードコードされた実ユーザーID あり
10. **CONSOLIDATE** Fashion の二重 logger (lib/logger.ts vs shared/lib/logger/logger.ts)

### 長期対応

11. shared/ モジュールの重複管理 → monorepo or npm workspace 検討
12. `as any` 99箇所 → Supabase 型生成の改善で根本解決

## アーキテクチャ評価

### 分層遵守状況

| ルール | Fashion | Auth | Dashboard | Main |
|--------|---------|------|-----------|------|
| domains/ にビジネスロジック | ⚠️ lib/tier/ 違反 | N/A | 未確認 | N/A |
| lib/ は技術ツールのみ | ⚠️ lib/db/ にmapper | ✅ | ✅ | ✅ |
| infrastructure/ に外部サービス | ✅ | N/A | N/A | N/A |
| shared/ は跨ドメイン資源 | ✅ | ✅ | ✅ | N/A |

### クロスサイト問題

1. **shared/i18n/** が Auth と Dashboard に手動コピー — 変更時に手動同期必要
2. **applyTheme** 関数が Auth と Dashboard の両方に存在 — Cookie ベースの共有テーマ機構と二重管理
3. **Logger** が各站にコピーされ、不要なクロスサイトインスタンスが残留

## code-nexus ツール改善

- ✅ テストファイル除外パターン追加 (.test./.spec./.backup./.old.)
- ✅ 次回スキャン時に Dashboard 解析率改善見込み
