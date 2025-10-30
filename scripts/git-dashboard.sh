#!/bin/bash

# WizPulseAI Git 仪表盘
# 图形化展示所有子项目的 Git 状态

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 定义子项目
PROJECTS=(
  "auth-wizpulseai-com:Auth站点"
  "db-wizPulseAI-com:Dashboard站点"
  "wizPulseAI-com:Main站点"
)

# 显示标题
show_header() {
  clear
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${CYAN}   🎛️  WizPulseAI Git 仪表盘${NC}"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  更新时间: ${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
  echo ""
}

# 绘制进度条
draw_progress_bar() {
  local current=$1
  local total=$2
  local width=20
  local percentage=0

  if [ $total -gt 0 ]; then
    percentage=$((current * 100 / total))
  fi

  local filled=$((width * current / total))
  [ $filled -gt $width ] && filled=$width

  local empty=$((width - filled))

  # 选择颜色
  local color=$GREEN
  if [ $percentage -gt 70 ]; then
    color=$RED
  elif [ $percentage -gt 40 ]; then
    color=$YELLOW
  fi

  # 绘制进度条
  printf "${color}["
  for ((i=0; i<filled; i++)); do printf "█"; done
  for ((i=0; i<empty; i++)); do printf "░"; done
  printf "]${NC} %3d%%" "$percentage"
}

# 获取状态图标
get_status_icon() {
  local modified=$1

  if [ "$modified" -eq 0 ]; then
    echo -e "${GREEN}✅${NC}"
  elif [ "$modified" -lt 5 ]; then
    echo -e "${YELLOW}⚠️ ${NC}"
  else
    echo -e "${RED}🔴${NC}"
  fi
}

# 显示项目状态
show_project_status() {
  local dir=$1
  local name=$2

  if [ ! -d "$dir" ]; then
    echo -e "${RED}❌ $name${NC} - 目录不存在"
    return
  fi

  cd "$dir" || return

  # 获取信息
  local branch=$(git branch --show-current 2>/dev/null || echo "未知")
  local modified=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  local unpushed=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')
  local ahead_behind=$(git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "0 0")
  local behind=$(echo "$ahead_behind" | awk '{print $1}')
  local ahead=$(echo "$ahead_behind" | awk '{print $2}')

  # 状态图标
  local icon=$(get_status_icon "$modified")

  # 显示项目信息
  echo -e "  $icon ${BOLD}$name${NC}"
  echo -e "  ├─ 📁 目录: ${CYAN}$dir${NC}"
  echo -e "  ├─ 🌿 分支: ${BLUE}$branch${NC}"
  echo -e "  ├─ 📝 未提交: $modified 个文件"

  # 进度条
  if [ "$modified" -gt 0 ]; then
    echo -n "  │  └─ "
    draw_progress_bar "$modified" 20
    echo ""
  fi

  echo -e "  ├─ ⬆️  未推送: $ahead 个提交"
  echo -e "  ├─ ⬇️  未拉取: $behind 个提交"

  # 最近提交
  local last_commit=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null | head -c 60)
  if [ -n "$last_commit" ]; then
    echo -e "  └─ 🕐 ${last_commit}..."
  fi

  echo ""

  cd - > /dev/null
}

# 显示总结
show_summary() {
  local total_modified=0
  local total_unpushed=0
  local clean_count=0

  for project_info in "${PROJECTS[@]}"; do
    IFS=':' read -r dir name <<< "$project_info"
    if [ ! -d "$dir" ]; then
      continue
    fi

    cd "$dir" || continue
    local modified=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    local unpushed=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')

    total_modified=$((total_modified + modified))
    total_unpushed=$((total_unpushed + unpushed))

    if [ "$modified" -eq 0 ]; then
      clean_count=$((clean_count + 1))
    fi

    cd - > /dev/null
  done

  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  📊 总结${NC}"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  🎯 干净项目: ${GREEN}$clean_count${NC} / ${#PROJECTS[@]}"
  echo -e "  📝 总未提交文件: ${YELLOW}$total_modified${NC}"
  echo -e "  ⬆️  总未推送提交: ${YELLOW}$total_unpushed${NC}"
  echo ""
}

# 显示帮助
show_footer() {
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  ${BLUE}提示:${NC}"
  echo -e "    ./scripts/git-status-all.sh   - 快速概览"
  echo -e "    ./scripts/git-diff-all.sh     - 查看详细差异"
  echo -e "    ./scripts/git-interactive.sh  - 交互式管理"
  echo ""
  echo -e "  ${BLUE}实时监控:${NC}"
  echo -e "    watch -n 5 ./scripts/git-dashboard.sh  (每5秒刷新)"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 主函数
main() {
  show_header

  for project_info in "${PROJECTS[@]}"; do
    IFS=':' read -r dir name <<< "$project_info"
    show_project_status "$dir" "$name"
  done

  show_summary
  show_footer
}

# 运行
main
