import { Shift, ShiftTask } from "../../api";
import { AssignedEmployee } from "../../types/shift-types";
import { calculateHours } from "../../utils/time-calculations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { format, parseISO } from "date-fns";
import { CircleCheck, Clock, ClipboardCheck, Frown, Users } from "lucide-react";

interface ShiftReportProps {
	shift: Shift;
	assignedEmployees: AssignedEmployee[];
}

export function ShiftReport({ shift, assignedEmployees }: ShiftReportProps) {
	// Calculate metrics
	const scheduledHours = parseFloat(
		calculateHours(shift.start_time, shift.end_time)
	);

	// Calculate actual hours (in a real app, this would come from check-in/out data)
	// For now, let's just use the scheduled hours and add some fictional variance
	const actualHours = scheduledHours + (Math.random() > 0.5 ? 0.5 : -0.25);
	const hoursVariance = actualHours - scheduledHours;

	// Calculate task completion rates
	const totalCheckInTasks = shift.check_in_tasks?.length || 0;
	const completedCheckInTasks =
		shift.check_in_tasks?.filter((task) => task.completed).length || 0;
	const checkInCompletionRate =
		totalCheckInTasks === 0
			? 100
			: Math.round((completedCheckInTasks / totalCheckInTasks) * 100);

	const totalCheckOutTasks = shift.check_out_tasks?.length || 0;
	const completedCheckOutTasks =
		shift.check_out_tasks?.filter((task) => task.completed).length || 0;
	const checkOutCompletionRate =
		totalCheckOutTasks === 0
			? 100
			: Math.round((completedCheckOutTasks / totalCheckOutTasks) * 100);

	const totalTasks = totalCheckInTasks + totalCheckOutTasks;
	const completedTasks = completedCheckInTasks + completedCheckOutTasks;
	const overallCompletionRate =
		totalTasks === 0 ? 100 : Math.round((completedTasks / totalTasks) * 100);

	// Calculate attendance
	const scheduledEmployees = assignedEmployees.length;
	// For demo, let's assume a random number of employees actually showed up
	const presentEmployees =
		assignedEmployees.length > 0
			? Math.max(1, assignedEmployees.length - (Math.random() > 0.8 ? 1 : 0))
			: 0;
	const attendanceRate =
		scheduledEmployees === 0
			? 100
			: Math.round((presentEmployees / scheduledEmployees) * 100);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Shift Report</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Hours Card */}
						<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
							<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
								<CardTitle className="text-sm flex items-center gap-2 text-blue-700">
									<Clock className="h-4 w-4" />
									Hours
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-2 px-4 pb-4">
								<div className="text-2xl font-bold">
									{actualHours.toFixed(1)}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										/ {scheduledHours.toFixed(1)}
									</span>
								</div>
								<div
									className={`text-sm mt-1 ${
										hoursVariance > 0
											? "text-red-600"
											: hoursVariance < 0
											? "text-orange-600"
											: "text-green-600"
									}`}>
									{hoursVariance > 0 ? "+" : ""}
									{hoursVariance.toFixed(1)} hours variance
								</div>
							</CardContent>
						</Card>

						{/* Task Completion Card */}
						<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
							<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
								<CardTitle className="text-sm flex items-center gap-2 text-green-700">
									<ClipboardCheck className="h-4 w-4" />
									Task Completion
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-2 px-4 pb-4">
								<div className="text-2xl font-bold">
									{completedTasks}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										/ {totalTasks}
									</span>
								</div>
								<div className="mt-2">
									<Progress
										value={overallCompletionRate}
										className="h-2"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										{overallCompletionRate}% complete
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Attendance Card */}
						<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
							<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
								<CardTitle className="text-sm flex items-center gap-2 text-purple-700">
									<Users className="h-4 w-4" />
									Attendance
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-2 px-4 pb-4">
								<div className="text-2xl font-bold">
									{presentEmployees}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										/ {scheduledEmployees}
									</span>
								</div>
								<div className="mt-2">
									<Progress
										value={attendanceRate}
										className="h-2"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										{attendanceRate}% present
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Check-in/out Tasks Card */}
						<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
							<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
								<CardTitle className="text-sm flex items-center gap-2 text-amber-700">
									<CircleCheck className="h-4 w-4" />
									Check-in/out
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-2 px-4 pb-4">
								<div className="space-y-2">
									<div>
										<div className="flex justify-between text-sm">
											<span>Check-in</span>
											<span className="font-medium">
												{checkInCompletionRate}%
											</span>
										</div>
										<Progress
											value={checkInCompletionRate}
											className="h-2"
										/>
									</div>
									<div>
										<div className="flex justify-between text-sm">
											<span>Check-out</span>
											<span className="font-medium">
												{checkOutCompletionRate}%
											</span>
										</div>
										<Progress
											value={checkOutCompletionRate}
											className="h-2"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{/* Additional reports could be added here */}
		</div>
	);
}
