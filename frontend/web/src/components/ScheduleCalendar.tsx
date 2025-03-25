import { useState, useEffect } from "react";
import { Button } from "./ui/button";
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
	SchedulesAPI,
	ShiftsAPI,
	Shift,
	EmployeesAPI,
	Employee,
	LocationsAPI,
	Location,
} from "../api";
import { useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Badge, BadgeProps } from "./ui/badge";
import {
	CalendarDayCard,
	CalendarDayItem,
	CalendarDayMoreIndicator,
} from "./ui/calendar-day-card";
import {
	MapPin,
	User,
	FilterX,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
	Calendar,
} from "lucide-react";
import { LoadingState } from "./ui/loading-state";
import { EmptyState } from "./ui/empty-state";
import { AlertCard } from "./ui/alert-card";
import { FilterGroup } from "./ui/filter-group";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
		isSameDay(parseISO(shift.startTime), date)
	);

	// Get location-based color scheme
	const getLocationColorScheme = (locationId?: string) => {
		if (!locationId) return undefined;

		// Map locationId to color schemes
		const locationColors: Record<string, BadgeProps["colorScheme"]> = {
			"loc-1": "blue",
			"loc-2": "purple",
			"loc-3": "green",
			"loc-4": "amber",
			"loc-5": "red",
			"loc-6": "indigo",
			"loc-7": "pink",
			"loc-8": "teal",
		};

		// Use hash of locationId to select a color for unknown locations
		const hash = locationId
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const colorKeys = Object.keys(locationColors);
		const defaultKey = colorKeys[hash % colorKeys.length];

		return locationColors[locationId] || locationColors[defaultKey];
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
					title={`${formatLocationName(shift.locationId)}: ${formatShiftTime(
						shift.startTime
					)} - ${formatShiftTime(shift.endTime)}`}>
					<Badge
						variant="outline"
						colorScheme={getLocationColorScheme(shift.locationId)}
						className="w-full truncate justify-start font-normal">
						<MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
						<span className="truncate">
							{formatShiftTime(shift.startTime)}{" "}
							{shift.locationId && `· ${formatLocationName(shift.locationId)}`}
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
}

export function ScheduleCalendar({
	currentMonth: externalMonth,
	onDateSelect,
}: ScheduleCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(
		externalMonth || new Date()
	);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [allShifts, setAllShifts] = useState<Shift[]>([]); // Store all shifts before filtering
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

		// Get shifts for the selected date
		const shiftsForDate = shifts.filter((shift) =>
			isSameDay(parseISO(shift.startTime), date)
		);

		// Notify parent component if callback provided
		if (onDateSelect) {
			onDateSelect(date, shiftsForDate);
		}
	};

	const [searchParams] = useSearchParams();
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org

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

	// Apply filters when they change
	useEffect(() => {
		if (!allShifts.length) return;

		let filteredShifts = [...allShifts];

		// Apply location filter
		if (selectedLocationId) {
			filteredShifts = filteredShifts.filter(
				(shift) => shift.locationId === selectedLocationId
			);
		}

		// Apply employee filter
		if (selectedEmployeeId) {
			filteredShifts = filteredShifts.filter(
				(shift) => shift.employeeId === selectedEmployeeId
			);
		}

		setShifts(filteredShifts);
	}, [selectedLocationId, selectedEmployeeId, allShifts]);

	// Main data fetching effect
	useEffect(() => {
		async function fetchShifts() {
			try {
				setLoading(true);
				// Get the first schedule for the organization
				const schedules = await SchedulesAPI.getAll(organizationId);

				if (schedules.length === 0) {
					setShifts([]);
					setAllShifts([]);
					setLoading(false);
					return;
				}

				// Use the first schedule
				const firstSchedule = schedules[0];
				// Use the API to get real shifts, but also add some mock shifts for demonstration
				const realShifts = await ShiftsAPI.getAll(firstSchedule.id);

				// Create some mock shifts for demonstration (showing how it looks with more data)
				const today = new Date();
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);

				const nextWeek = new Date(today);
				nextWeek.setDate(nextWeek.getDate() + 7);

				const mockShifts: Shift[] = [
					// Add shifts for today
					{
						id: "mock-1",
						scheduleId: firstSchedule.id,
						employeeId: "emp-1",
						locationId: "loc-1",
						startTime: new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							9,
							0
						).toISOString(),
						endTime: new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							17,
							0
						).toISOString(),
						notes:
							"Morning shift supervisor. Will cover register during lunch breaks.",
					},
					{
						id: "mock-2",
						scheduleId: firstSchedule.id,
						employeeId: "emp-2",
						locationId: "loc-2",
						startTime: new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							10,
							0
						).toISOString(),
						endTime: new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							18,
							0
						).toISOString(),
						notes: "Inventory check scheduled for 2pm",
					},

					// Add shifts for tomorrow
					{
						id: "mock-3",
						scheduleId: firstSchedule.id,
						employeeId: "emp-3",
						locationId: "loc-3",
						startTime: new Date(
							tomorrow.getFullYear(),
							tomorrow.getMonth(),
							tomorrow.getDate(),
							8,
							0
						).toISOString(),
						endTime: new Date(
							tomorrow.getFullYear(),
							tomorrow.getMonth(),
							tomorrow.getDate(),
							16,
							0
						).toISOString(),
						notes: "New employee - needs training",
					},

					// Add several shifts for a day next week to show multiple shifts
					{
						id: "mock-4",
						scheduleId: firstSchedule.id,
						employeeId: "emp-1",
						locationId: "loc-1",
						startTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							7,
							0
						).toISOString(),
						endTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							15,
							0
						).toISOString(),
						notes: "Early shift for holiday rush",
					},
					{
						id: "mock-5",
						scheduleId: firstSchedule.id,
						employeeId: "emp-2",
						locationId: "loc-2",
						startTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							8,
							0
						).toISOString(),
						endTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							16,
							0
						).toISOString(),
					},
					{
						id: "mock-6",
						scheduleId: firstSchedule.id,
						employeeId: "emp-3",
						locationId: "loc-3",
						startTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							12,
							0
						).toISOString(),
						endTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							20,
							0
						).toISOString(),
						notes: "Will be handling evening cash reconciliation",
					},
					{
						id: "mock-7",
						scheduleId: firstSchedule.id,
						employeeId: "emp-4",
						locationId: "loc-1",
						startTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							16,
							0
						).toISOString(),
						endTime: new Date(
							nextWeek.getFullYear(),
							nextWeek.getMonth(),
							nextWeek.getDate(),
							23,
							0
						).toISOString(),
						notes: "Preparing special dinner menu",
					},
				];

				// Combine real and mock shifts
				const combinedShifts = [...realShifts, ...mockShifts];
				setAllShifts(combinedShifts);
				setShifts(combinedShifts); // Initial state before filters
				setError(null);
			} catch (err) {
				console.error("Error fetching shifts:", err);
				setError("Failed to load shifts");
				toast.error("Failed to load shifts");
			} finally {
				setLoading(false);
			}
		}

		fetchShifts();
	}, [organizationId]);

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
