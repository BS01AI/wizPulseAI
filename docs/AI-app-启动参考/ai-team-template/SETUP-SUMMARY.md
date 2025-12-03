# AI 团队搭建总结

## 架构概览

基于 Anthropic 官方工程博客的最佳实践，采用**编排器-工作者模式**。

```
主 Claude（长期助手/编排器）
├── 读取记忆（CLAUDE.md）
├── 读取任务（TASKS.md, SESSION.md）
├── 调度专家 Agent
└── 综合结果，边做边存
        ↓
专家 Agent（工作者）
├── database-expert（数据库专家）
├── requirements-designer（需求设计专家）
├── architecture-guardian（架构守护者）
├── domain-expert（业务领域专家）
├── frontend-expert（前端专家）
└── security-reviewer（安全审查专家）
```

## 核心原则

### 1. 人类掌控
- 决策权在人类，AI 是专家顾问
- 每一步可 Review，可回滚

### 2. 简单透明
- 从简单开始，按需增加复杂度
- 保持可见性，避免黑箱操作

### 3. 边做边存
- 每个里程碑都保存记录
- 不等任务结束才更新

### 4. 摘要返回
- 子 Agent 返回摘要，不是完整分析
- 减少主 Claude 的认知负荷

## 文件结构

```
项目根目录/
├── CLAUDE.md              # 长期记忆（核心知识+架构+记录）
└── .claude/
    ├── agents/            # Agent 定义
    │   ├── database-expert.md
    │   ├── requirements-designer.md
    │   ├── architecture-guardian.md
    │   ├── domain-expert.md
    │   ├── frontend-expert.md
    │   └── security-reviewer.md
    │
    ├── TASKS.md           # 工作记忆（当前任务）
    ├── SESSION.md         # 会话日志
    └── PROGRESS.md        # 进度追踪
```

## Agent 设计规范

每个 Agent 文件包含：

1. **角色定义**：一句话说明职责
2. **触发词**：什么时候调用这个 Agent
3. **可用工具**：Read, Grep, Glob, Bash, WebSearch 等
4. **输出格式**：返回摘要的标准格式
5. **不做的事**：明确边界

## 使用流程

### 新项目接入

```bash
# 1. 复制模板
cp ai-team-template/CLAUDE.md.template /your-project/CLAUDE.md
mkdir -p /your-project/.claude
cp -r ai-team-template/agents /your-project/.claude/
cp ai-team-template/workflow/* /your-project/.claude/

# 2. 修改 CLAUDE.md
# - 填写项目信息
# - 添加架构原则
# - 添加业务规则
```

### 日常使用

1. 开始会话 → 主 Claude 读取记忆
2. 接收任务 → 分析需要哪些专家
3. 调用专家 → Task 工具并行/串行
4. 综合结果 → 更新记录
5. 结束会话 → 确保记录已保存

## 参考资料

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
