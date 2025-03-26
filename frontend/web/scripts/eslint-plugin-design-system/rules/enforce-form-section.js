/**
 * Rule to enforce FormSection usage in forms
 *
 * This rule checks if form elements are properly grouped using FormSection components
 * according to the design system pattern.
 */

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Enforce FormSection usage for form field grouping",
			category: "Design System",
			recommended: true,
		},
		fixable: null, // Not automatically fixable
		schema: [], // no options
	},
	create(context) {
		// Skip if not a form component
		const filename = context.getFilename();
		if (!filename.match(/Form\.tsx$|form\.tsx$/i)) {
			return {};
		}

		// Track if FormSection and Form are imported
		let formSectionImported = false;
		let formImported = false;

		return {
			ImportDeclaration(node) {
				// Check if FormSection is imported
				if (node.source.value.includes("ui/form-section")) {
					const specifiers = node.specifiers || [];
					if (
						specifiers.some(
							(spec) =>
								(spec.imported && spec.imported.name === "FormSection") ||
								(spec.local && spec.local.name === "FormSection")
						)
					) {
						formSectionImported = true;
					}
				}

				// Check if Form is imported
				if (node.source.value.includes("ui/form")) {
					const specifiers = node.specifiers || [];
					if (
						specifiers.some(
							(spec) =>
								(spec.imported && spec.imported.name === "Form") ||
								(spec.local && spec.local.name === "Form")
						)
					) {
						formImported = true;
					}
				}
			},

			// Look for Form usage in the component
			JSXOpeningElement(node) {
				// Only proceed if Form is imported but FormSection isn't used properly
				if (!formImported) return;

				if (node.name.name === "form" || node.name.name === "Form") {
					// Check if there's any FormSection within this form
					let hasFormSection = false;
					const sourceCode = context.getSourceCode().getText();

					// Find the opening form tag position
					const formPos = node.range[0];

					// Find the closing form tag
					const formCloseMatch = sourceCode
						.substring(formPos)
						.match(/<\/form>|<\/Form>/i);
					if (!formCloseMatch) return; // Can't find closing tag

					const formClosePos = formPos + formCloseMatch.index;

					// Look for FormSection within the form tags
					const formSectionRegex = /<FormSection/g;
					let match;
					let formSectionCount = 0;

					const formContent = sourceCode.substring(formPos, formClosePos);
					while ((match = formSectionRegex.exec(formContent)) !== null) {
						formSectionCount++;
					}

					if (formSectionCount === 0 && !hasFormSection) {
						context.report({
							node,
							message:
								"Form fields should be grouped using FormSection components according to the design system",
						});
					}
				}
			},
		};
	},
};
