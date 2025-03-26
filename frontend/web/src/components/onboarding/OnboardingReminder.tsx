import { useEffect } from "react";
import { toast } from "sonner";
import { Building2, Users, Calendar, ArrowRight } from "lucide-react";
import { useOnboarding } from "../../lib/onboarding-context";

/**
 * Component that shows toast notifications for incomplete onboarding steps
 * Used on the dashboard to remind users to complete their setup
 */
export function OnboardingReminder() {
	const { onboardingState, startOnboarding } = useOnboarding();

	useEffect(() => {
		// Only show reminders if onboarding is not active (i.e., modal is closed)
		// and user has started but not completed onboarding
		if (
			!onboardingState.isActive &&
			onboardingState.completedSteps.length > 0 &&
			!onboardingState.completedSteps.includes("create_shift")
		) {
			const timer = setTimeout(() => {
				let message = "";
				let icon = null;

				if (!onboardingState.locationCreated) {
					message = "Don't forget to add your first business location";
					icon = <Building2 className="text-primary h-5 w-5" />;
				} else if (!onboardingState.employeesAdded) {
					message = "Next step: Add employees to your organization";
					icon = <Users className="text-primary h-5 w-5" />;
				} else if (!onboardingState.shiftCreated) {
					message = "Final step: Create your first shift schedule";
					icon = <Calendar className="text-primary h-5 w-5" />;
				}

				if (message) {
					toast(
						<div className="flex items-center justify-between w-full">
							<span>{message}</span>
							<button
								onClick={() => {
									startOnboarding();
									toast.dismiss();
								}}
								className="bg-primary text-white px-2 py-1 rounded-md text-xs flex items-center ml-2">
								Continue Setup <ArrowRight className="h-3 w-3 ml-1" />
							</button>
						</div>,
						{
							icon,
							duration: 10000,
							id: "onboarding-reminder",
						}
					);
				}
			}, 3000); // Show reminder 3 seconds after dashboard loads

			return () => clearTimeout(timer);
		}
	}, [
		onboardingState.isActive,
		onboardingState.completedSteps,
		onboardingState.locationCreated,
		onboardingState.employeesAdded,
		onboardingState.shiftCreated,
		startOnboarding,
	]);

	// This component doesn't render anything itself
	return null;
}
