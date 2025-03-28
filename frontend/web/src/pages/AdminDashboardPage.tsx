import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useLayout } from "@/lib/layout-context";
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
	OrganizationsAPI,
	EmployeesAPI,
	Employee,
	ShiftsAPI,
	LocationsAPI,
} from "@/api";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { EmployeeSheet } from "@/components/EmployeeSheet";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import { LocationCreationSheet } from "@/components/LocationCreationSheet";
import { useOnboarding } from "@/lib/onboarding-context";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { OnboardingReminder } from "@/components/onboarding/OnboardingReminder";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Calendar } from "lucide-react";

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
	const {} = useLayout();
	const {
		onboardingState,
		startOnboarding,
		getCompletedStepsCount,
		getTotalStepsCount,
	} = useOnboarding();
	const [organization, setOrganization] = useState<ExtendedOrganization | null>(
		null
	);
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
	const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
		revenue: [],
		staffing: [],
		employeeTypes: [],
		locationPerformance: [],
	});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setLoadingPhase("organization");
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					// Add subscription_plan for display purposes
					const orgWithPlan = {
						...orgs[0],
						subscription_plan: "free" as const,
					};
					setOrganization(orgWithPlan);
					setLoadingPhase("employees");

					// Fetch data in parallel for better performance
					const [fetchedEmployees, locations, schedules] = await Promise.all([
						EmployeesAPI.getAll(orgs[0].id),
						LocationsAPI.getAll(orgs[0].id),
						ShiftsAPI.getAllSchedules(orgs[0].id),
					]);

					setEmployees(fetchedEmployees);
					setTotalLocations(locations.length);

					// Get current schedule for shift creation
					if (schedules.length > 0) {
						// Find the most recent schedule
						const latestSchedule = schedules.reduce((latest, current) => {
							return new Date(current.start_time) > new Date(latest.start_time)
								? current
								: latest;
						}, schedules[0]);

						setCurrentSchedule(latestSchedule.id);
					}

					// Get shifts for all schedules
					const shiftsPromises = schedules.map((schedule) =>
						ShiftsAPI.getShiftsForSchedule(schedule.id)
					);
					const shiftsArrays = await Promise.all(shiftsPromises);
					const allShifts = shiftsArrays.flat();

					// Calculate active and upcoming shifts
					const now = new Date();
					const active = allShifts.filter(
						(shift) =>
							new Date(shift.start_time) <= now &&
							new Date(shift.end_time) >= now
					).length;

					const upcoming = allShifts.filter(
						(shift) => new Date(shift.start_time) > now
					).length;

					setActiveShifts(active);
					setUpcomingShifts(upcoming);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, []);

	const handleEmployeesAdded = useCallback((newEmployees: Employee[]) => {
		setEmployees((prev) => [...prev, ...newEmployees]);
	}, []);

	const handleEmployeeAdded = useCallback((newEmployee: Employee) => {
		setEmployees((prev) => [...prev, newEmployee]);
	}, []);

	const handleLocationCreated = useCallback(() => {
		// Increment the location count
		setTotalLocations((prev) => prev + 1);
	}, []);

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

	if (loading) {
		return (
			<>
				<PageHeader
					title="Loading Dashboard"
					description="Retrieving your business data"
				/>
				<ContentContainer>{renderLoadingState()}</ContentContainer>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Business Dashboard"
				description="Manage your business operations and view key metrics"
				actions={
					<>
						<Button
							variant="outline"
							onClick={() => startOnboarding()}
							className="mr-2">
							<Settings className="h-4 w-4 mr-2" />
							Setup Guide ({getCompletedStepsCount()}/{getTotalStepsCount()})
						</Button>
						<Button onClick={() => navigate("/schedule/create")}>
							<Plus className="h-4 w-4 mr-2" />
							Create Schedule
						</Button>
					</>
				}
			/>

			<ContentContainer>
				<OnboardingReminder />

				{/* Quick Actions Section */}
				<ContentSection
					title="Quick Actions"
					description="Common tasks you might want to perform"
					className="mb-6 mt-6">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{organization && (
							<EmployeeSheet
								organizationId={organization.id}
								onEmployeeUpdated={handleEmployeeAdded}
								trigger={
									<Button
										variant="outline"
										className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary">
										<UserPlus className="h-6 w-6" />
										<span>Add Employee</span>
									</Button>
								}
							/>
						)}
						{organization && (
							<LocationCreationSheet
								organizationId={organization.id}
								onLocationCreated={handleLocationCreated}
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
							<ShiftCreationSheet
								scheduleId={currentSchedule || "sch-6"}
								organizationId={organization.id}
								initialDate={new Date()}
								trigger={
									<Button
										variant="outline"
										className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary">
										<CalendarClock className="h-6 w-6" />
										<span>Schedule Shift</span>
									</Button>
								}
							/>
						)}
					</div>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
