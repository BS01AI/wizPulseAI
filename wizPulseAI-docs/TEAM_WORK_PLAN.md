# WizPulseAI 项目组工作计划

> **版本**: v1.0
> **创建日期**: 2025-12-03
> **更新日期**: 2025-12-03
> **状态**: 执行中

---

## 1. 团队成员

### 开发部
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `multi-site-coder` | 多站点代码开发 | Sonnet | 跨站点功能、共享组件修改 |
| `supabase-manager` | 数据库管理 | Haiku | 数据库查询、迁移、日志 |

### 测试部
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `sso-tester` | SSO登录测试 | Haiku | 认证代码修改后 |
| `stripe-tester` | 支付流程测试 | Haiku | 支付代码修改后 |
| `cross-site-validator` | 跨站点验证 | Haiku | 共享配置修改后 |

### 审查/优化部
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `security-auditor` | 安全审计 | Sonnet | 认证/支付/敏感操作修改后 |
| `performance-analyzer` | 性能分析 | Haiku | 优化前调研 |

### 内容/翻译部
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `content-writer` | AI内容创作 | Sonnet | 知识中心文章创作 |
| `translation-manager` | 翻译协调 | Sonnet | 多语言内容翻译 |
| `translator-layer1` | 初译 | Haiku | 由manager调用 |
| `translator-layer2` | 校对 | Haiku | 由manager调用 |
| `translator-layer3` | 润色 | Haiku | 由manager调用 |

### UI专家
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `rtl-ui-specialist` | RTL界面 | Haiku | 阿拉伯语UI适配 |
| `prompt-designer` | Prompt设计 | Sonnet | AI产品Prompt优化 |

### 管理部
| Agent | 职责 | 模型 | 调用时机 |
|-------|------|------|----------|
| `git-manager` | Git提交管理 | Haiku | 功能完成后批量提交 |

---

## 2. 当前工作计划

### Phase 1: P0任务 (紧急)

| # | 任务 | 负责Agent | 状态 | 完成时间 |
|---|------|-----------|------|----------|
| 1 | Fashion Header添加返回导航 | `multi-site-coder` | ✅ 完成 | 2025-12-03 |
| 2 | 首页添加产品生态区域 | `multi-site-coder` | ✅ 完成 | 2025-12-03 |
| 3 | 品牌层次可视化 | `multi-site-coder` | 🔄 待开始 | - |

### Phase 2: P1任务 (重要)

| # | 任务 | 负责Agent | 状态 | 预计时间 |
|---|------|-----------|------|----------|
| 4 | Life/Biz页面添加面包屑 | `multi-site-coder` | 待开始 | 30min |
| 5 | ProductShowcase改为生态概览 | `multi-site-coder` | 待开始 | 2h |
| 6 | Fashion站点多语言接入 | `translation-manager` + `multi-site-coder` | 待开始 | 3h |

### Phase 3: P2任务 (改进)

| # | 任务 | 负责Agent | 状态 | 预计时间 |
|---|------|-----------|------|----------|
| 7 | 统一Header视觉风格 | `multi-site-coder` | 待开始 | 2h |
| 8 | Life/Biz页面添加Footer | `multi-site-coder` | 待开始 | 1h |
| 9 | Fashion站点SEO优化 | `multi-site-coder` | 待开始 | 2h |

---

## 3. 工作流程规范

### 3.1 标准开发流程

```
1. 任务分析
   ├── 确认需求范围
   ├── 识别涉及站点
   └── 选择负责Agent

2. 执行开发
   ├── Agent执行任务
   ├── 代码修改
   └── 本地验证

3. 质量检查
   ├── 构建验证 (npm run build)
   ├── cross-site-validator 验证配置一致性
   └── 相关测试Agent验证

4. 提交部署
   ├── git-manager 批量提交
   └── Vercel 自动部署

5. 文档更新
   ├── 更新 CLAUDE.md 记忆
   ├── 更新相关技术文档
   └── 标记任务完成
```

### 3.2 Agent调用原则

**优先使用专业Agent**:
- 跨站点代码 → `multi-site-coder`
- 翻译任务 → `translation-manager`
- 数据库操作 → `supabase-manager`
- 安全相关 → `security-auditor`

**验证类Agent自动触发**:
- 认证代码改动 → `sso-tester`
- 支付代码改动 → `stripe-tester`
- 配置改动 → `cross-site-validator`

**提交前必须**:
- 构建通过
- 无TypeScript错误
- 相关测试通过

---

## 4. 完成记录

### 2025-12-03

| 时间 | 任务 | Agent | 结果 |
|------|------|-------|------|
| - | 创建网站架构文档 | - | ✅ WEBSITE_ARCHITECTURE.md |
| - | Header添加WizLife/WizBiz导航 | - | ✅ `cac006d` |
| - | Fashion Header返回导航 | `multi-site-coder` | ✅ `d1080ed` |
| - | 首页ProductEcosystem组件 | `multi-site-coder` | ✅ `3b62391` |
| - | Life/Biz面包屑导航 | - | ✅ `bd5909b` |
| - | Fashion多语言翻译 | `translation-manager` | ✅ 4语言×40条 |
| - | Fashion多语言集成 | `multi-site-coder` | ✅ `06c14c4` |

---

## 5. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 网站架构 | `/wizPulseAI-docs/WEBSITE_ARCHITECTURE.md` | 品牌结构、用户旅程、转化漏斗 |
| 项目记忆 | `/CLAUDE.md` | AI记忆主文件 |
| Agent配置 | `/.claude/agents/` | 各Agent定义文件 |
| 开发规划 | `/wizPulseAI-docs/DEVELOPMENT_PLAN.md` | 长期开发计划 |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-12-03 | v1.0 | 初始版本，P0任务1-2完成 |
