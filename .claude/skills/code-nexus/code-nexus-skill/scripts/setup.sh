#!/bin/bash
# code-nexus setup: install Tree-sitter + better-sqlite3 to ~/.code-nexus/
set -e

NEXUS_HOME="$HOME/.code-nexus"
echo "🔧 code-nexus setup"
echo "   Install dir: $NEXUS_HOME"

# Create directory
mkdir -p "$NEXUS_HOME"

# Initialize package.json if not exists
if [ ! -f "$NEXUS_HOME/package.json" ]; then
  cd "$NEXUS_HOME"
  npm init -y --silent > /dev/null 2>&1
  echo "   ✅ Initialized package.json"
fi

cd "$NEXUS_HOME"

# Install core dependencies
echo "   📦 Installing tree-sitter + better-sqlite3..."
npm install --save \
  tree-sitter@0.25 \
  tree-sitter-typescript@0.25 \
  tree-sitter-javascript@0.25 \
  better-sqlite3@11 \
  2>&1 | tail -1

echo "   ✅ Core dependencies installed"

# Verify
node -e "
const Parser = require('tree-sitter');
const TS = require('tree-sitter-typescript');
const DB = require('better-sqlite3');
console.log('   ✅ tree-sitter: OK');
console.log('   ✅ better-sqlite3: OK');
console.log('');
console.log('🎉 Setup complete. Run indexer.js on any project to start.');
"
