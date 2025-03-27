import { useState } from "react";
import { Location, LocationsAPI } from "@/api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertTriangle,
	Building2,
	Loader2,
	MapPin,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Props for the DeleteLocationDialog component
 */
interface DeleteLocationDialogProps {
	/**
	 * The location data to be deleted
	 */
	location: Location;
	/**
	 * Callback fired when a location is deleted
	 */
	onLocationDeleted: (locationId: string) => void;
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
 * Dialog component for confirming location deletion
 */
export function DeleteLocationDialog({
	location,
	onLocationDeleted,
	trigger,
	open,
	onOpenChange,
	className,
}: DeleteLocationDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await LocationsAPI.delete(location.id);
			onLocationDeleted(location.id);
			onOpenChange?.(false);
			toast.success(`${location.name} deleted successfully`);
		} catch (error) {
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (isDeleting) return; // Prevent closing during deletion
		if (onOpenChange) {
			onOpenChange(newOpen);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			{trigger}
			<DialogContent className={cn("sm:max-w-[450px]", className)}>
				<DialogHeader>
					<DialogTitle className="flex items-center text-destructive">
						<Trash2 className="h-5 w-5 mr-2" />
						Delete Location
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete {location.name}?
					</DialogDescription>
				</DialogHeader>

				<div className="my-3 p-4 bg-destructive/10 rounded-md border border-destructive/30 flex items-start gap-3">
					<AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-sm font-medium text-destructive-foreground">
							This action cannot be undone
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Deleting this location will remove all associated data, including
							shifts scheduled at this location.
						</p>
					</div>
				</div>

				<div className="border rounded-md p-4 bg-muted/50 space-y-1.5">
					<div className="flex items-center">
						<Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
						<h3 className="font-medium">{location.name}</h3>
					</div>

					{location.address && (
						<div className="flex items-start gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<p className="text-sm text-muted-foreground">
								{location.address}
								{location.city && `, ${location.city}`}
								{location.state && `, ${location.state}`}
								{location.zipCode && ` ${location.zipCode}`}
							</p>
						</div>
					)}
				</div>

				<DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isDeleting}
						className="sm:mr-auto">
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
						className={isDeleting ? "opacity-80" : ""}>
						{isDeleting ? (
							<>
								<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Location
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
