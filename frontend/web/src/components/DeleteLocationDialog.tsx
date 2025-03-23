import { useState } from "react";
import { Location, LocationsAPI } from "../api";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteLocationDialogProps {
	location: Location;
	onLocationDeleted: (locationId: string) => void;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function DeleteLocationDialog({
	location,
	onLocationDeleted,
	trigger,
	open,
	onOpenChange,
}: DeleteLocationDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await LocationsAPI.delete(location.id);
			onLocationDeleted(location.id);
			onOpenChange?.(false);
			toast.success("Location deleted successfully");
		} catch (error) {
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!isDeleting) {
					onOpenChange?.(newOpen);
				}
			}}>
			{trigger}
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						<DialogTitle>Delete Location</DialogTitle>
					</div>
					<DialogDescription>
						Are you sure you want to delete this location? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>

				<div className="border rounded-md p-4 bg-muted/50">
					<h3 className="font-medium">{location.name}</h3>
					{location.address && (
						<p className="text-sm text-muted-foreground mt-1">
							{location.address}
							{location.city && `, ${location.city}`}
							{location.state && `, ${location.state}`}
							{location.zipCode && ` ${location.zipCode}`}
						</p>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange?.(false)}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}>
						{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Delete Location
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
