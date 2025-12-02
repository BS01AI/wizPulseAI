/**
 * WizPulseAI 通用日志系统
 *
 * @example 基本使用
 * ```ts
 * import { logger } from '@/shared/lib/logger'
 *
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Payment failed', error, { orderId: '456' })
 * ```
 *
 * @example 站点专用 Logger
 * ```ts
 * import { Logger } from '@/shared/lib/logger'
 *
 * // 创建 Fashion 站点专用 Logger
 * const log = Logger.forSite('fashion')
 * log.info('Image uploaded')
 *
 * // 创建模块子 Logger
 * const checkoutLog = log.child('checkout')
 * checkoutLog.info('Checkout started', { packageId: 'starter' })
 * ```
 *
 * @example 生产环境敏感信息自动过滤
 * ```ts
 * // 这段代码在生产环境会自动过滤敏感信息
 * logger.info('User action', {
 *   userId: 'user_abc123xyz',    // → user***xyz
 *   token: 'eyJhbGc...',         // → [JWT_TOKEN]
 *   email: 'test@example.com',   // → te***om
 *   password: '123456',          // → [REDACTED]
 * })
 * ```
 */

// 核心类
export { Logger, logger } from './logger'

// 敏感信息过滤
export { Sanitizer, defaultSanitizer } from './sanitizer'

// 配置
export {
  isDevelopment,
  isProduction,
  isTest,
  getEnvLogLevel,
  DEFAULT_LOGGER_CONFIG,
  DEFAULT_SANITIZER_CONFIG,
} from './config'

// 类型
export type {
  LogLevel,
  LogEntry,
  LoggerConfig,
  LogTransport,
  SanitizerConfig,
  SiteId,
} from './types'

export { LOG_LEVEL_PRIORITY, DEFAULT_SENSITIVE_FIELDS } from './types'

// ============================================
// 预配置的站点 Logger（方便直接导入使用）
// ============================================

import { Logger } from './logger'

/** Auth 站点 Logger */
export const authLogger = Logger.forSite('auth')

/** Dashboard 站点 Logger */
export const dashboardLogger = Logger.forSite('dashboard')

/** Main 站点 Logger */
export const mainLogger = Logger.forSite('main')

/** Fashion 站点 Logger */
export const fashionLogger = Logger.forSite('fashion')
