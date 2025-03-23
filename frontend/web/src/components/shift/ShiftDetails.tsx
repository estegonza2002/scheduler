import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Shift,
	Employee,
	Location,
	CheckInTask,
	CheckOutTask,
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

// Define direct API functions instead of using api object
const getShift = async (shiftId: string): Promise<Shift> => {
	const response = await fetch(`/api/shifts/${shiftId}`);
	if (!response.ok) throw new Error("Failed to load shift");
	return response.json();
};

const getLocation = async (locationId: string): Promise<Location> => {
	const response = await fetch(`/api/locations/${locationId}`);
	if (!response.ok) throw new Error("Failed to load location");
	return response.json();
};

const getShiftAssignments = async (shiftId: string): Promise<any[]> => {
	const response = await fetch(`/api/shifts/${shiftId}/assignments`);
	if (!response.ok) throw new Error("Failed to load shift assignments");
	return response.json();
};

const getEmployee = async (employeeId: string): Promise<Employee> => {
	const response = await fetch(`/api/employees/${employeeId}`);
	if (!response.ok) throw new Error("Failed to load employee details");
	return response.json();
};

const getEmployees = async (orgId: string): Promise<Employee[]> => {
	const response = await fetch(`/api/organizations/${orgId}/employees`);
	if (!response.ok) throw new Error("Failed to load employees");
	return response.json();
};

const updateShift = async (
	shiftId: string,
	shiftData: Partial<Shift>
): Promise<Shift> => {
	const response = await fetch(`/api/shifts/${shiftId}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(shiftData),
	});
	if (!response.ok) throw new Error("Failed to update shift");
	return response.json();
};

const deleteShift = async (shiftId: string): Promise<void> => {
	const response = await fetch(`/api/shifts/${shiftId}`, { method: "DELETE" });
	if (!response.ok) throw new Error("Failed to delete shift");
};

const createShiftAssignment = async (assignmentData: any): Promise<any> => {
	const response = await fetch(`/api/shift-assignments`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(assignmentData),
	});
	if (!response.ok) throw new Error("Failed to create assignment");
	return response.json();
};

const deleteShiftAssignment = async (assignmentId: string): Promise<void> => {
	const response = await fetch(`/api/shift-assignments/${assignmentId}`, {
		method: "DELETE",
	});
	if (!response.ok) throw new Error("Failed to delete assignment");
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

	// Dialog states
	const [assignEmployeeDialogOpen, setAssignEmployeeDialogOpen] =
		useState(false);
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [checkInTasksDialogOpen, setCheckInTasksDialogOpen] = useState(false);
	const [checkOutTasksDialogOpen, setCheckOutTasksDialogOpen] = useState(false);
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

	// Load initial data
	const loadData = useCallback(async () => {
		if (!shiftId) return;

		try {
			setLoading(true);

			// Fetch shift data
			const shiftData = await getShift(shiftId);
			setShift(shiftData);

			// Fetch location if the shift has a locationId
			if (shiftData.locationId) {
				const locationData = await getLocation(shiftData.locationId);
				setLocation(locationData);
			}

			// Fetch assigned employees
			const assignments = await getShiftAssignments(shiftId);
			if (assignments && assignments.length > 0) {
				// Fetch full employee details for each assignment
				const assignedEmployeePromises = assignments.map(async (assignment) => {
					const employee = await getEmployee(assignment.employeeId);
					return {
						...employee,
						assignmentId: assignment.id,
						assignmentRole: assignment.role || employee.position || "Staff",
						assignmentNotes: assignment.notes || "",
					};
				});

				const assignedEmployeeData = await Promise.all(
					assignedEmployeePromises
				);
				setAssignedEmployees(assignedEmployeeData);
			}

			// Fetch all employees for the organization
			const orgId = localStorage.getItem("currentOrganizationId");
			if (orgId) {
				const allEmployees = await getEmployees(orgId);
				setAvailableEmployees(allEmployees);
			}
		} catch (error) {
			console.error("Error loading shift details:", error);
			toast.error("Failed to load shift details");
		} finally {
			setLoading(false);
		}
	}, [shiftId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Save shift changes
	const saveShift = async (updatedShift: Partial<Shift>) => {
		if (!shift || !shiftId) return;

		try {
			setSaving(true);
			const updated = await updateShift(shiftId, updatedShift);
			setShift(updated);
			toast.success("Shift updated successfully");
		} catch (error) {
			console.error("Error updating shift:", error);
			toast.error("Failed to update shift");
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
			// Navigate back to daily shifts view
			navigate(`/daily-shifts?date=${formatDateParam(shift.startTime)}`);
		} catch (error) {
			console.error("Error deleting shift:", error);
			toast.error("Failed to delete shift");
			setSaving(false);
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
		if (!shift || !shiftId) return;
		await saveShift({ notes });
		setNotesDialogOpen(false);
	};

	// Handle check-in tasks update
	const handleSaveCheckInTasks = async (tasks: CheckInTask[]) => {
		if (!shift || !shiftId) return;
		await saveShift({ checkInTasks: tasks });
		setCheckInTasksDialogOpen(false);
	};

	// Handle check-out tasks update
	const handleSaveCheckOutTasks = async (tasks: CheckOutTask[]) => {
		if (!shift || !shiftId) return;
		await saveShift({ checkOutTasks: tasks });
		setCheckOutTasksDialogOpen(false);
	};

	// Format date for URL parameters
	const formatDateParam = (date: string) => {
		return new Date(date).toISOString().split("T")[0];
	};

	// Calculate total cost for shift
	const calculateShiftCost = () => {
		if (!shift) return "0.00";
		return calculateTotalCost(
			shift.startTime,
			shift.endTime,
			assignedEmployees
		);
	};

	// Toggle task completion
	const handleToggleTaskCompletion = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		const taskArray =
			taskType === "checkIn"
				? shift.checkInTasks || []
				: shift.checkOutTasks || [];

		const updatedTasks = taskArray.map((task) =>
			task.id === taskId ? { ...task, completed: !task.completed } : task
		);

		const shiftUpdate =
			taskType === "checkIn"
				? { checkInTasks: updatedTasks }
				: { checkOutTasks: updatedTasks };

		saveShift(shiftUpdate);
	};

	// Handle task removal
	const handleRemoveTask = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		const taskArray =
			taskType === "checkIn"
				? shift.checkInTasks || []
				: shift.checkOutTasks || [];

		const updatedTasks = taskArray.filter((task) => task.id !== taskId);

		const shiftUpdate =
			taskType === "checkIn"
				? { checkInTasks: updatedTasks }
				: { checkOutTasks: updatedTasks };

		saveShift(shiftUpdate);
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
				<div className="flex items-center justify-center mb-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate(-1)}
						className="mr-auto">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
				</div>
				<div className="text-center">
					<h1 className="text-xl font-bold mb-2">Shift not found</h1>
					<p className="text-muted-foreground mb-4">
						The requested shift could not be found.
					</p>
					<button
						onClick={() => navigate("/schedule")}
						className="text-primary hover:underline">
						Return to Schedule
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl pb-12">
			<ShiftHeader
				shift={shift}
				assignedEmployeesCount={assignedEmployees.length}
				onDeleteClick={handleDeleteShift}
				onEditClick={() => navigate(`/edit-shift/${shiftId}`)}
				deleteAlertOpen={deleteAlertOpen}
				setDeleteAlertOpen={setDeleteAlertOpen}
				formatDateParam={formatDateParam}
			/>

			<div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
				<ShiftInformation
					shift={shift}
					location={location}
					assignedEmployees={assignedEmployees}
					calculateTotalCost={calculateShiftCost}
				/>
			</div>

			<div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
				<div className="p-5">
					<EmployeesSection
						assignedEmployees={assignedEmployees}
						availableEmployees={availableEmployees}
						shift={shift}
						onRemoveEmployeeClick={handleRemoveEmployee}
						onAssignClick={() => setAssignEmployeeDialogOpen(true)}
					/>

					<ShiftNotes
						notes={shift.notes || ""}
						onEditClick={() => setNotesDialogOpen(true)}
						onClearClick={() => saveShift({ notes: "" })}
					/>

					<ShiftTasks
						checkInTasks={shift.checkInTasks || []}
						checkOutTasks={shift.checkOutTasks || []}
						onCheckInTasksClick={() => setCheckInTasksDialogOpen(true)}
						onCheckOutTasksClick={() => setCheckOutTasksDialogOpen(true)}
						onToggleTaskCompletion={handleToggleTaskCompletion}
						onRemoveTask={handleRemoveTask}
					/>
				</div>
			</div>

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
				notes={shift.notes || ""}
				onSave={handleSaveNotes}
			/>

			<CheckInTasksDialog
				open={checkInTasksDialogOpen}
				onOpenChange={setCheckInTasksDialogOpen}
				tasks={shift.checkInTasks || []}
				onSave={handleSaveCheckInTasks}
			/>

			<CheckOutTasksDialog
				open={checkOutTasksDialogOpen}
				onOpenChange={setCheckOutTasksDialogOpen}
				tasks={shift.checkOutTasks || []}
				onSave={handleSaveCheckOutTasks}
			/>
		</div>
	);
}
