import { Users, Plus, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { AssignedEmployee } from "../../types/shift-types";
import { EmployeeCard } from "../EmployeeCard";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

interface EmployeesSectionProps {
	assignedEmployees: AssignedEmployee[];
	availableEmployees: any[];
	shift: {
		start_time: string;
		end_time: string;
	};
	onRemoveEmployeeClick: (employeeId: string, assignmentId: string) => void;
	onAssignClick: () => void;
	isCompleted?: boolean;
}

export function EmployeesSection({
	assignedEmployees,
	availableEmployees,
	shift,
	onRemoveEmployeeClick,
	onAssignClick,
	isCompleted = false,
}: EmployeesSectionProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium flex items-center">
					<Users className="mr-2 h-5 w-5 text-muted-foreground" />
					Employees ({assignedEmployees.length})
					{isCompleted && (
						<Badge
							variant="outline"
							className="ml-2 bg-gray-100 text-gray-700">
							<Lock className="h-3 w-3 mr-1" />
							Locked
						</Badge>
					)}
				</h2>
				{!isCompleted && (
					<Button
						variant="default"
						size="sm"
						disabled={availableEmployees.length === 0}
						onClick={onAssignClick}>
						<Plus className="h-4 w-4 mr-1" /> Assign
					</Button>
				)}
			</div>

			{assignedEmployees.length === 0 ? (
				<div
					className={cn(
						"bg-white border rounded-md p-6 text-center",
						isCompleted && "bg-gray-50"
					)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3">
						<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
						<path d="m9 12 2 2 4-4" />
					</svg>
					<h3 className="text-base font-medium mb-1">No employees assigned</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{isCompleted
							? "This shift was completed without any assigned employees."
							: "Assign employees to this shift to manage staffing."}
					</p>
					{!isCompleted && (
						<Button
							disabled={availableEmployees.length === 0}
							onClick={onAssignClick}>
							<Plus className="h-4 w-4 mr-2" /> Assign Employee
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{assignedEmployees.map((employee) => (
						<EmployeeCard
							key={employee.id}
							employee={employee}
							onRemove={onRemoveEmployeeClick}
							shiftStartTime={shift.start_time}
							shiftEndTime={shift.end_time}
							isCompleted={isCompleted}
							variant="shift"
						/>
					))}
				</div>
			)}
		</div>
	);
}
