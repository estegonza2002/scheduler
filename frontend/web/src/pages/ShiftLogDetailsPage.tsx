import * as React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Filter,
	Search,
	X,
	SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDropdown } from "@/components/ExportDropdown";
import { ContentContainer } from "@/components/ui/content-container";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSection } from "@/components/ui/content-section";
import { DataTable } from "@/components/ui/data-table";
import { FilterGroup } from "@/components/ui/filter-group";
import { EmptyState } from "@/components/ui/empty-state";
import { ColumnDef } from "@tanstack/react-table";

// Mock data for shifts - in a real app this would come from an API
const mockShifts = [
	{
		id: "1",
		employee: "John Smith",
		date: "2023-06-10",
		startTime: "09:00",
		endTime: "17:00",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8,
	},
	{
		id: "2",
		employee: "Jane Doe",
		date: "2023-06-10",
		startTime: "10:00",
		endTime: "18:30",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8.5,
	},
	{
		id: "3",
		employee: "Mike Johnson",
		date: "2023-06-11",
		startTime: "08:00",
		endTime: "14:00",
		location: "Westside Location",
		status: "Completed",
		planned: 6,
		actual: 6,
	},
	{
		id: "4",
		employee: "Sarah Williams",
		date: "2023-06-12",
		startTime: "12:00",
		endTime: "20:00",
		location: "East Mall",
		status: "No Show",
		planned: 8,
		actual: 0,
	},
	{
		id: "5",
		employee: "Robert Brown",
		date: "2023-06-13",
		startTime: "09:00",
		endTime: "17:30",
		location: "Downtown Store",
		status: "Completed",
		planned: 8,
		actual: 8.5,
	},
];

// Define columns outside the component to prevent re-renders
const columns: ColumnDef<(typeof mockShifts)[0]>[] = [
	{
		accessorKey: "employee",
		header: "Employee",
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("employee")}</span>
		),
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => <span>{row.getValue("date")}</span>,
	},
	{
		accessorKey: "time",
		header: "Time",
		cell: ({ row }) => (
			<span>
				{row.original.startTime} - {row.original.endTime}
			</span>
		),
	},
	{
		accessorKey: "location",
		header: "Location",
		cell: ({ row }) => <span>{row.getValue("location")}</span>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "Completed" ? "secondary" : "destructive"}
					className="whitespace-nowrap">
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "planned",
		header: "Planned Hours",
		cell: ({ row }) => <span>{row.getValue("planned")}</span>,
	},
	{
		accessorKey: "actual",
		header: "Actual Hours",
		cell: ({ row }) => <span>{row.getValue("actual")}</span>,
	},
	{
		id: "variance",
		header: "Variance",
		cell: ({ row }) => {
			const planned = row.getValue("planned") as number;
			const actual = row.getValue("actual") as number;
			const variance = actual - planned;

			return (
				<span
					className={cn(
						variance > 0
							? "text-red-600"
							: variance < 0
							? "text-orange-600"
							: ""
					)}>
					{variance.toFixed(1)}
				</span>
			);
		},
	},
];

export function ShiftLogDetailsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});
	const [locationFilter, setLocationFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentTab, setCurrentTab] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Filter shifts based on search, date range, location, and status
	const filteredShifts = mockShifts.filter((shift) => {
		// Filter by search query (employee name or location)
		const matchesSearch =
			searchQuery === "" ||
			shift.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
			shift.location.toLowerCase().includes(searchQuery.toLowerCase());

		// Filter by date range
		const shiftDate = new Date(shift.date);
		const matchesDateRange =
			(!dateRange.from || shiftDate >= dateRange.from) &&
			(!dateRange.to || shiftDate <= dateRange.to);

		// Filter by location
		const matchesLocation =
			locationFilter === "all" || shift.location === locationFilter;

		// Filter by status
		const matchesStatus =
			statusFilter === "all" || shift.status === statusFilter;

		// Filter by tab
		const matchesTab =
			currentTab === "all" ||
			(currentTab === "variance" && shift.planned !== shift.actual);

		return (
			matchesSearch &&
			matchesDateRange &&
			matchesLocation &&
			matchesStatus &&
			matchesTab
		);
	});

	// Pagination
	const totalItems = filteredShifts.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const paginatedShifts = filteredShifts.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	// Reset to first page when filters change
	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, dateRange, locationFilter, statusFilter, currentTab]);

	const locations = [...new Set(mockShifts.map((shift) => shift.location))];
	const statuses = [...new Set(mockShifts.map((shift) => shift.status))];

	// Create location filter options in the format required by TableFilters
	const locationFilterOptions = locations.map((location) => ({
		label: location,
		value: location,
	}));

	// Get location filter label for display
	const getLocationFilterLabel = () => {
		return locationFilter === "all" ? "All Locations" : locationFilter;
	};

	// Clear all filters
	const clearAllFilters = () => {
		setSearchQuery("");
		setDateRange({ from: undefined, to: undefined });
		setLocationFilter("all");
		setStatusFilter("all");
	};

	// Check if any filters are active
	const hasActiveFilters = Boolean(
		searchQuery ||
			dateRange.from ||
			dateRange.to ||
			locationFilter !== "all" ||
			statusFilter !== "all"
	);

	// Action for the page header
	const headerActions = (
		<ExportDropdown
			data={filteredShifts}
			filename="shift-details-export"
			headers={[
				"employee",
				"date",
				"startTime",
				"endTime",
				"location",
				"status",
				"planned",
				"actual",
			]}
		/>
	);

	return (
		<>
			<PageHeader
				title="Shift Log Details"
				description="View and analyze detailed shift history records"
				actions={headerActions}
				showBackButton={true}
			/>

			<ContentContainer>
				<ContentSection
					title="Shift History Details"
					description="View and analyze past shifts, including planned vs. actual hours worked.">
					<Tabs
						value={currentTab}
						onValueChange={setCurrentTab}
						className="space-y-4">
						<div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-4">
							<TabsList>
								<TabsTrigger value="all">All Shifts</TabsTrigger>
								<TabsTrigger value="variance">Hours Variance</TabsTrigger>
							</TabsList>
						</div>

						{/* Advanced FilterGroup for date range and status */}
						<FilterGroup
							filtersActive={Boolean(
								dateRange.from || dateRange.to || statusFilter !== "all"
							)}
							onClearFilters={() => {
								setDateRange({ from: undefined, to: undefined });
								setStatusFilter("all");
							}}
							className="mt-4 mb-4">
							<div className="flex flex-col sm:flex-row gap-3">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full sm:w-auto justify-start text-left font-normal",
												!dateRange.from && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateRange.from
												? format(dateRange.from, "PPP")
												: "Start Date"}
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

								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full sm:w-auto justify-start text-left font-normal",
												!dateRange.to && "text-muted-foreground"
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateRange.to ? format(dateRange.to, "PPP") : "End Date"}
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

								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full sm:w-[180px]">
										<SelectValue placeholder="All Statuses" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										{statuses.map((status) => (
											<SelectItem
												key={status}
												value={status}>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</FilterGroup>

						{/* Filter badges display */}
						{(dateRange.from || dateRange.to || statusFilter !== "all") && (
							<div className="flex flex-wrap items-center gap-2 mb-4">
								{dateRange.from && (
									<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
										<CalendarIcon className="h-3 w-3 text-muted-foreground" />
										<span>From: {format(dateRange.from, "MMM d, yyyy")}</span>
										<button
											onClick={() =>
												setDateRange((prev) => ({ ...prev, from: undefined }))
											}
											className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
											aria-label="Remove start date filter">
											<X className="h-3 w-3 text-muted-foreground" />
										</button>
									</Badge>
								)}

								{dateRange.to && (
									<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
										<CalendarIcon className="h-3 w-3 text-muted-foreground" />
										<span>To: {format(dateRange.to, "MMM d, yyyy")}</span>
										<button
											onClick={() =>
												setDateRange((prev) => ({ ...prev, to: undefined }))
											}
											className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
											aria-label="Remove end date filter">
											<X className="h-3 w-3 text-muted-foreground" />
										</button>
									</Badge>
								)}

								{statusFilter !== "all" && (
									<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
										<span>Status: {statusFilter}</span>
										<button
											onClick={() => setStatusFilter("all")}
											className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
											aria-label="Remove status filter">
											<X className="h-3 w-3 text-muted-foreground" />
										</button>
									</Badge>
								)}
							</div>
						)}

						<TabsContent
							value="all"
							className="space-y-4">
							{filteredShifts.length === 0 ? (
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
									<DataTable
										columns={columns}
										data={paginatedShifts}
									/>
								</>
							)}
						</TabsContent>

						<TabsContent
							value="variance"
							className="space-y-4">
							{filteredShifts.filter((s) => s.planned !== s.actual).length ===
							0 ? (
								<EmptyState
									icon={<SearchX className="h-10 w-10" />}
									title="No shifts with variance found"
									description="No shifts with hours variance match your current filters."
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
									<DataTable
										columns={columns}
										data={paginatedShifts.filter((s) => s.planned !== s.actual)}
									/>
								</>
							)}
						</TabsContent>
					</Tabs>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
