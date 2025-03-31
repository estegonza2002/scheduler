import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	MailWarning,
	Mail,
	Phone,
	MapPin,
	Building2,
	Calendar,
	Clock,
	ChevronLeft,
	DollarSign,
	AlertTriangle,
	UserPlus,
	BarChart,
	X,
	Edit,
	Trash,
	Plus,
	FileText,
	Download,
	ArrowDownUp,
	TrendingUp,
	BarChart3,
	ClipboardList,
	User,
	Calendar as CalendarIcon,
	Clock as ClockIcon,
	CheckCircle,
	Briefcase,
	AlertCircle,
	UserX,
	MapPin as MapPinIcon,
} from "lucide-react";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import {
	Employee,
	EmployeesAPI,
	Shift,
	ShiftsAPI,
	Location,
	LocationsAPI,
	Schedule,
	EmployeeLocationsAPI,
	ShiftAssignmentsAPI,
} from "@/api";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateHours } from "@/utils/time-calculations";
import { useEmployeePresence } from "@/lib/presence";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { EmployeeStatusBadge } from "@/components/ui/employee-status-badge";
import { EmployeeAssignmentSheet } from "@/components/EmployeeAssignmentSheet";
import { getProfileCompletionStatus } from "@/utils/profile-completion";
import { ShiftCard } from "@/components/ShiftCard";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { LocationAssignmentSheet } from "@/components/LocationAssignmentSheet";
import { useHeader } from "@/lib/header-context";
import { LocationCard } from "@/components/ui/location-card";
import { EmployeeNav } from "@/components/EmployeeNav";
import { useEffect as useNavigationEffect } from "react";
import { EmployeeDialog } from "@/components/EmployeeDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { exportToCSV, exportToExcel } from "@/utils/export-utils";
import {
	format,
	parseISO,
	isWithinInterval,
	startOfDay,
	endOfDay,
	addMonths,
	startOfMonth,
	endOfMonth,
	isBefore,
	differenceInDays,
} from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
import { EmployeeCard } from "@/components/EmployeeCard";

// Define the DateRange interface
interface DateRange {
	from: Date | undefined;
	to: Date | undefined;
}

// Define the EarningsReportItem interface
interface EarningsReportItem {
	date: string;
	locationName: string;
	scheduledHours: number;
	actualHours: number | null;
	scheduledEarnings: number;
	actualEarnings: number | null;
	hours: number;
	earnings: number;
	startTime: string;
	endTime: string;
	shiftId: string;
	hourlyRate: number;
	status: string | undefined;
}

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
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Current Shifts Section */}
			{currentShifts.length > 0 && (
				<div>
					<div className="flex items-center mb-4">
						<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
						<h3 className="text-lg font-medium">Current Shift</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
				<div className="flex items-center mb-4">
					<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
					<h3 className="text-lg font-medium">Upcoming Shifts</h3>
				</div>
				{upcomingShifts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
				<div className="flex items-center mb-4">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					<h3 className="text-lg font-medium">Previous Shifts</h3>
				</div>
				{previousShifts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

// Enhanced Employee Earnings Section
function EnhancedEmployeeEarningsSection({
	employeeId,
}: {
	employeeId: string;
}) {
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [loading, setLoading] = useState(true);
	const [reportData, setReportData] = useState<EarningsReportItem[]>([]);
	const [dateRange, setDateRange] = useState<DateRange>({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	});
	const [activeTab, setActiveTab] = useState("current-month");
	const [employee, setEmployee] = useState<Employee | null>(null);
	const navigate = useNavigate();

	// Calculate summary values
	const totalScheduledHours = reportData.reduce(
		(total, item) => total + item.hours,
		0
	);
	const totalActualHours = reportData.reduce(
		(total, item) => total + (item.actualHours || item.hours),
		0
	);
	const totalScheduledEarnings = reportData.reduce(
		(total, item) => total + item.earnings,
		0
	);
	const totalActualEarnings = reportData.reduce(
		(total, item) => total + (item.actualEarnings || item.earnings),
		0
	);

	// Format data for export
	const getExportData = () => {
		return reportData.map((item) => ({
			Date: format(parseISO(item.startTime), "MMM d, yyyy"),
			"Shift ID": item.shiftId,
			"Start Time": format(parseISO(item.startTime), "h:mm a"),
			"End Time": format(parseISO(item.endTime), "h:mm a"),
			"Scheduled Hours": item.hours.toFixed(2),
			"Actual Hours": item.actualHours ? item.actualHours.toFixed(2) : "N/A",
			"Hourly Rate": `$${item.hourlyRate.toFixed(2)}`,
			"Scheduled Earnings": `$${item.earnings.toFixed(2)}`,
			"Actual Earnings": item.actualEarnings
				? `$${item.actualEarnings.toFixed(2)}`
				: "N/A",
			Location: item.locationName,
			Status: item.status
				? item.status.charAt(0).toUpperCase() + item.status.slice(1)
				: "N/A",
		}));
	};

	// Function to handle export
	const handleExportReport = (formatType: "csv" | "excel") => {
		const data = getExportData();
		const filename = `${employee?.email || "employee"}_earnings_report`;

		if (formatType === "csv") {
			exportToCSV(data, filename);
			toast.success("CSV report generated successfully");
		} else {
			exportToExcel(data, filename);
			toast.success("Excel report generated successfully");
		}
	};

	// Function to render variance
	const renderVariance = (scheduled: number, actual: number | null) => {
		if (actual === null) return null;

		const diff = actual - scheduled;
		const isPositive = diff > 0;
		const formattedDiff = Math.abs(diff).toFixed(2);

		return (
			<span
				className={`text-xs ml-2 ${
					isPositive ? "text-green-600" : "text-red-600"
				}`}>
				{isPositive ? "+" : "-"}
				{formattedDiff} ({((Math.abs(diff) / scheduled) * 100).toFixed(1)}%)
			</span>
		);
	};

	// Get predefined date ranges
	const getPredefinedRange = (type: string): DateRange => {
		const now = new Date();
		switch (type) {
			case "current-month":
				return {
					from: startOfMonth(now),
					to: endOfMonth(now),
				};
			case "previous-month":
				const prevMonth = addMonths(now, -1);
				return {
					from: startOfMonth(prevMonth),
					to: endOfMonth(prevMonth),
				};
			case "last-3-months":
				return {
					from: startOfMonth(addMonths(now, -2)),
					to: endOfMonth(now),
				};
			case "year-to-date":
				return {
					from: new Date(now.getFullYear(), 0, 1),
					to: now,
				};
			case "custom":
			default:
				return dateRange;
		}
	};

	// Handle date range changes
	const handleDateRangeChange = (newRange: DateRange) => {
		setDateRange(newRange);
		generateReportData(shifts, employee, newRange);
	};

	// Handle tab changes
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		if (value !== "custom") {
			const range = getPredefinedRange(value);
			setDateRange(range);
			generateReportData(shifts, employee, range);
		}
	};

	// Generate report data when shifts, employee, or date range changes
	const generateReportData = (
		shifts: Shift[],
		employee: Employee | null,
		range: DateRange
	) => {
		if (!employee || !shifts.length) return [];

		// Filter shifts by date range and employee
		const filteredShifts = shifts.filter((shift) => {
			const shiftDate = parseISO(shift.start_time);
			const belongsToEmployee = shift.user_id === employee.id;
			const inDateRange =
				range.from &&
				range.to &&
				isWithinInterval(shiftDate, {
					start: startOfDay(range.from),
					end: endOfDay(range.to),
				});

			return belongsToEmployee && inDateRange;
		});

		// Process shifts for earnings data
		const data = filteredShifts.map((shift) => {
			const hours = parseFloat(
				calculateHours(shift.start_time, shift.end_time)
			);

			// Get hourly rate
			const hourlyRate = employee?.hourlyRate || 0;

			// Calculate earnings
			const earnings = hours * hourlyRate;

			// For completed shifts, we'll simulate actual hours
			// In a real app, this would come from clock-in/out data
			let actualHours = null;
			let actualEarnings = null;

			if (shift.status === "completed") {
				// For demo purposes, use the scheduled hours as actual hours
				actualHours = hours;
				actualEarnings = earnings;
			}

			return {
				date: format(parseISO(shift.start_time), "yyyy-MM-dd"),
				shiftId: shift.id,
				startTime: shift.start_time,
				endTime: shift.end_time,
				hours: hours,
				actualHours: actualHours,
				hourlyRate: hourlyRate,
				earnings: earnings,
				actualEarnings: actualEarnings,
				scheduledHours: hours,
				scheduledEarnings: earnings,
				locationName: locations[shift.location_id || ""]
					? locations[shift.location_id || ""].name
					: "Unknown",
				status: shift.status,
			};
		});

		return data;
	};

	// Fetch data
	const fetchData = async () => {
		try {
			setLoading(true);

			// Get employee details
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

			// Get all schedules
			const schedules = await ShiftsAPI.getAllSchedules();

			// Fetch shifts for each schedule
			const allShiftsPromises = schedules.map((schedule: Schedule) =>
				ShiftsAPI.getShiftsForSchedule(schedule.id)
			);

			const allShiftsArrays = await Promise.all(allShiftsPromises);
			const allShifts = allShiftsArrays.flat();

			// Filter for this employee's shifts
			const employeeShifts = allShifts.filter(
				(shift: Shift) => shift.user_id === employeeId
			);
			setShifts(employeeShifts);

			// Get all locations used in shifts
			const locationIds = new Set<string>();
			employeeShifts.forEach((shift: Shift) => {
				if (shift.location_id) {
					locationIds.add(shift.location_id);
				}
			});

			// Fetch location details
			const locationsMap: Record<string, Location> = {};
			for (const locationId of locationIds) {
				const location = await LocationsAPI.getById(locationId);
				if (location) {
					locationsMap[locationId] = location;
				}
			}
			setLocations(locationsMap);

			// Generate initial report data
			const reportData = generateReportData(
				employeeShifts,
				employeeData,
				dateRange
			);
			setReportData(reportData);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to load employee earnings data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [employeeId]);

	if (loading) {
		return (
			<LoadingState
				type="spinner"
				message="Loading earnings information..."
			/>
		);
	}

	if (!employee || !employee.hourlyRate) {
		return (
			<EmptyState
				title="No Earnings Data"
				description="This employee doesn't have an hourly rate set."
				icon={<DollarSign className="h-6 w-6" />}
				size="default"
			/>
		);
	}

	if (reportData.length === 0) {
		return (
			<EmptyState
				title="No Earnings Data"
				description="There are no completed shifts with earnings data available for the selected period."
				icon={<DollarSign className="h-6 w-6" />}
				size="default"
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Date Filter Section */}
			<Tabs
				defaultValue={activeTab}
				onValueChange={handleTabChange}
				className="w-full mb-6">
				<TabsList className="grid grid-cols-5">
					<TabsTrigger value="current-month">Current Month</TabsTrigger>
					<TabsTrigger value="previous-month">Previous Month</TabsTrigger>
					<TabsTrigger value="last-3-months">Last 3 Months</TabsTrigger>
					<TabsTrigger value="year-to-date">Year to Date</TabsTrigger>
					<TabsTrigger value="custom">Custom Range</TabsTrigger>
				</TabsList>

				<TabsContent
					value="custom"
					className="mt-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="grid gap-2">
							<Label htmlFor="from">From Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!dateRange.from && "text-muted-foreground"
										)}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange.from ? (
											format(dateRange.from, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<CalendarComponent
										mode="single"
										selected={dateRange.from}
										onSelect={(date) =>
											handleDateRangeChange({
												...dateRange,
												from: date,
											})
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="to">To Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!dateRange.to && "text-muted-foreground"
										)}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange.to ? (
											format(dateRange.to, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<CalendarComponent
										mode="single"
										selected={dateRange.to}
										onSelect={(date) =>
											handleDateRangeChange({
												...dateRange,
												to: date,
											})
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* Earnings Summary Section */}
			<ContentSection
				title="Earnings Summary"
				description="Overview of hours worked and earnings"
				headerActions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleExportReport("csv")}>
							<FileText className="h-4 w-4 mr-2" />
							Export CSV
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleExportReport("excel")}>
							<Download className="h-4 w-4 mr-2" />
							Export Excel
						</Button>
					</div>
				}>
				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-medium">
								Total Scheduled Hours
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center">
								<ClockIcon className="h-5 w-5 mr-2 text-muted-foreground" />
								<span className="text-2xl font-bold">
									{totalScheduledHours.toFixed(1)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{dateRange.from &&
									dateRange.to &&
									`${format(dateRange.from, "MMM d")} - ${format(
										dateRange.to,
										"MMM d, yyyy"
									)}`}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-medium">
								Total Actual Hours
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center">
								<ClockIcon className="h-5 w-5 mr-2 text-muted-foreground" />
								<span className="text-2xl font-bold">
									{totalActualHours.toFixed(1)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{dateRange.from &&
									dateRange.to &&
									`${format(dateRange.from, "MMM d")} - ${format(
										dateRange.to,
										"MMM d, yyyy"
									)}`}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-medium">
								Total Earnings
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center">
								<DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
								<span className="text-2xl font-bold">
									${totalActualEarnings.toFixed(2)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{reportData.length} shifts
							</p>
						</CardContent>
					</Card>
				</div>
			</ContentSection>

			{/* Detailed Earnings Table */}
			<ContentSection
				title="Detailed Earnings"
				description="Shift-by-shift breakdown of hours and earnings">
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Shift</TableHead>
								<TableHead>Time</TableHead>
								<TableHead>Scheduled Hours</TableHead>
								<TableHead>Actual Hours</TableHead>
								<TableHead>Rate</TableHead>
								<TableHead>Scheduled Earnings</TableHead>
								<TableHead>Actual Earnings</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reportData.length > 0 ? (
								reportData.map((item) => (
									<TableRow
										key={item.shiftId}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => navigate(`/shifts/${item.shiftId}`)}>
										<TableCell>
											{format(parseISO(item.startTime), "MMM d, yyyy")}
										</TableCell>
										<TableCell>{item.shiftId}</TableCell>
										<TableCell>
											{format(parseISO(item.startTime), "h:mm a")} -{" "}
											{format(parseISO(item.endTime), "h:mm a")}
										</TableCell>
										<TableCell>{item.hours.toFixed(2)}</TableCell>
										<TableCell>
											{item.actualHours ? (
												<div className="flex items-center">
													{item.actualHours.toFixed(2)}
													{renderVariance(item.hours, item.actualHours)}
												</div>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>${item.hourlyRate.toFixed(2)}</TableCell>
										<TableCell className="font-medium">
											${item.earnings.toFixed(2)}
										</TableCell>
										<TableCell className="font-medium">
											{item.actualEarnings ? (
												<div className="flex items-center">
													${item.actualEarnings.toFixed(2)}
													{renderVariance(item.earnings, item.actualEarnings)}
												</div>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>{item.locationName}</TableCell>
										<TableCell>
											<Badge
												variant={
													item.status === "completed"
														? "default"
														: item.status === "pending"
														? "secondary"
														: "outline"
												}
												className={
													item.status === "completed"
														? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200"
														: item.status === "pending"
														? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-200"
														: ""
												}>
												{item.status
													? item.status.charAt(0).toUpperCase() +
													  item.status.slice(1)
													: "N/A"}
											</Badge>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={10}
										className="text-center py-8">
										No earnings data available for the selected period.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Card>
			</ContentSection>

			{/* Earnings Analysis */}
			{reportData.length > 0 && (
				<ContentSection
					title="Earnings Analysis"
					description="Detailed financial breakdown and analysis">
					<Card>
						<CardContent className="pt-6">
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm">Base Hourly Earnings</span>
									<span className="font-medium">
										${totalScheduledEarnings.toFixed(2)}
									</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center">
									<span className="text-sm">Total Scheduled Hours</span>
									<span className="font-medium">
										{totalScheduledHours.toFixed(2)} hours
									</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center">
									<span className="text-sm">Total Actual Hours</span>
									<span className="font-medium">
										{totalActualHours.toFixed(2)} hours
									</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center">
									<span className="text-sm">Total Shifts</span>
									<span className="font-medium">
										{reportData.length} shifts
									</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center font-bold pt-2">
									<span>Total Scheduled Earnings</span>
									<span>${totalScheduledEarnings.toFixed(2)}</span>
								</div>
								<div className="flex justify-between items-center font-bold pt-2">
									<span>Total Actual Earnings</span>
									<span>${totalActualEarnings.toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</ContentSection>
			)}
		</div>
	);
}

// Add this formatPhoneNumber helper function before the EmployeeDetailPage component
// Format phone number to display in a readable format
const formatPhoneNumber = (phone?: string) => {
	if (!phone) return "";
	// Basic formatting for US phone numbers
	const cleaned = phone.replace(/\D/g, "");
	if (cleaned.length === 10) {
		return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(
			3,
			6
		)}-${cleaned.substring(6, 10)}`;
	} else if (cleaned.length === 11 && cleaned.startsWith("1")) {
		return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(
			4,
			7
		)}-${cleaned.substring(7, 11)}`;
	}
	return phone; // Return as is if not standard format
};

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
	const location = useLocation();

	// Handle tab switching based on URL path or navigation
	useNavigationEffect(() => {
		// If we're returning from the earnings page or have a tab in location state
		if (location.state?.activeTab) {
			setActiveTab(location.state.activeTab);
		}
	}, [location]);

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
					{/* Show Resend Invite button if employee hasn't signed up */}
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

					{/* Replace nested Dialog with a direct button that calls openEditSheet */}
					<Button
						id="edit-employee-trigger"
						variant="outline"
						size="sm"
						className="h-9 mr-2"
						onClick={openEditSheet}>
						<Edit className="h-4 w-4 mr-1" />
						Edit
					</Button>

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
				title: `${employee.name}`,
				description: employee.position || "Employee",
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
			const success = await EmployeesAPI.resendInvite(employee.id);

			if (success) {
				toast.success("Invitation email has been resent to " + employee.email);
			} else {
				throw new Error("Failed to resend invitation");
			}
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

			{/* Replace nested Dialog with a direct edit button */}
			<Button
				id="edit-employee-trigger"
				variant="outline"
				size="sm"
				className="h-9 mr-2"
				onClick={openEditSheet}>
				<Edit className="h-4 w-4 mr-1" />
				Edit
			</Button>
		</div>
	) : null;

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
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
		<>
			{/* Use the new EmployeeNav component with tab change callback */}
			<EmployeeNav onTabChange={(tabId) => setActiveTab(tabId as any)} />

			{/* Add a single EmployeeDialog component outside of the rest of the UI */}
			{employee && (
				<EmployeeDialog
					employee={employee}
					open={editSheetOpen}
					onOpenChange={setEditSheetOpen}
					onSubmit={async (data) => {
						const updatedEmployee = await EmployeesAPI.update(
							employee.id,
							data
						);
						if (updatedEmployee) {
							setEmployee(updatedEmployee);
						}
					}}
				/>
			)}

			{/* Notification Banners - moved to top outside content container */}
			{(employee.status !== "invited" ||
				getProfileCompletionStatus(employee).missingCount > 0) && (
				<div className="w-full bg-background py-4 px-6">
					{/* Show profile completion alert for ALL users, even invited ones */}
					<ProfileCompletionAlert
						employee={employee}
						onEdit={openEditSheet}
					/>

					{employee.status === "invited" && (
						<Alert
							variant="destructive"
							className="bg-red-50 border-red-200 mt-4">
							<MailWarning className="h-4 w-4" />
							<AlertTitle>Pending Account Setup</AlertTitle>
							<AlertDescription>
								This employee has been invited but hasn't completed their
								account setup yet. They won't be able to view or manage their
								shifts until they sign up.
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}

			<ContentContainer>
				<div className="w-full">
					{/* Main Content Area */}
					<div className="w-full">
						{/* Tab Content */}
						{activeTab === "overview" && !shiftsLoading && (
							<>
								<ContentSection title="Employee Overview">
									<div className="mb-6">
										<EmployeeCard
											employee={{
												...employee,
												phone: employee.phone
													? formatPhoneNumber(employee.phone)
													: undefined,
											}}
											variant="profile"
											hideStatus={false}
											className="shadow-sm mb-6"
										/>
									</div>

									<EmployeeStats
										employee={employee}
										shifts={shifts}
									/>
								</ContentSection>

								<ContentSection
									title="Notes"
									className="mt-6">
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
							<ContentSection
								title="Assigned Locations"
								headerActions={
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
												variant="outline"
												size="sm">
												<Plus className="h-4 w-4 mr-2" />
												Assign Location
											</Button>
										}
									/>
								}>
								{locationsLoading ? (
									<LoadingState
										type="spinner"
										message="Loading locations..."
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
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
										{assignedLocationIds.map((locationId, index) => {
											const location = locations[locationId];
											if (!location) return null;

											return (
												<LocationCard
													key={locationId}
													location={location}
													interactive={true}
													variant="standard">
													<div>
														<Button
															variant="outline"
															size="sm"
															className="w-full mt-2 mb-2"
															onClick={() =>
																navigate(`/locations/${location.id}`)
															}>
															View Location
														</Button>

														<div className="flex gap-2 w-full">
															<Button
																variant="destructive"
																size="sm"
																className="w-full"
																onClick={() => removeLocation(locationId)}>
																<X className="h-4 w-4 mr-2" />
																Remove
															</Button>
														</div>
													</div>
												</LocationCard>
											);
										})}
									</div>
								)}
							</ContentSection>
						)}

						{activeTab === "earnings" && (
							<ContentSection title="Earnings">
								<EnhancedEmployeeEarningsSection employeeId={employee.id} />
							</ContentSection>
						)}
					</div>
				</div>
			</ContentContainer>
		</>
	);
}
