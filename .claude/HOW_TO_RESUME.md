# 给下一个AI：如何快速恢复工作状态

## 📖 你好，新的对话！

如果你是接替上一次对话的AI，这个文档会帮你**5分钟内完全恢复状态**。

---

## 🎯 第一步：读取项目记忆（必读）

**优先级顺序**：

1. **WORK_LOG.md** ⭐ 最重要
   - 最新工作状态
   - 待办事项
   - 重要决策记录

2. **CLAUDE.md**
   - 完整项目记忆
   - 历史进展
   - 技术细节

3. **.claude/QUICK_START.md**
   - Sub-agent快速上手
   - 常用命令

4. **.claude/AGENT_ARCHITECTURE.md**
   - 8个Sub-agent详细说明
   - 架构设计

---

## 🤖 第二步：理解Sub-agent系统

### 你拥有8个专业助手

```
Layer 1: 测试层
├── sso-tester (Sonnet)           # SSO自动化测试
├── stripe-tester (Sonnet)        # 支付流程测试
└── cross-site-validator (Sonnet) # 配置一致性

Layer 2: 开发层
├── multi-site-coder (Sonnet)     # 多站点代码编写
└── supabase-manager (Sonnet)     # 数据库管理

Layer 3: 审查优化层
├── security-auditor (Opus)       # 深度安全审计 ⭐
└── performance-analyzer (Sonnet) # 性能分析

特殊角色
└── git-manager (Haiku)           # Git仓库管理
```

### 调度规则

**自动调度**（推荐）：
- 用户修改认证代码 → 自动调用 `sso-tester`
- 功能完成 + 测试通过 → 自动调用 `git-manager`
- 准备部署 → 自动调用 `security-auditor`

**手动调用**（用户明确指定）：
```bash
"用 sso-tester 测试一下"
"用 git-manager 检查状态"
```

### 重要提醒

- **security-auditor使用Opus** - 深度战略思考，成本较高但值得
- **git-manager使用Haiku** - 简单任务，成本优化
- **其他6个使用Sonnet** - 质量和成本平衡

---

## 🏗️ 第三步：理解项目架构

### 三站点SSO系统

```
Auth站点 (localhost:3011)
  ↓ 设置Cookie (domain=.localhost)
  ↓
Dashboard站点 (localhost:3012) ← 读取Cookie
Main站点 (localhost:3010) ← 读取Cookie
```

### 4个独立Git仓库

```
主仓库: wizPulseAI
  ├── auth-wizpulseai-com/     # 独立仓库1
  ├── db-wizPulseAI-com/       # 独立仓库2
  ├── wizPulseAI-com/          # 独立仓库3
  └── (主仓库自己)             # 仓库4
```

### 业务发展阶段

**当前：阶段2 - 内容扩展期**
- **高频**：Main站点（产品页面、知识中心）
- **中频**：主仓库（文档、脚本）
- **低频**：Auth/Dashboard（bug修复）

---

## 📋 第四步：检查待办事项

打开 `WORK_LOG.md`，查看：
- [ ] 下次要做的事（P0/P1/P2）
- [ ] 遇到的问题
- [ ] 重要决策

---

## 💡 第五步：快速验证

### 验证Sub-agent可用

```bash
# 检查文件存在
ls -la .claude/agents/
# 应该看到8个.md文件
```

### 验证Git状态

```bash
./git-push-all.sh status
# 查看哪些仓库有改动
```

### 验证服务运行

```bash
./check-status.sh
# 查看3个站点是否运行
```

---

## 🎯 常见用户请求处理

### 请求1："继续上次的工作"

1. 读取 `WORK_LOG.md` 的"下次要做的事"
2. 确认用户想做哪个
3. 开始执行

### 请求2："测试一下XXX功能"

1. 判断需要哪个Sub-agent
2. 手动调用或让用户确认
3. 生成测试报告

### 请求3："提交代码"

1. 调用 `git-manager` 检查状态
2. 确认用户要提交哪些仓库
3. 执行提交和推送

### 请求4："做一次安全检查"

1. 调用 `security-auditor` (Opus)
2. 生成详细审计报告
3. 提供修复建议

---

## 🔧 故障处理

### 问题1：用户说"你不记得之前的事了"

**原因**：新对话，记忆丢失

**解决**：
```bash
"让我先读取工作日志恢复记忆..."
# 然后读取 WORK_LOG.md 和 CLAUDE.md
```

### 问题2：Sub-agent没有被调用

**原因**：可能是判断不需要，或者调用失败

**解决**：
1. 检查 `.claude/agents/` 文件是否存在
2. 手动指定调用
3. 查看是否有错误信息

### 问题3：不知道项目状态

**解决**：
1. 先读 `WORK_LOG.md` 最新状态
2. 再读 `CLAUDE.md` 历史记录
3. 询问用户："我已恢复记忆，现在要做什么？"

---

## 📚 关键文件位置

```
根目录/
├── CLAUDE.md                    # 项目记忆主文件
├── WORK_LOG.md                  # 工作日志 ⭐ 优先读
├── .claude/
│   ├── QUICK_START.md           # 快速上手
│   ├── AGENT_ARCHITECTURE.md    # 架构文档
│   ├── HOW_TO_RESUME.md         # 本文件
│   └── agents/
│       ├── sso-tester.md
│       ├── stripe-tester.md
│       ├── cross-site-validator.md
│       ├── multi-site-coder.md
│       ├── supabase-manager.md
│       ├── security-auditor.md
│       ├── performance-analyzer.md
│       └── git-manager.md
├── git-push-all.sh              # Git管理脚本
├── start-all.sh                 # 启动所有站点
└── stop-all.sh                  # 停止所有站点
```

---

## 🎁 最佳实践

### 对话开始时

```
1. 先说："让我恢复一下记忆..."
2. 读取 WORK_LOG.md
3. 简要总结："我看到上次完成了XXX，下次要做XXX，对吗？"
4. 等待用户确认
```

### 对话结束前

```
1. 提醒用户："要不要我更新一下工作日志？"
2. 总结今天完成的事
3. 记录下次要做的事
4. 更新 WORK_LOG.md
```

### 调用Sub-agent时

```
1. 说明为什么要调用这个Sub-agent
2. 执行调用
3. 总结报告给用户
4. 询问下一步
```

---

## ⚠️ 重要提醒

### 记忆系统的限制

- ❌ 对话之间**不会**自动共享记忆
- ✅ 但通过文件系统可以**手动**恢复记忆
- ✅ WORK_LOG.md是**关键桥梁**

### Sub-agent的持久性

- ✅ Sub-agent配置文件是持久的
- ✅ 每次对话都可以调用
- ✅ 不需要重新创建

### 用户的期望

用户期望你：
1. **快速恢复状态**（5分钟内）
2. **理解上下文**（读WORK_LOG.md）
3. **继续工作**（不需要重新解释）

---

## 🚀 开始工作！

现在你已经准备好了：

1. ✅ 理解了Sub-agent系统
2. ✅ 知道如何恢复记忆
3. ✅ 了解项目架构
4. ✅ 掌握常见请求处理

**开始对话时说**：

```
"你好！让我先快速恢复一下工作状态..."
[读取 WORK_LOG.md]
"我看到上次完成了[XXX]，下次要做[XXX]。
今天要继续这个工作吗？还是有其他需求？"
```

---

**祝工作顺利！** 🎉

**创建时间**: 2025-11-10
**维护者**: Previous Claude AI
**目标**: Help next Claude AI resume quickly
