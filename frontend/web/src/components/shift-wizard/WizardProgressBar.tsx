import { Building2, Clock, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { cn } from "../../lib/utils";

export type WizardStep =
	| "select-location"
	| "shift-details"
	| "assign-employee";

interface WizardProgressBarProps {
	currentStep: WizardStep;
	hasLocationData: boolean;
	hasShiftData: boolean;
	onStepClick: (step: WizardStep) => void;
}

export function WizardProgressBar({
	currentStep,
	hasLocationData,
	hasShiftData,
	onStepClick,
}: WizardProgressBarProps) {
	// Calculate progress percentage based on current step
	const getProgressValue = () => {
		switch (currentStep) {
			case "select-location":
				return 33;
			case "shift-details":
				return 66;
			case "assign-employee":
				return 100;
			default:
				return 0;
		}
	};

	return (
		<div className="mb-4">
			{/* Step indicators */}
			<div className="flex justify-between mb-2">
				{/* Step 1 */}
				<Button
					type="button"
					variant="ghost"
					onClick={() => onStepClick("select-location")}
					disabled={currentStep === "select-location"}
					className={cn(
						"text-sm h-8 px-3",
						currentStep === "select-location"
							? "font-medium text-primary"
							: "text-muted-foreground"
					)}>
					1. Location
				</Button>

				{/* Step 2 */}
				<Button
					type="button"
					variant="ghost"
					onClick={() => hasLocationData && onStepClick("shift-details")}
					disabled={!hasLocationData || currentStep === "shift-details"}
					className={cn(
						"text-sm h-8 px-3",
						currentStep === "shift-details"
							? "font-medium text-primary"
							: "text-muted-foreground",
						!hasLocationData && "opacity-50"
					)}>
					2. Schedule
				</Button>

				{/* Step 3 */}
				<Button
					type="button"
					variant="ghost"
					onClick={() => hasShiftData && onStepClick("assign-employee")}
					disabled={!hasShiftData || currentStep === "assign-employee"}
					className={cn(
						"text-sm h-8 px-3",
						currentStep === "assign-employee"
							? "font-medium text-primary"
							: "text-muted-foreground",
						!hasShiftData && "opacity-50"
					)}>
					3. Employee
				</Button>
			</div>

			{/* Progress bar */}
			<Progress
				value={getProgressValue()}
				className="h-1.5"
			/>
		</div>
	);
}
