# WizPulseAI - 30天行动计划

> **可直接执行的任务清单** | 启动日期：2025-11-11

---

## 📋 快速导航

- [Week 1](#week-1-紧急修复): 技术基础修复（开发主导）
- [Week 2](#week-2-aeo-启动): AEO 内容改造（内容主导）
- [Week 3](#week-3-geo-布局): GEO 外部引用（运营主导）
- [Week 4](#week-4-监测优化): 数据监测和迭代（全员）

---

## 📊 团队角色定义

| 角色 | 职责 | 工时 |
|------|------|------|
| **开发** | 技术实现、Schema标记、页面优化 | 30小时/周 |
| **内容** | 文章改造、SEO文案、日英翻译 | 20小时/周 |
| **运营** | 外部公关、社区互动、数据追踪 | 15小时/周 |
| **CEO** | 决策审批、资源协调、周报审阅 | 2小时/周 |

---

## Week 1: 紧急修复（11/11 - 11/17）

### 🎯 本周目标
- 修复技术SEO基础问题
- 让 Google 能够索引网站
- 添加基础 Schema 标记

### 任务清单

#### 📅 Day 1-2: Schema 标记（开发）

**负责人**：开发工程师
**工时**：6 小时

**任务**：
- [ ] 首页添加 `Organization` Schema
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "wizPulseAI",
    "url": "https://www.wizpulseai.com",
    "logo": "https://www.wizpulseai.com/logo.png",
    "description": "AI-powered presentation and productivity tools"
  }
  ```

- [ ] 产品页添加 `SoftwareApplication` Schema
  - QuickSlide 产品详情
  - 价格信息
  - 评分（如果有）

- [ ] 知识中心首页添加 `CollectionPage` Schema

**交付物**：
- ✅ 3 个页面的 Schema 标记代码
- ✅ 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证通过

**验收标准**：
- Schema 标记无错误
- Google 测试工具显示"合格"

---

#### 📅 Day 3-4: SEO Metadata（开发 + 内容）

**负责人**：开发（2h）+ 内容（4h）

**任务**：

**开发部分**：
- [ ] 在所有页面添加 `generateMetadata()` 函数
  ```typescript
  export async function generateMetadata(): Promise<Metadata> {
    return {
      title: '...',
      description: '...',
      keywords: [...],
      openGraph: { ... },
    };
  }
  ```

**内容部分**：
- [ ] 撰写首页 Meta Description（日/英）
  - 日语：「AIでプレゼン資料を10分で作成。wizPulseAI QuickSlideは...」
  - 英文："Create professional presentations in 10 minutes with AI..."

- [ ] 撰写 5 个核心页面的 Meta 内容：
  1. 首页
  2. QuickSlide 产品页
  3. 知识中心主页
  4. About 页面
  5. Contact 页面

**交付物**：
- ✅ Meta 内容文档（Google Sheet 或 Notion）
- ✅ 代码已部署

**验收标准**：
- 查看页面源代码，Meta 标签存在且内容正确
- 字数符合规范（Title ≤ 60字符，Description ≤ 155字符）

---

#### 📅 Day 5-6: 技术 SEO 修复（开发）

**负责人**：开发工程师
**工时**：8 小时

**任务**：
- [ ] 创建 `sitemap.xml`
  ```typescript
  // app/sitemap.ts
  export default function sitemap() {
    return [
      { url: 'https://www.wizpulseai.com', lastModified: new Date() },
      { url: 'https://www.wizpulseai.com/products', ... },
      // ... 所有页面
    ];
  }
  ```

- [ ] 创建 `robots.txt`
  ```
  User-agent: *
  Allow: /
  Sitemap: https://www.wizpulseai.com/sitemap.xml
  ```

- [ ] 修复文章详情页（实现动态渲染）
  - 目前显示 TODO 的页面改为真实内容
  - 至少实现 3 篇文章的详情页

- [ ] 性能优化：
  - [ ] 动态导入 Three.js（首屏不阻塞）
  - [ ] 图片优化（Next/Image + WebP）

**交付物**：
- ✅ sitemap.xml 生成
- ✅ 3 篇文章详情页可访问
- ✅ Lighthouse 分数 > 70

**验收标准**：
- 访问 `https://www.wizpulseai.com/sitemap.xml` 正常显示
- 文章详情页无 TODO 标记
- PageSpeed Insights 测试通过

---

#### 📅 Day 7: Week 1 验收和部署（开发 + CEO）

**任务**：
- [ ] 代码 Review
- [ ] 部署到生产环境
- [ ] 提交 sitemap 到 Google Search Console
- [ ] Week 1 进度汇报

**汇报模板**：
```markdown
## Week 1 完成情况

### ✅ 已完成
- Schema 标记：3 个页面
- SEO Metadata：5 个页面
- sitemap.xml 生成
- 文章详情页：3 篇

### ⚠️ 遇到的问题
- [如有]

### 📊 初步数据
- Google 索引页面数：[查看 GSC]
- Lighthouse 分数：[分数]

### 🎯 Week 2 准备
- 内容改造清单已就绪
```

---

## Week 2: AEO 启动（11/18 - 11/24）

### 🎯 本周目标
- 改造 6 篇文章为 AEO 格式
- 添加 FAQ Schema
- 开始获取 Featured Snippet

### 任务清单

#### 📅 Day 8-9: 创建 AEO 内容模板（内容）

**负责人**：内容编辑
**工时**：8 小时

**任务**：
- [ ] 设计"AI 友好"文章模板

**模板结构**：
```markdown
# [问题式标题]

## 🎯 核心答案（30秒速读）

**Q: [用户问题]**

A: [简洁明了的答案，2-3 句话]

关键要点：
1. [要点1]
2. [要点2]
3. [要点3]

---

## 详细说明

### [H2: 子问题1]
[内容...]

### [H2: 子问题2]
[内容...]

---

## 常见问题（FAQ）

<details>
<summary>Q1: [问题]</summary>
A: [答案]
</details>

<details>
<summary>Q2: [问题]</summary>
A: [答案]
</details>

---

## 相关资源
- [内部链接1]
- [内部链接2]
```

- [ ] 创建 2 篇示例文章：
  1. "AIアシスタントとは？初心者のための入門ガイド"
  2. "How to create AI-powered presentations in 10 minutes"

**交付物**：
- ✅ 文章模板（Markdown）
- ✅ 2 篇示例文章

---

#### 📅 Day 10-11: 文章改造（内容）

**负责人**：内容编辑
**工时**：12 小时

**任务**：
- [ ] 改造现有 6 篇文章为 AEO 格式：

**日语文章**（3篇）：
1. AIとは何か？
2. 大規模言語モデルの基礎
3. プレゼン資料作成の魔法

**英语文章**（3篇）：
1. What is an AI assistant?
2. How to use AI writing tools
3. AI presentation best practices

**改造清单**（每篇文章）：
- [ ] 添加"核心答案"区块（顶部）
- [ ] H2/H3 改为问题式
- [ ] 添加 FAQ 区块（底部）
- [ ] 内部链接（至少 3 个）

**交付物**：
- ✅ 6 篇改造后的 Markdown 文件

---

#### 📅 Day 12-13: FAQ Schema 实现（开发 + 内容）

**负责人**：开发（4h）+ 内容（2h）

**开发任务**：
- [ ] 创建 `FAQPage` Schema 组件
  ```typescript
  export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
    return (
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>
    );
  }
  ```

**内容任务**：
- [ ] 为 6 篇文章各准备 5-8 个 FAQ
  - 格式：{ question: string, answer: string }[]

**交付物**：
- ✅ FAQSchema 组件代码
- ✅ 6 篇文章的 FAQ 数据

---

#### 📅 Day 14: Week 2 验收和测试（全员）

**任务**：
- [ ] 部署 6 篇改造后的文章
- [ ] 使用 [Rich Results Test](https://search.google.com/test/rich-results) 验证 FAQ Schema
- [ ] 手动测试 Google 搜索（7天后检查 Featured Snippet）

**验收标准**：
- 所有文章有"核心答案"区块
- FAQ Schema 验证通过
- 文章可读性良好（人工审阅）

**Week 2 汇报**：
```markdown
## Week 2 完成情况

### ✅ 已完成
- AEO 文章模板设计
- 6 篇文章改造完成（日3 + 英3）
- FAQ Schema 实现并验证

### 📊 初步测试
- Rich Results Test: [结果]
- 文章可读性评分: [评分]

### 🎯 预期 Featured Snippet
- 预计 1-2 周后出现
- 目标关键词：[列表]
```

---

## Week 3: GEO 布局（11/25 - 12/1）

### 🎯 本周目标
- 创建 "AI 信息页"
- 开始外部引用建设
- 首次 AI 引用测试

### 任务清单

#### 📅 Day 15-16: 创建 AI 信息页（内容 + 开发）

**负责人**：内容（4h）+ 开发（2h）

**内容任务**：
- [ ] 撰写 `/about/ai-info` 页面内容
  - wizPulseAI 是什么
  - 产品列表和功能
  - 关键数据（用户数、生成数）
  - 引用规范

**开发任务**：
- [ ] 创建页面路由
- [ ] 添加 `Organization` + `Product` Schema
- [ ] 确保页面 robots.txt 允许抓取

**交付物**：
- ✅ AI 信息页上线
- ✅ 内容准确、数据真实

**参考模板**：见《战略总览》文档中的示例

---

#### 📅 Day 17-18: 外部引用启动（运营）

**负责人**：运营/市场
**工时**：10 小时

**任务**：

**日语市场**（优先）：
- [ ] Yahoo!知恵袋：回答 5 个 AI 工具相关问题
  - 搜索："AIツール おすすめ"
  - 提供有价值的回答 + 自然提及 wizPulseAI

- [ ] 教えて!goo：回答 3 个问题

- [ ] Qiita（技术社区）：发布 1 篇技术文章
  - 标题："Next.js で AI プレゼンツールを作った話"
  - 内容：技术分享 + 产品介绍

**英语市场**：
- [ ] Product Hunt 准备（下周发布）
  - 撰写产品描述
  - 准备 Demo 视频
  - 设计 Product Icon

**交付物**：
- ✅ 至少 8 个外部提及/链接
- ✅ Product Hunt 发布材料准备完成

---

#### 📅 Day 19-20: 媒体公关（运营 + CEO）

**负责人**：运营 + CEO（联系决策）

**任务**：
- [ ] 联系日本科技媒体（3家）：
  1. TechCrunch Japan - 投稿创业故事
  2. ITmedia - 产品评测合作
  3. Publickey - 技术文章投稿

**邮件模板**（日语）：
```
件名：AI プレゼンツール「wizPulseAI」のご紹介

[媒体名] 編集部 様

初めまして、wizPulseAI の [你的名字] と申します。

弊社は日本市場向けの AI プレゼンテーション作成ツールを
開発しております。10分でプロフェッショナルなスライドを
生成できることが特徴です。

貴媒体の読者様に有益な情報になると考え、
ご紹介のご連絡をさせていただきました。

製品概要：[...]
デモビデオ：[...]

ご検討いただけますと幸いです。

よろしくお願いいたします。
```

**目标**：
- 至少 1 家媒体回复
- 可能的报道/提及

---

#### 📅 Day 21: Week 3 验收 + 首次 AI 测试（运营 + CEO）

**AI 引用测试**：

**测试清单**（20 个标准问题）：

```markdown
### 日语测试（10个）
1. "日本で使えるAIプレゼンツールを教えて"
2. "AIでスライドを作る方法"
3. "wizPulseAI とは何ですか？"
4. "プレゼン資料 AI 自動作成"
5. "AIアシスタント おすすめ"
6. ... [继续5个]

### 英语测试（10个）
1. "Best AI presentation tools in 2025"
2. "How to create slides with AI"
3. "What is wizPulseAI?"
4. "AI-powered presentation generators"
5. ... [继续6个]
```

**测试 AI 平台**：
- [ ] ChatGPT-4
- [ ] Claude (Sonnet 3.5)
- [ ] Perplexity.ai
- [ ] Google SGE（如可用）

**记录格式**：
```
| 平台 | 问题 | 提及 wizPulseAI？ | 排名位置 | 描述准确性 |
|------|------|------------------|---------|-----------|
| ChatGPT | "Best AI..." | ❌ | - | - |
| Claude | "日本で..." | ❌ | - | - |
```

**预期结果**：
- Week 3: 引用率 = 0-5%（正常，需要时间）
- Week 6: 引用率 = 10-15%
- Week 12: 引用率 = 30%+

**Week 3 汇报**：
```markdown
## Week 3 完成情况

### ✅ 外部引用
- Yahoo!知恵袋：5 个回答
- 教えて!goo：3 个回答
- Qiita：1 篇文章
- 媒体联系：3 家（等待回复）

### 📊 AI 引用测试（基线）
- 测试问题数：20
- 提及次数：[X]
- 引用率：[X]%

### 🎯 Week 4 目标
- 继续外部引用建设
- 监测数据变化
```

---

## Week 4: 监测优化（12/2 - 12/8）

### 🎯 本周目标
- 建立数据监测体系
- 优化表现不佳的内容
- Product Hunt 发布

### 任务清单

#### 📅 Day 22-23: 数据追踪设置（开发 + 运营）

**负责人**：开发（4h）+ 运营（2h）

**开发任务**：
- [ ] 配置 Google Analytics 4
  ```typescript
  // app/layout.tsx
  import { GoogleAnalytics } from '@next/third-parties/google';

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>{children}</body>
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </html>
    );
  }
  ```

- [ ] 添加关键事件追踪：
  - CTA 点击（"Try QuickSlide"）
  - 文章阅读时长
  - 外部链接点击
  - 注册开始/完成

**运营任务**：
- [ ] 创建数据监测 Dashboard（Google Data Studio）
  - 流量来源
  - 热门页面
  - 转化漏斗
  - AI 引用追踪表

**交付物**：
- ✅ GA4 配置完成
- ✅ Dashboard 可访问链接

---

#### 📅 Day 24-25: Product Hunt 发布（运营 + CEO）

**负责人**：运营主导 + CEO 参与

**任务**：
- [ ] Product Hunt 发布
  - 产品标题："wizPulseAI QuickSlide - Create stunning presentations with AI in 10 minutes"
  - Tagline："AI-powered presentation generator for busy professionals"
  - 首条评论：CEO 个人故事

- [ ] 社交媒体推广
  - Twitter/X 发布
  - LinkedIn 分享
  - Reddit (r/SideProject, r/InternetIsBeautiful)

**目标**：
- 获得 50+ upvotes
- 进入 Product Hunt 首页
- 获得外部链接和讨论

**CEO 参与**：
- 回复评论（至少 20 条）
- 分享到个人社交媒体

---

#### 📅 Day 26-27: 内容优化（内容 + 开发）

**负责人**：内容（4h）+ 开发（2h）

**基于 Week 3 数据优化**：

- [ ] 分析 Google Search Console 数据
  - 哪些页面有展示但点击率低？→ 优化 Meta Description
  - 哪些关键词排名 10-20？→ 优化内容
  - 哪些页面跳出率高？→ 改进内容质量

- [ ] 优化表现差的文章（2篇）
  - 增加内部链接
  - 添加图片/视频
  - 优化 H2/H3 标题

- [ ] 创建 2 篇新文章（基于数据发现的需求）

**交付物**：
- ✅ 优化报告
- ✅ 2 篇文章优化完成
- ✅ 2 篇新文章发布

---

#### 📅 Day 28: Month 1 总结和 Month 2 规划（全员）

**任务**：
- [ ] 召开 Month 1 复盘会议
- [ ] 制定 Month 2-3 计划

**Month 1 总结报告模板**：

```markdown
# WizPulseAI - Month 1 总结报告

## 📊 核心指标

| 指标 | 启动前 | Month 1 | 增长 |
|------|--------|---------|------|
| 月访问量 (PV) | 1,000 | [实际] | [%] |
| Google 索引页面 | ~5 | [实际] | [%] |
| Featured Snippet | 0 | [实际] | +[X] |
| 外部引用 | 0 | [实际] | +[X] |
| AI 引用率 | 0% | [实际] | [%] |
| 注册用户 | ~10/月 | [实际] | [%] |

## ✅ 完成情况

### Week 1: 技术基础
- [x] Schema 标记
- [x] SEO Metadata
- [x] sitemap.xml
- [x] 文章详情页

### Week 2: AEO 启动
- [x] 6 篇文章改造
- [x] FAQ Schema
- [ ] Featured Snippet（预计Week 6）

### Week 3: GEO 布局
- [x] AI 信息页
- [x] 外部引用：[X] 个
- [x] 媒体联系：[X] 家

### Week 4: 数据监测
- [x] GA4 配置
- [x] Product Hunt 发布
- [x] 首次优化迭代

## ⚠️ 遇到的问题

1. [问题描述]
   - 原因：[...]
   - 解决方案：[...]

2. [...]

## 🎯 Month 2-3 计划

### 重点方向
1. 继续扩大外部引用（目标：+100）
2. 创作 20 篇深度文章
3. 建立内容集群（3 个主题）
4. 提升 AI 引用率到 30%

### 资源需求
- 内容外包：$2,000（20 篇文章）
- SEO 工具：Ahrefs（$199/月）

## 💡 关键学习

- [学习1]
- [学习2]
- [...]

---

**会议时间**：[日期]
**参与者**：开发、内容、运营、CEO
```

---

## 📋 每周检查清单

### 周一：计划

- [ ] 查看本周任务清单
- [ ] 确认负责人和截止日期
- [ ] 同步资源需求

### 周三：中期检查

- [ ] 进度检查（是否按计划？）
- [ ] 遇到的阻碍
- [ ] 需要的支持

### 周五：周报

- [ ] 本周完成情况
- [ ] 下周任务预览
- [ ] 关键指标更新

---

## 🎯 30天后的成功标准

### 技术层面
- [x] Google 索引页面 > 50
- [x] Schema 标记覆盖率 = 100%
- [x] Lighthouse 分数 > 80
- [x] 页面加载时间 < 2s

### 内容层面
- [x] AEO 文章 ≥ 6 篇
- [x] Featured Snippet ≥ 1 个
- [x] 外部引用 ≥ 15 个

### 流量层面
- [x] 月访问量 > 3,000（3x）
- [x] 自然搜索流量 > 50%
- [x] 跳出率 < 60%

### GEO 层面
- [x] AI 信息页上线
- [x] AI 引用率 > 5%
- [x] 媒体提及 ≥ 1 篇

---

## 🚨 风险预警

### 如果进度延迟...

**Week 1 延迟**：
- 影响：后续所有任务延迟
- 应对：立即增加资源或砍掉非核心功能

**Week 2 延迟**：
- 影响：AEO 效果延后
- 应对：优先完成 3 篇文章（而非 6 篇）

**Week 3 延迟**：
- 影响：外部引用不足
- 应对：CEO 亲自联系关键媒体

**Week 4 延迟**：
- 影响：Month 2 计划受阻
- 应对：延长项目周期到 6 周

---

## 📞 联系方式

**项目负责人**：Claude AI
**紧急情况**：直接在对话中询问
**周报提交**：每周五 17:00

---

## ✅ 启动确认

- [ ] CEO 已批准预算和资源
- [ ] 团队成员已分配角色
- [ ] 工具账号已开通（GA4, GSC）
- [ ] 第一周任务已同步到日历

**启动日期**：_________________
**预计完成**：_________________

---

**文档版本**：v1.0
**最后更新**：2025-11-11
