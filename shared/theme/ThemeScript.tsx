/**
 * WizPulseAI 统一主题初始化脚本
 *
 * 在 HTML <head> 中同步执行，防止页面加载时的主题闪烁
 *
 * 支持的主题编号：
 *   1 = Indigo Light（靛蓝亮色）- 男性/商务
 *   2 = Rose Light（玫瑰亮色）- 女性/时尚
 *   3 = Indigo Dark（靛蓝暗色）- 男性/商务
 *   4 = Rose Dark（玫瑰暗色）- 女性/时尚
 *
 * 使用方法：
 * 在 layout.tsx 的 <head> 中添加：
 * <ThemeScript />
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        // 1. 读取 Cookie: WIZPULSE_THEME（默认值 1）
        var themeId = '1'; // 默认 Indigo Light
        var themeCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('WIZPULSE_THEME='));

        if (themeCookie) {
          var value = themeCookie.split('=')[1];
          // 验证是否是有效的主题编号（1-4）
          if (['1', '2', '3', '4'].includes(value)) {
            themeId = value;
          }
        }

        // 2. 设置 data-theme 属性
        document.documentElement.setAttribute('data-theme', themeId);

        // 3. 同时设置 dark/light class（兼容现有组件）
        var isDark = themeId === '3' || themeId === '4';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(isDark ? 'dark' : 'light');

      } catch (e) {
        // 失败时使用默认主题（Indigo Light）
        document.documentElement.setAttribute('data-theme', '1');
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
