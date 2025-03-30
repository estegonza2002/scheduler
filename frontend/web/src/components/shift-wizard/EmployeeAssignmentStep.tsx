import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Employee } from "../../api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import {
	ArrowLeft,
	Check,
	X,
	Search,
	MapPin,
	Calendar,
	Clock,
	UserCheck,
	Users,
	PlusCircle,
	UserX,
	AlertCircle,
	Loader2,
	UserRoundPlus,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState, useEffect, useMemo, useRef } from "react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Link } from "react-router-dom";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toast } from "sonner";
import { EmployeeLocationsAPI } from "../../api";
import { cn } from "../../lib/utils";
import { EmployeeCard } from "../EmployeeCard";

type EmployeeData = {
	employeeId: string;
};

// Type to handle multiple employee selection
export type SelectedEmployee = {
	id: string;
	name: string;
	role?: string;
};

type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

type LocationData = {
	locationId: string;
};

interface EmployeeAssignmentStepProps {
	employeeForm: UseFormReturn<EmployeeData>;
	locationData: LocationData;
	shiftData: ShiftData;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	filteredEmployees: Employee[];
	loadingEmployees: boolean;
	getLocationName: (locationId: string) => string;
	handleEmployeeAssignSubmit: (data: EmployeeData) => void;
	onBack: () => void;
	onResetLocation: () => void;
	loading: boolean;
	selectedEmployees: SelectedEmployee[];
	onSelectedEmployeesChange: (employees: SelectedEmployee[]) => void;
	allEmployees: Employee[];
	onFormSubmit: (data: any) => void;
}

interface EmployeeItemProps {
	employee: Employee;
	selected: boolean;
	onToggle: () => void;
	isFromSelectedLocation?: boolean;
}

export function EmployeeAssignmentStep({
	employeeForm,
	locationData,
	shiftData,
	searchTerm,
	setSearchTerm,
	filteredEmployees,
	loadingEmployees,
	getLocationName,
	handleEmployeeAssignSubmit,
	onBack,
	onResetLocation,
	loading,
	selectedEmployees,
	onSelectedEmployeesChange,
	allEmployees,
	onFormSubmit,
}: EmployeeAssignmentStepProps) {
	// State for tracking which employees are assigned to this location
	const [locationEmployeeIds, setLocationEmployeeIds] = useState<string[]>([]);
	const [loadingLocationEmployees, setLoadingLocationEmployees] =
		useState(false);

	// Fetch employees assigned to this location
	useEffect(() => {
		const fetchLocationEmployees = async () => {
			if (!locationData.locationId) return;

			try {
				setLoadingLocationEmployees(true);
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationData.locationId
				);
				setLocationEmployeeIds(assignedEmployeeIds);
			} catch (error) {
				console.error("Error fetching location employees:", error);
				// If there's an error, we'll just show all employees without distinction
				setLocationEmployeeIds([]);
			} finally {
				setLoadingLocationEmployees(false);
			}
		};

		fetchLocationEmployees();
	}, [locationData.locationId]);

	// Debug logs
	console.log("EmployeeAssignmentStep rendering", {
		filteredEmployees,
		loadingEmployees,
		searchTerm,
		allEmployees,
	});

	// State & derived values
	const locationName = getLocationName(locationData.locationId);
	const formattedDate = shiftData.date
		? format(new Date(shiftData.date), "EEE, MMM d")
		: "Unknown Date";
	const shiftTimeDisplay = `${format(
		new Date(`2000-01-01T${shiftData.startTime}`),
		"h:mm a"
	)} - ${format(new Date(`2000-01-01T${shiftData.endTime}`), "h:mm a")}`;

	// Ref for the form to submit programmatically
	const formRef = useRef<HTMLFormElement>(null);

	// Filter out the invited employees to show them separately
	const invitedEmployees = useMemo(() => {
		console.log("Computing invitedEmployees", {
			filteredEmployees,
			result: filteredEmployees.filter((emp) => emp.status === "invited"),
		});

		// Return empty array for now since we're not distinguishing invited employees
		return []; // This ensures we don't try to render a separate section for invited employees
	}, [filteredEmployees]);

	const eligibleEmployees = useMemo(() => {
		console.log("Computing eligibleEmployees", {
			filteredEmployees,
			hasStatusField:
				filteredEmployees.length > 0 ? "status" in filteredEmployees[0] : false,
			statuses: filteredEmployees.map((emp) => emp.status || "unknown"),
			result: filteredEmployees,
		});

		// Return all employees since the status field might not be reliable
		// This ensures employees are displayed regardless of their status
		return filteredEmployees;
	}, [filteredEmployees]);

	// Separate employees into those assigned to this location and others
	const groupedEmployees = useMemo(() => {
		// First filter by search term if applicable
		let filtered = eligibleEmployees;

		// Then split into location employees and others
		const locationEmployees = filtered.filter((emp) =>
			locationEmployeeIds.includes(emp.id)
		);

		const otherEmployees = filtered.filter(
			(emp) => !locationEmployeeIds.includes(emp.id)
		);

		return { locationEmployees, otherEmployees };
	}, [eligibleEmployees, locationEmployeeIds]);

	// Check if an employee is selected
	const isEmployeeSelected = (id: string) => {
		return selectedEmployees.some((employee) => employee.id === id);
	};

	// Extract unique roles from all employees, not just filtered ones
	const uniqueRoles = useMemo(() => {
		const roles = [
			...new Set(allEmployees.map((employee) => employee.role).filter(Boolean)),
		] as string[];
		return roles;
	}, [allEmployees]);

	// Create a reusable toggle function
	const toggleEmployee = (employee: Employee) => {
		const isSelected = isEmployeeSelected(employee.id);

		if (isSelected) {
			onSelectedEmployeesChange(
				selectedEmployees.filter((e) => e.id !== employee.id)
			);
		} else {
			onSelectedEmployeesChange([
				...selectedEmployees,
				{
					id: employee.id,
					name: employee.name,
					role: employee.role,
				},
			]);
		}
	};

	if (loadingEmployees || loadingLocationEmployees) {
		return (
			<div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin opacity-30 mb-4" />
				<p className="text-sm text-muted-foreground">Loading employees...</p>
			</div>
		);
	}

	if (filteredEmployees.length === 0 && !searchTerm) {
		return (
			<div className="p-6 flex flex-col">
				<div className="mb-6">
					<Badge
						variant="outline"
						className="mb-2">
						Shift
					</Badge>
					<h3 className="text-lg font-medium">
						{locationName} • {formattedDate}
					</h3>
					<p className="text-sm text-muted-foreground">{shiftTimeDisplay}</p>
				</div>

				<div className="flex flex-col items-center text-center py-6">
					<UserRoundPlus className="h-10 w-10 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium">No Employees Found</h3>
					<p className="text-sm text-muted-foreground max-w-md mb-6">
						There are no employees available for this shift. You need to add
						employees to your organization before you can assign them to shifts.
					</p>
					<Button
						variant="outline"
						onClick={onBack}>
						Back to Shift Details
					</Button>
				</div>
			</div>
		);
	}

	// Render the employee grid
	const renderEmployeeGrid = (
		employees: Employee[],
		fromSelectedLocation = false
	) => {
		// If there are no employees, return a placeholder
		if (employees.length === 0) {
			return (
				<div className="col-span-full text-center py-6">
					<p className="text-muted-foreground">No employees found</p>
				</div>
			);
		}

		return employees.map((employee) => {
			const isSelected = selectedEmployees.some(
				(selectedEmp) => selectedEmp.id === employee.id
			);

			return (
				<div
					key={employee.id}
					className="w-full max-w-[200px]">
					<EmployeeCard
						employee={employee}
						selected={isSelected}
						onSelect={() => toggleEmployee(employee)}
						selectable={true}
						selectionMode="checkbox"
						variant="compact"
						size="sm"
						topLeftLabel={fromSelectedLocation ? "Location" : undefined}
						showActions={false}
						className={
							isSelected
								? "border-primary bg-primary/5"
								: "hover:border-primary/50"
						}
						hideStatus={true}
						checkboxPosition="left"
					/>
				</div>
			);
		});
	};

	return (
		<div className="p-6 flex flex-col gap-4">
			<div className="mb-2">
				<Badge
					variant="outline"
					className="mb-2">
					Shift
				</Badge>
				<h3 className="text-lg font-medium">
					{locationName} • {formattedDate}
				</h3>
				<p className="text-sm text-muted-foreground">{shiftTimeDisplay}</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}}
				className="flex flex-col gap-4 h-full">
				<div className="space-y-4">
					{/* Search without filter controls */}
					<div className="relative w-full">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search employees..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Employee list */}
					<div className="border rounded-md bg-background/50">
						<div className="max-h-[320px] overflow-auto">
							<div className="p-4">
								{filteredEmployees.length === 0 ? (
									<div className="p-6 text-center text-muted-foreground">
										{searchTerm ? (
											<div>No employees found matching "{searchTerm}"</div>
										) : (
											<div>No employees available</div>
										)}
									</div>
								) : (
									<div className="space-y-5">
										{/* Employees assigned to this location - always show this section */}
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h3 className="text-sm font-medium flex items-center">
													<MapPin className="h-3.5 w-3.5 mr-1.5" />
													Employees at {locationName}
													<Badge
														variant="outline"
														className="ml-2">
														{groupedEmployees.locationEmployees.length}
													</Badge>
												</h3>

												{groupedEmployees.locationEmployees.length > 0 && (
													<div className="flex items-center space-x-2">
														<Checkbox
															id="select-all-location"
															checked={groupedEmployees.locationEmployees.every(
																(emp) => isEmployeeSelected(emp.id)
															)}
															onCheckedChange={(checked) => {
																if (checked) {
																	// Select all employees from this location that aren't already selected
																	const newEmployeesToAdd =
																		groupedEmployees.locationEmployees
																			.filter(
																				(emp) => !isEmployeeSelected(emp.id)
																			)
																			.map((emp) => ({
																				id: emp.id,
																				name: emp.name,
																				role: emp.role,
																			}));

																	onSelectedEmployeesChange([
																		...selectedEmployees,
																		...newEmployeesToAdd,
																	]);
																} else {
																	// Remove all employees from this location
																	const locationEmployeeIds =
																		groupedEmployees.locationEmployees.map(
																			(emp) => emp.id
																		);
																	onSelectedEmployeesChange(
																		selectedEmployees.filter(
																			(emp) =>
																				!locationEmployeeIds.includes(emp.id)
																		)
																	);
																}
															}}
														/>
														<label
															htmlFor="select-all-location"
															className="text-xs cursor-pointer select-none text-muted-foreground hover:text-foreground">
															Select All
														</label>
													</div>
												)}
											</div>

											{groupedEmployees.locationEmployees.length > 0 ? (
												<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
													{renderEmployeeGrid(
														groupedEmployees.locationEmployees,
														true
													)}
												</div>
											) : (
												<div className="border border-dashed border-muted-foreground/20 rounded-md p-4 text-center text-muted-foreground">
													<MapPin className="h-5 w-5 mx-auto mb-2 opacity-50" />
													<p className="text-sm">
														No employees assigned to this location
													</p>
													<p className="text-xs mt-1">
														Employees will appear here when assigned to{" "}
														{locationName}
													</p>
												</div>
											)}
										</div>

										{/* Other employees */}
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<h3 className="text-sm font-medium flex items-center">
													<Users className="h-3.5 w-3.5 mr-1.5" />
													Other Employees
													<Badge
														variant="outline"
														className="ml-2">
														{groupedEmployees.otherEmployees.length}
													</Badge>
												</h3>
											</div>

											{groupedEmployees.otherEmployees.length > 0 ? (
												<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
													{renderEmployeeGrid(
														groupedEmployees.otherEmployees,
														false
													)}
												</div>
											) : (
												<div className="border border-dashed border-muted-foreground/20 rounded-md p-4 text-center text-muted-foreground">
													<Users className="h-5 w-5 mx-auto mb-2 opacity-50" />
													<p className="text-sm">
														No other employees available
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Message about adding more employees later */}
					<Alert
						variant="default"
						className="text-center text-xs py-2">
						<AlertDescription className="text-muted-foreground">
							You can add more employees to this shift later.
						</AlertDescription>
					</Alert>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between border-t pt-4 mt-4">
					<Button
						variant="outline"
						onClick={onBack}
						type="button">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button
						type="button"
						onClick={() => {
							// Create a simple handler that just calls the submission function
							// without any additional state updates
							const formData = {
								...shiftData,
								employeeIds: selectedEmployees.map((emp) => emp.id),
								selectedEmployees: selectedEmployees, // Explicitly pass the full objects
							};
							console.log(
								"Submitting form with selected employees:",
								selectedEmployees
							);
							onFormSubmit(formData);
						}}
						disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Shift...
							</>
						) : selectedEmployees.length > 0 ? (
							`Create ${selectedEmployees.length} ${
								selectedEmployees.length === 1 ? "Shift" : "Shifts"
							}`
						) : (
							"Create Shift"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
