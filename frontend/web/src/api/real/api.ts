import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import {
	Employee,
	Location,
	Notification,
	Organization,
	Schedule,
	Shift,
	ShiftAssignment,
	ShiftTask,
	ScheduleCreateInput,
	ShiftItemCreateInput,
	ShiftCreateInput,
} from "../mock/types"; // Reuse the same types

// Organizations API
export const OrganizationsAPI = {
	getAll: async (): Promise<Organization[]> => {
		const { data, error } = await supabase.from("organizations").select("*");

		if (error) {
			toast.error("Failed to fetch organizations");
			console.error("Error fetching organizations:", error);
			return [];
		}

		return data as Organization[];
	},

	getById: async (id: string): Promise<Organization | null> => {
		const { data, error } = await supabase
			.from("organizations")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			toast.error("Failed to fetch organization");
			console.error("Error fetching organization:", error);
			return null;
		}

		return data as Organization;
	},

	create: async (data: Omit<Organization, "id">): Promise<Organization> => {
		const { data: newOrg, error } = await supabase
			.from("organizations")
			.insert(data)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create organization");
			console.error("Error creating organization:", error);
			throw error;
		}

		toast.success("Organization created successfully!");
		return newOrg as Organization;
	},

	update: async (
		organization: Partial<Organization> & { id: string }
	): Promise<Organization | null> => {
		const { data, error } = await supabase
			.from("organizations")
			.update(organization)
			.eq("id", organization.id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update organization");
			console.error("Error updating organization:", error);
			return null;
		}

		toast.success("Organization updated successfully!");
		return data as Organization;
	},
};

// Shifts API
export const ShiftsAPI = {
	// Schedule methods
	getAllSchedules: async (organizationId?: string): Promise<Schedule[]> => {
		let query = supabase.from("shifts").select("*").eq("is_schedule", true);

		if (organizationId) {
			query = query.eq("organization_id", organizationId);
		}

		const { data, error } = await query;

		if (error) {
			toast.error("Failed to fetch schedules");
			console.error("Error fetching schedules:", error);
			return [];
		}

		return data as Schedule[];
	},

	getScheduleById: async (id: string): Promise<Schedule | null> => {
		const { data, error } = await supabase
			.from("shifts")
			.select("*")
			.eq("id", id)
			.eq("is_schedule", true)
			.single();

		if (error) {
			toast.error("Failed to fetch schedule");
			console.error("Error fetching schedule:", error);
			return null;
		}

		return data as Schedule;
	},

	createSchedule: async (data: ScheduleCreateInput): Promise<Schedule> => {
		const newSchedule = {
			...data,
			is_schedule: true,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data: createdSchedule, error } = await supabase
			.from("shifts")
			.insert(newSchedule)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create schedule");
			console.error("Error creating schedule:", error);
			throw error;
		}

		toast.success("Schedule created successfully!");
		return createdSchedule as Schedule;
	},

	// Shift methods
	getShiftsForSchedule: async (scheduleId: string): Promise<Shift[]> => {
		const { data, error } = await supabase
			.from("shifts")
			.select("*")
			.eq("parent_shift_id", scheduleId)
			.eq("is_schedule", false);

		if (error) {
			toast.error("Failed to fetch shifts");
			console.error("Error fetching shifts:", error);
			return [];
		}

		return data as Shift[];
	},

	getShiftById: async (id: string): Promise<Shift | null> => {
		const { data, error } = await supabase
			.from("shifts")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			toast.error("Failed to fetch shift");
			console.error("Error fetching shift:", error);
			return null;
		}

		return data as Shift;
	},

	createShift: async (data: ShiftItemCreateInput): Promise<Shift> => {
		const newShift = {
			...data,
			is_schedule: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data: createdShift, error } = await supabase
			.from("shifts")
			.insert(newShift)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create shift");
			console.error("Error creating shift:", error);
			throw error;
		}

		toast.success("Shift created successfully!");
		return createdShift as Shift;
	},

	// General methods for both shifts and schedules
	updateShift: async (
		id: string,
		data: Partial<ShiftCreateInput>
	): Promise<Shift> => {
		const updatedData = {
			...data,
			updated_at: new Date().toISOString(),
		};

		const { data: updatedShift, error } = await supabase
			.from("shifts")
			.update(updatedData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update shift");
			console.error("Error updating shift:", error);
			throw error;
		}

		toast.success(
			`${updatedShift.is_schedule ? "Schedule" : "Shift"} updated successfully!`
		);
		return updatedShift as Shift;
	},

	deleteShift: async (id: string): Promise<void> => {
		const { error } = await supabase.from("shifts").delete().eq("id", id);

		if (error) {
			toast.error("Failed to delete shift");
			console.error("Error deleting shift:", error);
			throw error;
		}

		toast.success("Shift deleted successfully!");
	},

	// Additional methods as needed...
};

// Locations API
export const LocationsAPI = {
	getAll: async (organizationId?: string): Promise<Location[]> => {
		let query = supabase.from("locations").select("*");

		if (organizationId) {
			query = query.eq("organization_id", organizationId);
		}

		const { data, error } = await query;

		if (error) {
			toast.error("Failed to fetch locations");
			console.error("Error fetching locations:", error);
			return [];
		}

		return data as Location[];
	},

	getById: async (id: string): Promise<Location | null> => {
		const { data, error } = await supabase
			.from("locations")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			toast.error("Failed to fetch location");
			console.error("Error fetching location:", error);
			return null;
		}

		return data as Location;
	},

	create: async (data: Omit<Location, "id">): Promise<Location> => {
		const { data: newLocation, error } = await supabase
			.from("locations")
			.insert(data)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create location");
			console.error("Error creating location:", error);
			throw error;
		}

		toast.success("Location created successfully!");
		return newLocation as Location;
	},

	update: async (
		location: Partial<Location> & { id: string }
	): Promise<Location | null> => {
		const { data, error } = await supabase
			.from("locations")
			.update(location)
			.eq("id", location.id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update location");
			console.error("Error updating location:", error);
			return null;
		}

		toast.success("Location updated successfully!");
		return data as Location;
	},
};

// Employees API
export const EmployeesAPI = {
	getAll: async (organizationId?: string): Promise<Employee[]> => {
		let query = supabase.from("employees").select("*");

		if (organizationId) {
			query = query.eq("organization_id", organizationId);
		}

		const { data, error } = await query;

		if (error) {
			toast.error("Failed to fetch employees");
			console.error("Error fetching employees:", error);
			return [];
		}

		return data as Employee[];
	},

	getById: async (id: string): Promise<Employee | null> => {
		const { data, error } = await supabase
			.from("employees")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			toast.error("Failed to fetch employee");
			console.error("Error fetching employee:", error);
			return null;
		}

		return data as Employee;
	},

	create: async (data: Omit<Employee, "id">): Promise<Employee> => {
		const { data: newEmployee, error } = await supabase
			.from("employees")
			.insert(data)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create employee");
			console.error("Error creating employee:", error);
			throw error;
		}

		toast.success("Employee created successfully!");
		return newEmployee as Employee;
	},

	update: async (
		employee: Partial<Employee> & { id: string }
	): Promise<Employee | null> => {
		const { data, error } = await supabase
			.from("employees")
			.update(employee)
			.eq("id", employee.id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update employee");
			console.error("Error updating employee:", error);
			return null;
		}

		toast.success("Employee updated successfully!");
		return data as Employee;
	},

	delete: async (id: string): Promise<void> => {
		const { error } = await supabase.from("employees").delete().eq("id", id);

		if (error) {
			toast.error("Failed to delete employee");
			console.error("Error deleting employee:", error);
			throw error;
		}

		toast.success("Employee deleted successfully!");
	},
};

// Shift Assignments API
export const ShiftAssignmentsAPI = {
	getAll: async (shiftId?: string): Promise<ShiftAssignment[]> => {
		let query = supabase.from("shift_assignments").select("*");

		if (shiftId) {
			query = query.eq("shift_id", shiftId);
		}

		const { data, error } = await query;

		if (error) {
			toast.error("Failed to fetch shift assignments");
			console.error("Error fetching shift assignments:", error);
			return [];
		}

		return data as ShiftAssignment[];
	},

	create: async (
		data: Omit<ShiftAssignment, "id">
	): Promise<ShiftAssignment> => {
		const { data: newAssignment, error } = await supabase
			.from("shift_assignments")
			.insert(data)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create shift assignment");
			console.error("Error creating shift assignment:", error);
			throw error;
		}

		toast.success("Shift assignment created successfully!");
		return newAssignment as ShiftAssignment;
	},

	delete: async (id: string): Promise<void> => {
		const { error } = await supabase
			.from("shift_assignments")
			.delete()
			.eq("id", id);

		if (error) {
			toast.error("Failed to delete shift assignment");
			console.error("Error deleting shift assignment:", error);
			throw error;
		}

		toast.success("Shift assignment deleted successfully!");
	},
};

// Notifications API
export const NotificationsAPI = {
	getAll: async (userId: string): Promise<Notification[]> => {
		const { data, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			toast.error("Failed to fetch notifications");
			console.error("Error fetching notifications:", error);
			return [];
		}

		return data as Notification[];
	},

	markAsRead: async (id: string): Promise<void> => {
		const { error } = await supabase
			.from("notifications")
			.update({ read: true })
			.eq("id", id);

		if (error) {
			toast.error("Failed to mark notification as read");
			console.error("Error marking notification as read:", error);
			throw error;
		}
	},

	create: async (
		data: Omit<Notification, "id" | "created_at" | "read">
	): Promise<Notification> => {
		const newNotification = {
			...data,
			read: false,
			created_at: new Date().toISOString(),
		};

		const { data: createdNotification, error } = await supabase
			.from("notifications")
			.insert(newNotification)
			.select()
			.single();

		if (error) {
			toast.error("Failed to create notification");
			console.error("Error creating notification:", error);
			throw error;
		}

		return createdNotification as Notification;
	},
};

// SchedulesAPI for backward compatibility
export const SchedulesAPI = {
	getAll: async (organizationId?: string): Promise<Schedule[]> => {
		return ShiftsAPI.getAllSchedules(organizationId);
	},

	getById: async (id: string): Promise<Schedule | null> => {
		return ShiftsAPI.getScheduleById(id);
	},

	create: async (data: ScheduleCreateInput): Promise<Schedule> => {
		return ShiftsAPI.createSchedule(data);
	},
};
