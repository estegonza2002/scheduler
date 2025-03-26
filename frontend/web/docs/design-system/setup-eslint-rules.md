# Setting Up Design System ESLint Rules

This guide provides step-by-step instructions for setting up and using our design system ESLint rules. These rules automatically detect design system violations during development, helping maintain consistency across the codebase.

## Why Use These Rules?

- **Immediate Feedback**: Detect design system violations as you code
- **Consistent Implementation**: Ensure all pages follow the standard structure
- **Reduced Review Time**: Fewer design-related issues to fix during code review
- **Documentation**: Rules serve as living documentation of design system standards

## Installation

### Step 1: Install the ESLint Plugin

```bash
# From the project root directory
npm link ./scripts/eslint-plugin-design-system
```

This creates a symlink to the local plugin in your node_modules folder, making it available to ESLint.

### Step 2: Set Up the Pre-commit Hook

```bash
# Copy the pre-commit hook to git hooks directory
cp scripts/git-hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

This will run the design system checks automatically before each commit.

### Step 3: Configure VS Code Integration (Optional)

Create or modify `.vscode/settings.json` to include:

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

This enables real-time linting and auto-fix in VS Code.

## Understanding the Rules

### enforce-page-header

- **What it checks**: Ensures page components use the PageHeader component
- **Severity**: Error
- **Auto-fix**: Yes (can add the import)
- **How to fix**: Add a PageHeader component at the top of your page

```tsx
<PageHeader
	title="Page Title"
	description="Page description"
	actions={/* Optional action buttons */}
/>
```

### enforce-header-content-spacing

- **What it checks**: Ensures HeaderContentSpacing is used after PageHeader
- **Severity**: Error
- **Auto-fix**: Partial (can add the import)
- **How to fix**: Wrap your content in HeaderContentSpacing

```tsx
<PageHeader title="Page Title" />
<HeaderContentSpacing type="page">
  <ContentContainer>
    {/* Page content */}
  </ContentContainer>
</HeaderContentSpacing>
```

### prevent-direct-card

- **What it checks**: Warns when Card components are used without ContentSection
- **Severity**: Warning
- **Auto-fix**: No
- **How to fix**: Always wrap Card components in ContentSection

```tsx
<ContentSection title="Section Title">
	<Card>{/* Card content */}</Card>
</ContentSection>
```

### enforce-form-section

- **What it checks**: Warns when forms don't use FormSection to group related fields
- **Severity**: Warning
- **Auto-fix**: No
- **How to fix**: Structure forms with FormSection components to group related fields

```tsx
<form>
	<FormSection
		title="Personal Information"
		description="Enter your personal details">
		{/* Form fields */}
	</FormSection>

	<FormSection
		title="Contact Information"
		description="Enter contact information">
		{/* More form fields */}
	</FormSection>
</form>
```

### enforce-card-grid-section

- **What it checks**: Warns when card grid layouts aren't wrapped in ContentSection
- **Severity**: Warning
- **Auto-fix**: No
- **How to fix**: Always wrap card grid layouts inside ContentSection components

```tsx
<ContentSection
	title="Employee List"
	description="All employees in the system">
	<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		{employees.map((employee) => (
			<Card key={employee.id}>{/* Card content */}</Card>
		))}
	</div>
</ContentSection>
```

## Bypassing Checks When Necessary

In rare cases, you may need to bypass these checks:

```

```
