import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useHeader } from "@/lib/header-context";
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
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

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
	const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
	const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
		revenue: [],
		staffing: [],
		employeeTypes: [],
		locationPerformance: [],
	});

	// State for real-time subscriptions
	const [employeesChannel, setEmployeesChannel] =
		useState<RealtimeChannel | null>(null);
	const [locationsChannel, setLocationsChannel] =
		useState<RealtimeChannel | null>(null);
	const [shiftsChannel, setShiftsChannel] = useState<RealtimeChannel | null>(
		null
	);

	const navigate = useNavigate();

	// Data fetching function
	const fetchData = useCallback(async () => {
		try {
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

				try {
					// Fetch data in parallel for better performance
					const [fetchedEmployees, locations, schedules] = await Promise.all([
						EmployeesAPI.getAll(orgs[0].id),
						LocationsAPI.getAll(orgs[0].id),
						ShiftsAPI.getAllSchedules(orgs[0].id),
					]);

					console.log("Fetched employees:", fetchedEmployees);
					console.log("Fetched locations:", locations);
					console.log("Fetched schedules:", schedules);

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

					try {
						// Get shifts for all schedules
						const shiftsPromises = schedules.map((schedule) =>
							ShiftsAPI.getShiftsForSchedule(schedule.id)
						);
						const shiftsArrays = await Promise.all(shiftsPromises);
						const allShifts = shiftsArrays.flat();

						console.log("Fetched all shifts:", allShifts);

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
					} catch (shiftsError) {
						console.error("Error fetching shifts:", shiftsError);
					}
				} catch (dataError) {
					console.error("Error fetching related data:", dataError);
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
			setLoadingPhase("");
		}
	}, []);

	// Setup real-time subscriptions
	const setupRealtimeSubscriptions = useCallback(() => {
		if (!organization) {
			console.log("No organization available for subscriptions");
			return;
		}

		const orgId = organization.id;
		console.log("Setting up real-time subscriptions for organization:", orgId);

		// Subscribe to employees table changes
		const employeesSubscription = supabase
			.channel("admin-employees-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "employees",
					filter: `organization_id=eq.${orgId}`,
				},
				(payload) => {
					console.log("Employee change detected:", payload);

					if (payload.eventType === "INSERT") {
						console.log("New employee added:", payload.new);

						// Map snake_case to camelCase
						const newEmployee = {
							id: payload.new.id,
							organizationId: payload.new.organization_id,
							name: payload.new.name,
							email: payload.new.email,
							position: payload.new.position,
							phone: payload.new.phone,
							hireDate: payload.new.hire_date,
							address: payload.new.address,
							emergencyContact: payload.new.emergency_contact,
							notes: payload.new.notes,
							avatar: payload.new.avatar,
							hourlyRate:
								payload.new.hourly_rate !== null
									? parseFloat(payload.new.hourly_rate)
									: undefined,
							status: payload.new.status,
							isOnline: payload.new.is_online,
							lastActive: payload.new.last_active,
						} as Employee;

						// Update employees state
						setEmployees((prev) => [...prev, newEmployee]);
					} else if (payload.eventType === "DELETE") {
						console.log("Employee deleted:", payload.old);
						// Remove deleted employee from state
						setEmployees((prev) =>
							prev.filter((emp) => emp.id !== payload.old.id)
						);
					}
					// We don't need to handle UPDATE here since we're just counting employees
				}
			)
			.subscribe((status) => {
				console.log("Employees subscription status:", status);
			});

		// Subscribe to locations table changes
		const locationsSubscription = supabase
			.channel("admin-locations-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "locations",
					filter: `organization_id=eq.${orgId}`,
				},
				(payload) => {
					console.log("Location change detected:", payload);

					if (payload.eventType === "INSERT") {
						console.log("New location added");
						// Increment location count
						setTotalLocations((prev) => prev + 1);
					} else if (payload.eventType === "DELETE") {
						console.log("Location deleted");
						// Decrement location count
						setTotalLocations((prev) => Math.max(0, prev - 1));
					}
					// We don't need to handle UPDATE here since we're just counting locations
				}
			)
			.subscribe((status) => {
				console.log("Locations subscription status:", status);
			});

		// Subscribe to shifts table changes
		const shiftsSubscription = supabase
			.channel("admin-shifts-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "shifts",
					filter: `organization_id=eq.${orgId}`,
				},
				(payload) => {
					console.log("Shift change detected:", payload);

					// When shifts change, we need to recalculate active and upcoming shifts
					// For simplicity, we'll just refetch data rather than calculating in-memory
					fetchData();
				}
			)
			.subscribe((status) => {
				console.log("Shifts subscription status:", status);
			});

		// Save channel references for cleanup
		setEmployeesChannel(employeesSubscription);
		setLocationsChannel(locationsSubscription);
		setShiftsChannel(shiftsSubscription);
	}, [organization, fetchData]);

	// Initial data load and subscription setup
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Setup subscriptions when organization is available
	useEffect(() => {
		if (organization && !loading) {
			setupRealtimeSubscriptions();
		}

		// Cleanup subscriptions on unmount
		return () => {
			console.log("Cleaning up real-time subscriptions");
			if (employeesChannel) {
				employeesChannel.unsubscribe();
			}
			if (locationsChannel) {
				locationsChannel.unsubscribe();
			}
			if (shiftsChannel) {
				shiftsChannel.unsubscribe();
			}
		};
	}, [organization, loading, setupRealtimeSubscriptions]);

	const handleEmployeesAdded = useCallback((newEmployees: Employee[]) => {
		console.log("Employees added:", newEmployees);
		setEmployees((prev) => [...prev, ...newEmployees]);
	}, []);

	const handleEmployeeAdded = useCallback((newEmployee: Employee) => {
		console.log("Employee added:", newEmployee);
		setEmployees((prev) => [...prev, newEmployee]);
	}, []);

	const handleLocationCreated = useCallback(() => {
		console.log("Location created");
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		// Simple function to update the header based on loading state
		if (loading) {
			updateHeader({
				title: "Loading Dashboard",
				description: "Retrieving your business data",
			});
		} else {
			// Create actions element for non-loading state
			const actions = (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => startOnboarding()}
						className="mr-2">
						<Settings className="h-4 w-4 mr-2" />
						Setup Guide ({getCompletedStepsCount()}/{getTotalStepsCount()})
					</Button>
				</div>
			);

			updateHeader({
				title: "Business Dashboard",
				description: "Manage your business operations and view key metrics",
				actions,
			});
		}
	}, [loading]); // Only depend on loading state, ignore eslint warning with the comment above

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
								open={isEmployeeDialogOpen}
								onOpenChange={setIsEmployeeDialogOpen}
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
										handleEmployeeAdded(newEmployee);
									}
								}}
							/>
						</>
					)}
					{organization && (
						<LocationDialog
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
