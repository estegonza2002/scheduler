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
import { LocationEditSheet } from "@/components/LocationEditSheet";
import { LocationInsights } from "@/components/LocationInsights";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import { useAuth } from "@/lib/auth";
import { getDefaultOrganizationId } from "@/lib/utils";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useHeader } from "@/lib/header-context";
import { GoogleMap } from "@/components/ui/google-map";
import { LocationNav } from "@/components/LocationNav";
import { ShiftCard } from "@/components/ShiftCard";
import { EmployeeCard } from "@/components/EmployeeCard";

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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [defaultScheduleId, setDefaultScheduleId] = useState<string>("");
	const { user } = useAuth();
	const organizationId = useOrganizationId();
	const [employeeLocationCounts, setEmployeeLocationCounts] = useState<
		Record<string, number>
	>({});

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

			return (
				<>
					<LocationEditSheet
						location={location}
						onLocationUpdated={(updatedLocation) => {
							setLocation(updatedLocation as ExtendedLocation);
						}}
						organizationId={organizationId}
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
				const allSchedules = await ShiftsAPI.getAllSchedules();

				// Find a default schedule to use for shift creation
				const defaultSchedule = allSchedules.find(
					(schedule) => schedule.is_schedule === true
				);
				if (defaultSchedule) {
					setDefaultScheduleId(defaultSchedule.id);
				}

				// Get all shifts from all schedules
				const allShiftsPromises = allSchedules.map((schedule) =>
					ShiftsAPI.getShiftsForSchedule(schedule.id)
				);
				const allShiftsArrays = await Promise.all(allShiftsPromises);
				const allShifts = allShiftsArrays.flat();

				// Filter for shifts at this location
				const locationShifts = allShifts.filter(
					(shift: Shift) => shift.location_id === locationId
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

				setShifts(locationShifts);
				setUpcomingShifts(upcomingShifts);
				setPastShifts(pastShifts);

				// Fetch all employees
				setLoadingPhase("employees");
				const employees = await EmployeesAPI.getAll(organizationId);
				setAllEmployees(employees);

				// Get assigned employees
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);
				const assignedEmployeesList = employees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);
				setAssignedEmployees(assignedEmployeesList);

				// Fetch location counts for each employee
				const locationCountsMap: Record<string, number> = {};

				// Process each assigned employee to get their location counts
				for (const employee of assignedEmployeesList) {
					try {
						// Get all locations this employee is assigned to
						const employeeLocations =
							await EmployeeLocationsAPI.getByEmployeeId(employee.id);

						// If the employee is assigned to this location but not in the returned list,
						// ensure we count at least this location
						locationCountsMap[employee.id] =
							employeeLocations.length > 0 ? employeeLocations.length : 1; // Ensure at least 1 location (current one)
					} catch (error) {
						console.error(
							`Failed to get locations for employee ${employee.id}:`,
							error
						);
						locationCountsMap[employee.id] = 1; // Default to at least 1 location (current one)
					}
				}

				setEmployeeLocationCounts(locationCountsMap);

				// Fetch shift assignments for all the shifts at this location
				setLoadingPhase("shiftAssignments");
				// Get all shift IDs for this location
				const locationShiftIds = locationShifts.map((shift) => shift.id);

				// Fetch all shift assignments
				const allAssignments = await ShiftAssignmentsAPI.getAll();

				// Filter to only assignments for shifts at this location
				const locationShiftAssignments = allAssignments.filter((assignment) =>
					locationShiftIds.includes(assignment.shift_id)
				);

				setShiftAssignments(locationShiftAssignments);
			} catch (error) {
				console.error("Error fetching location details:", error);
				toast.error("Failed to load location details");
			} finally {
				setLoading(false);
				setLoadingPhase("");
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
			console.error("Error deleting location:", error);
			toast.error("Failed to delete location");
		}
	};

	const getCurrentEmployeeId = async () => {
		if (!user?.id) {
			console.error("No user ID available");
			return null;
		}

		try {
			const employees = await EmployeesAPI.getAll(organizationId);
			const employee = employees.find((emp) => emp.email === user.email);

			if (!employee) {
				console.error("No employee record found for current user");
				return null;
			}

			return employee.id;
		} catch (error) {
			console.error("Error finding current employee:", error);
			return null;
		}
	};

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message={`Loading ${loadingPhase}...`}
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	if (!location) {
		return (
			<ContentContainer>
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
			<LocationNav />

			{/* Hero Card */}
			<Card className="mt-4 mb-6 overflow-hidden">
				<div className="relative">
					{location.imageUrl && (
						<div
							className="absolute inset-0 bg-center bg-cover opacity-10"
							style={{ backgroundImage: `url(${location.imageUrl})` }}
						/>
					)}
					<div className="relative z-10 p-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold">{location.name}</h1>
								<div className="flex flex-wrap items-center gap-2 mt-1">
									{location.isActive !== false ? (
										<Badge className="bg-green-500 hover:bg-green-600">
											Active
										</Badge>
									) : (
										<Badge variant="destructive">Inactive</Badge>
									)}

									{(location.address || location.city || location.state) && (
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<MapPin className="h-4 w-4 flex-shrink-0" />
											<span>
												{location.address && `${location.address}, `}
												{location.city && `${location.city}, `}
												{location.state} {location.zipCode}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Quick Actions */}
							<div className="flex flex-wrap gap-2 mt-2 md:mt-0">
								<ShiftCreationSheet
									scheduleId={defaultScheduleId}
									organizationId={organizationId}
									initialLocationId={locationId}
									onComplete={() => {
										// Refresh shifts data after creating a new shift
										window.location.reload();
									}}
									trigger={
										<Button
											variant="outline"
											size="sm">
											<Plus className="h-4 w-4 mr-2" />
											Create Shift
										</Button>
									}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => navigate(`/locations/${locationId}/shifts`)}>
									<Calendar className="h-4 w-4 mr-2" />
									View Shifts
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Content Sections */}
			<div className="grid gap-6">
				{/* Contact Information */}
				{(location.phone || location.email) && (
					<ContentSection
						title="Contact Information"
						description="Ways to contact this location">
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
								<ShiftCreationSheet
									scheduleId={defaultScheduleId}
									organizationId={organizationId}
									initialLocationId={locationId}
									onComplete={() => {
										// Refresh shifts data after creating a new shift
										window.location.reload();
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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{upcomingShifts.slice(0, 6).map((shift) => {
								// Get all employees assigned to this shift
								const shiftEmployees: Employee[] = [];

								// Check direct assignment via user_id
								const directEmployee = allEmployees.find(
									(emp) => emp.id === shift.user_id
								);
								if (directEmployee) {
									shiftEmployees.push(directEmployee);
								}

								// Check shift assignments table
								const assignments = shiftAssignments.filter(
									(assignment) => assignment.shift_id === shift.id
								);

								// Add employees from assignments
								assignments.forEach((assignment) => {
									const employee = allEmployees.find(
										(emp) => emp.id === assignment.employee_id
									);
									// Only add if not already added and if found
									if (
										employee &&
										!shiftEmployees.some((e) => e.id === employee.id)
									) {
										shiftEmployees.push(employee);
									}
								});

								return (
									<ShiftCard
										key={shift.id}
										shift={shift}
										locationName={location.name}
										assignedEmployees={shiftEmployees}
										showLocationName={false}
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
									showLocationBadge
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

				{/* Location Map Section */}
				<ContentSection
					title="Location Map"
					description="View this location on the map and get directions">
					{(location.address || location.latitude) && (
						<div className="space-y-2">
							<GoogleMap
								latitude={location.latitude}
								longitude={location.longitude}
								address={
									location.latitude ? undefined : getFullAddress(location)
								}
								height="300px"
								className="w-full rounded-lg"
								zoom={15}
							/>
							<Button
								variant="outline"
								className="w-full flex items-center justify-center gap-2"
								onClick={() => {
									const url =
										location.latitude && location.longitude
											? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
											: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
													getFullAddress(location)
											  )}`;
									window.open(url, "_blank");
								}}>
								<Navigation className="h-4 w-4" />
								Get Directions
							</Button>
						</div>
					)}
				</ContentSection>
			</div>
		</ContentContainer>
	);
}
