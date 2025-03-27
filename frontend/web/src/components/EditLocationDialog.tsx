import { useState } from "react";
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
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DialogHeader } from "@/components/ui/dialog-header";

// Form schema
const formSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Props for the EditLocationDialog component
 */
interface EditLocationDialogProps {
	/**
	 * The location data to be edited
	 */
	location: Location;
	/**
	 * Callback fired when location is updated
	 */
	onLocationUpdated: (location: Location) => void;
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
 * Dialog component for editing an existing location
 */
export function EditLocationDialog({
	location,
	onLocationUpdated,
	trigger,
	open,
	onOpenChange,
	className,
}: EditLocationDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: location.name,
			address: location.address || "",
			city: location.city || "",
			state: location.state || "",
			zipCode: location.zipCode || "",
			isActive: location.isActive !== false, // Default to true if undefined
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);
			const updatedLocation = await LocationsAPI.update(location.id, data);
			onLocationUpdated(updatedLocation);
			setIsUpdated(true);
			toast.success("Location updated successfully");
		} catch (error) {
			console.error("Error updating location:", error);
			toast.error("Failed to update location");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePlaceSelect = (place: GooglePlaceResult) => {
		form.setValue("address", place.address);
		form.setValue("city", place.city);
		form.setValue("state", place.state);
		form.setValue("zipCode", place.zipCode);
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

		if (!newOpen) {
			// Reset state when dialog closes
			setTimeout(() => {
				setIsUpdated(false);
			}, 300); // Wait for dialog close animation
		}
	};

	// Create title with icon
	const dialogTitle = (
		<>
			<Building2 className="h-5 w-5 mr-2 text-primary" />
			Edit Location
		</>
	);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			{trigger}
			<DialogContent
				className={cn(
					"sm:max-w-[550px] overflow-hidden flex flex-col max-h-[90vh]",
					className
				)}>
				<DialogHeader
					title={dialogTitle as unknown as string}
					description={`Update details for ${location.name}`}
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

								{/* Submit Button in Form */}
								{!isUpdated && (
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
								)}

								{/* Success State */}
								{isUpdated && (
									<div className="py-4">
										<div className="rounded-lg border border-green-100 bg-green-50 p-4 text-green-800">
											<div className="flex">
												<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
												<div>
													<h3 className="font-medium">Location updated</h3>
													<p className="text-sm text-green-700 mt-1">
														The location has been updated successfully.
													</p>
												</div>
											</div>
										</div>
										<div className="flex justify-end mt-4">
											<Button
												type="button"
												onClick={() => handleOpenChange(false)}>
												Close
											</Button>
										</div>
									</div>
								)}
							</form>
						</Form>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
