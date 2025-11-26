/**
 * WizPulseAI SSO - React 认证 Hook
 *
 * 提供 AuthProvider 和 useAuth Hook
 */
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, logout as supabaseLogout, navigateToLogin } from './supabase-browser'

// Context 类型定义
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: (redirectTo?: string) => Promise<void>
  login: (redirectTo?: string) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  login: () => {},
})

// Provider Props
interface AuthProviderProps {
  children: ReactNode
}

/**
 * 认证 Provider
 *
 * 包裹在应用最外层，提供认证状态
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    console.debug('[Auth SDK] AuthProvider initializing...')

    // 初始获取 Session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('[Auth SDK] Error getting session:', error)
        setSession(null)
      } else {
        console.debug('[Auth SDK] Initial session:', data.session ? 'present' : 'null')
        setSession(data.session)
      }
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.debug(`[Auth SDK] Auth state changed: ${event}`, currentSession ? 'session present' : 'no session')
      setSession(currentSession)
      setIsLoading(false)
    })

    return () => {
      console.debug('[Auth SDK] Unsubscribing from auth state changes')
      subscription.unsubscribe()
    }
  }, [])

  // 登出
  const logout = async (redirectTo?: string) => {
    console.debug('[Auth SDK] Logout requested')
    try {
      await supabaseLogout(redirectTo)
      setSession(null)
    } catch (error) {
      console.error('[Auth SDK] Logout error:', error)
    }
  }

  // 登录（跳转到认证中心）
  const login = (redirectTo?: string) => {
    navigateToLogin(redirectTo)
  }

  const user = session?.user ?? null
  const isAuthenticated = !!session && !isLoading

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated,
      logout,
      login,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 认证 Hook
 *
 * 使用示例：
 * ```tsx
 * const { user, isAuthenticated, logout, login } = useAuth()
 *
 * if (!isAuthenticated) {
 *   return <button onClick={() => login()}>Login</button>
 * }
 *
 * return <div>Welcome, {user?.email}</div>
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
