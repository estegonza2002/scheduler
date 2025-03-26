import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
} from "../api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	MapPin,
	Building2,
	Mail,
	Phone,
	ChevronLeft,
	Edit,
	Trash,
	Loader2,
	Calendar,
	Eye,
	Clock,
	Users,
	Plus,
	UserPlus,
	X,
} from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Skeleton } from "../components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { format, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import { LocationEditSheet } from "../components/LocationEditSheet";
import { EmployeeAssignmentSheet } from "../components/EmployeeAssignmentSheet";

// Update Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
}

// Interface for employee assignment
interface EmployeeAssignment {
	locationId: string;
	employeeId: string;
	isPrimary?: boolean;
}

export default function LocationDetailPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<ExtendedLocation | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [removeEmployeeId, setRemoveEmployeeId] = useState<string>("");
	const [removeEmployeeDialogOpen, setRemoveEmployeeDialogOpen] =
		useState<boolean>(false);

	useEffect(() => {
		const fetchLocation = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}
				setLocation(locationData);

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				const allShifts = await ShiftsAPI.getAll();
				const locationShifts = allShifts.filter(
					(shift) =>
						shift.location_id === locationId && shift.is_schedule === false
				);

				// Sort shifts by date (most recent first)
				const sortedShifts = locationShifts.sort(
					(a, b) =>
						new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
				);

				setShifts(sortedShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				// Get the organization ID (in a real app this would come from a context or auth)
				const organizationId = "org-1"; // Default organization ID
				const employees = await EmployeesAPI.getAll(organizationId);

				// In a real app, we would have a direct API call for getting employees by location
				// For now, we'll filter by a custom locationAssignment property
				// This is for demo purposes only - in a real app you'd have a proper relation
				const assignedEmployees = employees.filter((employee) => {
					// @ts-ignore - locationAssignment is a custom property we're assuming exists
					return employee.locationAssignment === locationId;
				});

				setAssignedEmployees(assignedEmployees);
				setAllEmployees(employees);
			} catch (error) {
				console.error("Error fetching location details:", error);
				toast.error("Failed to load location details");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchLocation();
	}, [locationId, navigate]);

	const handleDeleteLocation = async () => {
		if (!location) return;

		try {
			await LocationsAPI.delete(location.id);
			toast.success("Location deleted successfully");
			navigate("/locations");
		} catch (error) {
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		}
	};

	// Format time for display (e.g., "9:00 AM - 5:00 PM")
	const formatShiftTime = (startTime: string, endTime: string) => {
		const start = parseISO(startTime);
		const end = parseISO(endTime);
		return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
	};

	// Calculate shift duration
	const calculateShiftHours = (startTime: string, endTime: string) => {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const durationMs = end.getTime() - start.getTime();
		const hours = durationMs / (1000 * 60 * 60);
		return hours.toFixed(1);
	};

	// Separate shifts into upcoming and past
	const getUpcomingAndPastShifts = () => {
		const now = new Date();
		const upcoming: Shift[] = [];
		const past: Shift[] = [];

		shifts.forEach((shift) => {
			const shiftDate = new Date(shift.start_time);
			if (shiftDate >= now) {
				upcoming.push(shift);
			} else {
				past.push(shift);
			}
		});

		// Sort upcoming shifts by date (earliest first)
		upcoming.sort(
			(a, b) =>
				new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
		);

		// Sort past shifts by date (most recent first)
		past.sort(
			(a, b) =>
				new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
		);

		return { upcoming, past };
	};

	// Get upcoming and past shifts
	const { upcoming: upcomingShifts, past: pastShifts } =
		getUpcomingAndPastShifts();

	// Remove an employee from this location
	const removeEmployeeFromLocation = async () => {
		if (!removeEmployeeId) return;

		try {
			// Get the employee to update
			const employee = assignedEmployees.find(
				(emp) => emp.id === removeEmployeeId
			);
			if (employee) {
				// Remove the location assignment
				await EmployeesAPI.update(removeEmployeeId, {
					...employee,
					// @ts-ignore - locationAssignment is a custom property for demo
					locationAssignment: null, // Clear the location
				});

				// Update the UI
				setAssignedEmployees((prev) =>
					prev.filter((emp) => emp.id !== removeEmployeeId)
				);

				toast.success("Employee removed from this location");
			}
			setRemoveEmployeeDialogOpen(false);
		} catch (error) {
			console.error("Error removing employee:", error);
			toast.error("Failed to remove employee");
		}
	};

	// Back button to return to locations list
	const BackButton = (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => navigate("/locations")}
			className="mb-2">
			<ChevronLeft className="h-4 w-4 mr-1" /> Back to Locations
		</Button>
	);

	// Action buttons for the header
	const ActionButtons = location ? (
		<>
			<LocationEditSheet
				location={location}
				onLocationUpdated={(updatedLocation) => {
					setLocation(updatedLocation);
				}}
				trigger={
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-1">
						<Edit className="h-4 w-4" /> Edit
					</Button>
				}
			/>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}>
				<AlertDialogTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-9 text-destructive border-destructive/30">
						<Trash className="h-4 w-4 mr-2" /> Delete
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this location. This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteLocation}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	) : null;

	if (loading) {
		return (
			<ContentContainer>
				{BackButton}
				<LoadingState
					type="skeleton"
					skeletonCount={4}
					skeletonHeight={60}
					message={`Loading ${loadingPhase}...`}
				/>
			</ContentContainer>
		);
	}

	if (!location) {
		return (
			<ContentContainer>
				{BackButton}
				<ContentSection
					title="Location not found"
					description="The requested location could not be found."
					footer={
						<Button
							variant="outline"
							onClick={() => navigate("/locations")}
							className="mt-2">
							Back to Locations
						</Button>
					}>
					<p>
						The location you're looking for may have been removed or doesn't
						exist.
					</p>
				</ContentSection>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			{BackButton}

			<div className="grid gap-6 mt-6">
				{/* Location Header */}
				<ContentSection
					title="Overview"
					flat
					headerActions={ActionButtons}>
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
							<MapPin className="h-8 w-8 text-primary" />
						</div>
						<div>
							<h2 className="text-2xl font-semibold">{location.name}</h2>
							<Badge
								variant={location.isActive ? "default" : "outline"}
								className="mt-1">
								{location.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
					</div>
				</ContentSection>

				{/* Address Information */}
				<ContentSection title="Address Information">
					<div className="space-y-4">
						{location.address && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Street Address</div>
									<div className="text-sm">{location.address}</div>
								</div>
							</div>
						)}

						{(location.city || location.state || location.zipCode) && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<MapPin className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">City/State/Zip</div>
									<div className="text-sm">
										{location.city}
										{location.city && location.state ? ", " : ""}
										{location.state} {location.zipCode}
									</div>
								</div>
							</div>
						)}

						{location.phone && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Phone className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Phone</div>
									<div className="text-sm">{location.phone}</div>
								</div>
							</div>
						)}

						{location.email && (
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Email</div>
									<div className="text-sm">{location.email}</div>
								</div>
							</div>
						)}
					</div>
				</ContentSection>

				{/* Contact Information (if it exists) */}
				{(location.phone || location.email) && (
					<ContentSection title="Contact Information">
						<div className="space-y-4">
							{location.phone && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Phone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Phone</div>
										<div className="text-sm">{location.phone}</div>
									</div>
								</div>
							)}

							{location.email && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Email</div>
										<div className="text-sm">{location.email}</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>
				)}

				{/* Additional Information (if it exists) */}
				{(location.phone || location.email) && (
					<ContentSection title="Additional Information">
						<div className="space-y-4">
							{location.phone && (
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
										<Phone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Phone</div>
										<div className="text-sm">{location.phone}</div>
									</div>
								</div>
							)}

							{location.email && (
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Email</div>
										<div className="text-sm">{location.email}</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>
				)}

				{/* Employees Section */}
				<ContentSection
					title="Assigned Employees"
					description="Employees assigned to this location"
					headerActions={
						<EmployeeAssignmentSheet
							locationId={locationId || ""}
							locationName={location.name}
							allEmployees={allEmployees}
							assignedEmployees={assignedEmployees}
							onEmployeesAssigned={(newlyAssignedEmployees) => {
								setAssignedEmployees((prev) => [
									...prev,
									...newlyAssignedEmployees,
								]);
							}}
							trigger={
								<Button size="sm">
									<UserPlus className="h-4 w-4 mr-2" /> Assign Employees
								</Button>
							}
						/>
					}>
					{assignedEmployees.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{assignedEmployees.map((employee) => (
								<div
									key={employee.id}
									className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/5">
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={employee.avatar}
											alt={employee.name}
										/>
										<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="font-medium">{employee.name}</div>
										<div className="text-sm text-muted-foreground">
											{employee.position || "Staff"}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="text-muted-foreground hover:text-destructive"
										onClick={() => {
											setRemoveEmployeeId(employee.id);
											setRemoveEmployeeDialogOpen(true);
										}}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
							<Users className="h-12 w-12 mb-4 opacity-20" />
							<h3 className="text-lg font-medium mb-1">
								No employees assigned
							</h3>
							<p className="max-w-md">
								No employees have been assigned to this location yet. Click the
								"Assign Employees" button to add employees.
							</p>
						</div>
					)}
				</ContentSection>

				{/* Shifts Section */}
				<ContentSection
					title="Shifts"
					description="All shifts for this location"
					headerActions={
						<ShiftCreationSheet
							scheduleId="schedule-1" // Default schedule ID, adjust as needed
							organizationId="org-1" // Default org ID, adjust as needed
							trigger={
								<Button size="sm">
									<Calendar className="h-4 w-4 mr-2" /> Add Shift
								</Button>
							}
							onShiftCreated={() => {
								// Refresh shifts after creating a new one
								const fetchShifts = async () => {
									try {
										const allShifts = await ShiftsAPI.getAll();
										const locationShifts = allShifts.filter(
											(shift) =>
												shift.location_id === locationId &&
												shift.is_schedule === false
										);

										// Sort shifts by date (most recent first)
										const sortedShifts = locationShifts.sort(
											(a, b) =>
												new Date(b.start_time).getTime() -
												new Date(a.start_time).getTime()
										);

										setShifts(sortedShifts);
									} catch (error) {
										console.error("Error refreshing shifts:", error);
									}
								};

								fetchShifts();
							}}
							initialLocationId={location.id}
						/>
					}>
					{shifts.length > 0 ? (
						<div className="space-y-8">
							{/* Upcoming Shifts */}
							<div>
								<h3 className="text-lg font-medium mb-4">Upcoming Shifts</h3>
								{upcomingShifts.length > 0 ? (
									<div className="overflow-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Time</TableHead>
													<TableHead>Duration</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="text-right">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{upcomingShifts.map((shift) => (
													<TableRow key={shift.id}>
														<TableCell>
															{format(
																parseISO(shift.start_time),
																"MMM d, yyyy"
															)}
														</TableCell>
														<TableCell>
															{formatShiftTime(
																shift.start_time,
																shift.end_time
															)}
														</TableCell>
														<TableCell>
															{calculateShiftHours(
																shift.start_time,
																shift.end_time
															)}{" "}
															hrs
														</TableCell>
														<TableCell>
															<Badge
																variant={
																	shift.status === "completed"
																		? "default"
																		: "outline"
																}>
																{shift.status || "Scheduled"}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex items-center justify-end gap-2">
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() =>
																		navigate(`/shifts/${shift.id}`)
																	}>
																	<Eye className="h-4 w-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								) : (
									<div className="py-8 border rounded-md flex flex-col items-center justify-center text-center text-muted-foreground">
										<Clock className="h-8 w-8 mb-2 opacity-20" />
										<p>No upcoming shifts scheduled</p>
									</div>
								)}
							</div>

							{/* Past Shifts */}
							<div>
								<h3 className="text-lg font-medium mb-4">Past Shifts</h3>
								{pastShifts.length > 0 ? (
									<div className="overflow-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Time</TableHead>
													<TableHead>Duration</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="text-right">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{pastShifts.map((shift) => (
													<TableRow key={shift.id}>
														<TableCell>
															{format(
																parseISO(shift.start_time),
																"MMM d, yyyy"
															)}
														</TableCell>
														<TableCell>
															{formatShiftTime(
																shift.start_time,
																shift.end_time
															)}
														</TableCell>
														<TableCell>
															{calculateShiftHours(
																shift.start_time,
																shift.end_time
															)}{" "}
															hrs
														</TableCell>
														<TableCell>
															<Badge
																variant={
																	shift.status === "completed"
																		? "default"
																		: "outline"
																}>
																{shift.status || "Completed"}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex items-center justify-end gap-2">
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() =>
																		navigate(`/shifts/${shift.id}`)
																	}>
																	<Eye className="h-4 w-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								) : (
									<div className="py-8 border rounded-md flex flex-col items-center justify-center text-center text-muted-foreground">
										<Clock className="h-8 w-8 mb-2 opacity-20" />
										<p>No past shifts found</p>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
							<Clock className="h-12 w-12 mb-4 opacity-20" />
							<h3 className="text-lg font-medium mb-1">No shifts found</h3>
							<p className="max-w-md">
								No shifts have been scheduled for this location yet. Click the
								"Add Shift" button to create a new shift.
							</p>
						</div>
					)}
				</ContentSection>
			</div>

			{/* Remove Employee Dialog */}
			<AlertDialog
				open={removeEmployeeDialogOpen}
				onOpenChange={setRemoveEmployeeDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Employee</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this employee from this location?
							They will no longer be associated with this location.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={removeEmployeeFromLocation}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</ContentContainer>
	);
}
