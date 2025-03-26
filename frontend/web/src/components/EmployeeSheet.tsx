import { useState } from "react";
import { Employee } from "../api";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
	SheetFooter,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Plus, User, Pencil, CheckCircle } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";

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
				if (!open) setIsComplete(false);
			}, 300); // Wait for sheet close animation
		}
		setOpen(newOpenState);
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
