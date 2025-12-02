/**
 * WizPulseAI 通用日志系统 - 配置
 */

import { LogLevel, LoggerConfig, SanitizerConfig, DEFAULT_SENSITIVE_FIELDS } from './types'

// 环境检测
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// 从环境变量读取日志级别
export function getEnvLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase()
  if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
    return envLevel as LogLevel
  }
  // 默认：开发环境 debug，生产环境 warn
  return isDevelopment ? 'debug' : 'warn'
}

// 默认 Logger 配置
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  site: 'shared',
  minLevel: getEnvLogLevel(),
  enableConsole: true,
  sanitize: isProduction,  // 生产环境自动开启敏感信息过滤
  prettyPrint: isDevelopment,
}

// 默认 Sanitizer 配置
export const DEFAULT_SANITIZER_CONFIG: SanitizerConfig = {
  redactFields: DEFAULT_SENSITIVE_FIELDS.redact,
  maskFields: DEFAULT_SENSITIVE_FIELDS.mask,
  redactText: '[REDACTED]',
}

// 日志颜色（控制台输出用）
export const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // Cyan
  info: '\x1b[32m',   // Green
  warn: '\x1b[33m',   // Yellow
  error: '\x1b[31m',  // Red
}

export const RESET_COLOR = '\x1b[0m'

// 站点显示名
export const SITE_LABELS: Record<string, string> = {
  auth: 'Auth',
  dashboard: 'Dashboard',
  main: 'Main',
  fashion: 'Fashion',
  shared: 'Shared',
}
