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
	searchFilter: string;
	setSearchFilter: (value: string) => void;
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
}

interface EmployeeItemProps {
	employee: Employee;
	selected: boolean;
	onToggle: () => void;
}

function EmployeeItem({ employee, selected, onToggle }: EmployeeItemProps) {
	return (
		<div
			className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
				selected ? "bg-primary/10 border-primary" : "hover:bg-accent"
			}`}
			onClick={onToggle}>
			<Checkbox
				checked={selected}
				onCheckedChange={onToggle}
				className="h-4 w-4"
			/>
			<Avatar className="h-8 w-8">
				<AvatarFallback>
					{employee.name
						.split(" ")
						.map((n) => n[0])
						.join("")
						.toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm">{employee.name}</div>
				{employee.role && (
					<div className="text-xs text-muted-foreground">{employee.role}</div>
				)}
			</div>
			{selected && <Check className="h-4 w-4 text-primary" />}
		</div>
	);
}

export function EmployeeAssignmentStep({
	employeeForm,
	locationData,
	shiftData,
	searchTerm,
	setSearchTerm,
	searchFilter,
	setSearchFilter,
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
}: EmployeeAssignmentStepProps) {
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
		return filteredEmployees.filter((emp) => emp.status === "invited");
	}, [filteredEmployees]);

	const eligibleEmployees = useMemo(() => {
		return filteredEmployees.filter((emp) => emp.status !== "invited");
	}, [filteredEmployees]);

	// Handle employee selection/deselection
	const toggleEmployeeSelection = (employee: Employee) => {
		const isSelected = selectedEmployees.some((e) => e.id === employee.id);

		if (isSelected) {
			// Remove employee if already selected
			onSelectedEmployeesChange(
				selectedEmployees.filter((e) => e.id !== employee.id)
			);
		} else {
			// Add employee if not selected
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

	// Check if an employee is selected
	const isEmployeeSelected = (id: string) => {
		return selectedEmployees.some((employee) => employee.id === id);
	};

	// Handle form submission with multiple employees
	const handleSubmit = () => {
		// If no employees are selected, use the original form submit with empty employeeId
		if (selectedEmployees.length === 0) {
			employeeForm.setValue("employeeId", "");
		} else {
			// For backward compatibility, set the first employee as the form value
			employeeForm.setValue("employeeId", selectedEmployees[0].id);
		}

		employeeForm.handleSubmit(handleEmployeeAssignSubmit)();
	};

	// Extract unique roles from all employees, not just filtered ones
	const uniqueRoles = useMemo(() => {
		const roles = [
			...new Set(allEmployees.map((employee) => employee.role).filter(Boolean)),
		] as string[];
		return roles;
	}, [allEmployees]);

	if (loadingEmployees) {
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
				ref={formRef}
				id="employee-assignment-form"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				className="space-y-4">
				<div className="space-y-4">
					{/* Search and filter controls */}
					<div className="flex flex-col gap-2 sm:flex-row">
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
						<Select
							value={searchFilter}
							onValueChange={setSearchFilter}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Employees</SelectItem>
								<SelectItem value="available">Available</SelectItem>
								<SelectItem value="unavailable">Unavailable</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Employee list */}
					<div className="border rounded-md">
						<ScrollArea className="h-[320px]">
							<div className="p-2">
								{filteredEmployees.length === 0 ? (
									<div className="p-6 text-center text-muted-foreground">
										No employees found matching "{searchTerm}"
									</div>
								) : (
									<div className="space-y-1">
										{filteredEmployees.map((employee) => (
											<EmployeeItem
												key={employee.id}
												employee={employee}
												selected={selectedEmployees.some(
													(e) => e.id === employee.id
												)}
												onToggle={() => {
													const newSelectedEmployees = selectedEmployees.some(
														(e) => e.id === employee.id
													)
														? selectedEmployees.filter(
																(e) => e.id !== employee.id
														  )
														: [
																...selectedEmployees,
																{
																	id: employee.id,
																	name: employee.name,
																},
														  ];
													onSelectedEmployeesChange(newSelectedEmployees);
												}}
											/>
										))}
									</div>
								)}
							</div>
						</ScrollArea>
					</div>

					{/* Selected count */}
					<div className="text-sm text-center">
						{selectedEmployees.length === 0 ? (
							<span className="text-muted-foreground">
								No employees selected
							</span>
						) : (
							<span>
								<span className="font-medium">{selectedEmployees.length}</span>{" "}
								{selectedEmployees.length === 1 ? "employee" : "employees"}{" "}
								selected
							</span>
						)}
					</div>
				</div>

				{/* Hidden submit button for form validity */}
				<button
					type="submit"
					className="hidden"
				/>
			</form>
		</div>
	);
}
