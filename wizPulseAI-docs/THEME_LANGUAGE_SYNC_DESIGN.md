# 主题与语言跨站点同步设计方案

> 版本: v1.0
> 日期: 2025-12-17
> 状态: 待实施

---

## 1. 背景

WizPulseAI 有 4 个独立部署的站点，需要统一管理用户的主题和语言偏好设置。

| 站点 | 域名 | 定位 |
|------|------|------|
| Main | www.wizpulseai.com | 营销/品牌 |
| Dashboard | dashboard.wizpulseai.com | 用户中心 |
| Auth | auth.wizpulseai.com | 认证服务 |
| Fashion | magicoord.wizpulseai.com | 产品站点 |

---

## 2. 设计原则

### 2.1 语言设置
- **跨站点共享**: 所有站点
- **Cookie 名称**: `NEXT_LOCALE`
- **可选值**: `ja` | `en` | `ar` | `zh-TW`
- **设置入口**: 任何站点的 Header/Footer

### 2.2 主题设置
- **共享范围**: Main / Dashboard / Auth
- **独立站点**: Fashion（自己管理主题）
- **Cookie 名称**: `WIZPULSE_THEME`
- **设置入口**: Dashboard → 設定 → 外観設定

---

## 3. 主题编码方案

### 3.1 数字编码规则

```
1-9   = 亮色系 (Light Mode)
11-19 = 暗色系 (Dark Mode)

当前定义：
1  = Indigo Light  (靛蓝亮色 - 商务/男性)
2  = Rose Light    (玫瑰亮色 - 时尚/女性)
11 = Indigo Dark   (靛蓝暗色)
12 = Rose Dark     (玫瑰暗色)

保留扩展：
3-9   = 未来亮色主题
13-19 = 未来暗色主题
```

### 3.2 各站点解读规则

```javascript
// 解读逻辑
const themeId = parseInt(cookieValue) || 1;
const isDark = themeId >= 11;
const colorScheme = isDark ? themeId - 10 : themeId;

// 应用
document.documentElement.classList.add(isDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-color', colorScheme);
```

### 3.3 站点适配

| 站点 | 读取 Cookie | 解读方式 |
|------|------------|----------|
| Main | ✅ 读取 | 亮暗模式 + 颜色方案 |
| Dashboard | ✅ 读取 | 亮暗模式 + 颜色方案 |
| Auth | ✅ 读取 | 亮暗模式 + 颜色方案 |
| Fashion | ❌ 不读取 | 独立主题系统 |

---

## 4. Cookie 配置

### 4.1 主题 Cookie

```typescript
// Cookie 设置
{
  name: 'WIZPULSE_THEME',
  value: '1' | '2' | '11' | '12',  // 数字编码
  domain: '.wizpulseai.com',       // 跨子域共享
  path: '/',
  maxAge: 60 * 60 * 24 * 365,      // 1年
  sameSite: 'lax',
  secure: true                      // 生产环境
}
```

### 4.2 语言 Cookie

```typescript
// Cookie 设置
{
  name: 'NEXT_LOCALE',
  value: 'ja' | 'en' | 'ar' | 'zh-TW',
  domain: '.wizpulseai.com',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  secure: true
}
```

---

## 5. UI 设计

### 5.1 Dashboard 设定页面

```
設定
├── 個人資料
│   ├── 名前
│   └── メールアドレス
├── セキュリティ
│   └── パスワード変更
├── 外観設定 ← 主题设置
│   ├── カラーテーマ
│   │   ├── 🔵 Indigo Pro（商務）
│   │   └── 🌹 Rose Elegance（時尚）
│   └── 明るさ
│       ├── ☀️ Light
│       └── 🌙 Dark
└── 言語設定 ← 新增
    ├── 🇯🇵 日本語
    ├── 🇺🇸 English
    ├── 🇸🇦 العربية
    └── 🇹🇼 繁體中文
```

### 5.2 提示文案

```
外観設定:
「テーマ設定は Main・Dashboard・Auth で共有されます。
 マジコーデは独自のテーマを使用します。」

言語設定:
「言語設定は全サイトで共有されます。」
```

---

## 6. 实施任务

### Phase 1: 主题系统重构

| ID | 任务 | 站点 | 工时 |
|----|------|------|------|
| T1 | ThemeScript 支持新编码 (1/2/11/12) | Dashboard | 15min |
| T2 | ThemeScript 同步更新 | Main | 10min |
| T3 | ThemeScript 同步更新 | Auth | 10min |
| T4 | ColorThemeSwitcher 输出数字编码 | Dashboard | 15min |
| T5 | themes.css 支持新编码 | 全站点 | 20min |

### Phase 2: 语言设置

| ID | 任务 | 站点 | 工时 |
|----|------|------|------|
| T6 | 设定页添加语言切换区块 | Dashboard | 20min |
| T7 | 验证跨站点语言同步 | 全站点 | 10min |

### Phase 3: Fashion 独立化

| ID | 任务 | 站点 | 工时 |
|----|------|------|------|
| T8 | 确认不读取 WIZPULSE_THEME | Fashion | 5min |
| T9 | 独立主题系统（如需要） | Fashion | 待定 |

---

## 7. 测试清单

- [ ] Dashboard 切换主题 → Main 站点同步
- [ ] Dashboard 切换主题 → Auth 站点同步
- [ ] Dashboard 切换主题 → Fashion 站点**不**同步
- [ ] 任意站点切换语言 → 全站点同步
- [ ] 刷新页面后设置保持
- [ ] 清除 Cookie 后恢复默认值

---

## 8. 相关文件

### 需要修改的文件

```
Dashboard:
├── src/shared/theme/ThemeScript.tsx      # T1
├── src/shared/theme/ColorThemeSwitcher.tsx # T4
├── src/styles/themes.css                 # T5
└── src/app/dashboard/settings/page.tsx   # T6

Main:
├── src/shared/theme/ThemeScript.tsx      # T2
└── src/styles/themes.css                 # T5

Auth:
├── src/shared/theme/ThemeScript.tsx      # T3
└── src/styles/themes.css                 # T5

Fashion:
└── (确认不读取主题 Cookie)              # T8
```

---

**最后更新**: 2025-12-17
