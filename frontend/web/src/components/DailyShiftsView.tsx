import { format, parseISO } from "date-fns";
import { Shift, LocationsAPI, Location, EmployeesAPI, Employee } from "../api";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import {
	MapPin,
	Clock,
	User,
	Briefcase,
	ChevronRight,
	DollarSign,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// Format time from ISO string
const formatShiftTime = (isoString: string) => {
	return format(parseISO(isoString), "h:mm a");
};

// Format time in a more readable way for the shift cards
const formatTime = (isoString: string) => {
	return format(parseISO(isoString), "h:mm a");
};

interface DailyShiftsViewProps {
	date: Date;
	shifts: Shift[];
}

export function DailyShiftsView({ date, shifts }: DailyShiftsViewProps) {
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [employees, setEmployees] = useState<Record<string, Employee>>({});
	const [loading, setLoading] = useState(false);

	// Fetch locations and employees for the shifts
	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				// Get all location IDs from shifts
				const locationIds = [
					...new Set(
						shifts.map((shift) => shift.locationId).filter(Boolean) as string[]
					),
				];

				// Get all employee IDs from shifts
				const employeeIds = [
					...new Set(
						shifts.map((shift) => shift.employeeId).filter(Boolean) as string[]
					),
				];

				// Skip if no IDs
				if (locationIds.length === 0 && employeeIds.length === 0) {
					setLoading(false);
					return;
				}

				// Build lookup maps
				const locationsMap: Record<string, Location> = {};
				const employeesMap: Record<string, Employee> = {};

				// Fetch locations - in a real app, this would be a batch API call
				for (const locationId of locationIds) {
					try {
						const location = await LocationsAPI.getById(locationId);
						if (location) {
							locationsMap[locationId] = location;
						}
					} catch (error) {
						console.error(`Error fetching location ${locationId}:`, error);
					}
				}

				// Fetch employees - in a real app, this would be a batch API call
				for (const employeeId of employeeIds) {
					try {
						const employee = await EmployeesAPI.getById(employeeId);
						if (employee) {
							employeesMap[employeeId] = employee;
						}
					} catch (error) {
						console.error(`Error fetching employee ${employeeId}:`, error);
					}
				}

				setLocations(locationsMap);
				setEmployees(employeesMap);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [shifts]);

	// Get location-based color class for section headers
	const getLocationColor = (locationId: string) => {
		// Generate consistent colors based on locationId
		const locationColors: Record<string, string> = {
			"loc-1": "bg-blue-50 border-blue-200",
			"loc-2": "bg-purple-50 border-purple-200",
			"loc-3": "bg-green-50 border-green-200",
			"loc-4": "bg-amber-50 border-amber-200",
			"loc-5": "bg-red-50 border-red-200",
		};

		// Use hash of locationId to select a color for unknown locations
		const hash = locationId
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const colorKeys = Object.keys(locationColors);
		const defaultKey = colorKeys[hash % colorKeys.length];

		return locationColors[locationId] || locationColors[defaultKey];
	};

	// Get employee name from ID
	const getEmployeeName = (employeeId: string) => {
		const employee = employees[employeeId];
		return employee ? employee.name : `Employee ${employeeId.substring(4)}`;
	};

	// Get employee role from ID
	const getEmployeeRole = (employeeId: string) => {
		const employee = employees[employeeId];
		return employee?.role || null;
	};

	// Get employee hourly rate from ID
	const getEmployeeRate = (employeeId: string) => {
		const employee = employees[employeeId];
		return employee?.hourlyRate || null;
	};

	if (shifts.length === 0) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				<p className="text-base">
					No shifts scheduled for {format(date, "EEEE, MMMM d, yyyy")}
				</p>
			</div>
		);
	}

	// Group shifts by location
	const shiftsByLocation: Record<string, Shift[]> = {};
	const unknownLocationShifts: Shift[] = [];

	shifts.forEach((shift) => {
		if (shift.locationId) {
			if (!shiftsByLocation[shift.locationId]) {
				shiftsByLocation[shift.locationId] = [];
			}
			shiftsByLocation[shift.locationId].push(shift);
		} else {
			unknownLocationShifts.push(shift);
		}
	});

	return (
		<div className="space-y-6">
			{loading && (
				<div className="text-center text-muted-foreground py-4">
					Loading shift details...
				</div>
			)}

			{/* Render shifts grouped by location */}
			{Object.entries(shiftsByLocation).map(([locationId, locationShifts]) => {
				const location = locations[locationId];
				const locationName =
					location?.name || `Location ${locationId.substring(4)}`;
				const colorClass = getLocationColor(locationId);

				return (
					<div
						key={locationId}
						className="rounded-md overflow-hidden border">
						<div
							className={cn(
								"px-4 py-3 font-medium flex items-center justify-between",
								colorClass
							)}>
							<div className="flex items-center">
								<MapPin className="h-4 w-4 mr-2" />
								<h3 className="text-base font-semibold">{locationName}</h3>
							</div>
							<span className="text-sm bg-background/80 rounded-full px-2 py-0.5">
								{locationShifts.length} shift
								{locationShifts.length !== 1 ? "s" : ""}
							</span>
						</div>

						<div className="divide-y">
							{locationShifts.map((shift) => (
								<div
									key={shift.id}
									className="p-4 hover:bg-accent/20 transition-colors">
									<div className="flex flex-col sm:flex-row gap-3">
										{/* Left column - time */}
										<div className="flex-1">
											<div className="flex items-center text-sm font-medium mb-2">
												<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
												{formatTime(shift.startTime)} -{" "}
												{formatTime(shift.endTime)}
											</div>
										</div>

										{/* Right column - employee */}
										<div className="flex items-center text-sm bg-muted/30 px-3 py-2 rounded sm:ml-auto">
											<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary text-xs">
												{getEmployeeName(shift.employeeId).charAt(0)}
											</div>
											<div>
												<span>{getEmployeeName(shift.employeeId)}</span>
												<div className="flex items-center gap-2 mt-0.5">
													{getEmployeeRole(shift.employeeId) && (
														<p className="text-xs text-muted-foreground flex items-center">
															<Briefcase className="h-3 w-3 mr-1" />
															{getEmployeeRole(shift.employeeId)}
														</p>
													)}
													{getEmployeeRate(shift.employeeId) && (
														<Badge
															variant="outline"
															size="sm"
															className="text-xs py-0 h-4 flex items-center">
															<DollarSign className="h-2.5 w-2.5 mr-0.5" />
															{getEmployeeRate(shift.employeeId)?.toFixed(2)}/hr
														</Badge>
													)}
												</div>
											</div>
										</div>
									</div>

									{shift.notes && (
										<p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded border-l-2 border-primary/30">
											{shift.notes}
										</p>
									)}

									<div className="mt-3 flex justify-end">
										<Button
											variant="ghost"
											size="sm"
											className="text-xs"
											asChild>
											<Link to={`/shifts/${shift.id}${window.location.search}`}>
												View Details <ChevronRight className="h-3 w-3 ml-1" />
											</Link>
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			})}

			{/* Render shifts with unknown location */}
			{unknownLocationShifts.length > 0 && (
				<div className="rounded-md overflow-hidden border">
					<div className="px-4 py-3 font-medium flex items-center justify-between bg-muted">
						<div className="flex items-center">
							<MapPin className="h-4 w-4 mr-2" />
							<h3 className="text-base font-semibold">Unassigned Location</h3>
						</div>
						<span className="text-sm bg-background/80 rounded-full px-2 py-0.5">
							{unknownLocationShifts.length} shift
							{unknownLocationShifts.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="divide-y">
						{unknownLocationShifts.map((shift) => (
							<div
								key={shift.id}
								className="p-4 hover:bg-accent/20 transition-colors">
								<div className="flex flex-col sm:flex-row gap-3">
									{/* Left column - time */}
									<div className="flex-1">
										<div className="flex items-center text-sm font-medium mb-2">
											<Clock className="h-4 w-4 mr-2 text-muted-foreground" />
											{formatTime(shift.startTime)} -{" "}
											{formatTime(shift.endTime)}
										</div>
									</div>

									{/* Right column - employee */}
									<div className="flex items-center text-sm bg-muted/30 px-3 py-2 rounded sm:ml-auto">
										<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary text-xs">
											{getEmployeeName(shift.employeeId).charAt(0)}
										</div>
										<div>
											<span>{getEmployeeName(shift.employeeId)}</span>
											<div className="flex items-center gap-2 mt-0.5">
												{getEmployeeRole(shift.employeeId) && (
													<p className="text-xs text-muted-foreground flex items-center">
														<Briefcase className="h-3 w-3 mr-1" />
														{getEmployeeRole(shift.employeeId)}
													</p>
												)}
												{getEmployeeRate(shift.employeeId) && (
													<Badge
														variant="outline"
														size="sm"
														className="text-xs py-0 h-4 flex items-center">
														<DollarSign className="h-2.5 w-2.5 mr-0.5" />
														{getEmployeeRate(shift.employeeId)?.toFixed(2)}/hr
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>

								{shift.notes && (
									<p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded border-l-2 border-primary/30">
										{shift.notes}
									</p>
								)}

								<div className="mt-3 flex justify-end">
									<Button
										variant="ghost"
										size="sm"
										className="text-xs"
										asChild>
										<Link to={`/shifts/${shift.id}${window.location.search}`}>
											View Details <ChevronRight className="h-3 w-3 ml-1" />
										</Link>
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
