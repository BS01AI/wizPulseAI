/**
 * WizPulseAI SSO 认证 SDK
 *
 * 为所有子站点提供统一的认证接入
 *
 * 使用方法见 README.md
 */

// 配置
export {
  AUTH_CONFIG,
  validateConfig,
  isAllowedRedirect,
  getSafeRedirectUrl,
  ALLOWED_REDIRECT_DOMAINS,
} from './config'

// Supabase 客户端
export {
  supabase,
  logout,
  navigateToLogin,
  navigateToSignUp,
} from './supabase-browser'

// React Hooks & Components
export {
  AuthProvider,
  useAuth,
} from './useAuth'

export {
  AuthGuard,
  withAuth,
} from './AuthGuard'
