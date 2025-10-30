# WizPulseAI 脚本工具集

> 项目管理和开发辅助脚本

---

## 📁 脚本列表

### 🚀 启动和停止

#### `start-all.sh`
**完整的启动脚本**

功能：
- 检查依赖是否已安装
- 检查端口是否被占用
- 启动3个站点（Auth, Dashboard, Main）
- 创建日志文件
- 保存进程 PID

使用方法：
```bash
# 在根目录执行（推荐）
./start.sh

# 或直接执行
./scripts/start-all.sh
```

#### `stop-all.sh`
**停止所有站点**

功能：
- 从 PID 文件读取进程 ID
- 优雅地停止所有站点
- 清理遗留进程
- 删除 PID 文件

使用方法：
```bash
# 在根目录执行（推荐）
./stop.sh

# 或直接执行
./scripts/stop-all.sh
```

---

### 📦 依赖管理

#### `install-deps.sh`
**一键安装所有依赖**

功能：
- 依次为3个站点安装 npm 依赖
- 显示安装进度

使用方法：
```bash
./scripts/install-deps.sh
```

适用场景：
- 首次克隆项目后
- 清理 node_modules 后
- 依赖版本更新后

---

### 🔀 Git 多项目监控

#### `git-status-all.sh` ⭐ 推荐
**快速查看所有子项目的 Git 状态**

功能：
- 显示每个子项目的分支、状态
- 统计未提交文件数、未推送提交数
- 清晰的视觉标识（✅ 干净 / ⚠️ 有变更）
- 显示最近一次提交信息

使用方法：
```bash
./scripts/git-status-all.sh
```

输出示例：
```
🔍 WizPulseAI 子项目 Git 状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 干净 Auth站点
   📁 目录: auth-wizpulseai-com
   🌿 分支: main
   📝 未提交文件: 0 个
   ⬆️  未推送提交: 0 个
   🕐 最近提交: a1b2c3d - feat: add login page (2 hours ago)
```

---

#### `git-diff-all.sh`
**查看所有子项目的详细差异**

功能：
- 显示每个文件的具体改动
- 支持多种模式（未暂存/已暂存/全部）
- 统计改动行数

使用方法：
```bash
# 查看未暂存的改动
./scripts/git-diff-all.sh

# 查看已暂存的改动
./scripts/git-diff-all.sh --staged

# 查看所有改动
./scripts/git-diff-all.sh --all

# 只显示统计信息（快速）
./scripts/git-diff-all.sh --stat
```

---

#### `git-interactive.sh`
**交互式 Git 管理工具**

功能：
- 菜单选择要管理的子项目
- 执行常用 Git 操作（status, diff, log, branch）
- 支持自定义 Git 命令
- 查看所有项目概览

使用方法：
```bash
./scripts/git-interactive.sh

# 然后按照菜单提示选择：
# 1-3: 选择子项目
# a: 查看所有项目概览
# q: 退出
```

---

#### `git-dashboard.sh`
**图形化仪表盘**

功能：
- 彩色表格展示所有项目状态
- 进度条显示改动比例
- 实时统计总览
- 支持 watch 模式实时监控

使用方法：
```bash
# 单次查看
./scripts/git-dashboard.sh

# 实时监控（每5秒刷新）
watch -n 5 ./scripts/git-dashboard.sh

# 或使用 watch 的彩色模式
watch -n 5 -c ./scripts/git-dashboard.sh
```

---

### 🔍 站点监控和调试

#### `check-status.sh`
**检查站点运行状态**

功能：
- 检查3个站点是否正在运行
- 显示端口占用情况
- 显示进程 PID 和日志位置

使用方法：
```bash
./scripts/check-status.sh
```

输出示例：
```
🔍 检查站点运行状态...

✅ Auth        (端口 3001) - 运行中
✅ Dashboard   (端口 3002) - 运行中
✅ Main        (端口 3000) - 运行中

📝 日志文件位置:
   Auth:      logs/auth.log (PID: 12345)
   Dashboard: logs/dashboard.log (PID: 12346)
   Main:      logs/main.log (PID: 12347)
```

#### `view-logs.sh`
**查看站点日志**

功能：
- 查看指定站点的日志
- 支持查看所有站点日志

使用方法：
```bash
# 查看 Auth 站点日志（最后50行）
./scripts/view-logs.sh auth

# 查看 Dashboard 站点日志
./scripts/view-logs.sh dashboard

# 查看 Main 站点日志
./scripts/view-logs.sh main

# 查看所有站点日志（每个20行）
./scripts/view-logs.sh all
```

---

## 🎯 常用工作流

### 首次启动项目
```bash
# 1. 安装依赖
./scripts/install-deps.sh

# 2. 配置环境变量
# 编辑各站点的 .env.local 文件

# 3. 启动所有站点
./start.sh

# 4. 检查状态
./scripts/check-status.sh
```

### 日常开发
```bash
# 启动
./start.sh

# 查看状态
./scripts/check-status.sh

# 查看日志（如果有问题）
./scripts/view-logs.sh all

# 停止
./stop.sh
```

### 调试问题
```bash
# 1. 检查哪些站点在运行
./scripts/check-status.sh

# 2. 查看错误日志
./scripts/view-logs.sh auth       # 或 dashboard, main

# 3. 停止所有站点
./stop.sh

# 4. 重新启动
./start.sh
```

---

## 📝 日志文件位置

所有日志文件存储在 `logs/` 目录：

```
logs/
├── auth.log         # Auth 站点日志
├── dashboard.log    # Dashboard 站点日志
├── main.log         # Main 站点日志
├── auth.pid         # Auth 站点进程 ID
├── dashboard.pid    # Dashboard 站点进程 ID
└── main.pid         # Main 站点进程 ID
```

---

## ⚙️ 配置说明

### 端口分配
- **Auth**: 3001
- **Dashboard**: 3002
- **Main**: 3000

### 进程管理
所有站点以后台进程运行，PID 保存在 `logs/*.pid` 文件中。

### 日志轮转
日志文件不会自动轮转，建议定期清理：
```bash
# 清理日志文件
rm logs/*.log

# 或者归档
mv logs logs-backup-$(date +%Y%m%d)
mkdir logs
```

---

## 🛠️ 高级用法

### 单独启动某个站点
```bash
# 只启动 Auth 站点
cd auth-wizpulseai-com
npm run dev -- -p 3001

# 只启动 Dashboard 站点
cd db-wizPulseAI-com
npm run dev -- -p 3002

# 只启动 Main 站点
cd wizPulseAI-com
npm run dev
```

### 实时查看日志
```bash
# 实时跟踪 Auth 站点日志
tail -f logs/auth.log

# 同时查看3个站点日志
tail -f logs/auth.log logs/dashboard.log logs/main.log
```

### 手动清理进程
```bash
# 查找占用端口的进程
lsof -i :3001
lsof -i :3002
lsof -i :3000

# 杀死进程
kill <PID>
```

---

## 📚 相关文档

- [LOCAL_TEST_GUIDE.md](../LOCAL_TEST_GUIDE.md) - 本地测试完整指南
- [NEXT_STEPS.md](../NEXT_STEPS.md) - 开发计划
- [README.md](../README.md) - 项目总览

---

最后更新: 2025-10-30
