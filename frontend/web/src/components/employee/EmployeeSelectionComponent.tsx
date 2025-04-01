import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Employee, EmployeeLocationsAPI, LocationsAPI } from "../../api";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
	ArrowLeft,
	Check,
	Search,
	MapPin,
	Users,
	Loader2,
	UserCheck,
	CalendarDays,
	Clock,
	FileText,
	X,
} from "lucide-react";

import { EmployeeCard } from "../EmployeeCard";
import { format } from "date-fns";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

// Type definition for selected employee
export type SelectedEmployee = {
	id: string;
	name: string;
	position?: string;
};

// Common data types
export type ShiftData = {
	date?: string;
	startTime?: string;
	endTime?: string;
	notes?: string;
};

export type LocationData = {
	locationId?: string;
};

interface EmptyStateProps {
	title: string;
	message: string;
	icon?: LucideIcon;
	compact?: boolean;
}

// Reusable empty state component using shadcn Card
function EmptyState({
	title,
	message,
	icon: Icon = Users,
	compact = false,
}: EmptyStateProps) {
	if (compact) {
		return (
			<Card className="text-center">
				<CardContent className="pt-4 px-4 pb-4">
					<div className="flex items-center justify-center gap-2 mb-1">
						<Icon className="h-4 w-4 text-muted-foreground" />
						<p className="text-base font-medium">{title}</p>
					</div>
					<p className="text-xs text-muted-foreground">{message}</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="text-center">
			<CardContent className="pt-6 pb-6">
				<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
					<Icon className="h-6 w-6 text-muted-foreground" />
				</span>
				<CardTitle className="mb-2">{title}</CardTitle>
				<CardDescription className="max-w-md mx-auto">
					{message}
				</CardDescription>
			</CardContent>
		</Card>
	);
}

export interface EmployeeSelectionComponentProps {
	// Form data
	employeeForm?: UseFormReturn<any>;

	// Context data
	locationData?: LocationData;
	shiftData?: ShiftData;

	// Search and filtering
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	filteredEmployees: Employee[];
	allEmployees: Employee[];
	loadingEmployees: boolean;

	// Location data and handling
	getLocationName?: (locationId: string) => string;
	onResetLocation?: () => void;

	// Selection state and callbacks
	selectedEmployees: SelectedEmployee[];
	onSelectedEmployeesChange: (employees: SelectedEmployee[]) => void;
	alreadyAssignedEmployees?: Employee[];

	// Navigation and form handling
	onBack?: () => void;
	onFormSubmit?: (data: any) => void;
	handleEmployeeAssignSubmit?: (data: any) => void;
	loading?: boolean;

	// UI customization
	title?: string;
	subtitle?: string;
	showShiftInfo?: boolean;
	showLocationInfo?: boolean;
	showSelectedEmployees?: boolean;
	submitButtonText?: string;
	backButtonText?: string;
	filterByLocation?: boolean;
	emptyStateMessage?: string;
	emptyStateTitle?: string;
	compactEmptyState?: boolean;
}

export function EmployeeSelectionComponent({
	employeeForm,
	locationData = {},
	shiftData = {},
	searchTerm,
	setSearchTerm,
	filteredEmployees = [],
	allEmployees = [],
	loadingEmployees,
	getLocationName,
	onResetLocation,
	selectedEmployees = [],
	onSelectedEmployeesChange,
	alreadyAssignedEmployees,
	onBack = () => {},
	onFormSubmit = () => {},
	handleEmployeeAssignSubmit,
	loading = false,
	title = "Select Employees",
	subtitle,
	showShiftInfo = false,
	showLocationInfo = false,
	showSelectedEmployees = false,
	submitButtonText = "Assign",
	backButtonText = "Back",
	filterByLocation = false,
	emptyStateMessage = "There are no employees available to assign. You can add employees from the Employees page.",
	emptyStateTitle = "No Employees Available",
	compactEmptyState = false,
}: EmployeeSelectionComponentProps) {
	// State for tracking which employees are assigned to this location
	const [locationEmployeeIds, setLocationEmployeeIds] = useState<string[]>([]);
	const [loadingLocationEmployees, setLoadingLocationEmployees] =
		useState(false);
	const [localLocationName, setLocalLocationName] = useState<
		string | undefined
	>(undefined);
	const [isLoadingLocationName, setIsLoadingLocationName] = useState(false);

	// Determine if we should fetch location employees
	const shouldFetchLocationEmployees =
		filterByLocation && locationData?.locationId;

	// Fetch location name directly if needed
	useEffect(() => {
		const fetchLocationName = async () => {
			// Only fetch if we have a location ID and showing location info
			if (!(locationData?.locationId && (showLocationInfo || showShiftInfo)))
				return;

			// Skip if we already have the getLocationName function
			// that's passed from the parent component
			if (getLocationName) return;

			try {
				setIsLoadingLocationName(true);
				// Directly fetch location name from API
				const location = await LocationsAPI.getById(locationData.locationId);
				if (location) {
					console.log(
						"EmployeeSelectionComponent: Fetched location:",
						location.name
					);
					setLocalLocationName(location.name);
				} else {
					console.warn(
						"EmployeeSelectionComponent: Location not found:",
						locationData.locationId
					);
					setLocalLocationName("Unknown Location");
				}
			} catch (error) {
				console.error("Error fetching location name:", error);
				setLocalLocationName("Unknown Location");
			} finally {
				setIsLoadingLocationName(false);
			}
		};

		fetchLocationName();
	}, [
		locationData?.locationId,
		showLocationInfo,
		showShiftInfo,
		getLocationName,
	]);

	// Fetch employees assigned to this location
	useEffect(() => {
		const fetchLocationEmployees = async () => {
			if (!shouldFetchLocationEmployees) return;

			try {
				setLoadingLocationEmployees(true);
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationData!.locationId!
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

		if (shouldFetchLocationEmployees) {
			fetchLocationEmployees();
		}
	}, [shouldFetchLocationEmployees, locationData?.locationId]);

	// Format display data for shift and location if available
	const locationName = useMemo(() => {
		// If we have a location name from parent component via getLocationName
		if (locationData?.locationId && getLocationName) {
			return getLocationName(locationData.locationId);
		}

		// Return locally fetched location name
		return localLocationName;
	}, [locationData?.locationId, getLocationName, localLocationName]);

	const formattedDate = shiftData?.date
		? format(new Date(shiftData.date), "EEE, MMM d")
		: undefined;

	const shiftTimeDisplay =
		shiftData?.startTime && shiftData?.endTime
			? `${format(new Date(`2000-01-01T${shiftData.startTime}`), "h:mm a")} - 
			${format(new Date(`2000-01-01T${shiftData.endTime}`), "h:mm a")}`
			: undefined;

	// Ref for the form to submit programmatically
	const formRef = useRef<HTMLFormElement>(null);

	// Separate employees into those assigned to this location and others
	const groupedEmployees = useMemo(() => {
		if (!filterByLocation) {
			return { locationEmployees: [], otherEmployees: filteredEmployees };
		}

		// Create a set of already assigned employee IDs for efficient lookup
		const alreadyAssignedIds = new Set(
			alreadyAssignedEmployees?.map((emp) => emp.id) || []
		);

		// Filter out already assigned employees from location employees
		const locationEmployees = filteredEmployees.filter(
			(emp) =>
				locationEmployeeIds.includes(emp.id) && !alreadyAssignedIds.has(emp.id)
		);

		// Filter out already assigned employees from other employees
		const otherEmployees = filteredEmployees.filter(
			(emp) =>
				!locationEmployeeIds.includes(emp.id) && !alreadyAssignedIds.has(emp.id)
		);

		return { locationEmployees, otherEmployees };
	}, [
		filteredEmployees,
		locationEmployeeIds,
		filterByLocation,
		alreadyAssignedEmployees,
	]);

	// Create a reusable toggle function
	const toggleEmployee = useCallback(
		(employee: Employee) => {
			const isSelected = selectedEmployees.some((e) => e.id === employee.id);

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
						position: employee.position,
					},
				]);
			}
		},
		[selectedEmployees, onSelectedEmployeesChange]
	);

	// Add a select all employees at location function
	const selectAllLocationEmployees = useCallback(() => {
		const locationEmployeeSet = new Set(
			selectedEmployees.map((employee) => employee.id)
		);

		// Add all location employees that aren't already selected
		const updatedSelection = [...selectedEmployees];

		groupedEmployees.locationEmployees.forEach((employee) => {
			if (!locationEmployeeSet.has(employee.id)) {
				updatedSelection.push({
					id: employee.id,
					name: employee.name,
					position: employee.position,
				});
			}
		});

		onSelectedEmployeesChange(updatedSelection);
	}, [
		groupedEmployees.locationEmployees,
		onSelectedEmployeesChange,
		selectedEmployees,
	]);

	// Helper function to check if an employee is selected
	const isEmployeeSelected = useCallback(
		(id: string) => {
			return selectedEmployees.some((employee) => employee.id === id);
		},
		[selectedEmployees]
	);

	// Modify the renderEmployeeGrid function to handle empty arrays and prevent React key issues
	const renderEmployeeGrid = useCallback(
		(employees: Employee[], fromSelectedLocation: boolean = false) => {
			// Add safety check for empty arrays
			if (!employees || employees.length === 0) {
				return (
					<EmptyState
						title={emptyStateTitle}
						message={emptyStateMessage}
						compact={compactEmptyState}
					/>
				);
			}

			return employees.map((employee) => {
				if (!employee || !employee.id) {
					console.warn("Invalid employee object encountered:", employee);
					return null; // Skip invalid employees
				}

				const isSelected = isEmployeeSelected(employee.id);

				return (
					<EmployeeCard
						key={employee.id}
						employee={employee}
						selected={isSelected}
						onSelect={() => toggleEmployee(employee)}
						selectable={true}
						selectionMode="checkbox"
						variant="compact"
						size="sm"
						showActions={false}
						className={`w-full max-w-none ${
							isSelected
								? "border-primary bg-primary/5"
								: "hover:border-primary/50"
						}`}
						hideStatus={true}
						checkboxPosition="left"
					/>
				);
			});
		},
		[
			isEmployeeSelected,
			toggleEmployee,
			emptyStateTitle,
			emptyStateMessage,
			compactEmptyState,
		]
	);

	// Render the component
	return (
		<div className="flex flex-col h-full">
			{/* Search bar positioned at the top */}
			<div className="mb-4 sticky top-0 z-10 pt-2 pb-3 bg-background">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search employees..."
						className="pl-9 bg-background"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Location display with shift details */}
			<div className="mb-4">
				{/* Combined location, date and time card */}
				<div className="border border-border rounded-md p-3">
					{/* Location section */}
					<div className="flex items-center space-x-2 mb-3">
						<MapPin className="h-4 w-4 text-primary flex-shrink-0" />
						<div>
							<p className="text-sm font-medium">Shift Location</p>
							<p className="text-sm text-muted-foreground">
								{locationData?.locationId
									? isLoadingLocationName
										? "Loading location..."
										: getLocationName
										? getLocationName(locationData.locationId)
										: localLocationName || "Unknown Location"
									: "No location assigned"}
							</p>
						</div>
					</div>

					{/* Divider */}
					{(shiftData?.date || shiftTimeDisplay) && (
						<div className="border-t border-border my-2"></div>
					)}

					{/* Date and time */}
					{(shiftData?.date || shiftTimeDisplay) && (
						<div className="flex flex-wrap items-center gap-6 mt-3">
							{shiftData?.date && (
								<div className="flex items-center space-x-2">
									<CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									<span className="text-sm font-medium">{formattedDate}</span>
								</div>
							)}

							{shiftTimeDisplay && (
								<div className="flex items-center space-x-2">
									<Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									<span className="text-sm">{shiftTimeDisplay}</span>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Selected Employees */}
			{showSelectedEmployees && selectedEmployees.length > 0 && (
				<div className="mb-4">
					<div className="text-sm font-medium mb-2 flex items-center">
						<UserCheck className="h-4 w-4 mr-1.5 text-muted-foreground" />
						Selected Employees ({selectedEmployees.length})
					</div>
					<div className="flex flex-wrap gap-2">
						{selectedEmployees.map((employee) => (
							<Badge
								key={employee.id}
								className="pl-2 pr-1 py-1 flex items-center">
								<span>{employee.name}</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-5 w-5 p-0 ml-1 text-primary-foreground"
									onClick={() =>
										onSelectedEmployeesChange(
											selectedEmployees.filter((emp) => emp.id !== employee.id)
										)
									}>
									<X className="h-3 w-3" />
									<span className="sr-only">Remove</span>
								</Button>
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Scrollable employee list area */}
			<ScrollArea className="flex-1 -mx-1 px-1">
				<div className="space-y-4">
					{/* Already assigned employees section */}
					{alreadyAssignedEmployees && alreadyAssignedEmployees.length > 0 && (
						<div>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center">
									<UserCheck className="h-4 w-4 mr-1.5 text-primary" />
									<h3 className="text-sm font-medium">
										Already Assigned ({alreadyAssignedEmployees.length})
									</h3>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2">
								{alreadyAssignedEmployees.map((employee) => (
									<EmployeeCard
										key={employee.id}
										employee={employee}
										selected={true}
										onSelect={() => toggleEmployee(employee)}
										selectable={true}
										selectionMode="checkbox"
										variant="compact"
										size="sm"
										showActions={false}
										className="w-full border-primary bg-primary/5"
										hideStatus={true}
										checkboxPosition="left"
									/>
								))}
							</div>
						</div>
					)}

					{shouldFetchLocationEmployees && (
						<>
							{loadingLocationEmployees ? (
								<div className="flex items-center justify-center py-6">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									<span className="ml-2 text-muted-foreground">
										Loading employees...
									</span>
								</div>
							) : (
								<>
									{/* Location employees section */}
									{groupedEmployees.locationEmployees.length > 0 ? (
										<div>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center">
													<MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
													<h3 className="text-sm font-medium">
														From This Location (
														{groupedEmployees.locationEmployees.length})
													</h3>
												</div>
												<Button
													type="button"
													size="sm"
													variant="outline"
													className="h-8 text-xs"
													onClick={selectAllLocationEmployees}>
													<UserCheck className="mr-1 h-3 w-3" />
													Select All
												</Button>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2">
												{groupedEmployees.locationEmployees.map((employee) => (
													<EmployeeCard
														key={employee.id}
														employee={employee}
														selected={selectedEmployees.some(
															(emp) => emp.id === employee.id
														)}
														onSelect={() => toggleEmployee(employee)}
														selectable={true}
														selectionMode="checkbox"
														variant="compact"
														size="sm"
														showActions={false}
														className={`w-full ${
															selectedEmployees.some(
																(emp) => emp.id === employee.id
															)
																? "border-primary bg-primary/5"
																: "hover:border-primary/50"
														}`}
														hideStatus={true}
														checkboxPosition="left"
													/>
												))}
											</div>
										</div>
									) : (
										<div>
											<div className="flex items-center mb-2">
												<MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
												<h3 className="text-sm font-medium">
													From This Location (0)
												</h3>
											</div>
											<EmptyState
												title="No Employees at This Location"
												message="There are no employees assigned to this location."
												icon={MapPin}
												compact={true}
											/>
										</div>
									)}

									{/* Other employees section */}
									<div className="mt-4">
										<div className="flex items-center mb-2">
											<Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
											<h3 className="text-sm font-medium">
												All Other Employees (
												{groupedEmployees.otherEmployees.length})
											</h3>
										</div>
										{groupedEmployees.otherEmployees.length > 0 ? (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2">
												{groupedEmployees.otherEmployees.map((employee) => (
													<EmployeeCard
														key={employee.id}
														employee={employee}
														selected={selectedEmployees.some(
															(emp) => emp.id === employee.id
														)}
														onSelect={() => toggleEmployee(employee)}
														selectable={true}
														selectionMode="checkbox"
														variant="compact"
														size="sm"
														showActions={false}
														className={`w-full ${
															selectedEmployees.some(
																(emp) => emp.id === employee.id
															)
																? "border-primary bg-primary/5"
																: "hover:border-primary/50"
														}`}
														hideStatus={true}
														checkboxPosition="left"
													/>
												))}
											</div>
										) : (
											<EmptyState
												title="No Other Employees"
												message="All available employees are assigned to this location."
												icon={Users}
												compact={true}
											/>
										)}
									</div>
								</>
							)}
						</>
					)}

					{/* Standard employee list (when not filtering by location) */}
					{!shouldFetchLocationEmployees && (
						<>
							{loadingEmployees ? (
								<div className="flex items-center justify-center py-6">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									<span className="ml-2 text-muted-foreground">
										Loading employees...
									</span>
								</div>
							) : filteredEmployees.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2">
									{filteredEmployees.map((employee) => (
										<EmployeeCard
											key={employee.id}
											employee={employee}
											selected={selectedEmployees.some(
												(emp) => emp.id === employee.id
											)}
											onSelect={() => toggleEmployee(employee)}
											selectable={true}
											selectionMode="checkbox"
											variant="compact"
											size="sm"
											showActions={false}
											className={`w-full ${
												selectedEmployees.some((emp) => emp.id === employee.id)
													? "border-primary bg-primary/5"
													: "hover:border-primary/50"
											}`}
											hideStatus={true}
											checkboxPosition="left"
										/>
									))}
								</div>
							) : (
								<EmptyState
									title={emptyStateTitle}
									message={emptyStateMessage}
									compact={compactEmptyState}
								/>
							)}
						</>
					)}
				</div>
				<div className="h-20"></div> {/* Extra space for footer */}
			</ScrollArea>

			{/* Sticky footer with action buttons */}
			<div className="sticky bottom-0 pt-3 pb-2 bg-background border-t mt-auto">
				<div className="flex justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						disabled={loading}>
						{backButtonText}
					</Button>
					<Button
						type="submit"
						disabled={loading}
						onClick={() => onFormSubmit(selectedEmployees)}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{submitButtonText}
					</Button>
				</div>
			</div>
		</div>
	);
}
