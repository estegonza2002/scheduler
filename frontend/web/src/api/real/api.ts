import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { format, parseISO } from "date-fns";
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
	Subscription,
	PaymentMethod,
	Invoice,
	SubscriptionUpdateParams,
	CheckoutSession,
	SubscriptionPlan,
} from "../types"; // Import from main types file

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

	// Get regular shifts (not schedules)
	getRegularShifts: async (organizationId?: string): Promise<Shift[]> => {
		let query = supabase.from("shifts").select("*").eq("is_schedule", false);

		if (organizationId) {
			query = query.eq("organization_id", organizationId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching regular shifts:", error);
			return [];
		}

		return data as Shift[];
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
			status: data.status || "scheduled",
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

	// Get all shifts for a specific location
	getShiftsByLocationId: async (locationId: string): Promise<Shift[]> => {
		const { data, error } = await supabase
			.from("shifts")
			.select("*")
			.eq("location_id", locationId)
			.eq("is_schedule", false); // Get only actual shifts, not schedules

		if (error) {
			console.error("Error fetching shifts for location:", error);
			return [];
		}

		return data as Shift[];
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
		console.log("Creating location with data:", JSON.stringify(data, null, 2));

		// Verify database structure first
		try {
			// Use admin client to bypass RLS
			const client = supabase;

			// Get table information using system tables
			const { data: dbInfo, error: dbInfoError } = await client
				.from("pg_catalog.pg_tables")
				.select("*")
				.eq("tablename", "locations")
				.limit(1);

			if (dbInfoError) {
				console.error(
					"Error checking locations table:",
					JSON.stringify(dbInfoError, null, 2)
				);
			} else {
				console.log("Locations table exists:", dbInfo && dbInfo.length > 0);

				// Check columns in the locations table
				const { data: columnInfo, error: columnError } = await client
					.rpc("get_table_columns", { table_name: "locations" })
					.select("*");

				if (columnError) {
					console.error(
						"Error fetching column info:",
						JSON.stringify(columnError, null, 2)
					);
				} else {
					console.log(
						"Locations table columns:",
						JSON.stringify(columnInfo, null, 2)
					);
				}
			}
		} catch (infoError) {
			console.error("Error checking database structure:", infoError);
		}

		// Ensure we have a valid organization ID
		if (!data.organizationId) {
			console.warn("No organization ID provided, using default");
			// Use default organization ID from the first organization
			const client = supabase;
			const { data: orgs } = await client
				.from("organizations")
				.select("id")
				.limit(1);

			if (orgs && orgs.length > 0) {
				data.organizationId = orgs[0].id;
			} else {
				// Fallback to a hardcoded UUID if no organizations exist
				data.organizationId = "79a0cd70-b7e6-4ea4-8b00-a88dfea38e25"; // Updated to match organization context fallback
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
		const dbData: any = {
			name: data.name || "New Location", // Ensure name is not null
			address: data.address || "", // Ensure not null
			city: data.city || "", // Ensure not null
			state: data.state || "", // Ensure not null
			zip_code: data.zipCode || "",
			is_active: data.isActive === undefined ? true : data.isActive, // Default to true if undefined
			organization_id: data.organizationId,
		};

		// Add additional fields if they exist in the Location object
		if (data.latitude !== undefined) dbData.latitude = data.latitude;
		if (data.longitude !== undefined) dbData.longitude = data.longitude;
		if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;

		console.log("Transformed DB data:", JSON.stringify(dbData, null, 2));

		// First try a simple select to check permissions
		try {
			const client = supabase;
			const { data: permCheck, error: permError } = await client
				.from("locations")
				.select("id")
				.limit(1);

			if (permError) {
				console.error(
					"Permission error checking locations table:",
					JSON.stringify(permError, null, 2)
				);
				toast.error(
					"Permission issue with accessing locations. Please check your account."
				);
			} else {
				console.log(
					"Location permissions check successful, found:",
					permCheck?.length || 0,
					"locations"
				);
			}
		} catch (permCheckError) {
			console.error("Error in permission check:", permCheckError);
		}

		try {
			const client = supabase;
			const { data: newLocation, error } = await client
				.from("locations")
				.insert(dbData)
				.select()
				.single();

			if (error) {
				console.error(
					"Error creating location:",
					JSON.stringify(error, null, 2)
				);

				// Provide more detailed error message
				if (error.message?.includes("violates foreign key constraint")) {
					toast.error("Failed to create location: Invalid organization ID");
				} else if (error.message?.includes("violates not-null constraint")) {
					toast.error("Failed to create location: Missing required field");
				} else {
					toast.error(
						`Failed to create location: ${error.message || "Unknown error"}`
					);
				}

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
				zipCode: newLocation.zip_code,
				isActive: newLocation.is_active,
				organizationId: newLocation.organization_id,
				latitude: newLocation.latitude,
				longitude: newLocation.longitude,
				imageUrl: newLocation.image_url,
			} as Location;
		} catch (error) {
			console.error(
				"Exception creating location:",
				error instanceof Error ? error.message : JSON.stringify(error, null, 2)
			);
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
				position: employee.position,
				phone: employee.phone,
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
		console.log(`EmployeesAPI.getById called with id: ${id}`);

		const { data, error } = await supabase
			.from("employees")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error(`Error fetching employee with id ${id}:`, error);
			toast.error(`Failed to fetch employee: ${error.message}`);
			return null;
		}

		if (!data) {
			console.error(`No employee found with id ${id}`);
			return null;
		}

		console.log(`Successfully fetched employee:`, data);

		// Convert snake_case to camelCase for frontend compatibility
		return {
			id: data.id,
			organizationId: data.organization_id,
			name: data.name,
			email: data.email,
			position: data.position,
			phone: data.phone,
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
		const snakeCaseData = {
			organization_id: data.organizationId,
			name: data.name,
			email: data.email,
			position: data.position || "Employee",
			phone: data.phone,
			hire_date: data.hireDate,
			address: data.address,
			emergency_contact: data.emergencyContact,
			notes: data.notes,
			avatar: data.avatar,
			hourly_rate: data.hourlyRate,
			status: data.status || "invited",
			is_online: data.isOnline || false,
			last_active: data.lastActive || new Date().toISOString(),
		};

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

		// Convert snake_case back to camelCase for frontend
		const employee = {
			id: newEmployee.id,
			organizationId: newEmployee.organization_id,
			name: newEmployee.name,
			email: newEmployee.email,
			position: newEmployee.position,
			phone: newEmployee.phone,
			hireDate: newEmployee.hire_date,
			address: newEmployee.address,
			emergencyContact: newEmployee.emergency_contact,
			notes: newEmployee.notes,
			avatar: newEmployee.avatar,
			hourlyRate:
				newEmployee.hourly_rate !== null
					? parseFloat(newEmployee.hourly_rate)
					: undefined,
			status: newEmployee.status,
			isOnline: newEmployee.is_online,
			lastActive: newEmployee.last_active,
		} as Employee;

		toast.success("Employee created successfully!");
		return employee;
	},

	update: async (
		id: string,
		data: Partial<Employee>
	): Promise<Employee | null> => {
		// Convert camelCase properties to snake_case for the database
		const snakeCaseData: Record<string, any> = {};

		if (data.organizationId !== undefined)
			snakeCaseData.organization_id = data.organizationId;
		if (data.name !== undefined) snakeCaseData.name = data.name;
		if (data.email !== undefined) snakeCaseData.email = data.email;
		if (data.position !== undefined) snakeCaseData.position = data.position;
		if (data.phone !== undefined) snakeCaseData.phone = data.phone;
		if (data.hireDate !== undefined) snakeCaseData.hire_date = data.hireDate;
		if (data.address !== undefined) snakeCaseData.address = data.address;
		if (data.emergencyContact !== undefined)
			snakeCaseData.emergency_contact = data.emergencyContact;
		if (data.notes !== undefined) snakeCaseData.notes = data.notes;
		if (data.avatar !== undefined) snakeCaseData.avatar = data.avatar;
		if (data.hourlyRate !== undefined)
			snakeCaseData.hourly_rate = data.hourlyRate;
		if (data.status !== undefined) snakeCaseData.status = data.status;
		if (data.isOnline !== undefined) snakeCaseData.is_online = data.isOnline;
		if (data.lastActive !== undefined)
			snakeCaseData.last_active = data.lastActive;

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

		// Convert snake_case back to camelCase for frontend
		const employee = {
			id: updated.id,
			organizationId: updated.organization_id,
			name: updated.name,
			email: updated.email,
			position: updated.position,
			phone: updated.phone,
			hireDate: updated.hire_date,
			address: updated.address,
			emergencyContact: updated.emergency_contact,
			notes: updated.notes,
			avatar: updated.avatar,
			hourlyRate:
				updated.hourly_rate !== null
					? parseFloat(updated.hourly_rate)
					: undefined,
			status: updated.status,
			isOnline: updated.is_online,
			lastActive: updated.last_active,
		} as Employee;

		toast.success("Employee updated successfully!");
		return employee;
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

	resendInvite: async (id: string): Promise<boolean> => {
		try {
			// Get the employee to verify they exist and are in invited status
			const { data: employee, error: employeeError } = await supabase
				.from("employees")
				.select("*")
				.eq("id", id)
				.single();

			if (employeeError || !employee) {
				console.error("Error fetching employee:", employeeError);
				return false;
			}

			if (employee.status !== "invited") {
				console.error("Employee is not in invited status");
				return false;
			}

			// Update the employee's last_invite_sent timestamp to trigger the email resend
			const { error: updateError } = await supabase
				.from("employees")
				.update({
					last_invite_sent: new Date().toISOString(),
				})
				.eq("id", id);

			if (updateError) {
				console.error("Error updating employee:", updateError);
				return false;
			}

			return true;
		} catch (error) {
			console.error("Error in resendInvite:", error);
			return false;
		}
	},
};

// Shift Assignments API
export const ShiftAssignmentsAPI = {
	getAll: async (shiftId?: string): Promise<ShiftAssignment[]> => {
		console.log(
			"ShiftAssignmentsAPI.getAll called",
			shiftId ? `for shift ${shiftId}` : "for all shifts"
		);

		try {
			let query = supabase.from("shift_assignments").select("*");

			if (shiftId) {
				query = query.eq("shift_id", shiftId);
			}

			const { data, error } = await query;

			if (error) {
				console.error("Error fetching shift assignments:", error);
				return [];
			}

			console.log(
				`ShiftAssignmentsAPI.getAll returned ${data?.length || 0} assignments`
			);
			if (data && data.length > 0) {
				console.log(
					"Sample assignments:",
					data.slice(0, 3).map((a) => ({
						id: a.id,
						shift_id: a.shift_id,
						employee_id: a.employee_id,
					}))
				);
			} else {
				console.log("No assignments found");
			}

			return data as ShiftAssignment[];
		} catch (error) {
			console.error("Unexpected error in ShiftAssignmentsAPI.getAll:", error);
			return [];
		}
	},

	create: async (
		data: Omit<ShiftAssignment, "id">
	): Promise<ShiftAssignment> => {
		console.log("ShiftAssignmentsAPI.create called with data:", {
			shift_id: data.shift_id,
			employee_id: data.employee_id,
		});

		try {
			// Validate that we have required IDs
			if (!data.shift_id || !data.employee_id) {
				throw new Error(
					"Missing required shift_id or employee_id for shift assignment"
				);
			}

			// Create the assignment
			const { data: newAssignment, error } = await supabase
				.from("shift_assignments")
				.insert(data)
				.select()
				.single();

			if (error) {
				console.error("Error creating shift assignment:", error);
				toast.error(`Failed to create shift assignment: ${error.message}`);
				throw error;
			}

			console.log("Shift assignment created successfully:", {
				id: newAssignment.id,
				shift_id: newAssignment.shift_id,
				employee_id: newAssignment.employee_id,
			});

			toast.success("Shift assignment created successfully!");
			return newAssignment as ShiftAssignment;
		} catch (error) {
			console.error("Unexpected error in ShiftAssignmentsAPI.create:", error);
			toast.error(
				"Failed to create shift assignment due to an unexpected error"
			);
			throw error;
		}
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

	// Add getByLocationId method to get all employees for a location
	getByLocationId: async (locationId: string): Promise<string[]> => {
		try {
			console.log(`DEBUG: Getting employees for location ID: ${locationId}`);

			// Try to find records in the employee_locations table
			const { data, error } = await supabase
				.from("employee_locations")
				.select("employee_id")
				.eq("location_id", locationId);

			if (error) {
				console.error("Error fetching location employees:", error);
				// If table doesn't exist yet, assume no employees
				if (error.code === "42P01") {
					// undefined_table
					console.log("employee_locations table does not exist yet");
					return [];
				}
				throw error;
			}

			// Return array of employee IDs
			const employeeIds = data.map((item) => item.employee_id);
			console.log(
				`DEBUG: Found ${employeeIds.length} employees for location ${locationId}`
			);
			return employeeIds;
		} catch (error) {
			console.error("Error in getByLocationId:", error);
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

// Messages and Conversations API
export const ConversationsAPI = {
	getAll: async (organizationId: string): Promise<Conversation[]> => {
		const { data, error } = await supabase
			.from("conversations")
			.select("*, participants(*)")
			.eq("organization_id", organizationId);

		if (error) {
			console.error("Error fetching conversations:", error);
			return [];
		}

		return data.map((conversation) => ({
			id: conversation.id,
			name: conversation.name,
			type: conversation.type,
			avatar: conversation.avatar,
			participants: conversation.participants?.length || 0,
			isActive: conversation.is_active,
			lastMessage: conversation.last_message,
			lastMessageTime: conversation.last_message_time,
			unreadCount: conversation.unread_count || 0,
			organizationId: conversation.organization_id,
		}));
	},

	getById: async (id: string): Promise<Conversation | null> => {
		const { data, error } = await supabase
			.from("conversations")
			.select("*, participants(*)")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching conversation:", error);
			return null;
		}

		return {
			id: data.id,
			name: data.name,
			type: data.type,
			avatar: data.avatar,
			participants: data.participants?.length || 0,
			isActive: data.is_active,
			lastMessage: data.last_message,
			lastMessageTime: data.last_message_time,
			unreadCount: data.unread_count || 0,
			organizationId: data.organization_id,
		};
	},

	create: async (data: ConversationCreateInput): Promise<Conversation> => {
		const { data: conversation, error } = await supabase
			.from("conversations")
			.insert({
				...data,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			toast.error("Failed to create conversation");
			throw error;
		}

		return {
			id: conversation.id,
			name: conversation.name,
			type: conversation.type,
			avatar: conversation.avatar,
			participants: conversation.participants?.length || 0,
			isActive: conversation.is_active,
			lastMessage: conversation.last_message,
			lastMessageTime: conversation.last_message_time,
			unreadCount: conversation.unread_count || 0,
			organizationId: conversation.organization_id,
		};
	},
};

export const MessagesAPI = {
	getAll: async (conversationId: string): Promise<Message[]> => {
		const { data, error } = await supabase
			.from("messages")
			.select("*, sender:user_id(*)")
			.eq("conversation_id", conversationId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching messages:", error);
			return [];
		}

		const currentUser = (await supabase.auth.getUser()).data.user;

		return data.map((message) => ({
			id: message.id,
			senderId: message.user_id,
			senderName: message.sender?.name || "Unknown User",
			senderAvatar: message.sender?.avatar || "",
			content: message.content,
			timestamp: format(parseISO(message.created_at), "h:mm a"),
			isCurrentUser: message.user_id === currentUser?.id,
		}));
	},

	send: async (data: MessageCreateInput): Promise<Message> => {
		const currentUser = (await supabase.auth.getUser()).data.user;
		if (!currentUser) {
			throw new Error("User not authenticated");
		}

		const { data: message, error } = await supabase
			.from("messages")
			.insert({
				...data,
				user_id: currentUser.id,
				created_at: new Date().toISOString(),
			})
			.select("*, sender:user_id(*)")
			.single();

		if (error) {
			toast.error("Failed to send message");
			throw error;
		}

		// Update conversation's last message
		await supabase
			.from("conversations")
			.update({
				last_message: data.content,
				last_message_time: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", data.conversation_id);

		return {
			id: message.id,
			senderId: message.user_id,
			senderName: message.sender?.name || "Unknown User",
			senderAvatar: message.sender?.avatar || "",
			content: message.content,
			timestamp: format(parseISO(message.created_at), "h:mm a"),
			isCurrentUser: true,
		};
	},
};

// Types for Messages and Conversations
export interface Message {
	id: string;
	senderId: string;
	senderName: string;
	senderAvatar: string;
	content: string;
	timestamp: string;
	isCurrentUser: boolean;
}

export interface MessageCreateInput {
	conversation_id: string;
	content: string;
}

export interface Conversation {
	id: string;
	name: string;
	type: "chats" | "groups" | "active-shifts" | "one-to-one";
	avatar: string;
	participants: number;
	isActive?: boolean;
	lastMessage?: string;
	lastMessageTime?: string;
	unreadCount: number;
	organizationId: string;
}

export interface ConversationCreateInput {
	name: string;
	type: Conversation["type"];
	avatar?: string;
	organization_id: string;
	is_active?: boolean;
}

// Billing API
export const BillingAPI = {
	// Subscriptions
	getCurrentSubscription: async (
		organizationId: string
	): Promise<Subscription | null> => {
		try {
			// First get the organization to find its subscription_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("subscription_id, stripe_customer_id")
				.eq("id", organizationId)
				.single();

			// Handle missing subscription_id field by setting default free subscription
			if (orgError || !org || !org.subscription_id) {
				console.error("Error fetching organization subscription:", orgError);
				// If no subscription_id, return a default free subscription
				return {
					id: "free_subscription",
					status: "active",
					plan: "free",
					current_period_start: new Date().toISOString(),
					current_period_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					).toISOString(),
					cancel_at_period_end: false,
				};
			}

			// If it's the free subscription, return hardcoded defaults
			if (org.subscription_id === "free_subscription") {
				return {
					id: "free_subscription",
					status: "active",
					plan: "free",
					current_period_start: new Date().toISOString(),
					current_period_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					).toISOString(),
					cancel_at_period_end: false,
				};
			}

			// Get the subscription from Stripe
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/stripe/subscriptions/${
						org.subscription_id
					}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Failed to get subscription: ${response.statusText}`);
				}

				const subscription = await response.json();
				return subscription;
			} catch (stripeError) {
				console.error("Error fetching Stripe subscription:", stripeError);
				// Fallback to free subscription on error
				return {
					id: "free_subscription",
					status: "active",
					plan: "free",
					current_period_start: new Date().toISOString(),
					current_period_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					).toISOString(),
					cancel_at_period_end: false,
				};
			}
		} catch (error) {
			console.error("Error in getCurrentSubscription:", error);
			return null;
		}
	},

	updateSubscription: async (
		organizationId: string,
		params: SubscriptionUpdateParams
	): Promise<Subscription | null> => {
		try {
			// First get the organization to find its subscription_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("subscription_id, stripe_customer_id")
				.eq("id", organizationId)
				.single();

			if (orgError) {
				console.error("Error fetching organization:", orgError);
				toast.error("Failed to update subscription");
				return null;
			}

			// If upgrading from free, create a new subscription
			if (!org.subscription_id || org.subscription_id === "free_subscription") {
				// Redirect to checkout instead
				const checkoutSession = await BillingAPI.createCheckoutSession(
					organizationId,
					params.plan
				);
				if (checkoutSession && checkoutSession.url) {
					window.location.href = checkoutSession.url;
				}
				return null;
			}

			// Call the Stripe endpoint to update subscription
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/stripe/subscriptions/${
					org.subscription_id
				}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ plan: params.plan }),
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to update subscription: ${response.statusText}`
				);
			}

			const subscription = await response.json();
			toast.success(`Successfully updated to ${params.plan} plan`);
			return subscription;
		} catch (error) {
			console.error("Error updating subscription:", error);
			toast.error("Failed to update subscription");
			return null;
		}
	},

	cancelSubscription: async (organizationId: string): Promise<boolean> => {
		try {
			// First get the organization to find its subscription_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("subscription_id")
				.eq("id", organizationId)
				.single();

			if (
				orgError ||
				!org.subscription_id ||
				org.subscription_id === "free_subscription"
			) {
				console.error("Error fetching organization subscription:", orgError);
				toast.error("No active subscription found");
				return false;
			}

			// Call the Stripe endpoint to cancel subscription
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/stripe/subscriptions/${
					org.subscription_id
				}/cancel`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to cancel subscription: ${response.statusText}`
				);
			}

			toast.success("Subscription successfully canceled at period end");
			return true;
		} catch (error) {
			console.error("Error canceling subscription:", error);
			toast.error("Failed to cancel subscription");
			return false;
		}
	},

	// Payment Methods
	getPaymentMethods: async (
		organizationId: string
	): Promise<PaymentMethod[]> => {
		try {
			// First get the organization to find its stripe_customer_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("stripe_customer_id")
				.eq("id", organizationId)
				.single();

			if (orgError || !org.stripe_customer_id) {
				console.error("Error fetching organization:", orgError);
				return [];
			}

			// Call the Stripe endpoint to get payment methods
			const response = await fetch(
				`${
					import.meta.env.VITE_API_URL
				}/api/stripe/payment-methods?customerId=${org.stripe_customer_id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch payment methods: ${response.statusText}`
				);
			}

			const paymentMethods = await response.json();
			return paymentMethods;
		} catch (error) {
			console.error("Error fetching payment methods:", error);
			toast.error("Failed to load payment methods");
			return [];
		}
	},

	addPaymentMethod: async (
		organizationId: string,
		paymentMethodId: string
	): Promise<PaymentMethod | null> => {
		try {
			// First get the organization to find its stripe_customer_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("stripe_customer_id")
				.eq("id", organizationId)
				.single();

			if (orgError) {
				console.error("Error fetching organization:", orgError);
				toast.error("Failed to add payment method");
				return null;
			}

			// If there's no customer ID, create one first
			let customerId = org.stripe_customer_id;
			if (!customerId) {
				const userResponse = await supabase.auth.getUser();
				const user = userResponse.data.user;

				// Create customer in Stripe
				const customerResponse = await fetch(
					`${import.meta.env.VITE_API_URL}/api/stripe/customers`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: user?.email,
							name: user?.user_metadata?.full_name || user?.email,
							organizationId: organizationId,
						}),
					}
				);

				if (!customerResponse.ok) {
					throw new Error(
						`Failed to create customer: ${customerResponse.statusText}`
					);
				}

				const customerData = await customerResponse.json();
				customerId = customerData.id;

				// Update organization with new customer ID
				await supabase
					.from("organizations")
					.update({ stripe_customer_id: customerId })
					.eq("id", organizationId);
			}

			// Call the Stripe endpoint to attach payment method
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/stripe/payment-methods/attach`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						customerId,
						paymentMethodId,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to add payment method: ${response.statusText}`);
			}

			const paymentMethod = await response.json();
			toast.success("Payment method added successfully");
			return paymentMethod;
		} catch (error) {
			console.error("Error adding payment method:", error);
			toast.error("Failed to add payment method");
			return null;
		}
	},

	removePaymentMethod: async (
		organizationId: string,
		paymentMethodId: string
	): Promise<boolean> => {
		try {
			// Call the Stripe endpoint to detach payment method
			const response = await fetch(
				`${
					import.meta.env.VITE_API_URL
				}/api/stripe/payment-methods/${paymentMethodId}/detach`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to remove payment method: ${response.statusText}`
				);
			}

			toast.success("Payment method removed successfully");
			return true;
		} catch (error) {
			console.error("Error removing payment method:", error);
			toast.error("Failed to remove payment method");
			return false;
		}
	},

	// Invoices
	getInvoices: async (organizationId: string): Promise<Invoice[]> => {
		try {
			// First get the organization to find its stripe_customer_id
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("stripe_customer_id")
				.eq("id", organizationId)
				.single();

			if (orgError || !org.stripe_customer_id) {
				console.error("Error fetching organization:", orgError);
				return [];
			}

			// Call the Stripe endpoint to get invoices
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/stripe/invoices?customerId=${
					org.stripe_customer_id
				}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch invoices: ${response.statusText}`);
			}

			const invoices = await response.json();
			return invoices;
		} catch (error) {
			console.error("Error fetching invoices:", error);
			toast.error("Failed to load invoice history");
			return [];
		}
	},

	// Checkout
	createCheckoutSession: async (
		organizationId: string,
		plan: SubscriptionPlan
	): Promise<CheckoutSession | null> => {
		try {
			// First get the organization details
			const { data: org, error: orgError } = await supabase
				.from("organizations")
				.select("*")
				.eq("id", organizationId)
				.single();

			if (orgError) {
				console.error("Error fetching organization:", orgError);
				toast.error("Failed to create checkout session");
				return null;
			}

			const userResponse = await supabase.auth.getUser();
			const user = userResponse.data.user;

			// Create checkout session
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/stripe/checkout-sessions`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						customerId: org.stripe_customer_id,
						organizationId,
						plan,
						email: user?.email,
						name: org.name,
						successUrl: `${window.location.origin}/billing?success=true`,
						cancelUrl: `${window.location.origin}/billing`,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to create checkout session: ${response.statusText}`
				);
			}

			const session = await response.json();
			return session;
		} catch (error) {
			console.error("Error creating checkout session:", error);
			toast.error("Failed to create checkout session");
			return null;
		}
	},
};
