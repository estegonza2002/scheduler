/**
 * This script sets up the testing environment for our project
 * It installs the necessary dependencies and creates basic configuration files
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🧪 Setting up testing environment...");

// Install Storybook
console.log("📚 Installing Storybook...");
try {
	execSync("npx storybook@latest init --type react --builder vite", {
		stdio: "inherit",
	});
	console.log("✅ Storybook installed successfully");
} catch (error) {
	console.error("❌ Failed to install Storybook:", error.message);
}

// Install Chromatic for visual regression testing
console.log("🖼️ Installing Chromatic for visual regression testing...");
try {
	execSync("npm install --save-dev chromatic", { stdio: "inherit" });
	console.log("✅ Chromatic installed successfully");
} catch (error) {
	console.error("❌ Failed to install Chromatic:", error.message);
}

// Install axe-core for accessibility testing
console.log("♿ Installing axe-core for accessibility testing...");
try {
	execSync("npm install --save-dev @axe-core/react", { stdio: "inherit" });
	console.log("✅ axe-core installed successfully");
} catch (error) {
	console.error("❌ Failed to install axe-core:", error.message);
}

// Create a script for running visual regression tests
const chromaticScript = `
import { execSync } from 'child_process';

// Get the Chromatic project token from environment variables
const token = process.env.CHROMATIC_PROJECT_TOKEN;

if (!token) {
  console.error('❌ Error: CHROMATIC_PROJECT_TOKEN environment variable is not set');
  console.log('Please set the CHROMATIC_PROJECT_TOKEN environment variable and try again');
  console.log('You can get your project token from https://www.chromatic.com/');
  process.exit(1);
}

// Run Chromatic with the project token
try {
  console.log('🚀 Running visual regression tests with Chromatic...');
  execSync(\`npx chromatic --project-token=\${token}\`, { stdio: 'inherit' });
  console.log('✅ Visual regression tests completed');
} catch (error) {
  console.error('❌ Visual regression tests failed:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync(
	path.join(process.cwd(), "scripts", "run-visual-tests.js"),
	chromaticScript
);
console.log(
	"✅ Created script for running visual regression tests: scripts/run-visual-tests.js"
);

// Create axe-core setup for accessibility testing
const axeSetupScript = `
import React from 'react';
import ReactDOM from 'react-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add the custom matcher to Jest
expect.extend(toHaveNoViolations);

// Create a helper function for accessibility testing in component tests
export async function checkAccessibility(component) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  ReactDOM.render(component, container);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
}
`;

// Create the directory if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), "src", "utils", "test"))) {
	fs.mkdirSync(path.join(process.cwd(), "src", "utils", "test"), {
		recursive: true,
	});
}

fs.writeFileSync(
	path.join(process.cwd(), "src", "utils", "test", "accessibility.js"),
	axeSetupScript
);
console.log(
	"✅ Created accessibility testing helper: src/utils/test/accessibility.js"
);

// Update package.json with new scripts
try {
	const packageJsonPath = path.join(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

	packageJson.scripts = {
		...packageJson.scripts,
		"test:visual": "node scripts/run-visual-tests.js",
		"test:a11y": 'jest --testMatch="**/*.a11y.test.{js,jsx,ts,tsx}"',
		storybook: "storybook dev -p 6006",
		"build-storybook": "storybook build",
	};

	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	console.log("✅ Updated package.json with new test scripts");
} catch (error) {
	console.error("❌ Failed to update package.json:", error.message);
}

console.log("\n🎉 Testing environment setup completed! Next steps:");
console.log("1. Run `npm run storybook` to start Storybook");
console.log("2. Create stories for your components in src/stories");
console.log("3. Create a Chromatic account and get your project token");
console.log("4. Set the CHROMATIC_PROJECT_TOKEN environment variable");
console.log("5. Run `npm run test:visual` to execute visual regression tests");
console.log("6. Run `npm run test:a11y` to run accessibility tests");
