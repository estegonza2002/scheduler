// Utility functions for mock data
import { addDays, format } from "date-fns";
import { Employee, Location, Shift, ShiftTask } from "./types";

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
	title: string,
	completed: boolean = false,
	order: number = 1
): ShiftTask => {
	return {
		id: generateUniqueId(),
		title,
		completed,
		order,
	};
};

export function generateTasksForMockData(tasks: string[]): ShiftTask[] {
	return tasks.map((task, index) => ({
		id: generateUniqueId(),
		title: task,
		completed: false,
		order: index + 1,
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

/**
 * Generates mock shift data using the consolidated model
 */
export const generateMockShifts = (
	startDate: Date,
	days: number,
	shiftsPerDay: number,
	locations: Location[],
	employees: Employee[]
): Shift[] => {
	const shifts: Shift[] = [];

	// First create a schedule for this period
	const scheduleEndDate = new Date(startDate);
	scheduleEndDate.setDate(startDate.getDate() + days - 1);

	const schedule: Shift = {
		id: `sch-${generateUniqueId()}`,
		name: `Generated Schedule ${startDate.toLocaleDateString()}`,
		organization_id: employees[0]?.organizationId || "org-1",
		start_time: startDate.toISOString(),
		end_time: scheduleEndDate.toISOString(),
		is_schedule: true,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	shifts.push(schedule);

	// Now generate individual shifts for each day
	for (let day = 0; day < days; day++) {
		const currentDate = new Date(startDate);
		currentDate.setDate(startDate.getDate() + day);

		for (let s = 0; s < shiftsPerDay; s++) {
			// Randomize shift start time between 6am and 8pm
			const hour = 6 + Math.floor(Math.random() * 14);
			const shiftStart = new Date(currentDate);
			shiftStart.setHours(hour, 0, 0, 0);

			// Shift duration between 4 and 8 hours
			const durationHours = 4 + Math.floor(Math.random() * 4);
			const shiftEnd = new Date(shiftStart);
			shiftEnd.setHours(shiftStart.getHours() + durationHours);

			// Select random employee and location
			const employee = employees[Math.floor(Math.random() * employees.length)];
			const location = locations[Math.floor(Math.random() * locations.length)];

			// Generate position based on employee role
			const position = employee.position || employee.role;

			// Create shift tasks
			const checkInTasks: ShiftTask[] = [
				{
					id: `task-ci-${generateUniqueId()}`,
					title: "Check work area",
					completed: false,
					order: 1,
				},
				{
					id: `task-ci-${generateUniqueId()}`,
					title: "Review shift instructions",
					completed: false,
					order: 2,
				},
			];

			const checkOutTasks: ShiftTask[] = [
				{
					id: `task-co-${generateUniqueId()}`,
					title: "Clean workspace",
					completed: false,
					order: 1,
				},
				{
					id: `task-co-${generateUniqueId()}`,
					title: "Complete shift report",
					completed: false,
					order: 2,
				},
			];

			const shift: Shift = {
				id: `shift-gen-${generateUniqueId()}`,
				parent_shift_id: schedule.id,
				user_id: employee.id,
				organization_id: employee.organizationId,
				start_time: shiftStart.toISOString(),
				end_time: shiftEnd.toISOString(),
				position,
				location_id: location.id,
				description: `Generated shift for ${employee.name}`,
				is_schedule: false,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				check_in_tasks: checkInTasks,
				check_out_tasks: checkOutTasks,
			};

			shifts.push(shift);
		}
	}

	return shifts;
};
