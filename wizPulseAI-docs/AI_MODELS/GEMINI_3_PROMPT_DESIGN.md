# Gemini 3 Prompt 设计指南

> 更新日期: 2025-12-11
> 基于官方文档: https://ai.google.dev/gemini-api/docs/gemini-3

## 核心理念

Gemini 3 的 Prompt 设计哲学与传统 prompt engineering 有根本性差异：

**传统方法（Claude/GPT-4）**：
- 详细的步骤说明
- Chain-of-Thought 引导
- Few-shot examples
- 复杂的角色设定

**Gemini 3 方法**：
- **简化提示词**
- **信任模型推理能力**
- **使用 `thinking_level` 参数**

## 关键参数：thinking_level

### 配置方式

```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents="你的提示词",
    config={
        "thinking_level": "high"  # low | medium | high
    }
)
```

### 三个级别

| 级别 | 适用场景 | 推理深度 | 成本 |
|------|---------|---------|------|
| `low` | 简单问答、信息检索 | 快速响应 | 低 |
| `medium` | 中等复杂度任务 | 平衡速度和质量 | 中 |
| `high` | 复杂推理、多步骤任务 | 深度思考 | 高 |

### 使用建议

**✅ 推荐使用 `high`**：
- 数学推理
- 代码调试
- 复杂业务逻辑分析
- 多步骤规划任务

**✅ 使用 `medium`**：
- 代码生成
- 文本改写
- 结构化数据提取

**✅ 使用 `low`**：
- 信息检索
- 简单问答
- 快速翻译

## 温度设置

⚠️ **重要**：Gemini 3 对温度设置有独特要求

### 推荐设置

```python
config = {
    "temperature": 1.0,  # 保持默认值
    "thinking_level": "high"  # 用这个控制质量
}
```

### 反面案例

```python
# ❌ 不要这样做
config = {
    "temperature": 0.2,  # 会降低模型性能
}
```

**原因**：Gemini 3 在 `temperature=1.0` 时性能最佳，降低温度反而会**降低质量**

## Prompt 设计策略

### 1. 简洁直接型

**之前（Gemini 2.5）**：
```
你是一个专业的代码审查专家。请仔细分析以下代码，
按照以下步骤进行：
1. 先检查语法错误
2. 再分析逻辑漏洞
3. 最后提供改进建议
请用 JSON 格式输出...

[代码]
```

**现在（Gemini 3）**：
```
审查这段代码，找出问题并提供改进建议：

[代码]
```

配置：
```python
config = {"thinking_level": "high"}
```

### 2. 结构化输出

**之前（Gemini 2.5）**：
```
请以 JSON 格式返回分析结果，格式如下：
{
  "issues": [...],
  "suggestions": [...]
}
确保 JSON 格式正确，不要有额外的文本...
```

**现在（Gemini 3）**：
```
返回 JSON 格式的分析结果
```

Gemini 3 会自动理解结构化输出需求

### 3. 多步骤任务

**之前（Gemini 2.5）**：
```
步骤1: 先...
步骤2: 然后...
步骤3: 最后...
请严格按照步骤执行
```

**现在（Gemini 3）**：
```
分析这个系统，提出优化方案
```

配置：
```python
config = {"thinking_level": "high"}
```

模型会自动分解步骤

## 与其他模型的对比

### Claude Opus 4.5

**相同点**：
- 都支持长上下文（Claude 200K vs Gemini 1M）
- 都有推理增强模式（Claude extended thinking vs Gemini thinking_level）

**差异点**：

| 特性 | Claude Opus 4.5 | Gemini 3 Pro |
|------|----------------|--------------|
| Prompt 风格 | 详细指导 | 简洁直接 |
| 温度设置 | 可调节 0-1 | 推荐 1.0 |
| 推理控制 | 自动 | 手动设置 thinking_level |
| 上下文窗口 | 200K tokens | **1M tokens** |
| 输出长度 | 32K tokens | **64K tokens** |
| 图像生成 | ❌ 不支持 | ✅ 原生支持 |

**选择建议**：
- 需要超长上下文（500K+）→ **Gemini 3**
- 需要稳定生产环境 → **Claude Opus 4.5**（Gemini 3 仍是 Preview）
- 需要图像生成 → **Gemini 3**

### GPT-4 Turbo

| 特性 | GPT-4 Turbo | Gemini 3 Pro |
|------|------------|--------------|
| Prompt 风格 | 中等复杂度 | 简洁 |
| 上下文窗口 | 128K tokens | **1M tokens** |
| 输出长度 | 16K tokens | **64K tokens** |
| 图像生成 | DALL-E 3（单独调用）| 原生集成 |
| 工具调用 | Function calling | Google Search / Code Execution |

**选择建议**：
- 需要最稳定的生产环境 → **GPT-4 Turbo**
- 需要超大上下文 → **Gemini 3**
- 需要图像生成工作流 → **Gemini 3**（更便宜）

## 超长上下文（1M tokens）应用场景

### 1. 代码仓库分析

```python
# 读取整个代码仓库（可能 500K+ tokens）
codebase = load_all_files_in_repo()

response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents=f"分析这个代码仓库，找出架构问题：\n\n{codebase}",
    config={"thinking_level": "high"}
)
```

**价值**：
- 一次性理解完整系统架构
- 发现跨模块的依赖问题
- 不需要分批处理

### 2. 长文档问答

```python
# 读取整本技术书籍（可能 200K+ tokens）
book = load_pdf("Technical_Manual.pdf")

response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents=f"基于这本手册回答：如何配置 XYZ 功能？\n\n{book}",
    config={"thinking_level": "medium"}
)
```

**价值**：
- 无需向量检索
- 理解完整上下文
- 准确引用原文

### 3. 会话历史分析

```python
# 分析过去6个月的客服对话（可能 800K+ tokens）
chat_logs = load_all_support_chats()

response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents=f"分析这些对话，总结常见问题模式：\n\n{chat_logs}",
    config={"thinking_level": "high"}
)
```

**价值**：
- 发现长期趋势
- 无需预先聚合
- 保留完整细节

### 4. 多文件代码生成

```python
# 提供多个相关文件作为参考（可能 100K+ tokens）
context = {
    "schema.ts": schema_file,
    "service.ts": service_file,
    "controller.ts": controller_file,
    "tests.ts": test_file
}

response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents=f"基于这些文件，生成新的 UserModule：\n\n{context}",
    config={"thinking_level": "high"}
)
```

**价值**：
- 代码一致性
- 遵循现有模式
- 减少上下文丢失

## 实战案例

### 案例1: 代码审查（简化前后对比）

**之前（Gemini 2.5，600 tokens Prompt）**：
```
你是一个资深的 TypeScript 代码审查专家。请按照以下标准审查代码：

1. 代码风格
   - 命名规范
   - 缩进一致性
   - 注释完整性

2. 类型安全
   - 检查 any 类型
   - 验证类型推导
   - 确保类型覆盖

3. 性能问题
   - 不必要的重新渲染
   - 内存泄漏风险
   - 低效算法

4. 安全问题
   - XSS 风险
   - SQL 注入
   - 敏感信息泄露

请以 JSON 格式返回结果：
{
  "issues": [
    {"severity": "high|medium|low", "type": "...", "description": "..."}
  ],
  "suggestions": [...]
}

[代码]
```

**现在（Gemini 3，50 tokens Prompt）**：
```
审查这段 TypeScript 代码，返回 JSON 格式的问题和建议：

[代码]
```

配置：
```python
config = {"thinking_level": "high", "temperature": 1.0}
```

**效果**：
- Prompt 缩短 92%
- 质量相当或更好
- 节省输入 token 成本

### 案例2: 多语言翻译

**之前（Gemini 2.5）**：
```
你是专业翻译。请将以下文本从日语翻译成英语。
注意：
- 保持技术术语原文
- 使用正式语气
- 检查拼写错误
```

**现在（Gemini 3）**：
```
日语 → 英语（保留技术术语）
```

配置：
```python
config = {"thinking_level": "low"}  # 翻译任务无需高推理
```

### 案例3: 复杂业务逻辑

**之前（Gemini 2.5）**：
```
请分析这个电商系统的订单流程，考虑：
1. 库存检查
2. 支付处理
3. 订单状态转换
4. 异常处理

逐步分析每个环节...
```

**现在（Gemini 3）**：
```
分析这个订单系统，找出潜在问题
```

配置：
```python
config = {"thinking_level": "high"}
```

## 成本优化策略

### 1. 合理选择 thinking_level

```python
# ✅ 好的选择
simple_task = {
    "thinking_level": "low",  # 降低成本
    "contents": "翻译这段文字"
}

complex_task = {
    "thinking_level": "high",  # 值得投入
    "contents": "设计一个分布式系统架构"
}

# ❌ 坏的选择
simple_task_wrong = {
    "thinking_level": "high",  # 浪费成本
    "contents": "今天天气怎么样？"
}
```

### 2. 批量处理

```python
# ✅ 一次处理多个任务（充分利用上下文）
batch = f"""
任务1: 翻译 A
任务2: 翻译 B
任务3: 翻译 C
"""

# ❌ 分三次调用（重复支付上下文成本）
for text in [A, B, C]:
    client.models.generate_content(...)
```

### 3. 控制输出长度

```python
config = {
    "max_output_tokens": 1000,  # 限制输出（默认 64K 很贵）
    "thinking_level": "medium"
}
```

## 最佳实践总结

### DO ✅

1. **简化 Prompt** - 信任模型推理能力
2. **使用 thinking_level** - 根据任务复杂度选择
3. **保持 temperature=1.0** - 除非有特殊需求
4. **充分利用 1M 上下文** - 一次性输入大量信息
5. **批量处理** - 减少重复调用

### DON'T ❌

1. **过度指导** - 避免详细的步骤说明
2. **降低温度** - 会影响 Gemini 3 性能
3. **滥用 high thinking_level** - 简单任务用 low/medium
4. **分批处理** - 尽量一次性输入（除非超过 1M）
5. **忽略成本** - 输出 token 很贵（$12-18/1M）

## 常见问题

### Q1: Gemini 3 和 Claude Opus 4.5 哪个更好？

**A**: 取决于场景

- **Gemini 3 优势**：
  - 更大上下文（1M vs 200K）
  - 更便宜（输入 $2 vs $15）
  - 原生图像生成

- **Claude Opus 4.5 优势**：
  - 更稳定（GA 版本）
  - 更好的代码生成质量（主观评价）
  - 更长的知识截止日期（2025-03 vs 2025-01）

### Q2: 什么时候应该使用 thinking_level=high？

**A**: 以下场景推荐 high：

- 多步骤推理（如数学证明）
- 复杂决策（如架构设计）
- 需要深度分析（如代码审查）
- 需要创意输出（如文章写作）

**不推荐 high**：
- 简单问答
- 信息检索
- 快速翻译

### Q3: 1M 上下文有什么实际用途？

**A**: 主要场景：

1. **整个代码仓库分析**（500K+ tokens）
2. **长文档问答**（无需 RAG）
3. **大规模数据分析**（CSV/JSON 文件）
4. **历史对话理解**（保留完整上下文）

**注意**：输入成本仍然显著（$2-4/1M），需权衡 RAG 方案

### Q4: 为什么温度必须是 1.0？

**A**: Google 官方建议：

> Gemini 3 在默认 temperature=1.0 时性能最佳。
> 降低温度可能导致质量下降。

原因可能是：
- 模型训练时使用 temperature=1.0
- 动态推理机制依赖随机性
- 降低温度会抑制创造性思考

## 参考资源

- [Gemini 3 官方文档](https://ai.google.dev/gemini-api/docs/gemini-3)
- [从 Gemini 2.5 迁移](https://ai.google.dev/gemini-api/docs/migrate-to-3)
- [Google AI Studio](https://aistudio.google.com/)
- [定价详情](https://ai.google.dev/pricing)

---

**文档维护**：
- 创建时间: 2025-12-11
- 最后更新: 2025-12-11
- 维护者: Claude Code AI Assistant
- 基于: Gemini 3 Preview 版本

**状态说明**：
- ⚠️ Gemini 3 仍为 **Preview 版本**
- ⚠️ API 可能有变动
- ✅ 知识截止: 2025年1月
