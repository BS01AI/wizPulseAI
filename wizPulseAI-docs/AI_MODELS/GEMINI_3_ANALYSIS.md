# Gemini 3 模型分析报告

> 来源: https://ai.google.dev/gemini-api/docs/gemini-3
> 更新日期: 2025-12-11

## 模型概述

Gemini 3 是 Google 迄今为止**最智能的模型系列**，构建于最先进的推理基础之上。

## 模型版本

| 模型名称 | 用途 | 状态 |
|---------|------|------|
| `gemini-3-pro-preview` | 复杂任务、广泛知识、高级推理 | Preview |
| `gemini-3-pro-image-preview` | 图像生成和编辑 | Preview |

## 核心能力

### 1. 高级推理能力
- 动态推理（Dynamic Reasoning）
- 可配置思考级别（thinking_level: low/medium/high）
- 自主编码和 Agentic 工作流

### 2. 多模态处理
- 复杂多模态任务处理
- 图像理解和分析

### 3. 图像生成（gemini-3-pro-image-preview）
- **4K 分辨率**支持
- 文本渲染能力
- 对话式图像编辑

### 4. 工具集成
- Google Search 实时搜索
- Code Execution 代码执行
- File Search 文件搜索

## 上下文窗口

| 类型 | 容量 |
|------|------|
| 输入 | **1,000,000 tokens** (1M) |
| 输出 | **64,000 tokens** (64K) |

## 定价

### gemini-3-pro-preview（文本）

| 上下文大小 | 输入价格 | 输出价格 |
|-----------|---------|---------|
| 标准 | $2/1M tokens | $12/1M tokens |
| 大上下文 | $4/1M tokens | $18/1M tokens |

### gemini-3-pro-image-preview（图像生成）

| 类型 | 价格 |
|------|------|
| 文本输入 | $2/1M tokens |
| 图像输出 | $0.134/张（分辨率相关）|

## API 使用示例

### Python
```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-pro-preview",
    contents="你的提示词"
)
```

### JavaScript
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });
const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: "你的提示词"
});
```

## 从 Gemini 2.5 迁移指南

### 关键变化

1. **简化 Prompt**
   - 使用 `thinking_level: "high"` 替代复杂的 prompt engineering
   - 模型自带强大推理，无需过度引导

2. **温度设置**
   - 保持默认 `temperature: 1.0`
   - 不要降低温度，会影响性能

3. **媒体处理**
   - PDF token 消耗可能增加
   - 测试新的媒体分辨率默认值

## 可用性

- **当前状态**: Preview（预览版）
- **免费试用**: Google AI Studio
- **知识截止**: 2025年1月
- **Google Search 计费开始**: 2026年1月5日

## 与竞品对比

| 特性 | Gemini 3 Pro | Claude Opus 4.5 | GPT-4 |
|------|-------------|-----------------|-------|
| 上下文窗口 | 1M tokens | 200K tokens | 128K tokens |
| 输出长度 | 64K tokens | 32K tokens | 16K tokens |
| 图像生成 | 原生支持 | 不支持 | 通过DALL-E |
| 动态推理 | thinking_level | extended thinking | - |

## 适用场景

### 推荐使用
- 需要超长上下文的任务（100K+ tokens）
- 复杂多轮推理
- 图像生成/编辑工作流
- Agentic 自主任务

### 暂不推荐
- 简单任务（成本过高）
- 需要稳定版API的生产环境（当前仍是Preview）

## 相关文档

- **[Gemini 3 Prompt 设计指南](./GEMINI_3_PROMPT_DESIGN.md)** ⭐ 实战指南
  - Prompt 简化策略
  - thinking_level 使用方法
  - 与 Claude/GPT-4 对比
  - 成本优化技巧

## 参考链接

- [官方文档](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Google AI Studio](https://aistudio.google.com/)
- [定价详情](https://ai.google.dev/pricing)
- [从 Gemini 2.5 迁移](https://ai.google.dev/gemini-api/docs/migrate-to-3)

---

*分析者: Claude Code AI Assistant*
*记录时间: 2025-12-11*
*最后更新: 2025-12-11*
