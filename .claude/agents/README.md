# WizPulseAI Sub-agent 系统

专为 WizPulseAI 三站点 SSO 项目设计的智能助手团队。

## 📋 Sub-agent 总览

### 1. sso-tester（SSO 测试专家）⭐ 最常用
- **职责**：自动化测试 SSO 单点登录流程
- **使用场景**：修改认证相关代码后
- **工具**：Playwright、Chrome DevTools
- **模型**：Haiku（快速、经济）

### 2. git-manager（Git 管理专家）⭐ 最智能
- **职责**：管理 4 个独立 Git 仓库的提交和推送
- **使用场景**：功能完成、测试通过后
- **工具**：Bash、Read、Grep
- **模型**：Haiku

---

## 🎯 如何使用 Sub-agent

### 方式1：自动调度（推荐）

主 AI 会根据上下文自动调用合适的 Sub-agent：

```bash
# 你：修改了登录逻辑
"我修改了 Auth 站点的登录表单验证"

# 主 AI 自动调度：
# 1. 完成代码修改
# 2. 自动调用 sso-tester 测试
# 3. 测试通过后询问是否提交
# 4. 用户确认后调用 git-manager 提交
```

### 方式2：手动指定

你也可以明确调用某个 Sub-agent：

```bash
# 直接调用测试
"用 sso-tester 测试一下登录功能"

# 直接调用 Git 管理
"用 git-manager 提交所有改动"

# 只检查状态不提交
"用 git-manager 检查所有仓库的状态"
```

---

## 📊 典型工作流

### 场景1：修改 Auth 站点登录逻辑

```bash
你: "修改登录表单，添加邮箱格式验证"

主AI:
  → 分析需求
  → 修改 src/components/NewLoginForm.tsx
  → 自动调用 sso-tester 测试登录流程

sso-tester:
  → 运行自动化测试
  → 生成测试报告
  → ✅ 所有测试通过

主AI: "测试通过！是否提交这些修改？"

你: "提交吧"

git-manager:
  → 检查 auth-wizpulseai-com 仓库状态
  → 提交修改: "feat: 添加邮箱格式验证"
  → 推送到 GitHub
  → ✅ 推送成功
```

### 场景2：在 Main 站点添加产品页面（当前阶段重点）

```bash
你: "在 Main 站点添加 QuickSlide 产品介绍页面"

主AI:
  → 创建 /products/quickslide 页面
  → 添加产品特性、截图、定价
  → 优化 SEO 和响应式布局
  → 本地预览确认

主AI: "QuickSlide 页面已完成，是否提交？"

你: "提交"

git-manager:
  → 检测到 wizPulseAI-com（Main站点）有改动
  → 提交修改: "feat: 添加 QuickSlide 产品页面"
  → 推送到 GitHub
  → ✅ Main 站点提交成功
```

### 场景3：部署前完整检查

```bash
你: "准备部署到生产环境，帮我做全面检查"

主AI:
  → 调用 sso-tester 运行完整测试套件
  → 检查所有站点的编译
  → 验证环境变量配置

sso-tester:
  → 测试1: 登录流程 ✅
  → 测试2: 登出流程 ✅
  → 测试3: 跨站点Session ✅
  → 测试4: Cookie域验证 ✅

git-manager:
  → 检查所有仓库是否已推送
  → 验证版本一致性
  → 生成部署报告

主AI: "✅ 所有检查通过，可以部署！"
```

---

## 🧠 git-manager 的智能判断

### ✅ 什么时候会自动提交

1. **功能完成** + 测试通过
2. **阶段性工作**完成（如一篇文章、一个页面）
3. **Bug修复**完成且验证
4. **你明确说**"可以提交了"

### ❌ 什么时候不会提交

1. 工作还在进行中（功能一半）
2. 实验性修改（你说"试试看"）
3. 测试失败
4. 代码有错误

---

## 🛠️ 手动工具脚本

如果 Sub-agent 不可用，也可以直接使用脚本：

### Git 管理脚本

```bash
# 检查所有仓库状态
./git-push-all.sh status

# 拉取所有仓库最新代码
./git-push-all.sh pull

# 批量提交所有仓库
./git-push-all.sh commit "feat: 添加新功能"

# 查看帮助
./git-push-all.sh help
```

### 服务管理脚本

```bash
# 启动所有站点
./start-all.sh

# 停止所有站点
./stop-all.sh

# 检查服务状态
./check-status.sh

# 实时监控日志
./monitor-logs.sh
```

---

## 📈 业务发展阶段（git-manager 理解的）

### 阶段1：三站点基础架构期（已完成）
- Auth/Dashboard/Main 频繁修改
- 三个子站点都会经常提交

### 阶段2：内容扩展期（当前）⭐ 重点
- **Main 站点**高频提交（产品页面、知识中心）
- 主仓库中频提交（文档、脚本）
- Auth/Dashboard 低频提交（偶尔修复bug）

### 阶段3：新服务扩展期（未来）
- 可能添加新站点（QuickSlide 等）
- 架构支持扩展到 5、6、7 个仓库

---

## 🎯 最佳实践

### 1. 信任自动调度
让主 AI 自动判断何时调用 Sub-agent，不需要每次手动指定。

### 2. 明确表达意图
如果你想测试但不想提交，明确说"先测试，不要提交"。

### 3. 利用智能判断
git-manager 会根据业务阶段智能判断，你只需说"完成了"。

### 4. 查看测试报告
sso-tester 会生成详细报告和截图，检查 `/logs/` 目录。

---

## 📝 Sub-agent 文件位置

```
.claude/agents/
├── README.md           (本文件)
├── sso-tester.md      (SSO 测试专家)
└── git-manager.md     (Git 管理专家)
```

---

## 🚀 未来计划

### 即将添加的 Sub-agent

1. **stripe-tester** - 支付流程测试
2. **performance-analyzer** - 性能分析
3. **security-auditor** - 安全审计
4. **multi-site-coder** - 多站点代码编写

---

## 💡 常见问题

### Q1: Sub-agent 会自动运行吗？
A: 是的，主 AI 会根据上下文自动调用。你也可以手动指定。

### Q2: 如何关闭自动测试？
A: 说"跳过测试"或"不需要测试"。

### Q3: git-manager 会不会误提交？
A: 不会，它会根据智能判断规则决定，并且在提交前会询问你。

### Q4: 测试失败了怎么办？
A: sso-tester 会生成详细的错误报告，主 AI 会帮你定位问题。

### Q5: 如何添加新的 Sub-agent？
A: 在 `.claude/agents/` 目录创建新的 Markdown 文件即可。

---

**最后更新**: 2025-11-10
**维护者**: Claude AI
**项目**: WizPulseAI SSO System
