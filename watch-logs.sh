#!/bin/bash

# 彩色输出函数
print_main() { echo -e "\033[0;32m[MAIN]\033[0m $1"; }
print_auth() { echo -e "\033[0;34m[AUTH]\033[0m $1"; }
print_dashboard() { echo -e "\033[0;35m[DASHBOARD]\033[0m $1"; }
print_divider() { echo -e "\033[0;90m----------------------------------------\033[0m"; }

echo "🔍 开始监控 WizPulseAI 三站点日志..."
echo ""
print_divider

# 使用 tail -f 实时监控三个日志文件
tail -f logs/main.log logs/auth.log logs/dashboard.log 2>/dev/null | while read line
do
  # 根据日志来源添加颜色标签
  if [[ "$line" == "==> logs/main.log <==" ]]; then
    print_divider
    print_main "Main 站点日志"
    print_divider
  elif [[ "$line" == "==> logs/auth.log <==" ]]; then
    print_divider
    print_auth "Auth 站点日志"
    print_divider
  elif [[ "$line" == "==> logs/dashboard.log <==" ]]; then
    print_divider
    print_dashboard "Dashboard 站点日志"
    print_divider
  else
    # 根据关键字高亮显示
    if [[ "$line" =~ (error|Error|ERROR) ]]; then
      echo -e "\033[0;31m$line\033[0m"  # 红色：错误
    elif [[ "$line" =~ (auth|Auth|sign|Sign|login|Login) ]]; then
      echo -e "\033[1;33m$line\033[0m"  # 黄色高亮：认证相关
    elif [[ "$line" =~ (supabase|Supabase) ]]; then
      echo -e "\033[1;36m$line\033[0m"  # 青色高亮：Supabase
    elif [[ "$line" =~ (cookie|Cookie|session|Session) ]]; then
      echo -e "\033[1;35m$line\033[0m"  # 紫色高亮：Cookie/Session
    elif [[ "$line" =~ (200|201|302) ]]; then
      echo -e "\033[0;32m$line\033[0m"  # 绿色：成功请求
    elif [[ "$line" =~ (404|500|403) ]]; then
      echo -e "\033[0;31m$line\033[0m"  # 红色：错误请求
    else
      echo "$line"
    fi
  fi
done
