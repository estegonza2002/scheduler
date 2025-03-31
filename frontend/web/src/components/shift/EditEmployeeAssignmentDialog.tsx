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
import { Label } from "../ui/label";
import { AssignedEmployee } from "../../types/shift-types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface EditEmployeeAssignmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: AssignedEmployee | null;
	onSave: (employee: AssignedEmployee) => void;
}

export function EditEmployeeAssignmentDialog({
	open,
	onOpenChange,
	employee,
	onSave,
}: EditEmployeeAssignmentDialogProps) {
	const [saving, setSaving] = useState(false);

	// Initialize state when dialog opens with employee data
	const handleDialogOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen);
	};

	// Get employee initials for avatar
	const getInitials = (name: string): string => {
		const parts = name.split(" ");
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	// Handle save
	const handleSave = () => {
		if (!employee) return;

		setSaving(true);
		// Just pass the employee back with no changes
		onSave({
			...employee,
		});
		setSaving(false);
		onOpenChange(false);
	};

	if (!employee) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={handleDialogOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Employee Assignment</DialogTitle>
					<DialogDescription>
						Employee information for this shift assignment.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="flex items-center gap-3 mb-6">
						<Avatar className="h-12 w-12">
							<AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
							{employee.avatar && <AvatarImage src={employee.avatar} />}
						</Avatar>
						<div>
							<div className="font-medium">{employee.name}</div>
							<div className="text-sm text-muted-foreground">
								{employee.email}
							</div>
							<div className="text-sm text-muted-foreground">
								{employee.position}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="hourlyRate">Hourly Rate</Label>
							<Input
								id="hourlyRate"
								value={
									employee.hourlyRate
										? `$${employee.hourlyRate.toFixed(2)}`
										: "Not set"
								}
								disabled
								className="bg-muted/50"
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
