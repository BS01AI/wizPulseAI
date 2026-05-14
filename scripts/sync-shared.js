#!/usr/bin/env node

/**
 * shared/ モジュール同期スクリプト
 *
 * 頂層 shared/ を唯一の真実源として、各站点の src/shared/ にコピーする。
 * Vercel prebuild 時に自動実行される。
 *
 * 使い方:
 *   node ../../scripts/sync-shared.js          # 站点ディレクトリから実行
 *   node scripts/sync-shared.js auth           # ルートから特定站点を指定
 *   node scripts/sync-shared.js --all          # 全站点を同期
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 設定
// ============================================================

const ROOT = path.resolve(__dirname, '..');
const SHARED_SRC = path.join(ROOT, 'shared');

const SITES = {
  auth: 'auth-wizpulseai-com',
  dashboard: 'db-wizPulseAI-com',
  fashion: 'fashion-wizpulseai-com',
  main: 'wizPulseAI-com',
};

// ============================================================
// コピー関数
// ============================================================

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    let count = 0;
    for (const item of fs.readdirSync(src)) {
      count += copyRecursive(path.join(src, item), path.join(dest, item));
    }
    return count;
  } else {
    // ファイルが同じなら skip
    if (fs.existsSync(dest)) {
      const srcContent = fs.readFileSync(src);
      const destContent = fs.readFileSync(dest);
      if (srcContent.equals(destContent)) return 0;
    }
    fs.copyFileSync(src, dest);
    return 1;
  }
}

function syncSite(siteName) {
  const siteDir = SITES[siteName];
  if (!siteDir) {
    console.error(`Unknown site: ${siteName}`);
    return;
  }

  const destShared = path.join(ROOT, siteDir, 'src', 'shared');
  console.log(`\n📦 Syncing shared/ → ${siteDir}/src/shared/`);

  let totalCopied = 0;
  for (const dir of fs.readdirSync(SHARED_SRC)) {
    const srcPath = path.join(SHARED_SRC, dir);
    const destPath = path.join(destShared, dir);

    if (fs.statSync(srcPath).isDirectory()) {
      const copied = copyRecursive(srcPath, destPath);
      if (copied > 0) console.log(`   ✅ ${dir}/ (${copied} files updated)`);
    } else {
      // 頂層ファイル (README.md etc)
      const copied = copyRecursive(srcPath, path.join(destShared, dir));
      if (copied > 0) console.log(`   ✅ ${dir} (updated)`);
    }
  }

  console.log(`   Done.`);
}

// ============================================================
// メイン
// ============================================================

const args = process.argv.slice(2);

if (args.includes('--all')) {
  console.log('🔄 Syncing shared/ to all sites...');
  for (const site of Object.keys(SITES)) {
    syncSite(site);
  }
} else if (args.length > 0) {
  for (const site of args) {
    syncSite(site);
  }
} else {
  // 自動検出: カレントディレクトリから站点を推定
  const cwd = process.cwd();
  const detected = Object.entries(SITES).find(([, dir]) => cwd.includes(dir));
  if (detected) {
    syncSite(detected[0]);
  } else {
    console.log('Usage:');
    console.log('  node scripts/sync-shared.js auth|dashboard|fashion|main');
    console.log('  node scripts/sync-shared.js --all');
    console.log('  (or run from within a site directory for auto-detection)');
  }
}
