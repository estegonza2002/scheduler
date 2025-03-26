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
} from "./types";
import {
	generateMockEmployees,
	generateMockLocations,
	generateMockShifts,
	generateTask,
	generateUniqueId,
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

// Initial schedule data
export const mockSchedules: Schedule[] = [
	{
		id: "sch-1",
		name: "Summer Schedule",
		organizationId: "org-1",
		startDate: "2023-06-01",
		endDate: "2023-08-31",
	},
	{
		id: "sch-2",
		name: "Fall Schedule",
		organizationId: "org-1",
		startDate: "2023-09-01",
		endDate: "2023-11-30",
	},
	{
		id: "sch-3",
		name: "Winter Menu",
		organizationId: "org-2",
		startDate: "2023-12-01",
		endDate: "2024-02-28",
	},
	{
		id: "sch-4",
		name: "Spring 2025 Schedule",
		organizationId: "org-1",
		startDate: "2025-03-01",
		endDate: "2025-05-31",
	},
	{
		id: "sch-5",
		name: "Summer 2025 Schedule",
		organizationId: "org-1",
		startDate: "2025-06-01",
		endDate: "2025-08-31",
	},
];

// The shift data with numeric IDs 1-15
export const mockShifts: Shift[] = [
	// Adding 15 shifts with sequential IDs for testing
	{
		id: "shift-1",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-01T08:00:00",
		endTime: "2023-06-01T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "First shift of the month - morning duties",
		checkInTasks: [
			generateTask("Check uniform"),
			generateTask("Get communication device"),
			generateTask("Review daily tasks"),
		],
		checkOutTasks: [
			generateTask("Return keys"),
			generateTask("Submit incident reports"),
			generateTask("Clean work area"),
		],
	},
	{
		id: "shift-2",
		scheduleId: "sch-1",
		employeeId: "emp-2",
		startTime: "2023-06-01T12:00:00",
		endTime: "2023-06-01T20:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		notes: "Afternoon supervisor shift",
		checkInTasks: [
			generateTask("Count cash drawer"),
			generateTask("Check staff attendance"),
			generateTask("Review pending issues"),
		],
		checkOutTasks: [
			generateTask("Balance accounts"),
			generateTask("Lock equipment"),
			generateTask("Prepare handover notes"),
		],
	},
	{
		id: "shift-3",
		scheduleId: "sch-1",
		employeeId: "emp-3",
		startTime: "2023-06-02T08:00:00",
		endTime: "2023-06-02T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "Morning shift at main location",
		checkInTasks: [
			generateTask("Inspect parking area"),
			generateTask("Check safety equipment"),
			generateTask("Set up valet station"),
		],
		checkOutTasks: [
			generateTask("Close valet station"),
			generateTask("Report vehicle status"),
			generateTask("Return equipment"),
		],
	},
	{
		id: "shift-4",
		scheduleId: "sch-1",
		employeeId: "emp-4",
		startTime: "2023-06-02T16:00:00",
		endTime: "2023-06-03T00:00:00",
		role: "Runner",
		locationId: "loc-2",
		notes: "Evening shift at secondary location",
		checkInTasks: [
			generateTask("Take inventory"),
			generateTask("Check communication devices"),
			generateTask("Review special events"),
		],
		checkOutTasks: [
			generateTask("Secure all areas"),
			generateTask("Complete shift log"),
			generateTask("Report any incidents"),
		],
	},
	{
		id: "shift-5",
		scheduleId: "sch-1",
		employeeId: "emp-5",
		startTime: "2023-06-03T09:00:00",
		endTime: "2023-06-03T17:00:00",
		role: "Manager",
		locationId: "loc-1",
		notes: "Management oversight day",
		checkInTasks: [
			generateTask("Review previous day reports"),
			generateTask("Schedule team meeting"),
			generateTask("Check financial reports"),
		],
		checkOutTasks: [
			generateTask("Update management logs"),
			generateTask("Prepare next day schedule"),
			generateTask("Communicate with night shift"),
		],
	},
	{
		id: "shift-6",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-04T08:00:00",
		endTime: "2023-06-04T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "Standard morning shift",
		checkInTasks: [
			generateTask("Morning safety check"),
			generateTask("Review parking layout"),
			generateTask("Check communication system"),
		],
		checkOutTasks: [
			generateTask("Complete vehicle count"),
			generateTask("Clean workspace"),
			generateTask("Report to supervisor"),
		],
	},
	{
		id: "shift-7",
		scheduleId: "sch-1",
		employeeId: "emp-2",
		startTime: "2023-06-04T16:00:00",
		endTime: "2023-06-05T00:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		notes: "Evening supervision with VIP event",
		checkInTasks: [
			generateTask("Brief team on VIP protocol"),
			generateTask("Inspect VIP area"),
			generateTask("Coordinate with event staff"),
		],
		checkOutTasks: [
			generateTask("Collect VIP feedback"),
			generateTask("Document event outcomes"),
			generateTask("Secure venue"),
		],
	},
	{
		id: "shift-8",
		scheduleId: "sch-1",
		employeeId: "emp-3",
		startTime: "2023-06-05T09:00:00",
		endTime: "2023-06-05T17:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "Training day with new hires",
		checkInTasks: [
			generateTask("Prepare training materials"),
			generateTask("Set up training area"),
			generateTask("Meet with trainees"),
		],
		checkOutTasks: [
			generateTask("Evaluate trainee progress"),
			generateTask("Document training activities"),
			generateTask("Plan next training session"),
		],
	},
	{
		id: "shift-9",
		scheduleId: "sch-1",
		employeeId: "emp-4",
		startTime: "2023-06-05T12:00:00",
		endTime: "2023-06-05T20:00:00",
		role: "Runner",
		locationId: "loc-2",
		notes: "Afternoon shift during busy period",
		checkInTasks: [
			generateTask("Check traffic flow plans"),
			generateTask("Review peak hours protocol"),
			generateTask("Coordinate with support staff"),
		],
		checkOutTasks: [
			generateTask("Report traffic statistics"),
			generateTask("Document challenges"),
			generateTask("Prepare recommendations"),
		],
	},
	{
		id: "shift-10",
		scheduleId: "sch-1",
		employeeId: "emp-5",
		startTime: "2023-06-06T08:00:00",
		endTime: "2023-06-06T16:00:00",
		role: "Manager",
		locationId: "loc-1",
		notes: "Weekly review and planning day",
		checkInTasks: [
			generateTask("Gather weekly reports"),
			generateTask("Prepare performance reviews"),
			generateTask("Set weekly goals"),
		],
		checkOutTasks: [
			generateTask("Distribute weekly schedule"),
			generateTask("Send management summary"),
			generateTask("Update planning documents"),
		],
	},
	{
		id: "shift-11",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-07T12:00:00",
		endTime: "2023-06-07T20:00:00",
		role: "Runner",
		locationId: "loc-2",
		notes: "Weekend afternoon shift",
		checkInTasks: [
			generateTask("Check weekend specials"),
			generateTask("Review increased capacity plans"),
			generateTask("Coordinate with weekend team"),
		],
		checkOutTasks: [
			generateTask("Complete weekend report"),
			generateTask("Prepare for Sunday shift"),
			generateTask("Secure weekend equipment"),
		],
	},
	{
		id: "shift-12",
		scheduleId: "sch-1",
		employeeId: "emp-2",
		startTime: "2023-06-08T08:00:00",
		endTime: "2023-06-08T16:00:00",
		role: "Supervisor",
		locationId: "loc-1",
		notes: "Sunday morning oversight",
		checkInTasks: [
			generateTask("Schedule Sunday staff"),
			generateTask("Review weekend incidents"),
			generateTask("Check facility status"),
		],
		checkOutTasks: [
			generateTask("Prepare week ahead report"),
			generateTask("Finalize weekend documentation"),
			generateTask("Brief Monday staff"),
		],
	},
	{
		id: "shift-13",
		scheduleId: "sch-1",
		employeeId: "emp-3",
		startTime: "2023-06-09T09:00:00",
		endTime: "2023-06-09T17:00:00",
		role: "Runner",
		locationId: "loc-2",
		notes: "Monday morning fresh start",
		checkInTasks: [
			generateTask("Reset weekly counters"),
			generateTask("Implement new weekly protocols"),
			generateTask("Check maintenance schedule"),
		],
		checkOutTasks: [
			generateTask("Document Monday statistics"),
			generateTask("Update weekly forecast"),
			generateTask("Report equipment status"),
		],
	},
	{
		id: "shift-14",
		scheduleId: "sch-1",
		employeeId: "emp-4",
		startTime: "2023-06-10T12:00:00",
		endTime: "2023-06-10T20:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "Mid-week afternoon shift",
		checkInTasks: [
			generateTask("Check mid-week reports"),
			generateTask("Review customer feedback"),
			generateTask("Assess inventory levels"),
		],
		checkOutTasks: [
			generateTask("Submit inventory requests"),
			generateTask("Process customer comments"),
			generateTask("Plan next day activities"),
		],
	},
	{
		id: "shift-15",
		scheduleId: "sch-1",
		employeeId: "emp-5",
		startTime: "2023-06-11T08:00:00",
		endTime: "2023-06-11T16:00:00",
		role: "Manager",
		locationId: "loc-2",
		notes: "End of period evaluation day",
		checkInTasks: [
			generateTask("Collect period metrics"),
			generateTask("Evaluate team performance"),
			generateTask("Schedule individual reviews"),
		],
		checkOutTasks: [
			generateTask("Generate period report"),
			generateTask("Plan improvement strategies"),
			generateTask("Set next period goals"),
		],
	},
	// Original demo shifts
	{
		id: "shift-61",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-01T09:00:00",
		endTime: "2023-06-01T17:00:00",
		role: "Manager",
		locationId: "loc-1",
		notes:
			"This is a test shift for demonstration purposes.\n\nMake sure to review all tasks before completing the shift.",
		checkInTasks: [
			{
				id: generateUniqueId(),
				description: "Check security systems",
				completed: true,
			},
			{
				id: generateUniqueId(),
				description: "Verify inventory levels",
				completed: false,
			},
			{
				id: generateUniqueId(),
				description: "Brief staff on daily goals",
				completed: false,
			},
		],
		checkOutTasks: [
			{
				id: generateUniqueId(),
				description: "Close register",
				completed: false,
			},
			{
				id: generateUniqueId(),
				description: "Lock all doors",
				completed: false,
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

// ShiftAssignments data
export const mockShiftAssignments: ShiftAssignment[] = [
	// Add assignments for our 15 test shifts
	{
		id: "sa-test-1",
		shiftId: "shift-1",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-test-2",
		shiftId: "shift-2",
		employeeId: "emp-2",
		role: "Supervisor",
	},
	{
		id: "sa-test-3",
		shiftId: "shift-3",
		employeeId: "emp-3",
		role: "Runner",
	},
	{
		id: "sa-test-4",
		shiftId: "shift-4",
		employeeId: "emp-4",
		role: "Runner",
	},
	{
		id: "sa-test-5",
		shiftId: "shift-5",
		employeeId: "emp-5",
		role: "Manager",
	},
	{
		id: "sa-test-6",
		shiftId: "shift-6",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-test-7",
		shiftId: "shift-7",
		employeeId: "emp-2",
		role: "Supervisor",
	},
	{
		id: "sa-test-8",
		shiftId: "shift-8",
		employeeId: "emp-3",
		role: "Runner",
	},
	{
		id: "sa-test-9",
		shiftId: "shift-9",
		employeeId: "emp-4",
		role: "Runner",
	},
	{
		id: "sa-test-10",
		shiftId: "shift-10",
		employeeId: "emp-5",
		role: "Manager",
	},
	{
		id: "sa-test-11",
		shiftId: "shift-11",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-test-12",
		shiftId: "shift-12",
		employeeId: "emp-2",
		role: "Supervisor",
	},
	{
		id: "sa-test-13",
		shiftId: "shift-13",
		employeeId: "emp-3",
		role: "Runner",
	},
	{
		id: "sa-test-14",
		shiftId: "shift-14",
		employeeId: "emp-4",
		role: "Runner",
	},
	{
		id: "sa-test-15",
		shiftId: "shift-15",
		employeeId: "emp-5",
		role: "Manager",
	},
	{
		id: "sa-61",
		shiftId: "shift-61",
		employeeId: "emp-1",
		role: "Manager",
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
	// Clear existing mock data arrays
	mockLocations.length = 0;
	mockEmployees.length = 0;
	mockShifts.length = 0;
	mockShiftAssignments.length = 0;

	// Update organization name
	mockOrganizations[0].name = "Coffee Shop Chain";
	mockOrganizations[0].description =
		"National coffee shop chain with multiple locations";

	// Generate new mock data
	const locations = generateMockLocations(15);
	const employees = generateMockEmployees(15);

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
