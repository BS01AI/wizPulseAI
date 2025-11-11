#!/bin/bash

# WizPulseAI 站点管理脚本
# 交互式管理三个站点的启动、停止、状态查询

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# PID 文件
MAIN_PID_FILE=".pids/main.pid"
AUTH_PID_FILE=".pids/auth.pid"
DASHBOARD_PID_FILE=".pids/dashboard.pid"

# 创建 PID 目录
mkdir -p .pids

# 检查站点状态
check_status() {
    local site_name=$1
    local pid_file=$2
    local port=$3

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $site_name${NC} 运行中 (PID: $pid, Port: $port)"
            return 0
        else
            echo -e "${GRAY}✗ $site_name${NC} 已停止 (PID 文件存在但进程不存在)"
            rm -f "$pid_file"
            return 1
        fi
    else
        echo -e "${GRAY}✗ $site_name${NC} 已停止"
        return 1
    fi
}

# 显示所有站点状态
show_status() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📊 WizPulseAI 站点状态${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    check_status "Main      (localhost:3010)" "$MAIN_PID_FILE" "3010"
    check_status "Auth      (localhost:3011)" "$AUTH_PID_FILE" "3011"
    check_status "Dashboard (localhost:3012)" "$DASHBOARD_PID_FILE" "3012"

    echo ""
}

# 启动单个站点
start_site() {
    local site_name=$1
    local site_dir=$2
    local port=$3
    local pid_file=$4

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  $site_name 已经在运行中${NC}"
            return 1
        fi
    fi

    echo -e "${BLUE}🚀 启动 $site_name...${NC}"
    cd "$site_dir"
    npm run dev > "../logs/$(basename $site_dir | tr '[:upper:]' '[:lower:]').log" 2>&1 &
    local pid=$!
    echo $pid > "../$pid_file"
    cd - > /dev/null

    sleep 2
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $site_name 启动成功 (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}✗ $site_name 启动失败${NC}"
        rm -f "$pid_file"
        return 1
    fi
}

# 停止单个站点
stop_site() {
    local site_name=$1
    local pid_file=$2

    if [ ! -f "$pid_file" ]; then
        echo -e "${GRAY}✗ $site_name 未运行${NC}"
        return 1
    fi

    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 停止 $site_name (PID: $pid)...${NC}"
        kill $pid
        sleep 1

        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  强制停止 $site_name...${NC}"
            kill -9 $pid
        fi

        rm -f "$pid_file"
        echo -e "${GREEN}✓ $site_name 已停止${NC}"
        return 0
    else
        echo -e "${GRAY}✗ $site_name 进程不存在，清理 PID 文件${NC}"
        rm -f "$pid_file"
        return 1
    fi
}

# 启动所有站点
start_all() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🚀 启动所有站点${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    start_site "Main     " "wizPulseAI-com" "3010" "$MAIN_PID_FILE"
    start_site "Auth     " "auth-wizpulseai-com" "3011" "$AUTH_PID_FILE"
    start_site "Dashboard" "db-wizPulseAI-com" "3012" "$DASHBOARD_PID_FILE"

    echo -e "\n${GREEN}✅ 所有站点启动完成！${NC}"
    echo -e "${GRAY}提示：等待 10-15 秒让站点完成编译${NC}\n"
}

# 停止所有站点
stop_all() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🛑 停止所有站点${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    stop_site "Main     " "$MAIN_PID_FILE"
    stop_site "Auth     " "$AUTH_PID_FILE"
    stop_site "Dashboard" "$DASHBOARD_PID_FILE"

    # 清理遗留的 Next.js 进程
    if pgrep -f "next dev" > /dev/null 2>&1; then
        echo -e "\n${YELLOW}⚠️  发现遗留的 Next.js 进程，正在清理...${NC}"
        pkill -f "next dev"
        echo -e "${GREEN}✓ 遗留进程已清理${NC}"
    fi

    echo -e "\n${GREEN}✅ 所有站点已停止！${NC}\n"
}

# 重启所有站点
restart_all() {
    stop_all
    sleep 2
    start_all
}

# 查看日志
view_logs() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📝 选择要查看的日志${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo "1) Main 站点日志"
    echo "2) Auth 站点日志"
    echo "3) Dashboard 站点日志"
    echo "4) 所有日志（实时监控）"
    echo "0) 返回主菜单"
    echo ""

    read -p "请选择 [0-4]: " log_choice

    case $log_choice in
        1)
            echo -e "\n${BLUE}📄 Main 站点日志 (按 Ctrl+C 退出)${NC}\n"
            tail -f logs/main.log
            ;;
        2)
            echo -e "\n${BLUE}📄 Auth 站点日志 (按 Ctrl+C 退出)${NC}\n"
            tail -f logs/auth.log
            ;;
        3)
            echo -e "\n${BLUE}📄 Dashboard 站点日志 (按 Ctrl+C 退出)${NC}\n"
            tail -f logs/dashboard.log
            ;;
        4)
            echo -e "\n${BLUE}📄 所有站点日志 (按 Ctrl+C 退出)${NC}\n"
            tail -f logs/main.log logs/auth.log logs/dashboard.log
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            ;;
    esac
}

# 主菜单
show_menu() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}   🎯 WizPulseAI 站点管理工具${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    show_status

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}操作菜单${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo "1) 🚀 启动所有站点"
    echo "2) 🛑 停止所有站点"
    echo "3) 🔄 重启所有站点"
    echo ""
    echo "4) ▶️  启动单个站点"
    echo "5) ⏸️  停止单个站点"
    echo ""
    echo "6) 📊 刷新状态"
    echo "7) 📝 查看日志"
    echo ""
    echo "0) 🚪 退出"
    echo ""
}

# 启动单个站点菜单
start_single_menu() {
    echo -e "\n${CYAN}选择要启动的站点：${NC}\n"
    echo "1) Main (localhost:3010)"
    echo "2) Auth (localhost:3011)"
    echo "3) Dashboard (localhost:3012)"
    echo "0) 返回"
    echo ""

    read -p "请选择 [0-3]: " choice

    case $choice in
        1)
            start_site "Main" "wizPulseAI-com" "3010" "$MAIN_PID_FILE"
            ;;
        2)
            start_site "Auth" "auth-wizpulseai-com" "3011" "$AUTH_PID_FILE"
            ;;
        3)
            start_site "Dashboard" "db-wizPulseAI-com" "3012" "$DASHBOARD_PID_FILE"
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            ;;
    esac

    echo ""
    read -p "按回车键继续..."
}

# 停止单个站点菜单
stop_single_menu() {
    echo -e "\n${CYAN}选择要停止的站点：${NC}\n"
    echo "1) Main (localhost:3010)"
    echo "2) Auth (localhost:3011)"
    echo "3) Dashboard (localhost:3012)"
    echo "0) 返回"
    echo ""

    read -p "请选择 [0-3]: " choice

    case $choice in
        1)
            stop_site "Main" "$MAIN_PID_FILE"
            ;;
        2)
            stop_site "Auth" "$AUTH_PID_FILE"
            ;;
        3)
            stop_site "Dashboard" "$DASHBOARD_PID_FILE"
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            ;;
    esac

    echo ""
    read -p "按回车键继续..."
}

# 主循环
main() {
    while true; do
        clear
        show_menu
        read -p "请选择操作 [0-7]: " choice

        case $choice in
            1)
                start_all
                read -p "按回车键继续..."
                ;;
            2)
                stop_all
                read -p "按回车键继续..."
                ;;
            3)
                restart_all
                read -p "按回车键继续..."
                ;;
            4)
                start_single_menu
                ;;
            5)
                stop_single_menu
                ;;
            6)
                # 刷新状态（重新循环）
                continue
                ;;
            7)
                view_logs
                ;;
            0)
                echo -e "\n${GREEN}👋 再见！${NC}\n"
                exit 0
                ;;
            *)
                echo -e "\n${RED}无效选择，请重新输入${NC}"
                sleep 2
                ;;
        esac
    done
}

# 运行主程序
main
