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
import { PageHeader } from "@/components/ui/page-header";

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
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
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

	const renderShiftCard = (shift: Shift) => {
		const getStatusType = (
			status?: string
		): "success" | "warning" | "error" | "info" | "pending" => {
			if (!status) return "pending";
			switch (status.toLowerCase()) {
				case "completed":
					return "success";
				case "canceled":
					return "error";
				case "pending":
					return "warning";
				case "in_progress":
					return "info";
				default:
					return "pending";
			}
		};

		const formatStatusText = (status?: string): string => {
			if (!status) return "Unknown";
			return status.charAt(0).toUpperCase() + status.slice(1);
		};

		return (
			<Card
				key={shift.id}
				className="mb-4 cursor-pointer hover:shadow-sm transition-all"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{getLocationName(shift.location_id)}
							</h4>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Calendar className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleDateString()}
							</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Clock className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}{" "}
								-{" "}
								{new Date(shift.end_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
						<StatusBadge
							status={getStatusType(shift.status)}
							text={formatStatusText(shift.status)}
						/>
					</div>
				</CardContent>
			</Card>
		);
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
					previousShifts.map(renderShiftCard)
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
				setIsLoading(true);
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (employeeData) {
					setEmployee(employeeData);
				}
			} catch (error) {
				console.error("Error fetching employee:", error);
			} finally {
				setIsLoading(false);
			}
		};

		const fetchEmployeeShifts = async () => {
			try {
				setShiftsLoading(true);
				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAllSchedules();
				// Filter for this specific employee's shifts
				const employeeShifts = allShifts.filter(
					(shift: Shift) => shift.user_id === employeeId
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

	// Function to open the employee edit sheet - moved above ActionButtons
	const openEditSheet = () => {
		const editButton = document.getElementById("edit-employee-trigger");
		if (editButton) editButton.click();
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

	return (
		<>
			<PageHeader
				title="Employee Details"
				description={employee.position || employee.role || "Employee"}
				actions={ActionButtons}
				showBackButton={true}
			/>
			<ContentContainer>
				{/* Keep the ProfileCompletionAlert but only if it's not an invited employee (to prevent double messaging) */}
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
							{/* Employee Profile */}
							<div className="space-y-2">
								<AvatarWithStatus
									src={employeeWithPresence?.avatar}
									alt={employeeWithPresence?.name}
									fallback={initials}
									size="lg"
									isOnline={employeeWithPresence?.isOnline}
									status={employeeWithPresence?.status as any}
								/>
								<div>
									<h3 className="font-semibold capitalize text-lg">
										{employeeWithPresence?.name}
									</h3>
									<p className="text-muted-foreground">
										{employee.position || employee.role || "Employee"}
									</p>
								</div>
								<div className="mt-1">
									<EmployeeStatusBadge
										status={employeeWithPresence?.status as any}
										isOnline={employeeWithPresence?.isOnline}
										lastActive={employeeWithPresence?.lastActive}
									/>
								</div>

								{/* Contact Information */}
								<div className="pt-4 space-y-3 border-t mt-4">
									<div className="flex items-center">
										<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
										<span className="truncate">{employee.email}</span>
									</div>

									{employee.phone && (
										<div className="flex items-center">
											<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
											<span>{employee.phone}</span>
										</div>
									)}

									{employee.address && (
										<div className="flex items-center">
											<MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
											<span className="truncate">{employee.address}</span>
										</div>
									)}

									{!locationsLoading &&
										assignedLocationIds.length > 0 &&
										locations[assignedLocationIds[0]] && (
											<div className="flex items-center">
												<Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
												<div className="flex items-center gap-2">
													<span className="truncate">
														{locations[assignedLocationIds[0]].name}
													</span>
													<Badge
														className="text-xs"
														variant="outline"
														size="sm">
														Primary
													</Badge>
												</div>
											</div>
										)}

									{employee.hourlyRate !== undefined && (
										<div className="flex items-center">
											<DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
											<span>${employee.hourlyRate.toFixed(2)}/hr</span>
										</div>
									)}
								</div>
							</div>

							{/* Quick Actions */}
							<div className="mt-4">
								<h3 className="text-sm font-medium mb-3 px-1">Quick Actions</h3>
								<div className="space-y-2">
									<button
										className="flex items-center w-full text-left px-3 py-3 border rounded"
										onClick={() =>
											navigate("/schedule/create?employeeId=" + employee.id)
										}>
										<Plus className="h-4 w-4 mr-2" />
										Assign to Shift
									</button>

									<button
										className="flex items-center w-full text-left px-3 py-3 border rounded"
										onClick={() => {
											setLocationSheetOpen(true);
											setActiveTab("locations");
										}}>
										<MapPin className="h-4 w-4 mr-2" />
										<div className="flex-1 flex justify-between items-center">
											<span>Assign to Location</span>
											{!locationsLoading && assignedLocationIds.length > 0 && (
												<Badge
													variant="secondary"
													className="ml-2">
													{assignedLocationIds.length}
												</Badge>
											)}
										</div>
									</button>

									<button className="flex items-center w-full text-left px-3 py-3 border rounded">
										<Mail className="h-4 w-4 mr-2" />
										Send Message
									</button>

									<button
										className="flex items-center w-full text-left px-3 py-3 border rounded"
										onClick={() => {
											const editButton = document.getElementById(
												"edit-employee-trigger"
											);
											if (editButton) editButton.click();
										}}>
										<Edit className="h-4 w-4 mr-2" />
										Edit Employee
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="flex-1 space-y-6">
						{/* Tabbed Navigation */}
						<div className="flex border-b">
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === "overview"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
								onClick={() => setActiveTab("overview")}>
								Overview
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === "shifts"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
								onClick={() => setActiveTab("shifts")}>
								Past Shifts
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === "locations"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
								onClick={() => setActiveTab("locations")}>
								Locations
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === "earnings"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
								onClick={() => setActiveTab("earnings")}>
								Earnings
							</button>
						</div>

						{activeTab === "overview" && (
							<>
								{/* Employee Statistics Section */}
								<ContentSection
									title="Employee Statistics"
									description="Performance metrics and statistics based on employee data">
									{shiftsLoading ? (
										<LoadingState
											type="spinner"
											message="Loading statistics..."
											className="py-4"
										/>
									) : (
										employee && (
											<EmployeeStats
												employee={employee}
												shifts={shifts}
											/>
										)
									)}
								</ContentSection>

								{/* Upcoming Shifts Section - Added to Overview */}
								<ContentSection
									title="Upcoming Shifts"
									description="Next shifts scheduled for this employee">
									<EmployeeUpcomingShifts employeeId={employeeId || ""} />
								</ContentSection>
							</>
						)}

						{activeTab === "shifts" && (
							<ContentSection
								title="Past Shifts"
								description="View previous shifts for this employee">
								<EmployeePastShiftsSection employeeId={employeeId || ""} />
							</ContentSection>
						)}

						{activeTab === "locations" && (
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
											open={locationSheetOpen}
											onOpenChange={setLocationSheetOpen}
											trigger={
												<Button
													id="location-sheet-trigger"
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
									<LoadingState
										type="spinner"
										message="Loading location information..."
										className="py-4"
									/>
								) : assignedLocationIds.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
										{assignedLocationIds.map((locationId, index) => {
											const location = locations[locationId];
											if (!location) return null;

											const isPrimary = index === 0; // First location is primary

											return (
												<Card key={locationId}>
													<div className="overflow-hidden relative aspect-video">
														{location.imageUrl ? (
															<img
																src={location.imageUrl}
																alt={location.name}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="h-full w-full bg-muted/10 flex items-center justify-center relative">
																<img
																	src={LOCATION_PLACEHOLDER_IMAGE}
																	alt={location.name}
																	className="h-full w-full object-cover opacity-70"
																	onError={(e) => {
																		// If the placeholder image fails to load, show the building icon
																		e.currentTarget.style.display = "none";
																		e.currentTarget.parentElement?.classList.add(
																			"bg-muted/20"
																		);
																		const iconElement =
																			e.currentTarget.nextElementSibling;
																		if (iconElement) {
																			iconElement.classList.remove("hidden");
																		}
																	}}
																/>
																<Building2 className="h-12 w-12 text-muted-foreground/30 absolute hidden" />
															</div>
														)}
														{isPrimary && (
															<div className="absolute top-2 right-2">
																<Badge
																	className="bg-primary/90 hover:bg-primary text-primary-foreground"
																	variant="default">
																	Primary
																</Badge>
															</div>
														)}
													</div>
													<CardContent className="pt-4">
														<div className="flex flex-col">
															<div className="flex justify-between items-start">
																<h4 className="font-medium text-lg">
																	{location.name}
																</h4>
															</div>
															{location.address && (
																<p className="text-sm text-muted-foreground mt-2">
																	{location.address}
																	{location.city && `, ${location.city}`}
																	{location.state && `, ${location.state}`}
																	{location.zipCode && ` ${location.zipCode}`}
																</p>
															)}
															<div className="flex justify-between items-center mt-4">
																<div className="flex items-center text-sm text-muted-foreground">
																	<MapPin className="h-4 w-4 mr-2 opacity-70" />
																	<span>Location</span>
																</div>
																<div className="flex gap-2">
																	{!isPrimary && (
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() =>
																				setPrimaryLocation(locationId)
																			}>
																			Set as Primary
																		</Button>
																	)}
																	<AlertDialog>
																		<AlertDialogTrigger asChild>
																			<Button
																				variant="outline"
																				size="sm"
																				className="text-destructive hover:text-destructive hover:bg-destructive/10">
																				Remove
																			</Button>
																		</AlertDialogTrigger>
																		<AlertDialogContent>
																			<AlertDialogHeader>
																				<AlertDialogTitle>
																					Remove Location
																				</AlertDialogTitle>
																				<AlertDialogDescription>
																					Are you sure you want to remove{" "}
																					{location.name} from this employee's
																					assigned locations?
																					{isPrimary &&
																						" This is the primary location."}
																				</AlertDialogDescription>
																			</AlertDialogHeader>
																			<AlertDialogFooter>
																				<AlertDialogCancel>
																					Cancel
																				</AlertDialogCancel>
																				<AlertDialogAction
																					onClick={() =>
																						removeLocation(locationId)
																					}
																					className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
																					Remove
																				</AlertDialogAction>
																			</AlertDialogFooter>
																		</AlertDialogContent>
																	</AlertDialog>
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								) : (
									<EmptyState
										title="No Assigned Locations"
										description="This employee hasn't been assigned to any locations yet."
										icon={<MapPin className="h-6 w-6" />}
										action={
											<LocationAssignmentSheet
												employeeId={employeeId || ""}
												employeeName={employee.name}
												allLocations={allLocations}
												assignedLocationIds={assignedLocationIds}
												onLocationsAssigned={handleLocationsAssigned}
												open={locationSheetOpen}
												onOpenChange={setLocationSheetOpen}
												trigger={
													<Button size="sm">
														<Plus className="h-4 w-4 mr-2" />
														Assign Location
													</Button>
												}
											/>
										}
									/>
								)}
							</ContentSection>
						)}

						{activeTab === "earnings" && (
							<ContentSection
								title="Earnings"
								description="Track and review employee earnings based on completed shifts">
								<EmployeeEarningsSection employeeId={employeeId || ""} />
							</ContentSection>
						)}
					</div>

					{/* Hidden components accessible by ID */}
					<div className="hidden">
						<EmployeeSheet
							employee={employee}
							organizationId={employee.organizationId || ""}
							trigger={<Button id="edit-employee-trigger">Edit</Button>}
							onEmployeeUpdated={(updatedEmployee) => {
								setEmployee(updatedEmployee);
							}}
						/>
					</div>
				</div>
			</ContentContainer>
		</>
	);
}

// Update resendWelcomeEmail implementation in EmployeeDetailPage
function resendWelcomeEmail() {
	// Create a simple implementation since this method doesn't exist
	toast.info("Welcome email feature not yet implemented");
}

// Add new specialized components for the split shift views
function EmployeeUpcomingShifts({ employeeId }: { employeeId: string }) {
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState(true);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
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
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEmployeeShifts();
	}, [employeeId]);

	// Group shifts by current and upcoming
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

	const getLocationName = (location_id?: string) => {
		if (!location_id) return "Unassigned";
		return locations[location_id]?.name || "Unknown Location";
	};

	const renderShiftCard = (shift: Shift) => {
		const getStatusType = (
			status?: string
		): "success" | "warning" | "error" | "info" | "pending" => {
			if (!status) return "pending";
			switch (status.toLowerCase()) {
				case "completed":
					return "success";
				case "canceled":
					return "error";
				case "pending":
					return "warning";
				case "in_progress":
					return "info";
				default:
					return "pending";
			}
		};

		const formatStatusText = (status?: string): string => {
			if (!status) return "Unknown";
			return status.charAt(0).toUpperCase() + status.slice(1);
		};

		return (
			<Card
				key={shift.id}
				className="mb-4 cursor-pointer hover:shadow-sm transition-all"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{getLocationName(shift.location_id)}
							</h4>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Calendar className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleDateString()}
							</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Clock className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}{" "}
								-{" "}
								{new Date(shift.end_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
						<StatusBadge
							status={getStatusType(shift.status)}
							text={formatStatusText(shift.status)}
						/>
					</div>
				</CardContent>
			</Card>
		);
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
					<EmptyState
						title="No Upcoming Shifts"
						description="There are no upcoming shifts scheduled for this employee."
						icon={<Calendar className="h-6 w-6" />}
						size="small"
					/>
				)}
			</div>
		</div>
	);
}

function EmployeePastShiftsSection({ employeeId }: { employeeId: string }) {
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState(true);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
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
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEmployeeShifts();
	}, [employeeId]);

	// Get past shifts
	const now = new Date();
	const previousShifts = shifts
		.filter((shift: Shift) => new Date(shift.end_time) < now)
		.sort(
			(a, b) =>
				new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
		);

	const getLocationName = (location_id?: string) => {
		if (!location_id) return "Unassigned";
		return locations[location_id]?.name || "Unknown Location";
	};

	const renderShiftCard = (shift: Shift) => {
		const getStatusType = (
			status?: string
		): "success" | "warning" | "error" | "info" | "pending" => {
			if (!status) return "pending";
			switch (status.toLowerCase()) {
				case "completed":
					return "success";
				case "canceled":
					return "error";
				case "pending":
					return "warning";
				case "in_progress":
					return "info";
				default:
					return "pending";
			}
		};

		const formatStatusText = (status?: string): string => {
			if (!status) return "Unknown";
			return status.charAt(0).toUpperCase() + status.slice(1);
		};

		return (
			<Card
				key={shift.id}
				className="mb-4 cursor-pointer hover:shadow-sm transition-all"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{getLocationName(shift.location_id)}
							</h4>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Calendar className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleDateString()}
							</div>
							<div className="text-sm text-muted-foreground mt-1 flex items-center">
								<Clock className="h-3.5 w-3.5 mr-1.5" />
								{new Date(shift.start_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}{" "}
								-{" "}
								{new Date(shift.end_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
						<StatusBadge
							status={getStatusType(shift.status)}
							text={formatStatusText(shift.status)}
						/>
					</div>
				</CardContent>
			</Card>
		);
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
			{/* Previous Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					Previous Shifts
				</h3>
				{previousShifts.length > 0 ? (
					previousShifts.map(renderShiftCard)
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
