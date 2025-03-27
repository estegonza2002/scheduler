import { useState } from "react";
import { Employee } from "@/api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, User, CheckCircle } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Props for the EditEmployeeDialog component
 */
interface EditEmployeeDialogProps {
	/**
	 * The employee data to be edited
	 */
	employee: Employee;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional callback fired when employee is updated
	 */
	onEmployeeUpdated?: (employee: Employee) => void;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
}

/**
 * Dialog component for editing an existing employee
 */
export function EditEmployeeDialog({
	employee,
	trigger,
	onEmployeeUpdated,
	className,
}: EditEmployeeDialogProps) {
	const [open, setOpen] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);

	const handleEmployeeUpdated = (updatedEmployee: Employee) => {
		setIsUpdated(true);
		if (onEmployeeUpdated) {
			onEmployeeUpdated(updatedEmployee);
		}
	};

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when dialog closes
			setTimeout(() => {
				if (!open) setIsUpdated(false);
			}, 300); // Wait for dialog close animation
		}
		setOpen(newOpenState);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
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
			<DialogContent
				className={cn(
					"sm:max-w-[650px] overflow-hidden flex flex-col",
					className
				)}>
				<DialogHeader>
					<div className="flex items-center">
						<DialogTitle className="flex items-center">
							<User className="h-5 w-5 mr-2 text-primary" />
							Edit Employee
						</DialogTitle>
					</div>
					<DialogDescription>
						Update information for {employee.name}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="py-1">
						<EmployeeForm
							organizationId={employee.organizationId}
							initialData={employee}
							onSuccess={handleEmployeeUpdated}
						/>
					</div>
				</ScrollArea>

				{isUpdated && (
					<DialogFooter className="flex flex-col sm:flex-row px-4 py-3 mt-2 gap-2 border-t">
						<div className="flex items-center text-sm text-muted-foreground mr-auto">
							<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
							<span>Employee updated successfully</span>
						</div>
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							Close
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
