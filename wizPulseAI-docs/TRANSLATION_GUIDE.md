# WizPulseAI 翻译指南

## 📋 目录

1. [快速开始](#快速开始)
2. [添加新语言](#添加新语言)
3. [翻译流程](#翻译流程)
4. [质量标准](#质量标准)
5. [术语统一](#术语统一)

---

## 快速开始

### 前提条件

- 确保已阅读 [I18N_ARCHITECTURE.md](./I18N_ARCHITECTURE.md)
- 准备好日语基准翻译文件（`ja.json`）
- 有访问`translation-manager` agent的权限

---

## 添加新语言

### 示例：添加韩语 (ko)

#### Step 1: 更新共享配置

**修改文件**：`shared/i18n/config.ts`

```typescript
// BEFORE
export const LOCALES = ['ja', 'en', 'ar', 'zh-TW'] as const;

// AFTER
export const LOCALES = ['ja', 'en', 'ar', 'zh-TW', 'ko'] as const;

// BEFORE
export const LOCALE_LABELS: LocaleLabel[] = [
  { locale: 'ja', label: '日本語', flag: '🇯🇵' },
  { locale: 'en', label: 'English', flag: '🇺🇸' },
  { locale: 'ar', label: 'العربية', flag: '🇸🇦' },
  { locale: 'zh-TW', label: '繁體中文', flag: '🇹🇼' }
];

// AFTER
export const LOCALE_LABELS: LocaleLabel[] = [
  { locale: 'ja', label: '日本語', flag: '🇯🇵' },
  { locale: 'en', label: 'English', flag: '🇺🇸' },
  { locale: 'ar', label: 'العربية', flag: '🇸🇦' },
  { locale: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { locale: 'ko', label: '한국어', flag: '🇰🇷' }  // ← 新增
];
```

#### Step 2: 更新TypeScript类型

**修改文件**：`shared/i18n/types.ts`

```typescript
// BEFORE
export type Locale = 'ja' | 'en' | 'ar' | 'zh-TW';

// AFTER
export type Locale = 'ja' | 'en' | 'ar' | 'zh-TW' | 'ko';
```

#### Step 3: 创建翻译文件

**Auth站点**：

1. 复制日语文件：
```bash
cp auth-wizpulseai-com/src/messages/ja.json \
   auth-wizpulseai-com/src/messages/ko.json
```

2. 使用`translation-manager` agent翻译：
```bash
"用 translation-manager 把 auth-wizpulseai-com/src/messages/ja.json
 翻译成韩语，输出到 ko.json"
```

3. 更新导出文件：`auth-wizpulseai-com/src/messages/index.ts`
```typescript
import ko from './ko.json';

const messages = {
  ja,
  en,
  ar,
  'zh-TW': zhTW,
  ko  // ← 新增
};
```

**Dashboard站点**（步骤相同）：
```bash
cp db-wizPulseAI-com/src/messages/ja.json \
   db-wizPulseAI-com/src/messages/ko.json
```

**Main站点**（如果需要）：
```bash
cp wizPulseAI-com/src/messages/ja.json \
   wizPulseAI-com/src/messages/ko.json
```

#### Step 4: 测试验证

1. **启动开发服务器**：
```bash
npm run dev
```

2. **手动切换语言**：
- 打开LanguageSwitcher
- 选择"한국어"
- 验证翻译显示正确

3. **测试Cookie同步**：
- Main切换韩语 → Auth继承韩语 → Dashboard继承韩语

#### Step 5: Git提交

```bash
git add shared/i18n/ */src/messages/
git commit -m "feat: 添加韩语支持 (ko)

- 更新shared/i18n配置（5语言）
- 创建ko.json翻译文件（Auth + Dashboard + Main）
- 使用translation-manager 3层翻译流程
- 测试跨站点语言同步

语言列表：ja/en/ar/zh-TW/ko"
git push origin main
```

---

## 翻译流程

### 方案A：AI批量翻译（推荐）⭐

**使用`translation-manager` agent**（3层翻译流程）：

```bash
# 命令格式
"用 translation-manager 把 <源文件路径> 翻译成 <目标语言>，
 输出到 <目标文件路径>"

# 示例
"用 translation-manager 把 auth-wizpulseai-com/src/messages/ja.json
 翻译成法语、德语、西班牙语"
```

**翻译质量保证**：
- **Layer 1（初译）**：日语 → 目标语言基础翻译
- **Layer 2（校对）**：8-11处改进（术语统一、语法优化）
- **Layer 3（润色）**：最终打磨（语气、流畅度）

**优势**：
- ✅ 效率高（5分钟完成3种语言）
- ✅ 质量好（3层审核）
- ✅ 术语统一（AI记忆术语表）

### 方案B：人工翻译

**适用场景**：
- 关键营销文本
- 法律条款
- 品牌slogan

**流程**：
1. 创建基准文件（ja.json）
2. 导出到Excel/Google Sheets
3. 分配给翻译人员
4. 审核后导入JSON

---

## 质量标准

### 1. 结构一致性

**所有语言文件必须保持相同结构**：

```json
// ✅ 正确
// ja.json
{
  "auth": {
    "signIn": {
      "title": "ログイン"
    }
  }
}

// en.json
{
  "auth": {
    "signIn": {
      "title": "Sign In"
    }
  }
}

// ❌ 错误（结构不一致）
// en.json
{
  "authentication": {  // ← key名称不同
    "login": {         // ← key名称不同
      "title": "Sign In"
    }
  }
}
```

### 2. 占位符规范

**保持占位符格式不变**：

```json
// ✅ 正确
"welcome": "Welcome, {{name}}!"    // 英语
"welcome": "ようこそ、{{name}}さん" // 日语

// ❌ 错误
"welcome": "Welcome, {name}!"      // 格式错误
"welcome": "ようこそ、nameさん"      // 未保留占位符
```

### 3. 专业术语

**参考**：[TRANSLATION_GLOSSARY.md](./TRANSLATION_GLOSSARY.md)

核心术语必须统一：
- Dashboard → ダッシュボード (ja) / 控制面板 (zh-TW)
- Subscription → サブスクリプション (ja) / 訂閱 (zh-TW)
- API Key → APIキー (ja) / API金鑰 (zh-TW)

### 4. RTL语言特殊处理

**阿拉伯语checklist**：
- ✅ 删除不必要的标点（。！等）
- ✅ 使用阿拉伯语标点（،؛؟）
- ✅ 定冠词规范（ال）
- ✅ 测试RTL布局不错位

---

## 术语统一

### 核心原则

1. **品牌名称**：保持原文
   - WizPulseAI → 不翻译
   - QuickSlide → 不翻译

2. **技术术语**：使用业界标准
   - API → API（不翻译）
   - Cookie → Cookie（不翻译）
   - Session → セッション (ja) / 會話 (zh-TW)

3. **UI术语**：参考平台标准
   - Sign In → ログイン (ja, 参考Google)
   - Dashboard → ダッシュボード (ja, 参考Microsoft)

### 术语查询工具

**在线词典**：
- 日语：[Weblio IT用語辞典](https://www.weblio.jp/cat/computer/ithyj)
- 繁体中文：[微软术语检索](https://www.microsoft.com/zh-tw/language)
- 阿拉伯语：[Microsoft Language Portal](https://www.microsoft.com/en-us/language)

**参考平台**：
- Google产品（登录/注册术语）
- Microsoft Azure（技术术语）
- Stripe（支付术语）

---

## 翻译审核

### Self-Review清单

- [ ] JSON格式正确（无语法错误）
- [ ] 所有key与ja.json一致
- [ ] 所有value已翻译（无日语残留）
- [ ] 占位符格式保留（{{xxx}}）
- [ ] 术语统一（参考GLOSSARY）
- [ ] 特殊字符正确（引号、标点）
- [ ] RTL语言布局测试（if applicable）

### Peer Review

**推荐流程**：
1. 初译完成后，请母语用户审核
2. 重点检查：语气、流畅度、专业度
3. 记录反馈，更新术语表

---

## 常见问题

### Q: 如何处理没有对应翻译的术语？

**A**: 优先级：
1. 保持原文（如品牌名）
2. 使用音译（如Supabase → スーパーベース）
3. 意译（如Dashboard → 控制面板）

### Q: 翻译文件太大怎么办？

**A**: 拆分策略：
```json
// 拆分前（1个大文件）
messages/ja.json (1000行)

// 拆分后（多个小文件）
messages/
├── common/ja.json (100行)
├── auth/ja.json (200行)
├── dashboard/ja.json (300行)
└── products/ja.json (400行)
```

### Q: AI翻译不准确怎么办？

**A**: 迭代优化：
1. 明确翻译上下文（"这是登录按钮"而非"这是书名"）
2. 提供参考术语表
3. 人工审核关键部分
4. 更新术语表，下次AI会学习

---

## 实战案例

### 案例1：Dashboard导航翻译

**源文件**（ja.json）：
```json
{
  "nav": {
    "dashboard": "ダッシュボード",
    "subscription": "サブスクリプション",
    "usage": "使用状況",
    "settings": "設定"
  }
}
```

**AI翻译命令**：
```bash
"用 translation-manager 把 db-wizPulseAI-com/src/messages/ja.json
 翻译成英语、阿拉伯语、繁体中文"
```

**输出**（en.json）：
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "subscription": "Subscription",
    "usage": "Usage",
    "settings": "Settings"
  }
}
```

**Layer 2校对改进**：
- 无改进（英语术语标准）

**Layer 3润色**：
- "Usage" → "Usage Statistics"（更完整）

### 案例2：错误消息翻译

**源文件**（ja.json）：
```json
{
  "errors": {
    "sessionError": "セッションエラー",
    "authError": "認証エラー",
    "generic": "エラーが発生しました"
  }
}
```

**AI翻译**（ar.json）：
```json
{
  "errors": {
    "sessionError": "خطأ في الجلسة",
    "authError": "خطأ في المصادقة",
    "generic": "حدث خطأ"
  }
}
```

**Layer 2校对改进**：
- 添加定冠词：خطأ في الجلسة → خطأ في **ال**جلسة

**Layer 3润色**：
- 用户友好表达：حدث خطأ → حدث خطأ. **يرجى المحاولة مرة أخرى**

---

## 工具推荐

### 开发工具

1. **JSON格式化**：
   - [JSON Formatter](https://jsonformatter.org/)
   - VSCode插件：Prettier

2. **翻译记忆**：
   - 使用Git追踪术语演进
   - 维护TRANSLATION_GLOSSARY.md

3. **测试工具**：
   - `sso-tester` agent（跨站点语言同步测试）
   - Chrome DevTools（Cookie验证）

### AI工具

1. **translation-manager** ⭐
   - 3层翻译流程
   - 支持12种翻译方向
   - 自动术语统一

2. **content-writer**
   - 创建AI主题文章
   - 支持日/英/中文

---

## 维护计划

### 定期检查

- [ ] 每月审核术语表
- [ ] 季度更新翻译（新功能）
- [ ] 年度母语用户review

### 版本管理

```bash
# 翻译版本tag
git tag -a translation-v1.0 -m "初版翻译（4语言）"
git tag -a translation-v1.1 -m "添加韩语支持"
```

---

## 资源链接

- [I18N架构文档](./I18N_ARCHITECTURE.md)
- [翻译术语表](./TRANSLATION_GLOSSARY.md)
- [shared/i18n README](../shared/README.md)

---

**文档维护**：WizPulseAI翻译团队
**最后更新**：2025-11-14
