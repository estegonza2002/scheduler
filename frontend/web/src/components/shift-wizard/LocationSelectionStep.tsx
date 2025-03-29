import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { Location } from "../../api";
import {
	Search,
	X,
	Building2,
	Check,
	PlusCircle,
	AlertCircle,
	Loader2,
	MapPin,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { Alert, AlertDescription } from "../ui/alert";

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

interface LocationItemProps {
	location: Location;
	selected: boolean;
	onSelect: () => void;
}

// Simple location item component for selection
function LocationItem({ location, selected, onSelect }: LocationItemProps) {
	return (
		<div
			className={`p-3 rounded-md cursor-pointer hover:bg-accent ${
				selected ? "bg-accent" : ""
			}`}
			onClick={onSelect}>
			<div className="font-medium">{location.name}</div>
			{location.address && (
				<div className="text-sm text-muted-foreground">{location.address}</div>
			)}
		</div>
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
	organizationId,
}: LocationSelectionStepProps) {
	const { register, setValue, watch, formState } = locationForm;
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
			<div className="px-6 py-4 flex flex-col items-center justify-center h-full min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin opacity-30 mb-4" />
				<p className="text-sm text-muted-foreground">Loading locations...</p>
			</div>
		);
	}

	if (locations.length === 0) {
		return (
			<div className="p-6 flex flex-col">
				<div className="mb-4 flex flex-col items-center text-center">
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
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 flex flex-col gap-4 min-h-[400px]">
			<form className="space-y-4 flex-1">
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

				<div className="border rounded-md">
					<ScrollArea className="h-[280px] rounded-md">
						<div className="p-3 space-y-0.5">
							{filteredLocations.length === 0 ? (
								<div className="py-6 text-center text-muted-foreground text-sm">
									No locations found matching "{locationSearchTerm}"
								</div>
							) : (
								filteredLocations.map((location) => (
									<LocationItem
										key={location.id}
										location={location}
										selected={locationId === location.id}
										onSelect={() => {
											handleLocationSelect(location.id);
											handleLocationChange(location.id);
										}}
									/>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			</form>
		</div>
	);
}
