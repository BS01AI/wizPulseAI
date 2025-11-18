# IP地理位置语言检测系统

**版本**：v3.0
**更新时间**：2025-11-18
**功能**：基于IP地理位置的智能语言检测

---

## 🎯 核心功能

### 自动语言检测四层优先级

```
用户访问 www.wizpulseai.com
↓
1️⃣ Cookie（NEXT_LOCALE）
   ↓ 如果存在 → 使用用户保存的语言偏好
   ↓ 如果不存在 ↓

2️⃣ IP地理位置（Vercel Geo）⭐ 新功能
   ↓ 如果检测到 → 根据国家自动映射语言
   ↓ 如果无法检测 ↓

3️⃣ 浏览器Accept-Language头
   ↓ 如果支持 → 使用浏览器语言
   ↓ 如果不支持 ↓

4️⃣ 默认语言（en）⭐ 改动
   ↓
重定向到 /{locale}/
```

---

## 🌍 国家到语言映射规则

### 实现代码
```typescript
// src/middleware.ts

const getLocaleFromCountry = (countryCode: string | undefined) => {
  if (!countryCode) return null;

  const country = countryCode.toUpperCase();

  // 日语区域
  if (country === 'JP') return 'ja';

  // 阿拉伯语区域（18个中东国家）
  if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'YE',
       'SY', 'PS', 'EG', 'SD', 'DZ', 'MA', 'TN', 'LY'].includes(country)) {
    return 'ar';
  }

  // 繁体中文区域
  if (['TW', 'HK', 'MO'].includes(country)) return 'zh-TW';

  // 其他国家默认英语
  return 'en';
};
```

### 映射表

| 地区 | 国家代码 | 语言 |
|------|---------|------|
| 🇯🇵 日本 | JP | ja（日本語） |
| 🇸🇦 沙特阿拉伯 | SA | ar（العربية） |
| 🇦🇪 阿联酋 | AE | ar |
| 🇶🇦 卡塔尔 | QA | ar |
| 🇰🇼 科威特 | KW | ar |
| 🇧🇭 巴林 | BH | ar |
| 🇴🇲 阿曼 | OM | ar |
| 🇯🇴 约旦 | JO | ar |
| 🇱🇧 黎巴嫩 | LB | ar |
| 🇮🇶 伊拉克 | IQ | ar |
| 🇾🇪 也门 | YE | ar |
| 🇸🇾 叙利亚 | SY | ar |
| 🇵🇸 巴勒斯坦 | PS | ar |
| 🇪🇬 埃及 | EG | ar |
| 🇸🇩 苏丹 | SD | ar |
| 🇩🇿 阿尔及利亚 | DZ | ar |
| 🇲🇦 摩洛哥 | MA | ar |
| 🇹🇳 突尼斯 | TN | ar |
| 🇱🇾 利比亚 | LY | ar |
| 🇹🇼 台湾 | TW | zh-TW（繁體中文） |
| 🇭🇰 香港 | HK | zh-TW |
| 🇲🇴 澳门 | MO | zh-TW |
| 🇺🇸 美国 | US | en（English） |
| 🇬🇧 英国 | GB | en |
| 🌏 其他国家 | * | en（默认） |

---

## 📍 语言切换器位置调整

### 从Header移到Footer

**之前**（Header右上角）：
```
Products | Knowledge Hub | Contact | About | UserMenu | 🌐 | Get Started
```

**现在**（Footer底部）：
```
Copyright © 2024      |      Privacy | Terms | Sitemap | 🌐
```

**优势**：
- ✅ 更加低调，不抢Header风头
- ✅ 用户感觉"当前语言就是默认"
- ✅ 需要切换时滚动到底部即可
- ✅ 符合国际网站惯例（多数网站语言切换在Footer）

---

## 🧪 本地测试

### 模拟IP地理位置

**注意**：本地开发环境（localhost）无法检测Geo信息，必须部署到Vercel才能测试。

**Vercel预览部署测试方法**：
1. 推送代码到GitHub（已完成）
2. Vercel自动部署预览环境
3. 使用VPN切换不同国家IP
4. 访问预览URL，观察自动语言检测

**测试场景**：

| VPN设置 | 预期语言 | URL示例 |
|---------|---------|---------|
| 日本IP | ja | https://preview.vercel.app/ja/ |
| 美国IP | en | https://preview.vercel.app/en/ |
| 沙特IP | ar | https://preview.vercel.app/ar/ |
| 台湾IP | zh-TW | https://preview.vercel.app/zh-TW/ |
| 无VPN（其他） | en | https://preview.vercel.app/en/ |

---

## 🚀 Vercel Edge Network

### 技术原理

**Vercel提供的Geo信息**：
```typescript
request.geo?.country  // 国家代码（如 "US", "JP", "SA"）
request.geo?.city     // 城市名称
request.geo?.region   // 地区/州
request.geo?.latitude // 纬度
request.geo?.longitude // 经度
```

**我们使用的字段**：
- `request.geo?.country` - 国家代码

**Geo检测的准确性**：
- ✅ 使用CDN边缘节点的IP库
- ✅ 准确率约95%+
- ✅ 实时检测，无需第三方API
- ⚠️ 仅在Vercel部署环境可用

---

## 📊 用户体验对比

### v2.0（之前）：浏览器语言检测

| 场景 | 检测结果 |
|------|---------|
| 日本人使用英文浏览器 | ❌ 显示英语（不准确） |
| 美国人使用日文浏览器 | ❌ 显示日语（不准确） |
| 中国人访问 | ❌ 显示日语（因为默认ja） |

### v3.0（现在）：IP地理位置检测

| 场景 | 检测结果 |
|------|---------|
| 日本人使用英文浏览器 | ✅ 显示日语（基于IP） |
| 美国人使用日文浏览器 | ✅ 显示英语（基于IP） |
| 中国人访问 | ✅ 显示英语（默认en） |
| 台湾人访问 | ✅ 显示繁体中文（基于IP） |

---

## 🔧 代码改动总结

### 修改的文件

| 文件 | 改动 |
|------|------|
| [src/middleware.ts](../wizPulseAI-com/src/middleware.ts) | 增加Geo检测逻辑 + 默认语言改为en |
| [src/components/common/Footer.tsx](../wizPulseAI-com/src/components/common/Footer.tsx) | 添加LanguageSwitcher |
| [src/components/common/Header.tsx](../wizPulseAI-com/src/components/common/Header.tsx) | 移除LanguageSwitcher |

### Git提交

```bash
commit 04c74b2
feat: IP地理位置语言检测 + 语言切换器移至Footer

核心改动：
1. 🌍 IP地理位置检测（Vercel Geo）
2. 🌐 默认语言改为英文
3. 📍 语言切换器移至Footer
```

---

## 📝 待测试事项

### 生产环境测试

**部署后测试**：
1. [ ] 从日本IP访问 → 自动显示日语
2. [ ] 从美国IP访问 → 自动显示英语
3. [ ] 从沙特IP访问 → 自动显示阿拉伯语（RTL布局）
4. [ ] 从台湾IP访问 → 自动显示繁体中文
5. [ ] Cookie优先级测试（手动切换语言后，再次访问使用Cookie）

### 回退测试

**如果Geo检测失败**：
- 降级到浏览器语言检测
- 再降级到默认en
- 不影响网站可用性

---

## 🎯 下一步优化方向

### 可选功能（未来）

1. **搜索引擎入口检测**
   - 检测Referrer头（Google.co.jp → ja）
   - 优先级：Cookie > Referrer > Geo > 浏览器 > 默认

2. **用户偏好保存到数据库**
   - 登录用户：保存语言偏好到Supabase
   - 跨设备同步语言设置

3. **更多语言支持**
   - 韩语（ko）- 韩国IP
   - 西班牙语（es）- 西班牙、拉美IP
   - 法语（fr）- 法国、加拿大IP

4. **A/B测试**
   - 测试Geo检测 vs 浏览器检测的用户留存率
   - 测试默认语言en vs ja的转化率

---

**文档维护**：WizPulseAI 技术团队
**反馈渠道**：tech@wizpulseai.com
