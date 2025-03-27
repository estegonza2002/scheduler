import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ShiftCreationWizard } from "./ShiftCreationWizard";
import { Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the ShiftCreationSheet component
 */
interface ShiftCreationSheetProps {
	/**
	 * ID of the schedule to create shifts for
	 */
	scheduleId: string;
	/**
	 * ID of the organization
	 */
	organizationId: string;
	/**
	 * Optional initial date for the shift
	 */
	initialDate?: Date;
	/**
	 * Optional initial location ID to pre-select
	 */
	initialLocationId?: string;
	/**
	 * Optional callback fired when a shift is created successfully
	 */
	onShiftCreated?: () => void;
	/**
	 * Optional custom trigger element to open the sheet
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional additional CSS class for the component
	 */
	className?: string;
}

/**
 * Sheet component that contains the ShiftCreationWizard
 * Provides a slide-in panel interface for creating new shifts
 */
export function ShiftCreationSheet({
	scheduleId,
	organizationId,
	initialDate,
	initialLocationId,
	onShiftCreated,
	trigger,
	className,
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
			<SheetContent
				className={cn(
					"sm:max-w-[550px] p-0 flex flex-col h-[100dvh]",
					className
				)}
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0 flex items-center">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						<SheetTitle>Create New Shift</SheetTitle>
					</div>
				</SheetHeader>
				<div className="flex-1 overflow-hidden">
					<ShiftCreationWizard
						scheduleId={scheduleId}
						organizationId={organizationId}
						initialDate={initialDate}
						initialLocationId={initialLocationId}
						onComplete={handleComplete}
						onCancel={() => setOpen(false)}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
