/**
 * @fileoverview Rule to enforce proper Card component structure
 * @author Design System Team
 */

"use strict";

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Enforce proper Card component structure",
			category: "Design System",
			recommended: true,
		},
		fixable: "code",
		schema: [],
	},
	create(context) {
		return {
			JSXElement(node) {
				// Check if element is a Card
				if (
					node.openingElement.name &&
					node.openingElement.name.name === "Card"
				) {
					const children = node.children.filter(
						(child) => child.type === "JSXElement"
					);

					// Check for CardHeader, CardContent
					const hasCardHeader = children.some(
						(child) =>
							child.openingElement.name &&
							child.openingElement.name.name === "CardHeader"
					);

					const hasCardContent = children.some(
						(child) =>
							child.openingElement.name &&
							child.openingElement.name.name === "CardContent"
					);

					if (!hasCardHeader && !hasCardContent) {
						context.report({
							node,
							message:
								"Card component should include CardHeader and/or CardContent",
						});
					}
				}

				// Check for div that might be a card
				if (
					node.openingElement.name &&
					node.openingElement.name.name === "div"
				) {
					const classNameAttr = node.openingElement.attributes.find(
						(attr) => attr.name && attr.name.name === "className"
					);

					if (classNameAttr && classNameAttr.value) {
						const className = classNameAttr.value.value;

						// Check if this div has card-like styling
						if (
							className &&
							/\b(rounded|border|shadow).*\b(rounded|border|shadow)/i.test(
								className
							)
						) {
							context.report({
								node,
								message: "Consider using Card component instead of styled div",
								fix(fixer) {
									// This is a simplistic fix example - in real implementation,
									// the fix would need to be more sophisticated
									return fixer.replaceText(node.openingElement.name, "Card");
								},
							});
						}
					}
				}
			},
		};
	},
};
