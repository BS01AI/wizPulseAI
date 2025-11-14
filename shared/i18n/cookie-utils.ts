/**
 * Cookie工具函数
 * Cookie Utility Functions
 *
 * 用于跨站点语言偏好同步
 * For cross-site language preference synchronization
 */

import type { Locale } from './types';
import {
  COOKIE_NAME,
  COOKIE_DOMAIN,
  COOKIE_EXPIRES,
  DEFAULT_LOCALE,
  isValidLocale
} from './config';

/**
 * 获取语言偏好Cookie
 * Get language preference from cookie
 *
 * @returns 语言代码或null
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${COOKIE_NAME}=`)
  );

  if (!localeCookie) return null;

  const locale = localeCookie.split('=')[1];
  return isValidLocale(locale) ? locale : null;
}

/**
 * 设置语言偏好Cookie
 * Set language preference cookie
 *
 * @param locale - 语言代码
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRES);

  document.cookie = [
    `${COOKIE_NAME}=${locale}`,
    `domain=${COOKIE_DOMAIN}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : ''
  ]
    .filter(Boolean)
    .join('; ');

  console.log(`[i18n] Cookie设置成功: ${COOKIE_NAME}=${locale}, domain=${COOKIE_DOMAIN}`);
}

/**
 * 删除语言偏好Cookie
 * Remove language preference cookie
 */
export function removeLocaleCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = [
    `${COOKIE_NAME}=`,
    `domain=${COOKIE_DOMAIN}`,
    'expires=Thu, 01 Jan 1970 00:00:00 UTC',
    'path=/'
  ].join('; ');

  console.log(`[i18n] Cookie已删除: ${COOKIE_NAME}`);
}

/**
 * 获取初始语言（优先级：Cookie > 默认语言）
 * Get initial locale (priority: Cookie > Default locale)
 *
 * @returns 语言代码
 */
export function getInitialLocale(): Locale {
  const cookieLocale = getLocaleCookie();
  if (cookieLocale) {
    console.log(`[i18n] 从Cookie读取语言: ${cookieLocale}`);
    return cookieLocale;
  }

  console.log(`[i18n] 使用默认语言: ${DEFAULT_LOCALE}`);
  return DEFAULT_LOCALE;
}
