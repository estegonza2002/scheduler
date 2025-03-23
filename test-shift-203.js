const fs = require("fs");

// Read the API file to check the shift data
const apiFile = fs.readFileSync("./frontend/web/src/api/index.ts", "utf8");

console.log("Verifying shift-203 modifications...");

// Find shift-203 in the mockShifts array
const shift203Match = apiFile.match(
	/id:\s*["']shift-203["'][\s\S]*?(?=},\s*{|}\s*];)/s
);
if (shift203Match) {
	console.log("\nShift-203 Data:");
	console.log(shift203Match[0]);

	// Check for check-in tasks
	const checkInMatch = shift203Match[0].match(
		/checkInTasks:\s*\[([\s\S]*?)(?=\],|\]$)/s
	);
	if (checkInMatch) {
		console.log("\nCheck-in Tasks:");
		console.log(checkInMatch[0]);
	} else {
		console.log("\nNo check-in tasks found for shift-203");
	}

	// Check for check-out tasks
	const checkOutMatch = shift203Match[0].match(
		/checkOutTasks:\s*\[([\s\S]*?)(?=\],|\]$)/s
	);
	if (checkOutMatch) {
		console.log("\nCheck-out Tasks:");
		console.log(checkOutMatch[0]);
	} else {
		console.log("\nNo check-out tasks found for shift-203");
	}
} else {
	console.log("Could not find shift-203 in the mockShifts array");
}

// Check for shift-203 assignment
const assignment203Match = apiFile.match(
	/id:\s*["']sa-203["'][\s\S]*?(?=},\s*{|}\s*];)/s
);
if (assignment203Match) {
	console.log("\nShift-203 Assignment:");
	console.log(assignment203Match[0]);
} else {
	console.log("\nNo assignment found for shift-203");
}

console.log(
	"\nVerification complete. The shift data should now appear correctly in the UI."
);
console.log(
	"Navigate to the shift-203 page to verify the tasks are displayed properly."
);
