# Supabase多语言邮件解决方案

**问题**：Supabase邮件模板只能设置一种语言，无法自动适配用户语言偏好

**影响范围**：
- 注册验证邮件
- 密码重置邮件
- 邮箱变更验证邮件
- 魔法链接邮件

---

## 🎯 解决方案对比

| 方案 | 实现难度 | 成本 | 推荐度 | 适用场景 |
|------|---------|------|--------|---------|
| 方案1：自定义SMTP + 动态模板 | ⭐⭐⭐⭐⭐ | 高 | ⭐⭐⭐⭐⭐ | 大型项目，完全控制 |
| 方案2：Edge Function拦截 | ⭐⭐⭐⭐ | 中 | ⭐⭐⭐⭐ | 中型项目，灵活性高 |
| 方案3：多语言混合模板 | ⭐⭐ | 低 | ⭐⭐⭐ | 小型项目，快速上线 |

---

## 🚀 方案1：自定义SMTP + 动态邮件模板（推荐）⭐⭐⭐⭐⭐

### 原理
禁用Supabase内置邮件，使用自己的SMTP服务（SendGrid/AWS SES/Resend）+ Edge Function动态渲染

### 架构
```
用户触发 → Supabase Auth Hook → Edge Function
  ↓
检测用户语言（从user_metadata.language）
  ↓
选择对应语言模板
  ↓
SendGrid/Resend发送邮件
```

### 实施步骤

#### 1. 在Supabase中配置Auth Hook
```sql
-- 在Supabase Dashboard → Authentication → Hooks 中配置
-- Hook类型: Send Email
-- Function URL: https://your-project.supabase.co/functions/v1/send-email
```

#### 2. 创建Edge Function
```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// 4语言邮件模板
const emailTemplates = {
  signup: {
    ja: {
      subject: 'メールアドレスの確認',
      html: (confirmLink: string) => `
        <h1>WizPulseAIへようこそ</h1>
        <p>以下のボタンをクリックして、メールアドレスを確認してください：</p>
        <a href="${confirmLink}">メールアドレスを確認</a>
      `
    },
    en: {
      subject: 'Confirm Your Email',
      html: (confirmLink: string) => `
        <h1>Welcome to WizPulseAI</h1>
        <p>Click the button below to confirm your email:</p>
        <a href="${confirmLink}">Confirm Email</a>
      `
    },
    ar: {
      subject: 'تأكيد بريدك الإلكتروني',
      html: (confirmLink: string) => `
        <h1>مرحبًا بك في WizPulseAI</h1>
        <p>انقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
        <a href="${confirmLink}">تأكيد البريد الإلكتروني</a>
      `
    },
    'zh-TW': {
      subject: '確認您的電子郵件',
      html: (confirmLink: string) => `
        <h1>歡迎來到 WizPulseAI</h1>
        <p>請點擊下方按鈕確認您的電子郵件：</p>
        <a href="${confirmLink}">確認電子郵件</a>
      `
    }
  },
  recovery: {
    // 密码重置模板...
  },
  magic_link: {
    // 魔法链接模板...
  }
};

serve(async (req) => {
  const payload = await req.json();

  // Supabase会发送：
  // {
  //   "user": { "email": "...", "user_metadata": { "language": "ja" } },
  //   "email_data": { "token": "...", "token_hash": "...", "redirect_to": "..." },
  //   "type": "signup" | "recovery" | "magic_link"
  // }

  const { user, email_data, type } = payload;
  const language = user.user_metadata?.language || 'en'; // 默认英语

  // 获取对应语言的模板
  const template = emailTemplates[type]?.[language] || emailTemplates[type]['en'];

  // 构建确认链接
  const confirmLink = `${email_data.redirect_to}?token=${email_data.token}&type=${type}`;

  // 发送邮件
  const { data, error } = await resend.emails.send({
    from: 'WizPulseAI <noreply@wizpulseai.com>',
    to: user.email,
    subject: template.subject,
    html: template.html(confirmLink)
  });

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
});
```

#### 3. 在注册时保存用户语言
```typescript
// auth-wizpulseai-com/src/components/SignUpForm.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      language: currentLanguage, // 'ja' | 'en' | 'ar' | 'zh-TW'
      full_name: name
    }
  }
});
```

#### 4. 配置环境变量
```env
# .env.local
RESEND_API_KEY=re_xxx...
# 或使用其他SMTP服务
SENDGRID_API_KEY=SG.xxx...
```

### 优点
- ✅ 完全控制邮件内容和样式
- ✅ 支持4语言自动适配
- ✅ 可以使用HTML模板引擎
- ✅ 可以追踪邮件打开率、点击率

### 缺点
- ❌ 需要额外的SMTP服务费用（SendGrid免费额度：100封/天）
- ❌ 需要配置Edge Function
- ❌ 需要维护邮件模板代码

### 成本估算
- SendGrid: 免费100封/天，Pro $19.95/月（40,000封）
- Resend: 免费3,000封/月，Pro $20/月（50,000封）
- AWS SES: $0.10/1000封（最便宜）

---

## ⚡ 方案2：Edge Function拦截 + Supabase模板（折中）⭐⭐⭐⭐

### 原理
保留Supabase邮件服务，但用Edge Function预处理，动态修改redirect_to参数

### 架构
```
用户触发 → Edge Function → 添加语言参数到redirect_to
  ↓
Supabase发送邮件（统一英文模板）
  ↓
用户点击链接 → Auth站点根据参数显示对应语言
```

### 实施步骤

#### 1. 修改Supabase邮件模板（使用中性英文）
```html
<!-- Supabase Dashboard → Authentication → Email Templates → Confirm signup -->
<h2>Welcome to WizPulseAI</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

#### 2. 注册时附加语言参数
```typescript
// auth-wizpulseai-com/src/components/SignUpForm.tsx
const currentLanguage = getLanguageFromCookie(); // 'ja' | 'en' | 'ar' | 'zh-TW'

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?lang=${currentLanguage}`,
    data: {
      language: currentLanguage
    }
  }
});
```

#### 3. Auth站点根据参数显示对应语言
```typescript
// auth-wizpulseai-com/src/app/auth/callback/page.tsx
export default function AuthCallback() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'en';

  // 设置Cookie语言
  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${lang}; domain=.wizpulseai.com; path=/`;
  }, [lang]);

  // 显示对应语言的成功提示...
}
```

### 优点
- ✅ 无需额外SMTP服务
- ✅ 实施简单，修改少
- ✅ 保留Supabase邮件的稳定性

### 缺点
- ❌ 邮件内容本身仍然是英文
- ❌ 只能优化落地页语言
- ❌ 用户体验不如方案1

---

## 📝 方案3：多语言混合模板（快速方案）⭐⭐⭐

### 原理
在一封邮件中同时显示4种语言

### 实施步骤

#### 修改Supabase邮件模板
```html
<!-- Supabase Dashboard → Email Templates → Confirm signup -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- 日语 -->
  <div lang="ja">
    <h2>🇯🇵 WizPulseAIへようこそ</h2>
    <p>以下のボタンをクリックして、メールアドレスを確認してください：</p>
  </div>

  <!-- 英语 -->
  <div lang="en">
    <h2>🇺🇸 Welcome to WizPulseAI</h2>
    <p>Click the button below to confirm your email:</p>
  </div>

  <!-- 阿拉伯语 -->
  <div lang="ar" dir="rtl">
    <h2>🇸🇦 مرحبًا بك في WizPulseAI</h2>
    <p>انقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
  </div>

  <!-- 繁体中文 -->
  <div lang="zh-TW">
    <h2>🇹🇼 歡迎來到 WizPulseAI</h2>
    <p>請點擊下方按鈕確認您的電子郵件：</p>
  </div>

  <!-- 共用按钮 -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #0066ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
      ✉️ Confirm / 確認 / تأكيد / 確認
    </a>
  </div>
</div>
```

### 优点
- ✅ 实施最简单（只需修改邮件模板）
- ✅ 无需代码修改
- ✅ 零额外成本

### 缺点
- ❌ 邮件内容冗长（4倍长度）
- ❌ 用户体验一般（需要找对应语言）
- ❌ 移动端显示可能拥挤

---

## 🎯 推荐实施方案

### 阶段1：快速上线（当前）
使用**方案3：多语言混合模板**
- 实施时间：10分钟
- 成本：$0
- 用户体验：3/5

### 阶段2：优化体验（1-2个月后）
升级到**方案1：自定义SMTP**
- 实施时间：2-3天
- 成本：$20/月（Resend Pro）
- 用户体验：5/5

### 阶段3：企业级（6个月后）
- 邮件模板可视化编辑器
- A/B测试不同邮件内容
- 邮件打开率、点击率分析
- 自动根据时区发送

---

## 📊 成本收益分析

| 方案 | 实施成本 | 月运营成本 | 用户体验提升 | ROI |
|------|---------|-----------|-------------|-----|
| 方案3混合模板 | 0.5小时 | $0 | +20% | ⭐⭐⭐ |
| 方案2拦截 | 1天 | $0 | +50% | ⭐⭐⭐⭐ |
| 方案1自定义SMTP | 3天 | $20 | +100% | ⭐⭐⭐⭐⭐ |

---

## 📋 实施检查清单

### 方案1实施（推荐）
- [ ] 注册Resend账号并获取API Key
- [ ] 创建Edge Function `send-email`
- [ ] 编写4语言邮件模板（signup/recovery/magic_link）
- [ ] 配置Supabase Auth Hook指向Edge Function
- [ ] 修改SignUpForm保存用户语言到user_metadata
- [ ] 测试4种语言的邮件发送
- [ ] 监控邮件发送成功率

### 快速测试（方案3）
- [ ] 进入Supabase Dashboard
- [ ] Authentication → Email Templates
- [ ] 编辑"Confirm signup"模板
- [ ] 粘贴多语言HTML代码
- [ ] 保存并发送测试邮件
- [ ] 验证4种语言都显示正确

---

## 🔗 相关资源

- [Supabase Auth Hooks文档](https://supabase.com/docs/guides/auth/auth-hooks)
- [Resend API文档](https://resend.com/docs/introduction)
- [SendGrid API文档](https://docs.sendgrid.com/)
- [邮件模板最佳实践](https://www.campaignmonitor.com/blog/email-marketing/email-design-best-practices/)

---

**创建日期**: 2025-11-20
**最后更新**: 2025-11-20
