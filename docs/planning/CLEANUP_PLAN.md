# WizPulseAI 目录整理方案

## 📋 当前问题

1. **wizPulseAI-docs/** 是嵌入的 Git 仓库（需要去除 .git）
2. **根目录杂乱**：有旧的 patch 文件、备份文件等
3. **CLAUDE.md** 是符号链接，需要改为实体文件

---

## 🎯 整理目标

```
wizPulseAI/                     # 外层 Git 仓库
├── .git/                       # 外层 Git
├── .gitignore                  ✅
├── README.md                   ✅
├── CLAUDE.md                   ✅ (改为实体文件)
├── LOCAL_TEST_GUIDE.md         ✅
├── NEXT_STEPS.md               ✅
├── MCP_GUIDE.md                ✅
├── start-all.sh                ✅
├── stop-all.sh                 ✅
├── .mcp.json                   ✅
│
├── docs/                       ✅ 项目文档（整理后）
│   ├── DEVELOPMENT_PLAN.md
│   ├── technical-docs/
│   └── design/
│
├── e2e/                        ✅ E2E 测试
│
├── archive/                    ✅ 归档旧文件
│   ├── patches/               (*.patch)
│   ├── backups/               (backup_scripts, backups, *.sql)
│   └── old-scripts/           (scripts/)
│
├── logs/                       ✅ 运行日志
│
├── auth-wizpulseai-com/        ⛔ 忽略（独立 Git）
├── db-wizPulseAI-com/          ⛔ 忽略（独立 Git）
└── wizPulseAI-com/             ⛔ 忽略（独立 Git）
```

---

## 📝 执行步骤

### 步骤1: 去除 wizPulseAI-docs 的 .git

```bash
# 删除 wizPulseAI-docs 的 Git 仓库
rm -rf wizPulseAI-docs/.git

# 验证
ls -la wizPulseAI-docs/  # 应该看不到 .git 目录了
```

### 步骤2: 重命名 wizPulseAI-docs → docs

```bash
# 创建 docs 目录
mkdir -p docs

# 移动文件（跳过 CLAUDE.md，我们会单独处理）
cp wizPulseAI-docs/DEVELOPMENT_PLAN.md docs/
cp wizPulseAI-docs/commit_log.md docs/
cp -r wizPulseAI-docs/technical-docs docs/
cp -r wizPulseAI-docs/design docs/

# 删除符号链接
rm CLAUDE.md

# 复制 CLAUDE.md 作为实体文件
cp wizPulseAI-docs/CLAUDE.md ./CLAUDE.md

# 删除旧的 wizPulseAI-docs
rm -rf wizPulseAI-docs
```

### 步骤3: 创建 archive 目录归档旧文件

```bash
# 创建归档目录
mkdir -p archive/{patches,backups,old-scripts}

# 移动 patch 文件
mv *.patch archive/patches/

# 移动备份相关
mv backup_scripts archive/backups/
mv backups archive/backups/
mv wizpulseai_database_backup.sql archive/backups/

# 移动旧脚本（如果不需要）
mv scripts archive/old-scripts/
```

### 步骤4: 更新 .gitignore

```bash
cat >> .gitignore << 'EOF'

# ===== 归档目录 =====
archive/

# ===== 文档草稿 =====
docs/commit_log.md
EOF
```

### 步骤5: 重新提交

```bash
# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "refactor: 整理项目目录结构

- 去除 wizPulseAI-docs 的嵌入 Git 仓库
- 重命名为 docs/ 目录
- CLAUDE.md 改为实体文件（去除符号链接）
- 归档旧文件到 archive/ 目录
- 更新 .gitignore
"
```

---

## ✅ 整理后的目录结构

### 外层 Git 管理的文件

```
根目录文档:
├── README.md              # 项目总览
├── CLAUDE.md              # AI 记忆（实体文件）
├── LOCAL_TEST_GUIDE.md    # 测试指南
├── NEXT_STEPS.md          # 开发计划
└── MCP_GUIDE.md           # MCP 使用指南

配置和脚本:
├── .gitignore             # Git 忽略规则
├── .mcp.json              # MCP 配置
├── start-all.sh           # 启动脚本
└── stop-all.sh            # 停止脚本

项目文档:
└── docs/
    ├── DEVELOPMENT_PLAN.md
    ├── technical-docs/
    └── design/

测试:
└── e2e/                   # E2E 测试配置

运行时:
└── logs/                  # 运行日志（不提交）

归档:
└── archive/               # 旧文件（不提交）
```

### 忽略的目录

```
子项目（独立 Git）:
├── auth-wizpulseai-com/
├── db-wizPulseAI-com/
└── wizPulseAI-com/
```

---

## 🔍 验证清单

```bash
# 1. 确认 wizPulseAI-docs 没有 .git
ls -la wizPulseAI-docs/  # 应该不存在或没有 .git

# 2. 确认 CLAUDE.md 是实体文件
ls -l CLAUDE.md  # 不应该是符号链接 (->)

# 3. 确认目录结构
tree -L 2 -I 'node_modules|auth-wizpulseai-com|db-wizPulseAI-com|wizPulseAI-com' .

# 4. 确认 Git 状态
git status
```

---

## 📌 注意事项

1. **archive/ 目录**: 归档旧文件，不提交到 Git
2. **logs/ 目录**: 运行日志，不提交到 Git
3. **docs/ 目录**: 项目文档，提交到 Git
4. **CLAUDE.md**: 实体文件，提交到 Git

---

执行完成后，外层仓库的结构会非常清晰！
