'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { getCookie } from 'cookies-next';

// Cookie 名称 - 与 Dashboard 站点保持一致
export const THEME_COOKIE_NAME = 'WIZPULSE_THEME';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

/**
 * 主题应用 Provider
 *
 * 用于 Auth 和 Main 站点，从 Cookie 读取 Dashboard 设置的主题并应用
 *
 * 使用方法：
 * 在 layout.tsx 中包裹应用：
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // 应用主题到 DOM
  const applyTheme = (themeValue: Theme) => {
    const root = document.documentElement;
    let resolved: 'light' | 'dark';

    if (themeValue === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = systemPrefersDark ? 'dark' : 'light';
    } else {
      resolved = themeValue;
    }

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    setResolvedTheme(resolved);
  };

  // 初始化主题
  useEffect(() => {
    setMounted(true);

    // 从 Cookie 读取主题设置
    const savedTheme = getCookie(THEME_COOKIE_NAME) as Theme | undefined;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // 默认使用 light 主题
      setTheme('light');
      applyTheme('light');
    }
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 防止 SSR 时的闪烁
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light' }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 主题初始化脚本
 *
 * 在 HTML head 中注入，防止页面加载时的主题闪烁
 *
 * 使用方法：
 * 在 layout.tsx 的 <head> 中添加：
 * <ThemeScript />
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = document.cookie
          .split('; ')
          .find(row => row.startsWith('WIZPULSE_THEME='))
          ?.split('=')[1] || 'light';

        var resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.classList.add(resolved);
      } catch (e) {
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
