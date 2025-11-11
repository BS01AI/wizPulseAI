# Chrome 本地开发中 `/` 自动跳转 `/zh` 的问题总结

**问题发现日期**: 2025-10-31
**解决状态**: ✅ 已解决
**根本原因**: Chrome 缓存了 301 永久重定向

---

## 🎯 问题描述

### 症状
- 在使用 Next.js 本地开发环境（如 `http://localhost:3000`）时，浏览器访问根路径 `/` 会**自动跳转**到 `/zh`。
- 在其他浏览器（如 Safari、Firefox）中没有此问题，仅 Chrome 出现。
- 清空 cookie、localStorage、Service Worker、项目重建（`.next` 删除）等操作都**无法解决**。

### 技术细节
在 Chrome DevTools 的 Network 面板可以看到：
```
Status Code: 301 Moved Permanently (from disk cache)
Location: /zh
```
表明是浏览器缓存了 "`/` → `/zh`" 的永久重定向规则。

---

## 🧠 原因分析

### HTTP 301 状态码的特性
- HTTP 状态码 `301 Moved Permanently` 被浏览器视作**永久跳转**，会被 **长期缓存**（即使服务端逻辑已删除跳转）。
- Chrome 对 301 跳转的缓存管理较为顽固，仅清普通缓存/cookie 并不能清除该跳转缓存。

### 为什么会发生
在本案例中：
1. **WizPulseAI 项目**使用了 `next-intl` 多语言路由
2. 访问 `http://localhost:3000/` 时，middleware 自动重定向到 `http://localhost:3000/zh`
3. 返回 **301 Moved Permanently** 状态码
4. Chrome 将这个重定向规则**永久缓存**
5. 后续即使运行其他项目（如 SPF-system），Chrome 仍然执行缓存的重定向

### 缓存存储位置
```
Chrome 磁盘缓存
  └── localhost:3000 (key)
        ├── URL: /
        ├── Status: 301 Permanent Redirect
        ├── Location: /zh
        └── Cached: true ⚡ (长期保存)
```

### 为什么常规清除方法无效

| 清除方法 | 是否有效 | 原因 |
|---------|---------|------|
| 清除 Cookie | ❌ 无效 | 重定向缓存不在 Cookie 中 |
| 清除 LocalStorage | ❌ 无效 | 重定向缓存不在 Storage 中 |
| 清除 Service Worker | ❌ 无效 | 重定向缓存不在 SW 中 |
| 删除 `.next` 目录 | ❌ 无效 | 服务端删除不影响浏览器缓存 |
| 重启浏览器 | ❌ 无效 | 301 缓存存储在磁盘，重启不清除 |
| 硬刷新 (Cmd+Shift+R) | ⚠️ 部分有效 | 有时能绕过，但不一定清除 |

---

## ✅ 解决流程（优先级排序）

### 方法1: 在 DevTools 中禁用缓存（推荐，最简单）✅

**步骤**:
1. 打开地址 `http://localhost:3000`
2. 按 F12 或 Cmd+Opt+I 打开 DevTools
3. 切换到 **Network** 面板
4. 勾选 **Disable cache** ✅（最关键）
5. 勾选 **Preserve log**（可选，有助观察）
6. **保持 DevTools 打开**，刷新页面
7. 如果仍然看到 `301 → /zh`，右键该请求 → **Clear browser cache**

**效果**:
- ✅ 禁用缓存后，不再使用缓存的重定向
- ✅ 每次请求都从服务器重新获取
- ⚠️ 必须保持 DevTools 打开

**适用场景**: 开发调试时临时绕过缓存

---

### 方法2: 清除 Chrome 磁盘缓存（彻底解决）✅

**步骤**:
1. 完全关闭 Chrome（Cmd+Q 或 Alt+F4）
2. 删除缓存目录（以 macOS 为例）：
   ```bash
   rm -rf ~/Library/Caches/Google/Chrome/Default/Cache/*
   rm -rf ~/Library/Caches/Google/Chrome/Default/Code\ Cache/*
   ```
3. Windows 用户：
   ```powershell
   del /q /s "%LocalAppData%\Google\Chrome\User Data\Default\Cache\*"
   del /q /s "%LocalAppData%\Google\Chrome\User Data\Default\Code Cache\*"
   ```
4. 清除 Service Worker 缓存（如 localhost:3000 相关）
5. 重启 Chrome

**效果**:
- ✅ 彻底清除所有缓存的重定向
- ✅ 永久解决问题
- ⚠️ 会删除大量缓存，影响整个浏览器

**适用场景**: 需要彻底清除，且不介意清空所有缓存

---

### 方法3: 使用隐身模式（快速验证）✅

**步骤**:
```
Mac: Cmd + Shift + N
Win: Ctrl + Shift + N
```

**效果**:
- ✅ 隐身模式不使用任何缓存
- ✅ 100% 绕过重定向缓存
- ⚠️ 每次都需要使用隐身模式

**适用场景**: 快速验证问题是否由缓存引起

---

### 方法4: 更改开发端口（绕过问题）✅

**步骤**:
```bash
# 将开发端口改为 3001
npm run dev -- -p 3001

# 访问新端口
http://localhost:3001/
```

**效果**:
- ✅ 新端口没有缓存污染
- ✅ 立即生效
- ⚠️ 需要修改配置和访问地址

**适用场景**: 快速切换，避免清除缓存

**已实施**: WizPulseAI 项目已将端口改为 3010/3011/3012

---

## 📊 HTTP 重定向状态码对比

### 不同状态码的缓存行为

| 状态码 | 名称 | 缓存行为 | 推荐场景 |
|--------|------|---------|---------|
| **301** | Moved Permanently | ⚠️ **永久缓存**，即使服务器改变也会执行 | 永久性 URL 变更 |
| **302** | Found (Temporary) | 临时缓存，浏览器可能会重新检查 | 临时重定向 |
| **307** | Temporary Redirect | ✅ 不缓存，每次都重新请求 | **开发环境推荐** |
| **308** | Permanent Redirect | ⚠️ 永久缓存（类似 301） | 永久性重定向（保持 HTTP 方法） |

### next-intl 的重定向行为

**WizPulseAI 项目配置**:
```typescript
// wizPulseAI-com/src/middleware.ts
const redirectType = existingCookieLocale ? 301 : 302;
//                                          ^^^   ^^^
//                                    永久缓存  临时缓存
const response = NextResponse.redirect(url, redirectType);
```

**问题**:
- 当用户有 Cookie 偏好时，使用 301（永久重定向）
- Chrome 会永久缓存这个重定向规则
- 即使删除 Cookie，缓存仍然存在

---

## 📝 预防建议

### 1. 开发环境避免使用 301

**不推荐**:
```typescript
return NextResponse.redirect(url, 301); // ❌ 永久缓存
```

**推荐**:
```typescript
// 开发环境使用 307
const redirectType = process.env.NODE_ENV === 'development' ? 307 : 301;
return NextResponse.redirect(url, redirectType); // ✅
```

### 2. 添加 Cache-Control 头部

```typescript
const response = NextResponse.redirect(url);
response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
return response;
```

### 3. 开发时启用 DevTools 禁用缓存

**开发习惯**:
1. F12 打开 DevTools
2. Network 面板勾选 "Disable cache" ✅
3. 保持 DevTools 打开状态开发

### 4. 不同项目使用不同端口

**端口规划**:
```
WizPulseAI:  3010/3011/3012  ✅
SPF-system:  3000            ✅
其他项目:    8080/4000/5000  ✅
```

**好处**:
- ✅ 避免端口冲突
- ✅ 避免缓存污染
- ✅ 多项目可同时运行

### 5. 遇到"总跳转到旧路径"时优先怀疑缓存

**排查顺序**:
1. ✅ 先检查是否为 301 重定向缓存
2. ✅ 使用隐身模式验证
3. ✅ 检查 Network 面板的 `(from disk cache)` 标记
4. ❌ 最后才怀疑业务逻辑问题

---

## 🔗 参考资源

### 官方文档
- [MDN: HTTP 301 Moved Permanently](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)
- [Chrome DevTools Network Reference](https://developer.chrome.com/docs/devtools/network/reference/)

### 社区讨论
- [Stack Overflow: How long does Chrome remember a 301 redirect?](https://stackoverflow.com/questions/16154672/how-long-does-chrome-remember-a-301-redirect)
- [Google Groups: Chrome Developer Tools - 301 Redirect Cache](https://groups.google.com/g/google-chrome-developer-tools/c/y6wP2avQrTE)
- [SOFTKUBE: How to make Google Chrome forget a permanent HTTP 301 redirect](https://softkube.com/blog/how-make-google-chrome-forget-permanent-http-301-redirect)

---

## 🛠️ 实用工具脚本

### 快速清除脚本

项目提供了以下脚本：

1. **clear-chrome-redirect.sh** - 清除重定向缓存指南
   ```bash
   ./clear-chrome-redirect.sh
   ```

2. **delete-chrome-cache.sh** - 删除 Chrome 缓存文件夹
   ```bash
   ./delete-chrome-cache.sh
   ```

3. **check-port.sh** - 检查端口占用
   ```bash
   ./check-port.sh 3000
   ```

---

## 📊 问题解决时间线

```
2025-10-29: WizPulseAI 项目使用 3000 端口
            ↓
            访问 localhost:3000/ → 重定向到 /zh
            ↓
            Chrome 缓存 301 重定向 ⚡
            ↓
2025-10-31: 运行 SPF-system 在 3000 端口
            ↓
            访问 localhost:3000/ → 仍然跳转到 /zh ❌
            ↓
            尝试清除 Cookie/LocalStorage ❌ 无效
            ↓
            尝试重启浏览器 ❌ 无效
            ↓
            在 DevTools 禁用缓存 ✅ 成功！
            ↓
            问题解决 🎉
```

---

## 💡 关键学习点

### 1. 301 永久重定向的"永久性"
- Chrome 会**长期缓存** 301 重定向（可能数周甚至数月）
- 存储在**磁盘缓存**中，重启浏览器不会清除
- 这是 HTTP 标准的设计，不是 Chrome 的 bug

### 2. DevTools "Disable cache" 的重要性
- 开发时应该**默认勾选**
- 可以绕过所有类型的缓存（包括 301 重定向）
- **必须保持 DevTools 打开**才生效

### 3. 缓存隔离机制
- 浏览器缓存按照 **域名+端口** 隔离
- `localhost:3000` 和 `localhost:3001` 是独立的缓存空间
- 这也是为什么换端口能解决问题

### 4. 排查问题的正确思路
- 优先怀疑**浏览器缓存**，而非业务逻辑
- 使用**隐身模式**快速验证
- 检查 Network 面板的 `(from disk cache)` 标记

---

## ✅ 总结

### 问题本质
Chrome 缓存了 301 永久重定向，即使服务端已经改变，浏览器仍然执行缓存的规则。

### 最佳解决方案
**开发时**: 在 DevTools Network 面板勾选 "Disable cache" ✅
**彻底清除**: 删除 Chrome 缓存文件夹 ✅
**快速绕过**: 使用隐身模式或换端口 ✅

### 预防措施
- 开发环境避免使用 301 重定向
- 不同项目使用不同端口
- 开发时默认开启 DevTools 禁用缓存

---

**文档维护者**: AI Assistant
**最后更新**: 2025-10-31
**问题状态**: ✅ 已解决并记录
