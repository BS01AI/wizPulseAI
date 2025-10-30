#!/bin/bash

# WizPulseAI 日志查看脚本
# 使用方法:
#   ./scripts/view-logs.sh auth       - 查看 Auth 站点日志
#   ./scripts/view-logs.sh dashboard  - 查看 Dashboard 站点日志
#   ./scripts/view-logs.sh main       - 查看 Main 站点日志
#   ./scripts/view-logs.sh all        - 查看所有站点日志

SITE=$1

if [ -z "$SITE" ]; then
  echo "❌ 请指定站点名称"
  echo ""
  echo "使用方法:"
  echo "  ./scripts/view-logs.sh auth       - 查看 Auth 站点日志"
  echo "  ./scripts/view-logs.sh dashboard  - 查看 Dashboard 站点日志"
  echo "  ./scripts/view-logs.sh main       - 查看 Main 站点日志"
  echo "  ./scripts/view-logs.sh all        - 查看所有站点日志"
  exit 1
fi

case $SITE in
  auth)
    echo "📝 Auth 站点日志 (最后50行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -50 logs/auth.log
    ;;
  dashboard)
    echo "📝 Dashboard 站点日志 (最后50行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -50 logs/dashboard.log
    ;;
  main)
    echo "📝 Main 站点日志 (最后50行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -50 logs/main.log
    ;;
  all)
    echo "📝 Auth 站点日志 (最后20行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -20 logs/auth.log
    echo ""
    echo "📝 Dashboard 站点日志 (最后20行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -20 logs/dashboard.log
    echo ""
    echo "📝 Main 站点日志 (最后20行):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -20 logs/main.log
    ;;
  *)
    echo "❌ 未知站点: $SITE"
    echo "可用选项: auth, dashboard, main, all"
    exit 1
    ;;
esac
