'use client';

import { useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

// Cookie 名称
export const THEME_COOKIE_NAME = 'WIZPULSE_THEME';

// 主题定义
export type ColorScheme = 'indigo' | 'rose';
export type Brightness = 'light' | 'dark';

interface ThemeConfig {
  color: ColorScheme;
  brightness: Brightness;
}

// 主题 ID 映射
const THEME_MAP: Record<string, ThemeConfig> = {
  '1': { color: 'indigo', brightness: 'light' },
  '2': { color: 'rose', brightness: 'light' },
  '3': { color: 'indigo', brightness: 'dark' },
  '4': { color: 'rose', brightness: 'dark' },
};

const REVERSE_THEME_MAP: Record<string, string> = {
  'indigo-light': '1',
  'rose-light': '2',
  'indigo-dark': '3',
  'rose-dark': '4',
};

// 获取跨域 Cookie 配置
function getCookieOptions() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  return {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    domain: isLocalhost ? '.localhost' : '.wizpulseai.com',
    sameSite: 'lax' as const,
    secure: !isLocalhost,
  };
}

// 解析主题 ID
function parseThemeId(themeId: string): ThemeConfig {
  return THEME_MAP[themeId] || { color: 'indigo', brightness: 'light' };
}

// 生成主题 ID
function generateThemeId(config: ThemeConfig): string {
  const key = `${config.color}-${config.brightness}`;
  return REVERSE_THEME_MAP[key] || '1';
}

// 应用主题到 DOM
function applyTheme(themeId: string) {
  const root = document.documentElement;
  const config = parseThemeId(themeId);

  // 设置 data-theme 属性
  root.setAttribute('data-theme', themeId);

  // 设置 class（兼容现有组件）
  root.classList.remove('light', 'dark');
  root.classList.add(config.brightness);
}

interface ColorThemeSwitcherProps {
  labels?: {
    colorTitle?: string;
    indigoPro?: string;
    roseElegance?: string;
    brightnessTitle?: string;
    light?: string;
    dark?: string;
    syncNote?: string;
  };
}

/**
 * 颜色主题切换器
 *
 * 支持独立选择：
 * - 颜色方案：Indigo（靛蓝）/ Rose（玫瑰）
 * - 明暗度：Light（亮色）/ Dark（暗色）
 *
 * 两者组合生成主题 ID（1-4）并设置到 Cookie
 */
export function ColorThemeSwitcher({ labels }: ColorThemeSwitcherProps = {}) {
  const [config, setConfig] = useState<ThemeConfig>({ color: 'indigo', brightness: 'light' });
  const [mounted, setMounted] = useState(false);

  // 初始化主题
  useEffect(() => {
    setMounted(true);

    const savedThemeId = getCookie(THEME_COOKIE_NAME) as string | undefined;
    const themeId = savedThemeId && ['1', '2', '3', '4'].includes(savedThemeId) ? savedThemeId : '1';

    const parsedConfig = parseThemeId(themeId);
    setConfig(parsedConfig);
    applyTheme(themeId);
  }, []);

  // 切换颜色方案
  const handleColorChange = (color: ColorScheme) => {
    const newConfig = { ...config, color };
    const themeId = generateThemeId(newConfig);

    setConfig(newConfig);
    setCookie(THEME_COOKIE_NAME, themeId, getCookieOptions());
    applyTheme(themeId);
  };

  // 切换明暗度
  const handleBrightnessChange = (brightness: Brightness) => {
    const newConfig = { ...config, brightness };
    const themeId = generateThemeId(newConfig);

    setConfig(newConfig);
    setCookie(THEME_COOKIE_NAME, themeId, getCookieOptions());
    applyTheme(themeId);
  };

  if (!mounted) {
    return <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* 颜色方案选择 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-primary">
          {labels?.colorTitle || 'カラーテーマ'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleColorChange('indigo')}
            className={`
              flex flex-col items-start p-4 rounded-lg border-2 transition-all
              ${config.color === 'indigo'
                ? 'border-brand-primary bg-brand-primary-subtle shadow-brand'
                : 'border-border bg-bg-subtle hover:border-brand-primary/50'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#3F51B5]" />
              <span className="font-medium text-sm">
                {labels?.indigoPro || '🔵 Indigo Pro'}
              </span>
            </div>
            <span className="text-xs text-muted">男性 / 商務</span>
          </button>

          <button
            onClick={() => handleColorChange('rose')}
            className={`
              flex flex-col items-start p-4 rounded-lg border-2 transition-all
              ${config.color === 'rose'
                ? 'border-brand-primary bg-brand-primary-subtle shadow-brand'
                : 'border-border bg-bg-subtle hover:border-brand-primary/50'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#bb2649]" />
              <span className="font-medium text-sm">
                {labels?.roseElegance || '🌹 Rose Elegance'}
              </span>
            </div>
            <span className="text-xs text-muted">女性 / 時尚</span>
          </button>
        </div>
      </div>

      {/* 明暗度选择 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-primary">
          {labels?.brightnessTitle || '明るさ'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleBrightnessChange('light')}
            className={`
              flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
              ${config.brightness === 'light'
                ? 'border-brand-primary bg-brand-primary-subtle shadow-brand'
                : 'border-border bg-bg-subtle hover:border-brand-primary/50'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-medium text-sm">
              {labels?.light || 'Light'}
            </span>
          </button>

          <button
            onClick={() => handleBrightnessChange('dark')}
            className={`
              flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
              ${config.brightness === 'dark'
                ? 'border-brand-primary bg-brand-primary-subtle shadow-brand'
                : 'border-border bg-bg-subtle hover:border-brand-primary/50'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-medium text-sm">
              {labels?.dark || 'Dark'}
            </span>
          </button>
        </div>
      </div>

      {/* 跨站点同步提示 */}
      <p className="text-xs text-muted text-center pt-2 border-t border-border">
        {labels?.syncNote || '※ テーマ設定は全サイト（Auth・Dashboard・Main）で共有されます'}
      </p>
    </div>
  );
}
