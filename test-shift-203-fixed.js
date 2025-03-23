const fs = require("fs");

// Read the API file to check the shift data
const apiFile = fs.readFileSync("./frontend/web/src/api/index.ts", "utf8");

console.log("Verifying shift-203 modifications (improved script)...");

// Extract the mockShifts array first
const mockShiftsMatch = apiFile.match(
	/const\s+mockShifts\s*=\s*\[\s*([\s\S]*?)\s*\];/s
);

if (mockShiftsMatch) {
	// Now search for shift-203 within the mockShifts array content
	const shift203Regex = /{[\s\S]*?id:\s*["']shift-203["'][\s\S]*?},?/g;
	const shift203Match = shift203Regex.exec(mockShiftsMatch[1]);

	if (shift203Match) {
		console.log("\nShift-203 Data Found:");
		console.log(shift203Match[0]);

		// Check if checkInTasks is present
		const checkInTasksExist = shift203Match[0].includes("checkInTasks");
		console.log("\nHas check-in tasks:", checkInTasksExist);

		// Check if checkOutTasks is present
		const checkOutTasksExist = shift203Match[0].includes("checkOutTasks");
		console.log("\nHas check-out tasks:", checkOutTasksExist);

		// Try to find our added check-out tasks
		if (shift203Match[0].includes("Complete closing inventory count")) {
			console.log(
				'\nFound added check-out task: "Complete closing inventory count"'
			);
		} else {
			console.log("\nAdded check-out task not found in the data");
		}

		// Look for our debug code
		if (apiFile.includes("DEBUG: Found shift with ID")) {
			console.log(
				"\nDebug logging code was successfully added to ShiftsAPI.getById"
			);
		} else {
			console.log("\nDebug logging code was not found");
		}
	} else {
		console.log("\nShift-203 not found in the mockShifts array");
	}
} else {
	console.log("\nCould not find the mockShifts array in the API file");
}

// Now check for any modifications to shift-203 after the initial declaration
const addCheckOutTasksCode = apiFile.match(
	/const\s+shiftIndex\s*=\s*mockShifts\.findIndex[\s\S]*?shift-203/
);
if (addCheckOutTasksCode) {
	console.log("\nFound code that adds check-out tasks to shift-203:");

	// Try to find the task descriptions
	const taskDescriptions = apiFile.match(/description:\s*["']([^"']*?)["']/g);
	if (taskDescriptions && taskDescriptions.length > 0) {
		console.log("\nTask descriptions found:");
		taskDescriptions.forEach((desc) => {
			console.log("- " + desc.replace(/description:\s*["']|["']/g, ""));
		});
	}
} else {
	console.log(
		"\nNo code found that modifies shift-203 after its initial declaration"
	);
}

console.log(
	"\nVerification complete. The shift data should now appear correctly in the UI."
);
console.log(
	"Navigate to the shift-203 page to verify the tasks are displayed properly."
);
