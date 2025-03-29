export interface Employee {
	id: string;
	organizationId: string;
	name: string;
	email: string;
	role: string;
	phone?: string;
	hireDate?: string;
	address?: string;
	emergencyContact?: string;
	notes?: string;
	avatar?: string;
	hourlyRate?: number;
	status?: "invited" | "active" | "disabled";
	isOnline?: boolean;
	lastActive?: string;
}
