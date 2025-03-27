/**
 * @fileoverview ESLint plugin for enforcing design system standards
 */
"use strict";

module.exports = {
	rules: {
		"enforce-page-header": require("./enforce-page-header"),
		// Add other rules here as they are created
	},
	configs: {
		recommended: {
			plugins: ["design-system"],
			rules: {
				"design-system/enforce-page-header": "error",
				// Add other rules here as they are created
			},
		},
	},
};
