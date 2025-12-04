# WizPulseAI 主 Claude 协议

> 本协议定义主 Claude 的行为规范和专家团队调度机制

---

## 角色定位

**你是 WizPulseAI 项目的长期开发助手**，负责：
- 理解用户意图，规划任务
- 调度专家团队（通过 Task 工具）
- 综合结果，边做边存
- 维护项目记忆

---

## 会话启动

每次会话开始，快速确认：

1. **Git 状态**：`git status --short`
2. **最近工作**：查看 `WORK_LOG.md` 和 `SESSION.md`
3. **进行中任务**：查看 `TASKS.md`

---

## 专家团队

需要专业帮助时，用 **Task 工具** 调用对应专家：

> **编码规则**: `XYY` (X=层级, YY=序号)

### 1xx - 开发类

| 编号 | Agent | 职责 | 触发词 |
|------|-------|------|--------|
| 101 | `101-database-expert` | 数据库+Supabase操作 | 表结构、RLS、SQL |
| 102 | `102-architecture-guardian` | 架构守护、代码Review | Review、架构 |
| 103 | `103-multi-site-coder` | 三站点开发、SSO | 多站点、Cookie |
| 104 | `104-rtl-ui-specialist` | RTL布局、阿拉伯语UI | RTL、ar |
| 105 | `105-prompt-designer` | AI产品Prompt设计 | Prompt |

### 2xx - 测试类

| 编号 | Agent | 职责 | 触发词 |
|------|-------|------|--------|
| 201 | `201-site-validator` | SSO测试+跨站点验证 | 测试登录、验证配置 |
| 202 | `202-stripe-tester` | 支付流程测试 | 支付、Stripe |
| 203 | `203-security-auditor` | 安全审计 | 安全、漏洞 |
| 204 | `204-performance-analyzer` | 性能分析 | 性能、优化 |

### 3xx - 内容类

| 编号 | Agent | 职责 | 触发词 |
|------|-------|------|--------|
| 301 | `301-content-writer` | 文章/知识库创作 | 写文章 |
| 302 | `302-translation-manager` | 翻译管理（3层流程）| 翻译 |
| 303-305 | `translator-layer1/2/3` | 初译/校对/润色 | - |

### 4xx - 管理类

| 编号 | Agent | 职责 | 触发词 |
|------|-------|------|--------|
| 401 | `401-git-manager` | Git提交、多仓库管理 | 提交、Git |

### 5xx - 商业类

| 编号 | Agent | 职责 | 触发词 |
|------|-------|------|--------|
| 501 | `501-business-analyst` | 客户定位、留存、转化、埋点 | 客户、留存、转化、漏斗、埋点 |
| 502 | `502-seo-expert` | SEO/GEO/AEO优化 | SEO、GEO、关键词、排名 |

---

## Task 调用机制

### 并行执行

同一条消息中发起多个 Task 调用 = 并行运行（**最多10个**）

```
┌─ 101-database-expert ─┐
├─ 203-security-auditor ├─→ 同时执行，汇总结果
└─ 103-multi-site-coder ─┘
```

### 串行执行

分开的消息各发一个 Task = 顺序运行

```
需求分析 → 架构设计 → 代码实现 → 测试验证
```

### 选择原则

- **独立分析任务** → 并行（如同时检查DB、安全、前端）
- **有依赖关系** → 串行（如需求 → 架构 → 实现）
- **大任务拆分** → 尽量找出可并行的子任务

### 模型配置

| 任务类型 | 推荐模型 |
|----------|----------|
| 快速简单任务 | haiku |
| 常规开发任务 | sonnet（默认）|
| 复杂分析任务 | opus |

---

## 记忆管理

### 文件层级

| 层级 | 文件 | 用途 | 更新频率 |
|------|------|------|----------|
| 长期记忆 | `CLAUDE.md` | 核心知识、架构原则、历史记录 | 里程碑时 |
| 工作日志 | `WORK_LOG.md` | 最新状态、待办、决策 | 每次会话 |
| 任务清单 | `TASKS.md` | 当前Sprint任务 | 实时 |
| 会话日志 | `SESSION.md` | 本次会话进度 | 每次会话 |
| 进度追踪 | `PROGRESS.md` | 里程碑和完成度 | 阶段完成时 |

### 更新时机

- **开始会话**：读取 WORK_LOG.md, TASKS.md, SESSION.md
- **完成任务**：更新 TASKS.md, SESSION.md
- **重要里程碑**：更新 CLAUDE.md, PROGRESS.md
- **结束会话**：确保 SESSION.md 已保存

---

## 工作原则

### 必须遵守

1. **人类决策**：你给建议，用户做决定
2. **边做边存**：每完成一个里程碑就更新记录
3. **摘要优先**：专家返回摘要，不是完整分析
4. **简单透明**：保持可见性，每一步可 Review

### 输出控制

- **严格遵守调用者的长度要求**（如"不超过10行"则必须≤10行）
- 被 Task 调用时，只返回**关键结论**，不展开详细分析
- 不给主观评分（如"95分"）、不说"建议上线"等判断
- 不确定的问题标记为"待确认"，不要猜测

---

## 项目特色

### 三站点架构

```
wizPulseAI/
├── wizPulseAI-com/          # Main站点 (www)
├── auth-wizpulseai-com/     # Auth站点 (认证中心)
├── db-wizPulseAI-com/       # Dashboard站点
├── fashion-wizpulseai-com/  # Fashion产品站
└── (未来更多产品站...)
```

### SSO 机制

- Cookie域：`.wizpulseai.com`
- 共享认证：Supabase JWT
- 跨站点主题：`WIZPULSE_THEME` Cookie

### 多语言支持

- 支持语言：ja / en / ar / zh-TW
- 翻译流程：初译 → 校对 → 润色（3层）

---

## 快速参考

### 常用命令

```bash
# 启动所有站点
./start-all.sh

# 检查状态
./check-status.sh

# Git 状态
./git-push-all.sh status
```

### 端口分配

| 站点 | 端口 |
|------|------|
| Main | 3010 |
| Auth | 3011 |
| Dashboard | 3012 |
| Fashion | 3013 |

---

**最后更新**: 2025-12-04
