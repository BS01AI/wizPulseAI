# 给另一个 Claude Code 的指令

先执行 `which jq` 确认 jq 已安装。

然后读取当前 `~/.claude/settings.json`，在现有 hooks 配置的基础上，为以下事件追加 agent-hub 的 hook 调用。**不要删除已有的 CCStatusBar hook**，在每个事件的 hooks 数组里追加新条目。

## 需要加 status-hook.sh 的事件（14个）

SessionStart, SessionEnd, Stop, StopFailure, PreToolUse, PostToolUse, SubagentStart, SubagentStop, TaskCreated, TaskCompleted, TeammateIdle, PreCompact, PostCompact, PermissionRequest

## 需要额外加 notify-hook.sh 的事件（4个）

Stop, StopFailure, TeammateIdle, PermissionRequest

## 脚本路径

```
~/Work/CodeWork/AI-helper/core/agent-hub/status-hook.sh
~/Work/CodeWork/AI-helper/core/agent-hub/notify-hook.sh
```

## 格式要求

- 参考现有 CCStatusBar 的写法
- timeout 设为 5
- type 为 command
- 对于已有 hook 的事件（如 SessionStart），在 hooks 数组里追加；对于新事件（如 PostToolUse），新建整个条目
- Stop 和 StopFailure 等需要同时加 status-hook 和 notify-hook 的，两个都放在同一个 hooks 数组里

## 示例：Stop 事件的最终效果

```json
"Stop": [
  {
    "hooks": [
      {
        "command": "\"/Users/bms/Library/Application Support/CCStatusBar/bin/CCStatusBar\" hook Stop",
        "type": "command"
      },
      {
        "command": "/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/status-hook.sh",
        "type": "command",
        "timeout": 5
      },
      {
        "command": "/Users/bms/Work/CodeWork/AI-helper/core/agent-hub/notify-hook.sh",
        "type": "command",
        "timeout": 5
      }
    ]
  }
]
```

## 输出要求

先输出完整的修改后 settings.json 让我确认，确认后再写入。
