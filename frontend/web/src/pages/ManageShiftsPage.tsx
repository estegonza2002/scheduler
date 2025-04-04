import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Filter, Plus, Users, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format, parseISO, isToday, isTomorrow, isAfter } from "date-fns";
import {
	ShiftsAPI,
	LocationsAPI,
	OrganizationsAPI,
	EmployeesAPI,
	ShiftAssignmentsAPI,
} from "@/api";
import {
	Shift,
	Location,
	Organization,
	Employee,
	ShiftAssignment,
} from "@/api/types";
import { ShiftCard } from "@/components/ShiftCard";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function ManageShiftsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { updateHeader } = useHeader();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
	const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [employeesByShift, setEmployeesByShift] = useState<
		Record<string, Employee[]>
	>({});
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [loadingMessage, setLoadingMessage] = useState<string>("Loading data");
	const [error, setError] = useState<string | null>(null);
	const [shiftsChannel, setShiftsChannel] = useState<RealtimeChannel | null>(
		null
	);
	const [assignmentsChannel, setAssignmentsChannel] =
		useState<RealtimeChannel | null>(null);

	// Function to reload data
	const loadData = async () => {
		try {
			// Get organization ID from state or URL
			const orgId =
				organization?.id || searchParams.get("organizationId") || "";

			if (orgId) {
				// Load shifts
				const shifts = await ShiftsAPI.getRegularShifts(orgId);
				console.log(`Loaded ${shifts.length} shifts`);

				// Separate shifts for today and upcoming
				const today_shifts = shifts.filter((shift) =>
					isToday(parseISO(shift.start_time))
				);

				const upcoming_shifts = shifts.filter(
					(shift) =>
						isAfter(parseISO(shift.start_time), new Date()) &&
						!isToday(parseISO(shift.start_time))
				);

				setTodayShifts(today_shifts);
				setUpcomingShifts(upcoming_shifts);

				// Load employees
				const employees = await EmployeesAPI.getAll(orgId);
				setEmployees(employees);
				console.log(`Loaded ${employees.length} employees`);

				// Load assignments
				const assignments = await ShiftAssignmentsAPI.getAll();
				console.log(`Loaded ${assignments.length} shift assignments`);

				// Create employee mapping
				const employeeMapping: Record<string, Employee[]> = {};

				// Initialize with empty arrays for all shifts
				shifts.forEach((shift) => {
					employeeMapping[shift.id] = [];
				});

				// Process assignments
				for (const assignment of assignments) {
					const shiftId = assignment.shift_id;
					const employeeId = assignment.employee_id;

					// Find the employee by ID
					const employee = employees.find((emp) => emp.id === employeeId);
					if (employee && employeeMapping[shiftId]) {
						if (
							!employeeMapping[shiftId].some((emp) => emp.id === employee.id)
						) {
							console.log(
								`Adding employee ${employee.name} to shift ${shiftId}`
							);
							employeeMapping[shiftId].push(employee);
						}
					}
				}

				// Debug: Log assignments for each shift
				Object.keys(employeeMapping).forEach((shiftId) => {
					const assignedEmps = employeeMapping[shiftId];
					if (assignedEmps.length > 0) {
						console.log(
							`Shift ${shiftId} has ${assignedEmps.length} employees:`,
							assignedEmps.map((e) => e.name).join(", ")
						);
					}
				});

				setEmployeesByShift(employeeMapping);
			} else {
				console.error("No organization ID available for data reload");
			}
		} catch (error) {
			console.error("Error loading data:", error);
		}
	};

	// Setup Supabase real-time subscriptions
	const setupRealtimeSubscriptions = (orgId: string) => {
		// Unsubscribe from any existing channels
		if (shiftsChannel) {
			shiftsChannel.unsubscribe();
		}

		if (assignmentsChannel) {
			assignmentsChannel.unsubscribe();
		}

		// Subscribe to shifts table changes
		const shiftsSubscription = supabase
			.channel("shifts-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "shifts",
					filter: `organization_id=eq.${orgId}`,
				},
				(payload) => {
					console.log("Shifts change received!", payload);
					// Reload data when shifts change
					loadData();
				}
			)
			.subscribe((status) => {
				console.log("Shifts subscription status:", status);
			});

		// Subscribe to shift_assignments table changes
		const assignmentsSubscription = supabase
			.channel("shift-assignments-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "shift_assignments",
				},
				(payload) => {
					console.log("Shift assignments change received!", payload);
					// Reload data when assignments change
					loadData();
				}
			)
			.subscribe((status) => {
				console.log("Shift assignments subscription status:", status);
			});

		// Save the channel references for cleanup
		setShiftsChannel(shiftsSubscription);
		setAssignmentsChannel(assignmentsSubscription);
	};

	// Get parameters from URL
	const organizationId = searchParams.get("organizationId") || "";
	const locationId = searchParams.get("locationId");

	// Setup header
	useEffect(() => {
		updateHeader({
			title: "Manage Shifts",
			description: "Create, view, and manage all your shifts",
			actions: (
				<>
					<Button
						variant="outline"
						onClick={() =>
							navigate(`/past-shifts?organizationId=${organizationId}`)
						}
						className="h-9 mr-2">
						<History className="h-4 w-4 mr-2" />
						Past Shifts
					</Button>
					<Button
						onClick={() =>
							navigate(
								`/shifts/create?organizationId=${organizationId}&returnUrl=/manage-shifts`
							)
						}
						className="h-9">
						<Plus className="h-4 w-4 mr-2" />
						Create Shift
					</Button>
				</>
			),
		});
	}, [updateHeader, navigate, organizationId]);

	// Initial data fetch
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setLoadingMessage("Loading shifts");

				console.log("Fetching organizations...");
				const userOrganizations = await OrganizationsAPI.getAll();
				if (userOrganizations.length === 0) {
					throw new Error("No organizations found");
				}

				// Use organization ID from URL or default to first org
				const orgIdFromUrl = searchParams.get("organizationId");
				let useOrgId = orgIdFromUrl || userOrganizations[0].id;

				console.log(`Using organization ID: ${useOrgId}`);
				setOrganization(
					userOrganizations.find((org) => org.id === useOrgId) ||
						userOrganizations[0]
				);

				setLoadingMessage("Loading locations");
				const allLocations = await LocationsAPI.getAll(useOrgId);
				setLocations(allLocations);
				console.log(`Loaded ${allLocations.length} locations`);

				// Load data
				await loadData();

				// Set up real-time subscriptions
				setupRealtimeSubscriptions(useOrgId);

				// Set loading to false only after all initial data is fetched and processed
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError(
					error instanceof Error ? error.message : "Failed to load data"
				);
				setIsLoading(false);
			}
		};

		fetchData();

		// Cleanup function to unsubscribe from channels when component unmounts
		return () => {
			if (shiftsChannel) {
				shiftsChannel.unsubscribe();
			}
			if (assignmentsChannel) {
				assignmentsChannel.unsubscribe();
			}
		};
	}, [navigate, searchParams]);

	return (
		<ContentContainer>
			{/* Today's Shifts Section */}
			<ContentSection
				title="Today's Shifts"
				description="Shifts scheduled for today"
				headerActions={
					<Button
						variant="outline"
						className="h-9">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
				}
				className="mb-8">
				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Skeleton
								key={i}
								className="h-48"
							/>
						))}
					</div>
				) : todayShifts.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{todayShifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								locationName={
									locations.find((l) => l.id === shift.location_id)?.name ||
									"Unassigned"
								}
								assignedEmployees={employeesByShift[shift.id] || []}
								showLocationName={true}
								isLoading={false}
							/>
						))}
					</div>
				) : (
					<EmptyState
						title="No shifts scheduled for today"
						description="Create a shift for today to get started"
						action={
							<Button
								onClick={() =>
									navigate(
										`/shifts/create?organizationId=${organizationId}&returnUrl=/manage-shifts`
									)
								}>
								<Plus className="h-4 w-4 mr-2" />
								Create Shift
							</Button>
						}
					/>
				)}
			</ContentSection>

			{/* Upcoming Shifts Section */}
			<ContentSection
				title="Upcoming Shifts"
				description="Shifts scheduled for the future"
				headerActions={
					<Button
						variant="outline"
						className="h-9">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
				}>
				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Skeleton
								key={i}
								className="h-48"
							/>
						))}
					</div>
				) : upcomingShifts.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{upcomingShifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								locationName={
									locations.find((l) => l.id === shift.location_id)?.name ||
									"Unassigned"
								}
								assignedEmployees={employeesByShift[shift.id] || []}
								showLocationName={true}
								isLoading={false}
							/>
						))}
					</div>
				) : (
					<EmptyState
						title="No upcoming shifts"
						description="Create a shift for the future to get started"
						action={
							<Button
								onClick={() =>
									navigate(
										`/shifts/create?organizationId=${organizationId}&returnUrl=/manage-shifts`
									)
								}>
								<Plus className="h-4 w-4 mr-2" />
								Create Shift
							</Button>
						}
					/>
				)}
			</ContentSection>
		</ContentContainer>
	);
}
