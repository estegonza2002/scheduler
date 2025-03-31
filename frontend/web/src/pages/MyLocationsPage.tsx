import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShiftsAPI, LocationsAPI, Shift, Location } from "@/api";
import { MapPin, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { useHeader } from "@/lib/header-context";
import { LocationCard } from "@/components/ui/location-card";

export default function MyLocationsPage() {
	const { user } = useAuth();
	const userId = user?.id;
	const { updateHeader } = useHeader();
	const [isLoading, setIsLoading] = useState(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [primaryLocation, setPrimaryLocation] = useState<Location | null>(null);

	// Update the header
	useEffect(() => {
		updateHeader({
			title: "My Locations",
			description: "View your assigned work locations",
		});
	}, [updateHeader]);

	useEffect(() => {
		const fetchUserLocations = async () => {
			if (!userId) return;

			try {
				setIsLoading(true);

				// Fetch user's shifts to determine their assigned locations
				const getAll = (ShiftsAPI as any).getAll;
				const allShifts = await getAll({
					is_schedule: false,
				});

				// Filter for this specific user's shifts
				const userShifts = allShifts.filter(
					(shift: Shift) => shift.user_id === userId
				);

				// Collect unique location IDs from user's shifts
				const locationIds = new Set<string>();
				userShifts.forEach((shift: Shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
					}
				});

				// Fetch all needed locations
				const locationsArray: Location[] = [];
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsArray.push(location);
					}
				}

				setLocations(locationsArray);

				// Set primary location (most frequently assigned)
				if (locationsArray.length > 0) {
					// Count frequency of locations in shifts
					const locationCounts = new Map<string, number>();

					userShifts.forEach((shift: Shift) => {
						if (shift.location_id) {
							const count = locationCounts.get(shift.location_id) || 0;
							locationCounts.set(shift.location_id, count + 1);
						}
					});

					// Find most frequent location
					let maxCount = 0;
					let primaryLocationId = "";

					locationCounts.forEach((count, locationId) => {
						if (count > maxCount) {
							maxCount = count;
							primaryLocationId = locationId;
						}
					});

					const primary = locationsArray.find(
						(loc) => loc.id === primaryLocationId
					);
					if (primary) {
						setPrimaryLocation(primary);
					} else if (locationsArray.length > 0) {
						// If no clear primary, use the first one
						setPrimaryLocation(locationsArray[0]);
					}
				}
			} catch (error) {
				console.error("Error fetching user locations:", error);
				toast.error("Failed to load location information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserLocations();
	}, [userId]);

	if (isLoading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message="Loading location information..."
					className="py-8"
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<ContentSection title="My Locations">
				<div className="space-y-6">
					{/* Primary Location Section */}
					{primaryLocation && (
						<div>
							<h3 className="text-lg font-medium mb-4 flex items-center">
								<MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
								Primary Location
							</h3>
							<LocationCard
								key={primaryLocation.id}
								location={primaryLocation}
								showBadge={true}
								badgeText="Primary"
								variant="detailed"
								className="mb-3"
							/>
						</div>
					)}

					{/* All Assigned Locations */}
					{locations.length > 0 ? (
						<div>
							<h3 className="text-lg font-medium mb-4 flex items-center">
								<Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
								All Assigned Locations
							</h3>
							{locations
								.filter(
									(loc) => !primaryLocation || loc.id !== primaryLocation.id
								)
								.map((location) => (
									<LocationCard
										key={location.id}
										location={location}
										variant="detailed"
										className="mb-3"
									/>
								))}
							{locations.length === 1 && primaryLocation && (
								<p className="text-sm text-muted-foreground">
									You are currently only assigned to your primary location.
								</p>
							)}
						</div>
					) : (
						<Card>
							<CardContent className="p-4 text-muted-foreground">
								No locations currently assigned
							</CardContent>
						</Card>
					)}
				</div>
			</ContentSection>
		</ContentContainer>
	);
}
