#!/bin/bash

echo "=== Cookie域配置测试 ==="
echo ""

# 检查Auth站点的Cookie配置代码
echo "=== 1. Auth站点 Cookie配置 ==="
echo "检查 auth-wizpulseai-com/lib/auth-helpers.ts:"
grep -A 5 "cookieOptions" auth-wizpulseai-com/lib/auth-helpers.ts 2>/dev/null | head -10
echo ""

# 检查Dashboard站点的Cookie配置代码
echo "=== 2. Dashboard站点 Cookie配置 ==="
echo "检查 db-wizPulseAI-com/lib/supabase/client.ts:"
grep -A 5 "cookieOptions\|domain:" db-wizPulseAI-com/lib/supabase/client.ts 2>/dev/null | head -10
echo ""

# 检查Main站点的配置
echo "=== 3. Main站点配置 ==="
echo "检查环境变量配置:"
if [ -f "wizPulseAI-com/.env.local" ]; then
  grep "COOKIE_DOMAIN" wizPulseAI-com/.env.local
else
  echo "未找到 .env.local 文件"
fi
echo ""

# 检查统一常量配置
echo "=== 4. 统一常量配置检查 ==="
echo "检查 TRANSLATION_GLOSSARY.md 中的术语统一情况:"
if [ -f "wizPulseAI-docs/TRANSLATION_GLOSSARY.md" ]; then
  echo "✅ 术语统一表文档存在"
  grep -i "ログイン\|サインイン" wizPulseAI-docs/TRANSLATION_GLOSSARY.md 2>/dev/null | head -3
else
  echo "⚠️  术语统一表文档不存在"
fi
echo ""

echo "=== Cookie测试建议 ==="
echo "建议手动验证Cookie域设置："
echo "1. 打开浏览器DevTools (F12)"
echo "2. 访问 http://localhost:3012，点击登录"
echo "3. 登录成功后，查看Application → Cookies"
echo "4. 验证Cookie的domain字段应该是：.localhost"
echo ""
