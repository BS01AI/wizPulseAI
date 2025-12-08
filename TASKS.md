# 活跃任务清单

> 当前 Sprint 和待办任务

---

## 当前 Sprint: Fashion 功能修复 (2025-12-08)

### 🔄 进行中
- [ ] **Fashion 照片分析功能** - 等待验证 `gemini-pro-vision` 模型

### 🟢 今日已完成 (2025-12-08)
- [x] Fashion: RLS INSERT/UPDATE/DELETE 策略 (analyses表)
- [x] Fashion: RLS UPDATE 策略 (photos表)
- [x] Fashion: 添加缺失字段 (app_source, advisor_persona_used, tone_used)
- [x] Fashion: AI Provider 切换到 Google (Gemini)
- [x] Fashion: 模型名称修复 (gemini-1.5-flash → gemini-pro-vision)
- [x] Fashion: 添加详细调试日志

### 🟢 历史已完成 (2025-12-05)
- [x] Fashion: 删除_template目录(12文件)
- [x] Fashion: 移除测试卡号4242
- [x] Fashion: 品牌名已统一为マジコーデ
- [x] Auth: 删除旧API文件(2个)
- [x] Auth: 升级Supabase到2.81.1
- [x] Main: 修复断链href=#(8处)

### 📋 待办
- [ ] Dashboard: AI产品Modal实现 (3h)
- [ ] Main: 日文翻译补齐(88行)
- [ ] 架构: Tailwind配置统一

---

## 历史 Sprint: 安全加固 (2025-12-05)

### 🟢 P0 - 全部修复完成（评分79→88→91/100）

| # | 问题 | 风险 | 修复方案 | 负责Agent |
|---|------|------|----------|-----------|
| P0-1 | 积分扣除无原子性 | 竞态条件可刷积分 | 数据库事务+约束 | database-expert |
| P0-2 | 积分充值幂等性缺失 | Webhook可重复充值 | 去重机制+payment_intent_id | database-expert |
| P0-3 | SQL注入风险 | admin/users搜索数据泄露 | 参数化查询 | multi-site-coder |
| P0-4 | 依赖漏洞 | form-data/axios CVE | npm audit fix | 直接执行 |

- [x] **P0-1**: 积分扣除原子性保护 ✅ 已有`FOR UPDATE`行锁
- [x] **P0-2**: 积分充值幂等性 ✅ 已添加唯一索引+幂等检查
- [x] **P0-3**: SQL注入修复 ✅ 已添加输入验证Schema
- [x] **P0-4**: 依赖漏洞修复 ✅ 两站点0 vulnerabilities

### 🟡 P1 - 本周修复

- [ ] **P1-1**: CORS配置收紧（暂缓 - 低优先级）
- [ ] **P1-2**: Rate Limiting全局保护（暂缓 - 用户量少）
- [x] **P1-3**: 审计日志触发器完善 ✅ 4表自动审计
- [x] **P1-4**: Webhook重放攻击防护 ✅ 多Agent设计+实施完成
- [x] **P1-5**: 服务端价格验证 ✅ 已实现（Security审计确认）

### 进行中

#### 🎯 矩阵网站上线准备 (2-3周)

**第1周 P0修复**:
- [ ] Auth站点清理（删除冗余组件、统一翻译）
- [ ] Main站点真实化（删除虚假数据、修复断链）
- [ ] Dashboard/Fashion P0修复

**第2周 P1优化**:
- [ ] 多语言补全（4站点）
- [ ] 翻译术语统一
- [ ] Main产品描述修正

**第3周 架构统一**:
- [ ] Tailwind配置统一
- [ ] Supabase版本升级
- [ ] shared组件同步

**详细报告**: [SITE_REVIEW_REPORT.md](./SITE_REVIEW_REPORT.md)

---

- [ ] Fashion 站点功能完善
- [ ] Dashboard 功能扩展
- [ ] 知识中心内容填充

### 已完成 (2025-12-05)

- [x] **性能WARN修复** ✅ webhook_events RLS优化（6→0 WARN）
- [x] **P1-4 Webhook重放攻击防护** ✅ (3 Agent并行设计)
  - Security审计：三层防御架构
  - Architecture设计：共享逻辑+source_site字段
  - Database实现：原子幂等函数+RLS
  - Dashboard集成：完成
  - Fashion：无需修改（代理到Dashboard）
- [x] **P0安全漏洞全部修复** ✅ (多Agent并行)
  - P0-1: 积分扣除原子性 - 已有FOR UPDATE行锁+CHECK约束
  - P0-2: 积分充值幂等性 - 添加唯一索引+幂等检查函数
  - P0-3: SQL注入 - 添加UserSearchSchema输入验证
  - P0-4: 依赖漏洞 - npm audit fix (0 vulnerabilities)
- [x] SSO Cookie修复 ✅
  - Cookie域统一为.wizpulseai.com
  - maxAge从365天改为7天
  - Fashion站点添加Cookie处理
  - 白名单添加fashion.wizpulseai.com
- [x] 全面安全审计 ✅
  - 4个Agent并行诊断
  - 综合评分79/100 → 88/100
  - 识别4个P0问题 + 6个P1问题

### 已完成 (历史)

- [x] AI 团队架构重构 (2025-12-04) ✅
- [x] 数据库安全警告修复 (2025-12-04)
- [x] 数据库性能优化 (2025-12-04)
- [x] Fashion 站点多语言 (2025-12-03)
- [x] Header 设计统一 (2025-12-03)

---

## Backlog（待规划）

### P2 - 中优先级

- [ ] Dashboard 用户统计页面
- [ ] API 密钥管理界面
- [ ] 知识中心文章权限
- [ ] QuickSlide 产品站点

### P3 - 低优先级

- [ ] 团队协作功能
- [ ] 使用统计展示
- [ ] 邮件模板多语言
- [ ] 性能监控面板

---

**最后更新**: 2025-12-08
