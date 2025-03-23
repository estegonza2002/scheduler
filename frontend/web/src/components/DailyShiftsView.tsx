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
	const [shiftsPerPage, setShiftsPerPage] = useState<number>(50);

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

	return (
		<div className="space-y-6">
			{/* Search and Filters */}
			<div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search shifts by location, employee, role or notes..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap gap-4">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium">Location</span>
						<Select
							value={locationFilter || "all"}
							onValueChange={(value) =>
								setLocationFilter(value === "all" ? null : value)
							}>
							<SelectTrigger className="w-[220px]">
								<SelectValue placeholder="All locations" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All locations ({shifts.length} shifts)
								</SelectItem>
								{uniqueLocationIds.map((id) => (
									<SelectItem
										key={id}
										value={id}>
										{getLocationName(id)} (
										{shifts.filter((s) => s.locationId === id).length})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium">Role</span>
						<Select
							value={roleFilter || "all"}
							onValueChange={(value) =>
								setRoleFilter(value === "all" ? null : value)
							}>
							<SelectTrigger className="w-[220px]">
								<SelectValue placeholder="All roles" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All roles ({shifts.length} shifts)
								</SelectItem>
								{uniqueRoles.map((role) => (
									<SelectItem
										key={role}
										value={role}>
										{role} ({shifts.filter((s) => s.role === role).length})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium">Shifts per page</span>
						<Select
							value={shiftsPerPage.toString()}
							onValueChange={(value) => {
								setShiftsPerPage(parseInt(value, 10));
								setCurrentPage(1);
							}}>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder="50" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="20">20</SelectItem>
								<SelectItem value="50">50</SelectItem>
								<SelectItem value="100">100</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Clear all filters button */}
					{(locationFilter || roleFilter || searchTerm) && (
						<div className="flex items-end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setLocationFilter(null);
									setRoleFilter(null);
									setSearchTerm("");
								}}
								className="h-9">
								<X className="h-4 w-4 mr-2" />
								Clear all filters
							</Button>
						</div>
					)}

					{/* Results info */}
					<div className="ml-auto flex items-end">
						<div className="text-sm text-muted-foreground">
							Showing {currentShifts.length} of {filteredShifts.length} filtered
							shifts (from total {shifts.length})
						</div>
					</div>
				</div>
			</div>

			{/* Pagination top */}
			{totalPages > 1 && (
				<div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}

			{/* Time-based sections */}
			<div className="space-y-6">
				{Object.entries(groupedShifts).map(([time, timeShifts]) =>
					timeShifts.length > 0 ? (
						<div
							key={time}
							className="space-y-2">
							<h3 className="text-lg font-semibold flex items-center">
								<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
								{time} ({timeShifts.length})
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
					<div className="bg-muted/50 rounded-lg p-8 text-center">
						<AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-medium mb-1">No shifts found</h3>
						<p className="text-muted-foreground">
							{locationFilter || roleFilter || searchTerm
								? "Try adjusting your filters or search term"
								: "There are no shifts scheduled for this date"}
						</p>
					</div>
				)}
			</div>

			{/* Pagination bottom */}
			{totalPages > 1 && (
				<div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
