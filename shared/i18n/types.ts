/**
 * 共享i18n类型定义
 * Shared i18n Type Definitions
 */

/**
 * 支持的语言代码
 * Supported locale codes
 */
export type Locale = 'ja' | 'en' | 'ar' | 'zh-TW';

/**
 * 语言显示名称映射
 * Language display name mapping
 */
export interface LocaleLabel {
  locale: Locale;
  label: string;
  flag: string;
}

/**
 * 翻译消息对象类型
 * Translation messages object type
 */
export type Messages = Record<string, any>;

/**
 * i18n上下文类型
 * i18n context type
 */
export interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: Messages; // 简化的翻译访问
}

/**
 * i18n Provider属性类型
 * i18n Provider props type
 */
export interface I18nProviderProps {
  children: React.ReactNode;
  messages: Record<Locale, Messages>;
  defaultLocale?: Locale;
}
