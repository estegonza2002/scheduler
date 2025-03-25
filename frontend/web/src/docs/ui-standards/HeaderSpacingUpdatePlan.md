# Header Spacing Update Plan

## Introduction

This document outlines the steps to update existing pages to use our new standardized header spacing components. The goal is to ensure consistent spacing between headers and content throughout the application.

## Prerequisites

Before starting updates, ensure that:

1. The header spacing CSS file is imported in `index.css`
2. The header-content-spacing component is available in the codebase

## Update Process

Follow these steps to update each page:

### 1. Import the Spacing Components

At the top of your page file, add:

```tsx
import {
	PageContentSpacing,
	SectionContentSpacing,
} from "../components/ui/header-content-spacing";
```

### 2. Restructure the Page Layout

Update the page structure from:

```tsx
<ContentContainer>
	<PageHeader
		title="Page Title"
		description="Page description"
	/>

	<div className="mt-6">
		{" "}
		{/* Remove this custom spacing */}
		<ContentSection title="Section Title">
			{/* Section content */}
		</ContentSection>
	</div>
</ContentContainer>
```

To:

```tsx
<>
	<PageHeader
		title="Page Title"
		description="Page description"
	/>

	<PageContentSpacing>
		<ContentContainer>
			<ContentSection title="Section Title">
				{/* Section content */}
			</ContentSection>

			<SectionContentSpacing>{/* Additional content */}</SectionContentSpacing>
		</ContentContainer>
	</PageContentSpacing>
</>
```

### 3. Replace Custom Margin/Padding Classes

Replace any custom margin or padding classes with the appropriate spacing components:

- Replace `className="mt-6"` (or similar) between headers and content with `<PageContentSpacing>`
- Replace `className="mt-4"` (or similar) between sections with `<SectionContentSpacing>`

### 4. Test Responsiveness

Ensure the page looks good on:

- Mobile devices (< 640px)
- Tablets (640px - 1024px)
- Desktop (> 1024px)

## Examples

### DashboardPage Example

Before:

```tsx
<>
	<PageHeader
		title="Welcome back"
		description="Here's what's happening with your schedule today"
	/>
	<ContentContainer>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{/* Cards */}
		</div>
		<ContentSection
			title="Upcoming Shifts"
			description="Your next 7 days">
			{/* Content */}
		</ContentSection>
		<div className="mt-6 flex justify-center">{/* More content */}</div>
	</ContentContainer>
</>
```

After:

```tsx
<>
	<PageHeader
		title="Welcome back"
		description="Here's what's happening with your schedule today"
	/>
	<PageContentSpacing>
		<ContentContainer>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{/* Cards */}
			</div>
			<ContentSection
				title="Upcoming Shifts"
				description="Your next 7 days">
				{/* Content */}
			</ContentSection>
			<SectionContentSpacing>
				<div className="flex justify-center">{/* More content */}</div>
			</SectionContentSpacing>
		</ContentContainer>
	</PageContentSpacing>
</>
```

### ShiftDetailsPage Example

Before:

```tsx
<ContentContainer>
	<PageHeader
		title="Shift Details"
		description="View and manage shift information"
	/>
	<div className="mt-6">
		<ContentSection title="Shift Information">
			<ShiftDetails />
		</ContentSection>
	</div>
</ContentContainer>
```

After:

```tsx
<>
	<PageHeader
		title="Shift Details"
		description="View and manage shift information"
	/>
	<PageContentSpacing>
		<ContentContainer>
			<ContentSection title="Shift Information">
				<ShiftDetails />
			</ContentSection>
		</ContentContainer>
	</PageContentSpacing>
</>
```

## Progress Tracking

As you update pages, please mark them as completed in the StandardizationPlan.md file under the "Progress Tracking" section.

## Further Resources

For more details on header spacing standards, refer to:

- [HeaderSpacingGuide.md](./HeaderSpacingGuide.md)
- Header spacing CSS variables in [header-spacing.css](../../styles/header-spacing.css)
- Component implementation in [header-content-spacing.tsx](../../components/ui/header-content-spacing.tsx)
