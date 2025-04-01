import { useState, useEffect, useCallback } from "react";
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
	OrganizationsAPI,
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
	const [processedAssignments, setProcessedAssignments] = useState<
		Record<string, Employee[]>
	>({});
	const [organizationId, setOrganizationId] = useState<string>("");

	// Function to force refresh the assignments
	const refreshAssignments = useCallback(() => {
		console.log("Forcing refresh of assignments...");
		setProcessedAssignments({});
	}, []);

	// Clear the cache on mount
	useEffect(() => {
		console.log("Clearing processedAssignments cache on mount");
		setProcessedAssignments({});
	}, [locationId]);

	// Utility function to get all employees assigned to a shift, memoized with useCallback
	const getEmployeesForShift = useCallback(
		(shift: Shift): Employee[] => {
			// If we have already processed assignments for this shift, use that
			if (
				processedAssignments[shift.id] &&
				processedAssignments[shift.id].length > 0
			) {
				console.log(
					`[getEmployeesForShift] Using cached employees for shift ${
						shift.id
					}: ${processedAssignments[shift.id].length} employees`
				);
				return processedAssignments[shift.id];
			}

			const shiftEmployees: Employee[] = [];

			console.log(
				`[getEmployeesForShift] Getting employees for shift: ${shift.id}, start_time: ${shift.start_time}`
			);
			console.log(
				`[getEmployeesForShift] Total available employees: ${assignedEmployees.length}`
			);
			console.log(
				`[getEmployeesForShift] Total shift assignments: ${shiftAssignments.length}`
			);

			// Safety check
			if (!assignedEmployees.length || !shiftAssignments.length) {
				console.log(
					`[getEmployeesForShift] No employees or assignments available yet for shift ${shift.id}`
				);
				return [];
			}

			// Check direct assignment via user_id
			if (shift.user_id) {
				const directEmployee = assignedEmployees.find(
					(emp) => emp.id === shift.user_id
				);
				if (directEmployee) {
					console.log(
						`[getEmployeesForShift] Found direct employee assignment: ${directEmployee.name} (${directEmployee.id})`
					);
					shiftEmployees.push(directEmployee);
				}
			}

			// Get shift assignments for this specific shift
			const assignments = shiftAssignments.filter(
				(assignment) => assignment.shift_id === shift.id
			);

			console.log(
				`[getEmployeesForShift] Found ${assignments.length} shift assignments for shift ${shift.id}`
			);

			if (assignments.length > 0) {
				console.log(
					`[getEmployeesForShift] Assignment IDs for shift ${shift.id}:`,
					assignments.map((a) => ({ id: a.id, employee_id: a.employee_id }))
				);
			}

			// Process each assignment
			for (const assignment of assignments) {
				// Find the employee object
				const employee = assignedEmployees.find(
					(emp) => emp.id === assignment.employee_id
				);

				// If employee is found and not already in the list, add them
				if (employee && !shiftEmployees.some((e) => e.id === employee.id)) {
					console.log(
						`[getEmployeesForShift] Adding employee ${employee.name} (${employee.id}) to shift ${shift.id}`
					);
					shiftEmployees.push(employee);
				} else if (!employee) {
					console.log(
						`[getEmployeesForShift] Warning: Employee ${assignment.employee_id} not found in available employees for shift ${shift.id}`
					);
				} else {
					console.log(
						`[getEmployeesForShift] Employee ${employee.name} already added to shift ${shift.id}`
					);
				}
			}

			console.log(
				`[getEmployeesForShift] Final employee count for shift ${shift.id}: ${shiftEmployees.length}`
			);

			if (shiftEmployees.length === 0) {
				console.log(
					`[getEmployeesForShift] No employees found for shift ${shift.id}`
				);
			} else {
				// Cache the result for future use
				setProcessedAssignments((prev) => ({
					...prev,
					[shift.id]: shiftEmployees,
				}));
			}

			return shiftEmployees;
		},
		[assignedEmployees, shiftAssignments, processedAssignments]
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
					onComplete={(shiftId) => {
						// Navigate to the shift detail page
						navigate(`/shifts/${shiftId}`);
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
	}, [loading, location, locationId, updateHeader, navigate]);

	// Effect to fetch the location and shift data
	useEffect(() => {
		if (!locationId) {
			console.error("No location ID provided");
			toast.error("No location ID provided");
			navigate("/locations");
			return;
		}

		// Clear state when changing locations
		setProcessedAssignments({});

		const fetchData = async () => {
			try {
				// Fetch location data
				setLoadingPhase("location");
				const locationData = await LocationsAPI.getById(locationId);

				if (!locationData) {
					toast.error("Location not found");
					navigate("/locations");
					return;
				}

				console.log("Location data:", locationData);
				setLocation(locationData);

				// Set organization ID from the location data
				if (locationData.organizationId) {
					setOrganizationId(locationData.organizationId);
					console.log(
						"Using organization ID from location:",
						locationData.organizationId
					);
				} else {
					// If no organization ID on location, fetch the first organization
					const organizations = await OrganizationsAPI.getAll();
					if (organizations && organizations.length > 0) {
						setOrganizationId(organizations[0].id);
						console.log(
							"Using organization ID from first organization:",
							organizations[0].id
						);
					} else {
						console.error("No organization found");
						toast.error("No organization found");
					}
				}

				// Fetch shifts for this location
				setLoadingPhase("shifts");
				// Use the direct method to fetch shifts for this location
				const locationShifts = await ShiftsAPI.getShiftsByLocationId(
					locationId
				);
				console.log(
					"Shifts for this location:",
					locationShifts.map((s) => ({ id: s.id, start_time: s.start_time })),
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
				const allEmployees = await EmployeesAPI.getAll(organizationId);
				console.log(
					"All employees:",
					allEmployees.map((e) => ({ id: e.id, name: e.name }))
				);

				// Get employee IDs assigned to this location using the proper API
				const assignedEmployeeIds = await EmployeeLocationsAPI.getByLocationId(
					locationId
				);
				console.log(
					"Employee IDs assigned to this location:",
					assignedEmployeeIds
				);

				// Filter employees to those assigned to this location
				const assignedEmployeesList = allEmployees.filter((employee) =>
					assignedEmployeeIds.includes(employee.id)
				);
				console.log(
					"Employees assigned to this location:",
					assignedEmployeesList.map((e) => ({ id: e.id, name: e.name }))
				);

				setAssignedEmployees(assignedEmployeesList);

				// Fetch shift assignments for this location
				setLoadingPhase("shift-assignments");
				const allShiftAssignments = await ShiftAssignmentsAPI.getAll();
				console.log(
					`All shift assignments: ${allShiftAssignments.length}`,
					allShiftAssignments.slice(0, 3).map((a) => ({
						shift_id: a.shift_id,
						employee_id: a.employee_id,
					}))
				);

				// Get all shift IDs for this location
				const locationShiftIds = locationShifts.map((shift) => shift.id);

				// Filter to only include assignments for shifts at this location
				const locationShiftAssignments = allShiftAssignments.filter(
					(assignment) => locationShiftIds.includes(assignment.shift_id)
				);

				console.log(
					`Shift assignments for this location: ${locationShiftAssignments.length}`,
					locationShiftAssignments.slice(0, 5).map((a) => ({
						shift_id: a.shift_id,
						employee_id: a.employee_id,
					}))
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

					console.log(
						"Updated employee list:",
						updatedEmployeesList.map((e) => ({ id: e.id, name: e.name }))
					);
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

	// Process shift assignments and create a map of shift ID to employees whenever dependencies change
	useEffect(() => {
		if (loading || !assignedEmployees.length || !shiftAssignments.length) {
			return;
		}

		console.log("Processing shift assignments...");

		const assignmentMap: Record<string, Employee[]> = {};

		// Get unique shift IDs from assignments
		const uniqueShiftIds = [
			...new Set(shiftAssignments.map((a) => a.shift_id)),
		];
		console.log(
			`Found ${uniqueShiftIds.length} unique shifts with assignments`,
			uniqueShiftIds.slice(0, 3)
		);

		// Process each shift
		uniqueShiftIds.forEach((shiftId) => {
			// Not using getEmployeesForShift here to avoid circular dependencies
			const shiftAssigns = shiftAssignments.filter(
				(a) => a.shift_id === shiftId
			);
			const employees: Employee[] = [];

			shiftAssigns.forEach((assignment) => {
				const employee = assignedEmployees.find(
					(e) => e.id === assignment.employee_id
				);
				if (employee && !employees.some((e) => e.id === employee.id)) {
					employees.push(employee);
				}
			});

			if (employees.length > 0) {
				assignmentMap[shiftId] = employees;
				console.log(
					`Stored ${employees.length} employees for shift ${shiftId}`
				);
			}
		});

		setProcessedAssignments(assignmentMap);
	}, [shiftAssignments, assignedEmployees, loading]);

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

		// DIRECT LOOKUP: Get the raw shift assignments for this shift
		const directAssignments = shiftAssignments.filter(
			(a) => a.shift_id === shift.id
		);

		// Map those direct assignments to employees
		const directEmployees = directAssignments
			.map((assignment) => {
				return assignedEmployees.find(
					(emp) => emp.id === assignment.employee_id
				);
			})
			.filter(Boolean) as Employee[];

		// Fall back to processed cache if needed
		const cachedEmployees =
			processedAssignments[shift.id] || getEmployeesForShift(shift);

		// Use the method that gives us employees
		const employeesList =
			directEmployees.length > 0
				? directEmployees
				: Array.isArray(cachedEmployees)
				? cachedEmployees.filter((emp) => emp && emp.id && emp.name)
				: [];

		// Join employee names for search
		const employeeNames = employeesList.map((emp) => emp.name).join(" ");
		const employeeStatus =
			employeesList.length > 0 ? employeeNames : "Unassigned";

		const shiftDate = format(parseISO(shift.start_time), "MMM dd, yyyy");
		const shiftTime = formatShiftTime(shift.start_time, shift.end_time);
		const searchLower = searchQuery.toLowerCase();

		return (
			employeeStatus.toLowerCase().includes(searchLower) ||
			shiftDate.toLowerCase().includes(searchLower) ||
			shiftTime.toLowerCase().includes(searchLower) ||
			(shift.name && shift.name.toLowerCase().includes(searchLower))
		);
	});

	// Make sure we process assignments for upcoming shifts as needed
	useEffect(() => {
		if (
			!loading &&
			upcomingShifts.length > 0 &&
			assignedEmployees.length > 0 &&
			shiftAssignments.length > 0
		) {
			console.log("Pre-processing employee assignments for upcoming shifts");

			// First check if we're missing any assignments
			const missingAssignments = upcomingShifts.filter(
				(shift) =>
					!processedAssignments[shift.id] &&
					shiftAssignments.some((a) => a.shift_id === shift.id)
			);

			if (missingAssignments.length > 0) {
				console.log(
					`Found ${missingAssignments.length} shifts missing processed assignments`
				);
				const newAssignments = { ...processedAssignments };

				missingAssignments.forEach((shift) => {
					const employees = getEmployeesForShift(shift);
					if (employees.length > 0) {
						newAssignments[shift.id] = employees;
					}
				});

				setProcessedAssignments(newAssignments);
			}
		}
	}, [
		upcomingShifts,
		loading,
		assignedEmployees.length,
		shiftAssignments.length,
		processedAssignments,
		getEmployeesForShift,
	]);

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
						<div className="flex justify-end mb-4">
							<Button
								variant="outline"
								size="sm"
								onClick={refreshAssignments}>
								Refresh Assignments
							</Button>
						</div>
						{upcomingShifts.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{upcomingShifts.map((shift) => {
									// Get employees for this shift
									const shiftEmployees =
										processedAssignments[shift.id] ||
										getEmployeesForShift(shift);

									// Make sure we have employees and they're a valid array
									const validShiftEmployees = Array.isArray(shiftEmployees)
										? shiftEmployees.filter((emp) => emp && emp.id && emp.name)
										: [];

									// DIRECT LOOKUP: Get the raw shift assignments for this shift
									const directAssignments = shiftAssignments.filter(
										(a) => a.shift_id === shift.id
									);

									console.log(
										`ShiftCard: Shift ${shift.id} has ${directAssignments.length} direct assignments`,
										directAssignments.map((a) => a.employee_id).slice(0, 3)
									);

									// Map those direct assignments to employees
									const directEmployees = directAssignments
										.map((assignment) => {
											const emp = assignedEmployees.find(
												(emp) => emp.id === assignment.employee_id
											);
											if (!emp) {
												console.log(
													`Failed to find employee with ID ${assignment.employee_id}`
												);
											}
											return emp;
										})
										.filter(Boolean) as Employee[];

									// Final assignments - use direct lookup if possible, fall back to processed cache
									const finalEmployeeList =
										directEmployees.length > 0
											? directEmployees
											: validShiftEmployees;

									console.log(
										`ShiftCard: Shift ${shift.id} rendering with ${finalEmployeeList.length} employees (direct: ${directEmployees.length}, cache: ${validShiftEmployees.length})`
									);

									// Check if this shift has any assignments in the raw data
									const hasAssignmentsInRawData = shiftAssignments.some(
										(a) => a.shift_id === shift.id
									);
									console.log(
										`ShiftCard: Shift ${shift.id} has ${
											hasAssignmentsInRawData ? "at least ONE" : "NO"
										} assignments in raw data`
									);

									return (
										<ShiftCard
											key={shift.id}
											shift={shift}
											locationName={location.name}
											assignedEmployees={finalEmployeeList}
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
										organizationId={organizationId}
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
												// DIRECT LOOKUP: Get the raw shift assignments for this shift
												const directAssignments = shiftAssignments.filter(
													(a) => a.shift_id === shift.id
												);

												// Map those direct assignments to employees
												const directEmployees = directAssignments
													.map((assignment) => {
														return assignedEmployees.find(
															(emp) => emp.id === assignment.employee_id
														);
													})
													.filter(Boolean) as Employee[];

												// Fall back to processed cache if needed
												const cachedEmployees =
													processedAssignments[shift.id] ||
													getEmployeesForShift(shift);

												// Use the method that gives us employees
												const shiftEmployees =
													directEmployees.length > 0
														? directEmployees
														: Array.isArray(cachedEmployees)
														? cachedEmployees.filter(
																(emp) => emp && emp.id && emp.name
														  )
														: [];

												// Employee display name - show list of names or "Unassigned"
												const employeeDisplay =
													shiftEmployees.length > 0
														? shiftEmployees.map((e) => e.name).join(", ")
														: "Unassigned";

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
														<TableCell>{employeeDisplay}</TableCell>
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
						<Button
							size="sm"
							onClick={() =>
								navigate(
									`/shifts/create?organizationId=${organizationId}&locationId=${locationId}&returnUrl=/locations/${locationId}/shifts`
								)
							}>
							<Plus className="mr-1 h-4 w-4" />
							Create Shift
						</Button>

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
