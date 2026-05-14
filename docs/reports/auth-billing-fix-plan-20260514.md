# WizPulseAI 注册、Cookie、付费底座修改计划

生成日期：2026-05-14  
范围：注册、子域 Cookie、Stripe、积分、订阅、产品 App 接入  
目标：不重写矩阵网站，只做底座收口，让现有 point 买断更稳，让未来 ExpoGeo 等产品更容易接入。

## 1. 修改原则

1. 不推翻现有架构。
2. 不把 Stripe 逻辑下放到各产品 App。
3. 不大动主站和产品站内容。
4. 优先修安全和真实业务链路。
5. 当前正式业务以 point 买断为主。
6. 订阅代码先整理到不误伤、不暴露、不继续变乱。
7. ExpoGeo 先接账号和权益，不单独做付费系统。

## 2. 主要修改哪些工程

### 必改工程 1：`auth-wizpulseai-com`

修改范围：

- 登录后 redirect 校验。
- OAuth / magic link callback。
- logout redirect。
- 允许跳转域名配置。
- 语言 cookie 的 domain 策略。

目标：

- 修掉开放重定向风险。
- 给 ExpoGeo 这类新产品留出安全接入方式。
- 统一“哪些域名可以登录后跳回”的规则。

### 必改工程 2：`db-wizPulseAI-com`

修改范围：

- 积分购买 checkout。
- Stripe webhook。
- 积分余额增加。
- 订阅 checkout / cancel / reactivate / webhook。
- 价格和产品表查询。
- 未来权益 API。

目标：

- 让 point 买断链路更稳。
- 让订阅代码字段一致，避免未来上线时踩坑。
- 把付费能力保持在 dashboard/db，不扩散到产品站。

### 可能需要同步的共享目录：`shared/auth`

修改范围：

- browser auth helper。
- login/signup/logout 跳转封装。
- cookie domain / auth URL 配置读取。

目标：

- 产品站复用同一套 auth 行为。
- 避免 Fashion、ExpoGeo、Dino 以后各自复制不同版本。

### 暂时不主动大改

- `wizPulseAI-com`：只做入口或文案时才改。
- `fashion-wizpulseai-com`：只在它调用旧接口时做小范围适配。
- `ExpoGeo`：等底座修完后再做登录和权益接入。

## 3. Phase 1：Auth 安全收口

优先级：最高  
建议处理人：我来修  
原因：这是所有子域 App 接入的基础。

### 要做的事

1. 把旧 `safeRedirect` 替换成基于 `URL.origin` 精确匹配的校验。
2. 使用环境变量维护允许跳转域名，例如：

```text
NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS=https://www.wizpulseai.com,https://dashboard.wizpulseai.com,https://auth.wizpulseai.com,https://geo.wizpulseai.com
```

3. callback 和 logout 都走同一套 redirect 校验。
4. 开发环境明确允许 localhost / local.wiz。
5. 新增或更新最小测试用例：
   - 合法域名允许。
   - 非法域名拒绝。
   - `https://www.wizpulseai.com.evil.com` 拒绝。
   - 相对路径行为明确。

### 完成标准

- 登录后只能跳回允许域名。
- logout 后只能跳回允许域名。
- 新 App 域名通过 env 增加，不需要改代码。

## 4. Phase 2：明确付费主线，先保 point 买断

优先级：高  
建议处理人：我来修核心链路，原 AI 可继续做业务页面  
原因：你当前真实业务是 point 买断，先把真实收款链路做稳。

### 要做的事

1. 明确文档和代码注释：当前正式支持 point 买断。
2. 检查积分 checkout：
   - package 必须服务端读取。
   - credits 和 price 不信任客户端。
   - successUrl / cancelUrl 必须由服务端生成或经过 allowlist。
3. 检查 Stripe webhook：
   - 保持签名校验。
   - 保持事件幂等。
   - 购买成功后只按服务端 package 增加积分。
4. 把积分充值改成数据库原子操作。

### 建议数据库 RPC

可以新增类似：

```text
add_credits(user_id, amount, type, description, product, metadata)
```

这个 RPC 应该在数据库事务里完成：

1. 锁定或 upsert 用户积分行。
2. 增加余额。
3. 写入交易记录。
4. 返回新余额。

### 完成标准

- 并发购买不会丢积分。
- 客户端不能伪造积分数量。
- Stripe 重复 webhook 不会重复发积分。
- 成功/取消跳转不会去未知域名。

## 5. Phase 3：订阅代码整理为“不坏但未开放”

优先级：中高  
建议处理人：我修字段和 service，原 AI 可帮忙整理 UI 隐藏  
原因：订阅未上线，但现在代码半成品，未来会误伤。

### 要做的事

1. 统一 subscriptions 表字段使用：

```text
stripe_id
```

不要再使用：

```text
stripe_subscription_id
```

除非数据库真实新增该字段并统一迁移。

2. 统一 Stripe price 查询：

```text
Stripe price id -> prices.stripe_id
```

不要误用本地 `prices.id`，除非确认本地 id 就是 Stripe price id。

3. 订阅 checkout 必须服务端校验 price：
   - `active = true`
   - `is_public = true`
   - product 合法
   - type 是 subscription

4. 统一使用 `PaymentService`，逐步减少旧 `lib/stripe` 直接调用。
5. 订阅入口如果未准备好，前端隐藏或后端返回明确的 `subscription_not_enabled`。

### 完成标准

- 订阅代码不再字段混用。
- 没有半开放的危险入口。
- 未来要做订阅时，可以在这个基础上继续，而不是重写。

## 6. Phase 4：Cookie / Auth helper 策略统一

优先级：中  
建议处理人：我制定边界，原 AI 可以按边界整理复制代码  
原因：多产品接入后，auth helper 分叉会越来越难管。

### 要做的事

1. 明确当前 cookie 模型：
   - Supabase browser cookie。
   - 顶级域 `.wizpulseai.com` 共享。
   - 不是完全 HttpOnly 模型。

2. 统一 `auth-wizpulseai-com` 和 `shared/auth` 中 cookie 设置：
   - `domain`
   - `path`
   - `sameSite`
   - `secure`
   - logout remove 行为

3. 把产品站登录、注册、退出封装成稳定 API：

```text
login(redirectTo)
signup(redirectTo)
logout(redirectTo)
```

4. 写一份边界文档，告诉后续 App 怎么接。

### 完成标准

- 产品站不需要自己拼 auth URL。
- 新 App 接入时复制最少代码。
- cookie 行为在 auth、dashboard、产品站之间一致。

## 7. Phase 5：ExpoGeo 接入矩阵

优先级：中  
建议处理人：底座稳定后我来接第一版  
原因：ExpoGeo 不应该先碰 Stripe，它应该先接账号和权益。

### 最小可用版本

1. ExpoGeo 增加用户状态：
   - 游客。
   - 已登录。
   - Plus / 有权益。

2. 登录按钮跳转：

```text
auth.wizpulseai.com -> 登录成功 -> geo.wizpulseai.com
```

3. Dashboard 创建产品：

```text
product code: expo_geo
```

4. 定义功能码：

```text
expo_geo.audio
expo_geo.real_map
expo_geo.culture_pack
expo_geo.progress_sync
```

5. ExpoGeo 调用权益接口，只根据返回结果开关功能。
6. 游客继续用 localStorage。
7. 登录用户再同步收藏、学习进度、测验记录。

### 完成标准

- ExpoGeo 不直接调用 Stripe。
- ExpoGeo 能识别登录状态。
- ExpoGeo 能识别用户权益。
- 游客体验不受影响。

## 8. 适合分配给原 AI 的任务

原 AI 可以做这些：

1. 根据文档检查 UI 入口是否隐藏未开放订阅。
2. 整理 dashboard 上的付费文案。
3. 帮忙补测试用例。
4. 检查产品站是否还调用旧接口。
5. 整理旧测试 mock。
6. 做 ExpoGeo 登录后的 UI 状态。

但这些建议由我来最终 review：

1. redirect 安全校验。
2. Stripe webhook。
3. 积分发放。
4. 订阅字段迁移。
5. 权益接口。

原因是这些属于底座安全和付费链路，修错影响面比较大。

## 9. 推荐执行顺序

### 第一步

修 auth redirect。

原因：这是安全问题，也是未来所有 App 接入的入口。

### 第二步

修 point 买断链路。

原因：这是当前真实业务。

### 第三步

整理订阅代码。

原因：订阅未上线，但残余代码不能继续乱着。

### 第四步

统一 auth helper 和 cookie 策略文档。

原因：避免产品站越接越乱。

### 第五步

接 ExpoGeo 登录和权益。

原因：底座稳定后接产品，风险最低。

## 10. 风险控制

每一步都应该小步提交，并跑对应验证。

### Auth 修改验证

- lint。
- auth callback 合法域名测试。
- auth callback 非法域名测试。
- logout redirect 测试。
- 本地登录后能回到产品站。

### Point 买断验证

- checkout 创建。
- webhook 签名校验。
- webhook 重复事件不重复发积分。
- 两次不同购买都能正确加积分。
- success/cancel URL 不跳未知域名。

### 订阅整理验证

- TypeScript 不报字段错误。
- cancel/reactivate 查询字段统一。
- webhook 查询 price 字段统一。
- 未开放入口不会被用户误触发。

## 11. 最终目标

这次不是做大改版，而是把矩阵网站底座整理成可以长期扩展的形态：

- 一个账号系统。
- 一个付费中心。
- 一套积分和权益。
- 多个独立产品 App。
- 每个新 App 都能快速接入，而不重复造轮子。

