/**
 * WizPulseAI SSO 认证配置
 *
 * 所有子站点共享此配置
 */

// 环境变量
export const AUTH_CONFIG = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',

  // Cookie 域名（所有子站点共享）- 生产环境默认 .wizpulseai.com
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.wizpulseai.com',

  // 认证中心 URL
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.wizpulseai.com',

  // Dashboard URL
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.wizpulseai.com',
}

// 验证配置
export function validateConfig() {
  const errors: string[] = []

  if (!AUTH_CONFIG.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!AUTH_CONFIG.supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  if (errors.length > 0) {
    console.error('[Auth SDK] Configuration errors:', errors)
    throw new Error(`Auth SDK configuration errors: ${errors.join(', ')}`)
  }

  return true
}

// 允许的重定向域名（SSO 安全）
export const ALLOWED_REDIRECT_DOMAINS = [
  'wizpulseai.com',
  'localhost',
]

/**
 * 检查 URL 是否在允许的重定向域名列表中
 */
export function isAllowedRedirect(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      parsedUrl.hostname === domain ||
      parsedUrl.hostname.endsWith(`.${domain}`)
    )
  } catch {
    // 相对路径总是允许的
    if (url.startsWith('/')) {
      return true
    }
    return false
  }
}

/**
 * 获取安全的重定向 URL
 */
export function getSafeRedirectUrl(redirectTo: string | null | undefined, defaultUrl: string = '/'): string {
  if (!redirectTo) {
    return defaultUrl
  }

  if (isAllowedRedirect(redirectTo)) {
    return redirectTo
  }

  console.warn('[Auth SDK] Blocked unsafe redirect:', redirectTo)
  return defaultUrl
}
