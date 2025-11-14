/**
 * 共享i18n模块统一导出
 * Shared i18n Module Exports
 *
 * 使用方式 Usage:
 * ```tsx
 * import { SimpleI18nProvider, useTranslation, LOCALES } from '@/shared/i18n';
 * ```
 */

// Provider和Hooks
export { SimpleI18nProvider, useI18n, useTranslation } from './SimpleI18nProvider';

// 配置和常量
export {
  LOCALES,
  DEFAULT_LOCALE,
  COOKIE_NAME,
  COOKIE_DOMAIN,
  COOKIE_EXPIRES,
  LOCALE_LABELS,
  RTL_LOCALES,
  isRTL,
  isValidLocale,
  getLocaleLabel
} from './config';

// Cookie工具
export {
  getLocaleCookie,
  setLocaleCookie,
  removeLocaleCookie,
  getInitialLocale
} from './cookie-utils';

// 类型定义
export type {
  Locale,
  LocaleLabel,
  Messages,
  I18nContextValue,
  I18nProviderProps
} from './types';
