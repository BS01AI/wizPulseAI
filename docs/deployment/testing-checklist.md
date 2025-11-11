# 完整测试检查清单

## 📋 文档说明

本检查清单涵盖从本地测试到生产部署的所有测试项目。

**使用方法**:
1. 打印此文档或在屏幕上逐项检查
2. 完成后在 □ 中打勾 ✓
3. 记录测试结果和问题
4. 所有项目通过后方可进入下一阶段

---

## Phase 1: 本地环境测试 ⬜

### 前置检查
- [ ] Node.js v18+ 已安装
- [ ] npm 依赖已安装（三个站点）
- [ ] .env.local 文件已配置
- [ ] Supabase 项目可访问

### 站点启动验证
- [ ] Auth 站点启动成功 (localhost:3001)
- [ ] Dashboard 站点启动成功 (localhost:3002)
- [ ] Main 站点启动成功 (localhost:3000)
- [ ] 没有编译错误
- [ ] 没有端口冲突

### 浏览器访问
- [ ] Auth: http://localhost:3001/auth 显示登录表单
- [ ] Dashboard: http://localhost:3002 显示或重定向
- [ ] Main: http://localhost:3000 显示主页
- [ ] 没有 ERR_FAILED 错误
- [ ] 没有 Service Worker 冲突

### SSO 登录流程
- [ ] 从 Main 站点点击登录
- [ ] 正确跳转到 Auth 站点
- [ ] URL 包含 redirect_to 参数
- [ ] 邮箱密码登录成功
- [ ] Google OAuth 登录成功（可选）
- [ ] 登录后跳转到 Dashboard
- [ ] Dashboard 显示用户信息

### Cookie 验证
- [ ] Cookie 设置在 localhost 域
- [ ] sb-*access-token 存在
- [ ] sb-*refresh-token 存在
- [ ] Cookie SameSite 属性正确
- [ ] Cookie Secure 标志正确

### 跨站点状态同步
- [ ] 登录后，Main 站点显示已登录
- [ ] 登录后，Auth 站点识别已登录
- [ ] 登出后，所有站点显示未登录
- [ ] Cookie 正确清除

### Phase 1 完成标准
- [ ] 所有检查项通过 ✓
- [ ] 测试记录已保存
- [ ] 问题已记录（如有）

---

## Phase 2: 用户管理验证 ⬜

### 数据库结构
- [ ] auth.users 表存在
- [ ] user_metadata 字段存在
- [ ] user_metadata.app_role 可读写
- [ ] 至少有 1 个测试用户

### 管理员账号
- [ ] 至少有 1 个 admin 账号
- [ ] Admin 账号可正常登录
- [ ] Admin 账号 user_metadata.app_role='admin'
- [ ] Admin 账号能访问 /dashboard/admin

### 用户列表功能
- [ ] 能访问 /dashboard/admin/users
- [ ] 显示所有用户
- [ ] 显示正确的邮箱
- [ ] 显示正确的角色
- [ ] 显示创建时间
- [ ] 分页功能正常（如有）

### 用户详情功能
- [ ] 能查看用户详情
- [ ] 显示完整信息
- [ ] 显示订阅状态（如有）
- [ ] 显示使用记录（如有）

### 用户编辑功能
- [ ] 能编辑用户角色
- [ ] 角色下拉菜单正常
- [ ] 保存成功
- [ ] 页面显示成功提示
- [ ] 列表中角色已更新

### 用户删除功能
- [ ] 能删除/停用用户
- [ ] 弹出确认对话框
- [ ] 确认后状态变更
- [ ] 或从列表中消失

### 搜索和筛选
- [ ] 搜索用户功能正常
- [ ] 搜索支持部分匹配
- [ ] 角色筛选功能正常
- [ ] 筛选结果正确

### 权限测试矩阵

#### Admin 用户
- [ ] 能访问 /dashboard
- [ ] 能访问 /dashboard/settings
- [ ] 能访问 /dashboard/billing
- [ ] 能访问 /dashboard/admin/*
- [ ] 侧边栏显示 "Admin" 菜单

#### User 用户
- [ ] 能访问 /dashboard
- [ ] 能访问 /dashboard/settings
- [ ] 能访问 /dashboard/billing
- [ ] 不能访问 /dashboard/admin（403）
- [ ] 侧边栏不显示 "Admin" 菜单

#### Deleted 用户
- [ ] 能登录（Auth 层面）
- [ ] 不能使用 Dashboard（应用层面）
- [ ] 显示账号停用消息

#### 未登录用户
- [ ] 访问 /dashboard 自动重定向
- [ ] 重定向到登录页面
- [ ] 登录成功后返回原页面

### CRUD 操作测试

#### Create
- [ ] 通过注册创建新用户
- [ ] 新用户默认角色为 "user"
- [ ] 新用户出现在列表

#### Read
- [ ] 查看用户列表
- [ ] 查看用户详情
- [ ] 数据显示正确

#### Update
- [ ] 更新用户角色
- [ ] 更新用户元数据
- [ ] 更新成功并同步

#### Delete
- [ ] 软删除（角色改为 deleted）
- [ ] 或硬删除（从数据库删除）
- [ ] 删除操作正确执行

### Phase 2 完成标准
- [ ] 所有检查项通过 ✓
- [ ] 至少有 1 admin + 2 user 测试账号
- [ ] 测试记录已保存

---

## Phase 3: 部署准备 ⬜

### Vercel 项目配置
- [ ] wizpulseai-auth 项目已创建
- [ ] wizpulseai-dashboard 项目已创建
- [ ] wizpulseai-main 项目已创建
- [ ] Root Directory 配置正确
- [ ] Framework 识别为 Next.js

### 环境变量 - Auth 站点
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
- [ ] NEXT_PUBLIC_AUTH_URL
- [ ] NEXT_PUBLIC_DASHBOARD_URL
- [ ] NEXT_PUBLIC_MAIN_URL
- [ ] NEXT_PUBLIC_DEFAULT_REDIRECT_URL
- [ ] 作用域：Production + Preview

### 环境变量 - Dashboard 站点
- [ ] 所有 Auth 的变量
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] 作用域：Production + Preview

### 环境变量 - Main 站点
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
- [ ] NEXT_PUBLIC_AUTH_URL
- [ ] NEXT_PUBLIC_DASHBOARD_URL
- [ ] NEXT_PUBLIC_MAIN_URL
- [ ] 作用域：Production + Preview

### DNS 配置
- [ ] auth.wizpulseai.com CNAME → cname.vercel-dns.com
- [ ] dashboard.wizpulseai.com CNAME → cname.vercel-dns.com
- [ ] www.wizpulseai.com CNAME → cname.vercel-dns.com
- [ ] DNS 解析成功（nslookup）

### Vercel 域名配置
- [ ] auth.wizpulseai.com 已添加
- [ ] dashboard.wizpulseai.com 已添加
- [ ] www.wizpulseai.com 已添加
- [ ] 域名显示 "Valid Configuration"
- [ ] SSL 状态显示 "Active"

### Supabase 配置
- [ ] 回调 URL: https://auth.wizpulseai.com/api/auth/callback
- [ ] Site URL: https://www.wizpulseai.com
- [ ] 邮件模板指向 auth.wizpulseai.com

### Stripe 配置（Dashboard 专属）
- [ ] Webhook endpoint 已创建
- [ ] URL: https://dashboard.wizpulseai.com/api/webhooks/stripe
- [ ] 事件已勾选：
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Signing secret 已保存到 Vercel

### 本地构建测试
- [ ] auth-wizpulseai-com 构建成功
- [ ] db-wizPulseAI-com 构建成功
- [ ] wizPulseAI-com 构建成功
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误

### Phase 3 完成标准
- [ ] 所有检查项通过 ✓
- [ ] 配置截图已保存
- [ ] 配置文档已更新

---

## Phase 4: 生产部署 ⬜

### 部署前确认
- [ ] Phase 1, 2, 3 全部完成
- [ ] 代码已推送到 Git 主分支
- [ ] 所有环境变量已配置
- [ ] DNS 已生效

### Auth 站点部署
- [ ] 部署已触发
- [ ] 构建成功
- [ ] 部署状态: Ready ✓
- [ ] https://auth.wizpulseai.com 可访问
- [ ] SSL 证书有效
- [ ] 登录页面正常显示

### Dashboard 站点部署
- [ ] 部署已触发
- [ ] 构建成功
- [ ] 部署状态: Ready ✓
- [ ] https://dashboard.wizpulseai.com 可访问
- [ ] SSL 证书有效
- [ ] 未登录时正确重定向

### Main 站点部署
- [ ] 部署已触发
- [ ] 构建成功
- [ ] 部署状态: Ready ✓
- [ ] https://www.wizpulseai.com 可访问
- [ ] SSL 证书有效
- [ ] 主页正常显示

### 生产环境 SSO 测试
- [ ] 从 www 点击登录
- [ ] 跳转到 auth.wizpulseai.com
- [ ] 邮箱密码登录成功
- [ ] 登录后跳转到 dashboard.wizpulseai.com
- [ ] Dashboard 显示用户信息
- [ ] www 站点显示已登录状态

### Cookie 验证（生产）
- [ ] Cookie domain: .wizpulseai.com
- [ ] Cookie Secure: ✓
- [ ] Cookie SameSite: None
- [ ] sb-*access-token 存在
- [ ] sb-*refresh-token 存在

### 跨站点状态同步（生产）
- [ ] 登录后，所有站点显示已登录
- [ ] 登出后，所有站点显示未登录
- [ ] Session 自动刷新正常

### 用户管理功能（生产）
- [ ] Admin 能访问 /dashboard/admin/users
- [ ] 用户列表正常显示
- [ ] 用户编辑功能正常
- [ ] 权限控制正常
- [ ] User 不能访问管理页面

### 性能测试

#### Lighthouse 测试
- [ ] Auth 站点 Performance > 80
- [ ] Dashboard 站点 Performance > 80
- [ ] Main 站点 Performance > 80
- [ ] Accessibility > 90（所有站点）
- [ ] Best Practices > 90（所有站点）
- [ ] SEO > 90（所有站点）

#### 加载时间
- [ ] Auth 首屏 < 3 秒
- [ ] Dashboard 首屏 < 3 秒
- [ ] Main 首屏 < 3 秒

#### 资源优化
- [ ] JS Bundle < 500KB（单个站点）
- [ ] 图片已优化
- [ ] 使用 CDN 缓存

### 安全测试

#### SSL/TLS
- [ ] SSL Labs 评级 A 或 A+（auth）
- [ ] SSL Labs 评级 A 或 A+（dashboard）
- [ ] SSL Labs 评级 A 或 A+（www）

#### 安全头
- [ ] Content-Security-Policy 已设置
- [ ] X-Content-Type-Options 已设置
- [ ] X-Frame-Options 已设置
- [ ] Referrer-Policy 已设置

#### 漏洞检查
- [ ] 测试 SQL 注入 - 无漏洞
- [ ] 测试 XSS - 无漏洞
- [ ] 测试 CSRF - 无漏洞
- [ ] 测试开放重定向 - 无漏洞

### Stripe 测试（Dashboard）
- [ ] Webhook 端点可达
- [ ] 测试 Webhook 返回 200 OK
- [ ] Webhook 签名验证正常
- [ ] 测试创建 Checkout Session
- [ ] 测试订阅流程（使用测试卡）

### 监控配置
- [ ] Vercel Analytics 已启用（所有站点）
- [ ] 日志可正常查看
- [ ] 告警规则已配置：
  - [ ] 部署失败
  - [ ] 函数错误率超标
  - [ ] 性能下降
- [ ] 通知渠道已配置（Email/Slack）

### Phase 4 完成标准
- [ ] 所有检查项通过 ✓
- [ ] 测试记录已保存
- [ ] 部署文档已更新
- [ ] 团队已通知

---

## 🎊 最终验收清单

### 功能完整性
- [ ] SSO 登录完整流程正常
- [ ] 用户管理功能完全正常
- [ ] 权限系统按预期工作
- [ ] 跨站点状态同步正常

### 性能达标
- [ ] Lighthouse 分数达标
- [ ] 加载时间满足要求
- [ ] 资源优化完成

### 安全达标
- [ ] SSL 配置正确
- [ ] 安全头配置完成
- [ ] Cookie 安全设置正确
- [ ] 无已知安全漏洞

### 运维就绪
- [ ] 监控系统已配置
- [ ] 日志系统可用
- [ ] 告警规则已设置
- [ ] 备份策略已确定

### 文档完整
- [ ] 部署文档已更新
- [ ] 环境变量已记录
- [ ] 测试记录已保存
- [ ] 问题清单已整理

---

## 📋 签字确认

### 测试完成确认

**测试日期**: 2025-10-__

**测试者**: ________

**测试结果**:
- Phase 1: ⬜ 通过 / ⬜ 未通过
- Phase 2: ⬜ 通过 / ⬜ 未通过
- Phase 3: ⬜ 通过 / ⬜ 未通过
- Phase 4: ⬜ 通过 / ⬜ 未通过

**遗留问题**: ________

**建议**: ________

**签名**: ________ **日期**: 2025-10-__

---

### 部署批准

**批准人**: ________

**批准日期**: 2025-10-__

**批准意见**:
⬜ 批准部署到生产环境
⬜ 需要修复问题后重新测试

**签名**: ________ **日期**: 2025-10-__

---

## 📊 测试统计

**总测试项**: ______
**已通过**: ______
**未通过**: ______
**通过率**: ______%

**测试覆盖**:
- 功能测试: ______%
- 性能测试: ______%
- 安全测试: ______%
- 集成测试: ______%

---

**文档版本**: v1.0
**创建日期**: 2025-10-30
**最后更新**: 2025-10-30
