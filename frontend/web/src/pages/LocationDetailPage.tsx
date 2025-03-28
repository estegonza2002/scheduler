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
import { LocationSubNav } from "@/components/LocationSubNav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";

// Update Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
}

// Helper to determine if an ID is a UUID
const isUUID = (id: string): boolean => {
	const uuidPattern =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidPattern.test(id);
};

// Function to get a valid test employee ID based on the current data format
const getTestEmployeeId = async (): Promise<string> => {
	try {
		// Get all employees
		const organizationId = "org-1"; // Default organization ID
		const allEmployees = await EmployeesAPI.getAll(organizationId);

		// Find the first employee ID to use as a test
		if (allEmployees.length > 0) {
			console.log("Found employee to use for test:", allEmployees[0]);
			return allEmployees[0].id;
		}

		// Fallback to emp-1 for mock data
		return "emp-1";
	} catch (error) {
		console.error("Error determining test employee ID:", error);
		return "emp-1"; // Default for mock data
	}
};

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
				const allShifts = await ShiftsAPI.getAllSchedules();
				const locationShifts = allShifts.filter(
					(shift: Shift) =>
						shift.location_id === locationId && shift.is_schedule === false
				);

				// Sort shifts by date (most recent first)
				const sortedShifts = locationShifts.sort(
					(a: Shift, b: Shift) =>
						new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
				);

				setShifts(sortedShifts);

				// Fetch all employees
				setLoadingPhase("employees");
				const organizationId = "org-1";
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
		<>
			<PageHeader
				title={location?.name || "Location Details"}
				description={""}
				actions={ActionButtons}
				showBackButton={true}
			/>

			<ContentContainer>
				<LocationSubNav
					locationId={locationId || ""}
					locationName={location.name}
				/>

				<div className="grid gap-6 mt-6">
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

					{/* Recent Shifts Section */}
					<ContentSection
						title="Recent Shifts"
						description={`${shifts.length} shifts at this location`}
						headerActions={
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate(`/locations/${locationId}/shifts`)}>
								View All Shifts
							</Button>
						}>
						{shifts.length === 0 ? (
							<EmptyState
								title="No shifts yet"
								description="There are no shifts scheduled at this location yet."
								icon={<Calendar className="h-6 w-6" />}
								action={
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											navigate(`/shifts/new?locationId=${locationId}`)
										}>
										<Plus className="h-4 w-4 mr-2" />
										Create a Shift
									</Button>
								}
							/>
						) : (
							<div className="space-y-3">
								{shifts.slice(0, 3).map((shift) => (
									<Card
										key={shift.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => navigate(`/shifts/${shift.id}`)}>
										<CardContent className="p-3 flex justify-between items-center">
											<div>
												<div className="font-medium">
													{shift.name || "Untitled Shift"}
												</div>
												<div className="text-sm text-muted-foreground">
													{format(
														parseISO(shift.start_time),
														"MMM d, yyyy h:mm a"
													)}{" "}
													-{format(parseISO(shift.end_time), "h:mm a")}
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm">
												View
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</ContentSection>

					{/* Assigned Employees Section */}
					<ContentSection
						title="Assigned Employees"
						description={`${assignedEmployees.length} employees assigned to this location`}
						headerActions={
							<div className="flex gap-2">
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
								{/* Add a test button for quickly assigning an employee to this location */}
								<Button
									variant="outline"
									size="sm"
									onClick={async () => {
										if (!locationId) return;

										try {
											// Get organization ID (in a real app this would come from a context)
											const organizationId = "org-1";

											// Get all employees
											const allEmployees = await EmployeesAPI.getAll(
												organizationId
											);
											console.log(
												"DEBUG: Test button - All employees:",
												allEmployees
											);

											if (allEmployees.length === 0) {
												toast.error("No employees found in database");
												return;
											}

											// Find an employee that's not already assigned
											const unassignedEmployees = allEmployees.filter(
												(emp) =>
													!assignedEmployees.some(
														(assigned) => assigned.id === emp.id
													)
											);

											console.log(
												"DEBUG: Test button - Unassigned employees:",
												unassignedEmployees
											);

											if (unassignedEmployees.length > 0) {
												// Just add the first unassigned employee directly to UI without API call
												const employeeToAdd = unassignedEmployees[0];
												toast.success(
													`Adding ${employeeToAdd.name} to this location`
												);
												setAssignedEmployees((prev) => [
													...prev,
													employeeToAdd,
												]);
											} else if (allEmployees.length > 0) {
												toast.info(
													"All employees are already assigned to this location"
												);
											} else {
												toast.error("No employees found");
											}
										} catch (error) {
											console.error("Error in finding employees:", error);
											toast.error("Failed to add test employee");
										}
									}}>
									Add Test Employee
								</Button>
							</div>
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
							<div className="space-y-3">
								{assignedEmployees.map((employee) => (
									<Card
										key={employee.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => navigate(`/employees/${employee.id}`)}>
										<CardContent className="p-3 flex justify-between items-center">
											<div className="flex items-center gap-3">
												<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
													{employee.name.charAt(0).toUpperCase()}
												</div>
												<div>
													<div className="font-medium">{employee.name}</div>
													<div className="text-sm text-muted-foreground">
														{employee.email}
													</div>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm">
												View
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</ContentSection>
				</div>
			</ContentContainer>
		</>
	);
}
