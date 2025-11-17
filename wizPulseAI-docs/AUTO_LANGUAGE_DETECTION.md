# WizPulseAI 智能多语言系统

**版本**：v2.0（低调版）
**最后更新**：2025-11-17

---

## 📋 目录

1. [系统概述](#系统概述)
2. [自动语言检测机制](#自动语言检测机制)
3. [用户体验设计](#用户体验设计)
4. [技术实现](#技术实现)
5. [测试验证](#测试验证)

---

## 系统概述

### 设计理念

**让用户感觉当前语言就是默认语言**

- ✅ 自动检测浏览器语言，无需手动选择
- ✅ 语言切换器低调隐藏（地球仪图标，半透明）
- ✅ 用户只有需要切换时才注意到这个功能
- ✅ Cookie保存语言偏好，下次访问直接使用

### 支持的语言

| 语言代码 | 语言名称 | 使用场景 |
|---------|---------|----------|
| `ja` | 日本語 | 日本用户（默认） |
| `en` | English | 全球用户 |
| `ar` | العربية | 中东用户 |
| `zh-TW` | 繁體中文 | 台湾、香港用户 |

---

## 自动语言检测机制

### 三层优先级系统

```
用户访问 www.wizpulseai.com
↓
1️⃣ 检查Cookie（NEXT_LOCALE）
   ↓ 如果存在 → 使用Cookie中的语言
   ↓ 如果不存在 ↓

2️⃣ 检查浏览器Accept-Language头
   ↓ 如果是ja/en/ar/zh → 使用浏览器语言
   ↓ 如果不支持 ↓

3️⃣ 使用默认语言（ja）
   ↓
重定向到 /{locale}/（例如：/ja/ 或 /en/）
```

### 实际案例

**案例1：日本用户首次访问**
```
1. 用户访问 https://www.wizpulseai.com/
2. 浏览器发送 Accept-Language: ja,en;q=0.9
3. 系统检测到"ja"，自动重定向到 /ja/
4. 设置Cookie: NEXT_LOCALE=ja（有效期1年）
5. 用户看到日语界面，完全无感知
```

**案例2：美国用户首次访问**
```
1. 用户访问 https://www.wizpulseai.com/
2. 浏览器发送 Accept-Language: en-US,en;q=0.9
3. 系统检测到"en"，自动重定向到 /en/
4. 设置Cookie: NEXT_LOCALE=en
5. 用户看到英语界面，完全无感知
```

**案例3：已有Cookie的老用户**
```
1. 用户访问 https://www.wizpulseai.com/
2. 浏览器携带Cookie: NEXT_LOCALE=zh-TW
3. 系统直接重定向到 /zh-TW/（忽略浏览器语言）
4. 用户看到繁体中文界面，体验连贯
```

**案例4：用户手动切换语言**
```
1. 用户访问 /en/products
2. 点击地球仪图标，选择"日本語"
3. 系统重定向到 /ja/products
4. 更新Cookie: NEXT_LOCALE=ja
5. 下次访问自动使用日语
```

---

## 用户体验设计

### 低调的语言切换器

#### 设计原则
- **不显眼**：使用地球仪图标，不显示语言名称
- **半透明**：默认opacity: 0.5，鼠标悬停opacity: 1
- **小尺寸**：8x8图标，不占用太多空间
- **右上角**：放在Header右侧，不抢主导航的风头

#### 视觉效果

**默认状态**（用户不关注）：
```
🌐 ← 半透明地球仪，若隐若现
```

**鼠标悬停**（用户注意到）：
```
🌐 ← 完全不透明，背景变白色10%透明度
```

**点击后**（语言菜单）：
```
┌─────────────┐
│ 日本語   ✓  │ ← 当前语言（蓝色高亮）
│ English     │
│ العربية     │
│ 繁體中文     │
├─────────────┤
│ Auto-detected│ ← 提示：自动检测
└─────────────┘
```

### 无缝切换体验

**切换语言时**：
1. 点击语言选项
2. 显示加载动画（旋转Loader）
3. 自动跳转到对应语言的相同页面
4. 例如：`/en/products` → `/ja/products`

**智能路径保持**：
- 不仅切换语言，还保持当前页面
- 用户不会被踢回首页
- 保持URL参数和Hash

---

## 技术实现

### 核心文件

| 文件 | 作用 |
|------|------|
| [src/middleware.ts](../wizPulseAI-com/src/middleware.ts) | 自动语言检测和重定向 |
| [src/components/common/LanguageSwitcher.tsx](../wizPulseAI-com/src/components/common/LanguageSwitcher.tsx) | 地球仪语言切换器 |
| [src/i18n.ts](../wizPulseAI-com/src/i18n.ts) | 语言配置和翻译加载 |
| [src/components/common/Header.tsx](../wizPulseAI-com/src/components/common/Header.tsx) | 放置语言切换器的Header |

### Middleware核心逻辑

```typescript
// src/middleware.ts (简化版)

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ① URL已有语言前缀（如 /ja/products）
  const firstSegment = pathname.split('/')[1];
  if (isValidLocale(firstSegment)) {
    // 更新Cookie为当前语言
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', firstSegment, { maxAge: 31536000 });
    return response;
  }

  // ② URL没有语言前缀（如 /products）
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const browserLocale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];

  let targetLocale: string;

  // 优先级：Cookie > 浏览器语言 > 默认ja
  if (isValidLocale(cookieLocale)) {
    targetLocale = cookieLocale;
  } else if (isValidLocale(browserLocale)) {
    targetLocale = browserLocale;
  } else {
    targetLocale = 'ja'; // 默认日语
  }

  // 重定向到 /{locale}/路径
  const newUrl = `/${targetLocale}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(newUrl);
  response.cookies.set('NEXT_LOCALE', targetLocale, { maxAge: 31536000 });

  return response;
}
```

### LanguageSwitcher核心代码

```typescript
// src/components/common/LanguageSwitcher.tsx (简化版)

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageSelect = (newLocale: string) => {
    // 构建新路径：/en/products → /ja/products
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // 跳转到新路径（Cookie会在Middleware中更新）
    router.replace(newPath);
  };

  return (
    <button className="opacity-50 hover:opacity-100">
      <Globe className="w-5 h-5 text-white" />
      {/* 下拉菜单... */}
    </button>
  );
}
```

---

## 测试验证

### 手动测试步骤

#### 测试1：首次访问自动检测

**步骤**：
1. 清除浏览器Cookie（开发者工具 → Application → Clear cookies）
2. 访问 `http://localhost:3010/` 或 `https://www.wizpulseai.com/`
3. 观察URL变化

**预期结果**：
- 自动重定向到 `/ja/`（如果浏览器是日语）
- 或 `/en/`（如果浏览器是英语）
- Cookie中设置了 `NEXT_LOCALE`

---

#### 测试2：切换语言保持页面

**步骤**：
1. 访问 `/en/products`（英语产品页）
2. 点击地球仪图标
3. 选择"日本語"

**预期结果**：
- URL变为 `/ja/products`（日语产品页）
- 页面内容切换为日语
- Cookie更新为 `NEXT_LOCALE=ja`

---

#### 测试3：Cookie优先级验证

**步骤**：
1. 手动设置Cookie `NEXT_LOCALE=ar`（阿拉伯语）
2. 浏览器语言设置为English
3. 访问 `http://localhost:3010/`

**预期结果**：
- 重定向到 `/ar/`（使用Cookie，忽略浏览器语言）
- 显示阿拉伯语界面（RTL布局）

---

#### 测试4：不支持的语言降级

**步骤**：
1. 清除Cookie
2. 浏览器语言设置为French（fr）
3. 访问 `http://localhost:3010/`

**预期结果**：
- 重定向到 `/ja/`（使用默认语言）
- Cookie设置为 `NEXT_LOCALE=ja`

---

### 浏览器语言模拟

**Chrome DevTools模拟**：
```
1. 打开DevTools（F12）
2. Settings（⚙️） → Preferences
3. Languages → 添加语言 → 设置优先级
4. 或者使用命令行：
   chrome --lang=ja  # 日语
   chrome --lang=ar  # 阿拉伯语
```

**curl测试Accept-Language**：
```bash
# 模拟日语用户
curl -H "Accept-Language: ja,en;q=0.9" http://localhost:3010/

# 模拟英语用户
curl -H "Accept-Language: en-US,en;q=0.9" http://localhost:3010/

# 模拟阿拉伯语用户
curl -H "Accept-Language: ar,en;q=0.8" http://localhost:3010/
```

---

## 架构优势

### 用户体验优势

✅ **首次访问**：自动检测，无需选择，秒级体验
✅ **回访用户**：Cookie记忆，直接使用偏好语言
✅ **手动切换**：地球仪图标，低调不显眼
✅ **路径保持**：切换语言后停留在同一页面

### 技术优势

✅ **SEO友好**：URL路径包含语言代码（/ja/, /en/）
✅ **缓存优化**：每个语言独立URL，CDN缓存更高效
✅ **无闪烁**：Middleware重定向，服务端处理，无客户端跳转闪烁
✅ **可扩展**：新增语言只需修改`locales`数组

### 性能优势

⚡ **Middleware层面**：请求拦截，零延迟重定向
⚡ **Cookie缓存**：避免重复检测浏览器语言
⚡ **静态生成**：每个语言路径可独立SSG

---

## 未来扩展

### 计划功能

1. **IP地理位置检测**（可选）
   - 使用Vercel Edge Network的geo信息
   - 优先级：Cookie > IP地理位置 > 浏览器语言 > 默认

2. **语言偏好API**
   - 保存用户语言偏好到Supabase
   - 登录用户自动同步语言设置

3. **智能推荐**
   - 根据用户行为推荐切换语言
   - 例如：日本IP但使用英语 → 提示"切换到日语？"

4. **更多语言支持**
   - 韩语（ko）
   - 西班牙语（es）
   - 法语（fr）

---

## 故障排查

### 问题1：切换语言后URL没变化

**原因**：浏览器缓存了301重定向

**解决**：
1. 清除浏览器缓存
2. 使用隐身模式测试
3. 或者访问 `/en/products`（直接URL访问）

---

### 问题2：首次访问总是日语

**原因**：浏览器Accept-Language不包含支持的语言

**解决**：
1. 检查浏览器语言设置
2. 确保Accept-Language头包含ja/en/ar/zh
3. 或者手动访问 `/en/`

---

### 问题3：阿拉伯语RTL布局异常

**原因**：CSS未正确支持RTL

**解决**：
1. 检查`<html dir="rtl">`标签
2. 使用Tailwind的RTL插件
3. 检查CSS中的`ltr:`和`rtl:`前缀

---

## 技术参考

- **next-intl文档**：https://next-intl-docs.vercel.app/
- **Accept-Language规范**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
- **Cookie最佳实践**：https://web.dev/samesite-cookies-explained/

---

**文档维护者**：WizPulseAI 技术团队
**反馈渠道**：tech@wizpulseai.com
