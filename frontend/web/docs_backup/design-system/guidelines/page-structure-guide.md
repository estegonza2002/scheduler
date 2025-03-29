# Page Structure Guidelines

## Overview

This document defines the standard structure for pages in the application to ensure consistent look and feel across all content areas while leveraging shadcn/ui components.

## Standard Page Structure

### 1. Page Header

Every page should have a standardized header using the `PageHeader` component:

```tsx
<PageHeader
	title="Page Title"
	description="Optional description of the page"
	actions={<ActionButtons />}
/>
```

**Spacing:** The page content should begin after consistent spacing from the header using:

```tsx
<HeaderContentSpacing type="page">{/* Page content */}</HeaderContentSpacing>
```

### 2. Content Container

All main content should be wrapped in a `ContentContainer`:

```tsx
<ContentContainer>{/* Content sections */}</ContentContainer>
```

### 3. Content Sections

Content should be organized into logical sections using `ContentSection`:

```tsx
<ContentSection
	title="Section Title"
	description="Section description"
	headerActions={<SectionActions />}>
	{/* Section content */}
</ContentSection>
```

## Page Layout Patterns

### Basic Page

```tsx
export function BasicPage() {
	return (
		<>
			<PageHeader
				title="Page Title"
				description="Page description"
				actions={<Button>Action</Button>}
			/>
			<HeaderContentSpacing type="page">
				<ContentContainer>
					<ContentSection title="Section 1">
						{/* Section 1 content */}
					</ContentSection>

					<ContentSection title="Section 2">
						{/* Section 2 content */}
					</ContentSection>
				</ContentContainer>
			</HeaderContentSpacing>
		</>
	);
}
```

### Page with Tabs

```tsx
export function PageWithTabs() {
	return (
		<>
			<PageHeader title="Page With Tabs" />
			<HeaderContentSpacing type="page">
				<ContentContainer>
					<Tabs defaultValue="tab1">
						<TabsList>
							<TabsTrigger value="tab1">Tab 1</TabsTrigger>
							<TabsTrigger value="tab2">Tab 2</TabsTrigger>
						</TabsList>
						<TabsContent value="tab1">
							<ContentSection title="Tab 1 Content">
								{/* Tab 1 content */}
							</ContentSection>
						</TabsContent>
						<TabsContent value="tab2">
							<ContentSection title="Tab 2 Content">
								{/* Tab 2 content */}
							</ContentSection>
						</TabsContent>
					</Tabs>
				</ContentContainer>
			</HeaderContentSpacing>
		</>
	);
}
```

### Page with Secondary Navigation

```tsx
export function PageWithSecondaryNav() {
	return (
		<>
			<PageHeader title="Page With Secondary Nav" />
			<HeaderContentSpacing type="page">
				<div className="flex">
					<div className="secondary-navbar">{/* Secondary navigation */}</div>
					<ContentContainer className="main-with-secondary-expanded">
						<ContentSection title="Content">
							{/* Main content */}
						</ContentSection>
					</ContentContainer>
				</div>
			</HeaderContentSpacing>
		</>
	);
}
```

## Spacing Guidelines

1. Between the page header and first content: `var(--header-content-spacing)` (24px)
2. Between content sections: `var(--section-content-spacing)` (16px)
3. Between section title and content: `var(--section-header-spacing)` (16px)

## Card vs. Flat Layout

Use the `flat` prop on `ContentSection` to determine when to use card styling:

1. **Card Layout (default):** Use for distinct content groups that need visual separation
2. **Flat Layout (`flat={true}`):** Use for less formal grouping or when multiple sections would create visual clutter

## Implementation Checklist

- [ ] Page uses PageHeader component
- [ ] Content wrapped in ContentContainer
- [ ] Content organized in ContentSection components
- [ ] Consistent spacing using HeaderContentSpacing
- [ ] Proper use of card vs. flat layouts
- [ ] Responsive behavior preserved

## Audit Status

| Page Path                           | Status         | Issues    | Priority |
| ----------------------------------- | -------------- | --------- | -------- |
| src/components/LocationInsights.tsx | 🟡 In Progress | See below | High     |

## Sample Page Audit: LocationInsights.tsx

### Current Implementation

```tsx
// Current implementation
return (
	<div className="space-y-6">
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Total Shifts Card */}
			<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
				<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
					<CardTitle className="text-sm flex items-center justify-between text-blue-700">
						<span className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Total Shifts
						</span>
						<FormulaExplainer />
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-2 px-4 pb-4">
					<div className="text-2xl font-bold">{stats.totalShifts}</div>
					<div className="text-sm mt-1 text-muted-foreground">
						{stats.completedShifts} completed
					</div>
				</CardContent>
			</Card>
			{/* Additional cards... */}
		</div>
	</div>
);
```

### Issues Identified

1. ❌ Missing PageHeader component
2. ❌ Missing ContentContainer wrapper
3. ❌ Not using ContentSection for logical grouping
4. ❌ Inconsistent spacing (using space-y-6 instead of standard spacing variables)
5. ❌ Direct use of Card components instead of through ContentSection
6. ✅ Good responsive design for cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)

### Recommended Refactoring

```tsx
return (
	<>
		<PageHeader
			title="Location Insights"
			description={`Metrics and statistics for ${location.name}`}
		/>
		<HeaderContentSpacing type="page">
			<ContentContainer>
				<ContentSection
					title="Key Metrics"
					description="Overview of location performance metrics">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Cards with metrics */}
						<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
							{/* Card content */}
						</Card>
						{/* Additional cards... */}
					</div>
				</ContentSection>
			</ContentContainer>
		</HeaderContentSpacing>
	</>
);
```

### Implementation Notes

- This component seems to be part of a larger page rather than a standalone page
- If it's a sub-component, it should at least utilize ContentSection for proper grouping
- Custom card styling should be maintained for the metric cards (they have specific branding by category)
- The space-y-6 spacing should be replaced with standard spacing variables
