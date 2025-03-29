#!/usr/bin/env node

/**
 * Form Standards Checker
 *
 * This script analyzes form components in the codebase to check for adherence to
 * standardization guidelines. It checks for:
 *
 * 1. Use of shadCN form components
 * 2. Use of FormSection components for logical grouping
 * 3. Accessibility attributes on form elements
 * 4. Use of zod for validation
 * 5. Memoized callbacks with useCallback
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Configuration
const FORM_PATTERNS = [
	"src/components/**/*Form.tsx",
	"src/pages/**/*Form.tsx",
	"src/components/auth/**/*.tsx",
];

// Standards to check
const STANDARDS = {
	SHADCN_COMPONENTS: {
		name: "ShadCN Form Components",
		regex: /FormField|FormItem|FormLabel|FormControl|FormMessage/g,
		required: true,
	},
	FORM_SECTION: {
		name: "FormSection Components",
		regex: /<FormSection/g,
		required: true,
	},
	ARIA_ATTRIBUTES: {
		name: "ARIA Attributes",
		regex: /aria-required|aria-invalid/g,
		required: true,
	},
	ZOD_VALIDATION: {
		name: "Zod Validation",
		regex: /z\.object|zodResolver/g,
		required: true,
	},
	USE_CALLBACK: {
		name: "Memoized Callbacks",
		regex: /useCallback/g,
		required: true,
	},
	TAILWIND_ONLY: {
		name: "Tailwind Only (No Custom CSS)",
		regex: /style=|styled\.|\.css/g,
		required: false,
		negative: true, // This checks for absence of the pattern
	},
};

// Results object
const results = {
	forms: [],
	summary: {
		total: 0,
		passing: 0,
		failing: 0,
	},
};

// Find all form files
const formFiles = FORM_PATTERNS.reduce((files, pattern) => {
	return [...files, ...glob.sync(pattern)];
}, []);

// Analyze each form file
formFiles.forEach((filePath) => {
	const content = fs.readFileSync(filePath, "utf8");
	const fileName = path.basename(filePath);
	const formResult = {
		name: fileName,
		path: filePath,
		checks: {},
		passing: true,
	};

	// Check each standard
	Object.entries(STANDARDS).forEach(([key, standard]) => {
		const matches = content.match(standard.regex) || [];
		const isPassing = standard.negative
			? matches.length === 0
			: matches.length > 0;

		formResult.checks[key] = {
			name: standard.name,
			passing: isPassing,
			required: standard.required,
			count: matches.length,
		};

		// If this is a required standard and it's failing, mark the form as failing
		if (standard.required && !isPassing) {
			formResult.passing = false;
		}
	});

	results.forms.push(formResult);
});

// Calculate summary
results.summary.total = results.forms.length;
results.summary.passing = results.forms.filter((form) => form.passing).length;
results.summary.failing = results.summary.total - results.summary.passing;

// Print results
console.log("\n🔍 Form Standards Check Results\n");

console.log(
	`📊 Summary: ${results.summary.passing}/${results.summary.total} forms passing all required standards`
);
console.log(`✅ Passing: ${results.summary.passing}`);
console.log(`❌ Failing: ${results.summary.failing}`);

console.log("\n📋 Form Details:\n");

results.forms.forEach((form) => {
	const status = form.passing ? "✅" : "❌";
	console.log(`${status} ${form.name} (${form.path})`);

	Object.values(form.checks).forEach((check) => {
		const checkStatus = check.passing ? "✓" : "✗";
		const requiredLabel = check.required ? "[Required]" : "[Optional]";
		console.log(
			`  ${checkStatus} ${check.name} ${requiredLabel} - ${check.count} matches`
		);
	});

	console.log("");
});

// Exit with appropriate code
process.exit(results.summary.failing > 0 ? 1 : 0);
