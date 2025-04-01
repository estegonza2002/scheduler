import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { ShiftCreationWizard } from "@/components/ShiftCreationWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { format } from "date-fns";

/**
 * Page component for creating a new shift
 */
export default function CreateShiftPage() {
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const { scheduleId } = useParams<{ scheduleId: string }>();
	const [searchParams] = useSearchParams();

	// Get parameters from URL
	const organizationId = searchParams.get("organizationId") || "";
	const initialLocationId = searchParams.get("locationId") || undefined;
	const initialDateStr = searchParams.get("date");
	const initialDate = initialDateStr ? new Date(initialDateStr) : new Date();
	const returnUrl = searchParams.get("returnUrl") || "/schedule";

	// State for handling wizard completion
	const [wizardCurrentStep, setWizardCurrentStep] =
		useState<string>("select-location");
	const [isLoading, setIsLoading] = useState(false);

	// Setup header with back button
	useEffect(() => {
		updateHeader({
			title: "Create New Shift",
			description: initialDateStr
				? `for ${format(initialDate, "MMMM d, yyyy")}`
				: "",
			actions: (
				<Button
					variant="outline"
					className="h-9"
					onClick={() => navigate(returnUrl)}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Cancel
				</Button>
			),
		});
	}, [updateHeader, initialDate, initialDateStr, navigate, returnUrl]);

	// Handle completion
	const handleComplete = () => {
		navigate(returnUrl);
	};

	// Handle cancellation
	const handleCancel = () => {
		navigate(returnUrl);
	};

	// Handle wizard state changes
	const handleWizardStateChange = (state: {
		currentStep: string;
		canContinue: boolean;
		isLoading: boolean;
		selectedEmployeesCount: number;
	}) => {
		setWizardCurrentStep(state.currentStep);
		setIsLoading(state.isLoading);
	};

	return (
		<ContentContainer>
			<ContentSection title="Create New Shift">
				<div className="max-w-3xl mx-auto">
					<ShiftCreationWizard
						scheduleId={scheduleId || ""}
						organizationId={organizationId}
						initialDate={initialDate}
						initialLocationId={initialLocationId}
						onComplete={handleComplete}
						onCancel={handleCancel}
						onStateChange={handleWizardStateChange}
						className="mt-4"
					/>
				</div>
			</ContentSection>
		</ContentContainer>
	);
}
