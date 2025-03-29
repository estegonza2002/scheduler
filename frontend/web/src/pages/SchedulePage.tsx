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
} from "lucide-react";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
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

export default function SchedulePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1";
	const scheduleId = searchParams.get("scheduleId") || "sch-4";

	// Get date from URL param or use today's date
	const dateParam = searchParams.get("date");
	const initialDate = dateParam ? new Date(dateParam) : new Date();

	// Track current month and selected date
	const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
	const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(false);
	const [view, setView] = useState<"grid" | "list">("grid");
	const [selectedLocationFilter, setSelectedLocationFilter] =
		useState<string>("all");
	const [selectedEmployeeFilter, setSelectedEmployeeFilter] =
		useState<string>("all");

	// Get dates for the current month view
	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(currentMonth);
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);
	const days = eachDayOfInterval({ start: startDate, end: endDate });
	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Fetch locations, employees, and shifts
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

				// Fetch shifts for the selected schedule and month
				const monthStart = startOfMonth(currentMonth);
				const monthEnd = endOfMonth(currentMonth);

				// Get all schedules first
				const schedules = await ShiftsAPI.getAllSchedules(organizationId);
				const activeScheduleId = scheduleId || schedules[0]?.id;

				if (activeScheduleId) {
					const shiftsData = await ShiftsAPI.getShiftsForSchedule(
						activeScheduleId
					);

					// Filter shifts for current month view range
					const visibleShifts = shiftsData.filter((shift) => {
						const shiftDate = new Date(shift.start_time);
						return shiftDate >= startDate && shiftDate <= endDate;
					});

					setShifts(visibleShifts);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [organizationId, scheduleId, currentMonth]);

	// Handle date selection
	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);

		// Get shifts for the selected date
		const selectedDateShifts = shifts.filter((shift) =>
			isSameDay(new Date(shift.start_time), date)
		);

		// Navigate to daily view when a date is clicked
		const formattedDate = format(date, "yyyy-MM-dd");
		navigate(
			`/daily-shifts?date=${formattedDate}&scheduleId=${scheduleId}&organizationId=${organizationId}`
		);
	};

	const handlePreviousMonth = () => {
		setCurrentMonth(subMonths(currentMonth, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const handleToday = () => {
		setCurrentMonth(new Date());
		setSelectedDate(new Date());
	};

	const formatTime = (dateString: string) => {
		return format(new Date(dateString), "h:mm a");
	};

	const getLocationById = (locationId: string | undefined) => {
		if (!locationId) return { name: "Unassigned", color: "gray" };
		const location = locations.find((loc) => loc.id === locationId);
		return location
			? { name: location.name, color: "blue" }
			: { name: `Location ${locationId.replace("loc-", "")}`, color: "blue" };
	};

	const getEmployeeById = (employeeId: string | undefined) => {
		if (!employeeId) return "Unassigned";
		const employee = employees.find((emp) => emp.id === employeeId);
		return employee
			? employee.name
			: `Employee ${employeeId.replace("emp-", "")}`;
	};

	// Filter shifts based on selected location and employee
	const filteredShifts = shifts.filter((shift) => {
		const locationMatch =
			selectedLocationFilter === "all" ||
			shift.location_id === selectedLocationFilter;
		const employeeMatch =
			selectedEmployeeFilter === "all" ||
			shift.user_id === selectedEmployeeFilter;
		return locationMatch && employeeMatch;
	});

	// Group shifts by date for list view
	const shiftsByDate = filteredShifts.reduce((acc, shift) => {
		const dateKey = format(new Date(shift.start_time), "yyyy-MM-dd");
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(shift);
		return acc;
	}, {} as Record<string, Shift[]>);

	// Generate color class based on location
	const getLocationColorClass = (locationId: string | undefined) => {
		if (!locationId) return "bg-gray-100 text-gray-800";

		// Map location IDs to Tailwind color classes
		const colorMap: Record<string, string> = {
			"loc-1": "bg-blue-100 text-blue-800",
			"loc-2": "bg-purple-100 text-purple-800",
			"loc-3": "bg-green-100 text-green-800",
			"loc-4": "bg-amber-100 text-amber-800",
			"loc-5": "bg-red-100 text-red-800",
			"loc-6": "bg-indigo-100 text-indigo-800",
			"loc-7": "bg-pink-100 text-pink-800",
			"loc-8": "bg-teal-100 text-teal-800",
		};

		return colorMap[locationId] || "bg-blue-100 text-blue-800";
	};

	return (
		<Card className="shadow-sm border-border/40">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-end">
					<div className="flex items-center gap-2">
						<Tabs
							defaultValue="grid"
							className="w-[180px]">
							<TabsList className="grid grid-cols-2">
								<TabsTrigger
									value="grid"
									onClick={() => setView("grid")}
									className="flex items-center gap-1.5">
									<LayoutGrid className="h-4 w-4" />
									<span className="hidden sm:inline">Grid</span>
								</TabsTrigger>
								<TabsTrigger
									value="list"
									onClick={() => setView("list")}
									className="flex items-center gap-1.5">
									<List className="h-4 w-4" />
									<span className="hidden sm:inline">List</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<Separator
							orientation="vertical"
							className="h-8"
						/>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={handlePreviousMonth}>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={handleToday}
								className="whitespace-nowrap">
								Today
							</Button>

							<Button
								variant="outline"
								size="icon"
								onClick={handleNextMonth}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>

						<Separator
							orientation="vertical"
							className="h-8"
						/>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="flex items-center gap-1.5">
									<Filter className="h-4 w-4" />
									<span className="hidden sm:inline">Filters</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-56">
								<DropdownMenuLabel>Filter Shifts</DropdownMenuLabel>
								<DropdownMenuSeparator />

								<div className="p-2">
									<p className="text-sm font-medium mb-2">Location</p>
									<Select
										value={selectedLocationFilter}
										onValueChange={setSelectedLocationFilter}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="All Locations" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Locations</SelectItem>
											{locations.map((location) => (
												<SelectItem
													key={location.id}
													value={location.id}>
													{location.name ||
														`Location ${location.id.replace("loc-", "")}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="p-2 pt-0">
									<p className="text-sm font-medium mb-2">Employee</p>
									<Select
										value={selectedEmployeeFilter}
										onValueChange={setSelectedEmployeeFilter}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="All Employees" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Employees</SelectItem>
											{employees.map((employee) => (
												<SelectItem
													key={employee.id}
													value={employee.id}>
													{employee.name ||
														`Employee ${employee.id.replace("emp-", "")}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-2">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							<p className="text-sm text-muted-foreground">
								Loading schedule...
							</p>
						</div>
					</div>
				) : view === "grid" ? (
					/* Grid View */
					<div className="rounded-md overflow-hidden">
						{/* Calendar Days Header */}
						<div className="grid grid-cols-7 bg-muted">
							{dayNames.map((day, i) => (
								<div
									key={day}
									className={cn(
										"h-10 flex items-center justify-center text-sm font-medium",
										i === 0 || i === 6 ? "text-muted-foreground" : ""
									)}>
									{day}
								</div>
							))}
						</div>

						{/* Calendar Days */}
						<div className="grid grid-cols-7 border-t border-l">
							{days.map((day, i) => {
								// Get shifts for this day
								const dayShifts = filteredShifts.filter((shift) =>
									isSameDay(new Date(shift.start_time), day)
								);

								const isToday = isSameDay(day, new Date());
								const isCurrentMonth = isSameMonth(day, currentMonth);
								const isSelected = isSameDay(day, selectedDate);

								return (
									<div
										key={i}
										className={cn(
											"min-h-28 p-1.5 border-b border-r relative",
											isCurrentMonth ? "" : "bg-muted/30",
											isSelected ? "bg-muted/80" : ""
										)}
										onClick={() => handleDateSelect(day)}>
										{/* Day Number Badge */}
										<div className="flex justify-between items-start">
											<div
												className={cn(
													"flex items-center justify-center h-7 w-7 text-sm rounded-full",
													isToday
														? "bg-primary text-primary-foreground font-medium"
														: ""
												)}>
												{format(day, "d")}
											</div>

											{/* Shift count badge */}
											{dayShifts.length > 0 && (
												<Badge
													variant="secondary"
													className="text-xs flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{dayShifts.length}
												</Badge>
											)}
										</div>

										{/* Shifts */}
										<div className="mt-1 space-y-1">
											{dayShifts.slice(0, 3).map((shift) => (
												<TooltipProvider key={shift.id}>
													<Tooltip>
														<TooltipTrigger asChild>
															<div
																className={cn(
																	"text-xs rounded py-1 px-2 truncate cursor-pointer",
																	getLocationColorClass(shift.location_id)
																)}>
																{formatTime(shift.start_time)} -{" "}
																{formatTime(shift.end_time)}
															</div>
														</TooltipTrigger>
														<TooltipContent>
															<div className="space-y-1">
																<p className="font-medium">
																	{formatTime(shift.start_time)} -{" "}
																	{formatTime(shift.end_time)}
																</p>
																<p className="flex items-center gap-1">
																	<MapPin className="h-3.5 w-3.5" />
																	{getLocationById(shift.location_id).name}
																</p>
																<p className="flex items-center gap-1">
																	<User className="h-3.5 w-3.5" />
																	{getEmployeeById(shift.user_id)}
																</p>
															</div>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											))}

											{/* More indicator */}
											{dayShifts.length > 3 && (
												<div className="text-xs text-muted-foreground px-2">
													+ {dayShifts.length - 3} more
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					/* List View */
					<div className="space-y-6 pb-4">
						{Object.keys(shiftsByDate).length > 0 ? (
							Object.entries(shiftsByDate)
								.sort(
									([dateA], [dateB]) =>
										new Date(dateA).getTime() - new Date(dateB).getTime()
								)
								.map(([dateStr, shifts]) => {
									const date = new Date(dateStr);
									const isToday = isSameDay(date, new Date());

									return (
										<div
											key={dateStr}
											className="space-y-2">
											<div className="flex items-center gap-2">
												<h3
													className={cn(
														"text-sm font-medium flex items-center gap-2",
														isToday ? "text-primary" : ""
													)}>
													{format(date, "EEEE, MMMM d")}
													{isToday && <Badge variant="outline">Today</Badge>}
												</h3>
											</div>

											<div className="rounded-md border divide-y">
												{shifts.map((shift) => (
													<div
														key={shift.id}
														className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/50 cursor-pointer"
														onClick={() => navigate(`/shifts/${shift.id}`)}>
														<div className="flex items-center gap-3">
															<Badge
																className={cn(
																	getLocationColorClass(shift.location_id)
																)}>
																{formatTime(shift.start_time)} -{" "}
																{formatTime(shift.end_time)}
															</Badge>
															<span className="text-sm flex items-center gap-1.5">
																<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
																{getLocationById(shift.location_id).name}
															</span>
														</div>

														<div className="text-sm text-muted-foreground flex items-center gap-1.5">
															<User className="h-3.5 w-3.5" />
															{getEmployeeById(shift.user_id)}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})
						) : (
							<div className="text-center py-10">
								<Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
								<h3 className="mt-4 text-lg font-medium">No shifts found</h3>
								<p className="text-muted-foreground mt-1">
									{selectedLocationFilter !== "all" ||
									selectedEmployeeFilter !== "all"
										? "Try changing your filters"
										: "Create shifts to see them in the calendar"}
								</p>
							</div>
						)}
					</div>
				)}
			</CardContent>

			<CardFooter className="flex justify-between pt-2">
				<p className="text-xs text-muted-foreground">
					{filteredShifts.length}{" "}
					{filteredShifts.length === 1 ? "shift" : "shifts"} in{" "}
					{format(currentMonth, "MMMM")}
				</p>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						navigate(`/schedule?date=${format(currentMonth, "yyyy-MM-dd")}`)
					}
					className="text-xs">
					<Calendar className="h-3.5 w-3.5 mr-1.5" />
					Monthly View
				</Button>
			</CardFooter>
		</Card>
	);
}
