# 支付欺诈防护指南

> 最后更新: 2025-01-27

## 1. 风险概述

### "测活"攻击 (Card Testing)

黑产利用网站支付接口测试盗取的信用卡是否有效。

```
攻击流程:
盗取大量信用卡号 → 找在线支付网站 → 小额支付测试
    ↓                                    ↓
成功 = "活卡" → 大额消费              失败 = 废卡丢弃
    ↓
持卡人争议(Chargeback) → Stripe 认定网站违规 → 账户封禁
```

### 为什么 wizPulseAI 是目标

- 有公开的支付接口（积分购买）
- 支持信用卡支付
- 有低价商品（小额积分包适合测卡）

### 后果

| 指标 | 阈值 | 后果 |
|------|------|------|
| Chargeback 率 | > 0.75% | Stripe 警告 |
| Chargeback 率 | > 1.0% | 账户冻结/封号 |
| 大量失败交易 | 短时间内 | 账户审查 |
| 严重违规 | - | 资金扣押 + 永久拉黑 |

---

## 2. Stripe Radar 配置

### 2.1 Radar 基础（免费，默认启用）

Stripe 默认提供基础机器学习反欺诈，但不够。

**操作路径**: Stripe Dashboard → 更多 → Radar → 规则

### 2.2 建议手动添加的 Radar 规则

#### 阻止规则 (Block)

| 规则 | 条件 | 说明 |
|------|------|------|
| 同一IP批量测卡 | 同一 IP，1小时内 > 3 次支付尝试 | 防机器人 |
| 同一邮箱重复失败 | 同一邮箱，1小时内 > 3 次失败 | 防暴力测试 |
| 高风险国家 | Radar 风险分 > 75 | 自动阻止高风险交易 |
| CVC 验证失败 | CVC check = fail | 没有卡背面安全码 |

#### 审核规则 (Review)

| 规则 | 条件 | 说明 |
|------|------|------|
| 卡与IP国家不匹配 | card_country != ip_country | 跨国盗刷嫌疑 |
| 新账户+最低金额 | 注册 < 1小时 + 购买最低档 | 典型测活模式 |
| 一次性邮箱 | 邮箱域名为临时邮箱 | 批量注册嫌疑 |

### 2.3 Radar 规则配置示例

在 Stripe Dashboard → Radar → Rules 中添加:

```
# 阻止: 同IP短时间多次尝试
Block if :ip_address_count_for_ip: > 3 AND :seconds_since_first_seen: < 3600

# 阻止: CVC 验证失败
Block if :cvc_check: = 'fail'

# 审核: 卡和IP国家不匹配
Review if :card_country: != :ip_country:

# 审核: 高风险评分
Review if :risk_score: > 65
```

---

## 3. 3D Secure (3DS) 验证

### 3.1 什么是 3DS

3D Secure 是信用卡组织的持卡人验证机制，要求持卡人在支付时通过银行的额外验证（短信验证码、银行APP确认等）。

### 3.2 为什么必须开启

| 好处 | 说明 |
|------|------|
| 防测卡 | 机器人无法通过 3DS 验证 |
| 免责保护 | 通过 3DS 的交易，Chargeback 责任转移给银行 |
| 降低风险 | 欺诈率大幅下降 |

### 3.3 代码配置

Stripe Checkout 中设置 `payment_method_options`:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... 其他配置
  payment_method_options: {
    card: {
      request_three_d_secure: 'automatic', // 推荐: 让 Stripe 智能判断
      // 或 'any' - 强制所有交易都走 3DS
    },
  },
});
```

**建议**: 出海业务使用 `'any'`（强制 3DS），虽然会略微增加支付摩擦，但大幅降低欺诈风险。

---

## 4. 代码层面防护

### 4.1 速率限制

```typescript
// API 层面: 限制同一用户/IP 的支付请求频率
// 建议: 同一用户每分钟最多 3 次支付请求
// 建议: 同一 IP 每小时最多 10 次支付请求
```

### 4.2 最低金额

```typescript
// 设置最低支付金额，增加测卡成本
// 建议: 最低积分包 ≥ 500 日元 (约 $3.50)
```

### 4.3 新账户限制

```typescript
// 新注册用户延迟开放支付
// 建议: 注册后 30 分钟才能购买
// 或: 新用户首次购买需要邮箱验证
```

### 4.4 Webhook 监控

```typescript
// 监控以下 Webhook 事件:
// charge.dispute.created - 争议创建
// charge.failed - 支付失败
// radar.early_fraud_warning.created - 早期欺诈预警
```

---

## 5. 监控与报警

### 5.1 日常监控指标

| 指标 | 正常范围 | 报警阈值 |
|------|----------|----------|
| 支付成功率 | > 90% | < 80% |
| Chargeback 率 | < 0.5% | > 0.5% |
| 同一IP失败次数 | < 3/小时 | > 5/小时 |
| 新账户支付比例 | < 30% | > 50% |

### 5.2 Stripe Dashboard 监控

**操作路径**: Stripe Dashboard → 更多 → Radar → Overview

定期检查:
- [ ] 每周查看 Radar 拦截统计
- [ ] 每月查看 Chargeback 率
- [ ] 关注 Early Fraud Warning 邮件

---

## 6. 应急响应

### 6.1 发现大量测卡时

1. **立即**: 在 Stripe Radar 中添加阻止规则（IP/邮箱域名）
2. **短期**: 临时提高 3DS 验证级别为 `'any'`
3. **排查**: 检查被测的卡是否产生了成功交易
4. **退款**: 主动退款可疑交易（避免 Chargeback）

### 6.2 收到 Chargeback 时

1. 在 Stripe Dashboard 查看争议详情
2. 如果是欺诈交易，接受争议（不要 fight）
3. 检查同一来源是否有其他可疑交易
4. 加强 Radar 规则

---

## 7. 实施清单

### 立即执行

- [ ] 登录 Stripe Dashboard 确认 Radar 已启用
- [ ] 添加 Radar 阻止规则（同IP、CVC失败）
- [ ] 添加 Radar 审核规则（跨国、高风险）
- [ ] 代码中开启 3DS 验证

### 短期（1-2周）

- [ ] 实现 API 速率限制
- [ ] 设置最低支付金额
- [ ] 添加 Webhook 监控（争议、失败）

### 长期

- [ ] 考虑升级 Radar for Fraud Teams（付费版，更多规则）
- [ ] 实现新账户支付延迟
- [ ] 建立定期安全审查机制

---

## 参考资料

- Stripe Radar 文档: https://stripe.com/docs/radar
- Stripe 3DS 文档: https://stripe.com/docs/payments/3d-secure
- Stripe Chargeback 指南: https://stripe.com/docs/disputes
