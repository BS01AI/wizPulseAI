#!/bin/bash

echo "⚠️  彻底删除 Chrome 缓存文件夹"
echo ""
echo "警告: 这会清除所有浏览器缓存（但不会删除书签、密码等）"
echo ""
read -p "确定要继续吗？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "已取消"
    exit 1
fi

echo ""
echo "步骤1: 完全退出 Chrome (Cmd+Q)"
echo "按任意键继续..."
read -n 1 -s

echo ""
echo "步骤2: 删除缓存文件夹..."

CHROME_CACHE="$HOME/Library/Caches/Google/Chrome"
if [ -d "$CHROME_CACHE" ]; then
    rm -rf "$CHROME_CACHE"
    echo "✅ 已删除: $CHROME_CACHE"
else
    echo "❌ 目录不存在: $CHROME_CACHE"
fi

CHROME_APP_CACHE="$HOME/Library/Application Support/Google/Chrome/Default/Cache"
if [ -d "$CHROME_APP_CACHE" ]; then
    rm -rf "$CHROME_APP_CACHE"
    echo "✅ 已删除: $CHROME_APP_CACHE"
else
    echo "❌ 目录不存在: $CHROME_APP_CACHE"
fi

echo ""
echo "✅ 缓存已清除！"
echo ""
echo "步骤3: 重新打开 Chrome"
echo "步骤4: 访问 http://localhost:3000"
echo ""
echo "现在应该不会再跳转到 /zh 了 ✅"
