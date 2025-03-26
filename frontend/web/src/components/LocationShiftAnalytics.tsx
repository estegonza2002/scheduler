import { useState, useEffect } from "react";
import { Location, Shift, Employee } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { calculateHours } from "../utils/time-calculations";
import {
	Clock,
	DollarSign,
	Calendar,
	TrendingUp,
	BarChart,
	PieChart,
	Users,
} from "lucide-react";
import {
	parseISO,
	format,
	differenceInDays,
	isBefore,
	isAfter,
	startOfWeek,
	endOfWeek,
} from "date-fns";
import { Progress } from "./ui/progress";

interface LocationShiftAnalyticsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationShiftAnalytics({
	location,
	shifts,
	employees,
}: LocationShiftAnalyticsProps) {
	const [analytics, setAnalytics] = useState({
		averageShiftLength: 0,
		averageShiftCost: 0,
		totalShiftCost: 0,
		shiftCompletionRate: 0,
		shiftsPerWeekday: Array(7).fill(0),
		shiftTimesOfDay: {
			morning: 0,
			afternoon: 0,
			evening: 0,
			night: 0,
		},
		mostCommonShiftDuration: 0,
		busiest24HourPeriod: { start: 0, end: 0, count: 0 },
		lateShiftRate: 0,
		employeeShiftDistribution: [] as { name: string; shifts: number }[],
	});

	useEffect(() => {
		// Calculate analytics based on location data, shifts, and employees
		const calculateShiftAnalytics = () => {
			const now = new Date();

			// Skip calculation if no shifts
			if (shifts.length === 0) {
				return;
			}

			// Average shift length
			const totalHours = shifts.reduce((total, shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				return total + hours;
			}, 0);
			const averageShiftLength = totalHours / shifts.length;

			// Calculate total and average shift cost
			let totalShiftCost = 0;
			shifts.forEach((shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				const employee = employees.find((emp) => emp.id === shift.user_id);
				const hourlyRate = employee?.hourlyRate || 0;
				totalShiftCost += hours * hourlyRate;
			});
			const averageShiftCost =
				shifts.length > 0 ? totalShiftCost / shifts.length : 0;

			// Shift completion rate
			const completedShifts = shifts.filter(
				(shift) =>
					isBefore(parseISO(shift.end_time), now) &&
					shift.status === "completed"
			).length;
			const pastShifts = shifts.filter((shift) =>
				isBefore(parseISO(shift.end_time), now)
			).length;
			const shiftCompletionRate =
				pastShifts > 0 ? (completedShifts / pastShifts) * 100 : 0;

			// Distribution of shifts by weekday
			const shiftsPerWeekday = Array(7).fill(0);
			shifts.forEach((shift) => {
				const dayOfWeek = parseISO(shift.start_time).getDay();
				shiftsPerWeekday[dayOfWeek]++;
			});

			// Distribution of shifts by time of day
			let morningShifts = 0;
			let afternoonShifts = 0;
			let eveningShifts = 0;
			let nightShifts = 0;

			shifts.forEach((shift) => {
				const startHour = parseISO(shift.start_time).getHours();

				if (startHour >= 5 && startHour < 12) {
					morningShifts++;
				} else if (startHour >= 12 && startHour < 17) {
					afternoonShifts++;
				} else if (startHour >= 17 && startHour < 22) {
					eveningShifts++;
				} else {
					nightShifts++;
				}
			});

			// Find most common shift duration (rounded to nearest hour)
			const durationCounts: Record<number, number> = {};
			shifts.forEach((shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				const roundedHours = Math.round(hours);
				durationCounts[roundedHours] = (durationCounts[roundedHours] || 0) + 1;
			});

			let mostCommonDuration = 0;
			let highestCount = 0;
			Object.entries(durationCounts).forEach(([duration, count]) => {
				if (count > highestCount) {
					highestCount = count;
					mostCommonDuration = parseInt(duration);
				}
			});

			// Find busiest 24-hour period by analyzing shifts on sliding windows
			const hourCounts = Array(24).fill(0);
			shifts.forEach((shift) => {
				const startHour = parseISO(shift.start_time).getHours();
				hourCounts[startHour]++;
			});

			let busiestStart = 0;
			let busiestCount = 0;
			for (let hour = 0; hour < 24; hour++) {
				let totalInWindow = 0;
				for (let i = 0; i < 8; i++) {
					// Using 8-hour window
					const hourToCheck = (hour + i) % 24;
					totalInWindow += hourCounts[hourToCheck];
				}
				if (totalInWindow > busiestCount) {
					busiestCount = totalInWindow;
					busiestStart = hour;
				}
			}

			// Calculate employee shift distribution (top 5)
			const employeeCounts: Record<string, { name: string; shifts: number }> =
				{};
			shifts.forEach((shift) => {
				const employee = employees.find((emp) => emp.id === shift.user_id);
				if (employee) {
					if (!employeeCounts[employee.id]) {
						employeeCounts[employee.id] = {
							name: employee.name,
							shifts: 0,
						};
					}
					employeeCounts[employee.id].shifts++;
				}
			});

			const employeeShiftDistribution = Object.values(employeeCounts)
				.sort((a, b) => b.shifts - a.shifts)
				.slice(0, 5);

			setAnalytics({
				averageShiftLength,
				averageShiftCost,
				totalShiftCost,
				shiftCompletionRate,
				shiftsPerWeekday,
				shiftTimesOfDay: {
					morning: morningShifts,
					afternoon: afternoonShifts,
					evening: eveningShifts,
					night: nightShifts,
				},
				mostCommonShiftDuration: mostCommonDuration,
				busiest24HourPeriod: {
					start: busiestStart,
					end: (busiestStart + 8) % 24,
					count: busiestCount,
				},
				lateShiftRate: 0, // Would need actual check-in data
				employeeShiftDistribution,
			});
		};

		calculateShiftAnalytics();
	}, [location, shifts, employees]);

	// Weekday names for display
	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Get total shifts count for distribution calculations
	const totalShiftCount = shifts.length;
	const totalTimesOfDay =
		analytics.shiftTimesOfDay.morning +
		analytics.shiftTimesOfDay.afternoon +
		analytics.shiftTimesOfDay.evening +
		analytics.shiftTimesOfDay.night;

	return (
		<div className="space-y-6">
			{/* Basic metrics cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Average Shift Length Card */}
				<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
						<CardTitle className="text-sm flex items-center gap-2 text-blue-700">
							<Clock className="h-4 w-4" />
							Average Shift Length
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{analytics.averageShiftLength.toFixed(1)} hrs
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Most common: {analytics.mostCommonShiftDuration} hrs
						</div>
					</CardContent>
				</Card>

				{/* Average Shift Cost Card */}
				<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
						<CardTitle className="text-sm flex items-center gap-2 text-green-700">
							<DollarSign className="h-4 w-4" />
							Average Shift Cost
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							${analytics.averageShiftCost.toFixed(2)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Total: ${analytics.totalShiftCost.toFixed(2)}
						</div>
					</CardContent>
				</Card>

				{/* Shift Completion Rate Card */}
				<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
						<CardTitle className="text-sm flex items-center gap-2 text-amber-700">
							<Calendar className="h-4 w-4" />
							Completion Rate
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{analytics.shiftCompletionRate.toFixed(0)}%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Of past shifts
						</div>
					</CardContent>
				</Card>

				{/* Busiest Period Card */}
				<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
						<CardTitle className="text-sm flex items-center gap-2 text-purple-700">
							<BarChart className="h-4 w-4" />
							Busiest Period
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{analytics.busiest24HourPeriod.start}:00 -{" "}
							{analytics.busiest24HourPeriod.end}:00
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{analytics.busiest24HourPeriod.count} shifts in window
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Advanced analytics */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Day of week distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Shifts by Day of Week</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{weekdays.map((day, index) => (
								<div key={day}>
									<div className="flex justify-between text-xs">
										<span>{day}</span>
										<span>
											{totalShiftCount > 0
												? Math.round(
														(analytics.shiftsPerWeekday[index] /
															totalShiftCount) *
															100
												  )
												: 0}
											%
										</span>
									</div>
									<Progress
										value={
											totalShiftCount > 0
												? (analytics.shiftsPerWeekday[index] /
														totalShiftCount) *
												  100
												: 0
										}
										className="h-1"
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Time of day distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Shifts by Time of Day</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{/* Morning Shifts */}
							<div>
								<div className="flex justify-between text-xs">
									<span>Morning (5am-12pm)</span>
									<span>
										{totalTimesOfDay > 0
											? Math.round(
													(analytics.shiftTimesOfDay.morning /
														totalTimesOfDay) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<Progress
									value={
										totalTimesOfDay > 0
											? (analytics.shiftTimesOfDay.morning / totalTimesOfDay) *
											  100
											: 0
									}
									className="h-1"
								/>
							</div>

							{/* Afternoon Shifts */}
							<div>
								<div className="flex justify-between text-xs">
									<span>Afternoon (12pm-5pm)</span>
									<span>
										{totalTimesOfDay > 0
											? Math.round(
													(analytics.shiftTimesOfDay.afternoon /
														totalTimesOfDay) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<Progress
									value={
										totalTimesOfDay > 0
											? (analytics.shiftTimesOfDay.afternoon /
													totalTimesOfDay) *
											  100
											: 0
									}
									className="h-1"
								/>
							</div>

							{/* Evening Shifts */}
							<div>
								<div className="flex justify-between text-xs">
									<span>Evening (5pm-10pm)</span>
									<span>
										{totalTimesOfDay > 0
											? Math.round(
													(analytics.shiftTimesOfDay.evening /
														totalTimesOfDay) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<Progress
									value={
										totalTimesOfDay > 0
											? (analytics.shiftTimesOfDay.evening / totalTimesOfDay) *
											  100
											: 0
									}
									className="h-1"
								/>
							</div>

							{/* Night Shifts */}
							<div>
								<div className="flex justify-between text-xs">
									<span>Night (10pm-5am)</span>
									<span>
										{totalTimesOfDay > 0
											? Math.round(
													(analytics.shiftTimesOfDay.night / totalTimesOfDay) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<Progress
									value={
										totalTimesOfDay > 0
											? (analytics.shiftTimesOfDay.night / totalTimesOfDay) *
											  100
											: 0
									}
									className="h-1"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Employee shift distribution */}
				{analytics.employeeShiftDistribution.length > 0 && (
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle className="text-base">
								Top Employees by Shift Count
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{analytics.employeeShiftDistribution.map((employee) => (
									<div key={employee.name}>
										<div className="flex justify-between text-xs">
											<span>{employee.name}</span>
											<span>{employee.shifts} shifts</span>
										</div>
										<Progress
											value={
												(employee.shifts /
													Math.max(
														...analytics.employeeShiftDistribution.map(
															(e) => e.shifts
														)
													)) *
												100
											}
											className="h-1"
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
