import React, { useState } from "react";
import { Link } from "react-router-dom";
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
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [dateFilterType, setDateFilterType] = useState<
		"single" | "range" | "preset"
	>("single");
	const [datePreset, setDatePreset] = useState<string | null>(null);
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
	const [currentTab, setCurrentTab] = useState("all");
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");

	// TanStack Table state
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 25,
	});

	// Filter shifts based on current tab
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

	// Setup the react table instance
	const table = useReactTable({
		data: tabFilteredShifts,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPagination,
		state: {
			sorting,
			columnFilters,
			pagination,
		},
	});

	// Apply filters programmatically when filter controls are used
	React.useEffect(() => {
		// Apply search filter
		if (searchQuery) {
			table.getColumn("id")?.setFilterValue(searchQuery);
		} else {
			table.getColumn("id")?.setFilterValue("");
		}

		// Apply location filter
		if (selectedLocation) {
			table.getColumn("locationName")?.setFilterValue(selectedLocation);
		} else {
			table.getColumn("locationName")?.setFilterValue("");
		}

		// Apply date filters
		if (selectedDate || (dateRange && dateRange.from && dateRange.to)) {
			table.getColumn("date")?.setFilterValue({
				selectedDate,
				dateRange,
			});
		} else {
			table.getColumn("date")?.setFilterValue(null);
		}
	}, [searchQuery, selectedLocation, selectedDate, dateRange, table]);

	// Get unique locations from mock data
	const uniqueLocations = Array.from(
		new Set(mockShifts.map((shift) => shift.locationName))
	);

	// Create location filter options in the format required by the filter dropdown
	const locationFilterOptions = uniqueLocations.map((location) => ({
		label: location,
		value: location,
	}));

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
			case "this_week":
				const startThis = subDays(today, today.getDay());
				const endThis = new Date(startThis);
				endThis.setDate(startThis.getDate() + 6);
				setSelectedDate(undefined);
				setDateRange({ from: startThis, to: endThis });
				setDateFilterType("preset");
				setDatePreset("This Week");
				break;
			case "last_week":
				const startLast = subDays(today, today.getDay() + 7);
				const endLast = new Date(startLast);
				endLast.setDate(startLast.getDate() + 6);
				setSelectedDate(undefined);
				setDateRange({ from: startLast, to: endLast });
				setDateFilterType("preset");
				setDatePreset("Last Week");
				break;
			case "custom":
				setDateFilterType("single");
				setDatePreset(null);
				break;
			case "custom_range":
				setDateFilterType("range");
				setDatePreset(null);
				break;
			default:
				break;
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
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
						<div className="flex items-center gap-2">
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
										viewMode === "cards" && "bg-muted"
									)}
									onClick={() => setViewMode("cards")}>
									<LayoutGrid className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
							<div className="relative w-full sm:w-64">
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
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className={cn(
											"h-9 gap-1 w-[180px]",
											(selectedDate || dateRange || datePreset) && "bg-muted"
										)}>
										<CalendarIcon className="h-3.5 w-3.5 mr-1" />
										{getDateFilterLabel() || "Date Filter"}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start">
									<div className="p-2">
										<div className="grid gap-1">
											<Button
												variant="ghost"
												size="sm"
												className="justify-start font-normal"
												onClick={() => handleDateFilterSelect("today")}>
												Today
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="justify-start font-normal"
												onClick={() => handleDateFilterSelect("yesterday")}>
												Yesterday
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="justify-start font-normal"
												onClick={() => handleDateFilterSelect("this_week")}>
												This Week
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="justify-start font-normal"
												onClick={() => handleDateFilterSelect("last_week")}>
												Last Week
											</Button>
										</div>
										<div className="mt-3 border-t pt-3">
											{dateFilterType === "single" ? (
												<Calendar
													mode="single"
													selected={selectedDate}
													onSelect={(date) => setSelectedDate(date)}
													initialFocus
												/>
											) : (
												<Calendar
													mode="range"
													selected={dateRange}
													onSelect={setDateRange}
													numberOfMonths={2}
													initialFocus
												/>
											)}
										</div>
										<div className="mt-3 border-t pt-3 flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() => handleDateFilterSelect("custom")}>
												Single Date
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() => handleDateFilterSelect("custom_range")}>
												Date Range
											</Button>
										</div>
									</div>
								</PopoverContent>
							</Popover>

							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearAllFilters}
									className="h-9">
									<X className="h-4 w-4 mr-1" />
									Clear
								</Button>
							)}
						</div>
					</div>

					{/* Applied date filter badges */}
					{(selectedDate || dateRange || datePreset) && (
						<div className="flex items-center gap-2 mb-4">
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
						</div>
					)}

					{/* Tab content */}
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
						) : viewMode === "table" ? (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows.length > 0 ? (
											table.getRowModel().rows.map((row) => (
												<TableRow
													key={row.id}
													data-state={row.getIsSelected() && "selected"}>
													{row.getVisibleCells().map((cell) => (
														<TableCell key={cell.id}>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center">
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{table.getRowModel().rows.map((row) => (
									<ShiftCard
										key={row.id}
										shift={row.original}
									/>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						<div className="flex items-center justify-between">
							<div className="flex-1 text-sm text-muted-foreground">
								Showing{" "}
								{table.getFilteredRowModel().rows.length > 0
									? table.getState().pagination.pageIndex *
											table.getState().pagination.pageSize +
									  1
									: 0}{" "}
								to{" "}
								{Math.min(
									(table.getState().pagination.pageIndex + 1) *
										table.getState().pagination.pageSize,
									table.getFilteredRowModel().rows.length
								)}{" "}
								of {table.getFilteredRowModel().rows.length} entries
							</div>
							<div className="flex items-center space-x-6">
								<div className="flex items-center space-x-2">
									<p className="text-sm text-muted-foreground">
										Items per page
									</p>
									<Select
										value={`${table.getState().pagination.pageSize}`}
										onValueChange={(value) => {
											table.setPageSize(Number(value));
										}}>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={table.getState().pagination.pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[25, 50, 100, 200].map((pageSize) => (
												<SelectItem
													key={pageSize}
													value={`${pageSize}`}>
													{pageSize}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
										className="h-8 w-8 p-0">
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<div className="flex items-center text-sm text-muted-foreground">
										Page {table.getState().pagination.pageIndex + 1} of{" "}
										{table.getPageCount()}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
										className="h-8 w-8 p-0">
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
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
						) : viewMode === "table" ? (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows.length > 0 ? (
											table.getRowModel().rows.map((row) => (
												<TableRow
													key={row.id}
													data-state={row.getIsSelected() && "selected"}>
													{row.getVisibleCells().map((cell) => (
														<TableCell key={cell.id}>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center">
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{table.getRowModel().rows.map((row) => (
									<ShiftCard
										key={row.id}
										shift={row.original}
									/>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						<div className="flex items-center justify-between">
							<div className="flex-1 text-sm text-muted-foreground">
								Showing{" "}
								{table.getFilteredRowModel().rows.length > 0
									? table.getState().pagination.pageIndex *
											table.getState().pagination.pageSize +
									  1
									: 0}{" "}
								to{" "}
								{Math.min(
									(table.getState().pagination.pageIndex + 1) *
										table.getState().pagination.pageSize,
									table.getFilteredRowModel().rows.length
								)}{" "}
								of {table.getFilteredRowModel().rows.length} entries
							</div>
							<div className="flex items-center space-x-6">
								<div className="flex items-center space-x-2">
									<p className="text-sm text-muted-foreground">
										Items per page
									</p>
									<Select
										value={`${table.getState().pagination.pageSize}`}
										onValueChange={(value) => {
											table.setPageSize(Number(value));
										}}>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={table.getState().pagination.pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[25, 50, 100, 200].map((pageSize) => (
												<SelectItem
													key={pageSize}
													value={`${pageSize}`}>
													{pageSize}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
										className="h-8 w-8 p-0">
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<div className="flex items-center text-sm text-muted-foreground">
										Page {table.getState().pagination.pageIndex + 1} of{" "}
										{table.getPageCount()}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
										className="h-8 w-8 p-0">
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
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
						) : viewMode === "table" ? (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows.length > 0 ? (
											table.getRowModel().rows.map((row) => (
												<TableRow
													key={row.id}
													data-state={row.getIsSelected() && "selected"}>
													{row.getVisibleCells().map((cell) => (
														<TableCell key={cell.id}>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center">
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{table.getRowModel().rows.map((row) => (
									<ShiftCard
										key={row.id}
										shift={row.original}
									/>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						<div className="flex items-center justify-between">
							<div className="flex-1 text-sm text-muted-foreground">
								Showing{" "}
								{table.getFilteredRowModel().rows.length > 0
									? table.getState().pagination.pageIndex *
											table.getState().pagination.pageSize +
									  1
									: 0}{" "}
								to{" "}
								{Math.min(
									(table.getState().pagination.pageIndex + 1) *
										table.getState().pagination.pageSize,
									table.getFilteredRowModel().rows.length
								)}{" "}
								of {table.getFilteredRowModel().rows.length} entries
							</div>
							<div className="flex items-center space-x-6">
								<div className="flex items-center space-x-2">
									<p className="text-sm text-muted-foreground">
										Items per page
									</p>
									<Select
										value={`${table.getState().pagination.pageSize}`}
										onValueChange={(value) => {
											table.setPageSize(Number(value));
										}}>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={table.getState().pagination.pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[25, 50, 100, 200].map((pageSize) => (
												<SelectItem
													key={pageSize}
													value={`${pageSize}`}>
													{pageSize}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.previousPage()}
										disabled={!table.getCanPreviousPage()}
										className="h-8 w-8 p-0">
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<div className="flex items-center text-sm text-muted-foreground">
										Page {table.getState().pagination.pageIndex + 1} of{" "}
										{table.getPageCount()}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => table.nextPage()}
										disabled={!table.getCanNextPage()}
										className="h-8 w-8 p-0">
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</ContentSection>
		</ContentContainer>
	);
}
