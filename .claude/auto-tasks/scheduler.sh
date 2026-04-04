#!/bin/bash
# scheduler.sh — launchd 触发，检查新任务 → 开 Terminal 执行
# 只做两件事：①检查有没有新任务 ②有的话开 Terminal 跑 run-code.sh

TASKS_DIR="$HOME/Work/CodeWork/AI-helper/core/agent-hub/tasks"
RESULTS_DIR="$HOME/Work/CodeWork/AI-helper/core/agent-hub/results"
LOG="$HOME/Work/CodeWork/AI-helper/core/agent-hub/logs/scheduler.log"
LOCK="/tmp/wizpulseai-code-agent.lock"

# 防止重复启动
if [ -f "$LOCK" ]; then
    PID=$(cat "$LOCK")
    if kill -0 "$PID" 2>/dev/null; then
        echo "[$(date)] SKIP: Session running (PID $PID)" >> "$LOG"
        exit 0
    fi
    rm -f "$LOCK"
fi

# 检查是否有未完成的任务
TASK_COUNT=0
for f in "$TASKS_DIR"/task-*.md; do
    [ -f "$f" ] || continue
    RESULT_NAME=$(basename "$f" .md | sed 's/task-/result-/')
    ls "$RESULTS_DIR"/${RESULT_NAME}* &>/dev/null && continue
    TASK_COUNT=$((TASK_COUNT + 1))
done

if [ $TASK_COUNT -eq 0 ]; then
    echo "[$(date)] SKIP: No new tasks" >> "$LOG"
    exit 0
fi

echo "[$(date)] START: $TASK_COUNT task(s), opening Terminal" >> "$LOG"

# 优先用 tmux（Ghostty 环境），否则回退到 Terminal.app
SCRIPTS="$HOME/Work/CodeWork/AI-helper/core/scripts"

if tmux has-session -t claude 2>/dev/null; then
    # tmux session 存在 → 开新窗口执行
    tmux new-window -t claude -n "MC将军" "bash $SCRIPTS/run-code.sh --loop"
    echo "[$(date)] LAUNCHED: tmux window in session 'claude'" >> "$LOG"
elif command -v ghostty &>/dev/null; then
    # Ghostty 可用但没有 tmux → 开 Ghostty 窗口
    ghostty -e "bash $SCRIPTS/run-code.sh --loop" &
    echo "[$(date)] LAUNCHED: Ghostty window" >> "$LOG"
else
    # 回退：Apple Terminal
    osascript -e 'tell application "Terminal"
        activate
        do script "bash '"$SCRIPTS"'/run-code.sh --loop"
    end tell'
    echo "[$(date)] LAUNCHED: Terminal.app" >> "$LOG"
fi
