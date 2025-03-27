# Design System Audit: ShiftsPage.tsx

## Overview

This document contains the audit findings for the `ShiftsPage.tsx` component based on our design system standards.

## Audit Checklist

### Page Structure

- [x] Uses PageHeader component
- [x] Uses ContentContainer correctly
- [ ] Uses ContentSection for content grouping
- [ ] Uses proper spacing between sections

### Component Usage

- [ ] Direct Card usage should be replaced with ContentSection
- [x] Uses standard Button variants correctly
- [x] Uses appropriate text styles
- [x] Form components follow design system patterns

### Styling

- [ ] No custom spacing that should use design system variables
- [ ] No hardcoded colors
- [ ] Consistent use of Tailwind utility classes
- [ ] Responsive layouts implemented correctly

## Detailed Findings

**PageHeader Implementation**: ✅  
**Notes**: The PageHeader is correctly implemented with title, description, and actions.

**ContentContainer Usage**: ✅  
**Notes**: ContentContainer is properly imported and used to wrap the main content.

**Card Components**: ❌  
**Notes**: The page contains multiple direct Card usages that should be wrapped in ContentSection components:

1. Stats cards (3 cards at the top)
2. Main content card with tabs
3. Individual shift cards in the card view mode

**Spacing Issues**: ❌  
**Notes**: The page uses hardcoded spacing values like `space-y-6` and `gap-4` which should be standardized according to the design system.

**Component Hierarchy**: ❌  
**Notes**: The nested structure is deep and could be improved by breaking down into smaller components for better readability and maintenance.

## Code Analysis

### Current Structure

```jsx
<PageHeader
  title="Shifts"
  description="View and manage all your scheduled shifts"
  actions={...}
/>
<ContentContainer>
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>...</Card>
      <Card>...</Card>
      <Card>...</Card>
    </div>

    {/* Main Content */}
    <Card>
      <CardContent className="pt-6">
        <Tabs>...</Tabs>
      </CardContent>
    </Card>
  </div>
</ContentContainer>
```

### Issues

1. The stats cards should be wrapped in a ContentSection component
2. The main content card should be converted to use ContentSection
3. The space-y-6 and gap-4 should use design system spacing variables
4. Card components in the card view should be refactored

## Recommended Changes

### Step 1: Refactor Stats Section

Convert the stats cards section to use ContentSection:

```jsx
<ContentSection title="Summary Statistics">
	<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
		<Card>...</Card>
		<Card>...</Card>
		<Card>...</Card>
	</div>
</ContentSection>
```

### Step 2: Refactor Main Content

Convert the main content card to use ContentSection:

```jsx
<ContentSection title="Shifts Overview">
	<Tabs>...</Tabs>
</ContentSection>
```

### Step 3: Standardize Spacing

Replace hardcoded spacing values with design system variables:

```jsx
<ContentContainer>
	<div className="space-y-8">
		{" "}
		{/* Use standard spacing variable */}
		<ContentSection>...</ContentSection>
		<ContentSection>...</ContentSection>
	</div>
</ContentContainer>
```

### Step 4: Refactor Card View

Extract the card view into a dedicated component and use proper nesting:

```jsx
<ContentSection title="Shifts">
	<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
		{filteredShifts.map((shift) => (
			<ShiftCard
				key={shift.id}
				shift={shift}
			/>
		))}
	</div>
</ContentSection>
```

## Compliance Score

**Current Score**: 5/10  
The page follows some design system patterns but needs significant refactoring to fully comply with our standards.

## Implementation Priority

**Priority**: High  
This page is frequently used and contains multiple instances of patterns that should be standardized.

## Estimated Effort

**Estimated Effort**: Medium (4-6 hours)  
The refactoring will require:

1. Adding ContentSection components
2. Reorganizing the component structure
3. Standardizing spacing
4. Potentially extracting some logic into separate components

## Next Steps

1. Create a refactoring plan for ShiftsPage.tsx
2. Implement ContentSection components for content grouping
3. Standardize spacing using design system variables
4. Consider extracting the card and table views into separate components
5. Test the refactored page to ensure functionality is maintained
