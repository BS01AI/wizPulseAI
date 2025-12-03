# Header 统一设计系统

## 设计原则

### 核心统一要素
1. **背景**: 统一使用 `bg-white/80 backdrop-blur-md`
2. **高度**: 固定 `py-4` (约64px)
3. **定位**: `fixed top-0 z-50`
4. **容器**: `max-w-6xl mx-auto px-6`
5. **布局**: Flex justify-between

### 品牌层次表达

#### Logo区域 (Left)
```tsx
// 结构: [返回链接] | [Logo]
<div className="flex items-center gap-4">
  {/* 返回链接 (可选) */}
  {backLink && (
    <>
      <Link href={backLink} className="flex items-center gap-2 text-gray-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline text-sm font-medium">{backText}</span>
      </Link>
      <div className="hidden md:block h-6 w-px bg-gray-200" />
    </>
  )}

  {/* Logo */}
  <Link href="/" className="flex items-center gap-2">
    {logoIcon}
    <span className="text-xl font-bold bg-gradient-to-r {gradientColors} bg-clip-text text-transparent">
      {siteName}
    </span>
  </Link>
</div>
```

#### 导航区域 (Right)
```tsx
<div className="flex items-center gap-4">
  {/* 语言切换 (如需要) */}
  {hasLanguageSwitcher && <LanguageSwitcher />}

  {/* 用户菜单或登录按钮 */}
  {isAuthenticated ? <UserMenu /> : <LoginButton />}
</div>
```

## 配色方案 (按站点)

### Main站点 & Life/Biz页面
```css
/* Logo渐变 */
from-violet-600 to-indigo-600

/* Hover色 */
hover:text-violet-600

/* 边框 */
border-violet-100
```

### Fashion站点
```css
/* Logo渐变 */
from-rose-500 to-purple-500

/* Hover色 */
hover:text-rose-500

/* 边框 */
border-rose-100
```

### 其他产品站点
各站点可自定义主题色，但保持结构一致。

## 响应式规范

### 桌面端 (≥768px)
- 完整Logo文字
- 完整返回文字
- 横向导航

### 移动端 (<768px)
- 保留Logo
- 返回链接只显示箭头
- 汉堡菜单或简化导航

## 返回导航规范

### 站点层次
```
WizPulseAI主站
  ├── Life产品页 (/life)
  │   └── Fashion Advisor (fashion.wizpulseai.com)
  └── Biz产品页 (/biz)
      └── 其他产品...
```

### 返回链接文案
- Fashion → Life: "← Back to WizLife" (ja: "← WizLife に戻る")
- Life → Main: "← Back to Home" (ja: "← ホームに戻る")
- Fashion应用内 → Fashion首页: "←" (只箭头)

## 实施清单

### Phase 1: 统一Fashion站点内部 ✅
- [x] 首页Header
- [x] 应用内Header
- [x] 字体大小统一为 `text-xl`
- [x] 边框统一为 `border-rose-100`

### Phase 2: 统一Main站点 Header
- [ ] 改用 `backdrop-blur-md` 替代 `glass` class
- [ ] 添加底部边框 `border-violet-100`
- [ ] Logo圆形保持，但统一尺寸

### Phase 3: 创建共享Header组件
- [ ] 提取到 `/shared/components/UnifiedHeader.tsx`
- [ ] 支持主题配置 (violet/rose/blue等)
- [ ] 支持返回链接配置
- [ ] 支持语言切换开关

## 代码示例

### 统一Header组件接口
```typescript
interface UnifiedHeaderProps {
  // 品牌配置
  siteName: string
  logoIcon: React.ReactNode
  logoHref?: string

  // 主题色
  theme: 'violet' | 'rose' | 'blue' | 'green'

  // 返回导航
  backLink?: string
  backText?: string

  // 功能开关
  hasLanguageSwitcher?: boolean
  hasUserMenu?: boolean

  // 自定义导航
  customNav?: React.ReactNode
}
```

### 使用示例
```tsx
// Fashion首页
<UnifiedHeader
  siteName="Fashion Advisor"
  logoIcon="👗"
  theme="rose"
  backLink="https://www.wizpulseai.com/ja/life"
  backText="Back to WizLife"
  hasLanguageSwitcher
/>

// Main站点
<UnifiedHeader
  siteName="wizPulseAI"
  logoIcon={<WizPulseLogo />}
  theme="violet"
  hasUserMenu
  customNav={<MainNav />}
/>
```

## 视觉对比

### Before (不一致)
```
Main:     [圆Logo wizPulseAI] ----------- [Nav Links] [User] [CTA]
Fashion:  [👗 Fashion] ------------------- [Lang] [Login]
Fashion App: [👗 Closet] --------------- [🏠 📚 ←]
```

### After (统一)
```
Main:     [圆Logo wizPulseAI] ----------- [Nav] [User] [CTA]
Fashion:  [← WizLife | 👗 Fashion] ------ [Lang] [Login]
Fashion App: [← | 👗 Fashion] --------- [🏠 📚]
```

## 维护指南

1. **修改Logo**: 更新 `logoIcon` prop
2. **修改主题色**: 更新 `theme` prop
3. **添加新站点**: 创建新的theme color scheme
4. **修改布局**: 保持 Flex 结构，调整gap和padding

---

**创建日期**: 2025-12-03
**负责人**: multi-site-coder agent
