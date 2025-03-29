import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShiftsAPI, LocationsAPI, Shift, Location } from "@/api";
import { isAfter, isBefore, parseISO, format } from "date-fns";
import { MapPin, Calendar, Briefcase, Clock } from "lucide-react";
import { calculateHours } from "@/utils/time-calculations";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";

export default function MyShiftsPage() {
	const { user } = useAuth();
	const userId = user?.id;
	const [isLoading, setIsLoading] = useState(true);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const now = new Date();

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
		return locations[locationId]?.name || "Unknown Location";
	};

	// Helper function to render a shift card
	const renderShiftCard = (shift: Shift) => {
		return (
			<Card
				key={shift.id}
				className="mb-3 hover:shadow-sm transition-all">
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{format(parseISO(shift.start_time), "EEE, MMM d")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{format(parseISO(shift.start_time), "h:mm a")} -{" "}
								{format(parseISO(shift.end_time), "h:mm a")}
								<span className="mx-1">•</span>
								{calculateHours(shift.start_time, shift.end_time)} hours
							</p>
						</div>
						<div>
							{shift.position && (
								<Badge
									variant="outline"
									className="text-xs">
									{shift.position}
								</Badge>
							)}
						</div>
					</div>
					{shift.location_id && (
						<div className="mt-2 text-xs flex items-center text-muted-foreground">
							<MapPin className="h-3 w-3 mr-1" />
							<span>{getLocationName(shift.location_id)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<ContentContainer>
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">My Shifts</h1>
					<p className="mt-2 text-muted-foreground">
						View your current, upcoming, and previous shifts
					</p>
				</div>
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
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">My Shifts</h1>
				<p className="mt-2 text-muted-foreground">
					View your current, upcoming, and previous shifts
				</p>
			</div>

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
