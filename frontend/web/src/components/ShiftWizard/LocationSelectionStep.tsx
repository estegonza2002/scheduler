import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { Location } from "../../api";
import { Search, X, Building2, Check } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

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
		<div className="flex-1">
			<form
				onSubmit={locationForm.handleSubmit(handleLocationSelect)}
				className="space-y-4 h-full flex flex-col">
				<div className="flex-1">
					<div>
						<h3 className="text-lg font-medium">Select a Location</h3>
						<p className="text-muted-foreground">
							Choose the location where this shift will take place
						</p>
					</div>

					{/* Location search */}
					<div className="my-4">
						<div className="relative">
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search by name, address, or city..."
								className="pl-9"
								value={locationSearchTerm}
								onChange={(e) => setLocationSearchTerm(e.target.value)}
							/>
							{locationSearchTerm && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={clearLocationSearch}>
									<X className="h-4 w-4" />
									<span className="sr-only">Clear search</span>
								</Button>
							)}
						</div>
					</div>

					{/* Location list */}
					{loadingLocations ? (
						<div className="flex items-center justify-center h-[300px]">
							<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
							Loading locations...
						</div>
					) : (
						<div className="space-y-2 mt-4">
							{filteredLocations.length === 0 ? (
								<Card>
									<CardContent className="pt-6 pb-4">
										<h3 className="font-medium">No locations found</h3>
										{locationSearchTerm ? (
											<>
												<p className="text-muted-foreground mt-1 text-sm">
													No locations match "{locationSearchTerm}"
												</p>
												<Button
													variant="link"
													onClick={clearLocationSearch}
													className="mt-1">
													Clear search
												</Button>
											</>
										) : (
											<p className="text-muted-foreground mt-1 text-sm">
												Please add a location first
											</p>
										)}
									</CardContent>
								</Card>
							) : (
								<ScrollArea className="h-[340px]">
									<div className="space-y-4">
										{filteredLocations.map((location) => (
											<Card
												key={location.id}
												onClick={() => handleLocationChange(location.id)}>
												<input
													type="radio"
													id={`location-${location.id}`}
													value={location.id}
													className="sr-only"
													{...locationForm.register("locationId")}
												/>
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div>
															<p className="font-medium">{location.name}</p>
															{location.address && (
																<p className="text-sm text-muted-foreground">
																	{location.address}
																	{location.city && `, ${location.city}`}
																	{location.state && ` ${location.state}`}
																</p>
															)}
														</div>
														{locationForm.watch("locationId") ===
															location.id && <Check className="h-4 w-4" />}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</ScrollArea>
							)}
						</div>
					)}

					{locationForm.formState.errors.locationId && (
						<p className="text-destructive">
							{locationForm.formState.errors.locationId.message}
						</p>
					)}
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between items-center mt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit">Continue</Button>
				</div>
			</form>
		</div>
	);
}
