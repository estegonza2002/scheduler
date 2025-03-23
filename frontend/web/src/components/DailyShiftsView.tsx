import { format, parseISO } from "date-fns";
import { Shift, Location, Employee } from "../api";
import { useState, useEffect, useMemo } from "react";
import {
	Filter,
	X,
	Clock,
	AlertCircle,
	Search,
	ChevronLeft,
	ChevronRight,
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
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShiftCard } from "./shift/ShiftCard";

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

export function DailyShiftsView({
	date,
	shifts,
	locations = [],
	employees = [],
}: DailyShiftsViewProps) {
	const navigate = useNavigate();
	const [locationFilter, setLocationFilter] = useState<string | null>(null);
	const [roleFilter, setRoleFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [shiftsPerPage, setShiftsPerPage] = useState<number>(10);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [locationFilter, roleFilter, searchTerm]);

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

	// Get unique location IDs for the filter
	const uniqueLocationIds = useMemo(() => {
		return [
			...new Set(shifts.map((shift) => shift.locationId).filter(Boolean)),
		].filter((id) => id !== null && id !== undefined) as string[];
	}, [shifts]);

	// Get unique roles for the filter
	const uniqueRoles = useMemo(() => {
		return [
			...new Set(shifts.map((shift) => shift.role).filter(Boolean)),
		].filter((role) => role !== null && role !== undefined) as string[];
	}, [shifts]);

	// Filter shifts by location, role, and search term
	const filteredShifts = useMemo(() => {
		return shifts.filter((shift) => {
			// Apply location filter
			if (locationFilter && shift.locationId !== locationFilter) {
				return false;
			}

			// Apply role filter
			if (roleFilter && shift.role !== roleFilter) {
				return false;
			}

			// Apply search filter (search in notes, employee name, location name)
			if (searchTerm) {
				const lowercaseSearch = searchTerm.toLowerCase();
				const locationName = getLocationName(shift.locationId).toLowerCase();
				const employeeName = getEmployeeName(shift.employeeId).toLowerCase();
				const notes = (shift.notes || "").toLowerCase();
				const role = (shift.role || "").toLowerCase();

				return (
					locationName.includes(lowercaseSearch) ||
					employeeName.includes(lowercaseSearch) ||
					notes.includes(lowercaseSearch) ||
					role.includes(lowercaseSearch)
				);
			}

			return true;
		});
	}, [
		shifts,
		locationFilter,
		roleFilter,
		searchTerm,
		getLocationName,
		getEmployeeName,
	]);

	// Pagination
	const totalPages = Math.ceil(filteredShifts.length / shiftsPerPage);
	const indexOfLastShift = currentPage * shiftsPerPage;
	const indexOfFirstShift = indexOfLastShift - shiftsPerPage;
	const currentShifts = filteredShifts.slice(
		indexOfFirstShift,
		indexOfLastShift
	);

	// Group shifts by time of day
	const groupedShifts = useMemo(() => {
		const groupedData = {
			morning: [] as Shift[],
			afternoon: [] as Shift[],
			evening: [] as Shift[],
		};

		currentShifts.forEach((shift) => {
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
	}, [currentShifts]);

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

	// Pagination component to avoid repetition
	const PaginationControls = () => (
		<div className="flex items-center justify-between mt-6">
			<div className="text-sm text-muted-foreground">
				Showing {currentShifts.length > 0 ? indexOfFirstShift + 1 : 0}-
				{Math.min(indexOfLastShift, filteredShifts.length)} of{" "}
				{filteredShifts.length} shifts
			</div>
			<div className="flex items-center space-x-2">
				<Select
					value={shiftsPerPage.toString()}
					onValueChange={(value) => {
						setShiftsPerPage(parseInt(value));
						setCurrentPage(1);
					}}>
					<SelectTrigger className="h-8 w-[70px]">
						<SelectValue placeholder="10" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="20">20</SelectItem>
						<SelectItem value="50">50</SelectItem>
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					className="h-8 w-8">
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<div className="text-sm">
					Page {currentPage} of {totalPages}
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					className="h-8 w-8">
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	return (
		<div className="space-y-4">
			{/* Search - without encapsulation */}
			<div className="relative mb-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search shifts by location, employee, role or notes..."
					className="pl-10"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{/* Filters - horizontal layout and consistent styling */}
			<div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
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

				<div className="flex items-center">
					<span className="text-sm mr-2">Role</span>
					<Select
						value={roleFilter || "all"}
						onValueChange={(value) =>
							setRoleFilter(value === "all" ? null : value)
						}>
						<SelectTrigger className="w-[160px] h-8">
							<SelectValue placeholder="All roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All roles</SelectItem>
							{uniqueRoles.map((role) => (
								<SelectItem
									key={role}
									value={role}>
									{role}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Clear filters button */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						setLocationFilter(null);
						setRoleFilter(null);
						setSearchTerm("");
					}}
					disabled={!locationFilter && !roleFilter && !searchTerm}
					className="h-8 ml-auto">
					<X className="h-4 w-4 mr-1" />
					Clear
				</Button>
			</div>

			{/* Active filters badges */}
			{(locationFilter || roleFilter) && (
				<div className="flex flex-wrap gap-2 mb-4">
					{locationFilter && (
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
					)}
					{roleFilter && (
						<Badge
							variant="outline"
							className="flex items-center gap-1 bg-muted/40 py-1 px-2">
							Role: {roleFilter}
							<Button
								variant="ghost"
								size="icon"
								className="h-4 w-4 ml-1 p-0"
								onClick={() => setRoleFilter(null)}>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					)}
				</div>
			)}

			{/* Time-based sections */}
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
										locations={locations}
										employees={employees}
									/>
								))}
							</div>
						</div>
					) : null
				)}

				{currentShifts.length === 0 && (
					<div className="bg-muted/30 rounded-lg p-6 text-center">
						<AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
						<h3 className="text-base font-medium mb-1">No shifts found</h3>
						<p className="text-sm text-muted-foreground">
							{locationFilter || roleFilter || searchTerm
								? "Try adjusting your filters or search term"
								: "There are no shifts scheduled for this date"}
						</p>
					</div>
				)}
			</div>

			{/* Pagination - only at the bottom */}
			{currentShifts.length > 0 && <PaginationControls />}
		</div>
	);
}
