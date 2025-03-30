import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { EmployeeAssignmentStep } from "../shift-wizard/EmployeeAssignmentStep";
import {
	EmployeesAPI,
	LocationsAPI,
	ShiftsAPI,
	Employee,
	Location,
	Shift,
} from "../../api";
import { toast } from "sonner";
import { AssignEmployeeStep, SelectedEmployee } from "./AssignEmployeeStep";
import { cn } from "@/lib/utils";

interface AssignEmployeeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAssigned?: () => void;
	shiftId: string;
}

export function AssignEmployeeDialog({
	open,
	onOpenChange,
	onAssigned,
	shiftId,
}: AssignEmployeeDialogProps) {
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [shift, setShift] = useState<Shift | null>(null);
	const [selectedEmployees, setSelectedEmployees] = useState<
		SelectedEmployee[]
	>([]);

	// Fetch employees, locations and shift data
	useEffect(() => {
		if (open) {
			const fetchData = async () => {
				try {
					setLoading(true);
					const [employeesData, locationsData, shiftData] = await Promise.all([
						EmployeesAPI.getAll(),
						LocationsAPI.getAll(),
						ShiftsAPI.getShiftById(shiftId),
					]);

					setEmployees(employeesData);
					setLocations(locationsData);
					setShift(shiftData);

					// Find assigned employees only after we have the employee data
					if (shiftData?.user_id) {
						const assignedEmp = employeesData.find(
							(emp) => emp.id === shiftData.user_id
						);

						if (assignedEmp) {
							setSelectedEmployees([
								{
									id: assignedEmp.id,
									name: assignedEmp.name,
									role: assignedEmp.role || "",
								},
							]);
						}
					}
				} catch (error) {
					console.error("Error loading data:", error);
					toast.error("Error loading data. Please try again.");
				} finally {
					setLoading(false);
				}
			};

			fetchData();
		} else {
			// Reset state when dialog is closed
			setSearchTerm("");
			setSelectedEmployees([]);
		}
	}, [open, shiftId]); // Remove employees from dependencies

	// Filter employees based on search term
	const filteredEmployees = employees.filter((employee) =>
		employee.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleEmployeeAssignSubmit = async (data: any) => {
		if (!shift) return;

		try {
			setLoading(true);

			// Get the employee IDs from the selected employees
			const employeeIds = selectedEmployees.map((emp) => emp.id);

			// Since ShiftsAPI doesn't have an explicit method for managing assigned employees,
			// we'll use updateShift to update the user_id field
			// This is a simple implementation - in a real app, you'd likely
			// handle multiple employees differently
			await ShiftsAPI.updateShift(shiftId, {
				user_id: employeeIds.length > 0 ? employeeIds[0] : undefined,
			});

			toast.success("Employees assigned successfully");

			// Call the callback if provided
			if (onAssigned) {
				onAssigned();
			}

			// Close the dialog
			onOpenChange(false);
		} catch (error) {
			console.error("Error assigning employees:", error);
			toast.error("Failed to assign employees");
		} finally {
			setLoading(false);
		}
	};

	// Helper function to get location name
	const getLocationName = (locationId: string) => {
		const location = locations.find((loc) => loc.id === locationId);
		return location ? location.name : "Unknown Location";
	};

	if (!shift) {
		return null;
	}

	// Get formatted date and time from shift
	const shiftDate = new Date(shift.start_time);
	const formattedDate = shiftDate.toISOString().split("T")[0]; // YYYY-MM-DD
	const startTime = new Date(shift.start_time).toTimeString().slice(0, 5); // HH:MM
	const endTime = new Date(shift.end_time).toTimeString().slice(0, 5); // HH:MM

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Assign Employees to Shift</SheetTitle>
				</SheetHeader>

				<AssignEmployeeStep
					employeeForm={{} as any} // The form is not used directly
					locationData={{ locationId: shift.location_id || "" }}
					shiftData={{
						date: formattedDate,
						startTime: startTime,
						endTime: endTime,
						notes: shift.description || "",
					}}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					filteredEmployees={filteredEmployees}
					loadingEmployees={loading}
					getLocationName={getLocationName}
					handleEmployeeAssignSubmit={handleEmployeeAssignSubmit}
					onBack={() => onOpenChange(false)} // Go back just closes the dialog
					onResetLocation={() => {}} // Not needed in this context
					loading={loading}
					selectedEmployees={selectedEmployees}
					onSelectedEmployeesChange={setSelectedEmployees}
					allEmployees={employees}
					onFormSubmit={handleEmployeeAssignSubmit}
				/>
			</SheetContent>
		</Sheet>
	);
}
