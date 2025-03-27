# Design System ESLint Rules Plan

## Overview

This document outlines the plan for implementing ESLint rules to automatically enforce design system standards across the codebase. These rules will help catch design system violations during development rather than during code review or later refactoring.

## Goals

1. Automatically detect common design system violations
2. Provide helpful error messages with suggested fixes
3. Integrate with the development workflow
4. Minimize false positives and developer friction

## Rule Categories

### 1. Page Structure Rules

- **enforce-page-header**: Ensure PageHeader component is used at the top level of page components
- **enforce-header-content-spacing**: Require HeaderContentSpacing after PageHeader
- **enforce-content-container**: Ensure content is wrapped in ContentContainer
- **enforce-content-section**: Detect content not properly wrapped in ContentSection

### 2. Component Usage Rules

- **button-hierarchy**: Enforce button variant hierarchy (only one default per section)
- **prevent-direct-card**: Prevent direct use of shadcn/ui Card without ContentSection when appropriate
- **enforce-component-imports**: Ensure components are imported from our UI library instead of being recreated

### 3. Styling Rules

- **prevent-custom-spacing**: Detect hardcoded margin/padding that should use system variables
- **enforce-spacing-variables**: Flag direct pixel values that should use spacing variables
- **prevent-direct-color-values**: Ensure color tokens are used instead of hardcoded colors
- **prevent-custom-button-styling**: Flag custom button styling that overrides design system

## Implementation Approach

### Phase 1: Custom ESLint Plugin

Create a custom ESLint plugin with basic AST analysis:

```js
// Example rule implementation
module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Ensure PageHeader is used at the top level of page components",
			category: "Design System",
			recommended: true,
		},
		fixable: "code",
		schema: [],
	},
	create(context) {
		return {
			// Check if the file is a page component (ends with Page.tsx)
			Program(node) {
				const filename = context.getFilename();
				if (!filename.endsWith("Page.tsx")) return;

				// Track if PageHeader is imported and used
				let pageHeaderImported = false;
				let pageHeaderUsed = false;

				// Check imports
				const importDeclarations = node.body.filter(
					(n) => n.type === "ImportDeclaration"
				);

				for (const importDecl of importDeclarations) {
					if (importDecl.source.value.includes("ui/page-header")) {
						pageHeaderImported = true;
						break;
					}
				}

				// If PageHeader not imported, report error
				if (!pageHeaderImported) {
					context.report({
						node,
						message:
							"Page components must use PageHeader component from design system",
						fix(fixer) {
							return fixer.insertTextAfterRange(
								[0, 0],
								"import { PageHeader } from '../components/ui/page-header';\n"
							);
						},
					});
				}

				// TODO: Check if PageHeader is actually used in the component
			},
		};
	},
};
```

### Phase 2: Pre-commit Hook

Set up a Git pre-commit hook to run ESLint on changed files:

```bash
#!/bin/sh
# .git/hooks/pre-commit

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.tsx\|\.jsx$")

if [[ "$STAGED_FILES" = "" ]]; then
  exit 0
fi

echo "Running design system ESLint rules on staged files..."

for FILE in $STAGED_FILES
do
  npx eslint --config .eslintrc.design-system.js "$FILE"

  if [[ "$?" == 0 ]]; then
    echo "\t\033[32mESLint Passed: $FILE\033[0m"
  else
    echo "\t\033[41mESLint Failed: $FILE\033[0m"
    exit 1
  fi
done

exit 0
```

### Phase 3: VS Code Integration

Create VS Code settings to show design system rule violations in the editor:

```json
// .vscode/settings.json
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

## Rule Implementation Priority

1. **High Priority (Phase 1)**

   - enforce-page-header
   - enforce-header-content-spacing
   - enforce-content-container
   - prevent-direct-card

2. **Medium Priority (Phase 2)**

   - button-hierarchy
   - prevent-custom-spacing
   - enforce-content-section

3. **Lower Priority (Phase 3)**
   - enforce-component-imports
   - prevent-direct-color-values
   - prevent-custom-button-styling

## Implementation Steps

1. Create basic `.eslintrc.design-system.js` configuration file
2. Implement high priority rules using ESLint's AST parser
3. Test rules against existing codebase to validate effectiveness
4. Set up pre-commit hook for staged files
5. Create documentation for developers on the purpose and behavior of each rule
6. Add VS Code integration for real-time feedback

## Example Configuration

```js
// .eslintrc.design-system.js
module.exports = {
	plugins: ["design-system"],
	rules: {
		"design-system/enforce-page-header": "error",
		"design-system/enforce-header-content-spacing": "error",
		"design-system/enforce-content-container": "error",
		"design-system/prevent-direct-card": "error",
		"design-system/button-hierarchy": "warn",
		"design-system/prevent-custom-spacing": "warn",
		// More rules...
	},
};
```

## Challenges and Mitigation

1. **False Positives**: Start with rules as warnings, gather feedback from developers
2. **Complex Component Structure**: Focus on detecting simple patterns first, then refine
3. **Performance**: Run on staged files only to avoid slowing down development
4. **Developer Adoption**: Provide clear documentation, examples, and autofix options

## Success Metrics

1. Reduction in design system inconsistencies in PRs
2. Developer satisfaction with the rules (measured through feedback)
3. Faster code reviews with fewer design system-related comments
4. Consistent design system implementation across the codebase

## Next Steps

1. Create a basic ESLint plugin structure
2. Implement the "enforce-page-header" rule as a proof of concept
3. Test it on existing pages to validate approach
4. Present to the development team for feedback
5. Refine and implement additional rules
