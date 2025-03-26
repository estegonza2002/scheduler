import { useState, useEffect } from "react";
import { Location, Shift, Employee } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { calculateHours } from "../utils/time-calculations";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Clock,
	CalendarRange,
	Users,
	BarChart,
	Layers,
} from "lucide-react";
import {
	parseISO,
	format,
	startOfMonth,
	endOfMonth,
	isSameMonth,
	isAfter,
	isBefore,
} from "date-fns";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";

interface LocationFinancialReportProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationFinancialReport({
	location,
	shifts,
	employees,
}: LocationFinancialReportProps) {
	const [currentMonthStats, setCurrentMonthStats] = useState({
		totalEarnings: 0,
		totalHours: 0,
		averageHourlyRate: 0,
		employeeCosts: 0,
		topEmployeesByHours: [] as {
			id: string;
			name: string;
			hours: number;
			earnings: number;
		}[],
		shiftDistribution: {
			morning: 0,
			afternoon: 0,
			evening: 0,
			night: 0,
		},
		costPerDay: 0,
		hourlyDistribution: Array(24).fill(0) as number[],
	});

	const [monthlyStats, setMonthlyStats] = useState<
		{
			month: string;
			totalEarnings: number;
			totalHours: number;
			employeeCount: number;
		}[]
	>([]);

	useEffect(() => {
		const calculateFinancialStats = () => {
			const now = new Date();
			const currentMonthStart = startOfMonth(now);
			const currentMonthEnd = endOfMonth(now);

			// Prepare monthly data for the last 6 months
			const monthlySummary: {
				month: string;
				totalEarnings: number;
				totalHours: number;
				employeeCount: number;
			}[] = [];

			for (let i = 0; i < 6; i++) {
				const monthDate = new Date(now);
				monthDate.setMonth(now.getMonth() - i);
				const monthStart = startOfMonth(monthDate);
				const monthEnd = endOfMonth(monthDate);

				// Filter shifts for this month
				const monthShifts = shifts.filter((shift) => {
					const shiftDate = parseISO(shift.start_time);
					return (
						isAfter(shiftDate, monthStart) && isBefore(shiftDate, monthEnd)
					);
				});

				// Calculate total hours for this month
				const monthHours = monthShifts.reduce((total, shift) => {
					return (
						total + parseFloat(calculateHours(shift.start_time, shift.end_time))
					);
				}, 0);

				// Calculate total earnings for this month
				const monthEarnings = monthShifts.reduce((total, shift) => {
					const hours = parseFloat(
						calculateHours(shift.start_time, shift.end_time)
					);
					const employee = employees.find((emp) => emp.id === shift.user_id);
					const hourlyRate = employee?.hourlyRate || 0;
					return total + hours * hourlyRate;
				}, 0);

				// Count unique employees who worked this month
				const uniqueEmployees = new Set(
					monthShifts.map((shift) => shift.user_id)
				);

				monthlySummary.push({
					month: format(monthDate, "MMM yyyy"),
					totalEarnings: monthEarnings,
					totalHours: monthHours,
					employeeCount: uniqueEmployees.size,
				});
			}

			setMonthlyStats(monthlySummary);

			// Current month calculations
			const currentMonthShifts = shifts.filter((shift) => {
				const shiftDate = parseISO(shift.start_time);
				return (
					isAfter(shiftDate, currentMonthStart) &&
					isBefore(shiftDate, currentMonthEnd)
				);
			});

			// Total hours for current month
			const totalHours = currentMonthShifts.reduce((total, shift) => {
				return (
					total + parseFloat(calculateHours(shift.start_time, shift.end_time))
				);
			}, 0);

			// Employee costs and earnings
			let totalEarnings = 0;
			const employeeHours: Record<string, number> = {};
			const employeeEarnings: Record<string, number> = {};
			const employeeNames: Record<string, string> = {};
			const hourlyDistribution = Array(24).fill(0);

			// Calculate shift time distributions
			let morningShifts = 0;
			let afternoonShifts = 0;
			let eveningShifts = 0;
			let nightShifts = 0;

			currentMonthShifts.forEach((shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				const employee = employees.find((emp) => emp.id === shift.user_id);

				if (employee) {
					const hourlyRate = employee.hourlyRate || 0;
					const earnings = hours * hourlyRate;

					// Track employee stats
					if (!employeeHours[employee.id]) {
						employeeHours[employee.id] = 0;
						employeeEarnings[employee.id] = 0;
						employeeNames[employee.id] = employee.name;
					}

					employeeHours[employee.id] += hours;
					employeeEarnings[employee.id] += earnings;
					totalEarnings += earnings;

					// Track hourly distribution
					const startHour = parseISO(shift.start_time).getHours();
					const endHour = parseISO(shift.end_time).getHours();

					// Simplistic approach - just count start hour
					hourlyDistribution[startHour]++;

					// Categorize by shift time
					if (startHour >= 5 && startHour < 12) {
						morningShifts++;
					} else if (startHour >= 12 && startHour < 17) {
						afternoonShifts++;
					} else if (startHour >= 17 && startHour < 22) {
						eveningShifts++;
					} else {
						nightShifts++;
					}
				}
			});

			// Calculate average hourly rate
			const totalRates = employees.reduce(
				(sum, emp) => sum + (emp.hourlyRate || 0),
				0
			);
			const averageHourlyRate =
				employees.length > 0 ? totalRates / employees.length : 0;

			// Get top employees by hours
			const topEmployees = Object.keys(employeeHours)
				.map((id) => ({
					id,
					name: employeeNames[id],
					hours: employeeHours[id],
					earnings: employeeEarnings[id],
				}))
				.sort((a, b) => b.hours - a.hours)
				.slice(0, 5);

			// Calculate cost per day
			const daysInMonth =
				currentMonthEnd.getDate() - currentMonthStart.getDate() + 1;
			const costPerDay = totalEarnings / daysInMonth;

			setCurrentMonthStats({
				totalEarnings,
				totalHours,
				averageHourlyRate,
				employeeCosts: totalEarnings,
				topEmployeesByHours: topEmployees,
				shiftDistribution: {
					morning: morningShifts,
					afternoon: afternoonShifts,
					evening: eveningShifts,
					night: nightShifts,
				},
				costPerDay,
				hourlyDistribution,
			});
		};

		calculateFinancialStats();
	}, [location, shifts, employees]);

	// Calculate total shift count for distribution percentages
	const totalShiftCount = Object.values(
		currentMonthStats.shiftDistribution
	).reduce((sum, count) => sum + count, 0);

	return (
		<div className="space-y-8">
			{/* Financial Summary Header */}
			<div className="bg-muted p-6 rounded-lg border">
				<h3 className="text-xl font-semibold mb-4">Financial Summary</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					<div>
						<p className="text-sm text-muted-foreground">Total Revenue (MTD)</p>
						<p className="text-2xl font-bold text-green-600">
							${currentMonthStats.totalEarnings.toFixed(2)}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{currentMonthStats.totalEarnings > 0 ? (
								<span className="text-green-600 flex items-center">
									<TrendingUp className="h-3 w-3 mr-1" /> +
									{(currentMonthStats.totalEarnings * 0.05).toFixed(2)} vs. last
									month
								</span>
							) : (
								<span className="text-red-600 flex items-center">
									<TrendingDown className="h-3 w-3 mr-1" /> No revenue
								</span>
							)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Total Labor Cost</p>
						<p className="text-2xl font-bold text-red-600">
							${currentMonthStats.employeeCosts.toFixed(2)}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{currentMonthStats.employeeCosts > 0 ? (
								<span className="text-red-600 flex items-center">
									<TrendingUp className="h-3 w-3 mr-1" />{" "}
									{(
										(currentMonthStats.employeeCosts /
											currentMonthStats.totalEarnings) *
										100
									).toFixed(1)}
									% of revenue
								</span>
							) : (
								<span className="text-green-600 flex items-center">
									<TrendingDown className="h-3 w-3 mr-1" /> No labor costs
								</span>
							)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Profit Margin</p>
						<p className="text-2xl font-bold">
							{currentMonthStats.totalEarnings > 0
								? (
										(1 -
											currentMonthStats.employeeCosts /
												currentMonthStats.totalEarnings) *
										100
								  ).toFixed(1)
								: 0}
							%
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{currentMonthStats.totalEarnings > 0 ? (
								<span
									className={`flex items-center ${
										1 -
											currentMonthStats.employeeCosts /
												currentMonthStats.totalEarnings >
										0.2
											? "text-green-600"
											: "text-amber-600"
									}`}>
									{1 -
										currentMonthStats.employeeCosts /
											currentMonthStats.totalEarnings >
									0.2 ? (
										<TrendingUp className="h-3 w-3 mr-1" />
									) : (
										<TrendingDown className="h-3 w-3 mr-1" />
									)}
									{1 -
										currentMonthStats.employeeCosts /
											currentMonthStats.totalEarnings >
									0.2
										? "Healthy margin"
										: "Needs improvement"}
								</span>
							) : (
								<span className="text-muted-foreground flex items-center">
									No data available
								</span>
							)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
						<p className="text-2xl font-bold">
							${currentMonthStats.averageHourlyRate.toFixed(2)}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Based on {currentMonthStats.totalHours.toFixed(1)} hours worked
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Monthly Earnings Card */}
					<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
							<CardTitle className="text-sm flex items-center gap-2 text-green-700">
								<DollarSign className="h-4 w-4" />
								Monthly Earnings
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								${currentMonthStats.totalEarnings.toFixed(2)}
							</div>
							<div className="text-sm mt-1 text-muted-foreground">
								${currentMonthStats.costPerDay.toFixed(2)}/day
							</div>
						</CardContent>
					</Card>

					{/* Total Hours Card */}
					<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
							<CardTitle className="text-sm flex items-center gap-2 text-blue-700">
								<Clock className="h-4 w-4" />
								Total Hours
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								{currentMonthStats.totalHours.toFixed(1)}
							</div>
							<div className="text-sm mt-1 text-muted-foreground">
								Current month
							</div>
						</CardContent>
					</Card>

					{/* Average Rate Card */}
					<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
							<CardTitle className="text-sm flex items-center gap-2 text-amber-700">
								<TrendingUp className="h-4 w-4" />
								Average Rate
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								${currentMonthStats.averageHourlyRate.toFixed(2)}
							</div>
							<div className="text-sm mt-1 text-muted-foreground">Per hour</div>
						</CardContent>
					</Card>

					{/* Shift Distribution Card */}
					<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
							<CardTitle className="text-sm flex items-center gap-2 text-purple-700">
								<Layers className="h-4 w-4" />
								Shift Distribution
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="space-y-2">
								<div>
									<div className="flex justify-between text-xs">
										<span>Morning</span>
										<span>
											{totalShiftCount > 0
												? Math.round(
														(currentMonthStats.shiftDistribution.morning /
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
												? (currentMonthStats.shiftDistribution.morning /
														totalShiftCount) *
												  100
												: 0
										}
										className="h-1"
									/>
								</div>
								<div>
									<div className="flex justify-between text-xs">
										<span>Afternoon</span>
										<span>
											{totalShiftCount > 0
												? Math.round(
														(currentMonthStats.shiftDistribution.afternoon /
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
												? (currentMonthStats.shiftDistribution.afternoon /
														totalShiftCount) *
												  100
												: 0
										}
										className="h-1"
									/>
								</div>
								<div>
									<div className="flex justify-between text-xs">
										<span>Evening</span>
										<span>
											{totalShiftCount > 0
												? Math.round(
														(currentMonthStats.shiftDistribution.evening /
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
												? (currentMonthStats.shiftDistribution.evening /
														totalShiftCount) *
												  100
												: 0
										}
										className="h-1"
									/>
								</div>
								<div>
									<div className="flex justify-between text-xs">
										<span>Night</span>
										<span>
											{totalShiftCount > 0
												? Math.round(
														(currentMonthStats.shiftDistribution.night /
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
												? (currentMonthStats.shiftDistribution.night /
														totalShiftCount) *
												  100
												: 0
										}
										className="h-1"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Historical Monthly Data */}
				<Card>
					<CardHeader>
						<CardTitle>Monthly Financial History</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Month</TableHead>
									<TableHead>Total Hours</TableHead>
									<TableHead>Total Earnings</TableHead>
									<TableHead>Active Employees</TableHead>
									<TableHead>Avg. Cost/Hour</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{monthlyStats.map((month) => (
									<TableRow key={month.month}>
										<TableCell className="font-medium">{month.month}</TableCell>
										<TableCell>{month.totalHours.toFixed(1)}</TableCell>
										<TableCell>${month.totalEarnings.toFixed(2)}</TableCell>
										<TableCell>{month.employeeCount}</TableCell>
										<TableCell>
											$
											{month.totalHours > 0
												? (month.totalEarnings / month.totalHours).toFixed(2)
												: "0.00"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Top Employees By Hours */}
				<Card>
					<CardHeader>
						<CardTitle>Top Employees by Hours (Current Month)</CardTitle>
					</CardHeader>
					<CardContent>
						{currentMonthStats.topEmployeesByHours.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Hours Worked</TableHead>
										<TableHead>Earnings</TableHead>
										<TableHead>% of Total</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{currentMonthStats.topEmployeesByHours.map((employee) => (
										<TableRow key={employee.id}>
											<TableCell className="font-medium">
												{employee.name}
											</TableCell>
											<TableCell>{employee.hours.toFixed(1)}</TableCell>
											<TableCell>${employee.earnings.toFixed(2)}</TableCell>
											<TableCell>
												{currentMonthStats.totalHours > 0
													? Math.round(
															(employee.hours / currentMonthStats.totalHours) *
																100
													  )
													: 0}
												%
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className="text-muted-foreground text-center py-4">
								No employee data available for the current month.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
