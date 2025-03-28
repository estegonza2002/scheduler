// Add global types at the top of the file
declare global {
	interface Window {
		initGoogleMaps?: () => void;
		google?: any;
	}
}

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Check, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Type for Google Place Prediction results
interface PlacePrediction {
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

// Type for Google Places API response status
type PlacesServiceStatus =
	| "OK"
	| "ZERO_RESULTS"
	| "OVER_QUERY_LIMIT"
	| "REQUEST_DENIED"
	| "INVALID_REQUEST"
	| "UNKNOWN_ERROR";

// Type for Place Details result
interface PlaceDetails {
	address_components: Array<{
		long_name: string;
		short_name: string;
		types: string[];
	}>;
	formatted_address: string;
	place_id: string;
	geometry?: {
		location?: {
			lat: () => number;
			lng: () => number;
		};
	};
}

// Define the types for Google Places Autocomplete result
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
}

interface GooglePlacesAutocompleteProps {
	onPlaceSelect: (place: GooglePlaceResult) => void;
	defaultValue?: string;
	className?: string;
	placeholder?: string;
	showMap?: boolean;
	mapHeight?: string;
}

// Add a custom hook to load the Google Maps script
function useGoogleMapsScript() {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

	useEffect(() => {
		if (!apiKey) {
			console.error("Google Places API key is missing");
			setError("API key is missing");
			return;
		}

		// Check if the script is already loaded
		if (window.google && window.google.maps) {
			console.log("Google Maps already loaded");
			setLoaded(true);
			return;
		}

		console.log("Loading Google Maps script...");

		// Create script element
		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
		script.async = true;
		script.defer = true;

		// Add global callback function
		window.initGoogleMaps = () => {
			console.log("Google Maps script loaded successfully");
			setLoaded(true);
		};

		script.onload = () => {
			console.log("Script onload event fired");
		};

		script.onerror = () => {
			console.error("Failed to load Google Maps script");
			setError("Failed to load script");
		};

		// Append script to document
		document.head.appendChild(script);

		// Cleanup function
		return () => {
			// Only remove the script if we added it
			if (document.head.contains(script)) {
				document.head.removeChild(script);
			}
			// Also remove global callback
			delete window.initGoogleMaps;
		};
	}, [apiKey]);

	return { loaded, error };
}

export function GooglePlacesAutocomplete({
	onPlaceSelect,
	defaultValue = "",
	className,
	placeholder = "Search for an address...",
	showMap = false,
	mapHeight = "200px",
}: GooglePlacesAutocompleteProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState<string>(defaultValue);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const { loaded, error } = useGoogleMapsScript();
	const [serviceError, setServiceError] = useState<string | null>(null);
	const autoCompleteServiceRef = useRef<any>(null);
	const placesServiceRef = useRef<any>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const markerRef = useRef<any>(null);
	const [selectedLocation, setSelectedLocation] = useState<{
		lat?: number;
		lng?: number;
	}>({});

	// Clear any errors on query change
	useEffect(() => {
		if (searchQuery.length > 0) {
			setServiceError(null);
		}
	}, [searchQuery]);

	// Click outside handler to close suggestions
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Initialize services when script is loaded
	useEffect(() => {
		if (loaded && window.google && window.google.maps) {
			autoCompleteServiceRef.current =
				new window.google.maps.places.AutocompleteService();

			// Create a dummy div for PlacesService (it needs a DOM element)
			const placesDiv = document.createElement("div");
			placesDiv.style.display = "none";
			document.body.appendChild(placesDiv);

			placesServiceRef.current = new window.google.maps.places.PlacesService(
				placesDiv
			);

			return () => {
				if (placesDiv.parentElement) {
					document.body.removeChild(placesDiv);
				}
			};
		}
	}, [loaded]);

	// Fetch place predictions from Google Places API
	useEffect(() => {
		if (!loaded || !autoCompleteServiceRef.current) {
			return;
		}

		if (searchQuery.length > 2) {
			setIsLoading(true);
			setShowSuggestions(true);
			setServiceError(null);

			const timer = setTimeout(() => {
				try {
					autoCompleteServiceRef.current.getPlacePredictions(
						{
							input: searchQuery,
						},
						(
							predictions: PlacePrediction[] | null,
							status: PlacesServiceStatus
						) => {
							setIsLoading(false);
							console.log("Places API status:", status);
							console.log("Predictions:", predictions);

							if (status !== "OK") {
								if (status === "ZERO_RESULTS") {
									setServiceError("No places found matching your search");
								} else {
									setServiceError(`Place search failed: ${status}`);
								}
								setSearchResults([]);
								return;
							}

							if (!predictions || predictions.length === 0) {
								setServiceError("No results found");
								setSearchResults([]);
								return;
							}

							setSearchResults(predictions);
						}
					);
				} catch (err) {
					console.error("Error calling Google Places API:", err);
					setServiceError("Error searching for places");
					setIsLoading(false);
				}
			}, 300);

			return () => clearTimeout(timer);
		} else {
			setSearchResults([]);
			if (searchQuery.length === 0) {
				setShowSuggestions(false);
			}
		}
	}, [searchQuery, loaded]);

	// Helper function to extract address components from place details
	const extractAddressComponents = (
		placeDetails: PlaceDetails
	): GooglePlaceResult => {
		let address = "";
		let city = "";
		let state = "";
		let zipCode = "";
		let country = "";
		let latitude: number | undefined = undefined;
		let longitude: number | undefined = undefined;

		// Extract coordinates if available
		if (placeDetails.geometry && placeDetails.geometry.location) {
			latitude = placeDetails.geometry.location.lat();
			longitude = placeDetails.geometry.location.lng();
			console.log("Extracted coordinates:", latitude, longitude);

			// Update selected location for map
			setSelectedLocation({
				lat: latitude,
				lng: longitude,
			});
		}

		// Extract street number and route for address
		const streetNumber = placeDetails.address_components.find((component) =>
			component.types.includes("street_number")
		);
		const route = placeDetails.address_components.find((component) =>
			component.types.includes("route")
		);

		if (streetNumber && route) {
			address = `${streetNumber.long_name} ${route.long_name}`;
		} else if (route) {
			address = route.long_name;
		}

		// Extract city, state, zip, and country
		city =
			placeDetails.address_components.find((component) =>
				component.types.includes("locality")
			)?.long_name || "";

		state =
			placeDetails.address_components.find((component) =>
				component.types.includes("administrative_area_level_1")
			)?.short_name || "";

		zipCode =
			placeDetails.address_components.find((component) =>
				component.types.includes("postal_code")
			)?.long_name || "";

		country =
			placeDetails.address_components.find((component) =>
				component.types.includes("country")
			)?.long_name || "";

		// Log for debugging
		console.log("Extracted country:", country);

		return {
			address,
			city,
			state,
			zipCode,
			country,
			latitude,
			longitude,
			fullAddress: placeDetails.formatted_address,
			locationSelected: true,
			placeId: placeDetails.place_id,
		};
	};

	// Handle selection of a place from search results
	const handleSelectPlace = (place: PlacePrediction) => {
		if (!placesServiceRef.current) return;

		setIsLoading(true);

		placesServiceRef.current.getDetails(
			{
				placeId: place.place_id,
				fields: [
					"address_component",
					"formatted_address",
					"name",
					"geometry",
					"place_id",
				],
			},
			(placeDetails: any, status: PlacesServiceStatus) => {
				setIsLoading(false);

				if (status !== "OK" || !placeDetails) {
					console.error("Failed to get place details");
					setServiceError("Failed to get place details");
					return;
				}

				// Use main text for display when available, otherwise fall back to full address
				const displayName =
					place.structured_formatting.main_text || place.description;
				setSelectedPlace(displayName);
				setSearchQuery(displayName);
				const addressComponents = extractAddressComponents(
					placeDetails as PlaceDetails
				);
				onPlaceSelect(addressComponents);
				setShowSuggestions(false);

				// Update map if available
				updateMap(addressComponents.latitude, addressComponents.longitude);
			}
		);
	};

	const handleClear = () => {
		setSelectedPlace("");
		setSearchQuery("");
		setSelectedLocation({});

		// Reset form fields and locationSelected state
		onPlaceSelect?.({
			address: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
			latitude: undefined,
			longitude: undefined,
			fullAddress: "",
			locationSelected: false,
			placeId: undefined,
		});

		// Clear map marker if it exists
		if (markerRef.current) {
			markerRef.current.setMap(null);
			markerRef.current = null;
		}

		// Auto-focus input after clearing
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	// Initialize map when loaded and coordinates are available
	useEffect(() => {
		if (!showMap || !loaded || !window.google?.maps || !mapRef.current) return;

		if (!mapInstanceRef.current) {
			// Create new map instance
			const google = window.google;
			mapInstanceRef.current = new google.maps.Map(mapRef.current, {
				center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
				zoom: 15,
				disableDefaultUI: true,
				zoomControl: true,
				mapTypeControl: false,
			});
		}

		// If we have lat/lng from selected location, update the map
		if (selectedLocation.lat && selectedLocation.lng) {
			updateMap(selectedLocation.lat, selectedLocation.lng);
		}
	}, [loaded, showMap, selectedLocation]);

	// Function to update map position and marker
	const updateMap = (lat?: number, lng?: number) => {
		if (!showMap || !loaded || !window.google?.maps || !mapInstanceRef.current)
			return;

		if (!lat || !lng) return;

		const position = { lat, lng };
		const google = window.google;

		// Update map center
		mapInstanceRef.current.setCenter(position);

		// Remove existing marker if there is one
		if (markerRef.current) {
			markerRef.current.setMap(null);
		}

		// Add a new marker
		markerRef.current = new google.maps.Marker({
			position,
			map: mapInstanceRef.current,
			animation: google.maps.Animation.DROP,
		});
	};

	return (
		<div className={cn("relative", className)}>
			{error && (
				<div className="mb-2 text-sm text-destructive">
					Error loading Google Maps: {error}
				</div>
			)}

			{selectedPlace ? (
				// Display selected place with remove option
				<div className="relative flex items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
					<MapPin className="mr-2 h-4 w-4 shrink-0 text-primary" />
					<div className="flex-1 truncate font-medium">{selectedPlace}</div>
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
				// Search input when no place is selected
				<div className="relative">
					<Input
						ref={inputRef}
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => {
							// Show suggestions on focus regardless of query length
							if (searchQuery.length > 0) {
								setShowSuggestions(true);
							}
						}}
						onKeyDown={(e) => {
							// Force refetch on Enter key
							if (e.key === "Enter" && searchQuery.length > 1) {
								e.preventDefault();
								setIsLoading(true);
								setServiceError(null);

								if (!loaded || !autoCompleteServiceRef.current) {
									setServiceError("Google Maps API not loaded yet");
									setIsLoading(false);
									return;
								}

								autoCompleteServiceRef.current?.getPlacePredictions(
									{
										input: searchQuery,
									},
									(
										predictions: PlacePrediction[] | null,
										status: PlacesServiceStatus
									) => {
										setIsLoading(false);
										console.log("Enter key search - status:", status);
										console.log("Enter key search - predictions:", predictions);

										if (status !== "OK") {
											if (status === "ZERO_RESULTS") {
												setServiceError("No places found matching your search");
											} else {
												setServiceError(`Place search failed: ${status}`);
											}
											setSearchResults([]);
											return;
										}

										if (!predictions || predictions.length === 0) {
											setServiceError("No results found");
											setSearchResults([]);
											return;
										}

										setSearchResults(predictions);
										setShowSuggestions(true);
									}
								);
							}
						}}
						placeholder={placeholder}
						className="w-full pl-9 border-2 focus:border-primary"
						disabled={!loaded}
					/>
					<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
					{isLoading && (
						<Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
					)}
				</div>
			)}

			{serviceError && !selectedPlace && (
				<div className="mt-1 text-sm text-destructive">{serviceError}</div>
			)}

			{showSuggestions && !selectedPlace && (
				<div
					ref={suggestionsRef}
					className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg overflow-hidden">
					<div className="max-h-60 overflow-y-auto py-1">
						{searchResults.length === 0 && searchQuery.length > 2 ? (
							<div className="px-2 py-3 text-sm text-center text-muted-foreground">
								No results found. Try a different search term.
							</div>
						) : searchResults.length > 0 ? (
							<div>
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
									Matching locations
								</div>
								<ul>
									{searchResults.map((place) => (
										<li
											key={place.place_id}
											onClick={() => handleSelectPlace(place)}
											className="px-2 py-2 hover:bg-accent cursor-pointer flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<div className="font-medium truncate">
													{place.structured_formatting.main_text}
												</div>
												<div className="text-sm text-muted-foreground truncate">
													{place.structured_formatting.secondary_text}
												</div>
											</div>
											{selectedPlace === place.description && (
												<Check className="h-4 w-4 text-primary mt-1 ml-2" />
											)}
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				</div>
			)}

			{/* Map display when enabled and location selected */}
			{showMap && loaded && (
				<div
					className={cn("mt-2 rounded-md border-2 overflow-hidden", {
						"border-primary": selectedLocation.lat && selectedLocation.lng,
						"border-muted": !(selectedLocation.lat && selectedLocation.lng),
					})}
					style={{ height: mapHeight }}>
					{!(selectedLocation.lat && selectedLocation.lng) && (
						<div className="h-full flex items-center justify-center text-sm text-muted-foreground bg-muted/20">
							Search for a location to see it on the map
						</div>
					)}
					<div
						ref={mapRef}
						className={cn("h-full w-full", {
							hidden: !(selectedLocation.lat && selectedLocation.lng),
						})}
					/>
				</div>
			)}
		</div>
	);
}
