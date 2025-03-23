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
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";

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

	return (
		<div className="flex-1 flex flex-col relative h-full">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				className="flex flex-col h-full">
				<div className="space-y-6 flex-1 overflow-y-auto pb-24">
					{/* Location and shift summary */}
					<div className="flex flex-col space-y-2">
						{/* Location info */}
						<div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border">
							<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
								<MapPin className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium truncate">
									{getLocationName(locationData.locationId)}
								</h3>
							</div>
							<Button
								variant="ghost"
								size="icon"
								title="Change location"
								className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
								onClick={onResetLocation}>
								<X className="h-4 w-4" />
								<span className="sr-only">Change location</span>
							</Button>
						</div>

						{/* Shift date and time info */}
						<div className="flex gap-2">
							<div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg p-3 border">
								<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">
										{format(new Date(shiftData.date), "EEE, MMM d, yyyy")}
									</p>
								</div>
							</div>

							<div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg p-3 border">
								<div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
									<Clock className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">
										{format(
											new Date(`2000-01-01T${shiftData.startTime}`),
											"h:mm a"
										)}{" "}
										-{" "}
										{format(
											new Date(`2000-01-01T${shiftData.endTime}`),
											"h:mm a"
										)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Employee selection */}
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-medium">Assign Employees</h3>
							<p className="text-muted-foreground">
								Select one or more employees for this shift
							</p>
						</div>

						{/* Search and filters */}
						<div className="flex gap-2">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Search employees..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-9 pr-8"
								/>
								{searchTerm && (
									<button
										type="button"
										className="absolute right-2 top-1/2 -translate-y-1/2"
										onClick={() => setSearchTerm("")}>
										<X className="h-4 w-4 text-muted-foreground" />
									</button>
								)}
							</div>
							<Select
								value={searchFilter}
								onValueChange={setSearchFilter}>
								<SelectTrigger className="w-[150px]">
									<div className="flex items-center gap-1.5">
										<UserCheck className="h-4 w-4 text-muted-foreground" />
										<SelectValue placeholder="Filter by role" />
									</div>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									{uniqueRoles.length > 0 ? (
										uniqueRoles.map((role) => (
											<SelectItem
												key={role}
												value={role}>
												{role}
											</SelectItem>
										))
									) : (
										<SelectItem
											value="none"
											disabled>
											No roles found
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>

						{/* Employee list - Compact format with checkboxes */}
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-[300px] border rounded-md">
								{loadingEmployees ? (
									<div className="py-12 flex items-center justify-center">
										<div className="animate-pulse text-muted-foreground">
											Loading employees...
										</div>
									</div>
								) : filteredEmployees.length === 0 ? (
									<div className="py-12 flex flex-col items-center justify-center text-center">
										<div className="rounded-full bg-muted p-3 mb-2">
											<X className="h-6 w-6 text-muted-foreground" />
										</div>
										<h4 className="font-medium">No employees found</h4>
										<p className="text-sm text-muted-foreground mt-1">
											Try adjusting your search or filter
										</p>
									</div>
								) : (
									<table className="w-full">
										<thead className="bg-muted sticky top-0">
											<tr>
												<th className="w-10 p-2 text-left"></th>
												<th className="p-2 text-left font-medium text-sm">
													Name
												</th>
												<th className="p-2 text-left font-medium text-sm">
													Role
												</th>
											</tr>
										</thead>
										<tbody>
											{filteredEmployees.map((employee) => (
												<tr
													key={employee.id}
													className={`hover:bg-accent/50 cursor-pointer ${
														isEmployeeSelected(employee.id)
															? "bg-accent/50"
															: ""
													}`}
													onClick={() => toggleEmployeeSelection(employee)}>
													<td className="p-2">
														<Checkbox
															checked={isEmployeeSelected(employee.id)}
															onCheckedChange={() =>
																toggleEmployeeSelection(employee)
															}
															onClick={(e) => e.stopPropagation()}
														/>
													</td>
													<td className="p-2">
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarFallback className="text-xs">
																	{employee.name
																		.split(" ")
																		.map((n) => n[0])
																		.join("")}
																</AvatarFallback>
															</Avatar>
															<span className="font-medium">
																{employee.name}
															</span>
														</div>
													</td>
													<td className="p-2 text-sm text-muted-foreground">
														{employee.role || "-"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</ScrollArea>
						</div>

						{/* Selected employees count */}
						{selectedEmployees.length > 0 && (
							<div className="flex items-center justify-between border rounded-md p-2 bg-accent/20">
								<div className="flex items-center gap-2">
									<span className="font-medium">Selected: </span>
									<Badge>{selectedEmployees.length}</Badge>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => onSelectedEmployeesChange([])}>
									Clear
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Navigation buttons - Absolutely positioned footer */}
				<div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 border-t bg-background">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<Button
						type="submit"
						disabled={loading}>
						{loading
							? "Creating Shift..."
							: selectedEmployees.length > 0
							? `Create ${selectedEmployees.length} ${
									selectedEmployees.length === 1 ? "Shift" : "Shifts"
							  }`
							: "Create Shift"}
					</Button>
				</div>
			</form>
		</div>
	);
}
