const fs = require("fs");
const path = require("path");

// Generate a unique ID
function generateUniqueId() {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}

// Create mock tasks
function generateTask(description, completed = false) {
	return {
		id: generateUniqueId(),
		description,
		completed,
	};
}

// Sample notes content
const sampleNotes = `**Shift Briefing: Special Events Day**

This shift requires extra attention due to the following factors:
- VIP client from overseas visiting at 2pm
- Training new staff members during the afternoon rush
- meeting with management at 1:30pm to discuss workflow improvements

*Please ensure all check-in and check-out tasks are completed thoroughly.*

Rush hour expected between 4-6pm. Additional staff will be on call if needed.

Vehicle inspection at 3:15pm with regional safety coordinator.
`;

// Check-in tasks for shift-203
const checkInTasks = [
	generateTask("Review daily schedule and special events", true),
	generateTask(
		"Check communication devices and ensure radios are charged",
		true
	),
	generateTask("Inspect uniform and personal appearance", false),
	generateTask("Attend morning briefing with team lead", true),
	generateTask("Verify all safety equipment is in place", false),
	generateTask("Check inventory of necessary supplies", false),
	generateTask("Review any pending issues from previous shift", true),
	generateTask("Test point-of-sale system functionality", false),
	generateTask("Set up workstation and verify access to all systems", true),
	generateTask("Prepare VIP welcome package for afternoon visitors", false),
	generateTask("Confirm seating arrangements for staff meeting", false),
	generateTask("Review training materials for new staff members", false),
];

// Check-out tasks for shift-203
const checkOutTasks = [
	generateTask("Complete daily activity report", false),
	generateTask("Reconcile cash drawer and submit to supervisor", false),
	generateTask("Clean and organize workstation", false),
	generateTask("Return communication devices to charging station", false),
	generateTask("Report any equipment malfunctions", false),
	generateTask("Brief incoming shift on current status", false),
	generateTask("Submit visitor feedback forms to manager", false),
	generateTask("Record any unresolved issues for next shift", false),
	generateTask("Restock supplies for next day", false),
	generateTask("Secure all confidential materials", false),
	generateTask("Submit time sheet", false),
	generateTask("Lock all access points and storage areas", false),
	generateTask("Prepare handover notes for next shift", false),
];

// Find the API file to modify
const apiFilePath = path.join(process.cwd(), "frontend/web/src/api/index.ts");

// Read the file
fs.readFile(apiFilePath, "utf8", (err, data) => {
	if (err) {
		console.error("Error reading file:", err);
		return;
	}

	// Find the shift-203 in the mock data or create it if it doesn't exist
	let updatedData = data;

	if (data.includes("shift-203")) {
		console.log("Found shift-203 in mock data. Updating...");

		// Using regex to update existing shift-203
		const shiftPattern = /(\\{[\\s\\S]*?id:\\s*['"]shift-203['"][\\s\\S]*?\\})/;
		const shiftMatch = data.match(shiftPattern);

		if (shiftMatch) {
			const existingShift = shiftMatch[0];

			// Create updated shift object
			const updatedShift = existingShift
				.replace(/notes:(\s*)['"](.*?)['"]/, `notes:$1\`${sampleNotes}\``)
				.replace(
					/checkInTasks:(\s*)\[([\s\S]*?)\]/,
					`checkInTasks: ${JSON.stringify(checkInTasks, null, 2)}`
				)
				.replace(
					/checkOutTasks:(\s*)\[([\s\S]*?)\]/,
					`checkOutTasks: ${JSON.stringify(checkOutTasks, null, 2)}`
				);

			updatedData = data.replace(existingShift, updatedShift);
		} else {
			console.log(
				"Could not match shift-203 pattern for replacement, adding new entry"
			);

			// Prepare new shift object as string
			const newShift = `{
    id: 'shift-203',
    scheduleId: 'sch-5',
    employeeId: 'emp-1',
    startTime: '2025-03-25T08:00:00',
    endTime: '2025-03-25T16:00:00',
    role: 'Supervisor',
    locationId: 'loc-1',
    notes: \`${sampleNotes}\`,
    checkInTasks: ${JSON.stringify(checkInTasks, null, 2)},
    checkOutTasks: ${JSON.stringify(checkOutTasks, null, 2)}
  },`;

			// Add to mockShifts array at the beginning
			const mockShiftsPattern =
				/(export const mockShifts:\s*Shift\[\]\s*=\s*\[)(\s*\{)/;
			updatedData = data.replace(mockShiftsPattern, `$1\n  ${newShift}$2`);
		}
	} else {
		console.log("shift-203 not found. Adding new mock shift-203...");

		// Prepare new shift object as string
		const newShift = `{
    id: 'shift-203',
    scheduleId: 'sch-5',
    employeeId: 'emp-1',
    startTime: '2025-03-25T08:00:00',
    endTime: '2025-03-25T16:00:00',
    role: 'Supervisor',
    locationId: 'loc-1',
    notes: \`${sampleNotes}\`,
    checkInTasks: ${JSON.stringify(checkInTasks, null, 2)},
    checkOutTasks: ${JSON.stringify(checkOutTasks, null, 2)}
  },`;

		// Add to mockShifts array at the beginning
		const mockShiftsPattern =
			/(export const mockShifts:\s*Shift\[\]\s*=\s*\[)(\s*\{)/;
		updatedData = data.replace(mockShiftsPattern, `$1\n  ${newShift}$2`);
	}

	// Write the updated content back to the file
	fs.writeFile(apiFilePath, updatedData, "utf8", (err) => {
		if (err) {
			console.error("Error writing file:", err);
			return;
		}
		console.log("Successfully added/updated shift-203 with mock data!");
	});
});
