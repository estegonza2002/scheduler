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
import { db } from "../../lib/firebase";
import {
	collection,
	query,
	where,
	onSnapshot,
	Timestamp,
	doc,
} from "firebase/firestore";
import { mapDocToShift, mapDocToEmployee } from "@/api/real/api";

// Define API access functions
const getShift = async (shiftId: string): Promise<Shift | null> => {
	console.log(`Getting shift with ID: ${shiftId}`);
	return ShiftsAPI.getShiftById(shiftId);
};

const getLocation = async (locationId: string): Promise<Location | null> => {
	console.log(`Getting location with ID: ${locationId}`);
	return LocationsAPI.getById(locationId);
};

const getShiftAssignments = async (filter: {
	shiftId: string;
}): Promise<ShiftAssignment[]> => {
	console.log(`Getting assignments for shift: ${filter.shiftId}`);
	return ShiftAssignmentsAPI.getAll(filter);
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

const deleteShift = async (shiftId: string): Promise<boolean> => {
	console.log(`Deleting shift with ID: ${shiftId}`);
	return ShiftsAPI.deleteShift(shiftId);
};

const createShiftAssignment = async (
	assignmentData: Omit<ShiftAssignment, "id" | "createdAt" | "updatedAt">
): Promise<ShiftAssignment | null> => {
	console.log(`Creating assignment for shift: ${assignmentData.shiftId}`);
	return ShiftAssignmentsAPI.create(assignmentData);
};

const deleteShiftAssignment = async (
	assignmentId: string
): Promise<boolean> => {
	console.log(`Deleting assignment with ID: ${assignmentId}`);
	return ShiftAssignmentsAPI.delete(assignmentId);
};

interface ShiftDetailsProps {
	hideHeader?: boolean;
}

// Function to determine if shift is completed (end time is in the past)
const isShiftCompleted = (shift: Shift): boolean => {
	const endTime = new Date(shift.endTime);
	const now = new Date();
	return now > endTime;
};

// Function to determine if shift is in progress
const isShiftInProgress = (shift: Shift): boolean => {
	const startTime = new Date(shift.startTime);
	const endTime = new Date(shift.endTime);
	const now = new Date();
	return now >= startTime && now <= endTime;
};

// Function to determine if shift is upcoming
const isShiftUpcoming = (shift: Shift): boolean => {
	const startTime = new Date(shift.startTime);
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

	// Load data function
	const loadData = useCallback(async () => {
		if (!shiftId) return;

		console.log(`Loading data for shift: ${shiftId}`);
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
			if (shiftData.locationId) {
				const locationData = await getLocation(shiftData.locationId);
				setLocation(locationData);
			}

			// Load shift assignments and associated employees
			const assignmentsData = await getShiftAssignments({ shiftId });
			setShiftAssignments(assignmentsData);

			// For each assignment, fetch the employee details
			const assignedEmployeePromises = assignmentsData.map(
				async (assignment: ShiftAssignment) => {
					const employee = await getEmployee(assignment.employeeId);
					if (employee) {
						return {
							...employee,
							assignmentId: assignment.id,
						};
					}
					return null;
				}
			);

			const assignedEmployeeData = await Promise.all(assignedEmployeePromises);
			const filteredEmployees = assignedEmployeeData.filter(
				(item) => item !== null
			) as AssignedEmployee[];
			setAssignedEmployees(filteredEmployees);

			// Set check-in/check-out tasks and notes
			if (shiftData.checkInTasks) {
				setLocalCheckInTasks(shiftData.checkInTasks);
			}

			if (shiftData.checkOutTasks) {
				setLocalCheckOutTasks(shiftData.checkOutTasks);
			}

			if (shiftData.description) {
				setLocalNotes(shiftData.description);
			}

			// Load available employees
			if (shiftData.organizationId) {
				const employeesData = await getEmployees(shiftData.organizationId);
				setAvailableEmployees(employeesData);
			}
		} catch (error) {
			console.error("Error loading shift data:", error);
			toast.error("Failed to load shift data");
		} finally {
			setLoading(false);
		}
	}, [shiftId]);

	// Initial data load and Firestore listeners
	useEffect(() => {
		loadData();

		if (!shiftId) return; // Don't setup listeners without shiftId

		console.log(`Setting up Firestore listeners for shift: ${shiftId}`);

		// Listener for the specific shift document
		const shiftDocRef = doc(db, "shifts", shiftId);
		const unsubscribeShift = onSnapshot(
			shiftDocRef,
			(docSnap) => {
				if (docSnap.exists()) {
					console.log("Firestore: Shift details updated");
					const updatedShift = mapDocToShift(docSnap);
					setShift(updatedShift);
					// Update local states derived from shift
					setLocalCheckInTasks(updatedShift.checkInTasks || []);
					setLocalCheckOutTasks(updatedShift.checkOutTasks || []);
					setLocalNotes(updatedShift.description || "");
					if (updatedShift.locationId && !location) {
						// Fetch location if it wasn't loaded initially
						getLocation(updatedShift.locationId).then(setLocation);
					}
				} else {
					console.warn(`Shift with ID ${shiftId} no longer exists.`);
					setShift(null); // Handle shift deletion
					// Optionally navigate away or show message
					navigate("/manage-shifts");
					toast.warning("The shift you were viewing has been deleted.");
				}
			},
			(error) => {
				console.error("Error listening to shift document:", error);
				toast.error("Error getting real-time shift updates.");
			}
		);

		// Listener for shift assignments
		const assignmentsQuery = query(
			collection(db, "shiftAssignments"),
			where("shiftId", "==", shiftId)
		);
		const unsubscribeAssignments = onSnapshot(
			assignmentsQuery,
			async (snapshot) => {
				console.log("Firestore: Shift assignments updated");
				const updatedAssignments = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as ShiftAssignment[];
				setShiftAssignments(updatedAssignments);

				// Refetch employee details for the assignments
				const assignedEmployeePromises = updatedAssignments.map(
					async (assignment) => {
						const employee = await getEmployee(assignment.employeeId);
						return employee
							? { ...employee, assignmentId: assignment.id }
							: null;
					}
				);
				const assignedEmployeeData = await Promise.all(
					assignedEmployeePromises
				);
				setAssignedEmployees(
					assignedEmployeeData.filter((e) => e !== null) as AssignedEmployee[]
				);
			},
			(error) => {
				console.error("Error listening to shift assignments:", error);
				toast.error("Error getting real-time assignment updates.");
			}
		);

		// Cleanup listeners on unmount or when shiftId changes
		return () => {
			console.log("Cleaning up Firestore listeners for shift details");
			unsubscribeShift();
			unsubscribeAssignments();
		};
	}, [shiftId, loadData, location, navigate]); // Add location dependency for fetching

	// Save shift changes
	const saveShift = async (updatedShift: Partial<Shift>) => {
		if (!shiftId || !shift) return;

		setSaving(true);
		try {
			const result = await updateShift(shiftId, updatedShift);
			if (result) {
				// Listener should handle UI update
				toast.success("Shift updated successfully");
			}
		} catch (error) {
			console.error("Error updating shift:", error);
			toast.error("Failed to update shift");
		} finally {
			setSaving(false);
		}
	};

	// Handle shift deletion
	const handleDeleteShift = async () => {
		if (!shiftId) return;

		try {
			setSaving(true);
			await deleteShift(shiftId);
			toast.success("Shift deleted successfully");
			console.log("Shift deleted. Navigating away from detail page.");
			navigate("/manage-shifts");
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
		if (!shiftId || !shift) return;

		setSaving(true);
		try {
			// Get currently assigned employees
			const currentlyAssigned = new Set(assignedEmployees.map((emp) => emp.id));

			// Find new employees to assign
			const newAssignments = employees.filter(
				(emp) => !currentlyAssigned.has(emp.id)
			);

			// Create assignments for each new employee
			for (const employee of newAssignments) {
				await createShiftAssignment({
					shiftId: shiftId,
					employeeId: employee.id,
				});
			}

			if (newAssignments.length > 0) {
				toast.success(
					`${newAssignments.length} employee${
						newAssignments.length > 1 ? "s" : ""
					} assigned to shift`
				);
			}
		} catch (error) {
			console.error("Error assigning employees:", error);
			toast.error("Failed to assign employees");
		} finally {
			setSaving(false);
			setAssignEmployeeDialogOpen(false);
		}
	};

	// Handle employee removal (sets up the confirmation dialog)
	const handleRemoveEmployee = (employeeId: string, assignmentId: string) => {
		setEmployeeToRemove({ id: employeeId, assignmentId });
		setRemoveEmployeeAlertOpen(true);
	};

	// Confirm employee removal
	const confirmRemoveEmployee = async () => {
		if (!employeeToRemove) return;

		setSaving(true);
		try {
			await deleteShiftAssignment(employeeToRemove.assignmentId);

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

	// Handle notes updates
	const handleSaveNotes = async (notes: string) => {
		setLocalNotes(notes);
		await saveShift({ description: notes });
		setNotesDialogOpen(false);
	};

	// Handle check-in tasks updates
	const handleSaveCheckInTasks = async (tasks: ShiftTask[]) => {
		setLocalCheckInTasks(tasks);
		await saveShift({ checkInTasks: tasks });
		setCheckInTasksDialogOpen(false);
	};

	// Handle check-out tasks updates
	const handleSaveCheckOutTasks = async (tasks: ShiftTask[]) => {
		setLocalCheckOutTasks(tasks);
		await saveShift({ checkOutTasks: tasks });
		setCheckOutTasksDialogOpen(false);
	};

	// Handle task completion toggle
	const handleToggleTaskCompletion = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		// Update local state first for immediate UI feedback
		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckInTasks(updatedTasks);

			// Save to the server (will trigger real-time update)
			saveShift({ checkInTasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			);
			setLocalCheckOutTasks(updatedTasks);

			// Save to the server (will trigger real-time update)
			saveShift({ checkOutTasks: updatedTasks });
		}
	};

	// Remove a task
	const handleRemoveTask = (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (taskType === "checkIn") {
			const updatedTasks = localCheckInTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckInTasks(updatedTasks);

			// Save to the server (will trigger real-time update)
			saveShift({ checkInTasks: updatedTasks });
		} else {
			const updatedTasks = localCheckOutTasks.filter(
				(task) => task.id !== taskId
			);
			setLocalCheckOutTasks(updatedTasks);

			// Save to the server (will trigger real-time update)
			saveShift({ checkOutTasks: updatedTasks });
		}
	};

	// Format date for URL parameters
	const formatDateParam = (date: string) => {
		return format(new Date(date), "yyyy-MM-dd"); // Use new Date for ISO or Timestamp
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
					new Date(shift.startTime), // Use new Date
					"EEEE, MMMM d, yyyy"
				)} · 
					${format(new Date(shift.startTime), "h:mm a")} - 
					${format(new Date(shift.endTime), "h:mm a")} · 
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
		const startTime = new Date(shift.startTime);
		const endTime = new Date(shift.endTime);
		const now = new Date();
		return now >= startTime && now <= endTime;
	}, [shift]);

	// Check if shift is upcoming
	const isUpcoming = useCallback(() => {
		if (!shift) return false;
		const startTime = new Date(shift.startTime);
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
							new Date(shift.startTime), // Use new Date
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
						startTime: shift?.startTime || new Date().toISOString(),
						endTime: shift?.endTime || new Date().toISOString(),
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
								getShiftAssignments({ shiftId }).then((assignments) => {
									setShiftAssignments(assignments);
									// For each assignment, fetch employee details
									const assignedEmployeePromises = assignments.map(
										async (assignment) => {
											const employee = await getEmployee(assignment.employeeId);
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
