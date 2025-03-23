import { format, parseISO } from "date-fns";
import { Shift, Location, Employee } from "../api";
import { useState, useMemo } from "react";
import {
	Filter,
	X,
	AlertCircle,
	Search,
	LayoutGrid,
	Table,
	Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DataTable } from "./ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Helper functions
const formatTime = (date: Date): string => {
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const truncateText = (text: string, maxLength: number): string => {
	return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

interface DailyShiftsViewProps {
	date: Date;
	shifts: Shift[];
	locations: Location[];
	employees: Employee[];
}

type ViewMode = "table" | "cards";

export function DailyShiftsView({
	date,
	shifts,
	locations = [],
	employees = [],
}: DailyShiftsViewProps) {
	const navigate = useNavigate();
	const [locationFilter, setLocationFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("cards");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(12);

	// Reset page when filters change
	useMemo(() => {
		setCurrentPage(1);
	}, [locationFilter, searchTerm, viewMode]);

	// Helper functions
	const getLocationName = (locationId: string | null | undefined): string => {
		if (!locationId) return "Unassigned";
		const location = locations.find((loc) => loc.id === locationId);
		return location ? location.name : "Unknown Location";
	};

	const getEmployeeName = (employeeId: string | null | undefined): string => {
		if (!employeeId) return "Unassigned";
		const employee = employees.find((emp) => emp.id === employeeId);
		return employee ? employee.name : "Unknown Employee";
	};

	// Get assigned employees (returns an array of employee objects)
	const getAssignedEmployees = (shift: Shift): Employee[] => {
		// Primary employee (in real app this would be expanded to include all assigned employees)
		const assignedEmployees: Employee[] = [];

		if (shift.employeeId) {
			const employee = employees.find((emp) => emp.id === shift.employeeId);
			if (employee) {
				assignedEmployees.push(employee);
			}
		}

		// In a real app, we would also get additional assigned employees
		// For example: shift.assignedEmployeeIds?.forEach(id => {...})

		return assignedEmployees;
	};

	const getEmployeeInitials = (
		employeeId: string | null | undefined
	): string => {
		if (!employeeId) return "UN";
		const employee = employees.find((emp) => emp.id === employeeId);
		if (!employee) return "??";

		const nameParts = employee.name.split(" ");
		if (nameParts.length >= 2) {
			return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
		}
		return employee.name.substring(0, 2).toUpperCase();
	};

	// Column definitions for DataTable
	const columns = useMemo<ColumnDef<Shift>[]>(
		() => [
			{
				accessorKey: "time",
				header: "Time",
				cell: ({ row }) => {
					const shift = row.original;
					return (
						<div>
							{formatTime(new Date(shift.startTime))} -{" "}
							{formatTime(new Date(shift.endTime))}
						</div>
					);
				},
			},
			{
				accessorKey: "location",
				header: "Location",
				cell: ({ row }) => (
					<div>{getLocationName(row.original.locationId)}</div>
				),
			},
			{
				accessorKey: "employees",
				header: "Employees",
				cell: ({ row }) => {
					const shift = row.original;
					const assignedEmployees = getAssignedEmployees(shift);
					const hasEmployees = assignedEmployees.length > 0;

					return (
						<div>
							{hasEmployees ? (
								<Badge variant="outline">
									{assignedEmployees.length}{" "}
									{assignedEmployees.length === 1 ? "employee" : "employees"}
								</Badge>
							) : (
								<Badge variant="destructive">No employees</Badge>
							)}
						</div>
					);
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					return (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate(`/shifts/${row.original.id}`)}>
							View
						</Button>
					);
				},
			},
		],
		[navigate, getLocationName, employees]
	);

	// Get unique location IDs for the filter
	const uniqueLocationIds = useMemo(() => {
		return [
			...new Set(shifts.map((shift) => shift.locationId).filter(Boolean)),
		].filter((id) => id !== null && id !== undefined) as string[];
	}, [shifts]);

	// Filter shifts by location and search term
	const filteredShifts = useMemo(() => {
		return shifts.filter((shift) => {
			// Apply location filter
			if (locationFilter && shift.locationId !== locationFilter) {
				return false;
			}

			// Apply search filter (search in employee name, location name)
			if (searchTerm) {
				const lowercaseSearch = searchTerm.toLowerCase();
				const locationName = getLocationName(shift.locationId).toLowerCase();

				// Check if any assigned employee matches search
				const assignedEmployees = getAssignedEmployees(shift);
				const employeeMatches = assignedEmployees.some((emp) =>
					emp.name.toLowerCase().includes(lowercaseSearch)
				);

				return locationName.includes(lowercaseSearch) || employeeMatches;
			}

			return true;
		});
	}, [
		shifts,
		locationFilter,
		searchTerm,
		getLocationName,
		getAssignedEmployees,
	]);

	// Calculate pagination
	const totalItems = filteredShifts.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginatedShifts = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredShifts.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredShifts, currentPage, itemsPerPage]);

	// Group shifts by time of day for card view
	const groupedShifts = useMemo(() => {
		const groupedData = {
			morning: [] as Shift[],
			afternoon: [] as Shift[],
			evening: [] as Shift[],
		};

		// Use paginatedShifts instead of filteredShifts for cards view pagination
		paginatedShifts.forEach((shift) => {
			const startHour = parseISO(shift.startTime).getHours();

			if (startHour < 12) {
				groupedData.morning.push(shift);
			} else if (startHour < 17) {
				groupedData.afternoon.push(shift);
			} else {
				groupedData.evening.push(shift);
			}
		});

		return groupedData;
	}, [paginatedShifts]);

	// Shift Card Component
	const ShiftCard = ({ shift }: { shift: Shift }) => {
		const assignedEmployees = getAssignedEmployees(shift);
		const hasEmployees = assignedEmployees.length > 0;

		return (
			<Card
				className={`overflow-hidden hover:shadow-md transition-all cursor-pointer group relative ${
					hasEmployees
						? "hover:border-primary hover:bg-primary/5"
						: "border-destructive hover:bg-destructive/5"
				}`}
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-3">
					<div className="flex justify-between items-start">
						<div className="w-full">
							<div className="flex justify-between items-center w-full">
								<h3
									className={`font-medium text-sm ${
										hasEmployees
											? "group-hover:text-primary"
											: "text-destructive group-hover:text-destructive"
									}`}>
									{formatTime(new Date(shift.startTime))} -{" "}
									{formatTime(new Date(shift.endTime))}
								</h3>
								{hasEmployees ? (
									<Badge
										variant="outline"
										className="text-xs">
										{assignedEmployees.length}{" "}
										{assignedEmployees.length === 1 ? "employee" : "employees"}
									</Badge>
								) : (
									<Badge
										variant="destructive"
										className="text-xs">
										No employees
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground mb-2">
								{getLocationName(shift.locationId)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Pagination Controls component
	const PaginationControls = () => (
		<div className="flex items-center justify-between mt-6">
			<div className="text-sm text-muted-foreground">
				Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-
				{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
				shifts
			</div>

			<div className="flex items-center space-x-2">
				<Select
					value={itemsPerPage.toString()}
					onValueChange={(value) => {
						setItemsPerPage(parseInt(value));
						setCurrentPage(1);
					}}>
					<SelectTrigger className="w-[70px] h-8">
						<SelectValue placeholder={itemsPerPage.toString()} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="12">12</SelectItem>
						<SelectItem value="24">24</SelectItem>
						<SelectItem value="36">36</SelectItem>
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
					disabled={currentPage === 1}
					className="h-8">
					Previous
				</Button>

				<div className="text-sm">
					Page {currentPage} of {totalPages || 1}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						setCurrentPage((prev) => Math.min(totalPages, prev + 1))
					}
					disabled={currentPage === totalPages || totalPages === 0}
					className="h-8">
					Next
				</Button>
			</div>
		</div>
	);

	// Show empty state if no shifts
	if (shifts.length === 0) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				<p className="text-base">
					No shifts scheduled for {format(date, "EEEE, MMMM d, yyyy")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search bar */}
			<div className="relative mb-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search shifts by location or employee..."
					className="pl-10"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{/* Filters and view toggle */}
			<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mb-4">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
					<div className="flex items-center">
						<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
						<span className="text-sm font-medium">Filters</span>
					</div>

					<div className="flex items-center">
						<span className="text-sm mr-2">Location</span>
						<Select
							value={locationFilter || "all"}
							onValueChange={(value) =>
								setLocationFilter(value === "all" ? null : value)
							}>
							<SelectTrigger className="w-[160px] h-8">
								<SelectValue placeholder="All locations" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All locations</SelectItem>
								{uniqueLocationIds.map((id) => (
									<SelectItem
										key={id}
										value={id}>
										{getLocationName(id)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Clear filters button */}
					{(locationFilter || searchTerm) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setLocationFilter(null);
								setSearchTerm("");
							}}
							className="h-8">
							<X className="h-4 w-4 mr-1" />
							Clear
						</Button>
					)}
				</div>

				{/* View toggle */}
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "cards" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("cards")}
						className="flex items-center gap-1">
						<LayoutGrid className="h-4 w-4" />
						<span className="hidden sm:inline">Cards</span>
					</Button>
					<Button
						variant={viewMode === "table" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("table")}
						className="flex items-center gap-1">
						<Table className="h-4 w-4" />
						<span className="hidden sm:inline">Table</span>
					</Button>
				</div>
			</div>

			{/* Active filters badges */}
			{locationFilter && (
				<div className="flex flex-wrap gap-2 mb-4">
					<Badge
						variant="outline"
						className="flex items-center gap-1 bg-muted/40 py-1 px-2">
						Location: {getLocationName(locationFilter)}
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4 ml-1 p-0"
							onClick={() => setLocationFilter(null)}>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				</div>
			)}

			{/* Empty state */}
			{filteredShifts.length === 0 ? (
				<div className="bg-muted/30 rounded-lg p-6 text-center">
					<AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
					<h3 className="text-base font-medium mb-1">No shifts found</h3>
					<p className="text-sm text-muted-foreground">
						{locationFilter || searchTerm
							? "Try adjusting your filters or search term"
							: "There are no shifts scheduled for this date"}
					</p>
				</div>
			) : (
				<>
					{/* Table View */}
					{viewMode === "table" && (
						<DataTable
							columns={columns}
							data={filteredShifts}
						/>
					)}

					{/* Card View */}
					{viewMode === "cards" && (
						<>
							<div className="space-y-5">
								{Object.entries(groupedShifts).map(([time, timeShifts]) =>
									timeShifts.length > 0 ? (
										<div
											key={time}
											className="space-y-3">
											<h3 className="text-sm font-medium flex items-center text-muted-foreground">
												<Clock className="h-4 w-4 mr-2" />
												{time.charAt(0).toUpperCase() + time.slice(1)} (
												{timeShifts.length})
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
												{timeShifts.map((shift) => (
													<ShiftCard
														key={shift.id}
														shift={shift}
													/>
												))}
											</div>
										</div>
									) : null
								)}
							</div>

							{/* Pagination for Card View */}
							{filteredShifts.length > 0 && <PaginationControls />}
						</>
					)}
				</>
			)}
		</div>
	);
}
