# Design System Refactoring Checklist

This checklist helps developers ensure their pages and components follow the established design system standards. Use this when creating new pages or refactoring existing ones.

## Page Structure

- [ ] **PageHeader** is used at the top of the page

  - [ ] Title accurately describes the page purpose
  - [ ] Description used for additional context if needed
  - [ ] Actions limited to 1-3 primary actions for the page
  - [ ] Back button visibility appropriate for navigation depth

- [ ] **HeaderContentSpacing** is used after PageHeader

  - [ ] Correct type specified (`page`, `section`, or `content`)

- [ ] **ContentContainer** wraps the main page content

  - [ ] No custom padding/margin overrides that conflict with container

- [ ] **ContentSection** used for logical content grouping
  - [ ] Appropriate titles for each section
  - [ ] Section-specific actions in headerActions prop
  - [ ] Flat variant used appropriately

## Spacing

- [ ] Standard spacing variables used instead of custom values

  - [ ] `var(--header-content-spacing)` for space after headers
  - [ ] `var(--section-content-spacing)` for space between sections
  - [ ] `var(--section-header-spacing)` for space between section header and content

- [ ] No hard-coded margin/padding values that could be replaced with variables
  - [ ] No arbitrary `space-y-*` or `gap-*` values that don't align with system

## Component Usage

- [ ] **Button** components follow hierarchy guidelines

  - [ ] Only one primary (default variant) button per section
  - [ ] Destructive variant only used for destructive actions
  - [ ] Consistent button sizing within contexts

- [ ] **Card** components used properly

  - [ ] Complete component hierarchy (Card, CardHeader, CardContent, etc.)
  - [ ] Not nested directly inside other cards
  - [ ] Consistent internal spacing

- [ ] Custom components replaced with design system alternatives
  - [ ] No duplicate implementations of existing components
  - [ ] All forms use standard Form components
  - [ ] Standard dialog/modal patterns followed

## CSS & Styling

- [ ] Tailwind utility classes used for minor styling

  - [ ] No inline styles
  - [ ] No unnecessary custom CSS
  - [ ] Standard color variables used

- [ ] Responsive design patterns maintained
  - [ ] Mobile-first approach
  - [ ] Standard breakpoints used

## Before/After Example

### Before Refactoring

```tsx
// Non-compliant component
return (
	<div className="mt-8">
		<h1 className="text-2xl font-bold mb-4">Page Title</h1>
		<p className="text-gray-500 mb-6">Page description</p>

		<div className="bg-white p-4 rounded-lg shadow mb-8">
			<h2 className="text-lg font-semibold mb-2">Section Title</h2>
			<div className="space-y-4">{/* Content */}</div>
		</div>
	</div>
);
```

### After Refactoring

```tsx
// Design system compliant
return (
	<>
		<PageHeader
			title="Page Title"
			description="Page description"
		/>
		<HeaderContentSpacing type="page">
			<ContentContainer>
				<ContentSection title="Section Title">
					<div className="space-y-[var(--section-content-spacing)]">
						{/* Content */}
					</div>
				</ContentSection>
			</ContentContainer>
		</HeaderContentSpacing>
	</>
);
```

## Common Issues and Solutions

### Problem: Inconsistent spacing between elements

**Solution**: Replace arbitrary spacing values with header-spacing variables

```tsx
// Instead of:
<div className="mb-6">...</div>

// Use:
<HeaderContentSpacing type="section">...</HeaderContentSpacing>
```

### Problem: Custom card implementations

**Solution**: Use ContentSection or Card components

```tsx
// Instead of:
<div className="bg-white rounded-lg shadow p-4">
  <h3 className="font-semibold">Title</h3>
  <div>Content</div>
</div>

// Use:
<ContentSection title="Title">
  <div>Content</div>
</ContentSection>
```

### Problem: Direct DOM elements for page headers

**Solution**: Use PageHeader component

```tsx
// Instead of:
<div className="border-b pb-4 mb-6">
  <h1 className="text-2xl font-bold">Page Title</h1>
  <p className="text-sm text-gray-500">Description</p>
</div>

// Use:
<PageHeader
  title="Page Title"
  description="Description"
/>
```

## Review Process

After refactoring a page, ask yourself:

1. Does it maintain consistent visual styling with other pages?
2. Is the page structure following the standard pattern?
3. Are all custom implementations replaced with design system components?
4. Does the spacing match the system variables?
5. Is the component hierarchy logical and consistent?

## Next Steps

After checking all items on this list, update the Page Audit Results in the [Implementation Plan](./implementation-plan.md) to track progress.
