import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
	Employee,
	EmployeesAPI,
	Shift,
	ShiftsAPI,
	LocationsAPI,
	Location,
} from "../api";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	User,
	Info,
	ClipboardList,
	AlertCircle,
	DollarSign,
	ArrowLeft,
	Edit,
	Trash,
	ChevronLeft,
	Loader2,
	Clock,
	Briefcase,
	Send,
	BarChart,
	CheckCircle,
	X,
	Calendar as CalendarIcon,
	Clock as ClockIcon,
	TrendingUp,
	MapPinIcon,
	Plus,
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
import { Skeleton } from "../components/ui/skeleton";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { EmployeeSheet } from "../components/EmployeeSheet";
import { EmployeeStatusBadge } from "../components/ui/employee-status-badge";
import { useEmployeePresence } from "../lib/presence";
import { AvatarWithStatus } from "../components/ui/avatar-with-status";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { StatusBadge } from "../components/ui/status-badge";
import {
	format,
	parseISO,
	isAfter,
	isBefore,
	differenceInDays,
} from "date-fns";
import { calculateHours } from "../utils/time-calculations";
import { LocationAssignmentSheet } from "../components/LocationAssignmentSheet";

// New component for Employee Statistics
function EmployeeStats({
	employee,
	shifts,
}: {
	employee: Employee;
	shifts: Shift[];
}) {
	const [stats, setStats] = useState({
		totalShifts: 0,
		completedShifts: 0,
		attendanceRate: 0,
		totalHours: 0,
		totalEarnings: 0,
		tenure: 0,
	});

	useEffect(() => {
		// Calculate statistics based on employee data and shifts
		const calculateStats = () => {
			// Get current date for calculations
			const now = new Date();

			// Calculate total shifts and completed shifts
			const completedShifts = shifts.filter(
				(shift) =>
					isBefore(parseISO(shift.end_time), now) && shift.status !== "canceled"
			).length;

			// Calculate total hours scheduled
			const totalHours = shifts.reduce((total, shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				return total + hours;
			}, 0);

			// Calculate attendance rate
			const attendanceRate =
				completedShifts > 0
					? (completedShifts /
							shifts.filter((shift) => isBefore(parseISO(shift.end_time), now))
								.length) *
					  100
					: 0;

			// Calculate total earnings (if hourly rate is available)
			const totalEarnings = employee.hourlyRate
				? shifts.reduce((total, shift) => {
						if (
							isBefore(parseISO(shift.end_time), now) &&
							shift.status !== "canceled"
						) {
							const hours = parseFloat(
								calculateHours(shift.start_time, shift.end_time)
							);
							return total + hours * employee.hourlyRate!;
						}
						return total;
				  }, 0)
				: 0;

			// Calculate tenure in days if hire date is available
			const tenure = employee.hireDate
				? differenceInDays(now, parseISO(employee.hireDate))
				: 0;

			setStats({
				totalShifts: shifts.length,
				completedShifts,
				attendanceRate,
				totalHours,
				totalEarnings,
				tenure,
			});
		};

		calculateStats();
	}, [employee, shifts]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Tenure</p>
							<h3 className="text-2xl font-bold">
								{stats.tenure} {stats.tenure === 1 ? "day" : "days"}
							</h3>
						</div>
						<div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
							<CalendarIcon className="h-5 w-5 text-primary" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Total Hours</p>
							<h3 className="text-2xl font-bold">
								{stats.totalHours.toFixed(1)}
							</h3>
						</div>
						<div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
							<ClockIcon className="h-5 w-5 text-primary" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Attendance Rate</p>
							<h3 className="text-2xl font-bold">
								{stats.attendanceRate.toFixed(0)}%
							</h3>
						</div>
						<div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
							<CheckCircle className="h-5 w-5 text-primary" />
						</div>
					</div>
				</CardContent>
			</Card>

			{employee.hourlyRate && (
				<Card className="md:col-span-3">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">
									Estimated Earnings (All Time)
								</p>
								<h3 className="text-2xl font-bold">
									${stats.totalEarnings.toFixed(2)}
								</h3>
							</div>
							<div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
								<DollarSign className="h-5 w-5 text-primary" />
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Shifts section component for employee details
function EmployeeShiftsSection({ employeeId }: { employeeId: string }) {
	const [isLoading, setIsLoading] = useState(true);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const navigate = useNavigate();
	const now = new Date();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
			try {
				setIsLoading(true);

				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAll();
				// Filter for this specific employee's shifts
				const employeeShifts = allShifts.filter(
					(shift) => shift.user_id === employeeId
				);
				setShifts(employeeShifts);

				// Collect locations from shifts for display
				const locationIds = new Set<string>();

				// Add locations from shifts
				employeeShifts.forEach((shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
					}
				});

				// Fetch details for all needed locations
				const locationsMap: Record<string, Location> = {};
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
				toast.error("Failed to load shifts information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchEmployeeShifts();
	}, [employeeId]);

	// Filter shifts into current, upcoming, and previous
	const currentShifts = shifts.filter(
		(shift) =>
			isAfter(parseISO(shift.end_time), now) &&
			isBefore(parseISO(shift.start_time), now)
	);

	const upcomingShifts = shifts
		.filter((shift) => isAfter(parseISO(shift.start_time), now))
		.sort(
			(a, b) =>
				parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
		)
		.slice(0, 5); // Get next 5 upcoming shifts

	const previousShifts = shifts
		.filter((shift) => isBefore(parseISO(shift.end_time), now))
		.sort(
			(a, b) =>
				parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime()
		)
		.slice(0, 5); // Get last 5 previous shifts

	// Helper function to get location name
	const getLocationName = (location_id?: string) => {
		if (!location_id) return "Unassigned";
		return locations[location_id]?.name || "Unknown Location";
	};

	// Helper function to render a shift card
	const renderShiftCard = (shift: Shift) => {
		// Map shift status to StatusBadge status type
		const getStatusType = (status?: string) => {
			if (!status) return "pending";
			switch (status.toLowerCase()) {
				case "completed":
					return "success";
				case "canceled":
					return "error";
				case "in_progress":
					return "info";
				case "scheduled":
					return "pending";
				default:
					return "pending";
			}
		};

		// Format status text to be more user-friendly
		const formatStatusText = (status?: string) => {
			if (!status) return "Scheduled";

			// Handle special case for in_progress
			if (status.toLowerCase() === "in_progress") {
				return "In Progress";
			}

			// Capitalize first letter for other statuses
			return status.charAt(0).toUpperCase() + status.slice(1);
		};

		return (
			<Card
				key={shift.id}
				className="mb-3 hover:shadow-sm transition-all cursor-pointer"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							{shift.status && (
								<StatusBadge
									status={getStatusType(shift.status)}
									text={formatStatusText(shift.status)}
									className="mb-2"
								/>
							)}
							<h4 className="font-medium">
								{format(parseISO(shift.start_time), "EEE, MMM d")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{format(parseISO(shift.start_time), "h:mm a")} -{" "}
								{format(parseISO(shift.end_time), "h:mm a")}
								<span className="mx-1">•</span>
								{calculateHours(shift.start_time, shift.end_time)} hours
							</p>
						</div>
					</div>
					{shift.location_id && (
						<div className="mt-2 text-xs flex items-center text-muted-foreground">
							<MapPin className="h-3 w-3 mr-1" />
							<span>{getLocationName(shift.location_id)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Current Shifts Section */}
			{currentShifts.length > 0 && (
				<div>
					<h3 className="text-lg font-medium mb-4 flex items-center">
						<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
						Current Shift
					</h3>
					{currentShifts.map(renderShiftCard)}
				</div>
			)}

			{/* Upcoming Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
					Upcoming Shifts
				</h3>
				{upcomingShifts.length > 0 ? (
					upcomingShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No upcoming shifts scheduled
						</CardContent>
					</Card>
				)}
			</div>

			{/* Previous Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					Previous Shifts
				</h3>
				{previousShifts.length > 0 ? (
					previousShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No previous shifts found
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

export default function EmployeeDetailPage() {
	const { employeeId } = useParams();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [shiftsLoading, setShiftsLoading] = useState(true);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [locationsLoading, setLocationsLoading] = useState(true);
	const [allLocations, setAllLocations] = useState<Location[]>([]);
	const [assignedLocationIds, setAssignedLocationIds] = useState<string[]>([]);

	// Initialize the presence service when we have an employee
	const { employeePresence, initialized: presenceInitialized } =
		useEmployeePresence(employee?.organizationId || "");

	// Get the latest presence data for this employee
	const employeeWithPresence =
		presenceInitialized && employee
			? {
					...employee,
					isOnline:
						employeePresence[employee.id]?.isOnline || employee.isOnline,
					lastActive:
						employeePresence[employee.id]?.lastActive || employee.lastActive,
			  }
			: employee;

	useEffect(() => {
		if (!employeeId) return;

		const fetchEmployee = async () => {
			try {
				setLoading(true);
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (employeeData) {
					setEmployee(employeeData);
				}
			} catch (error) {
				console.error("Error fetching employee:", error);
			} finally {
				setLoading(false);
			}
		};

		const fetchEmployeeShifts = async () => {
			try {
				setShiftsLoading(true);
				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAll();
				// Filter for this specific employee's shifts
				const employeeShifts = allShifts.filter(
					(shift) => shift.user_id === employeeId
				);
				setShifts(employeeShifts);
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
			} finally {
				setShiftsLoading(false);
			}
		};

		// Add a new function to fetch location data
		const fetchLocations = async () => {
			try {
				setLocationsLoading(true);

				// Fetch employee to get assigned locations
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (!employeeData) return;

				// Get location assignments from custom properties
				// @ts-ignore - locationAssignments is a custom property
				const locAssignments = employeeData.locationAssignments || [];
				// @ts-ignore - locationAssignment is a custom property (for backwards compatibility)
				const primaryLocation = employeeData.locationAssignment;

				// If we have locationAssignments, use that; otherwise, fall back to single locationAssignment
				const assignedIds =
					locAssignments.length > 0
						? locAssignments
						: primaryLocation
						? [primaryLocation]
						: [];

				setAssignedLocationIds(assignedIds);

				// Fetch all locations for the organization
				const orgId = employeeData.organizationId || "org-1";
				const allLocationsData = await LocationsAPI.getAll(orgId);
				setAllLocations(allLocationsData);

				// Fetch details for all assigned locations
				const locationsMap: Record<string, Location> = {};
				for (const locationId of assignedIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);
			} catch (error) {
				console.error("Error fetching location data:", error);
			} finally {
				setLocationsLoading(false);
			}
		};

		fetchEmployee();
		fetchEmployeeShifts();
		fetchLocations();
	}, [employeeId]);

	// Handler for location assignments
	const handleLocationsAssigned = async (newLocationIds: string[]) => {
		setAssignedLocationIds(newLocationIds);

		// Update locations map with any new locations
		const locationsMap = { ...locations };
		for (const locationId of newLocationIds) {
			if (!locationsMap[locationId]) {
				const location = await LocationsAPI.getById(locationId);
				if (location) {
					locationsMap[locationId] = location;
				}
			}
		}
		setLocations(locationsMap);

		// If employee exists, also update the employee record
		if (employee) {
			try {
				await EmployeesAPI.update(employee.id, {
					...employee,
					// @ts-ignore - custom properties
					locationAssignments: newLocationIds,
					// @ts-ignore - backward compatibility
					locationAssignment: newLocationIds[0] || null,
				});
			} catch (error) {
				console.error("Error updating employee locations:", error);
				toast.error("Failed to save location assignments");
			}
		}
	};

	const handleDeleteEmployee = async () => {
		if (!employee) return;

		try {
			await EmployeesAPI.delete(employee.id);
			toast.success("Employee deleted successfully");
			navigate("/employees");
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		}
	};

	// Generate user initials for the avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	// Back button to return to employees list
	const BackButton = (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => navigate("/employees")}
			className="mb-2">
			<ChevronLeft className="h-4 w-4 mr-1" /> Back to Employees
		</Button>
	);

	// Action buttons for the header
	const ActionButtons = (
		<>
			{employee && employee.status === "invited" && (
				<Button
					variant="outline"
					size="sm"
					className="h-9 gap-1 mr-2"
					onClick={async () => {
						try {
							await EmployeesAPI.resendWelcomeEmail(employee.id);
							// The API will show a toast message for success
						} catch (error) {
							console.error("Error resending welcome email:", error);
							toast.error("Failed to resend welcome email");
						}
					}}>
					<Send className="h-4 w-4 mr-1" /> Resend Welcome Email
				</Button>
			)}

			{employee && (
				<EmployeeSheet
					organizationId={employee.organizationId}
					employee={employee}
					onEmployeeUpdated={(updatedEmployee) => setEmployee(updatedEmployee)}
					trigger={
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1 mr-2">
							<Edit className="h-4 w-4" /> Edit
						</Button>
					}
				/>
			)}

			{employee && employee.hourlyRate !== undefined && (
				<Button
					variant="outline"
					size="sm"
					className="h-9 gap-1 mr-2"
					onClick={() => navigate(`/employee-earnings/${employee.id}`)}>
					<DollarSign className="h-4 w-4 mr-1" /> Earnings Report
				</Button>
			)}

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
							This will permanently delete this employee record. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteEmployee}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="skeleton"
					skeletonCount={4}
					skeletonHeight={60}
					message="Loading employee information..."
				/>
			</ContentContainer>
		);
	}

	if (!employee) {
		return (
			<ContentContainer>
				<ContentSection
					title="Employee not found"
					description="The requested employee could not be found."
					footer={
						<Button
							variant="outline"
							onClick={() => navigate("/employees")}
							className="mt-2">
							Back to Employees
						</Button>
					}>
					<p>
						The employee you're looking for may have been removed or doesn't
						exist.
					</p>
				</ContentSection>
			</ContentContainer>
		);
	}

	const initials = getInitials(employee.name);

	return (
		<>
			<ContentContainer>
				<div className="grid gap-6 mt-6">
					{/* Profile Header */}
					<ContentSection
						title="Overview"
						flat
						headerActions={ActionButtons}>
						<div className="flex items-center gap-4">
							<AvatarWithStatus
								src={employeeWithPresence?.avatar}
								alt={employeeWithPresence?.name}
								fallback={initials}
								size="xl"
								isOnline={employeeWithPresence?.isOnline}
								status={employeeWithPresence?.status as any}
							/>
							<div>
								<h2 className="text-2xl font-semibold">
									{employeeWithPresence?.name}
								</h2>
								<p className="text-muted-foreground text-lg">
									{employeeWithPresence?.position || employeeWithPresence?.role}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<EmployeeStatusBadge
										status={employeeWithPresence?.status as any}
										isOnline={employeeWithPresence?.isOnline}
										lastActive={employeeWithPresence?.lastActive}
									/>
								</div>
							</div>
						</div>
					</ContentSection>

					{/* Employee Statistics Section */}
					<ContentSection
						title="Employee Statistics"
						description="Performance metrics and statistics based on employee data">
						{shiftsLoading ? (
							<div className="space-y-4">
								<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
							</div>
						) : (
							employee && (
								<EmployeeStats
									employee={employee}
									shifts={shifts}
								/>
							)
						)}
					</ContentSection>

					{/* Assigned Locations Section */}
					<ContentSection
						title="Assigned Locations"
						description="Locations this employee is assigned to work at"
						headerActions={
							employee && (
								<LocationAssignmentSheet
									employeeId={employeeId || ""}
									employeeName={employee.name}
									allLocations={allLocations}
									assignedLocationIds={assignedLocationIds}
									onLocationsAssigned={handleLocationsAssigned}
									trigger={
										<Button
											size="sm"
											variant="outline">
											<Plus className="h-4 w-4 mr-2" />
											Manage Locations
										</Button>
									}
								/>
							)
						}>
						{locationsLoading ? (
							<div className="space-y-4">
								<div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
							</div>
						) : assignedLocationIds.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{assignedLocationIds.map((locationId, index) => {
									const location = locations[locationId];
									if (!location) return null;

									const isPrimary = index === 0; // First location is primary

									return (
										<Card key={locationId}>
											<CardContent className="p-4">
												<div className="flex flex-col">
													<div className="flex justify-between">
														<h4 className="font-medium">{location.name}</h4>
														{isPrimary && (
															<Badge
																className="ml-2"
																variant="outline">
																Primary
															</Badge>
														)}
													</div>
													{location.address && (
														<p className="text-sm text-muted-foreground">
															{location.address}
															{location.city && `, ${location.city}`}
															{location.state && `, ${location.state}`}
															{location.zipCode && ` ${location.zipCode}`}
														</p>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							<div className="text-muted-foreground p-4 border rounded-lg">
								No locations currently assigned to this employee
							</div>
						)}
					</ContentSection>

					{/* Contact Information */}
					<ContentSection title="Contact Information">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Email</div>
									<div className="text-sm">{employee.email}</div>
								</div>
							</div>

							{employee.phone && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Phone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Phone</div>
										<div className="text-sm">{employee.phone}</div>
									</div>
								</div>
							)}

							{employee.address && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<MapPin className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Address</div>
										<div className="text-sm">{employee.address}</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>

					{/* Employment Details */}
					<ContentSection title="Employment Details">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<User className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Role</div>
									<div className="text-sm">{employee.role}</div>
								</div>
							</div>

							{employee.position && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Info className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Position</div>
										<div className="text-sm">{employee.position}</div>
									</div>
								</div>
							)}

							{employee.hourlyRate !== undefined && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<DollarSign className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Hourly Rate</div>
										<div className="text-sm">
											${employee.hourlyRate.toFixed(2)}
										</div>
									</div>
								</div>
							)}

							{employee.hireDate && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Calendar className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Hire Date</div>
										<div className="text-sm">
											{new Date(employee.hireDate).toLocaleDateString()}
										</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>

					{/* Additional Information */}
					{(employee.emergencyContact || employee.notes) && (
						<ContentSection title="Additional Information">
							<div className="space-y-4">
								{employee.emergencyContact && (
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
											<AlertCircle className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">
												Emergency Contact
											</div>
											<div className="text-sm">{employee.emergencyContact}</div>
										</div>
									</div>
								)}

								{employee.notes && (
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
											<ClipboardList className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">Notes</div>
											<div className="text-sm text-muted-foreground">
												{employee.notes}
											</div>
										</div>
									</div>
								)}
							</div>
						</ContentSection>
					)}

					{/* Shifts & Scheduling Section */}
					<ContentSection title="Shifts & Scheduling">
						{employee && employeeId ? (
							<EmployeeShiftsSection employeeId={employeeId} />
						) : (
							<div className="text-muted-foreground">
								No shift information available
							</div>
						)}
					</ContentSection>
				</div>
			</ContentContainer>
		</>
	);
}
