# enforce-page-header

Ensures that all page components use the PageHeader component at the top level.

## Rule Details

This rule enforces that all page components (files ending with `Page.tsx`) properly use the PageHeader component from our design system. This helps maintain consistency across all pages in the application.

The rule checks for:

1. Proper import of the PageHeader component
2. Actual usage of the PageHeader in the component
3. Inclusion of the required `title` prop
4. Placement of the PageHeader at the top level of the JSX structure

### ✅ Examples of correct code

```tsx
// CorrectPage.tsx
import React from "react";
import { PageHeader } from "../components/ui/page-header";
import { Button } from "../components/ui/button";

export function CorrectPage() {
	return (
		<>
			<PageHeader
				title="Page Title"
				description="Optional description"
				actions={<Button>Action</Button>}
			/>
			{/* Page content */}
		</>
	);
}
```

```tsx
// AlsoCorrectPage.tsx
import React from "react";
import { PageHeader } from "../components/ui/page-header";

export function AlsoCorrectPage() {
	return (
		<div>
			<PageHeader title="Just Title Required" />
			{/* Page content */}
		</div>
	);
}
```

### ❌ Examples of incorrect code

```tsx
// MissingHeaderPage.tsx
import React from "react";
// Missing PageHeader import

export function MissingHeaderPage() {
	return (
		<div>
			<h1>Page Title</h1>
			{/* Page content */}
		</div>
	);
}
```

```tsx
// ImportedButNotUsedPage.tsx
import React from "react";
import { PageHeader } from "../components/ui/page-header";

export function ImportedButNotUsedPage() {
	return (
		<div>
			<h1>Page Title</h1>
			{/* PageHeader component is imported but not used */}
		</div>
	);
}
```

```tsx
// MissingTitlePage.tsx
import React from "react";
import { PageHeader } from "../components/ui/page-header";

export function MissingTitlePage() {
	return (
		<div>
			<PageHeader /> {/* Missing required title prop */}
			{/* Page content */}
		</div>
	);
}
```

```tsx
// IncorrectPlacementPage.tsx
import React from "react";
import { PageHeader } from "../components/ui/page-header";

export function IncorrectPlacementPage() {
	return (
		<div>
			<div>
				<div>
					{/* PageHeader not at top level */}
					<PageHeader title="Buried Too Deep" />
				</div>
			</div>
			{/* Page content */}
		</div>
	);
}
```

## Rule Options

This rule does not have any options.

## When Not To Use It

If you don't need consistent page headers throughout your application or if you have a legacy page that cannot be updated to use the PageHeader component yet.

## Implementation

```js
module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Ensure PageHeader component is used at the top level of page components",
			category: "Design System",
			recommended: true,
		},
		fixable: "code",
		schema: [],
		messages: {
			missingImport:
				'Page components must import the PageHeader component from "../components/ui/page-header"',
			missingUsage:
				'Page components must use the PageHeader component with at least a "title" prop',
			incorrectUsage: 'PageHeader component must have at least a "title" prop',
			pageHeaderPosition:
				"PageHeader component should be at the top level of the JSX structure",
		},
	},
	// ... implementation details
};
```

## Related Rules

- `enforce-header-content-spacing` - Ensures proper spacing after the PageHeader component
- `enforce-content-container` - Ensures content is wrapped in ContentContainer

## Resources

- [Page Structure Guide](../../page-structure-guide.md) - Guide for standard page structure
