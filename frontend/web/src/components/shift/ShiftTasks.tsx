import { Plus, Edit, Trash, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ShiftTask } from "../../api";
import { renderTaskDescription } from "../../utils/text-formatting";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

interface ShiftTasksProps {
	checkInTasks: ShiftTask[];
	checkOutTasks: ShiftTask[];
	onCheckInTasksClick: () => void;
	onCheckOutTasksClick: () => void;
	onToggleTaskCompletion: (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => void;
	onRemoveTask: (taskType: "checkIn" | "checkOut", taskId: string) => void;
	isCompleted?: boolean;
}

export function ShiftTasks({
	checkInTasks,
	checkOutTasks,
	onCheckInTasksClick,
	onCheckOutTasksClick,
	onToggleTaskCompletion,
	onRemoveTask,
	isCompleted = false,
}: ShiftTasksProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium flex items-center">
					Shift Tasks
					{isCompleted && (
						<Badge
							variant="outline"
							className="ml-2 bg-gray-100 text-gray-700">
							<Lock className="h-3 w-3 mr-1" />
							Locked
						</Badge>
					)}
				</h2>
			</div>

			{/* Check-in Tasks Card */}
			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-base font-medium flex items-center">
						Check-in Tasks
					</h3>
					{!isCompleted && (
						<Button
							variant="outline"
							size="sm"
							onClick={onCheckInTasksClick}
							disabled={isCompleted}>
							<Plus className="h-4 w-4 mr-1" /> Add Tasks
						</Button>
					)}
				</div>

				{checkInTasks && checkInTasks.length > 0 ? (
					<div className="bg-white border rounded-md overflow-hidden">
						<ul className="divide-y">
							{checkInTasks.map((task) => (
								<li
									key={task.id}
									className="flex items-center px-4 py-3 gap-3">
									<Checkbox
										id={`checkin-${task.id}`}
										checked={task.completed}
										className="mt-0"
										onCheckedChange={() =>
											onToggleTaskCompletion("checkIn", task.id)
										}
										disabled={isCompleted}
									/>
									<div className="flex-1">
										<span
											className={
												task.completed
													? "line-through text-muted-foreground"
													: ""
											}>
											{renderTaskDescription(task.title)}
										</span>
									</div>
									{!isCompleted && (
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground"
												onClick={onCheckInTasksClick}
												disabled={isCompleted}>
												<Edit className="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-destructive"
												onClick={() => onRemoveTask("checkIn", task.id)}
												disabled={isCompleted}>
												<Trash className="h-3.5 w-3.5" />
											</Button>
										</div>
									)}
								</li>
							))}
						</ul>
					</div>
				) : (
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
						<h3 className="text-base font-medium mb-1">
							No check-in tasks defined
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							{isCompleted
								? "This shift was completed without any check-in tasks."
								: "Add check-in tasks to track work needed at the start of a shift."}
						</p>
						{!isCompleted && (
							<Button
								onClick={onCheckInTasksClick}
								disabled={isCompleted}>
								<Plus className="h-4 w-4 mr-2" /> Add check-in tasks
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Check-out Tasks Card */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-base font-medium flex items-center">
						Check-out Tasks
					</h3>
					{!isCompleted && (
						<Button
							variant="outline"
							size="sm"
							onClick={onCheckOutTasksClick}
							disabled={isCompleted}>
							<Plus className="h-4 w-4 mr-1" /> Add Tasks
						</Button>
					)}
				</div>

				{checkOutTasks && checkOutTasks.length > 0 ? (
					<div className="bg-white border rounded-md overflow-hidden">
						<ul className="divide-y">
							{checkOutTasks.map((task) => (
								<li
									key={task.id}
									className="flex items-center px-4 py-3 gap-3">
									<Checkbox
										id={`checkout-${task.id}`}
										checked={task.completed}
										className="mt-0"
										onCheckedChange={() =>
											onToggleTaskCompletion("checkOut", task.id)
										}
										disabled={isCompleted}
									/>
									<div className="flex-1">
										<span
											className={
												task.completed
													? "line-through text-muted-foreground"
													: ""
											}>
											{renderTaskDescription(task.title)}
										</span>
									</div>
									{!isCompleted && (
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground"
												onClick={onCheckOutTasksClick}
												disabled={isCompleted}>
												<Edit className="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-destructive"
												onClick={() => onRemoveTask("checkOut", task.id)}
												disabled={isCompleted}>
												<Trash className="h-3.5 w-3.5" />
											</Button>
										</div>
									)}
								</li>
							))}
						</ul>
					</div>
				) : (
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
							<rect
								width="18"
								height="18"
								x="3"
								y="3"
								rx="2"
							/>
							<path d="M8 12h8" />
						</svg>
						<h3 className="text-base font-medium mb-1">
							No check-out tasks defined
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							{isCompleted
								? "This shift was completed without any check-out tasks."
								: "Add check-out tasks to track work needed at the end of a shift."}
						</p>
						{!isCompleted && (
							<Button
								onClick={onCheckOutTasksClick}
								disabled={isCompleted}>
								<Plus className="h-4 w-4 mr-2" /> Add check-out tasks
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
