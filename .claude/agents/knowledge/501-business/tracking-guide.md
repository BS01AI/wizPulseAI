# 埋点规划指南

> 追踪用户行为，驱动数据决策

---

## 事件分类

### 1. 页面事件

```typescript
// 页面访问
track('page_view', {
  page: '/products/fashion',
  referrer: 'google',
  session_id: 'xxx'
});
```

### 2. 用户行为事件

```typescript
// 按钮点击
track('button_click', {
  button: 'start_trial',
  page: '/pricing',
  position: 'hero'
});

// 功能使用
track('feature_use', {
  feature: 'daily_outfit',
  duration: 120,  // 秒
  result: 'success'
});
```

### 3. 转化事件

```typescript
// 注册完成
track('signup_complete', {
  method: 'google',  // google | email | apple
  referrer: 'organic',
  campaign: null
});

// 试用开始
track('trial_start', {
  plan: 'pro',
  source: 'homepage',
  previous_plan: 'free'
});

// 支付完成
track('payment_complete', {
  plan: 'pro',
  amount: 980,
  currency: 'JPY',
  payment_method: 'card'
});
```

### 4. 留存事件

```typescript
// 会话开始
track('session_start', {
  day_since_signup: 7,
  session_count: 15,
  last_feature: 'wardrobe'
});

// 里程碑达成
track('feature_milestone', {
  feature: 'outfits_created',
  count: 10,
  days_to_reach: 5
});
```

---

## 命名规范

### 事件名

- 使用 **snake_case**
- 格式：**动词_名词**
- 示例：`page_view`, `button_click`, `signup_complete`

### 属性名

- 使用 **snake_case**
- 常用属性：
  - `page` - 页面路径
  - `source` - 来源
  - `method` - 方式
  - `plan` - 套餐
  - `amount` - 金额
  - `currency` - 货币
  - `duration` - 时长（秒）

### 必需属性

每个事件自动包含：
- `timestamp` - 时间戳
- `user_id` - 用户ID（如已登录）
- `session_id` - 会话ID
- `device_type` - 设备类型

---

## 实施代码示例

### analytics.ts

```typescript
// src/lib/analytics.ts

type EventName =
  | 'page_view'
  | 'button_click'
  | 'feature_use'
  | 'signup_complete'
  | 'trial_start'
  | 'payment_complete'
  | 'session_start';

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

export function track(event: EventName, properties: EventProperties) {
  // 添加通用属性
  const enrichedProperties = {
    ...properties,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    user_id: getUserId(),
    device_type: getDeviceType(),
  };

  // 发送到分析服务
  // 可以是 Supabase、Mixpanel、Amplitude 等
  console.log('[Analytics]', event, enrichedProperties);

  // 示例：发送到 Supabase
  // await supabase.from('analytics_events').insert({
  //   event_name: event,
  //   properties: enrichedProperties
  // });
}

// 辅助函数
function getSessionId(): string {
  // 从 sessionStorage 获取或生成
}

function getUserId(): string | null {
  // 从认证状态获取
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  // 根据 viewport 判断
}
```

### 使用示例

```typescript
// 在组件中使用
import { track } from '@/lib/analytics';

// 页面加载
useEffect(() => {
  track('page_view', { page: '/pricing' });
}, []);

// 按钮点击
<Button onClick={() => {
  track('button_click', { button: 'start_trial', page: '/pricing' });
  startTrial();
}}>
  开始试用
</Button>
```

---

## 核心事件清单

### P0 - 必须追踪

| 事件 | 触发时机 | 关键属性 |
|------|---------|---------|
| `page_view` | 页面加载 | page, referrer |
| `signup_complete` | 注册成功 | method, source |
| `trial_start` | 开始试用 | plan, source |
| `payment_complete` | 支付成功 | plan, amount, currency |

### P1 - 建议追踪

| 事件 | 触发时机 | 关键属性 |
|------|---------|---------|
| `button_click` | 重要按钮点击 | button, page |
| `feature_use` | 核心功能使用 | feature, duration |
| `session_start` | 会话开始 | day_since_signup |
| `trial_end` | 试用结束 | converted, reason |

---

## 数据看板设计

### 转化看板

```
┌─────────────────────────────────────┐
│  访问 → 注册 → 激活 → 付费          │
│  1000   300    200    30            │
│        30%    67%    15%            │
└─────────────────────────────────────┘
```

### 留存看板

```
┌─────────────────────────────────────┐
│  Day 1  Day 3  Day 7  Day 30       │
│   40%    25%    18%    12%         │
└─────────────────────────────────────┘
```

---

**最后更新**: 2025-12-04
