# WizPulseAI 测试文档中心

测试文档库，包含所有测试用例、测试清单、测试报告。

---

## 📚 文档导航

### 快速开始（推荐）

**新手测试** → 从这里开始 👇

- [**QUICK_TEST_CHECKLIST.md**](./QUICK_TEST_CHECKLIST.md)
  - ⏱️ 30分钟快速测试
  - 5个核心场景
  - 10个检查点
  - 适合首次测试

---

### 完整测试文档

**完整测试** → 需要详细测试用例 👇

- [**SSO_AUTHENTICATION_TEST.md**](./SSO_AUTHENTICATION_TEST.md)
  - 📋 15个详细测试用例
  - 5个测试套件
  - 包含边界和异常测试
  - 适合正式测试、回归测试

---

## 🎯 测试场景概览

### 场景1: 邮件注册和登录
- 注册流程
- 邮件验证
- 登录（3个站点）
- 修改密码
- 忘记密码

### 场景2: Google OAuth 登录
- 一键授权登录
- 二次快速登录
- 用户信息同步
- **无密码管理**（正确）

### 场景3: SSO 跨站点认证
- 一处登录，全部登录
- Cookie 跨域共享
- 自动状态同步

### 场景4: 单点登出
- 一处登出，全部登出
- Cookie 完全清除
- 从任意站点登出

### 场景5: 跨站点跳转
- 已登录状态跳转
- 未登录自动跳转到 Auth
- 登录后自动返回

---

## 🔧 测试环境

### 本地开发环境

```bash
# 启动所有站点
./start-all.sh

# 访问地址
Auth:      http://localhost:3011
Dashboard: http://localhost:3012
Main:      http://localhost:3010

# 停止所有站点
./stop-all.sh
```

### 测试账号准备

**邮件账号**:
```
邮箱: test@example.com
密码: TestPass123!
```

**Google 账号**:
```
使用您的真实 Google 账号
需要在 Supabase 中配置 OAuth Client ID
```

---

## ✅ 核心功能对比

### 邮件注册 vs Google OAuth

| 功能 | 邮件注册 | Google OAuth | 说明 |
|------|---------|--------------|------|
| 注册流程 | 手动填表 | 一键授权 | OAuth 更快 |
| 修改密码 | ✅ 支持 | ❌ 不支持 | Google 管理密码 |
| 忘记密码 | ✅ 支持 | ❌ 不支持 | 通过 Google 重置 |
| SSO | ✅ 支持 | ✅ 支持 | 功能完全相同 |
| 单点登出 | ✅ 支持 | ✅ 支持 | 功能完全相同 |
| 跨站点跳转 | ✅ 支持 | ✅ 支持 | 功能完全相同 |

**总结**: 除了"登录方式"和"密码管理"不同，其他功能完全一致。

---

## 📝 测试用例清单

### 功能测试（11个用例）

- [x] TC-001: 邮件注册流程
- [x] TC-002: 邮件登录（三个站点）
- [x] TC-003: SSO 跨站点认证同步
- [x] TC-004: 密码修改
- [x] TC-005: 忘记密码
- [x] TC-006: Google OAuth 注册和登录
- [x] TC-007: Google OAuth 二次登录
- [x] TC-008: 单点登出
- [x] TC-009: 跨站点登出测试
- [x] TC-010: 跨站点跳转（已登录）
- [x] TC-011: 跨站点跳转（未登录）

### 异常测试（4个用例）

- [x] TC-012: 并发登录测试
- [x] TC-013: Session 过期测试
- [x] TC-014: Cookie 禁用测试
- [x] TC-015: 网络异常测试

---

## 🐛 常见问题

### 1. 跨站点不能自动登录

**原因**: Cookie 域配置错误

**解决**: 确保所有 `.env.local` 的 `NEXT_PUBLIC_COOKIE_DOMAIN=.localhost`

---

### 2. 登出后 Cookie 未清除

**原因**: Cookie 删除逻辑问题

**解决**:
1. 手动删除 Cookie（F12 → Application → Cookies）
2. 清除浏览器缓存
3. 使用隐身模式测试

---

### 3. Service Worker 缓存问题

**原因**: 旧的 Service Worker 缓存导致页面加载失败

**解决**:
1. F12 → Application → Service Workers → Unregister
2. Clear site data
3. 硬刷新（Cmd+Shift+R）

---

### 4. Google OAuth 无法使用

**原因**: 未配置 OAuth Client ID

**解决**: 在 Supabase Dashboard 配置 Google OAuth

参考: [Auth 站点技术文档](../../auth-wizpulseai-com/README.md)

---

## 📊 测试报告模板

测试完成后，生成报告：

```markdown
# WizPulseAI SSO 测试报告

**测试日期**: YYYY-MM-DD
**测试人员**: [姓名]
**测试环境**: 本地/生产

## 测试结果

- 总用例数: 15
- 通过: XX
- 失败: XX
- 通过率: XX%

## 主要问题

1. [问题1描述]
2. [问题2描述]

## 建议改进

1. [建议1]
2. [建议2]
```

---

## 🔗 相关文档

### 环境搭建
- [LOCAL_TEST_GUIDE.md](../LOCAL_TEST_GUIDE.md) - 本地测试环境完整指南

### 开发计划
- [NEXT_STEPS.md](../NEXT_STEPS.md) - 后续开发计划和优先级

### 技术架构
- [CLAUDE.md](../../CLAUDE.md) - 项目技术架构和 AI 记忆
- [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) - 完整开发规划

### 站点文档
- [Auth 站点](../../auth-wizpulseai-com/README.md)
- [Dashboard 站点](../../db-wizPulseAI-com/README.md)
- [Main 站点](../../wizPulseAI-com/README.md)

---

## 🎯 测试流程建议

### 首次测试（30分钟）
1. 阅读 [QUICK_TEST_CHECKLIST.md](./QUICK_TEST_CHECKLIST.md)
2. 启动所有站点 `./start-all.sh`
3. 完成5个核心场景测试
4. 记录测试结果

### 完整测试（2小时）
1. 阅读 [SSO_AUTHENTICATION_TEST.md](./SSO_AUTHENTICATION_TEST.md)
2. 启动所有站点
3. 完成15个详细测试用例
4. 记录所有问题
5. 生成测试报告

### 回归测试（每次更新后）
1. 运行快速测试（30分钟）
2. 重点测试修改的功能
3. 确认核心场景不受影响

---

**文档维护**: 测试文档应随功能迭代持续更新

最后更新: 2025-10-31
