# 本地联调与开发（跨子域 SSO）

## 伪子域与 hosts
在本地通过 hosts 配置模拟子域，确保顶级域 Cookie 可跨站：

```
127.0.0.1  www.local.wiz
127.0.0.1  dashboard.local.wiz
127.0.0.1  auth.local.wiz
```

浏览器以 `http://*.local.wiz` 访问。

## 端口建议
- www：3000
- auth：3001
- dashboard：3002

## 开发环境变量
- `NEXT_PUBLIC_COOKIE_DOMAIN=.local.wiz`
- `NEXT_PUBLIC_SUPABASE_URL`（使用云端项目或本地 Supabase）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- auth：`NEXT_PUBLIC_DEFAULT_REDIRECT_URL=http://dashboard.local.wiz:3002`

## Supabase Redirect URL（本地）
- `http://auth.local.wiz:3001/api/auth/callback`

## 启动与联调
1) 分别在三个目录 `npm run dev`
2) 访问 `auth.local.wiz:3001` 登录 → 回调写 Cookie → 跳转 dashboard
3) 刷新 `www` 与 `dashboard`，确认 SSR 已识别登录态

## 常见问题
- Cookie 不生效：检查域名是否为 `.local.wiz` 顶级域、浏览器是否屏蔽第三方 Cookie
- 回调失败：检查 Supabase 控制台的 Redirect URL 与环境变量
- 会话丢失：确认服务端均使用统一的 Cookie 选项与同一 Supabase 项目
