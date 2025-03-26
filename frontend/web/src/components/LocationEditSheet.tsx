import { useState } from "react";
import { Location, LocationsAPI } from "../api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
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
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";

// Extended Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
}

// Form schema
const formSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	isActive: z.boolean().default(true),
	phone: z.string().optional(),
	email: z.string().optional().or(z.literal("")), // Allow empty string
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
			isActive: location.isActive !== false, // Default to true if undefined
			phone: location.phone || "",
			email: location.email || "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);
			const updatedLocation = (await LocationsAPI.update(
				location.id,
				data
			)) as ExtendedLocation;
			onLocationUpdated(updatedLocation);
			setIsUpdated(true);
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
					isActive: location.isActive !== false,
					phone: location.phone || "",
					email: location.email || "",
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

									{/* Contact Information */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone</FormLabel>
													<FormControl>
														<Input
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
