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
专家 Agent（工作者）- 按编号分类
├── 1xx 开发类（database-expert, architecture-guardian, domain-expert, frontend-expert）
├── 2xx 测试类（security-reviewer）
├── 3xx 内容类（requirements-designer）
└── 5xx 商业类（business-analyst, seo-expert）
```

## 编号系统

采用3位数字编码 `XYY`：
- **X** = 层级（1开发/2测试/3内容/4管理/5商业）
- **YY** = 序号（01-99）

| 层级 | 用途 | 示例 |
|------|------|------|
| 1xx | 开发相关 | 101-database-expert |
| 2xx | 测试审查 | 201-security-reviewer |
| 3xx | 内容需求 | 301-requirements-designer |
| 4xx | 管理运维 | 401-git-manager |
| 5xx | 商业增长 | 501-business-analyst |

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
    ├── agents/            # Agent 定义（按编号命名）
    │   ├── AGENT-TEMPLATE.md
    │   ├── 1xx-*.md       # 开发类
    │   ├── 2xx-*.md       # 测试类
    │   ├── 3xx-*.md       # 内容类
    │   ├── 5xx-*.md       # 商业类
    │   │
    │   └── knowledge/     # 📚 专业知识库
    │       ├── _shared/   # 通用质量规范
    │       ├── 501-business/
    │       └── 502-seo/
    │
    ├── TASKS.md           # 工作记忆（当前任务）
    ├── SESSION.md         # 会话日志
    └── PROGRESS.md        # 进度追踪
```

## 知识库架构

**设计原则**：配置简洁 + 知识分离

```
agents/
├── 501-business-analyst.md    # Agent配置（~50行）
└── knowledge/
    ├── _shared/
    │   ├── code-quality.md    # 代码去水规范
    │   └── doc-quality.md     # 文档去水规范
    │
    └── 501-business/
        ├── STARTUP.md         # 启动必读（核心概念）
        └── tracking-guide.md  # 详细指南
```

**Agent 启动流程**：
1. 主Claude调用 Task(subagent_type='business-analyst')
2. Agent 读取 501-business-analyst.md（简洁配置）
3. Agent 读取 knowledge/501-business/STARTUP.md（核心概念）
4. 如需详细信息，读取对应的指南文件

## Agent 设计规范

每个 Agent 文件包含：

1. **YAML头部**：name, description, tools, model
2. **启动必读**：指向 knowledge/XXX/STARTUP.md
3. **核心职责**：简明扼要
4. **触发场景**：什么时候调用
5. **输出格式**：返回摘要的标准格式

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

# 3. 按需扩展 Agent
# - 复制 AGENT-TEMPLATE.md
# - 分配编号（层级 + 序号）
# - 创建知识库目录
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

---

**版本**: v2.1
**更新日期**: 2025-12-04
