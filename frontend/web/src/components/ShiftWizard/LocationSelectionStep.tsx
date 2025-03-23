import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { Location } from "../../api";
import { Search, X, Building2, Check } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type LocationData = {
	locationId: string;
};

interface LocationSelectionStepProps {
	locationForm: UseFormReturn<LocationData>;
	locations: Location[];
	filteredLocations: Location[];
	locationSearchTerm: string;
	loadingLocations: boolean;
	setLocationSearchTerm: (value: string) => void;
	handleLocationSelect: (data: LocationData) => void;
	handleLocationChange: (locationId: string) => void;
	clearLocationSearch: () => void;
	onCancel?: () => void;
}

// Location card component
interface LocationCardProps {
	location: Location;
	selected: boolean;
	onClick: () => void;
}

function LocationCard({ location, selected, onClick }: LocationCardProps) {
	return (
		<Card
			className={cn(
				"cursor-pointer transition-colors hover:bg-accent/50",
				selected && "bg-accent/50 border-primary"
			)}
			onClick={onClick}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium">{location.name}</p>
						<p className="text-sm text-muted-foreground">
							{location.address}
							{location.city && `, ${location.city}`}
							{location.state && ` ${location.state}`}
						</p>
					</div>
					{selected && <Check className="h-5 w-5 text-primary" />}
				</div>
			</CardContent>
		</Card>
	);
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
}: LocationSelectionStepProps) {
	return (
		<div className="flex flex-col h-full relative">
			<form
				id="location-selection-form"
				onSubmit={locationForm.handleSubmit(handleLocationSelect)}
				className="flex flex-col h-full">
				{/* Content area with bottom padding to make space for fixed footer */}
				<div className="flex-1 overflow-y-auto pb-24 px-6 py-4">
					{/* Header */}
					<div className="mb-4">
						<h3 className="text-lg font-medium">Select a Location</h3>
						<p className="text-muted-foreground">
							Choose the location where this shift will take place
						</p>
					</div>

					{/* Search box */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search by name, address, or city..."
							className="pl-10 pr-10"
							value={locationSearchTerm}
							onChange={(e) => setLocationSearchTerm(e.target.value)}
						/>
						{locationSearchTerm && (
							<button
								type="button"
								onClick={clearLocationSearch}
								className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* Location list */}
					<div className="space-y-2">
						{loadingLocations ? (
							<div className="py-12 flex items-center justify-center">
								<div className="animate-pulse text-muted-foreground">
									Loading locations...
								</div>
							</div>
						) : filteredLocations.length > 0 ? (
							<div className="space-y-2">
								{filteredLocations.map((location) => (
									<LocationCard
										key={location.id}
										location={location}
										selected={locationForm.watch("locationId") === location.id}
										onClick={() => handleLocationChange(location.id)}
									/>
								))}
							</div>
						) : (
							<div className="py-12 flex flex-col items-center justify-center text-center">
								<Building2 className="h-8 w-8 text-muted-foreground mb-2" />
								<h4 className="font-medium">No locations found</h4>
								<p className="text-sm text-muted-foreground">
									Try adjusting your search or add a new location
								</p>
							</div>
						)}
					</div>
				</div>
			</form>

			{/* Absolutely positioned footer within the container */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 border-t bg-background">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="submit"
					form="location-selection-form"
					disabled={!locationForm.watch("locationId") || loadingLocations}>
					Continue
				</Button>
			</div>
		</div>
	);
}
