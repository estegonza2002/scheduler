import { LocationFormDialog } from "@/components/LocationFormDialog";
import { Location } from "@/api";

/**
 * @deprecated Use LocationFormDialog with mode="add" instead
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
 * @deprecated Use LocationFormDialog with mode="add" instead
 * Dialog component for adding a new location
 */
export function AddLocationDialog({
	organizationId,
	onLocationsAdded,
	trigger,
	className,
}: AddLocationDialogProps) {
	// Just forward to the new component
	return (
		<LocationFormDialog
			mode="add"
			organizationId={organizationId}
			onSuccess={(location) => onLocationsAdded([location])}
			trigger={trigger}
			className={className}
		/>
	);
}
