import { useState, useRef, useEffect } from "react";
import { Location, LocationsAPI } from "@/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
	Building,
	Building2,
	CheckCircle,
	Loader2,
	MapPin,
	Plus,
	ChevronDown,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BulkLocationImport } from "./BulkLocationImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { LocationMap } from "@/components/ui/location-map";
import { GoogleMap } from "@/components/ui/google-map";

// Extended Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
}

// The schema for the form validation
const LocationSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters long",
	}),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
	fullAddress: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	isActive: z.boolean().default(true),
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
	email: z.string().email().optional(),
});

type FormValues = z.infer<typeof LocationSchema>;

// Form schema
const formSchema = LocationSchema;

/**
 * Props for the LocationCreationSheet component
 */
interface LocationCreationSheetProps {
	/**
	 * The organization ID to create the location in
	 */
	organizationId: string;
	/**
	 * Callback fired when location is created
	 */
	onLocationCreated?: (location: ExtendedLocation) => void;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Controls whether the sheet is open
	 */
	open?: boolean;
	/**
	 * Callback fired when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Optional additional className for the sheet content
	 */
	className?: string;
}

// Extend GooglePlaceResult to include country if needed
interface ExtendedGooglePlaceResult extends GooglePlaceResult {
	country?: string;
	latitude?: number;
	longitude?: number;
}

/**
 * Sheet component for creating a new location
 */
export function LocationCreationSheet({
	organizationId,
	onLocationCreated,
	trigger,
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	className,
}: LocationCreationSheetProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCreated, setIsCreated] = useState(false);
	const [createdLocation, setCreatedLocation] =
		useState<ExtendedLocation | null>(null);
	const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
	const [bulkImportComplete, setBulkImportComplete] = useState(false);
	const [bulkImportedLocations, setBulkImportedLocations] = useState<
		Location[]
	>([]);
	const nameFieldRef = useRef<HTMLDivElement>(null);
	const [locationSelected, setLocationSelected] = useState(false);

	const isControlled = controlledOpen !== undefined;
	const isOpened = isControlled ? controlledOpen : open;
	const setIsOpened = isControlled ? setControlledOpen! : setOpen;

	useEffect(() => {
		if (isOpened) {
			const timer = setTimeout(() => {
				if (nameFieldRef.current) {
					const input = nameFieldRef.current.querySelector("input");
					if (input) {
						input.focus();
					}
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isOpened]);

	const form = useForm<FormValues>({
		resolver: zodResolver(LocationSchema),
		defaultValues: {
			name: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			isActive: true,
			phone: "",
			email: "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);

			// Only include fields that are part of the Location interface
			const locationData = {
				name: data.name,
				address: data.address,
				city: data.city,
				state: data.state,
				zipCode: data.zipCode,
				isActive: data.isActive,
				organizationId: organizationId,
			};

			const newLocation = (await LocationsAPI.create(
				locationData
			)) as ExtendedLocation;
			setCreatedLocation(newLocation);
			setIsCreated(true);

			if (onLocationCreated) {
				onLocationCreated(newLocation);
			}

			toast.success("Location created successfully");

			// Don't close automatically - let user see success state
		} catch (error) {
			console.error("Error creating location:", error);
			toast.error("Failed to create location");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onPlaceSelect = (place: ExtendedGooglePlaceResult) => {
		if (place?.fullAddress) {
			// Set the name field to the first part of the address if it's empty
			if (!form.getValues("name")) {
				form.setValue("name", place.fullAddress.split(",")[0]);
			}

			form.setValue("address", place.address);
			form.setValue("city", place.city);
			form.setValue("state", place.state);
			form.setValue("zipCode", place.zipCode);
			form.setValue("fullAddress", place.fullAddress);

			// Set the country if available in the place data
			if (place.country) {
				form.setValue("country", place.country);
			}

			// Set coordinates if available
			if (place.latitude !== undefined && place.longitude !== undefined) {
				form.setValue("latitude", place.latitude);
				form.setValue("longitude", place.longitude);
			}

			setLocationSelected(true);
		} else {
			form.setValue("address", "");
			form.setValue("city", "");
			form.setValue("state", "");
			form.setValue("zipCode", "");
			form.setValue("fullAddress", "");
			form.setValue("country", "");
			form.setValue("latitude", undefined);
			form.setValue("longitude", undefined);
			setLocationSelected(
				place?.locationSelected !== undefined ? place.locationSelected : false
			);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		if (setIsOpened) {
			setIsOpened(newOpen);
		}

		if (!newOpen) {
			// Reset state when sheet closes
			setTimeout(() => {
				setIsCreated(false);
				setCreatedLocation(null);
				setLocationSelected(false); // Reset locationSelected state
				form.reset({
					name: "",
					address: "",
					city: "",
					state: "",
					zipCode: "",
					isActive: true,
					phone: "",
					email: "",
				});
			}, 300); // Wait for sheet close animation
		}
	};

	const handleBulkLocationsCreated = (locations: Location[]) => {
		setBulkImportedLocations(locations);
		setBulkImportComplete(true);

		if (onLocationCreated && locations.length > 0) {
			// Pass the first location to maintain backwards compatibility
			onLocationCreated(locations[0] as ExtendedLocation);
		}
	};

	return (
		<Sheet
			open={isOpened}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent
				className={cn(
					"sm:max-w-[550px] p-0 flex flex-col h-[100dvh]",
					className
				)}
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0">
					<div className="flex items-center gap-2">
						<Building2 className="h-5 w-5 text-primary" />
						<SheetTitle>Create New Location</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className="flex-1 px-6 py-4">
					<div className="space-y-4">
						{isCreated && createdLocation ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-primary/10 p-3 mb-4">
									<CheckCircle className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Location Created!
								</h3>
								<p className="text-muted-foreground mb-2">
									{createdLocation.name} has been created successfully.
								</p>

								{/* Add map preview if coordinates are available */}
								{createdLocation.latitude && createdLocation.longitude && (
									<div className="w-full max-w-xs mb-4 mt-2">
										<GoogleMap
											latitude={createdLocation.latitude}
											longitude={createdLocation.longitude}
											height="150px"
											popupContent={
												<div>
													<div className="font-medium">
														{createdLocation.name}
													</div>
													<div className="text-xs">
														{createdLocation.address}
													</div>
												</div>
											}
										/>
									</div>
								)}

								<div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
									<Button
										onClick={() => {
											handleOpenChange(false);
										}}>
										Close
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setIsCreated(false);
											setCreatedLocation(null);
											form.reset({
												name: "",
												address: "",
												city: "",
												state: "",
												zipCode: "",
												isActive: true,
												phone: "",
												email: "",
											});
										}}>
										Create Another Location
									</Button>
								</div>
							</div>
						) : bulkImportComplete ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-primary/10 p-3 mb-4">
									<CheckCircle className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Locations Imported!
								</h3>
								<p className="text-muted-foreground mb-2">
									{bulkImportedLocations.length} locations have been imported
									successfully.
								</p>
								<div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
									<Button
										onClick={() => {
											handleOpenChange(false);
										}}>
										Close
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setBulkImportComplete(false);
											setBulkImportedLocations([]);
											setActiveTab("bulk");
										}}>
										Import More Locations
									</Button>
								</div>
							</div>
						) : (
							<Tabs
								value={activeTab}
								onValueChange={(value) =>
									setActiveTab(value as "single" | "bulk")
								}
								className="space-y-4">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="single">Single Location</TabsTrigger>
									<TabsTrigger value="bulk">Bulk Import</TabsTrigger>
								</TabsList>

								<TabsContent value="single">
									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="space-y-4">
											{/* Name Field with Google Places Suggestions */}
											<FormField
												control={form.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-base">
															Enter Location Name or Address
														</FormLabel>
														<FormControl>
															<div
																className="relative"
																ref={nameFieldRef}>
																<GooglePlacesAutocomplete
																	onPlaceSelect={onPlaceSelect}
																	placeholder="Start typing a business name or address..."
																	className="mb-0"
																/>
															</div>
														</FormControl>
														<FormDescription>
															Type a business name or address to quickly create
															a location
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											{/* Address Information in Accordion or Read-only Display */}
											{locationSelected ? (
												<div className="mt-4 border rounded-md p-4 bg-muted/20">
													<div className="flex items-center text-sm font-medium mb-2">
														<MapPin className="h-4 w-4 mr-1 text-primary" />
														Address Information
														<span className="ml-auto text-xs text-muted-foreground">
															Auto-populated
														</span>
													</div>
													<div className="grid gap-2 text-sm">
														{form.watch("address") && (
															<div>
																<div className="text-muted-foreground text-xs">
																	Street Address
																</div>
																<div>{form.watch("address")}</div>
															</div>
														)}
														<div className="grid grid-cols-3 gap-2">
															{form.watch("city") && (
																<div>
																	<div className="text-muted-foreground text-xs">
																		City
																	</div>
																	<div>{form.watch("city")}</div>
																</div>
															)}
															{form.watch("state") && (
																<div>
																	<div className="text-muted-foreground text-xs">
																		State
																	</div>
																	<div>{form.watch("state")}</div>
																</div>
															)}
															{form.watch("zipCode") && (
																<div>
																	<div className="text-muted-foreground text-xs">
																		ZIP
																	</div>
																	<div>{form.watch("zipCode")}</div>
																</div>
															)}
														</div>

														{/* Map Preview */}
														{form.watch("latitude") &&
															form.watch("longitude") && (
																<div className="mt-4">
																	<div className="text-muted-foreground text-xs mb-1">
																		Map Preview
																	</div>
																	<GoogleMap
																		latitude={form.watch("latitude") || 0}
																		longitude={form.watch("longitude") || 0}
																		height="150px"
																	/>
																</div>
															)}
													</div>
												</div>
											) : (
												<Accordion
													type="single"
													collapsible
													defaultValue=""
													className="mt-4">
													<AccordionItem
														value="address-info"
														className="border-b-0">
														<AccordionTrigger className="py-2 rounded-md hover:bg-accent/50">
															<div className="flex items-center text-sm font-medium">
																<MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
																Address Information
																<span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
																	Optional
																</span>
															</div>
														</AccordionTrigger>
														<AccordionContent>
															<div className="space-y-4 pt-2">
																<p className="text-xs text-muted-foreground">
																	You can create a location with just a name, or
																	add address details if needed.
																</p>

																{/* Address Field using Google Places Autocomplete */}
																<FormItem>
																	<FormLabel>Address Search</FormLabel>
																	<GooglePlacesAutocomplete
																		onPlaceSelect={onPlaceSelect}
																		placeholder="Search for an address..."
																		className="mb-0"
																	/>
																	<FormDescription>
																		Search for an address to auto-fill the
																		fields below
																	</FormDescription>
																</FormItem>

																{/* Editable Address Fields for manual adjustment */}
																<FormField
																	control={form.control}
																	name="address"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>Street Address</FormLabel>
																			<FormControl>
																				<div className="relative">
																					<Input
																						placeholder="Street address"
																						{...field}
																						className="pl-9"
																					/>
																					<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
																				</div>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																{/* City, State, Zip */}
																<div className="grid grid-cols-2 gap-4">
																	<FormField
																		control={form.control}
																		name="city"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>City</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="City"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<div className="grid grid-cols-2 gap-2">
																		<FormField
																			control={form.control}
																			name="state"
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel>State</FormLabel>
																					<FormControl>
																						<Input
																							placeholder="State"
																							{...field}
																						/>
																					</FormControl>
																					<FormMessage />
																				</FormItem>
																			)}
																		/>

																		<FormField
																			control={form.control}
																			name="zipCode"
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel>ZIP</FormLabel>
																					<FormControl>
																						<Input
																							placeholder="ZIP"
																							{...field}
																						/>
																					</FormControl>
																					<FormMessage />
																				</FormItem>
																			)}
																		/>
																	</div>
																</div>
															</div>
														</AccordionContent>
													</AccordionItem>
												</Accordion>
											)}

											{/* Contact Information */}
											<div className="grid grid-cols-2 gap-4">
												<FormPhoneInput
													control={form.control}
													name="phone"
													label="Phone"
													placeholder="Enter phone number"
													countryField="country"
												/>

												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email</FormLabel>
															<FormControl>
																<Input
																	placeholder="Email address"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											{/* Active Status */}
											<FormField
												control={form.control}
												name="isActive"
												render={({ field }) => (
													<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
														<div className="space-y-1 leading-none">
															<FormLabel>Active Location</FormLabel>
															<FormDescription>
																This location will be available for scheduling
																if active
															</FormDescription>
														</div>
													</FormItem>
												)}
											/>

											<div className="flex justify-end space-x-2 pt-4">
												<Button
													type="button"
													variant="outline"
													onClick={() => handleOpenChange(false)}
													disabled={isSubmitting}>
													Cancel
												</Button>
												<Button
													type="submit"
													disabled={isSubmitting}>
													{isSubmitting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Creating...
														</>
													) : (
														<>
															<Plus className="mr-2 h-4 w-4" />
															Create Location
														</>
													)}
												</Button>
											</div>
										</form>
									</Form>
								</TabsContent>

								<TabsContent value="bulk">
									<BulkLocationImport
										organizationId={organizationId}
										onLocationsCreated={handleBulkLocationsCreated}
										onCancel={() => setActiveTab("single")}
									/>
								</TabsContent>
							</Tabs>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
