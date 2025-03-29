import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { Employee } from "@/api/types";
import { EmployeesAPI } from "@/api";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { getOrgId } from "./organization";

// Context type that includes all necessary functionality
interface EmployeeContextType {
	// All employees from the API
	employees: Employee[];
	// Current selected employee
	currentEmployee: Employee | null;
	// Loading state
	isLoading: boolean;
	// Refresh the employees
	refreshEmployees: () => Promise<void>;
	// Get the current employee ID safely
	getCurrentEmployeeId: () => string | null;
	// Select a specific employee
	selectEmployee: (employeeId: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
	undefined
);

export function EmployeeProvider({ children }: { children: ReactNode }) {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch all employees for the current organization
	const refreshEmployees = async () => {
		try {
			setIsLoading(true);
			const organizationId = getOrgId();
			const employeeData = await EmployeesAPI.getAll(organizationId);

			setEmployees(employeeData);

			// Set the first employee as current if there's no current selection
			if (employeeData.length > 0 && !currentEmployee) {
				setCurrentEmployee(employeeData[0]);
			} else if (currentEmployee) {
				// Make sure current employee is updated with latest data
				const updated = employeeData.find(
					(emp) => emp.id === currentEmployee.id
				);
				if (updated) {
					setCurrentEmployee(updated);
				} else if (employeeData.length > 0) {
					// If current employee no longer exists, select the first one
					setCurrentEmployee(employeeData[0]);
				} else {
					setCurrentEmployee(null);
				}
			}
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast.error("Failed to load employees");
		} finally {
			setIsLoading(false);
		}
	};

	// Get the current employee ID safely
	const getCurrentEmployeeId = (): string | null => {
		return currentEmployee ? currentEmployee.id : null;
	};

	// Select a specific employee
	const selectEmployee = (employeeId: string) => {
		const employee = employees.find((emp) => emp.id === employeeId);
		if (employee) {
			setCurrentEmployee(employee);
		} else {
			toast.error("Employee not found");
		}
	};

	// Initial data fetch
	useEffect(() => {
		refreshEmployees();
	}, []);

	// Set up real-time subscription for employee updates
	useEffect(() => {
		const organizationId = getOrgId();

		const subscription = supabase
			.channel("employee-updates")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
					schema: "public",
					table: "employees",
					filter: `organizationId=eq.${organizationId}`,
				},
				() => {
					refreshEmployees();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Context value
	const contextValue: EmployeeContextType = {
		employees,
		currentEmployee,
		isLoading,
		refreshEmployees,
		getCurrentEmployeeId,
		selectEmployee,
	};

	return (
		<EmployeeContext.Provider value={contextValue}>
			{children}
		</EmployeeContext.Provider>
	);
}

// Custom hook to use the employee context
export function useEmployee() {
	const context = useContext(EmployeeContext);
	if (context === undefined) {
		throw new Error("useEmployee must be used within an EmployeeProvider");
	}
	return context;
}

// Utility function to get employee ID (can be used in any context)
export function getCurrentEmployee(): string | null {
	try {
		// This will work in component contexts
		const { getCurrentEmployeeId } = useEmployee();
		return getCurrentEmployeeId();
	} catch (error) {
		// Return null if we're not in a component context
		console.warn("Unable to get employee ID - not in component context");
		return null;
	}
}
