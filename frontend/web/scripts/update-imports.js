#!/usr/bin/env node

/**
 * This script updates imports in all components to use the @/ alias path
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const UI_COMPONENTS_DIR = path.resolve(rootDir, "src/components/ui");
const COMPONENTS_DIR = path.resolve(rootDir, "src/components");
const SRC_DIR = path.resolve(rootDir, "src");

// Update utility imports in UI components
function updateUiComponents() {
	console.log("Updating UI components...");

	// Find all TypeScript/TSX files in the components/ui directory
	const uiFiles = fs
		.readdirSync(UI_COMPONENTS_DIR)
		.filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

	let updatedCount = 0;

	uiFiles.forEach((file) => {
		const filePath = path.join(UI_COMPONENTS_DIR, file);
		let content = fs.readFileSync(filePath, "utf8");

		// Replace relative imports for utils
		const updatedContent = content.replace(
			/from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
			'from "@/lib/utils"'
		);

		if (content !== updatedContent) {
			fs.writeFileSync(filePath, updatedContent);
			updatedCount++;
			console.log(`Updated: ${file}`);
		}
	});

	console.log(`Updated ${updatedCount} UI components`);
}

// Update imports in regular components
function updateRegularComponents() {
	console.log("Updating regular components...");

	// Find all regular component files (not in ui directory)
	const files = execSync(
		'find src/components -name "*.tsx" -o -name "*.ts" | grep -v "ui"',
		{ cwd: rootDir }
	)
		.toString()
		.trim()
		.split("\n");

	let updatedCount = 0;

	files.forEach((filePath) => {
		if (!filePath) return;

		const fullPath = path.resolve(rootDir, filePath);
		let content = fs.readFileSync(fullPath, "utf8");
		let updated = false;

		// Replace relative imports for components
		let updatedContent = content.replace(
			/from\s+["']\.\/ui\/([^"']*)["']/g,
			'from "@/components/ui/$1"'
		);

		// Replace relative imports for lib
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/lib\/([^"']*)["']/g,
			'from "@/lib/$1"'
		);

		// Replace relative imports for api
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/api["']/g,
			'from "@/api"'
		);

		// Replace relative imports for hooks
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/hooks\/([^"']*)["']/g,
			'from "@/hooks/$1"'
		);

		if (content !== updatedContent) {
			fs.writeFileSync(fullPath, updatedContent);
			updatedCount++;
			console.log(`Updated: ${filePath}`);
		}
	});

	console.log(`Updated ${updatedCount} regular components`);
}

// Update imports in other source files (pages, utils, etc.)
function updateOtherSourceFiles() {
	console.log("Updating other source files...");

	// Find all TypeScript/TSX files outside components directory
	const files = execSync(
		'find src -name "*.tsx" -o -name "*.ts" | grep -v "components" | grep -v "node_modules"',
		{ cwd: rootDir }
	)
		.toString()
		.trim()
		.split("\n");

	let updatedCount = 0;

	files.forEach((filePath) => {
		if (!filePath) return;

		const fullPath = path.resolve(rootDir, filePath);
		let content = fs.readFileSync(fullPath, "utf8");
		let updated = false;

		// Replace relative imports for components
		let updatedContent = content.replace(
			/from\s+["']\.\.\/components\/ui\/([^"']*)["']/g,
			'from "@/components/ui/$1"'
		);

		// Replace relative imports for components (non-ui)
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/components\/([^"']*)["']/g,
			'from "@/components/$1"'
		);

		// Replace relative imports for lib
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/lib\/([^"']*)["']/g,
			'from "@/lib/$1"'
		);

		// Replace relative imports for api
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/api["']/g,
			'from "@/api"'
		);

		// Replace relative imports for utils
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/utils\/([^"']*)["']/g,
			'from "@/utils/$1"'
		);

		// Replace relative imports for hooks
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/hooks\/([^"']*)["']/g,
			'from "@/hooks/$1"'
		);

		// Replace relative imports for types
		updatedContent = updatedContent.replace(
			/from\s+["']\.\.\/types\/([^"']*)["']/g,
			'from "@/types/$1"'
		);

		if (content !== updatedContent) {
			fs.writeFileSync(fullPath, updatedContent);
			updatedCount++;
			console.log(`Updated: ${filePath}`);
		}
	});

	console.log(`Updated ${updatedCount} other source files`);
}

// Run the update functions
updateUiComponents();
updateRegularComponents();
updateOtherSourceFiles();

console.log("Import paths updated successfully!");
