# Claude AI 工作系统

这个目录包含了完整的AI助手系统配置和记忆恢复机制。

---

## 📚 文档导航

### 🎯 用户文档（给你看的）

| 文档 | 作用 | 何时使用 |
|------|------|---------|
| [QUICK_START.md](QUICK_START.md) | 5分钟快速上手 | 第一次使用 |
| [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) | 完整架构说明 | 了解系统设计 |
| [../WORK_LOG.md](../WORK_LOG.md) | 工作日志 ⭐ | 每次对话结束前 |

### 🤖 AI文档（给AI看的）

| 文档 | 作用 | 何时使用 |
|------|------|---------|
| [HOW_TO_RESUME.md](HOW_TO_RESUME.md) | AI恢复记忆指南 | 每次新对话开始 |
| [../CLAUDE.md](../CLAUDE.md) | 项目完整记忆 | 深度理解项目 |

---

## 🤖 Sub-agent 系统

### 8个专业助手

```
📊 测试层 (3个 - Sonnet)
├── sso-tester.md             SSO自动化测试
├── stripe-tester.md          支付流程测试
└── cross-site-validator.md   配置一致性验证

💻 开发层 (2个 - Sonnet)
├── multi-site-coder.md       多站点代码编写
└── supabase-manager.md       数据库管理

🔒 审查层 (2个)
├── security-auditor.md       深度安全审计 (Opus ⭐)
└── performance-analyzer.md   性能分析 (Sonnet)

🔧 特殊角色 (1个 - Haiku)
└── git-manager.md            Git仓库管理
```

### 使用方式

**自动调度**（推荐）：
```
"我修改了Auth站点的登录逻辑"
→ AI会自动调用 sso-tester 测试
```

**手动调用**：
```
"用 sso-tester 测试一下"
"用 git-manager 检查状态"
"用 security-auditor 做审计"
```

---

## 🔄 记忆恢复系统

### 工作流程

#### 新对话开始时

```
1. AI说："让我恢复一下记忆..."
2. AI读取 WORK_LOG.md
3. AI总结："上次完成了XXX，下次要做XXX，对吗？"
4. 你确认，开始工作
```

#### 对话结束前

```
1. AI提醒："要不要更新工作日志？"
2. 总结今天完成的事
3. 记录下次要做的事
4. 更新 WORK_LOG.md
```

### 三层记忆

```
WORK_LOG.md          ⭐ 最新状态（AI优先读）
CLAUDE.md            📚 完整历史（深度理解）
HOW_TO_RESUME.md     🔄 恢复指南（教AI怎么做）
```

---

## 🚀 快速开始

### 第一次使用

1. 读 [QUICK_START.md](QUICK_START.md)（5分钟）
2. 试着说：
   ```
   "用 git-manager 检查状态"
   "测试一下SSO登录"
   ```
3. 查看Sub-agent生成的报告

### 下次对话

1. 新AI会说："让我恢复记忆..."
2. 读取 WORK_LOG.md
3. 继续上次的工作

---

## 📊 系统设计理念

### 问题

- ❌ 对话结束后，AI丢失所有记忆
- ❌ 用户每次都要重新解释项目
- ❌ Sub-agent的知识容易丢失

### 解决

- ✅ **文件系统**：持久化记忆（WORK_LOG.md）
- ✅ **标准流程**：恢复记忆的固定步骤
- ✅ **Sub-agent配置**：永久保存在文件中

### 创新点

1. **三层记忆系统**：最新状态 + 完整历史 + 恢复指南
2. **面向AI的文档**：HOW_TO_RESUME.md专门教AI
3. **标准化流程**：对话开始/结束的固定步骤

---

## 🎯 关键文件位置

```
项目根目录/
├── WORK_LOG.md              ⭐ 工作日志（必读/必更新）
├── CLAUDE.md                📚 项目记忆主文件
├── .claude/
│   ├── README.md            📖 本文件
│   ├── QUICK_START.md       🚀 5分钟快速上手
│   ├── AGENT_ARCHITECTURE.md 🏗️ 完整架构说明
│   ├── HOW_TO_RESUME.md     🔄 AI恢复记忆指南
│   └── agents/              🤖 8个Sub-agent配置
│       ├── sso-tester.md
│       ├── stripe-tester.md
│       ├── cross-site-validator.md
│       ├── multi-site-coder.md
│       ├── supabase-manager.md
│       ├── security-auditor.md
│       ├── performance-analyzer.md
│       └── git-manager.md
├── git-push-all.sh          🔧 Git管理脚本
└── (其他工具脚本)
```

---

## 💡 最佳实践

### 给用户

1. **每次对话结束前**：更新WORK_LOG.md
2. **遇到问题时**：记录在WORK_LOG.md的"遇到的问题"
3. **重要决策**：记录原因，方便未来回顾

### 给AI

1. **对话开始时**：先读WORK_LOG.md恢复记忆
2. **不确定时**：询问用户而不是猜测
3. **对话结束前**：提醒用户更新工作日志

---

## 🔗 相关链接

- [项目主README](../README.md)（如果有）
- [Git多仓库指南](../docs/guides/GIT_MULTI_PROJECT_GUIDE.md)（如果有）
- [部署文档](../docs/deployment/)（如果有）

---

**创建时间**: 2025-11-10
**维护者**: Claude AI Team
**版本**: v1.0

**下次对话请先读**: [HOW_TO_RESUME.md](HOW_TO_RESUME.md) ⭐
