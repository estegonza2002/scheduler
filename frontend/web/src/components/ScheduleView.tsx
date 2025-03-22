import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Schedule, Shift, SchedulesAPI, ShiftsAPI } from "../lib/api";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";

export function ScheduleView() {
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
	const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
		startOfWeek(new Date())
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch schedules on component mount
	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				setLoading(true);
				const scheduleData = await SchedulesAPI.getAll();
				setSchedules(scheduleData);

				// Auto-select the first schedule if available
				if (scheduleData.length > 0 && !selectedSchedule) {
					setSelectedSchedule(scheduleData[0].id);
				}

				setError(null);
			} catch (err) {
				console.error("Error fetching schedules:", err);
				setError("Failed to load schedules. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchSchedules();
	}, []);

	// Fetch shifts when a schedule is selected
	useEffect(() => {
		if (!selectedSchedule) return;

		const fetchShifts = async () => {
			try {
				setLoading(true);
				const shiftsData = await SchedulesAPI.getShifts(selectedSchedule);
				setShifts(shiftsData);
				setError(null);
			} catch (err) {
				console.error("Error fetching shifts:", err);
				setError("Failed to load shifts. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchShifts();
	}, [selectedSchedule]);

	// Generate days for the current week
	const weekDays = Array.from({ length: 7 }, (_, i) => {
		const day = addDays(currentWeekStart, i);
		return {
			date: day,
			name: format(day, "EEE"),
			display: format(day, "MMM d"),
		};
	});

	// Handle week navigation
	const navigateWeek = (direction: "prev" | "next") => {
		const newStart =
			direction === "prev"
				? addDays(currentWeekStart, -7)
				: addDays(currentWeekStart, 7);
		setCurrentWeekStart(newStart);
	};

	// Filter shifts for the current week
	const filteredShifts = shifts.filter((shift) => {
		const shiftDate = parseISO(shift.start_time);
		return weekDays.some((day) => isSameDay(day.date, shiftDate));
	});

	// Group shifts by day
	const shiftsByDay = weekDays.map((day) => {
		return {
			...day,
			shifts: filteredShifts.filter((shift) => {
				const shiftDate = parseISO(shift.start_time);
				return isSameDay(day.date, shiftDate);
			}),
		};
	});

	// Select a different schedule
	const handleScheduleChange = (scheduleId: string) => {
		setSelectedSchedule(scheduleId);
	};

	// Handle assignment of a shift
	const handleAssignShift = async (shiftId: string, userId: string) => {
		try {
			await ShiftsAPI.assignUser(shiftId, userId);
			// Refresh shifts after assignment
			if (selectedSchedule) {
				const updatedShifts = await SchedulesAPI.getShifts(selectedSchedule);
				setShifts(updatedShifts);
			}
		} catch (err) {
			console.error("Error assigning shift:", err);
			setError("Failed to assign shift. Please try again.");
		}
	};

	if (loading && schedules.length === 0) {
		return <div className="p-6">Loading schedules...</div>;
	}

	if (error && schedules.length === 0) {
		return <div className="p-6 text-red-500">{error}</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Schedule</h1>

				{schedules.length > 0 && (
					<div className="flex space-x-2">
						{schedules.map((schedule) => (
							<Button
								key={schedule.id}
								variant={
									selectedSchedule === schedule.id ? "default" : "outline"
								}
								onClick={() => handleScheduleChange(schedule.id)}>
								{schedule.name}
							</Button>
						))}
					</div>
				)}
			</div>

			{selectedSchedule ? (
				<>
					<div className="flex justify-between items-center mb-4">
						<Button
							variant="outline"
							onClick={() => navigateWeek("prev")}>
							Previous Week
						</Button>
						<h2 className="text-lg font-medium">
							{format(currentWeekStart, "MMM d")} -{" "}
							{format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
						</h2>
						<Button
							variant="outline"
							onClick={() => navigateWeek("next")}>
							Next Week
						</Button>
					</div>

					<div className="grid grid-cols-7 gap-4">
						{shiftsByDay.map((day) => (
							<Card
								key={day.name}
								className="h-full">
								<CardHeader className="pb-2">
									<CardTitle className="text-center">
										<div className="text-lg">{day.name}</div>
										<div className="text-sm text-muted-foreground">
											{day.display}
										</div>
									</CardTitle>
								</CardHeader>
								<CardContent>
									{day.shifts.length > 0 ? (
										<div className="space-y-2">
											{day.shifts.map((shift) => (
												<div
													key={shift.id}
													className={`p-2 rounded text-xs ${
														shift.user_id ? "bg-green-100" : "bg-blue-100"
													}`}>
													<div className="font-medium">{shift.title}</div>
													<div>
														{format(parseISO(shift.start_time), "h:mm a")} -
														{format(parseISO(shift.end_time), "h:mm a")}
													</div>
													{shift.user_id ? (
														<div className="mt-1 text-green-800">Assigned</div>
													) : (
														<Button
															variant="ghost"
															size="sm"
															className="mt-1 h-6 text-xs"
															onClick={() =>
																handleAssignShift(shift.id, "current-user-id")
															}>
															Take Shift
														</Button>
													)}
												</div>
											))}
										</div>
									) : (
										<div className="text-center text-muted-foreground text-xs py-4">
											No shifts
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</>
			) : (
				<div className="text-center p-6">
					{schedules.length === 0 ? (
						<p>No schedules available. Please create a schedule first.</p>
					) : (
						<p>Select a schedule to view shifts.</p>
					)}
				</div>
			)}
		</div>
	);
}
