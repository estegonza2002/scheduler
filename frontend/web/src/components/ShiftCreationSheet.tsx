import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftCreationWizard } from "./ShiftCreationWizard";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Props for the ShiftCreationSheet component
 */
interface ShiftCreationSheetProps {
	/**
	 * Whether the sheet is currently open (optional for uncontrolled usage)
	 */
	open?: boolean;
	/**
	 * Function to call when the sheet should be closed (optional for uncontrolled usage)
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * ID of the schedule to create a shift for
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
	 * Optional initial location ID
	 */
	initialLocationId?: string;
	/**
	 * Optional function to call on successful shift creation
	 */
	onComplete?: () => void;
	/**
	 * Optional trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional CSS class name
	 */
	className?: string;
}

/**
 * Sheet component for creating new shifts
 */
export function ShiftCreationSheet({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	scheduleId,
	organizationId,
	initialDate,
	initialLocationId,
	onComplete,
	trigger,
	className,
}: ShiftCreationSheetProps) {
	// Internal state for uncontrolled usage
	const [internalOpen, setInternalOpen] = useState(false);

	// Determine if we're in controlled or uncontrolled mode
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

	// State for the wizard's current step and navigation
	const [currentStep, setCurrentStep] = useState<string>("select-location");
	const [canContinue, setCanContinue] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedEmployeesCount, setSelectedEmployeesCount] = useState(0);

	// Handle wizard state changes
	const handleWizardStateChange = (state: {
		currentStep: string;
		canContinue: boolean;
		isLoading: boolean;
		selectedEmployeesCount: number;
	}) => {
		setCurrentStep(state.currentStep);
		setCanContinue(state.canContinue);
		setIsLoading(state.isLoading);
		setSelectedEmployeesCount(state.selectedEmployeesCount);
	};

	// Handle completion
	const handleComplete = () => {
		if (onOpenChange) {
			onOpenChange(false);
		}
		if (onComplete) {
			onComplete();
		}
	};

	// Handle cancel
	const handleCancel = () => {
		if (onOpenChange) {
			onOpenChange(false);
		}
	};

	// Reset state when sheet opens/closes
	useEffect(() => {
		if (!open) {
			// Reset state after sheet closes with a delay to prevent visual jumps
			const timeout = setTimeout(() => {
				setCurrentStep("select-location");
				setCanContinue(false);
				setIsLoading(false);
				setSelectedEmployeesCount(0);
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [open]);

	// Default trigger if none provided
	const defaultTrigger = (
		<Button>
			<Plus className="h-4 w-4 mr-2" />
			Add Shift
		</Button>
	);

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>

			<SheetContent
				className={cn(
					"w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-6 flex flex-col",
					className
				)}>
				<SheetHeader className="mb-4">
					<SheetTitle>Create New Shift</SheetTitle>
				</SheetHeader>

				<ShiftCreationWizard
					scheduleId={scheduleId}
					organizationId={organizationId}
					initialDate={initialDate}
					initialLocationId={initialLocationId}
					onComplete={handleComplete}
					onCancel={handleCancel}
					onStateChange={handleWizardStateChange}
					className="flex-1"
				/>
			</SheetContent>
		</Sheet>
	);
}
