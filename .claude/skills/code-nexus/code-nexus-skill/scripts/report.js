#!/usr/bin/env node
/**
 * code-nexus report generator v2
 * SQLite → standalone HTML dashboard
 *
 * Usage: node report.js /path/to/project
 */

const path = require('path');
const fs = require('fs');
const SKILL_DIR = path.join(__dirname, '..');
const NEXUS_HOME = path.join(require('os').homedir(), '.code-nexus');
let Database;
try { Database = require(path.join(SKILL_DIR, 'node_modules', 'better-sqlite3')); }
catch { Database = require(path.join(NEXUS_HOME, 'node_modules', 'better-sqlite3')); }

// Extract 2-level module path: src/domains/credits/foo.ts → src/domains/credits
function getModule(filePath, depth = 2) {
  const parts = filePath.split('/');
  // For src/ paths, use depth+1 to get meaningful grouping
  if (parts[0] === 'src' && parts.length > depth + 1) {
    return parts.slice(0, depth + 1).join('/');
  }
  if (parts.length > depth) {
    return parts.slice(0, depth).join('/');
  }
  return parts.slice(0, -1).join('/') || parts[0];
}

function main() {
  const projectRoot = path.resolve(process.argv[2] || '.');
  const outDir = path.join(projectRoot, 'docs', 'architecture');
  const dbPath = path.join(outDir, 'code-nexus.db');

  if (!fs.existsSync(dbPath)) {
    console.error('❌ No docs/architecture/code-nexus.db found. Run indexer.js first.');
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });
  console.log('📊 Generating code-nexus report v2...');

  const data = {};

  // Overview
  data.overview = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM files) as fileCount,
      (SELECT COUNT(*) FROM symbols) as symbolCount,
      (SELECT COUNT(*) FROM calls) as callCount,
      (SELECT COUNT(*) FROM imports) as importCount,
      (SELECT COUNT(*) FROM symbols WHERE exported = 1) as exportCount,
      (SELECT COUNT(*) FROM calls WHERE to_symbol_id IS NOT NULL) as resolvedCalls
  `).get();

  // Symbol kinds breakdown
  data.symbolKinds = db.prepare(`
    SELECT kind, COUNT(*) as count FROM symbols GROUP BY kind ORDER BY count DESC
  `).all();

  // Language breakdown
  data.languages = db.prepare(`
    SELECT language, COUNT(*) as count FROM files GROUP BY language ORDER BY count DESC
  `).all();

  // Top called functions (resolved only)
  data.hotFunctions = db.prepare(`
    SELECT s.name, s.kind, f.path, COUNT(*) as call_count
    FROM calls c
    JOIN symbols s ON c.to_symbol_id = s.id
    JOIN files f ON s.file_id = f.id
    GROUP BY c.to_symbol_id
    ORDER BY call_count DESC
    LIMIT 20
  `).all();

  // Dead code
  data.deadCode = db.prepare(`
    SELECT s.name, s.kind, f.path, s.line_start
    FROM symbols s
    JOIN files f ON s.file_id = f.id
    WHERE s.exported = 1
      AND s.kind IN ('function', 'class', 'variable')
      AND s.id NOT IN (SELECT to_symbol_id FROM calls WHERE to_symbol_id IS NOT NULL)
      AND s.name NOT IN (SELECT import_name FROM imports)
    ORDER BY f.path, s.name
    LIMIT 50
  `).all();

  // Complexity hotspots
  data.complexFiles = db.prepare(`
    SELECT f.path, f.language,
      COUNT(DISTINCT s.id) as symbol_count,
      (SELECT COUNT(*) FROM calls c WHERE c.from_file_id = f.id) as outgoing_calls
    FROM files f
    JOIN symbols s ON s.file_id = f.id
    GROUP BY f.id
    ORDER BY (symbol_count + (SELECT COUNT(*) FROM calls c WHERE c.from_file_id = f.id)) DESC
    LIMIT 15
  `).all();

  // Impact zones
  data.impactZones = db.prepare(`
    SELECT f.path,
      COUNT(DISTINCT c.from_file_id) as dependents
    FROM symbols s
    JOIN files f ON s.file_id = f.id
    JOIN calls c ON c.to_symbol_id = s.id
    WHERE s.exported = 1
    GROUP BY f.id
    ORDER BY dependents DESC
    LIMIT 15
  `).all();

  // Circular dependencies
  data.circularDeps = db.prepare(`
    SELECT DISTINCT f1.path as file_a, f2.path as file_b
    FROM imports i1
    JOIN imports i2 ON i1.from_file_id = i2.to_file_id AND i1.to_file_id = i2.from_file_id
    JOIN files f1 ON i1.from_file_id = f1.id
    JOIN files f2 ON i1.to_file_id = f2.id
    WHERE i1.to_file_id IS NOT NULL AND i2.to_file_id IS NOT NULL
      AND f1.path < f2.path
    LIMIT 30
  `).all();

  // Module dependencies (2-level depth)
  const allImportsResolved = db.prepare(`
    SELECT f1.path as from_path, f2.path as to_path
    FROM imports i
    JOIN files f1 ON i.from_file_id = f1.id
    JOIN files f2 ON i.to_file_id = f2.id
    WHERE i.to_file_id IS NOT NULL
  `).all();

  // Build module dependency map
  const modDeps = new Map();
  for (const imp of allImportsResolved) {
    const fromMod = getModule(imp.from_path);
    const toMod = getModule(imp.to_path);
    if (fromMod === toMod) continue;
    const key = `${fromMod}→${toMod}`;
    modDeps.set(key, (modDeps.get(key) || 0) + 1);
  }
  data.moduleDeps = [...modDeps.entries()]
    .map(([key, weight]) => {
      const [from_mod, to_mod] = key.split('→');
      return { from_mod, to_mod, weight };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 40);

  // Who calls what - key function callers
  data.callerMap = db.prepare(`
    SELECT s.name as target, s.kind as target_kind,
           f_target.path as target_file,
           c.from_symbol_name as caller,
           f_caller.path as caller_file
    FROM calls c
    JOIN symbols s ON c.to_symbol_id = s.id
    JOIN files f_target ON s.file_id = f_target.id
    JOIN files f_caller ON c.from_file_id = f_caller.id
    WHERE s.kind IN ('function', 'method', 'class')
      AND s.exported = 1
    ORDER BY s.name, f_caller.path
    LIMIT 100
  `).all();

  // Group callers by target
  const callerGroups = {};
  for (const row of data.callerMap) {
    const key = `${row.target} (${row.target_file})`;
    if (!callerGroups[key]) callerGroups[key] = [];
    callerGroups[key].push({ caller: row.caller, file: row.caller_file });
  }
  data.callerGroups = Object.entries(callerGroups)
    .filter(([, callers]) => callers.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15);

  db.close();

  const html = generateHTML(data, projectRoot);
  const outPath = path.join(outDir, 'code-nexus-report.html');
  fs.writeFileSync(outPath, html);
  console.log(`✅ Report: ${outPath}`);
}

function generateHTML(data, projectRoot) {
  const projectName = path.basename(projectRoot);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const pct = data.overview.callCount > 0
    ? Math.round(data.overview.resolvedCalls / data.overview.callCount * 100)
    : 0;

  // Generate SVG dependency graph (no external libs)
  const depGraphSvg = generateDepGraphSVG(data.moduleDeps);
  const hasDeps = data.moduleDeps.length > 0;

  // Pure CSS bar chart for hot functions
  const maxCalls = data.hotFunctions[0]?.call_count || 1;
  const hotBarsHtml = data.hotFunctions.map(f => {
    const pctW = Math.round(f.call_count / maxCalls * 100);
    return `<div class="bar-row"><span class="bar-label">${esc(f.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${pctW}%"></div></div><span class="bar-val">${f.call_count}</span></div>`;
  }).join('\n');

  // Language + kind breakdown as inline badges
  const totalFiles = data.languages.reduce((s, l) => s + l.count, 0);
  const langBadges = data.languages.map(l => {
    const colors = { typescript: '#58a6ff', tsx: '#bc8cff', javascript: '#f9e2af', jsx: '#f0883e' };
    const c = colors[l.language] || '#8b949e';
    return `<span class="lang-badge" style="border-color:${c};color:${c}">${l.language} <strong>${l.count}</strong></span>`;
  }).join('');

  const totalSyms = data.symbolKinds.reduce((s, k) => s + k.count, 0);
  const kindBadges = data.symbolKinds.map(k => {
    const colors = { variable: '#f0883e', function: '#58a6ff', method: '#bc8cff', reexport: '#8b949e', class: '#39d4ba', interface: '#3fb950', type: '#d29922', enum: '#f85149' };
    const c = colors[k.kind] || '#8b949e';
    const pctK = Math.round(k.count / totalSyms * 100);
    return `<span class="lang-badge" style="border-color:${c};color:${c}">${k.kind} <strong>${k.count}</strong> (${pctK}%)</span>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>code-nexus: ${esc(projectName)}</title>
<style>
:root{--bg:#0d1117;--s:#161b22;--s2:#21262d;--bd:#30363d;--t:#e6edf3;--sub:#8b949e;--blue:#58a6ff;--green:#3fb950;--red:#f85149;--yellow:#d29922;--purple:#bc8cff;--teal:#39d4ba;--orange:#f0883e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--t);line-height:1.6}
.wrap{max-width:1200px;margin:0 auto;padding:32px 20px}
h1{font-size:26px;color:var(--blue);margin-bottom:4px}
.meta{color:var(--sub);font-size:12px;margin-bottom:28px}
h2{font-size:17px;margin:36px 0 14px;padding-bottom:6px;border-bottom:1px solid var(--bd);color:var(--green)}
h2 .badge{font-size:12px;padding:2px 8px;border-radius:10px;margin-left:8px;font-weight:400}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:14px 0}
.card{background:var(--s);border:1px solid var(--bd);border-radius:10px;padding:14px;text-align:center}
.card .num{font-size:28px;font-weight:800;color:var(--blue)}
.card .num.good{color:var(--green)}
.card .num.warn{color:var(--yellow)}
.card .lbl{font-size:11px;color:var(--sub);margin-top:2px}
.chart-box{background:var(--s);border:1px solid var(--bd);border-radius:10px;padding:20px;margin:14px 0}
.bar-row{display:flex;align-items:center;gap:8px;margin:4px 0}
.bar-label{width:160px;font-size:12px;text-align:right;color:var(--t);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{flex:1;height:20px;background:var(--s2);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,#58a6ff,#bc8cff);border-radius:4px;transition:width .3s}
.bar-val{width:30px;font-size:12px;color:var(--sub);text-align:right}
.lang-badge{display:inline-block;padding:4px 10px;border:1px solid;border-radius:16px;font-size:12px;margin:3px 4px}
.lang-badge strong{margin-left:2px}
.badge-row{margin:10px 0;display:flex;flex-wrap:wrap;gap:4px}
@media(max-width:900px){.bar-label{width:100px}}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
th{background:var(--s);color:var(--blue);padding:7px 10px;text-align:left;border:1px solid var(--bd);position:sticky;top:0}
td{padding:7px 10px;border:1px solid var(--bd)}
tr:nth-child(even) td{background:rgba(22,27,34,.5)}
.warn-box{background:rgba(248,81,73,.06);border:1px solid rgba(248,81,73,.3);border-radius:8px;padding:14px;margin:10px 0}
.warn-box h3{color:var(--red);font-size:14px;margin-bottom:6px}
.mermaid-box{background:var(--s);border:1px solid var(--bd);border-radius:10px;padding:20px;margin:14px 0;overflow-x:auto;min-height:100px}
code{background:var(--s2);padding:1px 5px;border-radius:3px;font-size:12px;color:var(--yellow)}
.tag{display:inline-block;padding:2px 7px;border-radius:8px;font-size:11px;margin:1px 2px}
.tag-fn{background:rgba(88,166,255,.12);color:var(--blue)}
.tag-method{background:rgba(188,140,255,.12);color:var(--purple)}
.tag-cls{background:rgba(57,212,186,.12);color:var(--teal)}
.tag-var{background:rgba(240,136,62,.12);color:var(--orange)}
.tag-interface{background:rgba(63,185,80,.12);color:var(--green)}
.tag-type{background:rgba(210,153,34,.12);color:var(--yellow)}
.caller-group{background:var(--s);border:1px solid var(--bd);border-radius:10px;padding:14px;margin:10px 0}
.caller-group h3{font-size:14px;color:var(--purple);margin-bottom:8px}
.caller-group ul{list-style:none;padding:0}
.caller-group li{font-size:12px;color:var(--sub);padding:2px 0}
.caller-group li code{color:var(--yellow)}
.section-desc{color:var(--sub);font-size:13px;margin-bottom:10px}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--bd);color:var(--sub);font-size:11px;text-align:center}
</style>
</head>
<body>
<div class="wrap">

<h1>code-nexus: ${esc(projectName)}</h1>
<div class="meta">Generated ${now} · Resolution: ${pct}% · code-nexus v2</div>

<h2>Overview</h2>
<div class="cards">
  <div class="card"><div class="num">${data.overview.fileCount}</div><div class="lbl">Files</div></div>
  <div class="card"><div class="num">${data.overview.symbolCount}</div><div class="lbl">Symbols</div></div>
  <div class="card"><div class="num">${data.overview.callCount}</div><div class="lbl">Calls</div></div>
  <div class="card"><div class="num">${data.overview.importCount}</div><div class="lbl">Imports</div></div>
  <div class="card"><div class="num">${data.overview.exportCount}</div><div class="lbl">Exports</div></div>
  <div class="card"><div class="num ${pct >= 80 ? 'good' : pct >= 50 ? 'warn' : ''}">${pct}%</div><div class="lbl">Resolved</div></div>
</div>

<h2>Languages</h2>
<div class="badge-row">${langBadges}</div>

<h2>Symbol Types</h2>
<div class="badge-row">${kindBadges}</div>

<h2>Hot Functions (most called)</h2>
<p class="section-desc">最も多く呼ばれている関数。変更時の影響が大きい。</p>
<div class="chart-box">
${hotBarsHtml}
</div>

${hasDeps ? `
<h2>Architecture: Module Dependencies</h2>
<p class="section-desc">各モジュール間のimport関係。線の太さと数字はimport数。</p>
<div class="chart-box" style="overflow-x:auto">${depGraphSvg}</div>
` : ''}

${data.circularDeps.length > 0 ? `
<h2>Circular Dependencies <span class="badge" style="background:rgba(248,81,73,.2);color:var(--red)">⚠️ ${data.circularDeps.length}</span></h2>
<div class="warn-box">
<h3>循環参照が検出されました</h3>
<table>
<tr><th>File A</th><th>File B</th></tr>
${data.circularDeps.map(c => `<tr><td><code>${esc(c.file_a)}</code></td><td><code>${esc(c.file_b)}</code></td></tr>`).join('\n')}
</table>
</div>` : `<h2>Circular Dependencies <span class="badge" style="background:rgba(63,185,80,.2);color:var(--green)">✅</span></h2>
<p style="color:var(--green)">循環参照なし</p>`}

<h2>Impact Zones <span class="badge" style="background:rgba(248,81,73,.2);color:var(--red)">要注意</span></h2>
<p class="section-desc">これらのファイルを変更すると、最も多くの他ファイルに影響します。</p>
<table>
<tr><th>File</th><th>Dependents</th></tr>
${data.impactZones.map(f => `<tr><td><code>${esc(f.path)}</code></td><td><strong>${f.dependents}</strong> files</td></tr>`).join('\n')}
</table>

${data.callerGroups.length > 0 ? `
<h2>Who Calls What</h2>
<p class="section-desc">よく呼ばれる関数と、どこから呼ばれているか。</p>
${data.callerGroups.map(([target, callers]) => `
<div class="caller-group">
  <h3>${esc(target.split(' (')[0])} <span style="color:var(--sub);font-size:12px;font-weight:400">← ${callers.length} callers</span></h3>
  <ul>${callers.slice(0, 8).map(c => `<li><code>${esc(c.file.split('/').slice(-2).join('/'))}</code> → ${esc(c.caller || '(module)')}</li>`).join('')}${callers.length > 8 ? `<li style="color:var(--sub)">...and ${callers.length - 8} more</li>` : ''}</ul>
</div>`).join('')}
` : ''}

<h2>Complexity Hotspots</h2>
<p class="section-desc">シンボル数と呼び出し数が最も多いファイル。リファクタリング候補。</p>
<table>
<tr><th>File</th><th>Lang</th><th>Symbols</th><th>Calls</th></tr>
${data.complexFiles.map(f => `<tr><td><code>${esc(f.path)}</code></td><td>${f.language}</td><td>${f.symbol_count}</td><td>${f.outgoing_calls}</td></tr>`).join('\n')}
</table>

<h2>Dead Code <span class="badge" style="background:rgba(210,153,34,.2);color:var(--yellow)">${data.deadCode.length}</span></h2>
<p class="section-desc">exportされているが、どこからもimport/呼び出しされていないシンボル。</p>
${data.deadCode.length > 0 ? `
<table>
<tr><th>Symbol</th><th>Kind</th><th>File</th><th>Line</th></tr>
${data.deadCode.map(d => {
  const kindClass = d.kind === 'function' ? 'fn' : d.kind === 'method' ? 'method' : d.kind === 'class' ? 'cls' : 'var';
  return `<tr><td>${esc(d.name)}</td><td><span class="tag tag-${kindClass}">${d.kind}</span></td><td><code>${esc(d.path)}</code></td><td>${d.line_start || ''}</td></tr>`;
}).join('\n')}
</table>` : '<p style="color:var(--green)">Dead code なし</p>'}

<div class="footer">code-nexus v2 · Tree-sitter + SQLite · ${now}</div>
</div>

</body>
</html>`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ========== SVG Dependency Graph Generator ==========
function generateDepGraphSVG(moduleDeps) {
  if (!moduleDeps.length) return '<p style="color:#8b949e">依存関係データなし</p>';

  // Collect unique modules
  const modules = new Set();
  for (const dep of moduleDeps) {
    modules.add(dep.from_mod);
    modules.add(dep.to_mod);
  }
  const moduleList = [...modules];
  const n = moduleList.length;

  // Layout: arrange in a circle
  const W = 900, H = 600;
  const cx = W / 2, cy = H / 2;
  const rx = W * 0.38, ry = H * 0.38;
  const nodeR = 6;

  const positions = {};
  moduleList.forEach((mod, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[mod] = {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });

  // Colors for nodes by category
  const colors = {
    'app': '#f85149',
    'domains': '#bc8cff',
    'lib': '#58a6ff',
    'infrastructure': '#3fb950',
    'shared': '#39d4ba',
    'components': '#f0883e',
    'config': '#d29922',
    'extensions': '#f9e2af',
    'hooks': '#8b949e',
  };

  function getColor(mod) {
    const short = mod.replace('src/', '');
    const top = short.split('/')[0];
    return colors[top] || '#8b949e';
  }

  // Build SVG
  const maxWeight = Math.max(...moduleDeps.map(d => d.weight));
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;height:auto;font-family:-apple-system,sans-serif">`;

  // Defs: arrow marker
  svg += `<defs><marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,3 L0,6 z" fill="#58a6ff" opacity="0.6"/></marker></defs>`;

  // Draw edges
  for (const dep of moduleDeps) {
    const from = positions[dep.from_mod];
    const to = positions[dep.to_mod];
    if (!from || !to) continue;
    const opacity = 0.2 + (dep.weight / maxWeight) * 0.6;
    const strokeW = 1 + (dep.weight / maxWeight) * 3;

    // Offset the line to not overlap the node circle
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const x1 = from.x + (dx / dist) * (nodeR + 2);
    const y1 = from.y + (dy / dist) * (nodeR + 2);
    const x2 = to.x - (dx / dist) * (nodeR + 6);
    const y2 = to.y - (dy / dist) * (nodeR + 6);

    // Curved line
    const mx = (x1 + x2) / 2 + (y2 - y1) * 0.1;
    const my = (y1 + y2) / 2 - (x2 - x1) * 0.1;

    svg += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="#58a6ff" stroke-width="${strokeW.toFixed(1)}" opacity="${opacity.toFixed(2)}" marker-end="url(#arrow)"/>`;

    // Weight label on edge
    if (dep.weight >= 5) {
      const lx = mx, ly = my;
      svg += `<text x="${lx.toFixed(1)}" y="${(ly - 4).toFixed(1)}" font-size="9" fill="#8b949e" text-anchor="middle">${dep.weight}</text>`;
    }
  }

  // Draw nodes + labels
  for (const mod of moduleList) {
    const pos = positions[mod];
    const color = getColor(mod);
    const shortName = mod.replace('src/', '');

    // Node circle
    svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${nodeR}" fill="${color}" stroke="#0d1117" stroke-width="2"/>`;

    // Label — position outside the circle
    const angle = Math.atan2(pos.y - cy, pos.x - cx);
    const labelDist = nodeR + 10;
    const lx = pos.x + labelDist * Math.cos(angle);
    const ly = pos.y + labelDist * Math.sin(angle);
    const anchor = Math.abs(angle) > Math.PI / 2 ? 'end' : 'start';

    svg += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" font-size="11" fill="${color}" text-anchor="${anchor}" font-weight="600">${esc(shortName)}</text>`;
  }

  svg += '</svg>';
  return svg;
}

main();

