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
	if (!location) {
		console.warn(
			`Location not found with ID: ${locationId}. Available location IDs:`,
			locations.map((loc) => loc.id)
		);
		return "Unassigned";
	}
	return location.name;
};

// Helper function to get employee name
const getEmployeeName = (
	userId: string | null | undefined,
	employees: Employee[]
): string => {
	if (!userId) return "Unassigned";
	const employee = employees.find((emp) => emp.id === userId);
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
	const assignedEmployees = shifts.filter((shift) => shift.user_id).length;

	return (
		<Card
			className="hover:shadow-sm transition-all border hover:border-primary cursor-pointer"
			onClick={() =>
				navigate(`/daily-shifts/${date.toISOString().split("T")[0]}`)
			}>
			<CardHeader className="pb-2 px-4 pt-4">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center">
						<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
							<Clock className="h-3.5 w-3.5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-base">
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
					</div>
					<Badge
						variant="outline"
						className="flex items-center gap-1">
						<Users className="h-3.5 w-3.5 text-muted-foreground" />
						<span>{assignedEmployees}</span>
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="px-4 pb-4">
				<div className="space-y-3">
					{shifts.map((shift) => (
						<div
							key={shift.id}
							className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/shifts/${shift.id}`);
							}}>
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
									<Clock className="h-3 w-3 text-primary" />
								</div>
								<div>
									<p className="font-medium text-sm">
										{formatTime(new Date(shift.start_time))} -{" "}
										{formatTime(new Date(shift.end_time))}
									</p>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<MapPin className="h-3 w-3" />
										<span className="truncate">
											{getLocationName(shift.location_id, locations)}
										</span>
										{shift.user_id && (
											<>
												<span>•</span>
												<Users className="h-3 w-3" />
												<span className="truncate">
													{getEmployeeName(shift.user_id, employees)}
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
