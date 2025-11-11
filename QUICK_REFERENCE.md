# ⚡ WizPulseAI 快速参考

## 🎯 交互式管理工具（推荐）

```bash
./manage.sh
```

**功能**：
- 🚀 启动/停止站点（全部或单个）
- 📊 实时查看状态
- 📝 查看日志
- 🔄 重启站点

---

## 📍 站点地址

| 站点 | 地址 | 端口 |
|-----|------|------|
| 🌐 Main | http://localhost:3010 | 3010 |
| 🔐 Auth | http://localhost:3011/auth | 3011 |
| 📊 Dashboard | http://localhost:3012 | 3012 |

---

## ⚡ 快捷命令

```bash
# 启动所有
./start-all.sh

# 停止所有
./stop-all.sh

# 实时日志（彩色）
./watch-logs.sh

# 交互式管理
./manage.sh
```

---

## 📝 日志位置

```
logs/main.log
logs/auth.log
logs/dashboard.log
```

---

## 🔧 故障排查

```bash
# 查看状态
./manage.sh  # 选项 6

# 清理进程
./stop-all.sh

# 强制清理
pkill -f "next dev"
rm -rf .pids/*

# 重启
./start-all.sh
```

---

## 🧪 测试 SSO

1. 启动: `./start-all.sh`
2. 等待 10-15 秒
3. 访问: http://localhost:3011/auth
4. 登录后访问其他站点测试

---

**更新**: 2025-10-30
