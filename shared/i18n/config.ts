/**
 * 共享i18n配置
 * Shared i18n Configuration
 *
 * 这个配置文件被3个站点共享：
 * - Main (wizPulseAI-com)
 * - Auth (auth-wizpulseai-com)
 * - Dashboard (db-wizPulseAI-com)
 */

import type { Locale, LocaleLabel } from './types';

/**
 * 支持的语言列表
 * Supported locales
 */
export const LOCALES: readonly Locale[] = ['ja', 'en', 'ar', 'zh-TW'] as const;

/**
 * 默认语言
 * Default locale
 */
export const DEFAULT_LOCALE: Locale = 'ja';

/**
 * Cookie名称（跨站点共享）
 * Cookie name (shared across sites)
 */
export const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Cookie域名（环境感知）
 * Cookie domain (environment-aware)
 *
 * 生产环境：.wizpulseai.com（3个子域名共享）
 * 本地开发：.localhost（本地测试）
 */
export const COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? '.wizpulseai.com'
    : '.localhost';

/**
 * Cookie过期时间（天）
 * Cookie expiration (days)
 */
export const COOKIE_EXPIRES = 365;

/**
 * 语言显示配置
 * Language display configuration
 */
export const LOCALE_LABELS: LocaleLabel[] = [
  { locale: 'ja', label: '日本語', flag: '🇯🇵' },
  { locale: 'en', label: 'English', flag: '🇺🇸' },
  { locale: 'ar', label: 'العربية', flag: '🇸🇦' },
  { locale: 'zh-TW', label: '繁體中文', flag: '🇹🇼' }
];

/**
 * RTL语言列表
 * RTL (Right-to-Left) languages
 */
export const RTL_LOCALES: Locale[] = ['ar'];

/**
 * 检查是否为RTL语言
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * 验证语言代码是否有效
 * Validate if locale code is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * 获取语言显示名称
 * Get locale display label
 */
export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS.find(l => l.locale === locale)?.label || locale;
}
