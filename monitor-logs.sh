#!/bin/bash

# 实时监控所有站点日志
# 用法: ./monitor-logs.sh

echo "📊 开始监控所有站点日志..."
echo "按 Ctrl+C 停止监控"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 使用 tail -f 同时监控3个日志文件
# -F 选项会在文件不存在时等待，存在时继续监控
tail -f logs/main.log logs/auth.log logs/dashboard.log 2>/dev/null | while read line; do
    # 根据日志来源添加颜色标记
    if [[ $line == ==>* ]]; then
        # 文件名标记
        echo -e "\033[1;36m$line\033[0m"
    elif [[ $line == *"error"* ]] || [[ $line == *"Error"* ]] || [[ $line == *"ERROR"* ]]; then
        # 错误日志 - 红色
        echo -e "\033[1;31m$line\033[0m"
    elif [[ $line == *"warn"* ]] || [[ $line == *"Warning"* ]] || [[ $line == *"WARN"* ]]; then
        # 警告日志 - 黄色
        echo -e "\033[1;33m$line\033[0m"
    elif [[ $line == *"success"* ]] || [[ $line == *"Success"* ]] || [[ $line == *"✓"* ]]; then
        # 成功日志 - 绿色
        echo -e "\033[1;32m$line\033[0m"
    elif [[ $line == *"GET"* ]] || [[ $line == *"POST"* ]] || [[ $line == *"PUT"* ]] || [[ $line == *"DELETE"* ]]; then
        # HTTP 请求 - 蓝色
        echo -e "\033[0;34m$line\033[0m"
    else
        # 普通日志 - 默认颜色
        echo "$line"
    fi
done
