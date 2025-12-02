/**
 * WizPulseAI 通用日志系统 - Logger 核心类
 *
 * 特性：
 * - 多级别日志（debug, info, warn, error）
 * - 环境感知（开发/生产不同行为）
 * - 敏感信息自动过滤
 * - 模块化前缀支持
 * - 可扩展 Transport（预留 Sentry 集成）
 */

import {
  LogLevel,
  LogEntry,
  LoggerConfig,
  LogTransport,
  LOG_LEVEL_PRIORITY,
  SiteId,
} from './types'
import {
  DEFAULT_LOGGER_CONFIG,
  LOG_COLORS,
  RESET_COLOR,
  SITE_LABELS,
  isDevelopment,
} from './config'
import { Sanitizer, defaultSanitizer } from './sanitizer'

export class Logger {
  private config: LoggerConfig
  private sanitizer: Sanitizer
  private transports: LogTransport[] = []

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config }
    this.sanitizer = defaultSanitizer
  }

  /**
   * 创建子 Logger（继承配置，设置模块名）
   */
  child(module: string): Logger {
    return new Logger({
      ...this.config,
      module,
    })
  }

  /**
   * 创建站点专用 Logger
   */
  static forSite(site: SiteId, config: Partial<LoggerConfig> = {}): Logger {
    return new Logger({ site, ...config })
  }

  /**
   * 添加 Transport（如 Sentry）
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  /**
   * Debug 日志（开发调试用）
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  /**
   * Info 日志（一般信息）
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  /**
   * Warn 日志（警告）
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  /**
   * Error 日志（错误）
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.log('error', message, context, error)
  }

  /**
   * 核心日志方法
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error | unknown
  ): void {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return
    }

    // 构建日志条目
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      site: this.config.site,
      module: this.config.module,
      context: context ? this.sanitizeContext(context) : undefined,
      error,
    }

    // 输出到控制台
    if (this.config.enableConsole) {
      this.consoleOutput(entry)
    }

    // 发送到 Transports
    this.transports.forEach(t => t.log(entry))
  }

  /**
   * 检查是否应该输出该级别日志
   */
  private shouldLog(level: LogLevel): boolean {
    const minPriority = LOG_LEVEL_PRIORITY[this.config.minLevel || 'debug']
    const currentPriority = LOG_LEVEL_PRIORITY[level]
    return currentPriority >= minPriority
  }

  /**
   * 过滤上下文中的敏感信息
   */
  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    if (!this.config.sanitize) {
      return context
    }
    return this.sanitizer.sanitize(context) as Record<string, unknown>
  }

  /**
   * 控制台输出
   */
  private consoleOutput(entry: LogEntry): void {
    const { level, message, site, module, context, error } = entry

    // 构建前缀
    const siteLabel = SITE_LABELS[site] || site
    const prefix = module ? `[${siteLabel}:${module}]` : `[${siteLabel}]`

    // 开发环境：彩色 + 格式化
    if (this.config.prettyPrint) {
      const color = LOG_COLORS[level]
      const levelStr = level.toUpperCase().padEnd(5)

      // 基本输出
      const baseMsg = `${color}${levelStr}${RESET_COLOR} ${prefix} ${message}`

      if (context && Object.keys(context).length > 0) {
        console[level](baseMsg, context)
      } else {
        console[level](baseMsg)
      }

      // 错误堆栈
      if (error instanceof Error) {
        console.error(error.stack || error.message)
      }
    }
    // 生产环境：JSON 格式（方便日志聚合）
    else {
      const logData = {
        ...entry,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      }
      console[level](JSON.stringify(logData))
    }
  }
}

// 默认 Logger 实例（共享模块用）
export const logger = new Logger()
