import { useEffect, useState } from "react";
import { Location, Shift, Employee } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHours, calculateTotalCost } from "../utils/time-calculations";
import { FormulaExplainer } from "@/components/ui/formula-explainer";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Wallet,
	Receipt,
	ArrowRightLeft,
	PiggyBank,
} from "lucide-react";
import {
	parseISO,
	format,
	differenceInDays,
	isBefore,
	subMonths,
	isAfter,
	startOfMonth,
	endOfMonth,
} from "date-fns";

interface LocationFinanceInsightsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationFinanceInsights({
	location,
	shifts,
	employees,
}: LocationFinanceInsightsProps) {
	const [stats, setStats] = useState({
		totalRevenue: 0,
		laborCosts: 0,
		profitMargin: 0,
		revenueGrowth: 0,
		avgShiftCost: 0,
		avgHourlyWage: 0,
		projectedMonthlyEarnings: 0,
		loading: true,
	});

	useEffect(() => {
		// Calculate finance insights based on location data, shifts, and employees
		const calculateFinanceStats = () => {
			const now = new Date();
			const currentMonth = now;
			const lastMonth = subMonths(now, 1);
			const currentMonthStart = startOfMonth(currentMonth);
			const lastMonthStart = startOfMonth(lastMonth);
			const currentMonthEnd = endOfMonth(currentMonth);
			const lastMonthEnd = endOfMonth(lastMonth);

			// Calculate base revenue per hour based on average hourly rate × markup
			const totalHourlyRates = employees.reduce(
				(sum, emp) => sum + (emp.hourlyRate || 0),
				0
			);
			const avgHourlyWage =
				employees.length > 0 ? totalHourlyRates / employees.length : 0;

			// Markup factor represents the rate at which revenue exceeds labor costs
			// A realistic value for service businesses is typically between 2-4×
			const markupFactor = 3;
			const baseRevenuePerHour = avgHourlyWage * markupFactor;

			// Calculate total hours for current month's revenue calculation
			const currentMonthHours = shifts.reduce((total, shift) => {
				const shiftDate = parseISO(shift.start_time);
				if (
					isAfter(shiftDate, currentMonthStart) &&
					isBefore(shiftDate, currentMonthEnd) &&
					shift.status !== "canceled"
				) {
					return (
						total + parseFloat(calculateHours(shift.start_time, shift.end_time))
					);
				}
				return total;
			}, 0);

			// Calculate total hours for last month's revenue comparison
			const lastMonthHours = shifts.reduce((total, shift) => {
				const shiftDate = parseISO(shift.start_time);
				if (
					isAfter(shiftDate, lastMonthStart) &&
					isBefore(shiftDate, lastMonthEnd) &&
					shift.status !== "canceled"
				) {
					return (
						total + parseFloat(calculateHours(shift.start_time, shift.end_time))
					);
				}
				return total;
			}, 0);

			// Calculate revenue based on hours
			const currentMonthRevenue = currentMonthHours * baseRevenuePerHour;
			const lastMonthRevenue = lastMonthHours * baseRevenuePerHour;

			// Calculate labor costs for current month
			const laborCosts = shifts.reduce((total, shift) => {
				const shiftDate = parseISO(shift.start_time);
				if (
					isAfter(shiftDate, currentMonthStart) &&
					isBefore(shiftDate, currentMonthEnd) &&
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

			// Calculate revenue growth between months
			const revenueGrowth =
				lastMonthRevenue > 0
					? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
					: 0;

			// Calculate profit margin
			const profitMargin =
				currentMonthRevenue > 0
					? ((currentMonthRevenue - laborCosts) / currentMonthRevenue) * 100
					: 0;

			// Calculate average shift cost
			const currentMonthShifts = shifts.filter((shift) => {
				const shiftDate = parseISO(shift.start_time);
				return (
					isAfter(shiftDate, currentMonthStart) &&
					isBefore(shiftDate, currentMonthEnd) &&
					shift.status !== "canceled"
				);
			});
			const avgShiftCost =
				currentMonthShifts.length > 0
					? laborCosts / currentMonthShifts.length
					: 0;

			// Calculate projected monthly earnings based on daily average
			// Use all available historical data for a more accurate projection
			const completedShifts = shifts.filter(
				(shift) =>
					isBefore(parseISO(shift.end_time), now) && shift.status !== "canceled"
			);

			let projectedMonthlyEarnings = 0;

			if (completedShifts.length > 0) {
				// Find the earliest shift date to calculate the total period
				const earliestShift = completedShifts.reduce((earliest, shift) => {
					const shiftDate = parseISO(shift.start_time);
					return shiftDate < earliest ? shiftDate : earliest;
				}, now);

				const totalDays = Math.max(1, differenceInDays(now, earliestShift));
				const totalCompletedRevenue = completedShifts.reduce((total, shift) => {
					const hours = parseFloat(
						calculateHours(shift.start_time, shift.end_time)
					);
					return total + hours * baseRevenuePerHour;
				}, 0);

				// Calculate daily average and project for 30 days
				const dailyAverage = totalCompletedRevenue / totalDays;
				projectedMonthlyEarnings = dailyAverage * 30;
			} else {
				// If no historical data, use current month's data for projection
				const daysInMonth =
					differenceInDays(currentMonthEnd, currentMonthStart) + 1;
				const daysPassed = Math.min(
					differenceInDays(now, currentMonthStart) + 1,
					daysInMonth
				);

				if (daysPassed > 0) {
					const dailyAverage = currentMonthRevenue / daysPassed;
					projectedMonthlyEarnings = dailyAverage * daysInMonth;
				}
			}

			setStats({
				totalRevenue: currentMonthRevenue,
				laborCosts,
				profitMargin,
				revenueGrowth,
				avgShiftCost,
				avgHourlyWage,
				projectedMonthlyEarnings,
				loading: false,
			});
		};

		calculateFinanceStats();
	}, [location, shifts, employees]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Revenue Card */}
				<Card className="border-2 border-emerald-100 hover:border-emerald-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-emerald-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-emerald-700">
							<span className="flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Total Revenue
							</span>
							<FormulaExplainer
								formula="Total Revenue = Total Hours × Base Revenue Per Hour"
								description="Sum of all revenue generated by this location based on hours worked multiplied by an average revenue rate per hour."
								example="If 150 hours were worked and the base revenue per hour is $100, then Total Revenue = 150 × $100 = $15,000."
								variantColor="emerald"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							${stats.totalRevenue.toFixed(2)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							{stats.revenueGrowth >= 0 ? (
								<span className="flex items-center text-emerald-600">
									<TrendingUp className="h-3 w-3 mr-1" /> Up{" "}
									{Math.abs(stats.revenueGrowth).toFixed(1)}% from last month
								</span>
							) : (
								<span className="flex items-center text-red-600">
									<TrendingDown className="h-3 w-3 mr-1" /> Down{" "}
									{Math.abs(stats.revenueGrowth).toFixed(1)}% from last month
								</span>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Labor Costs Card */}
				<Card className="border-2 border-red-100 hover:border-red-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-red-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-red-700">
							<span className="flex items-center gap-2">
								<Wallet className="h-4 w-4" />
								Labor Costs
							</span>
							<FormulaExplainer
								formula="Labor Costs = Σ(Hours Worked × Hourly Rate)"
								description="Sum of all wages paid to employees for shifts at this location. Calculated by multiplying each employee's hourly rate by the hours they worked, then summing across all shifts."
								example="If Employee A ($15/hr) worked 10 hours and Employee B ($20/hr) worked 5 hours, then Labor Costs = (10 × $15) + (5 × $20) = $150 + $100 = $250."
								variantColor="red"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							${stats.laborCosts.toFixed(2)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Avg. shift: ${stats.avgShiftCost.toFixed(2)}
						</div>
					</CardContent>
				</Card>

				{/* Profit Margin Card */}
				<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-blue-700">
							<span className="flex items-center gap-2">
								<Receipt className="h-4 w-4" />
								Profit Margin
							</span>
							<FormulaExplainer
								formula="Profit Margin = ((Total Revenue - Labor Costs) / Total Revenue) × 100%"
								description="The percentage of revenue that remains as profit after labor costs are subtracted. This metric shows how efficiently the location is converting revenue into profit."
								example="If Total Revenue is $10,000 and Labor Costs are $4,000, then Profit Margin = (($10,000 - $4,000) / $10,000) × 100% = 60%."
								variables={[
									{
										name: "Total Revenue",
										description:
											"Sum of all revenue generated by this location.",
									},
									{
										name: "Labor Costs",
										description:
											"Sum of all wages paid to employees for shifts at this location.",
									},
								]}
								variantColor="blue"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.profitMargin.toFixed(1)}%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							${(stats.totalRevenue - stats.laborCosts).toFixed(2)} net
						</div>
					</CardContent>
				</Card>

				{/* Projected Earnings Card */}
				<Card className="border-2 border-indigo-100 hover:border-indigo-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-indigo-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-indigo-700">
							<span className="flex items-center gap-2">
								<PiggyBank className="h-4 w-4" />
								Projected Monthly
							</span>
							<FormulaExplainer
								formula="Projected Monthly Earnings = (Total Revenue / Days Since First Shift) × 30"
								description="An estimate of monthly earnings based on the average daily revenue from historical data, projected over a standard 30-day month."
								example="If Total Revenue is $5,000 over 10 days since the first shift, then Projected Monthly Earnings = ($5,000 / 10) × 30 = $500 × 30 = $15,000."
								variantColor="indigo"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							${stats.projectedMonthlyEarnings.toFixed(2)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Avg. hourly wage: ${stats.avgHourlyWage.toFixed(2)}/hr
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
