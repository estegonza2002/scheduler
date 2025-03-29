import { useState, useRef, useEffect } from "react";
import { Employee, EmployeesAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Plus, User, Pencil, CheckCircle, Trash, Loader2 } from "lucide-react";
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
	SheetFooter,
	SheetTrigger,
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

	const [open, setOpen] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const navigate = useNavigate();

	const isEditing = !!employee;

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleEmployeeAction = (updatedEmployee: Employee) => {
		if (!isMounted.current) return;

		setIsComplete(true);
		if (onEmployeeUpdated) {
			onEmployeeUpdated(updatedEmployee);
		}
	};

	const handleOpenChange = (newOpenState: boolean) => {
		if (!isMounted.current) return;

		if (!newOpenState) {
			// Reset state when sheet closes
			setTimeout(() => {
				if (isMounted.current && !open) {
					setIsComplete(false);
					setShowDeleteDialog(false);
					formStateRef.current = null;
				}
			}, 300); // Wait for sheet close animation
		}

		setOpen(newOpenState);
	};

	const handleFormReady = (state: {
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	}) => {
		if (!isMounted.current) return;

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

	// Function to safely access form state
	const getFormState = () => formStateRef.current;

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
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							<SheetTitle>
								{isEditing ? "Edit Employee" : "Add New Employee"}
							</SheetTitle>
						</div>
						<SheetDescription>
							{isEditing
								? `Update information for ${employee.name}`
								: "Enter employee details to add them to your organization"}
						</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 px-6 my-4 overflow-auto">
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
				</div>

				{isComplete ? (
					<SheetFooter className="px-6 py-4">
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
				) : (
					<SheetFooter className="px-6 py-4">
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
							disabled={
								!getFormState()?.isDirty ||
								!getFormState()?.isValid ||
								getFormState()?.isSubmitting
							}>
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
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
