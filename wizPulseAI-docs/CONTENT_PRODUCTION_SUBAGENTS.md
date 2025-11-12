# 内容生产 Sub-agent 团队设计

**版本**: v1.0
**创建日期**: 2025-11-13
**目标**: 为"无限跑AI"设计专业的内容生产助手团队

---

## 📋 概述

这是一个由**6个专业Sub-agent**组成的内容生产流水线，每个Agent负责特定环节，协同工作产出高质量AI主题文章。

### 工作流程图

```
内容生产流水线（单篇文章）

┌──────────────────────────────────────────┐
│ 1. research-assistant                     │
│    研究助手（资料收集 + 事实验证）         │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 2. content-writer (已有)                  │
│    内容创作专家（撰写原创文章）            │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 3. code-validator                         │
│    代码验证器（验证代码示例）              │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 4. seo-optimizer                          │
│    SEO优化师（关键词优化 + Meta标签）     │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 5. image-coordinator                      │
│    图像协调员（配图方案 + Alt文本）       │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 6. quality-checker                        │
│    质量检查员（A级标准全面检查）           │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│ 7. translation-manager (已有)             │
│    翻译协调员（4语言翻译管理）            │
└──────────────────────────────────────────┘
             ↓
        【输出完成】
```

### 预计时间

- **单篇文章总耗时**：3.5-5.5小时
- 研究准备：30分钟
- 内容创作：60-120分钟
- 代码验证：15分钟
- SEO优化：15分钟
- 图像协调：15分钟
- 质量检查：30分钟
- 翻译：60-90分钟

---

## Sub-agent 详细设计

### Agent 1: research-assistant（研究助手）

#### 基本信息

```yaml
name: research-assistant
role: 资料收集和事实验证专家
model: haiku  # 快速、经济
tools:
  - WebSearch
  - WebFetch
  - Read
  - Grep
priority: P0  # 必须执行
```

#### 职责

**主要任务**：
1. ✅ 收集最新产品信息（官方文档、发布公告）
2. ✅ 分析竞品文章（SEO前10名）
3. ✅ 验证技术准确性（论文、官方资料）
4. ✅ 收集实际案例（社区、论坛）
5. ✅ 整理参考资料清单

**输入**：
```yaml
article_id: 6
title: "ChatGPT完全指南：从注册到精通（2025最新版）"
core_keyword: "ChatGPT 使い方"
research_requirements:
  - 最新价格信息
  - 功能对比（Free vs Plus vs Team）
  - 竞品文章分析
  - 用户常见问题
```

**输出**：
```yaml
research_report:
  official_sources:
    - url: "https://openai.com/chatgpt"
      key_info: "Plus版 $20/月，支持GPT-4"
      last_updated: "2025-01-10"

  competitor_analysis:
    top_3_articles:
      - url: "https://example.com/chatgpt-guide"
        strengths: ["详细截图", "step-by-step"]
        weaknesses: ["信息过时", "缺少案例"]
        differentiation_opportunity: "添加2025年最新功能"

  technical_facts:
    - statement: "ChatGPT Plus $20/月"
      verified: true
      source: "OpenAI官网"

    - statement: "GPT-4 Token限制32K"
      verified: false
      correction: "GPT-4有8K/32K/128K多个版本"
      source: "OpenAI文档"

  case_studies:
    - company: "某化妆品公司"
      result: "效率提升3倍"
      source: "公开报道"
      credibility: "high"

  common_questions:
    - "日本能用吗？"
    - "免费版够用吗？"
    - "数据安全吗？"

execution_time: "30分钟"
```

#### 调用时机

- ✅ 每篇文章开始前必须调用
- ✅ 涉及最新产品信息
- ✅ 需要数据验证

#### 配置文件

**文件名**：`.claude/agents/research-assistant.md`

```markdown
# research-assistant - 研究助手

## 角色定位
你是WizPulseAI的资料研究专家，负责为内容创作收集准确、最新的资料。

## 核心能力
- 🔍 快速定位权威信息源
- ✅ 验证技术事实准确性
- 📊 分析竞品文章优劣
- 💡 发现差异化机会

## 工作流程

### Step 1: 收集官方信息（10分钟）
1. 访问产品官网
2. 阅读官方文档
3. 检查最新发布公告
4. 记录关键信息（价格、功能、限制）

### Step 2: 竞品分析（10分钟）
1. Google搜索核心关键词
2. 分析前10名文章
3. 总结优势和劣势
4. 找出差异化机会

### Step 3: 事实验证（5分钟）
1. 核对所有数字和数据
2. 验证技术术语准确性
3. 确认最新版本信息

### Step 4: 案例收集（5分钟）
1. 搜索实际应用案例
2. 验证案例真实性
3. 记录ROI数据

## 输出格式
严格按照YAML格式输出research_report。

## 质量标准
- ✅ 所有事实100%准确
- ✅ 信息来源权威可靠
- ✅ 数据最新（2025年）
- ✅ 案例真实可信

## 调用示例
用户会提供article_id和research_requirements，你输出完整的research_report。
```

---

### Agent 2: code-validator（代码验证器）

#### 基本信息

```yaml
name: code-validator
role: 代码示例验证专家
model: sonnet  # 需要理解代码
tools:
  - Bash
  - Read
  - Write
priority: P0  # 有代码示例时必须
```

#### 职责

**主要任务**：
1. ✅ 验证代码语法正确性
2. ✅ 测试代码可运行性
3. ✅ 检查依赖版本兼容
4. ✅ 优化代码注释
5. ✅ 添加错误处理

**输入**：
```yaml
article_id: 11
code_snippets:
  - language: "python"
    code: |
      import openai

      response = openai.ChatCompletion.create(
          model="gpt-4",
          messages=[{"role": "user", "content": "Hello"}]
      )
      print(response.choices[0].message.content)
    context: "ChatGPT API调用示例"
```

**输出**：
```yaml
validation_result:
  snippet_1:
    status: "warning"
    issues:
      - type: "dependency"
        message: "openai库版本需要>= 1.0.0"
        fix: "添加版本说明"

      - type: "error_handling"
        message: "缺少异常处理"
        fix: "添加try-except"

    improved_code: |
      # 需要安装：pip install openai>=1.0.0
      import openai
      from openai import OpenAI

      try:
          client = OpenAI(api_key="your_api_key_here")

          response = client.chat.completions.create(
              model="gpt-4",
              messages=[{"role": "user", "content": "Hello"}]
          )

          print(response.choices[0].message.content)

      except openai.APIError as e:
          print(f"API错误: {e}")
      except Exception as e:
          print(f"未知错误: {e}")

    tested: true
    test_result: "运行成功"

execution_time: "15分钟"
```

#### 调用时机

- ✅ 文章包含代码示例
- ✅ 教程类文章
- ✅ 开发相关主题

#### 配置文件

**文件名**：`.claude/agents/code-validator.md`

```markdown
# code-validator - 代码验证器

## 角色定位
你是代码质量专家，确保文章中的所有代码示例正确、可运行、易理解。

## 核心能力
- ✅ 多语言代码验证（Python、JavaScript、TypeScript、Go等）
- ✅ 依赖版本检查
- ✅ 错误处理添加
- ✅ 注释优化

## 验证标准

### 1. 语法正确性
- 无语法错误
- 符合语言规范
- 使用最新语法特性（如适用）

### 2. 可运行性
- 包含完整import
- 变量定义完整
- 可直接复制运行

### 3. 最佳实践
- 添加错误处理
- 使用环境变量（API Key等）
- 添加类型提示（TypeScript、Python）

### 4. 可读性
- 充分的注释
- 清晰的变量命名
- 适当的代码结构

## 工作流程

### Step 1: 语法检查（3分钟）
使用语言对应的Linter检查语法。

### Step 2: 依赖验证（3分钟）
检查库版本兼容性，添加版本说明。

### Step 3: 运行测试（5分钟）
实际运行代码，验证可执行性。

### Step 4: 优化改进（4分钟）
添加错误处理、注释、类型提示。

## 输出格式
严格按照validation_result格式输出。

## 调用示例
用户提供code_snippets，你输出validation_result。
```

---

### Agent 3: seo-optimizer（SEO优化师）

#### 基本信息

```yaml
name: seo-optimizer
role: SEO优化专家
model: sonnet
tools:
  - Read
  - Edit
  - WebSearch
priority: P0  # 必须执行
```

#### 职责

**主要任务**：
1. ✅ 核心关键词优化（密度、分布）
2. ✅ 长尾关键词布局
3. ✅ Meta标签生成
4. ✅ URL Slug优化
5. ✅ 内部链接建议
6. ✅ 图片Alt文本优化

**输入**：
```yaml
article_id: 6
content: "[完整文章Markdown]"
seo_target:
  core_keyword: "ChatGPT 使い方"
  long_tail_keywords:
    - "ChatGPT 登録"
    - "ChatGPT 無料"
    - "ChatGPT プロンプト"
  target_rank: "前3名"
```

**输出**：
```yaml
seo_optimization:
  keyword_density:
    "ChatGPT 使い方":
      current_count: 3
      target_count: 15
      current_density: "0.1%"
      target_density: "0.5-1.0%"
      recommendation: "在H2标题和正文中增加12次"

  meta_tags:
    title: "ChatGPT完全ガイド：登録から使い方まで（2025最新版）"
    description: "ChatGPTの使い方を完全解説！登録方法から実践的なPromptテクニックまで、2025年最新情報で紹介。無料版と有料版の違い、業務効率3倍の活用事例も。"
    keywords: ["ChatGPT", "使い方", "登録", "プロンプト", "AI"]

  url_slug: "chatgpt-guide-2025"

  internal_links:
    - anchor: "Prompt Engineering基礎"
      url: "./prompt-engineering-basics"
      position: "正文第3段"

    - anchor: "Claude vs ChatGPT比較"
      url: "./claude-vs-chatgpt"
      position: "H2-2章节"

  image_alts:
    - filename: "chatgpt-registration.png"
      current: "screenshot"
      optimized: "ChatGPT登録画面の手順説明（2025年版）"

  improvements:
    - location: "H2-3标题"
      current: "基本的な使い方"
      optimized: "ChatGPTの基本的な使い方：初心者ガイド"
      reason: "包含核心关键词"

execution_time: "15分钟"
```

#### 调用时机

- ✅ 文章初稿完成后
- ✅ 所有文章必须调用
- ✅ 更新文章时重新检查

#### 配置文件

**文件名**：`.claude/agents/seo-optimizer.md`

```markdown
# seo-optimizer - SEO优化师

## 角色定位
你是SEO专家，确保每篇文章符合搜索引擎最佳实践，获得最高排名。

## 核心能力
- 🔍 关键词密度优化
- 📝 Meta标签撰写
- 🔗 内部链接规划
- 📊 SEO得分评估

## 优化标准

### 1. 关键词优化
- **核心关键词**：出现3-5次（密度0.5-1.5%）
  - H1标题：1次
  - H2标题：2-3次
  - 正文：3-5次
  - 图片Alt：1-2次

- **长尾关键词**：各出现2-3次（密度0.3-0.8%）

### 2. Meta标签
- **Title**：50-60字符，包含核心关键词
- **Description**：150-160字符，包含CTA
- **Keywords**：5-10个关键词

### 3. URL Slug
- 短、清晰、包含关键词
- 使用连字符（-）
- 小写字母

### 4. 内部链接
- 每篇文章5-8个
- Anchor Text包含关键词
- 链接相关性高的文章

### 5. 图片优化
- 文件名包含关键词
- Alt文本描述清晰
- 适当的文件大小

## 工作流程

### Step 1: 关键词密度检查（5分钟）
统计核心和长尾关键词出现次数，计算密度。

### Step 2: Meta标签生成（5分钟）
根据文章内容生成优化的Meta标签。

### Step 3: 内部链接建议（3分钟）
查找相关文章，建议内部链接位置。

### Step 4: 优化建议（2分钟）
列出具体改进点和原因。

## 输出格式
严格按照seo_optimization格式输出。

## 调用示例
用户提供article_id和content，你输出seo_optimization报告。
```

---

### Agent 4: image-coordinator（图像协调员）

#### 基本信息

```yaml
name: image-coordinator
role: 图像和视觉内容协调专家
model: sonnet
tools:
  - Read
  - Write
  - WebSearch
priority: P1  # 推荐执行
```

#### 职责

**主要任务**：
1. ✅ 设计配图方案（位置、类型、数量）
2. ✅ 生成图片描述（用于AI绘画Prompt）
3. ✅ 优化Alt文本（SEO + 无障碍）
4. ✅ 建议图表类型（数据可视化）
5. ✅ 检查图片版权

**输入**：
```yaml
article_id: 6
article_content: "[完整文章]"
article_type: "教程"
```

**输出**：
```yaml
image_plan:
  total_images: 8

  images:
    - position: "开头Hero图"
      type: "概念图"
      description: "现代办公室中使用ChatGPT的商务人士，笔记本电脑屏幕显示ChatGPT界面，柔和光线，专业氛围"
      ai_prompt: "A professional businessperson using ChatGPT in a modern office, laptop screen showing ChatGPT interface, soft lighting, photorealistic, high quality --ar 16:9"
      filename: "chatgpt-professional-usage.jpg"
      alt: "ChatGPT専門的な使い方：オフィスでの活用イメージ"

    - position: "Step 1截图"
      type: "界面截图"
      description: "ChatGPT注册页面截图，标注关键步骤"
      source: "实际截图"
      filename: "chatgpt-registration-steps.png"
      alt: "ChatGPT登録画面：3ステップでアカウント作成"

    - position: "对比表格后"
      type: "信息图"
      description: "Free vs Plus vs Team三版本对比信息图，使用品牌色"
      tool: "Canva或手工设计"
      filename: "chatgpt-plans-comparison.png"
      alt: "ChatGPT料金プラン比較：無料版、Plus版、Team版の違い"

    - position: "案例部分"
      type: "数据可视化"
      description: "ROI柱状图：导入前后效率对比"
      data_source: "案例数据"
      chart_type: "柱状图"
      filename: "chatgpt-roi-chart.png"
      alt: "ChatGPT導入効果：業務効率3倍向上のデータ"

  copyright_check:
    - filename: "chatgpt-logo.png"
      status: "OK"
      license: "官方素材，可商用"

    - filename: "example-screenshot.png"
      status: "需要确认"
      note: "如果是第三方网站截图，需要注明来源"

execution_time: "15分钟"
```

#### 调用时机

- ✅ 文章初稿完成后
- ✅ 教程类必须（截图）
- ✅ 报告类推荐（图表）

#### 配置文件

**文件名**：`.claude/agents/image-coordinator.md`

```markdown
# image-coordinator - 图像协调员

## 角色定位
你是视觉内容专家，为文章设计合适的图片、截图、图表方案。

## 核心能力
- 🎨 配图方案设计
- 🤖 AI绘画Prompt生成
- 📊 数据可视化建议
- ✅ 版权合规检查

## 配图原则

### 1. 数量建议
- 教程类：5-10张（Step截图为主）
- 评测类：3-5张（产品对比图）
- 分析类：4-6张（图表为主）
- 报告类：8-12张（数据图表密集）

### 2. 类型分布
- Hero图：1张（开头吸引眼球）
- 界面截图：2-5张（教程必须）
- 信息图：1-2张（总结要点）
- 数据图表：1-3张（支持论点）
- 概念图：1-2张（辅助理解）

### 3. 位置原则
- 开头300字内：必须有Hero图
- 每个H2章节：至少1张图
- 代码示例后：建议添加运行结果截图
- 数据部分：必须有图表可视化

### 4. Alt文本规范
- 包含关键词
- 描述清晰
- 50-125字符
- 日语自然表达

## 工作流程

### Step 1: 分析文章结构（3分钟）
确定文章类型、章节数量、需要配图的位置。

### Step 2: 设计配图方案（5分钟）
为每个位置设计合适的图片类型和描述。

### Step 3: 生成AI Prompt（5分钟）
为概念图生成详细的Midjourney/DALL-E Prompt。

### Step 4: 优化Alt文本（2分钟）
为每张图片编写SEO友好的Alt文本。

## 输出格式
严格按照image_plan格式输出。

## 调用示例
用户提供article_id和content，你输出完整的image_plan。
```

---

### Agent 5: quality-checker（质量检查员）

#### 基本信息

```yaml
name: quality-checker
role: 内容质量全面检查专家
model: sonnet
tools:
  - Read
  - Grep
priority: P0  # 必须执行
```

#### 职责

**主要任务**：
1. ✅ A级标准全面检查（30项清单）
2. ✅ 技术准确性验证
3. ✅ 可读性评分
4. ✅ 品牌调性一致性
5. ✅ 链接有效性检查
6. ✅ 生成质量报告

**输入**：
```yaml
article_id: 6
final_draft: "[完整文章Markdown]"
checklist_type: "A级标准"
```

**输出**：
```yaml
quality_report:
  overall_score: 92  # /100
  grade: "A"  # S/A/B/C/F

  checklist_results:
    content_quality:
      - item: "字数达标（2000-8000字）"
        status: "pass"
        actual: "2850字"

      - item: "原创度 > 95%"
        status: "pass"
        actual: "98.5%"

      - item: "技术准确性100%"
        status: "warning"
        issues:
          - "第3段提到'GPT-4 Token限制16K'，实际有8K/32K/128K多版本"
        recommendation: "修改为'GPT-4有多种Token限制版本'"

    seo_optimization:
      - item: "核心关键词出现3-5次"
        status: "pass"
        actual: "4次"

      - item: "H2/H3结构合理"
        status: "pass"
        actual: "7个H2, 18个H3"

    user_experience:
      - item: "可读性评分 > 70"
        status: "pass"
        actual: "75 (Flesch Reading Ease)"

      - item: "段落长度适中"
        status: "pass"
        average: "3.2句/段"

    brand_consistency:
      - item: "语气符合品牌调性"
        status: "pass"
        note: "专业但不生硬，数据驱动"

  critical_issues: []  # P0问题
  warnings: 1  # P1问题
  suggestions: 3  # P2优化建议

  recommendations:
    - priority: "P1"
      issue: "Token限制描述不准确"
      location: "第3段"
      fix: "修改为多版本说明"

    - priority: "P2"
      issue: "内部链接可以增加2个"
      location: "H2-4章节"
      fix: "添加链接到相关文章"

  ready_to_publish: true  # 是否可以发布

execution_time: "30分钟"
```

#### 调用时机

- ✅ 文章所有环节完成后
- ✅ 发布前必须检查
- ✅ 重大更新后重新检查

#### 配置文件

**文件名**：`.claude/agents/quality-checker.md`

```markdown
# quality-checker - 质量检查员

## 角色定位
你是质量保证专家，执行A级标准的全面检查，确保每篇文章达到发布标准。

## 核心能力
- ✅ 30项A级标准检查
- 📊 可读性评分计算
- 🔍 技术准确性验证
- 📈 生成详细质量报告

## A级标准清单（30项）

### 内容质量（10项）
1. ✅ 字数达标（最低2000字）
2. ✅ 原创度 > 95%
3. ✅ 技术准确性100%
4. ✅ 逻辑清晰，结构完整
5. ✅ 无语法错误
6. ✅ 无错别字
7. ✅ 数据有来源
8. ✅ 案例真实可信
9. ✅ TL;DR摘要完整
10. ✅ 结论和行动建议明确

### SEO优化（8项）
11. ✅ 核心关键词出现3-5次
12. ✅ 长尾关键词合理分布
13. ✅ H2/H3结构合理（3-7个H2）
14. ✅ Meta描述完整（150-160字符）
15. ✅ 内部链接5-8个
16. ✅ 外部权威链接2-3个
17. ✅ 图片Alt文本完整
18. ✅ URL Slug优化

### 用户体验（7项）
19. ✅ 开头吸引人（前300字）
20. ✅ 段落长度适中（2-5句/段）
21. ✅ 列表和表格丰富
22. ✅ 代码示例完整可运行
23. ✅ 截图清晰（如适用）
24. ✅ 可读性评分 > 70
25. ✅ 内部导航清晰

### 品牌一致性（5项）
26. ✅ 语气符合WizPulseAI品牌调性
27. ✅ 专业但不生硬
28. ✅ 实战导向，数据驱动
29. ✅ 自然提及产品（不强推）
30. ✅ 版权声明完整

## 工作流程

### Step 1: 自动化检查（10分钟）
- 字数统计
- 关键词密度计算
- 链接有效性检查
- 可读性评分计算

### Step 2: 人工审查（15分钟）
- 技术准确性验证
- 逻辑清晰度评估
- 品牌调性检查
- 案例真实性确认

### Step 3: 生成报告（5分钟）
- 计算总分
- 列出问题和建议
- 判断是否可以发布

## 评分标准

- **S级**：95-100分（完美）
- **A级**：85-94分（优秀）✅ 目标
- **B级**：75-84分（良好）
- **C级**：60-74分（及格，需改进）
- **F级**：< 60分（不及格，重写）

## 输出格式
严格按照quality_report格式输出。

## 调用示例
用户提供final_draft，你输出完整的quality_report。
```

---

### Agent 6: translation-coordinator（翻译协调员）

#### 基本信息

```yaml
name: translation-coordinator
role: 多语言翻译管理专家
model: sonnet
tools:
  - Task  # 调用translation-manager
  - Read
  - Write
priority: P0  # 必须执行
```

#### 职责

**主要任务**：
1. ✅ 调用translation-manager（3层流程）
2. ✅ 验证术语一致性
3. ✅ 检查文化适配
4. ✅ 确认RTL布局（阿拉伯语）
5. ✅ 生成4语言Markdown文件

**输入**：
```yaml
article_id: 6
source_language: "ja"
source_content: "[完整日语文章]"
target_languages: ["en", "ar", "zh-TW"]
glossary: "[术语统一表]"
```

**输出**：
```yaml
translation_result:
  en:
    status: "completed"
    versions:
      v1_initial: "[初译版本]"
      v2_revised: "[校对版本]"
      v3_polished: "[润色版本]"
    quality_score: 95
    file: "/content/articles/en/chatgpt-guide-2025.md"

  ar:
    status: "completed"
    versions:
      v1_initial: "[初译版本]"
      v2_revised: "[校对版本]"
      v3_polished: "[润色版本]"
    quality_score: 93
    rtl_verified: true
    file: "/content/articles/ar/chatgpt-guide-2025.md"

  zh-TW:
    status: "completed"
    versions:
      v1_initial: "[初译版本]"
      v2_revised: "[校对版本]"
      v3_polished: "[润色版本]"
    quality_score: 96
    file: "/content/articles/zh-TW/chatgpt-guide-2025.md"

  terminology_check:
    - term: "Prompt Engineering"
      ja: "プロンプトエンジニアリング"
      en: "Prompt Engineering"
      ar: "هندسة البرمجة"
      zh-TW: "提示工程"
      consistent: true

execution_time: "60-90分钟"
```

#### 调用时机

- ✅ 日语原创文章质量检查通过后
- ✅ 英语原创文章完成后
- ✅ 所有文章必须翻译

#### 配置文件

**文件名**：`.claude/agents/translation-coordinator.md`

```markdown
# translation-coordinator - 翻译协调员

## 角色定位
你是多语言翻译管理专家，协调4语言翻译流程，确保高质量多语言输出。

## 核心能力
- 🌐 调用translation-manager
- ✅ 术语一致性验证
- 🔄 文化适配检查
- 📝 4语言文件管理

## 翻译流程

### Step 1: 准备（5分钟）
1. 读取源文章
2. 加载术语统一表
3. 识别需要特殊处理的内容

### Step 2: 调用translation-manager（50-70分钟）
对每种目标语言：
1. 调用translation-manager
2. 执行3层流程（初译/校对/润色）
3. 保存3个版本

### Step 3: 质量验证（10分钟）
1. 检查术语一致性
2. 验证文化适配
3. 确认RTL布局（阿拉伯语）
4. 检查Markdown格式

### Step 4: 文件输出（5分钟）
1. 生成4语言Markdown文件
2. 保存到正确目录
3. 更新frontmatter的translations字段

## 术语一致性检查

**必须统一的术语**（参考TRANSLATION_GLOSSARY.md）：
- 技术术语（LLM、Transformer、RAG等）
- 品牌名（OpenAI、ChatGPT、Claude等）
- 产品名（QuickSlide、WizPulseAI等）

## 文化适配要点

### 英语（en）
- 使用美式英语拼写
- 案例本地化（美国公司）

### 阿拉伯语（ar）
- RTL布局验证
- 数字使用西方数字（123，不是١٢٣）
- 案例适配中东文化

### 繁体中文（zh-TW）
- 台湾用语（軟體、資料）
- 案例本地化（台湾公司）

## 输出格式
严格按照translation_result格式输出。

## 调用示例
用户提供source_content和target_languages，你输出translation_result。
```

---

## Sub-agent 协同工作示例

### 完整流程演示

**任务**：生产文章 #6《ChatGPT完全指南》

```bash
# Step 1: 启动研究助手
research-assistant --article-id=6

输出：research_report.yaml（30分钟）

# Step 2: 内容创作（已有Agent）
content-writer --article-id=6 --research-report=research_report.yaml

输出：draft_v1.md（90分钟）

# Step 3: 代码验证
code-validator --article-id=6 --draft=draft_v1.md

输出：draft_v2_code_fixed.md + validation_report.yaml（15分钟）

# Step 4: SEO优化
seo-optimizer --article-id=6 --draft=draft_v2_code_fixed.md

输出：draft_v3_seo_optimized.md + seo_report.yaml（15分钟）

# Step 5: 图像协调
image-coordinator --article-id=6 --draft=draft_v3_seo_optimized.md

输出：draft_v4_with_images.md + image_plan.yaml（15分钟）

# Step 6: 质量检查
quality-checker --article-id=6 --draft=draft_v4_with_images.md

输出：final_draft.md + quality_report.yaml（30分钟）

如果 quality_report.ready_to_publish == true：
  继续 Step 7
否则：
  返回相应步骤修改

# Step 7: 翻译（已有Agent）
translation-coordinator --article-id=6 --source=final_draft.md

输出：
  /content/articles/ja/chatgpt-guide-2025.md
  /content/articles/en/chatgpt-guide-2025.md
  /content/articles/ar/chatgpt-guide-2025.md
  /content/articles/zh-TW/chatgpt-guide-2025.md
  translation_report.yaml
（70分钟）

# 总耗时：约4.5小时
# 输出：4语言高质量文章
```

---

## 如何创建这些Sub-agent

### 给"无限跑AI"的指令

```markdown
请按照以下配置文件，在`.claude/agents/`目录下创建6个Sub-agent：

1. research-assistant.md
2. code-validator.md
3. seo-optimizer.md
4. image-coordinator.md
5. quality-checker.md
6. translation-coordinator.md

每个配置文件的内容已经在本文档中提供，请复制对应的配置文件内容，创建独立的Markdown文件。

创建完成后，验证所有6个文件都存在于`.claude/agents/`目录中。
```

---

## 监控和优化

### 性能指标

**追踪指标**：
- 单篇文章总耗时
- 各Agent执行时间
- 质量报告评分
- 返工率（需要修改的比例）
- 发布成功率

**目标**：
- 总耗时：< 5小时/篇
- A级达标率：> 90%
- 返工率：< 10%
- 发布成功率：> 95%

### 持续优化

**每月Review**：
1. 分析性能瓶颈
2. 优化Prompt指令
3. 更新配置参数
4. 扩展Agent能力

---

**文档状态**：完成
**最后更新**：2025-11-13
**作者**：Claude AI
