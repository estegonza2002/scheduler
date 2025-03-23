import { Plus, Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { CheckInTask, CheckOutTask } from "../../api";
import { renderTaskDescription } from "../../utils/text-formatting";

interface ShiftTasksProps {
	checkInTasks: CheckInTask[];
	checkOutTasks: CheckOutTask[];
	onCheckInTasksClick: () => void;
	onCheckOutTasksClick: () => void;
	onToggleTaskCompletion: (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => void;
	onRemoveTask: (taskType: "checkIn" | "checkOut", taskId: string) => void;
}

export function ShiftTasks({
	checkInTasks,
	checkOutTasks,
	onCheckInTasksClick,
	onCheckOutTasksClick,
	onToggleTaskCompletion,
	onRemoveTask,
}: ShiftTasksProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium flex items-center">Shift Tasks</h2>
			</div>

			{/* Check-in Tasks Card */}
			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-base font-medium flex items-center">
						Check-in Tasks
					</h3>
					<Button
						variant="outline"
						size="sm"
						onClick={onCheckInTasksClick}>
						<Plus className="h-4 w-4 mr-1" /> Add Tasks
					</Button>
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
									/>
									<div className="flex-1">
										<span
											className={
												task.completed
													? "line-through text-muted-foreground"
													: ""
											}>
											{renderTaskDescription(task.description)}
										</span>
									</div>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground"
											onClick={onCheckInTasksClick}>
											<Edit className="h-3.5 w-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-destructive"
											onClick={() => onRemoveTask("checkIn", task.id)}>
											<Trash className="h-3.5 w-3.5" />
										</Button>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : (
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
						<h3 className="text-base font-medium mb-1">
							No check-in tasks defined
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Add check-in tasks to track work needed at the start of a shift.
						</p>
						<Button onClick={onCheckInTasksClick}>
							<Plus className="h-4 w-4 mr-2" /> Add check-in tasks
						</Button>
					</div>
				)}
			</div>

			{/* Check-out Tasks Card */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-base font-medium flex items-center">
						Check-out Tasks
					</h3>
					<Button
						variant="outline"
						size="sm"
						onClick={onCheckOutTasksClick}>
						<Plus className="h-4 w-4 mr-1" /> Add Tasks
					</Button>
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
									/>
									<div className="flex-1">
										<span
											className={
												task.completed
													? "line-through text-muted-foreground"
													: ""
											}>
											{renderTaskDescription(task.description)}
										</span>
									</div>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground"
											onClick={onCheckOutTasksClick}>
											<Edit className="h-3.5 w-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-destructive"
											onClick={() => onRemoveTask("checkOut", task.id)}>
											<Trash className="h-3.5 w-3.5" />
										</Button>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : (
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
							Add check-out tasks to track work needed at the end of a shift.
						</p>
						<Button onClick={onCheckOutTasksClick}>
							<Plus className="h-4 w-4 mr-2" /> Add check-out tasks
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
