# WizPulseAI 法律文档分析与改进计划

> 创建日期: 2025-12-18
> 参考对象: https://www.medeo.app/legal/
> 状态: 计划中

---

## 一、参考网站分析 (Medeo.app)

### Privacy Policy 结构 (10章节)
| 章节 | 内容要点 |
|------|----------|
| 1. Information We Collect | 账户信息、支付信息、使用数据、设备信息、Cookies |
| 2. How We Use Information | 提供服务、沟通、支付处理、法律安全 |
| 3. Sharing Information | 第三方服务商、法律合规、业务转让 |
| 4. Data Security | **AI训练使用同意条款**（用户可拒绝） |
| 5. International Transfers | 跨境数据传输同意 |
| 6. Your Rights | 访问、更正、删除、数据可携带性、退订 |
| 7. Data Retention | 保留期限说明 |
| 8. Cookies Policy | Cookie使用说明 |
| 9. Policy Changes | 变更通知 |
| 10. Contact | 联系方式 |

### Terms of Use 结构 (14章节)
| 章节 | 内容要点 |
|------|----------|
| 1. Google Login | OAuth 2.0集成、访问权限说明 |
| 2. Data Collection | 数据使用目的、不存储密码声明 |
| 3. Token Management | 访问令牌、会话管理、撤销方法 |
| 4. Privacy & Security | 数据安全、撤销权利 |
| 5. Acceptable Use | **非常详细**：禁止行为、Element限制、商标限制、制裁合规 |
| 6. IP Rights | 服务所有权、Feedback许可、输出物所有权 |
| 7. Termination | 终止条件、存续条款 |
| 8. Disclaimer | AS IS/AS AVAILABLE、无保证 |
| 9. Indemnification | 用户赔偿责任 |
| 10. Liability Limit | **上限**：12个月费用或$100 |
| 11. Changes | 变更通知 |
| 12. Governing Law | **香港法律**、专属管辖、禁止集体诉讼 |
| 13. General | 可分割性、完整协议、转让、弃权、语言优先级 |
| 14. Contact | 联系方式 |

---

## 二、WizPulseAI 现有文档状态

| 站点 | 隐私政策 | 使用条款 | 特商法 | 状态 |
|------|---------|---------|--------|------|
| **Fashion (マジコーデ)** | ✅ 完整 | ✅ 完整 | ❌ 缺失 | 较完善 |
| **主站 (www)** | ❌ 缺失 | ❌ 缺失 | - | 待开发 |
| **Auth** | ❌ 缺失 | ❌ 缺失 | - | 引用主站 |
| **Dashboard** | ❌ 缺失 | ❌ 缺失 | - | 引用主站 |

### 现有Fashion站点法律文档位置
```
fashion-wizpulseai-com/
├── src/app/[locale]/about/
│   ├── privacy/page.tsx      (452行, 4语言)
│   └── terms/page.tsx        (410行, 4语言)
└── src/messages/
    ├── privacy-translations.json
    └── terms-translations.json
```

---

## 三、站点策略决定

### 采用方案：Main + 各App独立

```
法律文档架构:

www.wizpulseai.com (主站)
├── /legal/privacy        ← 平台级隐私政策 (通用)
├── /legal/terms          ← 平台级使用条款 (通用)
└── /legal/tokushoho      ← 特定商取引法 (日本必须)

magicoord.wizpulseai.com (Fashion App)
├── /about/privacy        ← App专属隐私政策 (已有，需更新)
├── /about/terms          ← App专属使用条款 (已有，需更新)
└── /about/tokushoho      ← App专属特商法 (新建)

auth.wizpulseai.com
└── Footer链接 → 主站法律页面

dashboard.wizpulseai.com
└── Footer链接 → 主站法律页面

未来产品站点 (quickslide等)
└── 各自独立法律文档 (参考Fashion模板)
```

### 理由
1. **主站**: 平台级通用条款，覆盖账户、SSO、支付等
2. **各App**: 针对具体功能的专属条款（如AI分析、积分制度）
3. **Auth/Dashboard**: 功能站点，引用主站即可
4. **未来扩展**: 新产品基于模板快速创建

---

## 四、关于第三方API数据处理的说明

### 重要澄清

**我们的立场**：
- ❌ WizPulseAI **不收集**用户数据用于AI训练
- ❌ 用户照片分析完成后**立即删除**原图
- ✅ 仅保存200×200缩略图用于历史记录

**第三方API服务商**：
- 我们使用第三方AI API（如Google Gemini）
- 这些服务商有**自己的数据处理政策**
- 我们需要**如实告知**用户，并提供链接

### 需要说明的第三方服务

| 服务 | 用途 | 数据处理 | 政策链接 |
|------|------|----------|----------|
| **Google AI (Gemini)** | 照片分析 | 见Google政策 | https://ai.google.dev/terms |
| **Supabase** | 数据库/认证 | 见Supabase政策 | https://supabase.com/privacy |
| **Stripe** | 支付处理 | 见Stripe政策 | https://stripe.com/privacy |

### 隐私政策中的正确表述

```markdown
## 第三方AIサービスについて

当サービスでは、AI機能の提供にGoogle AI (Gemini API)を使用しています。

**当社の方針：**
- 当社はお客様のデータをAIモデルの学習に使用しません
- 分析用にアップロードされた写真は、処理完了後速やかに削除されます
- 当社が保存するのは200×200ピクセルのサムネイルのみです

**Google AIについて：**
お客様の写真はAI分析のためにGoogle AIに送信されます。
Googleのデータ処理については、以下をご確認ください：
- [Google AI Terms of Service](https://ai.google.dev/terms)
- [Google Privacy Policy](https://policies.google.com/privacy)

※Googleの無料API利用の場合、Googleがサービス改善のために
データを使用する可能性があります。詳細はGoogle規約をご確認ください。
```

---

## 五、改进项目详细清单

### 🔴 P0 紧急 (本周内)

#### 1. Fashion站点：第三方API数据处理说明
- **文件**: `privacy/page.tsx` + translations
- **内容**: 明确说明我们不训练，但Google可能有自己的政策
- **工作量**: 1h

#### 2. Fashion站点：OAuth/Google Login条款
- **文件**: `terms/page.tsx` + translations
- **内容**: 添加Google登录相关条款
- **工作量**: 1h

#### 3. Fashion站点：AI生成物使用制限
- **文件**: `terms/page.tsx` + translations
- **内容**: 禁止政治/色情/误导使用，禁止独立销售
- **工作量**: 1h

#### 4. Fashion站点：损害赔偿上限明确化
- **文件**: `terms/page.tsx` + translations
- **内容**: 明确金额上限（12个月费用或1万円）
- **工作量**: 0.5h

#### 5. Fashion站点：特定商取引法表示
- **文件**: 新建 `tokushoho/page.tsx` + translations
- **内容**: 日本法律要求的销售者信息公示
- **工作量**: 2h

### 🟡 P1 重要 (2周内)

#### 6. Fashion站点：用户补偿义务 (Indemnification)
- **工作量**: 0.5h

#### 7. Fashion站点：集团诉讼放弃条款
- **工作量**: 0.5h

#### 8. Fashion站点：数据可携带性权利
- **工作量**: 0.5h

### 🟢 P2 改善 (1个月内)

#### 9. 主站：法律页面实装
- 创建 `/legal/privacy`, `/legal/terms`
- 平台级通用条款
- **工作量**: 4h

#### 10. 主站：特定商取引法表示
- **工作量**: 1h

---

## 六、实施时间表

| 周 | 任务 | 预计工时 |
|----|------|----------|
| **W1 (本周)** | Fashion P0全部 (1-5) | 5.5h |
| **W2** | Fashion P1全部 (6-8) | 1.5h |
| **W3** | 主站法律页面 (9-10) | 5h |
| **W4** | 测试验证 + 翻译校对 | 2h |
| **合计** | | **14h** |

---

## 七、Google Gemini API 数据政策要点

### 免费API vs 付费API

| 项目 | 免费API | 付费API (Vertex AI) |
|------|---------|---------------------|
| 数据用于训练 | ⚠️ 可能 | ❌ 不会 |
| 数据保留 | 可能保留 | 按合同 |
| 适合场景 | 开发测试 | 生产环境 |

### 建议
1. **短期**: 在隐私政策中如实说明使用免费API的情况
2. **长期**: 考虑升级到付费API（Vertex AI）以获得更好的数据保护

### 参考链接
- [Google AI Studio Terms](https://ai.google.dev/terms)
- [Gemini API Data Policy](https://ai.google.dev/gemini-api/terms)
- [Vertex AI Data Usage](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance)

---

## 八、文件修改清单

```
fashion-wizpulseai-com/
├── src/app/[locale]/about/
│   ├── privacy/page.tsx           ← 修改：+第三方API说明 +数据可携带性
│   ├── terms/page.tsx             ← 修改：+OAuth +AI限制 +赔偿上限 +补偿义务
│   └── tokushoho/page.tsx         ← 新建：特定商取引法
└── src/messages/
    ├── privacy-translations.json  ← 更新4语言
    ├── terms-translations.json    ← 更新4语言
    └── tokushoho-translations.json ← 新建4语言

wizPulseAI-com/
└── src/app/[locale]/legal/        ← 新建目录
    ├── privacy/page.tsx           ← 新建：平台隐私政策
    ├── terms/page.tsx             ← 新建：平台使用条款
    └── tokushoho/page.tsx         ← 新建：特商法
```

---

## 九、备注

### 法律免责声明
本文档仅作为内部规划参考，不构成法律建议。
建议在发布前请法律专业人士审核。

### 更新记录
- 2025-12-18: 初版创建，基于Medeo.app对比分析
