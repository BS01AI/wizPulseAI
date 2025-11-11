# WizPulseAI 项目文档索引

> 项目所有文档的导航和索引

---

## 📚 文档分类

### 📖 使用指南 (guides/)

#### [本地测试指南](guides/LOCAL_TEST_GUIDE.md)
**完整的本地开发和测试指南**

内容：
- 环境配置说明
- 启动步骤详解
- SSO 跨站点测试流程
- 常见问题排查
- 功能测试清单

适用场景：
- 首次启动项目
- 本地调试问题
- 验证 SSO 功能

---

#### [MCP 工具使用指南](guides/MCP_GUIDE.md)
**7个 MCP 服务器完整使用文档**

内容：
- 每个 MCP 服务器的功能说明
- 使用场景和示例
- 实用组合和工作流
- 开发、调试、测试最佳实践

MCP 服务器列表：
1. filesystem - 文件操作
2. notionApi - 任务管理
3. supabase - 数据库管理
4. chrome-devtools - 浏览器调试
5. playwright - E2E 测试
6. stripe - 支付管理
7. Context7 - 文档查询

---

### 📋 规划文档 (planning/)

#### [开发计划和优先级](planning/NEXT_STEPS.md)
**项目路线图和开发任务规划**

内容：
- 当前状态总结
- 立即行动项（本周）
- 短期目标（1-2周）
- 中期目标（1个月）
- 技术决策待确认

适用场景：
- 了解项目发展方向
- 规划开发任务
- 确定优先级

---

#### [目录整理方案](planning/CLEANUP_PLAN.md)
**项目结构整理的完整方案**

内容：
- 整理目标和原因
- 执行步骤详解
- 验证清单

适用场景：
- 了解项目结构变更历史
- 参考整理方案

---

### 🏗️ 技术文档 (technical-docs/)

详细的技术架构和设计文档，见 [technical-docs/README.md](technical-docs/README.md)

内容包括：
- 三站点架构总览
- SSO 与 Cookie 鉴权设计
- 各站点技术架构分析
- 安全策略设计
- 部署配置
- 运维 Runbook

---

### 📐 设计文档 (design/)

UI/UX 设计相关文档

---

### 📝 开发计划 (根目录)

#### [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)
**完整的产品开发规划**

内容：
- 项目现状总结
- 5个开发阶段规划
- 功能实现优先级
- 技术决策建议
- 成功指标定义

---

## 🗂️ 文档目录结构

```
docs/
├── README.md                    # 本文档（文档索引）
│
├── guides/                      # 📖 使用指南
│   ├── LOCAL_TEST_GUIDE.md     # 本地测试指南
│   └── MCP_GUIDE.md            # MCP 工具指南
│
├── planning/                    # 📋 规划文档
│   ├── NEXT_STEPS.md           # 开发计划
│   └── CLEANUP_PLAN.md         # 整理方案
│
├── technical-docs/              # 🏗️ 技术文档
│   ├── README.md               # 技术文档索引
│   ├── 00-shared/              # 共享架构文档
│   ├── 01-auth-site/           # Auth 站点文档
│   ├── 02-dashboard-site/      # Dashboard 站点文档
│   └── 03-main-site/           # Main 站点文档
│
├── design/                      # 📐 设计文档
│
└── DEVELOPMENT_PLAN.md          # 📝 开发计划总纲
```

---

## 🔍 快速查找

### 我想...

**启动项目**
→ [本地测试指南](guides/LOCAL_TEST_GUIDE.md)

**了解 MCP 工具**
→ [MCP 使用指南](guides/MCP_GUIDE.md)

**查看开发计划**
→ [下一步计划](planning/NEXT_STEPS.md)
→ [开发规划总纲](DEVELOPMENT_PLAN.md)

**了解技术架构**
→ [技术文档索引](technical-docs/README.md)

**查看脚本使用**
→ [../scripts/README.md](../scripts/README.md)

**查看项目总览**
→ [../README.md](../z-系统配置/README.md)

**查看 AI 记忆**
→ [../CLAUDE.md](../CLAUDE.md)

---

## 📌 重要文档

### 新成员必读
1. [../README.md](../z-系统配置/README.md) - 项目总览
2. [guides/LOCAL_TEST_GUIDE.md](guides/LOCAL_TEST_GUIDE.md) - 本地测试
3. [technical-docs/00-shared/00-ARCH-三站点架构总览-v1.0.md](technical-docs/00-shared/00-ARCH-三站点架构总览-v1.0.md) - 架构理解

### 开发必备
1. [guides/MCP_GUIDE.md](guides/MCP_GUIDE.md) - 开发工具
2. [planning/NEXT_STEPS.md](planning/NEXT_STEPS.md) - 任务规划
3. [../scripts/README.md](../scripts/README.md) - 脚本工具
4. [../CLAUDE.md](../CLAUDE.md) - 项目历史和决策

---

## 🔄 文档更新

如何添加新文档：
1. 根据类型选择目录（guides/planning/technical-docs/design）
2. 创建 Markdown 文件
3. 在本索引中添加链接
4. 更新相关的交叉引用

---

最后更新: 2025-10-30
