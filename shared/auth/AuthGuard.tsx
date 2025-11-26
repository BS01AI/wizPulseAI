/**
 * WizPulseAI SSO - 路由保护组件
 *
 * 用于保护需要登录的页面
 */
'use client'

import { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { navigateToLogin } from './supabase-browser'

interface AuthGuardProps {
  children: ReactNode
  /**
   * 自定义加载组件
   */
  loadingComponent?: ReactNode
  /**
   * 自定义未认证组件（不提供则自动跳转登录）
   */
  unauthenticatedComponent?: ReactNode
  /**
   * 登录后返回的 URL（默认当前页面）
   */
  redirectTo?: string
}

/**
 * 认证守卫组件
 *
 * 使用示例：
 * ```tsx
 * // 基本用法（自动跳转登录）
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // 自定义加载状态
 * <AuthGuard loadingComponent={<Spinner />}>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // 自定义未认证显示
 * <AuthGuard unauthenticatedComponent={<LoginPrompt />}>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  loadingComponent,
  unauthenticatedComponent,
  redirectTo,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth()

  // 加载中
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />
  }

  // 未认证
  if (!isAuthenticated) {
    // 如果提供了自定义组件，显示它
    if (unauthenticatedComponent) {
      return <>{unauthenticatedComponent}</>
    }

    // 否则自动跳转到登录
    if (typeof window !== 'undefined') {
      navigateToLogin(redirectTo || window.location.href)
    }

    return <DefaultLoadingComponent />
  }

  // 已认证，显示内容
  return <>{children}</>
}

/**
 * 默认加载组件
 */
function DefaultLoadingComponent() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * 高阶组件版本
 *
 * 使用示例：
 * ```tsx
 * const ProtectedPage = withAuth(MyPage)
 * export default ProtectedPage
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
