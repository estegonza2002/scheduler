import { Location } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	MapPin,
	Building2,
	Calendar,
	Clock,
	Info,
	Users,
	LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * Props for the LocationDetailDialog component
 */
interface LocationDetailDialogProps {
	/**
	 * The location data to display details for
	 */
	location: Location;
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
 * Dialog component for displaying detailed location information
 */
export function LocationDetailDialog({
	location,
	trigger,
	open,
	onOpenChange,
	className,
}: LocationDetailDialogProps) {
	// Format address parts into a single string with proper separators
	const fullAddress = [
		location.address,
		location.city,
		location.state,
		location.zipCode,
	]
		.filter(Boolean)
		.join(", ")
		.replace(/, ([^,]*)$/, " $1");

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent
				className={cn(
					"sm:max-w-[550px] max-h-[90vh] flex flex-col",
					className
				)}>
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle className="flex items-center">
							<MapPin className="h-5 w-5 mr-2 text-primary" />
							Location Details
						</DialogTitle>
						{location.isActive !== false ? (
							<Badge className="ml-2">Active</Badge>
						) : (
							<Badge
								variant="outline"
								className="text-muted-foreground border-muted-foreground/30">
								Inactive
							</Badge>
						)}
					</div>
					<DialogDescription>
						Information about {location.name}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 -mx-6 px-6">
					<div className="space-y-6 py-2">
						{/* Location Header */}
						<div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
							<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
								<Building2 className="h-7 w-7 text-primary" />
							</div>
							<div className="min-w-0">
								<h3 className="text-xl font-semibold">{location.name}</h3>
								{fullAddress && (
									<p className="text-sm text-muted-foreground mt-1 break-words">
										{fullAddress}
									</p>
								)}
							</div>
						</div>

						{/* Additional Details */}
						<div className="space-y-4">
							<h4 className="text-sm font-medium flex items-center">
								<Info className="h-4 w-4 mr-2 text-muted-foreground" />
								Location Details
							</h4>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Address Section */}
								{(location.address || location.city || location.state) && (
									<div className="space-y-2 p-3 rounded-md border">
										<h5 className="text-sm font-medium flex items-center">
											<MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
											Address
										</h5>
										<Separator className="my-1.5" />
										<div className="space-y-1.5 text-sm">
											{location.address && (
												<div className="flex items-start gap-2">
													<Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
													<span>{location.address}</span>
												</div>
											)}
											{(location.city ||
												location.state ||
												location.zipCode) && (
												<div className="flex items-start gap-2">
													<div className="w-4 shrink-0" />
													<span>
														{location.city}
														{location.city && location.state ? ", " : ""}
														{location.state} {location.zipCode}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Organization Section */}
								<div className="space-y-2 p-3 rounded-md border">
									<h5 className="text-sm font-medium flex items-center">
										<Users className="h-4 w-4 mr-2 text-muted-foreground" />
										Organization
									</h5>
									<Separator className="my-1.5" />
									<div className="space-y-1.5 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">ID:</span>
											<span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">
												{location.organizationId}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter className="mt-4 flex gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange?.(false)}
						className="w-full sm:w-auto">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
