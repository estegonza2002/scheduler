import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
	EmployeeLocationsAPI,
	ShiftAssignmentsAPI,
	ShiftAssignment,
} from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	MapPin,
	Building2,
	Mail,
	Phone,
	ChevronLeft,
	Edit,
	Trash,
	Calendar,
	Plus,
	Users,
	UserPlus,
	Navigation,
	BarChart,
	DollarSign,
	AlertCircle,
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
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { LocationInsights } from "@/components/LocationInsights";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";
import { ShiftCreationDialog } from "@/components/ShiftCreationDialog";
import { useAuth } from "@/lib/auth";
import { getDefaultOrganizationId } from "@/lib/utils";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useHeader } from "@/lib/header-context";
import { GoogleMap } from "@/components/ui/google-map";
import { LocationNav } from "@/components/LocationNav";
import { ShiftCard } from "@/components/ShiftCard";
import { EmployeeCard } from "@/components/EmployeeCard";
import { LocationDialog } from "@/components/LocationDialog";

// Update Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
	latitude?: number;
	longitude?: number;
}

// Helper to determine if an ID is a UUID
const isUUID = (id: string): boolean => {
	const uuidPattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidPattern.test(id);
};

export default function LocationDetailPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<ExtendedLocation | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
	const [pastShifts, setPastShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [defaultScheduleId, setDefaultScheduleId] = useState<string>("");
	const { user } = useAuth();
	const organizationId = useOrganizationId();
	const [employeeLocationCounts, setEmployeeLocationCounts] = useState<
		Record<string, number>
	>({});
	const [hasError, setHasError] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

	// Function to get the full address string
	const getFullAddress = (loc: ExtendedLocation | null): string => {
		if (!loc) return "";
		return `${loc.address || ""}, ${loc.city || ""}, ${loc.state || ""} ${
			loc.zipCode || ""
		}`.trim();
	};

	useEffect(() => {
		// Create action buttons for the header
		const createActionButtons = () => {
			if (!location) return null;

			// Log location to verify coordinates are present
			console.log("LocationDetailPage: Location data for edit:", {
				id: location.id,
				name: location.name,
				lat: location.latitude,
				lng: location.longitude,
			});

			return (
				<>
					<Button
						variant="outline"
						size="sm"
						className="h-9 gap-1"
						onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" /> Edit
					</Button>

					<AlertDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="h-9 gap-1">
								<Trash className="h-4 w-4" /> Delete
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete the location and remove all
									associated data. This action cannot be undone.
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
			);
		};

		// Update header based on loading state
		if (loading) {
			updateHeader({
				title: "Loading Location...",
				description: "Retrieving location information",
				showBackButton: true,
			});
		} else if (!location) {
			updateHeader({
				title: "Location not found",
				description: "The requested location could not be found",
				showBackButton: true,
			});
		} else {
			updateHeader({
				title: location.name,
				description: location.address || "No address provided",
				actions: createActionButtons(),
				showBackButton: true,
			});
		}
	}, [loading, location, updateHeader, deleteDialogOpen, organizationId]);

	useEffect(() => {
		const fetchLocation = async () => {
			if (!locationId) {
				setErrorMessage("No location ID provided");
				setHasError(true);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setHasError(false);
				setLoadingPhase("location");

				const locationData = await LocationsAPI.getById(locationId);

				if (!locationData) {
					setErrorMessage("Location not found");
					setHasError(true);
					setLoading(false);
					return;
				}

				setLocation(locationData);

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				const allSchedules = await ShiftsAPI.getAllSchedules();

				// Find a default schedule to use for shift creation
				const defaultSchedule = allSchedules.find(
					(schedule) => schedule.is_schedule === true
				);
				if (defaultSchedule) {
					setDefaultScheduleId(defaultSchedule.id);
				} else if (allSchedules.length > 0) {
					setDefaultScheduleId(allSchedules[0].id);
				}

				// Get all shifts from all schedules
				const allShiftsPromises = allSchedules.map((schedule) =>
					ShiftsAPI.getShiftsForSchedule(schedule.id)
				);
				const allShiftsArrays = await Promise.all(allShiftsPromises);
				const allShifts = allShiftsArrays.flat();

				// Filter for shifts at this location
				const locationShifts = allShifts.filter((shift: Shift) => {
					// Handle possible type mismatches
					const shiftLocationId = shift.location_id?.toString();
					const currentLocationId = locationId?.toString();

					return shiftLocationId === currentLocationId;
				});

				// Separate shifts into upcoming and past
				const now = new Date();
				const upcomingShifts = locationShifts
					.filter((shift) => new Date(shift.end_time) > now)
					.sort(
						(a, b) =>
							new Date(a.start_time).getTime() -
							new Date(b.start_time).getTime()
					);

				const pastShifts = locationShifts
					.filter((shift) => new Date(shift.end_time) <= now)
					.sort(
						(a, b) =>
							new Date(b.start_time).getTime() -
							new Date(a.start_time).getTime()
					);

				setShifts(locationShifts);
				setUpcomingShifts(upcomingShifts);
				setPastShifts(pastShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const employees = await EmployeesAPI.getAll(organizationId);
				setAllEmployees(employees);

				// Get assigned employees
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId || ""
				);
				let assignedEmployeesList = employees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);

				// Fetch shift assignments for all the shifts at this location
				setLoadingPhase("shiftAssignments");
				setLoadingAssignments(true);

				// Get all shift IDs for this location
				const locationShiftIds = locationShifts.map((shift) => shift.id);

				// Fetch all shift assignments
				const allAssignments = await ShiftAssignmentsAPI.getAll();

				// Filter to only assignments for shifts at this location
				const locationShiftAssignments = allAssignments.filter((assignment) =>
					locationShiftIds.includes(assignment.shift_id)
				);

				// Get unique employee IDs from shift assignments
				const shiftAssignmentEmployeeIds = [
					...new Set(
						locationShiftAssignments.map((assignment) => assignment.employee_id)
					),
				];

				// Find any employees who are assigned to shifts but not to the location directly
				const additionalEmployees = employees.filter(
					(employee) =>
						shiftAssignmentEmployeeIds.includes(employee.id) &&
						!assignedEmployeeIds.includes(employee.id)
				);

				if (additionalEmployees.length > 0) {
					// Add them to assignedEmployeesList and update state
					assignedEmployeesList = [
						...assignedEmployeesList,
						...additionalEmployees,
					];
				}

				// Get location counts
				const locationCountsMap: Record<string, number> = {};
				for (const employee of assignedEmployeesList) {
					try {
						const locations = await EmployeeLocationsAPI.getByEmployeeId(
							employee.id
						);
						locationCountsMap[employee.id] = locations.length || 1;
					} catch (error) {
						locationCountsMap[employee.id] = 1;
					}
				}

				setEmployeeLocationCounts(locationCountsMap);

				// Set state with fresh data
				setShiftAssignments(locationShiftAssignments);
				setAllEmployees(employees);
				setAssignedEmployees(assignedEmployeesList);
				setEmployeeLocationCounts(locationCountsMap);
				setShifts(locationShifts);
				setUpcomingShifts(upcomingShifts);
				setPastShifts(pastShifts);
			} catch (error) {
				setErrorMessage("Failed to load location details");
				setHasError(true);
				toast.error("Failed to load location details");
			} finally {
				setLoading(false);
				setLoadingPhase("");
				setLoadingAssignments(false);
			}
		};

		fetchLocation();
	}, [locationId, navigate, organizationId]);

	const handleDeleteLocation = async () => {
		if (!location) return;

		try {
			if ("delete" in LocationsAPI) {
				await (LocationsAPI as any).delete(location.id);
			} else {
				throw new Error("Delete method not found on LocationsAPI");
			}
			toast.success("Location deleted successfully");
			navigate("/locations");
		} catch (error) {
			toast.error("Failed to delete location");
		}
	};

	const getCurrentEmployeeId = async () => {
		if (!user?.id) return null;

		try {
			const employees = await EmployeesAPI.getAll(organizationId);
			const employee = employees.find((emp) => emp.email === user.email);

			if (!employee) return null;

			return employee.id;
		} catch (error) {
			return null;
		}
	};

	if (loading) {
		return (
			<LoadingState
				message={`Loading ${loadingPhase}...`}
				type="spinner"
			/>
		);
	}

	if (hasError) {
		return (
			<EmptyState
				icon={<AlertCircle />}
				title="Error loading location"
				description={errorMessage || "Unable to load the location details"}
				action={
					<Button
						variant="default"
						onClick={() => navigate("/locations")}>
						Return to Locations
					</Button>
				}
			/>
		);
	}

	if (!location) {
		return (
			<EmptyState
				icon={<AlertCircle />}
				title="Location not found"
				description="The location you requested could not be found"
				action={
					<Button
						variant="default"
						onClick={() => navigate("/locations")}>
						Return to Locations
					</Button>
				}
			/>
		);
	}

	// Location Hero Section with Map Background
	const LocationHero = () => (
		<div className="relative w-full">
			{/* Map Background */}
			<div className="h-[350px] w-full overflow-hidden relative">
				{/* Blurred Map */}
				<div className="absolute inset-0 filter blur-[2px]">
					<GoogleMap
						latitude={location.latitude}
						longitude={location.longitude}
						address={getFullAddress(location)}
						height="350px"
						className="w-full"
						zoom={9}
						mapStyle="monochrome"
					/>
				</div>
				{/* Darker Overlay */}
				<div className="absolute inset-0 bg-black/70"></div>

				{/* Directions Button */}
				<div className="absolute top-6 right-6 z-10">
					<Button
						variant="secondary"
						size="sm"
						className="bg-background/80 hover:bg-background/95 backdrop-blur-md shadow-lg"
						onClick={() => {
							const url =
								location.latitude && location.longitude
									? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
									: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
											getFullAddress(location)
									  )}`;
							window.open(url, "_blank");
						}}>
						<Navigation className="h-3.5 w-3.5 mr-1.5" />
						Directions
					</Button>
				</div>

				{/* Hero Content */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center px-4">
						<div className="flex flex-col items-center">
							<div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
								<Building2 className="h-10 w-10 text-primary-foreground" />
							</div>
							<h1 className="text-4xl font-bold text-white mb-2">
								{location.name}
							</h1>
							<div className="mt-2 mb-4">
								<Badge
									variant="outline"
									className="bg-background/30 backdrop-blur-md text-white border-white/30 px-3 py-1.5 text-sm shadow-md">
									<MapPin className="h-3.5 w-3.5 mr-2" />
									{getFullAddress(location)}
								</Badge>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-3 gap-6 mt-6 max-w-md">
								<div className="bg-background/30 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 transform hover:scale-105 transition-transform">
									<div className="text-xs text-white/80 font-medium">
										Employees
									</div>
									<div className="text-2xl font-bold text-white">
										{assignedEmployees.length}
									</div>
								</div>
								<div className="bg-background/30 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 transform hover:scale-105 transition-transform">
									<div className="text-xs text-white/80 font-medium">
										Upcoming
									</div>
									<div className="text-2xl font-bold text-white">
										{upcomingShifts.length}
									</div>
								</div>
								<div className="bg-background/30 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 transform hover:scale-105 transition-transform">
									<div className="text-xs text-white/80 font-medium">
										Total Shifts
									</div>
									<div className="text-2xl font-bold text-white">
										{shifts.length}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* Add the Hero Section */}
			<LocationHero />

			{/* Location Navigation - Moved outside ContentContainer */}
			<LocationNav className="border-t" />

			{/* Main Content */}
			<ContentContainer>
				{/* Location Insights Section */}
				<LocationInsights
					location={location}
					shifts={shifts}
					employees={assignedEmployees}
					className="mt-6"
				/>

				{/* Content Sections */}
				<div className="grid gap-6 mt-6">
					{/* Upcoming Shifts Section */}
					<ContentSection
						title="Upcoming Shifts"
						description={`${upcomingShifts.length} shifts scheduled at this location`}
						headerActions={
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate(`/locations/${locationId}/shifts`)}>
								View All Shifts
							</Button>
						}>
						{upcomingShifts.length === 0 ? (
							<EmptyState
								title="No upcoming shifts"
								description="There are no upcoming shifts scheduled at this location."
								icon={<Calendar className="h-6 w-6" />}
								action={
									<ShiftCreationDialog
										scheduleId={defaultScheduleId}
										organizationId={organizationId}
										initialLocationId={locationId}
										onComplete={() => {
											// Refresh shifts data after creating a new shift
											const refreshData = async () => {
												try {
													setLoading(true);
													setLoadingPhase("shifts");

													// Add a slight delay to ensure assignments are completed before refresh
													await new Promise((resolve) =>
														setTimeout(resolve, 1500)
													);

													// Fetch all schedules
													const allSchedules =
														await ShiftsAPI.getAllSchedules();
													// Get all shifts from all schedules
													const allShiftsPromises = allSchedules.map(
														(schedule) =>
															ShiftsAPI.getShiftsForSchedule(schedule.id)
													);
													const allShiftsArrays = await Promise.all(
														allShiftsPromises
													);
													const allShifts = allShiftsArrays.flat();

													// Filter for shifts at this location
													const locationShifts = allShifts.filter(
														(shift: Shift) => {
															// Handle possible type mismatches
															const shiftLocationId =
																shift.location_id?.toString();
															const currentLocationId = locationId?.toString();

															return shiftLocationId === currentLocationId;
														}
													);

													// Separate shifts into upcoming and past
													const now = new Date();
													const upcomingShifts = locationShifts
														.filter((shift) => new Date(shift.end_time) > now)
														.sort(
															(a, b) =>
																new Date(a.start_time).getTime() -
																new Date(b.start_time).getTime()
														);

													const pastShifts = locationShifts
														.filter((shift) => new Date(shift.end_time) <= now)
														.sort(
															(a, b) =>
																new Date(b.start_time).getTime() -
																new Date(a.start_time).getTime()
														);

													// Also fetch the latest shift assignments
													setLoadingPhase("shiftAssignments");
													setLoadingAssignments(true);
													const locationShiftIds = locationShifts.map(
														(shift) => shift.id
													);

													// Get ALL assignments
													const allAssignments =
														await ShiftAssignmentsAPI.getAll();

													// Filter assignments for this location's shifts
													const locationShiftAssignments =
														allAssignments.filter((assignment) =>
															locationShiftIds.includes(assignment.shift_id)
														);

													// Refresh employees
													const employees = await EmployeesAPI.getAll(
														organizationId
													);

													// Get assigned employees
													const assignedEmployeeIds =
														await EmployeeLocationsAPI.getByLocationId(
															locationId || ""
														);
													let assignedEmployeesList = employees.filter(
														(employee) =>
															assignedEmployeeIds.includes(employee.id)
													);

													// Add employees from shift assignments
													const shiftAssignmentEmployeeIds = [
														...new Set(
															locationShiftAssignments.map((a) => a.employee_id)
														),
													];

													// Check for employees in assignments who aren't in assigned list
													const additionalEmployees = employees.filter(
														(emp) =>
															shiftAssignmentEmployeeIds.includes(emp.id) &&
															!assignedEmployeeIds.includes(emp.id)
													);

													if (additionalEmployees.length > 0) {
														assignedEmployeesList = [
															...assignedEmployeesList,
															...additionalEmployees,
														];
													}

													// Get location counts
													const locationCountsMap: Record<string, number> = {};
													for (const employee of assignedEmployeesList) {
														try {
															const locations =
																await EmployeeLocationsAPI.getByEmployeeId(
																	employee.id
																);
															locationCountsMap[employee.id] =
																locations.length || 1;
														} catch (error) {
															locationCountsMap[employee.id] = 1;
														}
													}

													// Set state with fresh data
													setShiftAssignments(locationShiftAssignments);
													setAllEmployees(employees);
													setAssignedEmployees(assignedEmployeesList);
													setEmployeeLocationCounts(locationCountsMap);
													setShifts(locationShifts);
													setUpcomingShifts(upcomingShifts);
													setPastShifts(pastShifts);

													toast.success("Shift created and data refreshed");
												} catch (error) {
													toast.error(
														"Failed to refresh shifts after creation"
													);
												} finally {
													setLoading(false);
													setLoadingPhase("");
													setLoadingAssignments(false);
												}
											};

											refreshData();
										}}
										trigger={
											<Button
												variant="outline"
												size="sm">
												<Plus className="h-4 w-4 mr-2" />
												Create a Shift
											</Button>
										}
									/>
								}
							/>
						) : (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{upcomingShifts.slice(0, 10).map((shift) => {
									// Get all employees assigned to this shift
									let shiftEmployees: Employee[] = [];

									// Check shift assignments table
									const assignments = shiftAssignments.filter(
										(assignment) => assignment.shift_id === shift.id
									);

									if (assignments.length > 0) {
										// Process each assignment to find the employee
										assignments.forEach((assignment) => {
											const employee = allEmployees.find(
												(emp) => emp.id === assignment.employee_id
											);

											if (employee) {
												if (!shiftEmployees.some((e) => e.id === employee.id)) {
													shiftEmployees.push(employee);
												}
											}
										});
									}

									// Check direct assignment via user_id as backup
									if (shift.user_id && shiftEmployees.length === 0) {
										const directEmployee = allEmployees.find(
											(emp) => emp.id === shift.user_id
										);
										if (directEmployee) {
											shiftEmployees.push(directEmployee);
										}
									}

									return (
										<ShiftCard
											key={shift.id}
											shift={shift}
											locationName={location.name}
											assignedEmployees={shiftEmployees}
											showLocationName={false}
											isLoading={loadingAssignments}
										/>
									);
								})}
							</div>
						)}
					</ContentSection>

					{/* Assigned Employees Section */}
					<ContentSection
						title="Assigned Employees"
						description={`${assignedEmployees.length} employees assigned to this location`}
						headerActions={
							<EmployeeAssignmentSheet
								locationId={locationId || ""}
								locationName={location?.name || "Location"}
								allEmployees={allEmployees}
								assignedEmployees={assignedEmployees}
								onEmployeesAssigned={(newlyAssignedEmployees) => {
									setAssignedEmployees((prev) => [
										...prev,
										...newlyAssignedEmployees,
									]);
								}}
								trigger={
									<Button
										variant="outline"
										size="sm">
										<UserPlus className="h-4 w-4 mr-2" />
										Assign Employee
									</Button>
								}
							/>
						}>
						{assignedEmployees.length === 0 ? (
							<EmptyState
								title="No assigned employees"
								description="This location doesn't have any employees assigned to it."
								icon={<Users className="h-6 w-6" />}
								action={
									<EmployeeAssignmentSheet
										locationId={locationId || ""}
										locationName={location?.name || "Location"}
										allEmployees={allEmployees}
										assignedEmployees={assignedEmployees}
										onEmployeesAssigned={(newlyAssignedEmployees) => {
											setAssignedEmployees((prev) => [
												...prev,
												...newlyAssignedEmployees,
											]);
										}}
										trigger={
											<Button
												variant="outline"
												size="sm">
												<UserPlus className="h-4 w-4 mr-2" />
												Assign Employee
											</Button>
										}
									/>
								}
							/>
						) : (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{assignedEmployees.map((employee) => (
									<EmployeeCard
										key={employee.id}
										employee={employee}
										locationCount={employeeLocationCounts[employee.id] || 1}
										showLocationBadge={false}
										hideStatus={false}
										size="sm"
										variant="standard"
										showActions
										onViewDetails={() => navigate(`/employees/${employee.id}`)}
										onSelect={() => navigate(`/employees/${employee.id}`)}
									/>
								))}
							</div>
						)}
					</ContentSection>
				</div>
			</ContentContainer>

			{/* Location Edit Dialog */}
			{location && (
				<LocationDialog
					organizationId={organizationId}
					onLocationCreated={(updatedLocation) => {
						setLocation(updatedLocation as ExtendedLocation);
						setEditDialogOpen(false);
					}}
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
					location={{
						...location,
						// Ensure coordinates are numbers not undefined
						latitude: location.latitude || undefined,
						longitude: location.longitude || undefined,
					}}
					isEditing={true}
					trigger={<Button className="hidden">Edit Location</Button>}
				/>
			)}
		</>
	);
}
