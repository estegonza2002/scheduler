import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, ChevronRight } from "lucide-react";
import { Shift, Location, Employee } from "@/api";
import { useNavigate } from "react-router-dom";

interface DailyShiftsCardProps {
	date: Date;
	shifts: Shift[];
	locations: Location[];
	employees: Employee[];
}

// Helper function to format time
const formatTime = (date: Date): string => {
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

// Helper function to get location name
const getLocationName = (
	locationId: string | null | undefined,
	locations: Location[]
): string => {
	if (!locationId) return "Unassigned";
	const location = locations.find((loc) => loc.id === locationId);
	return location ? location.name : "Unknown Location";
};

// Helper function to get employee name
const getEmployeeName = (
	employeeId: string | null | undefined,
	employees: Employee[]
): string => {
	if (!employeeId) return "Unassigned";
	const employee = employees.find((emp) => emp.id === employeeId);
	return employee ? employee.name : "Unknown Employee";
};

export function DailyShiftsCard({
	date,
	shifts,
	locations,
	employees,
}: DailyShiftsCardProps) {
	const navigate = useNavigate();

	// Get total shifts and assigned employees count
	const totalShifts = shifts.length;
	const assignedEmployees = shifts.filter((shift) => shift.employeeId).length;

	return (
		<Card className="overflow-hidden hover:shadow-md hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">
							{date.toLocaleDateString("en-US", {
								weekday: "long",
								month: "long",
								day: "numeric",
							})}
						</CardTitle>
						<CardDescription>
							{totalShifts} {totalShifts === 1 ? "shift" : "shifts"} scheduled
						</CardDescription>
					</div>
					<Badge
						variant="outline"
						className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						<span>{assignedEmployees}</span>
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{shifts.map((shift) => (
						<div
							key={shift.id}
							className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 group/item"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/shifts/${shift.id}`);
							}}>
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
									<Clock className="h-4 w-4 text-primary" />
								</div>
								<div>
									<p className="font-medium text-sm">
										{formatTime(new Date(shift.startTime))} -{" "}
										{formatTime(new Date(shift.endTime))}
									</p>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<MapPin className="h-3 w-3" />
										<span>{getLocationName(shift.locationId, locations)}</span>
										{shift.employeeId && (
											<>
												<span>•</span>
												<Users className="h-3 w-3" />
												<span>
													{getEmployeeName(shift.employeeId, employees)}
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover/item:text-primary transition-transform group-hover/item:translate-x-0.5" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
