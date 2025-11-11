# 📦 WizPulseAI 部署文档

## 快速导航

**完整部署指南**: 📖 [docs/deployment/251030-DEPLOYMENT_GUIDE.md](docs/deployment/251030-DEPLOYMENT_GUIDE.md)

---

## 📚 部署文档目录

```
docs/deployment/
├── 251030-DEPLOYMENT_GUIDE.md      # 🎯 主部署指南（从这里开始）
├── phase1-local-testing.md         # Phase 1: 本地环境测试
├── phase2-user-management.md       # Phase 2: 用户管理验证
├── phase3-deployment-prep.md       # Phase 3: 部署准备配置
├── phase4-production.md            # Phase 4: 生产环境部署
├── env-templates.md                # 环境变量配置模板
└── testing-checklist.md            # 完整测试检查清单
```

---

## 🚀 快速开始

### 本地测试（今天开始）
```bash
# 1. 阅读主部署指南
open docs/deployment/251030-DEPLOYMENT_GUIDE.md

# 2. 配置环境变量（参考模板）
cat docs/deployment/env-templates.md

# 3. 启动所有站点
./start-all.sh

# 4. 开始 Phase 1 测试
open docs/deployment/phase1-local-testing.md
```

### 四个部署阶段

| 阶段 | 时间 | 优先级 | 文档 |
|-----|------|--------|------|
| Phase 1: 本地测试 | 2小时 | 🔴 P0 | [phase1-local-testing.md](docs/deployment/phase1-local-testing.md) |
| Phase 2: 用户管理 | 4小时 | 🟠 P1 | [phase2-user-management.md](docs/deployment/phase2-user-management.md) |
| Phase 3: 部署准备 | 3小时 | 🟡 P2 | [phase3-deployment-prep.md](docs/deployment/phase3-deployment-prep.md) |
| Phase 4: 生产部署 | 2小时 | 🟢 P3 | [phase4-production.md](docs/deployment/phase4-production.md) |

**总计**: 约 11 小时，分 3-4 天完成

---

## 📋 检查清单

**使用完整测试清单**: [testing-checklist.md](docs/deployment/testing-checklist.md)

**环境变量配置**: [env-templates.md](docs/deployment/env-templates.md)

---

## 🎯 项目架构

### 三站点 SSO 架构
- 🔐 **Auth 站点**: auth.wizpulseai.com (localhost:3001)
- 📊 **Dashboard 站点**: dashboard.wizpulseai.com (localhost:3002)
- 🌐 **Main 站点**: www.wizpulseai.com (localhost:3000)

### 认证机制
- **顶级域 Cookie**: `.wizpulseai.com` (生产) / `.localhost` (本地)
- **认证源**: Supabase Auth
- **权限系统**: admin / user / deleted

---

## 📞 其他文档

- **本地测试指南**: [LOCAL_TEST_GUIDE.md](LOCAL_TEST_GUIDE.md)
- **下一步计划**: [NEXT_STEPS.md](NEXT_STEPS.md)
- **MCP 使用指南**: [MCP_GUIDE.md](MCP_GUIDE.md)
- **技术文档**: [docs/technical-docs/](docs/technical-docs/)
- **AI 记忆**: [CLAUDE.md](CLAUDE.md)

---

## 🆘 快速命令

```bash
# 启动所有站点
./start-all.sh

# 停止所有站点
./stop-all.sh

# 查看日志
tail -f logs/auth.log
tail -f logs/dashboard.log
tail -f logs/main.log

# 健康检查
curl http://localhost:3001  # Auth
curl http://localhost:3002  # Dashboard
curl http://localhost:3000  # Main
```

---

**现在开始**: 👉 [查看主部署指南](docs/deployment/251030-DEPLOYMENT_GUIDE.md)

**创建日期**: 2025-10-30
