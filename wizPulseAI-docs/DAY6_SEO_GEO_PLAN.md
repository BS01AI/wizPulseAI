# Day 6 SEO + GEO 完整执行方案

> 升级版：SEO + GEO（AI 概览/答案型搜索）都能吃到

---

## 0. 指标与预期修正

### Core Web Vitals (2024/3 更新)
- **LCP** < 2.5s
- **INP** < 200ms (已替换 FID)
- **CLS** < 0.1

### FAQ Schema 注意
- 可以写结构化数据
- 但不要把 KPI 设成"出 FAQ 富结果"
- Google 已限制 FAQ 富结果主要给政府/健康权威站点

---

## 1. 完整任务树

### P0 必做（当天上线即有效）

| # | 任务 | 说明 |
|---|------|------|
| 1 | OG 图片 | Open Graph + Twitter Card |
| 2 | App 截图 | Playwright 自动化 4张 |
| 3 | GSC + sitemap | 提交验证 |
| 4 | CWV 测试 | Lighthouse + PageSpeed + 线上数据 |
| 5 | FAQ/Help 页面 | 4语言 + JSON-LD |

### P1 强烈建议（GEO 的"被引用引擎"）

| # | 任务 | 说明 |
|---|------|------|
| 6 | 多语言 SEO 基建 | hreflang + canonical + lang/dir |
| 7 | "信任页"组合 | About / Contact / 特商法表记 / Terms / Privacy |
| 8 | 首页"答案块" | AI 摘要更爱抽的 3 块内容 |

### 首页答案块内容
- **这是什么**（1句结论）
- **怎么用**（3步）
- **怎么收费**（1句 + 链接到购买页）

---

## 2. Next.js App Router SEO 基建代码

### 2.1 layout.tsx：metadata + alternates + OG + Twitter

```typescript
// app/[locale]/layout.tsx
import type { Metadata } from "next";

const LOCALES = ["ja", "en", "zh-TW", "ar"] as const;
type Locale = (typeof LOCALES)[number];

const SITE = "https://magicoord.wizpulseai.com";

function localeToHreflang(locale: Locale) {
  if (locale === "zh-TW") return "zh-Hant";
  return locale;
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> }
): Promise<Metadata> {
  const { locale } = await params;

  const titleMap: Record<Locale, string> = {
    ja: "マジコーデ｜AIファッション分析・スタイル提案",
    en: "Magicoord | AI Fashion Analysis & Style Advice",
    "zh-TW": "Magicoord｜AI 穿搭分析與風格建議",
    ar: "Magicoord | تحليل أزياء بالذكاء الاصطناعي"
  };

  const descMap: Record<Locale, string> = {
    ja: "写真をアップロードするだけ。AIが体型・肌色・雰囲気に合わせて服装を提案します。",
    en: "Upload a photo. Get AI-powered outfit analysis and style recommendations.",
    "zh-TW": "上傳照片，AI 依體型/膚色/氛圍提供穿搭建議。",
    ar: "ارفع صورة واحصل على تحليل واقتراحات ستايل بالذكاء الاصطناعي."
  };

  const title = titleMap[locale];
  const description = descMap[locale];
  const url = `${SITE}/${locale}`;

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[localeToHreflang(l)] = `${SITE}/${l}`;
  }
  languages["x-default"] = `${SITE}/ja`;

  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: {
      canonical: url,
      languages
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Magicoord",
      locale: localeToHreflang(locale),
      images: [
        {
          url: `${SITE}/og/${locale}.png`,
          width: 1200,
          height: 628,
          alt: `${title} - OG Image`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE}/og/${locale}.png`]
    }
  };
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: Locale }
}) {
  const dir = params.locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={params.locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

### 2.2 OG 图片动态生成（Edge Runtime）

```typescript
// app/og/[locale]/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  const titleMap: Record<string, string> = {
    ja: "マジコーデ",
    en: "Magicoord",
    "zh-TW": "Magicoord",
    ar: "Magicoord"
  };

  const subtitleMap: Record<string, string> = {
    ja: "AIファッション分析・スタイル提案",
    en: "AI Fashion Analysis & Style Advice",
    "zh-TW": "AI 穿搭分析與風格建議",
    ar: "تحليل أزياء واقتراحات ستايل بالذكاء الاصطناعي"
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "628px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1020 0%, #2b1b5a 55%, #0b1020 100%)",
          color: "white"
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800 }}>
          {titleMap[locale] ?? "Magicoord"}
        </div>
        <div style={{ marginTop: 18, fontSize: 34, opacity: 0.9 }}>
          {subtitleMap[locale] ?? "AI Fashion Analysis"}
        </div>
        <div style={{ marginTop: 28, fontSize: 22, opacity: 0.75 }}>
          wizPulseAI
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
```

---

## 3. sitemap.xml + robots.txt

### 3.1 app/sitemap.ts

```typescript
import type { MetadataRoute } from "next";

const SITE = "https://magicoord.wizpulseai.com";
const LOCALES = ["ja", "en", "zh-TW", "ar"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/faq", "/pricing", "/about", "/contact", "/terms", "/privacy"];

  const items: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of routes) {
      items.push({
        url: `${SITE}/${locale}${r}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: r === "" ? 1 : 0.6
      });
    }
  }
  return items;
}
```

### 3.2 app/robots.ts

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://magicoord.wizpulseai.com/sitemap.xml"
  };
}
```

---

## 4. FAQ 页面 + JSON-LD

```typescript
// app/[locale]/faq/page.tsx
import Script from "next/script";

const FAQ: Record<string, Array<{ q: string; a: string }>> = {
  ja: [
    { q: "マジコーデは何ができますか？", a: "写真をもとに、AIが体型・肌色・雰囲気に合わせた服装の提案を行います。" },
    { q: "写真は保存されますか？", a: "分析のために処理しますが、原本は保持せず縮小版（サムネイル）のみ保存します。" },
    { q: "料金はどうなっていますか？", a: "ポイント制です。1pt=1円相当で、機能ごとにポイントを消費します。" },
    { q: "返金はできますか？", a: "デジタルサービスの性質上、原則として購入後の返金はできません。" },
    { q: "アカウント登録は必要ですか？", a: "はい、分析結果の保存やポイント管理のために必要です。" },
    { q: "対応言語は？", a: "日本語、英語、繁体中文、アラビア語の4言語に対応しています。" },
    { q: "分析にかかる時間は？", a: "通常10〜30秒で結果が表示されます。" },
    { q: "分析に使われるAIは？", a: "Google Gemini 2.5 Flash を使用しています。" },
    { q: "プライバシーは守られますか？", a: "はい、写真データは分析後に原本を削除し、サムネイルのみ安全に保存します。" },
    { q: "お問い合わせ方法は？", a: "フッターのお問い合わせリンクからご連絡ください。" }
  ],
  en: [
    { q: "What does Magicoord do?", a: "It analyzes your photo and provides AI-powered outfit and style recommendations based on your body type, skin tone, and atmosphere." },
    { q: "Is my photo stored?", a: "We process photos for analysis but only keep thumbnails, not the original images." },
    { q: "How does pricing work?", a: "We use a point system. 1pt ≈ ¥1, and each feature consumes points." },
    { q: "Can I get a refund?", a: "Due to the nature of digital services, refunds are generally not available after purchase." },
    { q: "Do I need to register?", a: "Yes, registration is required to save analysis results and manage points." },
    { q: "What languages are supported?", a: "Japanese, English, Traditional Chinese, and Arabic." },
    { q: "How long does analysis take?", a: "Results typically appear within 10-30 seconds." },
    { q: "What AI is used?", a: "We use Google Gemini 2.5 Flash." },
    { q: "Is my privacy protected?", a: "Yes, original photos are deleted after analysis, only thumbnails are securely stored." },
    { q: "How can I contact you?", a: "Please use the contact link in the footer." }
  ],
  "zh-TW": [
    { q: "Magicoord 可以做什麼？", a: "根據你的照片，AI 提供穿搭分析與風格建議。" },
    { q: "照片會被保存嗎？", a: "我們只保存縮圖，原圖分析後會刪除。" },
    { q: "如何收費？", a: "採用點數制，1點約等於1日圓，每項功能消耗對應點數。" },
    { q: "可以退款嗎？", a: "數位服務性質，購買後原則上不提供退款。" },
    { q: "需要註冊嗎？", a: "是的，需要註冊才能保存分析結果和管理點數。" },
    { q: "支援哪些語言？", a: "日語、英語、繁體中文、阿拉伯語。" },
    { q: "分析需要多久？", a: "通常10-30秒內顯示結果。" },
    { q: "使用什麼AI？", a: "使用 Google Gemini 2.5 Flash。" },
    { q: "隱私有保障嗎？", a: "有，原圖分析後刪除，只安全保存縮圖。" },
    { q: "如何聯繫？", a: "請使用頁尾的聯繫連結。" }
  ],
  ar: [
    { q: "ماذا يقدم Magicoord؟", a: "يحلل صورتك ويقترح توصيات ستايل وملابس بالذكاء الاصطناعي." },
    { q: "هل تُحفظ صوري؟", a: "نحتفظ فقط بالصور المصغرة، يتم حذف الصور الأصلية بعد التحليل." },
    { q: "كيف يعمل التسعير؟", a: "نظام نقاط. نقطة واحدة ≈ ين واحد." },
    { q: "هل يمكنني استرداد المبلغ؟", a: "نظراً لطبيعة الخدمات الرقمية، لا يتوفر استرداد بعد الشراء." },
    { q: "هل أحتاج للتسجيل؟", a: "نعم، التسجيل مطلوب لحفظ النتائج وإدارة النقاط." },
    { q: "ما اللغات المدعومة؟", a: "اليابانية والإنجليزية والصينية التقليدية والعربية." },
    { q: "كم يستغرق التحليل؟", a: "عادة 10-30 ثانية." },
    { q: "ما الذكاء الاصطناعي المستخدم؟", a: "نستخدم Google Gemini 2.5 Flash." },
    { q: "هل خصوصيتي محمية؟", a: "نعم، تُحذف الصور الأصلية بعد التحليل." },
    { q: "كيف أتواصل معكم؟", a: "يرجى استخدام رابط الاتصال في الفوتر." }
  ]
};

export default async function FAQPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const list = FAQ[locale] ?? FAQ.ja;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "24px" }}>
      <h1>FAQ</h1>

      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ marginTop: 18 }}>
        {list.map((x, idx) => (
          <section
            key={idx}
            style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}
          >
            <h3>{x.q}</h3>
            <p>{x.a}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
```

---

## 5. Playwright 截图脚本

```typescript
// scripts/screenshots.ts
import { chromium } from "playwright";

const BASE = "http://localhost:3000/ja";
const PAGES = [
  { path: "/", name: "01-home" },
  { path: "/result-demo", name: "02-result" },
  { path: "/pricing", name: "03-pricing" },
  { path: "/history", name: "04-history" }
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1290, height: 2796 },
    deviceScaleFactor: 2
  });

  for (const p of PAGES) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `./screenshots/${p.name}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();
```

---

## 6. GSC 配置建议

1. **用 Domain property**（DNS 验证）：覆盖所有子域/协议
2. **提交** `/sitemap.xml`
3. **上线后 24–72 小时**看索引与 CWV 报告（INP/LCP/CLS）

---

## 7. Fashion 站点当前路由结构

需要确认：
- [ ] 是否使用 `/{locale}/...` 路由
- [ ] 是否有语言自动跳转
- [ ] 首页/结果页真实路径

确认后可以直接生成"可复制进仓库的最终版"代码。

---

**最后更新**: 2025-12-16
