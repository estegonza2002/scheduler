import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Employee, EmployeeLocationsAPI } from "../../api";
import { format } from "date-fns";
import {
	ArrowLeft,
	Check,
	Search,
	MapPin,
	Users,
	Loader2,
	UserCheck,
	UserX,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import { EmployeeCard } from "../EmployeeCard";

// Type definition for employee selection
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

interface AssignEmployeeStepProps {
	employeeForm: UseFormReturn<{ employeeId: string }>;
	locationData: LocationData;
	shiftData: ShiftData;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	filteredEmployees: Employee[];
	loadingEmployees: boolean;
	getLocationName: (locationId: string) => string;
	handleEmployeeAssignSubmit: (data: { employeeId: string }) => void;
	onBack: () => void;
	onResetLocation: () => void;
	loading: boolean;
	selectedEmployees: SelectedEmployee[];
	onSelectedEmployeesChange: (employees: SelectedEmployee[]) => void;
	allEmployees: Employee[];
	onFormSubmit: (data: any) => void;
}

export function AssignEmployeeStep({
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
}: AssignEmployeeStepProps) {
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

	// Filter employees by status
	const eligibleEmployees = useMemo(() => {
		// Return all employees since the status field might not be reliable
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

	// Create a reusable toggle function
	const toggleEmployee = (employee: Employee) => {
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
					role: employee.role,
				},
			]);
		}
	};

	// Helper function to check if an employee is selected
	const isEmployeeSelected = useCallback(
		(id: string) => {
			return selectedEmployees.some((employee) => employee.id === id);
		},
		[selectedEmployees]
	);

	// Render employee cards in a grid
	const renderEmployeeGrid = (
		employees: Employee[],
		fromSelectedLocation: boolean = false
	) => {
		return employees.map((employee) => {
			const isSelected = isEmployeeSelected(employee.id);

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
						showActions={false}
						className={
							isSelected
								? "border-primary bg-primary/5"
								: "hover:border-primary/50"
						}
						hideStatus={true}
						checkboxPosition="left"
						// No topLeftLabel - this is the key difference from the original component
					/>
				</div>
			);
		});
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

				<div className="border rounded-md p-8 text-center mt-4">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
						<Users className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-medium mb-2">No Employees Available</h3>
					<p className="text-sm text-muted-foreground max-w-md mx-auto">
						There are no employees available to assign to this shift. You can
						add employees from the Employees page.
					</p>
				</div>
			</div>
		);
	}

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

			<div className="flex items-center gap-2 mb-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search employees..."
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-[calc(100vh-320px)]">
					{groupedEmployees.locationEmployees.length > 0 && (
						<div className="mb-6">
							<div className="flex items-center gap-2 mb-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<h3 className="text-sm font-medium">
									{locationName} Employees (
									{groupedEmployees.locationEmployees.length})
								</h3>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{renderEmployeeGrid(groupedEmployees.locationEmployees, true)}
							</div>
						</div>
					)}

					{groupedEmployees.otherEmployees.length > 0 && (
						<div>
							<div className="flex items-center gap-2 mb-2">
								<Users className="h-4 w-4 text-muted-foreground" />
								<h3 className="text-sm font-medium">
									Other Employees ({groupedEmployees.otherEmployees.length})
								</h3>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{renderEmployeeGrid(groupedEmployees.otherEmployees)}
							</div>
						</div>
					)}
				</ScrollArea>
			</div>

			<div className="flex items-center justify-between mt-4 pt-4 border-t">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>

				<Button
					type="button"
					disabled={selectedEmployees.length === 0 || loading}
					onClick={() =>
						onFormSubmit({ employeeId: selectedEmployees[0]?.id })
					}>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Assigning...
						</>
					) : (
						<>
							<Check className="h-4 w-4 mr-2" />
							Assign Employees ({selectedEmployees.length})
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
