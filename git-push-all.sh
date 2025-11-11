#!/bin/bash

# ===== WizPulseAI Git 多仓库管理脚本 =====
# 功能：检查所有仓库状态，批量提交和推送
# 作者：Claude AI
# 日期：2025-11-10

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="/Users/bms/Work/CodeWork/Web/wizPulseAI"

# 子仓库列表
REPOS=(
  "auth-wizpulseai-com"
  "db-wizPulseAI-com"
  "wizPulseAI-com"
)

# 主仓库名称
MAIN_REPO="主仓库"

# ===== 函数定义 =====

# 打印分隔线
print_separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 打印标题
print_title() {
  echo ""
  print_separator
  echo -e "${BLUE}$1${NC}"
  print_separator
}

# 检查仓库状态
check_status() {
  local repo_path=$1
  local repo_name=$2

  cd "$repo_path"

  if [[ $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  $repo_name: 有未提交的修改${NC}"
    git status --short
    return 1
  else
    echo -e "${GREEN}✅ $repo_name: 干净${NC}"
    return 0
  fi
}

# 提交并推送仓库
commit_and_push() {
  local repo_path=$1
  local repo_name=$2
  local commit_msg=$3

  cd "$repo_path"

  if [[ ! $(git status --porcelain) ]]; then
    echo -e "${GREEN}✅ $repo_name: 无需提交${NC}"
    return 0
  fi

  echo -e "${BLUE}📝 $repo_name: 开始提交...${NC}"

  # 暂存所有修改
  git add .

  # 提交
  git commit -m "$commit_msg"

  # 推送
  if git push origin main 2>&1; then
    echo -e "${GREEN}✅ $repo_name: 推送成功${NC}"
    return 0
  else
    echo -e "${RED}❌ $repo_name: 推送失败${NC}"
    return 1
  fi
}

# 拉取最新代码
pull_all() {
  print_title "🔄 拉取所有仓库最新代码"

  # 子仓库
  for repo in "${REPOS[@]}"; do
    echo -e "${BLUE}📥 拉取 $repo...${NC}"
    cd "$ROOT_DIR/$repo"
    git pull origin main || echo -e "${RED}❌ $repo 拉取失败${NC}"
  done

  # 主仓库
  echo -e "${BLUE}📥 拉取 $MAIN_REPO...${NC}"
  cd "$ROOT_DIR"
  git pull origin main || echo -e "${RED}❌ $MAIN_REPO 拉取失败${NC}"

  echo -e "${GREEN}✅ 所有仓库拉取完成${NC}"
}

# 检查所有仓库状态
status_all() {
  print_title "📊 检查所有仓库状态"

  local has_changes=0

  # 子仓库
  for repo in "${REPOS[@]}"; do
    check_status "$ROOT_DIR/$repo" "$repo" || has_changes=1
  done

  # 主仓库
  check_status "$ROOT_DIR" "$MAIN_REPO" || has_changes=1

  echo ""
  if [ $has_changes -eq 1 ]; then
    echo -e "${YELLOW}⚠️  有仓库需要提交${NC}"
    return 1
  else
    echo -e "${GREEN}✅ 所有仓库都是干净的${NC}"
    return 0
  fi
}

# 批量提交所有仓库
commit_all() {
  local commit_msg=$1

  if [ -z "$commit_msg" ]; then
    echo -e "${RED}❌ 错误：请提供commit message${NC}"
    echo "用法：$0 commit \"你的提交信息\""
    exit 1
  fi

  print_title "🚀 批量提交所有仓库"
  echo -e "${BLUE}Commit Message: $commit_msg${NC}"
  echo ""

  # 子仓库
  for repo in "${REPOS[@]}"; do
    commit_and_push "$ROOT_DIR/$repo" "$repo" "$commit_msg"
  done

  # 主仓库
  commit_and_push "$ROOT_DIR" "$MAIN_REPO" "$commit_msg"

  echo ""
  echo -e "${GREEN}✅ 所有仓库提交完成${NC}"
}

# 显示帮助信息
show_help() {
  cat << EOF
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${BLUE}  WizPulseAI Git 多仓库管理工具${NC}
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}用法：${NC}
  $0 [命令] [参数]

${GREEN}命令：${NC}
  status              检查所有仓库状态
  pull                拉取所有仓库最新代码
  commit "消息"       批量提交所有仓库（需要提供commit message）
  help                显示此帮助信息

${GREEN}示例：${NC}
  $0 status                          # 检查状态
  $0 pull                            # 拉取更新
  $0 commit "feat: 添加新功能"       # 批量提交

${GREEN}管理的仓库：${NC}
  • auth-wizpulseai-com (Auth站点)
  • db-wizPulseAI-com (Dashboard站点)
  • wizPulseAI-com (Main站点)
  • 主仓库 (脚本和文档)

${YELLOW}⚠️  注意：${NC}
  • commit命令会提交所有有改动的仓库
  • 请确保先用status检查状态
  • 如果推送失败，请手动检查冲突

EOF
}

# ===== 主逻辑 =====

# 检查是否在项目根目录
if [ ! -d "$ROOT_DIR" ]; then
  echo -e "${RED}❌ 错误：找不到项目根目录${NC}"
  exit 1
fi

# 解析命令
case "${1:-help}" in
  status)
    status_all
    ;;
  pull)
    pull_all
    ;;
  commit)
    commit_all "$2"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo -e "${RED}❌ 未知命令: $1${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac
