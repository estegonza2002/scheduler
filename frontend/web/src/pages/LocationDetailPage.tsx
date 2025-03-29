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
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";
import { useAuth } from "@/lib/auth";
import { getDefaultOrganizationId } from "@/lib/utils";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useHeader } from "@/lib/header-context";

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

export default function LocationDetailPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<ExtendedLocation | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const { user } = useAuth();
	const organizationId = useOrganizationId();

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
		<>
			{/* Hero Section */}
			<div className="w-full bg-muted/30 border-b">
				<ContentContainer>
					<div className="flex flex-col md:flex-row gap-8 py-8">
						{/* Location Image */}
						<div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden bg-muted/50 relative">
							<div className="absolute inset-0 flex items-center justify-center">
								<Building2 className="h-16 w-16 text-muted" />
							</div>
							{location.imageUrl && (
								<img
									src={location.imageUrl}
									alt={location.name}
									className="w-full h-full object-cover"
								/>
							)}
						</div>

						{/* Location Details */}
						<div className="flex-1 space-y-4">
							<div>
								<h1 className="text-3xl font-bold">{location.name}</h1>
								{location.isActive !== false ? (
									<Badge
										colorScheme="green"
										className="mt-2">
										Active
									</Badge>
								) : (
									<Badge
										variant="destructive"
										className="mt-2">
										Inactive
									</Badge>
								)}
							</div>

							{/* Address */}
							{(location.address || location.city || location.state) && (
								<div className="flex items-start gap-3 text-muted-foreground">
									<MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
									<div>
										{location.address && <div>{location.address}</div>}
										<div>
											{location.city && `${location.city}, `}
											{location.state} {location.zipCode}
										</div>
									</div>
								</div>
							)}

							{/* Quick Actions */}
							<div className="flex flex-wrap gap-3 pt-4">
								<Button
									variant="outline"
									onClick={() =>
										navigate(`/shifts/new?locationId=${locationId}`)
									}>
									<Plus className="h-4 w-4 mr-2" />
									Create Shift
								</Button>
								<Button
									variant="outline"
									onClick={() => navigate(`/locations/${locationId}/shifts`)}>
									<Calendar className="h-4 w-4 mr-2" />
									View Shifts
								</Button>
							</div>
						</div>
					</div>
				</ContentContainer>
			</div>

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
