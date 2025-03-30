import { useState } from "react";
import { Location } from "@/api";
import { Button } from "@/components/ui/button";
import { Building, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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

/**
 * Props for the LocationEditSheet component
 */
interface LocationEditSheetProps {
	/**
	 * The location data to be edited
	 */
	location: Location;

	/**
	 * The ID of the organization that owns this location
	 */
	organizationId: string;

	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;

	/**
	 * Optional callback fired when a location is updated
	 */
	onLocationUpdated?: (location: Location) => void;

	/**
	 * Controls whether the sheet is open
	 */
	open?: boolean;

	/**
	 * Callback for when the open state changes
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
	organizationId,
	trigger,
	onLocationUpdated,
	open,
	onOpenChange,
	className,
}: LocationEditSheetProps) {
	const [isComplete, setIsComplete] = useState(false);
	const [internalOpen, setInternalOpen] = useState(false);
	const [formState, setFormState] = useState<{
		isDirty: boolean;
		isValid: boolean;
		isSubmitting: boolean;
		isEditing: boolean;
		submit: () => void;
	} | null>(null);

	// Determine if we're using controlled or uncontrolled open state
	const isControlled = open !== undefined && onOpenChange !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when sheet closes
			setTimeout(() => {
				if (!isOpen) {
					setIsComplete(false);
					setFormState(null);
				}
			}, 300); // Wait for sheet close animation
		}

		if (isControlled) {
			onOpenChange!(newOpenState);
		} else {
			setInternalOpen(newOpenState);
		}
	};

	const handleLocationUpdate = (updatedLocation: Location) => {
		setIsComplete(true);
		if (onLocationUpdated) {
			onLocationUpdated(updatedLocation);
		}
		toast.success(`${updatedLocation.name} has been updated successfully.`);
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

	return (
		<Sheet
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger || <Button>Edit Location</Button>}
			</SheetTrigger>

			<SheetContent
				side="right"
				className={className}
				onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<Building className="h-5 w-5 text-primary" />
							<SheetTitle>Edit Location</SheetTitle>
						</div>
						<SheetDescription>
							Update information for {location.name}
						</SheetDescription>
					</SheetHeader>
				</div>

				<ScrollArea className="flex-1 px-6 my-4">
					<div>
						<LocationForm
							organizationId={organizationId}
							initialData={location}
							onSuccess={handleLocationUpdate}
							onFormReady={handleFormReady}
						/>
					</div>
				</ScrollArea>

				{isComplete ? (
					<SheetFooter className="px-6 py-4">
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							Close
						</Button>
					</SheetFooter>
				) : (
					<SheetFooter className="px-6 py-4">
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={formState?.isSubmitting}>
							Cancel
						</Button>
						<Button
							onClick={() => formState?.submit()}
							disabled={formState?.isSubmitting || !formState?.isDirty}>
							{formState?.isSubmitting ? (
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
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
