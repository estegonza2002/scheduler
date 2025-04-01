import { Shift } from "../../api";
import { AssignedEmployee } from "../../types/shift-types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { DollarSign } from "lucide-react";
import { Badge } from "../ui/badge";
import { calculateTotalCost } from "../../utils/time-calculations";

interface ShiftCostProps {
	shift: Shift;
	assignedEmployees: AssignedEmployee[];
	hasShiftEnded: boolean;
}

export function ShiftCost({
	shift,
	assignedEmployees,
	hasShiftEnded,
}: ShiftCostProps) {
	// Calculate estimated cost based on scheduled times
	const estimatedCost = calculateTotalCost(
		shift.start_time,
		shift.end_time,
		assignedEmployees
	);

	// For now, we simulate actual cost by adding a small variance
	// In the future, this would come from the actual clock-in/out data
	const getActualCost = () => {
		const estimatedCostNumber = parseFloat(estimatedCost);

		// Add a small random variance for demo purposes
		// In production, this would be based on actual reported time
		const variance = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.15);
		const actualCost = estimatedCostNumber * (1 + variance);

		return actualCost.toFixed(2);
	};

	// Only calculate actual cost if the shift has ended
	const actualCost = hasShiftEnded ? getActualCost() : estimatedCost;

	return (
		<Card className="bg-amber-50 hover:shadow-md transition-all duration-200">
			<CardHeader className="p-4 pb-2">
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
					<>
						<div className="flex justify-between font-medium items-center">
							<span className="flex items-center">
								Total Cost:
								<Badge
									variant="outline"
									className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
									Estimated
								</Badge>
							</span>
							<span className="text-xl font-semibold text-amber-600">
								${estimatedCost}
							</span>
						</div>

						{hasShiftEnded && (
							<>
								<Separator className="my-3 bg-amber-100" />
								<div className="flex justify-between font-medium items-center">
									<span className="flex items-center">
										Total Cost:
										<Badge
											variant="outline"
											className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
											Actual
										</Badge>
									</span>
									<span className="text-xl font-semibold text-green-600">
										${actualCost}
									</span>
								</div>
							</>
						)}

						<Separator className="my-3 bg-amber-100" />
						<div className="text-xs text-muted-foreground italic">
							This calculation is based on hourly rates and does not include
							overtime or benefits.
						</div>
					</>
				) : (
					<div className="text-sm text-muted-foreground">
						{assignedEmployees.length > 0
							? "Employees have no hourly rates set"
							: "No employees assigned"}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
