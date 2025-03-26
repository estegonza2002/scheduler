import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	CalendarCheck,
	Clock,
	CreditCard,
	CalendarDays,
	Bell,
	Calendar,
	MessageSquare,
	CircleUserRound,
	FileText,
	Check,
	Clock10,
	MapPin,
	Coffee,
	ChevronsUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ShiftsAPI, EmployeesAPI, LocationsAPI } from "../api";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { EmptyState } from "../components/ui/empty-state";
import { Shift, Employee, Location } from "../api/mock/types";
import { format, addDays } from "date-fns";
import { FormulaExplainer } from "../components/ui/formula-explainer";
import { PageHeader } from "../components/ui/page-header";
import { LoadingState } from "../components/ui/loading-state";

export default function DashboardPage() {
	const { user } = useAuth();
	const [myShifts, setMyShifts] = useState<Shift[]>([]);
	const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Personal metrics
	const [personalStats, setPersonalStats] = useState({
		hoursThisWeek: 0,
		hoursLastWeek: 0,
		earningsThisWeek: 0,
		earningsLastWeek: 0,
		shiftsCompleted: 0,
		shiftsUpcoming: 0,
		breaksRemaining: 0,
		timeOffRequests: 0,
	});

	useEffect(() => {
		const fetchEmployeeData = async () => {
			setIsLoading(true);
			try {
				// For the purpose of the demo, we'll use a hardcoded employee ID
				// In a real app, we would get this from the logged in user
				const employeeId = "emp-1";
				const organizationId = "org-1";

				// Fetch data in parallel
				const [employeeData, locationList, schedules] = await Promise.all([
					EmployeesAPI.getById(employeeId),
					LocationsAPI.getAll(organizationId),
					ShiftsAPI.getAllSchedules(organizationId),
				]);

				if (employeeData) {
					setEmployee(employeeData);
				}

				setLocations(locationList);

				// Get shifts for each schedule
				const shiftsPromises = schedules.map((schedule) =>
					ShiftsAPI.getShiftsForSchedule(schedule.id)
				);
				const shiftsArrays = await Promise.all(shiftsPromises);
				const allShifts = shiftsArrays.flat();

				// Filter shifts for current employee
				const myShifts = allShifts.filter(
					(shift) => shift.user_id === employeeId
				);

				// Today's date
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				// Filter today's shifts
				const todayShifts = myShifts.filter((shift) => {
					const shiftDate = new Date(shift.start_time);
					shiftDate.setHours(0, 0, 0, 0);
					return shiftDate.getTime() === today.getTime();
				});

				// Filter upcoming shifts (not including today)
				const upcoming = myShifts
					.filter((shift) => {
						const shiftDate = new Date(shift.start_time);
						shiftDate.setHours(0, 0, 0, 0);
						return shiftDate > today;
					})
					.sort(
						(a, b) =>
							new Date(a.start_time).getTime() -
							new Date(b.start_time).getTime()
					);

				setMyShifts(todayShifts);
				setUpcomingShifts(upcoming);

				// Calculate personal metrics
				const hoursThisWeek = calculateHoursWorked(myShifts, 0);
				const hoursLastWeek = calculateHoursWorked(myShifts, -7);

				const hourlyRate = employeeData?.hourlyRate || 15;

				setPersonalStats({
					hoursThisWeek,
					hoursLastWeek,
					earningsThisWeek: hoursThisWeek * hourlyRate,
					earningsLastWeek: hoursLastWeek * hourlyRate,
					shiftsCompleted: myShifts.filter(
						(shift) => new Date(shift.end_time) < today
					).length,
					shiftsUpcoming: upcoming.length,
					breaksRemaining: 2, // Mock data
					timeOffRequests: 1, // Mock data
				});
			} catch (error) {
				console.error("Error fetching employee data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		// Helper function to calculate hours worked in a week
		const calculateHoursWorked = (shifts: Shift[], dayOffset: number) => {
			const today = new Date();
			const startOfWeek = new Date(today);
			startOfWeek.setDate(today.getDate() - today.getDay() + dayOffset);
			startOfWeek.setHours(0, 0, 0, 0);

			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);

			let totalHours = 0;

			shifts.forEach((shift) => {
				const shiftStart = new Date(shift.start_time);
				const shiftEnd = new Date(shift.end_time);

				if (shiftStart >= startOfWeek && shiftEnd <= endOfWeek) {
					// Full shift is within the week
					totalHours +=
						(shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
				} else if (shiftStart <= endOfWeek && shiftEnd >= startOfWeek) {
					// Partial shift is within the week
					const effectiveStart =
						shiftStart < startOfWeek ? startOfWeek : shiftStart;
					const effectiveEnd = shiftEnd > endOfWeek ? endOfWeek : shiftEnd;
					totalHours +=
						(effectiveEnd.getTime() - effectiveStart.getTime()) /
						(1000 * 60 * 60);
				}
			});

			return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
		};

		fetchEmployeeData();
	}, []);

	const formatShiftTime = (shift: Shift) => {
		const start = new Date(shift.start_time);
		const end = new Date(shift.end_time);
		return `${start.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})} - ${end.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	};

	// Determine if the employee is scheduled to work today
	const isWorkingToday = myShifts.length > 0;

	// Get the next shift (either today or upcoming)
	const nextShift = isWorkingToday
		? myShifts[0]
		: upcomingShifts.length > 0
		? upcomingShifts[0]
		: null;

	// Determine the greeting based on time of day
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	if (isLoading) {
		return (
			<>
				<PageHeader
					title="Dashboard"
					description="Loading your personal dashboard"
				/>
				<ContentContainer>
					<LoadingState
						type="spinner"
						message="Loading dashboard data..."
						className="py-12"
					/>
				</ContentContainer>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Dashboard"
				description={`Welcome back, ${
					user?.user_metadata?.firstName || "Employee"
				}`}
			/>
			<ContentContainer>
				{/* Personalized greeting */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold">
						{getGreeting()}, {employee?.name || "there"}!
					</h1>
					<p className="text-muted-foreground">
						{isWorkingToday
							? "You have shifts scheduled today."
							: nextShift
							? `Your next shift is on ${format(
									new Date(nextShift.start_time),
									"EEEE, MMMM d"
							  )}`
							: "You have no upcoming shifts."}
					</p>
				</div>

				{/* Today's shift status card */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center">
							{isWorkingToday ? (
								<Clock className="h-5 w-5 mr-2" />
							) : (
								<CalendarDays className="h-5 w-5 mr-2" />
							)}
							{isWorkingToday
								? "You're scheduled to work today"
								: "You're not scheduled to work today"}
						</CardTitle>
					</CardHeader>
					<CardContent className="px-6 py-4">
						<div className="flex flex-col">
							{isWorkingToday && myShifts.length > 0 && (
								<div className="space-y-3">
									{myShifts.map((shift, index) => (
										<div
											key={shift.id}
											className="flex flex-col p-3 rounded-md bg-muted">
											<div className="flex justify-between items-center">
												<p className="text-sm font-medium">
													{formatShiftTime(shift)} at{" "}
													{locations.find((l) => l.id === shift.location_id)
														?.name || "Unknown location"}
												</p>
												<Link to={`/shifts/${shift.id}`}>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 px-2">
														View Details
													</Button>
												</Link>
											</div>
											{shift.position && (
												<p className="text-xs mt-1">
													<span className="inline-flex items-center bg-muted/80 px-2 py-0.5 rounded">
														{shift.position}
													</span>
												</p>
											)}
										</div>
									))}
									<div className="mt-2">
										<Button
											variant="outline"
											size="sm">
											<Clock className="h-3 w-3 mr-2" />
											Clock In
										</Button>
									</div>
								</div>
							)}
							{!isWorkingToday && nextShift && (
								<p className="text-sm mt-1">
									Your next shift is on{" "}
									<strong>
										{format(new Date(nextShift.start_time), "EEEE, MMMM d")}
									</strong>{" "}
									at {format(new Date(nextShift.start_time), "h:mm a")}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* My metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					{/* Hours this week */}
					<Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-blue-50 to-transparent">
							<CardTitle className="text-sm flex items-center justify-between text-blue-700">
								<span className="flex items-center gap-2">
									<Clock className="h-4 w-4" />
									My Hours
								</span>
								<FormulaExplainer
									formula="Hours This Week = Σ(End Time - Start Time) for all shifts in current week"
									description="Sum of all hours worked or scheduled to work in the current week, calculated from the difference between shift end and start times."
									example="If you worked shifts of 4 hours on Monday, 6 hours on Wednesday, and 5 hours on Friday, your total hours for the week would be 4 + 6 + 5 = 15 hours."
									variantColor="blue"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								{personalStats.hoursThisWeek}
							</div>
						</CardContent>
					</Card>

					{/* Earnings */}
					<Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-50 to-transparent">
							<CardTitle className="text-sm flex items-center justify-between text-green-700">
								<span className="flex items-center gap-2">
									<CreditCard className="h-4 w-4" />
									My Earnings
								</span>
								<FormulaExplainer
									formula="Earnings This Week = Hours This Week × Hourly Rate"
									description="Total earnings for the current week, calculated by multiplying your worked hours by your hourly rate."
									example="If you worked 15 hours this week with an hourly rate of $20, your earnings would be 15 × $20 = $300."
									variables={[
										{
											name: "Hours This Week",
											description:
												"Total hours worked or scheduled in the current week",
										},
										{
											name: "Hourly Rate",
											description: "Your hourly compensation rate",
										},
									]}
									variantColor="green"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								${personalStats.earningsThisWeek}
							</div>
						</CardContent>
					</Card>

					{/* Shifts */}
					<Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-purple-50 to-transparent">
							<CardTitle className="text-sm flex items-center justify-between text-purple-700">
								<span className="flex items-center gap-2">
									<CalendarCheck className="h-4 w-4" />
									My Shifts
								</span>
								<FormulaExplainer
									formula="Upcoming Shifts = Count(Shifts where Start Time > Current Time)"
									description="The total number of shifts scheduled for you that haven't started yet."
									example="If today is Monday and you have shifts scheduled for Tuesday, Wednesday, and Friday, your upcoming shifts count would be 3."
									variantColor="purple"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								{personalStats.shiftsUpcoming}
							</div>
						</CardContent>
					</Card>

					{/* Breaks */}
					<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
						<CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-amber-50 to-transparent">
							<CardTitle className="text-sm flex items-center justify-between text-amber-700">
								<span className="flex items-center gap-2">
									<Coffee className="h-4 w-4" />
									My Breaks
								</span>
								<FormulaExplainer
									formula="Breaks = Allocated Breaks - Taken Breaks"
									description="The number of breaks you are still entitled to take for your current shift."
									example="If your 8-hour shift allows for 2 breaks and you've taken 1, you have 1 break remaining."
									variantColor="amber"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-4 pb-4">
							<div className="text-2xl font-bold">
								{personalStats.breaksRemaining}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quick actions for employees */}
				<div className="flex flex-wrap gap-3 mb-6 mt-6">
					<Link to="/schedule">
						<Button variant="outline">
							<Calendar className="h-4 w-4 mr-2" />
							My Schedule
						</Button>
					</Link>

					<Link to="/messages">
						<Button variant="outline">
							<MessageSquare className="h-4 w-4 mr-2" />
							My Messages
						</Button>
					</Link>

					<Link to="/profile">
						<Button variant="outline">
							<CircleUserRound className="h-4 w-4 mr-2" />
							My Profile
						</Button>
					</Link>

					<Link to="/notifications">
						<Button variant="outline">
							<Bell className="h-4 w-4 mr-2" />
							My Notifications
						</Button>
					</Link>

					<Button variant="outline">
						<FileText className="h-4 w-4 mr-2" />
						Request Time Off
					</Button>
				</div>

				{/* My upcoming shifts */}
				<ContentSection
					title="My Upcoming Shifts"
					description="Your next 7 days"
					headerActions={
						<Link to="/schedule">
							<Button
								variant="outline"
								size="sm">
								View All
							</Button>
						</Link>
					}>
					{upcomingShifts.length > 0 ? (
						<div className="space-y-4">
							{upcomingShifts.slice(0, 5).map((shift) => {
								const shiftDate = new Date(shift.start_time);
								return (
									<Card
										key={shift.id}
										className="overflow-hidden border-2 border-blue-100 hover:border-blue-200 transition-colors">
										<div className="flex">
											<div className="bg-blue-50 text-blue-700 p-4 flex flex-col items-center justify-center w-24">
												<span className="text-sm font-medium">
													{format(shiftDate, "EEE")}
												</span>
												<span className="text-xl font-bold">
													{format(shiftDate, "d")}
												</span>
												<span className="text-sm">
													{format(shiftDate, "MMM")}
												</span>
											</div>
											<CardContent className="p-4 flex-1">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="font-medium text-blue-700">
															{locations.find((l) => l.id === shift.location_id)
																?.name || "Unknown location"}
														</h3>
														<p className="text-sm text-muted-foreground">
															{format(new Date(shift.start_time), "h:mm a")} -{" "}
															{format(new Date(shift.end_time), "h:mm a")}
														</p>
														{shift.position && (
															<p className="text-xs mt-1 inline-flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
																{shift.position}
															</p>
														)}
													</div>
													<Link to={`/shifts/${shift.id}`}>
														<Button
															variant="outline"
															size="sm"
															className="border-blue-200 text-blue-700 hover:bg-blue-50">
															Details
														</Button>
													</Link>
												</div>
											</CardContent>
										</div>
									</Card>
								);
							})}
						</div>
					) : (
						<EmptyState
							title="No upcoming shifts"
							description="When you're assigned shifts, they will appear here."
							size="small"
						/>
					)}
				</ContentSection>

				{/* Notifications and alerts for employee */}
				{personalStats.timeOffRequests > 0 && (
					<Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors mb-6">
						<CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-transparent">
							<CardTitle className="text-sm flex items-center text-amber-700">
								<Bell className="h-4 w-4 mr-2" />
								Pending Requests
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2 px-6 pb-4">
							<div className="flex items-start gap-3">
								<div>
									<p className="text-sm text-amber-700">
										You have <strong>{personalStats.timeOffRequests}</strong>{" "}
										pending time-off request awaiting approval.
									</p>
									<div className="mt-3">
										<Button
											size="sm"
											variant="outline"
											className="border-amber-300 text-amber-700 hover:bg-amber-100">
											View Request
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</ContentContainer>
		</>
	);
}
