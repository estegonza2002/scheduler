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
import { format, parseISO } from "date-fns";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { LocationEditSheet } from "../components/LocationEditSheet";
import { LocationInsights } from "../components/LocationInsights";
import { LocationSubNav } from "../components/LocationSubNav";
import { PageHeader } from "../components/ui/page-header";

// Update Location type to include optional fields
interface ExtendedLocation extends Location {
	phone?: string;
	email?: string;
}

export default function LocationDetailPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<ExtendedLocation | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
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
				description={location?.address || ""}
				actions={ActionButtons}
				showBackButton={true}
			/>

			<ContentContainer>
				<LocationSubNav
					locationId={locationId || ""}
					locationName={location.name}
				/>

				<div className="grid gap-6 mt-6">
					{/* Basic Location Information */}
					<ContentSection
						title="Overview"
						description="Basic information about this location">
						<div className="flex flex-col md:flex-row gap-6">
							<div className="flex items-center gap-4 flex-1">
								<div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
									<Building2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h2 className="text-2xl font-bold">{location.name}</h2>
									<div className="flex items-center gap-2 mt-1">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											{location.address}, {location.city}, {location.state}{" "}
											{location.zipCode}
										</span>
									</div>
								</div>
							</div>
						</div>
					</ContentSection>

					{/* Address Information */}
					<ContentSection
						title="Address Information"
						description="Physical location details">
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
						</div>
					</ContentSection>

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
							<div className="py-4 text-center text-muted-foreground">
								No shifts yet at this location.
							</div>
						) : (
							<div className="space-y-3">
								{shifts.slice(0, 3).map((shift) => (
									<div
										key={shift.id}
										className="flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
										onClick={() => navigate(`/shifts/${shift.id}`)}>
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
									</div>
								))}
							</div>
						)}
					</ContentSection>

					{/* Assigned Employees Section */}
					<ContentSection
						title="Assigned Employees"
						description={`${assignedEmployees.length} employees assigned to this location`}
						headerActions={
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate(`/employees?locationId=${locationId}`)}>
								Manage Employees
							</Button>
						}>
						{assignedEmployees.length === 0 ? (
							<div className="py-4 text-center text-muted-foreground">
								No employees assigned to this location.
							</div>
						) : (
							<div className="space-y-3">
								{assignedEmployees.map((employee) => (
									<div
										key={employee.id}
										className="flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
										onClick={() => navigate(`/employees/${employee.id}`)}>
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
									</div>
								))}
							</div>
						)}
					</ContentSection>
				</div>
			</ContentContainer>
		</>
	);
}
