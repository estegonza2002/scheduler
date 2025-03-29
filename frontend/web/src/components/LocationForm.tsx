import { useState, useEffect } from "react";
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
import { Building, Loader2, MapPin, Pencil, Plus, Upload } from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { GoogleMap } from "@/components/ui/google-map";
import { uploadImage, deleteImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

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

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);

			if (isEditing && initialData) {
				// Update existing location
				const locationToUpdate = {
					id: initialData.id,
					...data,
				};

				const updatedLocation = (await LocationsAPI.update(
					locationToUpdate as Partial<Location> & { id: string }
				)) as ExtendedLocation;

				onSuccess(updatedLocation);
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
				const extendedLocation: ExtendedLocation = {
					...newLocation,
					phone: locationToCreate.phone,
					email: locationToCreate.email,
					country: locationToCreate.country,
				};

				onSuccess(extendedLocation);
				toast.success(`${newLocation.name} created successfully`);
			}
		} catch (error) {
			console.error("Error saving location:", error);
			toast.error(`Failed to ${isEditing ? "update" : "create"} location`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePlaceSelect = (place: ExtendedGooglePlaceResult) => {
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
	};

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
			toast.error("Please upload an image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size should be less than 5MB");
			return;
		}

		try {
			setUploadingImage(true);

			// Check auth status
			const { data: sessionData, error: sessionError } =
				await supabase.auth.getSession();

			if (sessionError || !sessionData?.session) {
				console.error("Auth error:", sessionError);
				toast.error("Authentication required to upload images");
				return;
			}

			// Display loading state
			const uploadToast = toast.loading("Uploading image...");

			// Try with public folder to match the policy
			const imageUrl = await uploadImage(file, "location-images", "public");

			// Update form with uploaded image URL
			form.setValue("imageUrl", imageUrl);

			// Dismiss loading toast and show success message
			toast.dismiss(uploadToast);
			toast.success("Image uploaded successfully");
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.dismiss();

			// Check for specific error types
			if (error instanceof Error) {
				const errorMessage = error.message || "Unknown error";

				if (
					errorMessage.includes("not found") ||
					errorMessage.includes("does not exist")
				) {
					toast.error(
						"Storage bucket not found. Please check Supabase configuration."
					);
				} else if (
					errorMessage.includes("Unauthorized") ||
					errorMessage.includes("violates row-level security")
				) {
					toast.error("Permission denied. Please check storage policies.");
				} else {
					toast.error(`Upload failed: ${errorMessage}`);
				}
			} else {
				toast.error(
					"Failed to upload image. Please check your Supabase storage configuration."
				);
			}
		} finally {
			setUploadingImage(false);
		}
	};

	const handleRemoveImage = async () => {
		const currentImageUrl = form.getValues("imageUrl");

		if (currentImageUrl) {
			try {
				setUploadingImage(true);

				// Check auth status
				const { data: sessionData, error: sessionError } =
					await supabase.auth.getSession();
				if (sessionError || !sessionData?.session) {
					console.error("Auth error:", sessionError);
					toast.error("Authentication required to remove images");
					return;
				}

				const removeToast = toast.loading("Removing image...");

				// Try to delete the image from storage
				await deleteImage(currentImageUrl);

				// Clear the image URL in the form
				form.setValue("imageUrl", "");

				toast.dismiss(removeToast);
				toast.success("Image removed");
			} catch (error) {
				console.error("Error removing image:", error);

				// Still remove from form even if delete from storage failed
				form.setValue("imageUrl", "");
				toast.warning("Image removed from form, but may still exist on server");
			} finally {
				setUploadingImage(false);
			}
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4">
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
												onClick={handleRemoveImage}>
												Remove
											</Button>
										)}
									</div>
									{!field.value && (
										<p className="text-xs text-muted-foreground">
											Upload an image for this location. The image will be
											displayed on location cards.
										</p>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

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
									This location will be available for scheduling if active
								</FormDescription>
							</div>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
