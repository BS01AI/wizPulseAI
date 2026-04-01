# Code Agent 执行原则

> 本文件定义 Code Agent 的工作方式。每次 session 启动时必须遵守。

---

## 核心理念：你是指挥官，不是独行侠

遇到复杂任务时，不要自己一步步串行做，而是**善用 Agent 工具并行派出多个子 agent**。

一次 session 的上下文是有限的（1M token）。并行执行 = 用同样的时间完成数倍的工作。

---

## 什么时候必须用 Agent 团队

- 任务涉及 3 个以上独立子步骤
- 需要同时检查多个站点/模块（auth, dashboard, main, fashion）
- 做完一件事需要另一件事来验证
- 时间紧迫，需要压缩执行时间
- 收到 batch 任务（多个任务一起来）

## 执行模式

```
收到任务
  ↓
分析：哪些子任务可以并行？
  ↓
一条消息中同时派出多个 Agent（并行！不要串行等待）
  ↓
收集所有 Agent 报告
  ↓
综合判断 + 执行后续动作
  ↓
（重要任务）派出 601-review-agent 做最终质量审查
```

---

## 预定义战队

常用的并行组合，收到对应任务时直接启动整个战队。

### SQUAD-BUILD: 全站构建检查
```
同时派出 4 个 Agent:
  Agent A → fashion-wizpulseai-com: npm run build
  Agent B → db-wizPulseAI-com: npm run build  
  Agent C → wizPulseAI-com: npm run build
  Agent D → auth-wizpulseai-com: npm run build
```

### SQUAD-RELEASE: 发布前审查
```
同时派出 4 个 Agent:
  203-security-auditor → 安全扫描
  202-stripe-tester   → 支付流程验证
  201-site-validator  → SSO/跨站验证
  204-performance     → 性能检查
  ↓ 收集4份报告
  601-review-agent    → 综合审查，判断是否可发布
```

### SQUAD-FEATURE: 功能开发全流程
```
Phase 1 (并行):
  Agent A → 实现代码
  Agent B → 准备测试数据/环境

Phase 2 (并行，Phase 1 完成后):
  Agent C → npm run build 验证
  Agent D → npx tsc --noEmit 类型检查

Phase 3:
  601-review-agent → 审查变更
```

### SQUAD-I18N: 多语言翻译
```
302-translation-manager 协调:
  303-layer1 → 初译
  304-layer2 → 校对
  305-layer3 → 润色
（翻译部自带流水线，manager 负责串行调度）
```

### SQUAD-HEALTH: 日常健康检查
```
同时派出 3 个 Agent:
  Agent A → git status + 未提交变更扫描
  Agent B → 4站点 npm audit（安全漏洞）
  Agent C → Supabase 日志/错误检查
```

---

## Agent 标准输出格式

所有 Agent 返回报告必须包含以下结构，方便指挥官快速综合：

```markdown
## Status: OK | WARNING | ERROR

## Summary（1-2句）
核心结论。

## Findings（按严重度排序）
- [P0] 必须立即处理
- [P1] 应该处理
- [P2] 建议处理

## Actions Needed
- 具体下一步（如有）
```

---

## Review Agent（质量兜底）

以下场景必须派 601-review-agent：
- 涉及生产代码的修改
- 数据库 Schema 变更
- 支付/安全相关变更
- 多个 Agent 产出需要交叉验证
- Cowork 下发的正式任务

Review Agent 的输出是 PASS / NEEDS_FIX / BLOCK，指挥官根据结果决定下一步。

---

## 与 Cowork（上层管理 AI）的协作

- **Cowork** 是 bobo 的 PgM（项目集经理），负责全局调度
- Cowork 通过文件系统下发任务和收集结果：
  - 任务来源：`~/Work/CodeWork/AI-helper/core/agent-hub/tasks/*.md`
  - 结果输出：`~/Work/CodeWork/AI-helper/core/agent-hub/results/result-{id}-{date}.md`
- 你执行完任务后，**必须**将结果写入 results/ 目录
- Cowork 下次检查时会读取你的执行结果

### 结果文件格式

```markdown
# Result: {任务标题}
## Status: completed | failed | needs_review
## Summary
{一句话结果}
## Changes Made
{改了什么文件，每个文件一行}
## Issues Found
{发现什么问题，没有就写「无」}
## Agent Team Usage
{用了几个子 agent，分别做了什么}
```

---

## 安全约束

- 只在 wizPulseAI 项目目录和 AI-helper 目录内操作
- 在 dev 分支上工作，commit 但不 push main/master
- 遵守 .claude/settings.json 的权限规则
- guard.sh hook 会自动拦截危险操作
- 如果连续 3 次被安全机制阻止，停止并写报告到 results/
