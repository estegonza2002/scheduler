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
import { Loader2, ArrowLeft } from "lucide-react";
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

// Sample data for preview mode
const sampleAssignedEmployees: AssignedEmployee[] = [
	{
		id: "sample-emp-1",
		name: "John Smith",
		email: "john.smith@example.com",
		phone: "555-123-4567",
		role: "Manager",
		organizationId: "org-1",
		hourlyRate: 25,
		avatar: "",
		assignmentId: "sample-assignment-1",
		assignmentRole: "Shift Lead",
		assignmentNotes: "Responsible for opening procedures",
		status: "active",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "sample-emp-2",
		name: "Emily Johnson",
		email: "emily.j@example.com",
		phone: "555-987-6543",
		role: "Server",
		organizationId: "org-1",
		hourlyRate: 18,
		avatar: "",
		assignmentId: "sample-assignment-2",
		assignmentRole: "Server",
		assignmentNotes: "Assigned to sections 1-3",
		status: "active",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
	{
		id: "sample-emp-3",
		name: "Michael Williams",
		email: "m.williams@example.com",
		phone: "555-456-7890",
		role: "Bartender",
		organizationId: "org-1",
		hourlyRate: 20,
		avatar: "",
		assignmentId: "sample-assignment-3",
		assignmentRole: "Bartender",
		assignmentNotes: "Specialized in craft cocktails",
		status: "active",
		isOnline: false,
		lastActive: new Date().toISOString(),
	},
];

const sampleCheckInTasks: ShiftTask[] = [
	{
		id: "sample-checkin-1",
		title: "Verify cleanliness of dining area",
		completed: true,
	},
	{
		id: "sample-checkin-2",
		title: "Ensure POS systems are operational",
		completed: true,
	},
	{
		id: "sample-checkin-3",
		title: "Check inventory levels",
		completed: false,
	},
	{
		id: "sample-checkin-4",
		title: "Staff briefing",
		completed: false,
	},
];

const sampleCheckOutTasks: ShiftTask[] = [
	{
		id: "sample-checkout-1",
		title: "Close out all registers",
		completed: true,
	},
	{
		id: "sample-checkout-2",
		title: "Clean kitchen equipment",
		completed: false,
	},
	{
		id: "sample-checkout-3",
		title: "Secure premises",
		completed: false,
	},
];

const sampleNotes =
	"This is a busy shift during our Friday evening dinner rush. We expect approximately 120 guests with 3 large parties. The Johnson party (12 people) has requested the private dining room at 7:30pm. We'll need extra attention to service timing and food quality during peak hours (6:30-8:30pm).";

const sampleLocation: Location = {
	id: "sample-location-1",
	name: "Downtown Restaurant",
	address: "123 Main Street",
	city: "New York",
	state: "NY",
	zipCode: "10001",
	organizationId: "org-1",
	isActive: true,
};

export function ShiftDetails() {
	const { shiftId } = useParams<{ shiftId: string }>();
	const navigate = useNavigate();

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
								assignmentRole: assignment.role,
								assignmentNotes: assignment.notes,
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
					role: emp.assignmentRole,
					notes: emp.assignmentNotes,
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

	// Handle employee removal trigger
	const handleRemoveEmployee = (employeeId: string, assignmentId: string) => {
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
				delete (employeeWithoutAssignment as any).assignmentRole;
				delete (employeeWithoutAssignment as any).assignmentNotes;

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

	if (loading) {
		return (
			<div className="flex justify-center items-center h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!shift) {
		return (
			<div className="p-6">
				<div className="flex flex-col items-center justify-center h-[70vh]">
					<div className="text-center max-w-md mx-auto">
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
			</div>
		);
	}

	return (
		<div className="w-full pb-12">
			<ShiftHeader
				shift={shift}
				assignedEmployeesCount={assignedEmployees.length}
				onDeleteClick={handleDeleteShift}
				onEditClick={() => navigate(`/edit-shift/${shiftId}`)}
				deleteAlertOpen={deleteAlertOpen}
				setDeleteAlertOpen={setDeleteAlertOpen}
				formatDateParam={formatDateParam}
			/>

			{loading ? (
				<div className="bg-white border rounded-md p-8 my-6 flex justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					{/* If shift has ended, show the report at the top */}
					{hasShiftEnded() && (
						<div className="my-6">
							<ShiftReport
								shift={shift}
								assignedEmployees={assignedEmployees}
							/>
						</div>
					)}

					<ShiftInformation
						shift={shift}
						location={location}
						assignedEmployees={assignedEmployees}
						calculateTotalCost={calculateShiftCost}
					/>

					<EmployeesSection
						assignedEmployees={assignedEmployees}
						availableEmployees={availableEmployees.filter(
							(employee) =>
								!assignedEmployees.some(
									(assigned) => assigned.id === employee.id
								)
						)}
						shift={{
							start_time: shift?.start_time || "",
							end_time: shift?.end_time || "",
						}}
						onRemoveEmployeeClick={handleRemoveEmployee}
						onAssignClick={handleAssignEmployeeDialogOpen}
						isCompleted={false}
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
			)}

			{/* Dialogs */}
			<AssignEmployeeDialog
				open={assignEmployeeDialogOpen}
				onOpenChange={setAssignEmployeeDialogOpen}
				shift={shift}
				assignedEmployees={assignedEmployees}
				availableEmployees={availableEmployees}
				onAssign={handleAssignEmployees}
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
