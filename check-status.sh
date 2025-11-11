#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 WizPulseAI 端口状态检查${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# 检查端口监听
echo -e "${BLUE}📡 端口监听状态：${NC}\n"

for port in 3010 3011 3012; do
    if lsof -i :$port -P | grep LISTEN > /dev/null 2>&1; then
        pid=$(lsof -i :$port -P -t)
        echo -e "${GREEN}✓ 端口 $port${NC} - 运行中 (PID: $pid)"
    else
        echo -e "${RED}✗ 端口 $port${NC} - 未运行"
    fi
done

echo ""

# 检查 HTTP 访问
echo -e "${BLUE}🌐 HTTP 访问测试：${NC}\n"

# Main
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010 2>/dev/null)
if [ "$status" = "302" ] || [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ Main (3010)${NC} - HTTP $status"
else
    echo -e "${RED}✗ Main (3010)${NC} - 无法访问 (HTTP $status)"
fi

# Auth
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3011/auth 2>/dev/null)
if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ Auth (3011)${NC} - HTTP $status"
else
    echo -e "${RED}✗ Auth (3011)${NC} - 无法访问 (HTTP $status)"
fi

# Dashboard
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3012 2>/dev/null)
if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ Dashboard (3012)${NC} - HTTP $status"
else
    echo -e "${RED}✗ Dashboard (3012)${NC} - 无法访问 (HTTP $status)"
fi

echo ""

# 显示访问地址
echo -e "${BLUE}🔗 访问地址：${NC}\n"
echo -e "   🌐 Main:      ${CYAN}http://localhost:3010${NC}"
echo -e "   🔐 Auth:      ${CYAN}http://localhost:3011/auth${NC}"
echo -e "   📊 Dashboard: ${CYAN}http://localhost:3012${NC}"

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# 检查package.json配置
echo -e "${BLUE}⚙️  Package.json 端口配置：${NC}\n"

main_port=$(grep '"dev":' /Users/bms/Work/CodeWork/Web/wizPulseAI/wizPulseAI-com/package.json | grep -o '3[0-9][0-9][0-9]')
auth_port=$(grep '"dev":' /Users/bms/Work/CodeWork/Web/wizPulseAI/auth-wizpulseai-com/package.json | grep -o '3[0-9][0-9][0-9]')
dash_port=$(grep '"dev":' /Users/bms/Work/CodeWork/Web/wizPulseAI/db-wizPulseAI-com/package.json | grep -o '3[0-9][0-9][0-9]')

echo -e "   Main:      配置端口 ${YELLOW}$main_port${NC}"
echo -e "   Auth:      配置端口 ${YELLOW}$auth_port${NC}"
echo -e "   Dashboard: 配置端口 ${YELLOW}$dash_port${NC}"

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
