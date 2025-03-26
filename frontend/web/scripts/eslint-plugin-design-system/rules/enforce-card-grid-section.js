/**
 * Rule to enforce ContentSection usage for card grids
 *
 * This rule checks if card grid layouts are properly wrapped in ContentSection components
 * according to the design system pattern.
 */

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Enforce ContentSection usage for card grid layouts",
			category: "Design System",
			recommended: true,
		},
		fixable: null, // Not automatically fixable
		schema: [], // no options
	},
	create(context) {
		// Track if ContentSection is imported
		let contentSectionImported = false;

		return {
			ImportDeclaration(node) {
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

			// Look for grid/card layouts
			JSXElement(node) {
				// Only proceed if ContentSection is imported
				if (!contentSectionImported) return;

				// Check for grid container
				if (
					node.openingElement &&
					node.openingElement.name &&
					node.openingElement.name.name === "div"
				) {
					// Check if this div has a grid class
					const classNameAttribute = node.openingElement.attributes.find(
						(attr) => attr.name && attr.name.name === "className"
					);

					if (
						classNameAttribute &&
						classNameAttribute.value &&
						classNameAttribute.value.value &&
						typeof classNameAttribute.value.value === "string" &&
						(classNameAttribute.value.value.includes("grid-cols") ||
							classNameAttribute.value.value.includes("grid grid-cols"))
					) {
						// This is a grid layout, check if it contains Card components
						const hasCards = findCards(node);

						if (hasCards) {
							// Check if this grid is inside a ContentSection
							const insideContentSection = isInsideContentSection(node);

							if (!insideContentSection) {
								context.report({
									node: node.openingElement,
									message:
										"Card grid layouts should be wrapped in ContentSection components according to the design system",
								});
							}
						}
					}
				}
			},
		};
	},
};

// Helper function to check if a node contains Card components
function findCards(node) {
	if (!node.children) return false;

	for (const child of node.children) {
		// Direct Card component
		if (
			child.openingElement &&
			child.openingElement.name &&
			child.openingElement.name.name === "Card"
		) {
			return true;
		}

		// Check for mapped Card components with JSXExpressionContainer
		if (
			child.type === "JSXExpressionContainer" &&
			child.expression &&
			child.expression.type === "CallExpression" &&
			child.expression.callee &&
			child.expression.callee.property &&
			child.expression.callee.property.name === "map"
		) {
			// Look for 'Card' in the map function body
			const mapBody = child.expression.arguments[0];
			if (mapBody && mapBody.body) {
				const bodyText = JSON.stringify(mapBody.body);
				if (bodyText.includes("Card")) {
					return true;
				}
			}
		}

		// Recursive check for nested elements
		if (child.children && findCards(child)) {
			return true;
		}
	}

	return false;
}

// Helper function to check if a node is inside a ContentSection component
function isInsideContentSection(node) {
	let current = node.parent;
	while (current) {
		if (
			current.openingElement &&
			current.openingElement.name &&
			current.openingElement.name.name === "ContentSection"
		) {
			return true;
		}
		current = current.parent;
	}
	return false;
}
