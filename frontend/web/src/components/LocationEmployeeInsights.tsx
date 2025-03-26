import { useState, useEffect } from "react";
import { Location, Shift, Employee } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { calculateHours } from "../utils/time-calculations";
import { FormulaExplainer } from "./ui/formula-explainer";
import {
	Calendar,
	Clock,
	UserCheck,
	Users,
	Star,
	AlertTriangle,
	Award,
	CakeSlice,
} from "lucide-react";
import {
	parseISO,
	format,
	differenceInDays,
	isBefore,
	isAfter,
	differenceInMonths,
} from "date-fns";

interface LocationEmployeeInsightsProps {
	location: Location;
	shifts: Shift[];
	employees: Employee[];
}

export function LocationEmployeeInsights({
	location,
	shifts,
	employees,
}: LocationEmployeeInsightsProps) {
	const [stats, setStats] = useState({
		totalEmployees: 0,
		avgReliabilityRate: 0,
		topPerformerCount: 0,
		avgTenureMonths: 0,
	});

	useEffect(() => {
		// Calculate employee insights
		const calculateEmployeeInsights = () => {
			const now = new Date();

			// Skip if no employees
			if (employees.length === 0) {
				return;
			}

			// Calculate metrics for each employee
			const employeeMetrics = employees.map((employee) => {
				// Filter shifts for this employee
				const employeeShifts = shifts.filter(
					(shift) => shift.user_id === employee.id
				);

				// Calculate total shifts completed
				const completedShifts = employeeShifts.filter(
					(shift) =>
						isBefore(parseISO(shift.end_time), now) &&
						shift.status === "completed"
				).length;

				// Calculate reliability score (completed shifts / scheduled shifts that have passed)
				const pastShifts = employeeShifts.filter((shift) =>
					isBefore(parseISO(shift.end_time), now)
				).length;

				const reliability =
					pastShifts > 0 ? (completedShifts / pastShifts) * 100 : 100;

				// Calculate tenure in months (if hire date available)
				let tenureMonths = 0;
				if (employee.hireDate) {
					tenureMonths = differenceInMonths(now, parseISO(employee.hireDate));
				}

				return {
					employee,
					metrics: {
						reliability,
						tenureMonths,
					},
				};
			});

			// Calculate average reliability rate
			const totalReliability = employeeMetrics.reduce(
				(sum, { metrics }) => sum + metrics.reliability,
				0
			);
			const avgReliabilityRate = totalReliability / employees.length;

			// Calculate average tenure in months
			const totalTenure = employeeMetrics.reduce(
				(sum, { metrics }) => sum + metrics.tenureMonths,
				0
			);
			const avgTenureMonths = totalTenure / employees.length;

			// Count high performers (90%+ reliability)
			const topPerformerCount = employeeMetrics.filter(
				({ metrics }) => metrics.reliability >= 90
			).length;

			setStats({
				totalEmployees: employees.length,
				avgReliabilityRate,
				topPerformerCount,
				avgTenureMonths,
			});
		};

		calculateEmployeeInsights();
	}, [location, shifts, employees]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Employees Card */}
				<Card className="border-2 border-indigo-100 hover:border-indigo-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-indigo-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-indigo-700">
							<span className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Total Employees
							</span>
							<FormulaExplainer
								formula="Total Employees = Count(Employees assigned to location)"
								description="The total number of employees that have been assigned to this location in the system."
								example="If 25 employees are assigned to the New York location in the system, Total Employees = 25."
								variantColor="indigo"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">{stats.totalEmployees}</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Assigned to this location
						</div>
					</CardContent>
				</Card>

				{/* Reliability Rate Card */}
				<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-green-700">
							<span className="flex items-center gap-2">
								<UserCheck className="h-4 w-4" />
								Reliability Rate
							</span>
							<FormulaExplainer
								formula="Reliability Rate = (Total Completed Shifts / Total Past Shifts) × 100%"
								description="The percentage of past shifts that were successfully completed by employees. This metric measures how dependable your workforce is at this location."
								example="If there were 150 scheduled shifts that have already passed, and 135 of them were successfully completed, Reliability Rate = (135 / 150) × 100% = 90%."
								variables={[
									{
										name: "Total Completed Shifts",
										description:
											"Number of shifts that were successfully completed.",
									},
									{
										name: "Total Past Shifts",
										description:
											"Number of shifts that have already passed (including completed, missed, and canceled).",
									},
								]}
								variantColor="green"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.avgReliabilityRate.toFixed(1)}%
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Average across all employees
						</div>
					</CardContent>
				</Card>

				{/* Top Performers Card */}
				<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-amber-700">
							<span className="flex items-center gap-2">
								<Star className="h-4 w-4" />
								Top Performers
							</span>
							<FormulaExplainer
								formula="Top Performers = Count(Employees with Reliability Rate ≥ 90%)"
								description="The number of employees with reliability rates of 90% or higher. This helps identify your most dependable staff members."
								example="If 8 out of 20 employees have reliability rates at or above 90%, Top Performers = 8."
								variantColor="amber"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">{stats.topPerformerCount}</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Employees with 90%+ reliability
						</div>
					</CardContent>
				</Card>

				{/* Average Tenure Card */}
				<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
					<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
						<CardTitle className="text-sm flex items-center justify-between text-blue-700">
							<span className="flex items-center gap-2">
								<CakeSlice className="h-4 w-4" />
								Average Tenure
							</span>
							<FormulaExplainer
								formula="Average Tenure = Σ(Months since hire date) / Total Employees"
								description="The average length of time, in months, that employees have been with the company. This helps track staff retention and experience levels."
								example="If you have 5 employees with tenures of 3, 6, 12, 18, and 24 months, Average Tenure = (3 + 6 + 12 + 18 + 24) / 5 = 12.6 months."
								variantColor="blue"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-2 px-4 pb-4">
						<div className="text-2xl font-bold">
							{stats.avgTenureMonths.toFixed(1)}
						</div>
						<div className="text-sm mt-1 text-muted-foreground">
							Months with the company
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
