import { useState } from "react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { ShiftCreationWizard } from "./ShiftCreationWizard";
import { Plus } from "lucide-react";

interface ShiftCreationDialogProps {
	scheduleId: string;
	organizationId: string;
	initialDate?: Date;
	onShiftCreated?: () => void;
	trigger?: React.ReactNode;
}

export function ShiftCreationDialog({
	scheduleId,
	organizationId,
	initialDate,
	onShiftCreated,
	trigger,
}: ShiftCreationDialogProps) {
	const [open, setOpen] = useState(false);

	const handleComplete = () => {
		if (onShiftCreated) {
			onShiftCreated();
		}
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="h-4 w-4 mr-2" /> Create Shift
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] p-0 h-[90vh] flex flex-col">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>Create New Shift</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto px-6 py-4">
					<ShiftCreationWizard
						scheduleId={scheduleId}
						organizationId={organizationId}
						initialDate={initialDate}
						onComplete={handleComplete}
						onCancel={() => setOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
