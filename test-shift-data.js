const fs = require("fs");

// Read the API file to check the shift data
const apiFile = fs.readFileSync("./frontend/web/src/api/index.ts", "utf8");

// Try to find shift-203 in the file
const shiftMatch = apiFile.match(/id:\s*['"]shift-203['"][\s\S]*?},/s);

if (shiftMatch) {
	console.log("Found shift data:");
	console.log(shiftMatch[0]);

	// Check for checkInTasks
	const checkInMatch = shiftMatch[0].match(/checkInTasks:\s*([\s\S]*?)[\],]/s);
	if (checkInMatch) {
		console.log("\nFound checkInTasks:");
		console.log(checkInMatch[1]);
	} else {
		console.log("\nNo checkInTasks found in the shift data");
	}

	// Check for checkOutTasks
	const checkOutMatch = shiftMatch[0].match(
		/checkOutTasks:\s*([\s\S]*?)[\],]/s
	);
	if (checkOutMatch) {
		console.log("\nFound checkOutTasks:");
		console.log(checkOutMatch[1]);
	} else {
		console.log("\nNo checkOutTasks found in the shift data");
	}
} else {
	console.log("Shift-203 not found in the API file");
}

// Find the mockShiftAssignments array
const assignmentsMatch = apiFile.match(
	/const\s+mockShiftAssignments\s*=\s*\[([\s\S]*?)\];/s
);
if (assignmentsMatch) {
	// Check if shift-203 exists in assignments
	const shift203Assignment = assignmentsMatch[1].match(
		/shiftId:\s*['"]shift-203['"][\s\S]*?},/gs
	);
	if (shift203Assignment && shift203Assignment.length > 0) {
		console.log("\nFound shift-203 assignment:");
		console.log(shift203Assignment[0]);
	} else {
		console.log("\nNo assignment found for shift-203 in mockShiftAssignments");
	}
} else {
	console.log("\nCould not find mockShiftAssignments array");
}

// Get the ShiftsAPI.getById implementation
const getByIdMatch = apiFile.match(
	/getById:\s*async\s*\(id:\s*string\)[\s\S]*?return\s*\{[\s\S]*?\};/s
);
if (getByIdMatch) {
	console.log("\nShiftsAPI.getById implementation:");
	console.log(getByIdMatch[0]);
} else {
	console.log("\nShiftsAPI.getById implementation not found");
}

// Check how the tasks are converted and processed
console.log("\nChecking how tasks are processed in the API:");
const generateTasksMatch = apiFile.match(
	/function\s+generateTasksForMockData[\s\S]*?\}/s
);
if (generateTasksMatch) {
	console.log(generateTasksMatch[0]);
} else {
	console.log("Task generation function not found");
}

// Add a debugging suggestion
console.log("\nDEBUGGING STEPS:");
console.log(
	"1. Add console.log inside ShiftsAPI.getById to see what it returns for shift-203"
);
console.log(
	"2. Check if the shift has an assignment in the mockShiftAssignments array"
);
console.log(
	"3. Verify that the task arrays are being properly converted to objects in the API"
);
