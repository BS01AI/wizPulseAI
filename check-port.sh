#!/bin/bash

# 端口查询脚本
# 用法: ./check-port.sh [端口号]

PORT=${1:-3000}

echo "🔍 查询端口 $PORT 占用情况..."
echo ""

# 检查端口是否被占用
if ! lsof -i :$PORT >/dev/null 2>&1; then
    echo "✅ 端口 $PORT 未被占用"
    exit 0
fi

echo "⚠️  端口 $PORT 已被占用！"
echo ""

# 显示占用信息
echo "📊 端口占用详情:"
lsof -i :$PORT
echo ""

# 获取进程 PID
PID=$(lsof -ti :$PORT)
if [ -n "$PID" ]; then
    echo "🔍 进程详情:"
    ps -p $PID -f
    echo ""

    echo "📁 工作目录:"
    lsof -p $PID | grep cwd | awk '{print $9}'
    echo ""

    echo "💡 停止进程的命令:"
    echo "   kill $PID        # 正常停止"
    echo "   kill -9 $PID     # 强制停止"
fi
