// Mock data
import { format } from "date-fns";
import {
	Employee,
	Location,
	Notification,
	Organization,
	Schedule,
	Shift,
	ShiftAssignment,
	ShiftTask,
} from "./types";
import {
	generateMockEmployees,
	generateMockLocations,
	generateTask,
	generateUniqueId,
	generateMockShifts,
} from "./utils";

// Initial organization data
export const mockOrganizations: Organization[] = [
	{
		id: "org-1",
		name: "SwiftValet",
		description: "Premium valet parking service with 25 employees",
	},
	{
		id: "org-2",
		name: "LuxuryValet",
		description: "High-end valet service for luxury venues with 40 employees",
	},
];

// Consolidated shifts data (including both schedules and individual shifts)
export const mockShifts: Shift[] = [
	// Schedules (is_schedule = true)
	{
		id: "sch-1",
		name: "Summer Schedule",
		organization_id: "org-1",
		start_time: "2023-06-01T00:00:00Z",
		end_time: "2023-08-31T23:59:59Z",
		is_schedule: true,
		created_at: "2023-05-15T10:00:00Z",
		updated_at: "2023-05-15T10:00:00Z",
	},
	{
		id: "sch-2",
		name: "Fall Schedule",
		organization_id: "org-1",
		start_time: "2023-09-01T00:00:00Z",
		end_time: "2023-11-30T23:59:59Z",
		is_schedule: true,
		created_at: "2023-08-15T10:00:00Z",
		updated_at: "2023-08-15T10:00:00Z",
	},
	{
		id: "sch-3",
		name: "Winter Menu",
		organization_id: "org-2",
		start_time: "2023-12-01T00:00:00Z",
		end_time: "2024-02-28T23:59:59Z",
		is_schedule: true,
		created_at: "2023-11-15T10:00:00Z",
		updated_at: "2023-11-15T10:00:00Z",
	},
	{
		id: "sch-4",
		name: "Spring 2025 Schedule",
		organization_id: "org-1",
		start_time: "2025-03-01T00:00:00Z",
		end_time: "2025-05-31T23:59:59Z",
		is_schedule: true,
		created_at: "2024-02-15T10:00:00Z",
		updated_at: "2024-02-15T10:00:00Z",
	},
	{
		id: "sch-5",
		name: "Summer 2025 Schedule",
		organization_id: "org-1",
		start_time: "2025-06-01T00:00:00Z",
		end_time: "2025-08-31T23:59:59Z",
		is_schedule: true,
		created_at: "2025-05-15T10:00:00Z",
		updated_at: "2025-05-15T10:00:00Z",
	},

	// Future schedule for upcoming shifts
	{
		id: "sch-6",
		name: "Current Schedule",
		organization_id: "org-1",
		start_time: new Date().toISOString(),
		end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
		is_schedule: true,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},

	// Individual shifts (is_schedule = false)
	{
		id: "shift-1",
		parent_shift_id: "sch-1",
		user_id: "emp-1",
		start_time: "2023-06-01T08:00:00Z",
		end_time: "2023-06-01T16:00:00Z",
		position: "Runner",
		location_id: "loc-1",
		description: "First shift of the month - morning duties",
		organization_id: "org-1",
		is_schedule: false,
		status: "completed",
		created_at: "2023-05-20T10:00:00Z",
		updated_at: "2023-05-20T10:00:00Z",
		check_in_tasks: [
			{
				id: "task-1",
				title: "Check uniform",
				completed: false,
				order: 1,
			},
			{
				id: "task-2",
				title: "Get communication device",
				completed: false,
				order: 2,
			},
			{
				id: "task-3",
				title: "Review daily tasks",
				completed: false,
				order: 3,
			},
		],
		check_out_tasks: [
			{
				id: "task-4",
				title: "Return keys",
				completed: false,
				order: 1,
			},
			{
				id: "task-5",
				title: "Submit incident reports",
				completed: false,
				order: 2,
			},
			{
				id: "task-6",
				title: "Clean work area",
				completed: false,
				order: 3,
			},
		],
	},
	{
		id: "shift-2",
		parent_shift_id: "sch-1",
		user_id: "emp-2",
		start_time: "2023-06-01T12:00:00Z",
		end_time: "2023-06-01T20:00:00Z",
		position: "Supervisor",
		location_id: "loc-2",
		description: "Afternoon supervisor shift",
		organization_id: "org-1",
		is_schedule: false,
		status: "canceled",
		created_at: "2023-05-20T10:10:00Z",
		updated_at: "2023-05-20T10:10:00Z",
		check_in_tasks: [
			{
				id: "task-7",
				title: "Count cash drawer",
				completed: false,
				order: 1,
			},
			{
				id: "task-8",
				title: "Check staff attendance",
				completed: false,
				order: 2,
			},
			{
				id: "task-9",
				title: "Review pending issues",
				completed: false,
				order: 3,
			},
		],
		check_out_tasks: [
			{
				id: "task-10",
				title: "Balance accounts",
				completed: false,
				order: 1,
			},
			{
				id: "task-11",
				title: "Lock equipment",
				completed: false,
				order: 2,
			},
			{
				id: "task-12",
				title: "Prepare handover notes",
				completed: false,
				order: 3,
			},
		],
	},
	{
		id: "shift-3",
		parent_shift_id: "sch-1",
		user_id: "emp-3",
		start_time: "2023-06-02T08:00:00Z",
		end_time: "2023-06-02T16:00:00Z",
		position: "Runner",
		location_id: "loc-1",
		description: "Morning shift at main location",
		organization_id: "org-1",
		is_schedule: false,
		status: "completed",
		created_at: "2023-05-25T09:00:00Z",
		updated_at: "2023-05-25T09:00:00Z",
		check_in_tasks: [
			{
				id: "task-13",
				title: "Inspect parking area",
				completed: false,
				order: 1,
			},
			{
				id: "task-14",
				title: "Check safety equipment",
				completed: false,
				order: 2,
			},
			{
				id: "task-15",
				title: "Set up valet station",
				completed: false,
				order: 3,
			},
		],
		check_out_tasks: [
			{
				id: "task-16",
				title: "Close valet station",
				completed: false,
				order: 1,
			},
			{
				id: "task-17",
				title: "Report vehicle status",
				completed: false,
				order: 2,
			},
			{
				id: "task-18",
				title: "Return equipment",
				completed: false,
				order: 3,
			},
		],
	},
	{
		id: "shift-4",
		parent_shift_id: "sch-1",
		user_id: "emp-4",
		start_time: "2023-06-02T16:00:00Z",
		end_time: "2023-06-03T00:00:00Z",
		position: "Runner",
		location_id: "loc-2",
		description: "Evening shift at secondary location",
		organization_id: "org-1",
		is_schedule: false,
		status: "canceled",
		created_at: "2023-05-25T09:15:00Z",
		updated_at: "2023-05-25T09:15:00Z",
		check_in_tasks: [
			{
				id: "task-19",
				title: "Take inventory",
				completed: false,
				order: 1,
			},
			{
				id: "task-20",
				title: "Check communication devices",
				completed: false,
				order: 2,
			},
			{
				id: "task-21",
				title: "Review special events",
				completed: false,
				order: 3,
			},
		],
		check_out_tasks: [
			{
				id: "task-22",
				title: "Secure all areas",
				completed: false,
				order: 1,
			},
			{
				id: "task-23",
				title: "Complete shift log",
				completed: false,
				order: 2,
			},
			{
				id: "task-24",
				title: "Report any incidents",
				completed: false,
				order: 3,
			},
		],
	},
	{
		id: "shift-5",
		parent_shift_id: "sch-1",
		user_id: "emp-5",
		start_time: "2023-06-03T09:00:00Z",
		end_time: "2023-06-03T17:00:00Z",
		position: "Manager",
		location_id: "loc-1",
		description: "Management oversight day",
		organization_id: "org-1",
		is_schedule: false,
		status: "in_progress",
		created_at: "2023-05-26T11:00:00Z",
		updated_at: "2023-05-26T11:00:00Z",
		check_in_tasks: [
			{
				id: "task-25",
				title: "Review previous day reports",
				completed: false,
				order: 1,
			},
			{
				id: "task-26",
				title: "Schedule team meeting",
				completed: false,
				order: 2,
			},
			{
				id: "task-27",
				title: "Check financial reports",
				completed: false,
				order: 3,
			},
		],
		check_out_tasks: [
			{
				id: "task-28",
				title: "Update management logs",
				completed: false,
				order: 1,
			},
			{
				id: "task-29",
				title: "Prepare next day schedule",
				completed: false,
				order: 2,
			},
			{
				id: "task-30",
				title: "Communicate with night shift",
				completed: false,
				order: 3,
			},
		],
	},

	// Add some upcoming shifts for testing
	{
		id: "shift-upcoming-1",
		parent_shift_id: "sch-6",
		user_id: "emp-1",
		start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
		end_time: new Date(
			Date.now() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
		).toISOString(), // 8 hours later
		position: "Runner",
		location_id: "loc-1",
		description: "Upcoming test shift",
		organization_id: "org-1",
		is_schedule: false,
		status: "scheduled",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		check_in_tasks: [
			{
				id: "task-up-1",
				title: "Check uniform",
				completed: false,
				order: 1,
			},
			{
				id: "task-up-2",
				title: "Get communication device",
				completed: false,
				order: 2,
			},
		],
		check_out_tasks: [
			{
				id: "task-up-3",
				title: "Return keys",
				completed: false,
				order: 1,
			},
			{
				id: "task-up-4",
				title: "Submit shift report",
				completed: false,
				order: 2,
			},
		],
	},
	{
		id: "shift-current-1",
		parent_shift_id: "sch-6",
		user_id: "emp-1",
		start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
		end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
		position: "Runner",
		location_id: "loc-1",
		description: "Current test shift",
		organization_id: "org-1",
		is_schedule: false,
		status: "in_progress",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		check_in_tasks: [
			{
				id: "task-curr-1",
				title: "Check uniform",
				completed: true,
				order: 1,
			},
			{
				id: "task-curr-2",
				title: "Get communication device",
				completed: true,
				order: 2,
			},
		],
		check_out_tasks: [
			{
				id: "task-curr-3",
				title: "Return keys",
				completed: false,
				order: 1,
			},
			{
				id: "task-curr-4",
				title: "Submit shift report",
				completed: false,
				order: 2,
			},
		],
	},
];

// Employee data
export const mockEmployees: Employee[] = [
	{
		id: "emp-1",
		organizationId: "org-1",
		name: "John Doe",
		email: "john@swiftvalet.com",
		role: "Runner",
		phone: "555-123-4567",
		position: "Runner",
		hireDate: "2023-01-15",
		address: "123 Park St, Downtown",
		emergencyContact: "Jane Doe (Wife) - 555-987-6543",
		notes: "Experienced with luxury vehicles. Prefers morning shifts.",
		hourlyRate: 16.5,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-2",
		organizationId: "org-1",
		name: "Jane Smith",
		email: "jane@swiftvalet.com",
		role: "Supervisor",
		phone: "555-234-5678",
		position: "Supervisor",
		hireDate: "2022-06-10",
		address: "456 Avenue Rd, Midtown",
		emergencyContact: "Mark Smith (Husband) - 555-876-5432",
		notes: "Former hotel manager. Handles client relations excellently.",
		hourlyRate: 22.75,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-3",
		organizationId: "org-1",
		name: "Alice Johnson",
		email: "alice@swiftvalet.com",
		role: "Runner",
		phone: "555-345-6789",
		position: "Runner",
		hireDate: "2022-03-22",
		address: "789 Main Blvd, Uptown",
		emergencyContact: "Bob Johnson (Brother) - 555-765-4321",
		notes: "Excellent at training new staff. Weekend availability limited.",
		hourlyRate: 16.75,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-4",
		organizationId: "org-1",
		name: "Michael Chen",
		email: "michael@swiftvalet.com",
		role: "Runner",
		phone: "555-567-8901",
		position: "Runner",
		hireDate: "2023-05-10",
		address: "321 Hotel Lane, Downtown",
		emergencyContact: "Wei Chen (Father) - 555-654-3210",
		notes: "Multilingual: English, Mandarin, and Spanish.",
		hourlyRate: 16.5,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-5",
		organizationId: "org-1",
		name: "Sarah Patel",
		email: "sarah@swiftvalet.com",
		role: "Supervisor",
		phone: "555-678-9012",
		position: "Supervisor",
		hireDate: "2022-09-15",
		address: "654 Luxury Ave, Eastside",
		emergencyContact: "Raj Patel (Husband) - 555-543-2109",
		notes:
			"Previously worked at high-end hotel. Excellent customer service skills.",
		hourlyRate: 23.5,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-6",
		organizationId: "org-1",
		name: "David Washington",
		email: "david@swiftvalet.com",
		role: "Runner",
		phone: "555-789-0123",
		position: "Runner",
		hireDate: "2023-02-20",
		address: "987 Valley Rd, Westside",
		emergencyContact: "Michelle Washington (Sister) - 555-432-1098",
		notes: "Former mechanic. Valuable for handling vehicle issues.",
		hourlyRate: 17.25,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-7",
		organizationId: "org-1",
		name: "Emily Garcia",
		email: "emily@swiftvalet.com",
		role: "Runner",
		phone: "555-890-1234",
		position: "Runner",
		hireDate: "2023-04-05",
		address: "246 Lake St, Northside",
		emergencyContact: "Carlos Garcia (Father) - 555-321-0987",
		notes: "Studying hospitality management. Available weekends and evenings.",
		hourlyRate: 16.5,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-8",
		organizationId: "org-1",
		name: "Kevin Wilson",
		email: "kevin@swiftvalet.com",
		role: "Supervisor",
		phone: "555-901-2345",
		position: "Supervisor",
		hireDate: "2022-08-10",
		address: "135 Ocean Blvd, Southside",
		emergencyContact: "Linda Wilson (Mother) - 555-210-9876",
		notes:
			"Former security manager. Excellent at enforcing procedures and safety standards.",
		hourlyRate: 23.0,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-9",
		organizationId: "org-2",
		name: "Olivia Taylor",
		email: "olivia@luxuryvalet.com",
		role: "Supervisor",
		phone: "555-012-3456",
		position: "Supervisor",
		hireDate: "2022-07-15",
		address: "864 Plaza Dr, Manhattan",
		emergencyContact: "James Taylor (Spouse) - 555-109-8765",
		notes: "Expertise in luxury brand customer service and VIP handling.",
		hourlyRate: 25.0,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "emp-10",
		organizationId: "org-2",
		name: "Ryan Lee",
		email: "ryan@luxuryvalet.com",
		role: "Runner",
		phone: "555-123-4567",
		position: "Runner",
		hireDate: "2023-03-10",
		address: "753 Fifth Ave, Manhattan",
		emergencyContact: "Min Lee (Mother) - 555-098-7654",
		notes:
			"Experience with exotic cars. Trained in specialized vehicle handling.",
		hourlyRate: 18.5,
		status: "invited",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
];

// Location data
export const mockLocations: Location[] = [
	{
		id: "loc-1",
		organizationId: "org-1",
		name: "Grand Hotel",
		address: "123 Grand Ave",
		city: "San Francisco",
		state: "CA",
		zipCode: "94102",
		isActive: true,
	},
	{
		id: "loc-2",
		organizationId: "org-1",
		name: "Luxury Plaza Hotel",
		address: "456 Ocean Ave",
		city: "San Francisco",
		state: "CA",
		zipCode: "94122",
		isActive: true,
	},
	{
		id: "loc-3",
		organizationId: "org-1",
		name: "Convention Center",
		address: "789 Convention Way",
		city: "San Francisco",
		state: "CA",
		zipCode: "94128",
		isActive: true,
	},
	{
		id: "loc-4",
		organizationId: "org-2",
		name: "Elite Club",
		address: "555 Broadway",
		city: "New York",
		state: "NY",
		zipCode: "10012",
		isActive: true,
	},
	{
		id: "loc-5",
		organizationId: "org-1",
		name: "Skyview Tower",
		address: "101 Tower Road",
		city: "San Francisco",
		state: "CA",
		zipCode: "94105",
		isActive: true,
	},
	{
		id: "loc-6",
		organizationId: "org-1",
		name: "Downtown Marriott",
		address: "222 Union Square",
		city: "San Francisco",
		state: "CA",
		zipCode: "94108",
		isActive: true,
	},
	{
		id: "loc-7",
		organizationId: "org-1",
		name: "Bay View Restaurant",
		address: "333 Bayfront",
		city: "San Francisco",
		state: "CA",
		zipCode: "94111",
		isActive: true,
	},
	{
		id: "loc-8",
		organizationId: "org-1",
		name: "Golden Gate Complex",
		address: "444 Golden Gate Avenue",
		city: "San Francisco",
		state: "CA",
		zipCode: "94102",
		isActive: true,
	},
	{
		id: "loc-9",
		organizationId: "org-2",
		name: "Plaza Hotel Manhattan",
		address: "777 Fifth Avenue",
		city: "New York",
		state: "NY",
		zipCode: "10019",
		isActive: true,
	},
	{
		id: "loc-10",
		organizationId: "org-2",
		name: "Central Park Venue",
		address: "888 Central Park West",
		city: "New York",
		state: "NY",
		zipCode: "10023",
		isActive: true,
	},
];

// Shift assignments data
export const mockShiftAssignments: ShiftAssignment[] = [
	{
		id: "assignment-1",
		shiftId: "shift-1",
		employeeId: "emp-1",
		role: "Runner",
		notes: "First assignment",
	},
	{
		id: "assignment-2",
		shiftId: "shift-2",
		employeeId: "emp-2",
		role: "Supervisor",
		notes: "Experienced supervisor",
	},
	{
		id: "assignment-3",
		shiftId: "shift-3",
		employeeId: "emp-3",
		role: "Runner",
		notes: "Familiar with main location",
	},
	{
		id: "assignment-4",
		shiftId: "shift-4",
		employeeId: "emp-4",
		role: "Runner",
		notes: "Night shift specialist",
	},
	{
		id: "assignment-5",
		shiftId: "shift-5",
		employeeId: "emp-5",
		role: "Manager",
		notes: "Monthly oversight",
	},
];

// Notifications data
export const mockNotifications: Notification[] = [
	{
		id: "notif-1",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "Shift Schedule Updated",
		message: "Your shift on Monday has been rescheduled to 9 AM - 5 PM",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-123",
		relatedEntityId: "shift-123",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
	},
	{
		id: "notif-2",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_reminder",
		title: "Upcoming Shift Tomorrow",
		message:
			"Reminder: You have a shift tomorrow from 10 AM - 6 PM at Downtown Location",
		isRead: true,
		actionUrl: "/shifts/shift-456",
		relatedEntityId: "shift-456",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
	},
	// Other notifications...
];

// Function to generate additional mock data as needed
export const generateLargeMockData = () => {
	console.log("Generating large mock data sets...");

	// Generate locations and employees
	const locations = generateMockLocations(10);
	const employees = generateMockEmployees(50);

	// Start date March 20, 2025
	const startDate = new Date(2025, 2, 20); // Month is 0-indexed
	const shifts = generateMockShifts(startDate, 7, 15, locations, employees);

	// Add the generated data to the mock arrays
	mockLocations.push(...locations);
	mockEmployees.push(...employees);
	mockShifts.push(...shifts);

	console.log(
		`Generated ${locations.length} locations, ${employees.length} employees, and ${shifts.length} shifts`
	);
};
