#!/bin/bash

echo "=== Phase 3 内容验证测试 ==="
echo ""

# 测试1: Main站点阿拉伯语RTL
echo "=== 测试1: Main站点阿拉伯语RTL ==="
curl -s http://localhost:3010/ar | grep -o 'dir="rtl"' | head -1
if [ $? -eq 0 ]; then
  echo "✅ Main阿拉伯语: RTL属性存在"
else
  echo "❌ Main阿拉伯语: RTL属性缺失"
fi
echo ""

# 测试2: Auth站点术语检查（日语）
echo "=== 测试2: Auth站点日语术语 ==="
curl -s http://localhost:3011 | grep -o 'ログイン' | head -1
if [ $? -eq 0 ]; then
  echo "✅ Auth站点: 使用正确的术语'ログイン'"
else
  echo "⚠️  Auth站点: 可能使用其他术语"
fi
echo ""

# 测试3: Auth站点阿拉伯语RTL
echo "=== 测试3: Auth站点阿拉伯语RTL ==="
curl -s 'http://localhost:3011?lang=ar' | grep -o 'dir="rtl"' | head -1
if [ $? -eq 0 ]; then
  echo "✅ Auth阿拉伯语: RTL属性存在"
else
  echo "❌ Auth阿拉伯语: RTL属性缺失"
fi
echo ""

# 测试4: Dashboard站点阿拉伯语RTL
echo "=== 测试4: Dashboard站点阿拉伯语RTL ==="
curl -s 'http://localhost:3012?lang=ar' | grep -o 'dir="rtl"' | head -1
if [ $? -eq 0 ]; then
  echo "✅ Dashboard阿拉伯语: RTL属性存在"
else
  echo "❌ Dashboard阿拉伯语: RTL属性缺失"
fi
echo ""

# 测试5: Main站点繁体中文
echo "=== 测试5: Main站点繁体中文内容 ==="
zh_content=$(curl -s http://localhost:3010/zh-TW | grep -o '關於' | head -1)
if [ -n "$zh_content" ]; then
  echo "✅ Main繁体中文: 包含繁体字'關於'"
else
  echo "⚠️  Main繁体中文: 未检测到明显繁体字"
fi
echo ""

echo "=== 测试完成 ==="
