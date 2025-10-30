#!/bin/bash

# WizPulseAI 交互式 Git 管理工具
# 选择子项目并执行 Git 操作

# 定义子项目
declare -A PROJECTS
PROJECTS=(
  [1]="auth-wizpulseai-com:Auth站点"
  [2]="db-wizPulseAI-com:Dashboard站点"
  [3]="wizPulseAI-com:Main站点"
)

# 显示主菜单
show_main_menu() {
  clear
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎛️  WizPulseAI Git 管理工具"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "选择子项目:"
  echo "  1) Auth 站点 (auth-wizpulseai-com)"
  echo "  2) Dashboard 站点 (db-wizPulseAI-com)"
  echo "  3) Main 站点 (wizPulseAI-com)"
  echo ""
  echo "  a) 查看所有项目概览"
  echo "  q) 退出"
  echo ""
  echo -n "请选择 [1-3/a/q]: "
}

# 显示项目操作菜单
show_project_menu() {
  local name=$1
  local dir=$2

  clear
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📁 $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "操作:"
  echo "  1) git status      - 查看状态"
  echo "  2) git diff        - 查看未暂存差异"
  echo "  3) git diff --staged - 查看已暂存差异"
  echo "  4) git log         - 查看提交历史 (最近10条)"
  echo "  5) git branch      - 查看分支"
  echo "  6) 自定义命令"
  echo ""
  echo "  b) 返回主菜单"
  echo "  q) 退出"
  echo ""
  echo -n "请选择 [1-6/b/q]: "
}

# 执行 Git 命令
execute_git_command() {
  local dir=$1
  local cmd=$2

  cd "$dir" || return

  echo ""
  echo "执行: git $cmd"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  git $cmd

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -n "按 Enter 继续..."
  read

  cd ..
}

# 显示所有项目概览
show_all_overview() {
  clear
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 所有子项目概览"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  for key in "${!PROJECTS[@]}"; do
    IFS=':' read -r dir name <<< "${PROJECTS[$key]}"

    if [ ! -d "$dir" ]; then
      echo "❌ $name - 目录不存在"
      echo ""
      continue
    fi

    cd "$dir"

    BRANCH=$(git branch --show-current 2>/dev/null || echo "未知")
    MODIFIED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

    if [ "$MODIFIED" -eq 0 ]; then
      STATUS="✅ 干净"
    else
      STATUS="⚠️  有变更"
    fi

    echo "$STATUS $name"
    echo "   🌿 分支: $BRANCH"
    echo "   📝 未提交: $MODIFIED 个文件"
    echo ""

    cd ..
  done

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -n "按 Enter 返回主菜单..."
  read
}

# 主循环
main() {
  while true; do
    show_main_menu
    read choice

    case "$choice" in
      [1-3])
        IFS=':' read -r dir name <<< "${PROJECTS[$choice]}"

        if [ ! -d "$dir" ]; then
          echo "❌ 目录不存在: $dir"
          sleep 2
          continue
        fi

        # 项目操作循环
        while true; do
          show_project_menu "$name" "$dir"
          read op

          case "$op" in
            1) execute_git_command "$dir" "status" ;;
            2) execute_git_command "$dir" "diff" ;;
            3) execute_git_command "$dir" "diff --staged" ;;
            4) execute_git_command "$dir" "log --oneline -10" ;;
            5) execute_git_command "$dir" "branch -v" ;;
            6)
              echo -n "输入 git 命令 (不含 'git'): "
              read custom_cmd
              execute_git_command "$dir" "$custom_cmd"
              ;;
            b|B) break ;;
            q|Q) exit 0 ;;
            *)
              echo "无效选择"
              sleep 1
              ;;
          esac
        done
        ;;
      a|A)
        show_all_overview
        ;;
      q|Q)
        echo "👋 再见！"
        exit 0
        ;;
      *)
        echo "无效选择"
        sleep 1
        ;;
    esac
  done
}

# 启动
main
