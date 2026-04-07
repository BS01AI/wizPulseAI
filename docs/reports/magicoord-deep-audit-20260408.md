# Magicoord (Fashion AI) — 深度コード品質監査

> Generated: 2026-04-08 by architecture-guardian agent
> Scope: fashion-wizpulseai-com 全ソースコード

## 統計
- `as any`: 99箇所
- `@ts-nocheck`: 3ファイル (photo/vision/style-advisor service)
- TODO/FIXME: 6箇所
- テストカバレッジ: 0%
- fashion/page.tsx: 988行（単一コンポーネント）

## P0 — 重大問題 (収益に直結)

### 1. 積分扣除が AI 実行の後 → 失敗時タダで分析結果を渡す
- **場所**: `src/app/api/fashion/analyze/route.ts:210-268`
- **問題**: AI分析 → 積分チェック → 扣除 の順。扣除失敗時 catch で結果を返してしまう
- **コメント**: `// [設計決策] 積分扣除失敗時仍返回分析結果，優先保証用戶體驗`
- **リスク**: ネットワークエラーやDB障害で無料利用される。2ユーザーなら影響小だがスケール時に致命的
- **修正**: 積分扣除を AI 実行の前に移動。チェック+扣除を1つの atomic RPC で実行

### 2. 穿搭生成の積分扣除が Storage 書き込みの後
- **場所**: `src/app/api/fashion/edit-outfit/route.ts:342-353`
- **問題**: 画像生成 → Storage保存 → DB記録 → **その後** 積分扣除
- **リスク**: 扣除失敗時、画像は保存済みだが課金されない
- **修正**: 積分扣除を画像生成の前に移動

### 3. test-vision API が NODE_ENV だけで保護
- **場所**: `src/app/api/fashion/test-vision/route.ts:39-44`
- **問題**: Vercel Preview でも `NODE_ENV=production` → このチェックでは防げない
- **修正**: `isProduction` (analyze/route.ts と同じ) + 認証チェック追加

## P1 — 一般問題

| # | 問題 | 場所 | 修正 |
|---|------|------|------|
| 4 | photos/onboarding/quota API が error.message を本番で漏出 | 各route.ts | isProduction ガード追加 |
| 5 | Rate limiter が非原子的 (TOCTOU) | rate-limiter.ts | DB関数化 |
| 6 | 3つのコアサービスに @ts-nocheck | photo/vision/style-advisor | 個別 as any に変更 |
| 7 | share code が Math.random() | share/create/route.ts | crypto.randomBytes 使用 |
| 8 | fashion/page.tsx が 988行 | page.tsx | hook/component 分割 |
| 9 | keep-alive cron が error.message 漏出 | cron/keep-alive/route.ts | generic error に |
| 10 | deprecated component shim 残留 | components/dashboard/ | 削除 |
| 11 | deductCredits が RPC 後に余分な SELECT | credits.service.ts | RPC から balance 返す |

## P2 — 提案

- 積分価格を DB/環境変数化 (デプロイなしで変更可能に)
- Lottie animation が3箇所で重複 import → 共通コンポーネント化
- getUserTier は現在常に 'free' → サブスク未実装なら省略可
- token-tracker.ts に未実装 TODO あり

## 一句話結論

> 積分扣除のタイミングが AI 実行の後にある = 失敗時タダになる。これが最大のビジネスリスク。スケール前に修正必須。
