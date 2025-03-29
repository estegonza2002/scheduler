import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/api";
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
	Table as TableIcon,
	Calendar as CalendarComponent,
	AlertCircle,
	Maximize2,
	User,
	SearchX,
	List,
	Clock,
	CalendarX,
} from "lucide-react";
import { ShiftCreationSheet } from "@/components/ShiftCreationSheet";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ColumnDef } from "@tanstack/react-table";
import { DataCardGrid } from "@/components/ui/data-card-grid";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { toast } from "sonner";

export default function DailyShiftsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		return dateParam ? new Date(dateParam) : new Date();
	});
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("shifts");
	const [selectedSchedule, setSelectedSchedule] = useState<string>("");
	const organizationId = useOrganizationId();
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(25);
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

	// Fetch schedules and shifts
	const fetchShifts = async () => {
		try {
			setLoading(true);
			setLoadingPhase("shifts");

			// Fetch schedules first
			const schedules = await ShiftsAPI.getAllSchedules(organizationId);
			setSchedules(schedules);

			// If no schedule is selected, use the first one
			const targetSchedule = selectedSchedule || schedules[0]?.id || "";
			if (!selectedSchedule && schedules[0]?.id) {
				setSelectedSchedule(schedules[0].id);
			}

			if (!targetSchedule) {
				setShifts([]);
				return;
			}

			// Fetch shifts for the selected schedule
			const shifts = await ShiftsAPI.getShiftsForSchedule(targetSchedule);

			// Filter shifts for the current date
			const dateStr = format(currentDate, "yyyy-MM-dd");
			const filteredShifts = shifts.filter((shift) => {
				const shiftDate = format(new Date(shift.start_time), "yyyy-MM-dd");
				return shiftDate === dateStr;
			});

			setShifts(filteredShifts);

			// Fetch locations and employees for the organization
			const [locations, employees] = await Promise.all([
				LocationsAPI.getAll(organizationId),
				EmployeesAPI.getAll(organizationId),
			]);

			setLocations(locations);
			setEmployees(employees);
		} catch (error) {
			console.error("Error fetching shifts:", error);
			toast.error("Failed to fetch shifts");
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

		if (shift.user_id) {
			const employee = employees.find((emp) => emp.id === shift.user_id);
			if (employee) {
				assignedEmployees.push(employee);
			}
		}

		return assignedEmployees;
	};

	// Calculate pagination for card view
	const paginatedShifts = shifts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Render the shift card
	const ShiftCard = ({ shift }: { shift: Shift }) => {
		const assignedEmployees = getAssignedEmployees(shift);
		const hasEmployees = assignedEmployees.length > 0;

		return (
			<Card
				className="cursor-pointer hover:shadow-sm transition-all border hover:border-primary"
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardHeader className="pb-1 px-4 pt-4">
					<div className="flex justify-between items-center w-full">
						<h3 className="font-medium text-sm flex items-center">
							<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
								<Clock className="h-3.5 w-3.5 text-primary" />
							</div>
							{formatTime(new Date(shift.start_time))} -{" "}
							{formatTime(new Date(shift.end_time))}
						</h3>
						{hasEmployees ? (
							<Badge
								variant="outline"
								className="flex items-center gap-1">
								<User className="h-3.5 w-3.5 text-muted-foreground" />
								<span>{assignedEmployees.length}</span>
							</Badge>
						) : (
							<Badge
								variant="destructive"
								className="flex items-center gap-1">
								<AlertCircle className="h-3.5 w-3.5" />
								<span>Open</span>
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="pt-1 px-4 pb-4">
					<div className="text-xs text-muted-foreground mb-1.5 flex items-center">
						<MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
						<span className="truncate">
							{getLocationName(shift.location_id)}
						</span>
					</div>
					{shift.name && (
						<p className="text-sm font-medium truncate">{shift.name}</p>
					)}
					{shift.description && (
						<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
							{shift.description}
						</p>
					)}
				</CardContent>
			</Card>
		);
	};

	// Define columns outside the component to prevent re-renders
	const tableColumns: ColumnDef<Shift>[] = [
		{
			accessorKey: "time",
			header: "Time",
			cell: ({ row }) => {
				const shift = row.original;
				return (
					<div>
						{formatTime(new Date(shift.start_time))} -{" "}
						{formatTime(new Date(shift.end_time))}
					</div>
				);
			},
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => (
				<div className="flex items-center">
					<MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
					<span>{getLocationName(row.original.location_id)}</span>
				</div>
			),
			filterFn: (row, id, filterValue) => {
				const location = getLocationName(row.original.location_id);
				return location.toLowerCase().includes(filterValue.toLowerCase());
			},
		},
		{
			accessorKey: "employee",
			header: "Employees",
			cell: ({ row }) => {
				const shift = row.original;
				const assignedEmployees = getAssignedEmployees(shift);
				const hasEmployees = assignedEmployees.length > 0;

				return (
					<div>
						{hasEmployees ? (
							<Badge
								variant="outline"
								className="flex items-center gap-1">
								<User className="h-3.5 w-3.5 text-muted-foreground" />
								<span>
									{assignedEmployees.length}{" "}
									{assignedEmployees.length === 1 ? "employee" : "employees"}
								</span>
							</Badge>
						) : (
							<Badge
								variant="destructive"
								className="flex items-center gap-1">
								<AlertCircle className="h-3.5 w-3.5" />
								<span>No employees</span>
							</Badge>
						)}
					</div>
				);
			},
			filterFn: (row, id, filterValue) => {
				const employee = getEmployeeName(row.original.user_id);
				return employee.toLowerCase().includes(filterValue.toLowerCase());
			},
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => {
				return (
					<div className="flex justify-end">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate(`/shifts/${row.original.id}`)}>
							View
						</Button>
					</div>
				);
			},
		},
	];

	// Export the ShiftCreationSheet with its props for use in the AppLayout
	function getHeaderActions() {
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

	return (
		<>
			<PageHeader
				title="Daily Shifts"
				description={`Shifts for ${format(currentDate, "EEEE, MMMM d, yyyy")}`}
				actions={
					<ShiftCreationSheet
						scheduleId={selectedSchedule}
						organizationId={organizationId}
						initialDate={currentDate}
						trigger={
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Shift
							</Button>
						}
					/>
				}
			/>

			<ContentContainer>
				<ContentSection
					title={`Shifts for ${format(currentDate, "MMMM d, yyyy")}`}
					description={`${shifts.length} shift${
						shifts.length !== 1 ? "s" : ""
					} scheduled`}
					headerActions={
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => updateDate(subDays(currentDate, 1))}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="h-8 px-4 gap-2">
										<CalendarIcon className="h-4 w-4 opacity-70" />
										{format(currentDate, "MMMM d, yyyy")}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start">
									<Calendar
										mode="single"
										selected={currentDate}
										onSelect={(date) => date && updateDate(date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<Button
								variant="outline"
								size="sm"
								onClick={() => updateDate(addDays(currentDate, 1))}>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => updateDate(new Date())}>
								Today
							</Button>
							<Separator
								orientation="vertical"
								className="h-8"
							/>
							<Button
								variant="outline"
								className="flex items-center gap-2 h-8"
								onClick={() =>
									navigate(
										`/schedule/monthly?date=${format(
											currentDate,
											"yyyy-MM-dd"
										)}`
									)
								}>
								<Maximize2 className="h-4 w-4" />
								<span>Monthly View</span>
							</Button>
						</div>
					}>
					{/* Shifts display with standardized patterns */}
					{loading ? (
						<div className="flex flex-col items-center justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
							<p className="text-muted-foreground">Loading {loadingPhase}...</p>
						</div>
					) : shifts.length === 0 ? (
						<EmptyState
							title="No shifts found"
							description="There are no shifts scheduled for this date."
							icon={<CalendarComponent className="h-10 w-10" />}
							action={
								<ShiftCreationSheet
									scheduleId={selectedSchedule}
									organizationId={organizationId}
									initialDate={currentDate}
									trigger={
										<Button size="lg">
											<Plus className="h-4 w-4 mr-2" />
											Add Shift
										</Button>
									}
								/>
							}
						/>
					) : (
						<>
							{/* Standalone filters above the table */}
							<div className="flex flex-wrap gap-4 mb-4">
								<div className="flex-1 min-w-[200px]">
									<label className="text-sm font-medium mb-1.5 block">
										Date
									</label>
									<DatePicker
										value={currentDate}
										onChange={(date) => {
											if (date) {
												setCurrentDate(date);
												navigate(`/shifts/daily/${format(date, "yyyy-MM-dd")}`);
											}
										}}
										className="w-[240px]"
									/>
								</div>
								<div className="flex-1 min-w-[200px]">
									<label className="text-sm font-medium mb-1.5 block">
										Location
									</label>
									<Select
										value={selectedLocation || ""}
										onValueChange={(value) =>
											setSelectedLocation(value === "" ? null : value)
										}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="All Locations" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All Locations</SelectItem>
											{locations.map((location) => (
												<SelectItem
													key={location.id}
													value={location.id}>
													{location.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Table without custom filters */}
							<DataTable
								columns={tableColumns}
								data={shifts.filter(
									(shift) =>
										!selectedLocation || shift.location_id === selectedLocation
								)}
								searchKey="location"
								searchPlaceholder="Search shifts..."
								viewOptions={{
									enableViewToggle: true,
									defaultView: viewMode,
									onViewChange: setViewMode,
									renderCard: (shift: Shift) => <ShiftCard shift={shift} />,
									enableFullscreen: true,
								}}
								onRowClick={(shift) => navigate(`/shifts/${shift.id}`)}
							/>
						</>
					)}
				</ContentSection>
			</ContentContainer>
		</>
	);
}
