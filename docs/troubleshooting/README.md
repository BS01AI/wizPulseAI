# WizPulseAI 故障排查指南

常见问题和解决方案汇总

---

## 📚 问题分类

### 浏览器缓存问题

- [**Chrome 301 重定向缓存问题**](./CHROME_301_REDIRECT_CACHE.md) ⭐ **重要**
  - 访问 localhost:3000 自动跳转到 /zh
  - 301 永久重定向缓存机制详解
  - 完整解决方案和预防措施
  - **最佳实践**: DevTools 禁用缓存

### SSO 认证问题

- Cookie 跨域问题
- Session 过期问题
- 登录状态不同步
- 参考: [SSO 测试文档](../test/SSO_AUTHENTICATION_TEST.md)

### 开发环境问题

- 端口占用冲突
- Service Worker 缓存冲突
- 依赖安装失败
- 参考: [本地测试指南](../../NEXT_STEPS.md)

---

## 🔧 快速工具

### 检查脚本
```bash
# 检查端口占用
./check-port.sh 3000

# 检查所有站点状态
./check-status.sh
```

### 清除缓存脚本
```bash
# 清除 Chrome 重定向缓存（指南）
./clear-chrome-redirect.sh

# 删除 Chrome 缓存文件夹
./delete-chrome-cache.sh

# 清除浏览器缓存（手动指南）
open MANUAL_CACHE_CLEAR_GUIDE.md
```

### 站点管理脚本
```bash
# 启动所有站点
./start-all.sh

# 停止所有站点
./stop-all.sh

# 查看日志
./watch-logs.sh
```

---

## 🎯 问题排查流程

### 1. 页面无法访问

```
页面无法加载
    ↓
检查服务是否运行
    ├─ 否 → 运行 ./start-all.sh
    └─ 是 ↓
         检查端口是否正确
         └─ ./check-port.sh 3010
```

### 2. 自动跳转问题

```
访问 / 跳转到 /zh
    ↓
检查 Network 面板
    ↓
看到 "301 from disk cache"？
    ├─ 是 → Chrome 301 缓存问题
    │        → 参考 CHROME_301_REDIRECT_CACHE.md
    └─ 否 → 检查 middleware 配置
```

### 3. 登录问题

```
无法登录或登录状态不同步
    ↓
检查 Cookie
    ├─ F12 → Application → Cookies
    └─ 查看 .localhost 域的 Cookie
        ↓
    Cookie 存在？
    ├─ 否 → 检查 NEXT_PUBLIC_COOKIE_DOMAIN
    └─ 是 → 检查 Cookie 值是否有效
```

---

## 📊 常见错误码

### HTTP 状态码

| 状态码 | 含义 | 常见原因 |
|--------|------|---------|
| 301 | 永久重定向 | 浏览器缓存的重定向 |
| 302 | 临时重定向 | 正常的重定向 |
| 404 | 未找到 | 路由不存在或端口错误 |
| 500 | 服务器错误 | 代码错误，检查日志 |
| ERR_FAILED | 加载失败 | Service Worker 冲突 |

### 浏览器错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| ERR_FAILED | Service Worker 缓存 | 清除 Service Worker |
| ERR_CONNECTION_REFUSED | 服务未运行 | 启动开发服务器 |
| ERR_NAME_NOT_RESOLVED | DNS 问题 | 检查 hosts 文件 |

---

## 💡 最佳实践

### 开发环境设置

1. **禁用缓存**
   ```
   F12 → Network → ☑ Disable cache
   保持 DevTools 打开
   ```

2. **使用隐身模式**
   ```
   Cmd+Shift+N (Mac)
   Ctrl+Shift+N (Win)
   ```

3. **端口规划**
   ```
   WizPulseAI:  3010/3011/3012
   其他项目:    3000/8080/5000
   ```

### 问题排查原则

1. ✅ 先检查浏览器缓存
2. ✅ 使用隐身模式验证
3. ✅ 检查 Network 面板
4. ✅ 查看服务器日志
5. ❌ 最后才怀疑代码逻辑

---

## 🔗 相关文档

### 测试文档
- [SSO 认证测试](../test/SSO_AUTHENTICATION_TEST.md)
- [快速测试清单](../test/QUICK_TEST_CHECKLIST.md)

### 开发文档
- [开发计划](../DEVELOPMENT_PLAN.md)
- [下一步计划](../../NEXT_STEPS.md)

### 手动操作指南
- [手动清除缓存指南](../../MANUAL_CACHE_CLEAR_GUIDE.md)
- [端口冲突解释](../PORT_CONFLICT_EXPLANATION.md)

---

## 📝 反馈和贡献

遇到新问题？欢迎补充到本文档：

1. 描述问题症状
2. 分析根本原因
3. 提供解决方案
4. 添加预防建议

---

最后更新: 2025-10-31
