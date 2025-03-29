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
import { ChevronLeft, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { LocationSubNav } from "@/components/LocationSubNav";
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
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
	AppHeader,
	AppTitle,
	AppDescription,
} from "@/components/layout/AppLayout";

export default function LocationEmployeesPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<Location | null>(null);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [removeEmployeeId, setRemoveEmployeeId] = useState<string>("");
	const [removeEmployeeDialogOpen, setRemoveEmployeeDialogOpen] =
		useState<boolean>(false);

	useEffect(() => {
		const fetchData = async () => {
			if (!locationId) return;

			try {
				setLoading(true);
				setLoadingPhase("location");

				// Fetch location data
				const locationData = await LocationsAPI.getById(locationId);
				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}
				setLocation(locationData);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = "org-1"; // Default organization ID
				const employees = await EmployeesAPI.getAll(organizationId);

				// Get employee IDs assigned to this location using the proper API
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);

				// Filter employees to those assigned to this location
				const assignedEmployeesList = employees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);

				setAssignedEmployees(assignedEmployeesList);
				setAllEmployees(employees);

				// Fetch shifts for this location (for insights)
				setLoadingPhase("shifts");
				const allShifts = await ShiftsAPI.getAll();
				const locationShifts = allShifts.filter(
					(shift) => shift.location_id === locationId
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

	if (loading) {
		return (
			<>
				<AppHeader>
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="h-8 w-8 mr-2"
							title="Go back">
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div>
							<AppTitle>Loading...</AppTitle>
							<AppDescription>Retrieving employee information</AppDescription>
						</div>
					</div>
				</AppHeader>

				<ContentContainer>
					<LoadingState
						type="spinner"
						message={`Loading ${loadingPhase}...`}
						className="py-12"
					/>
				</ContentContainer>
			</>
		);
	}

	if (!location) {
		return (
			<>
				<AppHeader>
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="h-8 w-8 mr-2"
							title="Go back">
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div>
							<AppTitle>Location not found</AppTitle>
							<AppDescription>
								The requested location could not be found
							</AppDescription>
						</div>
					</div>
				</AppHeader>

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
			</>
		);
	}

	return (
		<>
			<AppHeader>
				<div className="flex justify-between w-full">
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="h-8 w-8 mr-2"
							title="Go back">
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div>
							<AppTitle>{`${location.name} Employees`}</AppTitle>
							<AppDescription>
								{`Manage employees at ${location.name}`}
							</AppDescription>
						</div>
					</div>
					<div className="flex items-center justify-end gap-3">
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
					</div>
				</div>
			</AppHeader>

			<ContentContainer>
				<LocationSubNav
					locationId={locationId || ""}
					locationName={location.name}
				/>

				<div className="mt-6">
					<div className="grid gap-6">
						{/* Employees Section */}
						<ContentSection
							title="Assigned Employees"
							description="Employees assigned to this location">
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
												<AvatarFallback>
													{employee.name.charAt(0)}
												</AvatarFallback>
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
										No employees have been assigned to this location yet. Click
										the "Assign Employees" button to add employees.
									</p>
								</div>
							)}
						</ContentSection>
					</div>
				</div>
			</ContentContainer>

			{/* Confirmation Dialog */}
			<AlertDialog
				open={removeEmployeeDialogOpen}
				onOpenChange={setRemoveEmployeeDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove employee from location?</AlertDialogTitle>
						<AlertDialogDescription>
							This will unassign the employee from this location. They will no
							longer be available for shifts at this location unless reassigned.
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
		</>
	);
}
