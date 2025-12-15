# Translation Keys Summary - Users & Plan Features Pages

## Modification Summary

### users/page.tsx
- **Modified locations**: 14 places
- **Console logs**: Preserved (Chinese text kept in console.log statements)

### plan-features/page.tsx
- **Modified locations**: 32 places
- **Console logs**: Preserved (Chinese text kept in console.log statements)

**Total modifications**: 46 places

---

## Translation Keys Used

### adminUsers.* (Users Page)

| Key | Original Chinese | Usage |
|-----|-----------------|-------|
| `adminUsers.description` | 管理系统用户、权限和账户状态 | Page description |
| `adminUsers.searchPlaceholder` | 搜索用户邮箱或姓名... | Search input placeholder |
| `adminUsers.totalUsers` | 共 {count} 个用户 | Total users count (with parameter) |
| `adminUsers.loading` | 加载用户数据中... | Loading state |
| `adminUsers.noName` | 未设置姓名 | User with no name |
| `adminUsers.normalUser` | 普通用户 | Default role label |
| `adminUsers.noResults` | 未找到匹配的用户 | Empty search results |
| `adminUsers.tableHeaders.userInfo` | 用户信息 | Table header |
| `adminUsers.tableHeaders.userId` | 用户ID | Table header |
| `adminUsers.tableHeaders.role` | 角色 | Table header |
| `adminUsers.tableHeaders.createdAt` | 注册时间 | Table header |
| `adminUsers.tableHeaders.actions` | 操作 | Table header |
| `adminUsers.actions.demote` | 降级 | Demote admin button |
| `adminUsers.actions.logout` | 登出 | Force logout button |
| `adminUsers.actions.promote` | 提升为管理员 | Promote to admin button |

### adminPlanFeatures.* (Plan Features Page)

| Key | Original Chinese | Usage |
|-----|-----------------|-------|
| `adminPlanFeatures.title` | 产品功能关联管理 | Page title |
| `adminPlanFeatures.addNew` | 添加新关联 | Add new button |
| `adminPlanFeatures.loading` | 加载数据中... | Loading state |
| `adminPlanFeatures.noData` | 暂无产品功能关联记录 | Empty state |
| `adminPlanFeatures.private` | 不公开 | Private badge |
| `adminPlanFeatures.featureCode` | 功能代码 | Feature code label |
| `adminPlanFeatures.dialogs.create.title` | 添加新产品功能关联 | Create dialog title |
| `adminPlanFeatures.dialogs.create.description` | 将功能关联到产品，设置月度配额和可见性。 | Create dialog description |
| `adminPlanFeatures.dialogs.edit.title` | 编辑产品功能关联 | Edit dialog title |
| `adminPlanFeatures.dialogs.edit.description` | 修改产品功能关联的月度配额和可见性。 | Edit dialog description |
| `adminPlanFeatures.form.product` | 产品 | Product label |
| `adminPlanFeatures.form.feature` | 功能 | Feature label |
| `adminPlanFeatures.form.monthlyQuota` | 月度配额 | Monthly quota label |
| `adminPlanFeatures.form.selectProduct` | 选择产品 | Select product placeholder |
| `adminPlanFeatures.form.selectFeature` | 选择功能 | Select feature placeholder |
| `adminPlanFeatures.form.quotaHint` | 每月可使用的次数，留空表示使用功能默认限制 | Quota hint text |
| `adminPlanFeatures.info.productStatus` | 产品状态 | Product status label |
| `adminPlanFeatures.info.inactive` | 未激活 | Inactive status |
| `adminPlanFeatures.info.unit` | 功能单位 | Unit label |
| `adminPlanFeatures.info.quota` | 月度配额 | Quota label |
| `adminPlanFeatures.info.default` | 默认 | Default marker |
| `adminPlanFeatures.info.unlimited` | 无限制 | Unlimited label |
| `adminPlanFeatures.actions.create` | 创建关联 | Create button |
| `adminPlanFeatures.actions.creating` | 创建中... | Creating state |
| `adminPlanFeatures.actions.update` | 更新关联 | Update button |
| `adminPlanFeatures.actions.updating` | 更新中... | Updating state |

### Reused Common Keys

| Key | Original Chinese | Usage |
|-----|-----------------|-------|
| `common.back` | 返回 | Back button (both pages) |
| `common.cancel` | 取消 | Cancel button (plan-features) |
| `common.unknown` | 未知 | Unknown created_at (users) |
| `admin.public` | 公开 | Public visibility (plan-features) |
| `admin.active` | 激活 | Active status (plan-features) |
| `admin.userManagement` | 用户管理 | Page header (users) |
| `adminAiProducts.edit` | 编辑 | Edit button (plan-features) |
| `adminAiProducts.delete` | 删除 | Delete button (plan-features) |

---

## Notes

1. **Console.log statements preserved**: All Chinese text in `console.log()` and `console.error()` statements were kept unchanged as requested.

2. **Parameter support**: The key `adminUsers.totalUsers` uses a parameter `{count}` for dynamic count display.

3. **Nested structure**: Translation keys follow a hierarchical structure:
   - `adminUsers.tableHeaders.*` for table headers
   - `adminUsers.actions.*` for action buttons
   - `adminPlanFeatures.dialogs.create.*` for create dialog
   - `adminPlanFeatures.dialogs.edit.*` for edit dialog
   - `adminPlanFeatures.form.*` for form labels
   - `adminPlanFeatures.info.*` for information display
   - `adminPlanFeatures.actions.*` for action buttons

4. **Reused keys**: Common keys like `common.back`, `common.cancel`, `admin.public` were reused from existing translations to maintain consistency.

5. **Both files already had**: `useLanguage` and `t()` imports, so only text replacement was needed.
