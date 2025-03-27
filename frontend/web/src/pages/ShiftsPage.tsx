import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	LayoutGrid,
	List,
	MapPin,
	Pencil,
	Plus,
	Search,
	SearchX,
	Users,
	X,
} from "lucide-react";
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
	startOfWeek,
	endOfWeek,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportDropdown } from "@/components/ExportDropdown";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";

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

// Define columns with sorting enabled
const columns: ColumnDef<(typeof mockShifts)[0]>[] = [
	{
		accessorKey: "id",
		header: "Shift ID",
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("id")}</span>
		),
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			const date = row.getValue("date") as string;
			return <span>{format(parseISO(date), "MMM d, yyyy")}</span>;
		},
		filterFn: (row, id, value) => {
			if (!value) return true;
			const rowDate = parseISO(row.getValue(id));
			if (typeof value === "string") return false; // Not used

			// Custom filter for date range
			if (value.dateRange && value.dateRange.from && value.dateRange.to) {
				return isWithinInterval(rowDate, {
					start: startOfDay(value.dateRange.from),
					end: endOfDay(value.dateRange.to),
				});
			}

			// Custom filter for single date
			if (value.selectedDate) {
				return isWithinInterval(rowDate, {
					start: startOfDay(value.selectedDate),
					end: endOfDay(value.selectedDate),
				});
			}

			return false;
		},
	},
	{
		accessorKey: "locationName",
		header: "Location",
		cell: ({ row }) => (
			<div className="flex items-center">
				<MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
				<span>{row.getValue("locationName")}</span>
			</div>
		),
	},
	{
		accessorKey: "employeesScheduled",
		header: "Employees",
		cell: ({ row }) => {
			const count = row.getValue("employeesScheduled") as number;
			return (
				<div className="flex items-center">
					<Users className="mr-2 h-4 w-4 text-muted-foreground" />
					<span>{count} scheduled</span>
				</div>
			);
		},
	},
	{
		accessorKey: "totalScheduledHours",
		header: "Scheduled Hours",
		cell: ({ row }) => <span>{row.getValue("totalScheduledHours")} hrs</span>,
	},
	{
		accessorKey: "totalActualHours",
		header: "Actual Hours",
		cell: ({ row }) => <span>{row.getValue("totalActualHours")} hrs</span>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "Completed" ? "secondary" : "default"}
					className="whitespace-nowrap">
					{status}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: ({ row }) => {
			return (
				<div className="flex justify-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						asChild>
						<Link to={`/shifts/${row.getValue("id")}`}>
							<Eye className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						asChild>
						<Link to={`/shifts/${row.getValue("id")}/edit`}>
							<Pencil className="h-4 w-4" />
						</Link>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon">
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link to={`/shifts/${row.getValue("id")}/details`}>
									View Details
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to={`/shifts/${row.getValue("id")}/logs`}>View Logs</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

export function ShiftsPage() {
	const [currentTab, setCurrentTab] = useState<string>("all");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 25,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
	const [dateFilterType, setDateFilterType] = useState<"single" | "range">(
		"single"
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [datePreset, setDatePreset] = useState<string | null>(null);

	// Get unique locations for filter
	const uniqueLocations = Array.from(
		new Set(mockShifts.map((shift) => shift.locationName))
	).sort();

	// Get filtered shifts based on current tab
	const getTabFilteredShifts = () => {
		let filtered = [...mockShifts];

		// Apply tab filter
		if (currentTab === "open") {
			filtered = filtered.filter((shift) => shift.status === "Open");
		} else if (currentTab === "today") {
			filtered = filtered.filter((shift) => isToday(parseISO(shift.date)));
		}

		return filtered;
	};

	const tabFilteredShifts = getTabFilteredShifts();

	// Create a table instance based on the filtered data
	const table = useReactTable({
		data: tabFilteredShifts,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		state: {
			sorting,
			pagination,
			columnFilters: [
				...(searchQuery
					? [
							{
								id: "searchQuery",
								value: searchQuery,
							},
					  ]
					: []),
				...(selectedLocation
					? [{ id: "locationName", value: selectedLocation }]
					: []),
				...(selectedDate || dateRange || datePreset
					? [{ id: "date", value: { selectedDate, dateRange, datePreset } }]
					: []),
			],
		},
	});

	// Get location filter label
	const getLocationFilterLabel = () => {
		return selectedLocation || "All Locations";
	};

	// Handle location filter selection
	const handleLocationSelect = (location: string | null) => {
		setSelectedLocation(location);
	};

	// Handle date filter selection
	const handleDateFilterSelect = (type: string) => {
		// Clear previous filters
		setSelectedDate(undefined);
		setDateRange(undefined);
		setDatePreset(null);

		// Apply the selected preset
		if (type === "today") {
			setSelectedDate(new Date());
			setDatePreset("today");
			setDateFilterType("single");
		} else if (type === "yesterday") {
			setSelectedDate(subDays(new Date(), 1));
			setDatePreset("yesterday");
			setDateFilterType("single");
		} else if (type === "this_week") {
			// Set range from Monday to Sunday of this week
			const now = new Date();
			const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
			const startOfWeek = subDays(now, dayOfWeek === 0 ? 6 : dayOfWeek - 1);
			const endOfWeek = subDays(startOfWeek, -6);
			setDateRange({ from: startOfWeek, to: endOfWeek });
			setDatePreset("this_week");
			setDateFilterType("range");
		} else if (type === "last_week") {
			// Set range from Monday to Sunday of last week
			const now = new Date();
			const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
			const startOfThisWeek = subDays(now, dayOfWeek === 0 ? 6 : dayOfWeek - 1);
			const startOfLastWeek = subDays(startOfThisWeek, 7);
			const endOfLastWeek = subDays(startOfThisWeek, 1);
			setDateRange({ from: startOfLastWeek, to: endOfLastWeek });
			setDatePreset("last_week");
			setDateFilterType("range");
		}
	};

	// Get date filter label for display
	const getDateFilterLabel = () => {
		if (!selectedDate && !dateRange && !datePreset) {
			return "";
		}

		if (datePreset) {
			return datePreset;
		}

		if (selectedDate) {
			return format(selectedDate, "MMM d, yyyy");
		}

		if (dateRange && dateRange.from && dateRange.to) {
			return `${format(dateRange.from, "MMM d")} - ${format(
				dateRange.to,
				"MMM d, yyyy"
			)}`;
		}

		return "";
	};

	// Clear date filter
	const clearDateFilter = () => {
		setSelectedDate(undefined);
		setDateRange(undefined);
		setDatePreset(null);
	};

	// Clear all filters
	const clearAllFilters = () => {
		setSearchQuery("");
		setSelectedLocation(null);
		clearDateFilter();
		table.resetColumnFilters();
	};

	// Determine if any filters are active
	const hasActiveFilters = Boolean(
		searchQuery || selectedLocation || selectedDate || dateRange || datePreset
	);

	// Calculate pagination
	const totalPages = Math.ceil(tabFilteredShifts.length / pagination.pageSize);
	const paginatedShifts = tabFilteredShifts.slice(
		pagination.pageIndex * pagination.pageSize,
		(pagination.pageIndex + 1) * pagination.pageSize
	);

	// Render shift card for card view
	const ShiftCard = ({ shift }: { shift: (typeof mockShifts)[0] }) => (
		<Card className="cursor-pointer hover:shadow-sm transition-all border hover:border-primary">
			<CardHeader className="pb-2 px-4 pt-4">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center">
						<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
							<Calendar className="h-3.5 w-3.5 text-primary" />
						</div>
						<CardTitle className="text-base">{shift.id}</CardTitle>
					</div>
					<Badge
						variant={shift.status === "Completed" ? "secondary" : "default"}
						className="whitespace-nowrap">
						{shift.status}
					</Badge>
				</div>
				<CardDescription className="ml-9">
					{format(parseISO(shift.date), "MMM d, yyyy")}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 pb-4 px-4">
				<div className="flex items-center text-sm">
					<MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
					<span className="truncate">{shift.locationName}</span>
				</div>
				<div className="flex items-center text-sm">
					<Users className="mr-2 h-4 w-4 text-muted-foreground" />
					<span>
						{shift.employeesPresent}/{shift.employeesScheduled} employees
					</span>
				</div>
				<div className="flex items-center text-sm">
					<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
					<span>
						{shift.totalActualHours}/{shift.totalScheduledHours} hours
					</span>
				</div>
			</CardContent>
			<CardFooter className="border-t pt-3 px-4 flex justify-end gap-2">
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3"
					asChild>
					<Link
						to={`/shifts/${shift.id}`}
						className="flex items-center">
						<Eye className="mr-1.5 h-3.5 w-3.5" />
						View
					</Link>
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3"
					asChild>
					<Link
						to={`/shifts/${shift.id}/edit`}
						className="flex items-center">
						<Pencil className="mr-1.5 h-3.5 w-3.5" />
						Edit
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);

	return (
		<ContentContainer>
			<PageHeader
				title="Shifts"
				description="View and manage all shifts for your organization"
				actions={
					<div className="flex items-center gap-2">
						<ExportDropdown
							data={table.getFilteredRowModel().rows.map((row) => row.original)}
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
						<Button>
							<Plus className="mr-2 h-4 w-4" /> Create Shift
						</Button>
					</div>
				}
			/>

			<ContentSection title="Shift Management">
				<Tabs
					value={currentTab}
					onValueChange={(value) => {
						setCurrentTab(value);
						table.resetColumnFilters();
					}}
					className="space-y-6">
					<TabsList className="mb-4">
						<TabsTrigger value="all">All Shifts</TabsTrigger>
						<TabsTrigger value="open">Open Shifts</TabsTrigger>
						<TabsTrigger value="today">Today's Shifts</TabsTrigger>
					</TabsList>

					{/* Search and filter UI */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="justify-between text-left font-normal w-[180px]">
									<div className="flex items-center">
										<MapPin className="mr-2 h-4 w-4" />
										{getLocationFilterLabel()}
									</div>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-[180px]">
								<DropdownMenuItem onClick={() => handleLocationSelect(null)}>
									All Locations
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{uniqueLocations.map((location) => (
									<DropdownMenuItem
										key={location}
										onClick={() => handleLocationSelect(location)}>
										{location}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Date filter */}
						<div className="space-y-2">
							<Label>Date</Label>
							<div className="flex flex-col space-y-2">
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="single-date"
										name="dateFilterType"
										checked={dateFilterType === "single"}
										onChange={() => setDateFilterType("single")}
									/>
									<label htmlFor="single-date">Single date</label>
								</div>
								{dateFilterType === "single" && (
									<DatePicker
										value={selectedDate}
										onChange={setSelectedDate}
										className="w-full"
									/>
								)}

								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="date-range"
										name="dateFilterType"
										checked={dateFilterType === "range"}
										onChange={() => setDateFilterType("range")}
									/>
									<label htmlFor="date-range">Date range</label>
								</div>
								{dateFilterType === "range" && (
									<DateRangePicker
										value={dateRange}
										onChange={setDateRange}
										placeholder="Select date range"
									/>
								)}
							</div>
						</div>
					</div>

					<TabsContent
						value="all"
						forceMount={true}
						hidden={currentTab !== "all"}
						className="space-y-6">
						{table.getFilteredRowModel().rows.length === 0 ? (
							<EmptyState
								icon={<SearchX className="h-10 w-10" />}
								title="No shifts found"
								description="No shifts match your current filters. Try adjusting your search criteria."
								action={
									<Button
										variant="outline"
										onClick={clearAllFilters}>
										Clear filters
									</Button>
								}
							/>
						) : (
							<>
								{/* Standalone filters above the table */}
								<div className="flex flex-wrap gap-4 mb-4">
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Location
										</label>
										<Select
											value={selectedLocation || ""}
											onValueChange={(value) =>
												handleLocationSelect(value === "" ? null : value)
											}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Locations" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">All Locations</SelectItem>
												{uniqueLocations.map((location) => (
													<SelectItem
														key={location}
														value={location}>
														{location}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Date Filter
										</label>
										<div className="flex flex-col gap-2">
											<Select
												value={dateFilterType}
												onValueChange={(value: "single" | "range") =>
													setDateFilterType(value)
												}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Filter type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="single">Single Date</SelectItem>
													<SelectItem value="range">Date Range</SelectItem>
												</SelectContent>
											</Select>

											{dateFilterType === "single" && (
												<DatePicker
													value={selectedDate}
													onChange={setSelectedDate}
													className="w-full"
												/>
											)}

											{dateFilterType === "range" && (
												<DateRangePicker
													value={dateRange}
													onChange={setDateRange}
													className="w-full"
												/>
											)}
										</div>
									</div>
									{hasActiveFilters && (
										<div className="flex items-end w-full md:w-auto">
											<Button
												variant="outline"
												size="sm"
												onClick={clearAllFilters}
												className="mb-1">
												<X className="h-4 w-4 mr-1" />
												Clear Filters
											</Button>
										</div>
									)}
								</div>

								{/* Table without customFilters */}
								<DataTable
									columns={columns}
									data={tabFilteredShifts.filter((shift) => {
										// Apply location filter
										if (
											selectedLocation &&
											shift.locationName !== selectedLocation
										) {
											return false;
										}

										// Apply date filter
										if (selectedDate) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(selectedDate),
													end: endOfDay(selectedDate),
												})
											) {
												return false;
											}
										} else if (dateRange?.from && dateRange?.to) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(dateRange.from),
													end: endOfDay(dateRange.to),
												})
											) {
												return false;
											}
										}

										return true;
									})}
									searchKey="id"
									searchPlaceholder="Search by ID or location..."
									viewOptions={{
										enableViewToggle: true,
										defaultView: viewMode,
										onViewChange: setViewMode,
										renderCard: (shift: (typeof mockShifts)[0]) => (
											<ShiftCard shift={shift} />
										),
										enableFullscreen: true,
									}}
									onRowClick={(shift) => {
										// Navigate to shift details
										window.location.href = `/shifts/${shift.id}`;
									}}
								/>
							</>
						)}
					</TabsContent>

					<TabsContent
						value="open"
						forceMount={true}
						hidden={currentTab !== "open"}
						className="space-y-6">
						{table.getFilteredRowModel().rows.length === 0 ? (
							<EmptyState
								icon={<SearchX className="h-10 w-10" />}
								title="No open shifts found"
								description="No open shifts match your current filters. Try adjusting your search criteria."
								action={
									<Button
										variant="outline"
										onClick={clearAllFilters}>
										Clear filters
									</Button>
								}
							/>
						) : (
							<>
								{/* Standalone filters above the table */}
								<div className="flex flex-wrap gap-4 mb-4">
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Location
										</label>
										<Select
											value={selectedLocation || ""}
											onValueChange={(value) =>
												handleLocationSelect(value === "" ? null : value)
											}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Locations" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">All Locations</SelectItem>
												{uniqueLocations.map((location) => (
													<SelectItem
														key={location}
														value={location}>
														{location}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Date Filter
										</label>
										<div className="flex flex-col gap-2">
											<Select
												value={dateFilterType}
												onValueChange={(value: "single" | "range") =>
													setDateFilterType(value)
												}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Filter type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="single">Single Date</SelectItem>
													<SelectItem value="range">Date Range</SelectItem>
												</SelectContent>
											</Select>

											{dateFilterType === "single" && (
												<DatePicker
													value={selectedDate}
													onChange={setSelectedDate}
													className="w-full"
												/>
											)}

											{dateFilterType === "range" && (
												<DateRangePicker
													value={dateRange}
													onChange={setDateRange}
													className="w-full"
												/>
											)}
										</div>
									</div>
									{hasActiveFilters && (
										<div className="flex items-end w-full md:w-auto">
											<Button
												variant="outline"
												size="sm"
												onClick={clearAllFilters}
												className="mb-1">
												<X className="h-4 w-4 mr-1" />
												Clear Filters
											</Button>
										</div>
									)}
								</div>

								{/* Table without customFilters */}
								<DataTable
									columns={columns}
									data={tabFilteredShifts.filter((shift) => {
										// Apply location filter
										if (
											selectedLocation &&
											shift.locationName !== selectedLocation
										) {
											return false;
										}

										// Apply date filter
										if (selectedDate) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(selectedDate),
													end: endOfDay(selectedDate),
												})
											) {
												return false;
											}
										} else if (dateRange?.from && dateRange?.to) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(dateRange.from),
													end: endOfDay(dateRange.to),
												})
											) {
												return false;
											}
										}

										return true;
									})}
									searchKey="id"
									searchPlaceholder="Search by ID or location..."
									viewOptions={{
										enableViewToggle: true,
										defaultView: viewMode,
										onViewChange: setViewMode,
										renderCard: (shift: (typeof mockShifts)[0]) => (
											<ShiftCard shift={shift} />
										),
										enableFullscreen: true,
									}}
									onRowClick={(shift) => {
										// Navigate to shift details
										window.location.href = `/shifts/${shift.id}`;
									}}
								/>
							</>
						)}
					</TabsContent>

					<TabsContent
						value="today"
						forceMount={true}
						hidden={currentTab !== "today"}
						className="space-y-6">
						{table.getFilteredRowModel().rows.length === 0 ? (
							<EmptyState
								icon={<SearchX className="h-10 w-10" />}
								title="No shifts for today"
								description="No shifts scheduled for today match your current filters."
								action={
									<Button
										variant="outline"
										onClick={clearAllFilters}>
										Clear filters
									</Button>
								}
							/>
						) : (
							<>
								{/* Standalone filters above the table */}
								<div className="flex flex-wrap gap-4 mb-4">
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Location
										</label>
										<Select
											value={selectedLocation || ""}
											onValueChange={(value) =>
												handleLocationSelect(value === "" ? null : value)
											}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Locations" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">All Locations</SelectItem>
												{uniqueLocations.map((location) => (
													<SelectItem
														key={location}
														value={location}>
														{location}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1.5 block">
											Date Filter
										</label>
										<div className="flex flex-col gap-2">
											<Select
												value={dateFilterType}
												onValueChange={(value: "single" | "range") =>
													setDateFilterType(value)
												}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Filter type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="single">Single Date</SelectItem>
													<SelectItem value="range">Date Range</SelectItem>
												</SelectContent>
											</Select>

											{dateFilterType === "single" && (
												<DatePicker
													value={selectedDate}
													onChange={setSelectedDate}
													className="w-full"
												/>
											)}

											{dateFilterType === "range" && (
												<DateRangePicker
													value={dateRange}
													onChange={setDateRange}
													className="w-full"
												/>
											)}
										</div>
									</div>
									{hasActiveFilters && (
										<div className="flex items-end w-full md:w-auto">
											<Button
												variant="outline"
												size="sm"
												onClick={clearAllFilters}
												className="mb-1">
												<X className="h-4 w-4 mr-1" />
												Clear Filters
											</Button>
										</div>
									)}
								</div>

								{/* Table without customFilters */}
								<DataTable
									columns={columns}
									data={tabFilteredShifts.filter((shift) => {
										// Apply location filter
										if (
											selectedLocation &&
											shift.locationName !== selectedLocation
										) {
											return false;
										}

										// Apply date filter
										if (selectedDate) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(selectedDate),
													end: endOfDay(selectedDate),
												})
											) {
												return false;
											}
										} else if (dateRange?.from && dateRange?.to) {
											const shiftDate = parseISO(shift.date);
											if (
												!isWithinInterval(shiftDate, {
													start: startOfDay(dateRange.from),
													end: endOfDay(dateRange.to),
												})
											) {
												return false;
											}
										}

										return true;
									})}
									searchKey="id"
									searchPlaceholder="Search by ID or location..."
									viewOptions={{
										enableViewToggle: true,
										defaultView: viewMode,
										onViewChange: setViewMode,
										renderCard: (shift: (typeof mockShifts)[0]) => (
											<ShiftCard shift={shift} />
										),
										enableFullscreen: true,
									}}
									onRowClick={(shift) => {
										// Navigate to shift details
										window.location.href = `/shifts/${shift.id}`;
									}}
								/>
							</>
						)}
					</TabsContent>
				</Tabs>
			</ContentSection>
		</ContentContainer>
	);
}
