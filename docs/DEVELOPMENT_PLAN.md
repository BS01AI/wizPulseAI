# WizPulseAI 开发规划方案

## 项目现状总结

### 三站点架构
1. **auth.wizpulseai.com** - 认证中心 ✅
   - 统一登录/注册/密码重置
   - SSO通过顶级域Cookie实现
   - 多语言支持(ja/zh/en)

2. **dashboard.wizpulseai.com** - 用户仪表盘 ✅
   - 用户管理、订阅管理
   - Stripe支付集成
   - 管理员功能

3. **www.wizpulseai.com** - 主站 ✅
   - 产品展示
   - 知识中心
   - 公司信息

### 技术栈统一
- Next.js 14 + TypeScript
- Supabase (认证+数据库)
- Stripe (支付)
- Tailwind CSS + shadcn/ui

## 开发规划

### Phase 1: 系统优化与稳定 (1-2周)

#### 1.1 技术债务清理
- [ ] 统一Supabase客户端版本到 @supabase/ssr
- [ ] 删除未使用的组件和代码
- [ ] 优化Bundle大小

#### 1.2 用户体验改进
- [ ] 修复邮箱确认双页面问题
- [ ] 添加新用户引导流程
- [ ] 优化移动端响应式设计

#### 1.3 安全性增强
- [ ] 实施API速率限制
- [ ] 添加操作日志记录
- [ ] 完善错误处理机制

### Phase 2: 核心功能开发 (2-3周)

#### 2.1 用户系统完善
```typescript
// 用户Profile扩展
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  company?: string;
  language: 'ja' | 'zh' | 'en';
  timezone: string;
  created_at: string;
  updated_at: string;
}

// API密钥管理
interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}
```

#### 2.2 产品试用功能
1. **QuickSlide** - 演示文稿生成
   - 集成到主站 /products/quickslide/try
   - 限制免费用户使用次数
   - 通过Dashboard查看使用记录

2. **AI Writer** - 文章生成
   - 基础模板选择
   - 字数限制（免费/付费）
   - 导出功能

#### 2.3 使用统计Dashboard
```typescript
// 使用记录追踪
interface UsageRecord {
  id: string;
  user_id: string;
  feature_code: string;
  product_id: string;
  quantity: number;
  metadata: {
    ip_address?: string;
    user_agent?: string;
    request_id?: string;
  };
  created_at: string;
}

// Dashboard统计视图
- 本月使用量
- 剩余配额
- 使用趋势图
- 产品使用分布
```

### Phase 3: 付费系统深度集成 (2-3周)

#### 3.1 订阅管理优化
- [ ] 套餐对比页面
- [ ] 升级/降级流程优化
- [ ] 按量计费选项
- [ ] 企业定制方案

#### 3.2 功能权限控制
```typescript
// 功能访问控制
async function checkFeatureAccess(
  userId: string, 
  featureCode: string
): Promise<{
  hasAccess: boolean;
  remainingQuota?: number;
  resetDate?: Date;
}> {
  // 1. 检查用户订阅状态
  // 2. 检查功能配额
  // 3. 检查使用记录
  // 4. 返回访问权限
}
```

#### 3.3 支付流程优化
- [ ] 多币种支持 (JPY/CNY/USD)
- [ ] 发票自动生成
- [ ] 退款流程
- [ ] 优惠券系统

### Phase 4: API开放平台 (3-4周)

#### 4.1 API Gateway搭建
```typescript
// API端点设计
POST /api/v1/quickslide/generate
POST /api/v1/writer/generate
POST /api/v1/voice/synthesize
POST /api/v1/art/generate
POST /api/v1/code/complete

// 认证头
Authorization: Bearer <api_key>
X-API-Version: 1.0
```

#### 4.2 开发者门户
- [ ] API文档 (OpenAPI规范)
- [ ] SDK生成 (TypeScript/Python/Go)
- [ ] 交互式API测试工具
- [ ] 使用示例和教程

#### 4.3 监控与分析
- [ ] API调用监控
- [ ] 性能指标追踪
- [ ] 异常告警
- [ ] 使用分析报告

### Phase 5: 企业功能 (4-5周)

#### 5.1 团队协作
- [ ] 团队账户管理
- [ ] 成员权限分配
- [ ] 共享资源库
- [ ] 协作历史记录

#### 5.2 企业集成
- [ ] SSO集成 (SAML/OAuth)
- [ ] 审计日志
- [ ] 合规报告
- [ ] SLA保证

## 实施建议

### 优先级排序
1. **P0 - 立即执行**
   - 技术债务清理
   - 安全性增强
   - 用户体验改进

2. **P1 - 短期目标**
   - 产品试用功能
   - 使用统计展示
   - API密钥管理

3. **P2 - 中期目标**
   - 付费系统优化
   - API开放平台
   - 开发者工具

4. **P3 - 长期目标**
   - 企业功能
   - 国际化扩展
   - 性能优化

### 技术决策
1. **保持现有架构**
   - 不做大的架构调整
   - 渐进式改进
   - 确保向后兼容

2. **统一开发规范**
   - TypeScript严格模式
   - 统一的错误处理
   - 完整的类型定义

3. **测试策略**
   - 单元测试覆盖核心功能
   - E2E测试关键流程
   - 性能测试API端点

### 部署策略
1. **环境管理**
   - Development: 本地开发
   - Staging: 预发布测试
   - Production: 生产环境

2. **发布流程**
   - Feature Branch开发
   - Pull Request审核
   - 自动化测试
   - 渐进式发布

## 下一步行动

### 立即开始 (本周)
1. 创建技术债务清理任务列表
2. 设置开发环境和CI/CD
3. 开始第一个产品试用功能开发

### 团队准备
1. 前端开发: 1-2人
2. 后端开发: 1人
3. UI/UX设计: 兼职支持
4. 测试: 开发人员兼任

### 关键里程碑
- Week 2: 技术债务清理完成
- Week 4: 第一个产品试用功能上线
- Week 6: 付费系统优化完成
- Week 10: API v1.0发布
- Week 14: 企业功能MVP

## 风险与缓解

### 技术风险
- **风险**: Supabase限制
- **缓解**: 提前评估配额，准备自建方案

### 业务风险
- **风险**: 用户增长缓慢
- **缓解**: 免费试用吸引用户，优化转化漏斗

### 安全风险
- **风险**: API滥用
- **缓解**: 严格的速率限制和监控

## 成功指标

### 技术指标
- 页面加载时间 < 2秒
- API响应时间 < 200ms
- 系统可用性 > 99.9%

### 业务指标
- 月活跃用户增长 20%
- 付费转化率 > 5%
- 用户满意度 > 4.5/5

### 运营指标
- 客户支持响应时间 < 24小时
- Bug修复时间 < 48小时
- 新功能发布周期 < 2周

---

最后更新: 2025/1/29