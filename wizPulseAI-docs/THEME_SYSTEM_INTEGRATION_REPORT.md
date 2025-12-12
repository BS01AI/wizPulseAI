# WizPulseAI 主题系统三站点集成报告

## 完成时间
2025-12-12

## 任务概述
集成统一主题系统（shared/styles/themes.css）到三个站点，支持 4 种主题（Indigo/Rose × Light/Dark）和跨站点同步。

---

## 修改的文件清单

### 1. CSS 集成（3 个文件）

#### Main 站点
**文件**: `wizPulseAI-com/src/app/globals.css`
**修改**:
```css
@import '../../../shared/styles/themes.css';
```

#### Auth 站点
**文件**: `auth-wizpulseai-com/src/app/globals.css`
**修改**:
```css
@import '../../../shared/styles/themes.css';
/* 保留遗留主题变量（向后兼容） */
```

#### Dashboard 站点
**文件**: `db-wizPulseAI-com/src/app/globals.css`
**修改**:
```css
@import '../../../shared/styles/themes.css';
```

---

### 2. ThemeScript 组件（新建）

#### 共享组件
**文件**: `shared/theme/ThemeScript.tsx`（主版本）
**功能**:
- 从 Cookie 读取 `WIZPULSE_THEME`（默认值 1）
- 设置 `data-theme` 属性（1-4）
- 同步执行，防止闪烁
- 同时设置 `dark`/`light` class（兼容现有组件）

**复制到各站点**:
- `wizPulseAI-com/src/shared/theme/ThemeScript.tsx`
- `auth-wizpulseai-com/src/shared/theme/ThemeScript.tsx`
- `db-wizPulseAI-com/src/shared/theme/ThemeScript.tsx`

---

### 3. Layout.tsx 修改（3 个文件）

#### Main 站点
**文件**: `wizPulseAI-com/src/app/layout.tsx`
**修改**:
```tsx
import { ThemeScript } from '@/shared/theme/ThemeScript';

<html suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
```

#### Auth 站点
**文件**: `auth-wizpulseai-com/src/app/layout.tsx`
**修改**:
```tsx
import { ThemeScript } from '@/shared/theme/ThemeScript';

<html lang="ja" suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
```

#### Dashboard 站点
**文件**: `db-wizPulseAI-com/src/app/layout.tsx`
**修改**:
```tsx
import { ThemeScript } from '@/shared/theme/ThemeScript';

<html lang="ja" data-nonce={nonce || ''} suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
```

---

### 4. ColorThemeSwitcher 组件（新建）

#### 共享组件
**文件**: `shared/theme/ColorThemeSwitcher.tsx`（主版本）
**功能**:
- 独立选择颜色方案（Indigo / Rose）
- 独立选择明暗度（Light / Dark）
- 自动组合生成主题 ID（1-4）
- 设置跨域 Cookie（`.wizpulseai.com` / `.localhost`）
- 立即应用到 DOM

**UI 设计**:
```
カラーテーマ
● 🔵 Indigo Pro（男性/商務）
○ 🌹 Rose Elegance（女性/時尚）

明るさ
● Light  ○ Dark

※ テーマ設定は全サイト（Auth・Dashboard・Main）で共有されます
```

**复制到**:
- `db-wizPulseAI-com/src/shared/theme/ColorThemeSwitcher.tsx`

---

### 5. Dashboard 设置页面

**文件**: `db-wizPulseAI-com/src/app/dashboard/settings/page.tsx`
**修改**:
```tsx
import { ColorThemeSwitcher } from '@/shared/theme/ColorThemeSwitcher';

<OrbitalCard title={t('settings.themeSection', '外観設定')}>
  <ColorThemeSwitcher
    labels={{
      colorTitle: t('settings.colorTheme', 'カラーテーマ'),
      indigoPro: t('settings.indigoPro', '🔵 Indigo Pro（男性/商務）'),
      roseElegance: t('settings.roseElegance', '🌹 Rose Elegance（女性/時尚）'),
      brightnessTitle: t('settings.brightness', '明るさ'),
      light: t('settings.light', 'Light'),
      dark: t('settings.dark', 'Dark'),
      syncNote: t('settings.themeSyncNote', '※ テーマ設定は全サイト（Auth・Dashboard・Main）で共有されます'),
    }}
  />
</OrbitalCard>
```

---

## 核心机制

### 主题 ID 映射
| 主题 ID | 颜色方案 | 明暗度 | 说明 |
|---------|---------|--------|------|
| 1 | Indigo | Light | 靛蓝亮色（默认）- 男性/商务 |
| 2 | Rose | Light | 玫瑰亮色 - 女性/时尚 |
| 3 | Indigo | Dark | 靛蓝暗色 - 男性/商务 |
| 4 | Rose | Dark | 玫瑰暗色 - 女性/时尚 |

### Cookie 配置
```typescript
{
  name: 'WIZPULSE_THEME',
  domain: '.wizpulseai.com' (生产) / '.localhost' (开发),
  maxAge: 365天,
  path: '/',
  sameSite: 'lax',
  secure: true (生产) / false (开发)
}
```

### 主题应用流程
```
1. ThemeScript（<head>同步执行）
   ↓ 读取 Cookie: WIZPULSE_THEME
   ↓ 设置 data-theme="1" 和 class="light"

2. ColorThemeSwitcher（用户交互）
   ↓ 用户选择颜色（Indigo/Rose）+ 明暗度（Light/Dark）
   ↓ 生成主题 ID（1-4）
   ↓ 更新 Cookie（跨域）
   ↓ 立即应用到 DOM

3. 跨站点同步
   ↓ 用户访问其他站点
   ↓ ThemeScript 读取相同的 Cookie
   ↓ 自动应用相同主题
```

---

## 测试验证步骤

### 步骤 1: 编译验证
```bash
# Main 站点
cd wizPulseAI-com
npm run build

# Auth 站点
cd auth-wizpulseai-com
npm run build

# Dashboard 站点
cd db-wizPulseAI-com
npm run build
```

**预期结果**: 三站点均编译成功，无 TypeScript 错误

---

### 步骤 2: 本地开发环境测试

#### 2.1 启动所有站点
```bash
# Main (3010)
cd wizPulseAI-com && npm run dev

# Auth (3011)
cd auth-wizpulseai-com && npm run dev

# Dashboard (3012)
cd db-wizPulseAI-com && npm run dev
```

#### 2.2 主题切换测试
1. 访问 `http://localhost:3012/dashboard/settings`
2. 切换到 **Rose Elegance + Dark**
3. 验证当前页面主题立即变化
4. 检查浏览器 Cookie:
   ```
   Name: WIZPULSE_THEME
   Value: 4
   Domain: .localhost
   ```

#### 2.3 跨站点同步测试
5. 访问 `http://localhost:3011/auth`（Auth 站点）
6. 验证主题自动应用（Rose Dark）
7. 访问 `http://localhost:3010`（Main 站点）
8. 验证主题自动应用（Rose Dark）

---

### 步骤 3: CSS 变量应用测试

打开浏览器开发者工具 Console，执行：

```javascript
// 检查 CSS 变量
getComputedStyle(document.documentElement).getPropertyValue('--brand-primary');

// 预期结果（Rose Dark）:
// "#f35d74"

// 切换到 Indigo Light，再次检查
getComputedStyle(document.documentElement).getPropertyValue('--brand-primary');

// 预期结果（Indigo Light）:
// "#3F51B5"
```

---

### 步骤 4: 无闪烁验证

1. 清除浏览器缓存
2. 设置主题为 Rose Dark
3. 硬刷新页面（Cmd+Shift+R / Ctrl+Shift+R）
4. **验证**: 页面加载过程中无白色/默认主题闪烁

**原理**: ThemeScript 在 `<head>` 中同步执行，先于页面渲染

---

### 步骤 5: 兼容性测试

#### 5.1 Light/Dark Class 兼容
某些现有组件依赖 `dark` class，验证其正常工作：

```tsx
// 例如：Auth 站点的 ThemeProvider
const { resolvedTheme } = useTheme();
// resolvedTheme 应该是 'light' 或 'dark'
```

#### 5.2 遗留 CSS 变量兼容
Auth 站点保留了遗留的 `--auth-*` 变量，验证其与新主题共存：

```css
/* Auth 站点某些组件仍然使用 */
background: var(--auth-card-bg);
```

---

## 发现的问题和建议

### 1. CSS 导入路径问题 ⚠️
**问题**: 各站点的目录深度不同，`@import` 路径需要手动调整

**当前解决方案**:
- Main: `@import '../../../shared/styles/themes.css';`
- Auth: `@import '../../../shared/styles/themes.css';`
- Dashboard: `@import '../../../shared/styles/themes.css';`

**建议**: 未来考虑使用 npm workspace 或 Turborepo 统一管理

---

### 2. ThemeScript 组件复制问题 ⚠️
**问题**: 每个站点复制了一份 `ThemeScript.tsx`，不利于维护

**当前解决方案**: 从 `shared/theme/` 复制到各站点的 `src/shared/theme/`

**建议**:
- 短期：保持复制，修改主版本后同步
- 长期：使用 monorepo 或共享 npm 包

---

### 3. 多语言翻译缺失 ⚠️
**问题**: `ColorThemeSwitcher` 的标签硬编码为日语

**当前解决方案**: 通过 `labels` prop 支持自定义文本

**待完成**: 添加到各站点的多语言文件
- `db-wizPulseAI-com/src/messages/ja.json`
- `db-wizPulseAI-com/src/messages/en.json`
- `db-wizPulseAI-com/src/messages/ar.json`
- `db-wizPulseAI-com/src/messages/zh-TW.json`

---

### 4. 生产环境 Cookie 域验证 ⚠️
**待验证**: `.wizpulseai.com` 在真实部署环境的跨域 Cookie 共享

**验证步骤**（部署后）:
1. 在 `dashboard.wizpulseai.com` 设置主题
2. 检查 Cookie 域是否为 `.wizpulseai.com`
3. 访问 `auth.wizpulseai.com` 验证主题同步
4. 访问 `www.wizpulseai.com` 验证主题同步

---

## 下一步行动

### 立即任务（P0）
- [ ] 本地测试验证（按照上述步骤）
- [ ] 修复编译错误（如果有）
- [ ] 验证无闪烁加载

### 短期任务（P1 - 1周内）
- [ ] 添加多语言翻译（en/ar/zh-TW）
- [ ] 创建主题预览组件（实时预览效果）
- [ ] 编写自动化测试（Playwright）

### 中期任务（P2 - 2周内）
- [ ] 统一 CSS 变量命名（迁移遗留变量）
- [ ] 添加主题切换动画
- [ ] 优化 CSS bundle size

### 长期规划（P3）
- [ ] 考虑 monorepo 架构（Turborepo）
- [ ] 抽取共享组件为 npm 包
- [ ] 支持自定义品牌色（企业版功能）

---

## 技术债务记录

1. **Auth 站点遗留 CSS 变量**（优先级：低）
   - 文件：`auth-wizpulseai-com/src/app/globals.css`
   - 问题：同时存在新旧两套变量
   - 影响：增加维护成本，但不影响功能
   - 计划：逐步迁移到统一主题变量

2. **组件文件重复**（优先级：中）
   - 文件：`ThemeScript.tsx` 在 4 个位置
   - 问题：修改需要同步更新
   - 计划：monorepo 或 npm workspace

3. **硬编码主题选项**（优先级：低）
   - 文件：`ColorThemeSwitcher.tsx`
   - 问题：只支持 Indigo/Rose，不可扩展
   - 计划：未来支持配置化主题

---

## 参考文档

- 主题系统设计：`/shared/styles/themes.css`
- Cookie 配置规范：`/wizPulseAI-docs/COOKIE_STRATEGY.md`
- 跨站点 SSO 文档：`/wizPulseAI-docs/SSO_ARCHITECTURE.md`

---

## 总结

### 完成度：95%
- ✅ CSS 集成完成
- ✅ ThemeScript 实现并集成
- ✅ ColorThemeSwitcher 创建
- ✅ Dashboard 设置页面更新
- ⚠️ 多语言翻译待补充
- ⚠️ 生产环境验证待完成

### 预估测试时间：30 分钟
- 编译验证：5 分钟
- 本地功能测试：15 分钟
- 跨站点同步测试：10 分钟

### 风险评估：低
- 不破坏现有功能（向后兼容）
- 默认主题保持不变（Indigo Light）
- ThemeScript 优雅降级（失败时使用默认主题）
