# WizPulseAI 下一步开发计划

> 更新日期: 2025-10-29
> 当前阶段: 本地测试准备完成 ✅

---

## 📍 当前状态

### ✅ 已完成
1. **环境配置完整性检查**
   - 3个站点依赖已安装
   - Supabase 配置统一
   - Auth 站点配置已更新

2. **本地测试工具准备**
   - `LOCAL_TEST_GUIDE.md` - 完整测试指南
   - `start-all.sh` - 一键启动脚本
   - `stop-all.sh` - 一键停止脚本

3. **技术债务评估**
   - 已识别关键问题（见 CLAUDE.md）
   - 制定了优化方向

---

## 🎯 立即行动 (今天/本周)

### Phase 0: 本地测试验证 🔥

**目标**: 确保3个站点可以正常运行和协同工作

#### 步骤1: 启动所有站点
```bash
# 方式1: 使用脚本（推荐）
./start-all.sh

# 方式2: 手动启动
# Terminal 1
cd auth-wizpulseai-com && npm run dev -- -p 3001

# Terminal 2
cd db-wizPulseAI-com && npm run dev -- -p 3002

# Terminal 3
cd wizPulseAI-com && npm run dev
```

#### 步骤2: 验证独立功能
- [ ] Main 站点首页能访问
- [ ] Auth 站点登录页能显示
- [ ] Dashboard 仪表盘能加载

#### 步骤3: 验证 SSO 流程
- [ ] 从 Dashboard 登录
- [ ] 验证 Main 站点登录状态同步
- [ ] 测试登出同步

#### 步骤4: 记录问题
```bash
# 如果发现问题，记录到测试指南的"测试结果"部分
vim LOCAL_TEST_GUIDE.md
```

**预计时间**: 2-3小时

---

## 🚀 短期目标 (1-2周)

### Phase 1: 关键问题修复

#### 1.1 Cookie 跨域问题排查
**优先级**: P0 🔥

**问题描述**:
- 本地开发时 `.localhost` 域可能不生效
- 需要验证 SSO 是否正常工作

**解决方案**:
```bash
# 如果 .localhost 不工作，配置 hosts 文件
sudo vim /etc/hosts

# 添加
127.0.0.1 auth.wizpulseai.local
127.0.0.1 dashboard.wizpulseai.local
127.0.0.1 www.wizpulseai.local
```

**验收标准**:
- ✅ 在 Dashboard 登录后，Main 站点显示已登录
- ✅ Cookie 正确设置在 `.localhost` 或 `.wizpulseai.local` 域
- ✅ 登出时所有站点同步

---

#### 1.2 Supabase 客户端版本统一
**优先级**: P1 🚀

**问题**: 3个站点混用旧版本 (0.10.0) 和新版本

**任务清单**:
- [ ] 审计所有 package.json
- [ ] 统一升级到 `@supabase/ssr` 最新版
- [ ] 更新所有 Auth 相关代码
- [ ] 测试认证流程

**相关文档**: `wizPulseAI-docs/technical-docs/`

---

#### 1.3 用户体验优化
**优先级**: P1 🚀

**问题**: 页面跳转闪烁、白屏

**优化点**:
1. **加载状态组件**
   ```tsx
   // 创建统一的 LoadingState 组件
   // 位置: shared/components/LoadingState.tsx
   ```

2. **AuthWrapper 优化**
   ```tsx
   // 减少认证检查时的白屏
   // 使用骨架屏或加载动画
   ```

3. **智能跳转**
   ```tsx
   // 避免不必要的重定向
   // 保存用户原始访问路径
   ```

**预计时间**: 3-5天

---

### Phase 2: 产品功能开发

#### 2.1 QuickSlide 试用功能
**优先级**: P1 🚀

**目标**: 让用户可以在主站试用 AI 演示文稿生成

**实施步骤**:
1. **设计试用页面**
   - 位置: `wizPulseAI-com/src/app/products/quickslide/try/page.tsx`
   - 简单的表单输入
   - 实时预览

2. **集成 AI 后端**
   - 创建 API 端点: `/api/quickslide/generate`
   - 实现基础的 PPT 生成逻辑
   - 限制免费用户使用次数

3. **使用记录追踪**
   - 在 Supabase 记录使用
   - 在 Dashboard 显示统计

4. **配额控制**
   - 免费用户: 3次/月
   - 付费用户: 根据套餐

**参考**: `DEVELOPMENT_PLAN.md` Phase 2.2

**预计时间**: 5-7天

---

#### 2.2 使用统计 Dashboard
**优先级**: P2

**功能设计**:
```typescript
// Dashboard 页面显示
interface UsageStats {
  // 本月使用量
  currentMonth: {
    quickslide: number;
    aiWriter: number;
    total: number;
  };

  // 剩余配额
  remaining: {
    quickslide: number;
    aiWriter: number;
  };

  // 使用趋势
  trend: {
    date: string;
    count: number;
  }[];
}
```

**UI 设计**:
- 使用 Chart.js 或 Recharts
- 卡片式布局
- 实时更新

**预计时间**: 3-4天

---

## 🎨 中期目标 (1个月)

### Phase 3: 系统优化

#### 3.1 代码重构
- [ ] 创建共享组件库
- [ ] 统一类型定义
- [ ] 提取公共工具函数

#### 3.2 性能优化
- [ ] Bundle size 分析
- [ ] 图片懒加载
- [ ] 代码分割

#### 3.3 测试覆盖
- [ ] E2E 测试关键流程
- [ ] 单元测试核心功能
- [ ] 性能基准测试

---

### Phase 4: API 开放平台

#### 4.1 API Gateway
- [ ] 端点设计
- [ ] 认证机制 (API Key)
- [ ] 速率限制

#### 4.2 开发者门户
- [ ] API 文档生成
- [ ] 交互式测试工具
- [ ] SDK 生成

**参考**: `DEVELOPMENT_PLAN.md` Phase 4

---

## 📋 技术决策待确认

### 1. MCP 插件集成
你提到可以导入 MCP 插件，具体需求是什么？

**可能的应用**:
- [ ] Supabase MCP - 数据库操作
- [ ] Notion MCP - 文档管理
- [ ] Context7 MCP - 外部文档查询

### 2. 部署策略
**选项A**: 继续使用 Vercel
- 优点: 简单、快速
- 缺点: 成本可能较高

**选项B**: 自建服务器
- 优点: 灵活、成本可控
- 缺点: 维护成本

### 3. 数据库优化
当前使用 Supabase，是否需要：
- [ ] 添加 Redis 缓存
- [ ] 实施数据库索引优化
- [ ] 考虑读写分离

---

## 🆘 需要讨论的问题

1. **产品功能优先级**
   - QuickSlide 试用 vs 其他产品试用
   - 哪个产品最容易实现？
   - 哪个产品用户需求最高？

2. **商业模式**
   - 免费试用次数设置
   - 付费套餐设计
   - 企业定制方案

3. **技术栈选择**
   - 是否引入新技术（如 tRPC、Prisma）
   - 前端状态管理方案
   - 组件库选择

---

## 🎯 今天就可以开始

### 选项1: 本地测试 (推荐)
```bash
# 1. 启动所有站点
./start-all.sh

# 2. 按照 LOCAL_TEST_GUIDE.md 进行测试
open LOCAL_TEST_GUIDE.md

# 3. 记录问题并反馈
```

### 选项2: 开始功能开发
```bash
# 创建新分支
git checkout -b feature/quickslide-trial

# 开始开发 QuickSlide 试用功能
cd wizPulseAI-com/src/app/products/quickslide
```

### 选项3: 技术债务清理
```bash
# 创建技术债务分支
git checkout -b refactor/supabase-upgrade

# 开始 Supabase 版本统一工作
```

---

## 📊 进度追踪

建议使用以下工具追踪进度：
1. **GitHub Projects** - 任务管理
2. **Linear** - Sprint 规划
3. **Notion** - 文档和知识库

或者继续使用 CLAUDE.md 记录重要决策和进展。

---

## 💡 建议

基于当前状态，我建议的执行顺序：

1. ✅ **今天**: 本地测试验证 (2-3小时)
2. 🚀 **本周**: Cookie/SSO 问题修复 (如果有问题)
3. 📈 **下周**: QuickSlide 试用功能开发
4. 🔧 **第3周**: Supabase 版本统一
5. 🎨 **第4周**: 用户体验优化

这样可以快速看到成果，同时逐步改善技术债务。

---

最后更新: 2025-10-29
