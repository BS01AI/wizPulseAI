#!/usr/bin/env node
/**
 * code-nexus indexer v2
 * Tree-sitter AST → SQLite knowledge graph
 *
 * v2 improvements:
 *   - Import→Class→Method chain resolution (X.foo() → find X's source → find foo in it)
 *   - TypeScript interface/type alias detection
 *   - Extended builtins + React/Next.js framework filtering
 *   - Re-export chain following
 *   - Path alias (@/) resolution
 *
 * Usage: node indexer.js /path/to/project [--force]
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load from skill's own node_modules (fallback to ~/.code-nexus)
const SKILL_DIR = path.join(__dirname, '..');
const NEXUS_HOME = path.join(require('os').homedir(), '.code-nexus');
const resolve = (mod) => {
  try { return require(path.join(SKILL_DIR, 'node_modules', mod)); }
  catch { return require(path.join(NEXUS_HOME, 'node_modules', mod)); }
};

const Parser = resolve('tree-sitter');
const TypeScript = resolve('tree-sitter-typescript');
const JavaScript = resolve('tree-sitter-javascript');
const Database = resolve('better-sqlite3');

// ========== Config ==========
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', '.nuxt', 'dist', 'build', 'out',
  '.code-nexus', '.omm', 'coverage', '.turbo', '.cache', '__pycache__',
  'vendor', '.svelte-kit', '.output', 'public'
]);

const LANG_MAP = {
  '.ts': { lang: TypeScript.typescript, name: 'typescript' },
  '.tsx': { lang: TypeScript.tsx, name: 'tsx' },
  '.js': { lang: JavaScript, name: 'javascript' },
  '.jsx': { lang: JavaScript, name: 'jsx' },
  '.mjs': { lang: JavaScript, name: 'javascript' },
};

// Builtins + framework APIs that should NOT be tracked as unresolved
const BUILTINS = new Set([
  // JS builtins
  'console.log', 'console.error', 'console.warn', 'console.info', 'console.debug',
  'JSON.stringify', 'JSON.parse', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'Array.isArray', 'Array.from', 'Object.keys', 'Object.values', 'Object.entries',
  'Object.assign', 'Object.freeze', 'Object.defineProperty',
  'Promise.resolve', 'Promise.reject', 'Promise.all', 'Promise.allSettled', 'Promise.race',
  'Math.max', 'Math.min', 'Math.floor', 'Math.ceil', 'Math.round', 'Math.random', 'Math.abs',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'queueMicrotask',
  'require', 'String', 'Number', 'Boolean', 'Date', 'Error', 'TypeError', 'RangeError',
  'Map', 'Set', 'WeakMap', 'WeakSet', 'RegExp', 'Proxy', 'Reflect',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
  'atob', 'btoa', 'fetch', 'Request', 'Response', 'Headers', 'URL', 'URLSearchParams',
  'AbortController', 'AbortSignal', 'TextEncoder', 'TextDecoder',
  'structuredClone', 'crypto.randomUUID', 'performance.now',
  'alert', 'confirm', 'prompt',
  // Node.js
  'process.exit', 'process.env', 'process.cwd', 'process.argv',
  'Buffer.from', 'Buffer.alloc',
  // React hooks & APIs
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useReducer',
  'useContext', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue',
  'useTransition', 'useDeferredValue', 'useId', 'useSyncExternalStore',
  'createContext', 'forwardRef', 'memo', 'lazy', 'Suspense', 'Fragment',
  'createElement', 'cloneElement', 'Children',
  // Next.js
  'NextResponse.json', 'NextResponse.redirect', 'NextResponse.next', 'NextResponse.rewrite',
  'redirect', 'notFound', 'revalidatePath', 'revalidateTag',
  'useRouter', 'usePathname', 'useSearchParams', 'useParams',
  'cookies', 'headers',
  // DOM
  'document.getElementById', 'document.querySelector', 'document.querySelectorAll',
  'document.createElement', 'window.addEventListener', 'window.removeEventListener',
  'localStorage.getItem', 'localStorage.setItem', 'localStorage.removeItem',
  'sessionStorage.getItem', 'sessionStorage.setItem',
  'navigator.clipboard.writeText', 'navigator.share',
  'history.pushState', 'history.replaceState',
]);

// Patterns to filter (prefix match)
const BUILTIN_PREFIXES = [
  'console.', 'Math.', 'Object.', 'Array.', 'String.prototype.',
  'Number.prototype.', 'Date.prototype.', 'Promise.prototype.',
  'process.', 'Buffer.', 'fs.', 'path.', 'crypto.',
  'window.', 'document.', 'navigator.',
  'localStorage.', 'sessionStorage.',
  'e.', 'ev.', 'event.',  // event handlers
  'err.', 'error.', 'ex.',  // error access
  'res.', 'req.',  // http objects
];

// Array/String/Object prototype methods — not user-defined
const PROTOTYPE_METHODS = new Set([
  'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every',
  'flat', 'flatMap', 'sort', 'reverse', 'slice', 'splice', 'concat', 'join',
  'push', 'pop', 'shift', 'unshift', 'fill',
  'includes', 'indexOf', 'lastIndexOf',
  'startsWith', 'endsWith', 'trim', 'trimStart', 'trimEnd',
  'split', 'replace', 'replaceAll', 'match', 'matchAll', 'search',
  'toLowerCase', 'toUpperCase', 'toLocaleLowerCase', 'toLocaleUpperCase',
  'padStart', 'padEnd', 'repeat', 'charAt', 'charCodeAt', 'codePointAt',
  'substring', 'substr', 'at',
  'toString', 'valueOf', 'toFixed', 'toPrecision', 'toExponential',
  'toISOString', 'toLocaleDateString', 'toLocaleTimeString', 'toLocaleString',
  'getTime', 'getFullYear', 'getMonth', 'getDate', 'getDay',
  'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds',
  'then', 'catch', 'finally',
  'keys', 'values', 'entries', 'has', 'get', 'set', 'delete', 'clear', 'add',
  'next', 'return', 'throw',
  'addEventListener', 'removeEventListener', 'dispatchEvent',
  'preventDefault', 'stopPropagation',
  'append', 'prepend', 'remove', 'cloneNode',
  'play', 'pause', 'load',
  'close', 'abort', 'signal',
]);

// Third-party library objects + infrastructure (their methods are not user business code)
const THIRD_PARTY_OBJECTS = new Set([
  'supabase', 'stripe', 'toast', 'router', 'form', 'lottie',
  'motion', 'animate', 'spring', 'Lottie',
  'Image', 'Link', 'Head', 'Script',
  'logger', 'timer', 'console',  // logging infrastructure
]);

function isBuiltIn(name) {
  if (BUILTINS.has(name)) return true;
  for (const prefix of BUILTIN_PREFIXES) {
    if (name.startsWith(prefix)) return true;
  }

  const parts = name.split('.');

  // Deep chains are rarely resolvable
  if (parts.length > 2) return true;

  if (parts.length === 2) {
    const [obj, method] = parts;
    // Prototype methods on any object
    if (PROTOTYPE_METHODS.has(method)) return true;
    // Third-party library calls
    if (THIRD_PARTY_OBJECTS.has(obj)) return true;
    // Optional chaining artifacts
    if (obj === '?') return true;
    // React setState hooks: setXxx(...)
    if (obj.startsWith('set') && obj[3] === obj[3]?.toUpperCase()) return true;
    // Date.now, Date.parse etc.
    if (obj === 'Date' || obj === 'now') return true;
  }

  if (parts.length === 1) {
    const n = parts[0];
    // React setState: setXxx
    if (n.startsWith('set') && n.length > 3 && n[3] === n[3]?.toUpperCase()) return true;
  }

  return false;
}

// ========== Main ==========
function main() {
  const args = process.argv.slice(2);
  const projectRoot = path.resolve(args[0] || '.');
  const forceReindex = args.includes('--force');

  if (!fs.existsSync(projectRoot)) {
    console.error(`❌ Project not found: ${projectRoot}`);
    process.exit(1);
  }

  console.log(`📊 code-nexus indexer v2`);
  console.log(`   Project: ${projectRoot}`);
  console.log(`   Mode: ${forceReindex ? 'full' : 'incremental'}`);

  const outDir = path.join(projectRoot, 'docs', 'architecture');
  fs.mkdirSync(outDir, { recursive: true });
  const dbPath = path.join(outDir, 'code-nexus.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  initSchema(db);

  // Detect path alias (tsconfig paths)
  const pathAlias = detectPathAlias(projectRoot);
  if (pathAlias) {
    console.log(`   Path alias: ${pathAlias.prefix} → ${pathAlias.baseDir}`);
  }

  // Collect source files
  const files = collectFiles(projectRoot);
  console.log(`   Files found: ${files.length}`);

  // Index
  const parser = new Parser();
  let indexed = 0, skipped = 0, errors = 0;

  const insertFile = db.prepare(`INSERT OR REPLACE INTO files (path, file_hash, language, indexed_at) VALUES (?, ?, ?, ?)`);
  const getFile = db.prepare(`SELECT id, file_hash FROM files WHERE path = ?`);
  const deleteSymbols = db.prepare(`DELETE FROM symbols WHERE file_id = ?`);
  const deleteCalls = db.prepare(`DELETE FROM calls WHERE from_file_id = ?`);
  const deleteImports = db.prepare(`DELETE FROM imports WHERE from_file_id = ?`);
  const insertSymbol = db.prepare(`INSERT INTO symbols (file_id, name, kind, scope, exported, line_start, line_end) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertCall = db.prepare(`INSERT INTO calls (from_file_id, from_symbol_name, to_name, call_type) VALUES (?, ?, ?, ?)`);
  const insertImport = db.prepare(`INSERT INTO imports (from_file_id, import_name, import_path) VALUES (?, ?, ?)`);

  const indexAll = db.transaction(() => {
    for (const file of files) {
      const relPath = path.relative(projectRoot, file.path);
      const hash = fileHash(file.path);

      if (!forceReindex) {
        const existing = getFile.get(relPath);
        if (existing && existing.file_hash === hash) {
          skipped++;
          continue;
        }
      }

      try {
        const code = fs.readFileSync(file.path, 'utf-8');
        const langConfig = LANG_MAP[file.ext];
        parser.setLanguage(langConfig.lang);
        const tree = parser.parse(code);

        insertFile.run(relPath, hash, langConfig.name, Date.now());
        const fileRecord = getFile.get(relPath);
        const fileId = fileRecord.id;

        deleteSymbols.run(fileId);
        deleteCalls.run(fileId);
        deleteImports.run(fileId);

        const extracted = extract(tree.rootNode, code);

        for (const sym of extracted.symbols) {
          insertSymbol.run(fileId, sym.name, sym.kind, sym.scope, sym.exported ? 1 : 0, sym.lineStart, sym.lineEnd);
        }
        for (const call of extracted.calls) {
          insertCall.run(fileId, call.fromSymbol, call.toName, call.callType);
        }
        for (const imp of extracted.imports) {
          insertImport.run(fileId, imp.name, imp.path);
        }

        indexed++;
      } catch (e) {
        console.error(`   ⚠️  Error parsing ${relPath}: ${e.message}`);
        errors++;
      }
    }

    // Resolve cross-file symbol references
    resolveReferences(db, pathAlias);
  });

  indexAll();

  // Stats
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM files) as files,
      (SELECT COUNT(*) FROM symbols) as symbols,
      (SELECT COUNT(*) FROM calls) as calls,
      (SELECT COUNT(*) FROM imports) as imports
  `).get();

  console.log(`\n✅ Indexing complete`);
  console.log(`   Indexed: ${indexed} | Skipped: ${skipped} | Errors: ${errors}`);
  console.log(`   DB: ${stats.files} files, ${stats.symbols} symbols, ${stats.calls} calls, ${stats.imports} imports`);
  console.log(`   Output: ${dbPath}`);

  db.close();
}

// ========== Schema ==========
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT UNIQUE NOT NULL,
      file_hash TEXT NOT NULL,
      language TEXT NOT NULL,
      indexed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      scope TEXT DEFAULT 'module',
      exported INTEGER DEFAULT 0,
      line_start INTEGER,
      line_end INTEGER,
      FOREIGN KEY(file_id) REFERENCES files(id)
    );

    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_file_id INTEGER NOT NULL,
      from_symbol_name TEXT,
      to_name TEXT NOT NULL,
      to_symbol_id INTEGER,
      call_type TEXT NOT NULL,
      FOREIGN KEY(from_file_id) REFERENCES files(id),
      FOREIGN KEY(to_symbol_id) REFERENCES symbols(id)
    );

    CREATE TABLE IF NOT EXISTS imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_file_id INTEGER NOT NULL,
      to_file_id INTEGER,
      import_name TEXT NOT NULL,
      import_path TEXT NOT NULL,
      FOREIGN KEY(from_file_id) REFERENCES files(id),
      FOREIGN KEY(to_file_id) REFERENCES files(id)
    );

    CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(file_id);
    CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);
    CREATE INDEX IF NOT EXISTS idx_symbols_exported ON symbols(exported);
    CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(kind);
    CREATE INDEX IF NOT EXISTS idx_calls_from ON calls(from_file_id);
    CREATE INDEX IF NOT EXISTS idx_calls_to ON calls(to_symbol_id);
    CREATE INDEX IF NOT EXISTS idx_calls_toname ON calls(to_name);
    CREATE INDEX IF NOT EXISTS idx_imports_from ON imports(from_file_id);
    CREATE INDEX IF NOT EXISTS idx_imports_to ON imports(to_file_id);
    CREATE INDEX IF NOT EXISTS idx_imports_name ON imports(import_name);
    CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
  `);
}

// ========== Path Alias Detection ==========
function detectPathAlias(root) {
  const tsConfigPath = path.join(root, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) return null;
  try {
    const raw = fs.readFileSync(tsConfigPath, 'utf-8');
    // Extract paths using regex (more robust than JSON.parse for tsconfig with comments/trailing commas)
    const pathsMatch = raw.match(/"paths"\s*:\s*\{([^}]+)\}/);
    if (!pathsMatch) return null;
    // Find "@/*": ["./src/*"]
    const aliasMatch = pathsMatch[1].match(/"(@[^"]*\/\*?)"\s*:\s*\[\s*"([^"]+)"\s*\]/);
    if (!aliasMatch) return null;
    const prefix = aliasMatch[1].replace('*', ''); // "@/"
    const baseDir = aliasMatch[2].replace('*', '').replace(/^\.\//, ''); // "src/"
    return { prefix, baseDir };
  } catch { }
  return null;
}

// ========== File Collection ==========
function collectFiles(root) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          walk(path.join(dir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (LANG_MAP[ext]) {
          results.push({ path: path.join(dir, entry.name), ext });
        }
      }
    }
  }
  walk(root);
  return results;
}

function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 16);
}

// ========== AST Extraction ==========
function extract(rootNode, code) {
  const symbols = [];
  const calls = [];
  const imports = [];
  walkNode(rootNode, '', symbols, calls, imports);
  return { symbols, calls, imports };
}

function walkNode(node, currentScope, symbols, calls, imports) {
  // --- Function declarations ---
  if (node.type === 'function_declaration') {
    const nameNode = node.childForFieldName('name');
    const name = nameNode ? nameNode.text : '<anonymous>';
    symbols.push({
      name, kind: 'function', scope: currentScope || 'module',
      exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
    });
    walkChildren(node, currentScope ? `${currentScope}.${name}` : name, symbols, calls, imports);
    return;
  }

  // --- Arrow function / variable declaration ---
  if (node.type === 'lexical_declaration' || node.type === 'variable_declaration') {
    for (let i = 0; i < node.childCount; i++) {
      const decl = node.child(i);
      if (decl.type === 'variable_declarator') {
        const nameNode = decl.childForFieldName('name');
        const valueNode = decl.childForFieldName('value');
        if (nameNode && valueNode && (valueNode.type === 'arrow_function' || valueNode.type === 'function_expression')) {
          symbols.push({
            name: nameNode.text, kind: 'function', scope: currentScope || 'module',
            exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
          });
          const scope = currentScope ? `${currentScope}.${nameNode.text}` : nameNode.text;
          walkChildren(valueNode, scope, symbols, calls, imports);
          continue;
        }
        if (nameNode) {
          symbols.push({
            name: nameNode.text, kind: 'variable', scope: currentScope || 'module',
            exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
          });
        }
      }
    }
    return;
  }

  // --- Class declarations ---
  if (node.type === 'class_declaration') {
    const nameNode = node.childForFieldName('name');
    const name = nameNode ? nameNode.text : '<anonymous>';
    symbols.push({
      name, kind: 'class', scope: currentScope || 'module',
      exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
    });
    walkChildren(node, currentScope ? `${currentScope}.${name}` : name, symbols, calls, imports);
    return;
  }

  // --- TypeScript interface declarations ---
  if (node.type === 'interface_declaration') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) {
      symbols.push({
        name: nameNode.text, kind: 'interface', scope: currentScope || 'module',
        exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
      });
    }
    return; // don't recurse into interface body (no calls inside)
  }

  // --- TypeScript type alias ---
  if (node.type === 'type_alias_declaration') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) {
      symbols.push({
        name: nameNode.text, kind: 'type', scope: currentScope || 'module',
        exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
      });
    }
    return;
  }

  // --- TypeScript enum ---
  if (node.type === 'enum_declaration') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) {
      symbols.push({
        name: nameNode.text, kind: 'enum', scope: currentScope || 'module',
        exported: isExported(node), lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
      });
    }
    return;
  }

  // --- Method definitions ---
  if (node.type === 'method_definition' || node.type === 'public_field_definition') {
    const nameNode = node.childForFieldName('name');
    if (nameNode) {
      symbols.push({
        name: nameNode.text, kind: 'method', scope: currentScope,
        exported: false, lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
      });
      walkChildren(node, `${currentScope}.${nameNode.text}`, symbols, calls, imports);
      return;
    }
  }

  // --- Call expressions ---
  if (node.type === 'call_expression') {
    const func = node.childForFieldName('function') || node.child(0);
    if (func) {
      const callName = extractCallName(func);
      if (callName && !isBuiltIn(callName)) {
        calls.push({
          fromSymbol: currentScope || '<module>',
          toName: callName,
          callType: callName.includes('.') ? 'method' : 'function'
        });
      }
    }
  }

  // --- Import statements ---
  if (node.type === 'import_statement') {
    const sourceNode = node.descendantsOfType('string').pop();
    const importPath = sourceNode ? sourceNode.text.replace(/['"]/g, '') : '';

    // Skip type-only imports for call resolution (but still record them)
    const isTypeImport = node.text.startsWith('import type');

    // Named imports
    const namedImports = node.descendantsOfType('import_specifier');
    for (const spec of namedImports) {
      const nameNode = spec.childForFieldName('name') || spec.child(0);
      if (nameNode) {
        imports.push({ name: nameNode.text, path: importPath });
      }
    }

    // Default import
    const importClause = node.descendantsOfType('import_clause');
    for (const clause of importClause) {
      for (let i = 0; i < clause.childCount; i++) {
        const child = clause.child(i);
        if (child.type === 'identifier') {
          imports.push({ name: child.text, path: importPath });
        }
      }
    }

    // Namespace import: import * as ns from '...'
    const nsImports = node.descendantsOfType('namespace_import');
    for (const ns of nsImports) {
      const nameNode = ns.child(ns.childCount - 1);
      if (nameNode) {
        imports.push({ name: nameNode.text, path: importPath });
      }
    }
    return;
  }

  // --- Export statements ---
  if (node.type === 'export_statement') {
    const sourceNode = node.descendantsOfType('string').pop();
    if (sourceNode) {
      const importPath = sourceNode.text.replace(/['"]/g, '');
      const specs = node.descendantsOfType('export_specifier');
      for (const spec of specs) {
        const nameNode = spec.childForFieldName('name') || spec.child(0);
        if (nameNode) {
          imports.push({ name: nameNode.text, path: importPath });
          symbols.push({
            name: nameNode.text, kind: 'reexport', scope: 'module',
            exported: true, lineStart: node.startPosition.row + 1, lineEnd: node.endPosition.row + 1
          });
        }
      }
    }
  }

  // --- Recurse children ---
  walkChildren(node, currentScope, symbols, calls, imports);
}

function walkChildren(node, scope, symbols, calls, imports) {
  for (let i = 0; i < node.childCount; i++) {
    walkNode(node.child(i), scope, symbols, calls, imports);
  }
}

function extractCallName(node) {
  if (!node) return null;
  if (node.type === 'identifier') return node.text;
  if (node.type === 'member_expression') {
    const obj = extractCallName(node.childForFieldName('object') || node.child(0));
    const prop = node.childForFieldName('property') || node.child(2);
    if (!prop) return obj;
    // Only keep 1-level deep: X.method (not X.a.b.c)
    if (obj && !obj.includes('.')) {
      return `${obj}.${prop.text}`;
    }
    // For deeper chains, return just the last obj.method
    return `${obj || '?'}.${prop.text}`;
  }
  if (node.type === 'call_expression') {
    return extractCallName(node.child(0));
  }
  // Handle `new X()`
  if (node.type === 'new_expression') {
    const name = node.childForFieldName('constructor');
    return name ? name.text : null;
  }
  return null;
}

function isExported(node) {
  const parent = node.parent;
  return parent && parent.type === 'export_statement';
}

// ========== Cross-file Reference Resolution (v2) ==========
function resolveReferences(db, pathAlias) {
  // Step 1: Build file path map
  const allFiles = db.prepare('SELECT id, path FROM files').all();
  const fileMap = new Map();
  for (const f of allFiles) {
    fileMap.set(f.path, f.id);
    const noExt = f.path.replace(/\.(ts|tsx|js|jsx|mjs)$/, '');
    fileMap.set(noExt, f.id);
    if (f.path.endsWith('/index.ts') || f.path.endsWith('/index.js') || f.path.endsWith('/index.tsx')) {
      fileMap.set(path.dirname(f.path), f.id);
    }
  }

  // Step 2: Resolve import paths → file IDs (including @/ alias)
  const unresolvedImports = db.prepare(
    'SELECT i.id, i.import_path, f.path as from_path FROM imports i JOIN files f ON i.from_file_id = f.id WHERE i.to_file_id IS NULL'
  ).all();

  const updateImport = db.prepare('UPDATE imports SET to_file_id = ? WHERE id = ?');
  let importResolved = 0;

  for (const imp of unresolvedImports) {
    let resolved = null;

    if (imp.import_path.startsWith('.')) {
      // Relative import
      const fromDir = path.dirname(imp.from_path);
      const target = path.normalize(path.join(fromDir, imp.import_path));
      resolved = fileMap.get(target) || fileMap.get(target + '/index');
    } else if (pathAlias && imp.import_path.startsWith(pathAlias.prefix)) {
      // Path alias: @/lib/foo → src/lib/foo
      const aliasedPath = imp.import_path.replace(pathAlias.prefix, pathAlias.baseDir);
      resolved = fileMap.get(aliasedPath) || fileMap.get(aliasedPath + '/index');
    }

    if (resolved) {
      updateImport.run(resolved, imp.id);
      importResolved++;
    }
  }
  console.log(`   Import resolution: ${importResolved}/${unresolvedImports.length} paths resolved`);

  // Step 3: Build import→file lookup for each file
  // For each file, know: "importName X comes from fileId Y"
  const allImportsResolved = db.prepare(
    'SELECT from_file_id, import_name, to_file_id FROM imports WHERE to_file_id IS NOT NULL'
  ).all();

  // Map: fileId → Map<importName, targetFileId>
  const fileImportMap = new Map();
  for (const imp of allImportsResolved) {
    if (!fileImportMap.has(imp.from_file_id)) {
      fileImportMap.set(imp.from_file_id, new Map());
    }
    fileImportMap.get(imp.from_file_id).set(imp.import_name, imp.to_file_id);
  }

  // Step 4: Build symbol lookup by file
  const allSymbols = db.prepare('SELECT id, file_id, name, kind, scope FROM symbols').all();

  // Map: fileId → Map<symbolName, symbolId>
  const fileSymbolMap = new Map();
  // Map: name → [{id, fileId, kind}] (for global fallback)
  const globalSymbolMap = new Map();

  for (const sym of allSymbols) {
    if (!fileSymbolMap.has(sym.file_id)) {
      fileSymbolMap.set(sym.file_id, new Map());
    }
    // For methods, store as "ClassName.methodName" and also just "methodName"
    fileSymbolMap.get(sym.file_id).set(sym.name, sym.id);

    if (!globalSymbolMap.has(sym.name)) {
      globalSymbolMap.set(sym.name, []);
    }
    globalSymbolMap.get(sym.name).push({ id: sym.id, fileId: sym.file_id, kind: sym.kind });
  }

  // Step 5: Resolve call targets with import chain awareness
  const unresolvedCalls = db.prepare(
    'SELECT c.id, c.to_name, c.from_file_id, c.call_type FROM calls c WHERE c.to_symbol_id IS NULL'
  ).all();

  const updateCall = db.prepare('UPDATE calls SET to_symbol_id = ? WHERE id = ?');
  let callResolved = 0;

  for (const call of unresolvedCalls) {
    const parts = call.to_name.split('.');
    const resolved = resolveCall(call, parts, fileImportMap, fileSymbolMap, globalSymbolMap);
    if (resolved) {
      updateCall.run(resolved, call.id);
      callResolved++;
    }
  }

  const total = db.prepare('SELECT COUNT(*) as n FROM calls').get().n;
  const totalResolved = db.prepare('SELECT COUNT(*) as n FROM calls WHERE to_symbol_id IS NOT NULL').get().n;
  const pct = total > 0 ? Math.round(totalResolved / total * 100) : 0;
  console.log(`   Symbol resolution: ${totalResolved}/${total} calls resolved (${pct}%)`);
}

function resolveCall(call, parts, fileImportMap, fileSymbolMap, globalSymbolMap) {
  const fileImports = fileImportMap.get(call.from_file_id);
  const fileSymbols = fileSymbolMap.get(call.from_file_id);

  if (parts.length === 1) {
    // Simple function call: foo()
    const name = parts[0];

    // 1. Same file
    if (fileSymbols?.has(name)) return fileSymbols.get(name);

    // 2. Imported symbol → target file
    if (fileImports?.has(name)) {
      const targetFileId = fileImports.get(name);
      const targetSymbols = fileSymbolMap.get(targetFileId);
      if (targetSymbols?.has(name)) return targetSymbols.get(name);
      // Might be a re-export — look for it in any file linked from target
      // (simplified: just check if there's any exported symbol with this name)
    }

    // 3. Global fallback — find exported symbol with this name
    const globals = globalSymbolMap.get(name);
    if (globals) {
      // Prefer exported functions/classes over variables
      const exported = globals.find(g => g.kind === 'function' || g.kind === 'class');
      if (exported) return exported.id;
      return globals[0].id;
    }

    return null;
  }

  if (parts.length === 2) {
    // Method call: X.foo()
    const [objName, methodName] = parts;

    // 1. X is imported → find method in X's source file
    if (fileImports?.has(objName)) {
      const targetFileId = fileImports.get(objName);
      const targetSymbols = fileSymbolMap.get(targetFileId);

      // Look for method named 'foo' in the target file
      if (targetSymbols?.has(methodName)) {
        return targetSymbols.get(methodName);
      }

      // X might be a class — look for class.method in scope
      // Check if target file has a class named objName with method methodName
      const classMethod = `${objName}.${methodName}`;
      // Methods are stored with scope "ClassName" and name "methodName"
      // So we can find them by name in the target file
    }

    // 2. X is a local variable/class — find method in same file
    if (fileSymbols?.has(methodName)) {
      return fileSymbols.get(methodName);
    }

    // 3. X.foo where X is a well-known class (CreditsService.getBalance → find getBalance anywhere)
    const methodSymbols = globalSymbolMap.get(methodName);
    if (methodSymbols) {
      // Prefer methods over functions
      const method = methodSymbols.find(g => g.kind === 'method');
      if (method) return method.id;
      // Then try functions
      const func = methodSymbols.find(g => g.kind === 'function');
      if (func) return func.id;
    }

    return null;
  }

  // 3+ parts: too deep, skip
  return null;
}

// ========== Run ==========
main();
