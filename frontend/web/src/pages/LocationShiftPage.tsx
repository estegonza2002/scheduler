import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Location,
	LocationsAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
} from "@/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { LocationSubNav } from "@/components/LocationSubNav";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationShiftPage() {
	const { locationId } = useParams<{ locationId: string }>();
	const navigate = useNavigate();
	const [location, setLocation] = useState<Location | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("location");

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
				const allShifts = await ShiftsAPI.getAll();
				const locationShifts = allShifts.filter(
					(shift) => shift.location_id === locationId
				);

				// Sort shifts by date (most recent first)
				const sortedShifts = locationShifts.sort(
					(a, b) =>
						new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
				);

				setShifts(sortedShifts);

				// Fetch employees assigned to this location
				setLoadingPhase("employees");
				const organizationId = "org-1"; // Default organization ID
				const employees = await EmployeesAPI.getAll(organizationId);

				// Filter by location assignment (for demo purposes)
				const assignedEmployees = employees.filter((employee) => {
					// @ts-ignore - locationAssignment is a custom property we're assuming exists
					return employee.locationAssignment === locationId;
				});

				setAssignedEmployees(assignedEmployees);
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

	if (loading) {
		return (
			<>
				<PageHeader
					title="Loading..."
					description="Retrieving location shift information"
					showBackButton={true}
				/>
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
				<PageHeader
					title="Location not found"
					description="The requested location could not be found"
					showBackButton={true}
				/>
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

	// Header actions for the page header
	const headerActions = (
		<ShiftCreationSheet
			scheduleId={locationId || ""}
			organizationId="org-1"
			initialLocationId={locationId || ""}
			onShiftCreated={() => {
				// Refresh shifts after creation
				window.location.reload();
			}}
		/>
	);

	return (
		<>
			<PageHeader
				title={`${location.name} - Shift Schedule`}
				description="View and manage shifts for this location"
				actions={headerActions}
				showBackButton={true}
			/>
			<ContentContainer>
				<LocationSubNav
					locationId={locationId || ""}
					locationName={location.name}
				/>

				<div className="space-y-8 mt-6">
					{/* Section to display upcoming shifts */}
					<ContentSection
						title="Upcoming Shifts"
						description={`${upcomingShifts.length} shifts scheduled in the future`}>
						{upcomingShifts.length > 0 ? (
							<Card>
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
										{upcomingShifts.map((shift) => {
											// Find employee for this shift
											const employee = assignedEmployees.find(
												(emp) => emp.id === shift.user_id
											);

											return (
												<TableRow key={shift.id}>
													<TableCell>
														{format(parseISO(shift.start_time), "MMM dd, yyyy")}
													</TableCell>
													<TableCell>
														{formatShiftTime(shift.start_time, shift.end_time)}
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
							</Card>
						) : (
							<Card className="text-center py-8 bg-muted/20">
								<CardContent>
									<p className="text-muted-foreground">
										No upcoming shifts scheduled for this location.
									</p>
									<ShiftCreationSheet
										scheduleId={locationId || ""}
										organizationId="org-1"
										initialLocationId={locationId || ""}
										onShiftCreated={() => {
											// Refresh shifts after creation
											ShiftsAPI.getAll().then((allShifts) => {
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
										{pastShifts.slice(0, 10).map((shift) => {
											// Find employee for this shift
											const employee = assignedEmployees.find(
												(emp) => emp.id === shift.user_id
											);

											return (
												<TableRow key={shift.id}>
													<TableCell>
														{format(parseISO(shift.start_time), "MMM dd, yyyy")}
													</TableCell>
													<TableCell>
														{formatShiftTime(shift.start_time, shift.end_time)}
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
								{pastShifts.length > 10 && (
									<CardContent className="flex justify-center p-4 border-t">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												navigate(`/locations/${locationId}/shifts/history`)
											}>
											View All Shift History
										</Button>
									</CardContent>
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
				</div>
			</ContentContainer>
		</>
	);
}
