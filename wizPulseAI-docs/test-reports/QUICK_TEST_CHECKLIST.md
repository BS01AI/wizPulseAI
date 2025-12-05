# WizPulseAI SSO 快速测试清单

生成时间: 2025-12-05
用途: 生产环境部署后快速验证

---

## 第1步: 基础访问验证 (5分钟)

访问以下URL，确认无报错：

- [ ] https://www.wizpulseai.com
- [ ] https://auth.wizpulseai.com
- [ ] https://dashboard.wizpulseai.com
- [ ] https://fashion.wizpulseai.com

**验证点**: 页面正常加载，无控制台错误

---

## 第2步: Cookie域配置检查 (5分钟) ⭐ 最重要

### 操作步骤：

1. 打开 https://www.wizpulseai.com
2. 按 F12 打开开发者工具
3. 点击 "Application" 或 "应用程序" 标签
4. 左侧选择 "Cookies" → "https://www.wizpulseai.com"
5. 在控制台执行：

```javascript
// 查看所有Cookie
document.cookie.split(';').forEach(c => console.log(c.trim()))

// 特别检查认证Cookie
const cookies = document.cookie;
console.log('包含 .wizpulseai.com 域的Cookie:');
// 需要在Application标签手动检查domain列
```

### 验证清单：

在 Application → Cookies 中手动检查：

- [ ] `NEXT_LOCALE` - Domain = `.wizpulseai.com`
- [ ] `WIZPULSE_THEME` - Domain = `.wizpulseai.com`
- [ ] 任何以 `sb-` 开头的Cookie - Domain = `.wizpulseai.com`

**如果domain不是 `.wizpulseai.com`，立即检查Vercel环境变量！**

---

## 第3步: SSO登录测试 (10分钟)

### 测试3.1: 邮箱密码登录

1. [ ] 访问 https://www.wizpulseai.com
2. [ ] 点击右上角 "Login" 按钮
3. [ ] 确认跳转到 `https://auth.wizpulseai.com/auth?view=sign_in&redirect_to=...`
4. [ ] 填写测试账户：
   - 邮箱: sun.bo@bs01ai.com
   - 密码: 12345678
5. [ ] 点击 "Sign In"
6. [ ] 确认自动跳转回 Main 站点
7. [ ] 确认 Header 显示用户邮箱
8. [ ] 检查Cookie已设置（F12 → Application → Cookies）

**验证点**:
- ✅ 整个流程无报错
- ✅ 返回原页面（redirect_to生效）
- ✅ 用户信息正确显示

### 测试3.2: 跨站点Session共享

1. [ ] 保持Main站点登录状态
2. [ ] 新标签页打开 https://dashboard.wizpulseai.com
3. [ ] 确认**无需重新登录**，直接显示Dashboard
4. [ ] 确认显示相同的用户信息

**验证点**:
- ✅ Dashboard自动识别登录状态
- ✅ 用户信息一致

### 测试3.3: 单点登出

1. [ ] 在Dashboard点击右上角用户菜单 → "Log out"
2. [ ] 确认登出成功
3. [ ] 返回Main站点标签页，刷新页面（F5）
4. [ ] 确认Main站点也显示未登录状态

**验证点**:
- ✅ Dashboard登出
- ✅ Main同步登出
- ✅ Cookie被清除（F12检查）

---

## 第4步: Google OAuth测试 (5分钟)

1. [ ] 访问 https://auth.wizpulseai.com/auth?view=sign_in
2. [ ] 点击 "Sign in with Google"
3. [ ] Google授权页面授权（如果已授权则自动）
4. [ ] 确认回调成功，无报错
5. [ ] 确认跳转到目标页面
6. [ ] 确认Google头像正确显示

**验证点**:
- ✅ OAuth流程完整
- ✅ 头像和用户信息正确

---

## 第5步: 多语言测试 (5分钟)

### 测试5.1: 语言切换

1. [ ] 在Main站点右上角选择语言切换器
2. [ ] 切换到 "English"
3. [ ] 确认页面切换为英文
4. [ ] 检查Cookie: `NEXT_LOCALE=en`（F12 → Application）

### 测试5.2: 跨站点语言同步

1. [ ] 保持Main站点为英文
2. [ ] 访问 https://auth.wizpulseai.com/auth
3. [ ] 确认Auth站点自动显示英文
4. [ ] 访问 https://dashboard.wizpulseai.com
5. [ ] 确认Dashboard也显示英文

**验证点**:
- ✅ 语言切换成功
- ✅ Cookie domain = `.wizpulseai.com`
- ✅ 跨站点语言一致

### 测试5.3: 阿拉伯语RTL

1. [ ] 切换到 "العربية" (阿拉伯语)
2. [ ] 确认文本从右到左排列
3. [ ] 确认导航菜单镜像翻转

**验证点**:
- ✅ RTL布局正确
- ✅ 无布局错乱

---

## 第6步: 主题测试 (5分钟) - 可选

1. [ ] 登录Dashboard
2. [ ] 访问 设置 → 外観設定
3. [ ] 切换主题为 "Dark"
4. [ ] 访问Main站点
5. [ ] 确认Main站点也显示深色主题
6. [ ] 检查Cookie: `WIZPULSE_THEME=dark`

**验证点**:
- ✅ Dashboard切换主题
- ✅ Main同步主题
- ✅ Cookie正确设置

---

## 第7步: Fashion站点SSO (3分钟)

1. [ ] 在Main站点登录
2. [ ] 访问 https://fashion.wizpulseai.com
3. [ ] 确认Fashion站点识别登录状态
4. [ ] 检查是否显示用户信息或个性化内容

**验证点**:
- ✅ Fashion站点SSO正常
- ✅ 用户状态正确

---

## 🚨 发现问题时的行动

### 如果Cookie domain不是 `.wizpulseai.com`:

**立即检查Vercel环境变量**:

1. 登录 Vercel Dashboard
2. 选择对应项目
3. Settings → Environment Variables
4. 确认存在且正确：
   ```
   NEXT_PUBLIC_COOKIE_DOMAIN = .wizpulseai.com
   ```
5. 如果缺失或错误，添加/修改后重新部署

### 如果SSO不工作:

1. 打开浏览器控制台 (F12)
2. 查看 Console 错误信息
3. 检查 Network 标签，查看API请求
4. 截图并记录错误详情
5. 联系开发团队

### 如果跨站点功能异常:

1. 清除浏览器Cookie和缓存
2. 使用隐身模式重新测试
3. 检查不同浏览器（Chrome/Firefox/Safari）
4. 记录具体异常行为

---

## 📊 测试完成报告模板

```
WizPulseAI SSO 测试完成报告
测试时间: [填写日期时间]
测试人员: [填写姓名]

### 测试结果总览
- 基础访问: ✅/❌
- Cookie配置: ✅/❌
- SSO登录: ✅/❌
- 跨站点Session: ✅/❌
- 单点登出: ✅/❌
- Google OAuth: ✅/❌
- 多语言: ✅/❌
- 主题同步: ✅/❌
- Fashion SSO: ✅/❌

### 发现的问题
1. [问题描述]
   - 优先级: P0/P1/P2
   - 截图: [链接]
   - 复现步骤: [详细步骤]

2. [问题描述]
   ...

### 总体评价
[通过/部分通过/失败]

### 建议
[优化建议]
```

---

## 📌 重要提醒

1. **Cookie检查是最重要的步骤**
   - 如果Cookie domain错误，所有SSO功能都会失败
   - 必须在部署后第一时间验证

2. **使用真实用户账户测试**
   - 测试账户: sun.bo@bs01ai.com
   - 或创建新的测试账户

3. **多浏览器验证**
   - Chrome (主要测试)
   - Safari (Apple生态)
   - Firefox (备选)

4. **记录所有异常**
   - 截图
   - 控制台日志
   - Network请求详情

---

**预计总耗时**: 30-40分钟
**必须完成**: 步骤1-3（基础+Cookie+SSO）
**推荐完成**: 步骤4-5（OAuth+多语言）
**可选完成**: 步骤6-7（主题+Fashion）

