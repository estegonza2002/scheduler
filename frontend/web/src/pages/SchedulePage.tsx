import { useState, useEffect } from "react";
import { ScheduleCalendar } from "../components/ScheduleCalendar";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Shift, Location, Employee, LocationsAPI, EmployeesAPI } from "../api";
import {
	Calendar as CalendarIcon,
	ArrowRight,
	Plus,
	ListTodo,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import { DailyShiftsView } from "../components/DailyShiftsView";

export default function SchedulePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org
	const scheduleId = "schedule-1"; // For demo purposes
	const [viewMode, setViewMode] = useState<"calendar" | "daily">("calendar");

	// Track selected date and its shifts
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedDateShifts, setSelectedDateShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch locations and employees
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [fetchedLocations, fetchedEmployees] = await Promise.all([
					LocationsAPI.getAll(organizationId),
					EmployeesAPI.getAll(organizationId),
				]);
				setLocations(fetchedLocations);
				setEmployees(fetchedEmployees);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [organizationId]);

	const handleDateSelect = (date: Date, shifts: Shift[]) => {
		setSelectedDate(date);
		setSelectedDateShifts(shifts);
	};

	// Navigate to daily shifts view for selected date
	const handleViewDailyShifts = () => {
		navigate(`/daily-shifts?date=${format(selectedDate, "yyyy-MM-dd")}`);
	};

	return (
		<div className="px-4 sm:px-6 py-6 space-y-6">
			{/* Header with Today's view link */}
			<div className="flex justify-between items-center mb-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/schedule")}>
					<ListTodo className="h-4 w-4 mr-2" /> View Today's Schedule
				</Button>
			</div>

			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
					<p className="text-muted-foreground">
						View and manage employee shifts across all locations
					</p>
				</div>

				<div className="flex items-center gap-2 flex-shrink-0">
					<ShiftCreationSheet
						scheduleId={scheduleId}
						organizationId={organizationId}
						initialDate={selectedDate}
						trigger={
							<Button variant="outline">
								<Plus className="h-4 w-4 mr-2" />
								Create Shift
							</Button>
						}
					/>

					<Button onClick={handleViewDailyShifts}>
						<CalendarIcon className="h-4 w-4 mr-2" />
						View Daily Shifts <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* View mode toggle */}
			<div className="flex items-center gap-2">
				<Button
					variant={viewMode === "calendar" ? "default" : "outline"}
					size="icon"
					onClick={() => setViewMode("calendar")}>
					<CalendarIcon className="h-4 w-4" />
				</Button>
				<Button
					variant={viewMode === "daily" ? "default" : "outline"}
					size="icon"
					onClick={() => setViewMode("daily")}>
					<ListTodo className="h-4 w-4" />
				</Button>
			</div>

			{/* Date selection info */}
			{selectedDateShifts.length > 0 && (
				<div className="bg-muted/30 p-4 rounded-lg mb-6">
					<p className="flex items-center gap-2">
						<CalendarIcon className="h-4 w-4 text-muted-foreground" />
						<span>
							<strong>{format(selectedDate, "MMMM d, yyyy")}</strong>:{" "}
							{selectedDateShifts.length} shift
							{selectedDateShifts.length !== 1 ? "s" : ""} scheduled
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="ml-auto"
							onClick={handleViewDailyShifts}>
							View Details <ArrowRight className="ml-1 h-3 w-3" />
						</Button>
					</p>
				</div>
			)}

			{/* Content based on view mode */}
			{viewMode === "calendar" ? (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<ScheduleCalendar onDateSelect={handleDateSelect} />
				</div>
			) : (
				<DailyShiftsView
					date={selectedDate}
					shifts={selectedDateShifts}
					locations={locations}
					employees={employees}
				/>
			)}
		</div>
	);
}
