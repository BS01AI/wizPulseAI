# WizPulseAI 扩展系统设计方案 (Extension System)

## 文档版本
- **版本**: v1.0
- **创建日期**: 2025-11-17
- **作者**: Claude (AI Assistant)
- **状态**: 设计阶段

---

## 1. 执行摘要

### 1.1 目标
建立可插拔的扩展系统，支持快速切换第三方服务供应商（Payment、Analytics、Email），将切换成本从 **3-5天** 降低到 **30分钟**。

### 1.2 当前问题
- **16个文件** 直接调用 Stripe API
- **无统一接口抽象**，供应商逻辑散落各处
- **切换供应商需要修改所有文件**
- **无法支持多供应商并存**（AB测试场景）

### 1.3 核心价值
1. **解耦**: 业务逻辑与供应商实现分离
2. **可测试**: 支持Mock Provider进行测试
3. **灵活性**: 运行时切换供应商（环境变量配置）
4. **可扩展**: 添加新供应商只需实现接口

### 1.4 MVP范围（Phase 1）
- **Payment 扩展系统**（Stripe → 统一接口）
- **向后兼容**（不破坏现有功能）
- **配置驱动**（环境变量选择供应商）
- **完整测试覆盖**（单元测试 + 集成测试）

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
│  (API Routes, Components, Business Logic)               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Uses Unified Interface
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Extension Registry                     │
│  - Provider Selection (from config)                     │
│  - Provider Instance Management                         │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┬─────────────┐
        ▼                   ▼             ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Payment    │    │  Analytics   │    │    Email     │
│  Extension   │    │  Extension   │    │  Extension   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
   ┌───┴────┬────┐      ┌──┴──┬───┐       ┌───┴──┬────┐
   ▼        ▼    ▼      ▼     ▼   ▼       ▼      ▼    ▼
Stripe  PayPal  LS   Vercel  GA  Pl    Resend  SG  SES
```

**图例**:
- LS = Lemon Squeezy
- GA = Google Analytics  
- Pl = Plausible
- SG = SendGrid
- SES = AWS SES

### 2.2 目录结构

```
db-wizPulseAI-com/
├── src/
│   ├── extensions/                          # 新增扩展系统核心目录
│   │   ├── index.ts                         # 统一导出
│   │   ├── registry.ts                      # 扩展注册中心
│   │   ├── config.ts                        # 扩展配置管理
│   │   │
│   │   ├── payment/                         # Payment 扩展 (Phase 1)
│   │   │   ├── index.ts                     # Payment 统一导出
│   │   │   ├── types.ts                     # Payment 接口定义
│   │   │   ├── base.ts                      # Payment 基类
│   │   │   ├── factory.ts                   # Payment Provider 工厂
│   │   │   │
│   │   │   ├── providers/                   # Payment 供应商实现
│   │   │   │   ├── stripe/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── stripe.provider.ts   # Stripe 实现
│   │   │   │   │   ├── stripe.config.ts     # Stripe 配置
│   │   │   │   │   ├── stripe.types.ts      # Stripe 类型
│   │   │   │   │   └── __tests__/
│   │   │   │   │       └── stripe.test.ts
│   │   │   │   │
│   │   │   │   ├── paypal/                  # PayPal 实现 (待实现)
│   │   │   │   ├── lemon-squeezy/           # Lemon Squeezy (待实现)
│   │   │   │   └── mock/                    # Mock Provider (测试用)
│   │   │   │       └── mock.provider.ts
│   │   │   │
│   │   │   └── __tests__/                   # Payment 扩展集成测试
│   │   │       ├── payment.integration.test.ts
│   │   │       └── provider-switching.test.ts
│   │   │
│   │   ├── analytics/                       # Analytics 扩展 (Phase 2)
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── providers/
│   │   │       ├── vercel/
│   │   │       ├── google-analytics/
│   │   │       └── plausible/
│   │   │
│   │   └── email/                           # Email 扩展 (Phase 3)
│   │       ├── index.ts
│   │       ├── types.ts
│   │       └── providers/
│   │           ├── resend/
│   │           ├── sendgrid/
│   │           └── aws-ses/
│   │
│   ├── lib/
│   │   ├── stripe.ts                        # 保留（向后兼容层）
│   │   └── extensions.ts                    # 扩展系统便捷导出
│   │
│   └── app/api/
│       ├── webhooks/
│       │   └── payment/                     # 新的统一 Webhook 路由
│       │       └── route.ts                 # 支持多供应商
│       └── subscriptions/
│           ├── checkout/route.ts            # 迁移到使用扩展系统
│           ├── portal/route.ts
│           └── [id]/
│               ├── cancel/route.ts
│               └── reactivate/route.ts
│
├── .env.local                               # 环境变量配置
└── docs/
    └── extensions/                          # 扩展系统文档
        ├── QUICK_START.md                   # 快速上手
        ├── MIGRATION_GUIDE.md               # 迁移指南
        ├── ADDING_PROVIDERS.md              # 添加新供应商
        └── API_REFERENCE.md                 # API 参考
```

---

## 3. 核心接口设计

### 3.1 Payment Extension 接口

```typescript
// src/extensions/payment/types.ts

/**
 * Payment Provider 统一接口
 * 所有支付供应商必须实现此接口
 */
export interface IPaymentProvider {
  /**
   * 供应商名称（唯一标识）
   */
  readonly name: PaymentProviderName;

  /**
   * 供应商配置
   */
  readonly config: PaymentProviderConfig;

  /**
   * 初始化供应商（验证配置、建立连接）
   */
  initialize(): Promise<void>;

  /**
   * 检查供应商是否可用
   */
  isAvailable(): boolean;

  // ==================== Checkout ====================
  
  /**
   * 创建结账会话
   * @returns 结账会话对象（包含 URL、sessionId 等）
   */
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;

  /**
   * 获取结账会话详情
   */
  getCheckoutSession(sessionId: string): Promise<CheckoutSession>;

  // ==================== Subscription ====================
  
  /**
   * 获取订阅详情
   */
  getSubscription(subscriptionId: string): Promise<Subscription>;

  /**
   * 取消订阅（在周期末）
   */
  cancelSubscription(subscriptionId: string): Promise<Subscription>;

  /**
   * 立即取消订阅
   */
  cancelSubscriptionImmediately(subscriptionId: string): Promise<Subscription>;

  /**
   * 重新激活订阅（取消已计划的取消）
   */
  reactivateSubscription(subscriptionId: string): Promise<Subscription>;

  /**
   * 更新订阅（变更套餐）
   */
  updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription>;

  // ==================== Customer Portal ====================
  
  /**
   * 创建客户门户会话（管理订阅、付款方式等）
   */
  createCustomerPortalSession(params: CreatePortalParams): Promise<PortalSession>;

  // ==================== Webhook ====================
  
  /**
   * 验证 Webhook 签名
   */
  verifyWebhookSignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<boolean>;

  /**
   * 解析 Webhook 事件
   */
  parseWebhookEvent(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<WebhookEvent>;

  /**
   * 处理 Webhook 事件（可选，提供默认实现）
   */
  handleWebhookEvent?(event: WebhookEvent): Promise<WebhookHandlerResult>;

  // ==================== Product & Price ====================
  
  /**
   * 同步产品到数据库
   */
  syncProduct(productId: string): Promise<Product>;

  /**
   * 同步价格到数据库
   */
  syncPrice(priceId: string): Promise<Price>;

  /**
   * 获取所有产品列表
   */
  listProducts(params?: ListProductsParams): Promise<Product[]>;

  /**
   * 获取所有价格列表
   */
  listPrices(params?: ListPricesParams): Promise<Price[]>;
}

// ==================== 类型定义 ====================

export type PaymentProviderName = 'stripe' | 'paypal' | 'lemon-squeezy' | 'mock';

export interface PaymentProviderConfig {
  name: PaymentProviderName;
  apiKey: string;
  webhookSecret?: string;
  apiVersion?: string;
  environment?: 'production' | 'sandbox' | 'test';
  [key: string]: any; // 允许供应商特定的配置
}

export interface CreateCheckoutParams {
  priceId: string;
  userId: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
  allowPromotionCodes?: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
  customerId?: string;
  subscriptionId?: string;
  status: 'open' | 'complete' | 'expired';
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  productId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  metadata?: Record<string, string>;
}

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing';

export interface UpdateSubscriptionParams {
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}

export interface CreatePortalParams {
  customerId: string;
  returnUrl?: string;
}

export interface PortalSession {
  id: string;
  url: string;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export type WebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'product.created'
  | 'product.updated'
  | 'price.created'
  | 'price.updated';

export interface WebhookHandlerResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string>;
  images?: string[];
}

export interface Price {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount: number;
  type: 'one_time' | 'recurring';
  interval?: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface ListProductsParams {
  active?: boolean;
  limit?: number;
}

export interface ListPricesParams {
  productId?: string;
  active?: boolean;
  limit?: number;
}
```

### 3.2 Payment Provider 基类

```typescript
// src/extensions/payment/base.ts

import { IPaymentProvider, PaymentProviderConfig } from './types';

/**
 * Payment Provider 抽象基类
 * 提供通用功能和默认实现
 */
export abstract class BasePaymentProvider implements IPaymentProvider {
  abstract readonly name: PaymentProviderName;
  protected _config: PaymentProviderConfig;
  protected _initialized: boolean = false;

  constructor(config: PaymentProviderConfig) {
    this._config = config;
  }

  get config(): PaymentProviderConfig {
    return this._config;
  }

  async initialize(): Promise<void> {
    if (this._initialized) {
      console.warn(`[${this.name}] Provider already initialized`);
      return;
    }

    this.validateConfig();
    await this.onInitialize();
    this._initialized = true;
    console.log(`[${this.name}] Provider initialized successfully`);
  }

  isAvailable(): boolean {
    return this._initialized && !!this._config.apiKey;
  }

  /**
   * 验证配置（子类可覆盖）
   */
  protected validateConfig(): void {
    if (!this._config.apiKey) {
      throw new Error(`[${this.name}] Missing required config: apiKey`);
    }
  }

  /**
   * 初始化钩子（子类可覆盖）
   */
  protected async onInitialize(): Promise<void> {
    // 默认空实现
  }

  /**
   * 确保已初始化
   */
  protected ensureInitialized(): void {
    if (!this._initialized) {
      throw new Error(`[${this.name}] Provider not initialized. Call initialize() first.`);
    }
  }

  // 抽象方法，子类必须实现
  abstract createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  abstract getCheckoutSession(sessionId: string): Promise<CheckoutSession>;
  abstract getSubscription(subscriptionId: string): Promise<Subscription>;
  abstract cancelSubscription(subscriptionId: string): Promise<Subscription>;
  abstract cancelSubscriptionImmediately(subscriptionId: string): Promise<Subscription>;
  abstract reactivateSubscription(subscriptionId: string): Promise<Subscription>;
  abstract updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription>;
  abstract createCustomerPortalSession(params: CreatePortalParams): Promise<PortalSession>;
  abstract verifyWebhookSignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<boolean>;
  abstract parseWebhookEvent(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<WebhookEvent>;
  abstract syncProduct(productId: string): Promise<Product>;
  abstract syncPrice(priceId: string): Promise<Price>;
  abstract listProducts(params?: ListProductsParams): Promise<Product[]>;
  abstract listPrices(params?: ListPricesParams): Promise<Price[]>;
}
```

### 3.3 Stripe Provider 实现（示例）

```typescript
// src/extensions/payment/providers/stripe/stripe.provider.ts

import Stripe from 'stripe';
import { BasePaymentProvider } from '../../base';
import {
  IPaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  Subscription,
  UpdateSubscriptionParams,
  CreatePortalParams,
  PortalSession,
  WebhookEvent,
  Product,
  Price,
  ListProductsParams,
  ListPricesParams,
} from '../../types';

export class StripePaymentProvider extends BasePaymentProvider {
  readonly name = 'stripe' as const;
  private stripe: Stripe | null = null;

  protected override async onInitialize(): Promise<void> {
    this.stripe = new Stripe(this._config.apiKey, {
      apiVersion: this._config.apiVersion || '2025-03-31.basil',
    });
  }

  private ensureStripe(): Stripe {
    this.ensureInitialized();
    if (!this.stripe) {
      throw new Error('[Stripe] Stripe instance not available');
    }
    return this.stripe;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const stripe = this.ensureStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: params.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      customer_email: params.customerEmail,
      subscription_data: params.trialPeriodDays
        ? { trial_period_days: params.trialPeriodDays }
        : undefined,
      allow_promotion_codes: params.allowPromotionCodes,
      metadata: {
        userId: params.userId,
        ...params.metadata,
      },
    });

    return {
      id: session.id,
      url: session.url!,
      customerId: session.customer as string | undefined,
      subscriptionId: session.subscription as string | undefined,
      status: session.status as any,
      metadata: session.metadata || undefined,
    };
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    const stripe = this.ensureStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      id: session.id,
      url: session.url!,
      customerId: session.customer as string | undefined,
      subscriptionId: session.subscription as string | undefined,
      status: session.status as any,
      metadata: session.metadata || undefined,
    };
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const stripe = this.ensureStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);

    return this.mapStripeSubscription(sub);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const stripe = this.ensureStripe();
    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return this.mapStripeSubscription(sub);
  }

  async cancelSubscriptionImmediately(subscriptionId: string): Promise<Subscription> {
    const stripe = this.ensureStripe();
    const sub = await stripe.subscriptions.cancel(subscriptionId);

    return this.mapStripeSubscription(sub);
  }

  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    const stripe = this.ensureStripe();
    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return this.mapStripeSubscription(sub);
  }

  async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription> {
    const stripe = this.ensureStripe();
    const updateParams: Stripe.SubscriptionUpdateParams = {};

    if (params.priceId) {
      const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
      updateParams.items = [
        {
          id: currentSub.items.data[0].id,
          price: params.priceId,
        },
      ];
    }

    if (params.cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = params.cancelAtPeriodEnd;
    }

    if (params.metadata) {
      updateParams.metadata = params.metadata;
    }

    const sub = await stripe.subscriptions.update(subscriptionId, updateParams);
    return this.mapStripeSubscription(sub);
  }

  async createCustomerPortalSession(params: CreatePortalParams): Promise<PortalSession> {
    const stripe = this.ensureStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async verifyWebhookSignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const stripe = this.ensureStripe();

    try {
      stripe.webhooks.constructEvent(rawBody, signature, secret);
      return true;
    } catch (error) {
      console.error('[Stripe] Webhook signature verification failed:', error);
      return false;
    }
  }

  async parseWebhookEvent(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): Promise<WebhookEvent> {
    const stripe = this.ensureStripe();

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    return {
      id: event.id,
      type: event.type as any,
      data: event.data.object,
      createdAt: new Date(event.created * 1000),
      metadata: (event.data.object as any).metadata,
    };
  }

  async syncProduct(productId: string): Promise<Product> {
    const stripe = this.ensureStripe();
    const product = await stripe.products.retrieve(productId);

    return {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      active: product.active,
      metadata: product.metadata,
      images: product.images,
    };
  }

  async syncPrice(priceId: string): Promise<Price> {
    const stripe = this.ensureStripe();
    const price = await stripe.prices.retrieve(priceId);

    return {
      id: price.id,
      productId: price.product as string,
      active: price.active,
      currency: price.currency,
      unitAmount: price.unit_amount || 0,
      type: price.type === 'recurring' ? 'recurring' : 'one_time',
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count,
      trialPeriodDays: price.recurring?.trial_period_days || undefined,
      metadata: price.metadata,
    };
  }

  async listProducts(params?: ListProductsParams): Promise<Product[]> {
    const stripe = this.ensureStripe();
    const products = await stripe.products.list({
      active: params?.active,
      limit: params?.limit,
    });

    return products.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      active: p.active,
      metadata: p.metadata,
      images: p.images,
    }));
  }

  async listPrices(params?: ListPricesParams): Promise<Price[]> {
    const stripe = this.ensureStripe();
    const prices = await stripe.prices.list({
      product: params?.productId,
      active: params?.active,
      limit: params?.limit,
    });

    return prices.data.map((p) => ({
      id: p.id,
      productId: p.product as string,
      active: p.active,
      currency: p.currency,
      unitAmount: p.unit_amount || 0,
      type: p.type === 'recurring' ? 'recurring' : 'one_time',
      interval: p.recurring?.interval,
      intervalCount: p.recurring?.interval_count,
      trialPeriodDays: p.recurring?.trial_period_days || undefined,
      metadata: p.metadata,
    }));
  }

  private mapStripeSubscription(sub: Stripe.Subscription): Subscription {
    return {
      id: sub.id,
      customerId: sub.customer as string,
      priceId: sub.items.data[0].price.id,
      productId: sub.items.data[0].price.product as string,
      status: sub.status as any,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
      metadata: sub.metadata,
    };
  }
}
```

### 3.4 扩展注册中心

```typescript
// src/extensions/registry.ts

import { PaymentProviderName, IPaymentProvider } from './payment/types';

/**
 * 扩展注册中心
 * 管理所有扩展的Provider实例
 */
class ExtensionRegistry {
  private paymentProviders = new Map<PaymentProviderName, IPaymentProvider>();
  private activePaymentProvider: PaymentProviderName | null = null;

  /**
   * 注册 Payment Provider
   */
  registerPaymentProvider(name: PaymentProviderName, provider: IPaymentProvider): void {
    if (this.paymentProviders.has(name)) {
      console.warn(`[Registry] Payment provider "${name}" already registered. Overwriting.`);
    }
    this.paymentProviders.set(name, provider);
    console.log(`[Registry] Payment provider "${name}" registered`);
  }

  /**
   * 设置活跃的 Payment Provider
   */
  setActivePaymentProvider(name: PaymentProviderName): void {
    if (!this.paymentProviders.has(name)) {
      throw new Error(`[Registry] Payment provider "${name}" not registered`);
    }
    this.activePaymentProvider = name;
    console.log(`[Registry] Active payment provider set to "${name}"`);
  }

  /**
   * 获取活跃的 Payment Provider
   */
  getPaymentProvider(name?: PaymentProviderName): IPaymentProvider {
    const providerName = name || this.activePaymentProvider;

    if (!providerName) {
      throw new Error('[Registry] No active payment provider set');
    }

    const provider = this.paymentProviders.get(providerName);

    if (!provider) {
      throw new Error(`[Registry] Payment provider "${providerName}" not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`[Registry] Payment provider "${providerName}" is not available`);
    }

    return provider;
  }

  /**
   * 列出所有已注册的 Payment Providers
   */
  listPaymentProviders(): PaymentProviderName[] {
    return Array.from(this.paymentProviders.keys());
  }

  /**
   * 获取活跃的 Payment Provider 名称
   */
  getActivePaymentProviderName(): PaymentProviderName | null {
    return this.activePaymentProvider;
  }

  /**
   * 清空注册表（主要用于测试）
   */
  clear(): void {
    this.paymentProviders.clear();
    this.activePaymentProvider = null;
  }
}

// 导出单例
export const extensionRegistry = new ExtensionRegistry();
```

### 3.5 配置管理

```typescript
// src/extensions/config.ts

import { PaymentProviderName, PaymentProviderConfig } from './payment/types';

/**
 * 从环境变量读取扩展配置
 */
export function getExtensionConfig() {
  return {
    payment: {
      activeProvider: (process.env.PAYMENT_PROVIDER || 'stripe') as PaymentProviderName,
      providers: {
        stripe: {
          name: 'stripe' as const,
          apiKey: process.env.STRIPE_SECRET_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          apiVersion: process.env.STRIPE_API_VERSION || '2025-03-31.basil',
          environment: process.env.NODE_ENV as 'production' | 'test',
        } as PaymentProviderConfig,
        paypal: {
          name: 'paypal' as const,
          apiKey: process.env.PAYPAL_CLIENT_ID || '',
          webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET,
          environment: (process.env.PAYPAL_MODE || 'sandbox') as 'production' | 'sandbox',
        } as PaymentProviderConfig,
        'lemon-squeezy': {
          name: 'lemon-squeezy' as const,
          apiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
          webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
        } as PaymentProviderConfig,
        mock: {
          name: 'mock' as const,
          apiKey: 'mock_api_key',
          environment: 'test' as const,
        } as PaymentProviderConfig,
      },
    },
  };
}

/**
 * 验证扩展配置
 */
export function validateExtensionConfig() {
  const config = getExtensionConfig();
  const errors: string[] = [];

  // 验证 Payment Provider 配置
  const activePaymentProvider = config.payment.activeProvider;
  const activePaymentConfig = config.payment.providers[activePaymentProvider];

  if (!activePaymentConfig) {
    errors.push(`Active payment provider "${activePaymentProvider}" has no configuration`);
  } else if (!activePaymentConfig.apiKey) {
    errors.push(`Active payment provider "${activePaymentProvider}" missing API key`);
  }

  if (errors.length > 0) {
    console.error('[Config] Extension configuration errors:', errors);
    return false;
  }

  console.log('[Config] Extension configuration validated successfully');
  return true;
}
```

### 3.6 Payment Factory

```typescript
// src/extensions/payment/factory.ts

import { extensionRegistry } from '../registry';
import { getExtensionConfig } from '../config';
import { IPaymentProvider, PaymentProviderName } from './types';
import { StripePaymentProvider } from './providers/stripe/stripe.provider';
// import { PayPalPaymentProvider } from './providers/paypal/paypal.provider'; // 未来实现
// import { LemonSqueezyPaymentProvider } from './providers/lemon-squeezy/lemon-squeezy.provider'; // 未来实现
import { MockPaymentProvider } from './providers/mock/mock.provider';

/**
 * 初始化 Payment 扩展系统
 */
export async function initializePaymentExtension(): Promise<void> {
  const config = getExtensionConfig();
  const { activeProvider, providers } = config.payment;

  console.log('[Payment] Initializing payment extension system...');

  // 注册所有可用的 Providers
  const providerMap: Record<PaymentProviderName, () => IPaymentProvider> = {
    stripe: () => new StripePaymentProvider(providers.stripe),
    paypal: () => {
      throw new Error('[Payment] PayPal provider not implemented yet');
      // return new PayPalPaymentProvider(providers.paypal);
    },
    'lemon-squeezy': () => {
      throw new Error('[Payment] Lemon Squeezy provider not implemented yet');
      // return new LemonSqueezyPaymentProvider(providers['lemon-squeezy']);
    },
    mock: () => new MockPaymentProvider(providers.mock),
  };

  // 只注册已配置的 Provider
  for (const [name, providerFactory] of Object.entries(providerMap)) {
    const providerName = name as PaymentProviderName;
    const providerConfig = providers[providerName];

    if (providerConfig?.apiKey) {
      try {
        const provider = providerFactory();
        await provider.initialize();
        extensionRegistry.registerPaymentProvider(providerName, provider);
      } catch (error) {
        console.error(`[Payment] Failed to initialize ${providerName} provider:`, error);
      }
    } else {
      console.log(`[Payment] Skipping ${providerName} provider (not configured)`);
    }
  }

  // 设置活跃的 Provider
  extensionRegistry.setActivePaymentProvider(activeProvider);

  console.log(`[Payment] Payment extension initialized with "${activeProvider}" provider`);
}

/**
 * 获取 Payment Provider（便捷函数）
 */
export function getPaymentProvider(name?: PaymentProviderName): IPaymentProvider {
  return extensionRegistry.getPaymentProvider(name);
}
```

---

## 4. 迁移策略

### 4.1 迁移步骤（Phase 1 - Stripe）

#### **Step 1: 创建扩展系统基础结构**（2小时）

```bash
# 创建目录
mkdir -p src/extensions/payment/providers/stripe/__tests__
mkdir -p src/extensions/payment/providers/mock

# 创建核心文件
touch src/extensions/index.ts
touch src/extensions/registry.ts
touch src/extensions/config.ts
touch src/extensions/payment/index.ts
touch src/extensions/payment/types.ts
touch src/extensions/payment/base.ts
touch src/extensions/payment/factory.ts
```

**文件内容**：
- 复制上述第3节的接口定义和基类代码
- 实现 Stripe Provider（从 `src/lib/stripe.ts` 迁移逻辑）
- 创建 Mock Provider（测试用）

#### **Step 2: 创建向后兼容层**（1小时）

```typescript
// src/lib/extensions.ts (新增便捷导出)

import { getPaymentProvider } from '@/extensions/payment/factory';

/**
 * 获取 Payment Provider（便捷导出）
 * 使用示例：
 *   import { payment } from '@/lib/extensions';
 *   const session = await payment.createCheckoutSession({ ... });
 */
export const payment = getPaymentProvider();

// 向后兼容：保留原有函数签名
export async function createCheckoutSession(params: any) {
  return payment.createCheckoutSession(params);
}

export async function createCustomerPortalSession(params: any) {
  return payment.createCustomerPortalSession(params);
}

export async function cancelSubscription(subscriptionId: string) {
  return payment.cancelSubscription(subscriptionId);
}

export async function reactivateSubscription(subscriptionId: string) {
  return payment.reactivateSubscription(subscriptionId);
}

export async function getSubscription(subscriptionId: string) {
  return payment.getSubscription(subscriptionId);
}

// 保留 stripe 实例导出（完全向后兼容）
export { stripe } from './stripe';
```

**修改 `src/lib/stripe.ts`**：
- 添加废弃警告（console.warn）
- 保留文件不删除（向后兼容）
- 在文件顶部添加注释：
  ```typescript
  /**
   * @deprecated 此文件已废弃，请使用 @/lib/extensions
   * 迁移指南：import { payment } from '@/lib/extensions';
   * 
   * 此文件仅用于向后兼容，未来版本将移除
   */
  ```

#### **Step 3: 初始化扩展系统**（30分钟）

```typescript
// src/app/layout.tsx 或 middleware.ts（服务器端初始化）

import { initializePaymentExtension } from '@/extensions/payment/factory';

// 在应用启动时初始化
if (typeof window === 'undefined') { // 仅服务器端
  initializePaymentExtension().catch((error) => {
    console.error('[App] Failed to initialize payment extension:', error);
  });
}
```

**环境变量配置**（`.env.local`）：
```bash
# Payment Provider Selection
PAYMENT_PROVIDER=stripe  # 'stripe' | 'paypal' | 'lemon-squeezy' | 'mock'

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_API_VERSION=2025-03-31.basil

# PayPal Configuration (未来)
# PAYPAL_CLIENT_ID=xxxxx
# PAYPAL_CLIENT_SECRET=xxxxx
# PAYPAL_MODE=sandbox

# Lemon Squeezy Configuration (未来)
# LEMON_SQUEEZY_API_KEY=xxxxx
```

#### **Step 4: 迁移 API 路由（分批进行）**（4小时）

**优先级 P0**（先迁移这些）：
1. `/api/subscriptions/checkout/route.ts`
2. `/api/webhooks/stripe/route.ts`（改名为 `/api/webhooks/payment/route.ts`）

**迁移示例**：

```typescript
// BEFORE: src/app/api/subscriptions/checkout/route.ts
import { createCheckoutSession, stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  if (!stripe) { ... }
  const session = await createCheckoutSession({ ... });
  return NextResponse.json({ url: session.url });
}

// AFTER: src/app/api/subscriptions/checkout/route.ts
import { payment } from '@/lib/extensions';

export async function POST(req: Request) {
  // 不再需要手动检查 stripe 是否可用（扩展系统自动处理）
  const session = await payment.createCheckoutSession({ ... });
  return NextResponse.json({ url: session.url });
}
```

**Webhook 路由迁移**：

```typescript
// BEFORE: src/app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(...);
  switch (event.type) {
    case 'checkout.session.completed': ...
  }
}

// AFTER: src/app/api/webhooks/payment/route.ts
import { payment } from '@/lib/extensions';

export async function POST(req: Request) {
  const event = await payment.parseWebhookEvent(
    await req.text(),
    req.headers.get('stripe-signature')!, // 未来支持多供应商签名头
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  // 事件处理逻辑不变
  switch (event.type) {
    case 'checkout.session.completed': ...
  }
}
```

**优先级 P1**（后续迁移）：
3. `/api/subscriptions/[id]/cancel/route.ts`
4. `/api/subscriptions/[id]/reactivate/route.ts`
5. `/api/subscriptions/portal/route.ts`

#### **Step 5: 测试验证**（3小时）

```bash
# 运行单元测试
npm test src/extensions/payment

# 运行集成测试
npm test src/app/api/subscriptions
npm test src/app/api/webhooks/payment

# 手动测试
# 1. 创建结账会话
# 2. 完成支付（使用 Stripe 测试卡）
# 3. 验证 Webhook 触发
# 4. 取消订阅
# 5. 重新激活订阅
```

**测试清单**：
- [ ] 创建结账会话成功
- [ ] Webhook 签名验证通过
- [ ] 订阅创建成功
- [ ] 订阅取消成功
- [ ] 订阅重新激活成功
- [ ] 客户门户会话创建成功
- [ ] 产品同步成功
- [ ] 价格同步成功
- [ ] 错误处理正确（无配置、网络错误等）
- [ ] 向后兼容（旧代码仍然工作）

#### **Step 6: 文档和部署**（2小时）

**创建文档**：
```bash
mkdir -p docs/extensions
touch docs/extensions/QUICK_START.md
touch docs/extensions/MIGRATION_GUIDE.md
touch docs/extensions/ADDING_PROVIDERS.md
touch docs/extensions/API_REFERENCE.md
```

**文档内容**：
- **QUICK_START.md**: 5分钟快速上手
- **MIGRATION_GUIDE.md**: 从旧代码迁移到扩展系统
- **ADDING_PROVIDERS.md**: 如何添加新的支付供应商
- **API_REFERENCE.md**: 完整 API 参考

**部署检查清单**：
- [ ] 环境变量已配置
- [ ] 扩展系统已初始化
- [ ] Webhook URL 已更新（Stripe Dashboard）
- [ ] 测试通过
- [ ] 文档已更新
- [ ] 团队已培训

### 4.2 回滚策略

**如果出现问题，可以快速回滚**：

1. **保留旧代码**：`src/lib/stripe.ts` 文件不删除
2. **环境变量切换**：
   ```bash
   # 回滚到旧代码
   USE_LEGACY_STRIPE=true
   ```
3. **条件导入**：
   ```typescript
   // src/lib/extensions.ts
   if (process.env.USE_LEGACY_STRIPE === 'true') {
     // 使用旧的 stripe.ts
     export * from './stripe';
   } else {
     // 使用新的扩展系统
     export { payment } from '@/extensions/payment/factory';
   }
   ```

**回滚步骤**：
1. 设置 `USE_LEGACY_STRIPE=true`
2. 重启应用
3. 验证功能正常
4. 调查新系统问题
5. 修复后移除回滚标志

### 4.3 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Webhook 签名验证失败 | 高 | 中 | 1. 完整的单元测试<br>2. 使用 Stripe CLI 本地测试<br>3. 保留旧 Webhook 路由作为备份 |
| 性能下降 | 中 | 低 | 1. Provider 实例缓存<br>2. 懒加载初始化<br>3. 性能测试对比 |
| 类型安全问题 | 中 | 低 | 1. 完整的 TypeScript 类型定义<br>2. 严格的类型检查<br>3. 单元测试覆盖 |
| 现有功能中断 | 高 | 低 | 1. 向后兼容层<br>2. 渐进式迁移<br>3. 完整的集成测试<br>4. 回滚策略 |
| 开发学习曲线 | 低 | 中 | 1. 详细文档<br>2. 示例代码<br>3. 团队培训 |

---

## 5. 时间估算

### 5.1 Phase 1: Payment 扩展系统（MVP）

| 任务 | 时间 | 累计 |
|------|------|------|
| **1. 设计和规划** | | |
| - 接口设计和架构评审 | 2h | 2h |
| - 文档编写（设计文档） | 2h | 4h |
| **2. 核心实现** | | |
| - 创建目录结构和基础文件 | 1h | 5h |
| - 实现核心接口和基类 | 2h | 7h |
| - 实现 Stripe Provider | 3h | 10h |
| - 实现 Mock Provider（测试用） | 1h | 11h |
| - 实现扩展注册中心 | 1h | 12h |
| - 实现配置管理 | 1h | 13h |
| **3. 向后兼容层** | | |
| - 创建便捷导出函数 | 1h | 14h |
| - 修改旧代码添加废弃警告 | 0.5h | 14.5h |
| **4. 迁移 API 路由** | | |
| - 迁移 checkout 路由 | 1h | 15.5h |
| - 迁移 webhook 路由 | 2h | 17.5h |
| - 迁移 cancel/reactivate 路由 | 1h | 18.5h |
| - 迁移 portal 路由 | 0.5h | 19h |
| **5. 测试** | | |
| - 编写单元测试 | 3h | 22h |
| - 编写集成测试 | 2h | 24h |
| - 手动测试和验证 | 2h | 26h |
| **6. 文档和部署** | | |
| - 编写用户文档 | 2h | 28h |
| - 团队培训和 Code Review | 2h | 30h |
| - 部署和监控 | 1h | 31h |
| **总计** | **31小时** | **约4个工作日** |

**时间估算说明**：
- **最佳情况**：3天（无阻塞，一次性通过）
- **预期情况**：4天（包含调试和小问题修复）
- **最坏情况**：5-6天（遇到重大技术问题需要重新设计）

### 5.2 Phase 2-3: Analytics & Email 扩展（未来）

| Phase | 功能 | 时间估算 | 说明 |
|-------|------|----------|------|
| Phase 2 | Analytics 扩展 | 2-3天 | - Vercel Analytics<br>- Google Analytics<br>- Plausible |
| Phase 3 | Email 扩展 | 2-3天 | - Resend<br>- SendGrid<br>- AWS SES |

**总时间估算**：
- Phase 1 (Payment): **4天**
- Phase 2 (Analytics): **3天**
- Phase 3 (Email): **3天**
- **完整扩展系统**: **10天**

---

## 6. 成功指标

### 6.1 技术指标

1. **代码质量**
   - [ ] TypeScript 编译无错误
   - [ ] ESLint 无警告
   - [ ] 单元测试覆盖率 > 80%
   - [ ] 集成测试覆盖核心流程

2. **性能指标**
   - [ ] Checkout API 响应时间 < 500ms（与旧代码持平）
   - [ ] Webhook 处理时间 < 200ms
   - [ ] 内存占用无明显增加

3. **兼容性**
   - [ ] 所有现有功能正常工作
   - [ ] 无需修改前端代码
   - [ ] Webhook 正确触发和处理

### 6.2 业务指标

1. **开发效率**
   - [ ] 添加新供应商时间 < 4小时
   - [ ] 切换供应商时间 < 30分钟（修改环境变量）

2. **可维护性**
   - [ ] 新成员理解架构时间 < 2小时
   - [ ] Bug 修复时间减少 50%

3. **灵活性**
   - [ ] 支持 AB 测试（多供应商并存）
   - [ ] 支持运行时切换供应商

---

## 7. 下一步行动

### 7.1 立即执行（今天）

1. **创建 Feature Branch**
   ```bash
   git checkout -b feature/extension-system-payment
   ```

2. **创建目录结构**
   ```bash
   mkdir -p src/extensions/payment/providers/stripe/__tests__
   # ... 其他目录
   ```

3. **实现核心接口**
   - 复制本文档第3节的代码
   - 创建 `types.ts`, `base.ts`, `registry.ts`

4. **实现 Stripe Provider**
   - 从 `src/lib/stripe.ts` 迁移逻辑
   - 实现 `IPaymentProvider` 接口

### 7.2 本周目标

- [ ] **Day 1**: 核心接口 + Stripe Provider 实现
- [ ] **Day 2**: 向后兼容层 + 迁移 2个 API 路由
- [ ] **Day 3**: 完成所有迁移 + 单元测试
- [ ] **Day 4**: 集成测试 + 文档 + 部署

### 7.3 验证清单

**开发完成前**：
- [ ] TypeScript 编译通过
- [ ] 所有测试通过（单元 + 集成）
- [ ] 手动测试完整流程（创建订阅 → 取消 → 重新激活）
- [ ] Webhook 测试通过（使用 Stripe CLI）
- [ ] Code Review 完成
- [ ] 文档完成

**部署到生产前**：
- [ ] 环境变量配置正确
- [ ] Webhook URL 已更新（Stripe Dashboard）
- [ ] 监控和日志已配置
- [ ] 回滚方案已准备
- [ ] 团队已通知和培训

---

## 8. 参考资源

### 8.1 学习资源

- **ShipAny 架构**: [参考开源项目 SaaS boilerplate]
- **Stripe API 文档**: https://stripe.com/docs/api
- **TypeScript 高级类型**: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
- **依赖注入模式**: https://en.wikipedia.org/wiki/Dependency_injection

### 8.2 相关文档

- `WORK_LOG.md` - 项目工作日志
- `LOCAL_TEST_GUIDE.md` - 本地测试指南
- `NEXT_STEPS.md` - 项目下一步计划

### 8.3 外部依赖

- `stripe` (npm): Stripe Node.js SDK
- `@supabase/supabase-js`: Supabase 客户端
- `@types/stripe`: Stripe TypeScript 类型定义

---

## 9. 附录

### 9.1 FAQ

**Q: 为什么不直接替换 Stripe，而是建立扩展系统？**
A: 扩展系统提供了更大的灵活性，支持未来快速切换供应商、AB测试、多供应商并存等场景。一次性投入，长期受益。

**Q: 扩展系统会增加复杂度吗？**
A: 初始设置会增加一些代码量，但长期来看会大幅简化维护。添加新供应商从3天降低到4小时。

**Q: 如何确保向后兼容？**
A: 保留旧的 `src/lib/stripe.ts` 文件，创建向后兼容层，所有旧代码无需修改即可继续工作。

**Q: 性能会受影响吗？**
A: 不会。Provider 实例会被缓存，额外的抽象层开销可以忽略不计（< 1ms）。

**Q: 如果出现问题如何回滚？**
A: 设置环境变量 `USE_LEGACY_STRIPE=true` 即可立即回滚到旧代码，无需重新部署。

### 9.2 术语表

- **Provider**: 提供特定功能的服务供应商（如 Stripe、PayPal）
- **Extension**: 扩展模块，封装特定领域的功能（如 Payment、Analytics）
- **Registry**: 注册中心，管理所有 Provider 实例
- **Factory**: 工厂模式，负责创建和初始化 Provider
- **Unified Interface**: 统一接口，所有 Provider 必须实现的标准契约

### 9.3 变更历史

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| v1.0 | 2025-11-17 | Claude AI | 初始版本，完整设计方案 |

---

**文档状态**: ✅ 已完成
**下一步**: 开始实施 Phase 1 (Payment 扩展系统)
