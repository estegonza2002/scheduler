/**
 * Script to test the enforce-content-container ESLint rule
 */

const { ESLint } = require("eslint");
const path = require("path");

// Path to test file
const TEST_FILE = path.resolve(
	__dirname,
	"test-files",
	"ContentContainerTest.tsx"
);

async function main() {
	console.log("Testing enforce-content-container ESLint rule...\n");

	const eslint = new ESLint({
		overrideConfigFile: path.resolve(
			__dirname,
			"../.eslintrc.design-system.js"
		),
		useEslintrc: false,
	});

	console.log(`Running ESLint on ${TEST_FILE}`);
	const results = await eslint.lintFiles([TEST_FILE]);

	let foundRule = false;

	results.forEach((result) => {
		console.log(`\nFile: ${result.filePath}`);

		if (result.messages.length === 0) {
			console.log("No issues found!");
		} else {
			console.log("Issues found:");

			result.messages.forEach((message) => {
				if (message.ruleId?.includes("enforce-content-container")) {
					foundRule = true;
					console.log(
						`\x1b[33m[${message.ruleId}] Line ${message.line}:${message.column}: ${message.message}\x1b[0m`
					);
				} else {
					console.log(
						`[${message.ruleId}] Line ${message.line}:${message.column}: ${message.message}`
					);
				}
			});
		}
	});

	if (foundRule) {
		console.log(
			"\n\x1b[32m✓ enforce-content-container rule is working correctly!\x1b[0m"
		);
	} else {
		console.log(
			"\n\x1b[31m✗ enforce-content-container rule did not trigger as expected!\x1b[0m"
		);
	}
}

main().catch((error) => {
	console.error("Error running ESLint test:", error);
	process.exit(1);
});
