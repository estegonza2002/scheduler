// Mock API implementation that simulates backend calls
import { toast } from "sonner";

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

export interface Shift {
	id: string;
	scheduleId: string;
	employeeId?: string; // Will be deprecated in favor of ShiftAssignment
	startTime: string;
	endTime: string;
	role?: string;
	notes?: string;
	locationId?: string;
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

// Mock data
const mockOrganizations: Organization[] = [
	{
		id: "org-1",
		name: "Coffee Shop",
		description: "Local coffee shop with 10 employees",
	},
	{
		id: "org-2",
		name: "Restaurant",
		description: "Fine dining restaurant with 25 employees",
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
];

const mockShifts: Shift[] = [
	{
		id: "shift-1",
		scheduleId: "sch-1",
		employeeId: "emp-1",
		startTime: "2023-06-01T08:00:00",
		endTime: "2023-06-01T16:00:00",
		role: "Barista",
		locationId: "loc-1",
	},
	{
		id: "shift-2",
		scheduleId: "sch-1",
		employeeId: "emp-2",
		startTime: "2023-06-01T16:00:00",
		endTime: "2023-06-01T23:00:00",
		role: "Manager",
		locationId: "loc-2",
	},
	// Add March 2025 shifts
	{
		id: "shift-3",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-21T09:00:00",
		endTime: "2025-03-21T17:00:00",
		role: "Barista",
		locationId: "loc-1",
		notes: "Morning rush expected",
	},
	{
		id: "shift-4",
		scheduleId: "sch-4",
		employeeId: "emp-2",
		startTime: "2025-03-21T14:00:00",
		endTime: "2025-03-21T22:00:00",
		role: "Manager",
		locationId: "loc-1",
		notes: "Staff meeting at 3pm",
	},
	{
		id: "shift-5",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-22T09:00:00",
		endTime: "2025-03-22T17:00:00",
		role: "Barista",
		locationId: "loc-1",
	},
	{
		id: "shift-6",
		scheduleId: "sch-4",
		employeeId: "emp-2",
		startTime: "2025-03-22T10:00:00",
		endTime: "2025-03-22T18:00:00",
		role: "Manager",
		locationId: "loc-2",
	},
	{
		id: "shift-7",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-23T08:00:00",
		endTime: "2025-03-23T16:00:00",
		role: "Barista",
		locationId: "loc-3",
	},
	{
		id: "shift-8",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-29T07:00:00",
		endTime: "2025-03-29T15:00:00",
		role: "Barista",
		locationId: "loc-1",
	},
	{
		id: "shift-9",
		scheduleId: "sch-4",
		employeeId: "emp-2",
		startTime: "2025-03-29T08:00:00",
		endTime: "2025-03-29T16:00:00",
		role: "Manager",
		locationId: "loc-2",
	},
	{
		id: "shift-10",
		scheduleId: "sch-4",
		employeeId: "emp-1",
		startTime: "2025-03-29T12:00:00",
		endTime: "2025-03-29T20:00:00",
		role: "Barista",
		locationId: "loc-3",
	},
];

const mockEmployees: Employee[] = [
	{
		id: "emp-1",
		organizationId: "org-1",
		name: "John Doe",
		email: "john@example.com",
		role: "Barista",
		phone: "555-123-4567",
		position: "Senior Barista",
		hireDate: "2023-01-15",
		address: "123 Coffee St, Brewville",
		emergencyContact: "Jane Doe (Wife) - 555-987-6543",
		notes: "Certified in latte art. Prefers morning shifts.",
		hourlyRate: 15.5,
	},
	{
		id: "emp-2",
		organizationId: "org-1",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "Manager",
		phone: "555-234-5678",
		position: "Store Manager",
		hireDate: "2022-06-10",
		address: "456 Latte Ave, Brewville",
		emergencyContact: "Mark Smith (Husband) - 555-876-5432",
		notes: "MBA in Business Management. Handles vendor relationships.",
		hourlyRate: 22.75,
	},
	{
		id: "emp-3",
		organizationId: "org-2",
		name: "Alice Johnson",
		email: "alice@example.com",
		role: "Chef",
		phone: "555-345-6789",
		position: "Head Chef",
		hireDate: "2022-03-22",
		address: "789 Culinary Blvd, Tasteville",
		emergencyContact: "Bob Johnson (Brother) - 555-765-4321",
		notes: "Specializes in French cuisine. Needs Mondays off.",
		hourlyRate: 24.5,
	},
];

// Add mock locations
const mockLocations: Location[] = [
	{
		id: "loc-1",
		organizationId: "org-1",
		name: "Downtown Shop",
		address: "123 Main Street",
		city: "San Francisco",
		state: "CA",
		zipCode: "94105",
		isActive: true,
	},
	{
		id: "loc-2",
		organizationId: "org-1",
		name: "Westfield Mall Kiosk",
		address: "845 Market St",
		city: "San Francisco",
		state: "CA",
		zipCode: "94103",
		isActive: true,
	},
	{
		id: "loc-3",
		organizationId: "org-1",
		name: "Airport Terminal",
		address: "SFO International Terminal",
		city: "San Francisco",
		state: "CA",
		zipCode: "94128",
		isActive: true,
	},
	{
		id: "loc-4",
		organizationId: "org-2",
		name: "Midtown Restaurant",
		address: "555 Broadway",
		city: "New York",
		state: "NY",
		zipCode: "10012",
		isActive: true,
	},
];

// Add mock shift assignments
const mockShiftAssignments: ShiftAssignment[] = [
	{
		id: "sa-1",
		shiftId: "shift-1",
		employeeId: "emp-1",
		role: "Barista",
	},
	{
		id: "sa-2",
		shiftId: "shift-2",
		employeeId: "emp-2",
		role: "Manager",
	},
	// March 2025 shifts
	{
		id: "sa-3",
		shiftId: "shift-3",
		employeeId: "emp-1",
		role: "Barista",
	},
	{
		id: "sa-4",
		shiftId: "shift-4",
		employeeId: "emp-2",
		role: "Manager",
		notes: "Taking staff meeting",
	},
	{
		id: "sa-5",
		shiftId: "shift-5",
		employeeId: "emp-1",
		role: "Barista",
	},
	{
		id: "sa-6",
		shiftId: "shift-6",
		employeeId: "emp-2",
		role: "Manager",
	},
	{
		id: "sa-7",
		shiftId: "shift-7",
		employeeId: "emp-1",
		role: "Barista",
	},
	{
		id: "sa-8",
		shiftId: "shift-8",
		employeeId: "emp-1",
		role: "Barista",
	},
	{
		id: "sa-9",
		shiftId: "shift-9",
		employeeId: "emp-2",
		role: "Manager",
	},
	{
		id: "sa-10",
		shiftId: "shift-10",
		employeeId: "emp-1",
		role: "Barista",
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

export const ShiftsAPI = {
	getAll: async (
		scheduleId: string,
		filters?: { locationId?: string; employeeId?: string }
	): Promise<Shift[]> => {
		await delay(800);
		let filteredShifts = mockShifts.filter(
			(shift) => shift.scheduleId === scheduleId
		);

		// Apply additional filters
		if (filters) {
			if (filters.locationId) {
				filteredShifts = filteredShifts.filter(
					(shift) => shift.locationId === filters.locationId
				);
			}
			if (filters.employeeId) {
				filteredShifts = filteredShifts.filter(
					(shift) => shift.employeeId === filters.employeeId
				);
			}
		}

		return filteredShifts;
	},

	getById: async (id: string): Promise<Shift | null> => {
		await delay(500);
		return mockShifts.find((shift) => shift.id === id) || null;
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

	update: async (id: string, data: Partial<Shift>): Promise<Shift> => {
		await delay(800);

		const index = mockShifts.findIndex((shift) => shift.id === id);
		if (index === -1) {
			throw new Error(`Shift with id ${id} not found`);
		}

		// Update the shift data
		const updatedShift = {
			...mockShifts[index],
			...data,
		};

		mockShifts[index] = updatedShift;
		toast.success("Shift updated successfully!");
		return updatedShift;
	},

	delete: async (id: string): Promise<void> => {
		await delay(600);

		const index = mockShifts.findIndex((shift) => shift.id === id);
		if (index === -1) {
			throw new Error(`Shift with id ${id} not found`);
		}

		// Remove the shift
		mockShifts.splice(index, 1);
		toast.success("Shift deleted successfully!");
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
