# DISPATCH-022: 执行者巡检 (Loop B - 每1小时)

> **执行者**: Code (Claude Code CLI)
> **频率**: 每1小时启动一次
> **模式**: 有任务就做 → 没任务就自主巡检 → 发现问题自己修
> **范围**: 4站点全覆盖 (auth / dashboard / main / fashion)

---

## 执行协议

每次启动时：
1. 读取本文件 + `DISPATCH-021` 的状态
2. 检查 `results/` 目录是否有上轮遗留的待办
3. 如果 DISPATCH-021 有 DB 变更 → 优先做代码侧跟进
4. 没有待办 → 按顺序执行下面的巡检清单
5. 产出报告写入 `AI-helper/core/agent-hub/results/DISPATCH-022-report-{日期}-{时间}.md`
6. 发现问题能修就修，不能修就记录到报告标记 `NEEDS_HUMAN`

---

## 巡检清单 (按优先级顺序)

### 1. 配合 DB 变更做代码跟进 (最高优先级)

当 DISPATCH-021 执行了 DB 变更时，立即检查:

- [ ] TypeScript 类型是否需要重新生成:
  ```bash
  cd fashion-wizpulseai-com
  npx supabase gen types typescript --project-id lhofjwiqjqjtycnhliga > src/lib/types/database.ts
  ```
- [ ] 代码中引用变更字段的地方是否需要更新
- [ ] 新增的 DB 函数是否需要在 service 层封装调用
- [ ] RLS 变更是否影响现有 API 路由

---

### 2. TypeScript 类型与 DB Schema 一致性

**方法**:
1. 读取 `fashion-wizpulseai-com/src/lib/types/database.ts`
2. 用 `mcp__supabase__list_tables` 获取实际表列表
3. 对比是否有:
   - DB 有但类型文件没有的表
   - 类型文件有但 DB 没有的表
   - 列名/类型不匹配

**修复**: 如果不一致 → 重新生成类型文件

---

### 3. API 路由安全审查

逐个检查 `app/api/` 下的路由:

**检查项**:
- [ ] 是否有认证检查 (`requireUser()` 或 `getUser()`)
- [ ] 是否有未捕获的异常会泄露内部错误信息:
  ```typescript
  // 危险:
  catch (error) { return Response.json({ error: error.message }) }
  // 安全:
  catch (error) { return Response.json({ error: 'Internal error' }, { status: 500 }) }
  ```
- [ ] POST/PUT/DELETE 路由是否有输入验证
- [ ] 是否有 SQL 注入风险（直接拼接用户输入到查询）

**范围**: 优先检查 fashion 站点的 API，然后是 dashboard

---

### 4. 环境变量硬编码扫描

```bash
# 在4个站点目录搜索可疑的硬编码
grep -rn "sk_live\|sk_test\|supabase\.co\|anon.*key\|service.*role" \
  auth-wizpulseai-com/src/ \
  db-wizPulseAI-com/src/ \
  wizPulseAI-com/src/ \
  fashion-wizpulseai-com/src/ \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules
```

**排除**: `.env.example` 中的占位符是允许的
**修复**: 硬编码 → 改为 `process.env.XXX`

---

### 5. 死代码清理

**方法**:
1. 搜索未使用的导出:
   ```bash
   # 找到 export 但从未被 import 的文件
   grep -rn "^export " fashion-wizpulseai-com/src/ --include="*.ts" -l | while read f; do
     basename=$(basename "$f" .ts)
     count=$(grep -rn "from.*${basename}" fashion-wizpulseai-com/src/ --include="*.ts" --include="*.tsx" | wc -l)
     if [ "$count" -eq 0 ]; then echo "UNUSED: $f"; fi
   done
   ```
2. 检查 `// TODO`、`// FIXME`、`// HACK` 标记
3. 检查被注释掉的大段代码块

**修复**: 确认无引用后删除，提交时注明原因

---

### 6. 四站 Build 验证

依次验证4个站点能否正常构建:

```bash
# Fashion (最重要)
cd fashion-wizpulseai-com && npm run build 2>&1 | tail -20

# Dashboard
cd db-wizPulseAI-com && npm run build 2>&1 | tail -20

# Main
cd wizPulseAI-com && npm run build 2>&1 | tail -20

# Auth
cd auth-wizpulseai-com && npm run build 2>&1 | tail -20
```

**状态标记**:
- ✅ Build 成功
- ⚠️ Build 成功但有 warning
- ❌ Build 失败 → 立即修复

---

### 7. SEO / 链接有效性

**检查项**:
- [ ] Fashion 站点 `metadata` 是否完整 (title, description, og:image)
- [ ] 各站点 `robots.txt` 是否正确
- [ ] `sitemap.xml` 是否存在且有效
- [ ] 内部链接是否有 404 (检查 `href` 和路由是否匹配)
- [ ] 多语言 `hreflang` 标签是否完整 (ja/en/ar/zh-TW)

---

### 8. 国际化完整性

**检查项**:
- [ ] 每个 locale 目录下的翻译文件 key 数量是否一致
- [ ] 是否有遗漏的翻译 key (值为空或仍是源语言)
- [ ] RTL (阿拉伯语) 布局是否有明显问题

**方法**:
```bash
# 对比翻译文件的 key 数量
for lang in ja en ar zh-TW; do
  echo "$lang: $(cat fashion-wizpulseai-com/src/messages/${lang}.json | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"
done
```

---

## 报告模板

每次巡检产出的报告格式:

```markdown
# DISPATCH-022 巡检报告
- 时间: {ISO时间}
- 触发: 定时巡检 / DB变更跟进
- 耗时: {分钟}

## 执行摘要
- 检查项: {N}个
- 发现问题: {N}个
- 已修复: {N}个
- 需人工: {N}个

## 详细发现

### [P0/P1/P2] {问题标题}
- 文件: {路径}
- 问题: {描述}
- 修复: {已修复/待修复}
- 详情: {具体内容}

## 代码变更
- {文件路径}: {变更说明}

## 下轮待办
- [ ] {待办项}
```

---

## 状态追踪

| 巡检项 | 上次执行 | 状态 | 发现问题数 |
|--------|----------|------|-----------|
| DB变更跟进 | - | ⬜ | - |
| TS类型一致性 | - | ⬜ | - |
| API安全审查 | - | ⬜ | - |
| 环境变量扫描 | - | ⬜ | - |
| 死代码清理 | - | ⬜ | - |
| 四站Build | - | ⬜ | - |
| SEO/链接 | - | ⬜ | - |
| 国际化完整性 | - | ⬜ | - |
