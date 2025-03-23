import { Users, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AssignedEmployee } from "../../types/shift-types";
import { calculateEmployeeCost } from "../../utils/time-calculations";

interface EmployeesSectionProps {
	assignedEmployees: AssignedEmployee[];
	availableEmployees: any[];
	shift: {
		startTime: string;
		endTime: string;
	};
	onRemoveEmployeeClick: (employeeId: string, assignmentId: string) => void;
	onAssignClick: () => void;
}

export function EmployeesSection({
	assignedEmployees,
	availableEmployees,
	shift,
	onRemoveEmployeeClick,
	onAssignClick,
}: EmployeesSectionProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium flex items-center">
					<Users className="mr-2 h-5 w-5 text-muted-foreground" />
					Employees ({assignedEmployees.length})
				</h2>
				<Button
					variant="default"
					size="sm"
					disabled={availableEmployees.length === 0}
					onClick={onAssignClick}>
					<Plus className="h-4 w-4 mr-1" /> Assign
				</Button>
			</div>

			{assignedEmployees.length === 0 ? (
				<div className="bg-white border rounded-md p-6 text-center">
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
						Assign employees to this shift to manage staffing.
					</p>
					<Button disabled={availableEmployees.length === 0}>
						<Plus className="h-4 w-4 mr-2" /> Assign Employee
					</Button>
				</div>
			) : (
				<div className="bg-white border rounded-md overflow-hidden">
					{/* Employee Table */}
					<table className="w-full">
						<thead>
							<tr className="bg-muted/5 border-b">
								<th className="text-left font-medium text-sm text-muted-foreground px-4 py-3">
									Employee
								</th>
								<th className="text-left font-medium text-sm text-muted-foreground px-4 py-3">
									Role
								</th>
								<th className="text-right font-medium text-sm text-muted-foreground px-4 py-3">
									Hourly Rate
								</th>
								<th className="text-right font-medium text-sm text-muted-foreground px-4 py-3">
									Cost
								</th>
								<th className="w-16 text-right px-4 py-3"></th>
							</tr>
						</thead>
						<tbody>
							{assignedEmployees.map((employee, index) => (
								<tr
									key={employee.id}
									className={`hover:bg-muted/10 transition-colors ${
										index !== assignedEmployees.length - 1 ? "border-b" : ""
									}`}>
									{/* Employee info column */}
									<td className="px-4 py-3">
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="h-10 w-10 flex-shrink-0">
												<AvatarFallback className="bg-primary/10 text-primary">
													{employee.name.charAt(0)}
												</AvatarFallback>
												{employee.avatar && (
													<AvatarImage src={employee.avatar} />
												)}
											</Avatar>

											<div className="min-w-0">
												<div className="font-medium truncate">
													{employee.name}
												</div>
												{employee.assignmentNotes && (
													<div className="text-xs text-muted-foreground mt-1 line-clamp-1">
														{employee.assignmentNotes}
													</div>
												)}
											</div>
										</div>
									</td>

									{/* Role column */}
									<td className="px-4 py-3">
										<div className="text-sm">
											{employee.assignmentRole || employee.role}
										</div>
									</td>

									{/* Hourly Rate column */}
									<td className="px-4 py-3 text-right">
										{employee.hourlyRate ? (
											<div className="text-sm">
												${employee.hourlyRate.toFixed(2)}/hr
											</div>
										) : (
											<div className="text-sm text-muted-foreground">
												Not set
											</div>
										)}
									</td>

									{/* Cost column */}
									<td className="px-4 py-3 text-right">
										{employee.hourlyRate ? (
											<div className="font-medium">
												$
												{calculateEmployeeCost(
													shift.startTime,
													shift.endTime,
													employee
												)}
											</div>
										) : (
											<div className="text-muted-foreground">—</div>
										)}
									</td>

									{/* Actions column */}
									<td className="px-4 py-3 text-right">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
											onClick={() =>
												onRemoveEmployeeClick(
													employee.id,
													employee.assignmentId
												)
											}>
											<Trash className="h-4 w-4" />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
