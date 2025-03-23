/**
 * Browser Compatibility Testing Script
 * This script helps generate a checklist for manual browser testing
 */

import fs from "fs";
import path from "path";

// Components to test across browsers
const componentsToTest = [
	{ name: "Button", path: "src/components/ui/button.tsx", priority: "High" },
	{ name: "Card", path: "src/components/ui/card.tsx", priority: "High" },
	{ name: "Input", path: "src/components/ui/input.tsx", priority: "High" },
	{ name: "Select", path: "src/components/ui/select.tsx", priority: "High" },
	{ name: "Dialog", path: "src/components/ui/dialog.tsx", priority: "Medium" },
	{
		name: "Checkbox",
		path: "src/components/ui/checkbox.tsx",
		priority: "Medium",
	},
	{
		name: "Tooltip",
		path: "src/components/ui/tooltip.tsx",
		priority: "Medium",
	},
	{ name: "Table", path: "src/components/ui/table.tsx", priority: "Low" },
];

// Pages to test across browsers
const pagesToTest = [
	{ name: "Login Page", path: "src/pages/LoginPage.tsx", priority: "High" },
	{ name: "SignUp Page", path: "src/pages/SignUpPage.tsx", priority: "High" },
	{
		name: "Dashboard Page",
		path: "src/pages/DashboardPage.tsx",
		priority: "High",
	},
	{
		name: "Shift Details Page",
		path: "src/pages/ShiftDetailsPage.tsx",
		priority: "High",
	},
];

// Browsers to test on
const browsers = [
	"Chrome latest",
	"Firefox latest",
	"Safari latest",
	"Edge latest",
	"Mobile Safari (iOS)",
	"Chrome for Android",
];

// Features to test
const features = [
	"Visual appearance matches design",
	"Hover states work correctly",
	"Focus states are visible",
	"Transitions and animations work",
	"Responsive layout behaves correctly",
	"Text rendering is consistent",
	"Interactive elements work as expected",
];

// Generate the browser compatibility testing checklist
function generateChecklist() {
	let markdown = `# Browser Compatibility Testing Checklist

## Overview

This checklist is for testing ShadCN components across different browsers to ensure consistent appearance and functionality.

## Testing Matrix

Use the following table to track testing progress for each component across browsers:

`;

	// Component section
	markdown += `## Components\n\n`;

	for (const component of componentsToTest) {
		markdown += `### ${component.name} (${component.priority} Priority)\n\n`;
		markdown += "| Browser | Visual | Interactive | Notes |\n";
		markdown += "| ------- | ------ | ----------- | ----- |\n";

		for (const browser of browsers) {
			markdown += `| ${browser} | □ | □ | |\n`;
		}

		markdown += "\n";
	}

	// Pages section
	markdown += `## Pages\n\n`;

	for (const page of pagesToTest) {
		markdown += `### ${page.name} (${page.priority} Priority)\n\n`;
		markdown += "| Browser | Layout | Functionality | Notes |\n";
		markdown += "| ------- | ------ | ------------ | ----- |\n";

		for (const browser of browsers) {
			markdown += `| ${browser} | □ | □ | |\n`;
		}

		markdown += "\n";
	}

	// Common issues section
	markdown += `## Common Issues to Watch For

- Inconsistent border radius
- Font rendering differences
- Shadow/depth perception
- Color inconsistencies
- Animation timing differences
- Focus state visibility
- Scrollbar appearance and behavior

## Test Environment Setup

1. Install the browsers listed above
2. For mobile testing, use either:
   - Physical devices (preferred)
   - Browser DevTools mobile emulation
   - BrowserStack or similar services

## Testing Instructions

For each component and browser combination:

1. Check visual appearance against reference design
2. Test all interactive states (hover, focus, active, disabled)
3. Verify that all animations and transitions work correctly
4. Test keyboard navigation
5. Check responsive behavior at different viewport sizes
6. Note any inconsistencies in the table

## Reference Screenshots

Store reference screenshots in the \`/docs/browser-testing/screenshots\` directory.
`;

	return markdown;
}

// Write the checklist to a file
const checklist = generateChecklist();
const outputDir = path.join(process.cwd(), "docs", "browser-testing");

// Create the directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
	path.join(outputDir, "browser-compatibility-checklist.md"),
	checklist
);
console.log(
	"✅ Browser compatibility testing checklist generated at docs/browser-testing/browser-compatibility-checklist.md"
);

// Create screenshot directory
const screenshotDir = path.join(outputDir, "screenshots");
if (!fs.existsSync(screenshotDir)) {
	fs.mkdirSync(screenshotDir, { recursive: true });
}

console.log(
	"✅ Screenshot directory created at docs/browser-testing/screenshots"
);
console.log("\n🔍 Next steps:");
console.log("1. Run your application in different browsers");
console.log("2. Take screenshots of each component in each browser");
console.log("3. Complete the checklist for each component/browser combination");
console.log("4. Document any issues found and prioritize fixes");
