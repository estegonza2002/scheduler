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
	SheetFooter,
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

	// Trigger form submit for steps based on current step
	const triggerContinue = () => {
		if (currentStep === "select-location") {
			// For the location selection, we would normally submit a form
			// but our updated component doesn't have a form submission
			// Instead, we'll manually continue to the next step in the wizard
			const locationId = document.querySelector<HTMLInputElement>(
				'input[name="locationId"]'
			)?.value;
			if (locationId) {
				// We're good to go
				handleWizardStateChange({
					currentStep: "shift-details",
					canContinue,
					isLoading,
					selectedEmployeesCount,
				});
			}
		} else if (currentStep === "shift-details") {
			// Click the submit button in the shift details form
			document
				.querySelector<HTMLButtonElement>(
					'form#shift-details-form button[type="submit"]'
				)
				?.click();
		} else if (currentStep === "assign-employee") {
			// Find and click the create shift button directly
			const createShiftButton = document.querySelector<HTMLButtonElement>(
				"#create-shift-button"
			);

			console.log("Found create shift button:", createShiftButton);

			if (createShiftButton) {
				createShiftButton.click();
			} else {
				console.error("Create shift button not found");
			}
		}
	};

	// Trigger back button based on current step
	const triggerBack = () => {
		if (currentStep === "shift-details") {
			// Click the back button to go from shift details to location selection
			document
				.querySelector<HTMLButtonElement>("#shift-details-back-button")
				?.click();
		} else if (currentStep === "assign-employee") {
			// Click the back button to go from employee assignment to shift details
			document
				.querySelector<HTMLButtonElement>("#employee-assign-back-button")
				?.click();
		}
	};

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
					"w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-6",
					className
				)}>
				<SheetHeader>
					<SheetTitle>Create New Shift</SheetTitle>
				</SheetHeader>

				<div className="flex flex-col h-[calc(100vh-12rem)] mt-4">
					<ShiftCreationWizard
						scheduleId={scheduleId}
						organizationId={organizationId}
						initialDate={initialDate}
						initialLocationId={initialLocationId}
						onComplete={handleComplete}
						onCancel={handleCancel}
						onStateChange={handleWizardStateChange}
						className="flex-1 overflow-hidden"
					/>
				</div>

				<SheetFooter className="flex justify-between border-t mt-4 pt-4">
					{currentStep === "select-location" ? (
						<>
							<Button
								variant="outline"
								onClick={handleCancel}>
								Cancel
							</Button>
							<Button
								onClick={triggerContinue}
								disabled={!canContinue}>
								Continue
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					) : currentStep === "shift-details" ? (
						<>
							<Button
								variant="outline"
								onClick={triggerBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button
								onClick={triggerContinue}
								disabled={!canContinue}>
								Continue
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								onClick={triggerBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button
								onClick={triggerContinue}
								disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating Shift...
									</>
								) : selectedEmployeesCount > 0 ? (
									`Create ${selectedEmployeesCount} ${
										selectedEmployeesCount === 1 ? "Shift" : "Shifts"
									}`
								) : (
									"Create Shift"
								)}
							</Button>
						</>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
