// Types for the API
export interface Organization {
	id: string;
	name: string;
	description?: string;
	logoUrl?: string;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
	contactEmail?: string;
	contactPhone?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	website?: string;
	businessHours?: string;
	stripeCustomerId?: string;
	subscriptionId?: string;
	subscriptionStatus?: string;
	subscriptionPlan?: SubscriptionPlan;
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
	createdAt: string;
	updatedAt: string;
	startTime: string;
	endTime: string;

	// Relations
	organizationId: string;
	userId?: string;
	createdBy?: string;
	locationId?: string;
	parentShiftId?: string;

	// Metadata
	name?: string;
	description?: string;
	status?: string;
	isSchedule: boolean;

	// Optional associated data
	checkInTasks?: ShiftTask[];
	checkOutTasks?: ShiftTask[];
}

/**
 * Input type for creating a shift or schedule, excluding auto-generated fields
 */
export type ShiftCreateInput = Omit<Shift, "id" | "createdAt" | "updatedAt">;

/**
 * Input type specifically for creating schedules
 */
export type ScheduleCreateInput = Omit<ShiftCreateInput, "isSchedule"> & {
	isSchedule: true;
};

/**
 * Input type specifically for creating individual shifts
 */
export type ShiftItemCreateInput = Omit<ShiftCreateInput, "isSchedule"> & {
	isSchedule: false;
	parentShiftId?: string;
	status: string;
};

/**
 * Type guard to check if a shift is a schedule
 * @param shift The shift to check
 * @returns True if the shift is a schedule
 */
export function isSchedule(shift: Shift): shift is Schedule {
	return shift.isSchedule === true;
}

/**
 * Helper type for schedules
 * Enforces is_schedule=true for better type safety
 */
export type Schedule = Shift & { isSchedule: true };

export interface ShiftAssignment {
	id: string;
	shiftId: string;
	employeeId: string;
	organizationId?: string;
	createdAt?: string;
}

export interface Employee {
	id: string;
	organizationId: string;
	name: string;
	email: string;
	position: string;
	phone?: string;
	hireDate?: string;
	address?: string;
	emergencyContact?: string;
	notes?: string;
	avatar?: string;
	hourlyRate?: number;
	status: string;
	isOnline: boolean;
	lastActive: string;
	custom_properties?: {
		locationAssignments?: string[]; // Array of Location IDs
		// Add other custom properties here if needed
		[key: string]: any; // Allow other arbitrary properties
	};
	createdAt?: string;
	updatedAt?: string;
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
	imageUrl?: string;
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

// Billing and Subscription types
export interface Subscription {
	id: string;
	status:
		| "active"
		| "canceled"
		| "incomplete"
		| "incomplete_expired"
		| "past_due"
		| "trialing"
		| "unpaid";
	plan: SubscriptionPlan;
	current_period_start: string;
	current_period_end: string;
	cancel_at_period_end: boolean;
}

export type SubscriptionPlan = "free" | "pro" | "business";

export interface PaymentMethod {
	id: string;
	card: {
		brand: string;
		last4: string;
		exp_month: number;
		exp_year: number;
	};
	billing_details: {
		name: string;
		email: string;
	};
	is_default: boolean;
}

export interface Invoice {
	id: string;
	number: string;
	created: number;
	amount_paid: number;
	currency: string;
	status: "paid" | "open" | "void" | "draft";
	hosted_invoice_url: string;
	pdf: string;
}

export interface SubscriptionUpdateParams {
	plan: SubscriptionPlan;
}

export interface CheckoutSession {
	id: string;
	url: string;
}

// Add UserProfile type (moved from api.ts)
export interface UserProfile {
	id: string; // Firebase UID
	email?: string;
	displayName?: string;
	photoURL?: string;
	currentOrganizationId?: string;
	// Add other profile fields as needed
	createdAt?: any; // Use 'any' for now to avoid Timestamp import here, handled in API mapping
	updatedAt?: any; // Use 'any' for now
}

export interface EmployeeLocationAssignment {
	id?: string; // Firestore document ID (optional as it's set by Firestore)
	employeeId: string;
	locationId: string;
	organizationId: string; // Good practice to scope assignments by org
	createdAt?: string; // Optional timestamp
}
