# 代码质量规范：去除AI垃圾

> 输出代码前必须自检，删除AI引入的冗余改动

---

## 必须删除的内容

### 1. 多余注释

```typescript
// ❌ AI风格：过度解释显而易见的代码
// 获取用户信息
const user = await getUser(id);
// 返回用户信息
return user;

// ✅ 人类风格：只在必要时注释
const user = await getUser(id);
return user;
```

### 2. 过度防御性检查

```typescript
// ❌ 在可信路径上添加冗余检查
async function processOrder(order: Order) {
  if (!order) throw new Error('Order is required');
  if (!order.id) throw new Error('Order ID is required');
  if (!order.items) throw new Error('Order items required');
  // order 已经是经过验证的类型，上面全是废话
}

// ✅ 只在边界处验证
async function processOrder(order: Order) {
  // Order 类型已保证结构，直接处理
}
```

### 3. 滥用 any 和类型断言

```typescript
// ❌ 为绕过类型问题添加 any
const data = response as any;
const user = (data as any).user as User;

// ✅ 正确定义类型
interface ApiResponse {
  user: User;
}
const data: ApiResponse = response;
```

### 4. 不一致的代码风格

```typescript
// ❌ 文件其他地方用 const，这里突然用 let
let result = [];  // 但从不重新赋值

// ✅ 保持一致
const result = [];
```

### 5. 冗余的 try/catch

```typescript
// ❌ 包装已经处理错误的函数
try {
  await safeApiCall(); // 这个函数内部已经处理了错误
} catch (e) {
  console.error(e); // 重复处理
}

// ✅ 信任内部错误处理
await safeApiCall();
```

---

## 自检清单

输出代码前，逐项确认：

- [ ] 注释是否必要？删除解释显而易见代码的注释
- [ ] 防御性检查是否在边界处？内部可信路径不需要
- [ ] 是否有 any 或强制类型转换？应该正确定义类型
- [ ] 代码风格是否与文件其余部分一致？
- [ ] try/catch 是否重复处理已有的错误处理？
- [ ] 是否有"以防万一"的冗余代码？

---

## 输出格式

修改代码后，用1-3句话总结：

```
删除了X处冗余注释、Y处不必要的防御性检查。
保持了与原文件一致的代码风格。
```
