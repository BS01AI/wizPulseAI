#!/bin/bash

# WizPulseAI 依赖安装脚本
# 为所有3个站点安装依赖

echo "📦 开始安装依赖..."
echo ""

# 安装 Auth 站点依赖
echo "▶️  安装 Auth 站点依赖..."
cd auth-wizpulseai-com
npm install
cd ..
echo "✅ Auth 站点依赖安装完成"
echo ""

# 安装 Dashboard 站点依赖
echo "▶️  安装 Dashboard 站点依赖..."
cd db-wizPulseAI-com
npm install
cd ..
echo "✅ Dashboard 站点依赖安装完成"
echo ""

# 安装 Main 站点依赖
echo "▶️  安装 Main 站点依赖..."
cd wizPulseAI-com
npm install
cd ..
echo "✅ Main 站点依赖安装完成"
echo ""

echo "🎉 所有依赖安装完成！"
echo ""
echo "下一步: ./start.sh"
