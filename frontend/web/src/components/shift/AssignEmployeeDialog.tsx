import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import {
	EmployeesAPI,
	LocationsAPI,
	ShiftsAPI,
	Employee,
	Location,
	Shift,
} from "../../api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmployeeSelectionComponent } from "../employee/EmployeeSelectionComponent";
import type { SelectedEmployee } from "../employee/EmployeeSelectionComponent";

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
	const [locationName, setLocationName] = useState<string>("Loading...");
	const [selectedEmployees, setSelectedEmployees] = useState<
		SelectedEmployee[]
	>([]);

	// Fetch employees, locations and shift data
	useEffect(() => {
		if (open) {
			const fetchData = async () => {
				try {
					setLoading(true);
					console.log(
						"AssignEmployeeDialog: Starting data fetch for shift:",
						shiftId
					);

					// First get the shift data
					const shiftData = await ShiftsAPI.getShiftById(shiftId);
					console.log("AssignEmployeeDialog: Loaded shift data:", shiftData);
					setShift(shiftData);

					// Next fetch employees and locations in parallel
					const [employeesData, locationsData] = await Promise.all([
						EmployeesAPI.getAll(),
						LocationsAPI.getAll(),
					]);

					console.log("AssignEmployeeDialog: Loaded data:", {
						employeesCount: employeesData.length,
						locationsCount: locationsData.length,
						locationIds: locationsData.map((loc) => loc.id),
					});

					setEmployees(employeesData);
					setLocations(locationsData);

					// If shift has a location_id, directly fetch the location by ID
					if (shiftData?.location_id) {
						try {
							const location = await LocationsAPI.getById(
								shiftData.location_id
							);
							if (location) {
								console.log(
									"AssignEmployeeDialog: Found location by direct lookup:",
									location.name
								);
								setLocationName(location.name);
							} else {
								console.warn(
									"AssignEmployeeDialog: Location not found by direct lookup:",
									shiftData.location_id
								);
								// Try finding in the locations array as fallback
								const locFromArray = locationsData.find(
									(loc) => loc.id === shiftData.location_id
								);
								if (locFromArray) {
									console.log(
										"AssignEmployeeDialog: Found location in array:",
										locFromArray.name
									);
									setLocationName(locFromArray.name);
								} else {
									console.warn(
										"AssignEmployeeDialog: Location not found in array either"
									);
									setLocationName("Unknown Location");
								}
							}
						} catch (error) {
							console.error("Error fetching location:", error);
							setLocationName("Unknown Location");
						}
					} else {
						setLocationName("Unassigned");
					}

					// Find assigned employees only after we have the employee data
					if (shiftData?.user_id) {
						const assignedEmp = employeesData.find(
							(emp) => emp.id === shiftData.user_id
						);

						if (assignedEmp) {
							console.log(
								"AssignEmployeeDialog: Found assigned employee:",
								assignedEmp.name
							);
							setSelectedEmployees([
								{
									id: assignedEmp.id,
									name: assignedEmp.name,
									role: assignedEmp.role || "",
								},
							]);
						} else {
							console.warn(
								"AssignEmployeeDialog: User ID in shift not found in employees:",
								shiftData.user_id
							);
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
			setLocationName("Loading...");
		}
	}, [open, shiftId]);

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
		if (!locationId) return "Unassigned";
		// Return the location name from state if we have it
		if (locationId === shift?.location_id) {
			return locationName;
		}

		// Fallback to the old way (search in locations array)
		const location = locations.find((loc) => loc.id === locationId);
		if (!location) {
			console.warn(
				`Location not found with ID: ${locationId}. Available location IDs:`,
				locations.map((loc) => loc.id)
			);
			return "Unassigned";
		}
		return location.name;
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

				<EmployeeSelectionComponent
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
					onBack={() => onOpenChange(false)}
					loading={loading}
					selectedEmployees={selectedEmployees}
					onSelectedEmployeesChange={setSelectedEmployees}
					allEmployees={employees}
					onFormSubmit={handleEmployeeAssignSubmit}
					title="Assign Employees"
					subtitle="Select employees to assign to this shift"
					showShiftInfo={true}
					filterByLocation={true}
					submitButtonText="Assign Employees"
				/>
			</SheetContent>
		</Sheet>
	);
}
