# Claude Code Hooks 调查报告

> 调查日期: 2026-03-31

## 1. 当前 settings.json hooks 配置

已有 6 个 hook 事件，全部指向 CCStatusBar：

- `SessionStart` - 会话开始
- `SessionEnd` - 会话结束
- `Stop` - Claude 完成一轮回复
- `PreToolUse` - 工具调用前
- `UserPromptSubmit` - 用户提交 prompt
- `Notification` - 系统通知

每个 hook 结构相同：command 类型，调用 CCStatusBar 二进制。

---

## 2. Hook 数据传入方式（重要）

**核心结论：大部分信息通过 stdin JSON 传入，不是环境变量。**

### stdin JSON 共有字段（所有 hook 都有）

```json
{
  "session_id": "abc123",
  "cwd": "/Users/bms/Work/CodeWork/Web/wizPulseAI",
  "hook_event_name": "PreToolUse",
  "transcript_path": "/path/to/transcript.jsonl",
  "permission_mode": "default"
}
```

### 特定 hook 才有的 stdin 字段

| 字段 | 哪些 hook |
|------|-----------|
| `tool_name` / `tool_input` | PreToolUse, PostToolUse, PostToolUseFailure |
| `agent_id` / `agent_type` | SubagentStart, SubagentStop |
| `last_assistant_message` | Stop, SubagentStop |
| `prompt` | UserPromptSubmit |
| `message` / `notification_type` | Notification |
| `error` / `is_interrupt` | PostToolUseFailure |
| `source` | SessionStart (startup/resume/clear/compact) |

### 真正的 shell 环境变量（只有 3 个）

| 变量名 | 说明 | 可用 hook |
|--------|------|-----------|
| `$CLAUDE_PROJECT_DIR` | 项目根目录 | 全部 |
| `$CLAUDE_ENV_FILE` | 环境文件写入路径 | SessionStart, CwdChanged, FileChanged |
| `$CLAUDE_CODE_REMOTE` | 是否远程环境 | 全部 |

**注意：`CLAUDE_SESSION_ID`、`CLAUDE_TOOL_NAME`、`CLAUDE_HOOK_NAME` 都不存在！**
对应信息在 stdin JSON 的 `session_id`、`tool_name`、`hook_event_name`。

---

## 3. 全部可用 Hook 事件（24 个）

### 生命周期
- `SessionStart` - 会话开始/恢复/清除/压缩后
- `SessionEnd` - 会话终止
- `InstructionsLoaded` - CLAUDE.md 加载时

### 用户输入
- `UserPromptSubmit` - 用户提交 prompt，处理前

### 工具执行
- `PreToolUse` - 工具调用前（可阻止）
- `PostToolUse` - 工具成功后
- `PostToolUseFailure` - 工具失败后
- `PermissionRequest` - 权限对话框出现时

### Agent/Team
- `SubagentStart` - 子 agent 启动
- `SubagentStop` - 子 agent 结束
- `TaskCreated` - 任务创建
- `TaskCompleted` - 任务完成
- `TeammateIdle` - 队友即将空闲

### 系统事件
- `Stop` - Claude 完成回复
- `StopFailure` - API 错误导致中断
- `Notification` - 系统通知
- `ConfigChange` - 配置文件变更
- `CwdChanged` - 工作目录切换
- `FileChanged` - 监控文件变更

### 压缩
- `PreCompact` - 上下文压缩前
- `PostCompact` - 上下文压缩后

### Worktree
- `WorktreeCreate` - worktree 创建
- `WorktreeRemove` - worktree 删除

### MCP
- `Elicitation` - MCP 服务请求用户输入
- `ElicitationResult` - 用户响应 MCP 请求

---

## 4. Hook 配置结构

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "正则匹配（可选）",
        "hooks": [
          {
            "type": "command",
            "command": "shell 命令",
            "timeout": 600
          }
        ]
      }
    ]
  }
}
```

### type 支持 4 种
- `command` - 执行 shell 命令
- `http` - POST 到 HTTP 端点
- `prompt` - 单轮 LLM 评估
- `agent` - 多轮 LLM + 工具访问

### matcher 用途
- PreToolUse 可匹配: `Bash`, `Edit|Write`, `mcp__.*`
- SessionStart 可匹配: `startup`, `resume`, `clear`, `compact`
- Notification 可匹配: `permission_prompt`, `idle_prompt`

### exit code 含义
- `0` = 成功，继续执行
- `2` = 阻止操作（stderr 反馈给 Claude）
- 其他 = 警告，继续执行

---

## 5. 脚本读取模式

```bash
#!/bin/bash
INPUT=$(cat)  # 从 stdin 读取完整 JSON

# 解析 stdin JSON
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# 环境变量（只有这个可靠）
PROJECT_DIR="$CLAUDE_PROJECT_DIR"
```

---

## 6. PreToolUse 可修改工具参数（高级用法）

hook 返回 JSON 可以修改工具输入：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "command": "modified-command"
    },
    "additionalContext": "额外上下文给 Claude"
  }
}
```

## 7. Stop hook 可阻止停止

```json
{
  "decision": "block",
  "reason": "Why Claude should continue"
}
```

exit code 2 = 阻止停止，让 Claude 继续工作。
