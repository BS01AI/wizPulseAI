#!/bin/bash

# WizPulseAI 三站点启动脚本
# 使用方法: ./start-all.sh

echo "🚀 启动 WizPulseAI 三站点..."
echo ""

# 检查依赖是否安装
check_deps() {
  local dir=$1
  if [ ! -d "$dir/node_modules" ]; then
    echo "❌ $dir 依赖未安装"
    echo "   运行: cd $dir && npm install"
    return 1
  fi
  return 0
}

# 检查所有站点依赖
echo "📦 检查依赖..."
check_deps "auth-wizpulseai-com" || exit 1
check_deps "db-wizPulseAI-com" || exit 1
check_deps "wizPulseAI-com" || exit 1
echo "✅ 所有依赖已安装"
echo ""

# 检查端口是否被占用
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 $port 已被占用"
    echo "   可以运行: lsof -i :$port 查看进程"
    return 1
  fi
  return 0
}

echo "🔍 检查端口占用..."
check_port 3001 || exit 1
check_port 3002 || exit 1
check_port 3000 || exit 1
echo "✅ 所有端口可用"
echo ""

# 创建日志目录
mkdir -p logs

echo "🌟 启动站点..."
echo ""

# 启动 Auth 站点
echo "▶️  启动 Auth 站点 (端口 3001)..."
cd auth-wizpulseai-com
npm run dev -- -p 3001 > ../logs/auth.log 2>&1 &
AUTH_PID=$!
cd ..

# 启动 Dashboard 站点
echo "▶️  启动 Dashboard 站点 (端口 3002)..."
cd db-wizPulseAI-com
npm run dev -- -p 3002 > ../logs/dashboard.log 2>&1 &
DASH_PID=$!
cd ..

# 启动 Main 站点
echo "▶️  启动 Main 站点 (端口 3000)..."
cd wizPulseAI-com
npm run dev > ../logs/main.log 2>&1 &
MAIN_PID=$!
cd ..

echo ""
echo "✅ 所有站点启动完成！"
echo ""
echo "📊 进程信息:"
echo "   Auth PID: $AUTH_PID"
echo "   Dashboard PID: $DASH_PID"
echo "   Main PID: $MAIN_PID"
echo ""
echo "🌐 访问地址:"
echo "   Auth:      http://localhost:3001"
echo "   Dashboard: http://localhost:3002"
echo "   Main:      http://localhost:3000"
echo ""
echo "📝 日志文件:"
echo "   Auth:      logs/auth.log"
echo "   Dashboard: logs/dashboard.log"
echo "   Main:      logs/main.log"
echo ""
echo "🛑 停止所有站点: ./stop-all.sh"
echo "   或按 Ctrl+C 然后运行: kill $AUTH_PID $DASH_PID $MAIN_PID"
echo ""

# 保存 PID 到文件
echo "$AUTH_PID" > logs/auth.pid
echo "$DASH_PID" > logs/dashboard.pid
echo "$MAIN_PID" > logs/main.pid

echo "⏳ 等待站点启动 (约30秒)..."
sleep 30

echo ""
echo "🎉 启动完成！可以开始测试了"
echo ""

# 等待所有进程
wait
