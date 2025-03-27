import { useState } from "react";
import { Employee, EmployeesAPI } from "@/api";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Loader2, CheckCircle, Users } from "lucide-react";

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
	allEmployees,
	assignedEmployees,
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

	const isControlled = controlledOpen !== undefined;
	const isOpened = isControlled ? controlledOpen : open;
	const setIsOpened = isControlled ? setControlledOpen! : setOpen;

	// Filter the employees for assignment
	const getFilteredEmployeesForAssignment = () => {
		// Get employees not already assigned to this location
		const unassignedEmployees = allEmployees.filter(
			(emp) => !assignedEmployees.some((assigned) => assigned.id === emp.id)
		);

		if (!searchTerm) return unassignedEmployees;

		// Filter by name if search term is present
		return unassignedEmployees.filter((emp) =>
			emp.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	// Toggle employee selection
	const toggleEmployeeSelection = (employeeId: string) => {
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
			// In a real app, you would have a bulk assignment API
			// For this demo, we'll update each employee individually
			const newlyAssignedEmployees: Employee[] = [];

			for (const employeeId of selectedEmployees) {
				// Get the full employee object
				const employee = allEmployees.find((emp) => emp.id === employeeId);
				if (employee) {
					// Update the employee's location
					await EmployeesAPI.update(employeeId, {
						...employee,
						// @ts-ignore - locationAssignment is a custom property for demo
						locationAssignment: locationId,
					});
					newlyAssignedEmployees.push(employee);
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
	const handleOpenChange = (newOpen: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		if (setIsOpened) {
			setIsOpened(newOpen);
		}

		if (!newOpen) {
			// Reset state when sheet closes
			setTimeout(() => {
				setIsAssigned(false);
				setSelectedEmployees([]);
				setSearchTerm("");
				setAssignedCount(0);
			}, 300); // Wait for sheet close animation
		}
	};

	return (
		<Sheet
			open={isOpened}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent
				className={cn(
					"sm:max-w-[550px] p-0 flex flex-col h-[100dvh]",
					className
				)}
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						<SheetTitle>Assign Employees to {locationName}</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className="flex-1 px-6 py-4">
					<div className="space-y-4">
						{isAssigned ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-primary/10 p-3 mb-4">
									<CheckCircle className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Employees Assigned!
								</h3>
								<p className="text-muted-foreground mb-2">
									{assignedCount} employee{assignedCount !== 1 ? "s" : ""}{" "}
									assigned to {locationName}
								</p>
								<div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
									<Button
										onClick={() => {
											handleOpenChange(false);
										}}>
										Close
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setIsAssigned(false);
											setSelectedEmployees([]);
											setSearchTerm("");
										}}>
										Assign More Employees
									</Button>
								</div>
							</div>
						) : (
							<div>
								<Input
									placeholder="Search employees..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="mb-4"
								/>

								<div className="space-y-1">
									{getFilteredEmployeesForAssignment().length > 0 ? (
										getFilteredEmployeesForAssignment().map((employee) => (
											<div
												key={employee.id}
												className="flex items-center gap-3 p-3 hover:bg-accent/10 rounded-md">
												<Checkbox
													id={`employee-${employee.id}`}
													checked={selectedEmployees.includes(employee.id)}
													onCheckedChange={() =>
														toggleEmployeeSelection(employee.id)
													}
												/>
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={employee.avatar}
														alt={employee.name}
													/>
													<AvatarFallback>
														{employee.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<label
													htmlFor={`employee-${employee.id}`}
													className="flex-1 font-medium cursor-pointer">
													{employee.name}
												</label>
												<span className="text-sm text-muted-foreground">
													{employee.position || "Staff"}
												</span>
											</div>
										))
									) : (
										<div className="py-8 text-center text-muted-foreground">
											{searchTerm
												? "No employees match your search"
												: "No employees available for assignment"}
										</div>
									)}
								</div>

								<div className="flex justify-end space-x-2 pt-8">
									<Button
										type="button"
										variant="outline"
										onClick={() => handleOpenChange(false)}
										disabled={isSubmitting}>
										Cancel
									</Button>
									<Button
										onClick={assignEmployeesToLocation}
										disabled={selectedEmployees.length === 0 || isSubmitting}>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Assigning...
											</>
										) : (
											<>
												<UserPlus className="mr-2 h-4 w-4" />
												Assign {selectedEmployees.length} Employee
												{selectedEmployees.length !== 1 ? "s" : ""}
											</>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
