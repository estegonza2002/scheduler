import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
	Shift,
	ShiftsAPI,
	LocationsAPI,
	EmployeesAPI,
	Location,
	Employee,
	Schedule,
	SchedulesAPI,
} from "../api";
import { format, addDays, subDays } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Filter,
	ListFilter,
	Loader2,
	Menu,
	Plus,
	Search,
	MapPin,
	X,
	LayoutGrid,
	Table,
	Calendar as CalendarComponent,
	AlertCircle,
	Maximize2,
	User,
} from "lucide-react";
import { ShiftCreationSheet } from "../components/ShiftCreationSheet";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DataTable } from "../components/ui/data-table";

// Export the ShiftCreationSheet with its props for use in the AppLayout
export function getHeaderActions() {
	// Get the URL parameters
	const [searchParams] = useSearchParams();
	const dateParam = searchParams.get("date");
	const currentDate = dateParam ? new Date(dateParam) : new Date();
	const organizationId = searchParams.get("organizationId") || "org-1";

	// In a real app, you would fetch this or store it in context
	const selectedSchedule = "sch-4"; // Spring 2025 schedule

	return (
		<ShiftCreationSheet
			scheduleId={selectedSchedule}
			organizationId={organizationId}
			initialDate={currentDate}
			trigger={
				<Button className="bg-primary hover:bg-primary/90 text-white h-9">
					<Plus className="h-5 w-5 mr-2" />
					Create Shift
				</Button>
			}
		/>
	);
}

export default function DailyShiftsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("shifts");
	const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
	const organizationId = searchParams.get("organizationId") || "org-1"; // Default to first org
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
	const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(25);

	// Get date from URL param or use today's date
	useEffect(() => {
		const dateParam = searchParams.get("date");
		if (dateParam) {
			setCurrentDate(new Date(dateParam));
		}
	}, [searchParams]);

	const updateDate = (newDate: Date) => {
		setCurrentDate(newDate);
		setSearchParams({
			...Object.fromEntries(searchParams.entries()),
			date: newDate.toISOString().split("T")[0],
		});
	};

	// Apply filters to shifts
	useEffect(() => {
		let result = [...shifts];

		// Apply search term filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter((shift) => {
				const locationMatch = locations
					.find((loc) => loc.id === shift.locationId)
					?.name?.toLowerCase()
					.includes(term);
				const employeeMatch = employees
					.find((emp) => emp.id === shift.employeeId)
					?.name?.toLowerCase()
					.includes(term);
				const timeMatch =
					format(new Date(shift.startTime), "h:mm a")
						.toLowerCase()
						.includes(term) ||
					format(new Date(shift.endTime), "h:mm a")
						.toLowerCase()
						.includes(term);

				return locationMatch || employeeMatch || timeMatch;
			});
		}

		// Apply location filter
		if (selectedLocationIds.length > 0) {
			result = result.filter((shift) =>
				selectedLocationIds.includes(shift.locationId || "")
			);
		}

		// Apply employee filter
		if (selectedEmployeeIds.length > 0) {
			result = result.filter((shift) =>
				selectedEmployeeIds.includes(shift.employeeId || "")
			);
		}

		setFilteredShifts(result);
	}, [
		shifts,
		searchTerm,
		selectedLocationIds,
		selectedEmployeeIds,
		locations,
		employees,
	]);

	// Reset filters
	const resetFilters = () => {
		setSearchTerm("");
		setSelectedLocationIds([]);
		setSelectedEmployeeIds([]);
	};

	// Toggle location filter
	const toggleLocationFilter = (locationId: string) => {
		setSelectedLocationIds((prev) =>
			prev.includes(locationId)
				? prev.filter((id) => id !== locationId)
				: [...prev, locationId]
		);
	};

	// Toggle employee filter
	const toggleEmployeeFilter = (employeeId: string) => {
		setSelectedEmployeeIds((prev) =>
			prev.includes(employeeId)
				? prev.filter((id) => id !== employeeId)
				: [...prev, employeeId]
		);
	};

	// Fetch schedules and shifts
	const fetchShifts = async () => {
		try {
			setLoading(true);
			setLoadingPhase("shifts");

			// Get schedules
			const fetchedSchedules = await SchedulesAPI.getAll(organizationId);
			setSchedules(fetchedSchedules);

			const defaultSchedule = "sch-4"; // Updated to Spring 2025 schedule
			if (!selectedSchedule) {
				setSelectedSchedule(defaultSchedule);
			}

			// Format date for API
			const formattedDate = currentDate.toISOString().split("T")[0];
			console.log("Fetching shifts for date:", formattedDate);

			// Get shifts for this date
			const allShifts = await ShiftsAPI.getAll(formattedDate);

			console.log("API returned shifts:", allShifts);

			// No need to filter shifts here as the API should do that
			setShifts(allShifts);
			setFilteredShifts(allShifts);

			// Get all unique location IDs from the shifts
			setLoadingPhase("locations");
			const locationIds = [
				...new Set(allShifts.map((shift) => shift.locationId).filter(Boolean)),
			];

			// Get all unique employee IDs from the shifts
			setLoadingPhase("employees");
			const employeeIds = [
				...new Set(allShifts.map((shift) => shift.employeeId).filter(Boolean)),
			];

			// Batch fetch locations and employees in parallel
			try {
				const [fetchedLocations, fetchedEmployees] = await Promise.all([
					// Fetch all locations for the organization instead of individual lookups
					LocationsAPI.getAll(organizationId),

					// Fetch all employees for the organization instead of individual lookups
					EmployeesAPI.getAll(organizationId),
				]);

				setLocations(fetchedLocations);
				setEmployees(fetchedEmployees);
			} catch (error) {
				console.error("Error fetching related data:", error);
			}
		} catch (error) {
			console.error("Error fetching shifts:", error);
		} finally {
			setLoading(false);
			setLoadingPhase("");
		}
	};

	// Initialize data on component mount and when date changes
	useEffect(() => {
		fetchShifts();
	}, [currentDate, organizationId, selectedSchedule]);

	// Helper functions directly included in the page
	const formatTime = (date: Date): string => {
		return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
	};

	// Helper functions from getDailyShiftsData function
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

		return assignedEmployees;
	};

	// Calculate pagination
	const totalItems = filteredShifts.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginatedShifts = filteredShifts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedLocationIds, selectedEmployeeIds, viewMode]);

	// Render the shift card
	const ShiftCard = ({ shift }: { shift: Shift }) => {
		const assignedEmployees = getAssignedEmployees(shift);
		const hasEmployees = assignedEmployees.length > 0;

		return (
			<Card
				className="cursor-pointer hover:shadow-md transition-all border"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardHeader className="pb-1 px-3 pt-3">
					<div className="flex justify-between items-center w-full">
						<h3 className="font-medium text-sm">
							{formatTime(new Date(shift.startTime))} -{" "}
							{formatTime(new Date(shift.endTime))}
						</h3>
						{hasEmployees ? (
							<div className="flex items-center gap-1">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="text-xs text-muted-foreground">
									{assignedEmployees.length}
								</span>
							</div>
						) : (
							<div className="flex items-center gap-1">
								<User className="h-4 w-4 text-destructive" />
								<span className="text-xs text-destructive">0</span>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="pt-0 px-3 pb-3">
					<div className="flex items-center text-sm text-muted-foreground">
						<MapPin className="h-4 w-4 mr-1" />
						<span>{getLocationName(shift.locationId)}</span>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Table columns with rendering
	const tableColumns = [
		{
			accessorKey: "time",
			header: "Time",
			cell: ({ row }: { row: any }) => {
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
			cell: ({ row }: { row: any }) => (
				<div>{getLocationName(row.original.locationId)}</div>
			),
		},
		{
			accessorKey: "employees",
			header: "Employees",
			cell: ({ row }: { row: any }) => {
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
			cell: ({ row }: { row: any }) => {
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
	];

	// Empty state component
	const EmptyShiftsState = () => (
		<div className="flex flex-col items-center justify-center py-8 my-4 border rounded-md bg-muted/10">
			<CalendarComponent className="h-12 w-12 mb-3 text-muted-foreground" />
			<div className="text-xl font-medium mb-2">No shifts scheduled</div>
			<div className="text-muted-foreground mb-4">
				No shifts scheduled for {format(currentDate, "EEEE, MMMM d, yyyy")}
			</div>
			<ShiftCreationSheet
				scheduleId={selectedSchedule || ""}
				organizationId={organizationId}
				initialDate={currentDate}
				trigger={
					<Button className="bg-primary hover:bg-primary/90 text-white h-9">
						<Plus className="h-5 w-5 mr-2" />
						Create Shift
					</Button>
				}
			/>
		</div>
	);

	return (
		<>
			<div className="flex flex-col h-[calc(100vh-80px)]">
				{/* Header without the bottom border */}
				<div className="p-4 bg-background">
					<h1 className="text-3xl font-bold leading-tight tracking-tighter mb-2">
						{format(currentDate, "EEEE, MMMM d, yyyy")}
					</h1>
					<p className="text-lg text-muted-foreground mb-6">
						Shifts for {format(currentDate, "MMM d")}
					</p>

					{/* Date navigation and view options in a single row */}
					<div className="flex items-center justify-between gap-3">
						{/* Left group: Date navigation */}
						<div className="flex items-center gap-3">
							<div className="flex items-center rounded-md border">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-r-none border-r h-9 w-9"
									onClick={() => updateDate(subDays(currentDate, 1))}>
									<ChevronLeft className="h-5 w-5" />
								</Button>

								<Button
									variant="ghost"
									className="h-9 px-3 rounded-none border-r"
									onClick={() => updateDate(new Date())}>
									Today
								</Button>

								<Button
									variant="ghost"
									size="icon"
									className="rounded-l-none h-9 w-9"
									onClick={() => updateDate(addDays(currentDate, 1))}>
									<ChevronRight className="h-5 w-5" />
								</Button>
							</div>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="flex items-center gap-2 h-9">
										<CalendarIcon className="h-5 w-5" />
										<span>Choose Date</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="center">
									<Calendar
										mode="single"
										selected={currentDate}
										onSelect={(date) => date && updateDate(date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Right group: View options */}
						<div className="flex items-center gap-3">
							{/* View mode switcher */}
							<div className="flex items-center border rounded-md">
								<Button
									variant="ghost"
									size="icon"
									className={`rounded-l-md rounded-r-none h-9 w-9 ${
										viewMode === "cards"
											? "bg-background shadow-sm"
											: "bg-transparent hover:bg-transparent"
									}`}
									onClick={() => setViewMode("cards")}>
									<LayoutGrid className="h-5 w-5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className={`rounded-l-none rounded-r-md h-9 w-9 ${
										viewMode === "table"
											? "bg-background shadow-sm"
											: "bg-transparent hover:bg-transparent"
									}`}
									onClick={() => setViewMode("table")}>
									<Table className="h-5 w-5" />
								</Button>
							</div>

							<Button
								variant="outline"
								className="flex items-center gap-2 h-9"
								onClick={() =>
									navigate(
										`/schedule/monthly?date=${format(
											currentDate,
											"yyyy-MM-dd"
										)}&scheduleId=${
											selectedSchedule || ""
										}&organizationId=${organizationId}`
									)
								}>
								<Maximize2 className="h-5 w-5" />
								<span>Monthly View</span>
							</Button>
						</div>
					</div>

					{/* Search and filters directly in the header section */}
					<div className="flex flex-wrap items-center gap-2 mt-4">
						<div className="relative flex-1 min-w-[300px]">
							<Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
							<Input
								placeholder="Search shifts by location, employee, or time..."
								className="pl-9 h-9"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="flex items-center gap-2 h-9">
										<MapPin className="h-5 w-5" />
										<span>Locations</span>
										{selectedLocationIds.length > 0 && (
											<Badge
												variant="secondary"
												className="ml-1">
												{selectedLocationIds.length}
											</Badge>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-[200px]">
									<DropdownMenuLabel>Filter by location</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{locations.map((location) => (
										<DropdownMenuCheckboxItem
											key={location.id}
											checked={selectedLocationIds.includes(location.id)}
											onCheckedChange={() => toggleLocationFilter(location.id)}>
											{location.name}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="flex items-center gap-2 h-9">
										<User className="h-5 w-5" />
										<span>Employees</span>
										{selectedEmployeeIds.length > 0 && (
											<Badge
												variant="secondary"
												className="ml-1">
												{selectedEmployeeIds.length}
											</Badge>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-[200px]">
									<DropdownMenuLabel>Filter by employee</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{employees.map((employee) => (
										<DropdownMenuCheckboxItem
											key={employee.id}
											checked={selectedEmployeeIds.includes(employee.id)}
											onCheckedChange={() => toggleEmployeeFilter(employee.id)}>
											{employee.name}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{(selectedLocationIds.length > 0 ||
								selectedEmployeeIds.length > 0 ||
								searchTerm) && (
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={resetFilters}
									title="Clear filters">
									<X className="h-5 w-5" />
								</Button>
							)}
						</div>
					</div>

					{/* Active filters */}
					{(selectedLocationIds.length > 0 ||
						selectedEmployeeIds.length > 0) && (
						<div className="flex flex-wrap gap-2 mt-3">
							{selectedLocationIds.map((id) => (
								<Badge
									key={id}
									variant="outline"
									className="flex items-center gap-1 py-1 px-2">
									<MapPin className="h-4 w-4" />
									{getLocationName(id)}
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5 ml-1 p-0 hover:bg-muted"
										onClick={() => toggleLocationFilter(id)}>
										<X className="h-4 w-4" />
									</Button>
								</Badge>
							))}

							{selectedEmployeeIds.map((id) => (
								<Badge
									key={id}
									variant="outline"
									className="flex items-center gap-1 py-1 px-2">
									<User className="h-4 w-4" />
									{getEmployeeName(id)}
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5 ml-1 p-0 hover:bg-muted"
										onClick={() => toggleEmployeeFilter(id)}>
										<X className="h-4 w-4" />
									</Button>
								</Badge>
							))}

							<Button
								variant="ghost"
								size="sm"
								className="text-xs h-7"
								onClick={resetFilters}>
								Clear all
							</Button>
						</div>
					)}
				</div>

				{/* Main Content Layout */}
				<div className="flex flex-1 overflow-hidden">
					{/* Main Content Area */}
					<div className="flex-1 overflow-auto">
						<div className="p-4">
							<div className="flex flex-col gap-4">
								{/* Hidden select schedule field */}
								<div className="hidden">
									<Select
										value={selectedSchedule || ""}
										onValueChange={(value) => setSelectedSchedule(value)}
										disabled={loading}>
										<SelectTrigger
											id="schedule-select"
											className="mt-1 mb-4">
											<SelectValue placeholder="Select a schedule" />
										</SelectTrigger>
										<SelectContent>
											{schedules.map((schedule) => (
												<SelectItem
													key={schedule.id}
													value={schedule.id}>
													{schedule.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{loading && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground p-4 border rounded-md">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>
											{loadingPhase === "shifts"
												? "Loading shifts..."
												: loadingPhase === "locations"
												? "Loading locations..."
												: "Loading employees..."}
										</span>
									</div>
								)}

								{!loading && shifts.length === 0 && <EmptyShiftsState />}

								{!loading && shifts.length > 0 && (
									<>
										{filteredShifts.length === 0 ? (
											<div className="flex flex-col items-center justify-center p-6 border rounded-md">
												<AlertCircle className="h-6 w-6 mb-3 text-muted-foreground" />
												<div className="text-lg font-medium mb-2">
													No shifts found
												</div>
												<div className="text-muted-foreground">
													Try adjusting your search or filters
												</div>
											</div>
										) : (
											<>
												{/* Table View */}
												{viewMode === "table" && (
													<div className="rounded-md overflow-hidden">
														<DataTable
															columns={tableColumns}
															data={filteredShifts}
															externalPagination={{
																pageIndex: currentPage - 1, // Convert from 1-based to 0-based
																pageSize: itemsPerPage,
																totalItems: totalItems,
																setPageIndex: (pageIndex) =>
																	setCurrentPage(pageIndex + 1), // Convert from 0-based to 1-based
																setPageSize: (pageSize) => {
																	setItemsPerPage(pageSize);
																	setCurrentPage(1);
																},
															}}
														/>
													</div>
												)}

												{/* Card View */}
												{viewMode === "cards" && (
													<>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
															{paginatedShifts.map((shift) => (
																<ShiftCard
																	key={shift.id}
																	shift={shift}
																/>
															))}
														</div>

														{/* Use DataTable pagination for Card View as well */}
														{filteredShifts.length > 0 && (
															<DataTable
																columns={[]}
																data={[]}
																hideTable={true}
																externalPagination={{
																	pageIndex: currentPage - 1, // Convert from 1-based to 0-based
																	pageSize: itemsPerPage,
																	totalItems: totalItems,
																	setPageIndex: (pageIndex) =>
																		setCurrentPage(pageIndex + 1), // Convert from 0-based to 1-based
																	setPageSize: (pageSize) => {
																		setItemsPerPage(pageSize);
																		setCurrentPage(1);
																	},
																}}
															/>
														)}
													</>
												)}
											</>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
