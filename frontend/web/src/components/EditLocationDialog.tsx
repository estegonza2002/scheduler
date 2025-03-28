/**
 * @deprecated Use LocationFormDialog with mode="edit" instead
 */

import { LocationFormDialog } from "@/components/LocationFormDialog";
import { Location } from "@/api";

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
 * @deprecated Use LocationFormDialog with mode="edit" instead
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
	// Just forward to the new component
	return (
		<LocationFormDialog
			mode="edit"
			location={location}
			onSuccess={onLocationUpdated}
			trigger={trigger}
			open={open}
			onOpenChange={onOpenChange}
			className={className}
		/>
	);
}
