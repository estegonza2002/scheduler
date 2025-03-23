import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Shift, Employee } from "../../api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search, Info, AlertTriangle } from "lucide-react";
import { AssignedEmployee } from "../../types/shift-types";
import { generateUniqueId } from "../../utils/ids";

interface AssignEmployeeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shift: Shift;
	availableEmployees: Employee[];
	assignedEmployees: AssignedEmployee[];
	onAssign: (assignedEmployees: AssignedEmployee[]) => void;
}

export function AssignEmployeeDialog({
	open,
	onOpenChange,
	shift,
	availableEmployees,
	assignedEmployees,
	onAssign,
}: AssignEmployeeDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedEmployees, setSelectedEmployees] = useState<{
		[key: string]: {
			employee: Employee;
			role: string;
			notes: string;
		};
	}>({});
	const [saving, setSaving] = useState(false);

	// Update state when dialog opens
	const onDialogOpenChange = (open: boolean) => {
		if (open) {
			// Reset selection state
			setSearchQuery("");
			setSelectedEmployees({});
		}
		onOpenChange(open);
	};

	// Filter employees based on search query
	const filteredEmployees = availableEmployees.filter((employee) => {
		const alreadyAssigned = assignedEmployees.some(
			(assigned) => assigned.id === employee.id
		);

		// Don't show already assigned employees
		if (alreadyAssigned) return false;

		// Filter by search query
		if (!searchQuery) return true;

		return (
			employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(employee.position &&
				employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	});

	// Toggle employee selection
	const toggleEmployeeSelection = (employee: Employee) => {
		setSelectedEmployees((prev) => {
			const newSelected = { ...prev };

			if (newSelected[employee.id]) {
				// Remove if already selected
				delete newSelected[employee.id];
			} else {
				// Add if not selected
				newSelected[employee.id] = {
					employee,
					role: employee.position || "Staff",
					notes: "",
				};
			}

			return newSelected;
		});
	};

	// Update role for selected employee
	const updateEmployeeRole = (employeeId: string, role: string) => {
		setSelectedEmployees((prev) => ({
			...prev,
			[employeeId]: {
				...prev[employeeId],
				role,
			},
		}));
	};

	// Update notes for selected employee
	const updateEmployeeNotes = (employeeId: string, notes: string) => {
		setSelectedEmployees((prev) => ({
			...prev,
			[employeeId]: {
				...prev[employeeId],
				notes,
			},
		}));
	};

	// Handle assigning employees
	const handleAssignEmployees = () => {
		setSaving(true);

		// Create assigned employees from selected ones
		const newAssignedEmployees = Object.values(selectedEmployees).map(
			({ employee, role, notes }) => ({
				...employee,
				assignmentId: generateUniqueId(),
				assignmentRole: role,
				assignmentNotes: notes,
			})
		);

		// Combine with existing assigned employees
		onAssign([...assignedEmployees, ...newAssignedEmployees]);
		setSaving(false);
		onOpenChange(false);
	};

	const selectedCount = Object.keys(selectedEmployees).length;

	// Helper to get initials from employee name
	const getInitials = (name: string): string => {
		const parts = name.split(" ");
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`;
		}
		return name.substring(0, 2).toUpperCase();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onDialogOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Assign Employees to Shift</DialogTitle>
					<DialogDescription>
						Select employees to assign to this shift on{" "}
						{new Date(shift.startTime).toLocaleDateString()}.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="relative mb-4">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search employees by name, email or position..."
							className="pl-9"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{filteredEmployees.length === 0 ? (
						<div className="text-center py-8 border rounded-md">
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
								<Info className="h-5 w-5 text-muted-foreground" />
							</div>
							<h3 className="text-sm font-medium">No employees found</h3>
							<p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
								{availableEmployees.length === 0
									? "There are no available employees to assign to this shift."
									: assignedEmployees.length === availableEmployees.length
									? "All employees are already assigned to this shift."
									: "Try a different search term or clear the search field."}
							</p>
						</div>
					) : (
						<>
							<div className="border rounded-md overflow-hidden">
								<ScrollArea className="h-[240px]">
									<div className="divide-y">
										{filteredEmployees.map((employee) => (
											<div
												key={employee.id}
												className={`flex items-center space-x-4 p-3 hover:bg-muted/50 transition-colors ${
													selectedEmployees[employee.id] ? "bg-muted/80" : ""
												}`}>
												<Checkbox
													id={`employee-${employee.id}`}
													checked={!!selectedEmployees[employee.id]}
													onCheckedChange={() =>
														toggleEmployeeSelection(employee)
													}
												/>
												<Avatar className="h-9 w-9">
													<AvatarImage
														src={employee.avatar || undefined}
														alt={employee.name}
													/>
													<AvatarFallback>
														{getInitials(employee.name)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="font-medium truncate">
														{employee.name}
													</div>
													<div className="text-xs text-muted-foreground truncate">
														{employee.position || "Staff"} • {employee.email}
													</div>
												</div>
												{employee.hourlyRate ? (
													<div className="text-sm font-medium tabular-nums">
														${employee.hourlyRate}/hr
													</div>
												) : (
													<div className="flex items-center text-amber-600 text-xs">
														<AlertTriangle className="h-3 w-3 mr-1" />
														<span>No rate</span>
													</div>
												)}
											</div>
										))}
									</div>
								</ScrollArea>
							</div>

							{selectedCount > 0 && (
								<div className="mt-4 space-y-4">
									<div className="text-sm font-medium">
										Selected {selectedCount} employee
										{selectedCount !== 1 ? "s" : ""}
									</div>

									<div className="space-y-3">
										{Object.entries(selectedEmployees).map(
											([id, { employee, role, notes }]) => (
												<div
													key={id}
													className="bg-muted/30 rounded-md p-3 space-y-3">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-3">
															<Avatar className="h-8 w-8">
																<AvatarImage
																	src={employee.avatar || undefined}
																	alt={employee.name}
																/>
																<AvatarFallback>
																	{getInitials(employee.name)}
																</AvatarFallback>
															</Avatar>
															<div className="font-medium">{employee.name}</div>
														</div>
														<Button
															variant="ghost"
															size="sm"
															className="h-7 text-xs"
															onClick={() => toggleEmployeeSelection(employee)}>
															Remove
														</Button>
													</div>

													<div className="grid gap-2">
														<Label
															htmlFor={`role-${id}`}
															className="text-xs">
															Role in shift
														</Label>
														<Input
															id={`role-${id}`}
															placeholder="e.g. Team Lead, Cashier, Server"
															className="h-8 text-sm"
															value={role}
															onChange={(e) =>
																updateEmployeeRole(id, e.target.value)
															}
														/>
													</div>

													<div className="grid gap-2">
														<Label
															htmlFor={`notes-${id}`}
															className="text-xs">
															Assignment notes (optional)
														</Label>
														<Input
															id={`notes-${id}`}
															placeholder="Add any specific notes for this assignment"
															className="h-8 text-sm"
															value={notes}
															onChange={(e) =>
																updateEmployeeNotes(id, e.target.value)
															}
														/>
													</div>
												</div>
											)
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleAssignEmployees}
						disabled={selectedCount === 0 || saving}>
						{saving && (
							<div className="mr-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
						)}
						Assign {selectedCount > 0 ? selectedCount : ""} Employee
						{selectedCount !== 1 ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
