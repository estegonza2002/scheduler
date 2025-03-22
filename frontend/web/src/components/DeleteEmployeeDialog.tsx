import { useState } from "react";
import { Employee, EmployeesAPI } from "../api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteEmployeeDialogProps {
	employee: Employee;
	trigger?: React.ReactNode;
	onEmployeeDeleted?: (employeeId: string) => void;
}

export function DeleteEmployeeDialog({
	employee,
	trigger,
	onEmployeeDeleted,
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

			setOpen(false);
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="ghost"
						size="sm"
						className="text-destructive">
						<Trash2 className="h-4 w-4 mr-2" />
						Delete Employee
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Delete Employee</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete {employee.name}? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-2 p-4 bg-destructive/10 rounded-md border border-destructive/20">
					<p className="text-sm font-medium">
						This will permanently remove {employee.name} from your organization
						and delete all their associated data.
					</p>
				</div>

				<DialogFooter className="mt-4">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete Employee"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
