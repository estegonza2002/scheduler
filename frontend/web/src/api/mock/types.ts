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
	status: string;
	isOnline: boolean;
	lastActive: string;
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
