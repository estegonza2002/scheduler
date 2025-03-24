import fs from "fs";
import { execSync } from "child_process";

// Get the list of files with unused imports/variables from ESLint
const output = execSync("npx eslint . --ext ts,tsx --format json", {
	encoding: "utf8",
});
const results = JSON.parse(output);

// Process each file
results.forEach((result) => {
	if (result.messages.length === 0) return;

	const filePath = result.filePath;
	const fileContent = fs.readFileSync(filePath, "utf8");
	const lines = fileContent.split("\n");

	// Get all unused variables/imports
	const unusedVars = result.messages
		.filter((msg) => msg.ruleId === "@typescript-eslint/no-unused-vars")
		.map((msg) => ({
			name: msg.message.match(/'([^']+)'/)[1],
			line: msg.line - 1, // Convert to 0-based index
		}));

	// Remove unused imports
	unusedVars.forEach(({ name, line }) => {
		const lineContent = lines[line];
		if (lineContent.includes("import")) {
			// Handle named imports
			if (lineContent.includes("{")) {
				lines[line] = lineContent.replace(new RegExp(`\\s*${name}\\s*,?`), "");
				// Clean up empty imports
				lines[line] = lines[line].replace(
					/import\s*{\s*}\s*from\s*['"][^'"]+['"]/,
					""
				);
			} else {
				// Handle default imports
				lines[line] = "";
			}
		}
	});

	// Remove empty lines and write back
	const newContent = lines.filter((line) => line.trim()).join("\n");
	fs.writeFileSync(filePath, newContent);
});

console.log("Finished cleaning unused imports");
