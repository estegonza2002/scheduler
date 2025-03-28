import { Employee } from "@/api";

/**
 * Checks an employee profile for missing information
 * @param employee The employee object to check
 * @returns Object containing profile completion status information
 */
export function getProfileCompletionStatus(employee: Employee): {
	isComplete: boolean;
	missingHighPriority: boolean;
	missingCount: number;
	missingFields: Array<{
		key: keyof Employee;
		label: string;
		priority: "high" | "medium" | "low";
	}>;
} {
	// Define required fields to check
	const requiredFields: {
		key: keyof Employee;
		label: string;
		priority: "high" | "medium" | "low";
	}[] = [
		{ key: "hourlyRate", label: "Hourly Rate", priority: "high" },
		{ key: "hireDate", label: "Hire Date", priority: "high" },
		{ key: "phone", label: "Phone Number", priority: "medium" },
		{ key: "position", label: "Position", priority: "medium" },
		{ key: "address", label: "Address", priority: "low" },
		{ key: "emergencyContact", label: "Emergency Contact", priority: "medium" },
	];

	// Check which fields are missing
	const missingFields = requiredFields.filter((field) => {
		// For hourlyRate specifically check if it's undefined
		if (field.key === "hourlyRate") {
			return employee.hourlyRate === undefined;
		}
		// For other fields check if they're falsy
		return !employee[field.key];
	});

	const missingHighPriority = missingFields.some(
		(field) => field.priority === "high"
	);

	return {
		isComplete: missingFields.length === 0,
		missingHighPriority,
		missingCount: missingFields.length,
		missingFields,
	};
}
