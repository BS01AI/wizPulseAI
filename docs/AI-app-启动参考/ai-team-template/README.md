# AI 团队模板

基于 Anthropic 官方工程博客最佳实践的 Claude Code AI 团队架构模板。

> **编码规则**: 3位数字 `XYY`
> - X = 层级（1开发/2测试/3内容/4管理/5商业）
> - YY = 序号（01-99）

## 快速开始

```bash
# 1. 复制 CLAUDE.md 模板到项目根目录
cp ai-team-template/CLAUDE.md.template /your-project/CLAUDE.md

# 2. 复制 .claude 目录
mkdir -p /your-project/.claude
cp -r ai-team-template/agents /your-project/.claude/
cp ai-team-template/workflow/* /your-project/.claude/

# 3. 根据项目情况修改 CLAUDE.md
```

## 目录结构

```
ai-team-template/
├── README.md                    # 本文件
├── CLAUDE.md.template           # 主记忆模板（复制到项目根目录）
├── CLAUDE-PROTOCOL.md           # 主协议（CLAUDE.md开头部分）
├── SETUP-SUMMARY.md             # 搭建总结
│
├── agents/                      # Agent 定义
│   ├── AGENT-TEMPLATE.md        # 通用模板
│   │
│   ├── # === 1xx 开发类 ===
│   ├── 101-database-expert.md
│   ├── 102-architecture-guardian.md
│   ├── 103-domain-expert.md
│   ├── 104-frontend-expert.md
│   │
│   ├── # === 2xx 测试类 ===
│   ├── 201-security-reviewer.md
│   │
│   ├── # === 3xx 内容类 ===
│   ├── 301-requirements-designer.md
│   │
│   ├── # === 5xx 商业类 ===
│   ├── 501-business-analyst.md
│   ├── 502-seo-expert.md
│   │
│   └── knowledge/               # 📚 专业知识库
│       ├── _shared/             # 🔧 通用质量规范
│       │   ├── code-quality.md  # 代码去水规范
│       │   └── doc-quality.md   # 文档去水规范
│       │
│       ├── 501-business/        # 商业分析知识
│       │   ├── STARTUP.md       # 启动必读
│       │   └── tracking-guide.md
│       │
│       └── 502-seo/             # SEO/AEO/GEO 知识
│           ├── STARTUP.md       # 启动必读
│           ├── seo-aeo-geo-guide.md
│           └── checklists.md
│
└── workflow/                    # 工作流文件
    ├── TASKS.md                 # 任务清单
    ├── SESSION.md               # 会话日志
    └── PROGRESS.md              # 进度追踪
```

## 核心概念

### 编排器-工作者模式

```
主 Claude（长期助手/编排器）
├── 读取记忆（CLAUDE.md）
├── 读取任务（TASKS.md, SESSION.md）
├── 调度专家 Agent（通过 Task 工具）
└── 综合结果，边做边存
        ↓
专家 Agent（工作者）
```

### 编号系统

| 层级 | 编号 | 类型 | 示例 |
|------|------|------|------|
| 1xx | 开发类 | 代码、架构、数据库 | 101-database-expert |
| 2xx | 测试类 | 安全、性能、验证 | 201-security-reviewer |
| 3xx | 内容类 | 需求、文档、翻译 | 301-requirements-designer |
| 4xx | 管理类 | Git、部署、运维 | 401-git-manager |
| 5xx | 商业类 | 分析、SEO、增长 | 501-business-analyst |

### 知识库架构

**设计原则**：配置简洁 + 知识分离

| 文件类型 | 内容 | 长度 |
|---------|------|------|
| `XXX-agent.md` | Agent配置（职责、工具、触发词） | ~50行 |
| `knowledge/_shared/*.md` | 通用质量规范 | ~80行 |
| `knowledge/XXX/STARTUP.md` | 启动必读（核心概念） | ~50行 |
| `knowledge/XXX/*.md` | 详细指南、模板、检查清单 | 按需 |

### Task 调用机制

**并行执行**：同一条消息中发起多个 Task 调用
```
┌─ database-expert ─┐
├─ security-reviewer ├─→ 同时执行，汇总结果
└─ frontend-expert ─┘
```

**串行执行**：分开的消息各发一个 Task
```
requirements-designer → architecture-guardian → 实现
```

## Agent 清单

### 1xx - 开发类

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 101 | `101-database-expert.md` | 数据库设计+操作 | 表结构、RLS、SQL |
| 102 | `102-architecture-guardian.md` | 架构守护、代码Review | Review、架构、规范 |
| 103 | `103-domain-expert.md` | 业务领域逻辑 | 业务规则、领域模型 |
| 104 | `104-frontend-expert.md` | 前端开发 | UI、组件、样式 |

### 2xx - 测试类

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 201 | `201-security-reviewer.md` | 安全审查 | 安全、漏洞、审计 |

### 3xx - 内容类

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 301 | `301-requirements-designer.md` | 需求分析设计 | 需求、功能设计 |

### 5xx - 商业类

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 501 | `501-business-analyst.md` | 客户定位、留存、转化、埋点 | 客户、留存、漏斗、埋点 |
| 502 | `502-seo-expert.md` | SEO/AEO/GEO优化 | SEO、GEO、关键词、排名 |

## 核心原则

1. **人类掌控**：AI 给建议，用户做决定
2. **边做边存**：每完成里程碑就更新记录
3. **摘要返回**：专家返回摘要，不是完整分析
4. **简单透明**：保持可见性，每步可 Review

## 参考资料

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

**版本**: v2.1
**更新日期**: 2025-12-04
