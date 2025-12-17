'use client';

/**
 * ColorThemeSwitcher - 主题切换器组件
 *
 * 主版本：此文件是主版本
 * 复制版本：db-wizPulseAI-com/src/shared/theme/ColorThemeSwitcher.tsx
 *
 * 同步说明：
 * 修改此文件后，需同步到 Dashboard 站点的复制版本
 * 原因：Vercel 独立部署，无法访问父目录 shared/
 */

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

// 主题 ID 映射（新编码方案 v2.0）
// 1-9 = Light, 11-19 = Dark
const THEME_MAP: Record<string, ThemeConfig> = {
  '1': { color: 'indigo', brightness: 'light' },
  '2': { color: 'rose', brightness: 'light' },
  '11': { color: 'indigo', brightness: 'dark' },
  '12': { color: 'rose', brightness: 'dark' },
  // 向后兼容旧编码
  '3': { color: 'indigo', brightness: 'dark' },
  '4': { color: 'rose', brightness: 'dark' },
};

const REVERSE_THEME_MAP: Record<string, string> = {
  'indigo-light': '1',
  'rose-light': '2',
  'indigo-dark': '11',
  'rose-dark': '12',
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

  // 解析主题 ID（新编码方案）
  const numId = parseInt(themeId, 10);
  const isDark = numId >= 11;
  const colorScheme = isDark ? numId - 10 : numId;

  // 设置 data-theme 属性（完整 ID）
  root.setAttribute('data-theme', themeId);

  // 设置 data-color 属性（颜色方案 1-9）
  root.setAttribute('data-color', String(colorScheme));

  // 设置 class（兼容现有组件）
  root.classList.remove('light', 'dark');
  root.classList.add(config.brightness);
}

interface ColorThemeSwitcherProps {
  labels?: {
    colorTitle?: string;
    indigoPro?: string;
    indigoDesc?: string;
    roseElegance?: string;
    roseDesc?: string;
    brightnessTitle?: string;
    light?: string;
    lightDesc?: string;
    dark?: string;
    darkDesc?: string;
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
    let themeId = '1'; // 默认 Indigo Light

    if (savedThemeId) {
      const numValue = parseInt(savedThemeId, 10);
      if (!isNaN(numValue)) {
        // 新编码（1,2,11,12）或旧编码（3,4）
        if ([1, 2, 11, 12].includes(numValue)) {
          themeId = String(numValue);
        } else if (numValue === 3) {
          themeId = '11'; // 旧编码转换
        } else if (numValue === 4) {
          themeId = '12'; // 旧编码转换
        }
      }
    }

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
    <div className="space-y-8">
      {/* 颜色方案选择 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h3 className="text-base font-semibold text-foreground">
            {labels?.colorTitle || 'カラーテーマ'}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Indigo Pro */}
          <button
            onClick={() => handleColorChange('indigo')}
            className={`
              group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-500 ease-out
              ${config.color === 'indigo'
                ? 'border-[#3F51B5] bg-gradient-to-br from-[#3F51B5]/15 to-[#5C6BC0]/10 shadow-xl shadow-[#3F51B5]/25 scale-[1.03]'
                : 'border-border/50 bg-card hover:border-[#3F51B5]/60 hover:bg-gradient-to-br hover:from-[#3F51B5]/5 hover:to-[#5C6BC0]/5 hover:shadow-lg hover:shadow-[#3F51B5]/10 hover:scale-[1.01]'
              }
            `}
          >
            {/* 颜色预览条 */}
            <div className="w-full h-2 rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  config.color === 'indigo' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={{ background: 'linear-gradient(90deg, #3F51B5, #5C6BC0, #7986CB)' }}
              />
            </div>

            {/* 图标 */}
            <div className={`
              w-14 h-14 rounded-2xl mb-3 flex items-center justify-center transition-all duration-500
              ${config.color === 'indigo' ? 'scale-105 shadow-lg' : 'group-hover:scale-105'}
            `}
              style={{ background: 'linear-gradient(135deg, #3F51B5, #5C6BC0)' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <span className="font-semibold text-base text-foreground mb-1">
              {labels?.indigoPro || 'Indigo Pro'}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {labels?.indigoDesc || '知的でプロフェッショナル'}
            </span>

            {/* 选中指示器 */}
            {config.color === 'indigo' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3F51B5] flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Rose Elegance */}
          <button
            onClick={() => handleColorChange('rose')}
            className={`
              group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-500 ease-out
              ${config.color === 'rose'
                ? 'border-[#bb2649] bg-gradient-to-br from-[#bb2649]/15 to-[#e91e63]/10 shadow-xl shadow-[#bb2649]/25 scale-[1.03]'
                : 'border-border/50 bg-card hover:border-[#bb2649]/60 hover:bg-gradient-to-br hover:from-[#bb2649]/5 hover:to-[#e91e63]/5 hover:shadow-lg hover:shadow-[#bb2649]/10 hover:scale-[1.01]'
              }
            `}
          >
            {/* 颜色预览条 */}
            <div className="w-full h-2 rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  config.color === 'rose' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={{ background: 'linear-gradient(90deg, #bb2649, #e91e63, #f06292)' }}
              />
            </div>

            {/* 图标 */}
            <div className={`
              w-14 h-14 rounded-2xl mb-3 flex items-center justify-center transition-all duration-500
              ${config.color === 'rose' ? 'scale-105 shadow-lg' : 'group-hover:scale-105'}
            `}
              style={{ background: 'linear-gradient(135deg, #bb2649, #e91e63)' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <span className="font-semibold text-base text-foreground mb-1">
              {labels?.roseElegance || 'Rose Elegance'}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {labels?.roseDesc || '華やかでエレガント'}
            </span>

            {/* 选中指示器 */}
            {config.color === 'rose' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#bb2649] flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 明暗度选择 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.brightness === 'light' ? '☀️' : '🌙'}</span>
          <h3 className="text-base font-semibold text-foreground">
            {labels?.brightnessTitle || '明るさ'}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Light Mode */}
          <button
            onClick={() => handleBrightnessChange('light')}
            className={`
              group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-500 ease-out
              ${config.brightness === 'light'
                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/10 shadow-xl shadow-amber-500/25 scale-[1.03]'
                : 'border-border/50 bg-card hover:border-amber-500/60 hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-500/10 dark:hover:to-orange-500/5 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.01]'
              }
            `}
          >
            {/* 亮度预览条 */}
            <div className="w-full h-2 rounded-full mb-4 overflow-hidden bg-muted/20">
              <div
                className={`h-full transition-all duration-500 ${
                  config.brightness === 'light' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fb923c)' }}
              />
            </div>

            {/* 图标 */}
            <div className={`
              w-14 h-14 rounded-2xl mb-3 flex items-center justify-center transition-all duration-500
              ${config.brightness === 'light'
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 scale-105 shadow-lg shadow-amber-500/30'
                : 'bg-muted/50 group-hover:bg-gradient-to-br group-hover:from-amber-400/70 group-hover:to-orange-500/70 group-hover:scale-105'
              }
            `}>
              <svg className={`w-7 h-7 transition-colors duration-500 ${config.brightness === 'light' ? 'text-white' : 'text-amber-500/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <span className="font-semibold text-base text-foreground mb-1">
              {labels?.light || 'Light'}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {labels?.lightDesc || '明るく温かみのあるデザイン'}
            </span>

            {/* 选中指示器 */}
            {config.brightness === 'light' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => handleBrightnessChange('dark')}
            className={`
              group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-500 ease-out
              ${config.brightness === 'dark'
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 shadow-xl shadow-indigo-500/25 scale-[1.03]'
                : 'border-border/50 bg-card hover:border-indigo-500/60 hover:bg-gradient-to-br hover:from-indigo-950/30 hover:to-purple-950/20 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.01]'
              }
            `}
          >
            {/* 亮度预览条 */}
            <div className="w-full h-2 rounded-full mb-4 overflow-hidden bg-muted/20">
              <div
                className={`h-full transition-all duration-500 ${
                  config.brightness === 'dark' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={{ background: 'linear-gradient(90deg, #4f46e5, #6366f1, #8b5cf6)' }}
              />
            </div>

            {/* 图标 */}
            <div className={`
              w-14 h-14 rounded-2xl mb-3 flex items-center justify-center transition-all duration-500
              ${config.brightness === 'dark'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 scale-105 shadow-lg shadow-indigo-500/30'
                : 'bg-muted/50 group-hover:bg-gradient-to-br group-hover:from-indigo-600/70 group-hover:to-purple-700/70 group-hover:scale-105'
              }
            `}>
              <svg className={`w-7 h-7 transition-colors duration-500 ${config.brightness === 'dark' ? 'text-white' : 'text-indigo-500/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <span className="font-semibold text-base text-foreground mb-1">
              {labels?.dark || 'Dark'}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {labels?.darkDesc || '目に優しいダークモード'}
            </span>

            {/* 选中指示器 */}
            {config.brightness === 'dark' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 跨站点同步提示 */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
        <svg className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {labels?.syncNote || '※ テーマ設定は Main・Dashboard・Auth で共有されます。マジコーデは独自のテーマを使用します。'}
        </p>
      </div>
    </div>
  );
}
