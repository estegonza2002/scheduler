import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Shift,
	Employee,
	Location,
	CheckInTask,
	CheckOutTask,
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
import { useNotifications } from "../../lib/notification-context";
import { ShiftReport } from "./ShiftReport";

// Define API access functions
const getShift = async (shiftId: string): Promise<Shift | null> => {
	console.log(`Getting shift with ID: ${shiftId}`);
	return ShiftsAPI.getById(shiftId);
};

const getLocation = async (locationId: string): Promise<Location | null> => {
	console.log(`Getting location with ID: ${locationId}`);
	return LocationsAPI.getById(locationId);
};

const getShiftAssignments = async (
	shiftId: string
): Promise<ShiftAssignment[]> => {
	console.log(`Getting assignments for shift: ${shiftId}`);
	return ShiftAssignmentsAPI.getByShiftId(shiftId);
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
	return ShiftsAPI.update({ id: shiftId, ...shiftData });
};

const deleteShift = async (shiftId: string): Promise<boolean> => {
	console.log(`Deleting shift with ID: ${shiftId}`);
	return ShiftsAPI.delete(shiftId);
};

const createShiftAssignment = async (
	assignmentData: Omit<ShiftAssignment, "id">
): Promise<ShiftAssignment> => {
	console.log(`Creating assignment for shift: ${assignmentData.shiftId}`);
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
		position: "Manager",
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
		position: "Server",
		role: "Staff",
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
		position: "Bartender",
		role: "Staff",
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

const sampleCheckInTasks: CheckInTask[] = [
	{
		id: "sample-checkin-1",
		description: "Verify cleanliness of dining area",
		completed: true,
	},
	{
		id: "sample-checkin-2",
		description: "Ensure POS systems are operational",
		completed: true,
	},
	{
		id: "sample-checkin-3",
		description: "Check inventory levels",
		completed: false,
	},
	{
		id: "sample-checkin-4",
		description: "Staff briefing",
		completed: false,
	},
];

const sampleCheckOutTasks: CheckOutTask[] = [
	{
		id: "sample-checkout-1",
		description: "Close out all registers",
		completed: true,
	},
	{
		id: "sample-checkout-2",
		description: "Clean kitchen equipment",
		completed: false,
	},
	{
		id: "sample-checkout-3",
		description: "Secure premises",
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
	const [localCheckInTasks, setLocalCheckInTasks] = useState<CheckInTask[]>([]);
	const [localCheckOutTasks, setLocalCheckOutTasks] = useState<CheckOutTask[]>(
		[]
	);
	const [localNotes, setLocalNotes] = useState("");

	// Dialog states
	const [assignEmployeeDialogOpen, setAssignEmployeeDialogOpen] =
		useState(false);
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [checkInTasksDialogOpen, setCheckInTasksDialogOpen] = useState(false);
	const [checkOutTasksDialogOpen, setCheckOutTasksDialogOpen] = useState(false);
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			if (!shiftId) return;

			setLoading(true);

			try {
				// Load shift and related data from API
				const [shiftData, assignmentsData] = await Promise.all([
					getShift(shiftId),
					getShiftAssignments(shiftId),
				]);

				if (!shiftData) {
					console.error("Shift not found");
					return;
				}

				setShift(shiftData);

				// Load location data
				if (shiftData.locationId) {
					const locationData = await getLocation(shiftData.locationId);
					setLocation(locationData);
				}

				// Process assignments
				const employeePromises = assignmentsData.map((assignment) =>
					getEmployee(assignment.employeeId)
				);

				const employeeData = await Promise.all(employeePromises);

				// Combine assignments with employee data
				const assignedEmployeeData = assignmentsData
					.map((assignment, index) => {
						const employee = employeeData[index];
						if (!employee) return null;

						return {
							...employee,
							assignmentId: assignment.id,
							assignmentRole: assignment.role,
							assignmentNotes: assignment.notes,
						};
					})
					.filter((item): item is AssignedEmployee => item !== null);

				setAssignedEmployees(assignedEmployeeData);

				// Set check-in/check-out tasks and notes
				if (shiftData.checkInTasks) {
					setLocalCheckInTasks(shiftData.checkInTasks);
				}

				if (shiftData.checkOutTasks) {
					setLocalCheckOutTasks(shiftData.checkOutTasks);
				}

				if (shiftData.notes) {
					setLocalNotes(shiftData.notes);
				}

				// Load available employees
				if (shiftData.organizationId) {
					const employeesData = await getEmployees(shiftData.organizationId);
					setAvailableEmployees(employeesData);
				}
			} catch (error) {
				console.error("Error loading shift data:", error);
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

		setSaving(true);

		try {
			const success = await deleteShift(shiftId);
			if (success) {
				toast.success("Shift deleted successfully");
				navigate("/schedule");
			} else {
				toast.error("Failed to delete shift");
			}
		} catch (error) {
			console.error("Error deleting shift:", error);
			toast.error("Error deleting shift");
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
					shiftId,
					employeeId: emp.id,
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

	// Handle employee removal
	const handleRemoveEmployee = async (
		employeeId: string,
		assignmentId: string
	) => {
		if (hasShiftEnded()) {
			toast.error("Cannot modify a completed shift");
			return;
		}

		if (!shift) return;

		try {
			setSaving(true);
			await deleteShiftAssignment(assignmentId);

			// Update UI state
			const removedEmployee = assignedEmployees.find(
				(emp) => emp.id === employeeId
			);
			setAssignedEmployees((prev) =>
				prev.filter((emp) => emp.id !== employeeId)
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
		}
	};

	// Handle notes update
	const handleSaveNotes = async (notes: string) => {
		setLocalNotes(notes);

		if (!shift || !shiftId) return;
		await saveShift({ notes });
		setNotesDialogOpen(false);
	};

	// Handle check-in tasks update
	const handleSaveCheckInTasks = async (tasks: CheckInTask[]) => {
		setLocalCheckInTasks(tasks);

		if (!shift || !shiftId) return;
		await saveShift({ checkInTasks: tasks });
		setCheckInTasksDialogOpen(false);
	};

	// Handle check-out tasks update
	const handleSaveCheckOutTasks = async (tasks: CheckOutTask[]) => {
		setLocalCheckOutTasks(tasks);

		if (!shift || !shiftId) return;
		await saveShift({ checkOutTasks: tasks });
		setCheckOutTasksDialogOpen(false);
	};

	// Format date for URL parameters
	const formatDateParam = (date: string) => {
		return new Date(date).toISOString().split("T")[0];
	};

	// Calculate total cost for shift
	const calculateShiftCost = useCallback(() => {
		if (assignedEmployees.length === 0) return "0.00";

		return calculateTotalCost(
			shift?.startTime || "",
			shift?.endTime || "",
			assignedEmployees
		);
	}, [assignedEmployees, shift]);

	// Check if shift has ended
	const hasShiftEnded = useCallback(() => {
		if (!shift) return false;
		const endTime = new Date(shift.endTime);
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

			saveShift({ checkInTasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckOutTasks(updatedTasks);

			saveShift({ checkOutTasks: updatedTasks });
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

			saveShift({ checkInTasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckOutTasks(updatedTasks);

			saveShift({ checkOutTasks: updatedTasks });
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
						availableEmployees={availableEmployees}
						shift={shift}
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
							saveShift({ notes: "" });
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
		</div>
	);
}
