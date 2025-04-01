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
} from "lucide-react";

import { EmployeeCard } from "../EmployeeCard";
import { format } from "date-fns";
import { LucideIcon } from "lucide-react";

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

		// Split into location employees and others
		const locationEmployees = filteredEmployees.filter((emp) =>
			locationEmployeeIds.includes(emp.id)
		);

		const otherEmployees = filteredEmployees.filter(
			(emp) => !locationEmployeeIds.includes(emp.id)
		);

		return { locationEmployees, otherEmployees };
	}, [filteredEmployees, locationEmployeeIds, filterByLocation]);

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
						className={`w-full max-w-[200px] ${
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

	if (loadingEmployees || loadingLocationEmployees) {
		return (
			<Card className="w-full">
				<CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin opacity-30 mb-4" />
					<p className="text-sm text-muted-foreground">Loading employees...</p>
				</CardContent>
			</Card>
		);
	}

	if (filteredEmployees.length === 0 && !searchTerm) {
		return (
			<Card className="w-full">
				<CardContent className="p-6">
					{showShiftInfo && (
						<>
							<Badge
								variant="outline"
								className="mb-2">
								Shift
							</Badge>
							<h3 className="text-lg font-medium">
								{locationName && `${locationName} • `}
								{formattedDate}
							</h3>
							{shiftTimeDisplay && (
								<p className="text-sm text-muted-foreground mb-4">
									{shiftTimeDisplay}
								</p>
							)}
						</>
					)}
					<EmptyState
						title={emptyStateTitle}
						message={emptyStateMessage}
						compact={compactEmptyState}
					/>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardContent className="p-6 space-y-4">
				{/* Context information (Shift or Location) */}
				{(showShiftInfo || showLocationInfo) && (
					<>
						{showShiftInfo && (
							<>
								<Badge
									variant="outline"
									className="mb-2">
									Shift
								</Badge>
								<h3 className="text-lg font-medium">
									{locationName && `${locationName} • `}
									{formattedDate}
								</h3>
								{shiftTimeDisplay && (
									<p className="text-sm text-muted-foreground">
										{shiftTimeDisplay}
									</p>
								)}
							</>
						)}

						{showLocationInfo && !showShiftInfo && (
							<>
								<Badge
									variant="outline"
									className="mb-2">
									Location
								</Badge>
								{locationName && (
									<h3 className="text-lg font-medium">{locationName}</h3>
								)}
							</>
						)}
					</>
				)}

				{/* Title and subtitle */}
				<>
					<h2 className="text-xl font-semibold">{title}</h2>
					{subtitle && (
						<p className="text-sm text-muted-foreground">{subtitle}</p>
					)}
				</>

				{/* Search bar */}
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search employees..."
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{/* Employee selection */}
				<form
					ref={formRef}
					onSubmit={(e) => {
						e.preventDefault();
						if (onFormSubmit) {
							onFormSubmit(employeeForm?.getValues());
						} else if (employeeForm && handleEmployeeAssignSubmit) {
							handleEmployeeAssignSubmit(employeeForm.getValues());
						}
					}}
					className="space-y-6">
					{/* If we're filtering by location, show that section first */}
					{filterByLocation &&
						groupedEmployees.locationEmployees.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-sm">
											Employees at {locationName}
										</span>
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
								<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
									{renderEmployeeGrid(groupedEmployees.locationEmployees, true)}
								</div>
							</div>
						)}

					{/* All other employees (or all employees if not filtering by location) */}
					<div className="space-y-4">
						{filterByLocation &&
						groupedEmployees.locationEmployees.length > 0 ? (
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium text-sm">Other employees</span>
							</div>
						) : null}

						{(filterByLocation
							? groupedEmployees.otherEmployees
							: filteredEmployees
						).length > 0 ? (
							<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{renderEmployeeGrid(
									filterByLocation
										? groupedEmployees.otherEmployees
										: filteredEmployees
								)}
							</div>
						) : (
							<EmptyState
								title="No Other Employees"
								message={
									searchTerm
										? "No employees match your search."
										: "There are no additional employees available to assign."
								}
								compact={true}
							/>
						)}
					</div>

					{/* Action buttons */}
					<div className="flex justify-between">
						{onBack ? (
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={loading}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								{backButtonText}
							</Button>
						) : (
							<span></span>
						)}

						<Button
							type="submit"
							disabled={selectedEmployees.length === 0 || loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{submitButtonText}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
