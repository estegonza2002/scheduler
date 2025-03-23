import { format, parseISO } from "date-fns";
import { Shift, Location } from "../../api";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { Separator } from "../ui/separator";
import { calculateHours } from "../../utils/time-calculations";
import { AssignedEmployee } from "../../types/shift-types";

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
		<div className="p-5">
			<div className="flex flex-col md:flex-row md:items-start gap-5">
				{/* Left column - Basic shift details */}
				<div className="flex-grow">
					<h2 className="text-lg font-medium mb-4 flex items-center">
						<Clock className="mr-2 h-5 w-5 text-muted-foreground" />
						Shift Information
					</h2>

					{/* Time and Location in a clean grid layout */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
						<div className="flex items-center gap-3">
							<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
								<Clock className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="text-sm font-medium">Time</div>
								<div className="text-sm">
									{format(parseISO(shift.startTime), "h:mm a")} -{" "}
									{format(parseISO(shift.endTime), "h:mm a")}
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									{calculateHours(shift.startTime, shift.endTime)} hours
								</div>
							</div>
						</div>

						{/* Location information */}
						<div className="flex items-center gap-3">
							<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
								<MapPin className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="text-sm font-medium">Location</div>
								{location ? (
									<div className="text-sm">{location.name}</div>
								) : (
									<div className="text-sm text-muted-foreground">
										No location assigned
									</div>
								)}
								{location && location.address && (
									<div className="text-xs text-muted-foreground mt-1">
										{location.address}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Right column - Cost calculation */}
				<div className="md:w-80 md:border-l md:pl-5">
					<h2 className="text-lg font-medium mb-4 flex items-center">
						<DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
						Shift Cost
					</h2>

					{assignedEmployees.length > 0 &&
					assignedEmployees.some((e) => e.hourlyRate) ? (
						<div>
							{/* Simplified cost display - only total */}
							<div className="mb-4">
								<div className="flex justify-between font-medium items-center">
									<span>Total Cost:</span>
									<span className="text-xl text-primary">
										${calculateTotalCost()}
									</span>
								</div>
								<Separator className="my-3" />
								<div className="text-xs text-muted-foreground">
									This calculation is based on hourly rates and does not include
									overtime or benefits.
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-4 text-muted-foreground">
							<p className="text-sm">
								{assignedEmployees.length > 0
									? "Employees have no hourly rates set"
									: "No employees assigned"}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
