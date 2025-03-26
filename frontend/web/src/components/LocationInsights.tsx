import { useEffect, useState } from "react";
import { Location, Shift, Employee } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { calculateHours } from "../utils/time-calculations";
import { FormulaExplainer } from "./ui/formula-explainer";
import {
	Clock,
	DollarSign,
	Users,
	Building2,
	Calendar,
	TrendingUp,
	BarChart,
} from "lucide-react";
import { parseISO, format, differenceInDays, isBefore } from "date-fns";

interface LocationInsightsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationInsights({
	location,
	shifts,
	employees,
}: LocationInsightsProps) {
	const [stats, setStats] = useState({
		totalShifts: 0,
		completedShifts: 0,
		totalHours: 0,
		totalEarnings: 0,
		averageShiftsPerDay: 0,
		employeeUtilization: 0,
		averageHourlyRate: 0,
	});

	useEffect(() => {
		// Calculate insights based on location data, shifts, and employees
		const calculateStats = () => {
			const now = new Date();

			// Calculate total and completed shifts
			const completedShifts = shifts.filter(
				(shift) =>
					isBefore(parseISO(shift.end_time), now) && shift.status !== "canceled"
			).length;

			// Calculate total hours worked at this location
			const totalHours = shifts.reduce((total, shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				return total + hours;
			}, 0);

			// Calculate total earnings at the location
			const totalEarnings = shifts.reduce((total, shift) => {
				if (
					isBefore(parseISO(shift.end_time), now) &&
					shift.status !== "canceled"
				) {
					const hours = parseFloat(
						calculateHours(shift.start_time, shift.end_time)
					);

					// Find the employee assigned to this shift to get their hourly rate
					const employee = employees.find((emp) => emp.id === shift.user_id);
					const hourlyRate = employee?.hourlyRate || 0;

					return total + hours * hourlyRate;
				}
				return total;
			}, 0);

			// Calculate average shifts per day
			// Use the date of the first shift as the start date, or a default of 30 days
			const firstShiftDate =
				shifts.length > 0
					? parseISO(
							shifts.sort(
								(a, b) =>
									new Date(a.start_time).getTime() -
									new Date(b.start_time).getTime()
							)[0].start_time
					  )
					: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const daysSinceFirstShift = Math.max(
				1,
				differenceInDays(now, firstShiftDate)
			);
			const averageShiftsPerDay = shifts.length / daysSinceFirstShift;

			// Calculate employee utilization (percentage of assigned employees who have worked shifts)
			const employeesWithShifts = new Set(shifts.map((shift) => shift.user_id));
			const employeeUtilization =
				employees.length > 0
					? (employeesWithShifts.size / employees.length) * 100
					: 0;

			// Calculate average hourly rate of employees assigned to this location
			const totalHourlyRates = employees.reduce(
				(sum, emp) => sum + (emp.hourlyRate || 0),
				0
			);
			const averageHourlyRate =
				employees.length > 0 ? totalHourlyRates / employees.length : 0;

			setStats({
				totalShifts: shifts.length,
				completedShifts,
				totalHours,
				totalEarnings,
				averageShiftsPerDay,
				employeeUtilization,
				averageHourlyRate,
			});
		};

		calculateStats();
	}, [location, shifts, employees]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Shifts Card */}
				<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-blue-700">
							<span className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Total Shifts
							</span>
							<FormulaExplainer
								formula="Total Shifts = Count(All Shifts)"
								description="The total number of shifts scheduled at this location, including completed, pending, and canceled shifts."
								example="If there are 45 shifts in the system for this location, Total Shifts = 45."
								variantColor="blue"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">{stats.totalShifts}</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.completedShifts} completed
						</div>
					</CardContent>
				</Card>

				{/* Total Hours Card */}
				<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-green-700">
							<span className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Total Hours
							</span>
							<FormulaExplainer
								formula="Total Hours = Σ(End Time - Start Time)"
								description="Sum of all hours worked across all shifts at this location. Each shift's hours are calculated as the difference between its end time and start time."
								example="If Shift 1 was 3 hours and Shift 2 was 4.5 hours, Total Hours = 3 + 4.5 = 7.5 hours."
								variables={[
									{
										name: "End Time",
										description: "The scheduled end time of a shift.",
									},
									{
										name: "Start Time",
										description: "The scheduled start time of a shift.",
									},
								]}
								variantColor="green"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.totalHours.toFixed(1)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.averageShiftsPerDay.toFixed(1)} shifts/day
						</div>
					</CardContent>
				</Card>

				{/* Total Earnings Card */}
				<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-amber-700">
							<span className="flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Total Earnings
							</span>
							<FormulaExplainer
								formula="Total Earnings = Σ(Hours Worked × Employee Hourly Rate)"
								description="Sum of all earnings generated by completed shifts at this location. Calculated by multiplying each shift's hours by the hourly rate of the employee who worked it."
								example="If Employee A ($20/hr) worked 10 hours and Employee B ($25/hr) worked 8 hours, Total Earnings = (10 × $20) + (8 × $25) = $200 + $200 = $400."
								variantColor="amber"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							${stats.totalEarnings.toFixed(2)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Avg. rate: ${stats.averageHourlyRate.toFixed(2)}/hr
						</div>
					</CardContent>
				</Card>

				{/* Employee Utilization Card */}
				<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-purple-700">
							<span className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Employee Utilization
							</span>
							<FormulaExplainer
								formula="Employee Utilization = (Number of Employees With Shifts / Total Assigned Employees) × 100%"
								description="The percentage of assigned employees who have worked at least one shift at this location. This metric helps identify how effectively you're utilizing your available workforce."
								example="If 8 out of 10 assigned employees have worked shifts at this location, Employee Utilization = (8 / 10) × 100% = 80%."
								variantColor="purple"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.employeeUtilization.toFixed(0)}%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{employees.length} assigned employees
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
