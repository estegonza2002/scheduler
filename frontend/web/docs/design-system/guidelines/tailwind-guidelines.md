# Tailwind Usage Guidelines

To ensure consistency when using Tailwind CSS with shadcn/ui components, follow these guidelines:

## Spacing

- Use Tailwind's spacing scale instead of custom spacing variables:

  - `m-6`, `p-4`, `gap-2`, etc.
  - Never use custom CSS variables for standard spacing

- Prefer space-y-_ and space-x-_ utilities for consistent child element spacing:

  - `space-y-6` for major sections
  - `space-y-4` for content within sections
  - `space-x-2` for horizontally aligned elements

- Use standard scales:
  - `4` (1rem) for general spacing
  - `6` (1.5rem) for section spacing
  - `2` (0.5rem) for related elements

## Layout

- Use flex and grid with Tailwind utilities instead of custom layout components:

  - `flex items-center justify-between` for headers
  - `grid grid-cols-2 gap-4` for consistent layouts
  - `flex-1` for flexible spacing

- Standardize on container widths using max-w-\* utilities:

  - `max-w-7xl` for full-width content
  - `max-w-4xl` for narrower content sections
  - `mx-auto` for centering

- Use consistent responsive breakpoints:
  - `sm:` (640px)
  - `md:` (768px)
  - `lg:` (1024px)
  - `xl:` (1280px)

## Typography

- Use text-\* utilities directly based on component hierarchy:

  - `text-2xl` for page titles
  - `text-xl` for section titles
  - `text-lg` for subsection titles
  - `text-sm` for secondary content

- Heading levels:

  - Page titles: `text-2xl font-bold`
  - Card titles: `text-xl font-semibold`
  - Section headers: `text-lg font-medium`

- Font weights:
  - `font-bold` for page titles
  - `font-semibold` for section titles
  - `font-medium` for emphasized text
  - `font-normal` for body text

## Colors

- Leverage Tailwind's theme colors through utilities:

  - `text-muted-foreground` for secondary text
  - `text-destructive` for error messages
  - Default text color for primary content

- Use shadcn's semantic color variables through Tailwind classes:
  - `bg-background`, `text-foreground`
  - `bg-primary`, `text-primary-foreground`
  - `bg-card`, `text-card-foreground`

## Common Patterns

### Page Header

```tsx
<div className="flex items-center justify-between mb-6">
	<div>
		<h1 className="text-2xl font-bold">Page Title</h1>
		<p className="text-muted-foreground mt-1">Page description text</p>
	</div>
	<Button size="sm">Action</Button>
</div>
```

### Content Container

```tsx
<div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	{/* Page content */}
</div>
```

### Card Section

```tsx
<Card>
	<CardHeader>
		<div className="flex items-center justify-between">
			<div>
				<CardTitle>Section Title</CardTitle>
				<CardDescription>Section description</CardDescription>
			</div>
			<Button
				variant="outline"
				size="sm">
				Action
			</Button>
		</div>
	</CardHeader>
	<CardContent>{/* Section content */}</CardContent>
</Card>
```

### Flat Section

```tsx
<div className="mt-6">
	<h2 className="text-xl font-semibold mb-3">Section Title</h2>
	<p>Section content without card styling</p>
</div>
```
