# WizPulseAI E2E Tests (Playwright)

独立的端到端测试工作区，支持本地联调（.local.wiz）与线上预览/生产域。

## 目录结构
- `playwright.config.ts` 测试配置（多项目：auth / dashboard / www）
- `tests/` 基础用例（无登录、重定向校验、主站可用性）
- `helpers/` 可选工具（预留登录/存储状态等）

## 使用步骤
1) 安装依赖
```
cd e2e
npm install
npx playwright install
```

2) 本地模式（配合 /scripts/local-dev 与 .local.wiz）
```
# 先按仓库文档启动三个本地服务
# 如需自定义端口（示例 3005/3006/3007）：
# scripts/local-dev/dev-all.sh 3005 3006 3007
# 并确保已在 hosts 添加三条映射到 127.0.0.1：
#  www.local.wiz  dashboard.local.wiz  auth.local.wiz

# 运行本地 e2e（端口同样可通过环境变量覆盖）
PLAY_LOCAL_WWW_PORT=3005 PLAY_LOCAL_AUTH_PORT=3006 PLAY_LOCAL_DB_PORT=3007 \
npm run test:local
```

3) 在线模式（预览/生产）
```
# 示例：指向线上真实域（或预览域）
PREVIEW_BASE_AUTH=https://auth.wizpulseai.com \
PREVIEW_BASE_DASHBOARD=https://dashboard.wizpulseai.com \
PREVIEW_BASE_WWW=https://www.wizpulseai.com \
npm run test:online
```

4) 打开可视化测试运行器
```
npm run test:ui
```

## 可选：带账户的登录场景
- 如果你配置了测试账号（邮箱/密码），可以在后续用例中加入“登录后”断言。
- 由于 Auth UI 可能多语言，建议在本地先确认选择器（或提供稳定的 `data-testid`）。

## 环境变量
- 本地：使用固定 `.local.wiz` 域，无需额外配置。
- 在线：
  - `PREVIEW_BASE_AUTH`、`PREVIEW_BASE_DASHBOARD`、`PREVIEW_BASE_WWW` 指向目标环境域名。

---

提示：当前用例默认不依赖登录即可验证 SSO 重定向与页面可用性；后续可基于测试账号扩展登录后的断言与流程（订阅、结算等）。
