/**
 * WizPulseAI 统一主题初始化脚本
 *
 * 在 HTML <head> 中同步执行，防止页面加载时的主题闪烁
 *
 * 支持的主题编号（新编码方案 v2.0）：
 *   1-9   = 亮色系 (Light Mode)
 *   11-19 = 暗色系 (Dark Mode)
 *
 *   当前定义：
 *   1  = Indigo Light（靛蓝亮色）- 男性/商务
 *   2  = Rose Light（玫瑰亮色）- 女性/时尚
 *   11 = Indigo Dark（靛蓝暗色）- 男性/商务
 *   12 = Rose Dark（玫瑰暗色）- 女性/时尚
 *
 * 向后兼容：
 *   - 旧编码 3/4 自动转换为 11/12
 *   - 字符串 light/dark/system 自动转换为数字编码
 *
 * 使用方法：
 * 在 layout.tsx 的 <head> 中添加：
 * <ThemeScript />
 * 或带 nonce：
 * <ThemeScript nonce={nonce} />
 */
export function ThemeScript({ nonce }: { nonce?: string } = {}) {
  const script = `
    (function() {
      try {
        // 1. 读取 Cookie: WIZPULSE_THEME（默认值 1）
        var themeId = 1; // 默认 Indigo Light
        var themeCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('WIZPULSE_THEME='));

        if (themeCookie) {
          var value = themeCookie.split('=')[1];

          // 尝试解析为数字
          var numValue = parseInt(value, 10);

          if (!isNaN(numValue)) {
            // 数字格式：新编码（1,2,11,12）或旧编码（3,4）
            if (numValue === 3) {
              themeId = 11; // 旧 Indigo Dark → 新编码
            } else if (numValue === 4) {
              themeId = 12; // 旧 Rose Dark → 新编码
            } else if ([1, 2, 11, 12].includes(numValue)) {
              themeId = numValue; // 新编码，直接使用
            }
          } else {
            // 字符串格式（向后兼容）
            if (value === 'dark') {
              themeId = 11; // Indigo Dark
            } else if (value === 'light') {
              themeId = 1; // Indigo Light
            } else if (value === 'system') {
              // 根据系统偏好选择主题
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              themeId = prefersDark ? 11 : 1;
            }
          }
        }

        // 2. 解析主题 ID
        // 1-9 = Light, 11-19 = Dark
        var isDark = themeId >= 11;
        var colorScheme = isDark ? themeId - 10 : themeId;

        // 3. 设置 data-theme 属性（完整 ID）
        document.documentElement.setAttribute('data-theme', String(themeId));

        // 4. 设置 data-color 属性（颜色方案 1-9）
        document.documentElement.setAttribute('data-color', String(colorScheme));

        // 5. 设置 dark/light class（兼容现有组件）
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(isDark ? 'dark' : 'light');

      } catch (e) {
        // 失败时使用默认主题（Indigo Light）
        document.documentElement.setAttribute('data-theme', '1');
        document.documentElement.setAttribute('data-color', '1');
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
