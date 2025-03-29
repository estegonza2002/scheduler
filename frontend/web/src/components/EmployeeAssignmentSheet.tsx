import { useState, useEffect } from "react";
import { Employee, EmployeesAPI, EmployeeLocationsAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Loader2, CheckCircle, Users } from "lucide-react";
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
	const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [assignedCount, setAssignedCount] = useState(0);
	const [allEmployees, setAllEmployees] = useState<Employee[]>(
		propAllEmployees || []
	);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>(
		propAssignedEmployees || []
	);
	const [isLoading, setIsLoading] = useState(false);

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
	}, [isOpen]);

	// Load employees from the API
	const fetchEmployees = async () => {
		setIsLoading(true);
		try {
			// Fetch all employees for the organization
			const organizationId = "org-1"; // Default organization ID
			const employees = await EmployeesAPI.getAll(organizationId);
			setAllEmployees(employees);
			console.log("Fetched employees:", employees);

			// Get employees assigned to this location
			if (locationId) {
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);
				const assignedList = employees.filter((emp) =>
					assignedEmployeeIds.includes(emp.id)
				);
				setAssignedEmployees(assignedList);
				console.log("Assigned employees:", assignedList);
			}
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast.error("Failed to load employees");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter the employees for assignment
	const getFilteredEmployeesForAssignment = () => {
		// If still loading, return empty array
		if (isLoading) return [];

		// Log available data for debugging
		console.log("DEBUG - All employees:", allEmployees);
		console.log("DEBUG - Assigned employees:", assignedEmployees);

		// Show all employees instead of just unassigned ones
		let employeesToShow = allEmployees;

		// If there's a search term, filter by name
		if (searchTerm) {
			employeesToShow = allEmployees.filter((emp) =>
				emp.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		console.log("DEBUG - Employees to show:", employeesToShow);
		return employeesToShow;
	};

	// Toggle employee selection
	const toggleEmployeeSelection = (employeeId: string) => {
		// Don't toggle if the employee is already assigned
		const isAlreadyAssigned = assignedEmployees.some(
			(assigned) => assigned.id === employeeId
		);

		if (isAlreadyAssigned) {
			return; // Don't allow toggling already assigned employees
		}

		setSelectedEmployees((prev) =>
			prev.includes(employeeId)
				? prev.filter((id) => id !== employeeId)
				: [...prev, employeeId]
		);
	};

	// Assign selected employees to the location
	const assignEmployeesToLocation = async () => {
		if (!locationId || selectedEmployees.length === 0) return;

		try {
			setIsSubmitting(true);

			console.log(
				`DEBUG: Assigning ${selectedEmployees.length} employees to location ${locationId}`
			);

			// Create an array to track successfully assigned employees
			const newlyAssignedEmployees: Employee[] = [];

			for (const employeeId of selectedEmployees) {
				// Get the full employee object
				const employee = allEmployees.find((emp) => emp.id === employeeId);
				if (employee) {
					// Use EmployeeLocationsAPI to assign the location to this employee
					// Get current location assignments for this employee
					const currentLocations = await EmployeeLocationsAPI.getByEmployeeId(
						employeeId
					);

					// Add this location if not already assigned
					if (!currentLocations.includes(locationId)) {
						const updatedLocations = [...currentLocations, locationId];

						// Update the employee's location assignments
						const success = await EmployeeLocationsAPI.assignLocations(
							employeeId,
							updatedLocations
						);

						if (success) {
							newlyAssignedEmployees.push(employee);
							console.log(
								`DEBUG: Successfully assigned employee ${employeeId} to location ${locationId}`
							);
						} else {
							console.error(
								`DEBUG: Failed to assign employee ${employeeId} to location ${locationId}`
							);
						}
					} else {
						console.log(
							`DEBUG: Employee ${employeeId} already assigned to location ${locationId}`
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
		if (isSubmitting) return; // Prevent closing during submission

		if (!newOpenState) {
			// Reset state when sheet closes
			setTimeout(() => {
				setIsAssigned(false);
				setSelectedEmployees([]);
				setSearchTerm("");
			}, 300); // Wait for sheet close animation
		}

		if (isControlled && setControlledOpen) {
			setControlledOpen(newOpenState);
		} else {
			setOpen(newOpenState);
		}
	};

	// Render loading state
	const renderLoading = () => (
		<div className="flex flex-col items-center justify-center py-12">
			<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
			<p className="text-muted-foreground">Loading employees...</p>
		</div>
	);

	// Render success state
	const renderSuccessState = () => (
		<div className="flex flex-col items-center py-8 text-center">
			<div className="rounded-full bg-primary/10 p-3 mb-4">
				<CheckCircle className="h-8 w-8 text-primary" />
			</div>
			<h3 className="text-xl font-semibold mb-2">
				{assignedCount} Employee{assignedCount !== 1 ? "s" : ""} Assigned
			</h3>
			<p className="text-muted-foreground mb-6">
				Employees successfully assigned to {locationName}.
			</p>
		</div>
	);

	// Render selection state
	const renderSelectionState = () => (
		<div className="space-y-4">
			{/* Search input */}
			<div className="relative">
				<Input
					placeholder="Search employees..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9"
				/>
				<Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
			</div>

			{/* Selection explanation */}
			<p className="text-sm text-muted-foreground">
				Select employees to assign to {locationName}.
				{assignedEmployees.length > 0 &&
					` Currently assigned employees are marked and cannot be unselected.`}
			</p>

			{/* Employees list */}
			<div className="border rounded-md divide-y">
				{isLoading ? (
					renderLoading()
				) : getFilteredEmployeesForAssignment().length > 0 ? (
					getFilteredEmployeesForAssignment().map((employee) => {
						const isSelected = selectedEmployees.includes(employee.id);
						const isAlreadyAssigned = assignedEmployees.some(
							(assigned) => assigned.id === employee.id
						);

						return (
							<div
								key={employee.id}
								className={cn(
									"flex items-center p-3 hover:bg-accent",
									isSelected && "bg-primary/10 hover:bg-primary/15",
									isAlreadyAssigned
										? "opacity-70 cursor-default"
										: "cursor-pointer"
								)}
								onClick={() =>
									!isAlreadyAssigned && toggleEmployeeSelection(employee.id)
								}>
								<Checkbox
									checked={isSelected || isAlreadyAssigned}
									className={cn(
										"mr-3",
										isAlreadyAssigned && "opacity-50 cursor-not-allowed"
									)}
									disabled={isAlreadyAssigned}
									onCheckedChange={() =>
										!isAlreadyAssigned && toggleEmployeeSelection(employee.id)
									}
								/>
								<div className="flex items-center flex-1 min-w-0 gap-3">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={employee.avatar}
											alt={employee.name}
										/>
										<AvatarFallback>
											{employee.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium truncate">{employee.name}</div>
										<div className="text-xs text-muted-foreground truncate">
											{employee.email}
										</div>
									</div>
								</div>
								{isAlreadyAssigned && (
									<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
										Current
									</span>
								)}
							</div>
						);
					})
				) : (
					<div className="p-4 text-center text-muted-foreground">
						{searchTerm
							? "No employees found matching your search"
							: "No employees available"}
					</div>
				)}
			</div>
		</div>
	);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger || (
					<Button>
						<UserPlus className="h-4 w-4 mr-2" />
						Assign Employees
					</Button>
				)}
			</SheetTrigger>

			<SheetContent
				className={cn("sm:max-w-md p-0 flex flex-col h-full", className)}>
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<UserPlus className="h-5 w-5 text-primary" />
							<SheetTitle>Assign Employees</SheetTitle>
						</div>
						<SheetDescription>
							Assign employees to {locationName}
						</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 px-6 my-4 overflow-auto">
					{isAssigned ? renderSuccessState() : renderSelectionState()}
				</div>

				{!isAssigned && !isLoading && (
					<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
						<Button
							onClick={assignEmployeesToLocation}
							disabled={isSubmitting || selectedEmployees.length === 0}
							className="w-full">
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Assigning...
								</>
							) : (
								<>
									Assign {selectedEmployees.length} Employee
									{selectedEmployees.length !== 1 ? "s" : ""}
								</>
							)}
						</Button>
					</SheetFooter>
				)}

				{isAssigned && (
					<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
						<Button
							variant="outline"
							onClick={() => setIsAssigned(false)}
							className="mr-auto">
							Assign More
						</Button>
						<Button onClick={() => handleOpenChange(false)}>Close</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
