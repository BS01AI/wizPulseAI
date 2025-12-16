# P0-PAY-3 CreditService 统一调查报告

**调查时间**: 2025-12-16
**调查范围**: Dashboard + Fashion 站点积分服务实现

---

## 1. 问题确认 ✅

**当前状态**: 两个站点各自实现了 CreditService，存在代码重复和潜在逻辑不一致问题。

| 站点 | 服务位置 | 数据库访问方式 | 状态 |
|------|---------|---------------|------|
| **Dashboard** | `db-wizPulseAI-com/src/lib/credits/service.ts` | 直接访问 Supabase（fashion schema） | ✅ 已有完整 API |
| **Fashion** | `fashion-wizpulseai-com/src/domains/credits/` | 直接访问 Supabase（fashion schema） | ❌ 重复实现 |

---

## 2. Dashboard API 现状分析

### ✅ 已有完整的积分 API

**API 路由**:
```
db-wizPulseAI-com/src/app/api/credits/
├── balance/route.ts           ← GET /api/credits/balance
├── transactions/route.ts      ← GET /api/credits/transactions
├── packages/route.ts          ← GET /api/credits/packages
├── checkout/route.ts          ← POST /api/credits/checkout
└── admin/
    ├── users/route.ts         ← GET /api/admin/credits/users
    └── transactions/route.ts  ← GET /api/admin/credits/transactions
```

### 核心功能

**1. `/api/credits/balance` (已实现)**
```typescript
// Dashboard: db-wizPulseAI-com/src/app/api/credits/balance/route.ts
export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const creditService = new CreditService(supabase)
  const balanceDetails = await creditService.getBalanceDetails(user.id)

  return NextResponse.json({
    success: true,
    balance: balanceDetails?.balance || 0,
    userId: user.id,
    updatedAt: balanceDetails?.updatedAt || null,
  })
}
```

**关键特性**:
- ✅ 支持 CORS（允许跨域访问）
- ✅ 返回余额 + 更新时间
- ✅ 认证检查完整

**2. CreditService 核心方法**

| 方法 | 功能 | Dashboard | Fashion | 一致性 |
|------|------|-----------|---------|--------|
| `getBalance()` | 查询余额 | ✅ | ✅ | ✅ |
| `getBalanceDetails()` | 余额详情 | ✅ | ❌ | ⚠️ 缺失 |
| `hasEnoughCredits()` | 检查余额 | ✅ | ✅ | ✅ |
| `deduct()` | 扣除积分 | ✅ (RPC) | ✅ (手动事务) | 🔴 **实现不同** |
| `addCredits()` | 充值积分 | ✅ | ✅ | ✅ |
| `recordTransaction()` | 记录交易 | ✅ | ✅ | ✅ |
| `getTransactionHistory()` | 交易历史 | ✅ | ✅ | ✅ |

---

## 3. 关键差异分析 🔍

### 🔴 **重大差异**: 积分扣除实现

**Dashboard 实现（P0-SEC-3 安全修复）**:
```typescript
// db-wizPulseAI-com/src/lib/credits/service.ts:89-125
async deduct(userId, amount, description, product?, metadata?) {
  // 🔒 使用数据库 RPC 函数确保原子性（FOR UPDATE 锁）
  const { error } = await this.supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: 'usage',
    p_reference_type: product || 'fashion',
    p_description: description,
  })

  if (error) {
    if (error.message.includes('Insufficient credits')) {
      const balance = await this.getBalance(userId)
      return { success: false, newBalance: balance, error: 'Insufficient credits' }
    }
    throw new Error(`Failed to deduct credits: ${error.message}`)
  }

  const newBalance = await this.getBalance(userId)
  return { success: true, newBalance }
}
```

**Fashion 实现（手动事务，有竞态条件风险）**:
```typescript
// fashion-wizpulseai-com/src/domains/credits/services/credits.service.ts:64-109
async deductCredits(userId, amount, description?, metadata?) {
  // 1. 检查积分是否足够
  const hasEnough = await this.hasEnoughCredits(userId, amount)
  if (!hasEnough) {
    throw new BusinessRuleError("Insufficient credits", { ... })
  }

  // 2. 获取当前余额（⚠️ 竞态条件！）
  const currentBalance = await this.getBalance(userId)
  const newBalance = currentBalance - amount

  // 3. 更新余额（可能被并发请求覆盖）
  await supabase.from("user_credits")
    .update({ balance: newBalance })
    .eq("user_id", userId)

  // 4. 记录交易
  await this.recordTransaction(...)

  return { success: true, newBalance }
}
```

**风险说明**:

| 问题 | Dashboard (RPC) | Fashion (手动) |
|------|-----------------|---------------|
| 并发安全 | ✅ `FOR UPDATE` 锁 | ❌ 竞态条件风险 |
| 事务完整性 | ✅ 数据库保证 | ⚠️ 分步操作，可能中断 |
| 余额一致性 | ✅ 原子性操作 | ❌ 可能出现余额错误 |

**实际场景问题**:
```
用户 A 当前余额: 100 积分

时间轴:
T1: 请求1读取余额: 100
T2: 请求2读取余额: 100  ← 还是100（还未更新）
T3: 请求1扣除10: 100 - 10 = 90
T4: 请求2扣除10: 100 - 10 = 90  ← 错误！应该是 80
T5: 数据库余额: 90  ← 丢失了一次扣除！

正确结果应该是: 80 积分
实际结果是: 90 积分
损失: 10 积分
```

---

## 4. 目标架构设计

### ✅ 推荐方案: Fashion → Dashboard API

```
Fashion App (localhost:3013)
    ↓ HTTPS请求
Dashboard API (localhost:3012/api/credits/*)
    ↓ Supabase RPC
Supabase (fashion schema)
```

### 优势

| 优势 | 说明 |
|------|------|
| 🔒 **安全性** | 使用 Dashboard 的 RPC 实现，避免竞态条件 |
| 🔄 **一致性** | 单一数据源，逻辑统一 |
| 📦 **可维护性** | 只需维护一处代码 |
| 🚀 **可扩展性** | 未来新产品直接调用 Dashboard API |
| 📊 **可监控性** | 统一的日志和性能监控 |

---

## 5. 实施方案

### Phase 1: Dashboard API 增强（1-2小时）

**1. 添加扣除积分 API**
```typescript
// db-wizPulseAI-com/src/app/api/credits/deduct/route.ts
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { amount, description, product, metadata } = await request.json()

  const creditService = new CreditService(supabase)
  const result = await creditService.deduct(user.id, amount, description, product, metadata)

  if (!result.success) {
    return NextResponse.json({
      error: result.error,
      balance: result.newBalance
    }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    newBalance: result.newBalance,
    creditsUsed: amount
  })
}
```

**2. 更新 CORS 配置**
```typescript
// 确保 Fashion 站点可以访问
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_FASHION_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}
```

### Phase 2: Fashion 客户端封装（1-2小时）

**创建 Dashboard API 客户端**
```typescript
// fashion-wizpulseai-com/src/lib/credits/dashboard-client.ts
import { createClient } from '@/infrastructure/supabase/server'

const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3012'

export class DashboardCreditsClient {
  /**
   * 获取积分余额
   * 使用 Dashboard API（通过 SSO Session 认证）
   */
  static async getBalance(userId: string): Promise<number> {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${DASHBOARD_API_URL}/api/credits/balance`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch balance')
    }

    const data = await response.json()
    return data.balance
  }

  /**
   * 扣除积分
   * 🔒 使用 Dashboard 的安全 RPC 实现
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; newBalance: number }> {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${DASHBOARD_API_URL}/api/credits/deduct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description, product: 'fashion', metadata }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to deduct credits')
    }

    return await response.json()
  }

  /**
   * 检查积分是否足够
   */
  static async hasEnoughCredits(userId: string, required: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    return balance >= required
  }
}
```

### Phase 3: 迁移现有代码（1-2小时）

**修改 Fashion 分析 API**
```typescript
// fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts

// 修改前:
import { CreditsService } from '@/domains/credits/services/credits.service'

const hasCredits = await CreditsService.hasEnoughCredits(user.id, creditsToUse)
const result = await CreditsService.deductCredits(...)

// 修改后:
import { DashboardCreditsClient } from '@/lib/credits/dashboard-client'

const hasCredits = await DashboardCreditsClient.hasEnoughCredits(user.id, creditsToUse)
const result = await DashboardCreditsClient.deductCredits(...)
```

**废弃旧服务**
```typescript
// fashion-wizpulseai-com/src/domains/credits/services/credits.service.ts

/**
 * @deprecated 使用 DashboardCreditsClient 替代
 *
 * 迁移指南:
 * - getBalance() → DashboardCreditsClient.getBalance()
 * - deductCredits() → DashboardCreditsClient.deductCredits()
 * - hasEnoughCredits() → DashboardCreditsClient.hasEnoughCredits()
 */
export class CreditsService { ... }
```

---

## 6. 安全考虑 🔒

### 认证方式

**选择: 使用 SSO Session Token** ✅

| 方案 | 优势 | 劣势 | 推荐 |
|------|------|------|------|
| SSO Session Token | 用户已登录，直接复用 | 需要转发 Token | ✅ **推荐** |
| 服务间密钥 | 简单 | 需要管理额外密钥 | ❌ 不推荐 |
| OAuth 客户端凭证 | 标准 | 配置复杂 | ❌ 过度设计 |

**实现**:
```typescript
// Fashion API 调用 Dashboard API 时
const { data: { session } } = await supabase.auth.getSession()

fetch(`${DASHBOARD_URL}/api/credits/deduct`, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,  // ← SSO Token
  }
})

// Dashboard API 验证
const { data: { user }, error } = await supabase.auth.getUser()  // ← 自动验证
```

### CORS 配置

```typescript
// db-wizPulseAI-com/src/app/api/credits/*/route.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_FASHION_URL,  // 只允许 Fashion 站点
  'Access-Control-Allow-Credentials': 'true',  // 允许携带 Cookie
}
```

---

## 7. 性能考虑 ⚡

### 潜在问题

| 场景 | 当前（直接访问） | 新方案（API调用） | 影响 |
|------|-----------------|-------------------|------|
| 网络延迟 | 0ms | +50-100ms | ⚠️ 可能影响用户体验 |
| API 开销 | 无 | 每次 +1 HTTP请求 | ⚠️ 增加服务器负载 |
| 数据库查询 | 1次 | 1次 | ✅ 无变化 |

### 优化方案

**1. 本地缓存余额（5分钟）**
```typescript
// fashion-wizpulseai-com/src/hooks/useCredits.ts
export function useCredits() {
  return useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: () => DashboardCreditsClient.getBalance(userId),
    staleTime: 5 * 60 * 1000,  // 5分钟缓存
  })
}
```

**2. 批量查询（未来优化）**
```typescript
// 一次请求获取余额 + 交易历史
const data = await DashboardCreditsClient.getBatchData(userId, ['balance', 'transactions'])
```

---

## 8. 测试计划 🧪

### 单元测试

```typescript
// fashion-wizpulseai-com/src/lib/credits/__tests__/dashboard-client.test.ts
describe('DashboardCreditsClient', () => {
  it('应该成功获取余额', async () => {
    const balance = await DashboardCreditsClient.getBalance('user-id')
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  it('应该正确扣除积分', async () => {
    const result = await DashboardCreditsClient.deductCredits('user-id', 10, 'test')
    expect(result.success).toBe(true)
    expect(result.newBalance).toBeLessThan(100)
  })

  it('余额不足时应该抛出错误', async () => {
    await expect(
      DashboardCreditsClient.deductCredits('user-id', 10000, 'test')
    ).rejects.toThrow('Insufficient credits')
  })
})
```

### 集成测试

```bash
# 1. 启动 Dashboard API
cd db-wizPulseAI-com
npm run dev  # localhost:3012

# 2. 启动 Fashion App
cd fashion-wizpulseai-com
npm run dev  # localhost:3013

# 3. 测试完整流程
curl -X POST http://localhost:3013/api/fashion/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"photoId": "test-photo-id"}'

# 4. 验证 Dashboard API 日志
# 应该看到 /api/credits/deduct 被调用
```

---

## 9. 迁移步骤 📋

### 第一阶段：准备（不影响现有功能）

1. **创建 Dashboard API**
   - [ ] 创建 `/api/credits/deduct` 路由
   - [ ] 添加 CORS 配置
   - [ ] 本地测试 API

2. **创建 Fashion 客户端**
   - [ ] 创建 `DashboardCreditsClient` 类
   - [ ] 添加单元测试
   - [ ] 本地测试客户端

### 第二阶段：灰度迁移（逐步替换）

3. **迁移核心 API**
   - [ ] 修改 `/api/fashion/analyze` 使用新客户端
   - [ ] 添加错误日志监控
   - [ ] 验证功能正常

4. **废弃旧服务**
   - [ ] 添加 `@deprecated` 注释
   - [ ] 搜索所有引用，逐个替换
   - [ ] 确认无残留引用

### 第三阶段：清理（删除重复代码）

5. **删除旧实现**
   - [ ] 删除 `fashion-wizpulseai-com/src/domains/credits/services/`
   - [ ] 删除 `fashion-wizpulseai-com/src/lib/credits/service.ts`
   - [ ] 更新文档

6. **验证和监控**
   - [ ] 生产环境部署
   - [ ] 监控 API 调用成功率
   - [ ] 监控响应时间

---

## 10. 风险评估 ⚠️

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Dashboard API 宕机导致 Fashion 无法扣积分 | 🔴 高 | 🟡 中 | 添加降级逻辑（直接访问数据库） |
| CORS 配置错误导致跨域失败 | 🔴 高 | 🟢 低 | 本地充分测试 |
| 网络延迟影响用户体验 | 🟡 中 | 🟢 低 | 添加本地缓存 |
| SSO Token 过期导致认证失败 | 🟡 中 | 🟢 低 | 自动刷新 Token |

---

## 11. 总结与建议

### ✅ 推荐执行

**理由**:
1. 🔒 **消除安全隐患**: Fashion 当前实现有竞态条件风险
2. 🔄 **统一积分逻辑**: 避免两套代码不一致
3. 📦 **减少维护成本**: 只需维护一处代码
4. 🚀 **为未来扩展做准备**: 新产品直接复用 Dashboard API

**预估工作量**: 4-6小时
- Dashboard API 增强: 1-2小时
- Fashion 客户端封装: 1-2小时
- 迁移现有代码: 1-2小时
- 测试和验证: 1小时

### 📊 实施优先级

| 任务 | 优先级 | 原因 |
|------|--------|------|
| 创建 Dashboard API | P0 | 必须先有 API |
| 创建 Fashion 客户端 | P0 | 封装调用逻辑 |
| 迁移 `/api/fashion/analyze` | P1 | 核心功能，高频调用 |
| 迁移其他使用点 | P2 | 低频调用，可稍后 |
| 删除旧代码 | P3 | 确认无问题后清理 |

### 🎯 下一步行动

**建议立即开始 Phase 1**:
```bash
# 1. 在 Dashboard 创建扣除 API
cd db-wizPulseAI-com
code src/app/api/credits/deduct/route.ts

# 2. 本地测试
curl -X POST http://localhost:3012/api/credits/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount": 10, "description": "test"}'
```

---

**调查完成时间**: 2025-12-16
**文档版本**: v1.0
**下次更新**: 实施完成后
