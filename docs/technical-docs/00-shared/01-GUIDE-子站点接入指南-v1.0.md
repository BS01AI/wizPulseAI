# 子站点接入指南 - 实用优化版

## 文档信息
- **版本**: v1.0
- **作者**: WizPulseAI Tech Team
- **创建日期**: 2025-01-30
- **最后更新**: 2025-01-30
- **状态**: 已发布

## 概述
本指南提供一个**实用的子站点接入方案**，在保持现有架构稳定的前提下，通过小幅优化提升开发效率和用户体验。

## 设计原则
1. **不推倒重来** - 基于现有代码优化
2. **Copy 即可用** - 新站点快速接入
3. **渐进式改进** - 逐步优化体验
4. **保持简单** - 不过度工程化

## 快速接入步骤

### Step 1: 复制基础文件

创建新站点时，复制以下文件：

```bash
# 1. 创建新站点目录
mkdir new-site-wizpulseai-com
cd new-site-wizpulseai-com

# 2. 复制基础结构（从 Dashboard 或主站）
cp -r ../db-wizPulseAI-com/src/shared ./src/
cp -r ../db-wizPulseAI-com/src/components/ui ./src/components/
cp ../db-wizPulseAI-com/src/middleware.ts ./src/
cp ../db-wizPulseAI-com/tailwind.config.ts ./
cp ../db-wizPulseAI-com/tsconfig.json ./
```

### Step 2: 配置环境变量

创建 `.env.local`：

```env
# Supabase (与其他站点相同)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 站点 URLs
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
NEXT_PUBLIC_APP_URL=https://new-site.wizpulseai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.wizpulseai.com

# Cookie 配置
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com
NEXT_PUBLIC_DEFAULT_LOCALE=ja

# 开发环境端口（统一规划）
# auth: 3001
# dashboard: 3002  
# main: 3000
# new-site: 3003
```

### Step 3: 创建优化的共享组件

为了减少闪烁和提升体验，创建一个优化版的认证包装器：

```typescript
// src/components/auth/AuthWrapper.tsx
'use client'

import { useAuth } from '@/shared/auth/useAuth'
import { useEffect, useState } from 'react'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 添加一个小延迟，确保认证状态稳定
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 统一的加载状态
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

### Step 4: 优化的 UserMenu 组件

创建一个改进版的 UserMenu，减少硬编码：

```typescript
// src/components/shared/UserMenu.tsx
import { config } from '@/config/site'

export function UserMenu() {
  // 使用配置文件而不是硬编码
  const urls = {
    auth: config.urls.auth,
    dashboard: config.urls.dashboard,
  }
  
  // 使用 prefetch 优化跳转
  const handleDashboardClick = () => {
    // 预加载 Dashboard 页面
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = urls.dashboard
    document.head.appendChild(link)
    
    // 延迟跳转，让预加载生效
    setTimeout(() => {
      window.location.href = urls.dashboard
    }, 50)
  }
  
  // ... 其他逻辑
}
```

### Step 5: 创建站点配置文件

集中管理配置，避免散落的环境变量：

```typescript
// src/config/site.ts
export const config = {
  // 站点基本信息
  site: {
    name: 'New Site',
    description: 'WizPulseAI New Service',
    defaultLocale: 'ja',
  },
  
  // URLs 配置
  urls: {
    auth: process.env.NEXT_PUBLIC_AUTH_URL!,
    dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL!,
    main: process.env.NEXT_PUBLIC_MAIN_URL!,
    self: process.env.NEXT_PUBLIC_APP_URL!,
  },
  
  // Cookie 配置
  cookie: {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wizpulseai.com',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  
  // 开发环境端口映射
  devPorts: {
    auth: 3001,
    dashboard: 3002,
    main: 3000,
    self: 3003,
  }
}
```

## 优化建议（不改变架构）

### 1. 减少认证检查闪烁

在 `layout.tsx` 中添加：

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. 优化跨站点导航

创建一个智能链接组件：

```typescript
// src/components/shared/CrossSiteLink.tsx
export function CrossSiteLink({ 
  href, 
  site, 
  children 
}: { 
  href: string
  site: 'auth' | 'dashboard' | 'main'
  children: React.ReactNode 
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 添加加载指示器
    document.body.style.cursor = 'wait'
    
    // 保存滚动位置（如果需要返回）
    sessionStorage.setItem('lastScrollPosition', window.scrollY.toString())
    
    // 跳转
    window.location.href = href
  }
  
  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  )
}
```

### 3. 统一错误处理

创建错误边界：

```typescript
// src/components/shared/ErrorBoundary.tsx
export function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryInner
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2>Something went wrong</h2>
            <button onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundaryInner>
  )
}
```

### 4. 开发体验优化

创建开发脚本：

```json
// package.json
{
  "scripts": {
    "dev": "next dev -p 3003",
    "dev:all": "npm run dev:auth & npm run dev:dashboard & npm run dev:main & npm run dev",
    "dev:auth": "cd ../auth-wizpulseai-com && npm run dev",
    "dev:dashboard": "cd ../db-wizPulseAI-com && npm run dev",
    "dev:main": "cd ../wizPulseAI-com && npm run dev"
  }
}
```

## 最小化改动清单

### 必须修改
1. ✅ 环境变量配置
2. ✅ 站点名称和描述
3. ✅ 开发端口号

### 建议修改
1. 📦 添加 AuthWrapper 减少闪烁
2. 🔗 使用 CrossSiteLink 优化跳转
3. ⚙️ 创建 config/site.ts 集中配置

### 可选优化
1. 💾 添加认证状态本地缓存
2. 🎨 统一加载动画样式
3. 📊 添加性能监控

## 新站点 Checklist

```markdown
- [ ] 复制基础文件结构
- [ ] 配置环境变量
- [ ] 修改站点信息
- [ ] 测试认证流程
- [ ] 测试跨站点跳转
- [ ] 部署到 Vercel
- [ ] 配置域名和 SSL
```

## 常见问题

### Q: Cookie 不共享？
A: 检查 domain 是否设置为 `.wizpulseai.com`（注意前面的点）

### Q: 开发环境认证失效？
A: localhost 不支持顶级域 Cookie，需要使用各站点独立登录

### Q: 页面跳转闪烁？
A: 使用 AuthWrapper 组件包裹，添加适当的加载状态

### Q: 如何调试认证问题？
A: 在浏览器开发工具中检查 Application → Cookies

## 总结

这个方案的优势：
1. **最小改动** - 基于现有代码，不推倒重来
2. **快速接入** - 新站点 30 分钟内可运行
3. **渐进优化** - 可以逐步改善体验
4. **保持稳定** - 不影响现有系统

记住：**能用就是好的，完美是优秀的敌人**。

---
最后更新: 2025-01-30