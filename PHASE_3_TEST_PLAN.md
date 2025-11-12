# Phase 3 本地功能测试计划

**测试日期**: 2025-11-12
**测试范围**: 三站点多语言升级验收
**测试负责**: Claude AI + Sub-agents
**测试环境**: 本地开发环境（localhost）

---

## 📋 测试目标

验证 Phase 3 完成的所有功能：
- ✅ 4语言支持（ja/en/ar/zh-TW）
- ✅ RTL布局（阿拉伯语）
- ✅ 跨站点SSO登录
- ✅ UI美化效果
- ✅ 术语统一

---

## 🎯 测试清单总览

| # | 测试项目 | 优先级 | 预计时间 | 负责Agent | 状态 |
|---|---------|--------|---------|-----------|------|
| 1 | 环境启动 | P0 | 5分钟 | 手动 | ⏳ 待执行 |
| 2 | Main站点测试 | P0 | 15分钟 | sso-tester | ⏳ 待执行 |
| 3 | Auth站点测试 | P0 | 15分钟 | sso-tester | ⏳ 待执行 |
| 4 | Dashboard站点测试 | P0 | 15分钟 | sso-tester | ⏳ 待执行 |
| 5 | SSO跨站点测试 | P0 | 20分钟 | sso-tester | ⏳ 待执行 |
| 6 | 性能分析 | P1 | 10分钟 | performance-analyzer | ⏳ 待执行 |
| 7 | 测试报告生成 | P0 | 10分钟 | 手动 | ⏳ 待执行 |

**总计时间**: 约90分钟

---

## 🚀 测试准备

### 前置条件
- [x] Phase 3 代码已提交到dev分支
- [x] 三站点编译成功（Build通过）
- [x] 测试工具已配置（Playwright + Chrome DevTools）
- [ ] 三站点本地服务已启动

### 启动命令
```bash
# 1. 启动所有站点
./start-all.sh

# 2. 验证服务状态
./check-status.sh

# 3. 查看日志（如需要）
./monitor-logs.sh
```

### 测试账户
- **邮箱**: sun.bo@bs01ai.com
- **密码**: 12345678
- **权限**: 普通用户

---

## 📝 详细测试用例

### Test 1: Main站点多语言测试

**目标**: 验证4语言切换和RTL布局

**步骤**:
1. 访问 `http://localhost:3010`
2. 测试日语版本 `/ja`
3. 测试英语版本 `/en`
4. 测试阿拉伯语版本 `/ar`（验证RTL）
5. 测试繁体中文版本 `/zh-TW`

**验收标准**:
- [ ] 4种语言都能正常加载
- [ ] 阿拉伯语界面从右到左显示
- [ ] 语言切换器正常工作
- [ ] 知识中心文章链接正确
- [ ] 导航菜单多语言正确
- [ ] 无Console错误

**截图要求**:
- `test-screenshots/main-ja.png`
- `test-screenshots/main-ar-rtl.png`
- `test-screenshots/main-zh-tw.png`

---

### Test 2: Auth站点UI和多语言测试

**目标**: 验证新UI和4语言支持

**步骤**:
1. 访问 `http://localhost:3011`
2. 测试日语（默认）
3. 切换到英语 `?lang=en`
4. 切换到阿拉伯语 `?lang=ar`
5. 切换到繁体中文 `?lang=zh-TW`
6. 检查UI美化效果（玻璃态设计）

**验收标准**:
- [ ] 4种语言切换正常
- [ ] 玻璃态卡片效果显示正确
- [ ] 渐变背景正常
- [ ] 语言切换器按钮正常
- [ ] "ログイン"术语统一（不是"サインイン"）
- [ ] 阿拉伯语RTL布局正确
- [ ] 无Console错误

**截图要求**:
- `test-screenshots/auth-new-ui.png`
- `test-screenshots/auth-ar-rtl.png`
- `test-screenshots/auth-language-switcher.png`

---

### Test 3: Dashboard站点测试

**目标**: 验证首页重构和4语言支持

**步骤**:
1. 访问 `http://localhost:3012`（未登录状态）
2. 检查欢迎页面多语言
3. 测试语言切换
4. 检查UI美化效果

**验收标准**:
- [ ] 欢迎页面无硬编码英文
- [ ] 4语言支持正常
- [ ] 渐变背景和动画正常
- [ ] "Log In / Sign Up"按钮正确显示
- [ ] 功能卡片正常显示
- [ ] 无Console错误

**截图要求**:
- `test-screenshots/dashboard-welcome.png`
- `test-screenshots/dashboard-ar.png`

---

### Test 4: SSO登录流程测试（核心）⭐

**目标**: 验证跨站点单点登录

**场景A: Dashboard → Auth → Dashboard**
1. 访问 `http://localhost:3012`
2. 点击"Log In / Sign Up"按钮
3. 自动跳转到 `http://localhost:3011`
4. 填写登录信息：
   - 邮箱：sun.bo@bs01ai.com
   - 密码：12345678
5. 点击登录
6. 自动跳转回 `http://localhost:3012/dashboard`
7. 验证用户信息显示

**验收标准**:
- [ ] 跨站点跳转正常（3012 → 3011 → 3012）
- [ ] 登录成功
- [ ] Session创建正常
- [ ] Cookie域设置为 `.localhost`
- [ ] Dashboard显示用户邮箱
- [ ] 无Console错误

**场景B: Main → Auth → Dashboard**
1. 访问 `http://localhost:3010`
2. 点击"Log In / Sign Up"
3. 登录后跳转到Dashboard
4. 验证登录状态

**验收标准**:
- [ ] 跨站点跳转正常
- [ ] 登录状态在三站点共享
- [ ] 无Console错误

**截图要求**:
- `test-screenshots/sso-flow-1-dashboard-welcome.png`
- `test-screenshots/sso-flow-2-auth-login.png`
- `test-screenshots/sso-flow-3-dashboard-loggedin.png`
- `test-screenshots/sso-cookie-domain.png`（DevTools Cookie截图）

---

### Test 5: 语言切换跨站点保持（可选）

**目标**: 验证语言偏好是否跨站点保持

**步骤**:
1. 在Main站点切换到阿拉伯语
2. 点击登录跳转到Auth站点
3. 检查Auth站点是否也显示阿拉伯语

**验收标准**:
- [ ] 语言偏好跨站点保持（如果实现）
- [ ] 或至少不影响用户体验

---

### Test 6: 性能分析（可选）

**目标**: 验证Bundle大小和加载性能

**使用Agent**: performance-analyzer

**检查项**:
- [ ] First Load JS < 100kB
- [ ] Page Load Time < 3秒
- [ ] 无明显性能瓶颈
- [ ] Core Web Vitals良好

---

## 🐛 问题记录模板

发现问题时填写：

### 问题 #1
- **站点**: [Main/Auth/Dashboard]
- **语言**: [ja/en/ar/zh-TW]
- **严重程度**: [P0-Critical / P1-High / P2-Medium / P3-Low]
- **问题描述**:
- **复现步骤**:
  1.
  2.
  3.
- **预期结果**:
- **实际结果**:
- **截图**:
- **Console错误**:
- **修复建议**:

---

## ✅ 测试完成标准

**必须通过的测试** (P0):
- [x] 三站点都能正常启动
- [ ] Main站点4语言切换正常
- [ ] Auth站点新UI显示正常
- [ ] Dashboard站点首页重构正确
- [ ] SSO登录流程完整可用
- [ ] 阿拉伯语RTL布局正确
- [ ] 无Critical级别错误

**建议通过的测试** (P1):
- [ ] 性能指标良好
- [ ] 语言偏好跨站点保持
- [ ] 所有截图完整

**可选测试** (P2):
- [ ] 多浏览器测试（Chrome/Safari/Firefox）
- [ ] 移动端响应式测试
- [ ] 网络慢速测试

---

## 📊 测试报告格式

测试完成后生成：`PHASE_3_TEST_REPORT.md`

**包含内容**:
1. 测试执行摘要
2. 通过/失败统计
3. 发现的问题清单
4. 截图附件
5. 性能数据（如有）
6. 下一步建议

---

## 🚀 测试执行计划

### 阶段1: 准备（10分钟）
- [ ] 启动三站点服务
- [ ] 验证服务状态
- [ ] 准备测试账户

### 阶段2: 基础功能测试（30分钟）
- [ ] Test 1: Main站点
- [ ] Test 2: Auth站点
- [ ] Test 3: Dashboard站点

### 阶段3: SSO流程测试（20分钟）⭐
- [ ] Test 4: SSO登录流程

### 阶段4: 补充测试（10分钟）
- [ ] Test 5: 语言切换保持
- [ ] Test 6: 性能分析

### 阶段5: 报告生成（20分钟）
- [ ] 整理测试结果
- [ ] 生成测试报告
- [ ] 更新WORK_LOG.md

---

## 🤖 Sub-agent分工

### sso-tester
- **负责**: Test 1-5（所有SSO和语言测试）
- **工具**: Playwright
- **输出**: 截图 + 详细日志

### performance-analyzer
- **负责**: Test 6（性能分析）
- **工具**: Chrome DevTools + Playwright
- **输出**: 性能报告

---

## 📁 文件输出结构

```
test-results/
├── screenshots/
│   ├── main-ja.png
│   ├── main-ar-rtl.png
│   ├── auth-new-ui.png
│   ├── auth-ar-rtl.png
│   ├── dashboard-welcome.png
│   ├── sso-flow-*.png
│   └── ...
├── logs/
│   ├── console-errors.txt
│   ├── network-requests.txt
│   └── performance-metrics.json
└── PHASE_3_TEST_REPORT.md
```

---

**准备就绪！等待启动测试。** 🚀

**下一步**: 用户确认后，启动三站点并开始执行测试计划。
