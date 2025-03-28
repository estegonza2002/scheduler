import { useState } from "react";
import { Employee, EmployeesAPI } from "@/api";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
	SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, User, Pencil, CheckCircle, Trash } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
}: EmployeeSheetProps) {
	const [open, setOpen] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const navigate = useNavigate();

	const isEditing = !!employee;

	const handleEmployeeAction = (updatedEmployee: Employee) => {
		setIsComplete(true);
		if (onEmployeeUpdated) {
			onEmployeeUpdated(updatedEmployee);
		}
	};

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when sheet closes
			setTimeout(() => {
				if (!open) {
					setIsComplete(false);
					setShowDeleteDialog(false);
				}
			}, 300); // Wait for sheet close animation
		}
		setOpen(newOpenState);
	};

	const handleDeleteEmployee = async () => {
		if (!employee) return;

		try {
			await EmployeesAPI.delete(employee.id);
			toast.success(`${employee.name} has been deleted`);
			handleOpenChange(false);
			// Navigate back to employees list if on detail page
			if (
				window.location.pathname.includes(`/employee-detail/${employee.id}`)
			) {
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
				className={cn(
					"sm:max-w-[550px] p-0 flex flex-col h-[100dvh]",
					className
				)}
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5 text-primary" />
						<SheetTitle>
							{isEditing ? `Edit Employee` : `Add New Employee`}
						</SheetTitle>
					</div>
					<SheetDescription className="mt-1.5">
						{isEditing
							? `Update information for ${employee.name}`
							: `Enter employee details to add them to your organization`}
					</SheetDescription>
				</SheetHeader>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="p-6">
						<EmployeeForm
							organizationId={organizationId}
							initialData={employee}
							onSuccess={handleEmployeeAction}
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
					</div>
				</ScrollArea>

				{isComplete && (
					<SheetFooter className="flex px-6 py-4 border-t">
						<div className="flex items-center text-sm text-muted-foreground mr-auto">
							<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
							<span>
								Employee {isEditing ? "updated" : "added"} successfully
							</span>
						</div>
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							Close
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
