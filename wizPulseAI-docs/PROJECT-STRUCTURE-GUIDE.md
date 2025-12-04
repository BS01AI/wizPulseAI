# SPF 项目目录结构指南

> 项目目录整理经验总结（2025-12-03）

## 根目录结构

```
SPF-system/
├── src/                    # 源代码（Next.js应用）
├── database/               # 数据库相关（migrations, tools, 备份）
├── scripts/                # 常用脚本（备份、发布、监控）
├── docs/                   # 工程文档（指南、架构、规范）
├── e2e/                    # 端到端测试
├── analysis-reports/       # 架构分析报告
├── public/                 # 静态资源
├── CLAUDE.md               # AI工作记忆（核心！）
└── README.md               # 项目说明
```

## 重要目录详解

### scripts/ - 常用脚本

| 脚本 | 用途 | 频率 |
|------|------|------|
| `backup-production.sh` | 生产环境完整备份 | 每周 |
| `backup-dev.sh` | 开发环境备份 | 按需 |
| `view-backup.sh` | 查看备份（启动PostgreSQL容器） | 按需 |
| `run-sql.sh` | 执行SQL脚本（支持多租户） | 常用 |
| `release-to-main.sh` | 发布到main分支（自动排除开发目录） | 发布时 |
| `backup-schema-by-domain.sh` | 按域导出Schema | 每周 |

**子目录**：
- `monitoring/` - 监控工具
- `project-stats/` - 项目统计脚本
- `_archive/` - 已归档的旧脚本

### database/ - 数据库相关

| 目录 | 用途 |
|------|------|
| `migrations/` | 正式迁移脚本（~130个，按日期命名） |
| `tools/` | 工具SQL（checks/, fixes/, cleanup/） |
| `schema-by-domain/` | Schema历史备份 |
| `user-management/` | 用户创建脚本（支持多租户） |
| `production-migration/` | 生产环境迁移脚本 |
| `rls-policies/` | RLS策略导出 |
| `_archive/` | 季度压缩归档 |

**重要脚本**：
```bash
# 创建租户用户
cd database/user-management && ./create-users.sh basl

# 执行SQL
./scripts/run-sql.sh database/migrations/xxx.sql        # dev
./scripts/run-sql.sh basl database/migrations/xxx.sql   # BASL租户
```

### docs/ - 工程文档

| 目录 | 用途 | 示例 |
|------|------|------|
| `guides/` | 操作指南 | `*-GUIDE.md`, `*-README.md` |
| `architecture/` | 架构设计 | `*-ARCHITECTURE.md` |
| `standards/` | 开发规范 | `COMMIT-MESSAGES.md` |
| `features/` | 功能实施文档 | 功能名-实施.md |
| `_archive/` | 临时分析（可定期清理） | `*-ANALYSIS.md` |

**规则**：
- 临时分析文档写完后移到 `_archive/`
- 有长期价值的移到对应分类目录
- 定期清理 `_archive/`（建议每月）

## 分支策略

```
main（生产）: 只有src/等生产代码
develop（开发）: 包含所有文件（database/, docs/, scripts/等）
```

**发布命令**：
```bash
./scripts/release-to-main.sh v1.0.x
```
自动排除：database/, docs/, scripts/, __tests__/, analysis-reports/

## 备份归档规则

**按季度压缩**：
- Q1(1-3月) → 4月初压缩
- Q2(4-6月) → 7月初压缩
- Q3(7-9月) → 10月初压缩
- Q4(10-12月) → 1月初压缩

**压缩命令**：
```bash
cd database/schema-by-domain
tar -czf ../_archive/schema-archive-2025-Q3.tar.gz 2025{07,08,09}*
rm -rf 2025{07,08,09}*
```

## 多租户支持

**子域名路由**：
- `spf.g2link.jp` → 默认客户
- `basl.spf.g2link.jp` → BASL客户

**环境变量**：
```bash
NEXT_PUBLIC_SUPABASE_URL=xxx          # 默认
NEXT_PUBLIC_SUPABASE_URL_BASL=yyy     # BASL
```

**用户管理**：
```
database/user-management/
├── customers/dev/users.json    # 开发环境
├── customers/main/users.json   # 正式环境
├── customers/basl/users.json   # BASL租户
└── create-users.sh             # 通用创建脚本
```

## 核心配置文件

| 文件 | 用途 |
|------|------|
| `CLAUDE.md` | AI工作记忆（项目核心知识） |
| `.env.local` | 本地环境变量 |
| `.mcp.json` | MCP服务器配置 |
| `.gitignore` | Git忽略规则 |
| `.vercelignore` | Vercel部署忽略 |

## 整理原则总结

1. **开发文件不上生产**：database/, docs/, scripts/ 只在develop分支
2. **按职责分目录**：SQL → database/, 脚本 → scripts/, 文档 → docs/
3. **定期归档**：季度压缩备份，月度清理临时文档
4. **命名规范**：日期前缀（YYYYMMDD-）、大写连字符（FEATURE-NAME.md）
5. **README必备**：重要目录都有README说明

---
*最后更新: 2025-12-03*
