import { useState } from "react";
import { Employee } from "../api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";

interface EditEmployeeDialogProps {
	employee: Employee;
	trigger?: React.ReactNode;
	onEmployeeUpdated?: (employee: Employee) => void;
}

export function EditEmployeeDialog({
	employee,
	trigger,
	onEmployeeUpdated,
}: EditEmployeeDialogProps) {
	const [open, setOpen] = useState(false);

	const handleEmployeeUpdated = (updatedEmployee: Employee) => {
		if (onEmployeeUpdated) {
			onEmployeeUpdated(updatedEmployee);
		}
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="ghost"
						size="sm">
						<Pencil className="h-4 w-4 mr-2" />
						Edit Employee
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>Edit Employee</DialogTitle>
					<DialogDescription>
						Update employee information for {employee.name}
					</DialogDescription>
				</DialogHeader>

				<EmployeeForm
					organizationId={employee.organizationId}
					initialData={employee}
					onSuccess={handleEmployeeUpdated}
				/>
			</DialogContent>
		</Dialog>
	);
}
