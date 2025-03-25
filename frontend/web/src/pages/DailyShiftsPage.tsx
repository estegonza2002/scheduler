import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { DailyShiftsView } from "../components/DailyShiftsView";
import { useSearchParams } from "react-router-dom";
import {
	Shift,
	ShiftsAPI,
	LocationsAPI,
	EmployeesAPI,
	Location,
	Employee,
	Schedule,
	SchedulesAPI,
} from "../api";
import { format, parseISO, addDays, subDays } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Plus,
	Grid,
	Loader2,
	RotateCcw,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import { useNavigate } from "react-router-dom";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";

import { ContentContainer } from "../components/ui/content-container";
import { LoadingState } from "../components/ui/loading-state";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { ContentSection } from "../components/ui/content-section";

export default function DailyShiftsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("shifts");
	const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	// Get date from URL param or use today's date
	useEffect(() => {
		const dateParam = searchParams.get("date");
		if (dateParam) {
			setCurrentDate(new Date(dateParam));
		}
	}, [searchParams]);

	const updateDate = (newDate: Date) => {
		setCurrentDate(newDate);
		setSearchParams({
			...Object.fromEntries(searchParams.entries()),
			date: newDate.toISOString().split("T")[0],
		});
	};

	// Fetch schedules and shifts
	const fetchShifts = async () => {
		try {
			setLoading(true);
			setLoadingPhase("shifts");

			// Get schedules
			const fetchedSchedules = await SchedulesAPI.getAll(organizationId);
			setSchedules(fetchedSchedules);

			const defaultSchedule = "sch-4"; // Updated to Spring 2025 schedule
			if (!selectedSchedule) {
				setSelectedSchedule(defaultSchedule);
			}

			// Format date for API
			const formattedDate = currentDate.toISOString().split("T")[0];
			console.log("Fetching shifts for date:", formattedDate);

			// Get shifts for this date
			const allShifts = await ShiftsAPI.getAll(formattedDate);

			console.log("API returned shifts:", allShifts);

			// No need to filter shifts here as the API should do that
			setShifts(allShifts);

			// Get all unique location IDs from the shifts
			setLoadingPhase("locations");
			const locationIds = [
				...new Set(allShifts.map((shift) => shift.locationId).filter(Boolean)),
			];

			// Get all unique employee IDs from the shifts
			setLoadingPhase("employees");
			const employeeIds = [
				...new Set(allShifts.map((shift) => shift.employeeId).filter(Boolean)),
			];

			// Batch fetch locations and employees in parallel
			try {
				const [fetchedLocations, fetchedEmployees] = await Promise.all([
					// Fetch all locations for the organization instead of individual lookups
					LocationsAPI.getAll(organizationId),

					// Fetch all employees for the organization instead of individual lookups
					EmployeesAPI.getAll(organizationId),
				]);

				setLocations(fetchedLocations);
				setEmployees(fetchedEmployees);
			} catch (error) {
				console.error("Error fetching related data:", error);
			}
		} catch (error) {
			console.error("Error fetching shifts:", error);
		} finally {
			setLoading(false);
			setLoadingPhase("");
		}
	};

	// Initialize data on component mount and when date changes
	useEffect(() => {
		fetchShifts();
	}, [currentDate, organizationId, selectedSchedule]);

	return (
		<>
			<div className="flex flex-col h-[calc(100vh-80px)]">
				{/* Sidebar with calendar */}
				<div className="flex border-b">
					<div className="w-80 h-[calc(100vh-80px)] border-r p-4 bg-card">
						<Label htmlFor="schedule-select">Select Schedule</Label>
						<Select
							value={selectedSchedule || ""}
							onValueChange={(value) => setSelectedSchedule(value)}
							disabled={loading}>
							<SelectTrigger
								id="schedule-select"
								className="mt-1 mb-4">
								<SelectValue placeholder="Select a schedule" />
							</SelectTrigger>
							<SelectContent>
								{schedules.map((schedule) => (
									<SelectItem
										key={schedule.id}
										value={schedule.id}>
										{schedule.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex justify-between items-center mb-2">
							<div className="text-sm font-medium">Calendar</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-8"
								onClick={() => updateDate(new Date())}>
								Today
							</Button>
						</div>
						<Calendar
							mode="single"
							selected={currentDate}
							onSelect={(date) => date && updateDate(date)}
							className="w-full"
							showOutsideDays
						/>
					</div>

					{/* Main Content */}
					<div className="flex-1 overflow-auto">
						<ContentSection
							title={format(currentDate, "EEEE, MMMM d, yyyy")}
							description={`Shifts for ${format(currentDate, "MMM d")}`}
							headerActions={
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() => updateDate(subDays(currentDate, 1))}>
										<ChevronLeft className="h-4 w-4" />
									</Button>

									<Button
										variant="outline"
										size="icon"
										onClick={() => updateDate(addDays(currentDate, 1))}>
										<ChevronRight className="h-4 w-4" />
									</Button>

									<Button
										variant="outline"
										size="sm"
										className="text-sm flex items-center"
										onClick={() => navigate("/schedule")}>
										<Grid className="h-4 w-4 mr-2" /> View Calendar
									</Button>
								</div>
							}>
							{loading && (
								<div className="px-8 py-2 border-b bg-muted/10">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-3 w-3 animate-spin" />
										<span>
											{loadingPhase === "shifts"
												? "Loading shifts..."
												: loadingPhase === "locations"
												? "Loading locations..."
												: "Loading employees..."}
										</span>
									</div>
								</div>
							)}

							{!loading && shifts.length === 0 && (
								<div className="flex flex-col items-center justify-center py-12">
									<div className="text-muted-foreground mb-2">
										No shifts scheduled for this day
									</div>
									<ShiftCreationSheet
										scheduleId={selectedSchedule || ""}
										organizationId={organizationId}
										initialDate={currentDate}
										trigger={
											<Button
												size="sm"
												className="mt-2">
												<Plus className="h-4 w-4 mr-2" />
												Create Shift
											</Button>
										}
									/>
								</div>
							)}

							{!loading && shifts.length > 0 && (
								<>
									<div className="flex justify-end p-4">
										<ShiftCreationSheet
											scheduleId={selectedSchedule || ""}
											organizationId={organizationId}
											initialDate={currentDate}
											trigger={
												<Button>
													<Plus className="h-4 w-4 mr-2" />
													Create Shift
												</Button>
											}
										/>
									</div>
									<DailyShiftsView
										date={currentDate}
										shifts={shifts}
										locations={locations}
										employees={employees}
									/>
								</>
							)}
						</ContentSection>
					</div>
				</div>
			</div>
		</>
	);
}
