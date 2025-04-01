import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Filter, Plus, Users, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format, parseISO, isToday, isTomorrow, isAfter } from "date-fns";
import { ShiftsAPI, LocationsAPI } from "@/api";
import { Shift, Location } from "@/api/types";
import { ShiftCard } from "@/components/ShiftCard";
import type { Employee } from "@/api/types";
import { supabase } from "@/lib/supabase";

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
					<div className="flex items-center justify-center h-48">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
					<div className="flex items-center justify-center h-48">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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

// Placeholder component for empty state
interface EmptyStateProps {
	title: string;
	description: string;
	action: React.ReactNode;
}

function EmptyState({ title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/40">
			<div className="text-center max-w-md">
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground mb-4">{description}</p>
				{action}
			</div>
		</div>
	);
}

// Placeholder component for shift card
interface ShiftCardPlaceholderProps {
	date: string;
	time: string;
	location: string;
	employees: number;
	status?: "Scheduled" | "Completed";
	onClick?: () => void;
}

function ShiftCardPlaceholder({
	date,
	time,
	location,
	employees,
	status = "Scheduled",
	onClick,
}: ShiftCardPlaceholderProps) {
	return (
		<Card
			className="p-4 hover:shadow-md transition-shadow cursor-pointer"
			onClick={onClick}>
			<div className="flex justify-between items-start mb-3">
				<div>
					<div className="font-medium">{location}</div>
					<div className="text-sm text-muted-foreground">{date}</div>
				</div>
				<div>
					{status === "Completed" && (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
							Completed
						</span>
					)}
					{status === "Scheduled" && (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							Scheduled
						</span>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center text-sm">
					<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
					<span>{time}</span>
				</div>

				<div className="flex items-center text-sm">
					<Users className="h-4 w-4 mr-2 text-muted-foreground" />
					<span>{employees} employees</span>
				</div>
			</div>
		</Card>
	);
}
