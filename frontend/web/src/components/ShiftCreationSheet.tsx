import { useState } from "react";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { ShiftCreationWizard } from "./ShiftCreationWizard";
import { Plus } from "lucide-react";

interface ShiftCreationSheetProps {
	scheduleId: string;
	organizationId: string;
	initialDate?: Date;
	onShiftCreated?: () => void;
	trigger?: React.ReactNode;
}

export function ShiftCreationSheet({
	scheduleId,
	organizationId,
	initialDate,
	onShiftCreated,
	trigger,
}: ShiftCreationSheetProps) {
	const [open, setOpen] = useState(false);

	const handleComplete = () => {
		if (onShiftCreated) {
			onShiftCreated();
		}
		setOpen(false);
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="h-4 w-4 mr-2" /> Create Shift
					</Button>
				)}
			</SheetTrigger>
			<SheetContent
				className="sm:max-w-[550px] p-0 flex flex-col h-[100dvh]"
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0">
					<SheetTitle>Create New Shift</SheetTitle>
				</SheetHeader>
				<div className="flex-1 overflow-auto">
					<ShiftCreationWizard
						scheduleId={scheduleId}
						organizationId={organizationId}
						initialDate={initialDate}
						onComplete={handleComplete}
						onCancel={() => setOpen(false)}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
