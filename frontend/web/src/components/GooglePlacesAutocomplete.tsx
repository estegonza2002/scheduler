import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "../lib/utils";

// Mock Google Places API response data
const MOCK_PLACES = [
	{
		place_id: "place1",
		description: "123 Main Street, San Francisco, CA 94105",
		structured_formatting: {
			main_text: "123 Main Street",
			secondary_text: "San Francisco, CA 94105",
		},
		address_components: [
			{ long_name: "123", short_name: "123", types: ["street_number"] },
			{ long_name: "Main Street", short_name: "Main St", types: ["route"] },
			{ long_name: "San Francisco", short_name: "SF", types: ["locality"] },
			{
				long_name: "California",
				short_name: "CA",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "94105", short_name: "94105", types: ["postal_code"] },
		],
	},
	{
		place_id: "place2",
		description: "456 Market Street, San Francisco, CA 94103",
		structured_formatting: {
			main_text: "456 Market Street",
			secondary_text: "San Francisco, CA 94103",
		},
		address_components: [
			{ long_name: "456", short_name: "456", types: ["street_number"] },
			{ long_name: "Market Street", short_name: "Market St", types: ["route"] },
			{ long_name: "San Francisco", short_name: "SF", types: ["locality"] },
			{
				long_name: "California",
				short_name: "CA",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "94103", short_name: "94103", types: ["postal_code"] },
		],
	},
	{
		place_id: "place3",
		description: "789 Mission Street, San Francisco, CA 94103",
		structured_formatting: {
			main_text: "789 Mission Street",
			secondary_text: "San Francisco, CA 94103",
		},
		address_components: [
			{ long_name: "789", short_name: "789", types: ["street_number"] },
			{
				long_name: "Mission Street",
				short_name: "Mission St",
				types: ["route"],
			},
			{ long_name: "San Francisco", short_name: "SF", types: ["locality"] },
			{
				long_name: "California",
				short_name: "CA",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "94103", short_name: "94103", types: ["postal_code"] },
		],
	},
	{
		place_id: "place4",
		description: "1 Ferry Building, San Francisco, CA 94111",
		structured_formatting: {
			main_text: "1 Ferry Building",
			secondary_text: "San Francisco, CA 94111",
		},
		address_components: [
			{ long_name: "1", short_name: "1", types: ["street_number"] },
			{
				long_name: "Ferry Building",
				short_name: "Ferry Bldg",
				types: ["route"],
			},
			{ long_name: "San Francisco", short_name: "SF", types: ["locality"] },
			{
				long_name: "California",
				short_name: "CA",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "94111", short_name: "94111", types: ["postal_code"] },
		],
	},
	{
		place_id: "place5",
		description: "555 Broadway, New York, NY 10012",
		structured_formatting: {
			main_text: "555 Broadway",
			secondary_text: "New York, NY 10012",
		},
		address_components: [
			{ long_name: "555", short_name: "555", types: ["street_number"] },
			{ long_name: "Broadway", short_name: "Broadway", types: ["route"] },
			{ long_name: "New York", short_name: "NY", types: ["locality"] },
			{
				long_name: "New York",
				short_name: "NY",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "10012", short_name: "10012", types: ["postal_code"] },
		],
	},
	{
		place_id: "place6",
		description: "350 5th Avenue, New York, NY 10118",
		structured_formatting: {
			main_text: "350 5th Avenue (Empire State Building)",
			secondary_text: "New York, NY 10118",
		},
		address_components: [
			{ long_name: "350", short_name: "350", types: ["street_number"] },
			{ long_name: "5th Avenue", short_name: "5th Ave", types: ["route"] },
			{ long_name: "New York", short_name: "NY", types: ["locality"] },
			{
				long_name: "New York",
				short_name: "NY",
				types: ["administrative_area_level_1"],
			},
			{ long_name: "10118", short_name: "10118", types: ["postal_code"] },
		],
	},
];

export interface GooglePlaceResult {
	address: string;
	city: string;
	state: string;
	zipCode: string;
	fullAddress: string;
}

interface GooglePlacesAutocompleteProps {
	onPlaceSelect: (place: GooglePlaceResult) => void;
	defaultValue?: string;
	className?: string;
	placeholder?: string;
}

export function GooglePlacesAutocomplete({
	onPlaceSelect,
	defaultValue = "",
	className,
	placeholder = "Search for an address...",
}: GooglePlacesAutocompleteProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<typeof MOCK_PLACES>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState<string>(defaultValue);

	// Simulate API call to Google Places
	useEffect(() => {
		if (searchQuery.length > 2) {
			setIsLoading(true);

			// Simulate network delay
			const timer = setTimeout(() => {
				// Filter mock places based on search query
				const results = MOCK_PLACES.filter((place) =>
					place.description.toLowerCase().includes(searchQuery.toLowerCase())
				);
				setSearchResults(results);
				setIsLoading(false);
			}, 500);

			return () => clearTimeout(timer);
		} else {
			setSearchResults([]);
		}
	}, [searchQuery]);

	// Helper function to extract address components from a place
	const extractAddressComponents = (
		place: (typeof MOCK_PLACES)[0]
	): GooglePlaceResult => {
		let address = "";
		let city = "";
		let state = "";
		let zipCode = "";

		// Extract street number and route for address
		const streetNumber = place.address_components.find((component) =>
			component.types.includes("street_number")
		);
		const route = place.address_components.find((component) =>
			component.types.includes("route")
		);

		if (streetNumber && route) {
			address = `${streetNumber.long_name} ${route.long_name}`;
		}

		// Extract city, state, and zip
		city =
			place.address_components.find((component) =>
				component.types.includes("locality")
			)?.long_name || "";

		state =
			place.address_components.find((component) =>
				component.types.includes("administrative_area_level_1")
			)?.short_name || "";

		zipCode =
			place.address_components.find((component) =>
				component.types.includes("postal_code")
			)?.long_name || "";

		return {
			address,
			city,
			state,
			zipCode,
			fullAddress: place.description,
		};
	};

	const handleSelectPlace = (place: (typeof MOCK_PLACES)[0]) => {
		setSelectedPlace(place.description);
		const addressComponents = extractAddressComponents(place);
		onPlaceSelect(addressComponents);
		setOpen(false);
	};

	return (
		<div className={cn("relative", className)}>
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between">
						{selectedPlace ? (
							<div className="flex items-center">
								<MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
								<span className="truncate">{selectedPlace}</span>
							</div>
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[400px] p-0">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Search for an address..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						{isLoading ? (
							<div className="flex items-center justify-center py-6">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : (
							<CommandList>
								<CommandEmpty>No addresses found.</CommandEmpty>
								<CommandGroup>
									{searchResults.map((place) => (
										<CommandItem
											key={place.place_id}
											value={place.description}
											onSelect={() => handleSelectPlace(place)}>
											<div className="flex flex-col">
												<div className="font-medium">
													{place.structured_formatting.main_text}
												</div>
												<div className="text-sm text-muted-foreground">
													{place.structured_formatting.secondary_text}
												</div>
											</div>
											<Check
												className={cn(
													"ml-auto h-4 w-4",
													selectedPlace === place.description
														? "opacity-100"
														: "opacity-0"
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						)}
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
