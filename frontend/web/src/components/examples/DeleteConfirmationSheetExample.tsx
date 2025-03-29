import { useState } from "react";
import { AlertTriangle, Trash2, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface Location {
	id: string;
	name: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
}

interface DeleteConfirmationSheetExampleProps {
	location: Location;
	onLocationDeleted: (locationId: string) => void;
}

/**
 * Example component showing how to implement a confirmation sheet
 * using standard ShadCN components directly with Tailwind
 */
export function DeleteConfirmationSheetExample({
	location,
	onLocationDeleted,
}: DeleteConfirmationSheetExampleProps) {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Handle successful deletion
			onLocationDeleted(location.id);
			toast.success(`${location.name} deleted successfully`);
		} catch (error) {
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		} finally {
			setIsDeleting(false);
			setOpen(false);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-destructive hover:bg-destructive/10">
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Location
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<Trash2 className="h-5 w-5 text-destructive" />
						<SheetTitle>Delete Location</SheetTitle>
					</div>
					<SheetDescription>
						Are you sure you want to delete {location.name}?
					</SheetDescription>
				</SheetHeader>

				<div className="my-4 space-y-4">
					<div className="p-4 bg-destructive/10 rounded-md border border-destructive/30 flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm font-medium text-destructive-foreground">
								This action cannot be undone
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Deleting this location will remove all associated data,
								including shifts scheduled at this location.
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
				</div>

				<SheetFooter className="flex flex-col-reverse sm:flex-row mt-2 gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
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
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
