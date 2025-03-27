module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	plugins: ["design-system"],
	rules: {
		"design-system/enforce-page-header": "error",
		"design-system/prevent-direct-card": "warn",
		"design-system/enforce-form-section": "warn",
		"design-system/enforce-card-grid-section": "warn",
		"design-system/enforce-content-container": "warn",
	},
	overrides: [
		{
			// Only apply design system rules to page components
			files: ["**/src/**/*Page.tsx"],
			rules: {
				"design-system/enforce-page-header": "error",
				"design-system/enforce-content-container": "warn",
			},
		},
		{
			// Rules for all components
			files: ["**/src/**/*.tsx"],
			rules: {
				"design-system/prevent-direct-card": "warn",
				"design-system/enforce-form-section": "warn",
				"design-system/enforce-card-grid-section": "warn",
			},
		},
		{
			// Rules specifically for form components
			files: ["**/src/**/*Form.tsx"],
			rules: {
				"design-system/enforce-form-section": "warn",
			},
		},
		// Only apply to TypeScript React files
		{
			files: ["*.tsx"],
			rules: {
				"design-system/enforce-page-header": "error",
			},
		},
	],
};
