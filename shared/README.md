# Shared Modules - 共享模块

WizPulseAI 三站点共享的代码模块。

## 📁 目录结构

```
shared/
├── i18n/                      # 国际化模块
│   ├── index.ts              # 统一导出
│   ├── types.ts              # TypeScript类型定义
│   ├── config.ts             # 4语言统一配置
│   ├── cookie-utils.ts       # Cookie工具函数
│   └── SimpleI18nProvider.tsx # 轻量级i18n Provider
└── components/                # 共享组件
    └── LanguageSwitcher.tsx  # 语言切换组件
```

## 🌍 i18n模块

### 特性

- ✅ **轻量级**：无框架依赖，核心代码不超过200行
- ✅ **跨站点同步**：通过Cookie实现语言偏好共享
- ✅ **4语言支持**：日语/英语/阿拉伯语/繁体中文
- ✅ **RTL支持**：阿拉伯语自动右对齐布局
- ✅ **TypeScript**：完整类型支持

### 使用方式

#### 1. 在根布局中使用

```tsx
// app/layout.tsx
import { SimpleI18nProvider } from '@/shared/i18n';
import messages from './messages'; // 翻译文件

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleI18nProvider messages={messages}>
          {children}
        </SimpleI18nProvider>
      </body>
    </html>
  );
}
```

#### 2. 在组件中使用翻译

```tsx
import { useTranslation } from '@/shared/i18n';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t.welcome}</h1>
      <p>当前语言: {locale}</p>
      <button onClick={() => setLocale('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

#### 3. 翻译文件结构

```typescript
// messages/index.ts
import ja from './ja.json';
import en from './en.json';
import ar from './ar.json';
import zhTW from './zh-TW.json';

export default {
  ja,
  en,
  ar,
  'zh-TW': zhTW
};
```

```json
// messages/ja.json
{
  "welcome": "ようこそ",
  "auth": {
    "login": "ログイン",
    "signup": "サインアップ"
  }
}
```

## 🎨 LanguageSwitcher组件

### 两种样式

#### Dropdown样式（Header使用）

```tsx
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';

<Header>
  <LanguageSwitcher variant="dropdown" showFlag={true} />
</Header>
```

#### Inline样式（登录页使用）

```tsx
<LanguageSwitcher variant="inline" showFlag={true} />
```

## 🔧 配置说明

### Cookie配置

```typescript
// shared/i18n/config.ts

// Cookie名称
export const COOKIE_NAME = 'NEXT_LOCALE';

// Cookie域名（环境感知）
export const COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? '.wizpulseai.com'  // 生产环境：3个子域名共享
    : '.localhost';       // 本地开发

// Cookie过期时间（365天）
export const COOKIE_EXPIRES = 365;
```

### 支持的语言

```typescript
export const LOCALES = ['ja', 'en', 'ar', 'zh-TW'] as const;
export const DEFAULT_LOCALE = 'ja';
```

## 🌐 跨站点同步流程

```
用户在Main站点选择日语
    ↓
写入Cookie: NEXT_LOCALE=ja (domain=.wizpulseai.com)
    ↓
用户点击登录，跳转到Auth站点
    ↓
Auth读取Cookie，自动显示日语界面
    ↓
登录成功，跳转到Dashboard
    ↓
Dashboard读取Cookie，显示日语界面
```

## 📦 站点集成状态

| 站点 | 集成状态 | 说明 |
|------|---------|------|
| Main (wizPulseAI-com) | 🟡 部分 | 使用next-intl，Cookie配置需统一 |
| Auth (auth-wizpulseai-com) | 🟢 完成 | 使用SimpleI18nProvider |
| Dashboard (db-wizPulseAI-com) | 🟢 完成 | 使用SimpleI18nProvider |

## 🔍 调试技巧

### 检查Cookie是否正确设置

```javascript
// 浏览器控制台
document.cookie.split(';').find(c => c.includes('NEXT_LOCALE'))
// 应该返回: " NEXT_LOCALE=ja" 或其他语言代码
```

### 检查Cookie域名

```javascript
// Chrome DevTools -> Application -> Cookies
// 查看 Domain 列，应该是 .wizpulseai.com 或 .localhost
```

## 🚀 添加新语言

1. 更新配置：
```typescript
// shared/i18n/config.ts
export const LOCALES = ['ja', 'en', 'ar', 'zh-TW', 'ko'] as const; // 添加ko
export const LOCALE_LABELS = [
  // ...
  { locale: 'ko', label: '한국어', flag: '🇰🇷' }
];
```

2. 添加翻译文件：
```bash
# 每个站点的messages目录
auth-wizpulseai-com/src/messages/ko.json
db-wizPulseAI-com/src/messages/ko.json
```

3. 完成！无需修改组件代码。

## 📝 许可证

MIT License - WizPulseAI Project
