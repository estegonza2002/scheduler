import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useLayoutEffect,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useLayout } from "@/lib/layout-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Building2,
	Users,
	Calendar,
	ClipboardList,
	Plus,
	PieChart,
	Mail,
	Phone,
	Loader2,
	TrendingUp,
	MapPin,
	Clock,
	AlertCircle,
	CheckCircle2,
	Eye,
	BarChart3,
	CalendarClock,
	UserPlus,
	Settings,
} from "lucide-react";
import {
	Organization,
	OrganizationsAPI,
	EmployeesAPI,
	Employee,
	ShiftsAPI,
	LocationsAPI,
} from "@/api";
import { AddEmployeeDialog } from "@/components/AddEmployeeDialog";
import { EmployeeDetailDialog } from "@/components/EmployeeDetailDialog";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import {
	BarChart,
	Chart,
	LineChart,
	PieChart as ChartPieChart,
} from "@/components/ui/charts";
import { FormulaExplainer } from "@/components/ui/formula-explainer";
import { EmployeeSheet } from "@/components/EmployeeSheet";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import { LocationCreationSheet } from "@/components/LocationCreationSheet";
import { useOnboarding } from "@/lib/onboarding-context";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { OnboardingReminder } from "@/components/onboarding/OnboardingReminder";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";

// Extended organization type for UI display purposes
interface ExtendedOrganization extends Organization {
	subscription_plan: "free" | "pro" | "business";
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
	const [weeklyStats, setWeeklyStats] = useState({
		revenue: [
			{ name: "Mon", value: 1200 },
			{ name: "Tue", value: 1800 },
			{ name: "Wed", value: 1400 },
			{ name: "Thu", value: 2100 },
			{ name: "Fri", value: 2400 },
			{ name: "Sat", value: 1900 },
			{ name: "Sun", value: 1100 },
		],
		staffing: [
			{ name: "Mon", value: 12 },
			{ name: "Tue", value: 14 },
			{ name: "Wed", value: 10 },
			{ name: "Thu", value: 15 },
			{ name: "Fri", value: 18 },
			{ name: "Sat", value: 20 },
			{ name: "Sun", value: 8 },
		],
		employeeTypes: [
			{ name: "Full-time", value: 12 },
			{ name: "Part-time", value: 18 },
			{ name: "Contract", value: 6 },
		],
		locationPerformance: [
			{ name: "Downtown", value: 4200 },
			{ name: "Uptown", value: 3100 },
			{ name: "West End", value: 2800 },
			{ name: "East Side", value: 3600 },
		],
	});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setLoadingPhase("organization");
				// In a real implementation, we would get the user's organization
				// For now, we'll use the first organization from the mock data
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
				<Tabs defaultValue="overview">
					<div className="flex justify-between items-center mb-4">
						<TabsList className="w-auto">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="reports">Reports</TabsTrigger>
						</TabsList>

						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate("/business-profile")}>
								<Building2 className="h-4 w-4 mr-2" />
								Business Settings
							</Button>
						</div>
					</div>

					<TabsContent value="overview">
						{/* Quick Actions Section */}
						<ContentSection
							title="Quick Actions"
							description="Common tasks you might want to perform"
							className="mb-6">
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

								{organization && currentSchedule && (
									<ShiftCreationSheet
										scheduleId={currentSchedule}
										organizationId={organization.id}
										initialDate={new Date()}
										trigger={
											<Button
												variant="outline"
												className="h-24 flex flex-col items-center justify-center w-full gap-2 text-sm hover:border-primary hover:text-primary">
												<CalendarClock className="h-6 w-6" />
												<span>Create Shift</span>
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
							</div>
						</ContentSection>

						{/* Organization Key Metrics */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{/* Employees Card */}
							<ContentSection
								flat
								title="Employees"
								className="relative overflow-hidden"
								contentClassName="pt-0"
								headerActions={
									<TooltipProvider>{renderOnboardingStatus()}</TooltipProvider>
								}>
								<div className="flex items-end justify-between">
									<div>
										<div className="text-2xl font-bold">{employees.length}</div>
										<p className="text-xs text-muted-foreground">
											Active employees on your payroll
										</p>
									</div>
									<div className="text-xs text-muted-foreground">
										{organization?.subscription_plan === "free" && (
											<div className="flex items-center">
												<AlertCircle className="h-3 w-3 mr-1" />
												<span>Free limit: 5</span>
											</div>
										)}
									</div>
								</div>
							</ContentSection>

							{/* Active Shifts Card */}
							<ContentSection
								flat
								title="Active Shifts"
								className="relative overflow-hidden"
								contentClassName="pt-0">
								<div className="flex items-end justify-between">
									<div>
										<div className="text-2xl font-bold">{activeShifts}</div>
										<p className="text-xs text-muted-foreground">
											Shifts currently in progress
										</p>
									</div>
								</div>
							</ContentSection>

							{/* Upcoming Shifts Card */}
							<ContentSection
								flat
								title="Upcoming Shifts"
								className="relative overflow-hidden"
								contentClassName="pt-0">
								<div className="flex items-end justify-between">
									<div>
										<div className="text-2xl font-bold">{upcomingShifts}</div>
										<p className="text-xs text-muted-foreground">
											Shifts scheduled in the future
										</p>
									</div>
								</div>
							</ContentSection>

							{/* Locations Card */}
							<ContentSection
								flat
								title="Locations"
								className="relative overflow-hidden"
								contentClassName="pt-0">
								<div className="flex items-end justify-between">
									<div>
										<div className="text-2xl font-bold">{totalLocations}</div>
										<p className="text-xs text-muted-foreground">
											Active location sites
										</p>
									</div>
									<div className="text-xs text-muted-foreground">
										{organization?.subscription_plan === "free" && (
											<div className="flex items-center">
												<AlertCircle className="h-3 w-3 mr-1" />
												<span>Free limit: 2</span>
											</div>
										)}
									</div>
								</div>
							</ContentSection>
						</div>

						{/* Business Performance Charts */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<ContentSection
								title="Weekly Revenue"
								description="Last 7 days performance"
								contentClassName="px-4 py-3"
								headerActions={
									<FormulaExplainer
										formula="Weekly Revenue = Σ(Hours Worked × Employee Billing Rate) for current week"
										description="The total revenue generated from all shifts in the current week."
										example="If Employee A (billed at $30/hr) worked 20 hours and Employee B (billed at $35/hr) worked 15 hours, Weekly Revenue = (20 × $30) + (15 × $35) = $600 + $525 = $1,125."
										variantColor="blue"
									/>
								}>
								<BarChart data={weeklyStats.revenue} />
							</ContentSection>

							<ContentSection
								title="Staff Distribution"
								description="By employment type"
								contentClassName="px-4 py-3"
								headerActions={
									<FormulaExplainer
										formula="Staff Distribution Percentage = (Count of Staff in Category / Total Staff) × 100%"
										description="The breakdown of your workforce by employment type."
										example="If you have 36 total employees with 12 full-time, 18 part-time, and 6 contract workers, the distribution would be: Full-time: (12/36) × 100% = 33.3%, Part-time: (18/36) × 100% = 50%, Contract: (6/36) × 100% = 16.7%."
										variantColor="green"
									/>
								}>
								<ChartPieChart data={weeklyStats.employeeTypes} />
							</ContentSection>
						</div>

						{/* Alerts and Notifications */}
						<ContentSection
							title="Attention Required"
							className="mb-6"
							contentClassName="pt-2">
							<div className="space-y-4">
								<div className="flex items-start gap-3 p-3 bg-white rounded-md border">
									<AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
									<div>
										<p className="font-medium text-red-700">Staffing Alert</p>
										<p className="text-sm text-red-600 mb-2">
											Downtown location is understaffed for the evening shift
											(6pm-10pm).
										</p>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="destructive">
												Assign Staff
											</Button>
										</div>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 bg-white rounded-md border">
									<AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
									<div>
										<p className="font-medium text-amber-700">
											Schedule Update
										</p>
										<p className="text-sm text-amber-600 mb-2">
											3 employees have requested time off for next week.
										</p>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline">
												View Requests
											</Button>
										</div>
									</div>
								</div>
							</div>
						</ContentSection>
					</TabsContent>

					<TabsContent value="reports">
						{/* Reports content */}
						<ContentSection
							title="Weekly Reports"
							description="These reports show key metrics from the past week to help you understand your business performance."
							flat>
							<div className="text-muted-foreground text-sm">
								No reports available for the current period.
							</div>
						</ContentSection>
					</TabsContent>
				</Tabs>
			</ContentContainer>
		</>
	);
}
