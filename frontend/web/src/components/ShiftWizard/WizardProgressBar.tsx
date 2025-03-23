import { Building2, Clock, Users } from "lucide-react";
import { Button } from "../ui/button";

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
	return (
		<div className="mb-6">
			<div className="flex justify-between mb-2">
				{/* Step 1 */}
				<Button
					type="button"
					variant={currentStep === "select-location" ? "default" : "outline"}
					onClick={() => onStepClick("select-location")}
					disabled={currentStep === "select-location"}>
					<Building2 className="mr-2 h-4 w-4" />
					Location
				</Button>

				{/* Step 2 */}
				<Button
					type="button"
					variant={currentStep === "shift-details" ? "default" : "outline"}
					onClick={() => hasLocationData && onStepClick("shift-details")}
					disabled={!hasLocationData || currentStep === "shift-details"}>
					<Clock className="mr-2 h-4 w-4" />
					Schedule
				</Button>

				{/* Step 3 */}
				<Button
					type="button"
					variant={currentStep === "assign-employee" ? "default" : "outline"}
					onClick={() => hasShiftData && onStepClick("assign-employee")}
					disabled={!hasShiftData || currentStep === "assign-employee"}>
					<Users className="mr-2 h-4 w-4" />
					Employee
				</Button>
			</div>
		</div>
	);
}
