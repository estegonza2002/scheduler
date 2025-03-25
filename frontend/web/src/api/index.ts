// Mock API implementation that simulates backend calls
import { toast } from "sonner";
import { addDays, format } from "date-fns";

// Types
export interface Organization {
	id: string;
	name: string;
	description?: string;
}

export interface Schedule {
	id: string;
	name: string;
	organizationId: string;
	startDate: string;
	endDate: string;
}

export interface CheckInTask {
	id: string;
	description: string;
	completed: boolean;
}

export interface CheckOutTask {
	id: string;
	description: string;
	completed: boolean;
}

export interface Shift {
	id: string;
	scheduleId: string;
	employeeId?: string; // Will be deprecated in favor of ShiftAssignment
	startTime: string;
	endTime: string;
	role?: string;
	notes?: string;
	locationId?: string;
	checkInTasks?: CheckInTask[];
	checkOutTasks?: CheckOutTask[];
}

export interface ShiftAssignment {
	id: string;
	shiftId: string;
	employeeId: string;
	role?: string;
	notes?: string;
}

export interface Employee {
	id: string;
	organizationId: string;
	name: string;
	email: string;
	role: string;
	phone?: string;
	position?: string;
	hireDate?: string;
	address?: string;
	emergencyContact?: string;
	notes?: string;
	avatar?: string;
	hourlyRate?: number;
}

export interface Location {
	id: string;
	organizationId: string;
	name: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	isActive?: boolean;
}

export interface Notification {
	id: string;
	userId: string;
	organizationId: string;
	type:
		| "shift_update"
		| "shift_reminder"
		| "request_update"
		| "system"
		| "message"
		| "document"
		| "calendar"
		| "user"
		| "email"
		| "task";
	title: string;
	message: string;
	isRead: boolean;
	isActionRequired?: boolean;
	actionUrl?: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
	createdAt: string;
}

// Mock data
const mockOrganizations: Organization[] = [
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

const mockSchedules: Schedule[] = [
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

// Helper function for generating unique IDs that works in all browsers
function generateUniqueId(): string {
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
const generateTask = (
	description: string,
	completed: boolean = false
): CheckInTask | CheckOutTask => {
	return {
		id: generateUniqueId(),
		description,
		completed,
	};
};

// Update existing shifts with proper task objects
export const mockShifts: Shift[] = [
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
	{
		id: "shift-203",
		scheduleId: "sch-5",
		employeeId: "emp-1",
		startTime: "2025-03-25T08:00:00",
		endTime: "2025-03-25T16:00:00",
		role: "Supervisor",
		locationId: "loc-1",
		notes: `**Shift Briefing: Special Events Day**

This shift requires extra attention due to the following factors:
- VIP client from overseas visiting at 2pm
- Training new staff members during the afternoon rush
- meeting with management at 1:30pm to discuss workflow improvements

*Please ensure all check-in and check-out tasks are completed thoroughly.*

Rush hour expected between 4-6pm. Additional staff will be on call if needed.

Vehicle inspection at 3:15pm with regional safety coordinator.
`,
		checkInTasks: [
			{
				id: "cvp1hx1nbrhdsmnnifuowt",
				description: "Review daily schedule and special events",
				completed: true,
			},
			{
				id: generateUniqueId(),
				description: "Verify all safety equipment is in place",
				completed: false,
			},
			{
				id: generateUniqueId(),
				description: "Prepare VIP welcome package for afternoon visitors",
				completed: false,
			},
		],
		checkOutTasks: [
			{
				id: generateUniqueId(),
				description: "Complete closing inventory count",
				completed: false,
			},
			{
				id: generateUniqueId(),
				description: "Lock all secure areas and safes",
				completed: true,
			},
			{
				id: generateUniqueId(),
				description: "Submit end-of-day reports",
				completed: false,
			},
		],
	},
	{
		id: "shift-1",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-01T08:00:00",
		endTime: "2023-06-01T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		checkInTasks: [
			generateTask("Check uniform"),
			generateTask("Get communication device"),
			generateTask("Review daily tasks"),
		] as CheckInTask[],
		checkOutTasks: [
			generateTask("Return keys"),
			generateTask("Submit incident reports if any"),
			generateTask("Clean work area"),
		] as CheckOutTask[],
	},
	{
		id: "shift-2",
		scheduleId: "sch-1",
		employeeId: "emp-2",
		startTime: "2023-06-01T12:00:00",
		endTime: "2023-06-01T20:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		checkInTasks: [
			generateTask("Count cash drawer"),
			generateTask("Check staff attendance"),
			generateTask("Review pending issues"),
		] as CheckInTask[],
		checkOutTasks: [
			generateTask("Balance accounts"),
			generateTask("Lock equipment"),
			generateTask("Prepare handover notes"),
		] as CheckOutTask[],
	},
	{
		id: "shift-3",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-22T08:00:00",
		endTime: "2025-03-22T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "High volume expected due to convention.",
		checkInTasks: [
			generateTask("Review parking map"),
			generateTask("Check valet stand supplies"),
			generateTask("Coordinate with hotel staff"),
		],
		checkOutTasks: [
			generateTask("Count tickets"),
			generateTask("Document any damages"),
			generateTask("Restock supplies"),
		],
	},
	{
		id: "shift-4",
		scheduleId: "sch-4",
		employeeId: "emp-2",
		startTime: "2025-03-22T10:00:00",
		endTime: "2025-03-22T18:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		notes: "Staff meeting at 2pm regarding new procedures.",
		checkInTasks: [
			generateTask("Prepare meeting agenda"),
			generateTask("Review employee schedule"),
			generateTask("Collect customer feedback"),
		],
		checkOutTasks: [
			generateTask("Document meeting notes"),
			generateTask("Follow up on customer issues"),
			generateTask("Prepare shift report"),
		],
	},
	{
		id: "shift-5",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-23T08:00:00",
		endTime: "2025-03-23T16:00:00",
		role: "Runner",
		locationId: "loc-1",
		notes: "Early rush expected with convention guests checking out.",
		checkInTasks: [
			generateTask("Review overnight vehicle list"),
			generateTask("Ensure ticket supply is stocked"),
			generateTask("Position staff at hotel exits"),
		] as CheckInTask[],
		checkOutTasks: [
			generateTask("Complete ticket reconciliation"),
			generateTask("Report remaining guest vehicles"),
			generateTask("Clean front desk area"),
		] as CheckOutTask[],
	},
	{
		id: "shift-6",
		scheduleId: "sch-5",
		employeeId: "emp-5",
		startTime: "2025-03-23T09:00:00",
		endTime: "2025-03-23T17:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		notes: "Training a new runner on key procedures.",
		checkInTasks: [
			generateTask("Prepare training materials"),
			generateTask("Assign training buddy"),
			generateTask("Review safety procedures"),
		],
		checkOutTasks: [
			generateTask("Complete trainee evaluation form"),
			generateTask("Get feedback from trainee"),
			generateTask("Update training log"),
		],
	},
	{
		id: "shift-7",
		scheduleId: "sch-5",
		employeeId: "emp-2",
		startTime: "2025-03-23T10:00:00",
		endTime: "2025-03-23T18:00:00",
		role: "Supervisor",
		locationId: "loc-1",
		notes: "Weekly inspection of equipment.",
		checkInTasks: [
			generateTask("Print inspection checklist"),
			generateTask("Ask @michael-chen to gather vests and flags for inventory"),
			generateTask("Print employee roster"),
			generateTask("Make sure @sarah-patel is in the front desk", true),
		] as CheckInTask[],
		checkOutTasks: [
			generateTask("File inspection report"),
			generateTask("Order any needed supplies"),
			generateTask("Update equipment inventory"),
			generateTask("Confirm @emily-garcia completed end-of-shift cleaning"),
		] as CheckOutTask[],
	},
	{
		id: "shift-8",
		scheduleId: "sch-5",
		employeeId: "emp-3",
		startTime: "2025-03-23T12:00:00",
		endTime: "2025-03-23T20:00:00",
		role: "Runner",
		locationId: "loc-2",
		notes:
			"VIP client event with celebrity guest. Extra attention to detail required.",
		checkInTasks: [
			generateTask("Review VIP protocols"),
			generateTask("Prepare premium parking section"),
			generateTask("Brief staff on protocol"),
		],
		checkOutTasks: [
			generateTask("Report VIP feedback"),
			generateTask("Return VIP parking signs"),
			generateTask("Reset special parking area"),
		],
	},
	{
		id: "shift-9",
		scheduleId: "sch-5",
		employeeId: "emp-8",
		startTime: "2025-03-23T13:00:00",
		endTime: "2025-03-23T21:00:00",
		role: "Supervisor",
		locationId: "loc-2",
		notes: "Vehicle inspection with insurance representative at 3pm.",
		checkInTasks: [
			generateTask("Notify staff of inspection"),
			generateTask("Schedule staff coverage during inspection"),
			generateTask("Print maintenance logs"),
		],
		checkOutTasks: [
			generateTask("File insurance inspection report"),
			generateTask("Address any vehicle concerns"),
			generateTask("Update maintenance schedule"),
		],
	},
];

const mockEmployees: Employee[] = [
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
	},
];

// Add mock locations
const mockLocations: Location[] = [
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

// Add mock shift assignments
const mockShiftAssignments: ShiftAssignment[] = [
	{
		id: "sa-61",
		shiftId: "shift-61",
		employeeId: "emp-1",
		role: "Manager",
	},
	{
		id: "sa-203",
		shiftId: "shift-203",
		employeeId: "emp-1",
		role: "Supervisor",
	},
	{
		id: "sa-1",
		shiftId: "shift-1",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-2",
		shiftId: "shift-2",
		employeeId: "emp-2",
		role: "Supervisor",
	},
	{
		id: "sa-3",
		shiftId: "shift-3",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-4",
		shiftId: "shift-4",
		employeeId: "emp-2",
		role: "Supervisor",
		notes: "Taking staff meeting",
	},
	{
		id: "sa-5",
		shiftId: "shift-5",
		employeeId: "emp-1",
		role: "Runner",
	},
	{
		id: "sa-6",
		shiftId: "shift-6",
		employeeId: "emp-5",
		role: "Supervisor",
	},
	{
		id: "sa-7",
		shiftId: "shift-7",
		employeeId: "emp-2",
		role: "Supervisor",
	},
	{
		id: "sa-8",
		shiftId: "shift-8",
		employeeId: "emp-3",
		role: "Runner",
	},
	{
		id: "sa-9",
		shiftId: "shift-9",
		employeeId: "emp-8",
		role: "Supervisor",
	},
];

// Generate mock notifications
const mockNotifications: Notification[] = [
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
	{
		id: "notif-3",
		userId: "user-1",
		organizationId: "org-1",
		type: "request_update",
		title: "Time Off Request Approved",
		message: "Your time off request for next Friday has been approved",
		isRead: false,
		actionUrl: "/profile",
		relatedEntityId: "request-789",
		relatedEntityType: "timeoff_request",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
	},
	{
		id: "notif-4",
		userId: "user-1",
		organizationId: "org-1",
		type: "system",
		title: "Profile Update Required",
		message: "Please update your contact information in your profile",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/profile",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
	},
	{
		id: "notif-5",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "New Shift Available",
		message: "A new shift is available for Tuesday. Tap to claim it.",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-789",
		relatedEntityId: "shift-789",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
	},
	{
		id: "notif-6",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_reminder",
		title: "Clock-in Reminder",
		message: "Your shift started 5 minutes ago. Don't forget to clock in!",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-101",
		relatedEntityId: "shift-101",
		relatedEntityType: "shift",
		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
	},
	{
		id: "notif-7",
		userId: "user-1",
		organizationId: "org-1",
		type: "message",
		title: "New Message from Manager",
		message: "Can you cover Sarah's shift on Thursday? She's out sick.",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/messages/123",
		createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
	},
	{
		id: "notif-8",
		userId: "user-1",
		organizationId: "org-1",
		type: "document",
		title: "Document Needs Signature",
		message: "New company policy document requires your signature by Friday",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/documents/policy-update",
		createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
	},
	{
		id: "notif-9",
		userId: "user-1",
		organizationId: "org-1",
		type: "calendar",
		title: "Team Meeting Added",
		message: "Monthly team meeting scheduled for next Monday at 10 AM",
		isRead: false,
		actionUrl: "/calendar/events/team-meeting",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
	},
	{
		id: "notif-10",
		userId: "user-1",
		organizationId: "org-1",
		type: "user",
		title: "New Employee Joined",
		message: "Michael Johnson has joined the team. Send a welcome message!",
		isRead: true,
		actionUrl: "/team/michael-johnson",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
	},
	{
		id: "notif-11",
		userId: "user-1",
		organizationId: "org-1",
		type: "email",
		title: "Important Email Received",
		message:
			"You have a new email from Regional Manager about next month's schedule",
		isRead: true,
		actionUrl: "/messages/emails/123",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
	},
	{
		id: "notif-12",
		userId: "user-1",
		organizationId: "org-1",
		type: "task",
		title: "Task Assigned: Inventory Check",
		message:
			"You've been assigned to complete monthly inventory check by Wednesday",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/tasks/inventory-check",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
	},
	{
		id: "notif-13",
		userId: "user-1",
		organizationId: "org-1",
		type: "system",
		title: "System Maintenance",
		message: "The system will be down for maintenance on Sunday from 2-4 AM",
		isRead: true,
		actionUrl: "/announcements/system-maintenance",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
	},
	{
		id: "notif-14",
		userId: "user-1",
		organizationId: "org-1",
		type: "shift_update",
		title: "Shift Location Changed",
		message: "Your Friday shift has been moved to Downtown location",
		isRead: false,
		isActionRequired: true,
		actionUrl: "/shifts/shift-456",
		createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
	},
	{
		id: "notif-15",
		userId: "user-1",
		organizationId: "org-1",
		type: "request_update",
		title: "Swap Request Accepted",
		message: "James accepted your request to swap shifts on Tuesday",
		isRead: false,
		actionUrl: "/shifts/swap-requests",
		createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 minutes ago
	},
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Services
export const OrganizationsAPI = {
	getAll: async (): Promise<Organization[]> => {
		await delay(800);
		return [...mockOrganizations];
	},

	getById: async (id: string): Promise<Organization | null> => {
		await delay(500);
		return mockOrganizations.find((org) => org.id === id) || null;
	},

	create: async (data: Omit<Organization, "id">): Promise<Organization> => {
		await delay(1000);
		const newOrg: Organization = {
			id: `org-${Date.now()}`,
			...data,
		};
		mockOrganizations.push(newOrg);
		return newOrg;
	},
};

export const SchedulesAPI = {
	getAll: async (organizationId: string): Promise<Schedule[]> => {
		await delay(800);
		return mockSchedules.filter(
			(schedule) => schedule.organizationId === organizationId
		);
	},

	getById: async (id: string): Promise<Schedule | null> => {
		await delay(500);
		return mockSchedules.find((schedule) => schedule.id === id) || null;
	},

	create: async (data: Omit<Schedule, "id">): Promise<Schedule> => {
		await delay(1000);
		const newSchedule: Schedule = {
			id: `sch-${Date.now()}`,
			...data,
		};
		mockSchedules.push(newSchedule);
		return newSchedule;
	},
};

function generateTasksForMockData(
	tasks: string[]
): CheckInTask[] | CheckOutTask[] {
	return tasks.map((task) => ({
		id: generateUniqueId(),
		description: task,
		completed: false,
	}));
}

// Update the API to handle the new task interfaces
export const ShiftsAPI = {
	getAll: async (
		dateOrScheduleId?: string,
		organizationId?: string
	): Promise<Shift[]> => {
		await delay(800);

		// Filter by date if provided
		let filteredShifts = [...mockShifts];

		if (dateOrScheduleId) {
			// Check if it's a date (YYYY-MM-DD) or a scheduleId (sch-xxx)
			if (dateOrScheduleId.startsWith("sch-")) {
				// It's a scheduleId
				filteredShifts = mockShifts.filter(
					(shift) => shift.scheduleId === dateOrScheduleId
				);
			} else {
				// It's a date
				const dateStart = new Date(dateOrScheduleId);
				dateStart.setHours(0, 0, 0, 0);

				const dateEnd = new Date(dateOrScheduleId);
				dateEnd.setHours(23, 59, 59, 999);

				filteredShifts = mockShifts.filter((shift) => {
					const shiftStart = new Date(shift.startTime);
					return shiftStart >= dateStart && shiftStart <= dateEnd;
				});
			}
		}

		console.log(
			`API filtering with param ${dateOrScheduleId}, found ${filteredShifts.length} shifts`
		);

		// Convert any string arrays to task objects for backward compatibility
		return filteredShifts.map((shift) => ({
			...shift,
			checkInTasks: Array.isArray(shift.checkInTasks)
				? typeof shift.checkInTasks[0] === "string"
					? (generateTasksForMockData(
							shift.checkInTasks as unknown as string[]
					  ) as CheckInTask[])
					: (shift.checkInTasks as CheckInTask[])
				: undefined,
			checkOutTasks: Array.isArray(shift.checkOutTasks)
				? typeof shift.checkOutTasks[0] === "string"
					? (generateTasksForMockData(
							shift.checkOutTasks as unknown as string[]
					  ) as CheckOutTask[])
					: (shift.checkOutTasks as CheckOutTask[])
				: undefined,
		}));
	},

	getById: async (id: string): Promise<Shift | null> => {
		await delay(500);

		console.log(`API: Fetching shift with ID: ${id}`);
		const shift = mockShifts.find((s) => s.id === id);
		if (!shift) {
			console.log(`API: No shift found with ID: ${id}`);
			return null;
		}

		// Convert any string arrays to task objects for backward compatibility
		const processedShift = {
			...shift,
			checkInTasks: Array.isArray(shift.checkInTasks)
				? typeof shift.checkInTasks[0] === "string"
					? (generateTasksForMockData(
							shift.checkInTasks as unknown as string[]
					  ) as CheckInTask[])
					: (shift.checkInTasks as CheckInTask[])
				: undefined,
			checkOutTasks: Array.isArray(shift.checkOutTasks)
				? typeof shift.checkOutTasks[0] === "string"
					? (generateTasksForMockData(
							shift.checkOutTasks as unknown as string[]
					  ) as CheckOutTask[])
					: (shift.checkOutTasks as CheckOutTask[])
				: undefined,
		};

		return processedShift;
	},

	create: async (data: Omit<Shift, "id">): Promise<Shift> => {
		await delay(1000);
		const newShift: Shift = {
			id: `shift-${Date.now()}`,
			...data,
		};
		mockShifts.push(newShift);
		toast.success("Shift created successfully!");
		return newShift;
	},

	updateShiftTasks: async (
		shiftId: string,
		updates: {
			checkInTasks?: CheckInTask[];
			checkOutTasks?: CheckOutTask[];
		}
	): Promise<Shift | null> => {
		await delay(800);

		// Find the shift
		const shiftIndex = mockShifts.findIndex((s) => s.id === shiftId);

		if (shiftIndex === -1) {
			return null;
		}

		// Update the tasks
		const updatedShift = { ...mockShifts[shiftIndex] };

		if (updates.checkInTasks !== undefined) {
			updatedShift.checkInTasks = [...updates.checkInTasks];
		}

		if (updates.checkOutTasks !== undefined) {
			updatedShift.checkOutTasks = [...updates.checkOutTasks];
		}

		// Save the updated shift
		mockShifts[shiftIndex] = updatedShift;

		return updatedShift;
	},

	update: async (
		shift: Partial<Shift> & { id: string }
	): Promise<Shift | null> => {
		await delay(800);

		const index = mockShifts.findIndex((s) => s.id === shift.id);
		if (index === -1) {
			return null;
		}

		// Update the shift data
		const updatedShift = {
			...mockShifts[index],
			...shift,
		};

		mockShifts[index] = updatedShift;
		toast.success("Shift updated successfully!");
		return updatedShift;
	},

	delete: async (id: string): Promise<boolean> => {
		await delay(600);

		const index = mockShifts.findIndex((shift) => shift.id === id);
		if (index === -1) {
			return false;
		}

		mockShifts.splice(index, 1);
		return true;
	},
};

export const EmployeesAPI = {
	getAll: async (organizationId: string): Promise<Employee[]> => {
		await delay(800);
		return mockEmployees.filter(
			(employee) => employee.organizationId === organizationId
		);
	},

	getById: async (id: string): Promise<Employee | null> => {
		await delay(500);
		return mockEmployees.find((employee) => employee.id === id) || null;
	},

	create: async (data: Omit<Employee, "id" | "role">): Promise<Employee> => {
		await delay(1000);
		const newEmployee: Employee = {
			id: `emp-${Date.now()}`,
			...data,
			role: data.position || "Employee",
		};
		mockEmployees.push(newEmployee);
		toast.success("Employee added successfully!");
		return newEmployee;
	},

	bulkCreate: async (
		dataArray: Omit<Employee, "id" | "role">[]
	): Promise<Employee[]> => {
		await delay(1500);

		// Enforce the maximum limit of 100 employees per upload
		const MAX_EMPLOYEES = 100;
		if (dataArray.length > MAX_EMPLOYEES) {
			throw new Error(
				`Upload limit exceeded. Maximum ${MAX_EMPLOYEES} employees per upload.`
			);
		}

		const newEmployees: Employee[] = dataArray.map((data, index) => ({
			id: `emp-${Date.now()}-${index}`,
			...data,
			role: "Employee", // Set default role since we no longer collect position
			// Ensure only valid fields are passed (name, email, phone, hourlyRate)
			position: undefined,
			hireDate: undefined,
			address: undefined,
			emergencyContact: undefined,
			notes: undefined,
		}));

		mockEmployees.push(...newEmployees);
		toast.success(`${newEmployees.length} employees added successfully!`);
		return newEmployees;
	},

	update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
		await delay(800);

		const index = mockEmployees.findIndex((employee) => employee.id === id);
		if (index === -1) {
			throw new Error(`Employee with id ${id} not found`);
		}

		// Update the employee data
		const updatedEmployee = {
			...mockEmployees[index],
			...data,
		};

		mockEmployees[index] = updatedEmployee;
		toast.success("Employee updated successfully!");
		return updatedEmployee;
	},

	delete: async (id: string): Promise<void> => {
		await delay(600);

		const index = mockEmployees.findIndex((employee) => employee.id === id);
		if (index === -1) {
			throw new Error(`Employee with id ${id} not found`);
		}

		// Remove the employee
		mockEmployees.splice(index, 1);
		toast.success("Employee deleted successfully!");
	},
};

export const LocationsAPI = {
	getAll: async (organizationId: string): Promise<Location[]> => {
		await delay(800);
		return mockLocations.filter(
			(location) => location.organizationId === organizationId
		);
	},

	getById: async (id: string): Promise<Location | null> => {
		await delay(500);
		return mockLocations.find((location) => location.id === id) || null;
	},

	create: async (data: Omit<Location, "id">): Promise<Location> => {
		await delay(1000);
		const newLocation: Location = {
			id: `loc-${Date.now()}`,
			...data,
		};
		mockLocations.push(newLocation);
		toast.success("Location added successfully!");
		return newLocation;
	},

	update: async (id: string, data: Partial<Location>): Promise<Location> => {
		await delay(800);

		const index = mockLocations.findIndex((location) => location.id === id);
		if (index === -1) {
			throw new Error(`Location with id ${id} not found`);
		}

		// Update the location data
		const updatedLocation = {
			...mockLocations[index],
			...data,
		};

		mockLocations[index] = updatedLocation;
		toast.success("Location updated successfully!");
		return updatedLocation;
	},

	delete: async (id: string): Promise<void> => {
		await delay(600);

		const index = mockLocations.findIndex((location) => location.id === id);
		if (index === -1) {
			throw new Error(`Location with id ${id} not found`);
		}

		// Remove the location
		mockLocations.splice(index, 1);
		toast.success("Location deleted successfully!");
	},
};

// Add ShiftAssignments API
export const ShiftAssignmentsAPI = {
	getByShiftId: async (shiftId: string): Promise<ShiftAssignment[]> => {
		await delay(500);
		return mockShiftAssignments.filter(
			(assignment) => assignment.shiftId === shiftId
		);
	},

	create: async (
		data: Omit<ShiftAssignment, "id">
	): Promise<ShiftAssignment> => {
		await delay(800);
		const newAssignment: ShiftAssignment = {
			id: `sa-${Date.now()}`,
			...data,
		};
		mockShiftAssignments.push(newAssignment);
		toast.success("Employee assigned to shift successfully!");
		return newAssignment;
	},

	delete: async (id: string): Promise<void> => {
		await delay(600);

		const index = mockShiftAssignments.findIndex(
			(assignment) => assignment.id === id
		);

		if (index === -1) {
			throw new Error(`Assignment with id ${id} not found`);
		}

		mockShiftAssignments.splice(index, 1);
		toast.success("Employee removed from shift successfully!");
	},

	deleteByShiftAndEmployee: async (
		shiftId: string,
		employeeId: string
	): Promise<void> => {
		await delay(600);

		const index = mockShiftAssignments.findIndex(
			(assignment) =>
				assignment.shiftId === shiftId && assignment.employeeId === employeeId
		);

		if (index === -1) {
			throw new Error(
				`Assignment for shift ${shiftId} and employee ${employeeId} not found`
			);
		}

		mockShiftAssignments.splice(index, 1);
		toast.success("Employee removed from shift successfully!");
	},
};

// Notifications API
export const NotificationsAPI = {
	getAll: async (userId: string): Promise<Notification[]> => {
		await delay(500); // Simulate network delay

		// Return copy of mock data sorted by date (newest first)
		return [...mockNotifications]
			.filter((notification) => notification.userId === userId)
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
	},

	getUnread: async (userId: string): Promise<Notification[]> => {
		await delay(300); // Simulate network delay

		return [...mockNotifications]
			.filter(
				(notification) => notification.userId === userId && !notification.isRead
			)
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
	},

	markAsRead: async (notificationId: string): Promise<void> => {
		await delay(300); // Simulate network delay

		const notification = mockNotifications.find((n) => n.id === notificationId);
		if (notification) {
			notification.isRead = true;
		}
	},

	markAllAsRead: async (userId: string): Promise<void> => {
		await delay(500); // Simulate network delay

		mockNotifications
			.filter((notification) => notification.userId === userId)
			.forEach((notification) => {
				notification.isRead = true;
			});
	},

	dismissNotification: async (notificationId: string): Promise<void> => {
		await delay(300); // Simulate network delay

		const index = mockNotifications.findIndex((n) => n.id === notificationId);
		if (index !== -1) {
			mockNotifications.splice(index, 1);
		}
	},

	dismissAllNotifications: async (userId: string): Promise<void> => {
		await delay(500); // Simulate network delay

		const userNotifications = mockNotifications.filter(
			(n) => n.userId === userId
		);
		userNotifications.forEach((notification) => {
			const index = mockNotifications.indexOf(notification);
			if (index !== -1) {
				mockNotifications.splice(index, 1);
			}
		});
	},

	// Method to simulate creating a new notification (for demo purposes)
	createNotification: async (
		notification: Omit<Notification, "id" | "createdAt">
	): Promise<Notification> => {
		await delay(300); // Simulate network delay

		const newNotification: Notification = {
			...notification,
			id: `notif-${generateUniqueId()}`,
			createdAt: new Date().toISOString(),
		};

		mockNotifications.push(newNotification);
		return newNotification;
	},
};

// Helper functions for generating mock data
const generateMockLocations = (count: number = 100): Location[] => {
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

const generateMockEmployees = (count: number = 100): Employee[] => {
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
		});
	}

	return employees;
};

const generateMockShifts = (
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

// Generate large sets of mock data
const generateLargeMockData = () => {
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

// Create mock data
generateLargeMockData();
