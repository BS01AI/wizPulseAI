# WizPulseAI SSO 认证 SDK

为 WizPulseAI 平台下所有子站点提供统一的 SSO 认证接入。

## 特性

- 跨子域名 Cookie 共享 (`.wizpulseai.com`)
- 统一登录/登出流程
- React Hooks 和组件
- TypeScript 支持

## 快速开始

### 1. 复制 SDK 到项目

```bash
# 在你的新 App 目录下
cp -r ../shared/auth ./src/shared/auth
```

### 2. 安装依赖

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 3. 配置环境变量

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Cookie 域名（生产环境）
NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com

# 本地开发
# NEXT_PUBLIC_COOKIE_DOMAIN=.localhost

# 认证中心 URL
NEXT_PUBLIC_AUTH_URL=https://auth.wizpulseai.com
```

### 4. 添加 AuthProvider

```tsx
// src/app/layout.tsx
import { AuthProvider } from '@/shared/auth'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 5. 使用认证

```tsx
// 在任何组件中
import { useAuth } from '@/shared/auth'

export function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <button onClick={() => login()}>登录</button>
  }

  return (
    <div>
      <p>欢迎, {user?.email}</p>
      <button onClick={() => logout()}>登出</button>
    </div>
  )
}
```

## API 参考

### useAuth Hook

```tsx
const {
  user,           // User | null - 当前用户
  session,        // Session | null - 当前会话
  isLoading,      // boolean - 是否加载中
  isAuthenticated,// boolean - 是否已认证
  login,          // (redirectTo?: string) => void - 跳转登录
  logout,         // (redirectTo?: string) => Promise<void> - 登出
} = useAuth()
```

### AuthGuard 组件

保护需要登录的页面：

```tsx
import { AuthGuard } from '@/shared/auth'

// 基本用法（未登录自动跳转）
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// 自定义加载组件
<AuthGuard loadingComponent={<Spinner />}>
  <ProtectedContent />
</AuthGuard>

// 自定义未认证显示
<AuthGuard unauthenticatedComponent={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### withAuth 高阶组件

```tsx
import { withAuth } from '@/shared/auth'

function MyPage() {
  return <div>Protected Content</div>
}

export default withAuth(MyPage)
```

### 导航函数

```tsx
import { navigateToLogin, navigateToSignUp, logout } from '@/shared/auth'

// 跳转登录
navigateToLogin('/dashboard')  // 登录后返回 /dashboard

// 跳转注册
navigateToSignUp('/welcome')   // 注册后返回 /welcome

// 登出
await logout('/')              // 登出后返回首页
```

## 文件结构

```
shared/auth/
├── index.ts           # 统一导出
├── config.ts          # 配置和工具函数
├── supabase-browser.ts# Supabase 客户端
├── useAuth.tsx        # React Hook
├── AuthGuard.tsx      # 路由保护组件
└── README.md          # 本文档
```

## 认证流程

```
用户访问 your-app.wizpulseai.com
              │
              ▼
       检查 Cookie
       (.wizpulseai.com)
              │
     ┌────────┴────────┐
     │                 │
  有 Cookie         无 Cookie
     │                 │
     ▼                 ▼
  验证 Session      跳转到
     │              auth.wizpulseai.com
     ▼                 │
  允许访问             ▼
                   用户登录
                      │
                      ▼
                   设置 Cookie
                   (.wizpulseai.com)
                      │
                      ▼
                   跳转回
                   your-app.wizpulseai.com
```

## 注意事项

1. **Cookie 域名**：生产环境必须设置 `NEXT_PUBLIC_COOKIE_DOMAIN=.wizpulseai.com`
2. **本地开发**：使用 `.localhost` 作为 Cookie 域名
3. **HTTPS**：生产环境必须使用 HTTPS（Cookie Secure 属性）
4. **依赖**：需要 `@supabase/ssr` 和 `@supabase/supabase-js`

## 常见问题

### Q: 登录后无法保持状态？

检查 Cookie 域名配置是否正确（生产环境应为 `.wizpulseai.com`）

### Q: 本地开发 SSO 不工作？

本地开发时，各站点需要使用不同端口但相同的 Cookie 域名 `.localhost`

### Q: 如何自定义登录后的跳转？

```tsx
const { login } = useAuth()
login('/my-dashboard')  // 登录后跳转到 /my-dashboard
```

---

**维护者**: WizPulseAI Team
**版本**: 1.0.0
**最后更新**: 2025-11-26
