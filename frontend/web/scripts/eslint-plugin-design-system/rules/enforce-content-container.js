/**
 * Rule to enforce ContentContainer usage in page components
 *
 * This rule checks if files ending with "Page.tsx" import and use the ContentContainer component
 * from our design system. ContentContainer should be used to wrap content sections.
 */

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Ensure ContentContainer is used to wrap content in page components",
			category: "Design System",
			recommended: true,
		},
		fixable: "code",
		schema: [], // no options
		messages: {
			missingImport:
				"Page components must import the ContentContainer component",
			missingUsage: "Page components must use ContentContainer to wrap content",
		},
	},
	create(context) {
		// Only run this rule on page components (files ending with Page.tsx)
		const filename = context.getFilename();
		if (!filename.endsWith("Page.tsx")) {
			return {};
		}

		return {
			Program(node) {
				let contentContainerImported = false;
				let contentContainerUsed = false;
				let pageHeaderUsed = false;

				// Check imports to see if ContentContainer is imported
				const importDeclarations = node.body.filter(
					(n) => n.type === "ImportDeclaration"
				);

				for (const importDecl of importDeclarations) {
					if (
						importDecl.source.value.includes("components/ui/content-container")
					) {
						const specifiers = importDecl.specifiers || [];

						// Check if ContentContainer is specifically imported
						if (
							specifiers.some(
								(spec) =>
									(spec.imported &&
										spec.imported.name === "ContentContainer") ||
									(spec.local && spec.local.name === "ContentContainer")
							)
						) {
							contentContainerImported = true;
							break;
						}
					}
				}

				// Check if PageHeader is used (to ensure ContentContainer comes after it)
				const sourceCode = context.getSourceCode().getText();
				if (sourceCode.includes("<PageHeader")) {
					pageHeaderUsed = true;
				}

				// Check if ContentContainer is used
				if (sourceCode.includes("<ContentContainer")) {
					contentContainerUsed = true;
				}

				// If ContentContainer is not imported, report an error
				if (!contentContainerImported) {
					context.report({
						node,
						messageId: "missingImport",
						fix(fixer) {
							// Try to find a good position to insert the import
							const lastImport =
								importDeclarations[importDeclarations.length - 1];
							if (lastImport) {
								return fixer.insertTextAfter(
									lastImport,
									"\nimport { ContentContainer } from '../components/ui/content-container';"
								);
							}

							// If no imports, add at the top
							return fixer.insertTextBefore(
								node,
								"import { ContentContainer } from '../components/ui/content-container';\n\n"
							);
						},
					});
				}

				// If ContentContainer is imported but not used, report an error
				if (contentContainerImported && !contentContainerUsed) {
					context.report({
						node,
						messageId: "missingUsage",
					});
				}

				// If PageHeader is used but ContentContainer is not used,
				// that's likely a violation of the pattern (though we can't be 100% sure without AST traversal)
				if (pageHeaderUsed && !contentContainerUsed) {
					context.report({
						node,
						message:
							"When using PageHeader, content should be wrapped in ContentContainer",
					});
				}
			},
		};
	},
};
