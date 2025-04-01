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
import { Button } from "@/components/ui/button";
import {
	Building2,
	Users,
	Calendar,
	DollarSign,
	BarChart,
	Eye,
	Clock,
	Search,
	Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { ShiftCreationDialog } from "@/components/ShiftCreationDialog";
import { Input } from "@/components/ui/input";
import { ShiftCard } from "@/components/ShiftCard";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useHeader } from "@/lib/header-context";
import { LocationNav } from "@/components/LocationNav";

export default function LocationShiftPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [location, setLocation] = useState<Location | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [pastShiftsLimit, setPastShiftsLimit] = useState<number>(10);
	const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(
		[]
	);

	// Update the header content based on loading state and location data
	useEffect(() => {
		if (loading) {
			updateHeader({
				title: "Loading...",
				description: "Retrieving location shift information",
				showBackButton: true,
			});
		} else if (!location) {
			updateHeader({
				title: "Location Not Found",
				description: "The requested location could not be found",
				showBackButton: true,
			});
		} else {
			// Header actions for the page header
			const headerActions = (
				<ShiftCreationDialog
					scheduleId={locationId || ""}
					organizationId="org-1"
					initialLocationId={locationId || ""}
					onComplete={() => {
						// Refresh shifts after creation
						window.location.reload();
					}}
				/>
			);

			updateHeader({
				title: `${location.name} - Shift Schedule`,
				description: "View and manage shifts for this location",
				actions: headerActions,
				showBackButton: true,
			});
		}
	}, [loading, location, locationId, updateHeader]);

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

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				// Use the direct method to fetch shifts for this location
				const locationShifts = await ShiftsAPI.getShiftsByLocationId(
					locationId
				);
				console.log(
					"Shifts for this location:",
					locationShifts,
					"Location ID:",
					locationId
				);

				// Sort shifts by date (most recent first)
				const sortedShifts = locationShifts.sort(
					(a: Shift, b: Shift) =>
						new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
				);

				setShifts(sortedShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = "org-1"; // Default organization ID
				const allEmployees = await EmployeesAPI.getAll(organizationId);

				// Get employee IDs assigned to this location using the proper API
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);

				// Filter employees to those assigned to this location
				const assignedEmployeesList = allEmployees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);

				setAssignedEmployees(assignedEmployeesList);

				// Fetch shift assignments for this location
				setLoadingPhase("shift-assignments");
				const allShiftAssignments = await ShiftAssignmentsAPI.getAll();
				console.log("All shift assignments:", allShiftAssignments);

				// Get all shift IDs for this location
				const locationShiftIds = locationShifts.map((shift) => shift.id);

				// Filter to only include assignments for shifts at this location
				const locationShiftAssignments = allShiftAssignments.filter(
					(assignment) => locationShiftIds.includes(assignment.shift_id)
				);

				console.log(
					"Shift assignments for this location:",
					locationShiftAssignments,
					"Total count:",
					locationShiftAssignments.length,
					"Location ID:",
					locationId
				);

				// Ensure we have all employees who are assigned to shifts at this location
				// Get unique employee IDs from shift assignments
				const shiftAssignmentEmployeeIds = [
					...new Set(
						locationShiftAssignments.map((assignment) => assignment.employee_id)
					),
				];

				console.log(
					"Employee IDs from shift assignments:",
					shiftAssignmentEmployeeIds
				);

				// Find any employees who are assigned to shifts but not to the location directly
				const additionalEmployeeIds = shiftAssignmentEmployeeIds.filter(
					(id) => !assignedEmployeeIds.includes(id)
				);

				if (additionalEmployeeIds.length > 0) {
					console.log(
						"Found additional employees assigned to shifts but not location:",
						additionalEmployeeIds
					);

					// Get these additional employees from allEmployees
					const additionalEmployees = allEmployees.filter((employee) =>
						additionalEmployeeIds.includes(employee.id)
					);

					// Add them to assignedEmployeesList
					const updatedEmployeesList = [
						...assignedEmployeesList,
						...additionalEmployees,
					];
					setAssignedEmployees(updatedEmployeesList);

					console.log("Updated employee list:", updatedEmployeesList);
				}

				setShiftAssignments(locationShiftAssignments);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Failed to load shift data");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, [locationId, navigate]);

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

	// Filter past shifts based on search query
	const filteredPastShifts = pastShifts.filter((shift) => {
		if (!searchQuery) return true;

		const employee = assignedEmployees.find((emp) => emp.id === shift.user_id);
		const employeeName = employee?.name || "Unassigned";
		const shiftDate = format(parseISO(shift.start_time), "MMM dd, yyyy");
		const shiftTime = formatShiftTime(shift.start_time, shift.end_time);
		const searchLower = searchQuery.toLowerCase();

		return (
			employeeName.toLowerCase().includes(searchLower) ||
			shiftDate.toLowerCase().includes(searchLower) ||
			shiftTime.toLowerCase().includes(searchLower) ||
			(shift.name && shift.name.toLowerCase().includes(searchLower))
		);
	});

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
				<div className="space-y-8">
					{/* Section to display upcoming shifts */}
					<ContentSection
						title="Upcoming Shifts"
						description={`${upcomingShifts.length} shifts scheduled in the future`}>
						{upcomingShifts.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{upcomingShifts.map((shift) => {
									// Get all employees assigned to this shift
									const shiftEmployees: Employee[] = [];

									// Check direct assignment via user_id
									if (shift.user_id) {
										const directEmployee = assignedEmployees.find(
											(emp) => emp.id === shift.user_id
										);
										if (directEmployee) {
											shiftEmployees.push(directEmployee);
										}
									}

									// Get shift assignments for this specific shift
									const assignments = shiftAssignments.filter(
										(assignment) => assignment.shift_id === shift.id
									);

									console.log(
										`Shift ${shift.id} has ${assignments.length} assignments`
									);

									// Process each assignment
									for (const assignment of assignments) {
										// Find the employee object
										const employee = assignedEmployees.find(
											(emp) => emp.id === assignment.employee_id
										);

										// If employee is found and not already in the list, add them
										if (
											employee &&
											!shiftEmployees.some((e) => e.id === employee.id)
										) {
											console.log(
												`Adding employee ${employee.name} (${employee.id}) to shift ${shift.id}`
											);
											shiftEmployees.push(employee);
										} else if (!employee) {
											console.log(
												`Warning: Employee ${assignment.employee_id} not found in available employees for shift ${shift.id}`
											);
										}
									}

									console.log(
										`Final: Shift ${shift.id} has ${shiftEmployees.length} employees assigned`,
										shiftEmployees
									);

									return (
										<ShiftCard
											key={shift.id}
											shift={shift}
											locationName={location.name}
											assignedEmployees={shiftEmployees}
											showLocationName={false}
											isLoading={
												loading && loadingPhase === "shift-assignments"
											}
										/>
									);
								})}
							</div>
						) : (
							<Card className="text-center py-8 bg-muted/20">
								<CardContent>
									<p className="text-muted-foreground">
										No upcoming shifts scheduled for this location.
									</p>
									<ShiftCreationDialog
										scheduleId={locationId || ""}
										organizationId="org-1"
										initialLocationId={locationId || ""}
										onComplete={() => {
											// Refresh shifts after creation
											ShiftsAPI.getAllSchedules().then((allShifts) => {
												const locationShifts = allShifts.filter(
													(shift) => shift.location_id === locationId
												);
												setShifts(locationShifts);
												toast.success("Shift created successfully");
											});
										}}
										trigger={
											<Button
												variant="outline"
												className="mt-4">
												<Calendar className="h-4 w-4 mr-2" /> Schedule a Shift
											</Button>
										}
									/>
								</CardContent>
							</Card>
						)}
					</ContentSection>

					{/* Past shifts section */}
					<ContentSection
						title="Past Shifts"
						description={`${pastShifts.length} shifts completed or missed`}>
						{pastShifts.length > 0 ? (
							<Card>
								<CardHeader className="p-4 pb-0">
									<div className="relative mb-2">
										<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search past shifts..."
											className="pl-8"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
								</CardHeader>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Employee</TableHead>
											<TableHead>Hours</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredPastShifts
											.slice(0, pastShiftsLimit)
											.map((shift) => {
												// Find employee for this shift
												const employee = assignedEmployees.find(
													(emp) => emp.id === shift.user_id
												);

												return (
													<TableRow key={shift.id}>
														<TableCell>
															{format(
																parseISO(shift.start_time),
																"MMM dd, yyyy"
															)}
														</TableCell>
														<TableCell>
															{formatShiftTime(
																shift.start_time,
																shift.end_time
															)}
														</TableCell>
														<TableCell>
															{employee?.name || "Unassigned"}
														</TableCell>
														<TableCell>
															{calculateShiftHours(
																shift.start_time,
																shift.end_time
															)}
														</TableCell>
														<TableCell>
															<StatusBadge
																status={
																	shift.status === "pending"
																		? "pending"
																		: shift.status === "completed"
																		? "success"
																		: "error"
																}
															/>
														</TableCell>
														<TableCell>
															<Button
																variant="outline"
																size="sm"
																onClick={() => navigate(`/shifts/${shift.id}`)}>
																<Eye className="h-4 w-4 mr-2" /> View
															</Button>
														</TableCell>
													</TableRow>
												);
											})}
									</TableBody>
								</Table>
								{filteredPastShifts.length > pastShiftsLimit && (
									<div className="p-4 flex justify-center">
										<Button
											variant="outline"
											onClick={() => setPastShiftsLimit((prev) => prev + 10)}>
											Load More Shifts
										</Button>
									</div>
								)}
							</Card>
						) : (
							<Card className="text-center py-8 bg-muted/20">
								<CardContent>
									<p className="text-muted-foreground">
										No shift history available for this location.
									</p>
								</CardContent>
							</Card>
						)}
					</ContentSection>

					{/* Action buttons */}
					<div className="flex flex-wrap gap-2 mb-6">
						<ShiftCreationDialog
							scheduleId={locationId || ""}
							organizationId="org-1"
							initialLocationId={locationId || ""}
							onComplete={() => {
								// Refresh shifts after creation
								window.location.reload();
							}}
							trigger={
								<Button className="flex items-center gap-2">
									<Plus className="h-4 w-4" />
									Create Shift
								</Button>
							}
						/>

						<Button
							variant="outline"
							onClick={() => navigate(`/locations/${locationId}`)}>
							View Location Details
						</Button>
					</div>
				</div>
			</ContentContainer>
		</>
	);
}
