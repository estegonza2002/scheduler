import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format, parseISO, formatDistance } from "date-fns";
import {
	Calendar as CalendarIcon,
	Calendar,
	Eye,
	Pencil,
	Plus,
	Trash2,
	Search,
	Users,
	Building,
	X,
	Clock,
	CalendarDays,
	Filter,
	SlidersHorizontal,
	MoreHorizontal,
	SearchX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Shift, Schedule, ShiftsAPI } from "@/api";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ColumnDef } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DataCardGrid } from "@/components/ui/data-card-grid";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { useOrganization } from "@/lib/organization";
import { useHeader } from "@/lib/header-context";

// Define columns outside the component to prevent re-renders
const columns: ColumnDef<Schedule>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.getValue("id")}</span>
		),
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className="font-medium">
				{row.getValue("name") || "Unnamed Schedule"}
			</div>
		),
	},
	{
		accessorKey: "start_time",
		header: "Start Date",
		cell: ({ row }) => {
			const startDate = row.getValue("start_time") as string;
			return startDate ? (
				<div className="flex items-center gap-2">
					<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					<span>{format(parseISO(startDate), "MMM d, yyyy")}</span>
				</div>
			) : (
				<span className="text-muted-foreground">No start date</span>
			);
		},
	},
	{
		accessorKey: "end_time",
		header: "End Date",
		cell: ({ row }) => {
			const endDate = row.getValue("end_time") as string;
			return endDate ? (
				<div className="flex items-center gap-2">
					<CalendarIcon className="h-4 w-4 text-muted-foreground" />
					<span>{format(parseISO(endDate), "MMM d, yyyy")}</span>
				</div>
			) : (
				<span className="text-muted-foreground">No end date</span>
			);
		},
	},
	{
		accessorKey: "updated_at",
		header: "Last Updated",
		cell: ({ row }) => {
			const date = parseISO(row.getValue("updated_at") as string);
			return (
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span>{formatDistance(date, new Date(), { addSuffix: true })}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = (row.getValue("status") as string) || "active";
			return (
				<Badge
					variant={
						status === "active"
							? "default"
							: status === "completed"
							? "secondary"
							: status === "draft"
							? "outline"
							: "destructive"
					}>
					{status || "Active"}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const schedule = row.original;
			const navigate = useNavigate();

			return (
				<div className="flex items-center justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[160px]">
							<DropdownMenuItem
								onClick={() =>
									navigate(`/schedule/monthly?scheduleId=${schedule.id}`)
								}>
								<Eye className="mr-2 h-4 w-4" />
								<span>View Schedule</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => navigate(`/schedule/edit/${schedule.id}`)}>
								<Pencil className="mr-2 h-4 w-4" />
								<span>Edit Schedule</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() =>
									navigate(`/schedule/monthly?scheduleId=${schedule.id}`)
								}>
								<Calendar className="mr-2 h-4 w-4" />
								<span>Monthly View</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Delete Schedule</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

export default function SchedulesPage() {
	const { updateHeader } = useHeader();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { getCurrentOrganizationId } = useOrganization();
	const organizationId = getCurrentOrganizationId();

	// State for schedules data and loading
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Table filters
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");

	// Filter options
	const statusOptions = [
		{ value: "active", label: "Active" },
		{ value: "completed", label: "Completed" },
		{ value: "draft", label: "Draft" },
		{ value: "canceled", label: "Canceled" },
	];

	// Set page header
	useEffect(() => {
		updateHeader({
			title: "Schedules",
			description: "Manage your organization's schedules",
			actions: (
				<Button
					onClick={() => navigate("/schedule/create")}
					className="bg-primary hover:bg-primary/90 text-white">
					<Plus className="mr-2 h-4 w-4" />
					Create Schedule
				</Button>
			),
		});
	}, [updateHeader, navigate]);

	// Fetch schedules
	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				setLoading(true);
				const data = await ShiftsAPI.getAllSchedules(organizationId);
				setSchedules(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching schedules:", err);
				setError("Failed to load schedules");
			} finally {
				setLoading(false);
			}
		};

		fetchSchedules();
	}, [organizationId]);

	// Filter schedules based on search and status
	const getFilteredSchedules = () => {
		return schedules.filter((schedule) => {
			// Filter by status
			if (statusFilter && schedule.status !== statusFilter) {
				return false;
			}

			// Filter by search query
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const name = schedule.name?.toLowerCase() || "";
				const id = schedule.id.toLowerCase();
				const description = schedule.description?.toLowerCase() || "";

				return (
					name.includes(query) ||
					id.includes(query) ||
					description.includes(query)
				);
			}

			return true;
		});
	};

	const filteredSchedules = getFilteredSchedules();

	// Calculate pagination
	const totalPages = Math.ceil(filteredSchedules.length / pageSize);
	const paginatedSchedules = filteredSchedules.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Handle page size change
	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setSearchQuery("");
		setStatusFilter(null);
		setCurrentPage(1);
	};

	// Get filter label for display
	const getStatusFilterLabel = () => {
		if (!statusFilter) return "All Schedules";
		const selectedStatus = statusOptions.find(
			(status) => status.value === statusFilter
		);
		return selectedStatus ? selectedStatus.label : "All Schedules";
	};

	// Determine if any filters are active
	const hasActiveFilters = Boolean(searchQuery || statusFilter);

	// Schedule card for card view
	const ScheduleCard = ({ schedule }: { schedule: Schedule }) => {
		const startDate = schedule.start_time
			? format(parseISO(schedule.start_time), "MMM d, yyyy")
			: "No start date";
		const endDate = schedule.end_time
			? format(parseISO(schedule.end_time), "MMM d, yyyy")
			: "No end date";

		return (
			<Card
				className="cursor-pointer hover:shadow-sm transition-all border hover:border-primary"
				onClick={() => navigate(`/schedule/monthly?scheduleId=${schedule.id}`)}>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start w-full">
						<div className="flex items-center gap-2">
							<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
								<Calendar className="h-3.5 w-3.5 text-primary" />
							</div>
							<CardTitle className="text-base">
								{schedule.name || "Unnamed Schedule"}
							</CardTitle>
						</div>
						<Badge
							variant={
								schedule.status === "active"
									? "default"
									: schedule.status === "completed"
									? "secondary"
									: schedule.status === "draft"
									? "outline"
									: "destructive"
							}>
							{schedule.status || "Active"}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground font-mono ml-9">
						{schedule.id}
					</p>
				</CardHeader>
				<CardContent className="pb-4">
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							<span className="truncate">
								{startDate} to {endDate}
							</span>
						</div>

						{schedule.description && (
							<p className="text-muted-foreground line-clamp-2">
								{schedule.description}
							</p>
						)}
					</div>
				</CardContent>
				<CardFooter className="border-t pt-3 px-4">
					<div className="flex justify-end gap-2 w-full">
						<Button
							variant="outline"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/schedule/edit/${schedule.id}`);
							}}>
							<Pencil className="h-3.5 w-3.5 mr-1" />
							Edit
						</Button>
						<Button
							variant="default"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/schedule/monthly?scheduleId=${schedule.id}`);
							}}>
							<Eye className="h-3.5 w-3.5 mr-1" />
							View
						</Button>
					</div>
				</CardFooter>
			</Card>
		);
	};

	return (
		<>
			<div className="sticky top-0 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 z-40">
				<div className="flex flex-1 items-center">
					<div className="mx-4">
						<h1 className="text-lg font-semibold">Schedules</h1>
						<p className="text-xs text-muted-foreground">
							Manage and view all your organization's schedules
						</p>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3">
					<Button onClick={() => navigate("/schedule/create")}>
						<Plus className="mr-2 h-4 w-4" /> Create Schedule
					</Button>
				</div>
			</div>

			<ContentContainer>
				<ContentSection title="Schedule Management">
					{/* Applied filter badges */}
					{statusFilter && (
						<div className="flex items-center gap-2 mt-4">
							<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
								<span>{getStatusFilterLabel()}</span>
								<button
									onClick={() => setStatusFilter(null)}
									className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
									aria-label="Remove status filter">
									<X className="h-3 w-3 text-muted-foreground" />
								</button>
							</Badge>
						</div>
					)}

					{/* Schedule count */}
					<div className="mt-4">
						<p className="text-sm text-muted-foreground">
							{filteredSchedules.length === 0
								? "No schedules found"
								: `Showing ${filteredSchedules.length} schedule${
										filteredSchedules.length !== 1 ? "s" : ""
								  }`}
						</p>
					</div>

					{/* Schedules content */}
					<div className="mt-6">
						{loading ? (
							<div className="flex flex-col items-center justify-center p-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
								<p className="text-muted-foreground">Loading schedules...</p>
							</div>
						) : error ? (
							<EmptyState
								icon={<SearchX className="h-10 w-10" />}
								title="Error loading schedules"
								description={error}
								action={
									<Button
										variant="outline"
										onClick={() => window.location.reload()}>
										Try again
									</Button>
								}
							/>
						) : filteredSchedules.length === 0 ? (
							<EmptyState
								icon={<Calendar className="h-10 w-10" />}
								title="No schedules found"
								description={
									hasActiveFilters
										? "Try adjusting your search criteria or clear filters"
										: "Get started by creating your first schedule"
								}
								action={
									hasActiveFilters ? (
										<Button
											variant="outline"
											onClick={handleClearFilters}>
											Clear filters
										</Button>
									) : (
										<Button onClick={() => navigate("/schedule/create")}>
											<Plus className="mr-2 h-4 w-4" /> Create Schedule
										</Button>
									)
								}
							/>
						) : viewMode === "table" ? (
							<>
								<DataTable
									columns={columns}
									data={paginatedSchedules}
								/>
							</>
						) : (
							<DataCardGrid
								data={paginatedSchedules}
								totalItems={filteredSchedules.length}
								keyExtractor={(schedule) => schedule.id}
								pagination={{
									currentPage,
									totalPages,
									pageSize,
									onPageChange: handlePageChange,
									onPageSizeChange: handlePageSizeChange,
								}}
								renderCard={(schedule) => (
									<ScheduleCard
										key={schedule.id}
										schedule={schedule}
									/>
								)}
							/>
						)}
					</div>
				</ContentSection>
			</ContentContainer>
		</>
	);
}
