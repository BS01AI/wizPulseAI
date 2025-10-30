# WizPulseAI MCP 服务器使用指南

> 最后更新: 2025-10-29

## 📦 已配置的 MCP 服务器

### 1. **filesystem** - 本地文件系统操作
**用途**: 读取、写入、搜索项目文件，管理代码结构
**使用场景**: 修改代码文件、创建新组件、搜索代码片段、批量重命名
**示例**: "读取 auth 站点的 package.json"、"在项目中搜索所有使用 Supabase 的文件"

### 2. **notionApi** - Notion 数据库集成
**用途**: 读写 Notion 数据库，管理任务、文档、知识库
**使用场景**: 同步任务状态、记录开发日志、查询项目文档、更新需求清单
**示例**: "从 Notion 获取本周的开发任务"、"更新功能开发进度到 Notion"

### 3. **supabase** - Supabase 项目管理
**用途**: 直接操作 Supabase 数据库、执行 SQL、管理表结构、查看日志
**使用场景**: 查询用户数据、创建数据库表、执行数据迁移、调试 RLS 策略、查看 API 日志
**示例**: "查询 users 表中的所有记录"、"创建 usage_records 表"、"查看最近的认证错误日志"

### 4. **chrome-devtools** - Chrome 浏览器自动化
**用途**: 自动化浏览器操作、截图、调试、网络监控、性能分析
**使用场景**: 自动化测试 UI、截取页面快照、监控网络请求、性能评测、调试前端问题
**示例**: "打开 localhost:3001 并截图"、"检查登录页面的网络请求"、"测试表单提交流程"

### 5. **playwright** - 跨浏览器端到端测试
**用途**: 自动化多浏览器测试（Chrome、Firefox、Safari）、UI 测试、截图对比
**使用场景**: E2E 测试、跨浏览器兼容性测试、回归测试、视觉对比测试
**示例**: "测试完整的用户注册流程"、"验证 SSO 在三个站点的跨域登录"、"截图对比主页改版前后"

### 6. **stripe** - Stripe 支付集成管理
**用途**: 管理订阅、创建支付链接、处理退款、查询客户、管理产品/价格
**使用场景**: 测试支付流程、创建订阅计划、处理客户退款、查询支付记录、管理产品定价
**示例**: "创建新的订阅产品"、"查询最近的支付记录"、"为客户 ID xxx 创建退款"、"生成支付链接"

### 7. **Context7** - 外部文档库查询
**用途**: 查询第三方库的最新文档和代码示例（Next.js、React、Supabase 等）
**使用场景**: 学习新 API、查找最佳实践、解决技术问题、了解库更新
**示例**: "如何在 Next.js 14 中使用 Server Actions"、"Supabase Auth 的 SSR 最佳实践"

---

## 🎯 使用建议

### 开发新功能时
1. **Context7** - 查询相关库的文档和示例
2. **filesystem** - 创建和修改代码文件
3. **supabase** - 创建所需的数据库表和 API
4. **stripe** - 配置支付产品和订阅计划
5. **notionApi** - 记录实现进度和遇到的问题

### 调试问题时
1. **supabase** - 查看错误日志和数据库状态
2. **chrome-devtools** - 实时查看浏览器网络请求和控制台错误
3. **filesystem** - 检查和修改相关代码
4. **Context7** - 查询解决方案和最佳实践
5. **notionApi** - 记录问题和解决方案

### 测试功能时
1. **playwright** - 自动化 E2E 测试流程
2. **chrome-devtools** - 截图验证 UI、监控性能
3. **supabase** - 验证数据库状态
4. **stripe** - 测试支付流程
5. **notionApi** - 记录测试结果

### 项目管理时
1. **notionApi** - 获取和更新任务状态
2. **supabase** - 查看用户数据和使用统计
3. **stripe** - 查看支付数据和订阅统计
4. **filesystem** - 检查代码完成情况
5. **Context7** - 研究新技术方案

---

## 💡 实用组合

### 场景1: 添加新功能
```
1. notionApi - "获取 QuickSlide 试用功能的需求文档"
2. Context7 - "查询 Next.js API Routes 最佳实践"
3. filesystem - "创建 /app/api/quickslide/generate/route.ts"
4. supabase - "创建 usage_records 表来追踪使用记录"
5. stripe - "创建 QuickSlide Pro 订阅产品和定价"
6. notionApi - "更新任务状态为已完成"
```

### 场景2: 修复 Bug
```
1. supabase - "查看最近的错误日志"
2. chrome-devtools - "打开出错页面，查看控制台和网络请求"
3. filesystem - "搜索报错相关的代码文件"
4. Context7 - "查询 Supabase Auth 错误处理方法"
5. filesystem - "修改 auth 中间件代码"
6. notionApi - "记录 Bug 修复过程"
```

### 场景3: 端到端测试
```
1. playwright - "打开 localhost:3001 并测试注册流程"
2. chrome-devtools - "截图保存测试结果"
3. supabase - "验证用户数据是否正确创建"
4. stripe - "验证测试订阅是否创建成功"
5. notionApi - "记录测试结果和覆盖率"
```

### 场景4: 支付功能开发
```
1. Context7 - "查询 Stripe Webhooks 最佳实践"
2. stripe - "创建产品、价格和支付链接"
3. filesystem - "创建 /app/api/stripe/webhook/route.ts"
4. supabase - "创建 subscriptions 表"
5. chrome-devtools - "测试支付流程并截图"
6. playwright - "自动化测试完整支付流程"
7. notionApi - "记录支付功能实现文档"
```

### 场景5: 数据库迁移
```
1. supabase - "查询当前数据库表结构"
2. Context7 - "查询 Supabase 迁移最佳实践"
3. supabase - "执行 SQL 创建新表和索引"
4. filesystem - "更新 TypeScript 类型定义"
5. notionApi - "记录数据库变更日志"
```

---

## 🔧 配置文件位置
[.mcp.json](.mcp.json)

## 📚 相关文档
- [LOCAL_TEST_GUIDE.md](LOCAL_TEST_GUIDE.md) - 本地测试指南
- [NEXT_STEPS.md](NEXT_STEPS.md) - 开发计划
- [CLAUDE.md](CLAUDE.md) - AI 记忆文档

