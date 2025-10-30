#!/bin/bash

# WizPulseAI 停止所有站点脚本
# 使用方法: ./stop-all.sh

echo "🛑 停止 WizPulseAI 三站点..."
echo ""

# 从 PID 文件读取并杀死进程
if [ -f "logs/auth.pid" ]; then
  AUTH_PID=$(cat logs/auth.pid)
  if ps -p $AUTH_PID > /dev/null 2>&1; then
    kill $AUTH_PID
    echo "✅ Auth 站点已停止 (PID: $AUTH_PID)"
  else
    echo "⚠️  Auth 站点进程不存在"
  fi
  rm logs/auth.pid
fi

if [ -f "logs/dashboard.pid" ]; then
  DASH_PID=$(cat logs/dashboard.pid)
  if ps -p $DASH_PID > /dev/null 2>&1; then
    kill $DASH_PID
    echo "✅ Dashboard 站点已停止 (PID: $DASH_PID)"
  else
    echo "⚠️  Dashboard 站点进程不存在"
  fi
  rm logs/dashboard.pid
fi

if [ -f "logs/main.pid" ]; then
  MAIN_PID=$(cat logs/main.pid)
  if ps -p $MAIN_PID > /dev/null 2>&1; then
    kill $MAIN_PID
    echo "✅ Main 站点已停止 (PID: $MAIN_PID)"
  else
    echo "⚠️  Main 站点进程不存在"
  fi
  rm logs/main.pid
fi

# 额外检查是否有遗留的 Next.js 进程
echo ""
echo "🔍 检查遗留进程..."
NEXT_PIDS=$(lsof -ti:3001,3002,3000 2>/dev/null)
if [ ! -z "$NEXT_PIDS" ]; then
  echo "⚠️  发现遗留进程，正在清理..."
  kill $NEXT_PIDS 2>/dev/null
  echo "✅ 遗留进程已清理"
else
  echo "✅ 无遗留进程"
fi

echo ""
echo "🎉 所有站点已停止！"
