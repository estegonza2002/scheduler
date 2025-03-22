import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { DailyShiftsView } from "../components/DailyShiftsView";
import { useSearchParams } from "react-router-dom";
import { Shift, ShiftsAPI } from "../api";
import { format, parseISO, addDays, subDays } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Plus,
	ArrowLeft,
} from "lucide-react";
import { ShiftCreationDialog } from "../components/ShiftCreationDialog";
import { useNavigate } from "react-router-dom";

export default function DailyShiftsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org

	// Get date from URL param or use today's date
	useEffect(() => {
		const dateParam = searchParams.get("date");
		if (dateParam) {
			setCurrentDate(new Date(dateParam));
		}
	}, [searchParams]);

	// Fetch schedules and shifts
	const fetchShifts = async () => {
		try {
			setLoading(true);

			// Get schedules
			const defaultSchedule = "sch-4"; // Updated to Spring 2025 schedule
			if (!selectedSchedule) {
				setSelectedSchedule(defaultSchedule);
			}

			// Get shifts for this date
			const allShifts = await ShiftsAPI.getAll(
				selectedSchedule || defaultSchedule
			);

			// Filter for the current date (this would be done on the server in a real app)
			const currentDateShifts = allShifts.filter((shift) => {
				const shiftDate = parseISO(shift.startTime);
				return (
					shiftDate.getDate() === currentDate.getDate() &&
					shiftDate.getMonth() === currentDate.getMonth() &&
					shiftDate.getFullYear() === currentDate.getFullYear()
				);
			});

			setShifts(currentDateShifts);
		} catch (error) {
			console.error("Error fetching shifts:", error);
		} finally {
			setLoading(false);
		}
	};

	// Initialize data on component mount and when date changes
	useEffect(() => {
		fetchShifts();
	}, [currentDate, organizationId, selectedSchedule]);

	return (
		<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
			{/* Back to calendar link */}
			<Button
				variant="ghost"
				size="sm"
				className="mb-4"
				onClick={() => navigate("/schedule")}>
				<ArrowLeft className="h-4 w-4 mr-2" /> Back to Calendar
			</Button>

			{/* Date navigation */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight mb-1">
						Shifts for {format(currentDate, "EEEE, MMMM d, yyyy")}
					</h1>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
								const newDate = subDays(currentDate, 1);
								setCurrentDate(newDate);
								setSearchParams({
									...Object.fromEntries(searchParams.entries()),
									date: newDate.toISOString().split("T")[0],
								});
							}}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="flex items-center"
							onClick={() => {
								const today = new Date();
								setCurrentDate(today);
								setSearchParams({
									...Object.fromEntries(searchParams.entries()),
									date: today.toISOString().split("T")[0],
								});
							}}>
							<CalendarIcon className="mr-2 h-4 w-4" />
							Today
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
								const newDate = addDays(currentDate, 1);
								setCurrentDate(newDate);
								setSearchParams({
									...Object.fromEntries(searchParams.entries()),
									date: newDate.toISOString().split("T")[0],
								});
							}}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex items-center flex-shrink-0">
					<ShiftCreationDialog
						scheduleId={selectedSchedule || "sch-4"}
						organizationId={organizationId}
						initialDate={currentDate}
						onShiftCreated={fetchShifts}
						trigger={
							<Button
								variant="default"
								className="bg-black hover:bg-black/90 text-white">
								<Plus className="h-4 w-4 mr-2" />
								New Shift
							</Button>
						}
					/>
				</div>
			</div>

			{/* Shifts View */}
			<div className="bg-white rounded-lg shadow overflow-hidden p-4">
				{loading ? (
					<div className="flex items-center justify-center h-64">
						<div className="animate-pulse text-muted-foreground">
							Loading shifts...
						</div>
					</div>
				) : (
					<DailyShiftsView
						date={currentDate}
						shifts={shifts}
					/>
				)}
			</div>
		</div>
	);
}
