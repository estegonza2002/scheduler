#!/usr/bin/env node

/**
 * Script to test design system ESLint rules on a specified file
 *
 * Usage:
 *   node scripts/test-design-system-lint.js src/pages/SomePage.tsx
 */

const { ESLint } = require("eslint");
const path = require("path");

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
	console.error("Error: No file path provided");
	console.log(
		"Usage: node scripts/test-design-system-lint.js src/pages/SomePage.tsx"
	);
	process.exit(1);
}

// Resolve the file path
const resolvedFilePath = path.resolve(process.cwd(), filePath);

async function main() {
	console.log(`Testing design system ESLint rules on: ${filePath}\n`);

	const eslint = new ESLint({
		overrideConfigFile: path.resolve(
			__dirname,
			"../.eslintrc.design-system.js"
		),
		useEslintrc: false,
	});

	try {
		const results = await eslint.lintFiles([resolvedFilePath]);

		let designSystemIssuesFound = false;

		results.forEach((result) => {
			console.log(`\nFile: ${result.filePath}`);

			// Filter for design-system rules
			const designSystemMessages = result.messages.filter(
				(msg) => msg.ruleId && msg.ruleId.startsWith("design-system/")
			);

			if (designSystemMessages.length === 0) {
				console.log("✅ No design system issues found!");
			} else {
				designSystemIssuesFound = true;
				console.log(
					`⚠️ Found ${designSystemMessages.length} design system issues:`
				);

				designSystemMessages.forEach((message) => {
					console.log(
						`\x1b[33m[${message.ruleId}] Line ${message.line}:${message.column}: ${message.message}\x1b[0m`
					);
				});
			}

			// Show other ESLint issues
			const otherMessages = result.messages.filter(
				(msg) => !msg.ruleId || !msg.ruleId.startsWith("design-system/")
			);

			if (otherMessages.length > 0) {
				console.log(`\nOther ESLint issues (${otherMessages.length}):`);
				otherMessages.forEach((message) => {
					console.log(
						`[${message.ruleId}] Line ${message.line}:${message.column}: ${message.message}`
					);
				});
			}
		});

		if (designSystemIssuesFound) {
			console.log("\n⚠️ Design system issues detected!");
		} else {
			console.log("\n✅ All design system rules passed!");
		}
	} catch (error) {
		console.error("Error running ESLint:", error);
		process.exit(1);
	}
}

main();
