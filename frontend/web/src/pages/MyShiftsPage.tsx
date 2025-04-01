import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShiftsAPI, LocationsAPI, Shift, Location, Employee } from "@/api";
import { isAfter, isBefore, parseISO, format } from "date-fns";
import { MapPin, Calendar, Briefcase, Clock } from "lucide-react";
import { calculateHours } from "@/utils/time-calculations";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { useHeader } from "@/lib/header-context";
import { ShiftCard } from "@/components/ShiftCard";

export default function MyShiftsPage() {
	const { updateHeader } = useHeader();
	const { user } = useAuth();
	const userId = user?.id;
	const [isLoading, setIsLoading] = useState(true);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const now = new Date();

	// Set the page header
	useEffect(() => {
		updateHeader({
			title: "My Shifts",
			description: "View your current, upcoming, and previous shifts",
		});
	}, [updateHeader]);

	useEffect(() => {
		const fetchUserShifts = async () => {
			if (!userId) return;

			try {
				setIsLoading(true);
				// Fetch shifts for the user using the API's getAll method with filters
				const getAll = (ShiftsAPI as any).getAll;
				const allShifts = await getAll({
					is_schedule: false,
				});
				// Filter for this specific user's shifts
				const userShifts = allShifts.filter(
					(shift: Shift) => shift.user_id === userId
				);
				setShifts(userShifts);

				// Collect all location IDs
				const locationIds = new Set<string>();
				userShifts.forEach((shift: Shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
					}
				});

				// Fetch all needed locations
				const locationsMap: Record<string, Location> = {};
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);
			} catch (error) {
				console.error("Error fetching user shifts:", error);
				toast.error("Failed to load shifts information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserShifts();
	}, [userId]);

	// Filter shifts into current, upcoming, and previous
	const currentShifts = shifts.filter(
		(shift) =>
			isAfter(parseISO(shift.end_time), now) &&
			isBefore(parseISO(shift.start_time), now)
	);

	const upcomingShifts = shifts
		.filter((shift) => isAfter(parseISO(shift.start_time), now))
		.sort(
			(a, b) =>
				parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
		)
		.slice(0, 5); // Get next 5 upcoming shifts

	const previousShifts = shifts
		.filter((shift) => isBefore(parseISO(shift.end_time), now))
		.sort(
			(a, b) =>
				parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime()
		)
		.slice(0, 5); // Get last 5 previous shifts

	// Helper function to get location name
	const getLocationName = (locationId?: string) => {
		if (!locationId) return "Unassigned";
		const locationName = locations[locationId]?.name;
		if (!locationName) {
			console.warn(
				`Location not found with ID: ${locationId}. Available location IDs:`,
				Object.keys(locations)
			);
		}
		return locationName || "Unassigned";
	};

	// Helper function to render a shift card
	const renderShiftCard = (shift: Shift) => {
		// Create an empty array for employees since we don't have that data here
		const emptyEmployees: Employee[] = [];

		return (
			<ShiftCard
				key={shift.id}
				shift={shift}
				locationName={getLocationName(shift.location_id)}
				assignedEmployees={emptyEmployees}
				showLocationName={true}
				isLoading={false}
			/>
		);
	};

	if (isLoading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message="Loading shift information..."
					className="py-8"
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<ContentSection title="My Shifts">
				<div className="space-y-6">
					{/* Current Shifts Section */}
					{currentShifts.length > 0 && (
						<div>
							<h3 className="text-lg font-medium mb-4 flex items-center">
								<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
								Current Shift
							</h3>
							{currentShifts.map(renderShiftCard)}
						</div>
					)}

					{/* Upcoming Shifts Section */}
					<div>
						<h3 className="text-lg font-medium mb-4 flex items-center">
							<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
							Upcoming Shifts
						</h3>
						{upcomingShifts.length > 0 ? (
							upcomingShifts.map(renderShiftCard)
						) : (
							<Card>
								<CardContent className="p-4 text-muted-foreground">
									No upcoming shifts scheduled
								</CardContent>
							</Card>
						)}
					</div>

					{/* Previous Shifts Section */}
					<div>
						<h3 className="text-lg font-medium mb-4 flex items-center">
							<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
							Previous Shifts
						</h3>
						{previousShifts.length > 0 ? (
							previousShifts.map(renderShiftCard)
						) : (
							<Card>
								<CardContent className="p-4 text-muted-foreground">
									No previous shifts found
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</ContentSection>
		</ContentContainer>
	);
}
