import { useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { Location } from "../../api";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { LocationCard } from "../ui/location-card";

interface LocationData {
	locationId: string;
}

export interface LocationSelectionStepProps {
	locationForm: UseFormReturn<LocationData>;
	locations: Location[];
	filteredLocations: Location[];
	locationSearchTerm: string;
	loadingLocations: boolean;
	setLocationSearchTerm: (term: string) => void;
	handleLocationSelect: (locationId: string) => void;
	handleLocationChange: (locationId: string) => void;
	clearLocationSearch: () => void;
	onCancel?: () => void;
	organizationId: string;
}

export function LocationSelectionStep({
	locationForm,
	locations,
	filteredLocations,
	locationSearchTerm,
	loadingLocations,
	setLocationSearchTerm,
	handleLocationSelect,
	handleLocationChange,
	clearLocationSearch,
	onCancel,
	organizationId,
}: LocationSelectionStepProps) {
	const { register, setValue, watch } = locationForm;
	const locationId = watch("locationId");

	// Just used for initial setting of the location value as a form control field
	useEffect(() => {
		if (locationId) {
			register("locationId");
			setValue("locationId", locationId);
		}
	}, [locationId, register, setValue]);

	if (loadingLocations) {
		return (
			<Card className="flex flex-col items-center justify-center h-full min-h-[400px]">
				<CardContent className="flex flex-col items-center pt-4">
					<Loader2 className="h-8 w-8 animate-spin opacity-30 mb-4" />
					<p className="text-sm text-muted-foreground">Loading locations...</p>
				</CardContent>
			</Card>
		);
	}

	if (locations.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center text-center pt-6">
					<MapPin className="h-8 w-8 text-muted-foreground mb-2" />
					<h2 className="text-lg font-medium">No Locations Found</h2>
					<p className="text-sm text-muted-foreground mb-4">
						You need to create at least one location to schedule shifts.
					</p>
					<Button
						asChild
						className="w-full"
						variant="default">
						<Link href={`/organization/${organizationId}/locations/new`}>
							Create Location
						</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="min-h-[400px] flex flex-col">
			<CardContent className="space-y-4 flex-1 pt-6">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search locations..."
						className="pl-8"
						value={locationSearchTerm}
						onChange={(e) => setLocationSearchTerm(e.target.value)}
					/>
					{locationSearchTerm && (
						<X
							className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
							onClick={clearLocationSearch}
						/>
					)}
				</div>

				<Card className="border rounded-md">
					<ScrollArea className="h-[280px] rounded-md">
						<CardContent className="p-3">
							{filteredLocations.length === 0 ? (
								<p className="py-6 text-center text-muted-foreground text-sm">
									No locations found matching "{locationSearchTerm}"
								</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{filteredLocations.map((location) => (
										<LocationCard
											key={location.id}
											location={location}
											selected={locationId === location.id}
											onClick={() => {
												handleLocationSelect(location.id);
												handleLocationChange(location.id);
											}}
											interactive={true}
											variant="compact"
											size="sm"
											className="h-full"
										/>
									))}
								</div>
							)}
						</CardContent>
					</ScrollArea>
				</Card>
			</CardContent>

			<CardFooter className="flex justify-between border-t pt-4">
				<Button
					variant="outline"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (locationId) {
							handleLocationSelect(locationId);
						}
					}}
					disabled={!locationId}>
					Continue
				</Button>
			</CardFooter>
		</Card>
	);
}
