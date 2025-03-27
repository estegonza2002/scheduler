import { useEffect, useState } from "react";
import { Location, Shift, Employee } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHours } from "../utils/time-calculations";
import { FormulaExplainer } from "@/components/ui/formula-explainer";
import {
	Clock,
	Calendar,
	AlertCircle,
	CheckCircle,
	XCircle,
	BarChart3,
	Users,
} from "lucide-react";
import {
	parseISO,
	format,
	differenceInDays,
	isBefore,
	startOfWeek,
	endOfWeek,
	getDay,
	isWithinInterval,
} from "date-fns";

interface LocationShiftInsightsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationShiftInsights({
	location,
	shifts,
	employees,
}: LocationShiftInsightsProps) {
	const [stats, setStats] = useState({
		totalScheduledShifts: 0,
		completedShifts: 0,
		canceledShifts: 0,
		noShowRate: 0,
		busiestDay: "",
		busiestTime: "",
		avgShiftLength: 0,
		coverageGaps: 0,
	});

	useEffect(() => {
		// Calculate shift insights based on location data and shifts
		const calculateShiftStats = () => {
			const now = new Date();

			// Calculate completed, canceled, and no-show shifts
			const completedShifts = shifts.filter(
				(shift) =>
					isBefore(parseISO(shift.end_time), now) &&
					shift.status === "completed"
			).length;

			const canceledShifts = shifts.filter(
				(shift) => shift.status === "canceled"
			).length;

			const pastShifts = shifts.filter((shift) =>
				isBefore(parseISO(shift.end_time), now)
			).length;

			// Calculate no-show rate
			const noShowCount = pastShifts - completedShifts - canceledShifts;
			const noShowRate = pastShifts > 0 ? (noShowCount / pastShifts) * 100 : 0;

			// Calculate average shift length
			const totalHours = shifts.reduce((total, shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				return total + hours;
			}, 0);

			const avgShiftLength = shifts.length > 0 ? totalHours / shifts.length : 0;

			// Determine busiest day of the week
			const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

			shifts.forEach((shift) => {
				const shiftDate = parseISO(shift.start_time);
				const dayOfWeek = getDay(shiftDate);
				dayCount[dayOfWeek]++;
			});

			const busiestDayIndex = dayCount.indexOf(Math.max(...dayCount));
			const dayNames = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];
			const busiestDay = dayNames[busiestDayIndex];

			// Determine busiest time of day
			const hourCounts = Array(24).fill(0);

			shifts.forEach((shift) => {
				const startHour = parseISO(shift.start_time).getHours();
				hourCounts[startHour]++;
			});

			const busiestHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
			const busiestTime = format(
				new Date().setHours(busiestHourIndex, 0, 0, 0),
				"h a"
			);

			// Calculate coverage gaps (simulated for demo)
			// In real app, this would be based on business hours vs scheduled hours
			const coverageGaps = Math.floor(Math.random() * 5); // Random gaps for demo

			setStats({
				totalScheduledShifts: shifts.length,
				completedShifts,
				canceledShifts,
				noShowRate,
				busiestDay,
				busiestTime,
				avgShiftLength,
				coverageGaps,
			});
		};

		calculateShiftStats();
	}, [location, shifts]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Completed Shifts Card */}
				<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-green-700">
							<span className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4" />
								Completion Rate
							</span>
							<FormulaExplainer
								formula="Completion Rate = (Completed Shifts / Total Scheduled Shifts) × 100%"
								description="The percentage of scheduled shifts that were successfully completed. This metric helps you track shift fulfillment and overall operational reliability."
								example="If 80 shifts were scheduled and 72 were completed, Completion Rate = (72 / 80) × 100% = 90%."
								variables={[
									{
										name: "Completed Shifts",
										description: "Number of shifts marked as completed",
									},
									{
										name: "Total Scheduled Shifts",
										description:
											"Total number of shifts scheduled at this location",
									},
								]}
								variantColor="green"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.totalScheduledShifts > 0
								? (
										(stats.completedShifts / stats.totalScheduledShifts) *
										100
								  ).toFixed(1)
								: 0}
							%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.completedShifts} of {stats.totalScheduledShifts} shifts
						</div>
					</CardContent>
				</Card>

				{/* No-Show Rate Card */}
				<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-amber-700">
							<span className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4" />
								No-Show Rate
							</span>
							<FormulaExplainer
								formula="No-Show Rate = (No-Show Count / Total Past Shifts) × 100%"
								description="The percentage of past shifts where employees did not show up and the shift was not canceled. This metric helps identify attendance issues."
								example="If there were 100 past shifts and 5 were no-shows, No-Show Rate = (5 / 100) × 100% = 5%."
								variables={[
									{
										name: "No-Show Count",
										description:
											"Number of past shifts where the employee did not show up (not completed or canceled)",
									},
									{
										name: "Total Past Shifts",
										description:
											"Total number of shifts that have already passed",
									},
								]}
								variantColor="amber"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.noShowRate.toFixed(1)}%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.canceledShifts} shifts canceled
						</div>
					</CardContent>
				</Card>

				{/* Average Shift Length Card */}
				<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-blue-700">
							<span className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Avg Shift Length
							</span>
							<FormulaExplainer
								formula="Avg Shift Length = Total Hours / Total Shifts"
								description="The average duration of all shifts at this location. This helps you understand typical shift patterns and labor allocation."
								example="If 20 shifts totaling 160 hours were scheduled, Avg Shift Length = 160 / 20 = 8 hours."
								variantColor="blue"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.avgShiftLength.toFixed(1)}h
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.coverageGaps} coverage gaps
						</div>
					</CardContent>
				</Card>

				{/* Peak Times Card */}
				<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-purple-700">
							<span className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4" />
								Peak Times
							</span>
							<FormulaExplainer
								formula="Peak Times = Mode(Day of Week, Hour of Day)"
								description="The most common day of the week and hour of the day when shifts are scheduled. This identifies when your location is busiest."
								example="If Monday has the most shifts (15) and 9 AM is the most common start time (12 shifts), then Peak Times = Monday at 9 AM."
								variantColor="purple"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold truncate">
							{stats.busiestDay}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Busiest at {stats.busiestTime}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
