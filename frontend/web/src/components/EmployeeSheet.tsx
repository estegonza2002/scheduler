import { useState, useRef, useEffect } from "react";
import {
	Employee,
	EmployeesAPI,
	LocationsAPI,
	EmployeeLocationsAPI,
	Location,
} from "@/api";
import { Button } from "@/components/ui/button";
import {
	Plus,
	User,
	Pencil,
	CheckCircle,
	Trash,
	Loader2,
	MapPin,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
	SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Define the wizard steps
type WizardStep = "employee-details" | "location-assignment" | "complete";

/**
 * Props for the EmployeeSheet component
 */
interface EmployeeSheetProps {
	/**
	 * The ID of the organization to add an employee to
	 */
	organizationId: string;
	/**
	 * The employee data to be edited (if editing)
	 */
	employee?: Employee;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional callback fired when an employee is added or updated
	 */
	onEmployeeUpdated?: (employee: Employee) => void;
	/**
	 * Optional additional className for the sheet content
	 */
	className?: string;
	/**
	 * Controls whether the sheet is open (controlled component)
	 */
	open?: boolean;
	/**
	 * Callback when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
}

/**
 * Sheet component for adding or editing an employee
 */
export function EmployeeSheet({
	organizationId,
	employee,
	trigger,
	onEmployeeUpdated,
	className,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: EmployeeSheetProps) {
	// Use a ref to track if the component is mounted to prevent state updates after unmount
	const isMounted = useRef(true);

	// Use a ref to store formState to avoid unnecessary re-renders
	const formStateRef = useRef<{
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	} | null>(null);

	// Support both controlled and uncontrolled modes
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = (value: boolean) => {
		if (!isControlled) {
			setInternalOpen(value);
		}
		controlledOnOpenChange?.(value);
	};

	const [isComplete, setIsComplete] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const navigate = useNavigate();

	// Wizard state
	const [step, setStep] = useState<WizardStep>("employee-details");
	const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);

	// Location assignment state
	const [locations, setLocations] = useState<Location[]>([]);
	const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoadingLocations, setIsLoadingLocations] = useState(false);
	const [isAssigningLocations, setIsAssigningLocations] = useState(false);

	const isEditing = !!employee;

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Effect to fetch locations when needed
	useEffect(() => {
		if (!isMounted.current) return;

		console.log("Step change detected, current step:", step);
		console.log("Locations length:", locations.length);
		console.log("Created employee:", createdEmployee);

		// If the step is location-assignment and we don't have locations yet, fetch them
		if (
			step === "location-assignment" &&
			locations.length === 0 &&
			createdEmployee
		) {
			console.log("Fetching locations for assignment...");
			fetchLocations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [step, locations.length, createdEmployee]);

	// Add a debug log for open state changes
	useEffect(() => {
		console.log("Sheet open state changed to:", open);
	}, [open]);

	// Fetch available locations
	const fetchLocations = async () => {
		try {
			setIsLoadingLocations(true);
			const locationsData = await LocationsAPI.getAll(organizationId);
			setLocations(locationsData);
		} catch (error) {
			console.error("Error fetching locations:", error);
			toast.error("Failed to load locations");
		} finally {
			setIsLoadingLocations(false);
		}
	};

	// Filter locations based on search term
	const getFilteredLocations = () => {
		if (!searchTerm.trim()) return locations;

		return locations.filter(
			(location) =>
				location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(location.address &&
					location.address.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	};

	// Toggle location selection
	const toggleLocationSelection = (locationId: string) => {
		setSelectedLocationIds((current) => {
			if (current.includes(locationId)) {
				return current.filter((id) => id !== locationId);
			} else {
				return [...current, locationId];
			}
		});
	};

	const handleEmployeeAction = (updatedEmployee: Employee) => {
		if (!isMounted.current) return;

		console.log("handleEmployeeAction called with:", updatedEmployee);
		console.log("Current step:", step);
		console.log("Is editing:", isEditing);

		// If editing, complete the flow
		if (isEditing) {
			setIsComplete(true);

			if (onEmployeeUpdated) {
				onEmployeeUpdated(updatedEmployee);
			}

			// Dispatch an employee-updated event for existing employees
			window.dispatchEvent(
				new CustomEvent("employee-updated", { detail: updatedEmployee })
			);
		} else {
			// If creating a new employee, proceed to the location assignment step
			console.log(
				"Setting createdEmployee and moving to location-assignment step"
			);

			// Dispatch a custom event immediately to notify the system about the new employee
			// This ensures the employee appears in the table right away
			window.dispatchEvent(
				new CustomEvent("employee-added", { detail: updatedEmployee })
			);

			// If the parent provided a callback, call it
			if (onEmployeeUpdated) {
				onEmployeeUpdated(updatedEmployee);
			}

			// Make sure to set the created employee
			setCreatedEmployee(updatedEmployee);

			// First set the step
			setStep("location-assignment");

			// Then ensure the sheet stays open
			setOpen(true);

			console.log("After state updates - step:", step, "open:", open);
		}
	};

	const handleLocationAssignment = async () => {
		if (!createdEmployee) return;

		try {
			setIsAssigningLocations(true);

			if (selectedLocationIds.length > 0) {
				const success = await EmployeeLocationsAPI.assignLocations(
					createdEmployee.id,
					selectedLocationIds
				);

				if (success) {
					toast.success(
						`${selectedLocationIds.length} locations assigned to ${createdEmployee.name}`
					);
				} else {
					toast.error("Failed to assign locations");
				}
			}

			setStep("complete");
			setIsComplete(true);

			// Note: We already dispatched the employee-added event in handleEmployeeAction
			// So we don't need to dispatch it again here
		} catch (error) {
			console.error("Error assigning locations:", error);
			toast.error("Failed to assign locations");
		} finally {
			setIsAssigningLocations(false);
		}
	};

	const skipLocationAssignment = () => {
		if (!createdEmployee) return;

		setStep("complete");
		setIsComplete(true);

		// Note: We already dispatched the employee-added event in handleEmployeeAction
		// So we don't need to dispatch it again here
	};

	const handleOpenChange = (newOpenState: boolean) => {
		if (!isMounted.current) return;

		console.log("handleOpenChange called with:", newOpenState);

		if (newOpenState) {
			// If opening the sheet, set the open state
			setOpen(true);
		} else {
			// If closing the sheet, we need to reset all state
			// Reset state when sheet closes
			if (step !== "employee-details" && !isComplete) {
				// If we're in the middle of a flow and not complete, confirm with the user
				if (confirm("Are you sure you want to cancel?")) {
					setOpen(false);
					setTimeout(() => {
						if (isMounted.current) {
							setIsComplete(false);
							setShowDeleteDialog(false);
							formStateRef.current = null;
							setStep("employee-details");
							setCreatedEmployee(null);
							setSelectedLocationIds([]);
							setSearchTerm("");
						}
					}, 300); // Wait for sheet close animation
				} else {
					// User cancelled closing, keep sheet open
					console.log("User cancelled closing, keeping sheet open");
					return;
				}
			} else {
				// Just close normally and reset
				setOpen(false);
				setTimeout(() => {
					if (isMounted.current) {
						setIsComplete(false);
						setShowDeleteDialog(false);
						formStateRef.current = null;
						setStep("employee-details");
						setCreatedEmployee(null);
						setSelectedLocationIds([]);
						setSearchTerm("");
					}
				}, 300); // Wait for sheet close animation
			}
		}
	};

	const handleFormReady = (state: {
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	}) => {
		if (!isMounted.current) return;

		// Log the form state for debugging
		console.log("EmployeeSheet form state:", state);

		// Update the ref instead of the state to avoid re-renders
		formStateRef.current = state;
	};

	const handleDeleteEmployee = async () => {
		if (!employee) return;

		try {
			await EmployeesAPI.delete(employee.id);
			toast.success(`${employee.name} has been deleted`);
			handleOpenChange(false);
			// Navigate back to employees list if on detail page
			if (window.location.pathname.includes(`/employees/${employee.id}`)) {
				navigate("/employees");
			}
			// Dispatch a custom event to notify the system about the deletion
			window.dispatchEvent(
				new CustomEvent("employee-deleted", { detail: employee.id })
			);
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		}
	};

	// Function to safely access form state
	const getFormState = () => formStateRef.current;

	// Get step progress percentage
	const getStepProgress = () => {
		switch (step) {
			case "employee-details":
				return 33;
			case "location-assignment":
				return 66;
			case "complete":
				return 100;
			default:
				return 0;
		}
	};

	// Render location selection interface
	const renderLocationSelection = () => {
		const filteredLocations = getFilteredLocations();

		return (
			<div className="space-y-4">
				<div className="mb-4 space-y-1">
					<div className="font-medium mb-1">Assign to Locations</div>
					<p className="text-sm text-muted-foreground">
						Assign {createdEmployee?.name} to one or more locations
					</p>
				</div>

				{/* Search input */}
				<div className="relative">
					<Input
						placeholder="Search locations..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full"
					/>
					{searchTerm && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute right-0 top-0 h-full"
							onClick={() => setSearchTerm("")}>
							Clear
						</Button>
					)}
				</div>

				{isLoadingLocations ? (
					<div className="py-8 flex justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : (
					<ScrollArea className="h-[320px] rounded-md border p-2">
						{filteredLocations.length > 0 ? (
							<div className="space-y-1">
								{filteredLocations.map((location) => (
									<div
										key={location.id}
										className={cn(
											"flex items-center space-x-2 rounded-md p-2.5 hover:bg-accent transition-colors",
											selectedLocationIds.includes(location.id) &&
												"bg-primary/10 hover:bg-primary/15"
										)}
										onClick={() => toggleLocationSelection(location.id)}>
										<Checkbox
											checked={selectedLocationIds.includes(location.id)}
											onCheckedChange={() =>
												toggleLocationSelection(location.id)
											}
											className="data-[state=checked]:bg-primary"
										/>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-sm">{location.name}</div>
											{location.address && (
												<div className="text-xs text-muted-foreground truncate">
													{location.address}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center text-muted-foreground">
								{searchTerm
									? "No locations found matching your search"
									: "No locations available"}
							</div>
						)}
					</ScrollArea>
				)}
			</div>
		);
	};

	// Render success state
	const renderSuccessState = () => (
		<div className="flex flex-col items-center py-8 text-center">
			<div className="rounded-full bg-primary/10 p-3 mb-4">
				<CheckCircle className="h-8 w-8 text-primary" />
			</div>
			<h3 className="text-xl font-semibold mb-2">
				Employee {isEditing ? "Updated" : "Created"} Successfully
			</h3>
			{!isEditing && createdEmployee && selectedLocationIds.length > 0 && (
				<p className="text-muted-foreground">
					Assigned to {selectedLocationIds.length} location
					{selectedLocationIds.length !== 1 ? "s" : ""}
				</p>
			)}
		</div>
	);

	return (
		<Sheet
			open={open}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger || (
					<Button>
						{isEditing ? (
							<>
								<Pencil className="h-4 w-4 mr-2" />
								Edit Employee
							</>
						) : (
							<>
								<Plus className="h-4 w-4 mr-2" />
								Add Employee
							</>
						)}
					</Button>
				)}
			</SheetTrigger>

			<SheetContent
				className={cn("sm:max-w-md p-0 flex flex-col h-full", className)}>
				{/* Header content */}
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							{step === "employee-details" && (
								<User className="h-5 w-5 text-primary" />
							)}
							{step === "location-assignment" && (
								<MapPin className="h-5 w-5 text-primary" />
							)}
							{step === "complete" && (
								<CheckCircle className="h-5 w-5 text-primary" />
							)}
							<SheetTitle>
								{isEditing
									? "Edit Employee"
									: step === "employee-details"
									? "Add New Employee"
									: step === "location-assignment"
									? "Assign Locations"
									: "Employee Created"}
							</SheetTitle>
						</div>
						<SheetDescription>
							{isEditing
								? `Update information for ${employee.name}`
								: step === "employee-details"
								? "Enter employee details to add them to your organization"
								: step === "location-assignment"
								? `Assign ${createdEmployee?.name} to locations (optional)`
								: `${createdEmployee?.name} has been added to your organization`}
						</SheetDescription>
					</SheetHeader>

					{/* Progress bar for multi-step form (only show when adding new employee) */}
					{!isEditing && (
						<div className="mt-4">
							<Progress
								value={getStepProgress()}
								className="h-2"
							/>
						</div>
					)}
				</div>

				{/* Main content area */}
				<div className="flex-1 px-6 my-4 overflow-auto">
					{step === "employee-details" && (
						<>
							<EmployeeForm
								organizationId={organizationId}
								initialData={employee}
								onSuccess={handleEmployeeAction}
								onFormReady={handleFormReady}
							/>

							{/* Add delete option below form when editing */}
							{isEditing && !isComplete && (
								<div className="mt-8 pt-6 border-t">
									<AlertDialog
										open={showDeleteDialog}
										onOpenChange={setShowDeleteDialog}>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60">
												<Trash className="h-4 w-4 mr-2" />
												Delete Employee
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>
													This will permanently delete {employee?.name} and all
													related data. This action cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDeleteEmployee}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							)}
						</>
					)}

					{step === "location-assignment" && renderLocationSelection()}

					{step === "complete" && renderSuccessState()}
				</div>

				{/* Footer actions */}
				<SheetFooter className="px-6 py-4 border-t">
					{/* Controls for employee details step */}
					{step === "employee-details" && !isComplete && (
						<div className="flex justify-end gap-2 w-full">
							<Button
								variant="outline"
								disabled={getFormState()?.isSubmitting}
								onClick={() => handleOpenChange(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									const formState = getFormState();
									if (formState?.submit) {
										formState.submit();
									}
								}}
								/*disabled={
									!getFormState()?.isDirty ||
									!getFormState()?.isValid ||
									getFormState()?.isSubmitting
								}*/
							>
								{getFormState()?.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isEditing ? "Updating..." : "Creating..."}
									</>
								) : (
									<>
										{isEditing ? (
											<>
												<Pencil className="mr-2 h-4 w-4" />
												Update Employee
											</>
										) : (
											<>
												<Plus className="mr-2 h-4 w-4" />
												Create Employee
											</>
										)}
									</>
								)}
							</Button>
						</div>
					)}

					{/* Controls for location assignment step */}
					{step === "location-assignment" && (
						<div className="flex justify-between w-full">
							<Button
								variant="outline"
								onClick={skipLocationAssignment}>
								Skip
							</Button>
							<Button
								onClick={handleLocationAssignment}
								disabled={isAssigningLocations}>
								{isAssigningLocations ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Assigning...
									</>
								) : (
									<>
										<MapPin className="mr-2 h-4 w-4" />
										Assign {selectedLocationIds.length} Location
										{selectedLocationIds.length !== 1 ? "s" : ""}
									</>
								)}
							</Button>
						</div>
					)}

					{/* Controls for complete step */}
					{step === "complete" && (
						<Button
							onClick={() => handleOpenChange(false)}
							className="w-full">
							Close
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
