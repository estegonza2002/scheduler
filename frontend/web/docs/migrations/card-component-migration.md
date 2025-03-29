# Card Component Migration Documentation

## Completed Migrations

1. **High Priority Components**

   - ✅ BillingPage.tsx - Replaced custom divs with Card components
   - ✅ LocationDetailDialog.tsx - Converted card-like UI elements to Card components
   - ✅ NotificationsPage.tsx - Updated card-like containers with proper Card structure
   - ✅ LocationShiftPage.tsx - Fixed table containers and error states
   - ✅ ShiftsPage.tsx - Updated table wrappers and view mode toggles
   - ✅ ShiftLogDetailsPage.tsx - Replaced table containers with Cards
   - ✅ AdminDashboardPage.tsx - Converted alert boxes to proper Cards
   - ✅ DailyShiftsPage.tsx - Updated DataTable containers
   - ✅ EmployeeEarningsPage.tsx - Converted earnings table to Card

2. **Medium Priority Migrations**

   - ✅ LocationDetailPage.tsx - Updated shift and employee card-like elements
   - ✅ MessagesPage.tsx - Converted border containers to proper Card components
   - ✅ NotificationItem.tsx - Verified correct Card structure usage (already using proper structure)

3. **Low Priority Migrations**

   - ✅ BrandingPage.tsx - Updated file upload/dropzone areas to use Card components
   - ✅ ProfilePage.tsx - Updated profile image components and file upload areas

4. **Component Structure**
   - ✅ standardized padding and spacing
   - ✅ established consistent hierarchy (Card → CardHeader → CardTitle → CardContent → CardFooter)
   - ✅ removed custom shadow and border styling

## Next Steps

1. **Additional Migrations**

   - ✅ All high and medium priority card-like divs have been migrated to Card components
   - [ ] Consider migrating ShiftTasks.tsx and ShiftDetails.tsx containers
   - [ ] Consider migrating EmployeesSection.tsx card-like elements
   - [ ] Review shift-wizard components for potential Card component usage
   - [ ] Review EmployeeDetailDialog.tsx card-like sections

2. **Design System Enhancement**

   - ✅ Create ESLint rule to enforce proper Card usage (implemented in scripts/eslint-plugin-design-system/rules/enforce-card-structure.js)
   - ✅ Add the rule to .eslintrc.design-system.js configuration
   - [ ] Create exceptions in ESLint rule for UI utility components (like FormItem, ScrollArea, etc.)

3. **Documentation**

   - ✅ Create design system documentation for Card components (implemented in docs/design-system/components/card.md)
   - [ ] Add Card component examples to main design system documentation
   - [ ] Create usage guidelines for special cases like colored cards

4. **Automation**
   - [ ] Add Card component lint checks to CI pipeline
   - [ ] Create codemod for automatic migration of remaining components

## Usage Guidelines

```jsx
// ✅ Do: Use proper Card structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Main content here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ Don't: Create custom card-like divs
<div className="rounded-lg border bg-card shadow">
  <div className="p-4">...</div>
</div>

// ❌ Don't: Use Card without proper structure
<Card>
  <div className="p-4">...</div>
</Card>
```

## Implementation Process

1. Identify card-like elements via search for `className=".*rounded.*border.*shadow`
2. Update imports: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";`
3. Replace div elements with appropriate Card components
4. Adjust content to match Card component hierarchy
5. Verify styling and functionality

## Benefits

- Consistent UI appearance across the app
- Simplified styling through predefined components
- Improved maintainability through component reuse
- Centralized styling in one location

## Common Migration Patterns

### 1. Table Container

```jsx
// Before
<div className="rounded-md border">
  <Table>...</Table>
</div>

// After
<Card>
  <Table>...</Table>
</Card>
```

### 2. Interactive Elements

```jsx
// Before
<div className="flex items-center p-3 rounded-md border hover:bg-muted/50 cursor-pointer" onClick={onClick}>
  <Content />
</div>

// After
<Card className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
  <CardContent className="p-3 flex items-center">
    <Content />
  </CardContent>
</Card>
```

### 3. Dropzones and File Upload Areas

```jsx
// Before
<div className="flex items-center justify-center w-full h-40 rounded-md border-2 border-dashed p-4 bg-muted/10">
  <UploadContent />
</div>

// After
<Card className="border-2 border-dashed bg-muted/10">
  <CardContent className="flex items-center justify-center h-40 p-4">
    <UploadContent />
  </CardContent>
</Card>
```

## Custom ESLint Rule Configuration

The Card component structure rule has been added to the ESLint configuration:

```javascript
// In eslint-plugin-design-system/index.js
const enforceCardStructure = require("./rules/enforce-card-structure");

module.exports = {
	rules: {
		// ... other rules
		"enforce-card-structure": enforceCardStructure,
	},
	configs: {
		recommended: {
			plugins: ["design-system"],
			rules: {
				// ... other rules
				"design-system/enforce-card-structure": "warn",
			},
		},
	},
};

// In .eslintrc.design-system.js
module.exports = {
	// ... other configuration
	rules: {
		// ... other rules
		"design-system/enforce-card-structure": "warn",
	},
	overrides: [
		{
			// Rules for all components
			files: ["**/src/**/*.tsx"],
			rules: {
				// ... other rules
				"design-system/enforce-card-structure": "warn",
			},
		},
		// ... other overrides
	],
};
```

## Exceptions and Special Cases

The following patterns should be excluded from migration:

1. **Loading Spinners** - Elements with classes like `animate-spin` and `border` that create loading indicators
2. **Form Components** - FormItem components that already have their own styling and structure
3. **UI Utility Components** - Components from the UI library that use border/rounded for specific purposes
4. **Colored Cards** - Some cards have specific border colors for status indication (already using Card but with custom borders)

## Finding Remaining Card Elements

Use the grep search command to find remaining card-like elements:

```bash
grep -r "className=\".*rounded.*border" --include="*.tsx" ./src
```

Or more specifically:

```bash
grep -r "className=\".*\b\(rounded\|border\|shadow\).*\b\(rounded\|border\|shadow\)" --include="*.tsx" ./src
```
