import { useState, useEffect, useCallback } from "react";
import { Location, LocationsAPI } from "@/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	Loader2,
	MapPin,
	Pencil,
	Plus,
	Upload,
	Mail,
	Phone,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { GoogleMap } from "@/components/ui/google-map";
import { uploadImage, deleteImage } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { FormSection } from "@/components/ui/form-section";

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
	email: z.string().optional().or(z.literal("")),
	imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
	/**
	 * The ID of the organization that owns this location
	 */
	organizationId: string;

	/**
	 * Initial location data (if editing)
	 */
	initialData?: ExtendedLocation;

	/**
	 * Callback fired when location is created or updated
	 */
	onSuccess: (location: ExtendedLocation) => void;

	/**
	 * Optional callback when user cancels the form
	 */
	onCancel?: () => void;

	/**
	 * Optional callback to expose form state and submit function to parent component
	 */
	onFormReady?: (formState: {
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	}) => void;
}

/**
 * Form component for creating or editing a location
 */
export function LocationForm({
	organizationId,
	initialData,
	onSuccess,
	onCancel,
	onFormReady,
}: LocationFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const { user } = useAuth();

	const isEditing = !!initialData;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: initialData?.name || "",
			address: initialData?.address || "",
			city: initialData?.city || "",
			state: initialData?.state || "",
			zipCode: initialData?.zipCode || "",
			country: initialData?.country || "",
			latitude: initialData?.latitude,
			longitude: initialData?.longitude,
			isActive: initialData?.isActive !== false,
			phone: initialData?.phone || "",
			email: initialData?.email || "",
			imageUrl: initialData?.imageUrl || "",
		},
	});

	// Expose form state and submit function to parent component
	useEffect(() => {
		if (onFormReady) {
			onFormReady({
				isDirty: form.formState.isDirty,
				isValid: form.formState.isValid,
				isSubmitting,
				isEditing,
				submit: form.handleSubmit(onSubmit),
			});
		}
	}, [form.formState.isDirty, form.formState.isValid, isSubmitting, isEditing]);

	// Memoize the submit function to avoid recreating it on every render
	const onSubmit = useCallback(
		async (data: FormValues) => {
			setIsSubmitting(true);
			try {
				// Prepare the data object containing only fields defined in the core Location type for the API
				// Use 'undefined' for optional fields not provided, as expected by API/types
				const locationDataForApi = {
					name: data.name,
					address: data.address || undefined,
					city: data.city || undefined,
					state: data.state || undefined,
					zipCode: data.zipCode || undefined,
					latitude: data.latitude ?? undefined,
					longitude: data.longitude ?? undefined,
					isActive: data.isActive,
					imageUrl: data.imageUrl || undefined,
				};

				// Prepare the extended data object including local-only fields for the onSuccess callback
				const extendedLocalData = {
					phone: data.phone || undefined,
					email: data.email || undefined,
					country: data.country || undefined,
				};

				if (isEditing && initialData) {
					// Update existing location
					const locationToUpdate = {
						...locationDataForApi,
					};

					// Call update with ID and data separately
					const updatedLocation = await LocationsAPI.update(
						initialData.id,
						locationToUpdate as Partial<Location> // API expects Partial<Location>
					);

					if (!updatedLocation) {
						throw new Error(
							"Update failed: Location not found or error occurred."
						);
					}

					// Combine API result with local extended data for the callback
					// Ensure the final object conforms to ExtendedLocation
					const result: ExtendedLocation = {
						...updatedLocation,
						...extendedLocalData,
						// Ensure correct types (API might return null, type expects undefined)
						latitude: updatedLocation.latitude ?? undefined,
						longitude: updatedLocation.longitude ?? undefined,
						imageUrl: updatedLocation.imageUrl ?? undefined,
					};
					onSuccess(result);
					toast.success(`${updatedLocation.name} updated successfully`);
				} else {
					// Create new location
					const locationToCreate = {
						...locationDataForApi,
						organizationId,
					};

					// API expects Omit<Location, 'id'>
					const newLocation = await LocationsAPI.create(
						locationToCreate as Omit<Location, "id">
					);

					if (!newLocation) {
						throw new Error("Create failed: Error occurred during creation.");
					}

					// Combine API result with local extended data for the callback
					// Ensure the final object conforms to ExtendedLocation
					const result: ExtendedLocation = {
						...newLocation,
						...extendedLocalData,
						// Ensure correct types (API might return null, type expects undefined)
						latitude: newLocation.latitude ?? undefined,
						longitude: newLocation.longitude ?? undefined,
						imageUrl: newLocation.imageUrl ?? undefined,
					};
					onSuccess(result);
					toast.success(`${newLocation.name} created successfully`);
				}
			} catch (error) {
				console.error("Error saving location:", error);
				toast.error(
					`Failed to ${isEditing ? "update" : "create"} location. ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[isEditing, initialData, organizationId, onSuccess]
	);

	// Memoize the place select handler
	const handlePlaceSelect = useCallback(
		(place: ExtendedGooglePlaceResult) => {
			form.setValue("address", place.address);
			form.setValue("city", place.city);
			form.setValue("state", place.state);
			form.setValue("zipCode", place.zipCode);

			if (place.country) {
				form.setValue("country", place.country);
			}

			if (place.latitude !== undefined && place.longitude !== undefined) {
				form.setValue("latitude", place.latitude);
				form.setValue("longitude", place.longitude);
			}
		},
		[form]
	);

	const getFullAddressString = () => {
		const { address, city, state, zipCode } = form.getValues();
		if (!address) return "";

		let fullAddress = address;
		if (city) fullAddress += `, ${city}`;
		if (state) fullAddress += `, ${state}`;
		if (zipCode) fullAddress += ` ${zipCode}`;

		return fullAddress;
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file (e.g., JPG, PNG, GIF).");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast.error("Image size must be less than 5MB.");
			return;
		}

		if (!user) {
			toast.error("Authentication required to upload images.");
			return;
		}

		let uploadToastId: string | number | undefined;
		try {
			setUploadingImage(true);
			uploadToastId = toast.loading("Uploading image...");

			const storagePath = `location-images/org-${organizationId}/${file.name}`;
			const imageUrl = await uploadImage(file, storagePath);

			form.setValue("imageUrl", imageUrl, { shouldDirty: true });
			toast.success("Image uploaded successfully", { id: uploadToastId });
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error(
				`Upload failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				{ id: uploadToastId }
			);
		} finally {
			setUploadingImage(false);
			// Clear the file input so the same file can be selected again if needed
			if (e.target) {
				e.target.value = "";
			}
		}
	};

	const handleRemoveImage = async () => {
		const currentImageUrl = form.getValues("imageUrl");

		if (!currentImageUrl) {
			toast.info("No image to remove.");
			return;
		}

		if (!user) {
			toast.error("Authentication required to remove images.");
			return;
		}

		let removeToastId: string | number | undefined;
		try {
			setUploadingImage(true); // Reuse uploading state for loading indicator
			removeToastId = toast.loading("Removing image...");

			await deleteImage(currentImageUrl);

			form.setValue("imageUrl", "", { shouldDirty: true });
			toast.success("Image removed successfully", { id: removeToastId });
		} catch (error) {
			console.error("Error removing image from storage:", error);
			// Still remove from form even if storage deletion fails
			form.setValue("imageUrl", "", { shouldDirty: true });
			toast.warning(
				`Failed to delete image from storage, but removed from form. ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				{ id: removeToastId }
			);
		} finally {
			setUploadingImage(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6">
				<FormSection
					title="Basic Information"
					description="Enter the location name and status">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Name <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="Location name"
												{...field}
												className="pl-9"
												aria-required="true"
												aria-invalid={!!form.formState.errors.name}
												required
											/>
											<Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
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
					</div>
				</FormSection>

				<FormSection
					title="Address Information"
					description="Enter the location address details">
					<div className="space-y-4">
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

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
													aria-invalid={!!form.formState.errors.address}
												/>
												<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											</div>
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

						{form.watch("latitude") && form.watch("longitude") && (
							<div className="mt-2 mb-4">
								<div className="text-sm font-medium mb-1">Map Preview</div>
								<GoogleMap
									latitude={form.watch("latitude") || 0}
									longitude={form.watch("longitude") || 0}
									height="180px"
								/>
							</div>
						)}
					</div>
				</FormSection>

				<FormSection
					title="Contact Information"
					description="Add contact details for this location">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormPhoneInput
							control={form.control}
							name="phone"
							label="Phone Number"
							placeholder="Enter phone number"
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="location@example.com"
												type="email"
												{...field}
												className="pl-9"
												aria-invalid={!!form.formState.errors.email}
											/>
											<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				<FormSection
					title="Location Image"
					description="Upload an image for this location (optional)">
					<div className="space-y-2">
						{form.watch("imageUrl") && (
							<div className="relative overflow-hidden rounded border h-40 w-full">
								<img
									src={form.watch("imageUrl")}
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
							{form.watch("imageUrl") && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleRemoveImage}>
									Remove
								</Button>
							)}
						</div>
						{!form.watch("imageUrl") && (
							<p className="text-xs text-muted-foreground">
								Upload an image for this location. The image will be displayed
								on location cards.
							</p>
						)}
					</div>
				</FormSection>

				<Button
					type="submit"
					disabled={!form.formState.isValid || isSubmitting}>
					{isSubmitting ? "Submitting..." : "Submit"}
				</Button>
			</form>
		</Form>
	);
}
