// API implementation that uses mock data
import { toast } from "sonner";
import {
	CheckInTask,
	CheckOutTask,
	Employee,
	Location,
	Notification,
	Organization,
	Schedule,
	Shift,
	ShiftAssignment,
} from "./types";
import { delay, generateTasksForMockData, generateUniqueId } from "./utils";
import {
	mockEmployees,
	mockLocations,
	mockNotifications,
	mockOrganizations,
	mockSchedules,
	mockShiftAssignments,
	mockShifts,
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

// Schedules API
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

// Shifts API
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

// Initialize additional mock data if needed
export const initMockData = () => {
	// Only regenerate if needed
	if (mockLocations.length <= 10) {
		generateLargeMockData();
	}
};
