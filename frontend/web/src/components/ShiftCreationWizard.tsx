import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	ShiftsAPI,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "../api";
import { format } from "date-fns";
import {
	LocationSelectionStep,
	ShiftDetailsStep,
	EmployeeAssignmentStep,
	WizardProgressBar,
	WizardStep,
} from "./shift-wizard";

interface ShiftCreationWizardProps {
	scheduleId: string;
	organizationId: string;
	initialDate?: Date;
	onComplete?: () => void;
	onCancel?: () => void;
}

type LocationData = {
	locationId: string;
};

type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

type EmployeeData = {
	employeeId: string;
};

// New type to handle multiple employee selection
type SelectedEmployee = {
	id: string;
	name: string;
	role?: string;
};

export function ShiftCreationWizard({
	scheduleId,
	organizationId,
	initialDate,
	onComplete,
	onCancel,
}: ShiftCreationWizardProps) {
	// Current step in the wizard
	const [step, setStep] = useState<WizardStep>("select-location");

	// Store data from each step
	const [locationData, setLocationData] = useState<LocationData | null>(null);
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

	// Search functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [locationSearchTerm, setLocationSearchTerm] = useState("");
	const [searchFilter, setSearchFilter] = useState<string>("all");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Forms for each step
	const locationForm = useForm<LocationData>({
		defaultValues: {
			locationId: "",
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
				setLoadingLocations(true);
				const locationList = await LocationsAPI.getAll(organizationId);
				setLocations(locationList);
				setFilteredLocations(locationList);
			} catch (error) {
				console.error("Error fetching locations:", error);
				toast.error("Failed to load locations");
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
				setLoadingEmployees(true);
				const employeeList = await EmployeesAPI.getAll(organizationId);
				setEmployees(employeeList);
				setFilteredEmployees(employeeList);
			} catch (error) {
				console.error("Error fetching employees:", error);
				toast.error("Failed to load employees");
			} finally {
				setLoadingEmployees(false);
			}
		}

		fetchEmployees();
	}, [organizationId]);

	// Filter employees based on search term
	useEffect(() => {
		// If no search term and no role filter (all), show all employees
		if (!searchTerm.trim() && searchFilter === "all") {
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

		setFilteredEmployees(filtered);
	}, [searchTerm, searchFilter, employees]);

	// Handle the location step submission
	const handleLocationSelect = (data: LocationData) => {
		setLocationData(data);
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
		if (!locationData || !shiftData) return;

		try {
			setLoading(true);

			// Combine date and time into ISO strings
			const startDateTime = `${shiftData.date}T${shiftData.startTime}:00`;
			const endDateTime = `${shiftData.date}T${shiftData.endTime}:00`;

			// If no employees selected, create shift without an employee
			if (selectedEmployees.length === 0) {
				await ShiftsAPI.create({
					scheduleId,
					locationId: locationData.locationId,
					employeeId: "", // Empty string for no employee
					startTime: startDateTime,
					endTime: endDateTime,
					role: "",
					notes: shiftData.notes,
				});

				toast.success("Shift created successfully");
			} else {
				// Create a shift for each selected employee
				for (const employee of selectedEmployees) {
					await ShiftsAPI.create({
						scheduleId,
						locationId: locationData.locationId,
						employeeId: employee.id,
						startTime: startDateTime,
						endTime: endDateTime,
						role: employee.role || "",
						notes: shiftData.notes,
					});
				}

				toast.success(
					`${selectedEmployees.length} ${
						selectedEmployees.length === 1 ? "shift" : "shifts"
					} created successfully`
				);
			}

			if (onComplete) {
				onComplete();
			}
		} catch (error) {
			console.error("Error creating shift:", error);
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
		handleLocationSelect({ locationId });
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
		<div className="h-full flex flex-col">
			{/* Progress bar at the top of the wizard */}
			<WizardProgressBar
				currentStep={step}
				hasLocationData={!!locationData}
				hasShiftData={!!shiftData}
				onStepClick={handleStepClick}
			/>

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
					/>
				)}

				{/* Step 2: Shift Details */}
				{step === "shift-details" && locationData && (
					<ShiftDetailsStep
						shiftForm={shiftForm}
						locationData={locationData}
						getLocationById={getLocationById}
						handleShiftDetailsSubmit={handleShiftDetailsSubmit}
						onBack={resetLocation}
					/>
				)}

				{/* Step 3: Assign Employee */}
				{step === "assign-employee" && locationData && shiftData && (
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
						handleEmployeeAssignSubmit={(data) =>
							handleEmployeeAssignSubmit(data, selectedEmployees)
						}
						onBack={() => setStep("shift-details")}
						onResetLocation={resetLocation}
						loading={loading}
						selectedEmployees={selectedEmployees}
						onSelectedEmployeesChange={handleSelectedEmployeesChange}
						allEmployees={employees}
					/>
				)}
			</div>
		</div>
	);
}
