/**
 * Design System ESLint Plugin
 *
 * This plugin provides rules to enforce design system standards in the codebase.
 */

// Rules
const enforcePageHeader = require("./rules/enforce-page-header");
// HeaderContentSpacing component removed - rule no longer needed
const preventDirectCard = require("./rules/prevent-direct-card");
const enforceFormSection = require("./rules/enforce-form-section");
const enforceCardGridSection = require("./rules/enforce-card-grid-section");
const enforceContentContainer = require("./rules/enforce-content-container");

module.exports = {
	rules: {
		"enforce-page-header": enforcePageHeader,
		// "enforce-header-content-spacing": enforceHeaderContentSpacing, // Component removed
		"prevent-direct-card": preventDirectCard,
		"enforce-form-section": enforceFormSection,
		"enforce-card-grid-section": enforceCardGridSection,
		"enforce-content-container": enforceContentContainer,
	},
	configs: {
		recommended: {
			plugins: ["design-system"],
			rules: {
				"design-system/enforce-page-header": "error",
				// "design-system/enforce-header-content-spacing": "error", // Component removed
				"design-system/prevent-direct-card": "warn",
				"design-system/enforce-form-section": "warn",
				"design-system/enforce-card-grid-section": "warn",
				"design-system/enforce-content-container": "warn",
			},
		},
	},
};
