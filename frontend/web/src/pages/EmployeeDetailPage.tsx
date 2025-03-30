import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Employee,
	EmployeesAPI,
	Shift,
	ShiftsAPI,
	LocationsAPI,
	Location,
	EmployeeLocationsAPI,
	ShiftAssignmentsAPI,
} from "@/api";
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
	Building2,
	UserX,
	MailWarning,
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
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import { EmployeeSheet } from "@/components/EmployeeSheet";
import { EmployeeStatusBadge } from "@/components/ui/employee-status-badge";
import { useEmployeePresence } from "@/lib/presence";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
	format,
	parseISO,
	isAfter,
	isBefore,
	differenceInDays,
} from "date-fns";
import { calculateHours } from "@/utils/time-calculations";
import { LocationAssignmentSheet } from "@/components/LocationAssignmentSheet";
import { useHeader } from "@/lib/header-context";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileCompletionAlert } from "@/components/ProfileCompletionAlert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getProfileCompletionStatus } from "@/utils/profile-completion";
import { ShiftCard } from "@/components/ShiftCard";

// Default placeholder image for locations
const LOCATION_PLACEHOLDER_IMAGE =
	"/images/placeholders/location-placeholder.jpg";

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
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card>
				<CardContent className="pt-6">
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
				<CardContent className="pt-6">
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
				<CardContent className="pt-6">
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
					<CardContent className="pt-6">
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
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState(true);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [employees, setEmployees] = useState<Employee[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
			try {
				setLoading(true);
				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAllSchedules();

				// Get individual shifts from each schedule
				const allIndividualShifts = [];
				for (const schedule of allShifts) {
					const scheduleShifts = await ShiftsAPI.getShiftsForSchedule(
						schedule.id
					);
					allIndividualShifts.push(...scheduleShifts);
				}

				// Get all shift assignments for this employee
				const shiftAssignments = await ShiftAssignmentsAPI.getAll();
				const employeeAssignments = shiftAssignments.filter(
					(assignment) => assignment.employee_id === employeeId
				);

				// Get the shift IDs that are assigned to this employee
				const assignedShiftIds = employeeAssignments.map(
					(assignment) => assignment.shift_id
				);

				// Filter for shifts that are either directly assigned or assigned via shift_assignments
				const employeeShifts = allIndividualShifts.filter(
					(shift: Shift) =>
						shift.user_id === employeeId || assignedShiftIds.includes(shift.id)
				);

				setShifts(employeeShifts);

				// Fetch locations for these shifts
				const locationIds = new Set(
					employeeShifts
						.map((shift: Shift) => shift.location_id)
						.filter(Boolean)
				);
				const locationsMap: Record<string, Location> = {};

				for (const locationId of locationIds) {
					if (locationId) {
						const location = await LocationsAPI.getById(locationId);
						if (location) {
							locationsMap[locationId] = location;
						}
					}
				}

				setLocations(locationsMap);

				// Fetch employee data
				const fetchedEmployee = await EmployeesAPI.getById(employeeId);
				if (fetchedEmployee) {
					setEmployees([fetchedEmployee]);
				}
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEmployeeShifts();
	}, [employeeId]);

	// Group shifts by current, upcoming, and previous
	const now = new Date();
	const currentShifts = shifts.filter(
		(shift: Shift) =>
			new Date(shift.start_time) <= now && new Date(shift.end_time) >= now
	);
	const upcomingShifts = shifts
		.filter((shift: Shift) => new Date(shift.start_time) > now)
		.sort(
			(a, b) =>
				new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
		);
	const previousShifts = shifts
		.filter((shift: Shift) => new Date(shift.end_time) < now)
		.sort(
			(a, b) =>
				new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
		)
		.slice(0, 5); // Only show the 5 most recent

	const getLocationName = (location_id?: string) => {
		if (!location_id) return "Unassigned";
		return locations[location_id]?.name || "Unknown Location";
	};

	if (loading) {
		return (
			<LoadingState
				type="spinner"
				message="Loading shift information..."
				className="py-4"
			/>
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
					<div className="space-y-4">
						{currentShifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								locationName={getLocationName(shift.location_id)}
								assignedEmployees={employees}
							/>
						))}
					</div>
				</div>
			)}

			{/* Upcoming Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
					Upcoming Shifts
				</h3>
				{upcomingShifts.length > 0 ? (
					<div className="space-y-4">
						{upcomingShifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								locationName={getLocationName(shift.location_id)}
								assignedEmployees={employees}
							/>
						))}
					</div>
				) : (
					<EmptyState
						title="No Upcoming Shifts"
						description="There are no upcoming shifts scheduled for this employee."
						icon={<Calendar className="h-6 w-6" />}
						size="small"
					/>
				)}
			</div>

			{/* Previous Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					Previous Shifts
				</h3>
				{previousShifts.length > 0 ? (
					<div className="space-y-4">
						{previousShifts.map((shift) => (
							<ShiftCard
								key={shift.id}
								shift={shift}
								locationName={getLocationName(shift.location_id)}
								assignedEmployees={employees}
							/>
						))}
					</div>
				) : (
					<EmptyState
						title="No Previous Shifts"
						description="No shift history found for this employee."
						icon={<Briefcase className="h-6 w-6" />}
						size="small"
					/>
				)}
			</div>
		</div>
	);
}

// Add a new Earnings component to display in the main content area
function EmployeeEarningsSection({ employeeId }: { employeeId: string }) {
	const [earnings, setEarnings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEarningsData = async () => {
			try {
				setLoading(true);
				// For now, get all shifts and filter by user_id
				const allShifts = await ShiftsAPI.getAllSchedules();
				const allIndividualShifts = [];

				// For each schedule, get its individual shifts
				for (const schedule of allShifts) {
					const scheduleShifts = await ShiftsAPI.getShiftsForSchedule(
						schedule.id
					);
					allIndividualShifts.push(...scheduleShifts);
				}

				// Filter for this specific employee's shifts
				const employeeShifts = allIndividualShifts.filter(
					(shift: Shift) => shift.user_id === employeeId
				);

				// Get employee for hourly rate
				const employee = await EmployeesAPI.getById(employeeId);
				if (!employee || employee.hourlyRate === undefined) {
					setEarnings([]);
					return;
				}

				// Calculate earnings data for completed shifts
				const now = new Date();
				const completedShifts = employeeShifts.filter(
					(shift: Shift) =>
						new Date(shift.end_time) < now && shift.status !== "canceled"
				);

				// Group by month
				const earningsByMonth: Record<string, number> = {};

				completedShifts.forEach((shift: Shift) => {
					const date = new Date(shift.end_time);
					const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
					const monthName = date.toLocaleString("default", {
						month: "long",
						year: "numeric",
					});

					const hours = parseFloat(
						calculateHours(shift.start_time, shift.end_time)
					);
					const shiftEarnings = hours * employee.hourlyRate!;

					if (!earningsByMonth[monthKey]) {
						earningsByMonth[monthKey] = 0;
					}

					earningsByMonth[monthKey] += shiftEarnings;
				});

				// Convert to array for display
				const earningsData = Object.entries(earningsByMonth)
					.map(([key, value]) => {
						const [year, month] = key.split("-");
						const date = new Date(parseInt(year), parseInt(month) - 1, 1);
						return {
							month: date.toLocaleString("default", {
								month: "long",
								year: "numeric",
							}),
							amount: value,
							hours: completedShifts
								.filter((shift: Shift) => {
									const shiftDate = new Date(shift.end_time);
									return (
										shiftDate.getFullYear() === parseInt(year) &&
										shiftDate.getMonth() === parseInt(month) - 1
									);
								})
								.reduce((total, shift: Shift) => {
									return (
										total +
										parseFloat(calculateHours(shift.start_time, shift.end_time))
									);
								}, 0),
						};
					})
					.sort((a, b) => {
						// Sort by date descending (newest first)
						return new Date(b.month).getTime() - new Date(a.month).getTime();
					});

				setEarnings(earningsData);
			} catch (error) {
				console.error("Error fetching earnings data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEarningsData();
	}, [employeeId]);

	if (loading) {
		return (
			<LoadingState
				type="spinner"
				message="Loading earnings information..."
				className="py-4"
			/>
		);
	}

	if (earnings.length === 0) {
		return (
			<EmptyState
				title="No Earnings Data"
				description="There are no completed shifts with earnings data available."
				icon={<DollarSign className="h-6 w-6" />}
				size="default"
			/>
		);
	}

	// Calculate total earnings
	const totalEarnings = earnings.reduce(
		(total, item) => total + item.amount,
		0
	);

	return (
		<div className="space-y-6">
			{/* Earnings Summary Card */}
			<ContentSection
				title="Total Earnings"
				flat
				className="bg-primary/5">
				<div className="flex justify-between items-center">
					<div>
						<h3 className="text-3xl font-bold">${totalEarnings.toFixed(2)}</h3>
						<p className="text-muted-foreground">All-time earnings</p>
					</div>
					<div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
						<DollarSign className="h-6 w-6 text-primary" />
					</div>
				</div>
			</ContentSection>

			{/* Monthly Earnings Table */}
			<div>
				<h3 className="text-lg font-medium mb-4">Monthly Breakdown</h3>
				<div className="border rounded-md overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Month</TableHead>
								<TableHead>Hours</TableHead>
								<TableHead className="text-right">Earnings</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{earnings.map((item, index) => (
								<TableRow key={index}>
									<TableCell className="font-medium">{item.month}</TableCell>
									<TableCell>{item.hours.toFixed(1)} hrs</TableCell>
									<TableCell className="text-right">
										${item.amount.toFixed(2)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}

export default function EmployeeDetailPage() {
	const { employeeId } = useParams();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setIsLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [shiftsLoading, setShiftsLoading] = useState(true);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [locationsLoading, setLocationsLoading] = useState(true);
	const [allLocations, setAllLocations] = useState<Location[]>([]);
	const [assignedLocationIds, setAssignedLocationIds] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState<
		"overview" | "shifts" | "locations" | "earnings"
	>("overview");
	const [locationSheetOpen, setLocationSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);

	// Initialize the presence service when we have an employee
	const { presenceState, isLoading: presenceIsLoading } = useEmployeePresence(
		employee?.organizationId || ""
	);

	// Get the latest presence data for this employee
	const employeeWithPresence =
		!presenceIsLoading && employee && presenceState[employee.id]
			? {
					...employee,
					isOnline: presenceState[employee.id]?.isOnline || employee.isOnline,
					lastActive:
						presenceState[employee.id]?.lastActive || employee.lastActive,
			  }
			: employee;

	// Update the header when employee data is loaded
	useEffect(() => {
		// Create action buttons for the header
		const createActionButtons = () => {
			if (!employee) return null;

			return (
				<>
					<EmployeeSheet
						employee={employee}
						organizationId={employee.organizationId || "org-1"}
						onEmployeeUpdated={(updatedEmployee) => {
							setEmployee((prev) => ({ ...prev!, ...updatedEmployee }));
						}}
						trigger={
							<Button
								id="edit-employee-trigger"
								variant="outline"
								size="sm">
								<Edit className="h-4 w-4 mr-2" />
								Edit
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
								className="text-destructive border-destructive/30">
								<Trash className="h-4 w-4 mr-2" />
								Delete
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete {employee.name}?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete this employee and all associated
									data. This action cannot be undone.
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
		};

		// Update header content
		if (loading) {
			updateHeader({
				title: "Loading Employee...",
				description: "Retrieving employee information",
				showBackButton: true,
			});
		} else if (!employee) {
			updateHeader({
				title: "Employee not found",
				description: "The requested employee could not be found",
				showBackButton: true,
			});
		} else {
			updateHeader({
				title: "Employee Details",
				description: employee.role || "Employee",
				actions: createActionButtons(),
				showBackButton: true,
			});
		}
	}, [loading, employee, updateHeader, deleteDialogOpen]);

	useEffect(() => {
		if (!employeeId) return;

		// Validate that employeeId is a proper UUID format
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(employeeId)) {
			console.error(`Invalid employee ID format: ${employeeId}`);
			toast.error("Invalid employee ID format");
			setIsLoading(false);
			setEmployee(null);
			return;
		}

		const fetchEmployee = async () => {
			try {
				setIsLoading(true);
				console.log(`Fetching employee with ID: ${employeeId}`);
				const employeeData = await EmployeesAPI.getById(employeeId);

				if (employeeData) {
					console.log(`Successfully retrieved employee:`, employeeData);
					setEmployee(employeeData);
				} else {
					console.error(`Employee with ID ${employeeId} not found in database`);
					setEmployee(null);
					toast.error(
						"Employee not found. The employee may have been deleted or doesn't exist."
					);
				}
			} catch (error) {
				console.error(`Error fetching employee with ID ${employeeId}:`, error);
				setEmployee(null);
				toast.error("Failed to load employee details");
			} finally {
				setIsLoading(false);
			}
		};

		const fetchEmployeeShifts = async () => {
			try {
				setShiftsLoading(true);
				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAllSchedules();

				// Get individual shifts from each schedule
				const allIndividualShifts = [];
				for (const schedule of allShifts) {
					const scheduleShifts = await ShiftsAPI.getShiftsForSchedule(
						schedule.id
					);
					allIndividualShifts.push(...scheduleShifts);
				}

				// Get all shift assignments for this employee
				const shiftAssignments = await ShiftAssignmentsAPI.getAll();
				const employeeAssignments = shiftAssignments.filter(
					(assignment) => assignment.employee_id === employeeId
				);

				// Get the shift IDs that are assigned to this employee
				const assignedShiftIds = employeeAssignments.map(
					(assignment) => assignment.shift_id
				);

				// Filter for shifts that are either directly assigned or assigned via shift_assignments
				const employeeShifts = allIndividualShifts.filter(
					(shift: Shift) =>
						shift.user_id === employeeId || assignedShiftIds.includes(shift.id)
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

				// Fetch employee to get basic info
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (!employeeData) return;

				// Get assigned location IDs from the employee_locations table
				const assignedIds = await EmployeeLocationsAPI.getByEmployeeId(
					employeeId || ""
				);
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

		// Add event listener for the custom edit-employee event
		const handleEditEmployeeEvent = (event: CustomEvent) => {
			if (event.detail?.employeeId === employeeId) {
				openEditSheet();
			}
		};

		window.addEventListener(
			"edit-employee",
			handleEditEmployeeEvent as EventListener
		);

		return () => {
			window.removeEventListener(
				"edit-employee",
				handleEditEmployeeEvent as EventListener
			);
		};
	}, [employeeId]);

	// Handler for location assignments
	const handleLocationsAssigned = async (newLocationIds: string[]) => {
		try {
			// First update the employee_locations table
			const success = await EmployeeLocationsAPI.assignLocations(
				employeeId || "",
				newLocationIds
			);

			if (!success) {
				toast.error("Failed to assign locations. Please try again.");
				return false;
			}

			// Update local state
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

			// Close the sheet after successful assignment
			setTimeout(() => {
				setLocationSheetOpen(false);
			}, 1500);

			// Show success message
			toast.success(
				`Successfully assigned ${newLocationIds.length} location(s)`
			);
			return true;
		} catch (error) {
			console.error("Error updating employee locations:", error);
			toast.error("Failed to save location assignments. Please try again.");
			return false;
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

	// Function to set a location as primary
	const setPrimaryLocation = async (locationId: string) => {
		try {
			// If the location is already primary, do nothing
			if (assignedLocationIds[0] === locationId) return;

			// Create a new array with the selected location as the first element
			const reorderedIds = [
				locationId,
				...assignedLocationIds.filter((id) => id !== locationId),
			];

			// Update the database
			const success = await EmployeeLocationsAPI.assignLocations(
				employeeId || "",
				reorderedIds
			);

			if (!success) {
				toast.error("Failed to update primary location. Please try again.");
				return;
			}

			// Update local state
			setAssignedLocationIds(reorderedIds);
			toast.success("Primary location updated successfully");
		} catch (error) {
			console.error("Error setting primary location:", error);
			toast.error("An error occurred. Please try again.");
		}
	};

	// Function to remove a location from assigned locations
	const removeLocation = async (locationId: string) => {
		try {
			// Create a new array without the location to remove
			const updatedIds = assignedLocationIds.filter((id) => id !== locationId);

			// Update the database
			const success = await EmployeeLocationsAPI.assignLocations(
				employeeId || "",
				updatedIds
			);

			if (!success) {
				toast.error("Failed to remove location. Please try again.");
				return;
			}

			// Update local state
			setAssignedLocationIds(updatedIds);
			toast.success("Location removed successfully");
		} catch (error) {
			console.error("Error removing location:", error);
			toast.error("An error occurred. Please try again.");
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

	// Function to resend welcome email
	const resendWelcomeEmail = async () => {
		if (!employee) return;

		try {
			// Here you would implement the actual API call to resend the welcome email
			toast.success("Invitation email has been resent to " + employee.email);
		} catch (error) {
			console.error("Error resending invite:", error);
			toast.error("Failed to resend invitation email");
		}
	};

	// Function to open the employee edit sheet
	const openEditSheet = () => {
		setEditSheetOpen(true);
	};

	// Action buttons for the header
	const ActionButtons = employee ? (
		<div className="flex items-center gap-2">
			{/* Show pending status in header if employee hasn't signed up */}
			{employee.status === "invited" && (
				<Button
					variant="outline"
					size="sm"
					className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:text-red-900 gap-1.5 font-medium"
					onClick={resendWelcomeEmail}>
					<UserX className="h-3.5 w-3.5" />
					<span>Resend Invite</span>
				</Button>
			)}

			{/* Add profile completion indicator in header */}
			{!getProfileCompletionStatus(employee).isComplete && (
				<Button
					variant="outline"
					size="sm"
					className={`gap-1.5 font-medium ${
						getProfileCompletionStatus(employee).missingHighPriority
							? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
							: "bg-muted border-muted-foreground/20 text-muted-foreground hover:bg-muted/80"
					}`}
					onClick={openEditSheet}>
					<AlertCircle className="h-3.5 w-3.5" />
					<span>
						{getProfileCompletionStatus(employee).missingCount} Missing
					</span>
				</Button>
			)}

			<EmployeeSheet
				employee={employee}
				organizationId={employee.organizationId || ""}
				open={editSheetOpen}
				onOpenChange={setEditSheetOpen}
				trigger={
					<Button
						id="edit-employee-trigger"
						variant="outline"
						size="sm"
						className="h-9 mr-2">
						<Edit className="h-4 w-4 mr-1" />
						Edit
					</Button>
				}
				onEmployeeUpdated={(updatedEmployee) => {
					setEmployee(updatedEmployee);
				}}
			/>
		</div>
	) : null;

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message="Loading employee information..."
					className="py-12"
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

	// Temporarily add debugging info to help diagnose the rendering issue
	console.log("Employee data loaded:", {
		employeeId,
		employee,
		employeeWithPresence,
		shiftsLoading,
		locationsLoading,
		shifts: shifts.length,
		assignedLocationIds,
		locations,
	});

	// Ensure we have complete data before rendering
	return (
		<ContentContainer>
			{/* Keep the ProfileCompletionAlert but only if it's not an invited employee */}
			{employee && employee.status !== "invited" && (
				<ProfileCompletionAlert
					employee={employee}
					onEdit={openEditSheet}
				/>
			)}

			<div className="flex flex-col md:flex-row gap-6">
				{/* Secondary Sidebar */}
				<div className="md:w-80 shrink-0 p-4">
					<div className="sticky top-6 space-y-6">
						{/* Employee Profile Card */}
						<Card className="overflow-hidden">
							<CardContent className="p-6">
								<div className="flex flex-col items-center text-center">
									<AvatarWithStatus
										className="h-24 w-24 mb-4"
										src={employee.avatar}
										alt={employee.name}
										fallback={initials}
										isOnline={employeeWithPresence?.isOnline || false}
										status={
											employee.status as "invited" | "active" | "disabled"
										}
									/>
									<h2 className="text-xl font-semibold">{employee.name}</h2>
									<p className="text-muted-foreground">
										{employee.role || "Employee"}
									</p>

									{/* Employee Status Badge */}
									<div className="mt-2">
										<EmployeeStatusBadge
											status={
												employee.status === "invited" ||
												employee.status === "active" ||
												employee.status === "disabled"
													? employee.status
													: "active"
											}
										/>
									</div>

									{/* Only show earnings link if hourly rate is set */}
									{employee.hourlyRate && (
										<Button
											variant="outline"
											size="sm"
											className="mt-4 w-full"
											onClick={() =>
												navigate(`/employees/${employee.id}/earnings`)
											}>
											<DollarSign className="h-4 w-4 mr-2" />
											View Earnings
										</Button>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Contact Information */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-md">Contact Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{employee.email && (
									<div className="flex items-start gap-2">
										<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="space-y-0.5">
											<p className="text-sm font-medium">Email</p>
											<p className="text-sm text-muted-foreground break-all">
												{employee.email}
											</p>
										</div>
									</div>
								)}

								{employee.phone && (
									<div className="flex items-start gap-2">
										<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="space-y-0.5">
											<p className="text-sm font-medium">Phone</p>
											<p className="text-sm text-muted-foreground">
												{employee.phone}
											</p>
										</div>
									</div>
								)}

								{employee.address && (
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="space-y-0.5">
											<p className="text-sm font-medium">Address</p>
											<p className="text-sm text-muted-foreground">
												{employee.address}
											</p>
										</div>
									</div>
								)}

								{employee.hireDate && (
									<div className="flex items-start gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="space-y-0.5">
											<p className="text-sm font-medium">Hire Date</p>
											<p className="text-sm text-muted-foreground">
												{new Date(employee.hireDate).toLocaleDateString()}
											</p>
										</div>
									</div>
								)}

								{employee.hourlyRate && (
									<div className="flex items-start gap-2">
										<DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="space-y-0.5">
											<p className="text-sm font-medium">Hourly Rate</p>
											<p className="text-sm text-muted-foreground">
												${employee.hourlyRate}/hr
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Assigned Locations */}
						<Card>
							<CardHeader className="pb-2 flex items-center justify-between">
								<CardTitle className="text-md">Assigned Locations</CardTitle>
								<LocationAssignmentSheet
									employeeId={employee.id}
									employeeName={employee.name}
									allLocations={allLocations}
									assignedLocationIds={assignedLocationIds}
									onLocationsAssigned={handleLocationsAssigned}
									open={locationSheetOpen}
									onOpenChange={setLocationSheetOpen}
									trigger={
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8">
											<Plus className="h-4 w-4" />
										</Button>
									}
								/>
							</CardHeader>
							<CardContent>
								{locationsLoading ? (
									<LoadingState
										type="spinner"
										message="Loading locations..."
										className="py-2"
									/>
								) : assignedLocationIds.length === 0 ? (
									<div className="text-sm text-muted-foreground py-2">
										No locations assigned
									</div>
								) : (
									<div className="space-y-2">
										{assignedLocationIds.map((locationId, index) => {
											const location = locations[locationId];
											if (!location) return null;

											return (
												<div
													key={locationId}
													className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														{index === 0 && (
															<Badge
																variant="outline"
																className="text-xs font-normal border-primary/50 text-primary bg-primary/10 rounded-sm">
																Primary
															</Badge>
														)}
														<span
															className={
																index === 0
																	? "font-medium"
																	: "text-muted-foreground"
															}>
															{location.name}
														</span>
													</div>
													<div className="flex items-center gap-1">
														{index !== 0 && (
															<Button
																variant="ghost"
																size="icon"
																className="h-7 w-7"
																onClick={() => setPrimaryLocation(locationId)}>
																<MapPinIcon className="h-3.5 w-3.5" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-destructive"
															onClick={() => removeLocation(locationId)}>
															<X className="h-3.5 w-3.5" />
														</Button>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 space-y-6">
					{/* Main Content Tabs */}
					<div className="flex border-b">
						<button
							onClick={() => setActiveTab("overview")}
							className={`pb-2 px-4 text-sm font-medium ${
								activeTab === "overview"
									? "border-b-2 border-primary text-primary"
									: "text-muted-foreground"
							}`}>
							Overview
						</button>
						<button
							onClick={() => setActiveTab("shifts")}
							className={`pb-2 px-4 text-sm font-medium ${
								activeTab === "shifts"
									? "border-b-2 border-primary text-primary"
									: "text-muted-foreground"
							}`}>
							Shifts
						</button>
						<button
							onClick={() => setActiveTab("locations")}
							className={`pb-2 px-4 text-sm font-medium ${
								activeTab === "locations"
									? "border-b-2 border-primary text-primary"
									: "text-muted-foreground"
							}`}>
							Locations
						</button>
						{employee.hourlyRate && (
							<button
								onClick={() => setActiveTab("earnings")}
								className={`pb-2 px-4 text-sm font-medium ${
									activeTab === "earnings"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground"
								}`}>
								Earnings
							</button>
						)}
					</div>

					{/* Invited Employee Alert */}
					{employee.status === "invited" && (
						<Alert
							variant="destructive"
							className="bg-red-50 border-red-200">
							<MailWarning className="h-4 w-4" />
							<AlertTitle>Pending Account Setup</AlertTitle>
							<AlertDescription>
								This employee has been invited but hasn't completed their
								account setup yet. They won't be able to view or manage their
								shifts until they sign up.
							</AlertDescription>
						</Alert>
					)}

					{/* Tab Content */}
					{activeTab === "overview" && !shiftsLoading && (
						<>
							<ContentSection title="Employee Overview">
								<EmployeeStats
									employee={employee}
									shifts={shifts}
								/>
							</ContentSection>

							<ContentSection title="Notes">
								{employee.notes ? (
									<p>{employee.notes}</p>
								) : (
									<p className="text-muted-foreground">No notes available</p>
								)}
							</ContentSection>
						</>
					)}

					{activeTab === "shifts" && (
						<ContentSection title="Shift History">
							<EmployeeShiftsSection employeeId={employee.id} />
						</ContentSection>
					)}

					{activeTab === "locations" && (
						<ContentSection title="Assigned Locations">
							{locationsLoading ? (
								<LoadingState
									type="spinner"
									message="Loading locations..."
									className="py-4"
								/>
							) : assignedLocationIds.length === 0 ? (
								<EmptyState
									title="No Locations Assigned"
									description="This employee hasn't been assigned to any locations yet."
									action={
										<Button onClick={() => setLocationSheetOpen(true)}>
											<Plus className="h-4 w-4 mr-2" />
											Assign Locations
										</Button>
									}
									icon={<Building2 className="h-8 w-8" />}
								/>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{assignedLocationIds.map((locationId) => {
										const location = locations[locationId];
										if (!location) return null;

										return (
											<Card
												key={locationId}
												className="overflow-hidden">
												<div className="h-32 bg-muted">
													{location.imageUrl ? (
														<img
															src={location.imageUrl}
															alt={location.name}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center bg-primary/10">
															<Building2 className="h-8 w-8 text-primary" />
														</div>
													)}
												</div>
												<CardContent className="p-4">
													<h3 className="font-medium mb-1">{location.name}</h3>
													<p className="text-sm text-muted-foreground mb-2">
														{location.address}
													</p>
													<Button
														variant="outline"
														size="sm"
														className="w-full"
														onClick={() =>
															navigate(`/locations/${location.id}`)
														}>
														View Location
													</Button>
												</CardContent>
											</Card>
										);
									})}
								</div>
							)}
						</ContentSection>
					)}

					{activeTab === "earnings" && (
						<ContentSection title="Earnings Overview">
							<EmployeeEarningsSection employeeId={employee.id} />
						</ContentSection>
					)}
				</div>
			</div>
		</ContentContainer>
	);
}
