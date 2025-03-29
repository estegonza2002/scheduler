/**
 * Script to check for pages still using the old PageHeader component
 * Run with: node scripts/check-page-header.js
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to search
const pagesDir = path.join(__dirname, "../src/pages");

// Pages to check
const pages = fs
	.readdirSync(pagesDir)
	.filter((file) => file.endsWith(".tsx") || file.endsWith(".jsx"))
	.map((file) => path.join(pagesDir, file));

// Check if a file imports PageHeader
function checkFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, content) => {
			if (err) {
				reject(err);
				return;
			}

			const fileName = path.basename(filePath);
			const importsPageHeader =
				content.includes("import { PageHeader }") ||
				content.includes("import {PageHeader}");

			const usesPageHeader = content.includes("<PageHeader");

			if (importsPageHeader && usesPageHeader) {
				resolve({
					fileName,
					filePath,
					status: "NEEDS_MIGRATION",
					message: "Imports and uses PageHeader component",
				});
			} else if (importsPageHeader) {
				resolve({
					fileName,
					filePath,
					status: "NEEDS_CLEANUP",
					message: "Imports PageHeader but does not appear to use it",
				});
			} else {
				resolve({
					fileName,
					filePath,
					status: "OK",
					message: "Does not import PageHeader",
				});
			}
		});
	});
}

// Main function
async function checkPages() {
	console.log("Checking pages for use of deprecated PageHeader component...\n");

	try {
		const results = await Promise.all(pages.map((page) => checkFile(page)));

		const needsMigration = results.filter(
			(r) => r.status === "NEEDS_MIGRATION"
		);
		const needsCleanup = results.filter((r) => r.status === "NEEDS_CLEANUP");
		const ok = results.filter((r) => r.status === "OK");

		console.log(`\n=== Header Migration Status ===`);
		console.log(`Total pages: ${results.length}`);
		console.log(`Pages already migrated: ${ok.length}`);
		console.log(`Pages needing migration: ${needsMigration.length}`);
		console.log(`Pages needing cleanup: ${needsCleanup.length}\n`);

		if (needsMigration.length > 0) {
			console.log("=== Pages needing migration (still using PageHeader) ===");
			needsMigration.forEach((r) => {
				console.log(`- ${r.fileName}`);
			});
			console.log("");
		}

		if (needsCleanup.length > 0) {
			console.log(
				"=== Pages needing cleanup (importing but not using PageHeader) ==="
			);
			needsCleanup.forEach((r) => {
				console.log(`- ${r.fileName}`);
			});
			console.log("");
		}

		console.log("For each page needing migration, please:");
		console.log(
			'1. Remove import { PageHeader } from "@/components/ui/page-header"'
		);
		console.log(
			'2. Add useHeader hook: import { useHeader } from "@/lib/header-context"'
		);
		console.log(
			"3. Replace PageHeader component with useHeader() hook (see migration guide)\n"
		);

		// Update the global-header-checklist.md
		console.log(
			"You can add this information to the global-header-checklist.md file"
		);
	} catch (error) {
		console.error("Error checking pages:", error);
	}
}

checkPages();
