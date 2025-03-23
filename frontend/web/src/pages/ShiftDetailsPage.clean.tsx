import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
	Employee,
	EmployeesAPI,
	Location,
	LocationsAPI,
	Shift,
	ShiftAssignment,
	ShiftAssignmentsAPI,
	ShiftsAPI,
	CheckInTask,
	CheckOutTask,
} from "../api";
import {
	format,
	parseISO,
	differenceInHours,
	differenceInMinutes,
} from "date-fns";
import {
	ArrowLeft,
	Calendar,
	ChevronRight,
	Clock,
	DollarSign,
	Edit,
	MapPin,
	Plus,
	Save,
	Trash,
	Users,
	Check,
	X,
	Bold,
	Italic,
	List,
	ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Textarea } from "../components/ui/textarea";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Checkbox } from "../components/ui/checkbox";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../components/ui/tooltip";

// Interface for employee data with additional assignment information
interface AssignedEmployee extends Employee {
	assignmentId: string;
	assignmentRole?: string;
	assignmentNotes?: string;
}

// Helper function for generating unique IDs that works in all browsers
function generateUniqueId(): string {
	// Use crypto.randomUUID if available (modern browsers)
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	// Fallback for browsers without crypto.randomUUID
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}

// Add this function for simple markdown parsing at the top level, near other utility functions
const parseSimpleMarkdown = (text: string) => {
	if (!text) return "";

	// Replace bold: **text** or __text__ with <strong>text</strong>
	let formatted = text.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

	// Replace italics: *text* or _text_ with <em>text</em>
	formatted = formatted.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

	// Replace ordered lists: "1. item" with ordered list items
	formatted = formatted.replace(/^\d+\.\s(.*)$/gm, "<li>$1</li>");

	// Replace bullets: "- item" with list items
	formatted = formatted.replace(/^- (.*)$/gm, "<li>$1</li>");

	// Wrap consecutive list items in a ul or ol based on the first item
	formatted = formatted.replace(
		/<li>.*?<\/li>(?:\s*<li>.*?<\/li>)+/g,
		(match) => {
			// Check if the first item was from an ordered list (would have started with a number)
			if (text.match(/^\d+\.\s/)) {
				return `<ol class="list-decimal pl-6 my-2">${match}</ol>`;
			}
			return `<ul class="list-disc pl-6 my-2">${match}</ul>`;
		}
	);

	// Add line breaks for newlines
	formatted = formatted.replace(/\n/g, "<br>");

	return formatted;
};

// New function to help with text formatting
const formatSelectedText = (
	textarea: HTMLTextAreaElement | null,
	type: "bold" | "italic" | "list" | "ordered-list"
) => {
	if (!textarea) return;

	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selectedText = textarea.value.substring(start, end);
	let replacement = "";
	let cursorOffset = 0;

	if (selectedText) {
		// Text is selected
		switch (type) {
			case "bold":
				replacement = `**${selectedText}**`;
				cursorOffset = 2;
				break;
			case "italic":
				replacement = `*${selectedText}*`;
				cursorOffset = 1;
				break;
			case "list":
				// Split by line and add bullet to each line
				replacement = selectedText
					.split("\n")
					.map((line) => (line.trim() ? `- ${line}` : line))
					.join("\n");
				cursorOffset = 2;
				break;
			case "ordered-list":
				// Split by line and add numbers to each line
				replacement = selectedText
					.split("\n")
					.map((line, index) => (line.trim() ? `${index + 1}. ${line}` : line))
					.join("\n");
				cursorOffset = 3;
				break;
		}

		const newValue =
			textarea.value.substring(0, start) +
			replacement +
			textarea.value.substring(end);

		return {
			value: newValue,
			selectionStart: start + replacement.length,
			selectionEnd: start + replacement.length,
		};
	} else {
		// No text selected, insert placeholder
		switch (type) {
			case "bold":
				replacement = "**Bold text**";
				cursorOffset = 2;
				break;
			case "italic":
				replacement = "*Italic text*";
				cursorOffset = 1;
				break;
			case "list":
				replacement = "- List item";
				cursorOffset = 2;
				break;
			case "ordered-list":
				replacement = "1. Ordered item";
				cursorOffset = 3;
				break;
		}

		const newValue =
			textarea.value.substring(0, start) +
			replacement +
			textarea.value.substring(end);

		return {
			value: newValue,
			selectionStart: start + replacement.length - cursorOffset,
			selectionEnd: start + replacement.length - cursorOffset,
		};
	}
};

// Add function to parse mentions and create links
const parseMentions = (text: string) => {
	if (!text) return text;
	
	// Replace @username with linked version - enhanced styling
	return text.replace(/@([a-zA-Z0-9-_]+)/g, (match, username) => {
		return `<a href="/employees/${username}" class="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
			<span class="w-4 h-4 mr-1 rounded-full bg-primary/20 inline-flex items-center justify-center text-[10px] text-primary font-bold">
				${username.charAt(0).toUpperCase()}
			</span>
			@${username}
		</a>`;
	});
};

// Helper for handling Tab key with mentions
	e: React.KeyboardEvent<HTMLInputElement>,
	text: string,
	employees: Employee[],
	onUpdate: (updatedText: string) => void
) => {
	// Only handle Tab key
	if (e.key !== "Tab") return;
	
	// Check if we have a partial @mention
	const match = text.match(/@([a-zA-Z0-9-]*)$/);
	if (!match) return;
	
	// Get the partial username
	const partialName = match[1].toLowerCase();
	if (!partialName) return;
	
	// Find a matching employee
	const matchingEmployee = employees.find(emp => 
		emp.name.toLowerCase().includes(partialName)
	);
	
	if (matchingEmployee) {
		e.preventDefault(); // Prevent tab from moving focus
		
		// Replace the partial mention with the full username
		const updatedText = text.replace(
			/@([a-zA-Z0-9-]*)$/,
			`@${matchingEmployee.name.toLowerCase().replace(/\s+/g, "-")}`
		);
		
		onUpdate(updatedText);
	}
};

// Modify the rendering of task descriptions to handle mentions
const renderTaskDescription = (description: string) => {
	const linkedText = parseMentions(description);
	return <span dangerouslySetInnerHTML={{ __html: linkedText }} />;
};

export default function ShiftDetailsPage() {
	const { shiftId } = useParams<{ shiftId: string }>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [shift, setShift] = useState<Shift | null>(null);
	const [location, setLocation] = useState<Location | null>(null);
	const [assignedEmployees, setAssignedEmployees] = useState<
		AssignedEmployee[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
	const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
	const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
	const [removeEmployeeId, setRemoveEmployeeId] = useState<string | null>(null);
	const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(
		null
	);
	const [removeEmployeeAlertOpen, setRemoveEmployeeAlertOpen] = useState(false);

	// Edit shift states
	const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false);
	const [editDate, setEditDate] = useState("");
	const [editStartTime, setEditStartTime] = useState("");
	const [editEndTime, setEditEndTime] = useState("");
	const [editLocationId, setEditLocationId] = useState("");
	const [editNotes, setEditNotes] = useState("");
	const [editCheckInTasks, setEditCheckInTasks] = useState<CheckInTask[]>([]);
	const [editCheckOutTasks, setEditCheckOutTasks] = useState<CheckOutTask[]>(
		[]
	);
	const [newCheckInTask, setNewCheckInTask] = useState("");
	const [newCheckOutTask, setNewCheckOutTask] = useState("");
	const [locations, setLocations] = useState<Location[]>([]);
	const [saving, setSaving] = useState(false);

	// Task management dialogs
	const [checkInTasksDialogOpen, setCheckInTasksDialogOpen] = useState(false);
	const [checkOutTasksDialogOpen, setCheckOutTasksDialogOpen] = useState(false);
	const [taskSaving, setTaskSaving] = useState(false);
	const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
	const [editingTaskDescription, setEditingTaskDescription] = useState("");

	// Notes management states
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [notesValue, setNotesValue] = useState("");
	const [notesSaving, setNotesSaving] = useState(false);

	// Calculate time difference in hours
	const calculateHours = (startTime: string, endTime: string) => {
		const start = parseISO(startTime);
		const end = parseISO(endTime);
		const hours = differenceInHours(end, start);
		const minutes = differenceInMinutes(end, start) % 60;

		return minutes > 0 ? `${hours}.${minutes}` : `${hours}`;
	};

	// Calculate shift total cost based on all employees' hourly rates
	const calculateTotalCost = () => {
		if (!shift || assignedEmployees.length === 0) return 0;

		const start = parseISO(shift.startTime);
		const end = parseISO(shift.endTime);
		const hours = differenceInHours(end, start);
		const minutes = differenceInMinutes(end, start) % 60;
		const totalHours = hours + minutes / 60;

		// Sum up the cost for all assigned employees
		const totalCost = assignedEmployees.reduce((sum, employee) => {
			if (!employee.hourlyRate) return sum;
			return sum + totalHours * employee.hourlyRate;
		}, 0);

		return totalCost.toFixed(2);
	};

	// Calculate individual employee cost
	const calculateEmployeeCost = (employee: Employee) => {
		if (!shift || !employee.hourlyRate) return 0;

		const start = parseISO(shift.startTime);
		const end = parseISO(shift.endTime);
		const hours = differenceInHours(end, start);
		const minutes = differenceInMinutes(end, start) % 60;
		const totalHours = hours + minutes / 60;

		return (totalHours * employee.hourlyRate).toFixed(2);
	};

	// Fetch shift details and assigned employees
	useEffect(() => {
		async function fetchShiftDetails() {
			try {
				setLoading(true);
				if (!shiftId) return;

				// Fetch shift details
				const shiftData = await ShiftsAPI.getById(shiftId);
				console.log("DEBUG-UI: Received shift data:", shiftData);

				if (!shiftData) {
					toast.error("Shift not found");
					navigate("/schedule");
					return;
				}

				console.log(
					"DEBUG-UI: Setting shift:",
					JSON.stringify(shiftData, null, 2)
				);
				console.log("DEBUG-UI: Check-in tasks:", shiftData.checkInTasks);
				console.log("DEBUG-UI: Check-out tasks:", shiftData.checkOutTasks);

				setShift(shiftData);

				// Fetch location details if available
				if (shiftData.locationId) {
					const locationData = await LocationsAPI.getById(shiftData.locationId);
					setLocation(locationData);
				}

				// Fetch all employees for the organization
				const organizationId = searchParams.get("organizationId") || "org-1";
				const allEmployeeData = await EmployeesAPI.getAll(organizationId);
				setAllEmployees(allEmployeeData);

				// Fetch shift assignments for this shift
				const assignments = await ShiftAssignmentsAPI.getByShiftId(shiftId);
				console.log(
					`DEBUG-UI: Found ${assignments.length} assignments for shift ${shiftId}:`,
					assignments
				);

				// If no assignments are found but the shift exists, create one based on the shift data
				if (assignments.length === 0 && shiftData.employeeId) {
					console.log(
						`DEBUG-UI: No assignments found, creating one based on shift data for employee ${shiftData.employeeId}`
					);

					try {
						// Create assignment for the employee specified in the shift
						const newAssignment = await ShiftAssignmentsAPI.create({
							shiftId: shiftData.id,
							employeeId: shiftData.employeeId,
							role: shiftData.role,
						});

						console.log(`DEBUG-UI: Created new assignment:`, newAssignment);

						// Add the new assignment to the assignments array
						assignments.push(newAssignment);
					} catch (err) {
						console.error("Failed to create assignment:", err);
					}
				}

				// Map assignments to employees
				const assignedEmployeeData: AssignedEmployee[] = [];

				// Process each assignment
				for (const assignment of assignments) {
					const employee = allEmployeeData.find(
						(e) => e.id === assignment.employeeId
					);
					if (employee) {
						assignedEmployeeData.push({
							...employee,
							assignmentId: assignment.id,
							assignmentRole: assignment.role,
							assignmentNotes: assignment.notes,
						});
					}
				}

				setAssignedEmployees(assignedEmployeeData);

				// Update available employees (exclude already assigned ones)
				const assignedIds = assignedEmployeeData.map((e) => e.id);
				setAvailableEmployees(
					allEmployeeData.filter((emp) => !assignedIds.includes(emp.id))
				);

				// Load locations for edit dialog
				const locationsData = await LocationsAPI.getAll(organizationId);
				setLocations(locationsData);
			} catch (error) {
				console.error("Error fetching shift details:", error);
				toast.error("Failed to load shift details");
			} finally {
				setLoading(false);
			}
		}

		fetchShiftDetails();
	}, [shiftId, navigate, searchParams]);

	// Filter available employees based on search term
	useEffect(() => {
		if (!searchTerm.trim() || !allEmployees.length) {
			const assignedIds = assignedEmployees.map((e) => e.id);
			setAvailableEmployees(
				allEmployees.filter((emp) => !assignedIds.includes(emp.id))
			);
			return;
		}

		const assignedIds = assignedEmployees.map((e) => e.id);
		const filtered = allEmployees.filter(
			(emp) =>
				!assignedIds.includes(emp.id) &&
				(emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					emp.role.toLowerCase().includes(searchTerm.toLowerCase()))
		);
		setAvailableEmployees(filtered);
	}, [searchTerm, allEmployees, assignedEmployees]);

	// Toggle employee selection
	const toggleEmployeeSelection = (employeeId: string) => {
		if (selectedEmployeeIds.includes(employeeId)) {
			// Remove if already selected
			setSelectedEmployeeIds(
				selectedEmployeeIds.filter((id) => id !== employeeId)
			);
		} else {
			// Add if not selected
			setSelectedEmployeeIds([...selectedEmployeeIds, employeeId]);
		}
	};

	// Handle assign multiple employees
	const handleAssignEmployees = async () => {
		if (!shift || selectedEmployeeIds.length === 0) return;

		try {
			setLoading(true);

			const newAssignments = [];

			// Create new assignments for each selected employee
			for (const employeeId of selectedEmployeeIds) {
				// Create new assignment
				const newAssignment = await ShiftAssignmentsAPI.create({
					shiftId: shift.id,
					employeeId: employeeId,
					role: allEmployees.find((e) => e.id === employeeId)?.role,
				});

				newAssignments.push(newAssignment);

				// Find the employee details
				const employee = allEmployees.find((e) => e.id === employeeId);
				if (employee) {
					// Add to assigned employees
					setAssignedEmployees((prev) => [
						...prev,
						{
							...employee,
							assignmentId: newAssignment.id,
							assignmentRole: newAssignment.role,
							assignmentNotes: newAssignment.notes,
						},
					]);
				}
			}

			// Update available employees list
			setAvailableEmployees((prev) =>
				prev.filter((e) => !selectedEmployeeIds.includes(e.id))
			);

			// Reset selection
			setSelectedEmployeeIds([]);
			setAddEmployeeDialogOpen(false);

			toast.success(
				`${selectedEmployeeIds.length} employees assigned to shift successfully`
			);
		} catch (error) {
			console.error("Error assigning employees:", error);
			toast.error("Failed to assign employees");
		} finally {
			setLoading(false);
		}
	};

	// Handle removing an employee from shift
	const handleRemoveEmployee = async () => {
		if (!removeEmployeeId || !removeAssignmentId) return;

		try {
			setLoading(true);

			// Delete the assignment
			await ShiftAssignmentsAPI.delete(removeAssignmentId);

			// Update UI state
			const removedEmployee = assignedEmployees.find(
				(e) => e.id === removeEmployeeId
			);
			if (removedEmployee) {
				// Remove from assigned employees
				setAssignedEmployees((prev) =>
					prev.filter((e) => e.id !== removeEmployeeId)
				);

				// Add back to available employees
				setAvailableEmployees((prev) => [
					...prev,
					{
						...removedEmployee,
						// Remove assignment fields
						assignmentId: undefined,
						assignmentRole: undefined,
						assignmentNotes: undefined,
					} as Employee,
				]);
			}

			setRemoveEmployeeAlertOpen(false);
			toast.success("Employee removed from shift");
		} catch (error) {
			console.error("Error removing employee:", error);
			toast.error("Failed to remove employee");
		} finally {
			setLoading(false);
			setRemoveEmployeeId(null);
			setRemoveAssignmentId(null);
		}
	};

	// Handle deleting the entire shift
	const handleDeleteShift = async () => {
		if (!shift) return;

		try {
			setLoading(true);
			await ShiftsAPI.delete(shift.id);

			// Navigate back to daily shifts
			navigate("/daily-shifts" + window.location.search);
		} catch (error) {
			console.error("Error deleting shift:", error);
			toast.error("Failed to delete shift");
			setLoading(false);
		}
	};

	// Format date for navigation
	const formatDateParam = (date: string) => {
		return parseISO(date).toISOString().split("T")[0];
	};

	// Open edit shift dialog and populate form
	const handleOpenEditDialog = () => {
		if (!shift) return;

		const shiftDate = parseISO(shift.startTime);
		setEditDate(format(shiftDate, "yyyy-MM-dd"));
		setEditStartTime(format(parseISO(shift.startTime), "HH:mm"));
		setEditEndTime(format(parseISO(shift.endTime), "HH:mm"));
		setEditLocationId(shift.locationId || "");
		setEditCheckInTasks(shift.checkInTasks || []);
		setEditCheckOutTasks(shift.checkOutTasks || []);
		setNewCheckInTask("");
		setNewCheckOutTask("");

		setEditShiftDialogOpen(true);
	};

	// Add check-in task
	const handleAddCheckInTask = () => {
		if (!newCheckInTask.trim()) return;
		const newTask: CheckInTask = {
			id: generateUniqueId(),
			description: newCheckInTask.trim(),
			completed: false,
		};
		setEditCheckInTasks([...editCheckInTasks, newTask]);
		setNewCheckInTask("");
	};

	// Add check-out task
	const handleAddCheckOutTask = () => {
		if (!newCheckOutTask.trim()) return;
		const newTask: CheckOutTask = {
			id: generateUniqueId(),
			description: newCheckOutTask.trim(),
			completed: false,
		};
		setEditCheckOutTasks([...editCheckOutTasks, newTask]);
		setNewCheckOutTask("");
	};

	// Remove check-in task
	const handleRemoveCheckInTask = (index: number) => {
		setEditCheckInTasks(editCheckInTasks.filter((_, i) => i !== index));
	};

	// Remove check-out task
	const handleRemoveCheckOutTask = (index: number) => {
		setEditCheckOutTasks(editCheckOutTasks.filter((_, i) => i !== index));
	};

	// Handle edit shift form submission
	const handleEditShift = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!shift || !editDate || !editStartTime || !editEndTime || !shiftId) {
			toast.error("Please fill out all required fields");
			return;
		}

		try {
			setSaving(true);

			// Combine date and times
			const startDateTime = new Date(
				`${editDate}T${editStartTime}`
			).toISOString();
			const endDateTime = new Date(`${editDate}T${editEndTime}`).toISOString();

			// Update shift
			const updatedShift = await ShiftsAPI.update({
				id: shiftId,
				startTime: startDateTime,
				endTime: endDateTime,
				locationId: editLocationId || undefined,
			});

			// Update local state
			if (updatedShift) {
				setShift(updatedShift);

				// Update location if changed
				if (updatedShift.locationId !== shift.locationId) {
					if (updatedShift.locationId) {
						const locationData = await LocationsAPI.getById(
							updatedShift.locationId
						);
						setLocation(locationData);
					} else {
						setLocation(null);
					}
				}

				toast.success("Shift updated successfully");
				setEditShiftDialogOpen(false);
			}
		} catch (error) {
			console.error("Error saving shift:", error);
			toast.error("Failed to update shift");
		} finally {
			setSaving(false);
		}
	};

	// Open the check-in tasks management dialog
	const openCheckInTasksDialog = () => {
		if (!shift) return;
		setEditCheckInTasks(shift.checkInTasks || []);
		setNewCheckInTask("");
		setEditingTaskIndex(null);
		setEditingTaskDescription("");
		setCheckInTasksDialogOpen(true);
	};

	// Open the check-out tasks management dialog
	const openCheckOutTasksDialog = () => {
		if (!shift) return;
		setEditCheckOutTasks(shift.checkOutTasks || []);
		setNewCheckOutTask("");
		setEditingTaskIndex(null);
		setEditingTaskDescription("");
		setCheckOutTasksDialogOpen(true);
	};

	// Start editing a check-in task
	const startEditingCheckInTask = (index: number) => {
		setEditingTaskIndex(index);
		setEditingTaskDescription(editCheckInTasks[index].description);
	};

	// Start editing a check-out task
	const startEditingCheckOutTask = (index: number) => {
		setEditingTaskIndex(index);
		setEditingTaskDescription(editCheckOutTasks[index].description);
	};

	// Save edited check-in task
	const saveEditedCheckInTask = () => {
		if (editingTaskIndex === null || !editingTaskDescription.trim()) return;

		const updatedTasks = [...editCheckInTasks];
		updatedTasks[editingTaskIndex] = {
			...updatedTasks[editingTaskIndex],
			description: editingTaskDescription.trim(),
		};

		setEditCheckInTasks(updatedTasks);
		setEditingTaskIndex(null);
		setEditingTaskDescription("");
	};

	// Save edited check-out task
	const saveEditedCheckOutTask = () => {
		if (editingTaskIndex === null || !editingTaskDescription.trim()) return;

		const updatedTasks = [...editCheckOutTasks];
		updatedTasks[editingTaskIndex] = {
			...updatedTasks[editingTaskIndex],
			description: editingTaskDescription.trim(),
		};

		setEditCheckOutTasks(updatedTasks);
		setEditingTaskIndex(null);
		setEditingTaskDescription("");
	};

	// Toggle task completion status
	const toggleTaskCompletion = (
		taskType: "checkIn" | "checkOut",
		index: number
	) => {
		if (taskType === "checkIn") {
			const updatedTasks = [...editCheckInTasks];
			updatedTasks[index] = {
				...updatedTasks[index],
				completed: !updatedTasks[index].completed,
			};
			setEditCheckInTasks(updatedTasks);
		} else {
			const updatedTasks = [...editCheckOutTasks];
			updatedTasks[index] = {
				...updatedTasks[index],
				completed: !updatedTasks[index].completed,
			};
			setEditCheckOutTasks(updatedTasks);
		}
	};

	// Handle saving check-in tasks
	const saveCheckInTasks = () => {
		if (!shift) return;

		setTaskSaving(true);
		try {
			ShiftsAPI.updateShiftTasks(shift.id, { checkInTasks: editCheckInTasks })
				.then((updatedShift) => {
					if (updatedShift) {
						setShift(updatedShift);
						toast.success("Check-in tasks updated successfully!");
						setCheckInTasksDialogOpen(false);
					}
				})
				.catch((error) => {
					console.error("Failed to update check-in tasks:", error);
					toast.error("Failed to update check-in tasks");
				})
				.finally(() => {
					setTaskSaving(false);
				});
		} catch (error) {
			console.error("Failed to update check-in tasks:", error);
			toast.error("Failed to update check-in tasks");
			setTaskSaving(false);
		}
	};

	// Handle saving check-out tasks
	const saveCheckOutTasks = () => {
		if (!shift) return;

		setTaskSaving(true);
		try {
			ShiftsAPI.updateShiftTasks(shift.id, { checkOutTasks: editCheckOutTasks })
				.then((updatedShift) => {
					if (updatedShift) {
						setShift(updatedShift);
						toast.success("Check-out tasks updated successfully!");
						setCheckOutTasksDialogOpen(false);
					}
				})
				.catch((error) => {
					console.error("Failed to update check-out tasks:", error);
					toast.error("Failed to update check-out tasks");
				})
				.finally(() => {
					setTaskSaving(false);
				});
		} catch (error) {
			console.error("Failed to update check-out tasks:", error);
			toast.error("Failed to update check-out tasks");
			setTaskSaving(false);
		}
	};

	// Toggle task completion from the main view
	const toggleMainViewTaskCompletion = async (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		try {
			let updatedTasks;
			if (taskType === "checkIn" && shift.checkInTasks) {
				updatedTasks = shift.checkInTasks.map((task) =>
					task.id === taskId ? { ...task, completed: !task.completed } : task
				);

				const updatedShift = await ShiftsAPI.updateShiftTasks(shift.id, {
					checkInTasks: updatedTasks,
				});

				if (updatedShift) {
					setShift(updatedShift);
					toast.success(
						`Task marked as ${
							updatedTasks.find((t) => t.id === taskId)?.completed
								? "completed"
								: "incomplete"
						}`
					);
				}
			} else if (taskType === "checkOut" && shift.checkOutTasks) {
				updatedTasks = shift.checkOutTasks.map((task) =>
					task.id === taskId ? { ...task, completed: !task.completed } : task
				);

				const updatedShift = await ShiftsAPI.updateShiftTasks(shift.id, {
					checkOutTasks: updatedTasks,
				});

				if (updatedShift) {
					setShift(updatedShift);
					toast.success(
						`Task marked as ${
							updatedTasks.find((t) => t.id === taskId)?.completed
								? "completed"
								: "incomplete"
						}`
					);
				}
			}
		} catch (error) {
			console.error(`Failed to update task completion:`, error);
			toast.error("Failed to update task");
		}
	};

	// Remove a single task from the main view
	const removeTask = async (
		taskType: "checkIn" | "checkOut",
		taskId: string
	) => {
		if (!shift) return;

		try {
			if (taskType === "checkIn" && shift.checkInTasks) {
				const updatedTasks = shift.checkInTasks.filter(
					(task) => task.id !== taskId
				);

				const updatedShift = await ShiftsAPI.updateShiftTasks(shift.id, {
					checkInTasks: updatedTasks,
				});

				if (updatedShift) {
					setShift(updatedShift);
					toast.success("Check-in task removed");
				}
			} else if (taskType === "checkOut" && shift.checkOutTasks) {
				const updatedTasks = shift.checkOutTasks.filter(
					(task) => task.id !== taskId
				);

				const updatedShift = await ShiftsAPI.updateShiftTasks(shift.id, {
					checkOutTasks: updatedTasks,
				});

				if (updatedShift) {
					setShift(updatedShift);
					toast.success("Check-out task removed");
				}
			}
		} catch (error) {
			console.error(`Failed to remove task:`, error);
			toast.error("Failed to remove task");
		}
	};

	// Clear shift notes
	const clearShiftNotes = async () => {
		if (!shift) return;

		try {
			const updatedShift = await ShiftsAPI.update({
				id: shift.id,
				notes: "",
			});

			if (updatedShift) {
				setShift(updatedShift);
				toast.success("Notes cleared");
			}
		} catch (error) {
			console.error("Failed to clear notes:", error);
			toast.error("Failed to clear notes");
		}
	};

	// Open notes dialog
	const handleOpenNotesDialog = () => {
		if (!shift) return;
		setNotesValue(shift.notes || "");
		setNotesDialogOpen(true);
	};

	// Save notes
	const handleSaveNotes = async () => {
		if (!shift) return;

		try {
			setNotesSaving(true);
			const updatedShift = await ShiftsAPI.update({
				id: shift.id,
				notes: notesValue,
			});

			if (updatedShift) {
				setShift(updatedShift);
				toast.success("Notes updated successfully");
				setNotesDialogOpen(false);
			}
		} catch (error) {
			console.error("Failed to update notes:", error);
			toast.error("Failed to update notes");
		} finally {
			setNotesSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!shift) {
		return (
			<div className="container py-8">
				<h1 className="text-2xl font-bold">Shift not found</h1>
				<Button
					variant="outline"
					onClick={() => navigate("/schedule")}
					className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
			{/* Breadcrumb Navigation */}
			<div className="flex items-center text-sm text-muted-foreground mb-4">
				<Link
					to="/schedule"
					className="hover:text-foreground">
					Schedule
				</Link>
				<ChevronRight className="h-4 w-4 mx-1" />
				{shift && (
					<>
						<Link
							to={`/daily-shifts?date=${formatDateParam(shift.startTime)}${
								window.location.search.includes("organizationId")
									? "&" + window.location.search.substring(1)
									: ""
							}`}
							className="hover:text-foreground">
							{format(parseISO(shift.startTime), "MMMM d, yyyy")}
						</Link>
						<ChevronRight className="h-4 w-4 mx-1" />
					</>
				)}
				<span className="text-foreground font-medium">Shift Details</span>
			</div>

			{/* Main Content - Shift Details */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				{/* Header Section */}
				<div className="border-b p-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h1 className="text-xl font-bold flex items-center">
								Shift Details
								<Badge
									className="ml-2"
									variant={
										assignedEmployees.length > 0 ? "default" : "destructive"
									}>
									{assignedEmployees.length > 0
										? `${assignedEmployees.length} Assigned`
										: "Unassigned"}
								</Badge>
							</h1>
							{shift && (
								<p className="text-muted-foreground mt-1">
									{format(parseISO(shift.startTime), "EEEE, MMMM d, yyyy")} ·
									{format(parseISO(shift.startTime), "h:mm a")} -{" "}
									{format(parseISO(shift.endTime), "h:mm a")}
								</p>
							)}
						</div>

						<div className="flex items-center gap-2 self-end sm:self-auto">
							{shift && (
								<Button
									variant="outline"
									size="sm"
									className="h-9"
									asChild>
									<Link
										to={`/daily-shifts?date=${formatDateParam(
											shift.startTime
										)}${
											window.location.search.includes("organizationId")
												? "&" + window.location.search.substring(1)
												: ""
										}`}>
										<ArrowLeft className="h-4 w-4 mr-2" />
										Back
									</Link>
								</Button>
							)}

							<Button
								variant="outline"
								size="sm"
								className="h-9 gap-1"
								onClick={handleOpenEditDialog}>
								<Edit className="h-4 w-4" />
								Edit Shift
							</Button>

							<AlertDialog
								open={deleteAlertOpen}
								onOpenChange={(open) => setDeleteAlertOpen(open)}>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="h-9 text-destructive border-destructive/30">
										<Trash className="h-4 w-4 mr-2" /> Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This will permanently delete this shift from the schedule.
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDeleteShift}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				</div>

				{/* Shift Information Section */}
				{shift && (
					<div className="p-5">
						<div className="flex flex-col md:flex-row md:items-start gap-5">
							{/* Left column - Basic shift details */}
							<div className="flex-grow">
								<h2 className="text-lg font-medium mb-4 flex items-center">
									<Clock className="mr-2 h-5 w-5 text-muted-foreground" />
									Shift Information
								</h2>

								{/* Time and Location in a clean grid layout */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
											<Clock className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">Time</div>
											<div className="text-sm">
												{format(parseISO(shift.startTime), "h:mm a")} -{" "}
												{format(parseISO(shift.endTime), "h:mm a")}
											</div>
											<div className="text-xs text-muted-foreground mt-1">
												{calculateHours(shift.startTime, shift.endTime)} hours
											</div>
										</div>
									</div>

									{/* Location information */}
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
											<MapPin className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">Location</div>
											{location ? (
												<div className="text-sm">{location.name}</div>
											) : (
												<div className="text-sm text-muted-foreground">
													No location assigned
												</div>
											)}
											{location && location.address && (
												<div className="text-xs text-muted-foreground mt-1">
													{location.address}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Right column - Cost calculation */}
							<div className="md:w-80 md:border-l md:pl-5">
								<h2 className="text-lg font-medium mb-4 flex items-center">
									<DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
									Shift Cost
								</h2>

								{assignedEmployees.length > 0 &&
								assignedEmployees.some((e) => e.hourlyRate) ? (
									<div>
										{/* Simplified cost display - only total */}
										<div className="mb-4">
											<div className="flex justify-between font-medium items-center">
												<span>Total Cost:</span>
												<span className="text-xl text-primary">
													${calculateTotalCost()}
												</span>
											</div>
											<Separator className="my-3" />
											<div className="text-xs text-muted-foreground">
												This calculation is based on hourly rates and does not
												include overtime or benefits.
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-4 text-muted-foreground">
										<p className="text-sm">
											{assignedEmployees.length > 0
												? "Employees have no hourly rates set"
												: "No employees assigned"}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Employees Section - Moved outside the main card */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium flex items-center">
						<Users className="mr-2 h-5 w-5 text-muted-foreground" />
						Employees ({assignedEmployees.length})
					</h2>
					<Button
						variant="default"
						size="sm"
						onClick={() => setAddEmployeeDialogOpen(true)}
						disabled={availableEmployees.length === 0}>
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
						<h3 className="text-base font-medium mb-1">
							No check-in tasks defined
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Add check-in tasks to track work needed at the start of a shift.
						</p>
						<Button
							onClick={() => setAddEmployeeDialogOpen(true)}
							disabled={availableEmployees.length === 0}>
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
													<div className="text-sm text-muted-foreground truncate">
														{employee.assignmentRole || employee.role}
													</div>
													{employee.assignmentNotes && (
														<div className="text-xs text-muted-foreground mt-1 line-clamp-1">
															{employee.assignmentNotes}
														</div>
													)}
												</div>
											</div>
										</td>

										{/* Cost column */}
										<td className="px-4 py-3 text-right">
											{employee.hourlyRate ? (
												<div>
													<div className="font-medium">
														${calculateEmployeeCost(employee)}
													</div>
													<div className="text-xs text-muted-foreground">
														${employee.hourlyRate.toFixed(2)}/hr
													</div>
												</div>
											) : (
												<div className="text-muted-foreground">
													Rate not set
												</div>
											)}
										</td>

										{/* Actions column */}
										<td className="px-4 py-3 text-right">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
												onClick={() => {
													setRemoveEmployeeId(employee.id);
													setRemoveAssignmentId(employee.assignmentId);
													setRemoveEmployeeAlertOpen(true);
												}}>
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

			{/* Notes Section - Moved outside the main card */}
			{shift && (
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-medium flex items-center">
							Manager Notes
						</h2>
						<div className="flex gap-2">
							{shift.notes && (
								<Button
									variant="outline"
									size="sm"
									className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
									onClick={clearShiftNotes}>
									<Trash className="h-4 w-4" /> Clear Notes
								</Button>
							)}
							<Button
								variant="outline"
								size="sm"
								className="gap-1"
								onClick={handleOpenNotesDialog}>
								<Edit className="h-4 w-4" />{" "}
								{shift.notes ? "Edit Notes" : "Add Notes"}
							</Button>
						</div>
					</div>

					{shift.notes ? (
						<div className="bg-white rounded-md border overflow-hidden">
							<div className="p-4">
								<div className="space-y-2">
									{shift.notes.includes("VIP") && (
										<div className="flex items-start text-amber-600 font-medium">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-4 h-4 mr-2 mt-0.5">
												<path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
												<path d="M12 2v2" />
												<path d="M12 20v2" />
												<path d="M20 12h2" />
												<path d="M2 12h2" />
											</svg>
											<div
												dangerouslySetInnerHTML={{
													__html: parseSimpleMarkdown(shift.notes),
												}}
											/>
										</div>
									)}

									{shift.notes.includes("Training") && (
										<div className="flex items-start text-blue-600">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-4 h-4 mr-2 mt-0.5">
												<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
												<path d="M13.73 21a2 2 0 0 1-3.46 0" />
											</svg>
											<div
												dangerouslySetInnerHTML={{
													__html: parseSimpleMarkdown(shift.notes),
												}}
											/>
										</div>
									)}

									{!shift.notes.includes("VIP") &&
										!shift.notes.includes("Training") && (
											<div className="flex items-start">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground">
													<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
												</svg>
												<div
													dangerouslySetInnerHTML={{
														__html: parseSimpleMarkdown(shift.notes),
													}}
												/>
											</div>
										)}

									{shift.notes.includes("meeting") && (
										<div className="flex items-center mt-2 text-xs text-muted-foreground">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-3 h-3 mr-1">
												<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
												<path d="M12 7v5l2 2" />
											</svg>
											<span>
												Staff meeting{" "}
												{shift.notes.match(
													/at (\d+(?::\d+)?(?:am|pm)?)/i
												)?.[1] || ""}
											</span>
										</div>
									)}

									{shift.notes.includes("inspection") && (
										<div className="flex items-center mt-2 text-xs text-muted-foreground">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-3 h-3 mr-1">
												<path d="M8 3H5a2 2 0 0 0-2 2v3" />
												<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
												<path d="M3 16v3a2 2 0 0 0 2 2h3" />
												<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
												<path d="m9 11 3 3" />
												<path d="m12 8 3 3" />
												<path d="m15 5 1 1" />
												<path d="m5 15 1 1" />
												<path d="m8 18 1 1" />
											</svg>
											<span>
												Vehicle inspection{" "}
												{shift.notes.match(
													/at (\d+(?::\d+)?(?:am|pm)?)/i
												)?.[1] || ""}
											</span>
										</div>
									)}

									{shift.notes.includes("rush") && (
										<div className="flex items-center mt-2 text-xs text-orange-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-3 h-3 mr-1">
												<path d="M13 2 L13 10 L20 10" />
												<circle
													cx="12"
													cy="14"
													r="8"
												/>
											</svg>
											<span>High volume expected</span>
										</div>
									)}

									{shift.notes.includes("closing") && (
										<div className="flex items-center mt-2 text-xs text-muted-foreground">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="w-3 h-3 mr-1">
												<path d="m18 6-2-2H8L6 6" />
												<path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5Z" />
												<path d="M10 16h4" />
											</svg>
											<span>Responsible for end-of-day closing</span>
										</div>
									)}
								</div>
							</div>
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
							<h3 className="text-base font-medium mb-1">No notes added yet</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Add notes to provide additional information about the shift.
							</p>
							<Button onClick={handleOpenNotesDialog}>
								<Plus className="h-4 w-4 mr-2" /> Add Notes
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Tasks Section - Moved outside the main card */}
			{shift && (
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-medium flex items-center">
							Shift Tasks
						</h2>
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
								onClick={openCheckInTasksDialog}>
								<Plus className="h-4 w-4 mr-1" /> Add Tasks
							</Button>
						</div>

						{shift.checkInTasks && shift.checkInTasks.length > 0 ? (
							<div className="bg-white border rounded-md overflow-hidden">
								<ul className="divide-y">
									{shift.checkInTasks.map((task) => (
										<li
											key={task.id}
											className="flex items-center px-4 py-3 gap-3">
											<Checkbox
												id={`checkin-${task.id}`}
												checked={task.completed}
												className="mt-0"
												onCheckedChange={() =>
													toggleMainViewTaskCompletion("checkIn", task.id)
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
													onClick={openCheckInTasksDialog}>
													<Edit className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-muted-foreground hover:text-destructive"
													onClick={() => removeTask("checkIn", task.id)}>
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
									Add check-in tasks to track work needed at the start of a
									shift.
								</p>
								<Button onClick={openCheckInTasksDialog}>
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
								onClick={openCheckOutTasksDialog}>
								<Plus className="h-4 w-4 mr-1" /> Add Tasks
							</Button>
						</div>

						{shift.checkOutTasks && shift.checkOutTasks.length > 0 ? (
							<div className="bg-white border rounded-md overflow-hidden">
								<ul className="divide-y">
									{shift.checkOutTasks.map((task) => (
										<li
											key={task.id}
											className="flex items-center px-4 py-3 gap-3">
											<Checkbox
												id={`checkout-${task.id}`}
												checked={task.completed}
												className="mt-0"
												onCheckedChange={() =>
													toggleMainViewTaskCompletion("checkOut", task.id)
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
													onClick={openCheckOutTasksDialog}>
													<Edit className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-muted-foreground hover:text-destructive"
													onClick={() => removeTask("checkOut", task.id)}>
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
									Add check-out tasks to track work needed at the end of a
									shift.
								</p>
								<Button onClick={openCheckOutTasksDialog}>
									<Plus className="h-4 w-4 mr-2" /> Add check-out tasks
								</Button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Dialog for adding employees */}
			<Dialog
				open={addEmployeeDialogOpen}
				onOpenChange={(open) => {
					setAddEmployeeDialogOpen(open);
					if (!open) {
						setSelectedEmployeeIds([]);
						setSearchTerm("");
					}
				}}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Assign Employees to Shift</DialogTitle>
						<DialogDescription>
							Select employees to assign to this shift on{" "}
							{format(
								parseISO(shift?.startTime || new Date().toISOString()),
								"MMM d, yyyy"
							)}
							from{" "}
							{format(
								parseISO(shift?.startTime || new Date().toISOString()),
								"h:mm a"
							)}{" "}
							to{" "}
							{format(
								parseISO(shift?.endTime || new Date().toISOString()),
								"h:mm a"
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						<Label
							htmlFor="employeeSearch"
							className="text-sm">
							Search employees
						</Label>
						<Input
							id="employeeSearch"
							placeholder="Search by name or role..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="mb-2"
						/>

						<ScrollArea className="h-72 border">
							{availableEmployees.length === 0 ? (
								<div className="p-4 text-center text-muted-foreground">
									{searchTerm
										? "No employees match your search"
										: "No available employees"}
								</div>
							) : (
								<div className="divide-y">
									{availableEmployees.map((emp) => (
										<div
											key={emp.id}
											className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/20 transition-colors ${
												selectedEmployeeIds.includes(emp.id)
													? "bg-accent/40"
													: ""
											}`}
											onClick={() => toggleEmployeeSelection(emp.id)}>
											<Checkbox
												id={`employee-${emp.id}`}
												checked={selectedEmployeeIds.includes(emp.id)}
												onCheckedChange={() => toggleEmployeeSelection(emp.id)}
												className="mr-1"
											/>
											<Avatar className="h-8 w-8">
												<AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
												{emp.avatar && <AvatarImage src={emp.avatar} />}
											</Avatar>
											<div className="flex-1">
												<div className="font-medium text-sm">{emp.name}</div>
												<div className="text-xs text-muted-foreground">
													{emp.role}
												</div>
											</div>
											<div className="text-xs">
												{emp.hourlyRate
													? `$${emp.hourlyRate.toFixed(2)}/hr`
													: "-"}
											</div>
										</div>
									))}
								</div>
							)}
						</ScrollArea>
					</div>

					<DialogFooter>
						<div className="mr-auto text-sm">
							{selectedEmployeeIds.length} employee
							{selectedEmployeeIds.length !== 1 ? "s" : ""} selected
						</div>
						<Button
							variant="outline"
							onClick={() => setAddEmployeeDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={selectedEmployeeIds.length === 0}
							onClick={handleAssignEmployees}>
							Assign Employees
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Alert dialog for removing employee */}
			<AlertDialog
				open={removeEmployeeAlertOpen}
				onOpenChange={(open) => setRemoveEmployeeAlertOpen(open)}>
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
								setRemoveEmployeeId(null);
								setRemoveAssignmentId(null);
							}}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemoveEmployee}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit Shift Dialog */}
			<Dialog
				open={editShiftDialogOpen}
				onOpenChange={setEditShiftDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Edit Shift</DialogTitle>
						<DialogDescription>
							Make changes to the shift details
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleEditShift}
						className="space-y-4 py-2">
						{/* Date */}
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={editDate}
								onChange={(e) => setEditDate(e.target.value)}
								required
							/>
						</div>

						{/* Time Range */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input
									id="startTime"
									type="time"
									value={editStartTime}
									onChange={(e) => setEditStartTime(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endTime">End Time</Label>
								<Input
									id="endTime"
									type="time"
									value={editEndTime}
									onChange={(e) => setEditEndTime(e.target.value)}
									required
								/>
							</div>
						</div>

						{/* Location */}
						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<select
								id="location"
								className="w-full h-10 px-3 py-2 border rounded-md"
								value={editLocationId}
								onChange={(e) => setEditLocationId(e.target.value)}>
								<option value="">No location</option>
								{locations.map((loc) => (
									<option
										key={loc.id}
										value={loc.id}>
										{loc.name}
									</option>
								))}
							</select>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<div className="relative">
								<Textarea
									id="notes"
									value={editNotes}
									onChange={(e) => setEditNotes(e.target.value)}
									placeholder="Add any additional notes or instructions..."
									rows={3}
								/>
								{editNotes && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-2 top-2 h-6 text-xs text-muted-foreground hover:text-destructive"
										onClick={() => setEditNotes("")}>
										Clear
									</Button>
								)}
							</div>
						</div>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditShiftDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={saving}
								className="gap-2">
								{saving && (
									<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
								)}
								<Save className="h-4 w-4 mr-1" /> Save Changes
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Check-in Tasks Dialog */}
			<Dialog
				open={checkInTasksDialogOpen}
				onOpenChange={setCheckInTasksDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Manage Check-in Tasks</DialogTitle>
						<DialogDescription>
							Add, edit, or remove check-in tasks for this shift.
							Use @username to mention employees (they'll appear as highlighted badges).
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="space-y-4">
							{editCheckInTasks.length === 0 ? (
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
									<h3 className="text-lg font-semibold">No check-in tasks</h3>
									<p className="text-sm text-muted-foreground mt-2 mb-4">
										Add tasks that need to be completed when starting a shift.
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{editCheckInTasks.map((task, index) => (
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
																	e, 
																	editingTaskDescription, 
																	allEmployees, 
																	(updatedText) => setEditingTaskDescription(updatedText)
																)}
																autoFocus
																className="text-sm"
																placeholder="Edit task... Use @ to mention employees (Tab to complete)"
															/>
															{editingTaskDescription.includes("@") && (
																<div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-md border shadow-sm z-50">
																	<div className="p-1 text-xs text-muted-foreground border-b">
																		Suggested employees
																	</div>
																	<div className="max-h-32 overflow-y-auto">
																		{allEmployees
																			.filter((emp) => {
																				// Extract the query after @ symbol
																				const match = editingTaskDescription.match(/@([a-zA-Z0-9-]*)$/);
																				if (!match) return true; // Show all if no specific query

																				const query = match[1].toLowerCase();
																				return emp.name.toLowerCase().includes(query);
																			})
																			.slice(0, 5)
																			.map((emp) => (
																				<div
																					key={emp.id}
																					className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 cursor-pointer text-sm"
																					onClick={() => {
																						// Replace the partial @query with @employee-name
																						const updatedTask = editingTaskDescription.replace(
																							/@([a-zA-Z0-9-]*)$/,
																							`@${emp.name.toLowerCase().replace(/\s+/g, "-")}`
																						);
																						setEditingTaskDescription(updatedTask);
																					}}>
																					<Avatar className="h-6 w-6">
																						<AvatarFallback className="text-xs">
																							{emp.name.charAt(0)}
																						</AvatarFallback>
																						{emp.avatar && <AvatarImage src={emp.avatar} />}
																					</Avatar>
																					<span>{emp.name}</span>
																				</div>
																			))}
																		</div>
																	</div>
																</div>
															)}
														</div>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-green-600 flex-shrink-0"
															onClick={saveEditedCheckInTask}>
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
															id={`edit-checkin-${task.id}`}
															checked={task.completed}
															className="mt-0.5"
															onCheckedChange={() =>
																toggleTaskCompletion("checkIn", index)
															}
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
																	startEditingCheckInTask(index);
																}}>
																<Edit className="h-3.5 w-3.5" />
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-7 w-7 text-muted-foreground hover:text-destructive"
																onClick={() => handleRemoveCheckInTask(index)}>
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
											placeholder="Add a check-in task... Use @ to mention employees (Tab to complete)"
											value={newCheckInTask}
											onChange={(e) => setNewCheckInTask(e.target.value)}
												e, 
												newCheckInTask, 
												allEmployees, 
												(updatedText) => setNewCheckInTask(updatedText)
											)}
											className="text-sm pr-16"
										/>
										<Button
											type="button"
											size="sm"
											className="absolute right-1 top-1 h-7"
											onClick={handleAddCheckInTask}
											disabled={!newCheckInTask.trim()}>
											Add
										</Button>
									</div>
									<div className="text-xs text-muted-foreground">
										Tip: Use @ to mention employees (e.g., @miche-loah)
									</div>
									{newCheckInTask.includes("@") && (
										<div className="mt-1 bg-white rounded-md border shadow-sm">
											<div className="p-1 text-xs text-muted-foreground border-b">
												Suggested employees
											</div>
											<div className="max-h-32 overflow-y-auto">
												{allEmployees
													.filter((emp) => {
														// Extract the query after @ symbol
														const match =
															newCheckInTask.match(/@([a-zA-Z0-9-]*)$/);
														if (!match) return true; // Show all if no specific query

														const query = match[1].toLowerCase();
														return emp.name.toLowerCase().includes(query);
													})
													.slice(0, 5)
													.map((emp) => (
														<div
															key={emp.id}
															className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 cursor-pointer text-sm"
															onClick={() => {
																// Replace the partial @query with @employee-name
																const updatedTask = newCheckInTask.replace(
																	/@([a-zA-Z0-9-]*)$/,
																	`@${emp.name
																		.toLowerCase()
																		.replace(/\s+/g, "-")}`
																);
																setNewCheckInTask(updatedTask);
															}}>
															<Avatar className="h-6 w-6">
																<AvatarFallback className="text-xs">
																	{emp.name.charAt(0)}
																</AvatarFallback>
																{emp.avatar && <AvatarImage src={emp.avatar} />}
															</Avatar>
															<span>{emp.name}</span>
														</div>
													))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setCheckInTasksDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={saveCheckInTasks}
							disabled={taskSaving}
							className="gap-2">
							{taskSaving && (
								<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
							)}
							<Save className="h-4 w-4 mr-1" /> Save Tasks
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Check-out Tasks Dialog */}
			<Dialog
				open={checkOutTasksDialogOpen}
				onOpenChange={setCheckOutTasksDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Manage Check-out Tasks</DialogTitle>
						<DialogDescription>
							Add, edit, or remove check-out tasks for this shift.
							Use @username to mention employees (they'll appear as highlighted badges).
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="space-y-4">
							{editCheckOutTasks.length === 0 ? (
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
											<rect
												width="18"
												height="18"
												x="3"
												y="3"
												rx="2"
											/>
											<path d="M8 12h8" />
										</svg>
									</div>
									<h3 className="text-lg font-semibold">No check-out tasks</h3>
									<p className="text-sm text-muted-foreground mt-2 mb-4">
										Add tasks that need to be completed at the end of a shift.
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{editCheckOutTasks.map((task, index) => (
										<div
											key={task.id}
											className="flex items-center justify-between bg-muted/30 rounded-md p-3">
											<div className="flex items-center gap-2 flex-grow">
												{editingTaskIndex === index ? (
													<div className="flex items-center gap-2 w-full">
														<Input
															value={editingTaskDescription}
															onChange={(e) =>
																setEditingTaskDescription(e.target.value)
															}
																e, 
																editingTaskDescription, 
																allEmployees, 
																(updatedText) => setEditingTaskDescription(updatedText)
															)}
															autoFocus
															className="text-sm"
															placeholder="Edit task... Use @ to mention employees (Tab to complete)"
														/>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-green-600 flex-shrink-0"
															onClick={saveEditedCheckOutTask}>
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
															onCheckedChange={() =>
																toggleTaskCompletion("checkOut", index)
															}
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
																	startEditingCheckOutTask(index);
																}}>
																<Edit className="h-3.5 w-3.5" />
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-7 w-7 text-muted-foreground hover:text-destructive"
																onClick={() => handleRemoveCheckOutTask(index)}>
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
											placeholder="Add a check-out task... Use @ to mention employees (Tab to complete)"
											value={newCheckOutTask}
											onChange={(e) => setNewCheckOutTask(e.target.value)}
												e, 
												newCheckOutTask, 
												allEmployees, 
												(updatedText) => setNewCheckOutTask(updatedText)
											)}
											className="text-sm pr-16"
										/>
										<Button
											type="button"
											size="sm"
											className="absolute right-1 top-1 h-7"
											onClick={handleAddCheckOutTask}
											disabled={!newCheckOutTask.trim()}>
											Add
										</Button>
									</div>
									<div className="text-xs text-muted-foreground">
										Tip: Use @ to mention employees (e.g., @miche-loah)
									</div>
									{newCheckOutTask.includes("@") && (
										<div className="mt-1 bg-white rounded-md border shadow-sm">
											<div className="p-1 text-xs text-muted-foreground border-b">
												Suggested employees
											</div>
											<div className="max-h-32 overflow-y-auto">
												{allEmployees
													.filter((emp) => {
														// Extract the query after @ symbol
														const match =
															newCheckOutTask.match(/@([a-zA-Z0-9-]*)$/);
														if (!match) return true; // Show all if no specific query

														const query = match[1].toLowerCase();
														return emp.name.toLowerCase().includes(query);
													})
													.slice(0, 5)
													.map((emp) => (
														<div
															key={emp.id}
															className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 cursor-pointer text-sm"
															onClick={() => {
																// Replace the partial @query with @employee-name
																const updatedTask = newCheckOutTask.replace(
																	/@([a-zA-Z0-9-]*)$/,
																	`@${emp.name
																		.toLowerCase()
																		.replace(/\s+/g, "-")}`
																);
																setNewCheckOutTask(updatedTask);
															}}>
															<Avatar className="h-6 w-6">
																<AvatarFallback className="text-xs">
																	{emp.name.charAt(0)}
																</AvatarFallback>
																{emp.avatar && <AvatarImage src={emp.avatar} />}
															</Avatar>
															<span>{emp.name}</span>
														</div>
													))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setCheckOutTasksDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={saveCheckOutTasks}
							disabled={taskSaving}
							className="gap-2">
							{taskSaving && (
								<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
							)}
							<Save className="h-4 w-4 mr-1" /> Save Tasks
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Notes Dialog */}
			<Dialog
				open={notesDialogOpen}
				onOpenChange={setNotesDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{shift?.notes ? "Edit Notes" : "Add Notes"}
						</DialogTitle>
						<DialogDescription>
							{shift?.notes
								? "Update notes for this shift"
								: "Add notes to provide additional information about this shift"}
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="notes">Notes</Label>

								<div className="border rounded-md">
									<div className="border-b px-2 py-1.5 flex items-center gap-0.5 bg-muted/40">
										<Tooltip delayDuration={0}>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="h-8 px-2 text-muted-foreground hover:text-foreground"
													onClick={() => {
														const textarea = document.getElementById(
															"notes"
														) as HTMLTextAreaElement;
														const result = formatSelectedText(textarea, "bold");
														if (result) {
															setNotesValue(result.value);
															setTimeout(() => {
																textarea.focus();
																textarea.setSelectionRange(
																	result.selectionStart,
																	result.selectionEnd
																);
															}, 0);
														}
													}}>
													<Bold className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Bold</p>
											</TooltipContent>
										</Tooltip>

										<Tooltip delayDuration={0}>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="h-8 px-2 text-muted-foreground hover:text-foreground"
													onClick={() => {
														const textarea = document.getElementById(
															"notes"
														) as HTMLTextAreaElement;
														const result = formatSelectedText(
															textarea,
															"italic"
														);
														if (result) {
															setNotesValue(result.value);
															setTimeout(() => {
																textarea.focus();
																textarea.setSelectionRange(
																	result.selectionStart,
																	result.selectionEnd
																);
															}, 0);
														}
													}}>
													<Italic className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Italic</p>
											</TooltipContent>
										</Tooltip>

										<Tooltip delayDuration={0}>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="h-8 px-2 text-muted-foreground hover:text-foreground"
													onClick={() => {
														const textarea = document.getElementById(
															"notes"
														) as HTMLTextAreaElement;
														const result = formatSelectedText(textarea, "list");
														if (result) {
															setNotesValue(result.value);
															setTimeout(() => {
																textarea.focus();
																textarea.setSelectionRange(
																	result.selectionStart,
																	result.selectionEnd
																);
															}, 0);
														}
													}}>
													<List className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Bullet List</p>
											</TooltipContent>
										</Tooltip>

										<Tooltip delayDuration={0}>
											<TooltipTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="h-8 px-2 text-muted-foreground hover:text-foreground"
													onClick={() => {
														const textarea = document.getElementById(
															"notes"
														) as HTMLTextAreaElement;
														const result = formatSelectedText(
															textarea,
															"ordered-list"
														);
														if (result) {
															setNotesValue(result.value);
															setTimeout(() => {
																textarea.focus();
																textarea.setSelectionRange(
																	result.selectionStart,
																	result.selectionEnd
																);
															}, 0);
														}
													}}>
													<ListOrdered className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Numbered List</p>
											</TooltipContent>
										</Tooltip>
									</div>

									<div className="relative">
										<Textarea
											id="notes"
											value={notesValue}
											onChange={(e) => setNotesValue(e.target.value)}
											placeholder="Add shift notes or instructions here..."
											rows={6}
											className="resize-none border-0 focus-visible:ring-0 rounded-none"
										/>
										{notesValue && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-2 top-2 h-6 text-xs text-muted-foreground hover:text-destructive"
												onClick={() => setNotesValue("")}>
												Clear
											</Button>
										)}
									</div>
								</div>

								<div className="flex justify-between text-xs text-muted-foreground mt-2">
									<p>
										Special keywords like "VIP", "Training", "meeting",
										"inspection", "rush", and "closing" will be highlighted.
									</p>
									<div className="flex items-center">
										<p>Preview:</p>
										<Button
											type="button"
											variant="link"
											size="sm"
											className="text-xs h-5 px-2"
											onClick={() => {
												const previewElement =
													document.getElementById("notes-preview");
												if (previewElement) {
													previewElement.classList.toggle("hidden");
												}
											}}>
											{notesValue ? "Show/Hide" : "Empty"}
										</Button>
									</div>
								</div>

								{notesValue && (
									<div
										id="notes-preview"
										className="p-3 border rounded-md mt-2 text-sm bg-white hidden">
										<div
											dangerouslySetInnerHTML={{
												__html: parseSimpleMarkdown(notesValue),
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setNotesDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSaveNotes}
							disabled={notesSaving}
							className="gap-2">
							{notesSaving && (
								<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
							)}
							<Save className="h-4 w-4 mr-1" /> Save Notes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
