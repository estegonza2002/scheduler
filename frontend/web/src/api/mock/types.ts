// Types for the mock API
export interface Organization {
	id: string;
	name: string;
	description?: string;
	contactEmail?: string;
	contactPhone?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	website?: string;
	businessHours?: string;
}

/**
 * Task for check-in and check-out processes
 * Used for both schedule templates and individual shifts
 */
export interface ShiftTask {
	id: string;
	title: string;
	completed: boolean;
	order?: number;
}

/**
 * Consolidated Shift model for both schedule and shift functionality
 * - Records with is_schedule=true represent schedules (containers)
 * - Records with is_schedule=false represent individual shifts
 * - parent_shift_id links shifts to their parent schedule
 */
export interface Shift {
	id: string;
	created_at: string;
	updated_at: string;

	// Time information
	start_time: string; // ISO format timestamp
	end_time: string; // ISO format timestamp

	// Relations
	organization_id: string;
	user_id?: string; // Employee assigned to this shift
	created_by?: string; // User who created this shift
	location_id?: string; // Location where this shift takes place
	parent_shift_id?: string; // Self-reference to parent schedule/shift

	// Metadata
	name?: string; // Mainly for schedules, can be used for shifts too
	description?: string; // Notes or additional information
	position?: string; // Job title or role for the shift
	status?: string; // e.g., "scheduled", "completed", "canceled"
	is_schedule: boolean; // Flag to distinguish schedule vs shift

	// Optional associated data
	check_in_tasks?: ShiftTask[];
	check_out_tasks?: ShiftTask[];
}

/**
 * Input type for creating a shift or schedule, excluding auto-generated fields
 */
export type ShiftCreateInput = Omit<Shift, "id" | "created_at" | "updated_at">;

/**
 * Input type specifically for creating schedules
 */
export type ScheduleCreateInput = Omit<ShiftCreateInput, "is_schedule"> & {
	is_schedule: true;
};

/**
 * Input type specifically for creating individual shifts
 */
export type ShiftItemCreateInput = Omit<ShiftCreateInput, "is_schedule"> & {
	is_schedule: false;
	parent_shift_id: string; // Required for individual shifts
};

/**
 * Type guard to check if a shift is a schedule
 * @param shift The shift to check
 * @returns True if the shift is a schedule
 */
export function isSchedule(shift: Shift): shift is Schedule {
	return shift.is_schedule === true;
}

/**
 * Helper type for schedules
 * Enforces is_schedule=true for better type safety
 */
export type Schedule = Shift & { is_schedule: true };

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
	status: string;
	isOnline: boolean;
	lastActive: string;
	custom_properties?: Record<string, any>; // For storing custom properties like locationAssignments
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
	latitude?: number;
	longitude?: number;
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
