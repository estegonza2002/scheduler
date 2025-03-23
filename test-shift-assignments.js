const fs = require("fs");

// Read the API file to check the shift data
const apiFile = fs.readFileSync("./frontend/web/src/api/index.ts", "utf8");

console.log("Checking for shift-203 assignments...");

// Extract the mockShiftAssignments array
const assignmentsMatch = apiFile.match(
	/const\s+mockShiftAssignments\s*=\s*\[\s*([\s\S]*?)\s*\];/s
);

if (assignmentsMatch) {
	console.log("\nFound mockShiftAssignments array:");

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

		console.log("\nHere are all assignments for reference:");
		// Extract all assignments to check their format
		const allAssignments = assignmentsMatch[1].match(/{\s*id:.*?},?/g);
		if (allAssignments && allAssignments.length > 0) {
			console.log(`\nFound ${allAssignments.length} total assignments`);
			// Print the first 3 as examples
			for (let i = 0; i < Math.min(3, allAssignments.length); i++) {
				console.log(`\nExample assignment ${i + 1}:`);
				console.log(allAssignments[i]);
			}
		} else {
			console.log("No assignments found in the array");
		}
	}
} else {
	console.log("Could not find mockShiftAssignments array in the API file");
}

// Also check if there is a function that handles assignments
console.log("\nChecking ShiftAssignmentsAPI implementation:");
const apiMatch = apiFile.match(
	/export\s+const\s+ShiftAssignmentsAPI\s*=\s*{[\s\S]*?getByShiftId[\s\S]*?},/s
);
if (apiMatch) {
	console.log("\nFound ShiftAssignmentsAPI implementation:");
	console.log(apiMatch[0]);
} else {
	console.log("ShiftAssignmentsAPI implementation not found");
}

// Provide recommendations
console.log("\nRecommendations:");
console.log(
	"1. Add an assignment for shift-203 in the mockShiftAssignments array"
);
console.log(
	"2. Check the UI implementation to ensure it correctly renders check-out tasks"
);
console.log(
	"3. Verify that the ShiftAssignmentsAPI.getByShiftId function returns assignments for shift-203"
);
