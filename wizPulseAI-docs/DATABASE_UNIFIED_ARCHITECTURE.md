# WizPulseAI 统一数据库架构设计

> **版本**: v1.0
> **创建日期**: 2025-12-03
> **状态**: 📋 设计中

---

## 1. 设计原则

### 1.1 核心理念

```
"一个用户，一个账户，多个产品，灵活付费"
```

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **统一用户** | 矩阵共享一套用户系统，SSO基础 |
| **统一账户** | 钱包概念，支持订阅+积分+按次等多种付费 |
| **隔离产品** | 每个App有独立表空间，互不干扰 |
| **易于扩展** | 新产品接入成本低，未来可拆分 |

### 1.3 付费模式分析

| 产品 | 付费模式 | 说明 |
|------|---------|------|
| **Dashboard** | 订阅制 | 月付/年付，解锁高级功能 |
| **Fashion Advisor** | 积分制 | 按次消费，10积分/次分析 |
| **QuickSlide** | 混合制？ | 订阅+积分补充包？ |
| **Research Assistant** | 待定 | 可能是订阅制 |

**结论**：需要支持多种付费模式共存

---

## 2. 架构总览

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用层 (Apps)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Fashion  │  │QuickSlide│  │ Research │  │  未来产品 │        │
│  │ Advisor  │  │          │  │ Assistant│  │          │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
├───────┼─────────────┼─────────────┼─────────────┼───────────────┤
│       │             │             │             │               │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐          │
│  │              产品数据层 (Product Data)             │          │
│  │  fashion.*    quickslide.*    research.*   ...    │          │
│  └─────────────────────┬─────────────────────────────┘          │
│                        │                                        │
├────────────────────────┼────────────────────────────────────────┤
│                        │                                        │
│  ┌─────────────────────▼─────────────────────────────┐          │
│  │              核心共享层 (Core Shared)              │          │
│  │                                                   │          │
│  │  用户系统    账户系统    配置系统    审计系统      │          │
│  │  users      accounts    configs     audit        │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        基础设施层                                │
│                    Supabase (PostgreSQL)                        │
│                    auth.users (内置)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Schema 规划

```
Supabase Database
│
├── auth (Supabase内置)
│   └── users                    # 认证用户
│
├── public (核心共享层)
│   ├── 用户系统
│   │   └── users                # 用户扩展信息
│   │
│   ├── 账户系统 (统一钱包)
│   │   ├── user_wallets         # 用户钱包（积分+订阅状态）
│   │   ├── wallet_transactions  # 统一交易流水
│   │   ├── subscriptions        # 订阅记录
│   │   └── credit_packages      # 积分包定义
│   │
│   ├── 产品注册系统
│   │   ├── ai_products          # AI产品注册表
│   │   ├── product_pricing      # 产品定价（积分消耗/订阅要求）
│   │   └── product_features     # 产品功能定义
│   │
│   ├── Stripe集成
│   │   ├── stripe_products      # Stripe产品同步
│   │   └── stripe_prices        # Stripe价格同步
│   │
│   ├── 权限系统
│   │   ├── resource_permissions # 资源权限
│   │   └── access_logs          # 访问日志
│   │
│   ├── API系统
│   │   ├── api_keys             # API密钥
│   │   └── api_usage            # API使用记录
│   │
│   ├── 配置系统
│   │   ├── site_config          # 站点配置
│   │   └── config_history       # 配置历史
│   │
│   └── 审计系统
│       └── audit_logs           # 审计日志
│
├── fashion (Fashion Advisor专属)
│   ├── user_profiles            # 时尚档案
│   ├── photos                   # 用户照片
│   ├── analyses                 # AI分析结果
│   ├── generated_outfits        # AI生成图
│   ├── storage_quotas           # 存储配额
│   └── personalization          # 个性化配置
│
├── quickslide (QuickSlide专属 - 未来)
│   ├── presentations            # 演示文稿
│   ├── slides                   # 幻灯片
│   ├── templates                # 模板库
│   └── exports                  # 导出记录
│
└── research (Research Assistant专属 - 未来)
    ├── projects                 # 研究项目
    ├── documents                # 文档
    ├── summaries                # AI摘要
    └── citations                # 引用管理
```

---

## 3. 核心共享层设计

### 3.1 用户系统

#### users - 用户扩展表

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  email CITEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- 角色和状态
  app_role TEXT DEFAULT 'user',  -- user/admin
  status TEXT DEFAULT 'active',   -- active/suspended/deleted

  -- 偏好设置
  preferred_language TEXT DEFAULT 'ja',
  timezone TEXT DEFAULT 'Asia/Tokyo',

  -- Stripe关联
  stripe_customer_id TEXT UNIQUE,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

COMMENT ON TABLE public.users IS '用户扩展信息表，与auth.users 1:1关联';
```

---

### 3.2 账户系统（统一钱包）

#### user_wallets - 用户钱包

```sql
CREATE TABLE public.user_wallets (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  -- 积分余额
  credits_balance INTEGER DEFAULT 0,
  credits_lifetime_earned INTEGER DEFAULT 0,   -- 历史获得总积分
  credits_lifetime_spent INTEGER DEFAULT 0,    -- 历史消费总积分

  -- 订阅状态（汇总）
  has_active_subscription BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',  -- free/pro/enterprise
  subscription_expires_at TIMESTAMPTZ,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_wallets IS '用户钱包，统一管理积分和订阅状态';
```

**设计说明**：
- `credits_balance`: 当前可用积分
- `subscription_tier`: 订阅层级，决定基础权限
- 积分和订阅可以共存，互补

---

#### wallet_transactions - 统一交易流水

```sql
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- 交易类型
  type TEXT NOT NULL,  -- 见下方枚举

  -- 金额信息
  credits_amount INTEGER,           -- 积分变动（正/负）
  money_amount DECIMAL(10,2),       -- 金额（用于记录实际支付）
  currency TEXT DEFAULT 'JPY',

  -- 关联信息
  product_code TEXT,                -- 关联产品（fashion/quickslide等）
  reference_type TEXT,              -- 关联类型（subscription/purchase/usage）
  reference_id TEXT,                -- 关联ID

  -- 描述
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Stripe关联
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交易类型枚举
COMMENT ON COLUMN public.wallet_transactions.type IS '
交易类型：
- subscription_payment: 订阅付款
- subscription_refund: 订阅退款
- credits_purchase: 积分购买
- credits_bonus: 积分赠送（新用户/活动）
- credits_usage: 积分消费
- credits_refund: 积分退还
- credits_expire: 积分过期
';

CREATE INDEX idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_tx_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_tx_product ON public.wallet_transactions(product_code);
```

**使用场景**：
```
Fashion分析消费10积分：
  type: credits_usage
  credits_amount: -10
  product_code: fashion
  reference_type: analysis
  reference_id: <analysis_id>

购买100积分包：
  type: credits_purchase
  credits_amount: +100
  money_amount: 980
  currency: JPY
  stripe_payment_intent_id: pi_xxx

订阅Pro套餐：
  type: subscription_payment
  money_amount: 1980
  currency: JPY
  reference_type: subscription
  reference_id: sub_xxx
```

---

#### subscriptions - 订阅记录

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- Stripe信息
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- 订阅信息
  tier TEXT NOT NULL,  -- free/pro/enterprise
  status TEXT NOT NULL,  -- active/canceled/past_due/trialing/paused

  -- 周期信息
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- 试用信息
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- 元数据
  metadata JSONB DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
```

---

#### credit_packages - 积分包定义

```sql
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 包信息
  code TEXT UNIQUE NOT NULL,      -- starter/standard/premium
  name TEXT NOT NULL,              -- 入门包/标准包/高级包
  description TEXT,

  -- 积分数量
  credits_amount INTEGER NOT NULL,  -- 包含积分数
  bonus_credits INTEGER DEFAULT 0,  -- 赠送积分

  -- 价格
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'JPY',
  stripe_price_id TEXT,

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  -- 限制
  max_purchase_per_user INTEGER,    -- 每用户最大购买次数（NULL=无限）

  -- 元数据
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始数据
INSERT INTO public.credit_packages (code, name, credits_amount, bonus_credits, price_amount, sort_order) VALUES
  ('starter', '入門パック', 50, 0, 490, 1),
  ('standard', 'スタンダード', 100, 10, 980, 2),
  ('premium', 'プレミアム', 300, 50, 2480, 3);
```

---

### 3.3 产品注册系统

#### ai_products - AI产品注册表

```sql
CREATE TABLE public.ai_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 产品标识
  code TEXT UNIQUE NOT NULL,       -- fashion/quickslide/research
  name TEXT NOT NULL,
  description TEXT,

  -- 部署信息
  subdomain TEXT UNIQUE,           -- fashion/quickslide
  product_url TEXT,

  -- 品牌归属
  brand TEXT,                      -- wizlife/wizbiz/独立品牌

  -- 图标
  icon_url TEXT,
  image_url TEXT,
  color_theme TEXT,                -- 主题色

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  is_beta BOOLEAN DEFAULT FALSE,
  launch_date DATE,

  -- 排序
  sort_order INTEGER DEFAULT 0,

  -- 元数据
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始数据
INSERT INTO public.ai_products (code, name, subdomain, brand, is_active) VALUES
  ('fashion', 'Fashion Advisor', 'fashion', 'wizlife', TRUE),
  ('quickslide', 'QuickSlide', 'quickslide', NULL, FALSE),
  ('research', 'Research Assistant', 'research', 'wizbiz', FALSE);
```

---

#### product_pricing - 产品定价表

```sql
CREATE TABLE public.product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL REFERENCES public.ai_products(code),

  -- 功能标识
  feature_code TEXT NOT NULL,       -- photo_analysis/outfit_generation/...
  feature_name TEXT NOT NULL,

  -- 定价方式
  pricing_type TEXT NOT NULL,       -- credits/subscription/free

  -- 积分消费（pricing_type = credits 时）
  credits_cost INTEGER,

  -- 订阅要求（pricing_type = subscription 时）
  required_tier TEXT,               -- pro/enterprise

  -- 免费配额
  free_quota_daily INTEGER,         -- 每日免费次数
  free_quota_monthly INTEGER,       -- 每月免费次数

  -- 订阅用户配额
  pro_quota_daily INTEGER,
  pro_quota_monthly INTEGER,
  enterprise_quota_daily INTEGER,
  enterprise_quota_monthly INTEGER,

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fashion Advisor 定价
INSERT INTO public.product_pricing
  (product_code, feature_code, feature_name, pricing_type, credits_cost, free_quota_daily)
VALUES
  ('fashion', 'photo_analysis', '穿搭分析', 'credits', 10, 1),
  ('fashion', 'outfit_generation', 'AI穿搭生成', 'credits', 20, 0),
  ('fashion', 'style_advice', '风格建议', 'credits', 5, 3);
```

**设计说明**：
- `pricing_type`: 决定该功能的付费方式
- `free_quota_*`: 所有用户每天/每月免费次数
- `*_quota_*`: 不同订阅层级的配额

---

### 3.4 新旧表对应关系

| 旧表 | 新表 | 变化 |
|------|------|------|
| `users` | `public.users` | 保持，微调字段 |
| `products` | `public.stripe_products` | 重命名，明确是Stripe数据 |
| `prices` | `public.stripe_prices` | 重命名 |
| `subscriptions` | `public.subscriptions` | 保持，增强字段 |
| `features` | `public.product_pricing` | 合并重设计 |
| `plan_features` | 移除 | 合并到product_pricing |
| `usage_records` | `public.wallet_transactions` | 合并到统一交易 |
| `ai_products` | `public.ai_products` | 保持，微调 |
| `resource_permissions` | `public.resource_permissions` | 保持 |
| `resource_access_logs` | `public.access_logs` | 简化 |
| `api_keys` | `public.api_keys` | 保持 |
| `api_key_usage` | `public.api_usage` | 简化 |
| `rate_limit_usage` | 移除 | 合并到api_usage |
| `site_config` | `public.site_config` | 保持 |
| `config_history` | `public.config_history` | 保持 |
| `audit_logs` | `public.audit_logs` | 保持 |

---

## 4. 产品专属层设计

### 4.1 Fashion Advisor (fashion.*)

```sql
-- 创建Schema
CREATE SCHEMA IF NOT EXISTS fashion;

-- 用户时尚档案
CREATE TABLE fashion.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  -- 基本信息
  body_type TEXT,
  skin_tone TEXT,
  preferred_styles TEXT[],
  favorite_colors TEXT[],

  -- 偏好设置
  advisor_persona TEXT DEFAULT 'friendly',
  tone_of_voice TEXT DEFAULT 'encouraging',
  default_context TEXT DEFAULT 'daily',

  -- 统计
  total_analyses INTEGER DEFAULT 0,
  total_generations INTEGER DEFAULT 0,

  -- 引导状态
  onboarding_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户照片
CREATE TABLE fashion.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- 存储信息
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,

  -- 照片元数据
  width INTEGER,
  height INTEGER,
  taken_at TIMESTAMPTZ,

  -- 分析状态
  analysis_status TEXT DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI分析结果
CREATE TABLE fashion.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  photo_id UUID REFERENCES fashion.photos(id),

  -- 分析结果
  body_type TEXT,
  skin_tone TEXT,
  current_style TEXT,
  style_keywords TEXT[],

  -- AI建议
  suggestions JSONB,
  color_palette JSONB,
  style_tips TEXT[],

  -- 场景信息
  outfit_context TEXT,
  season TEXT,

  -- AI配置
  ai_model TEXT,
  processing_time_ms INTEGER,

  -- 积分（记录用，实际扣除在wallet_transactions）
  credits_used INTEGER DEFAULT 10,
  transaction_id UUID REFERENCES public.wallet_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI生成图
CREATE TABLE fashion.generated_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  analysis_id UUID REFERENCES fashion.analyses(id),

  -- 生成配置
  generation_prompt TEXT,

  -- 生成结果
  image_url TEXT,
  thumbnail_url TEXT,

  -- 用户反馈
  user_liked BOOLEAN,
  user_rating INTEGER,

  -- AI配置
  ai_model TEXT DEFAULT 'dall-e-3',
  quality TEXT DEFAULT 'standard',

  -- 积分
  credits_used INTEGER DEFAULT 20,
  transaction_id UUID REFERENCES public.wallet_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储配额
CREATE TABLE fashion.storage_quotas (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),

  -- 配额限制
  max_photos INTEGER DEFAULT 100,
  max_storage_bytes BIGINT DEFAULT 52428800,  -- 50MB

  -- 当前使用
  current_photos INTEGER DEFAULT 0,
  current_storage_bytes BIGINT DEFAULT 0,

  -- 套餐类型（冗余，方便查询）
  plan_type TEXT DEFAULT 'free',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 个性化选项（配置数据）
CREATE TABLE fashion.personalization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  label_ja TEXT,
  label_en TEXT,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);
```

### 4.2 产品Schema隔离的好处

```
1. 命名空间清晰
   - fashion.photos vs quickslide.slides
   - 不会冲突

2. 权限管理方便
   - GRANT SELECT ON ALL TABLES IN SCHEMA fashion TO fashion_service;
   - 可以按产品授权

3. 未来拆分简单
   - pg_dump -n fashion > fashion_backup.sql
   - 整个Schema可以导出迁移

4. 查询明确
   - SELECT * FROM fashion.analyses WHERE user_id = ?
   - 一看就知道是Fashion的数据
```

---

## 5. 付费流程设计

### 5.1 积分消费流程

```
用户发起请求 (Fashion分析)
       │
       ▼
┌─────────────────────┐
│ 检查用户钱包余额     │
│ SELECT credits_balance FROM user_wallets
└──────────┬──────────┘
           │
     余额足够？
     ┌────┴────┐
     │         │
    YES       NO
     │         │
     ▼         ▼
┌─────────┐  返回错误
│执行业务  │  "积分不足"
│逻辑     │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ 扣除积分 (事务)      │
│ 1. UPDATE user_wallets SET credits_balance = credits_balance - 10
│ 2. INSERT INTO wallet_transactions (type='credits_usage', ...)
│ 3. INSERT INTO fashion.analyses (...)
└─────────────────────┘
```

### 5.2 订阅检查流程

```
用户访问高级功能
       │
       ▼
┌─────────────────────┐
│ 检查订阅状态         │
│ SELECT subscription_tier FROM user_wallets
└──────────┬──────────┘
           │
     订阅层级足够？
     ┌────┴────┐
     │         │
    YES       NO
     │         │
     ▼         ▼
┌─────────┐  检查是否有积分可用
│允许访问  │      │
└─────────┘  ┌───┴───┐
             │       │
            YES     NO
             │       │
             ▼       ▼
         扣积分   返回升级提示
```

### 5.3 混合模式示例

```
QuickSlide 可能的定价：

基础功能（所有用户）：
- 创建演示文稿: 免费
- 基础模板: 免费

高级功能（订阅用户）：
- 高级模板: 需要Pro订阅
- 自定义品牌: 需要Pro订阅

AI功能（积分制）：
- AI生成幻灯片: 15积分/张
- AI优化排版: 5积分/次

Pro订阅用户：
- 每月赠送100积分
- AI功能8折消耗
```

---

## 6. 迁移计划

### 6.1 迁移步骤

```
Phase 1: 准备工作
├── 备份现有数据库
├── 创建新Schema
└── 创建新核心表（不删旧表）

Phase 2: 数据迁移
├── 迁移users数据
├── 创建user_wallets（基于现有数据）
├── 迁移ai_products
└── 迁移site_config

Phase 3: Fashion数据
├── 创建fashion schema
├── 导入Fashion表结构
└── 迁移Fashion数据（如有）

Phase 4: 清理
├── 验证新表数据
├── 更新应用代码
├── 删除旧表
└── 优化索引

Phase 5: 安全修复
├── 修复27个函数search_path
├── 修复RLS策略
└── 清理未使用索引
```

### 6.2 时间估算

| 阶段 | 工作量 | 风险 |
|------|--------|------|
| Phase 1 | 2-3小时 | 低 |
| Phase 2 | 1-2小时 | 中 |
| Phase 3 | 1-2小时 | 低 |
| Phase 4 | 2-3小时 | 高 |
| Phase 5 | 1-2小时 | 中 |
| **总计** | **7-12小时** | |

---

## 7. 表数量对比

### 7.1 现状 vs 新设计

| 分类 | 现有表数 | 新设计表数 | 变化 |
|------|---------|-----------|------|
| 核心共享 | 17 | 14 | -3（合并） |
| Fashion专属 | 0 | 6 | +6（新增） |
| QuickSlide专属 | 0 | 4 | +4（未来） |
| Research专属 | 0 | 4 | +4（未来） |
| **总计** | **17** | **28** | +11 |

### 7.2 核心表清单

```
public.users                 # 用户
public.user_wallets          # 钱包
public.wallet_transactions   # 交易流水
public.subscriptions         # 订阅
public.credit_packages       # 积分包
public.ai_products           # AI产品注册
public.product_pricing       # 产品定价
public.stripe_products       # Stripe产品
public.stripe_prices         # Stripe价格
public.resource_permissions  # 权限
public.access_logs           # 访问日志
public.api_keys              # API密钥
public.api_usage             # API使用
public.site_config           # 配置
public.config_history        # 配置历史
public.audit_logs            # 审计

fashion.user_profiles        # 时尚档案
fashion.photos               # 照片
fashion.analyses             # 分析
fashion.generated_outfits    # 生成图
fashion.storage_quotas       # 存储配额
fashion.personalization_options # 个性化
```

---

## 8. 决策点

### 需要确认的决策

| # | 决策点 | 选项 | 建议 |
|---|--------|------|------|
| 1 | 使用Schema隔离还是表前缀 | A.Schema B.前缀 | A.Schema |
| 2 | 积分是否有有效期 | A.永久 B.有效期 | A.永久（简化） |
| 3 | 订阅用户是否赠送积分 | A.是 B.否 | A.是（每月赠送） |
| 4 | Fashion现有数据如何处理 | A.迁移 B.重建 | 看数据量 |
| 5 | 迁移时机 | A.立即 B.等功能完善 | B.准备好再做 |

---

## 9. 总结

### 9.1 核心优势

1. **统一用户体验** - 一个账户走遍矩阵
2. **灵活付费** - 订阅+积分+按次，产品自选
3. **易于扩展** - 新产品只需添加Schema
4. **未来可拆** - Schema级别隔离，迁移方便

### 9.2 下一步

1. [ ] 确认上述决策点
2. [ ] 确认Fashion站点当前数据库情况
3. [ ] 生成迁移SQL脚本
4. [ ] 在开发环境测试迁移
5. [ ] 更新应用代码
6. [ ] 生产环境执行

---

*文档维护：Claude Code AI*
*最后更新：2025-12-03*
