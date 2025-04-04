import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { Location } from "@/api/types";
import { LocationsAPI } from "@/api";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { getOrgId, useOrganization } from "./organization";

// Context type that includes all necessary functionality
interface LocationContextType {
	// All locations from the API
	locations: Location[];
	// Current selected location
	currentLocation: Location | null;
	// Loading state
	isLoading: boolean;
	// Refresh the locations
	refreshLocations: () => Promise<void>;
	// Get the current location ID safely (with fallback)
	getCurrentLocationId: () => string | null;
	// Select a specific location
	selectLocation: (locationId: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
	undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
	// Get organization context
	const { organization, isLoading: isOrgLoading } = useOrganization();
	const [locations, setLocations] = useState<Location[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch all locations for the current organization
	const refreshLocations = async () => {
		// Ensure organization is loaded before fetching
		const organizationId = organization?.id;
		if (!organizationId) {
			// Don't fetch if org ID is not available yet
			// Clear locations if org becomes unavailable
			setLocations([]);
			setCurrentLocation(null);
			setIsLoading(false); // Stop loading if no org ID
			return;
		}

		try {
			setIsLoading(true);
			// Pass the confirmed organizationId
			const locationData = await LocationsAPI.getAll(organizationId);

			setLocations(locationData);

			// Set the first location as current if there's no current selection
			if (locationData.length > 0 && !currentLocation) {
				setCurrentLocation(locationData[0]);
			} else if (currentLocation) {
				// Make sure current location is updated with latest data
				const updated = locationData.find(
					(loc) => loc.id === currentLocation.id
				);
				if (updated) {
					setCurrentLocation(updated);
				} else if (locationData.length > 0) {
					// If current location no longer exists, select the first one
					setCurrentLocation(locationData[0]);
				} else {
					setCurrentLocation(null);
				}
			}
		} catch (error) {
			console.error("Error fetching locations:", error);
			toast.error("Failed to load locations");
		} finally {
			setIsLoading(false);
		}
	};

	// Get the current location ID safely
	const getCurrentLocationId = (): string | null => {
		return currentLocation ? currentLocation.id : null;
	};

	// Select a specific location
	const selectLocation = (locationId: string) => {
		const location = locations.find((loc) => loc.id === locationId);
		if (location) {
			setCurrentLocation(location);
		} else {
			toast.error("Location not found");
		}
	};

	// Initial data fetch - depends on organization ID
	useEffect(() => {
		// Only refresh if organization is loaded and has an ID
		if (organization?.id) {
			refreshLocations();
		} else if (!isOrgLoading) {
			// If org loading is finished and there's still no ID, clear locations
			setLocations([]);
			setCurrentLocation(null);
			setIsLoading(false);
		}
		// Add organization.id and isOrgLoading as dependencies
	}, [organization?.id, isOrgLoading]);

	// Set up real-time subscription for location updates
	useEffect(() => {
		// Get organizationId directly from context if available
		const organizationId = organization?.id;

		// Only subscribe if we have an organizationId
		if (!organizationId) {
			return; // Return an empty cleanup function if no subscription is made
		}

		const subscription = supabase
			.channel("location-updates")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
					schema: "public",
					table: "locations",
					filter: `organization_id=eq.${organizationId}`, // Use organizationId here
				},
				() => {
					// Refresh locations on updates
					if (organization?.id) {
						// Check again in case org changed during update
						refreshLocations();
					}
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
		// Depend on organization.id to resubscribe if it changes
	}, [organization?.id]);

	// Context value
	const contextValue: LocationContextType = {
		locations,
		currentLocation,
		isLoading,
		refreshLocations,
		getCurrentLocationId,
		selectLocation,
	};

	return (
		<LocationContext.Provider value={contextValue}>
			{children}
		</LocationContext.Provider>
	);
}

// Custom hook to use the location context
export function useLocation() {
	const context = useContext(LocationContext);
	if (context === undefined) {
		throw new Error("useLocation must be used within a LocationProvider");
	}
	return context;
}

// Utility function to get location ID (can be used in any context)
// Remove the function below as it violates hook rules
// export function getCurrentLocation(): string | null {
// 	try {
// 		// This will work in component contexts
// 		const { getCurrentLocationId } = useLocation();
// 		return getCurrentLocationId();
// 	} catch (error) {
// 		// Return null if we're not in a component context
// 		console.warn("Unable to get location ID - not in component context");
// 		return null;
// 	}
// }
