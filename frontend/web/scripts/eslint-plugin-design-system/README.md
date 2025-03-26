# Design System ESLint Plugin

This ESLint plugin enforces our design system standards across the codebase. It helps catch design system violations during development rather than during code review or later refactoring.

## Installation

1. Install the plugin locally:

```bash
# From project root
npm link ./scripts/eslint-plugin-design-system
```

2. Set up the pre-commit hook:

```bash
# Copy the pre-commit hook to git hooks directory
cp scripts/git-hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

3. Configure VS Code integration (optional):

Add to your `.vscode/settings.json`:

```json
{
	"eslint.validate": [
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact"
	],
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"eslint.options": {
		"overrideConfigFile": ".eslintrc.design-system.js"
	}
}
```

## Rules

### enforce-page-header

Ensures that page components (files ending with "Page.tsx") use the PageHeader component.

**Error:**

- When a page component doesn't import PageHeader
- When PageHeader is imported but not used

**Auto-fix:**

- Can auto-fix the missing import

### enforce-header-content-spacing

Ensures that HeaderContentSpacing is used after PageHeader in page components.

**Error:**

- When HeaderContentSpacing is not imported in a page component
- When PageHeader is used but not followed by HeaderContentSpacing

**Auto-fix:**

- Can auto-fix the missing import

### prevent-direct-card

Warns when Card components are used directly without being wrapped in ContentSection.

**Warning:**

- When a Card component is not a child of ContentSection

**Auto-fix:**

- No auto-fix available

### enforce-form-section

Warns when form components don't use FormSection to group form fields.

**Warning:**

- When a form doesn't contain any FormSection components to group related fields

**Auto-fix:**

- No auto-fix available

### enforce-card-grid-section

Warns when card grid layouts are not wrapped in ContentSection components.

**Warning:**

- When div elements with grid-cols classes containing Card components are not inside ContentSection

**Auto-fix:**

- No auto-fix available

## Usage Examples

### Good examples

```tsx
// GoodPage.tsx
import { PageHeader } from "../components/ui/page-header";
import { HeaderContentSpacing } from "../components/ui/header-content-spacing";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { Card } from "../components/ui/card";

export default function GoodPage() {
	return (
		<>
			<PageHeader
				title="Good Page"
				description="This page follows design system standards"
			/>
			<HeaderContentSpacing type="page">
				<ContentContainer>
					<ContentSection title="Section with Cards">
						<Card>{/* Card content */}</Card>
					</ContentSection>
				</ContentContainer>
			</HeaderContentSpacing>
		</>
	);
}
```

### Bad examples

```tsx
// BadPage.tsx - Will trigger ESLint errors/warnings
import { Card } from "../components/ui/card";
import { ContentContainer } from "../components/ui/content-container";

export default function BadPage() {
	return (
		<>
			<h1>Bad Page</h1> {/* Missing PageHeader */}
			<ContentContainer>
				{" "}
				{/* Missing HeaderContentSpacing */}
				<Card>
					{" "}
					{/* Card not in ContentSection */}
					{/* Card content */}
				</Card>
			</ContentContainer>
		</>
	);
}
```

## Contributing

To add a new rule:

1. Create a new rule file in `rules/`
2. Add the rule to `index.js`
3. Add tests in `tests/`
4. Update this README with the new rule description
