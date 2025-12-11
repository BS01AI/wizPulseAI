# 活跃任务清单

> 当前 Sprint 和待办任务

---

## 当前 Sprint: 矩阵网站功能完善 (2025-12-11)

### 任务架构（两个层级）

```
Layer 1: Fashion App 内部功能完善
├── P0-1: localStorage 设定统一
├── P0-2: 设定变更流程（警告→清理→重发）
├── P1-1: 历史页面 i18n
├── P1-2: 积分显示完善
├── P2-1: PWA 图标
└── P2-2: 登录保持（1个月）

Layer 2: 矩阵网站整体协调
├── P1-3: Dashboard Fashion 统计集成
├── P2-3: 登录跳转实验
└── P3-1: 矩阵网站内容优化删减
```

---

## Layer 1: Fashion App 内部 (magicoord.wizpulseai.com)

### P0 - 关键任务 (Day 1)

#### P0-1: localStorage 设定统一 🔧
- **状态**: [x] ✅ 已完成
- **负责**: `multi-site-coder`
- **工时**: 2-3h
- **问题**: 两个不一致的 key
  - `useFashionSettings.ts` 用 `fashion_advisor_settings`
  - `settings/page.tsx` 用 `fashion-settings`
- **修复**:
  - [ ] 统一为 `fashion_advisor_settings`
  - [ ] settings/page.tsx 改用 useFashionSettings hook
  - [ ] onboarding/page.tsx 添加 localStorage 保存
  - [ ] 添加旧 key 迁移代码

#### P0-2: 设定变更流程 ⚠️
- **状态**: [x] ✅ 已完成
- **负责**: `multi-site-coder`
- **工时**: 3-4h
- **需求**: 用户改变设定后，需要先警告，然后清理，再重新分析
- **设计**:
  ```
  用户改变 advisor/scene/season
      ↓
  检查是否有 analysisResult
      ↓ (有)
  弹窗: "設定が変更されました。再分析しますか？"
      ↓
  用户确认 → setAnalysisResult(null) → 自动触发分析
  ```
- **文件**:
  - [ ] 新建 `SettingsChangeModal.tsx`
  - [ ] 修改 `fashion/page.tsx`

### P1 - 重要任务 (Day 2)

#### P1-1: 历史页面 i18n 🌐
- **状态**: [x] ✅ 已完成
- **负责**: `translation-manager`
- **工时**: 2h
- **问题**: 当前显示中文（"我的时尚档案"）
- **修复**:
  - [ ] 中文 → 日语翻译
  - [ ] 添加空状态图片
  - [ ] 添加加载骨架屏
  - [ ] 50+ 记录分页

#### P1-2: 积分显示完善 💰
- **状态**: [x] ✅ 已完成
- **负责**: `multi-site-coder`
- **工时**: 1-2h
- **现状**: 主页面已显示积分余额 ✅
- **待做**:
  - [ ] 设置页面添加积分显示（当前显示"--"）
  - [ ] 添加交易历史链接

### P2 - 增强任务 (Day 3)

#### P2-1: PWA 图标设置 📱
- **状态**: [x] ✅ 已完成
- **工时**: 1h
- **完成内容**:
  - [x] 从 original-ja.jpg (1024×1024) 生成 9 种尺寸图标
  - [x] 日文版：72, 96, 128, 144, 152, 180, 192, 384, 512
  - [x] 英文版备用：192, 512
  - [x] apple-touch-icon.png (180×180)
  - [x] manifest.json 已有完整 icons 数组配置

#### P2-2: 登录保持 1 个月 🔐
- **状态**: [ ] 待开始
- **负责**: `database-expert`
- **工时**: 2-3h
- **方案**: Supabase refresh_token_lifetime 设为 2592000 秒 (30天)
- **步骤**:
  - [ ] Supabase Dashboard → Authentication → Settings
  - [ ] 设置 Refresh Token Rotation: 2592000
  - [ ] 测试 Session 持久化

---

## Layer 2: 矩阵网站整体

### P1 - 重要任务

#### P1-3: Dashboard Fashion 统计集成 📊
- **状态**: [x] ✅ 已完成
- **负责**: `database-expert` + `multi-site-coder`
- **工时**: 4-6h
- **现状**: Dashboard 只显示通用数据，没有 Fashion 专属统计
- **方案**: 同一 Supabase 项目，跨 schema 查询
- **步骤**:
  - [ ] 新建 API: `db-wizPulseAI-com/src/app/api/fashion/stats/route.ts`
  - [ ] 新建组件: `fashion-stats-card.tsx`
  - [ ] 集成到 `orbital-dashboard.tsx`
- **数据**:
  ```typescript
  {
    totalAnalyses: number,    // 总分析次数
    creditsUsed: number,      // 消耗积分
    lastAnalysisDate: Date,   // 最近分析时间
    topStyles: string[]       // 常用风格
  }
  ```

### P2 - 增强任务

#### P2-3: 登录跳转实验 🔄
- **状态**: [ ] 待开始
- **负责**: `multi-site-coder`
- **工时**: 1-2h
- **现状**: 未认证用户可访问 `/fashion`（开放页面）
- **验证**: 保持当前懒认证模式 - 只在执行操作时要求登录

### P3 - 低优先级

#### P3-1: 矩阵网站内容优化删减 📝
- **状态**: [ ] 待规划
- **负责**: `content-writer`
- **工时**: 4-8h
- **范围**:
  - [ ] Main 站点营销文案审核
  - [ ] 删除冗余/矛盾内容
  - [ ] 统一品牌语调
  - [ ] 准备正式运营

---

## 执行计划

### Day 1 (P0 关键)
| 时间 | 任务 | Agent |
|------|------|-------|
| AM | P0-1 localStorage 统一 | multi-site-coder |
| PM | P0-2 设定变更流程 | multi-site-coder |

### Day 2 (P1 重要)
| 时间 | 任务 | Agent |
|------|------|-------|
| AM | P1-1 历史页面 i18n | translation-manager |
| AM | P1-2 积分显示完善 | multi-site-coder |
| PM | P1-3 Dashboard 集成（开始） | database-expert |

### Day 3 (P2 增强)
| 时间 | 任务 | Agent |
|------|------|-------|
| AM | P1-3 Dashboard 集成（完成） | multi-site-coder |
| AM | P2-1 PWA 图标 | 直接实现 |
| PM | P2-2 登录保持 | database-expert |
| PM | P2-3 登录跳转实验 | multi-site-coder |

### Week 2 (P3)
| 任务 | Agent |
|------|-------|
| P3-1 内容优化 | content-writer |

---

## 今日已完成 (2025-12-11)

- [x] **CreditsService schema 修复** - 6处 public → fashion
- [x] **五边形雷达图修复** - 从横条改为真正的 PentagonRadar 组件
- [x] **场景选择功能修复** - 传递 userConfig 参数到 VisionService
- [x] **积分余额前端显示** - 新建 useCredits Hook + 页面顶部集成
- [x] **五边形UI优化** - 去掉emoji图标 + 尺寸280px
- [x] **功能完善规划会议** - Plan Agent 完整分析，制定作战计划

---

## 历史 Sprint

### 安全加固 Sprint (2025-12-05) ✅
- 安全评分: 79 → 91/100
- P0 全部修复（积分原子性、幂等性、SQL注入、依赖漏洞）
- P1 部分完成（审计日志、Webhook防护）

### Fashion AI 优化 Sprint (2025-12-10) ✅
- v3.0 人话版 Prompt 重构
- AI 分析结果页面调通
- 五边形雷达图实现

---

## Backlog（待规划）

### 中优先级
- [ ] Dashboard 用户统计页面
- [ ] API 密钥管理界面
- [ ] 知识中心文章权限
- [ ] QuickSlide 产品站点

### 低优先级
- [ ] 团队协作功能
- [ ] 邮件模板多语言
- [ ] 性能监控面板
- [ ] Fashion 社区功能

---

**最后更新**: 2025-12-11
