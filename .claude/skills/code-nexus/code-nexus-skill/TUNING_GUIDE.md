# code-nexus 调优指南

> 在新项目上使用 code-nexus 时的经验总结

## 第一次扫描后的典型问题

### 1. 解析率低 (< 30%)

**症状**: `Symbol resolution: XX% calls resolved`

**原因 & 解决**:

| 原因 | 解决方法 |
|------|---------|
| 框架/库方法被当成项目代码 | 在 `BUILTINS` 和 `BUILTIN_PREFIXES` 中添加该项目用的框架 |
| Array/String prototype 方法 | 已内置 `PROTOTYPE_METHODS`，确认覆盖全 |
| `@/` 路径别名不识别 | indexer 自动读 tsconfig.json，确认 `paths` 配置正确 |
| 第三方库对象调用 | 在 `THIRD_PARTY_OBJECTS` 中添加项目用的库名 |
| React useState setter | 已内置过滤 `setXxx()` 模式 |

### 2. 项目特定适配

**每个项目可能需要调整的地方**:

```javascript
// 1. THIRD_PARTY_OBJECTS — 添加项目使用的库
const THIRD_PARTY_OBJECTS = new Set([
  'supabase', 'stripe', 'toast',  // 我们项目的
  'prisma', 'mongoose',            // 如果用 Prisma/Mongo
  'axios', 'got',                  // HTTP 库
  'dayjs', 'moment',               // 日期库
]);

// 2. BUILTIN_PREFIXES — 添加项目特有的前缀
const BUILTIN_PREFIXES = [
  'ctx.',     // Koa context
  'app.',     // Express app
  'db.',      // 数据库客户端
];

// 3. IGNORE_DIRS — 添加项目特有的忽略目录
const IGNORE_DIRS = new Set([
  'public',    // 静态文件
  'scripts',   // 构建脚本（看情况）
  'e2e',       // 测试目录
]);
```

### 3. 路径别名

indexer 自动检测 `tsconfig.json` 中的 `compilerOptions.paths`。

支持的格式:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

不支持的格式:
- 多个映射目标 (`"@/*": ["./src/*", "./lib/*"]`)
- 非 `*` 通配符
- `baseUrl` 隐式解析

### 4. 典型调优流程

```
1. 首次扫描
   node indexer.js /path/to/project --force

2. 查看 unresolved
   sqlite3 code-nexus.db "SELECT to_name, COUNT(*) FROM calls WHERE to_symbol_id IS NULL GROUP BY to_name ORDER BY COUNT(*) DESC LIMIT 20"

3. 分类 unresolved:
   - 框架调用 → 加到 BUILTINS 或 THIRD_PARTY_OBJECTS
   - prototype 方法 → 加到 PROTOTYPE_METHODS
   - 项目真正的函数 → 检查 import 路径是否能解析

4. 重新扫描
   rm code-nexus.db && node indexer.js /path/to/project --force

5. 重复直到 >80% 解析率
```

## v2 改进记录 (2026-04-07)

### 从 19% 到 91% 的改动

| 改动 | 效果 |
|------|------|
| import→file→method 链式解析 | method 调用能追到源文件 |
| `@/` 路径别名 (tsconfig) | 37% import 路径解析 |
| 扩大 builtin 列表 (~100项) | 过滤掉 ~300 个噪音 |
| prototype 方法过滤 (~60项) | 过滤掉 ~400 个 .map/.includes 等 |
| React setState 过滤 | 过滤 setXxx() |
| 第三方库对象过滤 | supabase/toast/router 等 |
| 深链过滤 (>2层) | a.b.c.d() 不追踪 |
| interface/type/enum 检测 | TypeScript 符号完整性 |

### 数据对比

| | v1 | v2 |
|--|-----|-----|
| 总调用 | 2038 | 568 (过滤了噪音) |
| 已解析 | 391 | 516 |
| 解析率 | 19% | 91% |
| symbol 种类 | 5种 | 8种 (+interface/type/enum) |
