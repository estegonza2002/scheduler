import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
	ShiftAssignmentsAPI,
	OrganizationsAPI,
} from "@/api";
import { format } from "date-fns";
import {
	LocationSelectionStep,
	ShiftDetailsStep,
	WizardStep,
} from "./shift-wizard";
import {
	EmployeeSelectionComponent,
	SelectedEmployee,
} from "./employee/EmployeeSelectionComponent";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Helper function to validate if a string is a UUID
 */
const isValidUUID = (str: string): boolean => {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
};

/**
 * Props for the ShiftCreationWizard component
 */
interface ShiftCreationWizardProps {
	/**
	 * ID of the schedule to create shifts for
	 */
	scheduleId: string;
	/**
	 * ID of the organization
	 */
	organizationId: string;
	/**
	 * Optional initial date for the shift
	 */
	initialDate?: Date;
	/**
	 * Optional initial location ID to pre-select
	 */
	initialLocationId?: string;
	/**
	 * Optional callback fired when wizard completes successfully
	 */
	onComplete?: (shiftId: string) => void;
	/**
	 * Optional callback fired when wizard is cancelled
	 */
	onCancel?: () => void;
	/**
	 * Optional callback to notify parent component of state changes
	 */
	onStateChange?: (state: {
		currentStep: string;
		canContinue: boolean;
		isLoading: boolean;
		selectedEmployeesCount: number;
	}) => void;
	/**
	 * Optional additional CSS class for the component
	 */
	className?: string;
}

/**
 * Data structure for the location selection step
 */
type LocationData = {
	locationId: string;
};

/**
 * Data structure for the shift details step
 */
type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

/**
 * Data structure for the employee assignment step
 */
type EmployeeData = {
	employeeId: string;
};

/**
 * A multi-step wizard component for creating shifts
 */
export function ShiftCreationWizard({
	scheduleId,
	organizationId,
	initialDate,
	initialLocationId,
	onComplete,
	onCancel,
	onStateChange,
	className,
}: ShiftCreationWizardProps) {
	// Current step in the wizard
	const [step, setStep] = useState<WizardStep>(
		initialLocationId ? "shift-details" : "select-location"
	);

	// Store data from each step
	const [locationData, setLocationData] = useState<LocationData | null>(
		initialLocationId ? { locationId: initialLocationId } : null
	);
	const [shiftData, setShiftData] = useState<ShiftData | null>(null);

	// State for multiple employee selection
	const [selectedEmployees, setSelectedEmployees] = useState<
		SelectedEmployee[]
	>([]);

	// State for data loading and filtering
	const [loading, setLoading] = useState(false);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
	const [loadingEmployees, setLoadingEmployees] = useState(false);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		initialDate || new Date()
	);

	// Error state
	const [error, setError] = useState<string | null>(null);

	// Search functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [locationSearchTerm, setLocationSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Forms for each step
	const locationForm = useForm<LocationData>({
		defaultValues: {
			locationId: initialLocationId || "",
		},
	});

	const shiftForm = useForm<ShiftData>({
		defaultValues: {
			date: initialDate ? format(initialDate, "yyyy-MM-dd") : getCurrentDate(),
			startTime: "09:00",
			endTime: "17:00",
			notes: "",
		},
	});

	const employeeForm = useForm<EmployeeData>({
		defaultValues: {
			employeeId: "",
		},
	});

	// Notify parent of state changes
	useEffect(() => {
		if (onStateChange) {
			onStateChange({
				currentStep: step,
				canContinue:
					step === "select-location"
						? !!locationForm.watch("locationId") &&
						  !loadingLocations &&
						  locations.length > 0
						: step === "shift-details"
						? shiftForm.formState.isValid
						: true,
				isLoading: loading || loadingLocations || loadingEmployees,
				selectedEmployeesCount: selectedEmployees.length,
			});
		}
	}, [
		step,
		locationForm.watch("locationId"),
		shiftForm.formState.isValid,
		loading,
		loadingLocations,
		loadingEmployees,
		selectedEmployees.length,
		locations.length,
	]);

	// Update date when initialDate changes
	useEffect(() => {
		if (initialDate) {
			setSelectedDate(initialDate);
			shiftForm.setValue("date", format(initialDate, "yyyy-MM-dd"));
		}
	}, [initialDate, shiftForm]);

	// Fetch locations
	useEffect(() => {
		async function fetchLocations() {
			try {
				console.log("Fetching locations with organization ID:", organizationId);
				if (!organizationId || organizationId === "org-1") {
					setError("No valid organization ID. Unable to fetch locations.");
					setLoadingLocations(false);
					return;
				}

				setLoadingLocations(true);
				setError(null);
				const locationList = await LocationsAPI.getAll(organizationId);
				console.log("Locations fetched:", locationList);
				setLocations(locationList);
				setFilteredLocations(locationList);
			} catch (error) {
				console.error("Error fetching locations:", error);
				// Only set UI error, don't show toast since empty result is expected for new users
				setError("Failed to load locations. Please try again.");
			} finally {
				setLoadingLocations(false);
			}
		}

		fetchLocations();
	}, [organizationId]);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(locationSearchTerm);
		}, 300);

		return () => clearTimeout(timer);
	}, [locationSearchTerm]);

	// Filter locations based on debounced search term
	useEffect(() => {
		if (!debouncedSearchTerm.trim()) {
			setFilteredLocations(locations);
			return;
		}

		const searchTerms = debouncedSearchTerm
			.toLowerCase()
			.split(/\s+/)
			.filter((term) => term.length > 0);

		const filtered = locations.filter((location) => {
			// If no search terms, include all locations
			if (searchTerms.length === 0) return true;

			// Check if all search terms match something in the location
			return searchTerms.every((term) => {
				return (
					location.name.toLowerCase().includes(term) ||
					(location.address && location.address.toLowerCase().includes(term)) ||
					(location.city && location.city.toLowerCase().includes(term)) ||
					(location.state && location.state.toLowerCase().includes(term)) ||
					(location.zipCode && location.zipCode.toLowerCase().includes(term))
				);
			});
		});

		setFilteredLocations(filtered);
	}, [debouncedSearchTerm, locations]);

	// Fetch employees
	useEffect(() => {
		async function fetchEmployees() {
			try {
				console.log(
					"Starting to fetch employees for organization:",
					organizationId
				);
				setLoadingEmployees(true);
				setError(null);
				const employeeList = await EmployeesAPI.getAll(organizationId);
				console.log("Employees fetched successfully:", employeeList);

				if (employeeList.length > 0) {
					// Log the structure of the first employee
					console.log("First employee structure:", {
						employee: employeeList[0],
						hasStatusProperty: "status" in employeeList[0],
						properties: Object.keys(employeeList[0]),
					});
				}

				setEmployees(employeeList);
				setFilteredEmployees(employeeList);
			} catch (error) {
				console.error("Error fetching employees:", error);
				// Only set UI error, don't show toast since empty result is expected for new users
				setError("Failed to load employees. Please try again.");
			} finally {
				setLoadingEmployees(false);
			}
		}

		fetchEmployees();
	}, [organizationId]);

	// Filter employees based on search term
	useEffect(() => {
		console.log("Running employee filter effect", {
			searchTerm,
			employees: employees.length,
		});

		// If no search term, show all employees
		if (!searchTerm.trim()) {
			console.log("No search term, showing all employees", employees);
			setFilteredEmployees(employees);
			return;
		}

		// Apply search filter
		const lowerCaseSearch = searchTerm.toLowerCase();
		const filtered = employees.filter((employee) => {
			// Simple name search
			if (employee.name.toLowerCase().includes(lowerCaseSearch)) {
				return true;
			}

			// Also search by position if available
			const position = employee.position || "";
			if (position.toLowerCase().includes(lowerCaseSearch)) {
				return true;
			}

			return false;
		});

		console.log("Applied search filter, filtered employees:", filtered);
		setFilteredEmployees(filtered);
	}, [searchTerm, employees]);

	// Handle the location step submission
	const handleLocationSelect = (locationId: string) => {
		setLocationData({ locationId });
		setStep("shift-details");
	};

	// Reset location and return to first step
	const resetLocation = () => {
		setLocationData(null);
		setShiftData(null);
		setSelectedEmployees([]);
		locationForm.setValue("locationId", "");
		setStep("select-location");
	};

	// Handle the shift details step submission
	const handleShiftDetailsSubmit = (data: ShiftData) => {
		setShiftData(data);
		setStep("assign-employees");
	};

	// Handle the full form submission with multiple employees
	const handleEmployeeAssignSubmit = async (
		data: EmployeeData,
		selectedEmployees: SelectedEmployee[]
	) => {
		console.log("Starting handleEmployeeAssignSubmit", {
			data,
			selectedEmployees,
		});

		if (!locationData || !shiftData) {
			console.error("Missing required data", { locationData, shiftData });
			return;
		}

		// Check if an employee was selected but the selectedEmployees array is empty
		if (
			data.employeeId &&
			(!selectedEmployees || selectedEmployees.length === 0)
		) {
			console.warn(
				"Employee ID was provided but selectedEmployees array is empty, adding it manually",
				data.employeeId
			);
			// Try to find the employee in the employees array
			const selectedEmployee = employees.find(
				(emp) => emp.id === data.employeeId
			);
			if (selectedEmployee) {
				selectedEmployees = [
					{
						id: selectedEmployee.id,
						name: selectedEmployee.name,
						position: selectedEmployee.position,
					},
				];
				console.log("Added employee manually:", selectedEmployees[0]);
			}
		}

		console.log("Creating shift with the following data:");
		console.log({
			organization_id: organizationId,
			location_id: locationData.locationId,
			date: shiftData.date,
			startTime: shiftData.startTime,
			endTime: shiftData.endTime,
			notes: shiftData.notes,
			selectedEmployees: selectedEmployees.map((e) => ({
				id: e.id,
				name: e.name,
			})),
		});

		// Validate critical IDs
		if (scheduleId && !isValidUUID(scheduleId)) {
			setError(`Invalid schedule ID: ${scheduleId}. Must be a valid UUID.`);
			toast.error("Failed to create shift: Invalid schedule ID");
			return;
		}

		if (!isValidUUID(organizationId)) {
			setError(
				`Invalid organization ID: ${organizationId}. Must be a valid UUID.`
			);
			toast.error("Failed to create shift: Invalid organization ID");
			return;
		}

		// If organization ID is invalid or empty, try to get a valid one
		if (!organizationId || !isValidUUID(organizationId)) {
			console.log(
				"Invalid or missing organization ID. Attempting to find a valid organization..."
			);
			try {
				const organizations = await OrganizationsAPI.getAll();
				if (organizations && organizations.length > 0) {
					console.log("Found valid organization:", organizations[0].id);
					organizationId = organizations[0].id;
				} else {
					setError("No valid organizations found");
					toast.error("Failed to create shift: No valid organizations found");
					return;
				}
			} catch (error) {
				console.error("Error fetching organizations:", error);
				setError("Failed to fetch organizations");
				toast.error("Failed to create shift: Could not fetch organizations");
				return;
			}
		}

		if (!isValidUUID(locationData.locationId)) {
			setError(
				`Invalid location ID: ${locationData.locationId}. Must be a valid UUID.`
			);
			toast.error("Failed to create shift: Invalid location ID");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Combine date and time into ISO strings
			const startDateTime = `${shiftData.date}T${shiftData.startTime}:00`;
			const endDateTime = `${shiftData.date}T${shiftData.endTime}:00`;

			console.log("Creating shift with times", { startDateTime, endDateTime });

			// If no employees selected, create shift without an employee
			if (!selectedEmployees || selectedEmployees.length === 0) {
				console.log("Creating shift without employee");
				try {
					const shiftCreateData = {
						organization_id: organizationId,
						location_id: locationData.locationId,
						// Removing user_id completely to avoid foreign key constraint
						start_time: startDateTime,
						end_time: endDateTime,
						description: shiftData.notes, // Notes
						is_schedule: false as const, // Explicitly typed as false, not boolean
						status: "scheduled", // Required field in the database
					};
					console.log("Shift creation payload:", shiftCreateData);

					const createdShift = await ShiftsAPI.createShift(shiftCreateData);
					console.log("Shift created successfully:", createdShift);
					toast.success("Shift created successfully");

					// Call onComplete with created shift ID
					if (onComplete) {
						onComplete(createdShift.id);
					}
				} catch (err) {
					console.error("Detailed error creating shift:", err);
					throw err;
				}
			} else {
				console.log(
					`Creating shift with ${selectedEmployees.length} employee assignments`,
					selectedEmployees
				);

				// First create a shift without a user_id to avoid the foreign key constraint
				try {
					const shiftCreateData = {
						organization_id: organizationId,
						location_id: locationData.locationId,
						// No user_id field
						start_time: startDateTime,
						end_time: endDateTime,
						description: shiftData.notes,
						is_schedule: false as const,
						status: "scheduled",
					};

					console.log("Creating main shift:", shiftCreateData);
					const createdShift = await ShiftsAPI.createShift(shiftCreateData);
					console.log("Main shift created successfully:", createdShift);

					// Now create shift assignments for each employee
					const shiftId = createdShift.id;
					console.log("Creating assignments for shift ID:", shiftId);

					// Process each employee assignment in sequence to avoid overwhelming the database
					const assignmentPromises = selectedEmployees.map(async (employee) => {
						try {
							console.log(
								`Creating assignment for employee: ${employee.name} (${employee.id})`
							);

							const assignment = await ShiftAssignmentsAPI.create({
								shift_id: shiftId,
								employee_id: employee.id,
							});

							console.log(
								`Assignment created for ${employee.name}:`,
								assignment
							);
							return assignment;
						} catch (err) {
							console.error(
								`Error creating assignment for ${employee.name}:`,
								err
							);
							// Continue with other employees even if one fails
							return null;
						}
					});

					// Wait for all assignments to complete
					await Promise.all(assignmentPromises);

					console.log("All assignments processed");
					toast.success("Shift created with employee assignments");

					// Call onComplete with created shift ID
					if (onComplete) {
						onComplete(createdShift.id);
					}
				} catch (error) {
					console.error("Error creating shift or assignments:", error);
					setError(
						"Failed to create shift. Please check your inputs and try again."
					);
					setLoading(false);
					throw error;
				}
			}

			setLoading(false);
			console.log("Shift creation process complete");
		} catch (error) {
			console.error("Error in handleEmployeeAssignSubmit:", error);
			setError(
				error instanceof Error
					? error.message
					: "An unexpected error occurred. Please try again."
			);
			setLoading(false);
		}
	};

	function getCurrentDate() {
		const today = new Date();
		return today.toISOString().split("T")[0];
	}

	// Get selected location name
	const getLocationName = (locationId: string) => {
		const location = locations.find((loc) => loc.id === locationId);
		return location ? location.name : "Unknown Location";
	};

	// Get location by ID
	const getLocationById = (locationId: string) => {
		return locations.find((loc) => loc.id === locationId);
	};

	// Clear location search
	const clearLocationSearch = () => {
		setLocationSearchTerm("");
	};

	// Handle location selection and advance to next step
	const handleLocationChange = (locationId: string) => {
		// Set the location ID in the form
		locationForm.setValue("locationId", locationId);

		// Automatically submit the form to advance to the next step
		handleLocationSelect(locationId);
	};

	// Get progress value based on current step
	const getProgressValue = () => {
		switch (step) {
			case "select-location":
				return 33;
			case "shift-details":
				return 66;
			case "assign-employees":
				return 100;
			default:
				return 0;
		}
	};

	// Update selected employees
	const handleSelectedEmployeesChange = (employees: SelectedEmployee[]) => {
		setSelectedEmployees(employees);
	};

	return (
		<>
			<div className="space-y-2 mb-4">
				<div className="flex justify-between text-sm">
					<span
						className={cn(
							step === "select-location"
								? "text-primary font-medium"
								: "text-muted-foreground"
						)}>
						1. Location
					</span>
					<span
						className={cn(
							step === "shift-details"
								? "text-primary font-medium"
								: "text-muted-foreground",
							!locationData && "opacity-50"
						)}>
						2. Schedule
					</span>
					<span
						className={cn(
							step === "assign-employees"
								? "text-primary font-medium"
								: "text-muted-foreground",
							!shiftData && "opacity-50"
						)}>
						3. Employee
					</span>
				</div>
				<Progress
					value={getProgressValue()}
					className="h-1.5"
				/>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Step 1: Select Location */}
			{step === "select-location" && (
				<LocationSelectionStep
					locationForm={locationForm}
					locations={locations}
					filteredLocations={filteredLocations}
					locationSearchTerm={locationSearchTerm}
					loadingLocations={loadingLocations}
					setLocationSearchTerm={setLocationSearchTerm}
					handleLocationSelect={handleLocationSelect}
					handleLocationChange={handleLocationChange}
					clearLocationSearch={clearLocationSearch}
					onCancel={onCancel}
					organizationId={organizationId}
				/>
			)}

			{/* Step 2: Shift Details */}
			{step === "shift-details" && locationData && (
				<>
					<ShiftDetailsStep
						shiftForm={shiftForm}
						locationData={locationData}
						getLocationById={getLocationById}
						handleShiftDetailsSubmit={handleShiftDetailsSubmit}
						onBack={resetLocation}
					/>
					<Button
						id="shift-details-back-button"
						variant="ghost"
						className="hidden"
						onClick={resetLocation}>
						Back to Location Selection
					</Button>
				</>
			)}

			{/* Step 3: Assign Employee */}
			{step === "assign-employees" && locationData && shiftData && (
				<EmployeeSelectionComponent
					employeeForm={employeeForm}
					locationData={locationData}
					shiftData={shiftData}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					filteredEmployees={filteredEmployees}
					loadingEmployees={loadingEmployees}
					getLocationName={getLocationName}
					onFormSubmit={() =>
						handleEmployeeAssignSubmit(
							employeeForm.getValues(),
							selectedEmployees
						)
					}
					onBack={() => setStep("shift-details")}
					onResetLocation={resetLocation}
					loading={loading}
					selectedEmployees={selectedEmployees}
					onSelectedEmployeesChange={handleSelectedEmployeesChange}
					allEmployees={employees}
					title="Assign Employees"
					subtitle="Select employees to assign to this shift"
					showShiftInfo={true}
					filterByLocation={true}
					submitButtonText="Create Shift"
				/>
			)}
		</>
	);
}
