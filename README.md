# WizPulseAI 项目管理仓库

> 这个仓库管理 WizPulseAI 多站点项目的配置、文档和工具脚本

## 📁 项目结构

```
wizPulseAI/
├── auth-wizpulseai-com/       # 认证中心 (独立 Git 仓库)
├── db-wizPulseAI-com/          # 用户仪表盘 (独立 Git 仓库)
├── wizPulseAI-com/             # 主站 (独立 Git 仓库)
│
├── docs/                       # 📚 项目文档库 ✅
│   ├── README.md              # 文档索引
│   ├── guides/                # 使用指南
│   │   ├── LOCAL_TEST_GUIDE.md
│   │   └── MCP_GUIDE.md
│   ├── planning/              # 规划文档
│   │   ├── NEXT_STEPS.md
│   │   └── CLEANUP_PLAN.md
│   ├── technical-docs/        # 技术文档
│   ├── design/                # 设计文档
│   └── DEVELOPMENT_PLAN.md    # 开发规划总纲
│
├── scripts/                    # 🛠️ 工具脚本 ✅
│   ├── start-all.sh
│   ├── stop-all.sh
│   ├── install-deps.sh
│   ├── check-status.sh
│   ├── view-logs.sh
│   └── README.md
│
├── e2e/                        # 🧪 E2E 测试 ✅
│
├── README.md                   # 📖 项目总览 ✅
├── CLAUDE.md                   # 🧠 AI 记忆 ✅
├── start.sh                    # 🚀 快捷启动 ✅
├── stop.sh                     # 🛑 快捷停止 ✅
└── .mcp.json                   # ⚙️  MCP 配置 ✅
```

**✅ 标记的文件**: 由外层仓库管理
**独立 Git 仓库**: 子项目各自管理

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm
- Supabase 账号

### 安装依赖
```bash
# 快速安装所有依赖
./scripts/install-deps.sh

# 或手动安装
cd auth-wizpulseai-com && npm install && cd ..
cd db-wizPulseAI-com && npm install && cd ..
cd wizPulseAI-com && npm install && cd ..
```

### 启动所有站点
```bash
./start.sh
```

访问地址：
- 🔐 Auth: http://localhost:3001
- 📊 Dashboard: http://localhost:3002
- 🌐 Main: http://localhost:3000

### 停止所有站点
```bash
./stop.sh
```

### 其他实用脚本
```bash
# 检查站点运行状态
./scripts/check-status.sh

# 查看日志
./scripts/view-logs.sh all       # 查看所有日志
./scripts/view-logs.sh auth      # 只看 Auth 日志
./scripts/view-logs.sh dashboard # 只看 Dashboard 日志
./scripts/view-logs.sh main      # 只看 Main 日志
```

详见 [scripts/README.md](scripts/README.md)

---

## 📚 文档

### 核心文档
- [CLAUDE.md](CLAUDE.md) - AI 助手记忆文档（项目历史和决策）
- [docs/README.md](docs/README.md) - 📖 完整文档索引

### 快速链接
- [docs/guides/LOCAL_TEST_GUIDE.md](docs/guides/LOCAL_TEST_GUIDE.md) - 本地测试指南
- [docs/guides/MCP_GUIDE.md](docs/guides/MCP_GUIDE.md) - MCP 工具使用
- [docs/planning/NEXT_STEPS.md](docs/planning/NEXT_STEPS.md) - 开发计划
- [scripts/README.md](scripts/README.md) - 脚本工具说明

---

## 🔧 技术栈

### 共享技术
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (认证 + 数据库)

### 站点特性
- **Auth**: Supabase Auth + Google OAuth
- **Dashboard**: Stripe 支付 + 管理面板
- **Main**: Three.js + Framer Motion

---

## 🛠️ MCP 工具链

项目配置了7个 MCP 服务器：
1. filesystem - 文件操作
2. notionApi - 任务管理
3. supabase - 数据库管理
4. chrome-devtools - 浏览器调试
5. playwright - E2E 测试
6. stripe - 支付管理
7. Context7 - 文档查询

详见 [docs/guides/MCP_GUIDE.md](docs/guides/MCP_GUIDE.md)

---

## 🌲 Git 仓库说明

### 外层仓库（本仓库）
管理项目级配置、文档、脚本

### 子项目仓库（独立）
每个站点有自己的 Git 仓库：
- auth-wizpulseai-com
- db-wizPulseAI-com
- wizPulseAI-com

---

## 📦 完整克隆步骤

```bash
# 1. 克隆配置仓库
git clone <this-repo-url> wizPulseAI
cd wizPulseAI

# 2. 克隆3个子项目（如果有远程仓库）
git clone <auth-repo-url> auth-wizpulseai-com
git clone <dashboard-repo-url> db-wizPulseAI-com
git clone <main-repo-url> wizPulseAI-com

# 3. 安装所有依赖
./scripts/install-deps.sh

# 4. 配置环境变量
# 参考各站点的 .env.example 文件

# 5. 启动
./start.sh
```

---

## 🤝 协作开发

### AI 助手记忆
项目使用 CLAUDE.md 记录开发历史和决策，便于 AI 助手快速上下文理解。

### 项目管理
使用 Notion + MCP 进行任务追踪和文档管理。

---

## 📄 License

[根据你的需要添加]

---

最后更新: 2025-10-30
