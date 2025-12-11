# AI 模型知识库

> WizPulseAI 项目使用的 AI 模型技术文档

## 目录

### Google Gemini 3 系列

#### 1. [Gemini 3 模型分析报告](./GEMINI_3_ANALYSIS.md)
**类型**: 技术概览

**内容**:
- ✅ 模型版本和能力
- ✅ 上下文窗口（1M 输入 / 64K 输出）
- ✅ 定价详情
- ✅ API 使用示例
- ✅ 与竞品对比（Claude Opus 4.5 / GPT-4）
- ✅ 适用场景

**适合对象**: 架构师、技术选型

---

#### 2. [Gemini 3 Prompt 设计指南](./GEMINI_3_PROMPT_DESIGN.md) ⭐
**类型**: 实战指南

**内容**:
- ✅ **核心理念**: 简化 Prompt，信任模型推理
- ✅ **thinking_level 参数**: low/medium/high 使用场景
- ✅ **温度设置**: 为什么必须保持 1.0
- ✅ **Prompt 策略**: 简洁直接型、结构化输出、多步骤任务
- ✅ **与其他模型对比**: Claude Opus 4.5 / GPT-4 Turbo
- ✅ **超长上下文应用**: 代码仓库分析、长文档问答
- ✅ **实战案例**: 代码审查、翻译、业务逻辑分析
- ✅ **成本优化**: thinking_level 选择、批量处理
- ✅ **最佳实践**: DO/DON'T 清单
- ✅ **常见问题**: 4个 FAQ

**适合对象**: Prompt 工程师、开发者、内容创作者

---

## 文档使用建议

### 新手入门
1. 先读 **分析报告**，了解 Gemini 3 能力和成本
2. 再读 **Prompt 设计指南**，学习实战技巧

### 技术选型
- 对比 **分析报告** 的"与竞品对比"章节
- 评估是否适合当前项目（上下文需求、预算、稳定性）

### Prompt 优化
- 阅读 **Prompt 设计指南** 的"Prompt 设计策略"
- 参考"实战案例"进行改进

### 成本控制
- 学习 **Prompt 设计指南** 的"成本优化策略"
- 合理选择 `thinking_level`

## 快速参考

### 关键参数

```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents="你的提示词",
    config={
        "thinking_level": "high",  # low | medium | high
        "temperature": 1.0,         # 保持默认
        "max_output_tokens": 1000   # 控制成本
    }
)
```

### thinking_level 选择

| 任务类型 | 推荐级别 | 理由 |
|---------|---------|------|
| 信息检索、快速翻译 | `low` | 无需深度推理，节省成本 |
| 代码生成、文本改写 | `medium` | 平衡速度和质量 |
| 数学推理、架构设计 | `high` | 需要深度思考 |

### 成本对比

| 模型 | 输入价格 | 输出价格 | 上下文窗口 |
|------|---------|---------|-----------|
| Gemini 3 Pro | $2-4/1M | $12-18/1M | 1M tokens |
| Claude Opus 4.5 | $15/1M | $75/1M | 200K tokens |
| GPT-4 Turbo | $10/1M | $30/1M | 128K tokens |

**结论**:
- **输入成本**: Gemini 3 最便宜（$2 vs $10 vs $15）
- **输出成本**: Gemini 3 中等（$12 vs $30 vs $75）
- **适用场景**: 需要大上下文且输出适中的任务

## 文档更新记录

| 日期 | 文档 | 更新内容 |
|------|------|---------|
| 2025-12-11 | GEMINI_3_ANALYSIS.md | 初始创建 |
| 2025-12-11 | GEMINI_3_PROMPT_DESIGN.md | 初始创建 |
| 2025-12-11 | README.md | 创建索引 |

## 贡献指南

欢迎补充以下内容：
- ✅ 实战案例（真实项目经验）
- ✅ 性能测试数据
- ✅ 与其他模型的详细对比
- ✅ 成本优化技巧

## 相关资源

### 官方文档
- [Gemini 3 官方文档](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Google AI Studio](https://aistudio.google.com/)
- [定价详情](https://ai.google.dev/pricing)

### 社区资源
- [Gemini API 讨论区](https://discuss.ai.google.dev/)
- [GitHub 示例代码](https://github.com/google/generative-ai-docs)

---

**维护者**: Claude Code AI Assistant
**最后更新**: 2025-12-11
