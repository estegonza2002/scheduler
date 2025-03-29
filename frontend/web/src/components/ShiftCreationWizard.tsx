import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "@/api";
import { format } from "date-fns";
import {
	LocationSelectionStep,
	ShiftDetailsStep,
	EmployeeAssignmentStep,
	WizardProgressBar,
	WizardStep,
} from "./shift-wizard";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
	onComplete?: () => void;
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
 * Data structure for a selected employee
 */
type SelectedEmployee = {
	id: string;
	name: string;
	role?: string;
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
	const [searchFilter, setSearchFilter] = useState<string>("all");
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
			searchFilter,
			employees: employees.length,
		});

		// If no search term and no role filter (all), show all employees
		if (!searchTerm.trim() && searchFilter === "all") {
			console.log("No filter active, showing all employees", employees);
			setFilteredEmployees(employees);
			return;
		}

		// Apply filters
		const lowerCaseSearch = searchTerm.toLowerCase();
		const filtered = employees.filter((employee) => {
			// First check if we need to filter by role
			if (searchFilter !== "all" && searchFilter !== "name") {
				// If we're filtering by a specific role value
				if (employee.role !== searchFilter) {
					return false; // Employee doesn't have this role, exclude them
				}
			}

			// If we have a search term, apply text search
			if (searchTerm.trim()) {
				// Always search by name unless explicitly filtering only by role
				if (searchFilter === "all" || searchFilter === "name") {
					if (employee.name.toLowerCase().includes(lowerCaseSearch)) {
						return true;
					}
				}

				// Search by role if filter is 'all' or explicitly 'role'
				if (searchFilter === "all" || searchFilter === "role") {
					const role = employee.role || "";
					if (role.toLowerCase().includes(lowerCaseSearch)) {
						return true;
					}
				}

				// If we got here with a search term but didn't match anything, exclude
				return false;
			}

			// If we got here, the employee passed the role filter and there was no search term
			return true;
		});

		console.log("Applied filters, filtered employees:", filtered);
		setFilteredEmployees(filtered);
	}, [searchTerm, searchFilter, employees]);

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
		setStep("assign-employee");
	};

	// Handle the full form submission with multiple employees
	const handleEmployeeAssignSubmit = async (
		data: EmployeeData,
		selectedEmployees: SelectedEmployee[]
	) => {
		console.log("Starting handleEmployeeAssignSubmit", {
			data,
			selectedEmployees,
			locationData,
			shiftData,
		});

		if (!locationData || !shiftData) {
			console.error("Missing required data", { locationData, shiftData });
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
				await ShiftsAPI.createShift({
					parent_shift_id: scheduleId,
					organization_id: organizationId,
					location_id: locationData.locationId,
					user_id: "", // Empty string for no employee
					start_time: startDateTime,
					end_time: endDateTime,
					description: shiftData.notes, // Notes
					is_schedule: false,
					status: "scheduled", // Required field in the database
				});

				toast.success("Shift created successfully");
			} else {
				console.log(
					`Creating ${selectedEmployees.length} shifts with employees`,
					selectedEmployees
				);
				// Create a shift for each selected employee
				const promises = selectedEmployees.map((employee) => {
					console.log(
						`Creating shift for employee: ${employee.name}`,
						employee
					);
					return ShiftsAPI.createShift({
						parent_shift_id: scheduleId,
						organization_id: organizationId,
						location_id: locationData.locationId,
						user_id: employee.id,
						start_time: startDateTime,
						end_time: endDateTime,
						description: shiftData.notes,
						is_schedule: false,
						status: "scheduled", // Required field in the database
					});
				});

				await Promise.all(promises);

				toast.success(
					`${selectedEmployees.length} ${
						selectedEmployees.length === 1 ? "shift" : "shifts"
					} created successfully`
				);
			}

			console.log("Shifts created successfully");
			if (onComplete) {
				console.log("Calling onComplete callback");
				// Wait a brief moment to ensure everything is updated
				setTimeout(() => {
					onComplete();
				}, 100);
			}
		} catch (error) {
			console.error("Error creating shift:", error);
			setError("Failed to create shift. Please try again.");
			toast.error("Failed to create shift");
		} finally {
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

	// Function to handle step navigation via progress bar
	const handleStepClick = (targetStep: WizardStep) => {
		// Only allow navigation to steps that make sense based on current data
		if (targetStep === "select-location") {
			resetLocation();
		} else if (targetStep === "shift-details" && locationData) {
			setStep(targetStep);
		} else if (targetStep === "assign-employee" && locationData && shiftData) {
			setStep(targetStep);
		}
	};

	// Update selected employees
	const handleSelectedEmployeesChange = (employees: SelectedEmployee[]) => {
		setSelectedEmployees(employees);
	};

	return (
		<div className={cn("h-full flex flex-col", className)}>
			{/* Progress bar at the top of the wizard */}
			<WizardProgressBar
				currentStep={step}
				hasLocationData={!!locationData}
				hasShiftData={!!shiftData}
				onStepClick={handleStepClick}
			/>

			{error && (
				<Alert
					variant="destructive"
					className="mx-6 mb-4">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<ScrollArea className="flex-1">
				<div className="flex-1 flex flex-col">
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
								className="hidden"
								onClick={resetLocation}>
								Back to Location Selection
							</Button>
						</>
					)}

					{/* Step 3: Assign Employee */}
					{step === "assign-employee" && locationData && shiftData && (
						<>
							<EmployeeAssignmentStep
								employeeForm={employeeForm}
								locationData={locationData}
								shiftData={shiftData}
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
								searchFilter={searchFilter}
								setSearchFilter={setSearchFilter}
								filteredEmployees={filteredEmployees}
								loadingEmployees={loadingEmployees}
								getLocationName={getLocationName}
								handleEmployeeAssignSubmit={(data) => {
									console.log("Received form submission with data:", data);
									handleEmployeeAssignSubmit(data, selectedEmployees);
								}}
								onBack={() => setStep("shift-details")}
								onResetLocation={resetLocation}
								loading={loading}
								selectedEmployees={selectedEmployees}
								onSelectedEmployeesChange={handleSelectedEmployeesChange}
								allEmployees={employees}
							/>
							<Button
								id="employee-assign-back-button"
								className="hidden"
								onClick={() => setStep("shift-details")}>
								Back to Shift Details
							</Button>
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
