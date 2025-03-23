# CSS/Tailwind Style Guide

This document outlines the CSS and Tailwind CSS coding standards and best practices for the Employee Shift Schedule App. By following these guidelines, we ensure consistent, maintainable, and high-quality styling throughout the application.

## Table of Contents

1. [General Principles](#general-principles)
2. [ShadCN Usage](#shadcn-usage)
3. [Tailwind CSS Usage](#tailwind-css-usage)
4. [Class Organization](#class-organization)
5. [Responsive Design](#responsive-design)
6. [Accessibility](#accessibility)
7. [Performance Considerations](#performance-considerations)
8. [Linting](#linting)

## General Principles

- **Use ShadCN components** whenever possible
- **Use Tailwind utility classes** for layout and minor styling adjustments
- **Avoid custom CSS files** unless absolutely necessary
- **Never use inline styles**
- **Follow the New York styling variant** throughout the application

## ShadCN Usage

### Component Structure

Always use the proper component composition pattern with ShadCN:

```jsx
// ✅ CORRECT
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ INCORRECT
<div className="border rounded-lg p-4">
  <div className="mb-4">
    <h3 className="text-lg font-bold">Card Title</h3>
    <p className="text-gray-500">Card Description</p>
  </div>
  <div className="mb-4">
    <p>Card Content</p>
  </div>
  <div>
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Action</button>
  </div>
</div>
```

### Component Variants

- Use the predefined component variants
- Don't create custom variants unless absolutely necessary
- When a component doesn't have a needed variant, use the `className` prop to extend it with Tailwind classes

```jsx
// ✅ CORRECT
<Button variant="destructive">Delete</Button>

// ❌ INCORRECT
<Button className="bg-red-500 hover:bg-red-600 text-white">Delete</Button>
```

## Tailwind CSS Usage

### Utility-First Approach

- Use Tailwind's utility classes for layout and minor styling
- Group related utilities together (e.g., all padding utilities together)
- Use Tailwind's spacing scale consistently
- Prefer Tailwind's color palette over custom colors

### Class Organization

Organize Tailwind classes in a consistent order:

1. Layout (display, position, etc.)
2. Box model (width, height, padding, margin)
3. Typography (font, text)
4. Visual (colors, background, borders)
5. Other (animations, cursor, etc.)

```jsx
// ✅ CORRECT
<div className="flex items-center justify-between w-full p-4 text-sm font-medium text-gray-800 bg-white border rounded-md">
	Content
</div>
```

### Custom Utilities

- If you need the same set of utilities repeatedly, create a component or use `@apply` in a CSS file
- Document custom utilities in this style guide

## Class Organization

- Use the `cn()` utility for conditional class names
- Keep class strings readable - break into multiple lines if needed

```jsx
// ✅ CORRECT
const buttonClasses = cn(
	"rounded-md px-4 py-2 font-medium",
	variant === "primary" && "bg-blue-500 text-white",
	variant === "secondary" && "bg-gray-200 text-gray-800",
	disabled && "opacity-50 cursor-not-allowed"
);

// ❌ INCORRECT
const buttonClasses =
	"rounded-md px-4 py-2 font-medium" +
	(variant === "primary"
		? " bg-blue-500 text-white"
		: " bg-gray-200 text-gray-800") +
	(disabled ? " opacity-50 cursor-not-allowed" : "");
```

## Responsive Design

- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Design for mobile-first
- Avoid using fixed heights that might break the layout on different screen sizes
- Test all components in responsive mode

```jsx
// ✅ CORRECT
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// ❌ INCORRECT
<div className="grid grid-cols-3 gap-4">
  {/* Content that will break on mobile */}
</div>
```

## Accessibility

- Ensure sufficient color contrast
- Use proper semantic HTML elements
- Include focus states for interactive elements
- Test with keyboard navigation

```jsx
// ✅ CORRECT
<Button className="focus:ring-2 focus:ring-offset-2">
  Click Me
</Button>

// ❌ INCORRECT
<Button className="focus:outline-none">
  Click Me
</Button>
```

## Performance Considerations

- Use Tailwind's `@apply` directive sparingly
- Avoid unnecessary nesting in components
- Use PurgeCSS to remove unused styles in production
- Keep selector specificity low

## Linting

We use `stylelint` with Tailwind-specific plugins to enforce these rules:

```
"rules": {
  "no-descending-specificity": null,
  "declaration-empty-line-before": null,
  "no-duplicate-selectors": true,
  "color-no-invalid-hex": true,
  "font-family-no-duplicate-names": true,
  "function-calc-no-unspaced-operator": true
}
```

To run the linter:

```bash
npm run lint:css
```

## Component Templates

Use the templates in `docs/templates/` for creating new components to ensure consistency.
