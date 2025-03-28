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
		try {
			console.log("Fetching organizations from Supabase...");

			// First try with the join query to bypass RLS
			const { data, error } = await supabase
				.from("organizations")
				.select(
					`
					*,
					organization_members!inner(*)
				`
				)
				.eq(
					"organization_members.user_id",
					(
						await supabase.auth.getUser()
					).data.user?.id
				);

			if (error) {
				console.error("Error with join query:", error);

				// Fall back to a simple query (relies on RLS being disabled)
				const { data: simpleData, error: simpleError } = await supabase
					.from("organizations")
					.select("*");

				if (simpleError) {
					console.error("Error with simple query:", simpleError);
					toast.error(
						`Failed to fetch organizations: ${
							simpleError.message || "Unknown error"
						}`
					);
					return [];
				}

				return simpleData as Organization[];
			}

			// Clean up nested data structure
			const cleanData = data.map((item) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { organization_members, ...rest } = item;
				return rest;
			});

			return cleanData as Organization[];
		} catch (exception) {
			// Handle unexpected errors like network issues
			console.error("Exception fetching organizations:", exception);
			toast.error(
				`Connection error: ${
					exception instanceof Error
						? exception.message
						: "Unable to connect to server"
				}`
			);
			return [];
		}
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
			// Log error but don't show toast - empty results are expected for new users
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
			// Log error but don't show toast - not finding a schedule could be expected
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
			// Log error but don't show toast - empty results are expected for new users
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
			// Log error but don't show toast - not finding a shift could be expected
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
		if (!organizationId) {
			console.error("No organization ID provided to LocationsAPI.getAll");
			return [];
		}

		console.log("Filtering locations by organization_id:", organizationId);
		const { data, error } = await supabase
			.from("locations")
			.select("*")
			.eq("organization_id", organizationId);

		if (error) {
			// Log error but don't show toast - empty results are expected for new users
			console.error("Error fetching locations:", error);
			return [];
		}

		console.log("Raw location data from database:", data);

		// Map from DB snake_case columns to app camelCase properties
		return data.map((location) => {
			// Handle potential column name mismatches
			return {
				id: location.id,
				name: location.name,
				address: location.address,
				city: location.city,
				state: location.state,
				zipCode: location.zipCode || location.zip_code,
				isActive: location.isActive || location.is_active,
				organizationId: location.organizationId || location.organization_id,
			} as Location;
		});
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

		// Map from DB snake_case columns to app camelCase properties
		return {
			id: data.id,
			name: data.name,
			address: data.address,
			city: data.city,
			state: data.state,
			zipCode: data.zipCode || data.zip_code,
			isActive: data.isActive || data.is_active,
			organizationId: data.organizationId || data.organization_id,
		} as Location;
	},

	create: async (data: Omit<Location, "id">): Promise<Location> => {
		console.log("Creating location with data:", data);

		// Ensure we have a valid organization ID
		if (!data.organizationId) {
			console.warn("No organization ID provided, using default");
			// Use default organization ID from the first organization
			const { data: orgs } = await supabase
				.from("organizations")
				.select("id")
				.limit(1);

			if (orgs && orgs.length > 0) {
				data.organizationId = orgs[0].id;
			} else {
				// Fallback to a hardcoded UUID if no organizations exist
				data.organizationId = "03a0572b-fb64-49ab-8955-c2f5ce50cfe6";
			}
		}

		// Validate that organization ID is a valid UUID
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(data.organizationId)) {
			console.error(
				"Invalid UUID format for organization ID:",
				data.organizationId
			);
			throw new Error("Invalid organization ID format. Must be a valid UUID.");
		}

		// Map from app camelCase properties to DB snake_case columns
		const dbData = {
			name: data.name || "New Location", // Ensure name is not null
			address: data.address || "", // Ensure not null
			city: data.city || "", // Ensure not null
			state: data.state || "", // Ensure not null
			zip_code: data.zipCode || "",
			is_active: data.isActive,
			organization_id: data.organizationId,
		};

		console.log("Transformed DB data:", dbData);

		try {
			const { data: newLocation, error } = await supabase
				.from("locations")
				.insert(dbData)
				.select()
				.single();

			if (error) {
				console.error("Error creating location:", error);

				// Try alternate approach with both field formats if original fails
				if (
					error.message.includes("organization_id") ||
					error.message.includes("organizationId")
				) {
					console.log("Trying alternate approach with both field formats...");

					const alternateData = {
						...dbData,
						organizationId: data.organizationId, // Add camelCase version as well
					};

					const { data: altLocation, error: altError } = await supabase
						.from("locations")
						.insert(alternateData)
						.select()
						.single();

					if (altError) {
						console.error("Alternative approach also failed:", altError);
						toast.error("Failed to create location");
						throw altError;
					}

					toast.success("Location created successfully!");

					// Map from DB snake_case columns to app camelCase properties
					return {
						id: altLocation.id,
						name: altLocation.name,
						address: altLocation.address,
						city: altLocation.city,
						state: altLocation.state,
						zipCode: altLocation.zipCode || altLocation.zip_code,
						isActive: altLocation.isActive || altLocation.is_active,
						organizationId:
							altLocation.organizationId || altLocation.organization_id,
					} as Location;
				}

				toast.error("Failed to create location");
				throw error;
			}

			toast.success("Location created successfully!");

			// Map from DB snake_case columns to app camelCase properties
			return {
				id: newLocation.id,
				name: newLocation.name,
				address: newLocation.address,
				city: newLocation.city,
				state: newLocation.state,
				zipCode: newLocation.zipCode || newLocation.zip_code,
				isActive: newLocation.isActive || newLocation.is_active,
				organizationId:
					newLocation.organizationId || newLocation.organization_id,
			} as Location;
		} catch (error) {
			console.error("Exception creating location:", error);
			toast.error("Failed to create location");
			throw error;
		}
	},

	update: async (
		location: Partial<Location> & { id: string }
	): Promise<Location | null> => {
		// Map from app camelCase properties to DB snake_case columns
		const dbData: any = {
			id: location.id,
			name: location.name,
			address: location.address,
			city: location.city,
			state: location.state,
		};

		// Handle camelCase to snake_case conversions
		if (location.zipCode !== undefined) {
			dbData.zip_code = location.zipCode;
		}

		if (location.isActive !== undefined) {
			dbData.is_active = location.isActive;
		}

		if (location.organizationId !== undefined) {
			dbData.organization_id = location.organizationId;
		}

		const { data, error } = await supabase
			.from("locations")
			.update(dbData)
			.eq("id", location.id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update location");
			console.error("Error updating location:", error);
			return null;
		}

		toast.success("Location updated successfully!");

		// Map from DB snake_case columns to app camelCase properties
		return {
			id: data.id,
			name: data.name,
			address: data.address,
			city: data.city,
			state: data.state,
			zipCode: data.zipCode || data.zip_code,
			isActive: data.isActive || data.is_active,
			organizationId: data.organizationId || data.organization_id,
		} as Location;
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
			// Log error but don't show toast - empty results are expected for new users
			console.error("Error fetching employees:", error);
			return [];
		}

		// Convert snake_case to camelCase for frontend compatibility
		return data.map((employee) => {
			return {
				id: employee.id,
				organizationId: employee.organization_id,
				name: employee.name,
				email: employee.email,
				role: employee.role,
				phone: employee.phone,
				position: employee.position,
				hireDate: employee.hire_date,
				address: employee.address,
				emergencyContact: employee.emergency_contact,
				notes: employee.notes,
				avatar: employee.avatar,
				hourlyRate:
					employee.hourly_rate !== null
						? parseFloat(employee.hourly_rate)
						: undefined,
				status: employee.status,
				isOnline: employee.is_online,
				lastActive: employee.last_active,
			} as Employee;
		});
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

		if (!data) return null;

		// Convert snake_case to camelCase for frontend compatibility
		return {
			id: data.id,
			organizationId: data.organization_id,
			name: data.name,
			email: data.email,
			role: data.role,
			phone: data.phone,
			position: data.position,
			hireDate: data.hire_date,
			address: data.address,
			emergencyContact: data.emergency_contact,
			notes: data.notes,
			avatar: data.avatar,
			hourlyRate:
				data.hourly_rate !== null ? parseFloat(data.hourly_rate) : undefined,
			status: data.status,
			isOnline: data.is_online,
			lastActive: data.last_active,
		} as Employee;
	},

	create: async (data: Omit<Employee, "id">): Promise<Employee> => {
		// Convert camelCase properties to snake_case for the database
		const snakeCaseData: Record<string, any> = {};
		Object.entries(data).forEach(([key, value]) => {
			// Convert camelCase to snake_case
			const snakeKey = key.replace(
				/[A-Z]/g,
				(letter) => `_${letter.toLowerCase()}`
			);
			snakeCaseData[snakeKey] = value;
		});

		const { data: newEmployee, error } = await supabase
			.from("employees")
			.insert(snakeCaseData)
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
		id: string,
		data: Partial<Employee>
	): Promise<Employee | null> => {
		// Convert camelCase properties to snake_case for the database
		const snakeCaseData: Record<string, any> = {};
		Object.entries(data).forEach(([key, value]) => {
			// Convert camelCase to snake_case
			const snakeKey = key.replace(
				/[A-Z]/g,
				(letter) => `_${letter.toLowerCase()}`
			);
			snakeCaseData[snakeKey] = value;
		});

		const { data: updated, error } = await supabase
			.from("employees")
			.update(snakeCaseData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			toast.error("Failed to update employee");
			console.error("Error updating employee:", error);
			return null;
		}

		toast.success("Employee updated successfully!");
		return updated as Employee;
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
			// Log error but don't show toast - empty results are expected for new users
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
		console.log("Fetching notifications for user:", userId);

		const { data, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			// Log error but don't show toast - empty results are expected for new users
			console.error("Error fetching notifications:", error);
			return [];
		}

		// Map the snake_case column names to camelCase property names
		return data.map((notification) => ({
			id: notification.id,
			userId: notification.user_id,
			organizationId: notification.organization_id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			isRead: notification.is_read,
			isActionRequired: notification.is_action_required,
			actionUrl: notification.action_url,
			relatedEntityId: notification.related_entity_id,
			relatedEntityType: notification.related_entity_type,
			createdAt: notification.created_at,
		})) as Notification[];
	},

	getUnread: async (userId: string): Promise<Notification[]> => {
		const { data, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.eq("is_read", false)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching unread notifications:", error);
			return [];
		}

		// Map the snake_case column names to camelCase property names
		return data.map((notification) => ({
			id: notification.id,
			userId: notification.user_id,
			organizationId: notification.organization_id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			isRead: notification.is_read,
			isActionRequired: notification.is_action_required,
			actionUrl: notification.action_url,
			relatedEntityId: notification.related_entity_id,
			relatedEntityType: notification.related_entity_type,
			createdAt: notification.created_at,
		})) as Notification[];
	},

	markAsRead: async (id: string): Promise<void> => {
		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("id", id);

		if (error) {
			toast.error("Failed to mark notification as read");
			console.error("Error marking notification as read:", error);
			throw error;
		}

		toast.success("Notification marked as read");
	},

	markAllAsRead: async (userId: string): Promise<void> => {
		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("user_id", userId);

		if (error) {
			toast.error("Failed to mark all notifications as read");
			console.error("Error marking all notifications as read:", error);
			throw error;
		}

		toast.success("All notifications marked as read");
	},

	dismissNotification: async (id: string): Promise<void> => {
		const { error } = await supabase
			.from("notifications")
			.delete()
			.eq("id", id);

		if (error) {
			toast.error("Failed to dismiss notification");
			console.error("Error dismissing notification:", error);
			throw error;
		}

		toast.success("Notification dismissed");
	},

	dismissAllNotifications: async (userId: string): Promise<void> => {
		const { error } = await supabase
			.from("notifications")
			.delete()
			.eq("user_id", userId);

		if (error) {
			toast.error("Failed to dismiss all notifications");
			console.error("Error dismissing all notifications:", error);
			throw error;
		}

		toast.success("All notifications dismissed");
	},
};

// Employee Locations API
export const EmployeeLocationsAPI = {
	getByEmployeeId: async (employeeId: string): Promise<string[]> => {
		try {
			// First, try to find records in the employee_locations table
			const { data, error } = await supabase
				.from("employee_locations")
				.select("location_id")
				.eq("employee_id", employeeId);

			if (error) {
				console.error("Error fetching employee locations:", error);
				// If table doesn't exist yet, assume no locations
				if (error.code === "42P01") {
					// undefined_table
					console.log("employee_locations table does not exist yet");
					return [];
				}
				throw error;
			}

			// Return array of location IDs
			return data.map((item) => item.location_id);
		} catch (error) {
			console.error("Error in getByEmployeeId:", error);
			return [];
		}
	},

	assignLocations: async (
		employeeId: string,
		locationIds: string[]
	): Promise<boolean> => {
		try {
			// First try to query the employee_locations table to see if it exists
			const { data: testData, error: testError } = await supabase
				.from("employee_locations")
				.select("id")
				.limit(1);

			// If we get a table doesn't exist error, we'll inform the user
			if (testError && testError.code === "42P01") {
				console.error(
					"The employee_locations table doesn't exist in the database"
				);
				toast.error(
					"Failed to assign locations: Database table not set up properly. Please contact support."
				);
				return false;
			}

			// Remove any existing assignments
			const { error: deleteError } = await supabase
				.from("employee_locations")
				.delete()
				.eq("employee_id", employeeId);

			if (deleteError) {
				console.error(
					"Error deleting existing employee locations:",
					deleteError
				);
				toast.error("Failed to update employee locations");
				return false;
			}

			// Skip insert if no locations to assign
			if (locationIds.length === 0) {
				return true;
			}

			// Insert new assignments
			const rowsToInsert = locationIds.map((locationId) => ({
				employee_id: employeeId,
				location_id: locationId,
			}));

			const { error: insertError } = await supabase
				.from("employee_locations")
				.insert(rowsToInsert);

			if (insertError) {
				console.error("Error inserting employee locations:", insertError);
				toast.error("Failed to assign locations");
				return false;
			}

			return true;
		} catch (error) {
			console.error("Error in assignLocations:", error);
			toast.error("An unexpected error occurred. Please try again.");
			return false;
		}
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
}; // End of SchedulesAPI
