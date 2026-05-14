/**
 * Extract frontmatter + body preview + char count from Wave 1 source files.
 * Outputs structured JSON for manual review before normalization.
 */

const fs = require('fs')
const path = require('path')

const STG = '/Users/bms/Work/CodeWork/AI-helper/workspace/content-staging/tech/ready/ja'
const DFT = '/Users/bms/Work/CodeWork/AI-helper/workspace/content-factory/drafts/wizpulseai'
const LIF = '/Users/bms/Work/CodeWork/AI-helper/workspace/content-staging/lifestyle'

const WAVE_1 = [
  // LLM Article #1 全 6 章
  { source: `${STG}/llm/llm-article1-intro-basics.md`, targetSlug: 'article-1-intro-basics', featured: true },
  { source: `${STG}/llm/llm-article1-chapter2-architecture.md`, targetSlug: 'article-1-chapter2-architecture', featured: false },
  { source: `${STG}/llm/llm-article1-chapter3-models.md`, targetSlug: 'article-1-chapter3-models', featured: false },
  { source: `${STG}/llm/llm-article1-chapter4-applications.md`, targetSlug: 'article-1-chapter4-applications', featured: false },
  { source: `${STG}/llm/llm-article1-chapter5-capabilities.md`, targetSlug: 'article-1-chapter5-capabilities', featured: false },
  { source: `${STG}/llm/llm-article1-chapter6-future.md`, targetSlug: 'article-1-chapter6-future', featured: false },
  // Lifestyle 3
  { source: `${LIF}/personal-color-self-diagnosis.md`, targetSlug: 'personal-color-self-diagnosis', featured: true },
  { source: `${LIF}/spring-color-coordination-2026.md`, targetSlug: 'spring-color-coordination-2026', featured: false },
  { source: `${LIF}/office-casual-guide-for-beginners.md`, targetSlug: 'office-casual-guide-for-beginners', featured: false },
  // Drafts ja Pillar 4
  { source: `${DFT}/smart-coordination-with-ai-2026-ja.md`, targetSlug: 'smart-coordination-with-ai-2026', featured: true },
  { source: `${DFT}/capsule-wardrobe-color-planning-ja.md`, targetSlug: 'capsule-wardrobe-color-planning', featured: false },
  { source: `${DFT}/color-psychology-fashion-ja.md`, targetSlug: 'color-psychology-fashion', featured: false },
  { source: `${DFT}/outfit-color-coordination-beginners-ja.md`, targetSlug: 'outfit-color-coordination-beginners', featured: false },
  // Staging tools 2
  { source: `${STG}/tools/best-ai-tools-2025.md`, targetSlug: 'best-ai-tools-2025', featured: false },
  { source: `${STG}/tools/free-ai-tools-2025.md`, targetSlug: 'free-ai-tools-2025', featured: false },
]

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/)
  if (!m) return { fm: {}, body: text }
  const fmText = m[1]
  const body = m[2]
  const fm = {}
  // Simple YAML parser for our needs
  let currentKey = null
  let arrBuffer = null
  for (const line of fmText.split('\n')) {
    if (/^\s*-\s/.test(line) && arrBuffer !== null) {
      arrBuffer.push(line.replace(/^\s*-\s*"?([^"]+)"?\s*$/, '$1'))
      continue
    }
    arrBuffer = null
    const kvMatch = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (!kvMatch) continue
    const [, key, val] = kvMatch
    currentKey = key
    if (val === '') {
      arrBuffer = []
      fm[key] = arrBuffer
    } else if (/^".*"$/.test(val)) {
      fm[key] = val.slice(1, -1)
    } else if (/^\[.*\]$/.test(val)) {
      fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1'))
    } else {
      fm[key] = val
    }
  }
  return { fm, body }
}

function charCount(body) {
  // Strip markdown headers, code blocks, links, images for accurate count
  const cleaned = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, '')
  return cleaned.length
}

function readTimeMinutes(body) {
  const cn = charCount(body)
  return Math.ceil(cn / 400)
}

function firstParagraph(body) {
  const lines = body.split('\n')
  let inCode = false
  for (const line of lines) {
    if (line.startsWith('```')) { inCode = !inCode; continue }
    if (inCode) continue
    if (/^#+\s/.test(line)) continue
    if (!line.trim()) continue
    return line.trim().slice(0, 300)
  }
  return ''
}

const results = []
for (const spec of WAVE_1) {
  if (!fs.existsSync(spec.source)) {
    results.push({ ...spec, error: 'SOURCE NOT FOUND' })
    continue
  }
  const text = fs.readFileSync(spec.source, 'utf8')
  const { fm, body } = parseFrontmatter(text)
  const result = {
    source: path.relative('/Users/bms/Work/CodeWork/AI-helper', spec.source),
    targetSlug: spec.targetSlug,
    predesigned_featured: spec.featured,
    fm_title: fm.title || '',
    fm_slug: fm.slug || '',
    fm_category: fm.category || '',
    fm_description: fm.description || '',
    fm_excerpt: fm.excerpt || '',
    fm_tags: fm.tags || null,
    fm_difficulty: fm.difficulty || '',
    fm_target_keyword: fm.target_keyword || '',
    fm_secondary_keywords: fm.secondary_keywords || null,
    charCount: charCount(body),
    readTime: readTimeMinutes(body),
    firstParagraph: firstParagraph(body),
  }
  results.push(result)
}

console.log(JSON.stringify(results, null, 2))
