import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	EmployeesAPI,
	Employee,
	ShiftsAPI,
	Shift,
	EmployeeLocationsAPI,
} from "@/api";
import { Button } from "@/components/ui/button";
import {
	Building2,
	Users,
	Calendar,
	DollarSign,
	BarChart,
	UserPlus,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHeader } from "@/lib/header-context";
import { LocationNav } from "@/components/LocationNav";
import { EmployeeCard } from "@/components/EmployeeCard";

export default function LocationEmployeesPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<Location | null>(null);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [removeEmployeeId, setRemoveEmployeeId] = useState<string>("");
	const [removeEmployeeDialogOpen, setRemoveEmployeeDialogOpen] =
		useState<boolean>(false);

	// Update header based on loading and location state
	useEffect(() => {
		if (loading) {
			updateHeader({
				title: "Loading...",
				description: "Retrieving employee information",
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
				title: `${location.name} Employees`,
				description: `Manage employees at ${location.name}`,
				showBackButton: true,
				actions: (
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
								<UserPlus className="h-4 w-4 mr-2" /> Assign Employee
							</Button>
						}
					/>
				),
			});
		}
	}, [
		loading,
		location,
		updateHeader,
		locationId,
		allEmployees,
		assignedEmployees,
	]);

	useEffect(() => {
		const fetchData = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");

				console.log(`Fetching data for location: ${locationId}`);

				// Fetch location data
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}
				setLocation(locationData);
				console.log("Location data retrieved:", locationData.name);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = locationData.organizationId || "org-1"; // Use the location's org ID
				console.log(`Fetching employees for organization: ${organizationId}`);

				const employees = await EmployeesAPI.getAll(organizationId);
				console.log(
					`Retrieved ${employees.length} total employees for the organization`
				);

				// Get employee IDs assigned to this location using the proper API
				console.log(`Getting employees assigned to location: ${locationId}`);
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);
				console.log(
					`Found ${assignedEmployeeIds.length} assigned employee IDs:`,
					assignedEmployeeIds
				);

				// Filter employees to those assigned to this location
				const assignedEmployeesList = employees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);
				console.log(
					`Filtered to ${assignedEmployeesList.length} assigned employees`
				);

				setAssignedEmployees(assignedEmployeesList);
				setAllEmployees(employees);

				// Fetch shifts for this location (for insights)
				setLoadingPhase("shifts");
				const allShifts = await ShiftsAPI.getAllSchedules();
				const locationShifts = allShifts.filter(
					(shift: Shift) => shift.location_id === locationId
				);
				setShifts(locationShifts);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Failed to load employee data");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, [locationId, navigate]);

	// Remove an employee from this location
	const removeEmployeeFromLocation = async () => {
		if (!removeEmployeeId) return;

		try {
			// Get the employee for display purposes
			const employee = assignedEmployees.find(
				(emp) => emp.id === removeEmployeeId
			);

			if (employee) {
				// Get the current location assignments for this employee
				const currentAssignedLocations =
					await EmployeeLocationsAPI.getByEmployeeId(removeEmployeeId);

				// Filter out this location
				const updatedLocations = currentAssignedLocations.filter(
					(locId) => locId !== locationId
				);

				// Update the employee's location assignments
				const success = await EmployeeLocationsAPI.assignLocations(
					removeEmployeeId,
					updatedLocations
				);

				if (success) {
					// Update the UI
					setAssignedEmployees((prev) =>
						prev.filter((emp) => emp.id !== removeEmployeeId)
					);

					toast.success("Employee removed from this location");
				} else {
					toast.error("Failed to remove employee from location");
				}
			}
			setRemoveEmployeeDialogOpen(false);
		} catch (error) {
			console.error("Error removing employee:", error);
			toast.error("Failed to remove employee");
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
			<LocationNav />
			<ContentContainer>
				<div className="grid gap-8">
					{/* Employees List */}
					<ContentSection
						title="Assigned Employees"
						description="Employees assigned to this location">
						{assignedEmployees.length > 0 ? (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{assignedEmployees.map((employee) => (
									<EmployeeCard
										key={employee.id}
										employee={employee}
										size="sm"
										variant="standard"
										showActions
										showLocationBadge={false}
										onViewDetails={() => navigate(`/employees/${employee.id}`)}
										onSelect={() => navigate(`/employees/${employee.id}`)}
										actions={
											<Button
												variant="ghost"
												size="sm"
												className="w-full text-xs h-8 text-muted-foreground hover:text-destructive"
												onClick={() => {
													setRemoveEmployeeId(employee.id);
													setRemoveEmployeeDialogOpen(true);
												}}>
												<X className="h-3.5 w-3.5 mr-1.5" />
												Remove
											</Button>
										}
									/>
								))}
							</div>
						) : (
							<div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
								<Users className="h-12 w-12 mb-4 opacity-20" />
								<h3 className="text-lg font-medium mb-1">
									No employees assigned
								</h3>
								<p className="max-w-md">
									No employees have been assigned to this location yet. Click
									the "Assign Employees" button to add employees.
								</p>
							</div>
						)}
					</ContentSection>
				</div>

				{/* Confirmation Dialog */}
				<AlertDialog
					open={removeEmployeeDialogOpen}
					onOpenChange={setRemoveEmployeeDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Remove employee from location?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This will unassign the employee from this location. They will no
								longer be available for shifts at this location unless
								reassigned.
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
		</>
	);
}
