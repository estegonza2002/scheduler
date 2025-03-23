const fs = require("fs");

// Read the API file to check the shift data
const apiFile = fs.readFileSync("./frontend/web/src/api/index.ts", "utf8");

console.log("Verifying shift-203 modifications (comprehensive script)...");

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

		// Check for check-in tasks
		const checkInMatch = shift203Match[0].match(
			/checkInTasks:\s*\[([\s\S]*?)(?=\],|\]$)/s
		);
		if (checkInMatch) {
			console.log("\nCheck-in Tasks:");
			console.log(checkInMatch[0]);
		} else {
			console.log("\nNo check-in tasks found in shift-203");
		}

		// Check for check-out tasks
		const checkOutMatch = shift203Match[0].match(
			/checkOutTasks:\s*\[([\s\S]*?)(?=\],|\]$)/s
		);
		if (checkOutMatch) {
			console.log("\nCheck-out Tasks:");
			console.log(checkOutMatch[0]);
		} else {
			console.log("\nNo check-out tasks found in shift-203");
		}
	} else {
		console.log("\nShift-203 not found in the mockShifts array");
	}
} else {
	console.log("Could not extract mockShifts array from the API file");
}

// Now check for any modifications to shift-203 after the initial declaration
const modificationMatch = apiFile.match(
	/const\s+shiftIndex\s*=\s*mockShifts\.findIndex[\s\S]*?shift-203/
);
if (modificationMatch) {
	console.log("\nFound code that adds check-out tasks to shift-203:");
	console.log(modificationMatch[0]);
} else {
	console.log(
		"\nNo code found that modifies shift-203 after its initial declaration"
	);
}

// Extract the mockShiftAssignments array and check for shift-203 assignments
const assignmentsMatch = apiFile.match(
	/const\s+mockShiftAssignments\s*=\s*\[\s*([\s\S]*?)\s*\];/s
);

if (assignmentsMatch) {
	console.log("\nChecking for shift-203 assignments...");

	// Look for assignments with shiftId: "shift-203"
	const shift203Assignments = assignmentsMatch[1].match(
		/{\s*id:.*?shiftId:\s*["']shift-203["'][\s\S]*?},?/g
	);

	if (shift203Assignments && shift203Assignments.length > 0) {
		console.log(
			`\nFound ${shift203Assignments.length} assignments for shift-203:`
		);
		shift203Assignments.forEach((assignment, index) => {
			console.log(`\nAssignment ${index + 1}:`);
			console.log(assignment);
		});
	} else {
		console.log("\nNo assignments found for shift-203");
	}
} else {
	console.log(
		"\nCould not extract mockShiftAssignments array from the API file"
	);
}

// Provide summary and next steps
console.log("\n-----------------------------------------");
console.log("Summary:");
console.log("-----------------------------------------");
console.log(
	"1. Check the output above to verify shift-203 data is correctly defined"
);
console.log(
	"2. Ensure both check-in and check-out tasks are properly configured"
);
console.log("3. Verify that assignments for shift-203 exist if needed");
console.log(
	"4. Navigate to the shift-203 page to verify the tasks are displayed properly."
);
console.log("-----------------------------------------");
