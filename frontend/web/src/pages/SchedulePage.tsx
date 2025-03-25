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
	Loader2,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import { DailyShiftsView } from "../components/DailyShiftsView";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { Card, CardContent } from "../components/ui/card";

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
		<>
			<ContentContainer>
				{/* Quick access to today's schedule */}
				<div className="mb-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/schedule")}>
						<ListTodo className="h-4 w-4 mr-2" /> View Today's Schedule
					</Button>
				</div>

				{/* View mode toggle */}
				<div className="flex items-center gap-2 mb-6">
					<Button
						variant={viewMode === "calendar" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("calendar")}
						className="flex items-center gap-1">
						<CalendarIcon className="h-4 w-4" />
						<span>Calendar</span>
					</Button>
					<Button
						variant={viewMode === "daily" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("daily")}
						className="flex items-center gap-1">
						<ListTodo className="h-4 w-4" />
						<span>Daily View</span>
					</Button>
				</div>

				{/* Selected date info */}
				{selectedDateShifts.length > 0 && (
					<Card className="mb-6">
						<CardContent className="py-3 flex items-center">
							<CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
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
						</CardContent>
					</Card>
				)}

				{/* Main content */}
				{loading ? (
					<LoadingState message="Loading schedule data..." />
				) : (
					<ContentSection
						title={viewMode === "calendar" ? "Calendar View" : "Daily View"}
						flat>
						{viewMode === "calendar" ? (
							<Card className="overflow-hidden">
								<ScheduleCalendar onDateSelect={handleDateSelect} />
							</Card>
						) : (
							<DailyShiftsView
								date={selectedDate}
								shifts={selectedDateShifts}
								locations={locations}
								employees={employees}
							/>
						)}
					</ContentSection>
				)}
			</ContentContainer>
		</>
	);
}
