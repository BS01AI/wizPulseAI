# WizPulseAI 统一数据库架构设计 v2

> **版本**: v2.0
> **创建日期**: 2025-12-03
> **状态**: ✅ 确认版

---

## 1. 核心设计原则

### 1.1 一句话总结

```
"矩阵统一用户，App独立付费"
```

### 1.2 层级架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户层级                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Level 0: 游客（无注册）                                         │
│  └── 不可使用App功能，只能浏览                                   │
│                                                                 │
│  Level 1: 注册用户（免费）                                       │
│  └── 可使用App基础功能                                          │
│                                                                 │
│  Level 2: 订阅用户                                              │
│  ├── 矩阵订阅（wizPulseAI Pro）→ 解锁矩阵高级功能               │
│  └── App订阅（Fashion Pro）→ 解锁特定App高级功能                │
│                                                                 │
│  Level 3: App付费用户                                           │
│  └── App积分用户 → 按次消费（如Fashion积分）                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 关键决策

| 决策点 | 结论 |
|--------|------|
| 用户系统 | 矩阵统一，SSO |
| 矩阵订阅 | 未来实现，保持灵活 |
| App付费模式 | 每个App选一种（订阅OR积分） |
| 无注册用户 | 必须注册才能使用App |
| 积分归属 | App独立，不在矩阵层 |

---

## 2. 数据库架构

### 2.1 Schema规划

```
Supabase Database
│
├── auth (Supabase内置)
│   └── users                    # 认证用户
│
├── public (矩阵核心层)
│   │
│   ├── 【用户系统】
│   │   └── users                # 用户扩展信息
│   │
│   ├── 【矩阵订阅】(未来)
│   │   ├── matrix_subscriptions # 矩阵级订阅
│   │   └── matrix_subscription_tiers # 订阅层级定义
│   │
│   ├── 【产品注册】
│   │   └── ai_products          # App注册表
│   │
│   ├── 【Stripe集成】
│   │   ├── stripe_products      # Stripe产品
│   │   └── stripe_prices        # Stripe价格
│   │
│   ├── 【配置系统】
│   │   ├── site_config          # 站点配置
│   │   └── config_history       # 配置历史
│   │
│   └── 【审计系统】
│       └── audit_logs           # 审计日志
│
├── fashion (Fashion Advisor - 积分制)
│   ├── user_credits             # 积分余额
│   ├── credit_transactions      # 积分流水
│   ├── credit_packages          # 积分包定义
│   ├── user_profiles            # 时尚档案
│   ├── photos                   # 用户照片
│   ├── analyses                 # AI分析结果
│   ├── generated_outfits        # AI生成图
│   ├── storage_quotas           # 存储配额
│   └── personalization_options  # 个性化配置
│
├── quickslide (QuickSlide - 订阅制？待定)
│   ├── app_subscriptions        # App订阅
│   ├── presentations            # 演示文稿
│   ├── slides                   # 幻灯片
│   └── templates                # 模板
│
└── research (Research Assistant - 待定)
    └── ...
```

### 2.2 归属总结

| 层级 | Schema | 内容 | 付费模式 |
|------|--------|------|---------|
| 矩阵层 | `public` | 用户、配置、审计、产品注册 | 矩阵订阅(未来) |
| Fashion | `fashion` | 照片、分析、积分 | **积分制** |
| QuickSlide | `quickslide` | 演示、模板 | **订阅制**(待定) |
| Research | `research` | 项目、文档 | 待定 |

---

## 3. 核心表设计

### 3.1 矩阵核心层 (public.*)

#### users - 用户表

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  email CITEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- 角色
  app_role TEXT DEFAULT 'user',  -- user/admin

  -- 偏好
  preferred_language TEXT DEFAULT 'ja',
  timezone TEXT DEFAULT 'Asia/Tokyo',

  -- Stripe（矩阵级）
  stripe_customer_id TEXT UNIQUE,

  -- 矩阵订阅状态（未来使用）
  matrix_subscription_tier TEXT DEFAULT 'free',  -- free/pro/enterprise
  matrix_subscription_expires_at TIMESTAMPTZ,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

COMMENT ON TABLE public.users IS '矩阵用户表，所有App共享';
```

---

#### ai_products - App注册表

```sql
CREATE TABLE public.ai_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 标识
  code TEXT UNIQUE NOT NULL,       -- fashion/quickslide/research
  name TEXT NOT NULL,
  description TEXT,

  -- 部署
  subdomain TEXT UNIQUE,           -- fashion/quickslide
  product_url TEXT,

  -- 品牌
  brand TEXT,                      -- wizlife/wizbiz/null

  -- 付费模式
  billing_type TEXT NOT NULL,      -- credits/subscription/free

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  is_beta BOOLEAN DEFAULT FALSE,

  -- 排序
  sort_order INTEGER DEFAULT 0,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始数据
INSERT INTO public.ai_products (code, name, subdomain, brand, billing_type, is_active) VALUES
  ('fashion', 'Fashion Advisor', 'fashion', 'wizlife', 'credits', TRUE),
  ('quickslide', 'QuickSlide', 'quickslide', NULL, 'subscription', FALSE),
  ('research', 'Research Assistant', 'research', 'wizbiz', 'subscription', FALSE);
```

---

### 3.2 Fashion App层 (fashion.*)

#### fashion.user_credits - 积分余额

```sql
CREATE SCHEMA IF NOT EXISTS fashion;

CREATE TABLE fashion.user_credits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  -- 积分余额
  balance INTEGER DEFAULT 0,

  -- 统计
  lifetime_earned INTEGER DEFAULT 0,   -- 历史获得
  lifetime_spent INTEGER DEFAULT 0,    -- 历史消费

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fashion.user_credits IS 'Fashion App积分余额，独立于矩阵';
```

---

#### fashion.credit_transactions - 积分流水

```sql
CREATE TABLE fashion.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- 交易类型
  type TEXT NOT NULL,
  -- purchase: 购买积分
  -- bonus: 赠送（新用户/活动）
  -- usage: 消费
  -- refund: 退还

  -- 积分变动
  amount INTEGER NOT NULL,           -- 正数=增加，负数=扣除
  balance_after INTEGER NOT NULL,    -- 交易后余额

  -- 关联
  reference_type TEXT,               -- analysis/generation/package
  reference_id UUID,

  -- 描述
  description TEXT,

  -- Stripe（购买时）
  stripe_payment_intent_id TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fashion_tx_user ON fashion.credit_transactions(user_id);
CREATE INDEX idx_fashion_tx_created ON fashion.credit_transactions(created_at DESC);
```

---

#### fashion.credit_packages - 积分包定义

```sql
CREATE TABLE fashion.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 包信息
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- 积分
  credits_amount INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0,

  -- 价格
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'JPY',
  stripe_price_id TEXT,

  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始积分包
INSERT INTO fashion.credit_packages (code, name, credits_amount, bonus_credits, price_amount, sort_order) VALUES
  ('starter', '入門パック', 50, 0, 490, 1),
  ('standard', 'スタンダード', 100, 10, 980, 2),
  ('premium', 'プレミアム', 300, 50, 2480, 3);
```

---

#### fashion.user_profiles - 时尚档案

```sql
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

  -- 引导
  onboarding_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### fashion.photos - 用户照片

```sql
CREATE TABLE fashion.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- 存储
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,

  -- 元数据
  width INTEGER,
  height INTEGER,
  taken_at TIMESTAMPTZ,

  -- 分析状态
  analysis_status TEXT DEFAULT 'pending',  -- pending/analyzing/completed/failed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fashion_photos_user ON fashion.photos(user_id);
```

---

#### fashion.analyses - AI分析结果

```sql
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

  -- 场景
  outfit_context TEXT,
  season TEXT,

  -- AI配置
  ai_model TEXT,
  processing_time_ms INTEGER,

  -- 积分消费
  credits_used INTEGER DEFAULT 10,
  transaction_id UUID REFERENCES fashion.credit_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fashion_analyses_user ON fashion.analyses(user_id);
```

---

#### fashion.generated_outfits - AI生成图

```sql
CREATE TABLE fashion.generated_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  analysis_id UUID REFERENCES fashion.analyses(id),

  -- 生成配置
  generation_prompt TEXT,

  -- 结果
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
  transaction_id UUID REFERENCES fashion.credit_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### fashion.storage_quotas - 存储配额

```sql
CREATE TABLE fashion.storage_quotas (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),

  -- 配额
  max_photos INTEGER DEFAULT 100,
  max_storage_bytes BIGINT DEFAULT 52428800,  -- 50MB

  -- 当前使用
  current_photos INTEGER DEFAULT 0,
  current_storage_bytes BIGINT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### fashion.personalization_options - 个性化选项

```sql
CREATE TABLE fashion.personalization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,  -- advisor_persona/outfit_context/style_preference/tone_of_voice
  value TEXT NOT NULL,
  label_ja TEXT,
  label_en TEXT,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 初始数据
INSERT INTO fashion.personalization_options (category, value, label_ja, icon, display_order) VALUES
  -- 顾问角色
  ('advisor_persona', 'friendly', '親友', '😊', 1),
  ('advisor_persona', 'sarcastic', '毒舌', '😏', 2),
  ('advisor_persona', 'boyfriend', '彼氏視点', '👦', 3),
  ('advisor_persona', 'expert', '専門家', '👔', 4),
  -- 场景
  ('outfit_context', 'daily', 'デイリー', '📱', 1),
  ('outfit_context', 'date', 'デート', '💕', 2),
  ('outfit_context', 'interview', '面接', '💼', 3),
  ('outfit_context', 'party', 'パーティー', '🎉', 4);
```

---

## 4. 表清单总结

### 4.1 完整表清单

| Schema | 表名 | 说明 | 状态 |
|--------|------|------|------|
| **public** | users | 矩阵用户 | 保留改造 |
| | ai_products | App注册 | 保留改造 |
| | stripe_products | Stripe产品 | 重命名 |
| | stripe_prices | Stripe价格 | 重命名 |
| | site_config | 站点配置 | 保留 |
| | config_history | 配置历史 | 保留 |
| | audit_logs | 审计日志 | 保留 |
| **fashion** | user_credits | 积分余额 | 新建 |
| | credit_transactions | 积分流水 | 新建 |
| | credit_packages | 积分包 | 新建 |
| | user_profiles | 时尚档案 | 新建 |
| | photos | 照片 | 新建 |
| | analyses | 分析结果 | 新建 |
| | generated_outfits | 生成图 | 新建 |
| | storage_quotas | 存储配额 | 新建 |
| | personalization_options | 个性化 | 新建 |

### 4.2 删除的表

| 旧表 | 原因 |
|------|------|
| features | 合并到product_pricing或各App |
| plan_features | 不再需要 |
| usage_records | 移到各App的transactions |
| resource_permissions | 暂时不需要 |
| resource_access_logs | 暂时不需要 |
| api_keys | 暂时不需要 |
| api_key_usage | 暂时不需要 |
| rate_limit_usage | 暂时不需要 |

### 4.3 表数量

| 分类 | 数量 |
|------|------|
| public (矩阵层) | 7 |
| fashion (Fashion App) | 9 |
| **总计** | **16** |

---

## 5. 付费流程

### 5.1 Fashion 积分消费流程

```
用户点击"分析照片"
        │
        ▼
┌──────────────────┐
│ 检查是否已登录    │
└────────┬─────────┘
         │
    已登录？
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
检查积分     跳转登录页
    │
    ▼
┌──────────────────┐
│ SELECT balance    │
│ FROM fashion.user_credits
└────────┬─────────┘
         │
    余额 >= 10?
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
执行分析    显示"积分不足"
    │       → 引导购买
    ▼
┌──────────────────┐
│ 事务处理:         │
│ 1. 扣除积分       │
│ 2. 记录流水       │
│ 3. 保存分析结果   │
└──────────────────┘
```

### 5.2 Fashion 积分购买流程

```
用户选择积分包
        │
        ▼
创建Stripe Checkout Session
        │
        ▼
跳转Stripe支付页面
        │
        ▼
支付成功 → Webhook回调
        │
        ▼
┌──────────────────┐
│ 事务处理:         │
│ 1. 增加积分       │
│ 2. 记录流水       │
│ 3. 更新lifetime  │
└──────────────────┘
```

---

## 6. 迁移计划

### 6.1 阶段划分

```
Phase 1: 准备 (1-2小时)
├── 备份现有数据库
├── 创建fashion schema
└── 审查现有数据

Phase 2: 核心表改造 (2-3小时)
├── 改造users表
├── 重命名products→stripe_products
├── 重命名prices→stripe_prices
├── 更新ai_products
└── 删除不需要的表

Phase 3: Fashion表创建 (1-2小时)
├── 创建fashion.*全部表
├── 插入初始数据
└── 创建触发器

Phase 4: 安全修复 (1-2小时)
├── 修复函数search_path
├── 创建RLS策略
└── 测试权限

Phase 5: 验证 (1小时)
├── 数据验证
├── 功能测试
└── 清理临时数据
```

### 6.2 执行顺序

| 步骤 | 操作 | 风险 |
|------|------|------|
| 1 | 创建fashion schema | 低 |
| 2 | 创建fashion.*表 | 低 |
| 3 | 插入初始数据 | 低 |
| 4 | 改造public.users | 中 |
| 5 | 重命名Stripe表 | 中 |
| 6 | 删除旧表 | 高（需备份） |
| 7 | 修复安全问题 | 中 |

---

## 7. 未来扩展

### 7.1 新增App

当需要添加QuickSlide时：

```sql
-- 1. 创建Schema
CREATE SCHEMA quickslide;

-- 2. 如果是订阅制，创建订阅表
CREATE TABLE quickslide.app_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),
  tier TEXT DEFAULT 'free',  -- free/pro
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  ...
);

-- 3. 创建业务表
CREATE TABLE quickslide.presentations (...);
CREATE TABLE quickslide.slides (...);

-- 4. 注册到ai_products
INSERT INTO public.ai_products (code, name, billing_type)
VALUES ('quickslide', 'QuickSlide', 'subscription');
```

### 7.2 矩阵订阅（未来）

```sql
-- 当需要矩阵级订阅时
CREATE TABLE public.matrix_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES public.users(id),
  tier TEXT DEFAULT 'free',  -- free/pro/enterprise
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  ...
);

-- Pro用户权益（可配置）
CREATE TABLE public.matrix_subscription_benefits (
  tier TEXT NOT NULL,
  benefit_type TEXT NOT NULL,  -- discount/quota_boost/feature_unlock
  target_app TEXT,             -- fashion/quickslide/all
  value JSONB,
  ...
);
```

---

## 8. 总结

### 8.1 最终架构

```
┌─────────────────────────────────────────────────────────┐
│                    WizPulseAI 矩阵                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  public.* (矩阵核心层 - 7表)                             │
│  ├── users           # 统一用户                         │
│  ├── ai_products     # App注册                         │
│  ├── stripe_*        # Stripe集成                      │
│  ├── site_config     # 配置                            │
│  └── audit_logs      # 审计                            │
│                                                         │
│  fashion.* (Fashion App - 9表)                          │
│  ├── user_credits    # 积分系统                         │
│  ├── credit_*        # 积分流水/包                      │
│  ├── user_profiles   # 用户档案                         │
│  ├── photos          # 照片                            │
│  ├── analyses        # 分析                            │
│  └── ...                                               │
│                                                         │
│  quickslide.* (未来)                                    │
│  research.* (未来)                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 核心优势

1. **清晰分层** - 矩阵层 vs App层职责明确
2. **独立付费** - 每个App自己的付费系统
3. **易于扩展** - 新App只需新建Schema
4. **可拆分** - 未来可独立数据库
5. **简洁** - 16表 vs 原来17表（删除冗余）

---

*确认版本 - 2025-12-03*
