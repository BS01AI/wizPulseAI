# 本地与线上环境分离（干净的本地测试环境）

目标：在不改动线上已发布站点的前提下，提供一套“可一键启用”的本地 SSO 联调环境，且与线上清晰区分。

## 域名与 Cookie 策略
- 线上域：`.wizpulseai.com`（生产/预览）
- 本地域：`.local.wiz`（hosts 伪域，仅本地使用）
- Cookie：
  - 线上：`domain=.wizpulseai.com; Secure; SameSite=None; HttpOnly`
  - 本地：`domain=.local.wiz; SameSite=Lax`（如需 iframe/跨站嵌入，则改为 `None + Secure` 并自备 HTTPS）

## 步骤 1：添加 hosts（macOS/Linux）
将以下内容加入 `/etc/hosts`：
```
127.0.0.1  www.local.wiz
127.0.0.1  dashboard.local.wiz
127.0.0.1  auth.local.wiz
```
Windows 请修改 `C:\\Windows\\System32\\drivers\\etc\\hosts`。

也可参考仓库：`scripts/local-dev/hosts.sample`。

## 步骤 2：生成 env 样例并区分环境
执行脚本：`scripts/local-dev/create-env-examples.sh`

它会在三个站点目录下生成 `.env.local.example`（不覆盖已有文件），预填：
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`（你需要自行填写）
- `NEXT_PUBLIC_COOKIE_DOMAIN=.local.wiz`
- Auth：`NEXT_PUBLIC_DEFAULT_REDIRECT_URL=http://dashboard.local.wiz:3002`
- 仪表盘：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`（占位）
- 三站点：`NEXT_PUBLIC_ENV=local`（用于前端显示“本地环境”标记）

将每个 `.env.local.example` 复制为 `.env.local` 并填充 Supabase/Stripe 的真实凭据。

## 步骤 3：启动服务（可自定义端口）
- 默认端口：主站 3000，auth 3001，dashboard 3002。
- 一键脚本：`scripts/local-dev/dev-all.sh`（检测 tmux，存在则分窗启动；否则提示手动命令）。
- 自定义端口用法：
  - 方式 A（参数）：`scripts/local-dev/dev-all.sh 3005 3006 3007`
  - 方式 B（环境变量）：`LOCAL_WWW_PORT=3005 LOCAL_AUTH_PORT=3006 LOCAL_DB_PORT=3007 scripts/local-dev/dev-all.sh`

如果自定义了端口，记得调整 Auth 站点的 `NEXT_PUBLIC_DEFAULT_REDIRECT_URL`（例如：`http://dashboard.local.wiz:3007`）。

## 步骤 4：线上与本地区分
- 前端建议使用 `NEXT_PUBLIC_ENV` 渲染一个顶栏/角标（例如“LOCAL”/“STAGING”），避免误用。
- 简易实现参考：
```
// 伪代码：在 layout 里渲染
if (process.env.NEXT_PUBLIC_ENV && process.env.NEXT_PUBLIC_ENV !== 'production') {
  // 渲染一个固定右上角小角标，颜色不同环境不同
}
```

## 常见问题
- 回调失败：Supabase 控制台 Redirect URL 是否包含 `http://auth.local.wiz:3001/api/auth/callback`
- Cookie 不生效：检查域是否 `.local.wiz`、端口与 hosts 是否一致
- 会话丢失：三站点是否使用相同 Supabase 项目与 Cookie 策略；SSR 是否读取会话

## 何时用线上预览测试
- 需要 HTTPS、与生产一致的 Cookie/SameSite/域策略时，建议使用 Vercel 预览域联测（所有站点均为预览域）。

## 进阶：本地启用 HTTPS 以测试 Google 登录
Google OAuth 仅对 `http://localhost` 允许明文回调；自定义域需要 HTTPS。要在本地用 `auth.local.wiz` 测试 Google 登录：

1) 安装工具（macOS 示例）
```
brew install mkcert caddy
```

2) 生成本地受信任证书
```
bash scripts/local-dev/setup-mkcert.sh
```

3) 启动 Caddy 作为反向代理（终止 TLS 并转发到 3000/3001/3002）
```
caddy run --config scripts/local-dev/Caddyfile
```

4) 改用 HTTPS 访问
- https://auth.local.wiz  → 反代到本地 3001
- https://dashboard.local.wiz → 反代到本地 3002
- https://www.local.wiz → 反代到本地 3000

如使用自定义端口（例如 3005/3006/3007），需要修改 `scripts/local-dev/Caddyfile` 中的 `reverse_proxy` 端口。

5) 调整环境变量（如需）
- Auth：`NEXT_PUBLIC_DEFAULT_REDIRECT_URL=https://dashboard.local.wiz`
- 三站点：`NEXT_PUBLIC_COOKIE_DOMAIN=.local.wiz`（不变）

6) Google 控制台配置
- OAuth 2.0 授权重定向 URI 新增：`https://auth.local.wiz/api/auth/callback`

提示：首次访问浏览器会显示证书来源为“本地 CA”，若已通过 mkcert 安装并信任，则可正常使用。

## 结合 Playwright（本地端口可变）
在 `e2e/` 运行本地测试时，如自定义端口，请设置：
```
PLAY_LOCAL_WWW_PORT=3005 \
PLAY_LOCAL_AUTH_PORT=3006 \
PLAY_LOCAL_DB_PORT=3007 \
npm run test:local
```
