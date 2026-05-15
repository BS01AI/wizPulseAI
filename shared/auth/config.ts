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

// 允许的重定向 origin（SSO 安全）。新增产品域名请通过
// NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS 扩展，而不是放开整个顶级域。
const DEFAULT_ALLOWED_REDIRECT_ORIGINS = [
  'https://www.wizpulseai.com',
  'https://dashboard.wizpulseai.com',
  'https://auth.wizpulseai.com',
  'https://magicoord.wizpulseai.com',
  'https://geo.wizpulseai.com',
  'https://expo.wizpulseai.com',
]

const DEV_ALLOWED_REDIRECT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3010',
  'http://localhost:3011',
  'http://localhost:3012',
  'http://localhost:3013',
  'http://localhost:3014',
  'http://www.local.wiz:3010',
  'http://auth.local.wiz:3011',
  'http://dashboard.local.wiz:3012',
  'http://fashion.local.wiz:3013',
  'http://geo.local.wiz:3001',
]

export const ALLOWED_REDIRECT_DOMAINS = DEFAULT_ALLOWED_REDIRECT_ORIGINS

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '').toLowerCase()
}

function getAllowedRedirectOrigins(): string[] {
  const envOrigins = (process.env.NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS || '')
    .split(',')
    .map(origin => normalizeOrigin(origin.trim()))
    .filter(Boolean)

  const origins = process.env.NODE_ENV === 'production'
    ? [...DEFAULT_ALLOWED_REDIRECT_ORIGINS, ...envOrigins]
    : [...DEFAULT_ALLOWED_REDIRECT_ORIGINS, ...DEV_ALLOWED_REDIRECT_ORIGINS, ...envOrigins]

  return Array.from(new Set(origins.map(normalizeOrigin)))
}

function isSafeRelativePath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('../') && !url.includes('/..')
}

/**
 * 检查 URL 是否在允许的重定向域名列表中
 */
export function isAllowedRedirect(url: string): boolean {
  if (isSafeRelativePath(url)) {
    return true
  }

  try {
    const parsedUrl = new URL(url)

    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return false
    }

    if (parsedUrl.protocol === 'http:' && process.env.NODE_ENV === 'production') {
      return false
    }

    return getAllowedRedirectOrigins().includes(normalizeOrigin(parsedUrl.origin))
  } catch {
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
