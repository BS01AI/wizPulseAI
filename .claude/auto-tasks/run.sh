#!/bin/bash
# WizPulseAI Auto-Execute Launcher
# 用法: bash .claude/auto-tasks/run.sh [batch-file]
#
# 例子:
#   bash .claude/auto-tasks/run.sh                    # 默认跑 batch-001
#   bash .claude/auto-tasks/run.sh batch-002.md       # 跑指定 batch

set -e

PROJECT_DIR="$HOME/Work/CodeWork/Web/wizPulseAI"
BATCH_FILE="${1:-batch-001.md}"
TASK_PATH="$PROJECT_DIR/.claude/auto-tasks/$BATCH_FILE"
LOG_DIR="$HOME/Work/CodeWork/AI-helper/core/agent-hub/logs"

mkdir -p "$LOG_DIR"

# 检查文件存在
if [ ! -f "$TASK_PATH" ]; then
  echo "❌ 找不到任务文件: $TASK_PATH"
  exit 1
fi

# 确保 guard.sh 有执行权限
chmod +x "$PROJECT_DIR/.claude/hooks/guard.sh"

echo "🚀 启动自动执行"
echo "   项目: wizPulseAI"
echo "   任务: $BATCH_FILE"
echo "   模式: auto (AI分类器自动审查)"
echo "   安全: guard.sh hook 已启用"
echo "   日志: $LOG_DIR/guard.log"
echo ""
echo "开始执行..."
echo ""

cd "$PROJECT_DIR"

# 启动 Claude Code，auto 模式，传入任务指令
claude --permission-mode auto \
  -p "$(cat "$TASK_PATH")" \
  2>&1 | tee "$LOG_DIR/auto-exec-$(date +%Y%m%d-%H%M%S).log"

echo ""
echo "✅ 执行完成。检查结果:"
echo "   报告: $PROJECT_DIR/docs/reports/"
echo "   日志: $LOG_DIR/"
echo "   Guard: $LOG_DIR/guard.log"
