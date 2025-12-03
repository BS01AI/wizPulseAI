# AI 团队模板

基于 Anthropic 官方工程博客最佳实践的 Claude Code AI 团队架构模板。

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
├── agents/                      # Agent 定义（7个）
│   ├── AGENT-TEMPLATE.md        # 通用模板（创建新Agent时参考）
│   ├── database-expert.md       # 数据库专家
│   ├── requirements-designer.md # 需求设计专家
│   ├── architecture-guardian.md # 架构守护者
│   ├── domain-expert.md         # 业务领域专家
│   ├── frontend-expert.md       # 前端专家
│   └── security-reviewer.md     # 安全审查专家
│
└── workflow/                    # 工作流文件（3个）
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
```

### 记忆管理

| 层级 | 文件 | 用途 |
|------|------|------|
| 长期记忆 | CLAUDE.md | 核心知识、架构原则、完成记录 |
| 工作记忆 | .claude/TASKS.md | 当前任务清单 |
| 会话日志 | .claude/SESSION.md | 会话进度日志 |
| 进度追踪 | .claude/PROGRESS.md | 里程碑和完成度 |

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

## 参考资料

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
