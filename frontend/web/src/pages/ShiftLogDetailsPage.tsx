import * as React from "react";
import { useState, useEffect } from "react";
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
import { format, parseISO } from "date-fns";
import {
	Calendar as CalendarIcon,
	Filter,
	Search,
	X,
	SearchX,
	Loader2,
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
import { ShiftsAPI, LocationsAPI, Employee, Location, Shift } from "@/api";
import { useParams } from "react-router-dom";

// Define the ShiftLog type that combines Shift with employee and location info
interface ShiftLog {
	id: string;
	employee: string;
	date: string;
	start_time: string;
	end_time: string;
	location: string;
	status: string;
	planned_hours: number;
	actual_hours: number;
}

// Define columns with the new data structure
const columns: ColumnDef<ShiftLog>[] = [
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
		cell: ({ row }) => (
			<span>{format(parseISO(row.getValue("date")), "MMM dd, yyyy")}</span>
		),
	},
	{
		accessorKey: "time",
		header: "Time",
		cell: ({ row }) => (
			<span>
				{format(parseISO(row.original.start_time), "h:mm a")} -{" "}
				{format(parseISO(row.original.end_time), "h:mm a")}
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
					variant={status === "completed" ? "secondary" : "destructive"}
					className="whitespace-nowrap">
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			);
		},
	},
	{
		accessorKey: "planned_hours",
		header: "Planned Hours",
		cell: ({ row }) => <span>{row.getValue("planned_hours")}</span>,
	},
	{
		accessorKey: "actual_hours",
		header: "Actual Hours",
		cell: ({ row }) => <span>{row.getValue("actual_hours")}</span>,
	},
	{
		id: "variance",
		header: "Variance",
		cell: ({ row }) => {
			const planned = row.getValue("planned_hours") as number;
			const actual = row.getValue("actual_hours") as number;
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
	const { organizationId } = useParams<{ organizationId: string }>();
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

	// Add state for API data
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locationsList, setLocationsList] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch shifts and locations on component mount
	useEffect(() => {
		const fetchData = async () => {
			if (!organizationId) return;

			try {
				setLoading(true);
				const [schedules, locationsData] = await Promise.all([
					ShiftsAPI.getAllSchedules(organizationId),
					LocationsAPI.getAll(organizationId),
				]);

				// Get all shifts from all schedules
				const allShifts = await Promise.all(
					schedules.map((schedule) =>
						ShiftsAPI.getShiftsForSchedule(schedule.id)
					)
				);

				// Flatten the array of shift arrays
				setShifts(allShifts.flat());
				setLocationsList(locationsData);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [organizationId]);

	// Transform shifts into ShiftLog format
	const transformedShifts: ShiftLog[] = shifts.map((shift) => {
		const location = locationsList.find((loc) => loc.id === shift.location_id);

		// Calculate hours
		const start = new Date(shift.start_time);
		const end = new Date(shift.end_time);
		const plannedHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

		return {
			id: shift.id,
			employee: shift.user_id || "Unassigned",
			date: shift.start_time,
			start_time: shift.start_time,
			end_time: shift.end_time,
			location: location?.name || "Unknown Location",
			status: shift.status || "scheduled",
			planned_hours: plannedHours,
			actual_hours: plannedHours, // This should come from actual check-in/out times
		};
	});

	// Filter shifts based on search, date range, location, and status
	const filteredShifts = transformedShifts.filter((shift) => {
		// Filter by search query (employee name or location)
		const matchesSearch =
			searchQuery === "" ||
			shift.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
			shift.location.toLowerCase().includes(searchQuery.toLowerCase());

		// Filter by date range
		const shiftDate = parseISO(shift.date);
		const matchesDateRange =
			(!dateRange.from || shiftDate >= dateRange.from) &&
			(!dateRange.to || shiftDate <= dateRange.to);

		// Filter by location
		const matchesLocation =
			locationFilter === "all" || shift.location === locationFilter;

		// Filter by status
		const matchesStatus =
			statusFilter === "all" || shift.status === statusFilter;

		return (
			matchesSearch && matchesDateRange && matchesLocation && matchesStatus
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

	// Get unique location names and statuses for filters
	const uniqueLocations = [
		...new Set(transformedShifts.map((shift) => shift.location)),
	];
	const uniqueStatuses = [
		...new Set(transformedShifts.map((shift) => shift.status)),
	];

	// Create location filter options in the format required by TableFilters
	const locationFilterOptions = uniqueLocations.map((location) => ({
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
				"planned_hours",
				"actual_hours",
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
										{uniqueStatuses.map((status) => (
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
							{filteredShifts.filter((s) => s.planned_hours !== s.actual_hours)
								.length === 0 ? (
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
										data={paginatedShifts.filter(
											(s) => s.planned_hours !== s.actual_hours
										)}
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
