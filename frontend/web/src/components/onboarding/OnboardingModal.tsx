import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import {
	Building2,
	Users,
	Calendar,
	CheckCircle,
	ChevronRight,
	X,
	Sparkles,
	AlertCircle,
	AlertTriangle,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { useOnboarding, OnboardingStep } from "../../lib/onboarding-context";
import { useAuth } from "../../lib/auth";
import { LocationDialog } from "../LocationDialog";
import { EmployeeDialog } from "../EmployeeDialog";
import { ShiftCreationSheet } from "../ShiftCreationSheet";
import { Badge } from "../ui/badge";
import React from "react";
import { ShiftsAPI, SchedulesAPI, ScheduleCreateInput } from "@/api";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { EmployeesAPI } from "@/api";

/**
 * Onboarding Modal to guide new operators through their initial setup
 */
export function OnboardingModal() {
	const { onboardingState, completeStep, skipOnboarding, isStepCompleted } =
		useOnboarding();
	const { user, updateUserMetadata } = useAuth();
	const navigate = useNavigate();
	const organizationId = useOrganizationId();

	const [locationSheetOpen, setLocationSheetOpen] = useState(false);
	const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
	const [shiftSheetOpen, setShiftSheetOpen] = useState(false);
	const [showCelebration, setShowCelebration] = useState<OnboardingStep | null>(
		null
	);
	const [defaultScheduleId, setDefaultScheduleId] = useState<string | null>(
		null
	);
	const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
	const [scheduleError, setScheduleError] = useState<string | null>(null);

	// Keep modal open while onboarding is active
	const isOpen = onboardingState.isActive;

	// Calculate completed steps percentage
	const totalSteps = 4; // welcome, location, employees, shift
	const completedCount = onboardingState.completedSteps.length;
	const progressPercentage = Math.floor((completedCount / totalSteps) * 100);

	// Fetch schedules when organization ID is available
	useEffect(() => {
		const fetchExistingSchedules = async () => {
			if (!organizationId) return;

			try {
				setIsCreatingSchedule(true);
				setScheduleError(null);

				// Only try to find existing schedules, don't create new ones
				const schedules = await ShiftsAPI.getAllSchedules(organizationId);

				if (schedules && schedules.length > 0) {
					// Use the first schedule found
					setDefaultScheduleId(schedules[0].id);
					console.log("Using existing schedule:", schedules[0].id);
				} else {
					// Just set to null if no schedules found
					setDefaultScheduleId(null);
					console.log("No schedules found during onboarding");
				}
			} catch (error) {
				console.error("Error fetching schedules:", error);
				setScheduleError(
					"Failed to fetch schedules. You can create one manually later."
				);
				setDefaultScheduleId(null);
			} finally {
				setIsCreatingSchedule(false);
			}
		};

		fetchExistingSchedules();
	}, [organizationId]);

	const handleSkipOnboarding = async () => {
		// Mark onboarding as completed in user metadata
		if (user) {
			await updateUserMetadata({ onboardingCompleted: true });
		}

		skipOnboarding();
		toast.success("Welcome to your dashboard! You can complete setup anytime.");
	};

	const handleCompleteOnboarding = async () => {
		// Mark onboarding as completed in user metadata
		if (user) {
			await updateUserMetadata({
				onboardingCompleted: true,
				completedOnboardingSteps: onboardingState.completedSteps,
			});
		}

		// Mark the final step as completed
		completeStep("complete");
		skipOnboarding();
		toast.success(
			"Onboarding completed! You're all set to manage your organization.",
			{
				icon: <Sparkles className="text-yellow-500 h-5 w-5" />,
				duration: 5000,
			}
		);
	};

	const showStepCelebration = (step: OnboardingStep) => {
		setShowCelebration(step);
		setTimeout(() => setShowCelebration(null), 2000);
	};

	const handleLocationCreated = () => {
		completeStep("create_location");
		setLocationSheetOpen(false);
		showStepCelebration("create_location");
		toast.success("Location created successfully!", {
			icon: <CheckCircle className="text-green-500 h-5 w-5" />,
			duration: 3000,
		});
	};

	const handleEmployeesAdded = () => {
		completeStep("add_employees");
		setEmployeeDialogOpen(false);
		showStepCelebration("add_employees");
		toast.success("Employees added successfully!", {
			icon: <CheckCircle className="text-green-500 h-5 w-5" />,
			duration: 3000,
		});
	};

	const handleShiftCreated = () => {
		completeStep("create_shift");
		setShiftSheetOpen(false);
		showStepCelebration("create_shift");
		toast.success("Shift created successfully!", {
			icon: <CheckCircle className="text-green-500 h-5 w-5" />,
			duration: 3000,
		});
	};

	// Step component for welcome section
	const WelcomeStep = () => (
		<div className="text-center py-6">
			<h3 className="text-2xl font-semibold mb-4">
				Welcome to Your Scheduler!
			</h3>
			<p className="text-muted-foreground mb-6">
				Let's set up your organization and get you started with scheduling. This
				will only take a few minutes.
			</p>
			<Button
				onClick={() => completeStep("welcome")}
				className="w-full max-w-xs">
				Begin Setup <ChevronRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);

	// Step component for location creation
	const LocationStep = () => (
		<div className="py-6">
			<div className="flex items-center mb-4">
				<Building2 className="h-6 w-6 text-primary mr-3" />
				<h3 className="text-xl font-semibold">Create Your First Location</h3>
			</div>
			<p className="text-muted-foreground mb-6">
				Add your first business location where your employees will work. You'll
				need this to create shifts.
			</p>
			<Button
				onClick={() => setLocationSheetOpen(true)}
				className="w-full">
				Add Location <ChevronRight className="ml-2 h-4 w-4" />
			</Button>
			{onboardingState.locationCreated && (
				<div className="mt-4 flex items-center text-sm text-green-600">
					<CheckCircle className="h-4 w-4 mr-2" />
					Location created successfully
				</div>
			)}
		</div>
	);

	// Step component for adding employees
	const EmployeeStep = () => (
		<div className="py-6">
			<div className="flex items-center mb-4">
				<Users className="h-6 w-6 text-primary mr-3" />
				<h3 className="text-xl font-semibold">Add Your Employees</h3>
			</div>
			<p className="text-muted-foreground mb-6">
				Add employees to your organization. You can add one employee now or
				import multiple at once.
			</p>
			<Button
				onClick={() => setEmployeeDialogOpen(true)}
				className="w-full">
				Add Employees <ChevronRight className="ml-2 h-4 w-4" />
			</Button>
			{onboardingState.employeesAdded && (
				<div className="mt-4 flex items-center text-sm text-green-600">
					<CheckCircle className="h-4 w-4 mr-2" />
					Employees added successfully
				</div>
			)}
		</div>
	);

	// Step component for creating shifts
	const ShiftStep = () => {
		// Create temporary button ref to programmatically click
		const buttonRef = React.useRef<HTMLButtonElement>(null);

		useEffect(() => {
			// Check if we should automatically trigger open
			if (
				onboardingState.currentStep === "create_shift" &&
				!onboardingState.shiftCreated &&
				buttonRef.current
			) {
				// Focus the button first
				buttonRef.current.focus();
				// Then click it
				setTimeout(() => {
					if (buttonRef.current) {
						buttonRef.current.click();
					}
				}, 500);
			}
		}, [onboardingState.currentStep, onboardingState.shiftCreated]);

		return (
			<div className="py-6">
				<div className="flex items-center mb-4">
					<Calendar className="h-6 w-6 text-primary mr-3" />
					<h3 className="text-xl font-semibold">Create Your First Shift</h3>
				</div>
				<p className="text-muted-foreground mb-6">
					Now that you have a location and employees, let's create your first
					shift. This will be visible on your schedule.
				</p>

				{scheduleError ? (
					<div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
						<div className="flex items-start">
							<AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
							<div>
								<p className="text-sm font-medium text-red-800">
									Error loading schedule
								</p>
								<p className="text-sm text-red-700 mt-1">{scheduleError}</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-2"
									onClick={() => fetchExistingSchedules()}>
									Try Again
								</Button>
							</div>
						</div>
					</div>
				) : isCreatingSchedule ? (
					<div className="flex items-center justify-center py-4">
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
						<span className="text-sm">Preparing schedule...</span>
					</div>
				) : (
					<>
						{defaultScheduleId ? (
							<ShiftCreationSheet
								scheduleId={defaultScheduleId}
								organizationId={organizationId || ""}
								onComplete={handleShiftCreated}
								trigger={
									<Button
										className="w-full"
										ref={buttonRef}>
										Create Shift <ChevronRight className="ml-2 h-4 w-4" />
									</Button>
								}
							/>
						) : (
							<div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
								<div className="flex items-start">
									<AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
									<div>
										<p className="text-sm font-medium text-amber-800">
											No schedule found
										</p>
										<p className="text-sm text-amber-700 mt-1">
											You need to create a schedule first before adding shifts.
										</p>
									</div>
								</div>
							</div>
						)}
					</>
				)}

				{onboardingState.shiftCreated && (
					<div className="mt-4 flex items-center text-sm text-green-600">
						<CheckCircle className="h-4 w-4 mr-2" />
						Shift created successfully
					</div>
				)}
			</div>
		);
	};

	// Function to fetch or create default schedule
	const fetchExistingSchedules = async () => {
		if (!organizationId) return;

		try {
			setIsCreatingSchedule(true);
			setScheduleError(null);

			// Only try to find existing schedules, don't create new ones
			const schedules = await ShiftsAPI.getAllSchedules(organizationId);

			if (schedules && schedules.length > 0) {
				// Use the first schedule found
				setDefaultScheduleId(schedules[0].id);
				console.log("Using existing schedule:", schedules[0].id);
			} else {
				// Just set to null if no schedules found
				setDefaultScheduleId(null);
				console.log("No schedules found during onboarding");
			}
		} catch (error) {
			console.error("Error fetching schedules:", error);
			setScheduleError(
				"Failed to fetch schedules. You can create one manually later."
			);
			setDefaultScheduleId(null);
		} finally {
			setIsCreatingSchedule(false);
		}
	};

	// Step component for completion
	const CompleteStep = () => (
		<div className="text-center py-6">
			<div className="flex flex-col items-center mb-6">
				<div className="relative">
					<div className="rounded-full bg-primary/10 p-3 mb-4">
						<CheckCircle className="h-8 w-8 text-primary" />
					</div>
					<div className="absolute -top-1 -right-1 animate-bounce">
						<Sparkles className="h-5 w-5 text-yellow-500" />
					</div>
				</div>
				<h3 className="text-2xl font-semibold mb-2">All Set!</h3>
				<p className="text-muted-foreground mb-4">
					You've successfully set up your account. You're ready to start
					managing your business.
				</p>
				<div className="w-full max-w-xs bg-muted rounded-lg p-3 mb-4">
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-sm">Create Location</span>
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Add Employees</span>
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Create Shift</span>
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
					</div>
				</div>
			</div>
			<Button
				onClick={handleCompleteOnboarding}
				className="w-full max-w-xs">
				Go to Dashboard
			</Button>
		</div>
	);

	// Progress indicator component
	const ProgressIndicator = () => (
		<div className="border-t px-6 py-3">
			<div className="flex items-center justify-between mb-2">
				<div className="text-sm font-medium">Setup Progress</div>
				<Badge
					variant="outline"
					className="font-normal">
					{progressPercentage}% Complete
				</Badge>
			</div>
			<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
				<div
					className="h-full bg-primary transition-all duration-300"
					style={{ width: `${progressPercentage}%` }}></div>
			</div>
			<div className="flex justify-between mt-2">
				{[
					{
						step: "welcome",
						icon: <CheckCircle className="h-4 w-4" />,
						label: "Start",
					},
					{
						step: "create_location",
						icon: <Building2 className="h-4 w-4" />,
						label: "Location",
					},
					{
						step: "add_employees",
						icon: <Users className="h-4 w-4" />,
						label: "Employees",
					},
					{
						step: "create_shift",
						icon: <Calendar className="h-4 w-4" />,
						label: "Shift",
					},
				].map(({ step, icon, label }) => (
					<div
						key={step}
						className="flex flex-col items-center">
						<div
							className={cn(
								"rounded-full p-1 flex items-center justify-center",
								isStepCompleted(step as OnboardingStep)
									? "bg-primary text-primary-foreground"
									: onboardingState.currentStep === step
									? "bg-primary/20 text-primary border border-primary"
									: "bg-muted text-muted-foreground"
							)}>
							{icon}
						</div>
						<span className="text-xs mt-1">{label}</span>
					</div>
				))}
			</div>
		</div>
	);

	// Step celebration overlay when completing a step
	const StepCelebrationOverlay = () => {
		if (!showCelebration) return null;

		const getCelebrationContent = () => {
			switch (showCelebration) {
				case "create_location":
					return {
						title: "Location Created!",
						icon: <Building2 className="h-8 w-8 text-primary" />,
					};
				case "add_employees":
					return {
						title: "Employees Added!",
						icon: <Users className="h-8 w-8 text-primary" />,
					};
				case "create_shift":
					return {
						title: "Shift Created!",
						icon: <Calendar className="h-8 w-8 text-primary" />,
					};
				default:
					return null;
			}
		};

		const content = getCelebrationContent();
		if (!content) return null;

		return (
			<div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
				<div className="flex flex-col items-center gap-3 transform scale-110 animate-bounce">
					<div className="rounded-full bg-primary/10 p-4">{content.icon}</div>
					<h3 className="text-xl font-semibold">{content.title}</h3>
					<div className="flex gap-1">
						<Sparkles className="h-5 w-5 text-yellow-500" />
						<Sparkles className="h-5 w-5 text-yellow-500" />
						<Sparkles className="h-5 w-5 text-yellow-500" />
					</div>
				</div>
			</div>
		);
	};

	// Render the current step
	const renderCurrentStep = () => {
		switch (onboardingState.currentStep) {
			case "welcome":
				return <WelcomeStep />;
			case "create_location":
				return <LocationStep />;
			case "add_employees":
				return <EmployeeStep />;
			case "create_shift":
				return <ShiftStep />;
			case "complete":
				return <CompleteStep />;
		}
	};

	return (
		<>
			<Dialog
				open={isOpen}
				onOpenChange={() => {}}>
				<DialogContent className="sm:max-w-[550px] overflow-hidden flex flex-col max-h-[90vh]">
					<DialogHeader className="px-6 py-4 border-b flex items-center justify-between">
						<div className="flex flex-col">
							<DialogTitle>Setup Your Organization</DialogTitle>
							{onboardingState.completedSteps.length > 0 &&
								onboardingState.currentStep !== "complete" && (
									<p className="text-xs text-muted-foreground mt-1">
										{completedCount} of {totalSteps} steps completed
									</p>
								)}
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleSkipOnboarding}
							className="h-8 w-8 rounded-full">
							<X className="h-4 w-4" />
						</Button>
					</DialogHeader>

					<ScrollArea className="flex-1 px-6 relative">
						{renderCurrentStep()}
						<StepCelebrationOverlay />
					</ScrollArea>

					<ProgressIndicator />
				</DialogContent>
			</Dialog>

			{/* Additional UI components for each step, opened as needed */}
			<LocationDialog
				organizationId={organizationId || ""}
				open={locationSheetOpen}
				onOpenChange={setLocationSheetOpen}
				onLocationCreated={handleLocationCreated}
				trigger={<Button className="hidden">Add Location</Button>}
			/>

			<EmployeeDialog
				open={employeeDialogOpen}
				onOpenChange={setEmployeeDialogOpen}
				onSubmit={async (data) => {
					try {
						const newEmployee = await EmployeesAPI.create({
							...data,
							organizationId: organizationId || "",
							position: data.position || "Employee",
							status: "invited",
							isOnline: false,
							lastActive: new Date().toISOString(),
						});
						handleEmployeesAdded();
					} catch (error) {
						console.error("Error creating employee:", error);
					}
				}}
			/>
		</>
	);
}
