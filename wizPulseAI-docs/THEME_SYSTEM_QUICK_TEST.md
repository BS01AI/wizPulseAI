# 主题系统快速测试指南

## 测试环境准备

### 1. 启动所有站点
```bash
# 终端 1 - Main 站点
cd /Users/bms/Work/CodeWork/Web/wizPulseAI/wizPulseAI-com
npm run dev

# 终端 2 - Auth 站点
cd /Users/bms/Work/CodeWork/Web/wizPulseAI/auth-wizpulseai-com
npm run dev

# 终端 3 - Dashboard 站点
cd /Users/bms/Work/CodeWork/Web/wizPulseAI/db-wizPulseAI-com
npm run dev
```

**端口分配**:
- Main: http://localhost:3010
- Auth: http://localhost:3011
- Dashboard: http://localhost:3012

---

## 测试步骤（10分钟）

### 步骤 1: 主题切换测试 (3分钟)

1. 访问 Dashboard 设置页面：
   ```
   http://localhost:3012/dashboard/settings
   ```

2. 找到"外観設定"卡片

3. 测试颜色切换：
   - 点击 "🔵 Indigo Pro（男性/商務）" → 页面立即变为蓝紫色调
   - 点击 "🌹 Rose Elegance（女性/時尚）" → 页面立即变为玫瑰粉色调

4. 测试明暗度切换：
   - 点击 "Light" → 背景变亮，文字变深
   - 点击 "Dark" → 背景变深，文字变亮

5. 测试组合：
   - 选择 **Rose + Dark**
   - 观察页面变为深色背景 + 粉色主题

---

### 步骤 2: Cookie 验证 (2分钟)

1. 打开浏览器开发者工具（F12）

2. 切换到 Application → Cookies → http://localhost:3012

3. 查找 `WIZPULSE_THEME` Cookie：
   ```
   Name: WIZPULSE_THEME
   Value: 4 (Rose Dark)
   Domain: .localhost
   Path: /
   ```

4. 验证值与主题对应：
   | Cookie 值 | 主题 |
   |-----------|------|
   | 1 | Indigo Light |
   | 2 | Rose Light |
   | 3 | Indigo Dark |
   | 4 | Rose Dark |

---

### 步骤 3: 跨站点同步测试 (3分钟)

**前置条件**: Dashboard 已设置为 Rose Dark (Cookie = 4)

1. **测试 Auth 站点**：
   - 访问：http://localhost:3011/auth
   - **预期**：页面自动应用 Rose Dark 主题
   - **验证点**：
     - 背景色深色
     - 主按钮粉色
     - 文字浅色

2. **测试 Main 站点**：
   - 访问：http://localhost:3010
   - **预期**：首页自动应用 Rose Dark 主题
   - **验证点**：
     - Header 深色背景
     - CTA 按钮粉色
     - 文字浅色

3. **反向验证**：
   - 回到 Dashboard，切换到 **Indigo Light**
   - 刷新 Auth 站点 → 应该立即变为浅色蓝紫主题
   - 刷新 Main 站点 → 应该立即变为浅色蓝紫主题

---

### 步骤 4: 无闪烁验证 (2分钟)

1. 在 Dashboard 设置主题为 **Rose Dark**

2. 清除浏览器缓存（Cmd+Shift+Delete / Ctrl+Shift+Delete）

3. 硬刷新页面（Cmd+Shift+R / Ctrl+Shift+F5）

4. **观察页面加载过程**：
   - ✅ 正确：页面从一开始就是深色背景，无白色闪烁
   - ❌ 错误：先显示白色，然后跳变为深色

5. **原理**：ThemeScript 在 `<head>` 中同步执行，先于页面内容渲染

---

## CSS 变量验证（可选）

打开浏览器 Console，执行：

```javascript
// 查看当前主题 ID
document.documentElement.getAttribute('data-theme');
// 应该返回: "1", "2", "3", 或 "4"

// 查看品牌主色
getComputedStyle(document.documentElement).getPropertyValue('--brand-primary');
// Indigo Light (1): "#3F51B5"
// Rose Light (2): "#bb2649"
// Indigo Dark (3): "#757de8"
// Rose Dark (4): "#f35d74"

// 查看背景色
getComputedStyle(document.documentElement).getPropertyValue('--bg-base');
// Light 模式: "#FFFFFF"
// Dark 模式: "#0f1219" (Indigo) 或 "#12090b" (Rose)
```

---

## 常见问题排查

### 问题 1: 主题不同步

**症状**: Dashboard 切换主题，其他站点没变化

**检查步骤**:
1. 打开 DevTools → Application → Cookies
2. 查看 `WIZPULSE_THEME` 的 Domain
3. **应该是**: `.localhost`（注意前面的点）
4. **如果是**: `localhost`（没有点）→ Cookie 无法跨子域共享

**解决方案**:
```typescript
// ColorThemeSwitcher.tsx 的 getCookieOptions()
domain: '.localhost', // 必须有前导点
```

---

### 问题 2: 页面闪烁

**症状**: 刷新页面时先白后黑

**检查步骤**:
1. 查看 layout.tsx 的 `<head>` 是否包含 `<ThemeScript />`
2. 确认 `suppressHydrationWarning` 已添加到 `<html>` 标签

**解决方案**:
```tsx
<html suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
```

---

### 问题 3: CSS 变量未应用

**症状**: 主题 ID 正确，但颜色没变

**检查步骤**:
1. 查看 globals.css 是否导入了 themes.css
2. 检查浏览器 Console 是否有 CSS 导入错误

**解决方案**:
```css
/* globals.css 顶部 */
@import '../../../shared/styles/themes.css';
```

---

### 问题 4: 编译错误

**症状**: npm run build 失败

**检查步骤**:
1. 确认 ThemeScript.tsx 已复制到各站点的 `src/shared/theme/`
2. 检查导入路径是否正确

**解决方案**:
```bash
# 重新复制文件
cp /Users/bms/Work/CodeWork/Web/wizPulseAI/shared/theme/ThemeScript.tsx \
   /Users/bms/Work/CodeWork/Web/wizPulseAI/auth-wizpulseai-com/src/shared/theme/
```

---

## 测试结果模板

```
主题系统测试报告 - [日期]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 编译验证
  • Main 站点: 成功
  • Auth 站点: 成功
  • Dashboard 站点: 成功

✅ 主题切换
  • Indigo ↔ Rose: 正常
  • Light ↔ Dark: 正常
  • 组合切换: 正常

✅ Cookie 验证
  • Cookie 名称: WIZPULSE_THEME ✓
  • Cookie 域: .localhost ✓
  • Cookie 值: 1-4 ✓

✅ 跨站点同步
  • Dashboard → Auth: 正常
  • Dashboard → Main: 正常
  • 反向同步: 正常

✅ 无闪烁加载
  • 硬刷新测试: 无闪烁 ✓
  • 清除缓存测试: 无闪烁 ✓

❌ 发现的问题
  • [如果有，列出问题和截图]

备注
  • 测试浏览器: Chrome/Safari/Firefox
  • 测试时间: [约10分钟]
  • 测试人员: [名字]
```

---

## 下一步

测试通过后：
1. 添加多语言翻译（en/ar/zh-TW）
2. 生产环境部署验证
3. 创建用户文档

测试失败时：
1. 截图错误现象
2. 记录浏览器 Console 错误
3. 查看上面的"常见问题排查"
4. 联系开发团队
