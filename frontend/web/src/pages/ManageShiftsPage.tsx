import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Filter, Plus, Users, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format, parseISO, isToday, isTomorrow, isAfter } from "date-fns";
import { ShiftsAPI, LocationsAPI } from "@/api";
import { Shift, Location } from "@/api/types";
import { ShiftCard } from "@/components/ShiftCard";
import type { Employee } from "@/api/types";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

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

	// Fetch shifts
	useEffect(() => {
		const fetchShifts = async () => {
			try {
				setIsLoading(true);
				const today = new Date();

				console.log("Fetching shifts for organization:", organizationId);

				// Get all shifts directly from supabase instead of using getAllSchedules
				// which only returns schedules (is_schedule=true)
				const { data: allShifts, error } = await supabase
					.from("shifts")
					.select("*")
					.eq("organization_id", organizationId)
					.eq("is_schedule", false);

				if (error) {
					throw error;
				}

				console.log("All shifts fetched:", allShifts);

				if (!allShifts) {
					setTodayShifts([]);
					setUpcomingShifts([]);
					setIsLoading(false);
					return;
				}

				// Separate shifts for today and upcoming
				const today_shifts = allShifts.filter((shift) =>
					isToday(parseISO(shift.start_time))
				);
				console.log("Today's shifts:", today_shifts);

				const upcoming_shifts = allShifts.filter(
					(shift) =>
						isAfter(parseISO(shift.start_time), today) &&
						!isToday(parseISO(shift.start_time))
				);
				console.log("Upcoming shifts:", upcoming_shifts);

				setTodayShifts(today_shifts);
				setUpcomingShifts(upcoming_shifts);

				// Collect all location IDs
				const locationIds = new Set<string>();
				allShifts.forEach((shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
					}
				});
				console.log("Location IDs to fetch:", Array.from(locationIds));

				// Fetch all needed locations
				const locationsArray: Location[] = [];
				for (const locId of locationIds) {
					const location = await LocationsAPI.getById(locId);
					if (location) {
						locationsArray.push(location);
					}
				}
				console.log("Locations fetched:", locationsArray);
				setLocations(locationsArray);

				// For now, we're not fetching real employees
				// This would be implemented with an EmployeesAPI call
				setEmployees([]);

				// For now we're just creating empty arrays for each shift
				const employeeMapping: Record<string, Employee[]> = {};
				allShifts.forEach((shift) => {
					employeeMapping[shift.id] = [];
				});
				setEmployeesByShift(employeeMapping);
			} catch (error) {
				console.error("Error fetching shifts:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchShifts();
	}, [organizationId, locationId]);

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
