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

// Define direct API functions but use mock API implementation instead of fetch
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
	const { useSampleData } = useNotifications();

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
	const loadData = useCallback(async () => {
		if (!shiftId) return;

		try {
			setLoading(true);

			// Fetch shift data
			const shiftData = await getShift(shiftId);

			// If shift not found, just return - we'll show the not found UI
			if (!shiftData) {
				setShift(null);
				setLocation(null);
				setAssignedEmployees([]);
				setLocalCheckInTasks([]);
				setLocalCheckOutTasks([]);
				setLocalNotes("");
				setLoading(false);
				return;
			}

			setShift(shiftData);

			// Set local tasks and notes from shift
			setLocalCheckInTasks(shiftData.checkInTasks || []);
			setLocalCheckOutTasks(shiftData.checkOutTasks || []);
			setLocalNotes(shiftData.notes || "");

			// Fetch location if the shift has a locationId
			if (shiftData.locationId) {
				const locationData = await getLocation(shiftData.locationId);
				setLocation(locationData);
			} else {
				setLocation(null);
			}

			// Fetch assigned employees
			const assignments = await getShiftAssignments(shiftId);
			if (assignments && assignments.length > 0) {
				// Fetch full employee details for each assignment
				const assignedEmployeePromises = assignments.map(async (assignment) => {
					const employee = await getEmployee(assignment.employeeId);
					if (!employee) {
						// Skip if employee not found
						return null;
					}
					return {
						...employee,
						assignmentId: assignment.id,
						assignmentRole: assignment.role || employee.position || "Staff",
						assignmentNotes: assignment.notes || "",
					} as AssignedEmployee;
				});

				const assignedEmployeeData = (
					await Promise.all(assignedEmployeePromises)
				).filter((emp): emp is AssignedEmployee => emp !== null);
				setAssignedEmployees(assignedEmployeeData);
			} else {
				setAssignedEmployees([]);
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

	// Load sample data
	const loadSampleData = useCallback(() => {
		// Keep the real shift data if we have it, otherwise create minimal data
		if (!shift && !loading) {
			// First time loading sample data, create minimal shift data
			setShift({
				id: shiftId || "sample-shift-1",
				scheduleId: "sch-1",
				startTime: new Date().toISOString(),
				endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
			});
		}

		// Set sample location
		setLocation(sampleLocation);

		// Set sample data
		setAssignedEmployees(sampleAssignedEmployees);
		setLocalCheckInTasks(sampleCheckInTasks);
		setLocalCheckOutTasks(sampleCheckOutTasks);
		setLocalNotes(sampleNotes);

		// Finish loading
		setLoading(false);
	}, [shift, loading, shiftId]);

	// Handle initial data loading
	useEffect(() => {
		if (useSampleData) {
			loadSampleData();
		} else {
			loadData();
		}
	}, []); // Empty dependency array means this runs once on mount

	// Handle sample data toggle
	useEffect(() => {
		let isMounted = true;

		const handleToggle = async () => {
			if (useSampleData) {
				loadSampleData();
			} else {
				if (shiftId) {
					setLoading(true);
					try {
						// Fetch shift data directly without depending on loadData function
						const shiftData = await ShiftsAPI.getById(shiftId);

						if (!isMounted) return;

						if (shiftData) {
							setShift(shiftData);
							setLocalCheckInTasks(shiftData.checkInTasks || []);
							setLocalCheckOutTasks(shiftData.checkOutTasks || []);
							setLocalNotes(shiftData.notes || "");

							// Fetch location if applicable
							if (shiftData.locationId) {
								const locationData = await LocationsAPI.getById(
									shiftData.locationId
								);
								if (isMounted) setLocation(locationData);
							} else {
								setLocation(null);
							}

							// Fetch assignments
							const assignments = await ShiftAssignmentsAPI.getByShiftId(
								shiftId
							);
							if (!isMounted) return;

							if (assignments && assignments.length > 0) {
								const employees = await Promise.all(
									assignments.map(async (a) => {
										const emp = await EmployeesAPI.getById(a.employeeId);
										if (!emp) return null;
										return {
											...emp,
											assignmentId: a.id,
											assignmentRole: a.role || emp.position || "Staff",
											assignmentNotes: a.notes || "",
										} as AssignedEmployee;
									})
								);
								if (isMounted) {
									setAssignedEmployees(
										employees.filter(Boolean) as AssignedEmployee[]
									);
								}
							} else {
								setAssignedEmployees([]);
							}
						} else {
							// Minimal shift info
							if (shift) {
								setShift({
									id: shift.id,
									scheduleId: shift.scheduleId || "",
									startTime: shift.startTime,
									endTime: shift.endTime,
								});
							}
							setLocation(null);
							setAssignedEmployees([]);
							setLocalCheckInTasks([]);
							setLocalCheckOutTasks([]);
							setLocalNotes("");
						}
					} catch (error) {
						console.error("Error loading real data:", error);
						// Keep basic shift info but clear other fields
						if (shift && isMounted) {
							setShift({
								id: shift.id,
								scheduleId: shift.scheduleId || "",
								startTime: shift.startTime,
								endTime: shift.endTime,
							});
							setLocation(null);
							setAssignedEmployees([]);
							setLocalCheckInTasks([]);
							setLocalCheckOutTasks([]);
							setLocalNotes("");
						}
					} finally {
						if (isMounted) setLoading(false);
					}
				}
			}
		};

		handleToggle();

		return () => {
			isMounted = false;
		};
	}, [useSampleData, shiftId, shift?.id]);

	// Save shift changes
	const saveShift = async (updatedShift: Partial<Shift>) => {
		if (!shift || !shiftId || useSampleData) return;

		try {
			setSaving(true);
			const updated = await updateShift(shiftId, updatedShift);
			setShift(updated);

			// Update local state as well
			if (updatedShift.checkInTasks) {
				setLocalCheckInTasks(updatedShift.checkInTasks);
			}
			if (updatedShift.checkOutTasks) {
				setLocalCheckOutTasks(updatedShift.checkOutTasks);
			}
			if (updatedShift.notes !== undefined) {
				setLocalNotes(updatedShift.notes);
			}

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
		if (!shift || !shiftId || useSampleData) return;

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
		if (!shift || !shiftId || useSampleData) return;

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
		if (!shift || useSampleData) return;

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

		if (useSampleData) {
			setNotesDialogOpen(false);
			return;
		}

		if (!shift || !shiftId) return;
		await saveShift({ notes });
		setNotesDialogOpen(false);
	};

	// Handle check-in tasks update
	const handleSaveCheckInTasks = async (tasks: CheckInTask[]) => {
		setLocalCheckInTasks(tasks);

		if (useSampleData) {
			setCheckInTasksDialogOpen(false);
			return;
		}

		if (!shift || !shiftId) return;
		await saveShift({ checkInTasks: tasks });
		setCheckInTasksDialogOpen(false);
	};

	// Handle check-out tasks update
	const handleSaveCheckOutTasks = async (tasks: CheckOutTask[]) => {
		setLocalCheckOutTasks(tasks);

		if (useSampleData) {
			setCheckOutTasksDialogOpen(false);
			return;
		}

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

	// Toggle task completion
	const handleToggleTaskCompletion = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckInTasks(updatedTasks);

			if (!useSampleData) {
				saveShift({ checkInTasks: updatedTasks });
			}
		} else {
			const updatedTasks = localCheckOutTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckOutTasks(updatedTasks);

			if (!useSampleData) {
				saveShift({ checkOutTasks: updatedTasks });
			}
		}
	};

	// Handle task removal
	const handleRemoveTask = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckInTasks(updatedTasks);

			if (!useSampleData) {
				saveShift({ checkInTasks: updatedTasks });
			}
		} else {
			const updatedTasks = localCheckOutTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckOutTasks(updatedTasks);

			if (!useSampleData) {
				saveShift({ checkOutTasks: updatedTasks });
			}
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
						onAssignClick={() => setAssignEmployeeDialogOpen(true)}
					/>

					<ShiftNotes
						notes={localNotes}
						onEditClick={() => setNotesDialogOpen(true)}
						onClearClick={() => {
							setLocalNotes("");
							if (!useSampleData) {
								saveShift({ notes: "" });
							}
						}}
					/>

					<ShiftTasks
						checkInTasks={localCheckInTasks}
						checkOutTasks={localCheckOutTasks}
						onCheckInTasksClick={() => setCheckInTasksDialogOpen(true)}
						onCheckOutTasksClick={() => setCheckOutTasksDialogOpen(true)}
						onToggleTaskCompletion={handleToggleTaskCompletion}
						onRemoveTask={handleRemoveTask}
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
