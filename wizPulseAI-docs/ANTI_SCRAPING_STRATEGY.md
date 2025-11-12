# WizPulseAI 知识库反爬虫保护策略

**文档版本**: v1.0
**创建日期**: 2025-11-13
**适用范围**: www.wizpulseai.com 知识中心

---

## 📋 目录

1. [核心矛盾：SEO vs 反爬虫](#核心矛盾)
2. [四层保护体系](#四层保护体系)
3. [实施计划](#实施计划)
4. [技术实现代码](#技术实现代码)
5. [效果评估](#效果评估)

---

## 核心矛盾

### 问题定义

- ✅ **想要**：Google等搜索引擎爬取 → 获得SEO排名和流量
- ❌ **不想**：恶意爬虫批量爬取 → 保护知识产权

### 现实认知

> **完全防止爬取是不可能的**

**原因**：
1. Google能看到的内容，技术上任何人都能获取
2. 浏览器显示的内容都可以被复制
3. 反爬虫越强 → 用户体验越差 → SEO越受损

### 战略目标

**不是完全阻止，而是**：
1. 提高恶意爬取的成本（技术门槛）
2. 增加法律风险（威慑作用）
3. 给合法需求者付费渠道（商业模式）

---

## 四层保护体系

### Layer 1: 基础防护 ✅

**成本**：低 | **效果**：中 | **优先级**：P0（必须）

#### 1.1 robots.txt 管理

```txt
# 允许主流搜索引擎
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# 阻止 AI 训练爬虫
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: cohere-ai
Disallow: /

# 阻止通用爬虫
User-agent: *
Crawl-delay: 10
Disallow: /api/
Disallow: /admin/
Disallow: /*.pdf$
```

**效果**：遵守协议的爬虫会自动停止（约50%）

#### 1.2 版权声明

在每篇文章底部添加明确的版权声明组件：

```tsx
// components/CopyrightNotice.tsx
export function CopyrightNotice() {
  return (
    <div className="border-t pt-6 mt-12 text-sm text-gray-600 dark:text-gray-400">
      <h3 className="font-semibold mb-2">著作権について</h3>
      <p>
        本記事の著作権は<strong>WizPulseAI株式会社</strong>に帰属します。
        無断転載・複製・配布を禁じます。
      </p>
      <p className="mt-2">
        © 2025 WizPulseAI Inc. All rights reserved.
      </p>
      <p className="mt-2 text-xs text-red-600">
        ⚠️ 違反を発見した場合は legal@wizpulseai.com までご連絡ください。
      </p>
    </div>
  );
}
```

#### 1.3 服务条款（Terms of Service）

创建 `/terms` 页面，明确禁止：

**禁止行为**：
- ❌ 自动化爬取（Automated Scraping）
- ❌ 批量下载（Bulk Download）
- ❌ 商业转载（Commercial Reproduction）
- ❌ AI训练使用（AI Training without License）

**允许行为**：
- ✅ 个人学习引用（注明来源）
- ✅ 少量引用（Fair Use，不超过10%）
- ✅ API授权使用（付费许可）

---

### Layer 2: 技术防护 ⭐

**成本**：中（$20/月） | **效果**：高 | **优先级**：P1（推荐）

#### 2.1 Rate Limiting（速率限制）

**技术栈**：Vercel Middleware + Upstash Redis

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 配置：10次/10秒（普通用户足够，爬虫会被限制）
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit:knowledge-hub',
});

export async function middleware(request: NextRequest) {
  // 获取IP地址
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // 执行速率限制
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse('Too Many Requests. Please slow down.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  // 添加速率限制信息到响应头
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}

export const config = {
  matcher: [
    '/knowledge-hub/:path*',  // 保护知识库
    '/:locale/knowledge-hub/:path*',  // 保护多语言知识库
  ],
};
```

**Upstash 免费套餐**：
- 10,000 次请求/天
- 256MB 存储
- 完全够用

#### 2.2 浏览器指纹识别

检测可疑的爬虫行为：

```typescript
// lib/anti-scraping.ts
export interface BotDetectionResult {
  isBot: boolean;
  confidence: number; // 0-1
  reasons: string[];
}

export function detectBot(request: NextRequest): BotDetectionResult {
  const reasons: string[] = [];
  let suspicionScore = 0;

  const ua = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer');
  const acceptLanguage = request.headers.get('accept-language');
  const accept = request.headers.get('accept');

  // 检测1: User-Agent 黑名单（权重：0.5）
  const botPatterns = [
    /bot/i, /spider/i, /crawler/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java(?!script)/i,
    /httpx/i, /axios/i, /requests/i, /scrapy/i,
    /selenium/i, /phantomjs/i, /headless/i
  ];

  if (botPatterns.some(pattern => pattern.test(ua))) {
    reasons.push('User-Agent matches bot pattern');
    suspicionScore += 0.5;
  }

  // 检测2: 缺少关键 Header（权重：0.3）
  if (!referer && !acceptLanguage) {
    reasons.push('Missing Referer and Accept-Language headers');
    suspicionScore += 0.3;
  }

  // 检测3: Accept Header 异常（权重：0.2）
  if (!accept || !accept.includes('text/html')) {
    reasons.push('Suspicious Accept header');
    suspicionScore += 0.2;
  }

  // 检测4: User-Agent 过于简单（权重：0.3）
  if (ua.length < 20) {
    reasons.push('User-Agent too short');
    suspicionScore += 0.3;
  }

  return {
    isBot: suspicionScore > 0.5,
    confidence: Math.min(suspicionScore, 1),
    reasons,
  };
}
```

**集成到 Middleware**：

```typescript
export async function middleware(request: NextRequest) {
  // Bot检测
  const botDetection = detectBot(request);

  if (botDetection.isBot && botDetection.confidence > 0.7) {
    // 记录日志（可选）
    console.log(`[BOT DETECTED] IP: ${request.ip}, Reasons: ${botDetection.reasons.join(', ')}`);

    // 返回403或者降级内容
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 继续速率限制检查...
}
```

#### 2.3 内容水印（Watermarking）

在HTML中嵌入隐藏标记，用于追踪盗用来源：

```typescript
// lib/watermark.ts
export function addWatermark(
  content: string,
  metadata: {
    userId?: string;
    articleId: string;
    timestamp?: number;
  }
): string {
  const timestamp = metadata.timestamp ?? Date.now();
  const identifier = metadata.userId
    ? `user-${metadata.userId}`
    : `anonymous`;

  const fingerprint = `${identifier}:${metadata.articleId}:${timestamp}`;

  // 方法1: Base64编码的HTML注释（可追踪）
  const watermarkComment = `<!-- wm:${Buffer.from(fingerprint).toString('base64')} -->`;

  // 方法2: 零宽字符（不可见，难以删除）
  const invisible = fingerprint
    .split('')
    .map(c => `\u200B${c}\u200C`) // 零宽空格 + 零宽连接符
    .join('');

  // 方法3: 微小的CSS差异（统计指纹）
  const cssFingerprint = `<style>.wm-${timestamp % 1000} { }</style>`;

  return `${watermarkComment}${content}${invisible}${cssFingerprint}`;
}
```

**使用场景**：
- 发现内容被盗用时，通过水印追踪来源
- 法律诉讼时作为证据（证明是从你的网站复制的）

---

### Layer 3: 法律防护 ⚖️

**成本**：低 | **效果**：威慑强 | **优先级**：P0（必须）

#### 3.1 版权声明（已在Layer 1）

每篇文章底部明确标注版权所有权。

#### 3.2 服务条款（Terms of Service）

**创建页面**：`/terms`

**核心条款**：

```markdown
# 利用規約 / Terms of Service

## 1. 著作権

WizPulseAIの全てのコンテンツ（記事、画像、コードサンプル等）は、
WizPulseAI株式会社またはそのライセンサーが著作権を保有します。

## 2. 禁止事項

以下の行為を明示的に禁止します：

- 自動化ツールによるコンテンツの収集（スクレイピング）
- 大量ダウンロードまたはミラーリング
- 商用目的での無断転載
- AI学習データとしての無断使用

違反者には法的措置を講じる場合があります。

## 3. 許可される使用

以下は許可されます：

- 個人的な学習目的での閲覧
- 出典を明記した少量の引用（フェアユース）
- API ライセンス契約に基づく利用

## 4. 連絡先

legal@wizpulseai.com
```

#### 3.3 DMCA 通知メカニズム

**発見した場合の対応手順**：

1. **証拠収集**
   - スクリーンショット
   - URL記録
   - タイムスタンプ

2. **DMCA Takedown Notice 送信**
   - 侵害コンテンツをホストしているプラットフォームへ
   - テンプレート：https://www.dmca.com/

3. **Google 検索結果削除申請**
   - Google DMCA Dashboard: https://www.google.com/webmasters/tools/dmca-dashboard
   - 侵害検索結果を削除

4. **法律警告状送信**
   - 弁護士経由で警告
   - 損害賠償請求の可能性を示唆

---

### Layer 4: 商業策略 💰

**成本**：中-高 | **効果**：長期 | **優先級**：P2（将来）

#### 4.1 内容分級系統

```
┌─────────────────────────────────────────┐
│ 📖 免費層 (Free Tier)                    │
│ ・文章前 50% 內容                         │
│ ・基礎知識和概念                          │
│ ・SEO 優化重點                           │
│ ・完全公開，允許搜索引擎索引              │
└─────────────────────────────────────────┘
              ↓ 註冊登入
┌─────────────────────────────────────────┐
│ 👤 會員層 (Member Tier)                  │
│ ・完整文章內容                            │
│ ・高級案例和最佳實踐                      │
│ ・下載 PDF 版本                          │
│ ・無廣告體驗                              │
│ 💰 免費註冊                               │
└─────────────────────────────────────────┘
              ↓ 付費訂閱
┌─────────────────────────────────────────┐
│ 🏢 企業層 (Enterprise)                   │
│ ・API 訪問權限                            │
│ ・批量下載許可                            │
│ ・商業使用授權                            │
│ ・白標使用（Whitelabel）                  │
│ 💰 $500-5000/月                          │
└─────────────────────────────────────────┘
```

**實施方案**：

```tsx
// app/[locale]/knowledge-hub/[slug]/page.tsx
import { auth } from '@/lib/auth';

export default async function ArticlePage({ params }) {
  const session = await auth();
  const article = await getArticle(params.slug);

  // 免費用戶：只顯示50%
  const isFreeUser = !session;
  const contentToShow = isFreeUser
    ? article.content.slice(0, article.content.length * 0.5)
    : article.content;

  return (
    <div>
      <ArticleContent content={contentToShow} />

      {isFreeUser && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-bold mb-2">
            続きを読むには無料登録が必要です
          </h3>
          <p className="mb-4">
            登録すると、全ての記事を制限なく閲覧できます。
          </p>
          <Button href="/auth/register">
            無料で登録する
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### 4.2 API 授權平台

**合法爬取者的付費選項**：

```typescript
// API 授權示例
POST /api/content/license
{
  "company": "OpenAI",
  "purpose": "AI Training Dataset",
  "articles": ["what-is-llm", "prompt-engineering"],
  "duration": "1 year",
  "attribution": true
}

Response: {
  "licenseKey": "wiz_xxxxxxxxxxxxxxxx",
  "price": "$5,000/year",
  "terms": "Non-exclusive, attribution required, no sublicensing",
  "apiEndpoint": "https://api.wizpulseai.com/v1/content",
  "rateLimit": "1000 requests/hour"
}
```

**好處**：
- 合法需求者避免法律風險
- 創造營收流
- 建立行業標準和合作關係

---

## 實施計劃

### 階段1：立即實施（本週）⭐

**時間**：1-2天
**成本**：$0
**負責人**：開發團隊

**任務清單**：
- [ ] 更新 `public/robots.txt`（阻止 AI 訓練爬蟲）
- [ ] 創建 `components/CopyrightNotice.tsx` 組件
- [ ] 在所有文章底部添加版權聲明
- [ ] 創建 `/terms` 服務條款頁面
- [ ] 添加頁腳法律鏈接（Terms | Privacy | Legal）

**驗收標準**：
- ✅ robots.txt 包含 GPTBot、CCBot 等禁止規則
- ✅ 每篇文章都有版權聲明
- ✅ 服務條款頁面上線

**預期效果**：阻止 50-70% 的簡單爬蟲

---

### 階段2：中期優化（下月）⚙️

**時間**：1周
**成本**：$20/月（Upstash）
**負責人**：開發團隊

**任務清單**：
- [ ] 註冊 Upstash Redis（免費套餐）
- [ ] 實施 Rate Limiting Middleware
- [ ] 添加瀏覽器指紋識別
- [ ] 實施內容水印系統
- [ ] 配置監控和告警（Vercel Analytics）

**驗收標準**：
- ✅ 速率限制生效（10次/10秒）
- ✅ 可疑爬蟲被阻止（403錯誤）
- ✅ 每篇文章包含隱藏水印

**預期效果**：阻止 90-95% 的爬蟲，可追踪盜用者

---

### 階段3：長期戰略（未來）🚀

**時間**：2-3個月
**成本**：根據業務規模
**負責人**：產品 + 開發 + 法務

**任務清單**：
- [ ] 設計內容分級系統（Free vs Member）
- [ ] 開發用戶註冊和認證系統
- [ ] 創建 API 授權平台
- [ ] 建立合作夥伴計劃
- [ ] 聘請法律顧問處理侵權案件

**驗收標準**：
- ✅ 內容分級上線（50% 免費，50% 需註冊）
- ✅ API 授權系統可用
- ✅ 至少1個付費授權客戶

**預期效果**：商業化內容，創造營收，合法獲取數據

---

## 技術實現代碼

### 完整 Middleware 實現

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis 連接
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 速率限制配置
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit:knowledge-hub',
});

// Bot 檢測函數
function detectBot(request: NextRequest): { isBot: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let suspicionScore = 0;

  const ua = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer');
  const acceptLanguage = request.headers.get('accept-language');

  // 檢測 1: User-Agent 黑名單
  const botPatterns = [
    /bot/i, /spider/i, /crawler/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java(?!script)/i,
  ];

  if (botPatterns.some(pattern => pattern.test(ua))) {
    reasons.push('User-Agent matches bot pattern');
    suspicionScore += 0.5;
  }

  // 檢測 2: 缺少關鍵 Header
  if (!referer && !acceptLanguage) {
    reasons.push('Missing key headers');
    suspicionScore += 0.3;
  }

  return {
    isBot: suspicionScore > 0.5,
    reasons,
  };
}

export async function middleware(request: NextRequest) {
  // 1. Bot 檢測
  const botDetection = detectBot(request);

  if (botDetection.isBot) {
    console.log(`[BOT] ${request.ip}: ${botDetection.reasons.join(', ')}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. 速率限制
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(reset).toISOString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  // 3. 正常響應
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}

export const config = {
  matcher: [
    '/knowledge-hub/:path*',
    '/:locale/knowledge-hub/:path*',
  ],
};
```

---

## 效果評估

### SEO vs 反爬蟲平衡

| 方案 | SEO影響 | 反爬蟲效果 | 用戶體驗 | 推薦度 |
|------|---------|-----------|---------|-------|
| robots.txt | ✅ 無影響 | ⭐⭐ 中等 | ✅ 無影響 | ✅✅✅ 必須 |
| Rate Limiting | ✅ 無影響 | ⭐⭐⭐ 強 | ✅ 無影響 | ✅✅✅ 推薦 |
| 客戶端渲染 | ❌ 嚴重影響 | ⭐⭐⭐⭐ 很強 | ⚠️ 略慢 | ❌ 不推薦 |
| 指紋識別 | ✅ 無影響 | ⭐⭐⭐ 強 | ✅ 無影響 | ✅✅ 推薦 |
| 內容水印 | ✅ 無影響 | ⭐ 弱（追蹤用） | ✅ 無影響 | ✅✅ 推薦 |
| 登錄牆 | ❌ 中等影響 | ⭐⭐⭐⭐⭐ 極強 | ⚠️ 增加摩擦 | ⚠️ 慎用 |
| 內容分級 | ⚠️ 輕微影響 | ⭐⭐⭐⭐ 很強 | ✅ 激勵註冊 | ✅✅ 推薦 |

### 預期效果對比

| 階段 | 投入 | 阻止率 | 可追蹤 | 商業價值 |
|------|------|--------|--------|---------|
| 階段1（立即） | $0, 1天 | 50-70% | ❌ | 低 |
| 階段2（中期） | $20/月, 1週 | 90-95% | ✅ | 中 |
| 階段3（長期） | 按規模, 2-3月 | 98%+ | ✅ | 高 |

---

## 結論與建議

### 核心原則

> **不要試圖 100% 阻止爬取**

**正確策略**：
1. **讓合法用戶體驗最好** - SEO 優先，內容易於訪問
2. **讓惡意爬蟲成本最高** - 技術門檻 + 法律風險
3. **給合法需求者付費渠道** - 商業模式，合規獲取數據

### 針對 WizPulseAI 的推薦

**短期（本週）**：
1. ✅ 更新 robots.txt
2. ✅ 添加版權聲明
3. ✅ 創建服務條款

**中期（下月）**：
1. ⚙️ 實施 Rate Limiting
2. ⚙️ 添加指紋識別
3. ⚙️ 內容水印系統

**長期（未來）**：
1. 🚀 內容分級系統
2. 🚀 API 授權平台
3. 🚀 合作夥伴計劃

### 最重要的認知

**平衡點**：
- 不要為了防爬蟲而犧牲 SEO
- 不要為了防爬蟲而損害用戶體驗
- 接受"不可能完全防止"的現實
- 專注於提高惡意成本和法律威懾

---

**文檔維護**：
- 每季度審查一次策略有效性
- 根據實際數據調整參數
- 追蹤新興爬蟲工具並更新黑名單

---

**附錄**：
- [Upstash 快速開始指南](https://upstash.com/docs/redis/overall/getstarted)
- [DMCA 申請模板](https://www.dmca.com/)
- [Google 搜索移除請求](https://www.google.com/webmasters/tools/dmca-dashboard)

---

**最後更新**: 2025-11-13
**作者**: Claude AI
**審核**: 待審核
