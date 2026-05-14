/**
 * DISPATCH-063 Wave 1 Publisher
 * Copy 15 articles from sources + apply normalized frontmatter (from preview)
 * + LLM 6-chapter series frontmatter
 */

const fs = require('fs')
const path = require('path')

const ROOT = '/Users/bms/Work/CodeWork'
const STG = `${ROOT}/AI-helper/workspace/content-staging/tech/ready/ja`
const DFT = `${ROOT}/AI-helper/workspace/content-factory/drafts/wizpulseai`
const LIF = `${ROOT}/AI-helper/workspace/content-staging/lifestyle`
const DEST = `${ROOT}/Web/wizPulseAI/wizPulseAI-com/content/articles/ja`

const WAVE_1 = [
  // LLM Article #1 全 6 章 (series)
  {
    source: `${STG}/llm/llm-article1-intro-basics.md`,
    slug: 'article-1-intro-basics',
    title: '大規模言語モデル（LLM）とは？基礎から応用まで徹底解説',
    description: 'LLMの定義、歴史、核心能力を包括的に解説。Transformer誕生から2025年までの進化、GPT・Claude・Geminiの違い、Zero-shot/Few-shot/CoT推論、企業導入の成功パターンと落とし穴まで、AI担当者が押さえるべき要点を6章構成で整理したシリーズの入口となる章。',
    excerpt: 'LLMの本質と発展史、5大能力を短時間で把握できるシリーズ総覧。開発者・研究者・技術リーダー向け。',
    category: 'AI基礎知識',
    tags: ['LLM', '大規模言語モデル', 'Transformer', 'GPT-4', 'Claude'],
    difficulty: 'intermediate',
    readTime: '21分',
    featured: true,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 1, total: 6 },
  },
  {
    source: `${STG}/llm/llm-article1-chapter2-architecture.md`,
    slug: 'article-1-chapter2-architecture',
    title: '第2章：Transformerアーキテクチャの概要（LLM技術基礎）',
    description: 'LLMを支えるTransformerアーキテクチャの概要。Self-Attention、事前学習、RLHFの基本を簡潔に整理。詳細は専用記事で深掘り。',
    excerpt: 'LLMの中核技術Transformerの全体像を把握。Self-Attention・事前学習・RLHFを最短経路で理解し、深掘りは別記事へ誘導。',
    category: 'AI基礎知識',
    tags: ['LLM', 'Transformer', 'Self-Attention', 'RLHF', '事前学習'],
    difficulty: 'intermediate',
    readTime: '4分',
    featured: false,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 2, total: 6 },
  },
  {
    source: `${STG}/llm/llm-article1-chapter3-models.md`,
    slug: 'article-1-chapter3-models',
    title: '第3章：主流LLMモデル比較（GPT / Claude / Gemini / OSS）',
    description: 'GPT-4o/4.5、Claude 3.5/3.7 Sonnet、Gemini 2.5 Pro、Llama 3.1、Qwen 2.5、Mistral Small を 8 軸で比較し、用途別に最適なモデル選択を指針化。',
    excerpt: '主要クローズドLLMとオープンソースLLMを性能・価格・コンテキスト長など8軸で徹底比較し、用途別に最適なモデル選択をガイド。',
    category: 'AI基礎知識',
    tags: ['LLM 比較', 'GPT-4o', 'Claude 3.7', 'Gemini 2.5 Pro', 'Llama'],
    difficulty: 'intermediate',
    readTime: '24分',
    featured: false,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 3, total: 6 },
  },
  {
    source: `${STG}/llm/llm-article1-chapter4-applications.md`,
    slug: 'article-1-chapter4-applications',
    title: '第4章：LLMの実践的な応用シーン',
    description: 'コンテンツ生成、コード支援、カスタマーサービス、データ分析、教育支援。LLMがビジネスで実用化されている代表的な応用シーンを具体的な実装例と共に解説。',
    excerpt: 'LLMが既に実用化されている代表的な6大シーンを、APIコード例と効果測定指標と共に網羅的に解説。',
    category: 'AI開発実践',
    tags: ['LLM 活用', 'コンテンツ生成', 'コード支援', 'チャットボット', 'データ分析'],
    difficulty: 'intermediate',
    readTime: '10分',
    featured: false,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 4, total: 6 },
  },
  {
    source: `${STG}/llm/llm-article1-chapter5-capabilities.md`,
    slug: 'article-1-chapter5-capabilities',
    title: '第5章：LLMの能力と限界の理解',
    description: 'LLMの代表的な能力（汎化・長文処理・マルチタスク・創発）と、幻覚・知識カットオフ・計算コストなど6つの主要な限界を、実装上の緩和策とあわせて解説。',
    excerpt: 'LLMの能力と限界を正しく理解し、実運用で落とし穴を避けるための現実的な視点を整理する章。',
    category: 'AI基礎知識',
    tags: ['LLM 限界', 'ハルシネーション', 'コンテキスト長', 'Few-shot'],
    difficulty: 'intermediate',
    readTime: '17分',
    featured: false,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 5, total: 6 },
  },
  {
    source: `${STG}/llm/llm-article1-chapter6-future.md`,
    slug: 'article-1-chapter6-future',
    title: '第6章：LLMの未来の展望（2026-2028）',
    description: 'マルチモーダル統合、エージェント化、小型化、説明可能性、専門特化。LLMの今後3年の技術進化と、社会・規制面の論点を展望する。',
    excerpt: 'LLMが今後どこへ向かうのか。技術・産業・社会・規制の4視点から2028年までを展望する章。',
    category: 'AI市場インサイト',
    tags: ['LLM 未来', 'AIエージェント', 'AI規制', 'AGI', 'マルチモーダル'],
    difficulty: 'intermediate',
    readTime: '18分',
    featured: false,
    author: 'wizPulseAI 編集部',
    series: { name: 'LLM完全ガイド', order: 6, total: 6 },
  },
  // Lifestyle 3
  {
    source: `${LIF}/personal-color-self-diagnosis.md`,
    slug: 'personal-color-self-diagnosis',
    title: 'パーソナルカラー自己診断｜イエベ・ブルベの見分け方と4シーズンの特徴',
    description: 'パーソナルカラーの自己診断方法を解説。手首の血管チェックや白い紙テスト、金銀ジュエリーテストでイエベ・ブルベを見分けるコツと、4シーズン（春夏秋冬）の特徴・似合う色を紹介します。',
    excerpt: 'イエベ？ブルベ？手首の血管や紙テストで自己診断する方法と、4シーズンそれぞれの似合う色をまとめました。',
    category: 'ファッション＆ライフスタイル',
    tags: ['パーソナルカラー', 'イエベ', 'ブルベ', '色診断'],
    difficulty: 'beginner',
    readTime: '6分',
    featured: true,
    author: 'Misa',
  },
  {
    source: `${LIF}/spring-color-coordination-2026.md`,
    slug: 'spring-color-coordination-2026',
    title: '春の配色コーデ5選｜色の組み合わせだけで、こんなに変わる',
    description: '2026年春のトレンドカラーを使った配色コーデ5選。ラベンダー、ミントグリーン、コーラルピンクなど、春らしい色合わせのコツを初心者でもすぐ真似できる組み合わせ例と共に紹介します。',
    excerpt: '春は色で遊ぶ季節。トレンドカラーを使った5つの配色コーデで、いつもの服が見違えるよ。',
    category: 'ファッション＆ライフスタイル',
    tags: ['春コーデ', '配色', 'トレンドカラー', '2026春'],
    difficulty: 'beginner',
    readTime: '6分',
    featured: false,
    author: 'Misa',
  },
  {
    source: `${LIF}/office-casual-guide-for-beginners.md`,
    slug: 'office-casual-guide-for-beginners',
    title: 'オフィスカジュアルって結局なに着ればいいの？新社会人のための超入門ガイド',
    description: 'オフィスカジュアル初心者の新社会人向けに、基本ルール・最初に揃えるべき5アイテム・色の選び方・1週間着回し術をわかりやすく解説。明日から迷わず出勤できるコーデの型を作ります。',
    excerpt: '「オフィスカジュアルでお願いします」って言われて固まったあなたへ。揃えるべき5アイテムと着回しテクを、ギュッとまとめたよ。',
    category: 'ファッション＆ライフスタイル',
    tags: ['オフィスカジュアル', '新社会人', '着回し'],
    difficulty: 'beginner',
    readTime: '7分',
    featured: false,
    author: 'Misa',
  },
  // Drafts ja Pillar 4
  {
    source: `${DFT}/smart-coordination-with-ai-2026-ja.md`,
    slug: 'smart-coordination-with-ai-2026',
    title: '2026年版：AIで始めるスマートコーディネート入門',
    description: 'AIを使ったファッションコーディネートの始め方を2026年の最新事情とともに解説。AIが配色分析やスタイリング提案をどう行うのか、具体的な活用方法と注意点をまとめた入門ガイド。',
    excerpt: 'AIを使ったファッションコーディネートの始め方を2026年の最新事情とともに解説。',
    category: '配色とAI',
    tags: ['AI コーディネート', 'AI ファッション', 'スマートコーディネート', '2026 トレンド'],
    difficulty: 'intermediate',
    readTime: '8分',
    featured: true,
    author: 'Misa',
  },
  {
    source: `${DFT}/capsule-wardrobe-color-planning-ja.md`,
    slug: 'capsule-wardrobe-color-planning',
    title: 'カプセルワードローブの配色計画：少ない服で最大の着回しを実現する方法',
    description: 'カプセルワードローブ成功の鍵は「色の設計」です。20着で100通り以上の着回しを実現する配色計画の立て方を、具体的なカラーパレット例と購入優先順位つきで解説します。',
    excerpt: 'カプセルワードローブ成功の鍵は「色の設計」。20着で100通り以上の着回しを実現する配色計画を紹介。',
    category: '配色とAI',
    tags: ['カプセルワードローブ', '配色', '着回し', 'ミニマル ワードローブ'],
    difficulty: 'intermediate',
    readTime: '10分',
    featured: false,
    author: 'Misa',
  },
  {
    source: `${DFT}/color-psychology-fashion-ja.md`,
    slug: 'color-psychology-fashion',
    title: '服の色が与える印象：ファッション色彩心理学の基本',
    description: '服の色が他者に与える印象と心理効果を、色彩心理学の研究に基づいて解説。ビジネス、デート、面接など場面別の色選びガイドと、色の効果を活かすための実践ポイントを紹介します。',
    excerpt: '服の色が他者に与える印象と心理効果を、色彩心理学の研究に基づいて場面別に整理。',
    category: '配色とAI',
    tags: ['色彩心理学', 'ファッション', '印象管理', '場面別コーデ'],
    difficulty: 'intermediate',
    readTime: '10分',
    featured: false,
    author: 'Misa',
  },
  {
    source: `${DFT}/outfit-color-coordination-beginners-ja.md`,
    slug: 'outfit-color-coordination-beginners',
    title: '服の配色に迷わない：初心者のための完全ガイド',
    description: '服の色選びが苦手な人のための完全ガイド。「なんとなく合わない」を解決する3つの基本ルールと、明日から使える実践テクニックを紹介。配色理論の知識ゼロでも、この記事だけで基本が身につきます。',
    excerpt: '服の色選びが苦手な人のための完全ガイド。3つの基本ルールで「なんとなく合わない」を卒業。',
    category: '配色とAI',
    tags: ['服 配色', '初心者', 'コーディネート 基本', '色の合わせ方'],
    difficulty: 'beginner',
    readTime: '7分',
    featured: false,
    author: 'Misa',
  },
  // Tools 2
  {
    source: `${STG}/tools/best-ai-tools-2025.md`,
    slug: 'best-ai-tools-2025',
    title: '【2025年最新版】15款最強AIツール完全ガイド：用途別おすすめランキング',
    description: '2025年最新のAIツール15選を徹底比較。無料から有料まで、用途別に最適なAIツールをプロが解説。ChatGPT、Claude、Midjourney等の特徴や料金プランを詳しく紹介します。',
    excerpt: '2025年最新AIツール15選を徹底比較。用途別おすすめランキングで最適なツールが見つかります。',
    category: 'AI市場インサイト',
    tags: ['AIツール', '比較', 'おすすめ', '生産性', '2025'],
    difficulty: 'advanced',
    readTime: '32分',
    featured: false,
    author: 'wizPulseAI 編集部',
  },
  {
    source: `${STG}/tools/free-ai-tools-2025.md`,
    slug: 'free-ai-tools-2025',
    title: '無料で使えるAIツール完全ガイド2025：年間¥388,920節約する15選【クレカ不要】',
    description: 'クレジットカード不要で使える高品質な無料AIツール15選を徹底比較。ChatGPT、Claude、Codeiumなど、年間38万円以上節約できる完全無料ツールの機能と使い分け戦略を解説。',
    excerpt: 'クレカ不要の無料AIツール15選で年間38万円節約。ChatGPT、Claude等の使い分け戦略を徹底解説。',
    category: 'AI市場インサイト',
    tags: ['AIツール', '無料', 'ChatGPT', 'Claude', 'Codeium'],
    difficulty: 'intermediate',
    readTime: '60分',
    featured: false,
    author: 'wizPulseAI 編集部',
  },
]

function extractBody(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/)
  return m ? m[1] : text
}

function yamlEscape(s) {
  // Double-quote and escape inner double-quotes/backslashes
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function buildFrontmatter(spec) {
  const lines = ['---']
  lines.push(`title: ${yamlEscape(spec.title)}`)
  lines.push(`description: ${yamlEscape(spec.description)}`)
  lines.push(`date: "2026-04-18"`)
  lines.push(`category: ${yamlEscape(spec.category)}`)
  lines.push(`tags: [${spec.tags.map(yamlEscape).join(', ')}]`)
  lines.push(`difficulty: ${yamlEscape(spec.difficulty)}`)
  lines.push(`readTime: ${yamlEscape(spec.readTime)}`)
  lines.push(`featured: ${spec.featured ? 'true' : 'false'}`)
  lines.push(`excerpt: ${yamlEscape(spec.excerpt)}`)
  lines.push(`author:`)
  lines.push(`  name: ${yamlEscape(spec.author)}`)
  if (spec.series) {
    lines.push(`series:`)
    lines.push(`  name: ${yamlEscape(spec.series.name)}`)
    lines.push(`  order: ${spec.series.order}`)
    lines.push(`  total: ${spec.series.total}`)
  }
  lines.push('---\n')
  return lines.join('\n')
}

const DRY = process.argv.includes('--dry')
let ok = 0, fail = 0
for (const spec of WAVE_1) {
  if (!fs.existsSync(spec.source)) {
    console.error(`[FAIL] source not found: ${spec.source}`)
    fail++
    continue
  }
  const text = fs.readFileSync(spec.source, 'utf8')
  const body = extractBody(text).trimStart()
  const out = buildFrontmatter(spec) + '\n' + body
  const dest = `${DEST}/${spec.slug}.md`
  if (DRY) {
    console.log(`[DRY] would write: ${dest} (frontmatter + ${body.length} chars body)`)
  } else {
    fs.writeFileSync(dest, out)
    console.log(`[OK]  ${spec.slug}.md  (${out.length} chars, series=${spec.series ? spec.series.order + '/' + spec.series.total : 'n/a'})`)
  }
  ok++
}
console.log(`\nTotal: ${ok} ok, ${fail} fail`)
