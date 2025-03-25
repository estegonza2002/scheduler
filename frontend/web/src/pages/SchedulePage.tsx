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
	Clock,
	ChevronLeft,
	ChevronRight,
	Search,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import { DailyShiftsView } from "../components/DailyShiftsView";

import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function SchedulePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org
	const scheduleId = "schedule-1"; // For demo purposes
	const viewMode =
		(searchParams.get("view") as "calendar" | "daily") || "calendar";

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

	const handlePrevDay = () => {
		// Implementation needed
	};

	const handleNextDay = () => {
		// Implementation needed
	};

	return (
		<ContentContainer>
			{/* Date header with navigation */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold">Monday, March 24, 2025</h2>
					<p className="text-muted-foreground">Shifts for Mar 24</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon">
						<ChevronRight className="h-4 w-4" />
					</Button>
					<ShiftCreationSheet
						organizationId={organizationId}
						scheduleId={scheduleId}
						trigger={
							<Button>
								<Plus className="h-4 w-4 mr-2" /> Create Shift
							</Button>
						}
					/>
				</div>
			</div>

			{/* Shift filters and search */}
			<div className="mb-6">
				<div className="flex gap-4 items-center mb-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search shifts by location or employee..."
							className="pl-9"
						/>
					</div>
					<div className="w-48">
						<select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">All locations</option>
							{locations.map((loc) => (
								<option
									key={loc.id}
									value={loc.id}>
									{loc.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Time sections */}
				<div className="space-y-8">
					{/* Morning shifts */}
					<div>
						<h3 className="flex items-center text-sm font-medium text-muted-foreground mb-4">
							<svg
								className="h-4 w-4 mr-2"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<circle
									cx="12"
									cy="12"
									r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							Morning (6)
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Sample shift cards - you'll replace these with real data */}
							<Card className="overflow-hidden">
								<CardContent className="p-0">
									<div className="border-b px-4 py-3">
										<div className="font-medium">10:00 AM - 6:00 PM</div>
										<div className="text-sm text-muted-foreground">
											Midtown Coffee Shop 15
										</div>
									</div>
									<div className="px-4 py-3 text-sm">1 employee</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden">
								<CardContent className="p-0">
									<div className="border-b px-4 py-3">
										<div className="font-medium">8:00 AM - 4:00 PM</div>
										<div className="text-sm text-muted-foreground">
											East Side Coffee Shop 3
										</div>
									</div>
									<div className="px-4 py-3 text-sm">1 employee</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Afternoon shifts */}
					<div>
						<h3 className="flex items-center text-sm font-medium text-muted-foreground mb-4">
							<svg
								className="h-4 w-4 mr-2"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<circle
									cx="12"
									cy="12"
									r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							Afternoon (6)
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Sample shift cards - you'll replace these with real data */}
							<Card className="overflow-hidden">
								<CardContent className="p-0">
									<div className="border-b px-4 py-3">
										<div className="font-medium">2:00 PM - 10:00 PM</div>
										<div className="text-sm text-muted-foreground">
											Uptown Coffee Shop 9
										</div>
									</div>
									<div className="px-4 py-3 text-sm">1 employee</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden">
								<CardContent className="p-0">
									<div className="border-b px-4 py-3">
										<div className="font-medium">4:00 PM - 12:00 AM</div>
										<div className="text-sm text-muted-foreground">
											Little Italy Coffee Shop 5
										</div>
									</div>
									<div className="px-4 py-3 text-sm">1 employee</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Pagination */}
				<div className="flex justify-between items-center mt-6">
					<div className="text-sm text-muted-foreground">
						Showing 1-12 of 15 shifts
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm">
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm">
							Next
						</Button>
					</div>
				</div>
			</div>
		</ContentContainer>
	);
}
