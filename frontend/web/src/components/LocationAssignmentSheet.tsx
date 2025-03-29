import { useState, useEffect } from "react";
import { Employee, EmployeesAPI, Location, LocationsAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle, MapPin } from "lucide-react";
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

/**
 * Props for the LocationAssignmentSheet component
 */
interface LocationAssignmentSheetProps {
	/**
	 * Employee ID to assign locations to
	 */
	employeeId: string;
	/**
	 * Employee name for display purposes
	 */
	employeeName: string;
	/**
	 * List of all locations that could be assigned
	 */
	allLocations: Location[];
	/**
	 * List of location IDs already assigned to the employee
	 */
	assignedLocationIds: string[];
	/**
	 * Callback fired when locations are assigned
	 */
	onLocationsAssigned: (locationIds: string[]) => Promise<boolean> | boolean;
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

/**
 * Sheet component for assigning locations to an employee
 */
export function LocationAssignmentSheet({
	employeeId,
	employeeName,
	allLocations,
	assignedLocationIds,
	onLocationsAssigned,
	trigger,
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	className,
}: LocationAssignmentSheetProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAssigned, setIsAssigned] = useState(false);
	const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
		assignedLocationIds || []
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [assignedCount, setAssignedCount] = useState(0);

	// Determine if we're using controlled or uncontrolled open state
	const isControlled =
		controlledOpen !== undefined && setControlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : open;

	// Update selected locations when assigned locations change or when sheet opens
	useEffect(() => {
		if (isOpen) {
			setSelectedLocationIds(assignedLocationIds || []);
		}
	}, [isOpen, assignedLocationIds]);

	// Filter the locations for assignment
	const getFilteredLocations = () => {
		let filteredLocations = allLocations;

		// Filter by search term if present
		if (searchTerm) {
			filteredLocations = filteredLocations.filter((loc) =>
				loc.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return filteredLocations;
	};

	// Check if a location is already assigned
	const isLocationAssigned = (locationId: string) => {
		return assignedLocationIds.includes(locationId);
	};

	// Toggle location selection
	const toggleLocationSelection = (locationId: string) => {
		setSelectedLocationIds((prev) =>
			prev.includes(locationId)
				? prev.filter((id) => id !== locationId)
				: [...prev, locationId]
		);
	};

	// Assign selected locations to the employee
	const assignLocationsToEmployee = async () => {
		if (!employeeId || selectedLocationIds.length === 0) {
			toast.error("Please select at least one location to assign");
			return;
		}

		try {
			setIsSubmitting(true);

			// Call the parent callback which will handle the assignment
			const success = await onLocationsAssigned(selectedLocationIds);

			if (success) {
				setAssignedCount(selectedLocationIds.length);
				setIsAssigned(true);
				// Success message is handled in the parent component
			} else {
				// If the parent callback returned false, don't show success state
				throw new Error("Failed to update employee locations");
			}
		} catch (error) {
			console.error("Error assigning locations:", error);
			toast.error("Failed to assign locations. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle sheet open/close
	const handleOpenChange = (newOpenState: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		if (newOpenState) {
			// Reset success state when opening the sheet
			setIsAssigned(false);
			setSearchTerm("");
		} else {
			// Reset state when sheet closes
			setTimeout(() => {
				setIsAssigned(false);
				setSearchTerm("");
				setAssignedCount(0);
			}, 300); // Wait for sheet close animation
		}

		if (isControlled && setControlledOpen) {
			setControlledOpen(newOpenState);
		} else {
			setOpen(newOpenState);
		}
	};

	// Success state content
	const renderSuccessState = () => (
		<div className="flex flex-col items-center py-4 text-center">
			<div className="rounded-full bg-primary/10 p-3 mb-4">
				<CheckCircle className="h-8 w-8 text-primary" />
			</div>
			<h3 className="text-xl font-semibold mb-2">
				{assignedCount} Location{assignedCount !== 1 ? "s" : ""} Assigned
			</h3>
			<p className="text-muted-foreground mb-4">
				Locations successfully assigned to {employeeName}.
			</p>
			<div className="flex gap-3 mt-2">
				<Button onClick={() => handleOpenChange(false)}>Close</Button>
				<Button
					variant="outline"
					onClick={() => setIsAssigned(false)}>
					Modify Assignments
				</Button>
			</div>
		</div>
	);

	// Selection state content
	const renderSelectionState = () => (
		<div className="space-y-4">
			<div className="relative">
				<Input
					placeholder="Search locations..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9"
				/>
				<Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
			</div>

			<p className="text-sm text-muted-foreground">
				Select the locations to assign to this employee.
			</p>

			<div className="border rounded-md divide-y">
				{getFilteredLocations().length > 0 ? (
					getFilteredLocations().map((location) => {
						const isSelected = selectedLocationIds.includes(location.id);
						const isAlreadyAssigned = isLocationAssigned(location.id);

						return (
							<div
								key={location.id}
								className={cn(
									"flex items-center p-3 hover:bg-accent cursor-pointer",
									isSelected && "bg-primary/10 hover:bg-primary/15"
								)}
								onClick={() => toggleLocationSelection(location.id)}>
								<Checkbox
									checked={isSelected}
									className="mr-3"
									onCheckedChange={() => toggleLocationSelection(location.id)}
								/>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{location.name}</div>
									<div className="text-xs text-muted-foreground truncate">
										{location.address || "No address provided"}
									</div>
								</div>
								{isAlreadyAssigned && (
									<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
										Current
									</span>
								)}
							</div>
						);
					})
				) : (
					<div className="p-4 text-center text-muted-foreground">
						No locations found matching your search.
					</div>
				)}
			</div>
		</div>
	);

	return (
		<Sheet
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				{trigger || (
					<Button>
						<MapPin className="h-4 w-4 mr-2" />
						Assign Locations
					</Button>
				)}
			</SheetTrigger>

			<SheetContent
				className={cn("sm:max-w-md p-0 flex flex-col h-full", className)}>
				<div className="p-6 pb-0">
					<SheetHeader>
						<div className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-primary" />
							<SheetTitle>Assign Locations</SheetTitle>
						</div>
						<SheetDescription>
							Assign locations to {employeeName}
						</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 px-6 my-4 overflow-auto">
					{isAssigned ? renderSuccessState() : renderSelectionState()}
				</div>

				{!isAssigned && (
					<SheetFooter className="px-6 py-4 sticky bottom-0 bg-background border-t">
						<Button
							onClick={assignLocationsToEmployee}
							disabled={isSubmitting || selectedLocationIds.length === 0}
							className="w-full">
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Assigning...
								</>
							) : (
								<>
									Assign {selectedLocationIds.length} Location
									{selectedLocationIds.length !== 1 ? "s" : ""}
								</>
							)}
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
