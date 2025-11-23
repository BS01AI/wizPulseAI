# Dashboard页面模板使用指南

## 📋 完成情况总览

### ✅ 已完成工作 (2025-11-23)

**1. 创建统一页面模板** ⭐⭐⭐⭐⭐
- 文件：`src/components/layout/orbital-page-template.tsx` (260行)
- 组件：4个可复用组件
  - `OrbitalPageTemplate` - 主页面模板
  - `OrbitalCard` - 卡片容器
  - `OrbitalGrid` - 响应式网格
  - `OrbitalStatCard` - 统计卡片

**2. 改造3个核心子页面** ✅
- ✅ Billing页面 (`/dashboard/billing`) - 订阅管理
- ✅ Settings页面 (`/dashboard/settings`) - 账户设置
- ✅ Admin页面 (`/dashboard/admin`) - 管理员控制台

**3. 验证通过** ✅
- ✅ TypeScript编译：无错误
- ✅ Next.js构建：成功
- ✅ 所有功能：保持完整

---

## 🎨 核心特性

### 统一的Orbital Nexus风格
- ✅ 深空背景 (#0A0E17) + 电路网格
- ✅ 赛博青 (#00F0FF) 高亮
- ✅ 量子紫 (#7B61FF) 辅助色
- ✅ 科技感卡片和光晕效果

### 灵活的模板系统
- ✅ 支持标题、描述、操作按钮
- ✅ 可选标签页导航
- ✅ 响应式布局（1-4列网格）
- ✅ 服务器组件和客户端组件都支持

---

## 📦 组件使用方法

### 1️⃣ OrbitalPageTemplate - 主页面模板

**基础用法**：
```tsx
import { OrbitalPageTemplate } from '@/components/layout/orbital-page-template';

export default function MyPage() {
  return (
    <OrbitalPageTemplate
      title="页面标题"
      description="页面描述（可选）"
    >
      <YourContent />
    </OrbitalPageTemplate>
  );
}
```

**带操作按钮**：
```tsx
<OrbitalPageTemplate
  title="用户管理"
  description="管理所有用户账户"
  actions={
    <button className="btn-tech">
      新建用户
    </button>
  }
>
  <UsersList />
</OrbitalPageTemplate>
```

**带标签页导航**：
```tsx
<OrbitalPageTemplate
  title="产品设置"
  tabs={[
    { key: 'general', label: '基本设置', isActive: true },
    { key: 'features', label: '功能配置', href: '/settings/features' },
    { key: 'pricing', label: '定价方案', href: '/settings/pricing' },
  ]}
>
  <SettingsContent />
</OrbitalPageTemplate>
```

**全宽布局**：
```tsx
<OrbitalPageTemplate
  title="数据大屏"
  fullWidth  // 不限制最大宽度
>
  <Dashboard />
</OrbitalPageTemplate>
```

**使用卡片包装**：
```tsx
<OrbitalPageTemplate
  title="通知中心"
  useCard  // 自动用卡片包装内容
>
  <NotificationList />
</OrbitalPageTemplate>
```

---

### 2️⃣ OrbitalCard - 卡片容器

**基础卡片**：
```tsx
import { OrbitalCard } from '@/components/layout/orbital-page-template';

<OrbitalCard title="订单统计">
  <p>订单内容...</p>
</OrbitalCard>
```

**带操作按钮的卡片**：
```tsx
<OrbitalCard
  title="用户列表"
  actions={
    <button className="btn-tech">导出</button>
  }
>
  <UserTable />
</OrbitalCard>
```

**自定义标题（支持图标）**：
```tsx
import { Users } from 'lucide-react';

<OrbitalCard
  title={
    <div className="flex items-center gap-3">
      <Users className="w-5 h-5 text-[#00F0FF]" />
      <span>用户管理</span>
    </div>
  }
>
  <Content />
</OrbitalCard>
```

**可点击的卡片**：
```tsx
<OrbitalCard
  className="cursor-pointer hover:scale-[1.02] transition-all"
  onClick={() => router.push('/detail')}
>
  <CardContent />
</OrbitalCard>
```

---

### 3️⃣ OrbitalGrid - 响应式网格

**3列网格（默认）**：
```tsx
import { OrbitalGrid, OrbitalCard } from '@/components/layout/orbital-page-template';

<OrbitalGrid columns={3}>
  <OrbitalCard title="卡片1">内容1</OrbitalCard>
  <OrbitalCard title="卡片2">内容2</OrbitalCard>
  <OrbitalCard title="卡片3">内容3</OrbitalCard>
</OrbitalGrid>
```

**2列网格**：
```tsx
<OrbitalGrid columns={2}>
  <ProfileForm />
  <PasswordForm />
</OrbitalGrid>
```

**4列网格**：
```tsx
<OrbitalGrid columns={4}>
  <StatCard1 />
  <StatCard2 />
  <StatCard3 />
  <StatCard4 />
</OrbitalGrid>
```

**响应式行为**：
- `columns={1}`: 始终单列
- `columns={2}`: 手机1列，平板+2列
- `columns={3}`: 手机1列，平板2列，桌面3列
- `columns={4}`: 手机1列，平板2列，桌面4列

---

### 4️⃣ OrbitalStatCard - 统计卡片

**基础统计**：
```tsx
import { OrbitalStatCard } from '@/components/layout/orbital-page-template';

<OrbitalStatCard
  label="总用户数"
  value="1,234"
  color="cyan"
/>
```

**带图标和趋势**：
```tsx
import { Users } from 'lucide-react';

<OrbitalStatCard
  label="活跃用户"
  value="856"
  icon={<Users className="w-5 h-5" />}
  trend="up"
  trendValue="+12.5%"
  color="green"
/>
```

**配色选项**：
- `color="cyan"` - 赛博青 (#00F0FF)
- `color="purple"` - 量子紫 (#7B61FF)
- `color="green"` - 矩阵绿 (#2EE59D)
- `color="orange"` - 聚变橙 (#FF8C42)

**趋势选项**：
- `trend="up"` - 绿色上升箭头
- `trend="down"` - 橙色下降箭头
- `trend="neutral"` - 灰色持平

---

## 🔄 迁移现有页面

### 快速迁移步骤（10分钟/页）

#### 步骤1：导入组件
```tsx
import {
  OrbitalPageTemplate,
  OrbitalCard,
  OrbitalGrid,
} from '@/components/layout/orbital-page-template';
```

#### 步骤2：包装页面
**旧代码**：
```tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">标题</h1>
      <p className="text-muted-foreground">描述</p>

      <div>内容...</div>
    </div>
  );
}
```

**新代码**：
```tsx
export default function MyPage() {
  return (
    <OrbitalPageTemplate
      title="标题"
      description="描述"
    >
      <div>内容...</div>
    </OrbitalPageTemplate>
  );
}
```

#### 步骤3：替换卡片
**旧代码**：
```tsx
<div className="bg-white border rounded-lg p-6">
  <h2 className="text-xl font-bold mb-4">卡片标题</h2>
  <Content />
</div>
```

**新代码**：
```tsx
<OrbitalCard title="卡片标题">
  <Content />
</OrbitalCard>
```

#### 步骤4：使用网格
**旧代码**：
```tsx
<div className="grid gap-6 md:grid-cols-3">
  <Card1 />
  <Card2 />
  <Card3 />
</div>
```

**新代码**：
```tsx
<OrbitalGrid columns={3}>
  <Card1 />
  <Card2 />
  <Card3 />
</OrbitalGrid>
```

---

## 📝 实战示例

### 示例1：Billing页面（订阅管理）

```tsx
import { OrbitalPageTemplate, OrbitalCard, OrbitalGrid } from '@/components/layout/orbital-page-template';

export default async function BillingPage() {
  // ... 数据获取逻辑 ...

  return (
    <OrbitalPageTemplate
      title="订阅管理"
      description="管理您的订阅计划和付款信息"
    >
      {/* 当前订阅状态 */}
      <div className="mb-8">
        <CurrentSubscription subscription={currentSubscription} />
      </div>

      {/* 可用计划 */}
      <OrbitalCard title="可用计划">
        <OrbitalGrid columns={3}>
          {products?.map((product) => (
            <SubscriptionCard key={product.id} {...product} />
          ))}
        </OrbitalGrid>
      </OrbitalCard>
    </OrbitalPageTemplate>
  );
}
```

**特点**：
- ✅ 使用服务器组件（async function）
- ✅ 保持原有数据获取逻辑
- ✅ 只改UI层，功能不变

---

### 示例2：Settings页面（账户设置）

```tsx
import { OrbitalPageTemplate, OrbitalCard, OrbitalGrid } from '@/components/layout/orbital-page-template';

export default async function SettingsPage() {
  const { t } = await getTranslations();
  // ... 用户数据获取 ...

  return (
    <OrbitalPageTemplate
      title={t('settings.title', '账户设置')}
      description={t('settings.description', '管理您的账户设置和偏好')}
    >
      <OrbitalGrid columns={2}>
        <OrbitalCard title={t('settings.profileSection', '个人资料')}>
          <ProfileForm user={profile} />
        </OrbitalCard>

        <OrbitalCard title={t('settings.securitySection', '安全设置')}>
          <PasswordForm />
        </OrbitalCard>
      </OrbitalGrid>
    </OrbitalPageTemplate>
  );
}
```

**特点**：
- ✅ 支持多语言（i18n集成）
- ✅ 2列响应式布局
- ✅ 每个表单独立卡片

---

### 示例3：Admin页面（管理员控制台）

```tsx
'use client';

import { OrbitalPageTemplate, OrbitalCard, OrbitalGrid } from '@/components/layout/orbital-page-template';
import { Users, CreditCard, Package } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  const adminCards = [
    {
      id: 'users',
      icon: <Users className="w-5 h-5" />,
      title: '用户管理',
      description: '查看和管理所有用户账户、权限和设置。',
      route: '/dashboard/admin/users',
    },
    // ... 更多卡片 ...
  ];

  return (
    <RoleGate allowedRoles={['admin']}>
      <OrbitalPageTemplate
        title="WizPulseAI 管理后台"
        description="管理系统用户、产品、功能和订阅"
        fullWidth
      >
        <OrbitalGrid columns={3}>
          {adminCards.map((card) => (
            <OrbitalCard
              key={card.id}
              className="group cursor-pointer hover:scale-[1.02]"
              title={
                <div className="flex items-center gap-3">
                  <div className="icon-container-glow text-[#00F0FF]">
                    {card.icon}
                  </div>
                  <span className="group-hover:text-[#00F0FF]">
                    {card.title}
                  </span>
                </div>
              }
            >
              <p className="text-[#8B92A6] mb-4">{card.description}</p>
              <button
                onClick={() => router.push(card.route)}
                className="btn-tech w-full"
              >
                进入管理
              </button>
            </OrbitalCard>
          ))}
        </OrbitalGrid>
      </OrbitalPageTemplate>
    </RoleGate>
  );
}
```

**特点**：
- ✅ 客户端组件（'use client'）
- ✅ 权限控制（RoleGate）
- ✅ 7个管理功能卡片
- ✅ Lucide图标集成
- ✅ Hover动画效果

---

## 🎯 最佳实践

### ✅ 推荐做法

1. **保持功能逻辑不变**
   - 只改UI层，不改业务逻辑
   - 数据获取、状态管理保持原样

2. **合理使用网格**
   - 3-4个项目：用 `columns={3}` 或 `columns={4}`
   - 2个项目：用 `columns={2}`
   - 单个大内容：不用网格，直接放内容

3. **统一样式类**
   - 按钮：`btn-tech`
   - 文字颜色：`text-[#8B92A6]`（次要）、`text-[#E0E7FF]`（主要）
   - 高亮：`text-[#00F0FF]`（赛博青）

4. **响应式优先**
   - 移动端友好（OrbitalGrid自动响应）
   - 文字大小合理（text-sm, text-base, text-lg）

### ❌ 避免做法

1. **不要混用旧样式**
   - 避免：`<div className="bg-white border rounded">`
   - 使用：`<OrbitalCard>`

2. **不要硬编码尺寸**
   - 避免：`<div className="w-[500px]">`
   - 使用：`<OrbitalGrid columns={2}>` 自动响应

3. **不要嵌套太深**
   - 避免：OrbitalCard 内部再套 OrbitalCard
   - 使用：扁平化结构

---

## 📊 已完成页面对比

### Billing页面（订阅管理）

**改造前**：
- 99行代码
- 使用基础div和样式
- 手动写标题区

**改造后**：
- 106行代码（+7行）
- 使用OrbitalPageTemplate
- 统一科技感UI
- 代码更清晰

### Settings页面（账户设置）

**改造前**：
- 83行代码
- 手动grid布局
- 普通白色背景

**改造后**：
- 97行代码（+14行）
- OrbitalGrid自动响应
- 深空科技背景
- 支持多语言

### Admin页面（管理员控制台）

**改造前**：
- 243行代码
- 大量重复Card代码
- 使用shadcn/ui组件

**改造后**：
- 179行代码（-64行！）
- 数据驱动（adminCards数组）
- 统一Orbital风格
- 代码复用性高

---

## 🚀 下一步建议

### 立即可做
1. ✅ 当前3个页面已统一风格
2. 🎨 如需换色，修改 `orbital-nexus.css` 即可

### 逐步优化
1. 📄 迁移 Features 页面（`/dashboard/features`）
2. 🛍️ 迁移 Products 页面（`/dashboard/products`）
3. 👥 迁移 Admin 子页面（users, subscriptions等）

### 可选扩展
1. 🎨 创建主题切换器（红/绿/金主题）
2. 📱 优化移动端体验
3. ♿ 增强无障碍功能

---

## 💡 总结

### 核心优势
- ✅ **统一美观**：所有页面统一Orbital Nexus风格
- ✅ **易于维护**：改一个模板，所有页面都更新
- ✅ **快速迁移**：10分钟/页的改造速度
- ✅ **功能完整**：保持所有业务逻辑不变
- ✅ **灵活扩展**：支持服务器+客户端组件

### 技术亮点
- 🎨 CSS变量系统（5分钟换色）
- 📦 4个可复用组件
- 📱 完全响应式
- 🔒 TypeScript类型安全
- ⚡ Next.js SSR/CSR都支持

---

**最后更新**: 2025-11-23
**当前版本**: v1.0
**作者**: Claude + WizPulseAI Team
