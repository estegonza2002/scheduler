import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftCreationWizard } from "./ShiftCreationWizard";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Props for the ShiftCreationDialog component
 */
interface ShiftCreationDialogProps {
	/**
	 * Whether the dialog is currently open (optional for uncontrolled usage)
	 */
	open?: boolean;
	/**
	 * Function to call when the dialog should be closed (optional for uncontrolled usage)
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
 * Dialog component for creating new shifts
 */
export function ShiftCreationDialog({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	scheduleId,
	organizationId,
	initialDate,
	initialLocationId,
	onComplete,
	trigger,
	className,
}: ShiftCreationDialogProps) {
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
		console.log("ShiftCreationDialog: handleComplete called");
		if (onOpenChange) {
			console.log("ShiftCreationDialog: Closing dialog");
			onOpenChange(false);
		}
		if (onComplete) {
			console.log("ShiftCreationDialog: Calling onComplete callback");
			onComplete();
		}
	};

	// Handle cancel
	const handleCancel = () => {
		if (onOpenChange) {
			onOpenChange(false);
		}
	};

	// Reset state when dialog opens/closes
	useEffect(() => {
		if (!open) {
			// Reset state after dialog closes with a delay to prevent visual jumps
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
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

			<DialogContent className={className}>
				<DialogHeader>
					<DialogTitle>Create New Shift</DialogTitle>
				</DialogHeader>

				<ShiftCreationWizard
					scheduleId={scheduleId}
					organizationId={organizationId}
					initialDate={initialDate}
					initialLocationId={initialLocationId}
					onComplete={handleComplete}
					onCancel={handleCancel}
					onStateChange={handleWizardStateChange}
				/>
			</DialogContent>
		</Dialog>
	);
}
