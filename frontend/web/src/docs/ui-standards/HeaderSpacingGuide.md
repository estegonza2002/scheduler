# Header Spacing Guide

This guide documents the standardized spacing between headers and content in the Employee Shift Scheduler application.

## Table of Contents

1. [Spacing Variables](#spacing-variables)
2. [Spacing Components](#spacing-components)
3. [Usage Guidelines](#usage-guidelines)
4. [Migration Guide](#migration-guide)
5. [Examples](#examples)

## Spacing Variables

We've established a set of standardized CSS variables to ensure consistent spacing throughout the application. These variables are defined in `header-spacing.css` and imported globally in the application.

### Padding and Margin Variables

| Variable                    | Value         | Description                                     |
| --------------------------- | ------------- | ----------------------------------------------- |
| `--header-spacing-y`        | 1.5rem (24px) | Vertical padding for headers                    |
| `--header-spacing-x`        | 1rem (16px)   | Horizontal padding for headers (small screens)  |
| `--header-spacing-sm-x`     | 1.5rem (24px) | Horizontal padding for headers (medium screens) |
| `--header-spacing-lg-x`     | 2rem (32px)   | Horizontal padding for headers (large screens)  |
| `--header-content-spacing`  | 1.5rem (24px) | Spacing between page headers and content        |
| `--section-header-spacing`  | 1rem (16px)   | Spacing between section headers and content     |
| `--section-content-spacing` | 1rem (16px)   | Spacing between content sections                |

### Typography Variables

| Variable                 | Value           | Description                     |
| ------------------------ | --------------- | ------------------------------- |
| `--header-title-size`    | 1.875rem (30px) | Font size for page headers      |
| `--header-title-weight`  | 700 (bold)      | Font weight for page headers    |
| `--dialog-title-size`    | 1.25rem (20px)  | Font size for dialog headers    |
| `--dialog-title-weight`  | 600 (semibold)  | Font weight for dialog headers  |
| `--section-title-size`   | 1.125rem (18px) | Font size for section headers   |
| `--section-title-weight` | 500 (medium)    | Font weight for section headers |

## Spacing Components

To make it easier to maintain consistent spacing, we've created utility components:

### HeaderContentSpacing

A flexible component that applies the appropriate spacing based on the context:

```tsx
<HeaderContentSpacing type="page">
	{/* Your content here */}
</HeaderContentSpacing>
```

### PageContentSpacing

Specific for page content spacing:

```tsx
<PageContentSpacing>{/* Your content here */}</PageContentSpacing>
```

### SectionContentSpacing

Specific for section content spacing:

```tsx
<SectionContentSpacing>{/* Your content here */}</SectionContentSpacing>
```

## Usage Guidelines

### Page Layout

When creating or updating page layouts, you can use one of two approaches:

#### 1. Using the layout context (Preferred)

This approach uses the AppLayout header and passes information to it from your page:

```tsx
import { useLayout } from "../lib/layout-context";

export default function MyPage() {
	const { updatePageHeader } = useLayout();

	// Update page header information
	useEffect(() => {
		updatePageHeader({
			title: "My Page",
			description: "Description of my page",
			actions: <Button>Action</Button>,
		});

		// Cleanup when component unmounts
		return () => {
			updatePageHeader({ title: "" });
		};
	}, [updatePageHeader]);

	return (
		<ContentContainer>
			{/* Main content */}
			<ContentSection title="Section Title">
				{/* Section content */}
			</ContentSection>

			<SectionContentSpacing>{/* Additional content */}</SectionContentSpacing>
		</ContentContainer>
	);
}
```

#### 2. Using PageHeader + PageContentSpacing

If you need more control over header styling, you can use the PageHeader component:

```tsx
export default function MyPage() {
	return (
		<>
			<PageHeader
				title="My Page"
				description="Description of my page"
				actions={<Button>Action</Button>}
			/>

			<PageContentSpacing>
				<ContentContainer>
					{/* Main content */}

					<ContentSection title="Section Title">
						{/* Section content */}
					</ContentSection>

					<SectionContentSpacing>
						{/* Additional content */}
					</SectionContentSpacing>
				</ContentContainer>
			</PageContentSpacing>
		</>
	);
}
```

### Dialog Layout

For consistent dialog spacing:

```tsx
<DialogContent>
	<DialogHeader
		title="Dialog Title"
		description="Dialog description"
	/>

	<div className="p-[var(--header-spacing-x)]">
		{/* Dialog content with consistent padding */}
	</div>

	<DialogFooter className="px-[var(--header-spacing-x)] pb-[var(--header-spacing-x)]">
		{/* Footer actions */}
	</DialogFooter>
</DialogContent>
```

## Migration Guide

To migrate existing components to use the standardized spacing:

1. **Page Headers:**

   - Update any custom padding to use the spacing variables
   - Add `PageContentSpacing` components between headers and content

2. **Dialog Components:**

   - Use the standardized `DialogHeader` component
   - Ensure consistent padding in the dialog content and footer

3. **Section Headers:**
   - Use `ContentSection` for all section headers
   - Add `SectionContentSpacing` components between sections

## Examples

### Before Standardization

```tsx
<div>
	<h1 className="text-3xl font-bold mb-6">Page Title</h1>
	<div className="mb-4">{/* Content with inconsistent spacing */}</div>
</div>
```

### After Standardization

```tsx
<>
	<PageHeader title="Page Title" />
	<PageContentSpacing>
		<ContentContainer>
			{/* Content with standardized spacing */}
		</ContentContainer>
	</PageContentSpacing>
</>
```

By following these guidelines, we ensure consistent spacing and visual hierarchy across the entire application.
