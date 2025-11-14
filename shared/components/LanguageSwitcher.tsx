/**
 * LanguageSwitcher - 统一语言切换组件
 * Unified Language Switcher Component
 *
 * 3个站点共享此组件：
 * - Main (用于Header)
 * - Auth (用于登录页)
 * - Dashboard (用于Header)
 */

'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';
import { LOCALE_LABELS, isRTL } from '../i18n/config';
import type { Locale } from '../i18n/types';

interface LanguageSwitcherProps {
  /** 显示样式：dropdown下拉菜单 | inline内联按钮 */
  variant?: 'dropdown' | 'inline';
  /** 按钮样式类名 */
  className?: string;
  /** 是否显示国旗emoji */
  showFlag?: boolean;
}

/**
 * LanguageSwitcher组件
 *
 * @example
 * ```tsx
 * // 下拉菜单样式（Header）
 * <LanguageSwitcher variant="dropdown" />
 *
 * // 内联按钮样式（登录页）
 * <LanguageSwitcher variant="inline" showFlag={true} />
 * ```
 */
export function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
  showFlag = true
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
    setIsOpen(false);
  };

  // 当前语言配置
  const currentLocaleConfig = LOCALE_LABELS.find(l => l.locale === locale);

  if (variant === 'inline') {
    // 内联按钮样式（Auth登录页）
    return (
      <div className={`flex gap-2 ${className}`}>
        {LOCALE_LABELS.map(({ locale: loc, label, flag }) => {
          const isActive = loc === locale;
          const isRTLLang = isRTL(loc);

          return (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isRTLLang ? 'font-arabic' : ''}
              `}
              dir={isRTLLang ? 'rtl' : 'ltr'}
            >
              {showFlag && <span className="mr-1">{flag}</span>}
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // 下拉菜单样式（Header）
  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="切换语言"
      >
        {showFlag && currentLocaleConfig && (
          <span className="text-lg">{currentLocaleConfig.flag}</span>
        )}
        <span className="text-sm font-medium">
          {currentLocaleConfig?.label || locale}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {LOCALE_LABELS.map(({ locale: loc, label, flag }) => {
              const isActive = loc === locale;
              const isRTLLang = isRTL(loc);

              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`
                    w-full px-4 py-2 text-left flex items-center gap-2 transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${isRTLLang ? 'font-arabic' : ''}
                  `}
                  dir={isRTLLang ? 'rtl' : 'ltr'}
                >
                  {showFlag && <span className="text-lg">{flag}</span>}
                  <span>{label}</span>
                  {isActive && (
                    <svg
                      className="ml-auto w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
