// API implementation that uses mock data
import { toast } from "sonner";
import {
	Employee,
	Location,
	Notification,
	Organization,
	Schedule,
	Shift,
	ShiftAssignment,
	ShiftTask,
	isSchedule,
	ScheduleCreateInput,
	ShiftItemCreateInput,
	ShiftCreateInput,
} from "./types";
import { delay, generateTasksForMockData, generateUniqueId } from "./utils";
import {
	mockEmployees,
	mockLocations,
	mockNotifications,
	mockOrganizations,
	mockShifts,
	mockShiftAssignments,
	generateLargeMockData,
} from "./data";

// Organizations API
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

	update: async (
		organization: Partial<Organization> & { id: string }
	): Promise<Organization | null> => {
		await delay(800);

		const index = mockOrganizations.findIndex(
			(org) => org.id === organization.id
		);
		if (index === -1) {
			return null;
		}

		// Update the organization with the new data
		mockOrganizations[index] = {
			...mockOrganizations[index],
			...organization,
		};

		return mockOrganizations[index];
	},
};

/**
 * Consolidated ShiftsAPI for the unified shifts table
 *
 * This API handles both schedules (is_schedule=true) and individual shifts (is_schedule=false)
 * using a hierarchical self-referencing model where shifts reference their parent schedule
 * via the parent_shift_id field.
 */
export const ShiftsAPI = {
	// Schedule methods
	/**
	 * Get all schedules for an organization
	 * @param organizationId Optional organization ID to filter by
	 * @returns Array of Schedule objects
	 */
	getAllSchedules: async (organizationId?: string): Promise<Schedule[]> => {
		await delay(800);
		let filteredShifts = mockShifts.filter(
			(shift) => shift.is_schedule === true
		);

		if (organizationId) {
			filteredShifts = filteredShifts.filter(
				(shift) => shift.organization_id === organizationId
			);
		}

		return filteredShifts as Schedule[];
	},

	/**
	 * Get a specific schedule by ID
	 * @param id Schedule ID
	 * @returns Schedule object or null if not found
	 */
	getScheduleById: async (id: string): Promise<Schedule | null> => {
		await delay(500);
		const shift = mockShifts.find((s) => s.id === id && s.is_schedule === true);
		return (shift as Schedule) || null;
	},

	/**
	 * Create a new schedule
	 * @param data Schedule data
	 * @returns Created Schedule object
	 */
	createSchedule: async (data: ScheduleCreateInput): Promise<Schedule> => {
		await delay(1000);
		const newSchedule: Schedule = {
			id: `sch-${Date.now()}`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...data,
			is_schedule: true,
		};
		mockShifts.push(newSchedule);
		toast.success("Schedule created successfully!");
		return newSchedule;
	},

	// Shift methods
	/**
	 * Get all shifts for a specific schedule
	 * @param scheduleId Parent schedule ID
	 * @returns Array of Shift objects
	 */
	getShiftsForSchedule: async (scheduleId: string): Promise<Shift[]> => {
		await delay(800);
		return mockShifts.filter(
			(shift) =>
				shift.parent_shift_id === scheduleId && shift.is_schedule === false
		);
	},

	/**
	 * Get a specific shift by ID
	 * @param id Shift ID
	 * @returns Shift object or null if not found
	 */
	getShiftById: async (id: string): Promise<Shift | null> => {
		await delay(500);
		console.log(`API: Fetching shift with ID: ${id}`);
		return mockShifts.find((s) => s.id === id) || null;
	},

	/**
	 * Create a new shift within a schedule
	 * @param data Shift data including parent_shift_id
	 * @returns Created Shift object
	 */
	createShift: async (data: ShiftItemCreateInput): Promise<Shift> => {
		await delay(1000);
		const newShift: Shift = {
			id: `shift-${Date.now()}`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...data,
			is_schedule: false,
		};
		mockShifts.push(newShift);
		toast.success("Shift created successfully!");
		return newShift;
	},

	// General methods for both shifts and schedules
	/**
	 * Update an existing shift or schedule
	 * @param id Shift or schedule ID
	 * @param data Updated data
	 * @returns Updated Shift or Schedule object
	 */
	updateShift: async (
		id: string,
		data: Partial<ShiftCreateInput>
	): Promise<Shift> => {
		await delay(1000);
		const index = mockShifts.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error(`Shift with ID ${id} not found`);
		}

		mockShifts[index] = {
			...mockShifts[index],
			...data,
			updated_at: new Date().toISOString(),
		};

		toast.success(
			`${
				mockShifts[index].is_schedule ? "Schedule" : "Shift"
			} updated successfully!`
		);
		return mockShifts[index];
	},

	/**
	 * Delete a shift or schedule
	 * If deleting a schedule, also deletes all associated shifts
	 * @param id Shift or schedule ID
	 */
	deleteShift: async (id: string): Promise<void> => {
		await delay(800);
		const index = mockShifts.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error(`Shift with ID ${id} not found`);
		}

		// For schedules, also delete all associated shifts
		if (mockShifts[index].is_schedule) {
			// Remove all shifts that belong to this schedule
			const scheduleId = mockShifts[index].id;
			const shiftIndicesToRemove = mockShifts
				.map((s, i) => (s.parent_shift_id === scheduleId ? i : -1))
				.filter((i) => i !== -1);

			// Remove in reverse order to not mess up the indices
			for (let i = shiftIndicesToRemove.length - 1; i >= 0; i--) {
				mockShifts.splice(shiftIndicesToRemove[i], 1);
			}
		}

		mockShifts.splice(index, 1);
		toast.success(
			`${
				mockShifts[index]?.is_schedule ? "Schedule" : "Shift"
			} deleted successfully!`
		);
	},

	// Utility methods
	/**
	 * Update tasks for a shift
	 * @param shiftId Shift ID
	 * @param updates Task updates
	 * @returns Updated Shift object
	 */
	updateShiftTasks: async (
		shiftId: string,
		updates: {
			check_in_tasks?: ShiftTask[];
			check_out_tasks?: ShiftTask[];
		}
	): Promise<Shift> => {
		await delay(800);
		const index = mockShifts.findIndex((s) => s.id === shiftId);
		if (index === -1) {
			throw new Error(`Shift with ID ${shiftId} not found`);
		}

		mockShifts[index] = {
			...mockShifts[index],
			...updates,
			updated_at: new Date().toISOString(),
		};

		return mockShifts[index];
	},

	// Search and filter methods
	/**
	 * Get shifts based on filters
	 * @param filters Optional filters for shifts
	 * @returns Array of filtered Shift objects
	 */
	getAll: async (filters?: {
		start_time?: string;
		end_time?: string;
		organization_id?: string;
		is_schedule?: boolean;
		parent_shift_id?: string;
	}): Promise<Shift[]> => {
		await delay(800);

		let filteredShifts = [...mockShifts];

		if (filters) {
			if (filters.organization_id) {
				filteredShifts = filteredShifts.filter(
					(shift) => shift.organization_id === filters.organization_id
				);
			}

			if (filters.is_schedule !== undefined) {
				filteredShifts = filteredShifts.filter(
					(shift) => shift.is_schedule === filters.is_schedule
				);
			}

			if (filters.parent_shift_id) {
				filteredShifts = filteredShifts.filter(
					(shift) => shift.parent_shift_id === filters.parent_shift_id
				);
			}

			if (filters.start_time && filters.end_time) {
				const startTime = new Date(filters.start_time);
				const endTime = new Date(filters.end_time);

				filteredShifts = filteredShifts.filter((shift) => {
					const shiftStart = new Date(shift.start_time);
					const shiftEnd = new Date(shift.end_time);

					// Check if the shift overlaps with the date range
					return (
						(shiftStart >= startTime && shiftStart <= endTime) ||
						(shiftEnd >= startTime && shiftEnd <= endTime) ||
						(shiftStart <= startTime && shiftEnd >= endTime)
					);
				});
			}
		}

		return filteredShifts;
	},
};

/**
 * Backward compatibility API for components that still use SchedulesAPI
 * This is a wrapper around the consolidated ShiftsAPI
 */
export const SchedulesAPI = {
	/**
	 * Get all schedules for an organization
	 * @param organizationId Optional organization ID
	 * @returns Array of Schedule objects
	 */
	getAll: async (organizationId?: string) => {
		return ShiftsAPI.getAllSchedules(organizationId);
	},

	/**
	 * Get a specific schedule by ID
	 * @param id Schedule ID
	 * @returns Schedule object or null if not found
	 */
	getById: async (id: string) => {
		return ShiftsAPI.getScheduleById(id);
	},

	/**
	 * Create a new schedule
	 * @param scheduleData Schedule data
	 * @returns Created Schedule object
	 */
	create: async (scheduleData: any) => {
		const data: ScheduleCreateInput = {
			...scheduleData,
			is_schedule: true,
			organization_id:
				scheduleData.organization_id || scheduleData.organizationId,
			start_time: scheduleData.start_time || scheduleData.start_date,
			end_time: scheduleData.end_time || scheduleData.end_date,
		};
		return ShiftsAPI.createSchedule(data);
	},

	/**
	 * Update a schedule
	 * @param id Schedule ID
	 * @param scheduleData Updated schedule data
	 * @returns Updated Schedule object
	 */
	update: async (id: string, scheduleData: any) => {
		return ShiftsAPI.updateShift(id, scheduleData);
	},

	/**
	 * Delete a schedule and all its shifts
	 * @param id Schedule ID
	 */
	delete: async (id: string) => {
		return ShiftsAPI.deleteShift(id);
	},

	/**
	 * Get all shifts for a schedule
	 * @param scheduleId Schedule ID
	 * @returns Array of Shift objects
	 */
	getShifts: async (scheduleId: string) => {
		return ShiftsAPI.getShiftsForSchedule(scheduleId);
	},
};

// Employees API
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
			status: data.status || "invited",
			isOnline: false,
			lastActive: new Date().toISOString(),
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
			role: "Employee",
			position: undefined,
			hireDate: undefined,
			address: undefined,
			emergencyContact: undefined,
			notes: undefined,
			status: "invited",
			isOnline: false,
			lastActive: new Date().toISOString(),
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

// Locations API
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

	createBulk: async (
		locations: Omit<Location, "id">[]
	): Promise<Location[]> => {
		await delay(1500);

		const createdLocations: Location[] = locations.map((location, index) => {
			// Create unique IDs with small time offset to ensure uniqueness
			const newLocation: Location = {
				id: `loc-${Date.now() + index}`,
				...location,
			};
			mockLocations.push(newLocation);
			return newLocation;
		});

		toast.success(`${createdLocations.length} locations added successfully!`);
		return createdLocations;
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

// ShiftAssignments API
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

// Initialize mock data for the application
export const initMockData = () => {
	console.log("Initializing mock data...");

	// Generate large datasets if needed
	if (mockShifts.length < 10) {
		generateLargeMockData();
	}

	console.log(
		`Mock data initialized with ${mockShifts.length} shifts (including ${
			mockShifts.filter((s) => s.is_schedule).length
		} schedules)`
	);
};
