#!/bin/bash

# WizPulseAI 三站点停止脚本

set -e

echo "🛑 停止 WizPulseAI 三站点..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 停止函数
stop_service() {
    local name=$1
    local pidfile=$2

    if [ -f "$pidfile" ]; then
        local pid=$(cat $pidfile)
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}🛑 停止 $name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            sleep 1

            # 如果进程仍在运行，强制停止
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${RED}   强制停止 $name...${NC}"
                kill -9 $pid 2>/dev/null || true
            fi

            echo -e "${GREEN}✓ $name 已停止${NC}"
        else
            echo -e "${YELLOW}⚠️  $name 进程不存在 (PID: $pid)${NC}"
        fi
        rm -f $pidfile
    else
        echo -e "${YELLOW}⚠️  $name PID 文件不存在${NC}"
    fi
}

# 停止各站点
stop_service "Main 站点" "logs/main.pid"
stop_service "Auth 站点" "logs/auth.pid"
stop_service "Dashboard 站点" "logs/dashboard.pid"

echo ""

# 额外检查：查找并停止所有 next dev 进程
echo "🔍 检查遗留的 Next.js 进程..."
NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' || true)

if [ ! -z "$NEXT_PIDS" ]; then
    echo -e "${YELLOW}⚠️  发现遗留进程，正在清理...${NC}"
    echo "$NEXT_PIDS" | xargs kill 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ 遗留进程已清理${NC}"
else
    echo -e "${GREEN}✓ 没有遗留进程${NC}"
fi

echo ""

# 检查端口占用
echo "🔍 检查端口占用情况..."
for port in 3010 3011 3012; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo -e "${YELLOW}⚠️  端口 $port 仍被占用 (PID: $PID)${NC}"
        echo "   手动停止: kill $PID"
    else
        echo -e "${GREEN}✓ 端口 $port 已释放${NC}"
    fi
done

echo ""
echo "✅ 所有站点已停止！"
echo ""
