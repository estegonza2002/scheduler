/**
 * Rule to enforce PageHeader usage in page components
 *
 * This rule checks if files ending with "Page.tsx" import and use the PageHeader component
 * from our design system.
 */

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
		schema: [], // no options
	},
	create(context) {
		// Only run this rule on page components (files ending with Page.tsx)
		const filename = context.getFilename();
		if (!filename.endsWith("Page.tsx")) {
			return {};
		}

		return {
			Program(node) {
				let pageHeaderImported = false;
				let pageHeaderUsed = false;

				// Check imports to see if PageHeader is imported
				const importDeclarations = node.body.filter(
					(n) => n.type === "ImportDeclaration"
				);

				for (const importDecl of importDeclarations) {
					if (importDecl.source.value.includes("components/ui/page-header")) {
						const specifiers = importDecl.specifiers || [];

						// Check if PageHeader is specifically imported
						if (
							specifiers.some(
								(spec) =>
									(spec.imported && spec.imported.name === "PageHeader") ||
									(spec.local && spec.local.name === "PageHeader")
							)
						) {
							pageHeaderImported = true;
							break;
						}
					}
				}

				// If PageHeader is not imported, report an error
				if (!pageHeaderImported) {
					context.report({
						node,
						message:
							"Page components must import the PageHeader component from the design system",
						fix(fixer) {
							// Try to find a good position to insert the import
							const lastImport =
								importDeclarations[importDeclarations.length - 1];
							if (lastImport) {
								return fixer.insertTextAfter(
									lastImport,
									"\nimport { PageHeader } from '../components/ui/page-header';"
								);
							}

							// If no imports, add at the top
							return fixer.insertTextBefore(
								node,
								"import { PageHeader } from '../components/ui/page-header';\n\n"
							);
						},
					});
				}

				// If PageHeader is imported, check if it's used
				if (pageHeaderImported) {
					// This is a simplistic check - in a real implementation, you would
					// need to use a more sophisticated approach to detect JSX usage
					const sourceCode = context.getSourceCode().getText();
					if (!sourceCode.includes("<PageHeader")) {
						context.report({
							node,
							message:
								"The PageHeader component is imported but not used in this page component",
						});
					}
				}
			},
		};
	},
};
