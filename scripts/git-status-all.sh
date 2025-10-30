#!/bin/bash

# WizPulseAI Git 状态快速概览
# 显示3个子项目的 Git 状态

echo "🔍 WizPulseAI 子项目 Git 状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 定义子项目列表
PROJECTS=(
  "auth-wizpulseai-com:Auth站点"
  "db-wizPulseAI-com:Dashboard站点"
  "wizPulseAI-com:Main站点"
)

# 遍历每个子项目
for project_info in "${PROJECTS[@]}"; do
  IFS=':' read -r dir name <<< "$project_info"

  if [ ! -d "$dir" ]; then
    echo "❌ $name ($dir) - 目录不存在"
    echo ""
    continue
  fi

  cd "$dir" || continue

  # 获取分支名
  BRANCH=$(git branch --show-current 2>/dev/null || echo "未知")

  # 计算未提交文件数
  MODIFIED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

  # 根据未提交文件数判断状态
  if [ "$MODIFIED" -eq 0 ]; then
    STATUS="✅ 干净"
    STATUS_COLOR="\033[32m"  # 绿色
  else
    STATUS="⚠️  有变更"
    STATUS_COLOR="\033[33m"  # 黄色
  fi

  # 检查未推送的提交
  UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [ -z "$UNPUSHED" ]; then
    UNPUSHED="?"
  fi

  # 检查未拉取的提交
  git fetch --quiet 2>/dev/null
  UNPULLED=$(git log ..@{u} --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [ -z "$UNPULLED" ]; then
    UNPULLED="?"
  fi

  # 显示信息
  echo -e "${STATUS_COLOR}${STATUS}\033[0m $name"
  echo "   📁 目录: $dir"
  echo "   🌿 分支: $BRANCH"
  echo "   📝 未提交文件: $MODIFIED 个"
  echo "   ⬆️  未推送提交: $UNPUSHED 个"
  echo "   ⬇️  未拉取提交: $UNPULLED 个"

  # 显示最近一次提交
  LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)" 2>/dev/null)
  if [ -n "$LAST_COMMIT" ]; then
    echo "   🕐 最近提交: $LAST_COMMIT"
  fi

  echo ""

  cd ..
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 提示:"
echo "   ./scripts/git-diff-all.sh       - 查看详细差异"
echo "   ./scripts/git-status-all.sh -v  - 查看详细状态"
