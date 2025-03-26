/**
 * Rule to prevent direct Card usage without ContentSection
 *
 * This rule checks if Card components are used directly in page components
 * without being wrapped in ContentSection, which is against the design system pattern.
 */

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Prevent direct Card usage without ContentSection wrapper",
			category: "Design System",
			recommended: true,
		},
		fixable: null, // Not automatically fixable
		schema: [], // no options
	},
	create(context) {
		// Only run this rule on page components and other relevant components
		const filename = context.getFilename();
		if (!filename.match(/Page\.tsx$|\.tsx$/)) {
			return {};
		}

		// Track if Card and ContentSection are imported
		let cardImported = false;
		let contentSectionImported = false;

		return {
			ImportDeclaration(node) {
				// Check if Card is imported
				if (node.source.value.includes("ui/card")) {
					const specifiers = node.specifiers || [];
					if (
						specifiers.some(
							(spec) =>
								(spec.imported && spec.imported.name === "Card") ||
								(spec.local && spec.local.name === "Card")
						)
					) {
						cardImported = true;
					}
				}

				// Check if ContentSection is imported
				if (node.source.value.includes("ui/content-section")) {
					const specifiers = node.specifiers || [];
					if (
						specifiers.some(
							(spec) =>
								(spec.imported && spec.imported.name === "ContentSection") ||
								(spec.local && spec.local.name === "ContentSection")
						)
					) {
						contentSectionImported = true;
					}
				}
			},

			// Look for JSX Card elements
			JSXOpeningElement(node) {
				// Only proceed if Card is imported and ContentSection is not used
				if (!cardImported) return;

				const cardElementName = node.name.name;
				if (cardElementName === "Card") {
					// Check if this Card is a direct child of return statement or another element
					// but not inside a ContentSection

					// Get the parent JSX element or expression
					let parent = context
						.getAncestors()
						.reverse()
						.find(
							(node) =>
								node.type === "JSXElement" ||
								node.type === "ReturnStatement" ||
								node.type === "JSXExpressionContainer"
						);

					// Check if we're in a ContentSection
					let inContentSection = false;
					const sourceCode = context.getSourceCode().getText();

					// Simple check for Card being used inside ContentSection
					// This is a simplistic approach - a real implementation would traverse the AST
					// to find the exact parent-child relationships

					// Get the position of this Card element in the source
					const cardPos = node.range[0];

					// Find the closest ContentSection opening tag before this position
					const contentSectionMatches = sourceCode
						.substring(0, cardPos)
						.match(/<ContentSection[^>]*>/g);

					if (contentSectionMatches) {
						const lastContentSectionTag =
							contentSectionMatches[contentSectionMatches.length - 1];
						const contentSectionPos = sourceCode.lastIndexOf(
							lastContentSectionTag,
							cardPos
						);

						// Find the closest ContentSection closing tag
						const contentSectionClosePos = sourceCode.indexOf(
							"</ContentSection>",
							cardPos
						);

						// If there's an opening ContentSection before this Card and a closing tag after,
						// then this Card is likely inside a ContentSection
						if (contentSectionPos !== -1 && contentSectionClosePos !== -1) {
							inContentSection = true;
						}
					}

					if (!inContentSection) {
						context.report({
							node,
							message:
								"Card components should be wrapped in ContentSection according to the design system",
						});
					}
				}
			},
		};
	},
};
