import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	format,
	addMonths,
	subMonths,
	isSameDay,
	isSameMonth,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	startOfWeek,
	endOfWeek,
	parseISO,
	addDays,
	isFuture,
	isPast,
	isToday,
} from "date-fns";
import {
	Shift,
	Location,
	Employee,
	LocationsAPI,
	EmployeesAPI,
	ShiftsAPI,
	ScheduleCreateInput,
	ShiftAssignmentsAPI,
	ShiftAssignment,
} from "@/api";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Plus,
	List,
	Calendar,
	LayoutGrid,
	Filter,
	MapPin,
	User,
	Clock,
	Search,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHeader } from "@/lib/header-context";
import { Input } from "@/components/ui/input";
import { ShiftCard } from "@/components/ShiftCard";
import { toast } from "sonner";
import { ContentContainer } from "@/components/ui/content-container";
import { LoadingState } from "@/components/ui/loading-state";

export default function SchedulePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1";
	const scheduleIdParam = searchParams.get("scheduleId");
	const [scheduleId, setScheduleId] = useState<string | null>(scheduleIdParam);
	const { updateHeader } = useHeader();

	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isScheduleLoading, setIsScheduleLoading] = useState(!scheduleIdParam);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Function to fetch a valid schedule
	const fetchSchedule = async () => {
		if (!organizationId) return;

		try {
			setIsScheduleLoading(true);
			// Only find existing schedules
			const schedules = await ShiftsAPI.getAllSchedules(organizationId);

			if (schedules && schedules.length > 0) {
				// Use the first schedule found
				const validScheduleId = schedules[0].id;
				setScheduleId(validScheduleId);

				// Update URL to include the valid schedule ID
				setSearchParams((prev) => {
					const newParams = new URLSearchParams(prev);
					newParams.set("scheduleId", validScheduleId);
					return newParams;
				});

				console.log("Using existing schedule:", validScheduleId);
			} else {
				// No schedules found - just set null state
				setScheduleId(null);
				console.log("No schedules found");
			}
		} catch (error) {
			console.error("Error fetching schedules:", error);
			setScheduleId(null);
		} finally {
			setIsScheduleLoading(false);
		}
	};

	// Call the function when component mounts if no valid schedule ID
	useEffect(() => {
		if (!scheduleIdParam || scheduleIdParam === "sch-4") {
			fetchSchedule();
		}
	}, [organizationId, scheduleIdParam]);

	// Function to refresh shifts data
	const refreshShifts = () => {
		console.log("Refreshing shifts data...");
		setRefreshTrigger((prev) => prev + 1);
	};

	// Define header actions with the Create Shift button as the main CTA
	const getHeaderActions = () => {
		if (isScheduleLoading || !scheduleId) {
			return (
				<Button
					disabled
					className="h-9">
					<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					Loading...
				</Button>
			);
		}

		return (
			<ShiftCreationSheet
				scheduleId={scheduleId}
				organizationId={organizationId}
				initialDate={new Date()}
				onComplete={refreshShifts}
				trigger={
					<Button className="bg-primary hover:bg-primary/90 text-white h-9">
						<Plus className="h-5 w-5 mr-2" />
						Create Shift
					</Button>
				}
			/>
		);
	};

	useEffect(() => {
		updateHeader({
			title: "Schedule",
			description: "Manage and view your team's schedule",
			actions: getHeaderActions(),
		});
	}, [updateHeader, scheduleId, organizationId, isScheduleLoading]);

	// Fetch shifts, locations, and employees
	useEffect(() => {
		const fetchData = async () => {
			// Don't fetch if no valid schedule ID or if it's a known bad ID
			if (
				!scheduleId ||
				scheduleId === "sch-4" ||
				scheduleId === "temp-schedule-id"
			) {
				console.log("Skipping data fetch - no valid schedule ID");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);

				// Fetch locations and employees
				const [fetchedLocations, fetchedEmployees] = await Promise.all([
					LocationsAPI.getAll(organizationId),
					EmployeesAPI.getAll(organizationId),
				]);

				setLocations(fetchedLocations);
				setEmployees(fetchedEmployees);

				// Fetch shifts for the schedule
				const shiftsData = await ShiftsAPI.getShiftsForSchedule(scheduleId);
				setShifts(shiftsData);

				// Fetch all shift assignments
				const assignments = await ShiftAssignmentsAPI.getAll();
				setShiftAssignments(assignments);

				console.log(
					"Shifts data refreshed:",
					shiftsData.length,
					"shifts loaded",
					"Assignments:",
					assignments.length
				);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [organizationId, scheduleId, refreshTrigger]);

	// Helper functions
	const formatTime = (dateString: string) => {
		return format(new Date(dateString), "h:mm a");
	};

	const getLocationName = (locationId: string | undefined) => {
		if (!locationId) return "Unassigned";
		const location = locations.find((loc) => loc.id === locationId);
		return location ? location.name : "Unknown Location";
	};

	const getEmployeeName = (employeeId: string | undefined) => {
		if (!employeeId) return "Unassigned";
		const employee = employees.find((emp) => emp.id === employeeId);
		return employee ? employee.name : "Unknown Employee";
	};

	// Get all employees assigned to a shift
	const getShiftEmployees = (shift: Shift) => {
		// Get assignments from the shift_assignments table
		const assignments = shiftAssignments.filter(
			(assignment) => assignment.shift_id === shift.id
		);

		if (assignments.length > 0) {
			return assignments
				.map((assignment) => {
					const employee = employees.find(
						(emp) => emp.id === assignment.employee_id
					);
					return employee || null;
				})
				.filter(Boolean) as Employee[];
		}

		// Fallback to user_id if no assignments found
		if (shift.user_id) {
			const employee = employees.find((emp) => emp.id === shift.user_id);
			return employee ? [employee] : [];
		}

		// Try to parse employees from description as a last resort
		if (shift.description) {
			// Look for "Assigned to: " pattern in the description
			const assignedToMatch = shift.description.match(
				/Assigned to: (.*?)(?:$|,|\))/
			);
			if (assignedToMatch && assignedToMatch[1]) {
				const names = assignedToMatch[1].split(",").map((name) => name.trim());
				return names.map((name) => {
					const employee = employees.find((emp) => emp.name === name);
					return (
						employee ||
						({
							id: `parsed-${name}`,
							name: name,
							organizationId: organizationId,
							role: "Employee",
							email: "",
							status: "active",
							isOnline: false,
							lastActive: new Date().toISOString(),
						} as Employee)
					);
				});
			}

			// Look for description with employee names in parentheses
			const parenthesesMatch = shift.description.match(/\((.*?)\)/);
			if (parenthesesMatch && parenthesesMatch[1]) {
				const names = parenthesesMatch[1].split(",").map((name) => name.trim());
				return names.map((name) => {
					const employee = employees.find((emp) => emp.name === name);
					return (
						employee ||
						({
							id: `parsed-${name}`,
							name: name,
							organizationId: organizationId,
							role: "Employee",
							email: "",
							status: "active",
							isOnline: false,
							lastActive: new Date().toISOString(),
						} as Employee)
					);
				});
			}
		}

		return [];
	};

	// Filter shifts based on search query
	const filteredShifts = shifts.filter((shift) => {
		if (!searchQuery) return true;

		const locationName = getLocationName(shift.location_id);
		const assignedEmployees = getShiftEmployees(shift);
		const employeeNames = assignedEmployees.map((emp) => emp.name).join(", ");
		const shiftTime = `${formatTime(shift.start_time)} - ${formatTime(
			shift.end_time
		)}`;
		const searchLower = searchQuery.toLowerCase();

		return (
			locationName.toLowerCase().includes(searchLower) ||
			employeeNames.toLowerCase().includes(searchLower) ||
			shiftTime.toLowerCase().includes(searchLower)
		);
	});

	// Group shifts by today and upcoming
	const todayShifts = filteredShifts.filter((shift) =>
		isToday(new Date(shift.start_time))
	);

	const upcomingShifts = filteredShifts
		.filter(
			(shift) =>
				isFuture(new Date(shift.start_time)) &&
				!isToday(new Date(shift.start_time))
		)
		.slice(0, 10); // Limit to 10 upcoming shifts

	// Handle opening shift details in a new page
	const openShiftDetails = (shiftId: string) => {
		navigate(`/shifts/${shiftId}`);
	};

	return (
		<ContentContainer>
			{/* Search Section */}
			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search shifts by employee, location, or time..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<LoadingState
					message="Loading shifts..."
					type="spinner"
					className="py-12"
				/>
			) : (
				<>
					{/* Today's Shifts Section */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<Badge
								variant="outline"
								className="mr-2">
								{todayShifts.length}
							</Badge>
							Today's Shifts
						</h2>

						{todayShifts.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{todayShifts.map((shift) => {
									const assignedEmployees = getShiftEmployees(shift);
									const locationName = getLocationName(shift.location_id);

									return (
										<ShiftCard
											key={shift.id}
											shift={shift}
											assignedEmployees={assignedEmployees}
											locationName={locationName}
										/>
									);
								})}
							</div>
						) : (
							<Card className="bg-muted/30">
								<CardContent className="p-8 flex flex-col items-center justify-center text-center">
									<Calendar className="h-10 w-10 text-muted-foreground mb-3" />
									<h3 className="font-medium">No shifts scheduled today</h3>
									<p className="text-sm text-muted-foreground mt-1">
										Use the Create Shift button to add new shifts
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Upcoming Shifts Section */}
					<div>
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<Badge
								variant="outline"
								className="mr-2">
								{upcomingShifts.length}
							</Badge>
							Upcoming Shifts
						</h2>

						{upcomingShifts.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{upcomingShifts.map((shift) => {
									const assignedEmployees = getShiftEmployees(shift);
									const locationName = getLocationName(shift.location_id);

									return (
										<ShiftCard
											key={shift.id}
											shift={shift}
											assignedEmployees={assignedEmployees}
											locationName={locationName}
										/>
									);
								})}
							</div>
						) : (
							<Card className="bg-muted/30">
								<CardContent className="p-8 flex flex-col items-center justify-center text-center">
									<Calendar className="h-10 w-10 text-muted-foreground mb-3" />
									<h3 className="font-medium">No upcoming shifts scheduled</h3>
									<p className="text-sm text-muted-foreground mt-1">
										Plan ahead by scheduling future shifts
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</>
			)}
		</ContentContainer>
	);
}
