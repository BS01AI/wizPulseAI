---
name: code-nexus
description: >
  Code knowledge graph indexer and analyzer. Parses any codebase with Tree-sitter,
  stores symbols and call relationships in SQLite, and generates interactive HTML
  architecture dashboards. Use this skill when: "index my codebase", "analyze code
  structure", "show me dependencies", "what calls this function", "impact analysis",
  "generate architecture report", "code health check", "find dead code",
  "circular dependencies", "code-nexus", "update code index", or any request to
  understand code relationships, dependency graphs, or impact of changes.
  Also triggers for: "which files would break if I change X", "show coupling",
  "code complexity report", "module dependency map". Works with TypeScript,
  JavaScript, Python, Go, Rust, Java, and more.
---

# code-nexus: Code Knowledge Graph Engine

Parse a codebase into a structured knowledge graph (SQLite), then generate
architecture dashboards and provide impact analysis queries. All local,
zero external APIs.

## First-Time Setup

Run the setup script once per machine. It installs Tree-sitter and
better-sqlite3 into a shared location.

```bash
bash <skill-dir>/scripts/setup.sh
```

This creates `~/.code-nexus/` with the Node.js dependencies.
After setup, no further installation is needed.

## Usage: Index a Codebase

Run the indexer on the target project:

```bash
node <skill-dir>/scripts/indexer.js /path/to/project
```

This creates `.code-nexus.db` (SQLite) at the project root containing:
- **files** — every source file with its language and hash
- **symbols** — every function, class, method, variable, export
- **calls** — every call relationship (who calls whom)
- **imports** — every import relationship (who imports what from where)

Re-run anytime to update. The script diffs file hashes and only re-parses
changed files (incremental update).

## Usage: Generate Report

```bash
node <skill-dir>/scripts/report.js /path/to/project
```

Generates `.code-nexus-report.html` at the project root — a standalone
interactive dashboard. Open in browser to see:

### Dashboard Sections

1. **Overview Stats** — file count, symbol count, call count, languages breakdown
2. **Module Dependency Graph** — Mermaid diagram of file/directory dependencies
3. **Hot Functions** — top 20 most-called functions (bar chart)
4. **Coupling Matrix** — which directories depend on each other (heatmap)
5. **Circular Dependencies** — detected circular import chains (warnings)
6. **Dead Code** — exported symbols that nobody imports or calls
7. **Complexity Hotspots** — files with the most symbols and outgoing calls
8. **Impact Zones** — files that, if changed, affect the most other files

## Usage: Query (for Claude)

When the user asks about code structure or impact, query the SQLite
database directly using the `sqlite3` CLI or `better-sqlite3` in a
Node.js one-liner. The skill dir's scripts provide helper queries.

### Common Queries

**Who calls function X?**
```sql
SELECT s2.name, f.path, c.call_type
FROM calls c
JOIN symbols s1 ON c.to_symbol_id = s1.id
JOIN symbols s2 ON c.from_symbol_id = s2.id
JOIN files f ON s2.file_id = f.id
WHERE s1.name = 'functionName';
```

**Impact analysis: what breaks if I change function X?**
```sql
WITH RECURSIVE impact AS (
  SELECT id, 1 as depth FROM symbols WHERE name = 'functionName'
  UNION ALL
  SELECT c.from_symbol_id, impact.depth + 1
  FROM calls c JOIN impact ON c.to_symbol_id = impact.id
  WHERE impact.depth < 5
)
SELECT DISTINCT s.name, f.path, MIN(i.depth) as distance
FROM impact i
JOIN symbols s ON i.id = s.id
JOIN files f ON s.file_id = f.id
GROUP BY s.id ORDER BY distance;
```

**Find circular dependencies:**
```sql
WITH RECURSIVE chain AS (
  SELECT from_file_id, to_file_id, CAST(from_file_id AS TEXT) as path
  FROM imports WHERE to_file_id IS NOT NULL
  UNION ALL
  SELECT chain.from_file_id, i.to_file_id, chain.path || ',' || i.from_file_id
  FROM chain JOIN imports i ON chain.to_file_id = i.from_file_id
  WHERE INSTR(chain.path, CAST(i.to_file_id AS TEXT)) = 0
    AND LENGTH(chain.path) - LENGTH(REPLACE(chain.path, ',', '')) < 10
)
SELECT f1.path as "from", f2.path as "to"
FROM chain
JOIN files f1 ON chain.from_file_id = f1.id
JOIN files f2 ON chain.to_file_id = f2.id
WHERE chain.to_file_id = chain.from_file_id;
```

**Dead code (exported but never called/imported):**
```sql
SELECT s.name, s.kind, f.path
FROM symbols s
JOIN files f ON s.file_id = f.id
WHERE s.exported = 1
  AND s.id NOT IN (SELECT to_symbol_id FROM calls WHERE to_symbol_id IS NOT NULL)
  AND s.name NOT IN (SELECT import_name FROM imports)
ORDER BY f.path, s.name;
```

## Supported Languages

Tree-sitter grammars are installed during setup:

| Language | Grammar Package | Priority |
|----------|----------------|----------|
| TypeScript | tree-sitter-typescript | Primary |
| JavaScript | tree-sitter-javascript | Primary |
| Python | tree-sitter-python | Secondary |
| Go | tree-sitter-go | Secondary |
| Rust | tree-sitter-rust | Secondary |
| Java | tree-sitter-java | Secondary |

Primary languages are installed by default. Secondary languages are
installed on first use (the indexer detects file extensions and installs
the grammar if missing).

## Principles

1. **Local only** — no external APIs, no cloud, no telemetry
2. **Incremental** — re-running the indexer only processes changed files
3. **Zero Python** — everything is Node.js + bash
4. **Human-readable output** — SQLite (queryable) + HTML (visual)
5. **Non-destructive** — only creates `.code-nexus.db` and `.code-nexus-report.html`
