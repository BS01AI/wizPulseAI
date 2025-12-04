# WizPulseAI AI 团队

> 基于 Anthropic 官方最佳实践的编排器-工作者模式
>
> **编码规则**: 3位数字 `XYY`
> - X = 层级（1开发/2测试/3内容/4管理/5商业）
> - YY = 序号（01-99）

---

## 架构概览

```
主 Claude（编排器）
├── 读取记忆（CLAUDE.md, WORK_LOG.md）
├── 读取任务（TASKS.md, SESSION.md）
├── 调度专家 Agent（通过 Task 工具）
└── 综合结果，边做边存
        ↓
专家 Agent（工作者）- 17个
```

---

## 完整 Agent 清单

### 1xx - 开发类（5个）

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 101 | `101-database-expert.md` | 数据库+Supabase操作 | 表结构、RLS、SQL、日志 |
| 102 | `102-architecture-guardian.md` | 架构守护、代码Review | Review、架构、规范 |
| 103 | `103-multi-site-coder.md` | 三站点开发、SSO | 多站点、跨站点 |
| 104 | `104-rtl-ui-specialist.md` | RTL布局、阿拉伯语UI | RTL、阿拉伯语、ar |
| 105 | `105-prompt-designer.md` | AI产品Prompt设计 | Prompt、提示词 |

### 2xx - 测试类（4个）

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 201 | `201-site-validator.md` | SSO测试+跨站点验证 | 测试登录、验证配置 |
| 202 | `202-stripe-tester.md` | 支付流程测试 | 支付测试、Stripe |
| 203 | `203-security-auditor.md` | 安全审计 | 安全、漏洞、审计 |
| 204 | `204-performance-analyzer.md` | 性能分析 | 性能、优化、加载 |

### 3xx - 内容类（5个）

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 301 | `301-content-writer.md` | 文章/知识库创作 | 写文章、内容 |
| 302 | `302-translation-manager.md` | 翻译管理（3层流程）| 翻译、多语言 |
| 303 | `303-translator-layer1.md` | 初译 | - |
| 304 | `304-translator-layer2.md` | 校对 | - |
| 305 | `305-translator-layer3.md` | 润色 | - |

### 4xx - 管理类（1个）

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 401 | `401-git-manager.md` | Git提交、多仓库管理 | 提交、推送、Git |

### 5xx - 商业类（2个）

| 编号 | 文件 | 职责 | 触发词 |
|------|------|------|--------|
| 501 | `501-business-analyst.md` | 客户定位、留存、转化、埋点 | 客户、留存、转化、漏斗、埋点 |
| 502 | `502-seo-expert.md` | SEO/GEO/AEO优化 | SEO、GEO、关键词、排名 |

---

## 使用方式

### 自动调度（推荐）

主 Claude 根据上下文自动调用专家：

```
你: "帮我检查一下数据库的 RLS 策略"
主AI: → 自动调用 101-database-expert
```

### 手动指定

```
你: "用 201-site-validator 测试登录流程"
你: "用 401-git-manager 提交改动"
```

---

## Task 调用机制

### 并行执行

同一消息发起多个 Task = 并行运行（最多10个）

```
┌─ 101-database-expert ─┐
├─ 203-security-auditor ├─→ 同时执行
└─ 102-architecture-guardian ─┘
```

### 串行执行

分开消息各发一个 Task = 顺序运行

```
需求分析 → 架构设计 → 代码实现
```

---

## 核心原则

1. **人类决策**：AI 给建议，用户做决定
2. **边做边存**：每完成里程碑就更新记录
3. **摘要返回**：专家返回摘要，不是完整分析
4. **简单透明**：保持可见性，每步可 Review

---

## 文件结构

```
.claude/agents/
├── README.md                   # 本文件
├── AGENT-TEMPLATE.md           # 创建新Agent的模板
│
├── # === Agent 配置文件（简洁版） ===
├── 1xx-*.md                    # 开发类（5个）
├── 2xx-*.md                    # 测试类（4个）
├── 3xx-*.md                    # 内容类（5个）
├── 4xx-*.md                    # 管理类（1个）
├── 5xx-*.md                    # 商业类（2个）
│
└── knowledge/                  # 📚 专业知识库
    ├── _shared/                # 🔧 通用质量规范
    │   ├── code-quality.md     # 代码去水规范
    │   └── doc-quality.md      # 文档去水规范
    │
    ├── 501-business/           # 商业分析知识
    │   ├── STARTUP.md          # 启动必读
    │   └── tracking-guide.md   # 埋点规划
    │
    └── 502-seo/                # SEO/AEO/GEO 知识
        ├── STARTUP.md          # 启动必读
        ├── seo-aeo-geo-guide.md # 完整指南
        └── checklists.md       # 检查清单
```

## 知识库架构

**设计原则**：配置简洁 + 知识分离

| 文件类型 | 内容 | 长度 |
|---------|------|------|
| `XXX-agent.md` | Agent配置（职责、工具、触发词） | ~50行 |
| `knowledge/_shared/*.md` | 通用质量规范（代码/文档去水） | ~80行 |
| `knowledge/XXX/STARTUP.md` | 启动必读（核心概念） | ~50行 |
| `knowledge/XXX/*.md` | 详细指南、模板、检查清单 | 按需 |

**质量规范引用**：

| Agent | 引用规范 |
|-------|---------|
| 102-architecture-guardian | code-quality.md |
| 103-multi-site-coder | code-quality.md |
| 301-content-writer | doc-quality.md |
| 502-seo-expert | doc-quality.md |

**Agent 启动流程**：
```
1. 主Claude调用 Task(subagent_type='seo-expert')
2. Agent 读取 502-seo-expert.md（简洁配置）
3. Agent 读取 knowledge/502-seo/STARTUP.md（核心概念）
4. 如需详细信息，读取对应的指南文件
```

---

## 记忆系统

| 文件 | 用途 | 位置 |
|------|------|------|
| `CLAUDE.md` | 长期记忆 | 根目录 |
| `CLAUDE-PROTOCOL.md` | 主Claude协议 | 根目录 |
| `WORK_LOG.md` | 工作日志 | 根目录 |
| `TASKS.md` | 当前任务 | 根目录 |
| `SESSION.md` | 会话日志 | 根目录 |
| `PROGRESS.md` | 进度追踪 | 根目录 |

---

## 创建新 Agent

1. 复制 `AGENT-TEMPLATE.md`
2. 确定编号（层级 + 下一个序号）
3. 修改 YAML 头部
4. 填写职责和触发词
5. 更新本 README

---

## 变更记录

### 2025-12-04 v2.0 重构

**新编码系统**：
- 采用3位数字编码 `XYY`
- 1xx开发 / 2xx测试 / 3xx内容 / 4xx管理 / 5xx商业

**合并**：
- database-expert + supabase-manager → 101-database-expert
- sso-tester + cross-site-validator → 201-site-validator

**保留独立**：
- 104-rtl-ui-specialist（阿拉伯语专项）
- 105-prompt-designer（AI Prompt设计）
- 翻译团队（302-305）

---

## 常用脚本

```bash
# Git 管理
./git-push-all.sh status

# 服务管理
./start-all.sh
./stop-all.sh
./check-status.sh
```

---

**最后更新**: 2025-12-04
**Agent 数量**: 17个
**架构版本**: v2.1（新增商业类）
