#!/bin/bash

# WizPulseAI 三站点启动脚本
# 端口分配：Main: 3010, Auth: 3011, Dashboard: 3012

set -e

echo "🚀 启动 WizPulseAI 三站点..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建日志目录
mkdir -p logs

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  端口 $port 已被占用${NC}"
        return 1
    fi
    return 0
}

echo "📝 检查端口占用情况..."
check_port 3010 || echo "   Main 站点端口 3010"
check_port 3011 || echo "   Auth 站点端口 3011"
check_port 3012 || echo "   Dashboard 站点端口 3012"
echo ""

# 检查依赖
echo "📦 检查依赖安装..."
for dir in wizPulseAI-com auth-wizpulseai-com db-wizPulseAI-com; do
    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}⚠️  $dir 依赖未安装，正在安装...${NC}"
        cd $dir && npm install && cd ..
    fi
done
echo -e "${GREEN}✓ 依赖检查完成${NC}"
echo ""

# 启动 Main 站点 (3010)
echo -e "${BLUE}🌐 启动 Main 站点 (localhost:3010)...${NC}"
cd wizPulseAI-com
npm run dev -- -p 3010 > ../logs/main.log 2>&1 &
MAIN_PID=$!
echo $MAIN_PID > ../logs/main.pid
cd ..
echo -e "${GREEN}✓ Main 站点已启动 (PID: $MAIN_PID)${NC}"
echo ""

# 等待1秒
sleep 1

# 启动 Auth 站点 (3011)
echo -e "${BLUE}🔐 启动 Auth 站点 (localhost:3011)...${NC}"
cd auth-wizpulseai-com
npm run dev -- -p 3011 > ../logs/auth.log 2>&1 &
AUTH_PID=$!
echo $AUTH_PID > ../logs/auth.pid
cd ..
echo -e "${GREEN}✓ Auth 站点已启动 (PID: $AUTH_PID)${NC}"
echo ""

# 等待1秒
sleep 1

# 启动 Dashboard 站点 (3012)
echo -e "${BLUE}📊 启动 Dashboard 站点 (localhost:3012)...${NC}"
cd db-wizPulseAI-com
npm run dev -- -p 3012 > ../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > ../logs/dashboard.pid
cd ..
echo -e "${GREEN}✓ Dashboard 站点已启动 (PID: $DASHBOARD_PID)${NC}"
echo ""

echo "⏳ 等待站点编译完成（约10-15秒）..."
sleep 12

echo ""
echo "✅ 所有站点已启动！"
echo ""
echo "📍 访问地址："
echo "   🌐 Main:      http://localhost:3010"
echo "   🔐 Auth:      http://localhost:3011/auth"
echo "   📊 Dashboard: http://localhost:3012"
echo ""
echo "📋 进程信息："
echo "   Main PID:      $MAIN_PID"
echo "   Auth PID:      $AUTH_PID"
echo "   Dashboard PID: $DASHBOARD_PID"
echo ""
echo "📝 日志文件："
echo "   Main:      logs/main.log"
echo "   Auth:      logs/auth.log"
echo "   Dashboard: logs/dashboard.log"
echo ""
echo "🛑 停止所有站点: ./stop-all.sh"
echo "📊 查看状态:     ./scripts/check-status.sh"
echo ""
