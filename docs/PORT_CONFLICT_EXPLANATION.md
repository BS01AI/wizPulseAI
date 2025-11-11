# WizPulseAI 端口冲突和浏览器缓存问题

**问题**: 其他项目在 localhost:3000 运行时，自动跳转到 `/zh`

**日期**: 2025-10-31

---

## 🔍 问题现象

### 用户报告
```
运行 SPF-system 项目在 localhost:3000
访问 http://localhost:3000
自动跳转到 http://localhost:3000/zh ❌
返回 404 错误
```

### 错误日志
```
GET http://localhost:3000/zh 404 (Not Found)
```

---

## 🎯 问题根本原因

### 原因1: WizPulseAI 的多语言重定向

WizPulseAI 主站使用了 `next-intl` 做多语言路由：

**配置文件**: [wizPulseAI-com/middleware.ts](../wizPulseAI-com/middleware.ts)

```typescript
// 支持3种语言
const locales = ['en', 'ja', 'zh'];
const defaultLocale = 'ja';

// next-intl middleware 自动重定向
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'  // 自动添加语言前缀
});

// 拦截所有路径
export const config = {
  matcher: [
    '/',  // 根路径重定向
    '/(en|ja|zh)/:path*',
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'
  ]
};
```

**重定向行为**:
1. 访问 `http://localhost:3000/`
2. middleware 检测浏览器语言偏好（Accept-Language: zh-CN）
3. 自动重定向到 `http://localhost:3000/zh`
4. 返回状态码 **301 永久重定向** 或 **302 临时重定向**

### 原因2: 浏览器缓存重定向规则

**301 永久重定向的特性**:
- 浏览器会**永久缓存**这个重定向规则
- 即使服务器更换了应用，浏览器仍然执行缓存的重定向
- 缓存位置：浏览器的 HTTP 缓存（不是 Cookie 或 LocalStorage）

**时间线**:
```
1. 2025-XX-XX: 用户在 3000 端口运行 WizPulseAI 主站
2. 浏览器访问 localhost:3000，被重定向到 localhost:3000/zh
3. 浏览器缓存这个重定向规则 ⚡
4. 2025-10-31: 用户在 3000 端口运行 SPF-system 项目
5. 浏览器访问 localhost:3000，仍然执行缓存的重定向 ❌
6. 跳转到 localhost:3000/zh，但 SPF-system 没有这个路由
7. 返回 404 错误
```

---

## ✅ 解决方案

### 方案1: 清除浏览器缓存（立即生效）

#### 方法1.1: 使用隐身模式（推荐）

**Chrome/Edge**:
```
Cmd+Shift+N (Mac)
Ctrl+Shift+N (Win)
```

**Safari**:
```
Cmd+Shift+N
```

**Firefox**:
```
Cmd+Shift+P (Mac)
Ctrl+Shift+P (Win)
```

**优点**:
- ✅ 最快（无需清除缓存）
- ✅ 不影响其他标签页
- ✅ 隔离测试环境

---

#### 方法1.2: 清除站点数据

**步骤**:
```
1. F12 打开开发者工具
2. Application → Storage
3. 点击 "Clear site data"
4. 勾选所有选项：
   - Local storage
   - Session storage
   - Cookies
   - Cache storage
   - Application cache
5. 点击 "Clear data"
6. 刷新页面（Cmd+R）
```

**效果**: 清除 localhost:3000 的所有缓存和数据

---

#### 方法1.3: 硬刷新（绕过缓存）

**Chrome/Edge/Safari**:
```
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Win)
```

**Firefox**:
```
Cmd+Shift+R (Mac)
Ctrl+F5 (Win)
```

**效果**: 强制从服务器重新加载页面，忽略缓存

---

#### 方法1.4: 开发者工具禁用缓存

**步骤**:
```
1. F12 打开开发者工具
2. Network 标签
3. 勾选 "Disable cache" ✅
4. 保持开发者工具打开状态
```

**效果**: 开发模式下不使用任何缓存

---

### 方案2: 修改 WizPulseAI 端口（永久解决）✅

**修改前**:
```
WizPulseAI Main: 3000  ❌ 占用常用端口
WizPulseAI Auth: 3001
WizPulseAI Dashboard: 3002
```

**修改后**:
```
WizPulseAI Main: 3010  ✅ 不占用常用端口
WizPulseAI Auth: 3011
WizPulseAI Dashboard: 3012
```

**修改位置**:
- [start-all.sh:50](../start-all.sh#L50) - Main 站点启动端口
- [start-all.sh:64](../start-all.sh#L64) - Auth 站点启动端口
- [start-all.sh:77](../start-all.sh#L77) - Dashboard 站点启动端口

**好处**:
- ✅ 3000 端口留给其他项目（SPF-system 等）
- ✅ 避免端口冲突
- ✅ 避免浏览器缓存污染
- ✅ 多个项目可以同时运行

**访问地址**:
```
Main:      http://localhost:3010
Auth:      http://localhost:3011
Dashboard: http://localhost:3012
```

---

## 📊 端口使用规划

### 推荐端口分配

| 端口范围 | 用途 | 项目示例 |
|---------|------|---------|
| 3000-3009 | 通用开发端口 | SPF-system, 其他项目 |
| 3010-3019 | WizPulseAI 项目 | Main, Auth, Dashboard |
| 3020-3029 | 预留端口 | 未来项目 |
| 3030-3039 | 测试端口 | E2E 测试、临时服务 |

### WizPulseAI 端口分配

| 站点 | 端口 | 地址 |
|------|------|------|
| Main 站点 | 3010 | http://localhost:3010 |
| Auth 站点 | 3011 | http://localhost:3011 |
| Dashboard 站点 | 3012 | http://localhost:3012 |

---

## 🔧 技术细节

### next-intl 的重定向机制

**代码位置**: [wizPulseAI-com/middleware.ts](../wizPulseAI-com/middleware.ts)

**工作原理**:
```typescript
// 1. 访问根路径 "/"
if (pathname === '/') {
  // 2. 检测语言偏好
  const locale = detectLocale(request);  // zh, ja, or en

  // 3. 重定向到语言前缀路径
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 301);
  //                                                                 ^^^
  //                                                          301 永久重定向
}
```

**HTTP 状态码差异**:

| 状态码 | 名称 | 缓存行为 |
|--------|------|---------|
| 301 | Moved Permanently | 永久缓存，即使服务器改变也会执行 |
| 302 | Found (Temporary) | 临时缓存，浏览器可能会重新检查 |
| 307 | Temporary Redirect | 不缓存，每次都重新请求 |
| 308 | Permanent Redirect | 永久缓存（类似 301） |

**WizPulseAI 使用**: 301 或 302（取决于是否有 Cookie）

---

### 浏览器缓存机制

**重定向缓存存储位置**:
```
浏览器 HTTP 缓存
  └── localhost:3000 (key)
        ├── URL: /
        ├── Status: 301 Permanent Redirect
        ├── Location: /zh
        └── Cached: true ⚡
```

**清除方法**:
1. 清除站点数据（Application → Clear site data）
2. 硬刷新（Cmd+Shift+R）
3. 隐身模式（不使用缓存）
4. 禁用缓存（Network → Disable cache）

---

## 🐛 常见问题

### Q1: 为什么隐身模式可以正常访问？

**A**: 隐身模式不使用任何缓存，每次都是全新环境。

---

### Q2: 清除 Cookie 为什么没用？

**A**: 重定向规则存储在 **HTTP 缓存**中，不是 Cookie 或 LocalStorage。

---

### Q3: 为什么只影响 3000 端口？

**A**: 浏览器缓存是按照 **域名+端口** 隔离的：
```
localhost:3000 (独立缓存) ❌ 有污染
localhost:3001 (独立缓存) ✅ 正常
localhost:3010 (独立缓存) ✅ 正常
```

---

### Q4: 其他项目会受影响吗？

**A**: 只要端口不同，就不会受影响：
```
SPF-system:    localhost:3000  ❌ 受影响（如果之前运行过 WizPulseAI）
WizPulseAI:    localhost:3010  ✅ 不受影响
Other Project: localhost:8080  ✅ 不受影响
```

---

### Q5: 生产环境会有这个问题吗？

**A**: 不会！生产环境使用不同的域名：
```
开发环境: localhost:3000  ❌ 可能冲突
生产环境: www.wizpulseai.com  ✅ 独立域名，不冲突
```

---

## 📝 总结

### 问题本质
1. WizPulseAI 使用多语言路由，会自动重定向到 `/zh` 等路径
2. 浏览器缓存了这个重定向规则（301 永久重定向）
3. 其他项目使用相同端口时，浏览器仍然执行缓存的重定向

### 解决方案
1. **临时解决**: 清除浏览器缓存（隐身模式、硬刷新、清除站点数据）
2. **永久解决**: 修改 WizPulseAI 端口为 3010/3011/3012 ✅

### 最佳实践
- ✅ 不同项目使用不同端口范围
- ✅ 开发时使用隐身模式或禁用缓存
- ✅ 避免在常用端口（3000、8080）使用重定向

---

## 🔗 相关文档

- [start-all.sh](../start-all.sh) - WizPulseAI 启动脚本（新端口）
- [check-port.sh](../check-port.sh) - 端口占用检查脚本
- [clear-browser-cache.sh](../clear-browser-cache.sh) - 缓存清除指南
- [LOCAL_TEST_GUIDE.md](./LOCAL_TEST_GUIDE.md) - 本地测试指南

---

最后更新: 2025-10-31
