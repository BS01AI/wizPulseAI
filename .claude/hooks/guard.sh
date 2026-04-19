#!/bin/bash
# WizPulseAI Safety Guard Hook
# PreToolUse hook - 在每个工具调用前检查安全性
# exit 0 = 放行, exit 2 = 阻止
#
# 安装: 在 .claude/settings.json 的 hooks.PreToolUse 中引用
# 日志: ~/Work/CodeWork/AI-helper/core/agent-hub/logs/guard.log

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

LOG_DIR="$HOME/Work/CodeWork/AI-helper/core/agent-hub/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/guard.log"

# ===== 允许的工作目录 =====
ALLOWED_DIRS=(
  "$HOME/Work/CodeWork/Web/wizPulseAI"
  "$HOME/Work/CodeWork/AI-helper"
  "$HOME/.claude/projects"
  "/tmp"
)

log_block() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] BLOCKED: $1 | tool=$TOOL cmd=$CMD file=$FILE" >> "$LOG_FILE"
}

log_allow() {
  if [ "$TOOL" = "Bash" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALLOW: $CMD" >> "$LOG_FILE"
  fi
}

# ===== 路径检查函数 =====
is_path_allowed() {
  local check_path="$1"
  [ -z "$check_path" ] && return 0  # 空路径不检查（由其他规则处理）

  # 解析相对路径
  if [[ "$check_path" != /* ]]; then
    check_path="$(pwd)/$check_path"
  fi

  for allowed in "${ALLOWED_DIRS[@]}"; do
    if [[ "$check_path" == "$allowed"* ]]; then
      return 0
    fi
  done
  return 1
}

# ===== 从 Bash 命令中提取可能的路径 =====
check_bash_paths() {
  local cmd="$1"

  # 只检查明确引用外部绝对路径的命令
  # 提取所有看起来像绝对路径的部分（排除常用系统命令路径）
  local paths=$(echo "$cmd" | grep -oE '/(Users|home|var|opt|etc|Library)[^ "'\''|;&>]*' 2>/dev/null)

  for p in $paths; do
    if ! is_path_allowed "$p"; then
      return 1
    fi
  done
  return 0
}

# ===== 文件工具路径检查 =====
if [ "$TOOL" = "Read" ] || [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ] || [ "$TOOL" = "Glob" ] || [ "$TOOL" = "Grep" ]; then
  if [ -n "$FILE" ] && ! is_path_allowed "$FILE"; then
    log_block "Path outside allowed dirs: $FILE"
    echo "BLOCKED: 路径 $FILE 超出允许范围。只能访问 wizPulseAI 和 AI-helper" >&2
    exit 2
  fi
fi

# ===== Bash 命令检查 =====
if [ "$TOOL" = "Bash" ]; then

  # 🔴 绝对禁止：破坏性删除
  if echo "$CMD" | grep -qE "rm -rf /|rm -rf \.|rm -rf ~|rm -rf \*"; then
    log_block "Recursive delete on root/home/all"
    echo "BLOCKED: 禁止递归删除根目录/home/全部文件" >&2
    exit 2
  fi

  # 🔴 绝对禁止：系统级操作
  if echo "$CMD" | grep -qE "^sudo |; *sudo |\| *sudo "; then
    log_block "sudo command"
    echo "BLOCKED: 禁止 sudo" >&2
    exit 2
  fi

  # 🔴 绝对禁止：危险管道安装
  if echo "$CMD" | grep -qE "curl.*\| *(ba)?sh|wget.*\| *(ba)?sh"; then
    log_block "Pipe to shell"
    echo "BLOCKED: 禁止 curl/wget 管道到 shell" >&2
    exit 2
  fi

  # 🔴 绝对禁止：npm publish
  if echo "$CMD" | grep -qE "npm publish"; then
    log_block "npm publish"
    echo "BLOCKED: 禁止 npm publish" >&2
    exit 2
  fi

  # 🔴 绝对禁止：数据库破坏
  if echo "$CMD" | grep -qiE "DROP (TABLE|DATABASE|SCHEMA)|TRUNCATE "; then
    log_block "Destructive SQL"
    echo "BLOCKED: 禁止破坏性 SQL" >&2
    exit 2
  fi

  # 🔴 路径越界检查（只对含明确外部路径的命令生效）
  if ! check_bash_paths "$CMD"; then
    log_block "Bash accessing path outside allowed dirs"
    echo "BLOCKED: 命令访问了允许范围外的路径。只能操作 wizPulseAI 和 AI-helper" >&2
    exit 2
  fi

  # 🟡 push to main/master → flag file で ALLOW / ASK 切替
  #    開発期: `touch ~/.config/bs01ai/push-allow` で自動通過
  #    上線期: `rm ~/.config/bs01ai/push-allow` で人工確認に戻す
  if echo "$CMD" | grep -qE "git push.*(main|master)"; then
    if [ -f "$HOME/.config/bs01ai/push-allow" ]; then
      # flag 存在 → 開発期 ALLOW（log に open-flag 印を残す）
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALLOW (push-open-flag): $CMD" >> "$LOG_FILE"
      exit 0
    fi
    # flag 不在 → 従来通り ask（上線期/本番防衛）
    log_block "Push to main/master (ask, no push-allow flag)"
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Push to main/master = 生产部署，需要人工确认 (or touch ~/.config/bs01ai/push-allow to enable dev mode)"
  }
}
EOF
    exit 0
  fi

fi

# ===== 文件写入检查 =====
if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then

  # 🔴 禁止修改 .env 文件
  if echo "$FILE" | grep -qE "\.env($|\.local|\.production)"; then
    log_block "Write to .env"
    echo "BLOCKED: 禁止修改 .env 文件" >&2
    exit 2
  fi

fi

# 其他操作：放行
log_allow
exit 0
