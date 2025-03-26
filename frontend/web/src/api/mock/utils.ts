// Utility functions for mock data
import { format, addDays } from "date-fns";
import { CheckInTask, CheckOutTask, Employee, Location, Shift } from "./types";

// Helper function for simulating API delay
export const delay = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

// Helper function for generating unique IDs that works in all browsers
export function generateUniqueId(): string {
	// Use crypto.randomUUID if available (modern browsers)
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	// Fallback for browsers without crypto.randomUUID
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}

// Helper function to generate tasks
export const generateTask = (
	description: string,
	completed: boolean = false
): CheckInTask | CheckOutTask => {
	return {
		id: generateUniqueId(),
		description,
		completed,
	};
};

export function generateTasksForMockData(
	tasks: string[]
): CheckInTask[] | CheckOutTask[] {
	return tasks.map((task) => ({
		id: generateUniqueId(),
		description: task,
		completed: false,
	}));
}

// Helper functions for generating larger mock data sets
export const generateMockLocations = (count: number = 100): Location[] => {
	const neighborhoods = [
		"Downtown",
		"Midtown",
		"Uptown",
		"West End",
		"East Side",
		"North Beach",
		"South Bay",
		"Central",
		"Riverside",
		"Lakefront",
		"Harbor",
		"Heights",
		"Financial District",
		"Chinatown",
		"Little Italy",
		"Arts District",
	];

	const cityNames = [
		"San Francisco",
		"New York",
		"Chicago",
		"Los Angeles",
		"Seattle",
		"Boston",
		"Austin",
		"Portland",
		"Denver",
		"Miami",
		"Atlanta",
		"Dallas",
		"Phoenix",
	];

	const streetTypes = [
		"St",
		"Ave",
		"Blvd",
		"Rd",
		"Lane",
		"Place",
		"Drive",
		"Court",
	];

	const locations: Location[] = [];

	for (let i = 1; i <= count; i++) {
		const neighborhood =
			neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
		const cityName = cityNames[Math.floor(Math.random() * cityNames.length)];
		const streetType =
			streetTypes[Math.floor(Math.random() * streetTypes.length)];
		const streetNumber = Math.floor(Math.random() * 2000) + 1;

		locations.push({
			id: `loc-${i}`,
			organizationId: "org-1",
			name: `${neighborhood} Coffee Shop ${i}`,
			address: `${streetNumber} ${neighborhood} ${streetType}`,
			city: cityName,
			state: "CA",
			zipCode: `9${Math.floor(1000 + Math.random() * 9000)}`,
			isActive: Math.random() > 0.1, // 90% are active
		});
	}

	return locations;
};

export const generateMockEmployees = (count: number = 100): Employee[] => {
	const firstNames = [
		"James",
		"Mary",
		"John",
		"Patricia",
		"Robert",
		"Jennifer",
		"Michael",
		"Linda",
		"William",
		"Elizabeth",
		"David",
		"Susan",
		"Richard",
		"Jessica",
		"Joseph",
		"Sarah",
		"Thomas",
		"Karen",
		"Charles",
		"Nancy",
		"Daniel",
		"Lisa",
		"Matthew",
		"Margaret",
		"Anthony",
		"Betty",
		"Mark",
		"Sandra",
		"Donald",
		"Ashley",
		"Steven",
		"Dorothy",
		"Andrew",
		"Kimberly",
		"Paul",
		"Emily",
		"Joshua",
		"Olivia",
		"Kenneth",
		"Michelle",
	];

	const lastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Jones",
		"Brown",
		"Davis",
		"Miller",
		"Wilson",
		"Moore",
		"Taylor",
		"Anderson",
		"Thomas",
		"Jackson",
		"White",
		"Harris",
		"Martin",
		"Thompson",
		"Garcia",
		"Martinez",
		"Robinson",
		"Clark",
		"Rodriguez",
		"Lewis",
		"Lee",
		"Walker",
		"Hall",
		"Allen",
		"Young",
		"Hernandez",
		"King",
		"Wright",
		"Lopez",
		"Hill",
		"Scott",
		"Green",
		"Adams",
		"Baker",
		"Gonzalez",
		"Nelson",
		"Carter",
	];

	const roles = ["Runner", "Supervisor"];

	const employees: Employee[] = [];

	for (let i = 1; i <= count; i++) {
		const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
		const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
		const role = roles[Math.floor(Math.random() * roles.length)];
		const baseRate = role === "Supervisor" ? 20 : 15;
		const rateVariance = Math.random() * 3;

		employees.push({
			id: `emp-${i}`,
			organizationId: "org-1",
			name: `${firstName} ${lastName}`,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@swiftvalet.com`,
			role: role,
			phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(
				1000 + Math.random() * 9000
			)}`,
			position: role,
			hireDate: `202${Math.floor(Math.random() * 4)}-${String(
				Math.floor(Math.random() * 12) + 1
			).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(
				2,
				"0"
			)}`,
			hourlyRate: Number((baseRate + rateVariance).toFixed(2)),
			status: "invited",
			isOnline: false,
			lastActive: new Date().toISOString(),
		});
	}

	return employees;
};

export const generateMockShifts = (
	startDate: Date,
	daysCount: number = 7,
	shiftsPerDay: number = 100,
	locations: Location[],
	employees: Employee[]
): Shift[] => {
	const shifts: Shift[] = [];
	const roles = ["Runner", "Supervisor"];
	const notes = [
		"Training new employee",
		"Vehicle inspection required",
		"Staff meeting at end of shift",
		"VIP client event",
		"Expected high traffic",
		"Urgent shift coverage needed",
		"Special event preparation",
		"Holiday rush expected",
		"Cover for vacation",
		undefined,
		undefined,
		undefined,
		undefined,
		undefined, // Higher chance of no notes
	];

	// Time slots (24-hour format)
	const timeSlots = [
		{ start: 6, end: 14 }, // 6am - 2pm
		{ start: 8, end: 16 }, // 8am - 4pm
		{ start: 10, end: 18 }, // 10am - 6pm
		{ start: 12, end: 20 }, // 12pm - 8pm
		{ start: 14, end: 22 }, // 2pm - 10pm
		{ start: 16, end: 24 }, // 4pm - 12am
	];

	let shiftCounter = 1;

	// Generate shifts for each day
	for (let day = 0; day < daysCount; day++) {
		const currentDate = addDays(startDate, day);
		const formattedDate = format(currentDate, "yyyy-MM-dd");

		// Generate multiple shifts per day
		for (let i = 0; i < shiftsPerDay; i++) {
			// Randomly select a location, employee, and time slot
			const locationIndex = Math.floor(Math.random() * locations.length);
			const employeeIndex = Math.floor(Math.random() * employees.length);
			const timeSlotIndex = Math.floor(Math.random() * timeSlots.length);
			const roleIndex = Math.floor(Math.random() * roles.length);
			const noteIndex = Math.floor(Math.random() * notes.length);

			const timeSlot = timeSlots[timeSlotIndex];
			const startHour = timeSlot.start;
			const endHour = timeSlot.end;

			const shift: Shift = {
				id: `shift-${shiftCounter}`,
				scheduleId: "sch-4", // Using the Spring 2025 schedule
				employeeId: employees[employeeIndex].id,
				startTime: `${formattedDate}T${String(startHour).padStart(
					2,
					"0"
				)}:00:00`,
				endTime: `${formattedDate}T${String(endHour).padStart(2, "0")}:00:00`,
				role: roles[roleIndex],
				locationId: locations[locationIndex].id,
				notes: notes[noteIndex],
			};

			shifts.push(shift);
			shiftCounter++;
		}
	}

	return shifts;
};
