# WizPulseAI 配置中心 (Config Center) 完整实施方案

## 📋 目录
1. [概述](#概述)
2. [现状分析](#现状分析)
3. [系统架构设计](#系统架构设计)
4. [数据库Schema设计](#数据库schema设计)
5. [配置接口设计](#配置接口设计)
6. [Dashboard管理界面](#dashboard管理界面)
7. [迁移策略](#迁移策略)
8. [缓存和性能优化](#缓存和性能优化)
9. [风险评估和回滚策略](#风险评估和回滚策略)
10. [实施计划和时间估算](#实施计划和时间估算)

---

## 概述

### 问题背景
- **当前痛点**：38个文件直接使用 `process.env.XXX`，配置分散在代码中
- **业务痛点**：业务配置硬编码（如 `monthly_limit: 100`），产品经理无法自主修改
- **部署痛点**：每次修改配置需要改代码、提交、部署（3-5分钟）

### 目标
建立三层配置管理系统，实现：
1. **默认配置**（代码中定义）- 开发者维护
2. **环境变量**（`.env`文件）- 部署时配置，敏感信息
3. **运行时配置**（数据库存储）- 可视化管理，立即生效

### 核心价值
- 🚀 **零停机配置更新** - 运行时配置立即生效
- 🎯 **业务人员赋能** - 产品经理可自主调整限额
- 📊 **配置可视化** - Dashboard统一管理，历史追踪
- 🔒 **权限控制** - 只有管理员可修改
- ⏱️ **配置历史** - 完整变更记录，支持回滚

---

## 现状分析

### 1. 环境变量使用情况

**分析结果**（基于代码扫描）：
```
发现 20+ 文件使用 process.env，主要类别：

【敏感配置】- 必须保持在环境变量
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

【站点配置】- 可迁移到运行时配置
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_COOKIE_DOMAIN
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

【系统配置】- 可保持环境变量
- NODE_ENV（production/development）
```

### 2. 业务限额硬编码问题

**发现的硬编码**（src/app/dashboard/features/page.tsx:25）：
```typescript
const [newFeature, setNewFeature] = useState({
  monthly_limit: 100,  // ❌ 硬编码！产品经理无法修改
});
```

**现有数据库结构**（features表已有monthly_limit字段）：
```typescript
// src/types/supabase.types.ts
type Features = {
  monthly_limit: number | null;  // ✅ 已有字段，但缺少统一管理
}
```

### 3. 配置分散问题

**当前配置散落在**：
- ✅ 环境变量 (`.env`)
- ✅ 代码硬编码 (`features/page.tsx`)
- ❌ 无统一配置中心
- ❌ 无配置历史记录
- ❌ 无可视化管理界面

---

## 系统架构设计

### 三层优先级系统

```
┌─────────────────────────────────────────┐
│  应用代码调用 getConfig('key')           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  优先级判断（从高到低）                  │
│  ① 运行时配置（数据库）                 │
│  ② 环境变量（.env）                     │
│  ③ 默认配置（代码）                     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  返回最终配置值                          │
└─────────────────────────────────────────┘
```

### 配置分类体系

```typescript
// 配置类别枚举
enum ConfigCategory {
  SITE = 'site',           // 站点配置
  FEATURES = 'features',   // 功能开关
  LIMITS = 'limits',       // 业务限额 ⭐ MVP重点
  SERVICES = 'services',   // 第三方服务
  UI = 'ui',               // UI配置
}

// 配置示例
const configSchema = {
  // 站点配置
  'site.title': { default: 'WizPulseAI', type: 'string', category: 'SITE' },
  'site.theme': { default: 'dark', type: 'string', category: 'SITE' },
  
  // 功能开关
  'features.enableSignup': { default: true, type: 'boolean', category: 'FEATURES' },
  'features.enableOAuth': { default: true, type: 'boolean', category: 'FEATURES' },
  
  // 业务限额 ⭐ MVP重点
  'limits.freeUserDailyLimit': { default: 10, type: 'number', category: 'LIMITS' },
  'limits.premiumUserDailyLimit': { default: 1000, type: 'number', category: 'LIMITS' },
  'limits.maxUploadSizeMB': { default: 5, type: 'number', category: 'LIMITS' },
  
  // 第三方服务
  'services.stripeEnabled': { default: false, type: 'boolean', category: 'SERVICES' },
  'services.analyticsEnabled': { default: true, type: 'boolean', category: 'SERVICES' },
};
```

---

## 数据库Schema设计

### 1. site_config 表（主配置表）

```sql
-- 站点配置表
CREATE TABLE IF NOT EXISTS public.site_config (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 配置标识（唯一，如 'limits.freeUserDailyLimit'）
  config_key VARCHAR(255) NOT NULL UNIQUE,
  
  -- 配置值（JSON格式，支持多种类型）
  config_value JSONB NOT NULL,
  
  -- 配置类型（string/number/boolean/json）
  value_type VARCHAR(50) NOT NULL DEFAULT 'string',
  
  -- 配置分类（site/features/limits/services/ui）
  category VARCHAR(50) NOT NULL DEFAULT 'site',
  
  -- 描述（管理员可见）
  description TEXT,
  
  -- 是否启用（软删除标记）
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- 创建者
  created_by UUID REFERENCES auth.users(id),
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_site_config_key ON public.site_config(config_key);
CREATE INDEX idx_site_config_category ON public.site_config(category);
CREATE INDEX idx_site_config_enabled ON public.site_config(is_enabled);

-- 自动更新 updated_at
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS（Row Level Security）
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 只读策略：所有认证用户可读
CREATE POLICY "Anyone can read config" ON public.site_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- 写入策略：只有管理员可写
CREATE POLICY "Only admins can modify config" ON public.site_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 2. config_history 表（配置历史）

```sql
-- 配置变更历史表
CREATE TABLE IF NOT EXISTS public.config_history (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联的配置
  config_id UUID REFERENCES public.site_config(id) ON DELETE CASCADE,
  config_key VARCHAR(255) NOT NULL,
  
  -- 变更前的值
  old_value JSONB,
  
  -- 变更后的值
  new_value JSONB NOT NULL,
  
  -- 变更原因
  change_reason TEXT,
  
  -- 操作者
  changed_by UUID REFERENCES auth.users(id),
  
  -- 变更时间
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_config_history_config_id ON public.config_history(config_id);
CREATE INDEX idx_config_history_key ON public.config_history(config_key);
CREATE INDEX idx_config_history_changed_at ON public.config_history(changed_at DESC);

-- RLS
ALTER TABLE public.config_history ENABLE ROW LEVEL SECURITY;

-- 只有管理员可查看历史
CREATE POLICY "Only admins can read history" ON public.config_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 3. TypeScript 类型定义

```typescript
// src/types/config.types.ts

/**
 * 配置类别
 */
export enum ConfigCategory {
  SITE = 'site',
  FEATURES = 'features',
  LIMITS = 'limits',
  SERVICES = 'services',
  UI = 'ui',
}

/**
 * 配置值类型
 */
export enum ConfigValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

/**
 * 配置项接口
 */
export interface SiteConfig {
  id: string;
  config_key: string;
  config_value: any;
  value_type: ConfigValueType;
  category: ConfigCategory;
  description?: string;
  is_enabled: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 配置历史接口
 */
export interface ConfigHistory {
  id: string;
  config_id: string;
  config_key: string;
  old_value: any;
  new_value: any;
  change_reason?: string;
  changed_by?: string;
  changed_at: string;
}

/**
 * 配置更新请求
 */
export interface ConfigUpdateRequest {
  config_key: string;
  config_value: any;
  change_reason?: string;
}

/**
 * 配置定义（默认值）
 */
export interface ConfigDefinition {
  key: string;
  defaultValue: any;
  type: ConfigValueType;
  category: ConfigCategory;
  description: string;
  isEnvVar?: boolean;  // 是否可以被环境变量覆盖
}
```

### 4. 初始数据（业务限额配置）

```sql
-- 插入初始配置（业务限额）⭐ MVP重点
INSERT INTO public.site_config (config_key, config_value, value_type, category, description) VALUES
  ('limits.freeUserDailyLimit', '10', 'number', 'limits', '免费用户每日使用限额'),
  ('limits.premiumUserDailyLimit', '1000', 'number', 'limits', '付费用户每日使用限额'),
  ('limits.maxUploadSizeMB', '5', 'number', 'limits', '文件上传最大尺寸（MB）'),
  ('limits.maxFileCount', '10', 'number', 'limits', '最大文件数量')
ON CONFLICT (config_key) DO NOTHING;

-- 插入功能开关配置
INSERT INTO public.site_config (config_key, config_value, value_type, category, description) VALUES
  ('features.enableSignup', 'true', 'boolean', 'features', '是否开放用户注册'),
  ('features.enableOAuth', 'true', 'boolean', 'features', '是否启用社交登录'),
  ('features.enableStripe', 'true', 'boolean', 'features', '是否启用Stripe支付')
ON CONFLICT (config_key) DO NOTHING;

-- 插入站点配置
INSERT INTO public.site_config (config_key, config_value, value_type, category, description) VALUES
  ('site.title', '"WizPulseAI"', 'string', 'site', '站点标题'),
  ('site.theme', '"dark"', 'string', 'site', '默认主题（dark/light）'),
  ('site.maintenanceMode', 'false', 'boolean', 'site', '维护模式开关')
ON CONFLICT (config_key) DO NOTHING;
```

---

## 配置接口设计

### 1. 核心配置服务（ConfigService）

```typescript
// src/lib/config/config.service.ts

import { createRouteHandler } from '@/lib/supabase/server';
import { createBrowserClient } from '@/shared/auth/supabase-browser';
import { ConfigCategory, ConfigValueType, SiteConfig, ConfigDefinition } from '@/types/config.types';

/**
 * 默认配置定义
 * 作为配置的最低优先级（兜底值）
 */
export const DEFAULT_CONFIG: Record<string, ConfigDefinition> = {
  // 业务限额配置 ⭐ MVP重点
  'limits.freeUserDailyLimit': {
    key: 'limits.freeUserDailyLimit',
    defaultValue: 10,
    type: ConfigValueType.NUMBER,
    category: ConfigCategory.LIMITS,
    description: '免费用户每日使用限额',
  },
  'limits.premiumUserDailyLimit': {
    key: 'limits.premiumUserDailyLimit',
    defaultValue: 1000,
    type: ConfigValueType.NUMBER,
    category: ConfigCategory.LIMITS,
    description: '付费用户每日使用限额',
  },
  'limits.maxUploadSizeMB': {
    key: 'limits.maxUploadSizeMB',
    defaultValue: 5,
    type: ConfigValueType.NUMBER,
    category: ConfigCategory.LIMITS,
    description: '文件上传最大尺寸（MB）',
  },
  
  // 功能开关
  'features.enableSignup': {
    key: 'features.enableSignup',
    defaultValue: true,
    type: ConfigValueType.BOOLEAN,
    category: ConfigCategory.FEATURES,
    description: '是否开放用户注册',
  },
  'features.enableOAuth': {
    key: 'features.enableOAuth',
    defaultValue: true,
    type: ConfigValueType.BOOLEAN,
    category: ConfigCategory.FEATURES,
    description: '是否启用社交登录',
  },
  
  // 站点配置
  'site.title': {
    key: 'site.title',
    defaultValue: 'WizPulseAI',
    type: ConfigValueType.STRING,
    category: ConfigCategory.SITE,
    description: '站点标题',
    isEnvVar: true,  // 可被环境变量 NEXT_PUBLIC_SITE_TITLE 覆盖
  },
  'site.cookieDomain': {
    key: 'site.cookieDomain',
    defaultValue: '.wizpulseai.com',
    type: ConfigValueType.STRING,
    category: ConfigCategory.SITE,
    description: 'Cookie域名',
    isEnvVar: true,  // 可被环境变量 NEXT_PUBLIC_COOKIE_DOMAIN 覆盖
  },
};

/**
 * 配置缓存（内存缓存，TTL 5分钟）
 */
let configCache: Record<string, any> = {};
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

/**
 * 三层配置获取逻辑
 * 优先级：运行时配置 > 环境变量 > 默认配置
 */
export async function getConfig<T = any>(
  key: string,
  options?: {
    useCache?: boolean;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { useCache = true, forceRefresh = false } = options || {};

  // 检查缓存
  if (useCache && !forceRefresh && Date.now() - cacheTimestamp < CACHE_TTL) {
    if (configCache[key] !== undefined) {
      return configCache[key] as T;
    }
  }

  try {
    // 层级 1: 尝试从数据库获取运行时配置（最高优先级）
    const runtimeValue = await getRuntimeConfig(key);
    if (runtimeValue !== undefined) {
      configCache[key] = runtimeValue;
      cacheTimestamp = Date.now();
      return runtimeValue as T;
    }

    // 层级 2: 尝试从环境变量获取（中等优先级）
    const configDef = DEFAULT_CONFIG[key];
    if (configDef?.isEnvVar) {
      const envKey = keyToEnvVar(key);
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        const parsedValue = parseEnvValue(envValue, configDef.type);
        configCache[key] = parsedValue;
        cacheTimestamp = Date.now();
        return parsedValue as T;
      }
    }

    // 层级 3: 使用默认配置（最低优先级）
    const defaultValue = configDef?.defaultValue;
    if (defaultValue !== undefined) {
      configCache[key] = defaultValue;
      cacheTimestamp = Date.now();
      return defaultValue as T;
    }

    throw new Error(`Config key "${key}" not found in any layer`);
  } catch (error) {
    console.error(`[ConfigService] Error getting config "${key}":`, error);
    // 如果所有层级都失败，返回默认值（如果有）
    const defaultValue = DEFAULT_CONFIG[key]?.defaultValue;
    if (defaultValue !== undefined) {
      return defaultValue as T;
    }
    throw error;
  }
}

/**
 * 从数据库获取运行时配置
 */
async function getRuntimeConfig(key: string): Promise<any> {
  try {
    // 服务器端使用
    const supabase = createRouteHandler();
    
    const { data, error } = await supabase
      .from('site_config')
      .select('config_value, value_type')
      .eq('config_key', key)
      .eq('is_enabled', true)
      .single();

    if (error || !data) {
      return undefined;
    }

    return parseConfigValue(data.config_value, data.value_type);
  } catch (error) {
    console.error('[getRuntimeConfig] Error:', error);
    return undefined;
  }
}

/**
 * 浏览器端获取配置（通过API）
 */
export async function getConfigClient<T = any>(key: string): Promise<T> {
  try {
    const response = await fetch(`/api/config/${key}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    const data = await response.json();
    return data.value as T;
  } catch (error) {
    console.error(`[getConfigClient] Error getting config "${key}":`, error);
    // 返回默认值
    return DEFAULT_CONFIG[key]?.defaultValue as T;
  }
}

/**
 * 更新配置（仅管理员）
 */
export async function updateConfig(
  key: string,
  value: any,
  changeReason?: string
): Promise<void> {
  const supabase = createRouteHandler();

  // 获取旧值（用于历史记录）
  const { data: oldConfig } = await supabase
    .from('site_config')
    .select('*')
    .eq('config_key', key)
    .single();

  // 更新配置
  const { error: updateError } = await supabase
    .from('site_config')
    .upsert({
      config_key: key,
      config_value: value,
      value_type: DEFAULT_CONFIG[key]?.type || ConfigValueType.STRING,
      category: DEFAULT_CONFIG[key]?.category || ConfigCategory.SITE,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    throw new Error(`Failed to update config: ${updateError.message}`);
  }

  // 记录历史
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('config_history').insert({
    config_id: oldConfig?.id,
    config_key: key,
    old_value: oldConfig?.config_value,
    new_value: value,
    change_reason: changeReason,
    changed_by: user?.id,
  });

  // 清除缓存
  delete configCache[key];
}

/**
 * 批量获取配置（按分类）
 */
export async function getConfigsByCategory(
  category: ConfigCategory
): Promise<Record<string, any>> {
  const supabase = createRouteHandler();
  
  const { data, error } = await supabase
    .from('site_config')
    .select('config_key, config_value, value_type')
    .eq('category', category)
    .eq('is_enabled', true);

  if (error || !data) {
    return {};
  }

  return data.reduce((acc, item) => {
    acc[item.config_key] = parseConfigValue(item.config_value, item.value_type);
    return acc;
  }, {} as Record<string, any>);
}

/**
 * 清除配置缓存
 */
export function clearConfigCache(key?: string) {
  if (key) {
    delete configCache[key];
  } else {
    configCache = {};
    cacheTimestamp = 0;
  }
}

// ===== 工具函数 =====

/**
 * 配置键转环境变量名
 * 'limits.freeUserDailyLimit' -> 'NEXT_PUBLIC_LIMITS_FREE_USER_DAILY_LIMIT'
 */
function keyToEnvVar(key: string): string {
  return `NEXT_PUBLIC_${key.toUpperCase().replace(/\./g, '_')}`;
}

/**
 * 解析环境变量值
 */
function parseEnvValue(value: string, type: ConfigValueType): any {
  switch (type) {
    case ConfigValueType.NUMBER:
      return Number(value);
    case ConfigValueType.BOOLEAN:
      return value === 'true';
    case ConfigValueType.JSON:
      return JSON.parse(value);
    default:
      return value;
  }
}

/**
 * 解析数据库配置值（JSONB格式）
 */
function parseConfigValue(value: any, type: string): any {
  // Supabase JSONB字段已经是解析后的JSON对象
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
```

### 2. API 路由（读取配置）

```typescript
// src/app/api/config/[key]/route.ts

import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config/config.service';

/**
 * GET /api/config/:key
 * 获取单个配置项
 */
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const value = await getConfig(params.key);
    
    return NextResponse.json({ value });
  } catch (error) {
    console.error('[API][config] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get config' },
      { status: 500 }
    );
  }
}
```

### 3. API 路由（管理员更新配置）

```typescript
// src/app/api/admin/config/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandler } from '@/lib/supabase/server';
import { updateConfig, getConfigsByCategory } from '@/lib/config/config.service';
import { ConfigCategory } from '@/types/config.types';

/**
 * GET /api/admin/config?category=limits
 * 获取配置列表（管理员）
 */
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandler();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取查询参数
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    if (category) {
      const configs = await getConfigsByCategory(category as ConfigCategory);
      return NextResponse.json({ configs });
    }

    // 返回所有配置
    const { data: allConfigs } = await supabase
      .from('site_config')
      .select('*')
      .order('category', { ascending: true })
      .order('config_key', { ascending: true });

    return NextResponse.json({ configs: allConfigs });
  } catch (error) {
    console.error('[API][admin/config] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get configs' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/config
 * 更新配置（管理员）
 */
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandler();
    
    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 解析请求体
    const body = await request.json();
    const { config_key, config_value, change_reason } = body;

    if (!config_key || config_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 更新配置
    await updateConfig(config_key, config_value, change_reason);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API][admin/config] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
```

---

## Dashboard管理界面

### 1. 配置管理页面（UI/UX流程）

```typescript
// src/app/dashboard/admin/config/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RoleGate } from '@/components/auth/role-gate';
import { ConfigCategory, SiteConfig } from '@/types/config.types';
import { Loader2, Save, History, RefreshCcw } from 'lucide-react';

export default function ConfigManagementPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // 加载配置
  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/config');
      if (!response.ok) throw new Error('Failed to load configs');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      toast({
        title: '加载失败',
        description: '无法加载配置列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig(configKey: string, newValue: any) {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_key: configKey,
          config_value: newValue,
          change_reason: `Updated via Dashboard at ${new Date().toISOString()}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to update config');

      toast({
        title: '保存成功',
        description: `配置 "${configKey}" 已更新`,
      });

      // 刷新配置列表
      await loadConfigs();
    } catch (error) {
      toast({
        title: '保存失败',
        description: '无法更新配置',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGate allowedRoles={['admin']}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">配置中心</h1>

        <Tabs defaultValue="limits" className="w-full">
          <TabsList>
            <TabsTrigger value="limits">业务限额</TabsTrigger>
            <TabsTrigger value="features">功能开关</TabsTrigger>
            <TabsTrigger value="site">站点配置</TabsTrigger>
            <TabsTrigger value="services">第三方服务</TabsTrigger>
          </TabsList>

          {/* 业务限额配置 ⭐ MVP重点 */}
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>业务限额配置</CardTitle>
                <CardDescription>
                  管理用户使用限额，修改后立即生效（无需重启）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  configs
                    .filter(c => c.category === ConfigCategory.LIMITS)
                    .map(config => (
                      <ConfigItem
                        key={config.id}
                        config={config}
                        onSave={handleSaveConfig}
                        saving={saving}
                      />
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 功能开关 */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>功能开关</CardTitle>
                <CardDescription>
                  控制系统功能的启用/禁用
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configs
                  .filter(c => c.category === ConfigCategory.FEATURES)
                  .map(config => (
                    <ConfigItem
                      key={config.id}
                      config={config}
                      onSave={handleSaveConfig}
                      saving={saving}
                    />
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 其他分类... */}
        </Tabs>
      </div>
    </RoleGate>
  );
}

// 配置项组件
function ConfigItem({
  config,
  onSave,
  saving,
}: {
  config: SiteConfig;
  onSave: (key: string, value: any) => Promise<void>;
  saving: boolean;
}) {
  const [value, setValue] = useState(config.config_value);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    await onSave(config.config_key, value);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <Label className="font-medium">{config.config_key}</Label>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        {editing ? (
          <Input
            type={config.value_type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => setValue(
              config.value_type === 'number' ? Number(e.target.value) : e.target.value
            )}
            className="mt-2"
          />
        ) : (
          <p className="mt-2 font-mono text-sm">{String(value)}</p>
        )}
      </div>
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              取消
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)}>
            编辑
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 2. 配置历史查看页面

```typescript
// src/app/dashboard/admin/config/history/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfigHistory } from '@/types/config.types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ConfigHistoryPage() {
  const [history, setHistory] = useState<ConfigHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const response = await fetch('/api/admin/config/history');
    const data = await response.json();
    setHistory(data.history || []);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">配置变更历史</h1>

      <Card>
        <CardHeader>
          <CardTitle>最近变更记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>配置键</TableHead>
                <TableHead>旧值</TableHead>
                <TableHead>新值</TableHead>
                <TableHead>变更原因</TableHead>
                <TableHead>变更时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.config_key}</TableCell>
                  <TableCell className="text-red-500">{String(item.old_value)}</TableCell>
                  <TableCell className="text-green-500">{String(item.new_value)}</TableCell>
                  <TableCell>{item.change_reason || '-'}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.changed_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 迁移策略

### Phase 0: MVP验证（业务限额配置）⭐

**目标**：验证配置中心架构可行性，聚焦业务限额

**范围**：
- 只迁移 `limits.*` 配置（4个配置项）
- 创建 Dashboard 管理界面
- 验证三层优先级逻辑

**步骤**：
1. 创建数据库表（site_config + config_history）
2. 插入初始数据（4个业务限额配置）
3. 实现 ConfigService（三层优先级）
4. 创建 API 路由（/api/config, /api/admin/config）
5. 创建 Dashboard 管理页面（业务限额tab）
6. 测试：修改配置 → 验证立即生效

**验收标准**：
- ✅ 产品经理可在Dashboard修改免费用户限额
- ✅ 修改后无需重启，立即生效
- ✅ 配置历史记录正确保存
- ✅ 缓存机制正常工作（5分钟TTL）

**时间估算**：2天

---

### Phase 1: 扩展功能开关配置

**目标**：迁移功能开关配置（features.*）

**范围**：
- 迁移 `features.enableSignup`, `features.enableOAuth` 等
- 扩展 Dashboard 管理界面（功能开关tab）

**步骤**：
1. 定义功能开关配置（DEFAULT_CONFIG）
2. 插入初始数据
3. 扩展 Dashboard UI（Tabs组件）
4. 迁移现有硬编码功能开关

**时间估算**：1天

---

### Phase 2: 站点配置迁移

**目标**：迁移站点级配置（site.*）

**范围**：
- 迁移 `site.title`, `site.cookieDomain`, `site.theme`
- 支持环境变量覆盖（isEnvVar机制）

**步骤**：
1. 识别所有站点配置（扫描代码中的 `process.env.NEXT_PUBLIC_*`）
2. 标记哪些可被环境变量覆盖
3. 更新 DEFAULT_CONFIG
4. 批量替换代码中的 `process.env` 为 `getConfig()`

**注意事项**：
- **敏感信息（Supabase/Stripe密钥）保持在环境变量**
- **公开配置（站点标题）优先使用运行时配置**

**时间估算**：2天

---

### Phase 3: 全量迁移和优化

**目标**：完成所有配置迁移 + 性能优化

**范围**：
- 迁移第三方服务配置（services.*）
- UI配置（ui.*）
- 实施高级缓存策略（Redis）
- 配置导入/导出功能

**时间估算**：3天

---

## 缓存和性能优化

### 1. 内存缓存（已实现）

```typescript
// 5分钟TTL内存缓存
let configCache: Record<string, any> = {};
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000;
```

**优点**：
- ✅ 简单高效，无外部依赖
- ✅ 适合单实例部署（Vercel）

**缺点**：
- ❌ 多实例部署时缓存不一致
- ❌ 服务重启丢失缓存

---

### 2. Redis缓存（可选升级）

```typescript
// 使用 Upstash Redis（Vercel推荐）
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getConfigWithRedis<T>(key: string): Promise<T> {
  // 1. 尝试从Redis读取
  const cached = await redis.get(`config:${key}`);
  if (cached) return cached as T;

  // 2. 从数据库读取
  const value = await getConfig(key);

  // 3. 写入Redis（TTL 5分钟）
  await redis.set(`config:${key}`, value, { ex: 300 });

  return value;
}

// 配置更新时，清除Redis缓存
export async function updateConfigWithRedis(key: string, value: any) {
  await updateConfig(key, value);
  await redis.del(`config:${key}`);
}
```

**适用场景**：
- Vercel Pro 部署（多实例）
- 高并发场景（QPS > 100）

**成本**：
- Upstash Redis 免费版：10,000 requests/day
- 付费版：$0.2/100K requests

---

### 3. 性能优化建议

**优化1：批量预加载**
```typescript
// 应用启动时，预加载常用配置
export async function warmupCache() {
  const commonKeys = [
    'limits.freeUserDailyLimit',
    'features.enableSignup',
    'site.title',
  ];
  
  await Promise.all(commonKeys.map(key => getConfig(key)));
}
```

**优化2：按需加载**
```typescript
// 只在需要时加载配置，避免一次性加载全部
const limit = await getConfig('limits.freeUserDailyLimit');
```

**优化3：客户端缓存**
```typescript
// 浏览器端使用 SWR 缓存配置
import useSWR from 'swr';

function useConfig(key: string) {
  const { data, error } = useSWR(
    `/api/config/${key}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 } // 1分钟去重
  );
  
  return data?.value;
}
```

---

## 风险评估和回滚策略

### 风险评估

| 风险 | 严重程度 | 概率 | 缓解措施 |
|------|----------|------|----------|
| 配置错误导致服务不可用 | 🔴 高 | 🟡 中 | 1. 配置验证 2. 灰度发布 3. 快速回滚 |
| 缓存不一致导致数据错误 | 🟡 中 | 🟡 中 | 1. TTL限制 2. 强制刷新API |
| 数据库查询性能问题 | 🟡 中 | 🟢 低 | 1. 索引优化 2. 缓存机制 |
| 权限控制漏洞 | 🔴 高 | 🟢 低 | 1. RLS策略 2. 管理员验证 |

---

### 回滚策略

**策略1：配置历史回滚**
```typescript
// 管理员可在Dashboard一键回滚到历史版本
async function rollbackConfig(historyId: string) {
  const history = await getConfigHistory(historyId);
  await updateConfig(history.config_key, history.old_value, 'Rollback to previous version');
}
```

**策略2：默认值兜底**
```typescript
// 如果所有层级都失败，返回默认值
try {
  return await getConfig('limits.freeUserDailyLimit');
} catch {
  return DEFAULT_CONFIG['limits.freeUserDailyLimit'].defaultValue; // 10
}
```

**策略3：紧急降级**
```sql
-- 紧急禁用运行时配置，回退到环境变量+默认值
UPDATE site_config SET is_enabled = false WHERE config_key = 'limits.freeUserDailyLimit';
```

**策略4：数据库备份**
```bash
# 迁移前备份配置表
pg_dump -t site_config -t config_history > config_backup.sql

# 回滚
psql < config_backup.sql
```

---

## 实施计划和时间估算

### 总时间估算：8个工作日

| Phase | 任务 | 天数 | 优先级 |
|-------|------|------|--------|
| **Phase 0** | **MVP验证（业务限额配置）** | **2天** | **P0 🔥** |
| - | 创建数据库表（site_config + config_history） | 0.5天 | P0 |
| - | 实现ConfigService（三层优先级） | 0.5天 | P0 |
| - | 创建API路由（/api/config, /api/admin/config） | 0.5天 | P0 |
| - | 创建Dashboard管理页面（业务限额tab） | 0.5天 | P0 |
| **Phase 1** | **功能开关配置** | **1天** | **P1** |
| - | 定义功能开关配置 + 扩展Dashboard UI | 1天 | P1 |
| **Phase 2** | **站点配置迁移** | **2天** | **P1** |
| - | 识别站点配置 + 批量替换 `process.env` | 2天 | P1 |
| **Phase 3** | **全量迁移和优化** | **3天** | **P2** |
| - | 迁移第三方服务配置 | 1天 | P2 |
| - | 实施Redis缓存（可选） | 1天 | P2 |
| - | 配置导入/导出功能 | 1天 | P2 |

---

### 第一周计划（MVP + 核心功能）

**Day 1-2: Phase 0 - MVP验证**
- ✅ 创建数据库表（SQL脚本）
- ✅ 实现ConfigService（三层优先级逻辑）
- ✅ 创建API路由（读取+更新配置）
- ✅ 创建Dashboard管理页面（业务限额tab）
- ✅ **验收**：产品经理可修改免费用户限额，无需重启

**Day 3: Phase 1 - 功能开关**
- ✅ 定义功能开关配置（DEFAULT_CONFIG）
- ✅ 扩展Dashboard UI（功能开关tab）
- ✅ 迁移现有硬编码功能开关

**Day 4-5: Phase 2 - 站点配置**
- ✅ 扫描代码，识别所有站点配置
- ✅ 批量替换 `process.env` 为 `getConfig()`
- ✅ 测试环境变量覆盖机制

---

### 第二周计划（优化和扩展）

**Day 6-8: Phase 3 - 全量迁移**
- ✅ 迁移第三方服务配置（services.*）
- ✅ 实施Redis缓存（Upstash）
- ✅ 配置导入/导出功能
- ✅ 完整测试 + 文档更新

---

## 成功标准

### MVP成功标准（Phase 0）
- ✅ 产品经理可在Dashboard修改4个业务限额配置
- ✅ 修改后无需重启，5分钟内生效（缓存TTL）
- ✅ 配置历史记录完整，支持回滚
- ✅ 管理员权限正确控制（非管理员无法访问）

### 最终成功标准（Phase 3）
- ✅ 90%以上配置迁移到配置中心
- ✅ 敏感信息（密钥）仍保留在环境变量
- ✅ Dashboard配置管理界面完善（4个分类tab）
- ✅ 配置历史查看和回滚功能正常
- ✅ 缓存性能优化（平均响应时间 < 50ms）
- ✅ 完整的单元测试覆盖（ConfigService）

---

## 附录

### A. 配置清单（完整示例）

```typescript
// 完整配置定义（示例）
export const FULL_CONFIG_DEFINITIONS: Record<string, ConfigDefinition> = {
  // 业务限额配置 ⭐ MVP重点
  'limits.freeUserDailyLimit': { ... },
  'limits.premiumUserDailyLimit': { ... },
  'limits.maxUploadSizeMB': { ... },
  'limits.maxFileCount': { ... },
  
  // 功能开关
  'features.enableSignup': { ... },
  'features.enableOAuth': { ... },
  'features.enableStripe': { ... },
  'features.maintenanceMode': { ... },
  
  // 站点配置
  'site.title': { ... },
  'site.description': { ... },
  'site.logo': { ... },
  'site.theme': { ... },
  'site.cookieDomain': { ... },
  
  // 第三方服务
  'services.stripeEnabled': { ... },
  'services.analyticsEnabled': { ... },
  'services.emailProvider': { ... },
  
  // UI配置
  'ui.defaultLanguage': { ... },
  'ui.showWelcomeBanner': { ... },
};
```

### B. 技术栈总结

| 层级 | 技术 |
|------|------|
| 数据库 | Supabase (PostgreSQL) |
| 缓存 | 内存缓存（TTL 5分钟）+ Upstash Redis（可选） |
| API | Next.js 14 API Routes |
| UI | React + shadcn/ui + Tailwind CSS |
| 类型安全 | TypeScript + Zod |
| 权限控制 | Supabase RLS + 管理员验证 |

### C. 参考资源

- ShipAny配置中心实现：[参考架构](https://github.com/shipany/config-center)
- Supabase RLS文档：[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Next.js环境变量：[Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- Upstash Redis：[Vercel Integration](https://upstash.com/docs/redis/features/vercelintegration)

---

## 总结

本方案提供了一个**完整、可落地的配置中心实施计划**，核心亮点：

1. **三层优先级系统** - 运行时 > 环境变量 > 默认值，灵活可扩展
2. **MVP优先** - 聚焦业务限额配置，2天验证架构可行性
3. **零停机更新** - 配置修改立即生效，无需重启服务
4. **权限控制** - 管理员独占修改权限，配置历史完整记录
5. **性能优化** - 内存缓存 + Redis缓存（可选），支持高并发
6. **风险可控** - 完整回滚策略，默认值兜底机制

**下一步行动**：
1. Review本方案，确认技术细节
2. 启动Phase 0（MVP），2天内完成业务限额配置中心
3. 验收通过后，逐步推进Phase 1-3

---

**文档版本**：v1.0  
**创建时间**：2025-11-17  
**作者**：Claude (Sonnet 4.5)  
**项目**：WizPulseAI Dashboard站点  
**文档类型**：技术设计方案
