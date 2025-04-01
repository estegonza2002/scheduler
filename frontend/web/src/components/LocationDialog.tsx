import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Location, LocationsAPI } from "@/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { GoogleMap } from "@/components/ui/google-map";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Extended Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	imageUrl?: string;
}

// Extend GooglePlaceResult to include country if needed
interface ExtendedGooglePlaceResult extends GooglePlaceResult {
	country?: string;
	latitude?: number;
	longitude?: number;
	name?: string;
	hasValidAddress?: boolean;
}

// Form schema
const formSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
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
	email: z.string().optional().or(z.literal("")),
	imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Props for the LocationDialog component
 */
interface LocationDialogProps {
	/**
	 * The organization ID to create the location in
	 */
	organizationId: string;
	/**
	 * Callback fired when location is created
	 */
	onLocationCreated?: (location: ExtendedLocation) => void;
	/**
	 * Custom trigger element (required)
	 */
	trigger: React.ReactNode;
	/**
	 * Controls whether the dialog is open
	 */
	open?: boolean;
	/**
	 * Callback fired when the open state changes
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
	/**
	 * Optional location data for editing
	 */
	location?: ExtendedLocation;
	/**
	 * Whether dialog is in edit mode
	 */
	isEditing?: boolean;
}

/**
 * Dialog component for creating a new location
 */
export function LocationDialog({
	organizationId,
	onLocationCreated,
	trigger,
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	className,
	location,
	isEditing,
}: LocationDialogProps) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showManualAddress, setShowManualAddress] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [showMap, setShowMap] = useState(false);

	// Determine if we're using controlled or uncontrolled open state
	const isControlled =
		controlledOpen !== undefined && setControlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : open;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: location?.name || "",
			address: location?.address || "",
			city: location?.city || "",
			state: location?.state || "",
			zipCode: location?.zipCode || "",
			country: location?.country || "",
			latitude: location?.latitude,
			longitude: location?.longitude,
			isActive: location?.isActive !== false, // Default to true if undefined
			phone: location?.phone || "",
			email: location?.email || "",
			imageUrl: location?.imageUrl || "",
		},
	});

	// Force form reset when location or editing mode changes
	useEffect(() => {
		// Always start with showMap set to false
		setShowMap(false);

		console.log("LocationDialog: useEffect triggered", {
			isEditing,
			hasLocation: !!location,
			latitude: location?.latitude,
			longitude: location?.longitude,
		});

		if (location && isEditing) {
			// Set the selected address for display if available
			if (location.address) {
				let addressDisplay = location.address || "";
				if (location.city)
					addressDisplay += location.address
						? `, ${location.city}`
						: location.city;
				if (location.state) addressDisplay += `, ${location.state}`;
				if (location.zipCode) addressDisplay += ` ${location.zipCode}`;

				if (addressDisplay.trim()) {
					setSelectedAddress(addressDisplay);
				}
			}

			// Reset form with location data
			form.reset({
				name: location.name || "",
				address: location.address || "",
				city: location.city || "",
				state: location.state || "",
				zipCode: location.zipCode || "",
				country: location.country || "",
				latitude: location.latitude,
				longitude: location.longitude,
				isActive: location.isActive !== false,
				phone: location.phone || "",
				email: location.email || "",
				imageUrl: location.imageUrl || "",
			});

			// Show map if latitude and longitude are available
			if (location.latitude && location.longitude) {
				console.log("LocationDialog: Setting showMap to true", {
					latitude: location.latitude,
					longitude: location.longitude,
				});
				setShowMap(true);
			}
		}
	}, [location, isEditing, isOpen, form]);

	// Add dedicated effect for map visibility
	useEffect(() => {
		// If we're editing and have coordinates, always show the map
		if (isEditing && location?.latitude && location?.longitude) {
			setShowMap(true);
		}
	}, [isEditing, location, isOpen]);

	// Watch form coordinates for map display
	useEffect(() => {
		const lat = form.watch("latitude");
		const lng = form.watch("longitude");

		if (lat && lng) {
			setShowMap(true);
		}
	}, [form.watch("latitude"), form.watch("longitude")]);

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when dialog closes
			setTimeout(() => {
				if (!isOpen) {
					setIsComplete(false);
					setSelectedAddress(null);
					setShowManualAddress(false);
					// Only reset form if not in edit mode
					if (!isEditing) {
						form.reset();
					}
				}
			}, 300); // Wait for dialog close animation
		} else if (newOpenState && isEditing && location) {
			// When opening dialog in edit mode, set the form values
			const formValues = {
				name: location.name || "",
				address: location.address || "",
				city: location.city || "",
				state: location.state || "",
				zipCode: location.zipCode || "",
				country: location.country || "",
				latitude: location.latitude,
				longitude: location.longitude,
				isActive: location.isActive !== false,
				phone: location.phone || "",
				email: location.email || "",
				imageUrl: location.imageUrl || "",
			};

			// For debugging
			console.log("Setting form values in handleOpenChange:", {
				lat: location.latitude,
				lng: location.longitude,
				formValues,
			});

			form.reset(formValues);

			// Set address display
			if (location.address) {
				let addressDisplay = location.address || "";
				if (location.city)
					addressDisplay += location.address
						? `, ${location.city}`
						: location.city;
				if (location.state) addressDisplay += `, ${location.state}`;
				if (location.zipCode) addressDisplay += ` ${location.zipCode}`;

				if (addressDisplay.trim()) {
					setSelectedAddress(addressDisplay);
				}
			}

			// Show map if coordinates are available
			if (location.latitude && location.longitude) {
				console.log("Setting showMap=true in handleOpenChange");
				setShowMap(true);
			}
		}

		if (isControlled) {
			setControlledOpen(newOpenState);
		} else {
			setOpen(newOpenState);
		}
	};

	// Handle successful location creation/update
	const processSuccessfulSubmit = useCallback(
		(createdLocation: ExtendedLocation) => {
			// Call the callback if provided
			if (onLocationCreated) {
				onLocationCreated(createdLocation);
			}

			// Close the dialog for both create and update
			if (isControlled) {
				setControlledOpen(false);
			} else {
				setOpen(false);
			}

			// Navigate to the location detail page for both create and update
			navigate(`/locations/${createdLocation.id}`);
		},
		[onLocationCreated, navigate, isControlled, setControlledOpen]
	);

	// Memoize the submit function to avoid recreating it on every render
	const onSubmit = useCallback(
		async (data: FormValues) => {
			try {
				setIsSubmitting(true);

				let result: ExtendedLocation;

				if (isEditing && location) {
					// Update existing location
					const locationToUpdate = {
						...data,
					};

					// Ensure name is defined as it's required by the API
					if (!locationToUpdate.name) {
						toast.error("Location name is required");
						return;
					}

					// Use the update method with the correct parameter type
					const locationToUpdateWithId = {
						id: location.id,
						...locationToUpdate,
					};

					const updatedLocation = await LocationsAPI.update(
						locationToUpdateWithId as Partial<Location> & { id: string }
					);

					if (!updatedLocation) {
						throw new Error("Failed to update location");
					}

					// Store the extended properties locally
					result = {
						...updatedLocation,
						phone: locationToUpdate.phone || "",
						email: locationToUpdate.email || "",
						country: locationToUpdate.country || "",
					};

					toast.success(`${updatedLocation.name} updated successfully`);
				} else {
					// Create new location
					const locationToCreate = {
						...data,
						organizationId,
					};

					// Ensure name is defined as it's required by the API
					if (!locationToCreate.name) {
						toast.error("Location name is required");
						return;
					}

					// Only include properties that exist in the Location interface
					const newLocation = await LocationsAPI.create({
						name: locationToCreate.name,
						address: locationToCreate.address,
						city: locationToCreate.city,
						state: locationToCreate.state,
						zipCode: locationToCreate.zipCode,
						latitude: locationToCreate.latitude,
						longitude: locationToCreate.longitude,
						isActive: locationToCreate.isActive,
						imageUrl: locationToCreate.imageUrl,
						organizationId,
						// country, phone, and email are used locally but not sent to API
					});

					// Store the extended properties locally
					result = {
						...newLocation,
						phone: locationToCreate.phone || "",
						email: locationToCreate.email || "",
						country: locationToCreate.country || "",
					};

					toast.success(`${newLocation.name} created successfully`);
				}

				processSuccessfulSubmit(result);
			} catch (error) {
				console.error(
					`Error ${isEditing ? "updating" : "creating"} location:`,
					error
				);
				toast.error(`Failed to ${isEditing ? "update" : "create"} location`);
			} finally {
				setIsSubmitting(false);
			}
		},
		[organizationId, isEditing, location, processSuccessfulSubmit]
	);

	// Modified place select handler to set selected address
	const handlePlaceSelect = useCallback(
		(place: ExtendedGooglePlaceResult) => {
			// Verify that the place has at least some address information
			if (!place.address && !place.city) {
				toast.error("Please select a location with an address");
				return;
			}

			// Build a display string for the selected address
			let addressDisplay = place.address || "";
			if (place.city)
				addressDisplay += place.address ? `, ${place.city}` : place.city;
			if (place.state) addressDisplay += `, ${place.state}`;
			if (place.zipCode) addressDisplay += ` ${place.zipCode}`;

			// If we still don't have a valid address, reject the selection
			if (!addressDisplay.trim()) {
				toast.error("Please select a location with a valid address");
				return;
			}

			setSelectedAddress(addressDisplay);
			setShowManualAddress(false);

			// Better business name detection
			// 1. Check if place.name exists
			// 2. Check if place.name is different from both the address and the full address display
			// 3. If name field is empty, use the place.name

			// Most business names from Google Places API are different from the address
			const placeName = place.name || "";
			const placeAddress = place.address || "";
			const isLikelyBusinessName =
				!!placeName &&
				placeName !== placeAddress &&
				placeName !== addressDisplay &&
				// Sometimes the name might be just part of the address (like the street name)
				// So check if the name is not contained in the address
				!placeAddress.includes(placeName) &&
				!addressDisplay.includes(placeName);

			console.log("Place selected:", {
				name: place.name,
				address: place.address,
				addressDisplay,
				isLikelyBusinessName,
			});

			// Only prepopulate the name field if it's likely a business name and name field is empty
			if (isLikelyBusinessName && !form.getValues("name") && placeName) {
				console.log("Using business name for location name:", placeName);
				form.setValue("name", placeName, { shouldDirty: true });
			}

			// Set form values for submission with shouldDirty flag
			form.setValue("address", place.address || "", { shouldDirty: true });
			form.setValue("city", place.city || "", { shouldDirty: true });
			form.setValue("state", place.state || "", { shouldDirty: true });
			form.setValue("zipCode", place.zipCode || "", { shouldDirty: true });

			if (place.country) {
				form.setValue("country", place.country, { shouldDirty: true });
			}

			if (place.latitude !== undefined && place.longitude !== undefined) {
				form.setValue("latitude", place.latitude, { shouldDirty: true });
				form.setValue("longitude", place.longitude, { shouldDirty: true });
			}

			// Trigger validation to update form state
			form.trigger();
		},
		[form]
	);

	const clearSelectedAddress = () => {
		setSelectedAddress(null);
		form.setValue("address", "", { shouldDirty: true });
		form.setValue("city", "", { shouldDirty: true });
		form.setValue("state", "", { shouldDirty: true });
		form.setValue("zipCode", "", { shouldDirty: true });
		form.setValue("country", "", { shouldDirty: true });
		form.setValue("latitude", undefined, { shouldDirty: true });
		form.setValue("longitude", undefined, { shouldDirty: true });

		// Trigger validation to update form state
		form.trigger();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent>
				<h2 className="text-lg font-semibold mb-4">
					{isEditing ? "Edit Location" : "Add New Location"}
				</h2>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6">
						<FormItem>
							<FormLabel>Location Name or Address</FormLabel>

							{!selectedAddress ? (
								<>
									<GooglePlacesAutocomplete
										onPlaceSelect={handlePlaceSelect}
										placeholder="Search for an address using Google..."
									/>
									<button
										type="button"
										className="text-primary text-sm mt-2"
										onClick={() => setShowManualAddress(true)}>
										Enter address manually instead
									</button>
								</>
							) : (
								<div className="flex items-center justify-between p-3 rounded border bg-muted/30 mt-1">
									<span>{selectedAddress}</span>
									<button
										type="button"
										onClick={clearSelectedAddress}
										className="ml-2 text-muted-foreground hover:text-foreground">
										<X className="h-4 w-4" />
									</button>
								</div>
							)}
						</FormItem>

						{showManualAddress && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-medium">Manual Address Entry</h3>
									<button
										type="button"
										className="text-primary text-sm"
										onClick={() => setShowManualAddress(false)}>
										Cancel manual entry
									</button>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Street Address</FormLabel>
												<FormControl>
													<Input
														placeholder="Street address"
														{...field}
														aria-invalid={!!form.formState.errors.address}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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
														aria-invalid={!!form.formState.errors.city}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="state"
										render={({ field }) => (
											<FormItem>
												<FormLabel>State/Province</FormLabel>
												<FormControl>
													<Input
														placeholder="State or province"
														{...field}
														aria-invalid={!!form.formState.errors.state}
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
												<FormLabel>Postal Code</FormLabel>
												<FormControl>
													<Input
														placeholder="Postal code"
														{...field}
														aria-invalid={!!form.formState.errors.zipCode}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						)}

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Location name"
											{...field}
											aria-required="true"
											aria-invalid={!!form.formState.errors.name}
											required
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Map Display */}
						{(showMap ||
							(isEditing && location?.latitude && location?.longitude) ||
							(form.watch("latitude") && form.watch("longitude"))) && (
							<div className="mt-4">
								<FormLabel className="block mb-2">Map Preview</FormLabel>
								<GoogleMap
									latitude={form.watch("latitude") || location?.latitude || 0}
									longitude={
										form.watch("longitude") || location?.longitude || 0
									}
									height="180px"
									className="border rounded-md"
									zoom={14}
								/>
							</div>
						)}

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<FormPhoneInput
											placeholder="Phone number"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Email address"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Active Location</FormLabel>
										<FormDescription>
											This location will be available for scheduling if active.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<div className="flex justify-end gap-2 mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						type="button"
						disabled={isSubmitting || !form.formState.isValid}
						onClick={form.handleSubmit(onSubmit)}>
						{isSubmitting
							? isEditing
								? "Updating..."
								: "Saving..."
							: isEditing
							? "Update Location"
							: "Save Location"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
