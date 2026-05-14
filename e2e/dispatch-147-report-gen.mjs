// DISPATCH-147 — variant-coverage-report.html generator
// Author: bs01ai
// Aggregates v1 (logged-out, 146) + v2 (authenticated, 147) screenshots into single HTML

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = '/Users/bms/Work/CodeWork/AI-helper/core/docs/matrix-themes-2026-05-11';
const V1_DIR = join(BASE, 'production-smoke');     // 146
const V2_DIR = join(BASE, 'production-smoke-v2');  // 147
const V3_DIR = join(BASE, 'production-smoke-v3-authed'); // 148
const V4_DIR = join(BASE, 'production-smoke-v4-real-redesign'); // 149
const V5_DIR = join(BASE, 'production-smoke-v5-final-rollout'); // 150
const OUT = join(BASE, 'variant-coverage-report.html');

const VARIANTS = ['sucre', 'luminous', 'editorial', 'wabi', 'urban'];

const safe = (p) => p.replace(/\\/g, '/');

function listShots(dir) {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  } catch {
    return [];
  }
}

const v1 = listShots(V1_DIR);
const v2 = listShots(V2_DIR);
const v3 = listShots(V3_DIR);
const v4 = listShots(V4_DIR);
const v5 = listShots(V5_DIR);

function group(shots, dirAlias) {
  const byPage = {};
  for (const f of shots) {
    const m = f.match(/^([a-z-]+)__(.+)\.png$/);
    if (!m) continue;
    const [, variant, page] = m;
    byPage[page] = byPage[page] || {};
    byPage[page][variant] = `${dirAlias}/${f}`;
  }
  return byPage;
}

const g1 = group(v1, 'production-smoke');
const g2 = group(v2, 'production-smoke-v2');
const g3 = group(v3, 'production-smoke-v3-authed');
const g4 = group(v4, 'production-smoke-v4-real-redesign');
const g5 = group(v5, 'production-smoke-v5-final-rollout');

const allPages = new Set([...Object.keys(g1), ...Object.keys(g2), ...Object.keys(g3), ...Object.keys(g4), ...Object.keys(g5)]);
const pageOrder = [
  // 主公 explicit Phase 5 check pages (148)
  'main-home',
  'main-about',
  'main-kh-index',
  'main-kh-article',
  // Matrix other 3 sites
  'auth-login',
  'dashboard-home',
  // Fashion
  'fashion-home',
  'fashion-community',
  'fashion-history',
  'fashion-chat-mika',
];
const orderedPages = pageOrder.filter((p) => allPages.has(p)).concat(
  [...allPages].filter((p) => !pageOrder.includes(p))
);

function tableFor(group, label) {
  if (!Object.keys(group).length) return `<p class="empty">No ${label} screenshots found.</p>`;
  let html = `<table class="grid"><thead><tr><th>Page</th>${VARIANTS.map((v) => `<th class="${v}">${v}</th>`).join('')}</tr></thead><tbody>`;
  for (const page of orderedPages) {
    if (!group[page]) continue;
    html += `<tr><td class="page-name">${page}</td>`;
    for (const v of VARIANTS) {
      const src = group[page][v];
      if (src) {
        html += `<td><a href="${src}" target="_blank"><img src="${src}" loading="lazy" alt="${v} ${page}"></a></td>`;
      } else {
        html += `<td class="missing">—</td>`;
      }
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>DISPATCH-147 Variant Coverage Report</title>
<style>
  :root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; }
  body { margin: 24px; background: #fafafa; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  h2 { font-size: 18px; margin-top: 32px; padding-top: 12px; border-top: 2px solid #e5e5e5; }
  .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
  table.grid { border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  table.grid th, table.grid td { padding: 8px; border: 1px solid #e5e5e5; vertical-align: top; text-align: left; }
  table.grid th { background: #f5f5f5; font-weight: 600; font-size: 13px; position: sticky; top: 0; }
  table.grid th.sucre { background: #fdf6ec; color: #3d2e2a; }
  table.grid th.luminous { background: #eef2ff; color: #4f46e5; }
  table.grid th.editorial { background: #fff; color: #0a0a0a; }
  table.grid th.wabi { background: #f5efe2; color: #1a1a1a; }
  table.grid th.urban { background: #0a0e1a; color: #ff6b1a; }
  table.grid td.page-name { font-family: ui-monospace, monospace; font-size: 12px; white-space: nowrap; background: #fafafa; }
  table.grid img { width: 200px; height: auto; max-height: 280px; object-fit: cover; object-position: top; display: block; cursor: zoom-in; border-radius: 4px; }
  table.grid td.missing { color: #ccc; text-align: center; }
  .legend { display: flex; gap: 16px; margin: 12px 0; font-size: 13px; }
  .legend-item { padding: 6px 12px; border-radius: 6px; font-weight: 600; }
  .legend-item.sucre { background: #fdf6ec; color: #3d2e2a; border: 1px solid #c99a8b; }
  .legend-item.luminous { background: #eef2ff; color: #4f46e5; border: 1px solid #4f46e5; }
  .legend-item.editorial { background: #fff; color: #0a0a0a; border: 1px solid #0a0a0a; }
  .legend-item.wabi { background: #f5efe2; color: #1a1a1a; border: 1px solid #1a1a1a; }
  .legend-item.urban { background: #0a0e1a; color: #ff6b1a; border: 1px solid #ff6b1a; }
  .empty { color: #999; font-style: italic; margin: 12px 0; padding: 12px; background: #fff; border-radius: 6px; }
  details { background: white; border-radius: 6px; padding: 12px 16px; margin: 12px 0; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
  summary { cursor: pointer; font-weight: 600; }
</style>
</head>
<body>
  <h1>DISPATCH-147 — Variant Coverage Report</h1>
  <p class="meta">5 variants × N pages × 2 capture rounds (146 logged-out + 147 authenticated)<br>
  Generated: ${new Date().toISOString()} JST<br>
  Click any thumbnail to open full-size in new tab.</p>

  <div class="legend">
    <span class="legend-item sucre">Sucré (cream + rose-gold)</span>
    <span class="legend-item luminous">Luminous (indigo)</span>
    <span class="legend-item editorial">Editorial (B/W)</span>
    <span class="legend-item wabi">Wabi-Sabi (washi + ink)</span>
    <span class="legend-item urban">Urban (carbon + neon)</span>
  </div>

  <details open>
    <summary>150 — Matrix rollout: home + about + KH index + KH article × 5 variants (v5, LATEST, 4 pages × 5 = 20 shots, cookie bug fixed)</summary>
    ${tableFor(g5, '150 rollout v5')}
  </details>

  <details>
    <summary>149 — Mockup-faithful Hero redesign (v4)</summary>
    ${tableFor(g4, '149 redesign v4')}
  </details>

  <details>
    <summary>148 — Matrix 3 sites + Phase 5 check pages (v3, Tailwind purge fixed)</summary>
    ${tableFor(g3, '148 matrix v3')}
  </details>

  <details>
    <summary>147 — Layer 2 bridge first attempt (v2)</summary>
    ${tableFor(g2, '147 v2')}
  </details>

  <details>
    <summary>146 — Layer 1 namespace alias (v1, baseline)</summary>
    ${tableFor(g1, '146 v1')}
  </details>

  <h2>What to look for</h2>
  <ul>
    <li><strong>Urban</strong> (carbon + neon orange) = the most extreme. If a page does not become dark + orange, the bridge missed it.</li>
    <li><strong>Sucré</strong> (cream + rose-gold) = warm bias. Pages should warm up if bridge applies.</li>
    <li><strong>Wabi-Sabi</strong> (米紙 + 墨黒) = washi-paper. Subtle warm-grey shift.</li>
    <li><strong>Editorial</strong> (B/W + red) = high-contrast minimal.</li>
    <li><strong>Luminous</strong> (indigo) = closest to current default for many sites; expect smallest diff.</li>
  </ul>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf-8');
console.log(`wrote: ${OUT}`);
console.log(`v1 shots: ${v1.length}`);
console.log(`v2 shots: ${v2.length}`);
console.log(`v3 shots: ${v3.length}`);
console.log(`v4 shots: ${v4.length}`);
console.log(`v5 shots: ${v5.length}`);
console.log(`total: ${v1.length + v2.length + v3.length + v4.length + v5.length}`);
