/**
 * WizPulseAI 通用日志系统 - 敏感信息过滤器
 *
 * 功能：
 * - 完全隐藏敏感字段（password, token 等）
 * - 部分遮盖用户标识（email, userId 等）
 * - 递归处理嵌套对象
 */

import { SanitizerConfig, DEFAULT_SENSITIVE_FIELDS } from './types'
import { DEFAULT_SANITIZER_CONFIG } from './config'

export class Sanitizer {
  private config: SanitizerConfig
  private redactSet: Set<string>
  private maskSet: Set<string>

  constructor(config: Partial<SanitizerConfig> = {}) {
    this.config = { ...DEFAULT_SANITIZER_CONFIG, ...config }
    // 转为小写 Set，方便匹配
    this.redactSet = new Set(this.config.redactFields.map(f => f.toLowerCase()))
    this.maskSet = new Set(this.config.maskFields.map(f => f.toLowerCase()))
  }

  /**
   * 过滤敏感信息
   */
  sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data
    }

    // 字符串：检查是否像敏感数据
    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    // 数组：递归处理每个元素
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    // 对象：递归处理每个字段
    if (typeof data === 'object') {
      return this.sanitizeObject(data as Record<string, unknown>)
    }

    // 其他类型直接返回
    return data
  }

  /**
   * 处理对象
   */
  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase()

      // 完全隐藏
      if (this.redactSet.has(keyLower)) {
        result[key] = this.config.redactText
        continue
      }

      // 部分遮盖
      if (this.maskSet.has(keyLower) && typeof value === 'string') {
        result[key] = this.maskString(value)
        continue
      }

      // 递归处理
      result[key] = this.sanitize(value)
    }

    return result
  }

  /**
   * 检查字符串是否像敏感数据（JWT token, API key 等）
   */
  private sanitizeString(str: string): string {
    // JWT token 模式 (eyJ...)
    if (str.startsWith('eyJ') && str.includes('.')) {
      return '[JWT_TOKEN]'
    }

    // Bearer token
    if (str.toLowerCase().startsWith('bearer ')) {
      return 'Bearer [REDACTED]'
    }

    // Stripe API key (sk_live_, sk_test_, pk_live_, pk_test_)
    if (/^(sk|pk)_(live|test)_/.test(str)) {
      return str.substring(0, 8) + '[REDACTED]'
    }

    // Supabase key pattern (长字符串，看起来像 API key)
    if (/^[a-zA-Z0-9]{30,}$/.test(str)) {
      return this.maskString(str)
    }

    return str
  }

  /**
   * 部分遮盖字符串
   * - 短字符串（<8字符）：全部遮盖
   * - 中等字符串（8-20字符）：显示前2后2
   * - 长字符串（>20字符）：显示前4后4
   */
  private maskString(str: string): string {
    const len = str.length

    if (len < 8) {
      return '***'
    }

    if (len <= 20) {
      return str.substring(0, 2) + '***' + str.substring(len - 2)
    }

    return str.substring(0, 4) + '***' + str.substring(len - 4)
  }

  /**
   * 添加自定义敏感字段
   */
  addRedactFields(fields: string[]): void {
    fields.forEach(f => this.redactSet.add(f.toLowerCase()))
  }

  /**
   * 添加自定义遮盖字段
   */
  addMaskFields(fields: string[]): void {
    fields.forEach(f => this.maskSet.add(f.toLowerCase()))
  }
}

// 默认单例
export const defaultSanitizer = new Sanitizer()
