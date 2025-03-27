# enforce-content-container

## Overview

This rule ensures that page components use the ContentContainer component to wrap content sections according to the design system guidelines.

## Rule Details

The rule enforces the following:

1. ContentContainer must be imported in page components
2. ContentContainer must be used to wrap content in page components
3. When PageHeader is used, ContentContainer should be used to wrap the content below it

## Why This Rule Is Important

ContentContainer provides consistent padding, spacing, and layout constraints across the application. It ensures that content sections maintain proper spacing and alignment according to the design system specifications.

## Implementation

The rule uses AST (Abstract Syntax Tree) analysis to check:

1. If the file is a page component (ends with Page.tsx)
2. If ContentContainer is imported from the UI library
3. If ContentContainer is actually used in the component
4. If the PageHeader + ContentContainer pattern is maintained

## Examples

### Valid Pattern ✅

```jsx
import { PageHeader } from "../components/ui/page-header";
import { ContentContainer } from "../components/ui/content-container";

function DashboardPage() {
	return (
		<div>
			<PageHeader title="Dashboard" />
			<ContentContainer>{/* Page content */}</ContentContainer>
		</div>
	);
}
```

### Invalid Pattern ❌

```jsx
import { PageHeader } from "../components/ui/page-header";

function DashboardPage() {
	return (
		<div>
			<PageHeader title="Dashboard" />
			<div>{/* Content not wrapped in ContentContainer */}</div>
		</div>
	);
}
```

## Testing

The rule can be tested using the provided test script:

```bash
node scripts/test-content-container-rule.js
```

This will run the rule against a test file and verify that it correctly detects violations.

## Configuration

In your ESLint configuration file (`.eslintrc.design-system.js`), include the rule:

```js
module.exports = {
	// Other config...
	rules: {
		"design-system/enforce-content-container": "warn", // or "error"
	},
};
```

## Implementation Status

- ✅ Rule structure creation
- ✅ Initial implementation
- 🟡 Testing against existing pages
- 🟡 Documentation for developers
- ⬜️ Integration with pre-commit hooks

## Next Steps

1. Complete thorough testing across the codebase
2. Update documentation based on developer feedback
3. Integrate with the pre-commit hooks
4. Consider adding auto-fix functionality for more complex cases
