import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	format,
	parseISO,
	isWithinInterval,
	startOfDay,
	endOfDay,
	addMonths,
	startOfMonth,
	endOfMonth,
} from "date-fns";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Separator } from "../components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { exportToCSV, exportToExcel } from "../utils/export-utils";
import { ExportDropdown } from "../components/ExportDropdown";
import { calculateHours } from "../utils/time-calculations";
import {
	Employee,
	EmployeesAPI,
	Shift,
	ShiftsAPI,
	Location,
	LocationsAPI,
} from "../api";
import { LoadingState } from "../components/ui/loading-state";
import {
	ChevronLeft,
	DollarSign,
	Calendar as CalendarIcon,
	Clock,
	ArrowDownUp,
	Download,
	ClipboardList,
	TrendingUp,
	BarChart3,
	BarChart,
	FileText,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/page-header";
import { PageContentSpacing } from "../components/ui/header-content-spacing";

// Types for report data
interface EarningsReportItem {
	date: string;
	shiftId: string;
	startTime: string;
	endTime: string;
	hours: number;
	actualHours: number | null;
	hourlyRate: number;
	earnings: number;
	actualEarnings: number | null;
	locationName: string;
	status: string;
}

interface DateRange {
	from?: Date;
	to?: Date;
}

// Define a component for the date range picker that will be used in the page header
const DateRangePickerComponent = () => {
	return (
		<div className="flex space-x-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"justify-start text-left font-normal",
							!dateRange.from && "text-muted-foreground"
						)}>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{dateRange.from ? (
							dateRange.to ? (
								<>
									{format(dateRange.from, "LLL dd, y")} -{" "}
									{format(dateRange.to, "LLL dd, y")}
								</>
							) : (
								format(dateRange.from, "LLL dd, y")
							)
						) : (
							<span>Select date range</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={dateRange.from}
						selected={dateRange}
						onSelect={setDateRange}
						numberOfMonths={2}
					/>
					<div className="flex items-center justify-between p-3 border-t">
						<TabsList>
							<TabsTrigger
								value="current-month"
								onClick={() => handleDatePresetChange("current-month")}>
								This Month
							</TabsTrigger>
							<TabsTrigger
								value="previous-month"
								onClick={() => handleDatePresetChange("previous-month")}>
								Last Month
							</TabsTrigger>
							<TabsTrigger
								value="year-to-date"
								onClick={() => handleDatePresetChange("year-to-date")}>
								Year to Date
							</TabsTrigger>
						</TabsList>
					</div>
				</PopoverContent>
			</Popover>
			<ExportDropdown onExport={handleExportReport} />
		</div>
	);
};

export default function EmployeeEarningsPage() {
	const { employeeId } = useParams();
	const navigate = useNavigate();

	// State variables
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [loading, setLoading] = useState(true);
	const [reportData, setReportData] = useState<EarningsReportItem[]>([]);
	const [dateRange, setDateRange] = useState<DateRange>({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	});
	const [activeTab, setActiveTab] = useState("current-month");

	// Fetch employee and data
	useEffect(() => {
		if (!employeeId) return;

		const fetchData = async () => {
			try {
				setLoading(true);

				// Fetch employee
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (employeeData) {
					setEmployee(employeeData);
				}

				// Fetch all shifts
				const allShifts = await ShiftsAPI.getAll();

				// Filter for this employee's shifts
				const employeeShifts = allShifts.filter(
					(shift) => shift.user_id === employeeId
				);
				setShifts(employeeShifts);

				// Get all locations used in shifts
				const locationIds = new Set<string>();
				employeeShifts.forEach((shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
					}
				});

				// Fetch location details
				const locationsMap: Record<string, Location> = {};
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Failed to load employee earnings data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [employeeId]);

	// Generate report data when shifts, employee, or date range changes
	useEffect(() => {
		if (!employee || !shifts.length) return;

		const generateReportData = () => {
			const filteredShifts = shifts.filter((shift) => {
				// Skip shifts without end time or canceled shifts
				if (!shift.end_time || shift.status === "canceled") return false;

				// Apply date range filter if set
				if (dateRange.from || dateRange.to) {
					const shiftDate = parseISO(shift.start_time);

					if (dateRange.from && dateRange.to) {
						return isWithinInterval(shiftDate, {
							start: startOfDay(dateRange.from),
							end: endOfDay(dateRange.to),
						});
					} else if (dateRange.from) {
						return shiftDate >= startOfDay(dateRange.from);
					} else if (dateRange.to) {
						return shiftDate <= endOfDay(dateRange.to);
					}
				}

				return true;
			});

			// Transform shifts into earnings report data
			const data: EarningsReportItem[] = filteredShifts.map((shift) => {
				const hours = parseFloat(
					calculateHours(shift.start_time, shift.end_time)
				);
				const hourlyRate = employee?.hourlyRate || 0;
				const earnings = hours * hourlyRate;

				// Get actual hours if available (from check-in/check-out data)
				// In a real system, this would come from actual clock records
				// For this example, we'll simulate some variance from the scheduled hours
				let actualHours = null;
				let actualEarnings = null;

				if (shift.status === "completed") {
					// Simulate actual hours with slight variation from scheduled
					// In a real app, this would come from check-in/check-out records
					const variance =
						Math.random() > 0.5
							? Math.random() * 0.5 // up to 30 min more
							: -Math.random() * 0.25; // up to 15 min less

					actualHours = Math.max(0, hours + variance);
					actualEarnings = actualHours * hourlyRate;
				}

				const locationName = shift.location_id
					? locations[shift.location_id]?.name || "Unknown Location"
					: "Unassigned";

				return {
					date: format(parseISO(shift.start_time), "yyyy-MM-dd"),
					shiftId: shift.id,
					startTime: shift.start_time,
					endTime: shift.end_time,
					hours,
					actualHours,
					hourlyRate,
					earnings,
					actualEarnings,
					locationName,
					status: shift.status || "completed",
				};
			});

			// Sort by date (newest first)
			data.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			);

			setReportData(data);
		};

		generateReportData();
	}, [shifts, employee, dateRange, locations]);

	// Handle date preset selection
	const handleDatePresetChange = (preset: string) => {
		const today = new Date();

		switch (preset) {
			case "current-month":
				setDateRange({
					from: startOfMonth(today),
					to: endOfMonth(today),
				});
				break;
			case "previous-month":
				const prevMonth = addMonths(today, -1);
				setDateRange({
					from: startOfMonth(prevMonth),
					to: endOfMonth(prevMonth),
				});
				break;
			case "year-to-date":
				setDateRange({
					from: new Date(today.getFullYear(), 0, 1), // January 1st of current year
					to: today,
				});
				break;
			case "last-90-days":
				const ninetyDaysAgo = new Date();
				ninetyDaysAgo.setDate(today.getDate() - 90);
				setDateRange({
					from: ninetyDaysAgo,
					to: today,
				});
				break;
			case "custom-range":
				// Keep current range, just change tab
				break;
			default:
				// Default to current month
				setDateRange({
					from: startOfMonth(today),
					to: endOfMonth(today),
				});
		}

		setActiveTab(preset);
	};

	// Calculate summary statistics
	const totalScheduledHours = reportData.reduce(
		(sum, item) => sum + item.hours,
		0
	);
	const totalActualHours = reportData.reduce(
		(sum, item) => sum + (item.actualHours || item.hours),
		0
	);
	const totalScheduledEarnings = reportData.reduce(
		(sum, item) => sum + item.earnings,
		0
	);
	const totalActualEarnings = reportData.reduce(
		(sum, item) => sum + (item.actualEarnings || item.earnings),
		0
	);
	const averageHourlyEarnings =
		totalActualHours > 0 ? totalActualEarnings / totalActualHours : 0;

	// Format data for export
	const getExportData = () => {
		return reportData.map((item) => ({
			Date: format(parseISO(item.startTime), "MMM d, yyyy"),
			"Shift ID": item.shiftId,
			"Start Time": format(parseISO(item.startTime), "h:mm a"),
			"End Time": format(parseISO(item.endTime), "h:mm a"),
			"Scheduled Hours": item.hours.toFixed(2),
			"Actual Hours": item.actualHours ? item.actualHours.toFixed(2) : "N/A",
			"Hourly Rate": `$${item.hourlyRate.toFixed(2)}`,
			"Scheduled Earnings": `$${item.earnings.toFixed(2)}`,
			"Actual Earnings": item.actualEarnings
				? `$${item.actualEarnings.toFixed(2)}`
				: "N/A",
			Location: item.locationName,
			Status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
		}));
	};

	// Handle exporting the earnings report
	const handleExportReport = (formatType: "csv" | "excel") => {
		if (!employee) return;

		const exportData = getExportData();
		const filename = `${employee.name.replace(
			/\s+/g,
			"_"
		)}_Earnings_Report_${format(
			dateRange.from || new Date(),
			"yyyy-MM-dd"
		)}_to_${format(dateRange.to || new Date(), "yyyy-MM-dd")}`;

		if (formatType === "csv") {
			exportToCSV(exportData, filename);
		} else {
			exportToExcel(exportData, filename);
		}
	};

	// Add this function before the return statement
	const renderVariance = (scheduled: number, actual: number | null) => {
		if (actual === null) return null;

		const diff = actual - scheduled;
		const isPositive = diff > 0;
		const formattedDiff = Math.abs(diff).toFixed(2);

		return (
			<span
				className={`text-xs ml-2 ${
					isPositive ? "text-green-600" : "text-red-600"
				}`}>
				{isPositive ? "+" : "-"}
				{formattedDiff} ({((Math.abs(diff) / scheduled) * 100).toFixed(1)}%)
			</span>
		);
	};

	if (loading) {
		return (
			<ContentContainer>
				<LoadingState
					type="spinner"
					message="Loading earnings data..."
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	if (!employee) {
		return (
			<ContentContainer className="max-w-4xl mx-auto">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold mb-2">Employee Not Found</h2>
					<p className="text-muted-foreground mb-6">
						The employee you're looking for could not be found.
					</p>
					<Button
						variant="outline"
						onClick={() => navigate("/employees")}>
						<ChevronLeft className="mr-2 h-4 w-4" /> Back to Employees
					</Button>
				</div>
			</ContentContainer>
		);
	}

	// Header actions
	const headerActions = <DateRangePickerComponent />;

	return (
		<>
			<PageHeader
				title={`${employee.firstName} ${employee.lastName}'s Earnings`}
				description="View detailed earnings reports and payroll information"
				actions={headerActions}
				showBackButton={true}
			/>
			<PageContentSpacing>
				<ContentContainer>
					{/* Page Header */}
					<ContentSection
						title={`Earnings Report: ${employee.name}`}
						description="Detailed financial earnings report by shift and date"
						headerActions={
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleExportReport("csv")}>
									<FileText className="h-4 w-4 mr-2" />
									Export CSV
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleExportReport("excel")}>
									<Download className="h-4 w-4 mr-2" />
									Export Excel
								</Button>
							</div>
						}>
						{/* Date Range Selector */}
						<div className="mb-6">
							<Tabs
								value={activeTab}
								onValueChange={handleDatePresetChange}>
								<TabsList className="mb-4">
									<TabsTrigger value="current-month">Current Month</TabsTrigger>
									<TabsTrigger value="previous-month">
										Previous Month
									</TabsTrigger>
									<TabsTrigger value="year-to-date">Year to Date</TabsTrigger>
									<TabsTrigger value="last-90-days">Last 90 Days</TabsTrigger>
									<TabsTrigger value="custom-range">Custom Range</TabsTrigger>
								</TabsList>

								<TabsContent value="custom-range">
									<div className="flex flex-col md:flex-row gap-4 mb-6">
										<div className="flex-1">
											<Label htmlFor="from-date">From Date</Label>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														id="from-date"
														variant="outline"
														className={cn(
															"w-full justify-start text-left font-normal mt-1",
															!dateRange.from && "text-muted-foreground"
														)}>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{dateRange.from
															? format(dateRange.from, "PPP")
															: "Select start date"}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0">
													<Calendar
														mode="single"
														selected={dateRange.from}
														onSelect={(date) =>
															setDateRange((prev) => ({ ...prev, from: date }))
														}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</div>

										<div className="flex-1">
											<Label htmlFor="to-date">To Date</Label>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														id="to-date"
														variant="outline"
														className={cn(
															"w-full justify-start text-left font-normal mt-1",
															!dateRange.to && "text-muted-foreground"
														)}>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{dateRange.to
															? format(dateRange.to, "PPP")
															: "Select end date"}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0">
													<Calendar
														mode="single"
														selected={dateRange.to}
														onSelect={(date) =>
															setDateRange((prev) => ({ ...prev, to: date }))
														}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</div>
									</div>
								</TabsContent>
							</Tabs>
						</div>

						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base font-medium">
										Total Scheduled Hours
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center">
										<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
										<span className="text-2xl font-bold">
											{totalScheduledHours.toFixed(1)}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{dateRange.from &&
											dateRange.to &&
											`${format(dateRange.from, "MMM d")} - ${format(
												dateRange.to,
												"MMM d, yyyy"
											)}`}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base font-medium">
										Total Actual Hours
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center">
										<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
										<span className="text-2xl font-bold">
											{totalActualHours.toFixed(1)}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{dateRange.from &&
											dateRange.to &&
											`${format(dateRange.from, "MMM d")} - ${format(
												dateRange.to,
												"MMM d, yyyy"
											)}`}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base font-medium">
										Total Earnings
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center">
										<DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
										<span className="text-2xl font-bold">
											${totalActualEarnings.toFixed(2)}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{reportData.length} shifts
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Detailed Earnings Table */}
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Shift</TableHead>
										<TableHead>Time</TableHead>
										<TableHead>Scheduled Hours</TableHead>
										<TableHead>Actual Hours</TableHead>
										<TableHead>Rate</TableHead>
										<TableHead>Scheduled Earnings</TableHead>
										<TableHead>Actual Earnings</TableHead>
										<TableHead>Location</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{reportData.length > 0 ? (
										reportData.map((item) => (
											<TableRow
												key={item.shiftId}
												className="cursor-pointer hover:bg-muted/50"
												onClick={() => navigate(`/shifts/${item.shiftId}`)}>
												<TableCell>
													{format(parseISO(item.startTime), "MMM d, yyyy")}
												</TableCell>
												<TableCell>{item.shiftId}</TableCell>
												<TableCell>
													{format(parseISO(item.startTime), "h:mm a")} -{" "}
													{format(parseISO(item.endTime), "h:mm a")}
												</TableCell>
												<TableCell>{item.hours.toFixed(2)}</TableCell>
												<TableCell>
													{item.actualHours ? (
														<div className="flex items-center">
															{item.actualHours.toFixed(2)}
															{renderVariance(item.hours, item.actualHours)}
														</div>
													) : (
														"N/A"
													)}
												</TableCell>
												<TableCell>${item.hourlyRate.toFixed(2)}</TableCell>
												<TableCell className="font-medium">
													${item.earnings.toFixed(2)}
												</TableCell>
												<TableCell className="font-medium">
													{item.actualEarnings ? (
														<div className="flex items-center">
															${item.actualEarnings.toFixed(2)}
															{renderVariance(
																item.earnings,
																item.actualEarnings
															)}
														</div>
													) : (
														"N/A"
													)}
												</TableCell>
												<TableCell>{item.locationName}</TableCell>
												<TableCell>
													<div
														className={cn(
															"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
															item.status === "completed"
																? "bg-green-100 text-green-800"
																: item.status === "in_progress"
																? "bg-blue-100 text-blue-800"
																: "bg-gray-100 text-gray-800"
														)}>
														{item.status.charAt(0).toUpperCase() +
															item.status.slice(1).replace("_", " ")}
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={8}
												className="text-center py-4 text-muted-foreground">
												No earnings data found for the selected period
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{/* Monthly Breakdown - Optional Enhancement */}
						{reportData.length > 0 && (
							<div className="mt-8">
								<h3 className="text-lg font-medium mb-4 flex items-center">
									<BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
									Earnings Breakdown
								</h3>

								<Card>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground mb-4">
											Summary of earnings for {employee.name} during the
											selected period.
										</p>

										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm">Base Hourly Earnings</span>
												<span className="font-medium">
													${totalScheduledEarnings.toFixed(2)}
												</span>
											</div>
											<Separator />
											<div className="flex justify-between items-center">
												<span className="text-sm">Total Scheduled Hours</span>
												<span className="font-medium">
													{totalScheduledHours.toFixed(2)} hours
												</span>
											</div>
											<Separator />
											<div className="flex justify-between items-center">
												<span className="text-sm">Total Actual Hours</span>
												<span className="font-medium">
													{totalActualHours.toFixed(2)} hours
												</span>
											</div>
											<Separator />
											<div className="flex justify-between items-center">
												<span className="text-sm">Total Shifts</span>
												<span className="font-medium">
													{reportData.length} shifts
												</span>
											</div>
											<Separator />
											<div className="flex justify-between items-center font-bold pt-2">
												<span>Total Scheduled Earnings</span>
												<span>${totalScheduledEarnings.toFixed(2)}</span>
											</div>
											<div className="flex justify-between items-center font-bold pt-2">
												<span>Total Actual Earnings</span>
												<span>${totalActualEarnings.toFixed(2)}</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</ContentSection>
				</ContentContainer>
			</PageContentSpacing>
		</>
	);
}
