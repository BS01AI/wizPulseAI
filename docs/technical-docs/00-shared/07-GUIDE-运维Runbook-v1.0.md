# 运维 Runbook（日常操作）

## 用户与权限
- 在仪表盘 Admin 界面或 API 更新 `app_role`（admin/user/deleted）
- 变更后建议让用户重新登录（会话中含有角色声明）

## 密钥轮换
- Vercel 中更新：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`SUPABASE_SERVICE_ROLE_KEY`
- 触发重新部署；必要时失效旧密钥

## 数据备份
- 使用仓库 `backup_scripts/*`：
  - `simple_backup.sh`：手动触发
  - `pg_dump_backup.sh` / `supabase_backup.sh`：周期性任务
- 将备份同步至受限对象存储；保留至少 7/14/30 天周期

## 恢复演练
- 将备份恢复到 Supabase 预览项目或本地实例
- 重点验证：用户登录、订阅状态、产品/价格映射

## Stripe Webhook 故障
- 检查签名校验与事件重放（Stripe Dashboard 支持 replay）
- 根据事件 ID 去重，避免重复记账

## 认证/SSO 故障排查
- 清理浏览器站点数据（避免旧 Cookie 干扰）
- 观察 `auth` 回调日志（是否成功写 Cookie）
- 确认三站点环境变量一致、域名/SameSite 策略一致
