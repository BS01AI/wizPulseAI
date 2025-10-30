#!/bin/bash

# WizPulseAI 站点状态检查脚本
# 检查3个站点是否正在运行

echo "🔍 检查站点运行状态..."
echo ""

check_port() {
  local port=$1
  local name=$2

  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ $name (端口 $port) - 运行中"
    return 0
  else
    echo "❌ $name (端口 $port) - 未运行"
    return 1
  fi
}

check_port 3001 "Auth       "
check_port 3002 "Dashboard  "
check_port 3000 "Main       "

echo ""
echo "📝 日志文件位置:"
if [ -f "logs/auth.pid" ]; then
  echo "   Auth:      logs/auth.log (PID: $(cat logs/auth.pid))"
else
  echo "   Auth:      logs/auth.log (未运行)"
fi

if [ -f "logs/dashboard.pid" ]; then
  echo "   Dashboard: logs/dashboard.log (PID: $(cat logs/dashboard.pid))"
else
  echo "   Dashboard: logs/dashboard.log (未运行)"
fi

if [ -f "logs/main.pid" ]; then
  echo "   Main:      logs/main.log (PID: $(cat logs/main.pid))"
else
  echo "   Main:      logs/main.log (未运行)"
fi
