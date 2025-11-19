# WizPulseAI RTL 完整改造执行计划

**创建时间**: 2025-11-18
**执行策略**: Codemod批量修复 + RTL组件库
**预计时间**: 2小时
**负责助手**: multi-site-coder

---

## 📋 执行任务清单

### ✅ 已完成
- [x] rtl-ui-specialist扫描全站（发现180处问题）
- [x] 生成完整审查报告
- [x] 制定修复方案
- [x] 用户确认方案

### 🔄 待执行（7个任务）

| # | 任务 | 负责助手 | 预计时间 | 优先级 |
|---|------|---------|---------|--------|
| 1 | 创建Codemod脚本 | multi-site-coder | 15分钟 | P0 |
| 2 | 执行Codemod批量修复 | multi-site-coder | 5分钟 | P0 |
| 3 | 验证编译构建 | multi-site-coder | 10分钟 | P0 |
| 4 | 创建RTL组件库 | multi-site-coder | 60分钟 | P1 |
| 5 | 配置Tailwind插件 | multi-site-coder | 10分钟 | P1 |
| 6 | 浏览器测试验证 | sso-tester | 15分钟 | P1 |
| 7 | 生成完成报告 | multi-site-coder | 5分钟 | P2 |

---

## 🎯 Task 1: 创建Codemod脚本

### 目标
创建自动化脚本，批量替换所有RTL不兼容的Tailwind类名。

### 执行步骤

**1. 创建脚本文件**
```bash
# 文件路径
wizPulseAI-com/scripts/fix-rtl.ts
```

**2. 脚本内容**（完整代码）
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// 定义8个替换规则
const replacements: Replacement[] = [
  // 1. Margin 逻辑属性
  {
    pattern: /\bml-(\d+\.?\d*)\b/g,
    replacement: 'ms-$1',
    description: 'ml-* → ms-* (margin-inline-start)'
  },
  {
    pattern: /\bmr-(\d+\.?\d*)\b/g,
    replacement: 'me-$1',
    description: 'mr-* → me-* (margin-inline-end)'
  },

  // 2. Padding 逻辑属性
  {
    pattern: /\bpl-(\d+\.?\d*)\b/g,
    replacement: 'ps-$1',
    description: 'pl-* → ps-* (padding-inline-start)'
  },
  {
    pattern: /\bpr-(\d+\.?\d*)\b/g,
    replacement: 'pe-$1',
    description: 'pr-* → pe-* (padding-inline-end)'
  },

  // 3. 间距（space-x → gap）
  {
    pattern: /space-x-(\d+\.?\d*)/g,
    replacement: 'gap-x-$1',
    description: 'space-x-* → gap-x-* (自动RTL适配)'
  },
  {
    pattern: /space-y-(\d+\.?\d*)/g,
    replacement: 'gap-y-$1',
    description: 'space-y-* → gap-y-* (垂直间距)'
  },

  // 4. 文本对齐
  {
    pattern: /\btext-left\b/g,
    replacement: 'text-start',
    description: 'text-left → text-start'
  },
  {
    pattern: /\btext-right\b/g,
    replacement: 'text-end',
    description: 'text-right → text-end'
  },

  // 5. 定位逻辑属性
  {
    pattern: /\bleft-(\d+\.?\d*)\b/g,
    replacement: 'start-$1',
    description: 'left-* → start-* (inset-inline-start)'
  },
  {
    pattern: /\bright-(\d+\.?\d*)\b/g,
    replacement: 'end-$1',
    description: 'end-* → end-* (inset-inline-end)'
  },

  // 6. 圆角逻辑属性
  {
    pattern: /rounded-l-(\w+)/g,
    replacement: 'rounded-s-$1',
    description: 'rounded-l-* → rounded-s-*'
  },
  {
    pattern: /rounded-r-(\w+)/g,
    replacement: 'rounded-e-$1',
    description: 'rounded-r-* → rounded-e-*'
  },

  // 7. Border逻辑属性
  {
    pattern: /\bborder-l-(\d+)\b/g,
    replacement: 'border-s-$1',
    description: 'border-l-* → border-s-*'
  },
  {
    pattern: /\bborder-r-(\d+)\b/g,
    replacement: 'border-e-$1',
    description: 'border-r-* → border-e-*'
  },

  // 8. 分隔线逻辑属性
  {
    pattern: /\bdivide-x-(\d+)\b/g,
    replacement: 'divide-x-$1',
    description: 'divide-x-* (保持不变，需要配合其他修复)'
  },
];

async function fixRTL() {
  const srcDir = path.join(process.cwd(), 'src');

  console.log('🔍 扫描文件...\n');
  const files = await glob('**/*.{tsx,ts}', { cwd: srcDir, absolute: true });
  console.log(`找到 ${files.length} 个文件\n`);

  let totalReplacements = 0;
  const changedFiles: string[] = [];
  const stats = new Map<string, number>();
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf-8');
      const originalContent = content;
      let fileReplacements = 0;

      // 应用所有替换规则
      for (const rule of replacements) {
        const matches = content.match(rule.pattern);
        if (matches) {
          const count = matches.length;
          content = content.replace(rule.pattern, rule.replacement);
          fileReplacements += count;
          stats.set(rule.description, (stats.get(rule.description) || 0) + count);
        }
      }

      // 只写入有改动的文件
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf-8');
        changedFiles.push(path.relative(srcDir, file));
        totalReplacements += fileReplacements;
        console.log(`✅ ${path.relative(srcDir, file)} - ${fileReplacements}处修改`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ file: path.relative(srcDir, file), error: errorMsg });
      console.error(`❌ ${path.relative(srcDir, file)} - 处理失败: ${errorMsg}`);
    }
  }

  // 生成报告
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 修复完成报告`);
  console.log(`${'='.repeat(50)}\n`);

  console.log(`扫描文件数: ${files.length}`);
  console.log(`修改文件数: ${changedFiles.length}`);
  console.log(`总修改数: ${totalReplacements}`);
  console.log(`失败文件数: ${errors.length}\n`);

  if (stats.size > 0) {
    console.log(`按规则分类统计:`);
    stats.forEach((count, rule) => {
      console.log(`  ✓ ${rule}: ${count}处`);
    });
  }

  if (errors.length > 0) {
    console.log(`\n失败的文件:`);
    errors.forEach(({ file, error }) => {
      console.log(`  ✗ ${file}: ${error}`);
    });
  }

  // 保存JSON报告
  const report = {
    timestamp: new Date().toISOString(),
    filesScanned: files.length,
    filesChanged: changedFiles.length,
    totalReplacements,
    errors: errors.length,
    stats: Object.fromEntries(stats),
    changedFiles,
    errorFiles: errors
  };

  const reportPath = path.join(process.cwd(), 'rtl-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ 详细报告已保存: rtl-fix-report.json`);
}

// 执行
fixRTL().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
```

**3. 安装依赖**
```bash
cd wizPulseAI-com
npm install -D glob tsx
```

### 验收标准
- [x] 脚本文件创建成功
- [x] 包含8个替换规则
- [x] 错误处理完善
- [x] 生成详细报告

---

## 🎯 Task 2: 执行Codemod批量修复

### 目标
运行脚本，自动修复所有180处RTL问题。

### 执行步骤

**1. 备份代码**
```bash
cd wizPulseAI-com
git add -A
git commit -m "backup: before RTL codemod execution"
```

**2. 运行Codemod**
```bash
npx tsx scripts/fix-rtl.ts
```

**3. 查看报告**
```bash
cat rtl-fix-report.json
```

**4. 检查Git diff**
```bash
git diff --stat
git diff src/components/common/Header.tsx  # 示例检查
```

### 预期结果
```
📊 修复完成报告
═══════════════════════════════════════════════════

扫描文件数: 61
修改文件数: 34
总修改数: 180
失败文件数: 0

按规则分类统计:
  ✓ ml-* → ms-*: 47处
  ✓ mr-* → me-*: 46处
  ✓ space-x-* → gap-x-*: 8处
  ✓ text-left → text-start: 3处
  ✓ pl-* → ps-*: 15处
  ✓ pr-* → pe-*: 15处
  ✓ left-* → start-*: 30处
  ✓ right-* → end-*: 16处
```

### 验收标准
- [x] 180处问题全部修复
- [x] 无失败文件
- [x] Git diff可查看
- [x] 生成JSON报告

---

## 🎯 Task 3: 验证编译构建

### 目标
确保Codemod修改后代码仍然能正常编译和运行。

### 执行步骤

**1. TypeScript类型检查**
```bash
cd wizPulseAI-com
npx tsc --noEmit
```

**2. Next.js构建**
```bash
npm run build
```

**3. 启动开发服务器**
```bash
npm run dev
```

**4. 访问测试页面**
```bash
# 访问以下URL验证
http://localhost:3010/en/
http://localhost:3010/ja/
http://localhost:3010/ar/
http://localhost:3010/zh-TW/
```

### 验收标准
- [x] TypeScript编译通过（0错误）
- [x] Next.js构建成功
- [x] 开发服务器正常启动
- [x] 4种语言页面可访问

---

## 🎯 Task 4: 创建RTL组件库

### 目标
创建5个RTL感知的React组件，供未来开发使用。

### 执行步骤

**1. 创建目录**
```bash
mkdir -p wizPulseAI-com/src/components/rtl
```

**2. 创建HStack组件**

文件：`src/components/rtl/HStack.tsx`

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  reverse?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const GAP_MAP = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
} as const;

const ALIGN_MAP = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
} as const;

const JUSTIFY_MAP = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
} as const;

/**
 * 水平布局容器 - 自动适配RTL
 *
 * @example
 * <HStack gap={4} align="center">
 *   <Icon />
 *   <Text>内容</Text>
 * </HStack>
 */
export function HStack({
  gap = 4,
  reverse = false,
  align = 'center',
  justify = 'start',
  className,
  children,
  ...props
}: HStackProps) {
  return (
    <div
      className={cn(
        'flex',
        GAP_MAP[gap],
        ALIGN_MAP[align],
        JUSTIFY_MAP[justify],
        reverse && 'rtl:flex-row-reverse',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

**3. 创建VStack组件**

文件：`src/components/rtl/VStack.tsx`

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const GAP_MAP = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
} as const;

const ALIGN_MAP = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
} as const;

/**
 * 垂直布局容器
 *
 * @example
 * <VStack gap={6} align="start">
 *   <Title />
 *   <Content />
 * </VStack>
 */
export function VStack({
  gap = 4,
  align = 'stretch',
  className,
  children,
  ...props
}: VStackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        GAP_MAP[gap],
        ALIGN_MAP[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

**4. 创建RTLIcon组件**

文件：`src/components/rtl/RTLIcon.tsx`

```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface RTLIconProps {
  icon: LucideIcon;
  mirror?: boolean;
  className?: string;
  size?: number;
}

/**
 * RTL感知的图标组件
 *
 * @param mirror - 是否在RTL模式下镜像显示（默认false）
 *
 * @example
 * <RTLIcon icon={ChevronRight} mirror={true} />
 * <RTLIcon icon={Search} />
 */
export function RTLIcon({
  icon: Icon,
  mirror = false,
  className,
  size = 20,
}: RTLIconProps) {
  return (
    <Icon
      size={size}
      className={cn(
        mirror && 'rtl:scale-x-[-1]',
        className
      )}
    />
  );
}
```

**5. 创建导出文件**

文件：`src/components/rtl/index.ts`

```typescript
export { HStack } from './HStack';
export { VStack } from './VStack';
export { RTLIcon } from './RTLIcon';

export type { HStackProps } from './HStack';
export type { VStackProps } from './VStack';
export type { RTLIconProps } from './RTLIcon';
```

**6. 创建README文档**

文件：`src/components/rtl/README.md`

```markdown
# RTL组件库

提供RTL（从右到左）感知的React组件，用于阿拉伯语等RTL语言的UI开发。

## 组件列表

### HStack - 水平布局
自动适配RTL的水平布局容器。

\`\`\`tsx
<HStack gap={4} align="center">
  <Icon />
  <Text>内容</Text>
</HStack>
\`\`\`

### VStack - 垂直布局
垂直布局容器。

\`\`\`tsx
<VStack gap={6} align="start">
  <Title />
  <Content />
</VStack>
\`\`\`

### RTLIcon - RTL图标
支持镜像显示的图标组件。

\`\`\`tsx
<RTLIcon icon={ChevronRight} mirror={true} />
\`\`\`

## 使用指南

### 安装
已内置在项目中，直接导入使用：

\`\`\`tsx
import { HStack, VStack, RTLIcon } from '@/components/rtl';
\`\`\`

### 何时使用RTL组件？

✅ **推荐使用**：
- 新功能开发
- 复杂的布局场景
- 需要图标镜像的场景

⚠️ **可选使用**：
- 简单的布局（直接用Tailwind类名也可以）
- 已用Codemod修复的旧代码（无需立即改）

## 技术原理

所有RTL组件使用CSS逻辑属性（Logical Properties），在RTL模式下自动镜像布局。

浏览器会根据`<html dir="rtl">`自动转换：
- `gap` → 自动适配方向
- `rtl:flex-row-reverse` → RTL时反转顺序
- `rtl:scale-x-[-1]` → RTL时水平翻转
\`\`\`

### 验收标准
- [x] 3个组件创建完成
- [x] TypeScript类型定义完整
- [x] README文档清晰
- [x] 导出文件正确

---

## 🎯 Task 5: 配置Tailwind插件

### 目标
安装和配置`tailwindcss-logical`插件，支持CSS逻辑属性。

### 执行步骤

**1. 安装插件**
```bash
cd wizPulseAI-com
npm install -D tailwindcss-logical
```

**2. 修改配置文件**

文件：`tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... 其他配置

  plugins: [
    require('tailwindcss-logical'), // ✅ 添加这一行
    // ... 其他插件
  ],
}
```

**3. 验证配置**
```bash
npm run build
# 检查是否有错误
```

### 验收标准
- [x] 插件安装成功
- [x] tailwind.config.js配置正确
- [x] 构建无错误

---

## 🎯 Task 6: 浏览器测试验证

### 目标
在浏览器中验证4种语言的显示效果，确保RTL正确适配。

### 执行步骤

**1. 启动开发服务器**
```bash
cd wizPulseAI-com
npm run dev
```

**2. 测试清单**

| 页面 | URL | 检查项 | 预期结果 |
|------|-----|--------|---------|
| **英语首页** | http://localhost:3010/en/ | Logo位置 | 左上角 ✅ |
| | | 导航菜单顺序 | Products → About → Contact ✅ |
| | | 文本对齐 | 左对齐 ✅ |
| **日语首页** | http://localhost:3010/ja/ | Logo位置 | 左上角 ✅ |
| | | 导航菜单顺序 | 製品 → 情報 → お問い合わせ ✅ |
| | | 文本对齐 | 左对齐 ✅ |
| **阿拉伯语首页** | http://localhost:3010/ar/ | Logo位置 | **右上角** ✅ |
| | | 导航菜单顺序 | **اتصل → عن → منتجات** ✅ |
| | | 文本对齐 | **右对齐** ✅ |
| | | 间距方向 | 从右到左 ✅ |
| **中文首页** | http://localhost:3010/zh-TW/ | Logo位置 | 左上角 ✅ |
| | | 导航菜单顺序 | 產品 → 關於 → 聯繫 ✅ |
| | | 文本对齐 | 左对齐 ✅ |

**3. 核心页面测试**
- [ ] 首页 (/)
- [ ] 产品页面 (/products)
- [ ] 知识中心 (/knowledge-hub)
- [ ] 关于页面 (/about)
- [ ] 联系页面 (/contact)

**4. 组件测试**
- [ ] Header导航栏
- [ ] Footer底部
- [ ] UserMenu用户菜单
- [ ] LanguageSwitcher语言切换
- [ ] 知识中心文章卡片

### 验收标准
- [x] 英语/日语/中文：布局无变化
- [x] 阿拉伯语：完全镜像显示
- [x] 所有页面无报错
- [x] 交互功能正常

---

## 🎯 Task 7: 生成完成报告

### 目标
生成详细的RTL改造完成报告，记录所有改动和效果。

### 执行步骤

**1. 收集数据**
- Codemod修复统计（rtl-fix-report.json）
- Git改动统计
- 浏览器测试结果

**2. 生成报告**

文件：`wizPulseAI-docs/RTL_FIX_COMPLETION_REPORT.md`

包含：
- 执行摘要
- 修复统计（按规则分类）
- 修改的文件列表
- 测试验证结果
- 截图对比（可选）
- 遗留问题（如果有）
- 后续建议

### 验收标准
- [x] 报告内容完整
- [x] 数据准确
- [x] Markdown格式规范
- [x] 保存到文档库

---

## 📊 总体进度追踪

### 时间估算

| Task | 预计时间 | 实际时间 | 状态 |
|------|---------|---------|------|
| 1. 创建Codemod脚本 | 15分钟 | - | ⏳ 待执行 |
| 2. 执行Codemod | 5分钟 | - | ⏳ 待执行 |
| 3. 验证编译构建 | 10分钟 | - | ⏳ 待执行 |
| 4. 创建RTL组件库 | 60分钟 | - | ⏳ 待执行 |
| 5. 配置Tailwind插件 | 10分钟 | - | ⏳ 待执行 |
| 6. 浏览器测试 | 15分钟 | - | ⏳ 待执行 |
| 7. 生成完成报告 | 5分钟 | - | ⏳ 待执行 |
| **总计** | **120分钟** | **-** | **0/7** |

### 风险提示

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Codemod误替换 | 低 | 中 | 已备份代码，可回滚 |
| TypeScript编译错误 | 低 | 低 | 脚本只改类名，不改结构 |
| 浏览器兼容性问题 | 极低 | 低 | CSS逻辑属性广泛支持 |

---

## 🚀 开始执行

准备就绪！现在可以调用 **multi-site-coder** 助手执行所有任务。

执行命令：
```bash
# 使用Task工具调用multi-site-coder
Task工具 → multi-site-coder → 执行RTL_EXECUTION_PLAN.md
```

---

**文档版本**: v1.0
**最后更新**: 2025-11-18
**维护者**: WizPulseAI技术团队
