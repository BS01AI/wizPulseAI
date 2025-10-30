#!/bin/bash

# WizPulseAI Git 详细差异报告
# 显示3个子项目的详细改动

# 使用方法:
#   ./scripts/git-diff-all.sh           - 显示未暂存的改动
#   ./scripts/git-diff-all.sh --staged  - 显示已暂存的改动
#   ./scripts/git-diff-all.sh --all     - 显示所有改动
#   ./scripts/git-diff-all.sh --stat    - 只显示统计信息

MODE="unstaged"
SHOW_DIFF=false

# 解析参数
case "$1" in
  --staged)
    MODE="staged"
    SHOW_DIFF=true
    ;;
  --all)
    MODE="all"
    SHOW_DIFF=true
    ;;
  --stat)
    MODE="stat"
    ;;
  *)
    SHOW_DIFF=true
    ;;
esac

echo "📊 WizPulseAI 子项目 Git 差异报告"
echo "模式: $MODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 定义子项目列表
PROJECTS=(
  "auth-wizpulseai-com:Auth站点"
  "db-wizPulseAI-com:Dashboard站点"
  "wizPulseAI-com:Main站点"
)

TOTAL_MODIFIED=0
TOTAL_ADDED=0
TOTAL_DELETED=0

# 遍历每个子项目
for project_info in "${PROJECTS[@]}"; do
  IFS=':' read -r dir name <<< "$project_info"

  if [ ! -d "$dir" ]; then
    continue
  fi

  cd "$dir" || continue

  # 检查是否有改动
  if git diff-index --quiet HEAD -- 2>/dev/null && [ "$MODE" != "all" ]; then
    echo "✅ $name - 无改动"
    echo ""
    cd ..
    continue
  fi

  echo "📁 $name ($dir)"
  echo "───────────────────────────────────────────────────────"

  # 显示分支
  BRANCH=$(git branch --show-current 2>/dev/null || echo "未知")
  echo "🌿 分支: $BRANCH"
  echo ""

  # 根据模式显示不同内容
  case "$MODE" in
    staged)
      echo "📝 已暂存的改动:"
      git diff --cached --stat
      if [ "$SHOW_DIFF" = true ]; then
        echo ""
        git diff --cached
      fi
      ;;
    all)
      echo "📝 所有改动 (已暂存 + 未暂存):"
      git diff HEAD --stat
      if [ "$SHOW_DIFF" = true ]; then
        echo ""
        git diff HEAD
      fi
      ;;
    stat)
      echo "📊 改动统计:"
      git diff --stat --no-color
      ;;
    *)
      echo "📝 未暂存的改动:"
      git diff --stat
      if [ "$SHOW_DIFF" = true ]; then
        echo ""
        git diff
      fi
      ;;
  esac

  # 统计改动
  STATS=$(git diff --shortstat 2>/dev/null)
  if [ -n "$STATS" ]; then
    echo ""
    echo "📈 $STATS"
  fi

  echo ""
  echo ""

  cd ..
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 使用提示:"
echo "   --staged    查看已暂存的改动"
echo "   --all       查看所有改动"
echo "   --stat      只显示统计信息（快速）"
