# WizPulseAI Dashboard 完整架构设计

**创建日期**: 2025-11-20
**版本**: v1.0
**目标**: 设计一个完整的SaaS Dashboard系统，支持用户管理、产品管理、订阅管理、权限控制

---

## 📊 当前数据库架构分析

### 核心表结构
```
users (用户表)
├── id (UUID)
├── email
├── full_name
├── app_role (角色: admin/user)
├── stripe_customer_id
├── preferred_language
├── avatar_url
└── created_at

products (产品表) ← Stripe同步
├── id
├── name
├── description
├── stripe_id
├── active
├── is_public
├── image
└── metadata

prices (价格表) ← Stripe同步
├── id
├── product_id → products.id
├── unit_amount (价格)
├── currency
├── interval (month/year)
├── type (one_time/recurring)
└── stripe_id

subscriptions (订阅表) ← Stripe Webhook
├── id
├── user_id → users.id
├── price_id → prices.id
├── status (active/canceled/past_due...)
├── current_period_end
├── stripe_id
└── metadata

features (功能表)
├── id
├── code (唯一标识)
├── name
├── description
├── monthly_limit (月限额)
├── unit (单位)
└── is_public

plan_features (套餐功能配置)
├── product_id → products.id
├── feature_id → features.id
├── monthly_quota (配额)
└── is_public

usage_records (使用记录)
├── id
├── user_id → users.id
├── feature_id → features.id
├── count (使用次数)
└── created_at
```

### ✅ 优势分析
1. **Stripe集成完善** - products/prices/subscriptions已与Stripe同步
2. **功能权限系统** - features + plan_features支持细粒度权限
3. **使用追踪** - usage_records支持配额管理
4. **可扩展** - metadata字段支持自定义数据

### ⚠️ 需要扩展的表
目前缺少以下表，需要创建：
1. **ai_products** - AI产品定义表（QuickSlide/CodeSpark等）
2. **resource_permissions** - 资源权限表（文章/教程访问权限）
3. **api_keys** - API密钥管理表
4. **team_members** - 团队成员表（如需团队功能）
5. **audit_logs** - 操作日志表（管理员审计）

---

## 🎯 Dashboard功能模块架构

### 一、用户视角功能 (User Dashboard)

#### 1.1 概览页面 (Overview)
**路由**: `/dashboard`
**权限**: 所有登录用户

**显示内容**：
- 📊 使用统计卡片
  - 本月API调用次数
  - 本月已用/剩余配额
  - 最近使用的功能
- 📈 使用趋势图表（7天/30天）
- 🎯 快速操作按钮
  - 升级套餐
  - 查看API文档
  - 访问AI产品
- 📢 最新通知/公告

**数据来源**：
- `usage_records` - 使用统计
- `subscriptions` - 当前套餐
- `plan_features` - 可用功能

**示例UI**：
```tsx
// src/app/dashboard/page.tsx
<DashboardOverview>
  <UsageStatsCards />
  <UsageTrendChart />
  <QuickActions />
  <RecentActivity />
</DashboardOverview>
```

---

#### 1.2 订阅管理 (Subscription)
**路由**: `/dashboard/subscription`
**权限**: 所有登录用户

**功能列表**：
1. **当前套餐信息**
   - 套餐名称（Free/Pro/Enterprise）
   - 价格和计费周期
   - 下次续费日期
   - 自动续费状态

2. **功能配额一览**
   ```
   功能            | 当前用量 | 配额     | 状态
   --------------|---------|---------|------
   API调用        | 850     | 1,000   | 85% 🟡
   知识库文章访问  | 5       | 无限制   | ✅
   QuickSlide生成 | 0       | 5       | 0% 🟢
   ```

3. **操作按钮**
   - ⬆️ 升级套餐（创建Stripe Checkout Session）
   - ⬇️ 降级套餐
   - 🔄 更改计费周期（月付/年付）
   - ❌ 取消订阅

4. **账单历史**
   - 过往发票列表
   - 下载PDF发票

**数据来源**：
- `subscriptions` - 订阅状态
- `prices` + `products` - 套餐详情
- `plan_features` + `features` - 功能配额
- `usage_records` - 当前用量
- Stripe API - 账单历史

**关键代码逻辑**：
```typescript
// 升级套餐流程
async function upgradePlan(newPriceId: string) {
  // 1. 检查用户是否已有订阅
  const currentSub = await getActiveSubscription(userId);

  if (currentSub) {
    // 2a. 已有订阅：使用Stripe Subscription Update
    await stripe.subscriptions.update(currentSub.stripe_id, {
      items: [{ id: currentSub.item_id, price: newPriceId }],
      proration_behavior: 'create_prorations' // 按比例计费
    });
  } else {
    // 2b. 无订阅：创建Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      line_items: [{ price: newPriceId, quantity: 1 }],
      mode: 'subscription'
    });
    return session.url;
  }
}
```

---

#### 1.3 使用统计 (Usage)
**路由**: `/dashboard/usage`
**权限**: 所有登录用户

**功能列表**：
1. **总览卡片**
   - 本月总调用次数
   - 平均每日使用量
   - 峰值日期和次数

2. **按功能分类统计**
   ```
   功能           | 本月使用 | 配额    | 百分比
   --------------|---------|--------|-------
   API调用        | 850     | 1,000  | 85%
   QuickSlide生成 | 3       | 5      | 60%
   知识库访问     | 25      | 无限制  | -
   ```

3. **时间趋势图表**
   - 7天/30天/90天切换
   - 按功能筛选
   - 导出CSV

**数据查询**：
```sql
-- 获取用户本月使用统计
SELECT
  f.name as feature_name,
  f.code as feature_code,
  COUNT(ur.id) as usage_count,
  pf.monthly_quota,
  ROUND(COUNT(ur.id) * 100.0 / NULLIF(pf.monthly_quota, 0), 2) as usage_percentage
FROM usage_records ur
JOIN features f ON ur.feature_id = f.id
JOIN subscriptions s ON s.user_id = ur.user_id
JOIN plan_features pf ON pf.product_id = s.prices.product_id AND pf.feature_id = f.id
WHERE ur.user_id = $1
  AND ur.created_at >= date_trunc('month', CURRENT_DATE)
  AND s.status = 'active'
GROUP BY f.name, f.code, pf.monthly_quota;
```

---

#### 1.4 设置页面 (Settings)
**路由**: `/dashboard/settings`
**权限**: 所有登录用户

**功能分类**：

**1. 个人资料 (Profile)**
- 头像上传
- 姓名修改
- 邮箱显示（不可修改，需通过Auth站点）
- 偏好语言设置

**2. 安全设置 (Security)**
- 密码修改（已实现，跳转Auth站点）✅
- 双因素认证（2FA）🆕
- 登录历史记录
- 活动会话管理

**3. 通知设置 (Notifications)**
- 邮件通知开关
  - 配额使用警告（80%/90%/100%）
  - 账单提醒
  - 产品更新通知
- 浏览器通知

**4. API密钥管理 (API Keys)** 🆕
- 创建API密钥
- 查看密钥列表
- 撤销密钥
- 密钥权限设置

---

#### 1.5 AI产品访问 (AI Products)
**路由**: `/dashboard/products`
**权限**: 根据订阅套餐

**产品列表**：
```
QuickSlide  | 在线演示PPT生成工具    | 需要Pro套餐
CodeSpark   | AI代码生成助手         | 需要Pro套餐
DataViz     | 数据可视化工具         | 需要Enterprise套餐
ChatBot     | 智能客服机器人         | 免费试用
NLPAnalyzer | 自然语言处理API       | 需要Pro套餐
```

**功能设计**：
1. **产品卡片**
   - 产品名称、图标、描述
   - 当前访问权限状态
     - ✅ 已解锁
     - 🔒 需要升级套餐
     - 🎁 免费试用

2. **快速启动**
   - 点击"启动"按钮 → 跳转到产品页面
   - 自动传递JWT Token（SSO）

3. **使用配额显示**
   - 本月已用次数
   - 剩余配额

**数据来源**：
需要新建`ai_products`表：
```sql
CREATE TABLE ai_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  product_url TEXT,
  required_product_id UUID REFERENCES products(id), -- 需要的订阅套餐
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 二、管理员视角功能 (Admin Dashboard)

#### 2.1 用户管理 (User Management)
**路由**: `/dashboard/admin/users`
**权限**: `app_role = 'admin'`

**功能列表**：
1. **用户列表**
   - DataTable显示所有用户
   - 列：邮箱、姓名、注册日期、订阅状态、角色
   - 搜索/筛选
   - 分页

2. **用户详情**
   - 查看用户完整信息
   - 订阅历史
   - 使用统计
   - 操作日志

3. **用户操作**
   - 修改角色（user ↔ admin）
   - 禁用/启用账户
   - 重置密码（发送邮件）
   - 删除用户（软删除）

**UI组件**：
```tsx
// src/app/dashboard/admin/users/page.tsx
<AdminUserManagement>
  <UserListTable>
    <DataTableFilters />
    <UserRow>
      <UserInfo />
      <SubscriptionBadge />
      <ActionMenu>
        <ViewDetails />
        <ChangeRole />
        <DisableAccount />
      </ActionMenu>
    </UserRow>
  </UserListTable>
  <UserDetailModal />
</AdminUserManagement>
```

---

#### 2.2 产品管理 (Product Management)
**路由**: `/dashboard/admin/products`
**权限**: `app_role = 'admin'`

**功能列表**：
1. **产品列表**
   - 显示所有Stripe产品
   - 同步状态标识（已同步/待同步）
   - 公开/私有状态

2. **创建产品**
   - 方式1：从Stripe同步
   - 方式2：手动创建（同时创建Stripe产品）

3. **编辑产品**
   - 名称、描述、图片
   - 公开/私有切换
   - 功能配置（添加/删除功能）

4. **功能配置**（产品 ↔ 功能关联）
   ```
   产品: Pro Plan
   ├── API调用: 10,000次/月
   ├── QuickSlide生成: 50次/月
   ├── 知识库访问: 无限制
   └── 优先客服: 启用
   ```

**功能配置UI**：
```tsx
<ProductFeatureConfig productId="...">
  <AvailableFeaturesList>
    <FeatureRow>
      <FeatureName>API调用</FeatureName>
      <MonthlyQuotaInput value={10000} />
      <IsPublicToggle />
      <RemoveButton />
    </FeatureRow>
  </AvailableFeaturesList>
  <AddFeatureButton />
</ProductFeatureConfig>
```

---

#### 2.3 功能管理 (Feature Management)
**路由**: `/dashboard/admin/features`
**权限**: `app_role = 'admin'`

**功能列表**：
1. **功能列表**
   - 显示所有features
   - 列：代码、名称、默认限额、单位

2. **创建功能**
   ```typescript
   interface Feature {
     code: string;          // 'api_calls'
     name: string;          // 'API调用'
     description: string;   // '调用AI API的次数'
     monthly_limit: number; // 1000（默认限额）
     unit: string;          // '次'
     is_public: boolean;    // false（是否公开显示）
   }
   ```

3. **编辑功能**
   - 修改名称、描述
   - 调整默认限额
   - 公开/私有切换

4. **删除功能**
   - 检查是否被产品使用
   - 软删除（保留历史数据）

---

#### 2.4 订阅管理 (Subscription Management)
**路由**: `/dashboard/admin/subscriptions`
**权限**: `app_role = 'admin'`

**功能列表**：
1. **订阅列表**
   - 显示所有订阅
   - 列：用户、套餐、状态、价格、续费日期
   - 筛选：状态（active/canceled/past_due）

2. **订阅详情**
   - 用户信息
   - 套餐详情
   - 账单历史
   - Stripe链接

3. **管理员操作**
   - 手动创建订阅（赠送）
   - 延长试用期
   - 取消订阅
   - 退款

---

#### 2.5 配置中心管理 (Config Center) ✅
**路由**: `/dashboard/admin/config`
**权限**: `app_role = 'admin'`

**功能**：已实现完整的配置中心系统
- 运行时配置管理
- 配置历史记录
- 按分类显示（limits/features/site/services）

**参考文档**：已完成的配置中心系统设计

---

## 🔐 权限系统设计

### 角色定义

#### 1. User (普通用户)
**权限**：
- ✅ 查看自己的Dashboard
- ✅ 管理自己的订阅
- ✅ 查看使用统计
- ✅ 修改个人设置
- ✅ 访问已购买的AI产品
- ❌ 无法访问Admin页面

#### 2. Admin (管理员)
**权限**：
- ✅ User的所有权限
- ✅ 查看所有用户
- ✅ 管理产品和功能
- ✅ 查看所有订阅
- ✅ 修改系统配置
- ✅ 访问配置中心
- ✅ 查看审计日志

### 权限检查实现

**1. Middleware级别**（最外层）
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 检查/dashboard/admin路径
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // 检查管理员权限
    const { data: userData } = await supabase
      .from('users')
      .select('app_role')
      .eq('id', user.id)
      .single();

    if (userData?.app_role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}
```

**2. API级别**（中间层）
```typescript
// src/lib/auth/check-admin.ts
export async function requireAdmin(request: Request) {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('app_role')
    .eq('id', user.id)
    .single();

  if (userData?.app_role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

// 使用示例
// src/app/api/admin/users/route.ts
export async function GET(request: Request) {
  await requireAdmin(request); // 检查权限

  // 执行管理员操作...
}
```

**3. 组件级别**（内层）
```tsx
// src/components/admin/admin-guard.tsx
'use client';

import { useAuth } from '@/shared/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.app_role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.app_role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
```

---

## 📋 资源权限系统设计

### 场景分析
用户需要不同权限访问不同资源：
1. **知识库文章**：Free用户只能看部分，Pro用户看全部
2. **AI产品**：根据订阅套餐开放
3. **API端点**：根据订阅套餐限流

### 数据库设计

#### 新建表：resource_permissions
```sql
CREATE TABLE resource_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL, -- 'article', 'ai_product', 'api_endpoint'
  resource_id TEXT NOT NULL,   -- 资源的唯一标识
  required_product_id UUID REFERENCES products(id), -- 需要的订阅套餐（NULL=所有人可访问）
  is_public BOOLEAN DEFAULT false, -- 是否公开（公开=未登录也可访问）
  metadata JSONB,              -- 额外配置
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 示例数据
INSERT INTO resource_permissions (resource_type, resource_id, required_product_id, is_public) VALUES
  ('article', 'ai-basics-101', NULL, true),           -- 公开文章，所有人可看
  ('article', 'advanced-prompt-engineering', 'pro_plan_id', false), -- 需要Pro套餐
  ('ai_product', 'quickslide', 'pro_plan_id', false), -- QuickSlide需要Pro
  ('ai_product', 'chatbot', NULL, false);             -- ChatBot免费用户也能用
```

### 权限检查函数
```typescript
// src/lib/permissions/check-resource-access.ts
export async function checkResourceAccess(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<{ canAccess: boolean; reason?: string }> {
  const supabase = createServerClient();

  // 1. 查询资源权限要求
  const { data: permission } = await supabase
    .from('resource_permissions')
    .select('*, products(*)')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .single();

  // 2. 资源不存在
  if (!permission) {
    return { canAccess: false, reason: 'Resource not found' };
  }

  // 3. 公开资源，所有人可访问
  if (permission.is_public) {
    return { canAccess: true };
  }

  // 4. 需要登录但未登录
  if (!userId) {
    return { canAccess: false, reason: 'Login required' };
  }

  // 5. 不需要特定套餐，已登录即可访问
  if (!permission.required_product_id) {
    return { canAccess: true };
  }

  // 6. 检查用户订阅
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(product_id)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    return {
      canAccess: false,
      reason: `Subscription required: ${permission.products.name}`
    };
  }

  // 7. 检查套餐是否匹配
  if (subscription.prices.product_id !== permission.required_product_id) {
    return {
      canAccess: false,
      reason: `Upgrade required: ${permission.products.name}`
    };
  }

  return { canAccess: true };
}
```

### 使用示例

**1. 保护知识库文章**
```tsx
// src/app/[locale]/knowledge-hub/articles/[slug]/page.tsx
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 检查权限
  const { canAccess, reason } = await checkResourceAccess(
    user?.id || '',
    'article',
    params.slug
  );

  if (!canAccess) {
    return (
      <AccessDenied reason={reason}>
        <UpgradePrompt />
      </AccessDenied>
    );
  }

  // 渲染文章内容...
  return <ArticleContent slug={params.slug} />;
}
```

**2. 保护AI产品访问**
```tsx
// src/app/dashboard/products/page.tsx
export default async function ProductsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const products = await supabase.from('ai_products').select('*');

  return (
    <ProductGrid>
      {products.map(async (product) => {
        const { canAccess } = await checkResourceAccess(
          user.id,
          'ai_product',
          product.code
        );

        return (
          <ProductCard
            key={product.id}
            product={product}
            locked={!canAccess}
          />
        );
      })}
    </ProductGrid>
  );
}
```

---

## 🗂️ 文件结构建议

```
db-wizPulseAI-com/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # 概览
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx               # 订阅管理
│   │   │   ├── usage/
│   │   │   │   └── page.tsx               # 使用统计
│   │   │   ├── settings/
│   │   │   │   └── page.tsx               # 设置
│   │   │   ├── products/
│   │   │   │   └── page.tsx               # AI产品
│   │   │   └── admin/                     # 管理员专区
│   │   │       ├── users/
│   │   │       │   ├── page.tsx           # 用户管理
│   │   │       │   └── [id]/page.tsx      # 用户详情
│   │   │       ├── products/
│   │   │       │   └── page.tsx           # 产品管理
│   │   │       ├── features/
│   │   │       │   └── page.tsx           # 功能管理
│   │   │       ├── subscriptions/
│   │   │       │   └── page.tsx           # 订阅管理
│   │   │       └── config/
│   │   │           └── page.tsx           # 配置中心 ✅
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── users/route.ts
│   │       │   ├── products/route.ts
│   │       │   └── features/route.ts
│   │       └── subscriptions/
│   │           └── checkout/route.ts
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── usage-stats-cards.tsx
│   │   │   ├── usage-trend-chart.tsx
│   │   │   ├── subscription-card.tsx
│   │   │   └── product-card.tsx
│   │   └── admin/
│   │       ├── admin-guard.tsx            # 权限守卫
│   │       ├── user-list-table.tsx
│   │       ├── product-form.tsx
│   │       └── feature-config.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── check-admin.ts             # 管理员权限检查
│   │   │   └── check-resource-access.ts   # 资源权限检查
│   │   ├── permissions/
│   │   │   └── index.ts
│   │   └── stripe/
│   │       └── subscription-helpers.ts
│   └── types/
│       └── supabase.types.ts              # 数据库类型 ✅
└── supabase/
    └── migrations/
        ├── 20251120_create_ai_products.sql        # 新建AI产品表
        ├── 20251120_create_resource_permissions.sql # 新建资源权限表
        └── 20251120_create_api_keys.sql           # 新建API密钥表
```

---

## 🚀 实施计划

### Phase 1: 数据库扩展（1-2天）
- [ ] 创建`ai_products`表
- [ ] 创建`resource_permissions`表
- [ ] 创建`api_keys`表
- [ ] 创建`audit_logs`表
- [ ] 生成TypeScript类型

### Phase 2: 权限系统（2-3天）
- [ ] 实现Middleware权限检查
- [ ] 实现API权限检查函数
- [ ] 实现AdminGuard组件
- [ ] 实现资源权限检查函数

### Phase 3: 用户Dashboard（3-4天）
- [ ] 概览页面（使用统计卡片 + 图表）
- [ ] 订阅管理页面（升级/降级/取消）
- [ ] 使用统计页面（趋势图表）
- [ ] 设置页面（个人资料 + 安全 + API密钥）
- [ ] AI产品页面（产品列表 + 权限控制）

### Phase 4: 管理员Dashboard（3-4天）
- [ ] 用户管理（列表 + 详情 + 操作）
- [ ] 产品管理（CRUD + 功能配置）
- [ ] 功能管理（CRUD）
- [ ] 订阅管理（列表 + 详情 + 操作）

### Phase 5: 测试和优化（2-3天）
- [ ] 权限系统测试
- [ ] 功能测试（用户+管理员）
- [ ] 性能优化
- [ ] UI/UX优化

**总计**：约12-16天（2-3周）

---

## 📊 后续扩展建议

### 1. 团队功能（Team Management）
如果需要支持团队协作：
- 新建`teams`表
- 新建`team_members`表
- 团队订阅共享
- 团队成员角色（owner/admin/member）

### 2. API密钥管理
- 生成API密钥
- 密钥权限配置
- 使用追踪
- 速率限制

### 3. Webhook管理
- 配置Webhook URL
- 选择事件类型
- Webhook历史记录
- 重试机制

### 4. 高级分析
- 用户行为分析
- 功能使用热力图
- 留存率分析
- 收入趋势分析

---

**创建日期**: 2025-11-20
**下一步**: 讨论具体实施细节和优先级
