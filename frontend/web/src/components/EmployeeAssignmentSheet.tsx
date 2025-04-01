import { useState, useEffect } from "react";
import {
	Employee,
	EmployeesAPI,
	EmployeeLocationsAPI,
	ShiftAssignmentsAPI,
	OrganizationsAPI,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	UserPlus,
	Loader2,
	CheckCircle,
	Users,
	CheckSquare,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	EmployeeSelectionComponent,
	SelectedEmployee,
} from "@/components/employee/EmployeeSelectionComponent";

/**
 * Props for the EmployeeAssignmentSheet component
 */
interface EmployeeAssignmentSheetProps {
	/**
	 * Location ID to assign employees to
	 */
	locationId: string;
	/**
	 * Location name for display purposes
	 */
	locationName: string;
	/**
	 * List of all employees that could be assigned
	 */
	allEmployees: Employee[];
	/**
	 * List of employees already assigned to the location
	 */
	assignedEmployees: Employee[];
	/**
	 * Callback fired when employees are assigned
	 */
	onEmployeesAssigned: (employees: Employee[]) => void;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Controls whether the sheet is open
	 */
	open?: boolean;
	/**
	 * Callback fired when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Optional additional className for the sheet content
	 */
	className?: string;
}

/**
 * Sheet component for assigning employees to a location
 */
export function EmployeeAssignmentSheet({
	locationId,
	locationName,
	allEmployees: propAllEmployees,
	assignedEmployees: propAssignedEmployees,
	onEmployeesAssigned,
	trigger,
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	className,
}: EmployeeAssignmentSheetProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAssigned, setIsAssigned] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [assignedCount, setAssignedCount] = useState(0);
	const [allEmployees, setAllEmployees] = useState<Employee[]>(
		propAllEmployees || []
	);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>(
		propAssignedEmployees || []
	);
	const [isLoading, setIsLoading] = useState(false);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [organizationId, setOrganizationId] = useState<string>("");

	// State for unified component
	const [selectedEmployeeObjects, setSelectedEmployeeObjects] = useState<
		SelectedEmployee[]
	>([]);

	// Determine if we're using controlled or uncontrolled open state
	const isControlled =
		controlledOpen !== undefined && setControlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : open;

	// Fetch employees when the sheet is opened
	useEffect(() => {
		if (
			isOpen &&
			(allEmployees.length === 0 || assignedEmployees.length === 0)
		) {
			fetchEmployees();
		}

		// Reset states when opening the sheet
		if (isOpen) {
			setIsAssigned(false);
			setSelectedEmployeeObjects([]);
		}
	}, [isOpen]);

	// Fetch employees data when the component mounts
	useEffect(() => {
		if (!organizationId) {
			fetchOrganization();
		} else {
			fetchEmployees();
		}
	}, [organizationId]);

	// Fetch organization data
	const fetchOrganization = async () => {
		try {
			setLoading(true);

			// Try to get organization ID from organizations API
			const organizations = await OrganizationsAPI.getAll();
			if (organizations && organizations.length > 0) {
				const orgId = organizations[0].id;
				setOrganizationId(orgId);
				console.log("Using organization ID:", orgId);
			} else {
				console.error("No organization found");
				setError("Could not find any organizations.");
				setLoading(false);
			}
		} catch (err) {
			console.error("Error fetching organizations:", err);
			setError("Failed to load organizations. Please try again.");
			setLoading(false);
		}
	};

	// Load employees from the API
	const fetchEmployees = async () => {
		if (!organizationId) {
			console.error("Cannot fetch employees without organization ID");
			return;
		}

		setIsLoading(true);
		try {
			console.log(`Fetching employees for organization: ${organizationId}`);
			// Fetch all employees for the organization
			const employees = await EmployeesAPI.getAll(organizationId);
			setAllEmployees(employees);
			console.log(
				`Fetched ${employees.length} employees from organization ${organizationId}`
			);

			// Get employees assigned to this location
			if (locationId) {
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);
				const assignedList = employees.filter((emp) =>
					assignedEmployeeIds.includes(emp.id)
				);
				setAssignedEmployees(assignedList);
				console.log(
					`Found ${assignedList.length} employees assigned to location ${locationId}`
				);
			}
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast.error("Failed to load employees");
		} finally {
			setIsLoading(false);
		}
	};

	// Get a mapping of already assigned employee IDs for the location
	const getAlreadyAssignedIds = () => {
		return new Set(assignedEmployees.map((emp) => emp.id));
	};

	// Filter employees to exclude those already assigned to this location
	const getFilteredEmployeesForAssignment = () => {
		// If still loading, return empty array
		if (isLoading) return [];

		const alreadyAssignedIds = getAlreadyAssignedIds();

		// Get unassigned employees
		const unassignedEmployees = allEmployees.filter(
			(emp) => !alreadyAssignedIds.has(emp.id)
		);

		// Filter by search term if provided
		if (searchTerm) {
			return unassignedEmployees.filter((emp) =>
				emp.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return unassignedEmployees;
	};

	// Handle assignment of employees to locations
	const handleAssignEmployees = async () => {
		if (!locationId || selectedEmployeeObjects.length === 0) return;

		try {
			setIsSubmitting(true);

			console.log(
				`DEBUG: Assigning ${selectedEmployeeObjects.length} employees to location ${locationId}`
			);

			// Create an array to track successfully assigned employees
			const newlyAssignedEmployees: Employee[] = [];

			for (const selectedEmp of selectedEmployeeObjects) {
				// Get the full employee object
				const employee = allEmployees.find((emp) => emp.id === selectedEmp.id);
				if (employee) {
					// Use EmployeeLocationsAPI to assign the location to this employee
					// Get current location assignments for this employee
					const currentLocations = await EmployeeLocationsAPI.getByEmployeeId(
						selectedEmp.id
					);

					// Add this location if not already assigned
					if (!currentLocations.includes(locationId)) {
						const updatedLocations = [...currentLocations, locationId];

						// Update the employee's location assignments
						const success = await EmployeeLocationsAPI.assignLocations(
							selectedEmp.id,
							updatedLocations
						);

						if (success) {
							newlyAssignedEmployees.push(employee);
							console.log(
								`DEBUG: Successfully assigned employee ${selectedEmp.id} to location ${locationId}`
							);
						} else {
							console.error(
								`DEBUG: Failed to assign employee ${selectedEmp.id} to location ${locationId}`
							);
						}
					} else {
						console.log(
							`DEBUG: Employee ${selectedEmp.id} already assigned to location ${locationId}`
						);
						newlyAssignedEmployees.push(employee);
					}
				}
			}

			setAssignedCount(newlyAssignedEmployees.length);
			onEmployeesAssigned(newlyAssignedEmployees);
			setIsAssigned(true);

			toast.success(
				`${newlyAssignedEmployees.length} employee(s) assigned to this location`
			);
		} catch (error) {
			console.error("Error assigning employees:", error);
			toast.error("Failed to assign employees");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle sheet open/close
	const handleOpenChange = (newOpenState: boolean) => {
		// If controlled mode, use the provided setter
		if (isControlled && setControlledOpen) {
			setControlledOpen(newOpenState);
		} else {
			// Otherwise update internal state
			setOpen(newOpenState);
		}

		// If closing, reset state
		if (!newOpenState) {
			setTimeout(() => {
				setIsAssigned(false);
				setSelectedEmployeeObjects([]);
				setSearchTerm("");
			}, 300); // Wait for sheet close animation
		}
	};

	// Render the success state
	const renderSuccessState = () => (
		<div className="flex flex-col items-center justify-center h-[60vh] text-center">
			<div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
				<CheckCircle className="w-8 h-8 text-green-500" />
			</div>
			<h3 className="text-lg font-semibold mb-2">
				{assignedCount} Employees Assigned
			</h3>
			<p className="text-muted-foreground mb-6">
				Successfully assigned employees to {locationName}
			</p>
			<Button onClick={() => handleOpenChange(false)}>Close</Button>
		</div>
	);

	// Render loading state
	const renderLoading = () => (
		<div className="flex flex-col items-center justify-center py-8">
			<Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
			<p className="text-muted-foreground">Loading employees...</p>
		</div>
	);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger ? (
					trigger
				) : (
					<Button>
						<UserPlus className="mr-2 h-4 w-4" /> Assign Employee
					</Button>
				)}
			</SheetTrigger>

			<SheetContent
				side="right"
				className={className}>
				{isLoading ? (
					renderLoading()
				) : isAssigned ? (
					renderSuccessState()
				) : (
					<>
						<SheetHeader>
							<SheetTitle>Assign Employees to Location</SheetTitle>
							<SheetDescription>
								Select employees to assign to {locationName}
							</SheetDescription>
						</SheetHeader>

						<EmployeeSelectionComponent
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							filteredEmployees={getFilteredEmployeesForAssignment()}
							allEmployees={allEmployees}
							loadingEmployees={isLoading}
							selectedEmployees={selectedEmployeeObjects}
							onSelectedEmployeesChange={setSelectedEmployeeObjects}
							title="Select Employees"
							subtitle={`Choose employees to assign to ${locationName}`}
							showLocationInfo={true}
							locationData={{ locationId }}
							getLocationName={() => locationName}
							showSelectedEmployees={true}
							submitButtonText="Assign to Location"
							onFormSubmit={handleAssignEmployees}
							loading={isSubmitting}
							filterByLocation={false}
							onBack={() => handleOpenChange(false)}
						/>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
