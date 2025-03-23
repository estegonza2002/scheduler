#!/usr/bin/env node

/**
 * CSS Audit Script
 *
 * This script scans the web app codebase to identify areas where custom CSS
 * or non-ShadCN component styling is being used.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const srcDir = path.join(__dirname, "../src");
const reportFile = path.join(__dirname, "../css-audit-report.md");
const componentsDir = path.join(srcDir, "components");

// Patterns to search for
const patterns = {
	inlineStyles: /style=\{.*?\}/g,
	cssImports: /import ['"].*\.css['"]/g,
	styleTagUsage: /<style[\s\S]*?<\/style>/g,
	styledComponents: /styled\.[a-zA-Z0-9]+(`.+?`)/gs,
	nonTailwindClasses:
		/className=["']((?!.*tw-)(?!.*flex-)(?!.*grid-)(?!.*bg-)(?!.*text-)(?!.*p-)(?!.*m-)(?!.*border-)(?!.*rounded-).*?)["']/g,
};

// Known ShadCN components
const shadcnComponents = [
	"Alert",
	"AlertDialog",
	"Avatar",
	"Badge",
	"Button",
	"Calendar",
	"Card",
	"Checkbox",
	"Collapsible",
	"Command",
	"Dialog",
	"DropdownMenu",
	"Form",
	"Input",
	"Label",
	"Popover",
	"ScrollArea",
	"Select",
	"Separator",
	"Sheet",
	"Skeleton",
	"Slider",
	"Switch",
	"Table",
	"Tabs",
	"Textarea",
	"Toast",
	"Tooltip",
];

// Initialize report
let report = `# CSS Audit Report\n\n`;
report += `Generated on: ${new Date().toLocaleString()}\n\n`;
report += `## Summary\n\n`;
report += `- [ ] All components use ShadCN UI components\n`;
report += `- [ ] No inline styles detected\n`;
report += `- [ ] No custom CSS imports\n`;
report += `- [ ] No styled-components usage\n`;
report += `- [ ] All classNames use Tailwind classes\n\n`;

// Track issues
const issues = {
	inlineStyles: [],
	cssImports: [],
	styleTagUsage: [],
	styledComponents: [],
	nonTailwindClasses: [],
	missingShadCNComponents: [],
};

/**
 * Scans a file for pattern matches
 */
async function scanFile(filePath, pattern, issueType) {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		const matches = content.match(pattern);

		if (matches && matches.length > 0) {
			issues[issueType].push({
				file: filePath,
				matches: matches,
				count: matches.length,
			});
		}
	} catch (error) {
		console.error(`Error scanning ${filePath}:`, error);
	}
}

/**
 * Recursively walk directory to find files
 */
function walkDir(dir, callback) {
	fs.readdirSync(dir).forEach((f) => {
		let dirPath = path.join(dir, f);
		let isDirectory = fs.statSync(dirPath).isDirectory();

		if (isDirectory) {
			walkDir(dirPath, callback);
		} else {
			callback(path.join(dir, f));
		}
	});
}

/**
 * Check if file is using ShadCN components
 */
async function checkComponentUsage(filePath) {
	try {
		const content = fs.readFileSync(filePath, "utf8");

		// Check if this is a component file
		if (
			path.extname(filePath) === ".tsx" &&
			!filePath.includes("/ui/") &&
			!filePath.includes("node_modules")
		) {
			// Check if component uses ShadCN components
			const isUsingShadCN = shadcnComponents.some((comp) => {
				return (
					content.includes(`from "@/components/ui/${comp.toLowerCase()}"`) ||
					content.includes(`import { ${comp}`) ||
					content.includes(`<${comp}`) ||
					content.includes(`<${comp.charAt(0).toLowerCase() + comp.slice(1)}`)
				);
			});

			if (!isUsingShadCN) {
				issues.missingShadCNComponents.push({
					file: filePath,
				});
			}
		}
	} catch (error) {
		console.error(`Error checking components in ${filePath}:`, error);
	}
}

/**
 * Main execution function
 */
async function main() {
	console.log("Starting CSS audit...");

	// Scan all component files
	walkDir(srcDir, (filePath) => {
		if (
			path.extname(filePath) === ".tsx" ||
			path.extname(filePath) === ".jsx"
		) {
			// Skip node_modules
			if (filePath.includes("node_modules")) return;

			scanFile(filePath, patterns.inlineStyles, "inlineStyles");
			scanFile(filePath, patterns.cssImports, "cssImports");
			scanFile(filePath, patterns.styleTagUsage, "styleTagUsage");
			scanFile(filePath, patterns.styledComponents, "styledComponents");
			scanFile(filePath, patterns.nonTailwindClasses, "nonTailwindClasses");
			checkComponentUsage(filePath);
		}
	});

	// Generate detailed report
	report += `## Issues Found\n\n`;

	// Report inline styles
	report += `### Inline Styles (${issues.inlineStyles.length} files)\n\n`;
	if (issues.inlineStyles.length === 0) {
		report += `✅ No inline styles detected\n\n`;
	} else {
		issues.inlineStyles.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")} (${
				issue.count
			} instances)\n`;
			issue.matches.slice(0, 3).forEach((match) => {
				report += `  - \`${match.substring(0, 100)}${
					match.length > 100 ? "..." : ""
				}\`\n`;
			});
			if (issue.matches.length > 3) {
				report += `  - and ${issue.matches.length - 3} more...\n`;
			}
			report += "\n";
		});
	}

	// Report CSS imports
	report += `### CSS Imports (${issues.cssImports.length} files)\n\n`;
	if (issues.cssImports.length === 0) {
		report += `✅ No CSS imports detected\n\n`;
	} else {
		issues.cssImports.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")} (${
				issue.count
			} imports)\n`;
			issue.matches.forEach((match) => {
				report += `  - \`${match}\`\n`;
			});
			report += "\n";
		});
	}

	// Report style tags
	report += `### Style Tags (${issues.styleTagUsage.length} files)\n\n`;
	if (issues.styleTagUsage.length === 0) {
		report += `✅ No style tags detected\n\n`;
	} else {
		issues.styleTagUsage.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")} (${
				issue.count
			} style tags)\n\n`;
		});
	}

	// Report styled-components
	report += `### Styled Components (${issues.styledComponents.length} files)\n\n`;
	if (issues.styledComponents.length === 0) {
		report += `✅ No styled-components usage detected\n\n`;
	} else {
		issues.styledComponents.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")} (${
				issue.count
			} instances)\n\n`;
		});
	}

	// Report non-Tailwind classes
	report += `### Non-Tailwind Classes (${issues.nonTailwindClasses.length} files)\n\n`;
	if (issues.nonTailwindClasses.length === 0) {
		report += `✅ All classNames use Tailwind\n\n`;
	} else {
		issues.nonTailwindClasses.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")} (${
				issue.count
			} instances)\n`;
			issue.matches.slice(0, 3).forEach((match) => {
				report += `  - \`${match}\`\n`;
			});
			if (issue.matches.length > 3) {
				report += `  - and ${issue.matches.length - 3} more...\n`;
			}
			report += "\n";
		});
	}

	// Report missing ShadCN components
	report += `### Components Not Using ShadCN (${issues.missingShadCNComponents.length} files)\n\n`;
	if (issues.missingShadCNComponents.length === 0) {
		report += `✅ All components use ShadCN UI\n\n`;
	} else {
		issues.missingShadCNComponents.forEach((issue) => {
			report += `- [ ] ${issue.file.replace(srcDir, "src")}\n`;
		});
		report += "\n";
	}

	// Add recommendations
	report += `## Recommendations\n\n`;
	report += `1. Replace inline styles with Tailwind utility classes\n`;
	report += `2. Remove custom CSS imports and migrate to Tailwind\n`;
	report += `3. Use ShadCN UI components for all UI elements\n`;
	report += `4. Refactor custom component styles to use Tailwind\n`;

	// Write report to file
	fs.writeFileSync(reportFile, report);
	console.log(`Audit complete! Report saved to ${reportFile}`);
}

main().catch(console.error);
