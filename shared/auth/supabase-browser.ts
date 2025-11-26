/**
 * WizPulseAI SSO - 浏览器端 Supabase 客户端
 *
 * 使用 @supabase/ssr 包，支持跨子域名 Cookie 共享
 */
'use client'

import { createBrowserClient, type CookieOptions } from '@supabase/ssr'
import { AUTH_CONFIG, validateConfig } from './config'

// 验证配置
validateConfig()

const { supabaseUrl, supabaseAnonKey, cookieDomain, authUrl } = AUTH_CONFIG

/**
 * 创建浏览器端 Supabase 客户端单例
 *
 * Cookie 设置在顶级域名 (.wizpulseai.com)，所有子站点共享
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') {
          return undefined
        }
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim())
          if (cookieName === name) {
            return decodeURIComponent(cookieValue)
          }
        }
        return undefined
      },

      set(name: string, value: string, options: CookieOptions) {
        if (typeof document === 'undefined') {
          return
        }

        const isHostPrefixed = name.startsWith('__Host-')
        const isSecurePrefixed = name.startsWith('__Secure-')

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

        if (isHostPrefixed) {
          cookieString += '; path=/'
          cookieString += '; SameSite=lax'
          cookieString += '; Secure'
        } else if (isSecurePrefixed) {
          cookieString += `; domain=${cookieDomain}`
          cookieString += '; path=/'
          cookieString += '; SameSite=none'
          cookieString += '; Secure'
        } else {
          cookieString += `; domain=${cookieDomain}`
          cookieString += '; path=/'
          cookieString += '; SameSite=lax'
          // 本地开发不需要 Secure
          if (!cookieDomain.includes('localhost')) {
            cookieString += '; Secure'
          }
        }

        const maxAge = options.maxAge || (60 * 60 * 24 * 365)
        cookieString += `; max-age=${maxAge}`

        if (options.expires) {
          cookieString += `; expires=${(options.expires as Date).toUTCString()}`
        }

        document.cookie = cookieString
      },

      remove(name: string, options: CookieOptions) {
        if (typeof document === 'undefined') {
          return
        }

        const isHostPrefixed = name.startsWith('__Host-')
        const isSecurePrefixed = name.startsWith('__Secure-')

        let cookieString = `${encodeURIComponent(name)}=`

        if (isHostPrefixed) {
          cookieString += '; path=/'
          cookieString += '; SameSite=lax'
          cookieString += '; Secure'
        } else if (isSecurePrefixed) {
          cookieString += `; domain=${cookieDomain}`
          cookieString += '; path=/'
          cookieString += '; SameSite=none'
          cookieString += '; Secure'
        } else {
          cookieString += `; domain=${cookieDomain}`
          cookieString += '; path=/'
          cookieString += '; SameSite=lax'
          if (!cookieDomain.includes('localhost')) {
            cookieString += '; Secure'
          }
        }

        cookieString += '; max-age=0'
        document.cookie = cookieString
      }
    }
  }
)

/**
 * 登出函数
 *
 * 1. 清除本地 Session
 * 2. 重定向到认证中心进行统一登出
 */
export const logout = async (redirectTo?: string) => {
  const finalRedirectTo =
    redirectTo ||
    (typeof window !== 'undefined' ? window.location.origin : null) ||
    '/'

  const authLogoutUrl = `${authUrl.replace(/\/$/, '')}/auth/v1/logout`
  const centralLogoutRedirectUrl = `${authLogoutUrl}?redirect_to=${encodeURIComponent(finalRedirectTo)}`

  console.debug('[Auth SDK] Logging out, redirecting to:', centralLogoutRedirectUrl)

  // 先清除本地 Session
  supabase.auth.signOut().catch(e => {
    console.warn('[Auth SDK] Local signOut error (non-blocking):', e)
  })

  // 重定向到认证中心
  if (typeof window !== 'undefined') {
    window.location.href = centralLogoutRedirectUrl
  }

  return new Promise(() => {})
}

/**
 * 跳转到登录页面
 */
export const navigateToLogin = (redirectTo?: string) => {
  if (typeof window !== 'undefined') {
    const finalRedirectTo = redirectTo || window.location.href
    const loginUrl = `${authUrl}/auth?view=sign_in&redirect_to=${encodeURIComponent(finalRedirectTo)}`

    console.debug('[Auth SDK] Navigating to login:', loginUrl)
    window.location.href = loginUrl
  }
}

/**
 * 跳转到注册页面
 */
export const navigateToSignUp = (redirectTo?: string) => {
  if (typeof window !== 'undefined') {
    const finalRedirectTo = redirectTo || window.location.href
    const signUpUrl = `${authUrl}/auth?view=sign_up&redirect_to=${encodeURIComponent(finalRedirectTo)}`

    console.debug('[Auth SDK] Navigating to sign up:', signUpUrl)
    window.location.href = signUpUrl
  }
}
