#!/bin/bash

echo "=== Phase 3 快速测试 ==="
echo ""

test_count=0
pass_count=0

test_url() {
  local name=$1
  local url=$2
  test_count=$((test_count + 1))
  
  echo "测试 $test_count: $name"
  echo "URL: $url"
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "200" ] || [ "$status" = "302" ]; then
    echo "✅ 通过 (HTTP $status)"
    pass_count=$((pass_count + 1))
  else
    echo "❌ 失败 (HTTP $status)"
  fi
  echo ""
}

echo "=== Task 1: Main站点多语言测试 ==="
test_url "Main日语页面" "http://localhost:3010/ja"
test_url "Main阿拉伯语页面" "http://localhost:3010/ar"
test_url "Main繁体中文页面" "http://localhost:3010/zh-TW"

echo "=== Task 2: Auth站点测试 ==="
test_url "Auth默认页面" "http://localhost:3011"
test_url "Auth阿拉伯语页面" "http://localhost:3011?lang=ar"

echo "=== Task 3: Dashboard站点测试 ==="
test_url "Dashboard欢迎页" "http://localhost:3012"
test_url "Dashboard阿拉伯语" "http://localhost:3012?lang=ar"

echo "==================================="
echo "测试总结: $pass_count/$test_count 通过"
echo "==================================="
