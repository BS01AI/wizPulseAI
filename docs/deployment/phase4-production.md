# Phase 4: 生产环境部署

## 📋 阶段概述

**目标**: 部署三个站点到生产环境并完成端到端验证

**预计时间**: 2小时

**优先级**: 🟢 P3（最后阶段）

**前置条件**:
- Phase 1, 2, 3 全部完成
- Vercel 项目配置完成
- 所有环境变量已设置
- DNS 和域名配置完成

## ✅ 前置条件检查

```bash
# 1. 确认所有 Phase 已完成
# Phase 1: 本地测试 ✓
# Phase 2: 用户管理 ✓
# Phase 3: 部署准备 ✓

# 2. 确认 Vercel 配置
# - 3个项目已创建 ✓
# - 环境变量已配置 ✓
# - 域名已绑定 ✓

# 3. 确认代码已推送
git status
git log -1  # 查看最新提交
```

## 📝 任务清单

- [ ] 任务 4.1: 部署 Auth 站点
- [ ] 任务 4.2: 部署 Dashboard 站点
- [ ] 任务 4.3: 部署 Main 站点
- [ ] 任务 4.4: 生产环境端到端测试
- [ ] 任务 4.5: 验证用户管理功能
- [ ] 任务 4.6: 性能和安全检查
- [ ] 任务 4.7: 监控和日志配置

---

## 📌 部署顺序（重要！）

**必须按以下顺序部署**：

```
1️⃣ Auth 站点    (认证中心，基础设施)
2️⃣ Dashboard    (依赖 Auth 的认证)
3️⃣ Main 站点    (依赖 Auth 和 Dashboard)
```

**原因**：
- Auth 提供认证服务，其他站点依赖它
- Dashboard 可能包含管理功能，需要先于 Main 上线
- Main 站点会引导用户到 Auth 和 Dashboard

---

## 任务 4.1: 部署 Auth 站点 🔐

### 方法 1: 通过 Git 推送（推荐）

```bash
# 1. 确保在正确的分支
git branch
# 应该显示: * main

# 2. 确保代码已提交
git status
# 应该显示: nothing to commit, working tree clean

# 3. 推送到 GitHub
git push origin main

# 4. Vercel 自动部署
# 访问 https://vercel.com/dashboard
# 找到 wizpulseai-auth 项目
# 查看 Deployments 页面
# 应该看到新的部署正在进行
```

### 方法 2: 使用 Vercel CLI

```bash
cd auth-wizpulseai-com

# 部署到生产环境
vercel --prod

# 跟随提示:
# ✔ Linked to wizpulseai-auth
# ✔ Inspect: https://vercel.com/...
# ✔ Production: https://auth.wizpulseai.com
```

### 方法 3: 手动触发部署

```
1. Vercel Dashboard → wizpulseai-auth
2. Deployments 标签
3. 点击最新的部署（或创建新部署）
4. 点击右上角 "Redeploy"
5. 选择 "Deploy to Production"
6. 点击 "Redeploy"
```

### 验证 Auth 站点部署

```bash
# 1. 等待部署完成（通常 2-5 分钟）
# Vercel Dashboard 显示: ✓ Ready

# 2. 访问生产 URL
curl -I https://auth.wizpulseai.com
# 预期: HTTP/2 200

# 3. 浏览器访问
# https://auth.wizpulseai.com/auth
# 应该显示登录/注册表单

# 4. 检查 SSL 证书
# 浏览器地址栏应显示锁图标
# 证书应显示: Let's Encrypt (Vercel)
```

### Auth 部署检查清单
- [ ] 部署状态: Ready ✓
- [ ] 域名可访问: https://auth.wizpulseai.com ✓
- [ ] SSL 证书有效 ✓
- [ ] 登录页面正常显示 ✓
- [ ] 没有控制台错误 ✓

---

## 任务 4.2: 部署 Dashboard 站点 📊

### 部署步骤（同 Auth）

```bash
# 方法 1: Git 推送
git push origin main
# Vercel 自动部署 Dashboard

# 方法 2: CLI
cd db-wizPulseAI-com
vercel --prod
cd ..
```

### 验证 Dashboard 站点部署

```bash
# 1. 检查部署状态
curl -I https://dashboard.wizpulseai.com
# 预期: HTTP/2 200 或 302 (未登录重定向)

# 2. 浏览器访问
# https://dashboard.wizpulseai.com
# 应该重定向到 Auth 站点登录
# 或显示 Dashboard 主页（如果已登录）

# 3. 测试 API 端点
curl -I https://dashboard.wizpulseai.com/api/health
# 或其他健康检查端点
```

### Dashboard 部署检查清单
- [ ] 部署状态: Ready ✓
- [ ] 域名可访问: https://dashboard.wizpulseai.com ✓
- [ ] SSL 证书有效 ✓
- [ ] 未登录时正确重定向到 Auth ✓
- [ ] Stripe Webhook 可达（后面测试）✓

---

## 任务 4.3: 部署 Main 站点 🌐

### 部署步骤（同上）

```bash
# 方法 1: Git 推送
git push origin main

# 方法 2: CLI
cd wizPulseAI-com
vercel --prod
cd ..
```

### 验证 Main 站点部署

```bash
# 1. 检查部署状态
curl -I https://www.wizpulseai.com
# 预期: HTTP/2 200

# 2. 浏览器访问
# https://www.wizpulseai.com
# 应该显示主页

# 3. 检查静态资源加载
# F12 → Network
# 确认 CSS, JS, 图片都正常加载
```

### Main 站点检查清单
- [ ] 部署状态: Ready ✓
- [ ] 域名可访问: https://www.wizpulseai.com ✓
- [ ] SSL 证书有效 ✓
- [ ] 主页正常显示 ✓
- [ ] 3D 动画/图片正常加载 ✓
- [ ] 登录按钮可见 ✓

---

## 任务 4.4: 生产环境端到端测试 🧪

### 测试场景 1: 完整登录流程

```
Step 1: 访问主站
- 打开浏览器（隐身模式）
- 访问 https://www.wizpulseai.com
- 验证: 页面正常显示，右上角有登录按钮

Step 2: 点击登录
- 点击 "Sign In" 按钮
- 验证: 跳转到 https://auth.wizpulseai.com/auth?...
- 验证: URL 包含 redirect_to 参数

Step 3: 登录
- 输入邮箱和密码（或使用 Google OAuth）
- 点击 "Sign In"
- 验证: 登录成功

Step 4: 回调和重定向
- 验证: 自动跳转到 https://dashboard.wizpulseai.com
- 验证: 显示用户信息（头像、邮箱）
- 验证: Cookie 已设置在 .wizpulseai.com 域

Step 5: 跨站点状态验证
- 访问 https://www.wizpulseai.com
- 验证: 右上角显示用户头像（已登录）
- 访问 https://auth.wizpulseai.com/auth
- 验证: 已识别登录状态

Step 6: 登出测试
- 在 Dashboard 点击登出
- 验证: 返回登录页或主页
- 验证: www.wizpulseai.com 显示未登录
```

### 测试场景 2: Cookie 验证

```
打开 Chrome DevTools (F12) → Application → Cookies

检查 .wizpulseai.com 域的 Cookie:
- [ ] sb-lhofj...access-token 存在
- [ ] sb-lhofj...refresh-token 存在
- [ ] Domain: .wizpulseai.com (注意前面的点)
- [ ] Secure: ✓
- [ ] SameSite: None (生产环境)
- [ ] HttpOnly: ✓ (部分 Cookie)
```

### 测试场景 3: 跨域请求

```javascript
// 在 Main 站点控制台执行
fetch('https://dashboard.wizpulseai.com/api/some-endpoint', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)

// 预期: 正常返回数据（Cookie 自动发送）
```

---

## 任务 4.5: 验证用户管理功能 👥

### 测试管理员功能

```
Step 1: 使用管理员账号登录
- 访问 https://dashboard.wizpulseai.com
- 使用 admin 账号登录

Step 2: 访问用户管理
- 点击侧边栏 "Admin" → "Users"
- 或直接访问 https://dashboard.wizpulseai.com/dashboard/admin/users

Step 3: 测试用户管理功能
- [ ] 查看用户列表
- [ ] 查看用户详情
- [ ] 编辑用户角色
- [ ] 搜索用户
- [ ] 筛选用户

Step 4: 测试权限控制
- 使用普通 user 账号登录
- 尝试访问 /dashboard/admin/users
- 验证: 返回 403 或重定向（无权限）
```

### 测试订阅管理（如果已实现）

```
- [ ] 查看订阅列表
- [ ] 查看订阅详情
- [ ] 创建测试订阅
- [ ] 取消订阅
```

---

## 任务 4.6: 性能和安全检查 🔒

### 性能检查

#### 使用 Lighthouse

```
1. Chrome DevTools → Lighthouse 标签
2. 选择 Categories:
   ✓ Performance
   ✓ Accessibility
   ✓ Best Practices
   ✓ SEO
3. 分别测试三个站点
4. 目标分数:
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90
```

#### 检查资源加载

```
F12 → Network 标签
- [ ] 首屏加载时间 < 3秒
- [ ] JS Bundle 大小合理 (< 500KB)
- [ ] 图片已优化
- [ ] 使用了 CDN 缓存
```

### 安全检查

#### SSL/TLS 配置

```
访问 https://www.ssllabs.com/ssltest/
输入: auth.wizpulseai.com
目标: A 或 A+ 评级
```

#### 安全头检查

```
访问 https://securityheaders.com/
输入各站点 URL
检查以下头是否存在:
- [ ] Content-Security-Policy
- [ ] X-Content-Type-Options
- [ ] X-Frame-Options
- [ ] Referrer-Policy
```

#### Cookie 安全性

```
F12 → Application → Cookies
检查所有 Cookie:
- [ ] Secure 标志已设置
- [ ] SameSite 属性正确
- [ ] HttpOnly 标志（敏感 Cookie）
- [ ] 过期时间合理
```

### 常见漏洞检查

```
- [ ] 测试 SQL 注入（输入特殊字符）
- [ ] 测试 XSS（输入 <script> 标签）
- [ ] 测试 CSRF（跨站请求）
- [ ] 测试开放重定向（修改 redirect_to 参数）
```

---

## 任务 4.7: 监控和日志配置 📊

### Vercel 内置监控

```
Vercel Dashboard → 各项目 → Analytics
- 查看页面访问量
- 查看函数调用统计
- 查看错误率
```

### 错误追踪（推荐集成 Sentry）

```javascript
// 在各站点添加 Sentry 配置
// sentry.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 日志查看

```
Vercel Dashboard → 项目 → Logs

筛选日志:
- 按时间范围
- 按日志级别 (Error, Warning, Info)
- 按路径

常见日志内容:
- API 请求
- 函数执行时间
- 错误堆栈
- 数据库查询
```

### 配置告警

```
Vercel Dashboard → 项目 → Settings → Notifications

配置告警规则:
- 部署失败
- 函数错误率超过阈值
- 性能下降
- 配额超限

通知渠道:
- Email
- Slack
- Discord
```

---

## ✅ 验收标准

### 部署成功 ✓
- [ ] 三个站点都部署成功
- [ ] 域名可正常访问
- [ ] SSL 证书有效
- [ ] 没有部署错误

### 功能验证 ✓
- [ ] SSO 登录流程正常
- [ ] 跨站点状态同步正常
- [ ] 用户管理功能正常
- [ ] 管理员权限控制正常

### 性能达标 ✓
- [ ] Lighthouse 分数 > 80
- [ ] 首屏加载 < 3秒
- [ ] 资源加载优化

### 安全达标 ✓
- [ ] SSL Labs 评级 A+
- [ ] 安全头配置正确
- [ ] Cookie 安全设置正确
- [ ] 无常见安全漏洞

### 监控配置 ✓
- [ ] Vercel Analytics 已启用
- [ ] 日志可正常查看
- [ ] 告警规则已配置

---

## 📊 最终测试记录表

| 测试项 | Auth | Dashboard | Main | 状态 |
|-------|------|-----------|------|-----|
| 域名可访问 | | | | ⬜ |
| SSL 有效 | | | | ⬜ |
| 页面正常显示 | | | | ⬜ |
| SSO 登录 | ✓ | | | ⬜ |
| Cookie 设置 | ✓ | | | ⬜ |
| 状态同步 | | ✓ | ✓ | ⬜ |
| 用户管理 | | ✓ | | ⬜ |
| 权限控制 | | ✓ | | ⬜ |
| Lighthouse 性能 | | | | ⬜ |
| SSL Labs 评级 | | | | ⬜ |
| 安全头配置 | | | | ⬜ |

---

## 🔧 部署故障排查

### 问题 1: 部署失败

**可能原因**:
- 构建错误
- 环境变量缺失
- 依赖问题

**解决方法**:
```bash
# 查看 Vercel 部署日志
# Dashboard → Deployments → 点击失败的部署 → Logs

# 本地重现构建
npm run build

# 检查环境变量
# Vercel Dashboard → Settings → Environment Variables
```

### 问题 2: 域名无法访问

**可能原因**:
- DNS 未生效
- Vercel 域名配置错误
- SSL 证书问题

**解决方法**:
```bash
# 检查 DNS 解析
nslookup auth.wizpulseai.com

# 检查 Vercel 域名配置
# Dashboard → Settings → Domains
# 确认显示 "Valid Configuration"

# 等待 DNS 传播（最多 48 小时，通常几分钟）
```

### 问题 3: Cookie 不共享

**可能原因**:
- Domain 设置错误
- SameSite 策略问题
- 浏览器安全策略

**解决方法**:
```bash
# 检查环境变量
# NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
# 注意前面的点！

# 验证 Cookie 设置
# F12 → Application → Cookies
# Domain 应该是 .wizpulseai.com
```

### 问题 4: 登录后跳转失败

**可能原因**:
- redirect_to 参数丢失
- Supabase 回调 URL 错误
- URL 验证逻辑过严

**解决方法**:
```
1. 检查 Auth 站点的 redirect.ts
2. 确认 isValidRedirectUrl 允许生产域名
3. 检查 Supabase 回调 URL 配置
```

---

## 🎉 部署成功后的下一步

### 立即任务
- [ ] 通知团队部署完成
- [ ] 更新项目文档
- [ ] 发布发布说明

### 短期任务（1周内）
- [ ] 监控错误率和性能
- [ ] 收集用户反馈
- [ ] 修复紧急 bug
- [ ] 优化性能瓶颈

### 中期任务（1个月内）
- [ ] 添加更多功能
- [ ] 改进用户体验
- [ ] 增强安全性
- [ ] 优化 SEO

### 持续改进
- [ ] 定期查看监控数据
- [ ] 定期更新依赖
- [ ] 定期备份数据
- [ ] 定期安全审计

---

## 📋 部署完成确认

当所有检查都通过后，填写以下确认表：

```markdown
## 部署完成确认

**部署日期**: 2025-10-__
**部署者**: ________
**版本**: v1.0.0

### 站点状态
- [x] Auth: https://auth.wizpulseai.com ✓
- [x] Dashboard: https://dashboard.wizpulseai.com ✓
- [x] Main: https://www.wizpulseai.com ✓

### 功能验证
- [x] SSO 登录正常 ✓
- [x] 用户管理正常 ✓
- [x] 权限系统正常 ✓

### 性能和安全
- [x] Lighthouse 分数达标 ✓
- [x] SSL Labs 评级 A+ ✓
- [x] 安全头配置正确 ✓

### 监控配置
- [x] Analytics 已启用 ✓
- [x] 告警已配置 ✓

**签名**: ________
**日期**: 2025-10-__
```

---

## 🎊 恭喜！部署完成！

您已成功完成 WizPulseAI 三站点的完整部署！

**下一步建议**：
1. 📝 更新 CLAUDE.md，记录部署完成状态
2. 📊 定期查看 Vercel Analytics 和日志
3. 👥 邀请团队成员测试
4. 🚀 开始开发新功能

**获取帮助**：
- Vercel 文档: https://vercel.com/docs
- Supabase 文档: https://supabase.com/docs
- Next.js 文档: https://nextjs.org/docs

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
