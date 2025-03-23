import { Location } from "../api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { MapPin, Building2, Mail, Phone } from "lucide-react";

interface LocationDetailDialogProps {
	location: Location;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function LocationDetailDialog({
	location,
	trigger,
	open,
	onOpenChange,
}: LocationDetailDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			{trigger}
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Location Details</DialogTitle>
					<DialogDescription>
						View detailed information about this location
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Location information */}
					<div className="flex gap-4">
						<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
							<MapPin className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">{location.name}</h3>
							<Badge variant={location.isActive ? "default" : "outline"}>
								{location.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
					</div>

					{/* Address details */}
					{(location.address || location.city || location.state) && (
						<div className="space-y-1">
							<h4 className="text-sm font-medium text-muted-foreground">
								Address
							</h4>
							<div className="grid grid-cols-1 gap-1">
								{location.address && (
									<div className="flex items-start gap-2">
										<Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
										<div>
											<div>{location.address}</div>
											<div>
												{location.city}
												{location.city && location.state ? ", " : ""}
												{location.state} {location.zipCode}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Organization ID */}
					<div className="space-y-1">
						<h4 className="text-sm font-medium text-muted-foreground">
							Organization ID
						</h4>
						<div className="text-sm">{location.organizationId}</div>
					</div>
				</div>

				<DialogFooter className="mt-6">
					<Button
						variant="outline"
						onClick={() => onOpenChange?.(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
