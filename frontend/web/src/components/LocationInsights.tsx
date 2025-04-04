import { useEffect, useState } from "react";
import { Location, Shift, Employee } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHours } from "../utils/time-calculations";
import { FormulaExplainer } from "@/components/ui/formula-explainer";
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
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";

interface LocationInsightsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
	className?: string;
}

export function LocationInsights({
	location,
	shifts,
	employees,
	className,
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
		<ContentSection
			title="Location Insights"
			description="Key metrics and performance indicators for this location"
			className={className}>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{/* Total Shifts Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-blue-600" />
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
					<CardContent className="pt-0">
						<div className="text-2xl font-bold">{stats.totalShifts}</div>
						<div className="text-sm text-muted-foreground">
							{stats.completedShifts} completed
						</div>
					</CardContent>
				</Card>

				{/* Total Hours Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-green-600" />
								Total Hours
							</span>
							<FormulaExplainer
								formula="Total Hours = Σ(End Time - Start Time)"
								description="Sum of all hours worked across all shifts at this location."
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
					<CardContent className="pt-0">
						<div className="text-2xl font-bold">
							{stats.totalHours.toFixed(1)}
						</div>
						<div className="text-sm text-muted-foreground">
							{stats.averageShiftsPerDay.toFixed(1)} shifts/day
						</div>
					</CardContent>
				</Card>

				{/* Total Earnings Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center justify-between">
							<span className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-amber-600" />
								Total Earnings
							</span>
							<FormulaExplainer
								formula="Total Earnings = Σ(Hours × Hourly Rate)"
								description="Sum of all earnings generated by completed shifts at this location."
								example="If Employee A ($20/hr) worked 10 hours and Employee B ($25/hr) worked 8 hours, Total Earnings = $400."
								variantColor="amber"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="text-2xl font-bold">
							${stats.totalEarnings.toFixed(2)}
						</div>
						<div className="text-sm text-muted-foreground">
							Avg. rate: ${stats.averageHourlyRate.toFixed(2)}/hr
						</div>
					</CardContent>
				</Card>

				{/* Employee Utilization Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Users className="h-4 w-4 text-purple-600" />
								Employee Utilization
							</span>
							<FormulaExplainer
								formula="Utilization = Employees With Shifts ÷ Total Employees × 100%"
								description="The percentage of assigned employees who have worked shifts at this location."
								example="If 8 out of 10 assigned employees worked shifts, Utilization = 80%."
								variantColor="purple"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="text-2xl font-bold">
							{stats.employeeUtilization.toFixed(0)}%
						</div>
						<div className="text-sm text-muted-foreground">
							{employees.length} assigned employees
						</div>
					</CardContent>
				</Card>
			</div>
		</ContentSection>
	);
}
