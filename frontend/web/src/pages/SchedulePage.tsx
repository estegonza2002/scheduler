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

export default function SchedulePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1";
	const scheduleId = searchParams.get("scheduleId") || "sch-4";
	const { updateHeader } = useHeader();

	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Define header actions with the Create Shift button as the main CTA
	const getHeaderActions = () => {
		return (
			<ShiftCreationSheet
				scheduleId={scheduleId}
				organizationId={organizationId}
				initialDate={new Date()}
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
	}, [updateHeader, scheduleId, organizationId]);

	// Fetch shifts, locations, and employees
	useEffect(() => {
		const fetchData = async () => {
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
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [organizationId, scheduleId]);

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

	// Filter shifts based on search query
	const filteredShifts = shifts.filter((shift) => {
		if (!searchQuery) return true;

		const locationName = getLocationName(shift.location_id);
		const employeeName = getEmployeeName(shift.user_id);
		const shiftTime = `${formatTime(shift.start_time)} - ${formatTime(
			shift.end_time
		)}`;
		const searchLower = searchQuery.toLowerCase();

		return (
			locationName.toLowerCase().includes(searchLower) ||
			employeeName.toLowerCase().includes(searchLower) ||
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
		window.open(`/shifts/${shiftId}`, "_blank");
	};

	// Render a shift card
	const ShiftCard = ({ shift }: { shift: Shift }) => (
		<Card
			key={shift.id}
			className="cursor-pointer hover:shadow-md transition-all border hover:border-primary"
			onClick={() => openShiftDetails(shift.id)}>
			<CardContent className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<h3 className="font-medium flex items-center">
							<Clock className="h-4 w-4 mr-2 text-primary" />
							{formatTime(shift.start_time)} - {formatTime(shift.end_time)}
						</h3>
						<p className="text-sm text-muted-foreground mt-1 flex items-center">
							<MapPin className="h-3.5 w-3.5 mr-1" />
							{getLocationName(shift.location_id)}
						</p>
					</div>
					<Badge variant={shift.user_id ? "secondary" : "destructive"}>
						{shift.user_id ? getEmployeeName(shift.user_id) : "Unassigned"}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<Card className="shadow-sm border-border/40 flex flex-col h-[calc(100vh-120px)]">
			<CardContent className="flex-grow p-6 overflow-y-auto">
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
					<div className="flex items-center justify-center h-40">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
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
									{todayShifts.map((shift) => (
										<ShiftCard
											key={shift.id}
											shift={shift}
										/>
									))}
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
									{upcomingShifts.map((shift) => (
										<ShiftCard
											key={shift.id}
											shift={shift}
										/>
									))}
								</div>
							) : (
								<Card className="bg-muted/30">
									<CardContent className="p-8 flex flex-col items-center justify-center text-center">
										<Calendar className="h-10 w-10 text-muted-foreground mb-3" />
										<h3 className="font-medium">
											No upcoming shifts scheduled
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											Plan ahead by scheduling future shifts
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
