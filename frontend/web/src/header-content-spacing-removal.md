# Header Content Spacing Removal Plan

## Implementation Checklist

- [x] Remove unused import from `src/pages/ShiftDetailsPage.tsx`
- [x] Remove `HeaderContentSpacing` from `src/pages/EmployeesPage.tsx`
- [x] Remove `HeaderContentSpacing` from `src/pages/DesignSystemShowcasePage.tsx`
- [x] Remove `HeaderContentSpacing` from `src/pages/LocationFinancialReportPage.tsx`
- [x] Remove unused import from `src/pages/DashboardPage.tsx`
- [x] Remove CSS import from `src/index.css`
- [x] Remove `src/components/ui/header-content-spacing.tsx` file
- [x] Remove `src/components/ui/header-spacing.css` file
- [x] Disable HeaderContentSpacing rule in `.eslintrc.design-system.js`
- [x] Remove HeaderContentSpacing rule from `scripts/eslint-plugin-design-system/index.js`
- [x] Delete `scripts/eslint-plugin-design-system/rules/enforce-header-content-spacing.js`

## Files to Modify

### Component Files to Remove

- `src/components/ui/header-content-spacing.tsx` - Remove this file completely
- `src/components/ui/header-spacing.css` - Remove this file completely

### Page Files to Update (Remove HeaderContentSpacing)

- `src/pages/EmployeesPage.tsx` - Remove HeaderContentSpacing wrapper
- `src/pages/DesignSystemShowcasePage.tsx` - Remove HeaderContentSpacing wrapper
- `src/pages/LocationFinancialReportPage.tsx` - Remove HeaderContentSpacing wrapper

### Import Cleanup in Files

- `src/pages/DashboardPage.tsx` - Remove unused import
- `src/pages/ShiftDetailsPage.tsx` - Already fixed - removed unused import

### CSS Changes

- `src/index.css` - Remove import of header-spacing.css

### ESLint Changes

- `.eslintrc.design-system.js` - Disable HeaderContentSpacing rule
- `scripts/eslint-plugin-design-system/index.js` - Remove HeaderContentSpacing rule
- `scripts/eslint-plugin-design-system/rules/enforce-header-content-spacing.js` - Delete the rule file

## Implementation Strategy

1. First update page components to remove HeaderContentSpacing wrappers
2. Update index.css to remove the import
3. Remove the custom component files
4. Update ESLint to no longer enforce HeaderContentSpacing usage

This will ensure all system default styles are used instead of custom components.
