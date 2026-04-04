# Auto-Execute Batch 001 — 发布前测试 + 代码质量

> 自主执行模式：全部为 Level 1-2 任务，无需人工确认
> 执行方式: `claude --permission-mode auto -p "$(cat .claude/auto-tasks/batch-001.md)"`

---

## 你的身份

你是 wizPulseAI 项目的 PM agent。请按顺序执行以下任务，每完成一个任务更新 TASKS.md 和 WORK_LOG.md。

## 执行前准备

1. 读取 CLAUDE.md（项目全貌）
2. 读取 TASKS.md（当前任务状态）
3. 读取 WORK_LOG.md 前 80 行（最近进度）
4. 确认当前在 dev 分支: `git checkout dev || git checkout -b dev`

## 任务清单

### Task 1: SSO 跨站点配置验证（Level 1 — 纯读取）

**agent**: 201-site-validator 的职责
**做什么**:
1. 检查四站点的 Supabase 配置一致性
   - 读取各站点的 supabase client 文件
   - 检查 Cookie domain、SameSite、secure 设置
2. 检查 CORS 配置
   - 读取所有 API route 的 CORS 设置
   - 确认白名单一致
3. 检查环境变量引用
   - grep 各站点 hardcoded URL
   - 确认都使用了环境变量

**输出**: 写报告到 `docs/reports/sso-config-audit.md`

### Task 2: TypeScript 类型检查（Level 1 — 纯检查）

**做什么**:
1. 对每个站点运行 `npx tsc --noEmit`
2. 收集所有 type error
3. 分类统计
4. 识别可自动修复 vs 需手动修复

**输出**: 写报告到 `docs/reports/type-check.md`

### Task 3: Console.log 残留清理（Level 2 — 修改代码）

**做什么**:
1. 在 fashion-wizpulseai-com 中搜索裸 console.log/debug/warn
2. 排除合法的 Logger 调用
3. 将裸 console 替换为 Logger
4. 运行 `npm run build` 确认不破坏构建

**输出**: git commit 到 dev 分支

### Task 4: 依赖安全审计（Level 1 — 纯检查）

**做什么**:
1. 对每个站点运行 `npm audit`
2. 汇总 high/critical 漏洞
3. 检查四站点 Next.js / React / Supabase 版本一致性
4. 列出可安全升级的依赖

**输出**: 写报告到 `docs/reports/dependency-audit.md`

### Task 5: 构建验证（Level 1 — 纯测试）

**做什么**:
1. 对每个站点运行 `npm run build`
2. 记录构建时间和结果
3. 检查 bundle size
4. 分析构建失败原因（如果有）

**输出**: 写报告到 `docs/reports/build-status.md`

## 完成后

1. 更新 TASKS.md（标记完成的任务）
2. 更新 WORK_LOG.md（写入今日完成摘要）
3. git add + commit 所有变更到 dev 分支
4. 写总结到 `docs/reports/batch-001-summary.md`
5. **不要 push**（push 需要人工确认）
