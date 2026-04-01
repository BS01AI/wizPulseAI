# Claude Code .claude/ 配置 & Hooks 完全指南

> 基于官方文档 + wizPulseAI 项目实际情况整理
> 更新日期: 2026-03-28

---

## 目录

1. [配置文件体系](#1-配置文件体系)
2. [CLAUDE.md 规范](#2-claudemd-规范)
3. [rules/ 路径级规则](#3-rules-路径级规则)
4. [settings.json 完整配置项](#4-settingsjson-完整配置项)
5. [Hooks 系统详解](#5-hooks-系统详解)
6. [安全配置](#6-安全配置)
7. [多项目管理](#7-多项目管理)
8. [与现有工具链集成](#8-与现有工具链集成)
9. [最佳实践和坑](#9-最佳实践和坑)
10. [wizPulseAI 项目推荐配置](#10-wizpulseai-项目推荐配置)

---

## 1. 配置文件体系

### 文件位置和优先级

```
优先级（高→低）:

1. 企业策略（最高，不可覆盖）
   macOS: /Library/Application Support/ClaudeCode/
   Linux: /etc/claude-code/

2. 项目本地（不提交 git）
   .claude/settings.local.json

3. 项目级（提交 git，团队共享）
   .claude/settings.json
   .claude/rules/*.md
   CLAUDE.md / .claude/CLAUDE.md

4. 用户全局（所有项目适用）
   ~/.claude/settings.json
   ~/.claude/CLAUDE.md
   ~/.claude/rules/*.md

5. 内置默认值（最低）
```

### 合并规则

| 类型 | 合并方式 |
|------|----------|
| `allow[]` 数组 | 所有级别 union 合并 |
| `deny[]` 数组 | 所有级别 union 合并，**deny 永远优先于 allow** |
| `hooks{}` | 所有级别合并 |
| 标量值（effortLevel 等） | 高优先级覆盖低优先级 |

---

## 2. CLAUDE.md 规范

### 加载位置

| 位置 | 加载时机 | 用途 |
|------|----------|------|
| `./CLAUDE.md` | 启动时 | 项目主指令 |
| `./.claude/CLAUDE.md` | 启动时 | 同上（二选一） |
| `~/.claude/CLAUDE.md` | 启动时 | 个人全局偏好 |
| 子目录 `CLAUDE.md` | Claude 读取该目录文件时 | 子模块规则 |

### 格式

纯 Markdown，无特殊 frontmatter。用标准 Markdown 标题和列表组织。

### 导入语法

```markdown
# 可以用 @ 引入其他文件
@README.md
@docs/architecture.md
@~/.claude/my-personal-instructions.md
```

- 相对路径基于当前文件所在目录
- 支持绝对路径和 `~` 路径
- 最多 5 层递归导入

### 最佳实践

- **目标 200 行以内**（太长浪费 context，降低遵守率）
- **具体可验证**：`缩进 2 空格` 而不是 `格式化代码`
- **写构建命令**：省去每次解释
- **写禁止事项**：明确红线

---

## 3. rules/ 路径级规则

### 目录结构

```
.claude/rules/
├── nextjs.md              # 无 paths → 始终加载
├── api-routes.md          # 有 paths → 仅匹配时加载
├── supabase.md
├── security.md
├── frontend/
│   ├── react.md
│   └── styling.md
└── backend/
    ├── api-design.md
    └── database.md
```

rules/ 下的文件递归发现，可任意嵌套子目录。

### 路径匹配语法

用 YAML frontmatter 的 `paths` 字段限定作用范围：

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/components/**/*.tsx"
---

# 这些规则仅在 Claude 打开匹配文件时加载
```

**Glob 模式参考**：

| 模式 | 匹配 |
|------|------|
| `**/*.ts` | 所有 TypeScript 文件 |
| `src/**/*` | src 下所有文件 |
| `*.md` | 根目录 Markdown 文件 |
| `src/api/*.ts` | 仅 src/api/ 直接子文件 |
| `src/**/*.{ts,tsx}` | 多扩展名 |
| `tests/**/*.test.ts` | 测试文件 |

**注意**: paths 是相对于项目根目录，不是绝对路径。

### 无 paths 的规则文件

没有 `paths` frontmatter 的 `.md` 文件在每次会话启动时都会加载。

### Symlink 支持

```bash
# 跨项目共享规则
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

---

## 4. settings.json 完整配置项

### 完整 Schema

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",

  // ===== 权限控制 =====
  "permissions": {
    "allow": [
      "Bash(npm run *)",           // 通配符
      "Bash(git commit *)",        // 前缀匹配
      "Edit(/src/**/*.ts)",        // 文件路径 glob
      "Read(//absolute/path)",     // 绝对路径（双斜杠）
      "WebFetch(domain:github.com)", // 域名限定
      "mcp__github__*",           // MCP 工具
      "Agent(Explore)"            // 子 Agent
    ],
    "ask": [
      "Bash(rm -rf *)"            // 每次询问
    ],
    "deny": [
      "Bash(git push --force *)", // 永久禁止
      "Edit(.env*)"               // 保护敏感文件
    ]
  },

  // ===== 模型配置 =====
  "defaultModel": "claude-opus-4-6",
  "fastMode": false,
  "effortLevel": "high",      // low | medium | high
  "allowedModels": ["claude-opus-4-6", "claude-sonnet-4-6"],

  // ===== 工作目录 =====
  "additionalDirectories": ["/tmp", "~/Documents/shared"],

  // ===== Hooks（见第 5 节详解）=====
  "hooks": { },

  // ===== CLAUDE.md 排除 =====
  "claudeMdExcludes": [
    "**/node_modules/**/CLAUDE.md",
    "packages/other-team/CLAUDE.md"
  ],

  // ===== 自动记忆 =====
  "autoMemoryEnabled": true,

  // ===== 环境变量 =====
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true"
  },

  // ===== 主题 =====
  "theme": "dark",

  // ===== 状态栏 =====
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh"
  },

  // ===== 沙箱 =====
  "sandbox": {
    "enabled": true,
    "pathPrefixes": ["/src", "/tests"],
    "network": {
      "enabled": true,
      "allowedDomains": ["api.github.com"]
    }
  },

  // ===== MCP 服务器 =====
  "enabledMcpjsonServers": ["filesystem", "supabase"]
}
```

### 权限规则语法速查

```
Bash(command_prefix *)     # 命令前缀 + 通配符
Edit(/glob/path/**/*.ts)   # 文件路径 glob
Read(//absolute/path)      # 绝对路径（双斜杠开头）
Write(*.md)                # 文件类型
WebFetch(domain:xxx.com)   # 域名白名单
mcp__server__tool          # MCP 工具（下划线分隔）
Agent(TypeName)            # 子 Agent 类型
```

---

## 5. Hooks 系统详解

### 所有事件类型

#### 生命周期事件

| 事件 | 触发时机 | matcher 支持 | 可阻止 |
|------|----------|-------------|--------|
| `SessionStart` | 会话开始/恢复 | `startup`, `resume`, `clear`, `compact` | 是 |
| `SessionEnd` | 会话结束 | `clear`, `resume`, `logout` | 否 |
| `Stop` | Claude 完成回复 | 否 | 是 |
| `StopFailure` | API 错误结束 | `rate_limit`, `authentication_failed` | 否 |

#### 工具事件

| 事件 | 触发时机 | matcher（工具名） | 可阻止 |
|------|----------|------------------|--------|
| `PreToolUse` | 工具执行前 | `Bash`, `Edit`, `Read`, `mcp__*` | 是 |
| `PostToolUse` | 工具执行成功后 | 同上 | 是（无法撤销） |
| `PostToolUseFailure` | 工具执行失败后 | 同上 | 是 |
| `PermissionRequest` | 权限对话框出现 | 工具名 | 是 |

#### 用户交互事件

| 事件 | 触发时机 | matcher | 可阻止 |
|------|----------|---------|--------|
| `UserPromptSubmit` | 用户提交提示 | 否 | 是 |
| `Notification` | 通知发送 | `permission_prompt`, `idle_prompt` | 否 |

#### Agent 事件

| 事件 | 触发时机 | matcher | 可阻止 |
|------|----------|---------|--------|
| `SubagentStart` | 子 Agent 启动 | Agent 类型名 | 否 |
| `SubagentStop` | 子 Agent 完成 | Agent 类型名 | 是 |

#### 文件/环境事件

| 事件 | 触发时机 | matcher | 可阻止 |
|------|----------|---------|--------|
| `FileChanged` | 监控的文件变化 | 文件名 basename | 是 |
| `CwdChanged` | 工作目录变化 | 否 | 是 |
| `ConfigChange` | 配置文件变化 | `user_settings`, `project_settings` | 是 |

#### 其他事件

| 事件 | 触发时机 | matcher | 可阻止 |
|------|----------|---------|--------|
| `WorktreeCreate` | worktree 创建 | 否 | 是 |
| `WorktreeRemove` | worktree 删除 | 否 | 是 |
| `PreCompact` | context 压缩前 | `manual`, `auto` | 否 |
| `PostCompact` | context 压缩后 | `manual`, `auto` | 否 |
| `Elicitation` | MCP 请求用户输入 | MCP 服务器名 | 是 |

### Hook 配置格式

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "pattern",      // 可选：过滤触发条件（正则）
        "hooks": [
          {
            "type": "command",     // command | http | prompt | agent
            "command": "...",      // type=command 时
            "url": "...",          // type=http 时
            "prompt": "...",       // type=prompt/agent 时
            "model": "claude-...", // type=prompt/agent 时
            "timeout": 10,         // 秒（command 默认 600）
            "statusMessage": "Running...",  // UI 显示
            "async": false,        // 后台运行
            "shell": "bash"        // 指定 shell
          }
        ]
      }
    ]
  }
}
```

### Hook 输入输出

#### 输入（stdin JSON）

所有 hook 通过 stdin 接收 JSON：

```json
{
  "session_id": "abc123",
  "cwd": "/current/working/dir",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_use_id": "unique-id",
  "tool_input": {
    "command": "npm test"
  }
}
```

#### 输出（exit code 控制）

| Exit Code | 含义 | 行为 |
|-----------|------|------|
| 0 | 允许/继续 | stdout 可返回 JSON 注入上下文 |
| 2 | 阻止操作 | stderr 内容反馈给 Claude |
| 其他 | 非阻塞错误 | stderr 记录日志，继续执行 |

#### JSON 输出示例

**注入上下文给 Claude**：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "Remember to run tests after this change"
  }
}
```

**修改工具输入**：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "updatedInput": {
      "command": "modified command here"
    }
  }
}
```

**阻止并说明原因**：
```bash
echo "Cannot modify .env files directly" >&2
exit 2
```

### 实战 Hook 配置示例

#### 1. 代码生成后自动 Prettier 格式化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty'); if [ -n \"$file_path\" ] && echo \"$file_path\" | grep -qE '\\.(ts|tsx|js|jsx|json|css|md)$'; then npx prettier --write \"$file_path\" 2>/dev/null; fi",
            "timeout": 10,
            "statusMessage": "Formatting..."
          }
        ]
      }
    ]
  }
}
```

#### 2. 保护敏感文件（.env 等）

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty'); if echo \"$file_path\" | grep -qE '(\\.env|\\.env\\.local|credentials|secret)'; then echo \"BLOCKED: Cannot modify sensitive file: $file_path\" >&2; exit 2; fi; exit 0",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

#### 3. 防止误删关键文件

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(cat | jq -r '.tool_input.command // empty'); if echo \"$cmd\" | grep -qE 'rm\\s+(-rf?\\s+)?(\\.claude/|CLAUDE\\.md|package\\.json|next\\.config|supabase/)'; then echo \"BLOCKED: Refusing to delete critical file\" >&2; exit 2; fi; exit 0",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

#### 4. git push 前提醒检查

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(cat | jq -r '.tool_input.command // empty'); if echo \"$cmd\" | grep -qE 'git\\s+(push|merge)'; then echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"additionalContext\":\"Reminder: Ensure TypeScript compiles (npx tsc --noEmit) and tests pass before pushing.\"}}'; fi; exit 0",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

#### 5. 检测硬编码密钥

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(cat | jq -r '.tool_input.file_path // empty'); if [ -n \"$file_path\" ] && [ -f \"$file_path\" ]; then if grep -qEi '(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|-----BEGIN.*PRIVATE KEY)' \"$file_path\" 2>/dev/null; then echo 'WARNING: Possible hardcoded secret detected. Use env vars.' >&2; exit 2; fi; fi; exit 0",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

#### 6. 记录所有执行的命令

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cat | jq -r '[.tool_name, .tool_input.command] | @tsv' >> /tmp/claude-commands.log",
            "timeout": 5,
            "async": true
          }
        ]
      }
    ]
  }
}
```

### 调试 Hooks

```bash
# 1. 查看已注册的 hooks
/hooks

# 2. 手动测试 hook 脚本
echo '{"tool_name":"Edit","tool_input":{"file_path":".env.local"}}' | bash -c '你的command'
echo "Exit code: $?"

# 3. debug 模式启动
claude --debug

# 4. 在 hook 中写日志
"command": "cat | tee -a /tmp/claude-hook-debug.log | jq ..."

# 5. 查看所有加载的指令
/memory
```

---

## 6. 安全配置

### 权限模式

| 模式 | 效果 | 场景 |
|------|------|------|
| `default` | 首次使用工具时询问 | 日常开发 |
| `acceptEdits` | 自动批准文件编辑 | 信任的项目 |
| `plan` | 只读分析 | 安全探索 |
| `auto` | 后台安全检查 | 自主任务 |
| `dontAsk` | 必须预先批准规则 | 严格控制 |
| `bypassPermissions` | 跳过提示（保护 .git/.claude） | 仅 CI/CD |

### 限制网络访问

```json
{
  "permissions": {
    "deny": [
      "WebFetch(*)",
      "Bash(curl *)",
      "Bash(wget *)"
    ],
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:api.supabase.co)"
    ]
  }
}
```

### .gitignore 策略

| 文件 | 提交 git？ | 理由 |
|------|-----------|------|
| `.claude/settings.json` | ✅ 是 | 团队共享规则 |
| `.claude/settings.local.json` | ❌ 否 | 个人偏好、本地路径 |
| `.claude/rules/*.md` | ✅ 是 | 团队编码规范 |
| `.claude/CLAUDE.md` | ✅ 是 | 项目上下文 |
| `.claude/agents/*.md` | ✅ 是 | Agent 定义 |

```gitignore
# .gitignore 追加
.claude/settings.local.json
```

### 团队协作共享策略

```
提交到 git（团队看到）:
├── .claude/settings.json
├── .claude/rules/*.md
├── .claude/agents/*.md
└── CLAUDE.md

不提交（个人）:
├── .claude/settings.local.json
└── ~/.claude/settings.json
```

---

## 7. 多项目管理

### 全局配置

**`~/.claude/settings.json`** — 适用于所有项目：

```json
{
  "permissions": {
    "allow": [
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(git status *)",
      "Bash(git log *)",
      "Bash(git diff *)"
    ]
  },
  "effortLevel": "high"
}
```

**`~/.claude/CLAUDE.md`** — 全局指令：

```markdown
# 个人偏好（所有项目适用）
- 回答简洁直接
- 代码注释用英文
- commit message: type: description
- TypeScript 严格模式
```

**`~/.claude/rules/`** — 全局规则文件。

### 项目覆盖全局

项目级的 `settings.json` 和 `settings.local.json` 会覆盖全局配置。
deny 规则不可被下级覆盖（全局 deny 的项目级无法 allow）。

### Monorepo 路径匹配

```markdown
---
paths:
  - "auth-wizpulseai-com/**/*.ts"
  - "auth-wizpulseai-com/**/*.tsx"
---
# Auth 站点规则
- Cookie 域必须用 .wizpulseai.com
```

```markdown
---
paths:
  - "fashion-wizpulseai-com/**/*.ts"
  - "fashion-wizpulseai-com/**/*.tsx"
---
# Fashion 站点规则
- 积分价格用服务端 packages.ts 查表
- 4语言: ja/en/ar/zh-TW
```

```markdown
---
paths:
  - "db-wizPulseAI-com/**/*.ts"
---
# Dashboard 站点规则
- Stripe 操作集中在 PaymentService
- CORS 用 lib/cors.ts 白名单
```

### 排除特定 CLAUDE.md

```json
{
  "claudeMdExcludes": [
    "**/node_modules/**/CLAUDE.md",
    "packages/other-team/CLAUDE.md"
  ]
}
```

---

## 8. 与现有工具链集成

### Hooks vs Husky

**不冲突**，作用层面不同：

| 工具 | 触发时机 | 作用对象 |
|------|----------|----------|
| Claude Hooks | Claude 调用工具时 | Claude 的行为 |
| Husky | git commit/push 时 | 所有开发者（含 Claude） |

Claude 执行 `git commit` → Husky 的 pre-commit 也会触发。
失败了 Claude 会看到错误并尝试修复。

**推荐组合**：
- Husky: pre-commit 跑 lint-staged
- Claude Hook: PostToolUse 即时 prettier
- 两者互补

### ESLint/Prettier 配置

Claude 默认会读取项目中的 `.eslintrc`, `.prettierrc`, `tsconfig.json`。
在 CLAUDE.md 中提及即可加强：

```markdown
# 代码风格
- 遵守项目 .prettierrc 和 .eslintrc 配置
- TypeScript 严格模式（tsconfig.json strict: true）
```

PostToolUse hook 自动格式化可进一步保证。

### CI/CD 影响

`.claude/` 配置**不影响 CI/CD**（Vercel/GitHub Actions 不读取）。

例外：如果在 CI 中用 `claude` CLI 做自动化，`.claude/settings.json` 会被读取。

---

## 9. 最佳实践和坑

### 最有用的 CLAUDE.md 规则

```markdown
# 1. 构建命令（省去每次解释）
npm run dev       # 本地开发
npm run build     # 生产构建
npx tsc --noEmit  # 类型检查

# 2. 项目特殊约定
- 数据库类型从 CLI 生成，不要手写 database.types.ts
- 共享模块必须复制到各站点目录（Vercel 无法访问父目录）

# 3. 明确禁止
- 不要修改 Cookie 域设置
- 不要硬编码 Stripe Price IDs
- 不要 git push --force
```

### 常见踩坑

| 坑 | 说明 | 解决 |
|---|------|------|
| allow 规则膨胀 | 逐条审批积累到 140+ 条 | 用通配符精简：`Bash(git *)` |
| Hook 里 jq 不存在 | macOS 默认没装 | `brew install jq` |
| Hook 没读 stdin | 必须 `cat` 读完 stdin | 不读会管道错误 |
| rules paths 用绝对路径 | paths 是相对项目根 | `src/**/*.ts` 不是 `/Users/.../src/**/*.ts` |
| CLAUDE.md 太长 | 超过 200 行降低遵守率 | 拆分到 rules/ |
| settings.local.json 含敏感路径 | 硬编码了完整路径 | 用通配符 `Read(//Users/bms/Work/**)` |

### Hooks 性能影响

| Hook 类型 | 延迟 | 影响 |
|-----------|------|------|
| PreToolUse（简单 grep） | <50ms | 无感 |
| PostToolUse（prettier） | 100-500ms | 可接受 |
| PostToolUse（npm build） | 数秒-数分钟 | 设 timeout + async |
| jq 解析 | <100ms | 无感 |

**建议**：所有 hook 设置 `"timeout": 10`，避免卡住。

### 查看执行日志

```bash
/hooks                    # 查看注册的 hooks
/memory                   # 查看加载的指令
/config                   # 查看当前配置
claude --debug            # debug 模式启动
```

---

## 10. wizPulseAI 项目推荐配置

### 当前问题

`settings.local.json` 有 **140+ 条** allow 规则，包括硬编码的完整命令路径。
应该精简为通配符模式。

### 推荐的 settings.json（项目级，提交 git）

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx tsc *)",
      "Bash(npx prettier *)",
      "Bash(npx eslint *)",
      "Bash(git status *)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git -C * status *)",
      "Bash(git -C * log *)",
      "Bash(git -C * diff *)",
      "Bash(git rev-parse *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(head *)",
      "Bash(wc *)",
      "Bash(file *)",
      "Bash(jq *)",
      "Bash(curl *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Edit(.env*)",
      "Write(.env*)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 推荐的 settings.local.json（精简版，替代当前 140 行）

```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(git merge *)",
      "Bash(git fetch *)",
      "Bash(git checkout *)",
      "Bash(git reset *)",
      "Bash(git pull *)",
      "Bash(git rm *)",
      "Bash(git -C * add *)",
      "Bash(git -C * commit *)",
      "Bash(git -C * push *)",
      "Bash(git submodule *)",
      "Bash(npm install *)",
      "Bash(npm uninstall *)",
      "Bash(npm list *)",
      "Bash(npm audit *)",
      "Bash(npm view *)",
      "Bash(npx tsx *)",
      "Bash(npx supabase *)",
      "Bash(npx playwright *)",
      "Bash(python3 *)",
      "Bash(node *)",
      "Bash(bash *)",
      "Bash(timeout *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(rm *)",
      "Bash(chmod *)",
      "Bash(ln *)",
      "Bash(find *)",
      "Bash(grep *)",
      "Bash(awk *)",
      "Bash(echo *)",
      "Bash(xargs *)",
      "Bash(tee *)",
      "Bash(tree *)",
      "Bash(lsof *)",
      "Bash(kill *)",
      "Bash(pkill *)",
      "Bash(readlink *)",
      "Bash(sips *)",
      "Bash(ffmpeg *)",
      "Bash(ffprobe *)",
      "Read(//Users/bms/Work/CodeWork/Web/**)",
      "Read(//Users/bms/.claude/**)",
      "mcp__supabase__*",
      "mcp__notionApi__*",
      "mcp__filesystem__*"
    ],
    "deny": []
  },
  "enabledMcpjsonServers": [
    "filesystem",
    "notionApi",
    "supabase",
    "Context7",
    "chrome-devtools",
    "playwright",
    "stripe"
  ]
}
```

### 推荐的 rules/ 文件

```
.claude/rules/
├── nextjs.md          # Next.js App Router 规范
├── api-routes.md      # API 路由安全规则（paths: **/app/api/**）
├── supabase.md        # 数据库规范
├── security.md        # 安全红线
├── auth-site.md       # Auth 站点规则（paths: auth-wizpulseai-com/**）
├── fashion-site.md    # Fashion 站点规则（paths: fashion-wizpulseai-com/**）
└── dashboard-site.md  # Dashboard 站点规则（paths: db-wizPulseAI-com/**）
```

### 推荐的 Hooks

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty'); if echo \"$file_path\" | grep -qE '(\\.env|\\.env\\.local|credentials|secret)'; then echo 'BLOCKED: sensitive file' >&2; exit 2; fi; exit 0",
            "timeout": 5
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(cat | jq -r '.tool_input.command // empty'); if echo \"$cmd\" | grep -qE 'rm\\s+(-rf?\\s+)?(\\.claude/|CLAUDE\\.md|package\\.json|next\\.config)'; then echo 'BLOCKED: critical file' >&2; exit 2; fi; exit 0",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty'); if [ -n \"$file_path\" ] && echo \"$file_path\" | grep -qE '\\.(ts|tsx|js|jsx|json|css|md)$'; then npx prettier --write \"$file_path\" 2>/dev/null; fi",
            "timeout": 10,
            "statusMessage": "Formatting..."
          }
        ]
      }
    ]
  }
}
```

---

## 环境变量参考

Hook 中可用的环境变量：

| 变量 | 说明 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 项目根目录 |
| `$CLAUDE_PLUGIN_ROOT` | 插件安装目录 |
| `$CLAUDE_PLUGIN_DATA` | 插件数据目录 |
| `$CLAUDE_ENV_FILE` | 环境文件路径（SessionStart） |

Hook stdin JSON 中的字段：

| 字段 | 说明 |
|------|------|
| `session_id` | 会话 ID |
| `cwd` | 当前工作目录 |
| `hook_event_name` | 事件名称 |
| `tool_name` | 工具名称（工具事件） |
| `tool_input` | 工具输入参数（工具事件） |
| `permission_mode` | 当前权限模式 |
| `agent_id` | 子 Agent ID（Agent 事件） |
