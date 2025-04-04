import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	useJsApiLoader,
	Autocomplete,
	GoogleMap,
	Marker,
} from "@react-google-maps/api";

// Define the types for the result passed back to the parent component
export interface GooglePlaceResult {
	address: string;
	city: string;
	state: string;
	zipCode: string;
	fullAddress: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	locationSelected?: boolean;
	placeId?: string;
	name?: string;
	hasValidAddress?: boolean;
	isBusinessPlace?: boolean;
}

interface GooglePlacesAutocompleteProps {
	onPlaceSelect: (place: GooglePlaceResult) => void;
	defaultValue?: string;
	className?: string;
	placeholder?: string;
	showMap?: boolean;
	mapHeight?: string;
}

// Define libraries required by Google Maps API

const libraries: ("places" | "maps")[] = ["places", "maps"]; // Define libraries required

export function GooglePlacesAutocomplete({
	onPlaceSelect,
	defaultValue = "",
	className,
	placeholder = "Search for an address...",
	showMap = false,
	mapHeight = "200px",
}: GooglePlacesAutocompleteProps) {
	const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

	// Hook to load the Google Maps script
	const { isLoaded, loadError } = useJsApiLoader({
		googleMapsApiKey: apiKey,
		libraries: libraries,
	});

	// State variables
	const [searchQuery, setSearchQuery] = useState<string>(defaultValue);
	const [selectedPlaceDisplay, setSelectedPlaceDisplay] =
		useState<string>(defaultValue);
	const [selectedLocation, setSelectedLocation] = useState<{
		lat?: number;
		lng?: number;
	}>({});
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input element

	// Update internal state if defaultValue prop changes
	useEffect(() => {
		setSearchQuery(defaultValue);
		setSelectedPlaceDisplay(defaultValue);
		if (!defaultValue) {
			setSelectedLocation({}); // Reset location if default value is cleared
		}
	}, [defaultValue]);

	// Callback when the Autocomplete component loads
	const onLoad = useCallback(
		(autocomplete: google.maps.places.Autocomplete) => {
			autocompleteRef.current = autocomplete;
			console.log("Autocomplete loaded");
		},
		[]
	);

	// Callback when the Autocomplete component unmounts
	const onUnmount = useCallback(() => {
		autocompleteRef.current = null;
		console.log("Autocomplete unmounted");
	}, []);

	// Helper function to extract address components from Google PlaceResult
	const extractAddressComponents = useCallback(
		(place: google.maps.places.PlaceResult): GooglePlaceResult => {
			let address = "";
			let city = "";
			let state = "";
			let zipCode = "";
			let country = "";
			let latitude: number | undefined = undefined;
			let longitude: number | undefined = undefined;
			let name: string | undefined = place.name;
			let hasValidAddress = false;
			let isBusinessPlace = false;

			const components = place.address_components || [];

			if (place.types) {
				isBusinessPlace = place.types.some((type) =>
					[
						"establishment",
						"point_of_interest",
						"food",
						"store",
						"restaurant",
					].includes(type)
				);
			}

			if (place.geometry?.location) {
				latitude = place.geometry.location.lat();
				longitude = place.geometry.location.lng();
			}

			const streetNumber = components.find((c) =>
				c.types.includes("street_number")
			)?.long_name;
			const route = components.find((c) =>
				c.types.includes("route")
			)?.long_name;
			if (streetNumber && route) address = `${streetNumber} ${route}`;
			else if (route) address = route;

			city =
				components.find((c) => c.types.includes("locality"))?.long_name || "";
			state =
				components.find((c) => c.types.includes("administrative_area_level_1"))
					?.short_name || "";
			zipCode =
				components.find((c) => c.types.includes("postal_code"))?.long_name ||
				"";
			country =
				components.find((c) => c.types.includes("country"))?.long_name || "";
			hasValidAddress = !!(route || city); // Basic check for a valid address

			return {
				address,
				city,
				state,
				zipCode,
				country,
				latitude,
				longitude,
				fullAddress: place.formatted_address || "",
				locationSelected: true,
				placeId: place.place_id,
				name,
				hasValidAddress,
				isBusinessPlace,
			};
		},
		[]
	);

	// Callback when a place is selected from the Autocomplete dropdown
	const onPlaceChanged = useCallback(() => {
		if (autocompleteRef.current) {
			const place = autocompleteRef.current.getPlace();
			console.log("Place selected:", place);

			// Basic validation on the selected place
			if (!place.geometry?.location || !place.address_components) {
				console.warn(
					"Selected place lacks geometry or address components:",
					place
				);
				// Handle error: Maybe show a message to the user?
				return;
			}

			const result = extractAddressComponents(place);

			if (!result.hasValidAddress) {
				console.warn(
					"Place does not have a valid address (route/locality):",
					result
				);
				// Handle error: Maybe show a message to the user?
				return;
			}

			const displayValue = place.name || place.formatted_address || "";
			setSelectedPlaceDisplay(displayValue); // Update the display value
			setSearchQuery(displayValue); // Sync controlled input state
			if (result.latitude !== undefined && result.longitude !== undefined) {
				setSelectedLocation({ lat: result.latitude, lng: result.longitude }); // Update map location
			}
			onPlaceSelect(result); // Call the parent callback with the extracted data
		} else {
			console.error("Autocomplete ref not set when onPlaceChanged called");
		}
	}, [onPlaceSelect, extractAddressComponents]);

	// Handle clear selection button click
	const handleClear = useCallback(() => {
		setSelectedPlaceDisplay("");
		setSearchQuery(""); // Clear the input field's controlled state
		setSelectedLocation({});
		onPlaceSelect?.({
			// Notify parent with empty data
			address: "",
			city: "",
			state: "",
			zipCode: "",
			fullAddress: "",
			country: "",
			latitude: undefined,
			longitude: undefined,
			locationSelected: false,
			placeId: undefined,
			name: undefined,
			hasValidAddress: false,
			isBusinessPlace: false,
		});
		// Focus the input after clearing
		setTimeout(() => inputRef.current?.focus(), 0);
	}, [onPlaceSelect]);

	// Render loading state
	if (!isLoaded) {
		return (
			<div className="flex items-center text-muted-foreground">
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Loading Address Search...
			</div>
		);
	}

	// Render error state
	if (loadError) {
		return (
			<div className="text-destructive">{`Error loading Google Maps: ${loadError.message}`}</div>
		);
	}

	// Define map center and zoom based on selected location
	const mapCenter =
		selectedLocation.lat && selectedLocation.lng
			? { lat: selectedLocation.lat, lng: selectedLocation.lng }
			: { lat: 37.7749, lng: -122.4194 }; // Default center (e.g., SF)
	const mapZoom = selectedLocation.lat && selectedLocation.lng ? 15 : 10;

	return (
		<div className={cn("relative", className)}>
			{selectedPlaceDisplay ? (
				// Display selected place with remove button
				<div className="relative flex items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
					<MapPin className="mr-2 h-4 w-4 shrink-0 text-primary" />
					<div className="flex-1 truncate font-medium">
						{selectedPlaceDisplay}
					</div>
					<button
						type="button"
						onClick={handleClear}
						className="ml-1 rounded-full h-5 w-5 inline-flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<line
								x1="18"
								y1="6"
								x2="6"
								y2="18"></line>
							<line
								x1="6"
								y1="6"
								x2="18"
								y2="18"></line>
						</svg>
						<span className="sr-only">Clear selection</span>
					</button>
				</div>
			) : (
				// Autocomplete Input Component
				<Autocomplete
					onLoad={onLoad}
					onPlaceChanged={onPlaceChanged}
					onUnmount={onUnmount}
					// Specify fields to request from Google Places API
					fields={[
						"address_components",
						"geometry.location",
						"place_id",
						"formatted_address",
						"name",
						"types",
					]}
					// Optional: Add restrictions like country or types
					// options={{ types: ['address'], componentRestrictions: { country: 'us' } }}
				>
					<div className="relative">
						<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
						<Input
							ref={inputRef} // Assign ref to the actual underlying input
							type="text"
							placeholder={placeholder}
							className="w-full pl-9 border-2 focus:border-primary"
							value={searchQuery} // Control the input's value
							onChange={(e) => setSearchQuery(e.target.value)} // Update state on change
						/>
					</div>
				</Autocomplete>
			)}

			{/* Map Display (Optional) */}
			{showMap && (
				<div
					className={cn("mt-2 rounded-md border-2 overflow-hidden", {
						"border-primary": selectedLocation.lat !== undefined,
						"border-muted": selectedLocation.lat === undefined,
					})}
					style={{ height: mapHeight }}>
					<GoogleMap
						mapContainerStyle={{ width: "100%", height: "100%" }}
						center={mapCenter}
						zoom={mapZoom}
						options={{
							disableDefaultUI: true,
							zoomControl: true,
							mapTypeControl: false,
						}}>
						{selectedLocation.lat !== undefined &&
							selectedLocation.lng !== undefined && (
								<Marker
									position={{
										lat: selectedLocation.lat,
										lng: selectedLocation.lng,
									}}
								/>
							)}
					</GoogleMap>
				</div>
			)}
		</div>
	);
}
