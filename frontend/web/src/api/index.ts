// API implementation with code-based toggle between mock and real APIs
import { toast } from "sonner";

// Re-export all types from the mock module
export * from "./mock/types";

// Import the global toggle constant
import { USE_MOCK_API } from "../constants";

// Import both mock and real API implementations
import {
	EmployeesAPI as MockEmployeesAPI,
	LocationsAPI as MockLocationsAPI,
	NotificationsAPI as MockNotificationsAPI,
	OrganizationsAPI as MockOrganizationsAPI,
	SchedulesAPI as MockSchedulesAPI,
	ShiftAssignmentsAPI as MockShiftAssignmentsAPI,
	ShiftsAPI as MockShiftsAPI,
	EmployeeLocationsAPI as MockEmployeeLocationsAPI,
	initMockData,
} from "./mock/api";

import {
	EmployeesAPI as RealEmployeesAPI,
	LocationsAPI as RealLocationsAPI,
	NotificationsAPI as RealNotificationsAPI,
	OrganizationsAPI as RealOrganizationsAPI,
	ShiftAssignmentsAPI as RealShiftAssignmentsAPI,
	ShiftsAPI as RealShiftsAPI,
	EmployeeLocationsAPI as RealEmployeeLocationsAPI,
} from "./real/api";

// Log which API implementation is being used
console.log(`Using ${USE_MOCK_API ? "MOCK" : "REAL"} API implementation`);

// Initialize mock data if using mock API
if (USE_MOCK_API) {
	console.log("Initializing mock data");
	initMockData();
} else {
	console.log("Using real data from Supabase");
}

// Export the appropriate API implementation based on the constant
export const EmployeesAPI = USE_MOCK_API ? MockEmployeesAPI : RealEmployeesAPI;
export const LocationsAPI = USE_MOCK_API ? MockLocationsAPI : RealLocationsAPI;
export const NotificationsAPI = USE_MOCK_API
	? MockNotificationsAPI
	: RealNotificationsAPI;
export const OrganizationsAPI = USE_MOCK_API
	? MockOrganizationsAPI
	: RealOrganizationsAPI;
export const SchedulesAPI = USE_MOCK_API ? MockSchedulesAPI : RealShiftsAPI;
export const ShiftAssignmentsAPI = USE_MOCK_API
	? MockShiftAssignmentsAPI
	: RealShiftAssignmentsAPI;
export const ShiftsAPI = USE_MOCK_API ? MockShiftsAPI : RealShiftsAPI;
export const EmployeeLocationsAPI = USE_MOCK_API
	? MockEmployeeLocationsAPI
	: RealEmployeeLocationsAPI;
