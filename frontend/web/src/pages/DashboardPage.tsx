import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	CalendarCheck,
	Clock,
	CreditCard,
	CalendarDays,
	Bell,
	Calendar,
	CircleUserRound,
	FileText,
	Check,
	Clock10,
	MapPin,
	Coffee,
	ChevronsUp,
	ChevronLeft,
	ExternalLink,
	BarChart,
	Building2,
	ShieldCheck,
	Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ShiftsAPI, EmployeesAPI, LocationsAPI } from "@/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Shift, Employee, Location, Schedule } from "../api/types";
import { format, addDays } from "date-fns";
import { FormulaExplainer } from "@/components/ui/formula-explainer";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { useOrganization } from "@/lib/organization";
import { useHeader } from "@/lib/header-context";

export default function DashboardPage() {
	const { user } = useAuth();
	const { updateHeader } = useHeader();
	const { getCurrentOrganizationId, isLoading: isOrgLoading } =
		useOrganization();
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

	// Update header
	useEffect(() => {
		if (isLoading) {
			updateHeader({
				title: "Dashboard",
				description: "Loading your personal dashboard",
			});
		} else {
			updateHeader({
				title: "Dashboard",
				description: `Welcome back, ${
					user?.user_metadata?.firstName || "Employee"
				}`,
			});
		}
	}, [isLoading, user, updateHeader]);

	useEffect(() => {
		const fetchEmployeeData = async () => {
			setIsLoading(true);
			try {
				// Get the current user's ID from auth
				const userId = user?.id;
				if (!userId) {
					console.error("No user ID available");
					setIsLoading(false);
					return;
				}

				// Get organization ID from context
				const organizationId = getCurrentOrganizationId();

				// Wait for organization ID to be available
				if (isOrgLoading || !organizationId) {
					console.log("Dashboard: Waiting for organization ID...");
					if (!isOrgLoading) setIsLoading(false);
					return;
				}

				console.log(
					`Dashboard: Fetching data for org ${organizationId} and user ${userId}`
				);

				// First get the employee record for the current user
				const employees = await EmployeesAPI.getAll(organizationId);
				const employeeData = employees.find((emp) => emp.email === user.email);

				if (!employeeData) {
					console.error("No employee record found for current user");
					return;
				}

				// Fetch data in parallel
				const [locationList, schedules] = await Promise.all([
					LocationsAPI.getAll(organizationId),
					ShiftsAPI.getAllSchedules(organizationId),
				]);

				setEmployee(employeeData);
				setLocations(locationList);

				// Get shifts for each schedule
				const shiftsPromises = schedules.map((schedule: Schedule) =>
					ShiftsAPI.getShiftsForSchedule(schedule.id)
				);
				const shiftsArrays = await Promise.all(shiftsPromises);
				const allShifts = shiftsArrays.flat();

				// Filter shifts for current employee
				const myShifts = allShifts.filter(
					(shift: Shift) => shift.user_id === employeeData.id
				);

				// Today's date
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				// Filter today's shifts
				const todayShifts = myShifts.filter((shift: Shift) => {
					const shiftDate = new Date(shift.start_time);
					shiftDate.setHours(0, 0, 0, 0);
					return shiftDate.getTime() === today.getTime();
				});

				// Filter upcoming shifts (not including today)
				const upcoming = myShifts
					.filter((shift: Shift) => {
						const shiftDate = new Date(shift.start_time);
						shiftDate.setHours(0, 0, 0, 0);
						return shiftDate > today;
					})
					.sort(
						(a: Shift, b: Shift) =>
							new Date(a.start_time).getTime() -
							new Date(b.start_time).getTime()
					);

				setMyShifts(todayShifts);
				setUpcomingShifts(upcoming);

				// Calculate personal metrics
				const hoursThisWeek = calculateHoursWorked(myShifts, 0);
				const hoursLastWeek = calculateHoursWorked(myShifts, -7);

				const hourlyRate = employeeData?.hourlyRate || 0;

				// Calculate breaks remaining for current shift
				const currentShift = todayShifts.find((shift) => {
					const now = new Date();
					const start = new Date(shift.start_time);
					const end = new Date(shift.end_time);
					return now >= start && now <= end;
				});

				// For now, we'll calculate breaks based on shift duration
				// In the future, this should come from the backend
				const breaksRemaining = currentShift
					? Math.floor(
							(new Date(currentShift.end_time).getTime() -
								new Date(currentShift.start_time).getTime()) /
								(1000 * 60 * 60 * 4)
					  )
					: 0;

				setPersonalStats({
					hoursThisWeek,
					hoursLastWeek,
					earningsThisWeek: hoursThisWeek * hourlyRate,
					earningsLastWeek: hoursLastWeek * hourlyRate,
					shiftsCompleted: myShifts.filter(
						(shift: Shift) => new Date(shift.end_time) < today
					).length,
					shiftsUpcoming: upcoming.length,
					breaksRemaining,
					timeOffRequests: 0, // This will be implemented when we add time-off request functionality
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
	}, [user]);

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
			<ContentContainer>
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<p className="text-sm text-muted-foreground">
							Loading dashboard data...
						</p>
					</div>
				</div>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			{/* Personalized greeting */}
			<ContentSection
				title={`${getGreeting()}, ${employee?.name || "there"}!`}
				description={
					isWorkingToday
						? "You have shifts scheduled today."
						: nextShift
						? `Your next shift is on ${format(
								new Date(nextShift.start_time),
								"EEEE, MMMM d"
						  )}`
						: "You have no upcoming shifts."
				}
				flat>
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
												<div>
													<Link
														to={`/shifts/${shift.id}`}
														className="font-medium hover:underline">
														{locations.find(
															(loc) => loc.id === shift.location_id
														)?.name || "Unknown location"}
													</Link>
													<p className="text-xs text-muted-foreground">
														{formatShiftTime(shift)}
													</p>
												</div>
												<Link to={`/shifts/${shift.id}`}>
													<Button
														variant="outline"
														size="sm"
														className="h-8 px-2">
														View Details
													</Button>
												</Link>
											</div>
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
			</ContentSection>

			{/* My metrics */}
			<ContentSection
				title="My Stats"
				description="Your current performance metrics"
				flat>
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
			</ContentSection>

			{/* Quick actions for employees */}
			<ContentSection
				title="Quick Actions"
				description="Shortcuts to common tasks"
				flat>
				<div className="flex flex-wrap gap-3 mb-6">
					<Link to="/manage-shifts">
						<Button variant="outline">
							<Calendar className="h-4 w-4 mr-2" />
							My Schedule
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
			</ContentSection>

			{/* My upcoming shifts */}
			<ContentSection
				title="My Upcoming Shifts"
				description="Your next 7 days"
				headerActions={
					<Link to="/manage-shifts">
						<Button
							variant="outline"
							size="sm">
							View All
						</Button>
					</Link>
				}
				flat>
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
														{locations.find(
															(loc) => loc.id === shift.location_id
														)?.name || "Unknown location"}
													</h3>
													<p className="text-sm text-muted-foreground">
														{format(new Date(shift.start_time), "h:mm a")} -{" "}
														{format(new Date(shift.end_time), "h:mm a")}
													</p>
												</div>
												<div>
													<Link to={`/shifts/${shift.id}`}>
														<Button
															variant="outline"
															size="sm"
															className="border-blue-200 text-blue-700 hover:bg-blue-50">
															Details
														</Button>
													</Link>
												</div>
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
			{/* Time off requests section removed until functionality is implemented */}
		</ContentContainer>
	);
}
