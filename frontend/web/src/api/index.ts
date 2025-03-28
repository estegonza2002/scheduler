// API implementation using real APIs
import { toast } from "sonner";

// Re-export all types from the mock module
export * from "./mock/types";

// Import real API implementations
import {
	EmployeesAPI,
	LocationsAPI,
	NotificationsAPI,
	OrganizationsAPI,
	ShiftAssignmentsAPI,
	ShiftsAPI,
	EmployeeLocationsAPI,
} from "./real/api";

// Log that we're using the real API implementation
console.log("Using REAL API implementation from Supabase");

// Export the API implementations directly
export {
	EmployeesAPI,
	LocationsAPI,
	NotificationsAPI,
	OrganizationsAPI,
	ShiftsAPI as SchedulesAPI,
	ShiftAssignmentsAPI,
	ShiftsAPI,
	EmployeeLocationsAPI,
};
