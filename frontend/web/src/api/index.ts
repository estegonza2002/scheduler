// Mock API implementation that simulates backend calls
import { toast } from "sonner";

// Re-export all types from the mock module
export * from "./mock/types";

// Import and re-export all API functions from the mock module
import {
	EmployeesAPI,
	LocationsAPI,
	NotificationsAPI,
	OrganizationsAPI,
	SchedulesAPI,
	ShiftAssignmentsAPI,
	ShiftsAPI,
	initMockData,
} from "./mock/api";

export {
	EmployeesAPI,
	LocationsAPI,
	NotificationsAPI,
	OrganizationsAPI,
	SchedulesAPI,
	ShiftAssignmentsAPI,
	ShiftsAPI,
};

// Initialize mock data
initMockData();

// TODO: In the future, we can add a real API implementation and toggle between them
