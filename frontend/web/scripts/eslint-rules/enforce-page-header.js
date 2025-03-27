/**
 * @fileoverview ESLint rule to ensure PageHeader component is used at the top level of page components
 */
"use strict";

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
		schema: [], // no options
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

	create(context) {
		// Track state
		let pageHeaderImported = false;
		let pageHeaderImportPath = null;
		let pageHeaderUsed = false;
		let pageHeaderHasTitle = false;
		let pageHeaderAtTopLevel = false;

		// Helper to check if this is a page component file
		const isPageComponent = () => {
			const filename = context.getFilename();
			return filename.endsWith("Page.tsx") || filename.endsWith("Page.jsx");
		};

		return {
			// Only process Page components
			Program(node) {
				if (!isPageComponent()) return;
			},

			// Check imports
			ImportDeclaration(node) {
				if (!isPageComponent()) return;

				// Check if PageHeader is imported
				const importSource = node.source.value;

				if (importSource.includes("page-header")) {
					// Found potential import - check specifiers
					for (const specifier of node.specifiers) {
						if (
							specifier.type === "ImportSpecifier" &&
							specifier.imported &&
							specifier.imported.name === "PageHeader"
						) {
							pageHeaderImported = true;
							pageHeaderImportPath = importSource;
							break;
						}
					}
				}
			},

			// Check JSX elements for PageHeader usage
			JSXOpeningElement(node) {
				if (!isPageComponent()) return;

				// Look for PageHeader component
				if (
					node.name.type === "JSXIdentifier" &&
					node.name.name === "PageHeader"
				) {
					pageHeaderUsed = true;

					// Check if title prop is provided
					const titleProp = node.attributes.find(
						(attr) => attr.type === "JSXAttribute" && attr.name.name === "title"
					);

					pageHeaderHasTitle = !!titleProp;

					// Check if PageHeader is used at top level
					// This is simplistic - we consider it top level if it's directly under a fragment or return
					const ancestors = context.getAncestors();
					const jsxParent = ancestors[ancestors.length - 2]; // Parent of current JSX element

					if (
						jsxParent &&
						(jsxParent.type === "JSXFragment" ||
							jsxParent.type === "ReturnStatement" ||
							(jsxParent.type === "JSXElement" &&
								jsxParent.openingElement.name.name === "Fragment"))
					) {
						pageHeaderAtTopLevel = true;
					}
				}
			},

			// Final check at the end of program
			"Program:exit"(node) {
				if (!isPageComponent()) return;

				// Report missing import
				if (!pageHeaderImported) {
					context.report({
						node,
						messageId: "missingImport",
						fix(fixer) {
							// Add import at the top of the file
							return fixer.insertTextAfterRange(
								[0, 0],
								'import { PageHeader } from "../components/ui/page-header";\n'
							);
						},
					});
				}

				// Report missing usage
				if (pageHeaderImported && !pageHeaderUsed) {
					// Find return statement in component function
					const returnStatements = [];
					const findReturnStatements = (node) => {
						if (node.type === "ReturnStatement") {
							returnStatements.push(node);
						}

						// Recursively search child nodes
						for (const key in node) {
							if (typeof node[key] === "object" && node[key] !== null) {
								if (Array.isArray(node[key])) {
									node[key].forEach((child) => {
										if (child && typeof child === "object") {
											findReturnStatements(child);
										}
									});
								} else if (typeof node[key] === "object") {
									findReturnStatements(node[key]);
								}
							}
						}
					};

					findReturnStatements(node);

					if (returnStatements.length > 0) {
						// Report on the first return statement
						context.report({
							node: returnStatements[0],
							messageId: "missingUsage",
							// We don't attempt to fix this automatically as it's complex to insert at the right position
						});
					} else {
						// If we can't find a return statement, report on the whole program
						context.report({
							node,
							messageId: "missingUsage",
						});
					}
				}

				// Report PageHeader without title prop
				if (pageHeaderUsed && !pageHeaderHasTitle) {
					context.report({
						node,
						messageId: "incorrectUsage",
					});
				}

				// Report PageHeader not at top level
				if (pageHeaderUsed && !pageHeaderAtTopLevel) {
					context.report({
						node,
						messageId: "pageHeaderPosition",
					});
				}
			},
		};
	},
};
