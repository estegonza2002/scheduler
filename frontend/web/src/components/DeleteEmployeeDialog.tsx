import { useState } from "react";
import { Employee, EmployeesAPI } from "../api";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { DialogHeader } from "./ui/dialog-header";

/**
 * Props for the DeleteEmployeeDialog component
 */
interface DeleteEmployeeDialogProps {
	/**
	 * The employee data to be deleted
	 */
	employee: Employee;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional callback fired when employee is deleted
	 */
	onEmployeeDeleted?: (employeeId: string) => void;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
}

/**
 * Dialog component for confirming employee deletion
 */
export function DeleteEmployeeDialog({
	employee,
	trigger,
	onEmployeeDeleted,
	className,
}: DeleteEmployeeDialogProps) {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await EmployeesAPI.delete(employee.id);

			if (onEmployeeDeleted) {
				onEmployeeDeleted(employee.id);
			}

			toast.success(`${employee.name} has been deleted`);
			setOpen(false);
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		} finally {
			setIsDeleting(false);
		}
	};

	// Create title with icon for the dialog header
	const dialogTitle = (
		<>
			<UserX className="h-5 w-5 mr-2 text-destructive" />
			Delete Employee
		</>
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (isDeleting) return; // Prevent closing during deletion
				setOpen(newOpen);
			}}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="ghost"
						size="sm"
						className="text-destructive hover:bg-destructive/10">
						<Trash2 className="h-4 w-4 mr-2" />
						Delete Employee
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className={cn("sm:max-w-[450px]", className)}>
				<DialogHeader
					title={dialogTitle as unknown as string}
					description={`Are you sure you want to delete ${employee.name}?`}
					titleClassName="flex items-center"
					onClose={() => setOpen(false)}
				/>

				<div className="my-3 p-4 bg-destructive/10 rounded-md border border-destructive/30 flex items-start gap-3">
					<AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-sm font-medium text-destructive-foreground">
							This action cannot be undone
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							This will permanently remove {employee.name} from your
							organization and delete all their associated data, including shift
							history and payroll information.
						</p>
					</div>
				</div>

				<DialogFooter className="mt-2 gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isDeleting}
						className="sm:mr-2">
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
						className={isDeleting ? "opacity-80" : ""}>
						{isDeleting ? (
							<>
								<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
								Deleting...
							</>
						) : (
							"Delete Employee"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
