#!/usr/bin/env node

/**
 * Dialog Header Checker
 *
 * This script scans the codebase for dialog components and checks if they're using
 * the standardized DialogHeader component. It helps identify components that
 * need to be migrated to use the new header pattern.
 *
 * Usage:
 * node scripts/check-dialog-headers.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const COMPONENTS_DIR = path.resolve(__dirname, "../src/components");
const DIALOG_PATTERN = /Dialog(\.tsx|\.jsx)$/;
const OLD_HEADER_PATTERN = /<DialogHeader>[\s\S]*?<\/DialogHeader>/;
const NEW_HEADER_PATTERN = /<DialogHeader[\s\S]*?title=/;

// ANSI color codes for terminal output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
};

// Main function
async function main() {
	console.log(`${colors.cyan}Dialog Header Checker${colors.reset}`);
	console.log(`${colors.cyan}===================${colors.reset}\n`);

	// Get all dialog components
	const dialogComponents = findDialogComponents();

	console.log(`Found ${dialogComponents.length} dialog components\n`);

	// Check each component
	const results = {
		standardized: [],
		needsMigration: [],
		noHeader: [],
	};

	dialogComponents.forEach((file) => {
		const content = fs.readFileSync(file, "utf8");
		const relativePath = path.relative(path.resolve(__dirname, ".."), file);

		if (NEW_HEADER_PATTERN.test(content)) {
			results.standardized.push(relativePath);
		} else if (OLD_HEADER_PATTERN.test(content)) {
			results.needsMigration.push(relativePath);
		} else {
			results.noHeader.push(relativePath);
		}
	});

	// Display results
	console.log(
		`${colors.green}✓ Standardized (${results.standardized.length})${colors.reset}`
	);
	results.standardized.forEach((file) => {
		console.log(`  - ${file}`);
	});

	console.log(
		`\n${colors.yellow}⚠ Needs Migration (${results.needsMigration.length})${colors.reset}`
	);
	results.needsMigration.forEach((file) => {
		console.log(`  - ${file}`);
	});

	console.log(
		`\n${colors.blue}ℹ No Header Found (${results.noHeader.length})${colors.reset}`
	);
	results.noHeader.forEach((file) => {
		console.log(`  - ${file}`);
	});

	// Summary
	console.log(`\n${colors.cyan}Summary${colors.reset}`);
	console.log(`${colors.cyan}=======${colors.reset}`);
	const total = dialogComponents.length;
	const standardizedPercent = Math.round(
		(results.standardized.length / total) * 100
	);

	console.log(`Total Dialog Components: ${total}`);
	console.log(
		`Standardized: ${results.standardized.length} (${standardizedPercent}%)`
	);
	console.log(`Needs Migration: ${results.needsMigration.length}`);
	console.log(`No Header Found: ${results.noHeader.length}`);

	console.log(`\n${colors.cyan}Next Steps${colors.reset}`);
	console.log(`${colors.cyan}==========${colors.reset}`);
	console.log(`1. Refer to the Dialog Migration Guide to update components.`);
	console.log(`2. Focus on the "Needs Migration" components first.`);
	console.log(`3. Run this script again to track your progress.`);
}

// Helper function to find dialog components
function findDialogComponents() {
	const allFiles = [];

	function scanDirectory(dir) {
		const files = fs.readdirSync(dir);

		files.forEach((file) => {
			const filePath = path.join(dir, file);
			const stats = fs.statSync(filePath);

			if (stats.isDirectory()) {
				scanDirectory(filePath);
			} else if (stats.isFile() && DIALOG_PATTERN.test(file)) {
				allFiles.push(filePath);
			}
		});
	}

	scanDirectory(COMPONENTS_DIR);
	return allFiles;
}

// Run the script
main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
