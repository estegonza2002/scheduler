import { AssignedEmployee } from "../../types/shift-types";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { DollarSign, Clock, UserMinus } from "lucide-react";
import { calculateEmployeeCost } from "../../utils/time-calculations";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface ShiftEmployeeCardProps {
	employee: AssignedEmployee;
	onRemove: (employeeId: string, assignmentId: string) => void;
	shiftStartTime: string;
	shiftEndTime: string;
	className?: string;
	isCompleted?: boolean;
}

export function ShiftEmployeeCard({
	employee,
	onRemove,
	shiftStartTime,
	shiftEndTime,
	className,
	isCompleted = false,
}: ShiftEmployeeCardProps) {
	// Calculate cost for this employee's shift
	const cost = calculateEmployeeCost(shiftStartTime, shiftEndTime, employee);

	// Generate initials for avatar
	const initials = employee.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<Card
			className={cn(
				"relative overflow-hidden group h-full transition-all hover:border-primary/50 hover:shadow-sm",
				isCompleted && "opacity-90",
				className
			)}>
			<CardContent className="p-4">
				{/* Employee avatar and status */}
				<div className="flex flex-col items-center mb-4">
					<Avatar className="h-16 w-16 mb-2">
						<AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="text-center">
						<h3 className="font-medium text-sm">{employee.name}</h3>
						<p className="text-xs text-muted-foreground">
							{employee.role || "Employee"}
						</p>
						{employee.status && (
							<span
								className={cn(
									"text-xs mt-1 inline-block px-2 py-0.5 rounded-full",
									employee.status === "active"
										? "bg-green-100 text-green-800"
										: employee.status === "invited"
										? "bg-blue-100 text-blue-800"
										: "bg-gray-100 text-gray-800"
								)}>
								{employee.status}
							</span>
						)}
					</div>
				</div>

				{/* Cost information */}
				<div className="grid grid-cols-2 gap-3 mt-3">
					<div className="bg-muted/30 rounded-md p-2 flex flex-col items-center">
						<div className="flex items-center mb-1 text-xs text-muted-foreground">
							<DollarSign className="h-3 w-3 mr-1" />
							Hourly Rate
						</div>
						<div className="font-medium text-sm">
							{employee.hourlyRate
								? `$${employee.hourlyRate.toFixed(2)}/hr`
								: "--"}
						</div>
					</div>
					<div className="bg-muted/30 rounded-md p-2 flex flex-col items-center">
						<div className="flex items-center mb-1 text-xs text-muted-foreground">
							<Clock className="h-3 w-3 mr-1" />
							Total Cost
						</div>
						<div className="font-medium text-sm">
							{cost !== "0.00" ? `$${cost}` : "--"}
						</div>
					</div>
				</div>
			</CardContent>

			{/* Action button overlay - only show if not completed */}
			{!isCompleted && (
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<div className="bg-white/80 backdrop-blur-sm rounded-md p-0.5 shadow-sm">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							onClick={() => onRemove(employee.id, employee.assignmentId)}>
							<UserMinus className="h-3.5 w-3.5 mr-1" />
							Remove
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
}
