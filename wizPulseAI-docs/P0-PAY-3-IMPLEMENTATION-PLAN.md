# P0-PAY-3 CreditService 统一实施计划

**任务目标**: Fashion 站点改为调用 Dashboard API，而不是直接操作数据库

**预估工作量**: 4-6 小时
**优先级**: P0 (安全修复)

---

## 核心问题

### 当前架构
```
Fashion App → Supabase (直接访问)
Dashboard App → Supabase (直接访问)
```

**问题**:
- ❌ 代码重复
- ❌ Fashion 的积分扣除有竞态条件风险（手动事务）
- ❌ Dashboard 的积分扣除已修复（使用 RPC + FOR UPDATE 锁）

### 目标架构
```
Fashion App → Dashboard API → Supabase (RPC)
```

**优势**:
- ✅ 统一代码，易维护
- ✅ 使用 Dashboard 的安全 RPC 实现
- ✅ 为未来新产品做准备

---

## 实施步骤

### Step 1: Dashboard API 增强 (1-2小时)

**创建扣除积分 API**

文件: `db-wizPulseAI-com/src/app/api/credits/deduct/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { CreditService } from '@/lib/credits'

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_FASHION_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // 1. 认证
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    // 2. 解析请求
    const { amount, description, product, metadata } = await request.json()

    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. 扣除积分（使用安全的 RPC 实现）
    const creditService = new CreditService(supabase)
    const result = await creditService.deduct(
      user.id,
      amount,
      description,
      product || 'fashion',
      metadata
    )

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          newBalance: result.newBalance
        },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        success: true,
        newBalance: result.newBalance,
        creditsUsed: amount
      },
      { headers: corsHeaders }
    )

  } catch (error: any) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500, headers: corsHeaders }
    )
  }
}
```

**环境变量**

添加到 `db-wizPulseAI-com/.env.local`:
```env
NEXT_PUBLIC_FASHION_URL=http://localhost:3013
```

---

### Step 2: Fashion 客户端封装 (1-2小时)

**创建 Dashboard API 客户端**

文件: `fashion-wizpulseai-com/src/lib/credits/dashboard-client.ts`

```typescript
import { createClient } from '@/infrastructure/supabase/server'

const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3012'

/**
 * Dashboard 积分 API 客户端
 *
 * 使用 Dashboard API 而不是直接访问数据库，确保：
 * - 积分扣除使用安全的 RPC 实现（避免竞态条件）
 * - 逻辑统一，易维护
 * - 为未来新产品做准备
 */
export class DashboardCreditsClient {
  /**
   * 获取用户积分余额
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
   * 检查积分是否足够
   */
  static async hasEnoughCredits(userId: string, required: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    return balance >= required
  }

  /**
   * 扣除积分
   *
   * ⚠️ 使用 Dashboard 的安全 RPC 实现，避免竞态条件
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
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
      body: JSON.stringify({
        amount,
        description,
        product: 'fashion',
        metadata,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        newBalance: data.newBalance || 0,
        error: data.error || 'Failed to deduct credits'
      }
    }

    return data
  }
}
```

**环境变量**

添加到 `fashion-wizpulseai-com/.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3012
```

---

### Step 3: 迁移现有代码 (1-2小时)

**修改 Fashion 分析 API**

文件: `fashion-wizpulseai-com/src/app/api/fashion/analyze/route.ts`

找到这段代码（约 190-236 行）:

```typescript
// 修改前 ❌
import { CreditsService } from '@/domains/credits/services/credits.service'

const hasCredits = await CreditsService.hasEnoughCredits(user.id, creditsToUse)
if (hasCredits) {
  const result = await CreditsService.deductCredits(
    user.id,
    creditsToUse,
    `AI穿搭分析 - ${visionResult.aiModel || 'gemini-2.5-flash'}`,
    { ... }
  )
  creditsDeducted = creditsToUse
  newBalance = result.newBalance
}
```

改为:

```typescript
// 修改后 ✅
import { DashboardCreditsClient } from '@/lib/credits/dashboard-client'

const hasCredits = await DashboardCreditsClient.hasEnoughCredits(user.id, creditsToUse)
if (hasCredits) {
  const result = await DashboardCreditsClient.deductCredits(
    user.id,
    creditsToUse,
    `AI穿搭分析 - ${visionResult.aiModel || 'gemini-2.5-flash'}`,
    {
      photoId,
      aiModel: visionResult.aiModel,
      tokenUsage: visionResult.tokenUsage,
      apiCostUsd: apiCostUsd.toFixed(6),
      pricing: { input: '$0.15/1M', output: '$0.60/1M' },
    }
  )

  if (result.success) {
    creditsDeducted = creditsToUse
    newBalance = result.newBalance
  } else {
    console.log(`[Analyze] ⚠️ 积分扣除失败: ${result.error}`)
  }
}
```

**废弃旧服务**

文件: `fashion-wizpulseai-com/src/domains/credits/services/credits.service.ts`

在文件开头添加:

```typescript
/**
 * @deprecated 使用 DashboardCreditsClient 替代
 *
 * 迁移指南:
 * - import { DashboardCreditsClient } from '@/lib/credits/dashboard-client'
 * - CreditsService.getBalance() → DashboardCreditsClient.getBalance()
 * - CreditsService.deductCredits() → DashboardCreditsClient.deductCredits()
 * - CreditsService.hasEnoughCredits() → DashboardCreditsClient.hasEnoughCredits()
 *
 * 原因: 统一使用 Dashboard API，避免代码重复和竞态条件风险
 */
export class CreditsService { ... }
```

---

### Step 4: 测试 (1小时)

**本地测试流程**

```bash
# 1. 启动 Dashboard (localhost:3012)
cd db-wizPulseAI-com
npm run dev

# 2. 启动 Fashion (localhost:3013)
cd fashion-wizpulseai-com
npm run dev

# 3. 测试完整流程
# 在浏览器登录 Fashion 站点
# 上传照片并分析
# 检查控制台日志，确认积分扣除成功

# 4. 验证 Dashboard API 被调用
# Dashboard 控制台应该显示：
# POST /api/credits/deduct
```

**测试用例**

- [ ] 正常扣除积分（余额足够）
- [ ] 余额不足时返回错误
- [ ] 未登录时返回 401
- [ ] CORS 配置正确（Fashion 可以访问 Dashboard）
- [ ] Token 过期时自动刷新

---

## 清理步骤（可选）

**完成测试后，可以删除旧代码**

```bash
# Fashion 站点删除重复代码
rm -rf fashion-wizpulseai-com/src/domains/credits/services/
rm fashion-wizpulseai-com/src/lib/credits/service.ts

# 搜索残留引用
cd fashion-wizpulseai-com
grep -r "CreditsService" src/
# 应该只剩下 @deprecated 注释
```

---

## 风险和降级方案

### 风险 1: Dashboard API 宕机

**影响**: Fashion 无法扣除积分

**降级方案**:
```typescript
// DashboardCreditsClient 中添加降级逻辑
static async deductCredits(...) {
  try {
    // 尝试调用 Dashboard API
    return await this.deductViaAPI(...)
  } catch (error) {
    console.error('Dashboard API 失败，使用降级方案:', error)
    // 降级：直接访问数据库（临时）
    return await this.deductViaDatabase(...)
  }
}
```

### 风险 2: CORS 配置错误

**影响**: 跨域请求被阻止

**检测方法**:
```bash
# 浏览器控制台应该不会显示 CORS 错误
# Access to fetch at 'http://localhost:3012/api/credits/deduct' from origin 'http://localhost:3013' has been blocked by CORS policy
```

**修复**:
- 检查 Dashboard 的 CORS headers
- 检查环境变量 `NEXT_PUBLIC_FASHION_URL`

---

## 验收标准 ✅

完成后应满足:

- [ ] Dashboard 有 `/api/credits/deduct` API
- [ ] Fashion 有 `DashboardCreditsClient` 客户端
- [ ] Fashion 分析 API 使用新客户端扣除积分
- [ ] 本地测试通过（正常流程 + 错误处理）
- [ ] 旧服务标记 `@deprecated`
- [ ] 无 TypeScript 编译错误
- [ ] 无 CORS 错误

---

## 下一步

**立即开始**: 创建 Dashboard API

```bash
cd db-wizPulseAI-com
code src/app/api/credits/deduct/route.ts
```

**参考文档**: [完整调查报告](./P0-PAY-3-CREDIT-SERVICE-INVESTIGATION.md)

---

**更新时间**: 2025-12-16
**预计完成**: 2025-12-17
