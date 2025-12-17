# Main 站点 ThemeScript 更新报告

**日期**: 2025-12-17
**任务**: 更新 Main 站点的 ThemeScript.tsx 以支持新的主题编码方案
**状态**: ✅ 完成

---

## 更新内容

### 文件位置
`wizPulseAI-com/src/shared/theme/ThemeScript.tsx`

### 主要变更

#### 1. 支持新编码方案 (1/2/11/12)
- **1-9**: 亮色系 (Light Mode)
- **11-19**: 暗色系 (Dark Mode)

当前定义：
- `1` = Indigo Light（靛蓝亮色）
- `2` = Rose Light（玫瑰亮色）
- `11` = Indigo Dark（靛蓝暗色）
- `12` = Rose Dark（玫瑰暗色）

#### 2. 编码解读逻辑
```javascript
// 解读编码：1-9=亮色，11-19=暗色
var isDark = themeId >= 11;
var colorScheme = isDark ? themeId - 10 : themeId;

// 设置属性
document.documentElement.setAttribute('data-theme', String(themeId));
document.documentElement.setAttribute('data-color', String(colorScheme));
```

#### 3. 向后兼容
- **旧编码转换**: 3 → 11 (Indigo Dark), 4 → 12 (Rose Dark)
- **字符串支持**: 'light' → 1, 'dark' → 11, 'system' → 根据系统偏好

#### 4. 设置的属性
- `data-theme`: 完整主题 ID (1/2/11/12)
- `data-color`: 颜色方案 (1/2)
- `class`: 'light' 或 'dark'

---

## 验证结果

### TypeScript 编译
```
✓ Compiled successfully
```

### 与 Dashboard 一致性
```bash
diff dashboard/ThemeScript.tsx main/ThemeScript.tsx
# (无输出 = 完全一致)
```

### 测试场景
- ✅ Cookie 值为 1: Indigo Light (data-theme=1, data-color=1, class=light)
- ✅ Cookie 值为 2: Rose Light (data-theme=2, data-color=2, class=light)
- ✅ Cookie 值为 11: Indigo Dark (data-theme=11, data-color=1, class=dark)
- ✅ Cookie 值为 12: Rose Dark (data-theme=12, data-color=2, class=dark)
- ✅ Cookie 值为 3 (旧编码): 自动转换为 11
- ✅ Cookie 值为 4 (旧编码): 自动转换为 12
- ✅ Cookie 值为 'light': 自动转换为 1
- ✅ Cookie 值为 'dark': 自动转换为 11
- ✅ Cookie 值为 'system': 根据系统偏好选择 1 或 11

---

## 技术特点

1. **防止闪烁**: 在 HTML <head> 中同步执行
2. **错误处理**: 解析失败时使用默认主题 (Indigo Light)
3. **向后兼容**: 支持旧编码和字符串格式
4. **可扩展**: 支持未来扩展 3-9（亮色）和 13-19（暗色）

---

## 相关文档

- [主题与语言跨站点同步设计方案](./wizPulseAI-docs/THEME_LANGUAGE_SYNC_DESIGN.md)
- Dashboard ThemeScript: `db-wizPulseAI-com/src/shared/theme/ThemeScript.tsx`
- Main ThemeScript: `wizPulseAI-com/src/shared/theme/ThemeScript.tsx`

---

**更新完成时间**: 2025-12-17 12:00
