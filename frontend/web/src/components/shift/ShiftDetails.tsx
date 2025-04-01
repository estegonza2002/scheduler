import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Shift,
	Employee,
	Location,
	ShiftTask,
	ShiftsAPI,
	LocationsAPI,
	EmployeesAPI,
	ShiftAssignmentsAPI,
	ShiftAssignment,
} from "../../api";
import { toast } from "sonner";
import { ShiftHeader } from "./ShiftHeader";
import { ShiftInformation } from "./ShiftInformation";
import { EmployeesSection } from "./EmployeesSection";
import { ShiftNotes } from "./ShiftNotes";
import { ShiftTasks } from "./ShiftTasks";
import { AssignEmployeeDialog } from "./AssignEmployeeDialog";
import { ShiftNotesDialog } from "./ShiftNotesDialog";
import { CheckInTasksDialog } from "./CheckInTasksDialog";
import { CheckOutTasksDialog } from "./CheckOutTasksDialog";
import { AssignedEmployee } from "../../types/shift-types";
import {
	calculateTotalCost,
	calculateHours,
} from "../../utils/time-calculations";
import { cn } from "../../lib/utils";
import {
	Loader2,
	ArrowLeft,
	Edit,
	Trash,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Info,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useNotificationsContext } from "../../lib/notification-context";
import { ShiftReport } from "./ShiftReport";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogCancel,
	AlertDialogAction,
} from "../ui/alert-dialog";
import { useHeader } from "../../lib/header-context";
import { Badge } from "../ui/badge";
import { ShiftStatus } from "./ShiftStatus";
import { Link } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

// Define API access functions
const getShift = async (shiftId: string): Promise<Shift | null> => {
	console.log(`Getting shift with ID: ${shiftId}`);
	return ShiftsAPI.getShiftById(shiftId);
};

const getLocation = async (locationId: string): Promise<Location | null> => {
	console.log(`Getting location with ID: ${locationId}`);
	return LocationsAPI.getById(locationId);
};

const getShiftAssignments = async (
	shiftId: string
): Promise<ShiftAssignment[]> => {
	console.log(`Getting assignments for shift: ${shiftId}`);
	return ShiftAssignmentsAPI.getAll(shiftId);
};

const getEmployee = async (employeeId: string): Promise<Employee | null> => {
	console.log(`Getting employee with ID: ${employeeId}`);
	return EmployeesAPI.getById(employeeId);
};

const getEmployees = async (orgId: string): Promise<Employee[]> => {
	console.log(`Getting employees for org: ${orgId}`);
	return EmployeesAPI.getAll(orgId);
};

const updateShift = async (
	shiftId: string,
	shiftData: Partial<Shift>
): Promise<Shift | null> => {
	console.log(`Updating shift with ID: ${shiftId}`);
	return ShiftsAPI.updateShift(shiftId, shiftData);
};

const deleteShift = async (shiftId: string): Promise<void> => {
	console.log(`Deleting shift with ID: ${shiftId}`);
	return ShiftsAPI.deleteShift(shiftId);
};

const createShiftAssignment = async (
	assignmentData: Omit<ShiftAssignment, "id">
): Promise<ShiftAssignment> => {
	console.log(`Creating assignment for shift: ${assignmentData.shift_id}`);
	return ShiftAssignmentsAPI.create(assignmentData);
};

const deleteShiftAssignment = async (assignmentId: string): Promise<void> => {
	console.log(`Deleting assignment with ID: ${assignmentId}`);
	return ShiftAssignmentsAPI.delete(assignmentId);
};

interface ShiftDetailsProps {
	hideHeader?: boolean;
}

// Function to determine if shift is completed (end time is in the past)
const isShiftCompleted = (shift: Shift): boolean => {
	const endTime = new Date(shift.end_time);
	const now = new Date();
	return now > endTime;
};

// Function to determine if shift is in progress
const isShiftInProgress = (shift: Shift): boolean => {
	const startTime = new Date(shift.start_time);
	const endTime = new Date(shift.end_time);
	const now = new Date();
	return now >= startTime && now <= endTime;
};

// Function to determine if shift is upcoming
const isShiftUpcoming = (shift: Shift): boolean => {
	const startTime = new Date(shift.start_time);
	const now = new Date();
	return now < startTime;
};

export function ShiftDetails({ hideHeader = false }: ShiftDetailsProps) {
	const { shiftId } = useParams<{ shiftId: string }>();
	const navigate = useNavigate();
	const { updateHeader } = useHeader();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [shift, setShift] = useState<Shift | null>(null);
	const [location, setLocation] = useState<Location | null>(null);
	const [assignedEmployees, setAssignedEmployees] = useState<
		AssignedEmployee[]
	>([]);
	const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
	const [localCheckInTasks, setLocalCheckInTasks] = useState<ShiftTask[]>([]);
	const [localCheckOutTasks, setLocalCheckOutTasks] = useState<ShiftTask[]>([]);
	const [localNotes, setLocalNotes] = useState("");
	const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(
		[]
	);

	// Dialog states
	const [assignEmployeeDialogOpen, setAssignEmployeeDialogOpen] =
		useState(false);
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [checkInTasksDialogOpen, setCheckInTasksDialogOpen] = useState(false);
	const [checkOutTasksDialogOpen, setCheckOutTasksDialogOpen] = useState(false);
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
	const [removeEmployeeAlertOpen, setRemoveEmployeeAlertOpen] = useState(false);
	const [employeeToRemove, setEmployeeToRemove] = useState<{
		id: string;
		assignmentId: string;
	} | null>(null);

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			if (!shiftId) return;

			setLoading(true);

			try {
				// Load shift and related data from API
				const shiftData = await getShift(shiftId);
				setShift(shiftData);

				if (!shiftData) {
					console.error("Shift not found");
					return;
				}

				// Load location data
				if (shiftData.location_id) {
					const locationData = await getLocation(shiftData.location_id);
					setLocation(locationData);
				}

				// Load shift assignments and associated employees
				const assignmentsData = await getShiftAssignments(shiftId);
				setShiftAssignments(assignmentsData);

				// For each assignment, fetch the employee details
				const assignedEmployeePromises = assignmentsData.map(
					async (assignment) => {
						const employee = await getEmployee(assignment.employee_id);
						if (employee) {
							return {
								...employee,
								assignmentId: assignment.id,
							};
						}
						return null;
					}
				);

				const assignedEmployeeData = await Promise.all(
					assignedEmployeePromises
				);
				const filteredEmployees = assignedEmployeeData.filter(
					(item) => item !== null
				) as AssignedEmployee[];
				setAssignedEmployees(filteredEmployees);

				// Set check-in/check-out tasks and notes
				if (shiftData.check_in_tasks) {
					setLocalCheckInTasks(shiftData.check_in_tasks);
				}

				if (shiftData.check_out_tasks) {
					setLocalCheckOutTasks(shiftData.check_out_tasks);
				}

				if (shiftData.description) {
					setLocalNotes(shiftData.description);
				}

				// Load available employees
				if (shiftData.organization_id) {
					const employeesData = await getEmployees(shiftData.organization_id);
					setAvailableEmployees(employeesData);
				}
			} catch (error) {
				console.error("Error loading shift data:", error);
				toast.error("Failed to load shift data");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [shiftId]);

	// Save shift changes
	const saveShift = async (updatedShift: Partial<Shift>) => {
		if (!shift || !shiftId) return;

		setSaving(true);

		try {
			const result = await updateShift(shiftId, updatedShift);
			if (result) {
				setShift(result);
				toast.success("Shift updated successfully");
			} else {
				toast.error("Failed to update shift");
			}
		} catch (error) {
			console.error("Error updating shift:", error);
			toast.error("Error updating shift");
		} finally {
			setSaving(false);
		}
	};

	// Handle delete shift
	const handleDeleteShift = async () => {
		if (!shift || !shiftId) return;

		try {
			setSaving(true);
			await deleteShift(shiftId);
			toast.success("Shift deleted successfully");
			// Navigate back to overview
			navigate("/schedule");
		} catch (error) {
			console.error("Error deleting shift:", error);
			toast.error("Failed to delete shift");
		} finally {
			setSaving(false);
			setDeleteAlertOpen(false);
		}
	};

	// Handle employee assignment
	const handleAssignEmployees = async (employees: AssignedEmployee[]) => {
		if (!shift || !shiftId) return;

		try {
			setSaving(true);

			// Get the newly assigned employees (not in current assigned list)
			const currentIds = assignedEmployees.map((emp) => emp.id);
			const newAssignments = employees.filter(
				(emp) => !currentIds.includes(emp.id)
			);

			// Create new assignments
			const assignmentPromises = newAssignments.map((emp) =>
				createShiftAssignment({
					shift_id: shiftId,
					employee_id: emp.id,
				})
			);

			await Promise.all(assignmentPromises);
			setAssignedEmployees(employees);

			// Update available employees list
			const assignedIds = employees.map((emp) => emp.id);
			setAvailableEmployees((prevAvailable) =>
				prevAvailable.filter((emp) => !assignedIds.includes(emp.id))
			);

			toast.success("Employees assigned successfully");
		} catch (error) {
			console.error("Error assigning employees:", error);
			toast.error("Failed to assign employees");
		} finally {
			setSaving(false);
		}
	};

	// Handle remove employee
	const handleRemoveEmployee = (employeeId: string, assignmentId: string) => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}

		setEmployeeToRemove({ id: employeeId, assignmentId });
		setRemoveEmployeeAlertOpen(true);
	};

	// Actually remove employee after confirmation
	const confirmRemoveEmployee = async () => {
		if (!shift || !employeeToRemove) return;

		try {
			setSaving(true);
			await deleteShiftAssignment(employeeToRemove.assignmentId);

			// Update UI state
			const removedEmployee = assignedEmployees.find(
				(emp) => emp.id === employeeToRemove.id
			);
			setAssignedEmployees((prev) =>
				prev.filter((emp) => emp.id !== employeeToRemove.id)
			);

			if (removedEmployee) {
				// Add back to available employees
				const employeeWithoutAssignment = {
					...removedEmployee,
				} as Employee;
				delete (employeeWithoutAssignment as any).assignmentId;

				setAvailableEmployees((prev) => [...prev, employeeWithoutAssignment]);
			}

			toast.success("Employee removed from shift");
		} catch (error) {
			console.error("Error removing employee:", error);
			toast.error("Failed to remove employee");
		} finally {
			setSaving(false);
			setRemoveEmployeeAlertOpen(false);
			setEmployeeToRemove(null);
		}
	};

	// Handle notes update
	const handleSaveNotes = async (notes: string) => {
		setLocalNotes(notes);
		await saveShift({ description: notes });
		toast.success("Notes saved successfully");
	};

	// Handle check-in tasks update
	const handleSaveCheckInTasks = async (tasks: ShiftTask[]) => {
		setLocalCheckInTasks(tasks);
		await saveShift({ check_in_tasks: tasks });
		toast.success("Check-in tasks saved successfully");
	};

	// Handle check-out tasks update
	const handleSaveCheckOutTasks = async (tasks: ShiftTask[]) => {
		setLocalCheckOutTasks(tasks);
		await saveShift({ check_out_tasks: tasks });
		toast.success("Check-out tasks saved successfully");
	};

	// Format date for URL parameters
	const formatDateParam = (date: string) => {
		return format(parseISO(date), "yyyy-MM-dd");
	};

	// Calculate total cost for shift
	const calculateShiftCost = useCallback(() => {
		if (assignedEmployees.length === 0) return "0.00";

		return calculateTotalCost(
			shift?.start_time || "",
			shift?.end_time || "",
			assignedEmployees
		);
	}, [assignedEmployees, shift]);

	// Check if shift has ended
	const hasShiftEnded = useCallback(() => {
		if (!shift) return false;
		const endTime = new Date(shift.end_time);
		const now = new Date();
		return endTime < now;
	}, [shift]);

	// Handle assign employees dialog open
	const handleAssignEmployeeDialogOpen = () => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}
		setAssignEmployeeDialogOpen(true);
	};

	// Handle notes dialog open
	const handleNotesDialogOpen = () => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}
		setNotesDialogOpen(true);
	};

	// Handle checkin tasks dialog open
	const handleCheckInTasksDialogOpen = () => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}
		setCheckInTasksDialogOpen(true);
	};

	// Handle checkout tasks dialog open
	const handleCheckOutTasksDialogOpen = () => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}
		setCheckOutTasksDialogOpen(true);
	};

	// Handle toggle task completion
	const handleToggleTaskCompletion = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}

		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckInTasks(updatedTasks);

			saveShift({ check_in_tasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckOutTasks(updatedTasks);

			saveShift({ check_out_tasks: updatedTasks });
		}
	};

	// Handle remove task
	const handleRemoveTask = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}

		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckInTasks(updatedTasks);

			saveShift({ check_in_tasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckOutTasks(updatedTasks);

			saveShift({ check_out_tasks: updatedTasks });
		}
	};

	// Update global header when shift data is loaded
	useEffect(() => {
		if (hideHeader && shift) {
			const isCompleted = hasShiftEnded();

			// Create actions for the header
			const actions = (
				<div className="flex items-center gap-2">
					{!isCompleted ? (
						<>
							<Button
								variant="outline"
								size="sm"
								className="h-9 gap-1"
								onClick={() => navigate(`/edit-shift/${shiftId}`)}>
								<Edit className="h-4 w-4" />
								Edit Shift
							</Button>

							<Button
								variant="outline"
								size="sm"
								className="h-9 text-destructive border-destructive/30"
								onClick={() => setDeleteAlertOpen(true)}>
								<Trash className="h-4 w-4 mr-2" /> Delete
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								className="h-9 gap-1"
								disabled>
								<Edit className="h-4 w-4" />
								Edit Shift
							</Button>

							<Button
								variant="outline"
								size="sm"
								className="h-9 text-muted-foreground border-muted/30"
								disabled>
								<Trash className="h-4 w-4 mr-2" /> Delete
							</Button>
						</>
					)}
				</div>
			);

			// Update the header content
			updateHeader({
				title: "Shift Details",
				description: `${format(
					parseISO(shift.start_time),
					"EEEE, MMMM d, yyyy"
				)} · 
					${format(parseISO(shift.start_time), "h:mm a")} - 
					${format(parseISO(shift.end_time), "h:mm a")} · 
					${
						assignedEmployees.length > 0
							? `${assignedEmployees.length} Assigned`
							: "Unassigned"
					}`,
				actions: actions,
				showBackButton: true,
			});
		}
	}, [
		hideHeader,
		shift,
		assignedEmployees.length,
		hasShiftEnded,
		shiftId,
		navigate,
		updateHeader,
	]);

	// Check if shift is in progress
	const isInProgress = useCallback(() => {
		if (!shift) return false;
		const startTime = new Date(shift.start_time);
		const endTime = new Date(shift.end_time);
		const now = new Date();
		return now >= startTime && now <= endTime;
	}, [shift]);

	// Check if shift is upcoming
	const isUpcoming = useCallback(() => {
		if (!shift) return false;
		const startTime = new Date(shift.start_time);
		const now = new Date();
		return now < startTime;
	}, [shift]);

	// Render status banner based on shift status
	const renderStatusBanner = () => {
		if (!shift) return null;

		if (hasShiftEnded()) {
			return (
				<Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
					<CheckCircle2 className="h-4 w-4" />
					<AlertTitle>Completed Shift</AlertTitle>
					<AlertDescription>
						This shift has been completed. You are viewing the final report.
					</AlertDescription>
				</Alert>
			);
		} else if (isInProgress()) {
			return (
				<Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
					<Clock className="h-4 w-4" />
					<AlertTitle>In Progress</AlertTitle>
					<AlertDescription>
						This shift is currently in progress.
					</AlertDescription>
				</Alert>
			);
		} else if (isUpcoming()) {
			return (
				<Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-6">
					<Info className="h-4 w-4" />
					<AlertTitle>Upcoming Shift</AlertTitle>
					<AlertDescription>
						This shift is scheduled to start on{" "}
						{format(
							parseISO(shift.start_time),
							"EEEE, MMMM d, yyyy 'at' h:mm a"
						)}
						.
					</AlertDescription>
				</Alert>
			);
		}

		return null;
	};

	// Render main content based on loading state
	const renderContent = () => {
		if (loading) {
			return (
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground ml-3">Loading shift details...</p>
				</div>
			);
		}

		if (!shift) {
			return (
				<div className="flex flex-col items-center justify-center h-64">
					<p className="text-lg font-medium">Shift not found</p>
					<p className="text-muted-foreground">
						The requested shift does not exist or has been deleted.
					</p>
				</div>
			);
		}

		return (
			<>
				{/* Status Banner */}
				{renderStatusBanner()}

				{/* Shift Header */}
				{!hideHeader && (
					<ShiftHeader
						shift={shift}
						assignedEmployeesCount={assignedEmployees.length}
						onDeleteClick={handleDeleteShift}
						onEditClick={() => {
							if (shift?.id) {
								navigate(`/shifts/${shift.id}/edit`);
							}
						}}
						deleteAlertOpen={deleteAlertOpen}
						setDeleteAlertOpen={setDeleteAlertOpen}
						formatDateParam={formatDateParam}
					/>
				)}

				{/* Show location, time, and cost information first */}
				<ShiftInformation
					shift={shift}
					location={location}
					assignedEmployees={assignedEmployees}
					calculateTotalCost={calculateShiftCost}
					hasShiftEnded={hasShiftEnded()}
				/>

				{/* If shift has ended, show the report after information */}
				{hasShiftEnded() && (
					<div className="my-6">
						<ShiftReport
							shift={shift}
							assignedEmployees={assignedEmployees}
						/>
					</div>
				)}

				<EmployeesSection
					assignedEmployees={assignedEmployees}
					availableEmployees={availableEmployees.filter(
						(employee) =>
							!assignedEmployees.some((assigned) => assigned.id === employee.id)
					)}
					shift={{
						start_time: shift?.start_time || "",
						end_time: shift?.end_time || "",
					}}
					onRemoveEmployeeClick={handleRemoveEmployee}
					onAssignClick={handleAssignEmployeeDialogOpen}
					isCompleted={hasShiftEnded()}
				/>

				<ShiftNotes
					notes={localNotes}
					onEditClick={handleNotesDialogOpen}
					onClearClick={() => {
						if (hasShiftEnded()) {
							toast.error("Cannot modify a completed shift");
							return;
						}
						setLocalNotes("");
						saveShift({ description: "" });
					}}
					isCompleted={hasShiftEnded()}
				/>

				<ShiftTasks
					checkInTasks={localCheckInTasks}
					checkOutTasks={localCheckOutTasks}
					onCheckInTasksClick={handleCheckInTasksDialogOpen}
					onCheckOutTasksClick={handleCheckOutTasksDialogOpen}
					onToggleTaskCompletion={handleToggleTaskCompletion}
					onRemoveTask={handleRemoveTask}
					isCompleted={hasShiftEnded()}
				/>
			</>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!shift) {
		return (
			<div className="p-6">
				<div className="flex flex-col items-center justify-center h-[70vh]">
					<h1 className="text-2xl font-bold mb-2">Shift not found</h1>
					<p className="text-muted-foreground mb-6">
						The requested shift could not be found.
					</p>
					<Button
						onClick={() => navigate("/schedule")}
						className="min-w-[150px]">
						Return to Schedule
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="pb-12">
			{renderContent()}

			{/* Dialogs */}
			<AssignEmployeeDialog
				open={assignEmployeeDialogOpen}
				onOpenChange={setAssignEmployeeDialogOpen}
				shiftId={shiftId || ""}
				onAssigned={() => {
					// Reload shift data after employees are assigned
					if (shiftId) {
						getShift(shiftId).then((shiftData) => {
							if (shiftData) {
								setShift(shiftData);
								// Also refresh the assigned employees
								getShiftAssignments(shiftId).then((assignments) => {
									setShiftAssignments(assignments);
									// For each assignment, fetch employee details
									const assignedEmployeePromises = assignments.map(
										async (assignment) => {
											const employee = await getEmployee(
												assignment.employee_id
											);
											if (employee) {
												return {
													...employee,
													assignmentId: assignment.id,
												};
											}
											return null;
										}
									);

									Promise.all(assignedEmployeePromises).then((employeeData) => {
										const filteredEmployees = employeeData.filter(
											(item) => item !== null
										) as AssignedEmployee[];
										setAssignedEmployees(filteredEmployees);
									});
								});
							}
						});
					}
				}}
			/>

			<ShiftNotesDialog
				open={notesDialogOpen}
				onOpenChange={setNotesDialogOpen}
				notes={localNotes}
				onSave={handleSaveNotes}
			/>

			<CheckInTasksDialog
				open={checkInTasksDialogOpen}
				onOpenChange={setCheckInTasksDialogOpen}
				tasks={localCheckInTasks}
				onSave={handleSaveCheckInTasks}
			/>

			<CheckOutTasksDialog
				open={checkOutTasksDialogOpen}
				onOpenChange={setCheckOutTasksDialogOpen}
				tasks={localCheckOutTasks}
				onSave={handleSaveCheckOutTasks}
			/>

			{/* Employee Remove Confirmation */}
			<AlertDialog
				open={removeEmployeeAlertOpen}
				onOpenChange={setRemoveEmployeeAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Employee</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this employee from the shift? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setRemoveEmployeeAlertOpen(false);
								setEmployeeToRemove(null);
							}}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveEmployee}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
