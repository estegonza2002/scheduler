import { format, parseISO } from "date-fns";
import { Shift, Location } from "../../api";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { Separator } from "../ui/separator";
import { calculateHours } from "../../utils/time-calculations";
import { AssignedEmployee } from "../../types/shift-types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ShiftInformationProps {
	shift: Shift;
	location: Location | null;
	assignedEmployees: AssignedEmployee[];
	calculateTotalCost: () => string;
}

export function ShiftInformation({
	shift,
	location,
	assignedEmployees,
	calculateTotalCost,
}: ShiftInformationProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			{/* Time Card */}
			<Card className="bg-white hover:shadow-md transition-all duration-200 rounded-lg border-2 border-blue-200 overflow-hidden group">
				<CardHeader className="p-4 pb-2 bg-gradient-to-r from-blue-50 to-white">
					<CardTitle className="flex items-center gap-2 text-blue-700">
						<div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
							<Clock className="h-5 w-5 text-blue-700" />
						</div>
						Time
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-3">
					<div>
						<div className="text-sm font-medium">
							{format(parseISO(shift.start_time), "h:mm a")} -{" "}
							{format(parseISO(shift.end_time), "h:mm a")}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{calculateHours(shift.start_time, shift.end_time)} hours
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Location Card */}
			<Card className="bg-white hover:shadow-md transition-all duration-200 rounded-lg border-2 border-green-200 overflow-hidden group">
				<CardHeader className="p-4 pb-2 bg-gradient-to-r from-green-50 to-white">
					<CardTitle className="flex items-center gap-2 text-green-700">
						<div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
							<MapPin className="h-5 w-5 text-green-700" />
						</div>
						Location
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-3">
					{location ? (
						<div>
							<div className="text-sm font-medium">{location.name}</div>
							{location.address && (
								<div className="text-xs text-muted-foreground mt-1">
									{location.address}
								</div>
							)}
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							No location assigned
						</div>
					)}
				</CardContent>
			</Card>

			{/* Shift Cost Card */}
			<Card className="bg-white hover:shadow-md transition-all duration-200 rounded-lg border-2 border-amber-200 overflow-hidden group">
				<CardHeader className="p-4 pb-2 bg-gradient-to-r from-amber-50 to-white">
					<CardTitle className="flex items-center gap-2 text-amber-700">
						<div className="bg-amber-100 p-2 rounded-full group-hover:bg-amber-200 transition-colors">
							<DollarSign className="h-5 w-5 text-amber-700" />
						</div>
						Shift Cost
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-3">
					{assignedEmployees.length > 0 &&
					assignedEmployees.some((e) => e.hourlyRate) ? (
						<div>
							<div className="flex justify-between font-medium items-center">
								<span>Total Cost:</span>
								<span className="text-xl font-semibold text-amber-600">
									${calculateTotalCost()}
								</span>
							</div>
							<Separator className="my-3 bg-amber-100" />
							<div className="text-xs text-muted-foreground italic">
								This calculation is based on hourly rates and does not include
								overtime or benefits.
							</div>
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							{assignedEmployees.length > 0
								? "Employees have no hourly rates set"
								: "No employees assigned"}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
