import { useState, useEffect } from "react";
import { ScheduleCalendar } from "../components/ScheduleCalendar";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import {
	Shift,
	Location,
	Employee,
	LocationsAPI,
	EmployeesAPI,
	ShiftsAPI,
} from "../api";
import {
	Calendar as CalendarIcon,
	ArrowRight,
	Plus,
	Clock,
	ChevronLeft,
	ChevronRight,
	Search,
	List,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { PageHeader } from "../components/ui/page-header";

export default function SchedulePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org
	const scheduleId = searchParams.get("scheduleId") || "sch-4"; // Default to Spring 2025 schedule

	// Get date from URL param or use today's date
	const dateParam = searchParams.get("date");
	const initialDate = dateParam ? new Date(dateParam) : new Date();

	// Track current month and selected date
	const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
	const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
	const [selectedDateShifts, setSelectedDateShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(false);

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

	const handlePreviousMonth = () => {
		setCurrentMonth(subMonths(currentMonth, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	// Navigate to daily shifts view for selected date
	const handleViewDailyShifts = () => {
		// Ensure date is formatted as YYYY-MM-DD
		const formattedDate = format(selectedDate, "yyyy-MM-dd");
		navigate(
			`/daily-shifts?date=${formattedDate}&scheduleId=${scheduleId}&organizationId=${organizationId}`
		);
	};

	// Set current month to today
	const handleSetToday = () => {
		setCurrentMonth(new Date());
		setSelectedDate(new Date());
	};

	return (
		<>
			<PageHeader
				title="Monthly Schedule"
				description={`Calendar view for ${format(currentMonth, "MMMM yyyy")}`}
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={handlePreviousMonth}>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<Button
							variant="outline"
							onClick={handleSetToday}>
							Today
						</Button>

						<Button
							variant="outline"
							size="icon"
							onClick={handleNextMonth}>
							<ChevronRight className="h-4 w-4" />
						</Button>

						<Separator
							orientation="vertical"
							className="h-8"
						/>

						<Button
							variant="outline"
							size="sm"
							className="text-sm flex items-center"
							onClick={handleViewDailyShifts}>
							<List className="h-4 w-4 mr-2" /> View Daily
						</Button>

						<ShiftCreationSheet
							organizationId={organizationId}
							scheduleId={scheduleId}
							initialDate={selectedDate}
							trigger={
								<Button>
									<Plus className="h-4 w-4 mr-2" /> Create Shift
								</Button>
							}
						/>
					</div>
				}
			/>
			
				<ContentContainer>
					<Card>
						<CardContent className="p-4">
							{loading ? (
								<LoadingState
									type="spinner"
									message="Loading schedule data..."
									className="py-8"
								/>
							) : (
								<ScheduleCalendar
									currentMonth={currentMonth}
									onDateSelect={handleDateSelect}
								/>
							)}
						</CardContent>
					</Card>

					{selectedDateShifts.length > 0 && (
						<Card className="mt-6">
							<CardContent className="p-4">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-lg font-semibold">
										Shifts for {format(selectedDate, "MMMM d, yyyy")}
									</h2>
									<Button
										variant="outline"
										size="sm"
										onClick={handleViewDailyShifts}>
										View All Details
									</Button>
								</div>
								<div className="space-y-2">
									{selectedDateShifts.map((shift) => (
										<div
											key={shift.id}
											className="border rounded-md p-3 flex justify-between hover:bg-muted/30 cursor-pointer"
											onClick={() => navigate(`/shifts/${shift.id}`)}>
											<div>
												<div className="font-medium">
													{format(new Date(shift.start_time), "h:mm a")} -{" "}
													{format(new Date(shift.end_time), "h:mm a")}
												</div>
												<div className="text-sm text-muted-foreground">
													{shift.location_id
														? `Location: ${shift.location_id.replace(
																"loc-",
																""
														  )}`
														: "No location"}
												</div>
											</div>
											<div className="text-sm">
												{shift.user_id
													? `Employee: ${shift.user_id.replace("emp-", "")}`
													: "Unassigned"}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</ContentContainer>
			
		</>
	);
}
