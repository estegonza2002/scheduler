import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	format,
	parseISO,
	isToday,
	isPast,
	subDays,
	isWithinInterval,
	startOfToday,
	endOfToday,
	startOfDay,
	endOfDay,
} from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronRight,
	Clock,
	Download,
	FileText,
	Filter,
	Search,
	Users,
	Plus,
	Pencil,
	Eye,
	LayoutGrid,
	List,
	ChevronDown,
	MapPin,
	Check,
	X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { DateRange } from "react-day-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ExportDropdown } from "../components/ExportDropdown";
import { PageHeader } from "../components/ui/page-header";
import { ContentContainer } from "../components/ui/content-container";

// Mock data for shifts - in a real app this would come from an API
const mockShifts = [
	{
		id: "SH-1001",
		date: "2023-06-15",
		locationName: "Downtown Store",
		employeesScheduled: 8,
		employeesPresent: 8,
		status: "Completed",
		totalScheduledHours: 64,
		totalActualHours: 65.5,
		variance: 1.5,
		employees: [
			"John Doe",
			"Jane Smith",
			"Mike Johnson",
			"Sarah Williams",
			"Robert Brown",
			"Emily Davis",
			"David Miller",
			"Lisa Wilson",
		],
	},
	{
		id: "SH-1002",
		date: "2023-06-14",
		locationName: "Westside Location",
		employeesScheduled: 5,
		employeesPresent: 4,
		status: "Completed",
		totalScheduledHours: 40,
		totalActualHours: 32,
		variance: -8,
		employees: [
			"Alex Turner",
			"Chris Martin",
			"Emma Stone",
			"Tom Hardy",
			"Kate Hudson",
		],
	},
	{
		id: "SH-1003",
		date: "2023-06-13",
		locationName: "East Mall",
		employeesScheduled: 6,
		employeesPresent: 6,
		status: "Completed",
		totalScheduledHours: 48,
		totalActualHours: 49,
		variance: 1,
		employees: [
			"Ryan Reynolds",
			"Blake Lively",
			"Hugh Jackman",
			"Zendaya",
			"Tom Holland",
			"Robert Downey Jr.",
		],
	},
	{
		id: "SH-1004",
		date: "2023-06-12",
		locationName: "Downtown Store",
		employeesScheduled: 8,
		employeesPresent: 8,
		status: "Completed",
		totalScheduledHours: 64,
		totalActualHours: 64,
		variance: 0,
		employees: [
			"John Doe",
			"Jane Smith",
			"Mike Johnson",
			"Sarah Williams",
			"Robert Brown",
			"Emily Davis",
			"David Miller",
			"Lisa Wilson",
		],
	},
	{
		id: "SH-1005",
		date: "2023-06-11",
		locationName: "Westside Location",
		employeesScheduled: 4,
		employeesPresent: 3,
		status: "Completed",
		totalScheduledHours: 32,
		totalActualHours: 24,
		variance: -8,
		employees: ["Chris Martin", "Emma Stone", "Tom Hardy"],
	},
	{
		id: "SH-1006",
		date: "2023-07-20",
		locationName: "Downtown Store",
		employeesScheduled: 8,
		employeesPresent: 0,
		status: "Open",
		totalScheduledHours: 64,
		totalActualHours: 0,
		variance: 0,
		employees: [
			"John Doe",
			"Jane Smith",
			"Mike Johnson",
			"Sarah Williams",
			"Robert Brown",
			"Emily Davis",
			"David Miller",
			"Lisa Wilson",
		],
	},
	{
		id: "SH-1007",
		date: "2023-07-21",
		locationName: "Westside Location",
		employeesScheduled: 5,
		employeesPresent: 0,
		status: "Open",
		totalScheduledHours: 40,
		totalActualHours: 0,
		variance: 0,
		employees: [
			"Alex Turner",
			"Chris Martin",
			"Emma Stone",
			"Tom Hardy",
			"Kate Hudson",
		],
	},
];

export function ShiftsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [dateFilterType, setDateFilterType] = useState<
		"single" | "range" | "preset"
	>("single");
	const [datePreset, setDatePreset] = useState<string | null>(null);
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
	const [currentTab, setCurrentTab] = useState("today");
	const [viewMode, setViewMode] = useState<"table" | "card">("table");

	// Mock organization and schedule IDs - in a real app these would come from context/props
	const organizationId = "org-123";
	const scheduleId = "schedule-456";

	// Get unique locations from mock data
	const uniqueLocations = Array.from(
		new Set(mockShifts.map((shift) => shift.locationName))
	);

	// Handle location filter selection
	const handleLocationSelect = (location: string | null) => {
		setSelectedLocation(location);
	};

	// Get location filter label
	const getLocationFilterLabel = () => {
		return selectedLocation || "All Locations";
	};

	// Handle date filter selection
	const handleDateFilterSelect = (type: string) => {
		const today = new Date();

		switch (type) {
			case "today":
				setSelectedDate(today);
				setDateRange(undefined);
				setDateFilterType("preset");
				setDatePreset("Today");
				break;
			case "yesterday":
				setSelectedDate(subDays(today, 1));
				setDateRange(undefined);
				setDateFilterType("preset");
				setDatePreset("Yesterday");
				break;
			case "last7days":
				setSelectedDate(undefined);
				setDateRange({
					from: subDays(today, 6),
					to: today,
				});
				setDateFilterType("preset");
				setDatePreset("Last 7 Days");
				break;
			case "last15days":
				setSelectedDate(undefined);
				setDateRange({
					from: subDays(today, 14),
					to: today,
				});
				setDateFilterType("preset");
				setDatePreset("Last 15 Days");
				break;
			case "last30days":
				setSelectedDate(undefined);
				setDateRange({
					from: subDays(today, 29),
					to: today,
				});
				setDateFilterType("preset");
				setDatePreset("Last 30 Days");
				break;
			case "clear":
				setSelectedDate(undefined);
				setDateRange(undefined);
				setDateFilterType("single");
				setDatePreset(null);
				break;
		}
	};

	// Filter shifts based on search, date, location, and tab
	const filteredShifts = mockShifts.filter((shift) => {
		// Filter by search query (location)
		const matchesSearch =
			searchQuery === "" ||
			shift.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			shift.id.toLowerCase().includes(searchQuery.toLowerCase());

		// Filter by date/date range
		let matchesDate = true;
		const shiftDate = parseISO(shift.date);

		if (dateFilterType === "single" && selectedDate) {
			// Single date filter - match the exact date
			matchesDate =
				format(shiftDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
		} else if (dateFilterType === "range" && dateRange && dateRange.from) {
			// Date range filter
			if (dateRange.to) {
				// Complete range
				matchesDate = isWithinInterval(shiftDate, {
					start: startOfDay(dateRange.from),
					end: endOfDay(dateRange.to),
				});
			} else {
				// Only from date
				matchesDate = shiftDate >= startOfDay(dateRange.from);
			}
		} else if (dateFilterType === "preset") {
			// Preset filters
			if (datePreset === "Today") {
				matchesDate = isWithinInterval(shiftDate, {
					start: startOfToday(),
					end: endOfToday(),
				});
			} else if (datePreset === "Yesterday") {
				const yesterday = subDays(new Date(), 1);
				matchesDate = isWithinInterval(shiftDate, {
					start: startOfDay(yesterday),
					end: endOfDay(yesterday),
				});
			} else if (dateRange && dateRange.from && dateRange.to) {
				// For Last 7 Days and Last 30 Days
				matchesDate = isWithinInterval(shiftDate, {
					start: startOfDay(dateRange.from),
					end: endOfDay(dateRange.to),
				});
			}
		}

		// Filter by location
		const matchesLocation =
			!selectedLocation || shift.locationName === selectedLocation;

		// Filter by tab
		const matchesTab =
			currentTab === "all" ||
			(currentTab === "open" && shift.status === "Open") ||
			(currentTab === "today" && isToday(parseISO(shift.date)));

		return matchesSearch && matchesDate && matchesLocation && matchesTab;
	});

	// Function to get date filter label
	const getDateFilterLabel = () => {
		if (datePreset) {
			return datePreset;
		}

		if (dateFilterType === "range" && dateRange) {
			if (dateRange.from && dateRange.to) {
				return `${format(dateRange.from, "MMM d")} - ${format(
					dateRange.to,
					"MMM d, yyyy"
				)}`;
			}
			if (dateRange.from) {
				return `From ${format(dateRange.from, "MMM d, yyyy")}`;
			}
		}

		if (selectedDate) {
			return format(selectedDate, "PPP");
		}

		return "Filter by date";
	};

	// Check if any filters are applied
	const hasActiveFilters =
		selectedLocation !== null ||
		selectedDate !== undefined ||
		dateRange !== undefined;

	// Get date filter for display
	const getDateFilterForDisplay = () => {
		if (!selectedDate && !dateRange && !datePreset) return [];

		// For date range selections, provide more detailed information
		if (dateFilterType === "range" && dateRange) {
			const fromDate = dateRange.from
				? format(dateRange.from, "MMM d, yyyy")
				: "";
			const toDate = dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "";

			if (dateRange.from && dateRange.to) {
				return [
					{
						label: `${format(dateRange.from, "MMM d")} - ${format(
							dateRange.to,
							"MMM d, yyyy"
						)}`,
						details: `From ${fromDate} to ${toDate}`,
					},
				];
			}
			if (dateRange.from) {
				return [
					{
						label: `From ${format(dateRange.from, "MMM d, yyyy")}`,
						details: `Starting ${fromDate}`,
					},
				];
			}
		}

		// For single date or preset selections
		return [
			{
				label: getDateFilterLabel(),
				details: selectedDate
					? `${format(selectedDate, "EEEE, MMMM d, yyyy")}`
					: "",
			},
		];
	};

	// Clear all filters
	const clearAllFilters = () => {
		setSelectedLocation(null);
		setSelectedDate(undefined);
		setDateRange(undefined);
		setDateFilterType("single");
		setDatePreset(null);
	};

	// Clear date filter
	const clearDateFilter = () => {
		setSelectedDate(undefined);
		setDateRange(undefined);
		setDateFilterType("single");
		setDatePreset(null);
	};

	return (
		<>
			<PageHeader
				title="Shifts"
				description="View and manage all your scheduled shifts"
				actions={
					<Link to="/shifts/create">
						<Button className="flex items-center gap-1">
							<Plus size={16} />
							Create Shift
						</Button>
					</Link>
				}
			/>
			<ContentContainer>
				<div className="space-y-6">
					<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-medium">
									Total Shifts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mockShifts.length}</div>
								<p className="text-xs text-muted-foreground">Last 30 days</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-medium">
									Average Hours Variance
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{(
										mockShifts.reduce((sum, shift) => sum + shift.variance, 0) /
										mockShifts.length
									).toFixed(1)}
								</div>
								<p className="text-xs text-muted-foreground">
									Hours variance per shift
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-medium">
									Attendance Rate
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{Math.round(
										(mockShifts.reduce(
											(sum, shift) => sum + shift.employeesPresent,
											0
										) /
											mockShifts.reduce(
												(sum, shift) => sum + shift.employeesScheduled,
												0
											)) *
											100
									)}
									%
								</div>
								<p className="text-xs text-muted-foreground">
									Employees present vs. scheduled
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardContent className="pt-6">
							<Tabs
								value={currentTab}
								onValueChange={setCurrentTab}
								className="space-y-4">
								<div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
									<div className="flex items-center space-x-2">
										{currentTab !== "today" && (
											<TabsList>
												<TabsTrigger value="all">All Shifts</TabsTrigger>
												<TabsTrigger value="open">Open Shifts</TabsTrigger>
												<TabsTrigger value="today">Today's Shifts</TabsTrigger>
											</TabsList>
										)}

										<div className="border rounded-md overflow-hidden">
											<Button
												variant="ghost"
												size="sm"
												className={cn(
													"h-8 px-2 rounded-none",
													viewMode === "table" && "bg-muted"
												)}
												onClick={() => setViewMode("table")}>
												<List className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className={cn(
													"h-8 px-2 rounded-none",
													viewMode === "card" && "bg-muted"
												)}
												onClick={() => setViewMode("card")}>
												<LayoutGrid className="h-4 w-4" />
											</Button>
										</div>
									</div>

									<div className="flex items-center space-x-2">
										<div className="relative md:w-64">
											<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Search by ID or location..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-8"
											/>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"justify-between text-left font-normal md:w-48",
														!selectedLocation && "text-muted-foreground"
													)}>
													<div className="flex items-center">
														<MapPin className="mr-2 h-4 w-4" />
														{getLocationFilterLabel()}
													</div>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-56">
												<DropdownMenuItem
													onSelect={() => handleLocationSelect(null)}>
													All Locations
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{uniqueLocations.map((location) => (
													<DropdownMenuItem
														key={location}
														onSelect={() => handleLocationSelect(location)}>
														{location}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"justify-between text-left font-normal md:w-48",
														!selectedDate &&
															!dateRange &&
															!datePreset &&
															"text-muted-foreground"
													)}>
													<div className="flex items-center">
														<CalendarIcon className="mr-2 h-4 w-4" />
														{getDateFilterLabel()}
													</div>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-56">
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("today")}>
													Today
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("yesterday")}>
													Yesterday
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("last7days")}>
													Last 7 days
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("last15days")}>
													Last 15 days
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("last30days")}>
													Last 30 days
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onSelect={() => handleDateFilterSelect("clear")}>
													Clear filter
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>

										<ExportDropdown
											data={filteredShifts}
											filename="shifts-export"
											headers={[
												"id",
												"date",
												"locationName",
												"employeesPresent",
												"employeesScheduled",
												"totalScheduledHours",
												"totalActualHours",
												"status",
											]}
										/>
									</div>
								</div>

								{/* Applied filters display */}
								{hasActiveFilters && (
									<div className="flex items-center gap-2 mb-4">
										<span className="text-sm font-medium text-muted-foreground">
											Filters:
										</span>
										<div className="flex flex-wrap gap-2">
											{getDateFilterForDisplay().length > 0 && (
												<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
													<CalendarIcon className="h-3 w-3 text-muted-foreground" />
													<span>{getDateFilterLabel()}</span>
													<button
														onClick={clearDateFilter}
														className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
														aria-label="Remove date filter">
														<X className="h-3 w-3 text-muted-foreground" />
													</button>
												</Badge>
											)}

											{selectedLocation && (
												<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
													<MapPin className="h-3 w-3 text-muted-foreground" />
													<span>{selectedLocation}</span>
													<button
														onClick={() => setSelectedLocation(null)}
														className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
														aria-label="Remove location filter">
														<X className="h-3 w-3 text-muted-foreground" />
													</button>
												</Badge>
											)}

											{hasActiveFilters && (
												<button
													onClick={clearAllFilters}
													className="text-xs text-muted-foreground hover:text-foreground underline">
													Clear all
												</button>
											)}
										</div>
									</div>
								)}

								<TabsContent
									value="all"
									className="space-y-4">
									{viewMode === "table" ? (
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Shift ID</TableHead>
														<TableHead>Date</TableHead>
														<TableHead>Location</TableHead>
														<TableHead>Employees</TableHead>
														<TableHead>Scheduled Hours</TableHead>
														<TableHead>Actual Hours</TableHead>
														<TableHead>Status</TableHead>
														<TableHead className="text-right">
															Actions
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{filteredShifts.length > 0 ? (
														filteredShifts.map((shift) => (
															<TableRow key={shift.id}>
																<TableCell>
																	<div className="font-medium">{shift.id}</div>
																</TableCell>
																<TableCell>
																	<div className="font-medium">
																		{format(
																			parseISO(shift.date),
																			"MMM d, yyyy"
																		)}
																	</div>
																</TableCell>
																<TableCell>{shift.locationName}</TableCell>
																<TableCell>
																	<div className="flex items-center">
																		<Users className="h-4 w-4 mr-1 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																</TableCell>
																<TableCell>
																	{shift.totalScheduledHours}
																</TableCell>
																<TableCell>{shift.totalActualHours}</TableCell>
																<TableCell>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</TableCell>
																<TableCell className="text-right">
																	<Link to={`/shifts/${shift.id}`}>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-8">
																			<Eye className="h-3.5 w-3.5 mr-1" />
																			View
																		</Button>
																	</Link>
																</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell
																colSpan={8}
																className="text-center py-6 text-muted-foreground">
																No shifts found matching your filters
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									) : (
										<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
											{filteredShifts.length > 0 ? (
												filteredShifts.map((shift) => (
													<Link
														to={`/shifts/${shift.id}`}
														key={shift.id}
														className="no-underline">
														<Card className="hover:border-primary transition-colors">
															<CardHeader className="pb-2">
																<div className="flex justify-between items-start">
																	<CardTitle className="text-base font-medium">
																		{shift.id}
																	</CardTitle>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</div>
																<CardDescription>
																	{format(parseISO(shift.date), "MMM d, yyyy")}
																</CardDescription>
															</CardHeader>
															<CardContent>
																<div className="grid grid-cols-2 gap-2 text-sm">
																	<div className="flex items-center gap-1">
																		<Users className="h-3.5 w-3.5 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																	<div>{shift.locationName}</div>
																	<div>Sched: {shift.totalScheduledHours}h</div>
																	<div>Actual: {shift.totalActualHours}h</div>
																</div>
															</CardContent>
														</Card>
													</Link>
												))
											) : (
												<div className="col-span-full text-center py-6 text-muted-foreground">
													No shifts found matching your filters
												</div>
											)}
										</div>
									)}
								</TabsContent>

								<TabsContent
									value="open"
									className="space-y-4">
									{viewMode === "table" ? (
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Shift ID</TableHead>
														<TableHead>Date</TableHead>
														<TableHead>Location</TableHead>
														<TableHead>Employees</TableHead>
														<TableHead>Scheduled Hours</TableHead>
														<TableHead>Actual Hours</TableHead>
														<TableHead>Status</TableHead>
														<TableHead className="text-right">
															Actions
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{filteredShifts.length > 0 ? (
														filteredShifts.map((shift) => (
															<TableRow key={shift.id}>
																<TableCell>
																	<div className="font-medium">{shift.id}</div>
																</TableCell>
																<TableCell>
																	<div className="font-medium">
																		{format(
																			parseISO(shift.date),
																			"MMM d, yyyy"
																		)}
																	</div>
																</TableCell>
																<TableCell>{shift.locationName}</TableCell>
																<TableCell>
																	<div className="flex items-center">
																		<Users className="h-4 w-4 mr-1 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																</TableCell>
																<TableCell>
																	{shift.totalScheduledHours}
																</TableCell>
																<TableCell>{shift.totalActualHours}</TableCell>
																<TableCell>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</TableCell>
																<TableCell className="text-right">
																	<Link to={`/shifts/${shift.id}`}>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-8">
																			<Eye className="h-3.5 w-3.5 mr-1" />
																			View
																		</Button>
																	</Link>
																</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell
																colSpan={8}
																className="text-center py-6 text-muted-foreground">
																No open shifts found
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									) : (
										<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
											{filteredShifts.length > 0 ? (
												filteredShifts.map((shift) => (
													<Link
														to={`/shifts/${shift.id}`}
														key={shift.id}
														className="no-underline">
														<Card className="hover:border-primary transition-colors">
															<CardHeader className="pb-2">
																<div className="flex justify-between items-start">
																	<CardTitle className="text-base font-medium">
																		{shift.id}
																	</CardTitle>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</div>
																<CardDescription>
																	{format(parseISO(shift.date), "MMM d, yyyy")}
																</CardDescription>
															</CardHeader>
															<CardContent>
																<div className="grid grid-cols-2 gap-2 text-sm">
																	<div className="flex items-center gap-1">
																		<Users className="h-3.5 w-3.5 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																	<div>{shift.locationName}</div>
																	<div>Sched: {shift.totalScheduledHours}h</div>
																	<div>Actual: {shift.totalActualHours}h</div>
																</div>
															</CardContent>
														</Card>
													</Link>
												))
											) : (
												<div className="col-span-full text-center py-6 text-muted-foreground">
													No open shifts found
												</div>
											)}
										</div>
									)}
								</TabsContent>

								<TabsContent
									value="today"
									className="space-y-4">
									{viewMode === "table" ? (
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Shift ID</TableHead>
														<TableHead>Date</TableHead>
														<TableHead>Location</TableHead>
														<TableHead>Employees</TableHead>
														<TableHead>Scheduled Hours</TableHead>
														<TableHead>Actual Hours</TableHead>
														<TableHead>Status</TableHead>
														<TableHead className="text-right">
															Actions
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{filteredShifts.length > 0 ? (
														filteredShifts.map((shift) => (
															<TableRow key={shift.id}>
																<TableCell>
																	<div className="font-medium">{shift.id}</div>
																</TableCell>
																<TableCell>
																	<div className="font-medium">
																		{format(
																			parseISO(shift.date),
																			"MMM d, yyyy"
																		)}
																	</div>
																</TableCell>
																<TableCell>{shift.locationName}</TableCell>
																<TableCell>
																	<div className="flex items-center">
																		<Users className="h-4 w-4 mr-1 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																</TableCell>
																<TableCell>
																	{shift.totalScheduledHours}
																</TableCell>
																<TableCell>{shift.totalActualHours}</TableCell>
																<TableCell>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</TableCell>
																<TableCell className="text-right">
																	<Link to={`/shifts/${shift.id}`}>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-8">
																			<Eye className="h-3.5 w-3.5 mr-1" />
																			View
																		</Button>
																	</Link>
																</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell
																colSpan={8}
																className="text-center py-6 text-muted-foreground">
																No shifts scheduled for today
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									) : (
										<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
											{filteredShifts.length > 0 ? (
												filteredShifts.map((shift) => (
													<Link
														to={`/shifts/${shift.id}`}
														key={shift.id}
														className="no-underline">
														<Card className="hover:border-primary transition-colors">
															<CardHeader className="pb-2">
																<div className="flex justify-between items-start">
																	<CardTitle className="text-base font-medium">
																		{shift.id}
																	</CardTitle>
																	<Badge
																		variant={
																			shift.status === "Completed"
																				? "secondary"
																				: "outline"
																		}>
																		{shift.status}
																	</Badge>
																</div>
																<CardDescription>
																	{format(parseISO(shift.date), "MMM d, yyyy")}
																</CardDescription>
															</CardHeader>
															<CardContent>
																<div className="grid grid-cols-2 gap-2 text-sm">
																	<div className="flex items-center gap-1">
																		<Users className="h-3.5 w-3.5 text-muted-foreground" />
																		<span>
																			{shift.employeesPresent}/
																			{shift.employeesScheduled}
																		</span>
																	</div>
																	<div>{shift.locationName}</div>
																	<div>Sched: {shift.totalScheduledHours}h</div>
																	<div>Actual: {shift.totalActualHours}h</div>
																</div>
															</CardContent>
														</Card>
													</Link>
												))
											) : (
												<div className="col-span-full text-center py-6 text-muted-foreground">
													No shifts scheduled for today
												</div>
											)}
										</div>
									)}
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</ContentContainer>
		</>
	);
}
