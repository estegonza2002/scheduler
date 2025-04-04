import { useState, useRef, useEffect } from "react";
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
	Building2,
	CheckCircle,
	Loader2,
	MapPin,
	Plus,
	ChevronDown,
	Upload,
} from "lucide-react";
import {
	GooglePlacesAutocomplete,
	GooglePlaceResult,
} from "./GooglePlacesAutocomplete";
import { cn } from "@/lib/utils";
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
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationForm } from "./LocationForm";
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

// The schema for the form validation
const LocationSchema = z.object({
	name: z.string().min(2, {
		message: "A descriptive location name is required (minimum 2 characters)",
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
	imageUrl: z.string().optional(),
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
	const [isComplete, setIsComplete] = useState(false);
	const [formState, setFormState] = useState<{
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	} | null>(null);
	const nameFieldRef = useRef<HTMLDivElement>(null);
	const [locationSelected, setLocationSelected] = useState(false);
	const [showNameField, setShowNameField] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const navigate = useNavigate();

	// Determine if we're using controlled or uncontrolled open state
	const isControlled =
		controlledOpen !== undefined && setControlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : open;

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when sheet closes
			setTimeout(() => {
				if (!isOpen) {
					setIsComplete(false);
				}
			}, 300); // Wait for sheet close animation
		}

		if (isControlled) {
			setControlledOpen(newOpenState);
		} else {
			setOpen(newOpenState);
		}
	};

	const handleLocationCreated = (newLocation: ExtendedLocation) => {
		setIsComplete(true);
		if (onLocationCreated) {
			onLocationCreated(newLocation);
		}

		// Log the received location object for debugging
		console.log("Location created, attempting navigation with:", newLocation);

		// Navigate to the new location's detail page
		if (newLocation?.id) {
			navigate(`/locations/${newLocation.id}`);
		} else {
			console.error("Location created but ID is missing, cannot navigate.");
			toast.warning("Location created, but could not navigate to details.");
		}
	};

	const handleFormReady = (state: {
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	}) => {
		setFormState(state);
	};

	// Success state content for single location
	const renderSuccess = () => (
		<div className="flex flex-col items-center py-4 text-center">
			<div className="rounded-full bg-primary/10 p-3 mb-4">
				<CheckCircle className="h-8 w-8 text-primary" />
			</div>
			<h3 className="text-xl font-semibold mb-2">Location Created</h3>
			<p className="text-muted-foreground mb-4">
				Your new location has been created successfully.
			</p>
		</div>
	);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Location
					</Button>
				)}
			</SheetTrigger>

			<SheetContent
				side="right"
				className={className}
				onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<Building className="h-5 w-5 text-primary" />
							<SheetTitle>Add New Location</SheetTitle>
						</div>
						<SheetDescription>Enter location details</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 px-6 my-4">
					{isComplete ? (
						renderSuccess()
					) : (
						<ScrollArea className="h-[calc(100vh-245px)]">
							<LocationForm
								organizationId={organizationId}
								onSuccess={handleLocationCreated}
								onFormReady={handleFormReady}
							/>
						</ScrollArea>
					)}
				</div>

				{isComplete && (
					<SheetFooter className="px-6 py-4">
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							Close
						</Button>
					</SheetFooter>
				)}

				{!isComplete && (
					<SheetFooter className="px-6 py-4">
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={formState?.isSubmitting}>
							Cancel
						</Button>
						<Button
							onClick={() => formState?.submit()}
							disabled={
								formState?.isSubmitting ||
								!formState?.isDirty ||
								!formState?.isValid
							}>
							{formState?.isSubmitting ? (
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
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
