import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { OrganizationsAPI } from "../api";

// Define the steps in the onboarding process
export type OnboardingStep =
	| "welcome"
	| "create_location"
	| "add_employees"
	| "create_shift"
	| "complete";

interface OnboardingState {
	isActive: boolean;
	currentStep: OnboardingStep;
	completedSteps: OnboardingStep[];
	locationCreated: boolean;
	employeesAdded: boolean;
	shiftCreated: boolean;
	organizationId: string | null;
	lastCompletedAt: string | null;
}

interface OnboardingContextType {
	onboardingState: OnboardingState;
	startOnboarding: () => void;
	skipOnboarding: () => void;
	completeStep: (step: OnboardingStep) => void;
	goToStep: (step: OnboardingStep) => void;
	resetOnboarding: () => void;
	isStepCompleted: (step: OnboardingStep) => boolean;
	getCompletedStepsCount: () => number;
	getTotalStepsCount: () => number;
}

const initialState: OnboardingState = {
	isActive: false,
	currentStep: "welcome",
	completedSteps: [],
	locationCreated: false,
	employeesAdded: false,
	shiftCreated: false,
	organizationId: null,
	lastCompletedAt: null,
};

export const OnboardingContext = createContext<
	OnboardingContextType | undefined
>(undefined);

export function useOnboarding() {
	const context = useContext(OnboardingContext);
	if (context === undefined) {
		throw new Error("useOnboarding must be used within an OnboardingProvider");
	}
	return context;
}

export function OnboardingProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, updateUserMetadata } = useAuth();
	const [state, setState] = useState<OnboardingState>(initialState);

	// Check if user is a new operator when they sign in
	useEffect(() => {
		const checkNewUser = async () => {
			if (user) {
				try {
					// Get the user's organization
					const orgs = await OrganizationsAPI.getAll();

					if (orgs.length > 0) {
						// Check if this is a newly created organization (no onboarding state in user metadata)
						const hasCompletedOnboarding =
							user.user_metadata?.onboardingCompleted === true;

						// Load previously completed steps if available
						const previouslyCompletedSteps =
							user.user_metadata?.completedOnboardingSteps || [];

						// Check each step flag
						const locationCreated =
							previouslyCompletedSteps.includes("create_location");
						const employeesAdded =
							previouslyCompletedSteps.includes("add_employees");
						const shiftCreated =
							previouslyCompletedSteps.includes("create_shift");

						// Determine current step based on completed steps
						let currentStep: OnboardingStep = "welcome";
						if (shiftCreated) {
							currentStep = "complete";
						} else if (employeesAdded) {
							currentStep = "create_shift";
						} else if (locationCreated) {
							currentStep = "add_employees";
						} else if (previouslyCompletedSteps.includes("welcome")) {
							currentStep = "create_location";
						}

						if (!hasCompletedOnboarding) {
							setState({
								...initialState,
								isActive: true,
								organizationId: orgs[0].id,
								completedSteps: previouslyCompletedSteps,
								locationCreated,
								employeesAdded,
								shiftCreated,
								currentStep,
								lastCompletedAt:
									user.user_metadata?.onboardingLastCompletedAt || null,
							});
						} else {
							// Still load the completed steps so they can be accessed
							setState({
								...initialState,
								organizationId: orgs[0].id,
								completedSteps: previouslyCompletedSteps,
								locationCreated,
								employeesAdded,
								shiftCreated,
								lastCompletedAt:
									user.user_metadata?.onboardingLastCompletedAt || null,
							});
						}
					}
				} catch (error) {
					console.error("Error checking onboarding status:", error);
				}
			}
		};

		checkNewUser();
	}, [user]);

	const startOnboarding = () => {
		setState({
			...state,
			isActive: true,
			currentStep: "welcome",
		});
	};

	const skipOnboarding = () => {
		setState({
			...state,
			isActive: false,
		});
	};

	const completeStep = async (step: OnboardingStep) => {
		// Add to completed steps if not already there
		const updatedCompletedSteps = state.completedSteps.includes(step)
			? state.completedSteps
			: [...state.completedSteps, step];

		// Update specific flags based on the completed step
		const updates: Partial<OnboardingState> = {
			completedSteps: updatedCompletedSteps,
			lastCompletedAt: new Date().toISOString(),
		};

		if (step === "create_location") {
			updates.locationCreated = true;
		} else if (step === "add_employees") {
			updates.employeesAdded = true;
		} else if (step === "create_shift") {
			updates.shiftCreated = true;
		}

		// Determine next step
		let nextStep: OnboardingStep = state.currentStep;

		if (step === "welcome") {
			nextStep = "create_location";
		} else if (step === "create_location") {
			nextStep = "add_employees";
		} else if (step === "add_employees") {
			nextStep = "create_shift";
		} else if (step === "create_shift") {
			nextStep = "complete";
		}

		// Update state locally
		const newState = {
			...state,
			...updates,
			currentStep: nextStep,
		};

		setState(newState);

		// Persist to user metadata
		if (user) {
			await updateUserMetadata({
				completedOnboardingSteps: updatedCompletedSteps,
				onboardingLastCompletedAt: updates.lastCompletedAt,
				onboardingCurrentStep: nextStep,
				onboardingLocationCreated:
					step === "create_location" ? true : state.locationCreated,
				onboardingEmployeesAdded:
					step === "add_employees" ? true : state.employeesAdded,
				onboardingShiftCreated:
					step === "create_shift" ? true : state.shiftCreated,
			});
		}
	};

	const goToStep = (step: OnboardingStep) => {
		setState({
			...state,
			currentStep: step,
		});
	};

	const resetOnboarding = async () => {
		setState(initialState);

		// Clear onboarding data from user metadata
		if (user) {
			await updateUserMetadata({
				completedOnboardingSteps: [],
				onboardingCompleted: false,
				onboardingCurrentStep: "welcome",
				onboardingLocationCreated: false,
				onboardingEmployeesAdded: false,
				onboardingShiftCreated: false,
			});
		}
	};

	const isStepCompleted = (step: OnboardingStep) => {
		return state.completedSteps.includes(step);
	};

	const getCompletedStepsCount = () => {
		return state.completedSteps.length;
	};

	const getTotalStepsCount = () => {
		// Don't count "complete" as a step since it's just a confirmation screen
		return 4; // welcome, location, employees, shift
	};

	const value = {
		onboardingState: state,
		startOnboarding,
		skipOnboarding,
		completeStep,
		goToStep,
		resetOnboarding,
		isStepCompleted,
		getCompletedStepsCount,
		getTotalStepsCount,
	};

	return (
		<OnboardingContext.Provider value={value}>
			{children}
		</OnboardingContext.Provider>
	);
}
