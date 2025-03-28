import { useState } from "react";
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
	Image as ImageIcon,
	Loader2,
	MapPin,
	Pencil,
	Upload,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
	imageUrl?: string;
}

// Extend GooglePlaceResult to include country if needed
interface ExtendedGooglePlaceResult extends GooglePlaceResult {
	country?: string;
	latitude?: number;
	longitude?: number;
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
	email: z.string().optional().or(z.literal("")), // Allow empty string
	imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Props for the LocationEditSheet component
 */
interface LocationEditSheetProps {
	/**
	 * The location data to be edited
	 */
	location: ExtendedLocation;
	/**
	 * Callback fired when location is updated
	 */
	onLocationUpdated: (location: ExtendedLocation) => void;
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

/**
 * Sheet component for editing an existing location
 */
export function LocationEditSheet({
	location,
	onLocationUpdated,
	trigger,
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	className,
}: LocationEditSheetProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);
	const [updatedLocationData, setUpdatedLocationData] =
		useState<ExtendedLocation | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);

	const isControlled = controlledOpen !== undefined;
	const isOpened = isControlled ? controlledOpen : open;
	const setIsOpened = isControlled ? setControlledOpen! : setOpen;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: location.name,
			address: location.address || "",
			city: location.city || "",
			state: location.state || "",
			zipCode: location.zipCode || "",
			country: location.country || "",
			latitude: location.latitude,
			longitude: location.longitude,
			isActive: location.isActive !== false, // Default to true if undefined
			phone: location.phone || "",
			email: location.email || "",
			imageUrl: location.imageUrl || "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);
			const updatedLocation = (await LocationsAPI.update(
				location.id as unknown as string & Partial<Location> & { id: string },
				data
			)) as ExtendedLocation;
			onLocationUpdated(updatedLocation);
			setIsUpdated(true);

			// Store the updated location for display on success screen
			setUpdatedLocationData(updatedLocation);

			toast.success("Location updated successfully");
			setTimeout(() => {
				if (setIsOpened) {
					setIsOpened(false);
				}
			}, 1000);
		} catch (error) {
			console.error("Error updating location:", error);
			toast.error("Failed to update location");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePlaceSelect = (place: ExtendedGooglePlaceResult) => {
		form.setValue("address", place.address);
		form.setValue("city", place.city);
		form.setValue("state", place.state);
		form.setValue("zipCode", place.zipCode);

		// Set country if available
		if (place.country) {
			form.setValue("country", place.country);
		}

		// Set coordinates if available
		if (place.latitude !== undefined && place.longitude !== undefined) {
			form.setValue("latitude", place.latitude);
			form.setValue("longitude", place.longitude);
		}
	};

	// Generate a default value for Google Places Autocomplete
	const getFullAddressString = () => {
		const { address, city, state, zipCode } = form.getValues();
		if (!address) return "";

		let fullAddress = address;
		if (city) fullAddress += `, ${city}`;
		if (state) fullAddress += `, ${state}`;
		if (zipCode) fullAddress += ` ${zipCode}`;

		return fullAddress;
	};

	// Handle image upload
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check if file is an image
		if (!file.type.startsWith("image/")) {
			toast.error("Please upload an image file");
			return;
		}

		// Check file size (limit to 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size should be less than 5MB");
			return;
		}

		try {
			setUploadingImage(true);

			// In a real application, you would upload the image to a server
			// For this demo, we'll create a local URL for the image
			const imageUrl = URL.createObjectURL(file);

			// Update the form with the new image URL
			form.setValue("imageUrl", imageUrl);

			toast.success("Image uploaded successfully");
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload image");
		} finally {
			setUploadingImage(false);
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
				setIsUpdated(false);
				form.reset({
					name: location.name,
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
			}, 300); // Wait for sheet close animation
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
						<SheetTitle>Edit Location</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className="flex-1 px-6 py-4">
					<div className="space-y-4">
						{isUpdated ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-primary/10 p-3 mb-4">
									<CheckCircle className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">Location Updated</h3>
								<p className="text-muted-foreground">
									The location has been updated successfully.
								</p>

								{/* Add map preview if coordinates are available */}
								{updatedLocationData?.latitude &&
									updatedLocationData?.longitude && (
										<div className="w-full max-w-xs my-4">
											<GoogleMap
												latitude={updatedLocationData.latitude}
												longitude={updatedLocationData.longitude}
												height="150px"
												popupContent={
													<div>
														<div className="font-medium">
															{updatedLocationData.name}
														</div>
														<div className="text-xs">
															{updatedLocationData.address}
														</div>
													</div>
												}
											/>
										</div>
									)}

								<Button
									className="mt-6"
									onClick={() => handleOpenChange(false)}>
									Close
								</Button>
							</div>
						) : (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4">
									{/* Name Field */}
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															placeholder="Location name"
															{...field}
															className="pl-9"
														/>
														<Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Address Field using Google Places Autocomplete */}
									<FormItem>
										<FormLabel>Address Search</FormLabel>
										<GooglePlacesAutocomplete
											onPlaceSelect={handlePlaceSelect}
											defaultValue={getFullAddressString()}
											placeholder="Search for an address..."
											className="mb-0"
										/>
										<FormDescription>
											Search for an address to auto-fill the fields below
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

									{/* Add the Image Upload section before the Map Preview */}
									<FormField
										control={form.control}
										name="imageUrl"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Location Image</FormLabel>
												<FormControl>
													<div className="space-y-2">
														{field.value && (
															<div className="relative overflow-hidden rounded border h-40 w-full">
																<img
																	src={field.value}
																	alt="Location"
																	className="h-full w-full object-cover"
																/>
															</div>
														)}
														<div className="flex items-center gap-2">
															<Input
																type="file"
																id="imageUpload"
																accept="image/*"
																className="hidden"
																onChange={handleImageUpload}
															/>
															<label
																htmlFor="imageUpload"
																className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
																{uploadingImage ? (
																	<>
																		<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																		Uploading...
																	</>
																) : (
																	<>
																		<Upload className="mr-2 h-4 w-4" />
																		Upload Image
																	</>
																)}
															</label>
															{field.value && (
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={() => form.setValue("imageUrl", "")}>
																	Remove
																</Button>
															)}
														</div>
														{!field.value && (
															<p className="text-xs text-muted-foreground">
																Upload an image for this location. The image
																will be displayed on location cards.
															</p>
														)}
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Map Preview */}
									{form.watch("latitude") && form.watch("longitude") && (
										<div className="mt-2 mb-4">
											<div className="text-sm font-medium mb-1">
												Map Preview
											</div>
											<GoogleMap
												latitude={form.watch("latitude") || 0}
												longitude={form.watch("longitude") || 0}
												height="180px"
											/>
										</div>
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
														This location will be available for scheduling if
														active
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
													Updating...
												</>
											) : (
												<>
													<Pencil className="mr-2 h-4 w-4" />
													Update Location
												</>
											)}
										</Button>
									</div>
								</form>
							</Form>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
