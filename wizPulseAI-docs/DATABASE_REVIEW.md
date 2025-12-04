# WizPulseAI 数据库架构 Review 文档

> **版本**: v1.0
> **创建日期**: 2025-12-03
> **项目**: wizPulseAI-Local (Supabase ID: lhofjwiqjqjtycnhliga)
> **状态**: 🔍 Review 进行中

---

## 1. 执行摘要

### 1.1 Review 目的
- 全面了解当前数据库架构
- 识别设计问题和优化空间
- 对齐业务需求与数据模型
- 制定优化改造计划

### 1.2 关键发现

| 类别 | 数量 | 说明 |
|------|------|------|
| 表总数 | 17 | 覆盖用户、订阅、AI产品、API等 |
| 安全警告 | 33 | 2个ERROR + 31个WARN |
| 性能警告 | 75 | 需要优化RLS和索引 |
| 数据空洞 | 5表 | products/prices/features等无数据 |

### 1.3 主要问题

1. **🔴 架构分裂**: Dashboard数据库 vs Fashion Advisor数据库设计不统一
2. **🟡 数据空洞**: Stripe同步未配置，核心表无数据
3. **🟡 功能重叠**: 三套使用追踪机制并存
4. **🟡 安全漏洞**: 27个函数缺少search_path设置

---

## 2. 业务需求分析

### 2.1 品牌架构（来自WEBSITE_ARCHITECTURE.md）

```
                wizPulseAI (母品牌)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    WizLife       WizBiz      QuickSlide
   (生活AI)      (商务AI)      (创作AI)
        │             │
   Fashion等     Research等
```

### 2.2 站点矩阵

| 站点类型 | 域名 | 数据库需求 |
|---------|------|-----------|
| **核心站点** | | |
| 主站 | www.wizpulseai.com | 内容展示 |
| 认证中心 | auth.wizpulseai.com | auth.users |
| 用户中心 | dashboard.wizpulseai.com | 全部17表 |
| **产品站点** | | |
| Fashion Advisor | fashion.wizpulseai.com | Fashion专属表 |
| QuickSlide | quickslide.wizpulseai.com | 待定 |

### 2.3 核心业务流程

```
用户注册 → 选择套餐 → 订阅付费 → 使用AI产品 → 追踪用量 → 续费/升级
   │           │           │            │           │
 users    products    subscriptions  ai_products  usage_records
          prices                     api_keys    api_key_usage
          features                              resource_access_logs
```

---

## 3. 当前数据库架构

### 3.1 表分类概览

#### A. 用户核心层 (3表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `users` | 2行 | 用户主表 | ✅ 正常 |
| `subscriptions` | 0行 | 订阅记录 | ⚠️ 无数据 |
| `usage_records` | 0行 | 功能使用记录 | ⚠️ 无数据 |

#### B. Stripe集成层 (4表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `products` | 0行 | Stripe产品 | 🔴 未同步 |
| `prices` | 0行 | Stripe价格 | 🔴 未同步 |
| `features` | 0行 | 功能定义 | 🔴 未初始化 |
| `plan_features` | 0行 | 套餐功能关联 | 🔴 未配置 |

#### C. AI产品层 (3表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `ai_products` | 4行 | AI产品定义 | ✅ 正常 |
| `resource_permissions` | 6行 | 资源权限控制 | ✅ 正常 |
| `resource_access_logs` | 0行 | 访问日志 | ⚠️ 无数据 |

#### D. API系统层 (3表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `api_keys` | 0行 | API密钥管理 | ⚠️ 未使用 |
| `api_key_usage` | 0行 | API使用记录 | ⚠️ 未使用 |
| `rate_limit_usage` | 0行 | 速率限制 | ⚠️ 未使用 |

#### E. 配置管理层 (2表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `site_config` | 15行 | 站点配置 | ✅ 正常 |
| `config_history` | 0行 | 配置历史 | ⚠️ 无数据 |

#### F. 审计层 (1表)
| 表名 | 数据量 | 职责 | 健康度 |
|------|--------|------|--------|
| `audit_logs` | 1行 | 审计日志 | ✅ 正常 |

### 3.2 ER关系图

```
                         ┌─────────────────┐
                         │   auth.users    │
                         │  (Supabase内置)  │
                         └────────┬────────┘
                                  │
     ┌────────────────────────────┼────────────────────────────┐
     │                            │                            │
     ▼                            ▼                            ▼
┌─────────┐              ┌───────────────┐           ┌───────────────┐
│  users  │              │   api_keys    │           │  audit_logs   │
│  (2行)  │              │               │           │    (1行)      │
└────┬────┘              └───────┬───────┘           └───────────────┘
     │                           │
     │                           ▼
     │                   ┌───────────────┐
     │                   │ api_key_usage │
     │                   └───────────────┘
     │
     ├─────────────────────────────────────────┐
     │                                         │
     ▼                                         ▼
┌─────────────┐    ┌────────┐    ┌─────────┐   ┌───────────────┐
│subscriptions│───▶│ prices │───▶│products │◀──│  ai_products  │
└─────────────┘    └────────┘    └────┬────┘   │     (4行)     │
                                      │        └───────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │plan_features │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   features   │
                               └──────────────┘
```

---

## 4. 问题清单

### 4.1 🔴 P0 - 架构级问题

#### 问题1: 两套数据库设计不统一

**现象**：
- Dashboard使用当前17表设计
- Fashion Advisor有独立的10表设计（见DATABASE_DESIGN.md）

**Fashion Advisor设计的表（当前数据库不存在）**：
```
- user_credits           # 用户积分
- credit_transactions    # 积分流水
- user_photos           # 用户照片
- style_analyses        # AI分析结果
- generated_outfits     # AI生成图
- user_fashion_profiles # 时尚档案
- user_storage_quotas   # 存储配额
- personalization_options # 个性化选项
```

**影响**：
- Fashion站点可能在用另一个Supabase项目？
- 或者这些表还未创建？
- 用户数据无法跨产品共享

**待确认**：
- [ ] Fashion站点的Supabase项目ID是什么？
- [ ] 是否需要统一到一个数据库？

---

#### 问题2: Stripe同步未配置

**现象**：
```
products: 0行
prices: 0行
subscriptions: 0行
```

**预期**：
- 应该从Stripe同步套餐数据
- Webhook应该自动更新订阅状态

**影响**：
- 用户无法订阅付费套餐
- Dashboard显示"Free Plan"但无法升级

**待确认**：
- [ ] Stripe Webhook是否配置？
- [ ] 是否有初始套餐数据需要导入？

---

### 4.2 🟡 P1 - 设计问题

#### 问题3: 三套使用追踪机制

| 机制 | 表 | 用途 | 状态 |
|------|-----|------|------|
| 功能使用 | `usage_records` | 追踪feature使用 | 设计完成，未使用 |
| API使用 | `api_key_usage` | 追踪API调用 | 设计完成，未使用 |
| 资源访问 | `resource_access_logs` | 追踪文章/产品访问 | 设计完成，未使用 |

**问题**：
- 职责重叠，边界不清
- 哪个场景用哪个表？

**建议**：
- 明确各表的使用场景
- 或考虑合并为统一的使用追踪表

---

#### 问题4: 外键关联不一致

**部分表引用 `auth.users.id`**：
```sql
resource_access_logs.user_id → auth.users.id
api_keys.user_id → auth.users.id
audit_logs.user_id → auth.users.id
config_history.changed_by → auth.users.id
```

**另一部分引用 `public.users.id`**：
```sql
subscriptions.user_id → public.users.id
usage_records.user_id → public.users.id
```

**问题**：
- 查询时需要混合JOIN两个表
- RLS策略复杂化

**建议**：
- 统一引用 `public.users.id`
- 或全部引用 `auth.users.id`

---

### 4.3 🟠 P2 - 安全问题

#### 问题5: Security Definer View (2个 ERROR)

**受影响视图**：
- `recent_audit_logs`
- `active_api_keys`

**风险**：
- 视图使用创建者权限而非查询者权限
- 可能绕过RLS策略

**修复**：
```sql
-- 重新创建视图，移除 SECURITY DEFINER
CREATE OR REPLACE VIEW xxx AS ... WITH (security_invoker = true);
```

---

#### 问题6: Function Search Path (27个 WARN)

**受影响函数**：
```
update_site_config_updated_at
update_ai_products_updated_at
set_resource_access_date_fields
create_api_key
verify_api_key
is_admin
log_audit
... (共27个)
```

**风险**：
- SQL注入攻击可能通过修改search_path
- 函数可能访问错误的schema

**修复**：
```sql
-- 为每个函数添加
ALTER FUNCTION xxx SET search_path = '';
```

---

### 4.4 🔵 P3 - 性能问题

#### 问题7: 未使用索引 (37个)

**示例**：
```
idx_site_config_key
idx_site_config_category
idx_api_keys_user_id
idx_api_keys_key_hash
idx_audit_logs_user_id
... (共37个)
```

**原因**：
- 表数据量太少
- 功能尚未上线使用

**建议**：
- 暂不删除，等功能上线后重新评估
- 记录索引设计意图

---

#### 问题8: RLS Initplan问题 (24个)

**问题代码**：
```sql
-- 低效写法（每行重新计算）
auth.uid() = user_id

-- 高效写法（只计算一次）
(select auth.uid()) = user_id
```

**受影响表**：
- subscriptions
- usage_records
- users
- site_config
- api_keys
- api_key_usage
- resource_access_logs
- rate_limit_usage
- config_history

---

## 5. Fashion Advisor 数据库对比

### 5.1 设计文档 vs 实际数据库

| Fashion设计的表 | Dashboard数据库 | 差异 |
|----------------|----------------|------|
| user_credits | ❌ 不存在 | Fashion专属 |
| credit_transactions | ❌ 不存在 | Fashion专属 |
| subscriptions | ✅ 存在 | 结构不同 |
| user_photos | ❌ 不存在 | Fashion专属 |
| style_analyses | ❌ 不存在 | Fashion专属 |
| generated_outfits | ❌ 不存在 | Fashion专属 |
| user_fashion_profiles | ❌ 不存在 | Fashion专属 |
| user_storage_quotas | ❌ 不存在 | Fashion专属 |
| personalization_options | ❌ 不存在 | Fashion专属 |

### 5.2 架构决策点

**方案A: 统一数据库**
```
优点：
- 用户数据共享
- SSO天然支持
- 运维简单

缺点：
- 表数量增加
- 可能有命名冲突
```

**方案B: 分离数据库**
```
优点：
- 产品独立
- 故障隔离
- 灵活扩展

缺点：
- 用户需要在多个库同步
- SSO复杂化
```

**待讨论**：
- [ ] Fashion站点当前用的是哪个数据库？
- [ ] 未来新产品（QuickSlide等）如何规划？

---

## 6. 优化路线图

### Phase 1: 信息收集 (本次)
- [x] 获取当前表结构
- [x] 获取安全/性能警告
- [x] 对比设计文档
- [x] 创建Review文档
- [ ] 确认Fashion站点数据库情况
- [ ] 确认Stripe配置情况

### Phase 2: 架构决策
- [ ] 确定统一vs分离策略
- [ ] 确定外键引用标准
- [ ] 确定使用追踪策略
- [ ] 更新架构设计文档

### Phase 3: 安全修复
- [ ] 修复2个SECURITY DEFINER视图
- [ ] 修复27个函数search_path
- [ ] 优化RLS策略
- [ ] 启用密码泄露保护
- [ ] 配置MFA选项

### Phase 4: 性能优化
- [ ] 优化RLS Initplan (24处)
- [ ] 合并重复RLS策略 (32处)
- [ ] 清理重复索引
- [ ] 评估未使用索引

### Phase 5: 数据初始化
- [ ] 配置Stripe Webhook
- [ ] 同步products/prices数据
- [ ] 初始化features数据
- [ ] 配置plan_features关联

---

## 7. 待讨论问题

### Q1: Fashion站点数据库
Fashion Advisor站点（fashion.wizpulseai.com）使用的是：
- [ ] A. 同一个Supabase项目 (lhofjwiqjqjtycnhliga)
- [ ] B. 独立的Supabase项目
- [ ] C. 还未连接数据库

### Q2: Stripe集成状态
当前Stripe Webhook配置情况：
- [ ] A. 已配置，但未触发
- [ ] B. 未配置
- [ ] C. 配置有误

### Q3: 使用追踪策略
三个使用追踪表的使用场景：
- `usage_records`: 用于___?
- `api_key_usage`: 用于___?
- `resource_access_logs`: 用于___?

### Q4: 未来产品规划
QuickSlide等新产品上线时：
- [ ] A. 共用当前数据库，添加产品专属表
- [ ] B. 创建独立数据库
- [ ] C. 其他方案

---

## 8. 参考文档

- [Dashboard架构设计](./DASHBOARD_ARCHITECTURE_DESIGN.md)
- [网站架构](./WEBSITE_ARCHITECTURE.md)
- [Fashion数据库设计](../fashion-wizpulseai-com/docs/DATABASE_DESIGN.md)
- [配置中心设计](./CONFIG_CENTER_DESIGN.md)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)

---

*文档维护：Claude Code AI*
*最后更新：2025-12-03*
