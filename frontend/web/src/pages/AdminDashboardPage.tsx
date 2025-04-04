import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useHeader } from "@/lib/header-context";
import { useOrganization } from "@/lib/organization";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Plus,
	MapPin,
	CheckCircle2,
	CalendarClock,
	UserPlus,
	Settings,
	Sparkles,
	AlertCircle,
} from "lucide-react";
import {
	Organization,
	EmployeesAPI,
	Employee,
	ShiftsAPI,
	Shift,
	LocationsAPI,
	Location,
} from "@/api";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { EmployeeDialog } from "@/components/EmployeeDialog";
import { ShiftCreationDialog } from "@/components/ShiftCreationDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { useOnboarding } from "@/lib/onboarding-context";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { OnboardingReminder } from "@/components/onboarding/OnboardingReminder";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Calendar } from "lucide-react";
import { FragmentFix } from "@/components/ui/fragment-fix";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
	collection,
	query,
	where,
	onSnapshot,
	Timestamp,
} from "firebase/firestore";
import { mapDocToEmployee, mapDocToShift } from "@/api/real/api";

// Extended organization type for UI display purposes
interface ExtendedOrganization extends Organization {
	subscription_plan: "free" | "pro" | "business";
}

// TODO: Replace with real analytics types from analytics integration
interface WeeklyStats {
	revenue: { name: string; value: number }[];
	staffing: { name: string; value: number }[];
	employeeTypes: { name: string; value: number }[];
	locationPerformance: { name: string; value: number }[];
}

export default function AdminDashboardPage() {
	const { user } = useAuth();
	const { updateHeader } = useHeader();
	const { organization: orgFromContext, isLoading: isOrgLoading } =
		useOrganization();
	const {
		onboardingState,
		startOnboarding,
		getCompletedStepsCount,
		getTotalStepsCount,
	} = useOnboarding();
	const organization = useMemo(() => {
		if (!orgFromContext) return null;
		return {
			...orgFromContext,
			subscription_plan: (orgFromContext.subscriptionPlan || "free") as
				| "free"
				| "pro"
				| "business",
		};
	}, [orgFromContext]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [viewMode, setViewMode] = useState<"card" | "list">("card");
	const [selectedOrganization, setSelectedOrganization] = useState<string>("");
	const [activeShifts, setActiveShifts] = useState(0);
	const [upcomingShifts, setUpcomingShifts] = useState(0);
	const [totalLocations, setTotalLocations] = useState(0);
	const [currentSchedule, setCurrentSchedule] = useState<string>(""); // For shift creation
	const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
	const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
		revenue: [],
		staffing: [],
		employeeTypes: [],
		locationPerformance: [],
	});

	const navigate = useNavigate();

	// Initial data load and real-time listeners setup
	useEffect(() => {
		if (isOrgLoading || !orgFromContext) {
			console.log("AdminDashboardPage: Waiting for organization context...");
			setLoading(isOrgLoading);
			return;
		}

		const currentOrgId = orgFromContext.id;

		// Initial Fetch
		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch initial data - employees, locations, schedules (maybe shifts)
				// Note: Listeners will handle updates, so maybe initial shift fetch isn't needed?
				// Keeping initial fetch for now for faster load.
				const [fetchedEmployees, locations, schedules] = await Promise.all([
					EmployeesAPI.getAll(currentOrgId),
					LocationsAPI.getAll(currentOrgId),
					ShiftsAPI.getAllSchedules(currentOrgId), // Only get schedules initially
				]);
				setEmployees(fetchedEmployees);
				setTotalLocations(locations.length);

				// Set current schedule ID (used by dialogs)
				if (schedules.length > 0) {
					const latestSchedule = schedules.reduce((latest, current) => {
						return new Date(current.startTime) > new Date(latest.startTime)
							? current
							: latest;
					}, schedules[0]);
					setCurrentSchedule(latestSchedule.id);
				} else {
					setCurrentSchedule("");
				}

				// Shift counts will be handled by the listener
				setActiveShifts(0);
				setUpcomingShifts(0);
			} catch (error) {
				console.error("Error fetching initial dashboard data:", error);
				toast.error("Failed to load initial dashboard data");
				// Reset state on error
				setEmployees([]);
				setTotalLocations(0);
				setActiveShifts(0);
				setUpcomingShifts(0);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		// Setup Firestore Listeners
		console.log(`Setting up Firestore listeners for org: ${currentOrgId}`);

		// Employee listener
		const employeesQuery = query(
			collection(db, "employees"),
			where("organizationId", "==", currentOrgId)
		);
		const unsubscribeEmployees = onSnapshot(
			employeesQuery,
			(snapshot) => {
				console.log("Firestore: Employees snapshot received");
				const updatedEmployees = snapshot.docs.map((doc) =>
					mapDocToEmployee(doc)
				);
				setEmployees(updatedEmployees);
			},
			(error) => {
				console.error("Error listening to employees collection:", error);
				toast.error("Error getting real-time employee updates.");
			}
		);

		// Location listener
		const locationsQuery = query(
			collection(db, "locations"),
			where("organizationId", "==", currentOrgId)
		);
		const unsubscribeLocations = onSnapshot(
			locationsQuery,
			(snapshot) => {
				console.log("Firestore: Locations snapshot received");
				setTotalLocations(snapshot.size);
			},
			(error) => {
				console.error("Error listening to locations collection:", error);
				toast.error("Error getting real-time location updates.");
			}
		);

		// Shift listener (only for counting active/upcoming)
		// We only listen to non-schedule shifts for this count
		const shiftsQuery = query(
			collection(db, "shifts"),
			where("organizationId", "==", currentOrgId),
			where("isSchedule", "==", false)
		);
		const unsubscribeShifts = onSnapshot(
			shiftsQuery,
			(snapshot) => {
				console.log("Firestore: Shifts snapshot received");
				const allShifts = snapshot.docs.map((doc) => mapDocToShift(doc));
				const now = new Date();
				const active = allShifts.filter(
					(shift) =>
						new Date(shift.startTime) <= now && new Date(shift.endTime) >= now
				).length;
				const upcoming = allShifts.filter(
					(shift) => new Date(shift.startTime) > now
				).length;
				setActiveShifts(active);
				setUpcomingShifts(upcoming);
			},
			(error) => {
				console.error("Error listening to shifts collection:", error);
				toast.error("Error getting real-time shift updates.");
			}
		);

		// Cleanup function
		return () => {
			console.log("Cleaning up Firestore listeners");
			unsubscribeEmployees();
			unsubscribeLocations();
			unsubscribeShifts();
		};
	}, [orgFromContext, isOrgLoading]); // Rerun if org changes or loading state finishes

	// Render loading state
	const renderLoadingState = () => {
		return (
			<div className="space-y-6">
				<LoadingState
					type="spinner"
					message="Loading dashboard data..."
					className="py-12"
				/>
			</div>
		);
	};

	// Render onboarding status
	const renderOnboardingStatus = () => {
		const completedCount = getCompletedStepsCount();
		const totalCount = getTotalStepsCount();
		const isComplete = onboardingState.completedSteps.includes("create_shift");
		const percentage = Math.floor((completedCount / totalCount) * 100);

		if (isComplete) {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							className="bg-green-500 hover:bg-green-600 cursor-pointer"
							onClick={startOnboarding}>
							Setup Complete <CheckCircle2 className="h-3 w-3 ml-1" />
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p>Your initial setup is complete! Click to review setup.</p>
					</TooltipContent>
				</Tooltip>
			);
		} else if (completedCount > 0) {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							variant="outline"
							className="cursor-pointer border-amber-500 text-amber-700"
							onClick={startOnboarding}>
							Setup in Progress ({percentage}%)
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p>Continue your onboarding setup</p>
					</TooltipContent>
				</Tooltip>
			);
		} else {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							variant="outline"
							className="cursor-pointer border-blue-500 text-blue-700"
							onClick={startOnboarding}>
							Start Setup
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p>Begin setting up your organization</p>
					</TooltipContent>
				</Tooltip>
			);
		}
	};

	// Update header with title, description, and action buttons
	useEffect(() => {
		updateHeader({
			title: organization
				? `${organization.name} Dashboard`
				: "Admin Dashboard",
			description: "Overview of your organization's activities.",
			actions: [
				<FragmentFix key="actions">
					{renderOnboardingStatus()}
					<Dialog
						open={isEmployeeDialogOpen}
						onOpenChange={setIsEmployeeDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								disabled={isOrgLoading || !organization}>
								<UserPlus className="h-4 w-4 mr-2" /> Add Employee
							</Button>
						</DialogTrigger>
						{organization && (
							<EmployeeDialog
								employee={undefined}
								onSubmit={async (data) => {
									if (organization) {
										const newEmployee = await EmployeesAPI.create({
											...data,
											organizationId: organization.id,
											position: data.position || "Employee",
											status: "invited",
											isOnline: false,
											lastActive: new Date().toISOString(),
										});
										if (newEmployee) {
											setIsEmployeeDialogOpen(false);
										} else {
											toast.error("Failed to add employee.");
										}
									}
								}}
							/>
						)}
					</Dialog>
					{organization && (
						<LocationDialog
							organizationId={organization.id}
							trigger={
								<Button
									variant="outline"
									className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary">
									<MapPin className="h-6 w-6" />
									<span>Create Location</span>
								</Button>
							}
						/>
					)}
					{organization && (
						<Button
							variant="outline"
							className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary"
							onClick={() => {
								navigate(
									`/shifts/create?organizationId=${organization.id}&returnUrl=/admin-dashboard`
								);
							}}>
							<CalendarClock className="h-6 w-6" />
							<span>Schedule Shift</span>
						</Button>
					)}
				</FragmentFix>,
			],
		});
	}, [
		updateHeader,
		organization,
		isOrgLoading,
		onboardingState,
		getCompletedStepsCount,
		getTotalStepsCount,
		isEmployeeDialogOpen,
		startOnboarding,
		navigate,
	]);

	if (loading) {
		return <ContentContainer>{renderLoadingState()}</ContentContainer>;
	}

	return (
		<ContentContainer>
			<OnboardingReminder />

			{/* Quick Actions Section */}
			<ContentSection
				title="Quick Actions"
				description="Common tasks you might want to perform"
				className="mb-6 mt-6">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{organization && (
						<>
							<Button
								variant="outline"
								className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary"
								onClick={() => setIsEmployeeDialogOpen(true)}>
								<UserPlus className="h-6 w-6" />
								<span>Add Employee</span>
							</Button>
							<EmployeeDialog
								employee={undefined}
								onSubmit={async (data) => {
									if (organization) {
										const newEmployee = await EmployeesAPI.create({
											...data,
											organizationId: organization.id,
											position: data.position || "Employee",
											status: "invited",
											isOnline: false,
											lastActive: new Date().toISOString(),
										});
										if (newEmployee) {
											setIsEmployeeDialogOpen(false);
										} else {
											toast.error("Failed to add employee.");
										}
									}
								}}
							/>
						</>
					)}
					{organization && (
						<LocationDialog
							organizationId={organization.id}
							trigger={
								<Button
									variant="outline"
									className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary">
									<MapPin className="h-6 w-6" />
									<span>Create Location</span>
								</Button>
							}
						/>
					)}
					{organization && (
						<Button
							variant="outline"
							className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary"
							onClick={() => {
								navigate(
									`/shifts/create?organizationId=${organization.id}&returnUrl=/admin-dashboard`
								);
							}}>
							<CalendarClock className="h-6 w-6" />
							<span>Schedule Shift</span>
						</Button>
					)}
				</div>
			</ContentSection>

			{/* Stats Overview Section */}
			<ContentSection
				title="Business Overview"
				description="Key metrics for your organization"
				className="mb-6">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Employees
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{employees.length}</div>
							<p className="text-xs text-muted-foreground">
								Active team members
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Locations
							</CardTitle>
							<MapPin className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalLocations}</div>
							<p className="text-xs text-muted-foreground">
								Business locations
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Shifts
							</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{activeShifts}</div>
							<p className="text-xs text-muted-foreground">
								{upcomingShifts} upcoming shifts
							</p>
						</CardContent>
					</Card>
				</div>
			</ContentSection>
		</ContentContainer>
	);
}
