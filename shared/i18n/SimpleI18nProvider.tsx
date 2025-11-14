/**
 * SimpleI18nProvider - 轻量级i18n解决方案
 * Simple I18n Provider - Lightweight i18n solution
 *
 * 特点 Features:
 * - 无需框架依赖 No framework dependency
 * - Cookie跨站点同步 Cross-site sync via cookie
 * - 客户端切换语言 Client-side language switching
 * - 适用于Auth/Dashboard Application for Auth/Dashboard
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { I18nContextValue, I18nProviderProps, Locale, Messages } from './types';
import { DEFAULT_LOCALE } from './config';
import { getInitialLocale, setLocaleCookie } from './cookie-utils';

/**
 * i18n上下文
 * i18n Context
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * SimpleI18nProvider组件
 * Simple i18n Provider Component
 *
 * @example
 * ```tsx
 * import { SimpleI18nProvider } from '@/shared/i18n/SimpleI18nProvider';
 * import messages from './messages';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <SimpleI18nProvider messages={messages}>
 *       {children}
 *     </SimpleI18nProvider>
 *   );
 * }
 * ```
 */
export function SimpleI18nProvider({
  children,
  messages,
  defaultLocale = DEFAULT_LOCALE
}: I18nProviderProps) {
  // 状态管理
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [currentMessages, setCurrentMessages] = useState<Messages>(messages[defaultLocale] || {});
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初始化：从Cookie读取语言偏好
   * Initialize: Read language preference from cookie
   */
  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    setCurrentMessages(messages[initialLocale] || messages[defaultLocale] || {});
    setIsInitialized(true);
  }, [messages, defaultLocale]);

  /**
   * 切换语言
   * Switch language
   */
  const setLocale = useCallback((newLocale: Locale) => {
    console.log(`[i18n] 切换语言: ${locale} -> ${newLocale}`);

    // 更新状态
    setLocaleState(newLocale);
    setCurrentMessages(messages[newLocale] || messages[defaultLocale] || {});

    // 写入Cookie（跨站点共享）
    setLocaleCookie(newLocale);

    // 刷新页面以确保所有组件更新
    // Reload page to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [locale, messages, defaultLocale]);

  /**
   * 上下文值
   * Context value
   */
  const value: I18nContextValue = {
    locale,
    messages: currentMessages,
    setLocale,
    t: currentMessages // 简化访问
  };

  // 等待初始化完成，避免闪烁
  // Wait for initialization to avoid flicker
  if (!isInitialized) {
    return null; // 或者返回Loading组件
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useI18n Hook - 获取i18n上下文
 * useI18n Hook - Get i18n context
 *
 * @throws 如果在Provider外部使用
 * @returns i18n上下文值
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n();
 *   return <h1>{t.welcome}</h1>;
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within SimpleI18nProvider');
  }
  return context;
}

/**
 * useTranslation Hook - 简化翻译访问（兼容命名）
 * useTranslation Hook - Simplified translation access (compatible naming)
 */
export function useTranslation() {
  return useI18n();
}
