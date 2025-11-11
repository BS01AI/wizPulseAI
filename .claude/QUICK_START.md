# Sub-agent 快速上手指南

## 🚀 5分钟快速开始

### 第一步：确认Sub-agent已加载

打开Claude Code，你应该能看到：

```
.claude/agents/
├── sso-tester.md
├── stripe-tester.md
├── cross-site-validator.md
├── multi-site-coder.md
├── supabase-manager.md
├── security-auditor.md
├── performance-analyzer.md
└── git-manager.md
```

✅ 如果文件存在，Claude会自动识别这些Sub-agent。

---

### 第二步：直接使用（最简单）

**方式1：自动调度（推荐）**

```bash
# 你只需要说：
"我修改了Auth站点的登录逻辑"

# 主AI会自动：
# 1. 完成代码修改
# 2. 调用 sso-tester 测试
# 3. 调用 git-manager 提交
```

**方式2：手动指定**

```bash
# 明确调用某个Sub-agent：
"用 sso-tester 测试一下登录功能"
"用 git-manager 检查所有仓库状态"
"用 security-auditor 做一次安全审计"
```

---

### 第三步：查看结果

Sub-agent执行后会生成详细报告，包括：
- ✅ 成功/失败状态
- 📋 执行步骤
- 📸 截图（如果有）
- 💡 优化建议

---

## 🎯 常用命令速查

### SSO测试
```bash
"测试一下SSO登录"
"验证认证功能是否正常"
```

### Git管理
```bash
"检查所有仓库状态"
"提交所有改动"
./git-push-all.sh status  # 手动脚本
```

### 配置检查
```bash
"检查三个站点的配置一致性"
"验证Supabase配置是否同步"
```

### 安全审计（使用Opus）
```bash
"做一次完整的安全审计"
"检查认证系统的安全性"
```

### 数据库操作
```bash
"查询数据库中的用户"
"检查最近的Auth日志"
"生成数据库类型定义"
```

### 性能分析
```bash
"分析Main站点的性能"
"检查Bundle大小"
```

---

## 📋 工作流程示例

### 场景1：添加新功能

```bash
你: "在Dashboard添加用户资料编辑功能"

主AI:
  → 分析需求
  → 编写代码（可能调用 multi-site-coder）
  → 测试功能
  → 询问："功能完成，是否提交？"

你: "先测试一下SSO"

sso-tester:
  → 运行自动化测试
  → 生成报告：✅ 所有测试通过

你: "好的，提交吧"

git-manager:
  → 检测 db-wizPulseAI-com 改动
  → 提交并推送
  → ✅ 完成
```

### 场景2：部署前检查

```bash
你: "准备部署到生产环境"

主AI:
  → 调用 cross-site-validator（配置检查）
  → 调用 sso-tester（完整测试）
  → 调用 security-auditor（安全审计）⭐ 使用Opus
  → 调用 performance-analyzer（性能检测）
  → 生成部署报告

主AI: "✅ 所有检查通过，可以部署"
```

---

## 💡 重要提示

### 自动vs手动

**大部分情况用自动调度**：
- 修改代码后，主AI会自动测试
- 功能完成后，主AI会自动询问是否提交

**少数情况用手动指定**：
- 想单独运行某个测试
- 想检查某个配置
- 想做深度审计

### Sub-agent的模型

- **6个用Sonnet**（主力）
- **1个用Opus**（security-auditor，深度思考）
- **1个用Haiku**（git-manager，经济模型）

### 工作记录

每次重要操作后，建议记录到 `WORK_LOG.md`：
```bash
"记录一下今天的工作"
# 或手动更新 WORK_LOG.md
```

---

## 🔧 故障排查

### 问题1：Sub-agent没有被调用

**原因**：主AI判断不需要
**解决**：手动指定 `"用 xxx 测试一下"`

### 问题2：想跳过某个Sub-agent

```bash
"跳过测试，直接提交"
"不需要安全审计"
```

### 问题3：Sub-agent执行失败

查看错误报告，通常包含：
- 失败原因
- 修复建议
- 相关代码位置

---

## 📚 更多资源

- **完整文档**: [AGENT_ARCHITECTURE.md](.claude/AGENT_ARCHITECTURE.md)
- **使用指南**: [agents/README.md](.claude/agents/README.md)
- **工作日志**: [WORK_LOG.md](WORK_LOG.md)（需创建）
- **项目记忆**: [CLAUDE.md](CLAUDE.md)

---

## 🎁 最佳实践

1. **信任自动调度** - 让主AI决定何时调用
2. **明确表达意图** - 如果不想提交，说"先不提交"
3. **查看报告** - Sub-agent会生成详细报告
4. **定期审计** - 建议每周用security-auditor检查一次
5. **记录工作** - 更新WORK_LOG.md保持记忆

---

**创建时间**: 2025-11-10
**维护者**: Claude AI
**版本**: v1.0
