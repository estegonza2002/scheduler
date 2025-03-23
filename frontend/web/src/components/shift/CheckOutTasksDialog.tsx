import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { CheckOutTask } from "../../api";
import { Plus, Save, Check, X, Edit, Trash } from "lucide-react";
import { parseMentions } from "../../utils/text-formatting";

interface CheckOutTasksDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tasks: CheckOutTask[];
	onSave: (tasks: CheckOutTask[]) => void;
}

export function CheckOutTasksDialog({
	open,
	onOpenChange,
	tasks,
	onSave,
}: CheckOutTasksDialogProps) {
	const [editTasks, setEditTasks] = useState<CheckOutTask[]>([]);
	const [newTask, setNewTask] = useState("");
	const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
	const [editingTaskDescription, setEditingTaskDescription] = useState("");
	const [saving, setSaving] = useState(false);

	// Update local tasks when dialog opens
	const onDialogOpenChange = (open: boolean) => {
		if (open) {
			setEditTasks(tasks || []);
			setNewTask("");
			setEditingTaskIndex(null);
			setEditingTaskDescription("");
		}
		onOpenChange(open);
	};

	// Add a new task
	const handleAddTask = () => {
		if (!newTask.trim()) return;

		const newTaskObj: CheckOutTask = {
			id: crypto.randomUUID(),
			description: newTask.trim(),
			completed: false,
		};

		setEditTasks([...editTasks, newTaskObj]);
		setNewTask("");
	};

	// Remove a task
	const handleRemoveTask = (index: number) => {
		setEditTasks(editTasks.filter((_, i) => i !== index));
	};

	// Start editing a task
	const startEditingTask = (index: number) => {
		setEditingTaskIndex(index);
		setEditingTaskDescription(editTasks[index].description);
	};

	// Save edited task
	const saveEditedTask = () => {
		if (editingTaskIndex === null || !editingTaskDescription.trim()) return;

		const updatedTasks = [...editTasks];
		updatedTasks[editingTaskIndex] = {
			...updatedTasks[editingTaskIndex],
			description: editingTaskDescription.trim(),
		};

		setEditTasks(updatedTasks);
		setEditingTaskIndex(null);
		setEditingTaskDescription("");
	};

	// Toggle task completion status
	const toggleTaskCompletion = (index: number) => {
		const updatedTasks = [...editTasks];
		updatedTasks[index] = {
			...updatedTasks[index],
			completed: !updatedTasks[index].completed,
		};
		setEditTasks(updatedTasks);
	};

	// Handle save all tasks
	const handleSaveTasks = () => {
		setSaving(true);
		onSave(editTasks);
		setSaving(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onDialogOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Manage Check-out Tasks</DialogTitle>
					<DialogDescription>
						Add, edit, or remove check-out tasks for this shift.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="space-y-4">
						{editTasks.length === 0 ? (
							<div className="text-center py-6">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6 text-muted-foreground">
										<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
										<path d="m9 12 2 2 4-4" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold">No check-out tasks</h3>
								<p className="text-sm text-muted-foreground mt-2 mb-4">
									Add tasks that need to be completed when ending a shift.
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{editTasks.map((task, index) => (
									<div
										key={task.id}
										className="flex items-center justify-between bg-muted/30 rounded-md p-3">
										<div className="flex items-center gap-2 flex-grow">
											{editingTaskIndex === index ? (
												<div className="flex items-center gap-2 w-full">
													<div className="relative flex-grow">
														<Input
															value={editingTaskDescription}
															onChange={(e) =>
																setEditingTaskDescription(e.target.value)
															}
															autoFocus
															className="text-sm"
															placeholder="Edit task..."
														/>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-green-600 flex-shrink-0"
														onClick={saveEditedTask}>
														<Check className="h-4 w-4" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground flex-shrink-0"
														onClick={() => {
															setEditingTaskIndex(null);
															setEditingTaskDescription("");
														}}>
														<X className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<>
													<Checkbox
														id={`edit-checkout-${task.id}`}
														checked={task.completed}
														className="mt-0.5"
														onCheckedChange={() => toggleTaskCompletion(index)}
													/>
													<span
														className={`flex-grow ${
															task.completed
																? "line-through text-muted-foreground"
																: ""
														}`}
														dangerouslySetInnerHTML={{
															__html: parseMentions(task.description),
														}}
													/>
													<div className="flex items-center ml-auto">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-muted-foreground"
															onClick={() => {
																// Ensure we cleanly edit the task without HTML entities
																setEditingTaskDescription(task.description);
																startEditingTask(index);
															}}>
															<Edit className="h-3.5 w-3.5" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-muted-foreground hover:text-destructive"
															onClick={() => handleRemoveTask(index)}>
															<Trash className="h-3.5 w-3.5" />
														</Button>
													</div>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						)}

						<div className="pt-3 border-t">
							<h4 className="text-sm font-medium mb-2">Add a new task</h4>
							<div className="flex flex-col gap-2">
								<div className="relative">
									<Input
										placeholder="Add a check-out task..."
										value={newTask}
										onChange={(e) => setNewTask(e.target.value)}
										className="text-sm pr-16"
									/>
									<Button
										type="button"
										size="sm"
										className="absolute right-1 top-1 h-7"
										onClick={handleAddTask}
										disabled={!newTask.trim()}>
										Add
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSaveTasks}
						disabled={saving}
						className="gap-2">
						{saving && (
							<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
						)}
						<Save className="h-4 w-4 mr-1" /> Save Tasks
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
