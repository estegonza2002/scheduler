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

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-8 w-48" />
				</div>

				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{Array.from({ length: 4 }).map((_, j) => (
									<Skeleton
										key={j}
										className="h-40 w-full rounded-md"
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="flex h-screen">
			{/* Calendar Sidebar */}
			<div className="flex-shrink-0 border-r">
				<div className="sticky top-0 px-4 py-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-semibold text-muted-foreground">
							Calendar
						</h2>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => updateDate(new Date())}
							title="Go to today">
							<RotateCcw className="h-4 w-4" />
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
			</div>

			{/* Main Content */}
			<div className="flex-1 px-4 sm:px-6 py-6 overflow-auto">
				{/* Date navigation controls */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
					<div className="flex flex-col">
						<h1 className="text-xl font-semibold">
							Shifts for {format(currentDate, "EEEE, MMMM d, yyyy")}
						</h1>
						{loading && (
							<div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span>
									{loadingPhase === "shifts"
										? "Loading shifts..."
										: loadingPhase === "locations"
										? "Loading locations..."
										: "Loading employees..."}
								</span>
							</div>
						)}
					</div>

					<div className="flex items-center space-x-2 mt-2 sm:mt-0">
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
							onClick={() => navigate("/schedule/monthly")}>
							<Grid className="h-4 w-4 mr-2" /> View Calendar
						</Button>
					</div>
				</div>

				{/* Shifts View */}
				{loading ? (
					renderLoadingSkeleton()
				) : (
					<DailyShiftsView
						date={currentDate}
						shifts={shifts}
						locations={locations}
						employees={employees}
					/>
				)}
			</div>
		</div>
	);
}
