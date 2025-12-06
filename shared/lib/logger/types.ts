/**
 * WizPulseAI 通用日志系统 - 类型定义
 *
 * 支持所有站点：Auth / Dashboard / Main / Fashion / 未来站点
 */

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志级别优先级（数字越大优先级越高）
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// 站点标识
export type SiteId =
  | 'auth'      // auth.wizpulseai.com
  | 'dashboard' // dashboard.wizpulseai.com
  | 'main'      // www.wizpulseai.com
  | 'fashion'   // magicoord.wizpulseai.com
  | 'shared'    // 共享模块
  | string      // 未来站点

// 日志条目
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  site: SiteId
  module?: string           // 模块名（如 'checkout', 'auth', 'upload'）
  context?: Record<string, unknown>  // 额外上下文
  error?: Error | unknown   // 错误对象
}

// 日志配置
export interface LoggerConfig {
  site: SiteId
  module?: string
  minLevel?: LogLevel       // 最低日志级别（低于此级别不输出）
  enableConsole?: boolean   // 是否输出到控制台
  sanitize?: boolean        // 是否过滤敏感信息
  prettyPrint?: boolean     // 是否格式化输出（开发环境）
}

// 敏感字段配置
export interface SanitizerConfig {
  // 需要完全隐藏的字段
  redactFields: string[]
  // 需要部分隐藏的字段（显示前后几位）
  maskFields: string[]
  // 替换文本
  redactText: string
}

// Transport 接口（用于扩展，如 Sentry）
export interface LogTransport {
  name: string
  log(entry: LogEntry): void | Promise<void>
}

// 默认敏感字段列表
export const DEFAULT_SENSITIVE_FIELDS = {
  // 完全隐藏
  redact: [
    'password',
    'secret',
    'token',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'apiKey',
    'api_key',
    'secretKey',
    'secret_key',
    'privateKey',
    'private_key',
    'authorization',
    'cookie',
    'session',
  ],
  // 部分隐藏（显示前4后4）
  mask: [
    'email',
    'userId',
    'user_id',
    'customerId',
    'customer_id',
    'stripeCustomerId',
    'stripe_customer_id',
    'photoId',
    'photo_id',
    'creditCard',
    'cardNumber',
  ],
}
