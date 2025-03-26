import { useState } from "react";
import { Employee, EmployeesAPI, Location, LocationsAPI } from "../api";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle, MapPin } from "lucide-react";

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
	onLocationsAssigned: (locationIds: string[]) => void;
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

	const isControlled = controlledOpen !== undefined;
	const isOpened = isControlled ? controlledOpen : open;
	const setIsOpened = isControlled ? setControlledOpen! : setOpen;

	// Filter the locations for assignment
	const getFilteredLocations = () => {
		if (!searchTerm) return allLocations;

		// Filter by name if search term is present
		return allLocations.filter((loc) =>
			loc.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
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
		if (!employeeId || selectedLocationIds.length === 0) return;

		try {
			setIsSubmitting(true);

			// Get the current employee data
			const employee = await EmployeesAPI.getById(employeeId);
			if (employee) {
				// Update the employee with the new location assignments
				await EmployeesAPI.update(employeeId, {
					...employee,
					// Use a custom property to store the assigned locations
					// @ts-ignore - locationAssignments is a custom property for multi-location support
					locationAssignments: selectedLocationIds,
					// Keep the primary location as the first one for backwards compatibility
					// @ts-ignore - locationAssignment is a custom property from the existing code
					locationAssignment: selectedLocationIds[0] || null,
				});
			}

			setAssignedCount(selectedLocationIds.length);
			onLocationsAssigned(selectedLocationIds);
			setIsAssigned(true);

			toast.success(
				`${selectedLocationIds.length} location(s) assigned to this employee`
			);
		} catch (error) {
			console.error("Error assigning locations:", error);
			toast.error("Failed to assign locations");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle sheet open/close
	const handleOpenChange = (newOpen: boolean) => {
		if (isSubmitting) return; // Prevent closing during submission

		if (setIsOpened) {
			setIsOpened(newOpen);
		}

		if (!newOpen) {
			// Reset state when sheet closes
			setTimeout(() => {
				setIsAssigned(false);
				setSearchTerm("");
				setAssignedCount(0);
			}, 300); // Wait for sheet close animation
		}
	};

	return (
		<Sheet
			open={isOpened}
			onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent
				className={cn(
					"sm:max-w-[550px] p-0 flex flex-col h-[100dvh]",
					className
				)}
				side="right">
				<SheetHeader className="px-6 py-4 border-b text-left flex-shrink-0">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-primary" />
						<SheetTitle>Assign Locations to {employeeName}</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className="flex-1 px-6 py-4">
					<div className="space-y-4">
						{isAssigned ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="rounded-full bg-primary/10 p-3 mb-4">
									<CheckCircle className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Locations Assigned!
								</h3>
								<p className="text-muted-foreground mb-2">
									{assignedCount} location{assignedCount !== 1 ? "s" : ""}{" "}
									assigned to {employeeName}
								</p>
								<div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
									<Button
										onClick={() => {
											handleOpenChange(false);
										}}>
										Close
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setIsAssigned(false);
										}}>
										Modify Assignments
									</Button>
								</div>
							</div>
						) : (
							<div>
								{/* Search box */}
								<div className="mb-6">
									<Input
										placeholder="Search locations..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full"
									/>
								</div>

								{/* Instructions */}
								<p className="text-sm text-muted-foreground mb-4">
									Select the locations to assign to this employee.
								</p>

								{/* Locations list */}
								<div className="space-y-2">
									{getFilteredLocations().map((location) => {
										const isSelected = selectedLocationIds.includes(
											location.id
										);
										return (
											<div
												key={location.id}
												className={cn(
													"flex items-center gap-3 p-3 border rounded hover:bg-accent/5 cursor-pointer",
													isSelected &&
														"bg-primary/5 border-primary/20 hover:bg-primary/10"
												)}
												onClick={() => toggleLocationSelection(location.id)}>
												<Checkbox
													checked={isSelected}
													onCheckedChange={() =>
														toggleLocationSelection(location.id)
													}
													className="rounded-sm"
												/>
												<div className="flex-1 min-w-0">
													<div className="font-medium">{location.name}</div>
													<div className="text-xs text-muted-foreground truncate">
														{location.address &&
															`${location.address}${
																location.city ? `, ${location.city}` : ""
															}${location.state ? `, ${location.state}` : ""}`}
													</div>
												</div>
											</div>
										);
									})}

									{getFilteredLocations().length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											No locations found matching your search.
										</div>
									)}
								</div>

								<div className="flex justify-end space-x-2 pt-8">
									<Button
										type="button"
										variant="outline"
										onClick={() => handleOpenChange(false)}
										disabled={isSubmitting}>
										Cancel
									</Button>
									<Button
										onClick={assignLocationsToEmployee}
										disabled={selectedLocationIds.length === 0 || isSubmitting}>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Assigning...
											</>
										) : (
											<>
												<Building2 className="mr-2 h-4 w-4" />
												Assign {selectedLocationIds.length} Location
												{selectedLocationIds.length !== 1 ? "s" : ""}
											</>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
