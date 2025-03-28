import { useState, useEffect } from "react";
import { Location, LocationsAPI } from "@/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
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
	Pencil,
	Plus,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DialogHeader } from "@/components/ui/dialog-header";
import { GoogleMap } from "./ui/google-map";
import { Badge } from "./ui/badge";

// Form schema
const formSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	isActive: z.boolean().default(true),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Props for the LocationFormDialog component
 */
interface LocationFormDialogProps {
	/**
	 * Mode of operation - add or edit
	 */
	mode: "add" | "edit";
	/**
	 * The organization ID that the location belongs to (for add mode)
	 */
	organizationId?: string;
	/**
	 * The location data to be edited (for edit mode)
	 */
	location?: Location;
	/**
	 * Callback fired when location is created or updated
	 */
	onSuccess: (location: Location) => void;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
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
}

/**
 * Dialog component for adding or editing a location
 */
export function LocationFormDialog({
	mode,
	organizationId,
	location,
	onSuccess,
	trigger,
	open,
	onOpenChange,
	className,
}: LocationFormDialogProps) {
	const [isOpen, setIsOpen] = useState(open || false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [showMap, setShowMap] = useState(false);

	// Initialize the form based on mode
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues:
			mode === "edit" && location
				? {
						name: location.name,
						address: location.address || "",
						city: location.city || "",
						state: location.state || "",
						zipCode: location.zipCode || "",
						isActive: location.isActive !== false, // Default to true if undefined
						latitude: location.latitude,
						longitude: location.longitude,
				  }
				: {
						name: "",
						address: "",
						city: "",
						state: "",
						zipCode: "",
						isActive: true,
						latitude: undefined,
						longitude: undefined,
				  },
	});

	// Determine if we have coordinates for the map
	const hasCoordinates = form.watch("latitude") && form.watch("longitude");

	// Set up map display after first render
	useEffect(() => {
		if (hasCoordinates) {
			setShowMap(true);
		}
	}, [hasCoordinates]);

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);

			let result: Location;

			if (mode === "edit" && location) {
				// Update existing location
				// @ts-ignore: Type mismatch is okay here
				result = await LocationsAPI.update(
					location.id,
					data as Partial<Location>
				);
				toast.success("Location updated successfully");
			} else if (mode === "add" && organizationId) {
				// Create new location with required fields
				const locationData = {
					name: data.name,
					organizationId,
					address: data.address,
					city: data.city,
					state: data.state,
					zipCode: data.zipCode,
					isActive: data.isActive,
					latitude: data.latitude,
					longitude: data.longitude,
				};
				// @ts-ignore: Type mismatch is okay here
				result = await LocationsAPI.create(locationData);
				toast.success("Location added successfully");
			} else {
				throw new Error("Invalid operation mode or missing required data");
			}

			onSuccess(result);
			setIsSuccess(true);

			// Close dialog after successful submission
			if (mode === "add") {
				// @ts-ignore: handleOpenChange is defined later
				handleOpenChange(false);
			}
		} catch (error) {
			console.error(
				`Error ${mode === "edit" ? "updating" : "adding"} location:`,
				error
			);
			toast.error(`Failed to ${mode === "edit" ? "update" : "add"} location`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePlaceSelect = (place: GooglePlaceResult) => {
		form.setValue("address", place.address);
		form.setValue("city", place.city);
		form.setValue("state", place.state);
		form.setValue("zipCode", place.zipCode);

		// Store coordinates
		if (place.latitude && place.longitude) {
			form.setValue("latitude", place.latitude);
			form.setValue("longitude", place.longitude);
			setShowMap(true);
		}

		// If no name is set yet and we're in add mode, use the address as the name
		if (mode === "add" && !form.getValues("name") && place.address) {
			form.setValue("name", place.address);
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

	const handleOpenChange = (newOpen: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		if (onOpenChange) {
			onOpenChange(newOpen);
		}

		setIsOpen(newOpen);

		if (!newOpen) {
			// Reset state when dialog closes
			setTimeout(() => {
				setIsSuccess(false);
			}, 300); // Wait for dialog close animation
		}
	};

	// Create title with icon
	const dialogTitle = (
		<>
			<Building2 className="h-5 w-5 mr-2 text-primary" />
			{mode === "edit" ? "Edit" : "Add"} Location
			{isSuccess && (
				<Badge
					variant="outline"
					className="ml-2 bg-primary/10 text-primary border-primary/20">
					{mode === "edit" ? "Updated" : "Added"}
				</Badge>
			)}
		</>
	);

	return (
		<Dialog
			open={open !== undefined ? open : isOpen}
			onOpenChange={handleOpenChange}>
			{trigger}
			<DialogContent
				className={cn(
					"sm:max-w-[550px] overflow-hidden flex flex-col max-h-[90vh]",
					className
				)}>
				<DialogHeader
					title={dialogTitle as unknown as string}
					description={
						mode === "edit"
							? `Update details for ${location?.name}`
							: "Create a new location for your business"
					}
					titleClassName="flex items-center"
					onClose={() => handleOpenChange(false)}
				/>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="p-1">
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
										showMap={false} // We'll show our own map below instead
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

								{/* Map Display */}
								{showMap && hasCoordinates && (
									<div className="mt-2">
										<FormLabel className="block mb-2">Map Preview</FormLabel>
										<GoogleMap
											latitude={form.getValues("latitude") as number}
											longitude={form.getValues("longitude") as number}
											height="200px"
											className="border rounded-md"
										/>
									</div>
								)}

								{/* Active Checkbox */}
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
													This location will be available for scheduling if
													active
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>

								{/* Coordinates (hidden) */}
								<input
									type="hidden"
									{...form.register("latitude", { valueAsNumber: true })}
								/>
								<input
									type="hidden"
									{...form.register("longitude", { valueAsNumber: true })}
								/>

								<DialogFooter className="pt-2">
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
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												{mode === "edit" ? "Updating..." : "Adding..."}
											</>
										) : isSuccess ? (
											<>
												<CheckCircle className="h-4 w-4 mr-2" />
												{mode === "edit" ? "Updated" : "Added"}
											</>
										) : (
											<>
												{mode === "edit" ? (
													<>
														<Pencil className="h-4 w-4 mr-2" />
														Update Location
													</>
												) : (
													<>
														<Plus className="h-4 w-4 mr-2" />
														Add Location
													</>
												)}
											</>
										)}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
