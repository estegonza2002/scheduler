import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	format,
	isSameDay,
	parseISO,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	startOfWeek,
	endOfWeek,
} from "date-fns";
import { toast } from "sonner";
import {
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "@/api";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
	CalendarDayCard,
	CalendarDayItem,
	CalendarDayMoreIndicator,
} from "@/components/ui/calendar-day-card";
import {
	MapPin,
	User,
	FilterX,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
	Calendar,
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCard } from "@/components/ui/alert-card";
import { FilterGroup } from "@/components/ui/filter-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Format time from ISO string
const formatShiftTime = (isoString: string) => {
	return format(parseISO(isoString), "h:mm a");
};

type CalendarDayProps = {
	date: Date;
	isCurrentMonth: boolean;
	shifts: Shift[];
	onSelectDate: (date: Date) => void;
	isSelected: boolean;
};

const CalendarDay = ({
	date,
	isCurrentMonth,
	shifts,
	onSelectDate,
	isSelected,
}: CalendarDayProps) => {
	const isToday = isSameDay(date, new Date());
	const shiftsOnDay = shifts.filter((shift) =>
		isSameDay(parseISO(shift.start_time), date)
	);

	// Find the color map with mock location IDs:
	const locationColorMap: Record<string, string> = {
		"loc-1": "blue",
		"loc-2": "purple",
		"loc-3": "green",
		"loc-4": "amber",
		"loc-5": "red",
		"loc-6": "indigo",
		"loc-7": "pink",
		"loc-8": "teal",
	};

	// Replace with this color map that uses indexing instead of hardcoded IDs:
	const colorOptions: BadgeProps["colorScheme"][] = [
		"blue",
		"purple",
		"green",
		"amber",
		"red",
		"indigo",
		"pink",
		"teal",
	];

	// Get color by location ID (now will use a hash function to map IDs to colors)
	const getLocationColor = (locationId: string): BadgeProps["colorScheme"] => {
		// If we don't have a location ID, return a default color
		if (!locationId) return "blue";

		// Use a simple hash function to map the location ID to a color
		const hashCode = locationId.split("").reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);

		// Use the absolute value of hashCode modulo the length of colorOptions
		const colorIndex = Math.abs(hashCode) % colorOptions.length;
		return colorOptions[colorIndex];
	};

	// Format location name for display
	const formatLocationName = (locationId?: string) => {
		if (!locationId) return "Unassigned";
		return `Location ${locationId.substring(4)}`;
	};

	return (
		<CalendarDayCard
			isCurrentMonth={isCurrentMonth}
			isSelected={isSelected}
			isToday={isToday}
			dayNumber={date.getDate()}
			badgeCount={shiftsOnDay.length > 0 ? shiftsOnDay.length : undefined}
			onClick={() => onSelectDate(date)}>
			{/* Shifts */}
			{shiftsOnDay.slice(0, 3).map((shift) => (
				<CalendarDayItem
					key={shift.id}
					title={`${formatLocationName(shift.location_id)}: ${formatShiftTime(
						shift.start_time
					)} - ${formatShiftTime(shift.end_time)}`}>
					<Badge
						variant="outline"
						colorScheme={getLocationColor(shift.location_id || "")}
						className="w-full truncate justify-start font-normal">
						<MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
						<span className="truncate">
							{formatShiftTime(shift.start_time)}{" "}
							{shift.location_id &&
								`· ${formatLocationName(shift.location_id)}`}
						</span>
					</Badge>
				</CalendarDayItem>
			))}
			{shiftsOnDay.length > 3 && (
				<CalendarDayMoreIndicator count={shiftsOnDay.length - 3} />
			)}
		</CalendarDayCard>
	);
};

interface ScheduleCalendarProps {
	currentMonth?: Date;
	onDateSelect?: (date: Date, shifts: Shift[]) => void;
	organizationId: string;
}

export function ScheduleCalendar({
	currentMonth: externalMonth,
	onDateSelect,
	organizationId,
}: ScheduleCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(
		externalMonth || new Date()
	);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [viewRange, setViewRange] = useState({
		start: startOfWeek(new Date()),
		end: endOfWeek(new Date()),
	});
	const [allShifts, setAllShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filter states
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedLocationId, setSelectedLocationId] = useState<string>("");
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

	// Update internal state when prop changes
	useEffect(() => {
		if (externalMonth) {
			setCurrentMonth(externalMonth);
		}
	}, [externalMonth]);

	// Handle date selection
	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);

		// Get shifts for the selected date using correct property names
		const shiftsForDate = shifts.filter((shift) =>
			isSameDay(parseISO(shift.start_time), date)
		);

		if (onDateSelect) {
			onDateSelect(date, shiftsForDate);
		}
	};

	// Get dates for the current month view
	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(currentMonth);
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);

	const days = eachDayOfInterval({ start: startDate, end: endDate });

	// Day names for the header
	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Fetch locations and employees
	useEffect(() => {
		async function fetchLocationsAndEmployees() {
			try {
				const fetchedLocations = await LocationsAPI.getAll(organizationId);
				setLocations(fetchedLocations);

				const fetchedEmployees = await EmployeesAPI.getAll(organizationId);
				setEmployees(fetchedEmployees);
			} catch (err) {
				console.error("Error fetching locations/employees:", err);
			}
		}

		fetchLocationsAndEmployees();
	}, [organizationId]);

	// Fetch real shifts from the API
	useEffect(() => {
		const fetchShifts = async () => {
			try {
				const schedules = await ShiftsAPI.getAllSchedules(organizationId);
				const shiftsPromises = schedules.map((schedule) =>
					ShiftsAPI.getShiftsForSchedule(schedule.id)
				);
				const shiftsArrays = await Promise.all(shiftsPromises);
				const allShifts = shiftsArrays.flat();
				setShifts(allShifts);
			} catch (error) {
				console.error("Error fetching shifts:", error);
			}
		};

		fetchShifts();
	}, [organizationId]);

	// Filter shifts for the current view
	const visibleShifts = shifts.filter((shift) => {
		const shiftStart = new Date(shift.start_time);
		return shiftStart >= viewRange.start && shiftStart <= viewRange.end;
	});

	// Group shifts by date and location
	const groupedShifts = visibleShifts.reduce((acc, shift) => {
		const date = format(new Date(shift.start_time), "yyyy-MM-dd");
		const locationId = shift.location_id || "unassigned";

		if (!acc[date]) {
			acc[date] = {};
		}
		if (!acc[date][locationId]) {
			acc[date][locationId] = [];
		}
		acc[date][locationId].push(shift);
		return acc;
	}, {} as Record<string, Record<string, Shift[]>>);

	// Apply filters when they change
	useEffect(() => {
		let filteredShifts = [...allShifts];

		if (selectedLocationId) {
			filteredShifts = filteredShifts.filter(
				(shift) => shift.location_id === selectedLocationId
			);
		}

		if (selectedEmployeeId) {
			filteredShifts = filteredShifts.filter(
				(shift) => shift.user_id === selectedEmployeeId
			);
		}

		setShifts(filteredShifts);
	}, [allShifts, selectedLocationId, selectedEmployeeId]);

	// Reset filters
	const handleResetFilters = () => {
		setSelectedLocationId("");
		setSelectedEmployeeId("");
	};

	if (loading) {
		return (
			<LoadingState
				message="Loading schedule..."
				type="spinner"
			/>
		);
	}

	if (error) {
		return (
			<AlertCard
				variant="error"
				title="Failed to load schedule"
				description={error}
				action={
					<Button
						variant="outline"
						onClick={() => window.location.reload()}>
						Retry
					</Button>
				}
			/>
		);
	}

	const hasShifts = allShifts.length > 0;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg font-medium">
						{format(currentMonth, "MMMM yyyy")}
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const prev = new Date(currentMonth);
								prev.setMonth(prev.getMonth() - 1);
								setCurrentMonth(prev);
							}}>
							<ChevronLeft className="h-4 w-4 mr-1" /> Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const next = new Date(currentMonth);
								next.setMonth(next.getMonth() + 1);
								setCurrentMonth(next);
							}}>
							Next <ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filter Controls */}
				<FilterGroup className="mb-6">
					<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							<Select
								value={selectedLocationId}
								onValueChange={setSelectedLocationId}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by location" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Locations</SelectLabel>
										{locations.map((location) => (
											<SelectItem
												key={location.id}
												value={location.id}>
												{location.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<Select
								value={selectedEmployeeId}
								onValueChange={setSelectedEmployeeId}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by employee" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Employees</SelectLabel>
										{employees.map((employee) => (
											<SelectItem
												key={employee.id}
												value={employee.id}>
												{employee.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						{(selectedLocationId || selectedEmployeeId) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleResetFilters}
								className="flex items-center gap-1">
								<FilterX className="h-4 w-4" />
								<span>Reset</span>
							</Button>
						)}
					</div>
				</FilterGroup>

				{!hasShifts ? (
					<EmptyState
						title="No shifts scheduled"
						description="There are no shifts scheduled for this period"
						icon={<Calendar className="h-6 w-6" />}
						action={
							<Button onClick={() => window.location.reload()}>Refresh</Button>
						}
					/>
				) : (
					<>
						{/* Calendar header */}
						<div className="grid grid-cols-7 border-b bg-muted/30">
							{dayNames.map((day) => (
								<div
									key={day}
									className="py-2 text-center text-sm font-medium">
									{day}
								</div>
							))}
						</div>

						{/* Calendar grid */}
						<div className="grid grid-cols-7">
							{days.map((day) => (
								<CalendarDay
									key={day.toISOString()}
									date={day}
									isCurrentMonth={day.getMonth() === currentMonth.getMonth()}
									shifts={shifts}
									onSelectDate={handleDateSelect}
									isSelected={isSameDay(day, selectedDate)}
								/>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
