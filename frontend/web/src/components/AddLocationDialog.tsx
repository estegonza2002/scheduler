import { useState } from "react";
import { Location, LocationsAPI } from "@/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
	Loader2,
	MapPin,
	Plus,
	CheckCircle,
	Building,
	Building2,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
 * Props for the AddLocationDialog component
 */
interface AddLocationDialogProps {
	/**
	 * The organization ID that the location belongs to
	 */
	organizationId: string;
	/**
	 * Callback fired when locations are added
	 */
	onLocationsAdded: (locations: Location[]) => void;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
}

/**
 * Dialog component for adding a new location
 */
export function AddLocationDialog({
	organizationId,
	onLocationsAdded,
	trigger,
	className,
}: AddLocationDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [addedLocation, setAddedLocation] = useState<Location | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			isActive: true,
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);
			const newLocation = await LocationsAPI.create({
				...data,
				organizationId,
			});
			onLocationsAdded([newLocation]);
			setAddedLocation(newLocation);
			form.reset();
			toast.success("Location added successfully");
		} catch (error) {
			console.error("Error adding location:", error);
			toast.error("Failed to add location");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePlaceSelect = (place: GooglePlaceResult) => {
		form.setValue("address", place.address);
		form.setValue("city", place.city);
		form.setValue("state", place.state);
		form.setValue("zipCode", place.zipCode);

		// If no name is set yet, use the address as the name
		if (!form.getValues("name")) {
			form.setValue("name", place.address);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		setOpen(newOpen);
		if (!newOpen) {
			// Reset form and state when dialog closes
			setTimeout(() => {
				if (!open) {
					form.reset();
					setAddedLocation(null);
				}
			}, 300); // Wait for dialog close animation
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			{trigger ? (
				<DialogTrigger asChild>{trigger}</DialogTrigger>
			) : (
				<DialogTrigger asChild>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Location
					</Button>
				</DialogTrigger>
			)}
			<DialogContent
				className={cn(
					"sm:max-w-[550px] overflow-hidden flex flex-col max-h-[90vh]",
					className
				)}>
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle className="flex items-center">
							<Building2 className="h-5 w-5 mr-2 text-primary" />
							Add Location
							{addedLocation && (
								<Badge
									variant="outline"
									className="ml-2 bg-primary/10 text-primary border-primary/20">
									Added
								</Badge>
							)}
						</DialogTitle>
					</div>
					<DialogDescription>
						Create a new location for your business
					</DialogDescription>
				</DialogHeader>

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

								{addedLocation ? (
									<div className="flex items-center space-x-2 rounded-md bg-muted/50 p-4 mt-4">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<div className="ml-2">
											<p className="text-sm font-medium">
												{addedLocation.name} has been added successfully.
											</p>
											<p className="text-sm text-muted-foreground">
												You can add another location or close this dialog.
											</p>
										</div>
									</div>
								) : null}
							</form>
						</Form>
					</div>
				</ScrollArea>

				<DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isSubmitting}
						className="sm:mr-auto">
						{addedLocation ? "Close" : "Cancel"}
					</Button>

					{addedLocation ? (
						<Button
							type="button"
							onClick={() => {
								setAddedLocation(null);
								form.reset();
							}}>
							<Plus className="h-4 w-4 mr-2" />
							Add Another Location
						</Button>
					) : (
						<Button
							type="button"
							onClick={form.handleSubmit(onSubmit)}
							disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<Building2 className="mr-2 h-4 w-4" />
									Add Location
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
