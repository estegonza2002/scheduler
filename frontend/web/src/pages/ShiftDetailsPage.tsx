import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
} from "../api";
import {
	format,
	parseISO,
	differenceInHours,
	differenceInMinutes,
} from "date-fns";
import {
	ArrowLeft,
	Building2,
	Calendar,
	Clock,
	CreditCard,
	DollarSign,
	MapPin,
	Plus,
	Trash,
	User,
	Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
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

// Interface for employee data with additional assignment information
interface AssignedEmployee extends Employee {
	assignmentId: string;
	assignmentRole?: string;
	assignmentNotes?: string;
}

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
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
	const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
	const [removeEmployeeId, setRemoveEmployeeId] = useState<string | null>(null);
	const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(
		null
	);
	const [removeEmployeeAlertOpen, setRemoveEmployeeAlertOpen] = useState(false);

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
				if (!shiftData) {
					toast.error("Shift not found");
					navigate("/schedule");
					return;
				}
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

	// Handle assign new employee
	const handleAssignEmployee = async () => {
		if (!shift || !selectedEmployeeId) return;

		try {
			setLoading(true);

			// Create new assignment
			const newAssignment = await ShiftAssignmentsAPI.create({
				shiftId: shift.id,
				employeeId: selectedEmployeeId,
				role: allEmployees.find((e) => e.id === selectedEmployeeId)?.role,
			});

			// Find the employee details
			const employee = allEmployees.find((e) => e.id === selectedEmployeeId);
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

				// Remove from available employees
				setAvailableEmployees((prev) =>
					prev.filter((e) => e.id !== selectedEmployeeId)
				);
			}

			setAddEmployeeDialogOpen(false);
			toast.success("Employee assigned to shift successfully");
		} catch (error) {
			console.error("Error assigning employee:", error);
			toast.error("Failed to assign employee");
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

	if (loading) {
		return (
			<div className="container py-8 flex items-center justify-center min-h-[50vh]">
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
		<div className="container py-8">
			{/* Back button and Delete shift button */}
			<div className="flex justify-between items-center mb-6">
				<Button
					variant="ghost"
					onClick={() => navigate("/daily-shifts" + window.location.search)}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Daily Shifts
				</Button>

				<AlertDialog
					open={deleteAlertOpen}
					onOpenChange={setDeleteAlertOpen}>
					<AlertDialogTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="text-destructive">
							<Trash className="h-4 w-4 mr-2" /> Delete Shift
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete this shift from the schedule. This
								action cannot be undone.
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

			<div className="grid gap-6 md:grid-cols-3">
				{/* Left column - Shift details */}
				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-xl">Shift Details</CardTitle>
									<CardDescription>
										{format(parseISO(shift.startTime), "EEEE, MMMM d, yyyy")}
									</CardDescription>
								</div>
								<Badge
									variant={
										assignedEmployees.length > 0 ? "default" : "destructive"
									}
									colorScheme={
										assignedEmployees.length > 0 ? "green" : undefined
									}>
									{assignedEmployees.length > 0
										? `${assignedEmployees.length} Assigned`
										: "Unassigned"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Time information */}
							<div className="flex items-center space-x-2 text-sm">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span>
									{format(parseISO(shift.startTime), "h:mm a")} -{" "}
									{format(parseISO(shift.endTime), "h:mm a")}
								</span>
								<Badge
									variant="outline"
									className="ml-2">
									{calculateHours(shift.startTime, shift.endTime)} hours
								</Badge>
							</div>

							{/* Location information */}
							{location && (
								<div className="flex items-start space-x-2 text-sm">
									<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
									<div>
										<div className="font-medium">{location.name}</div>
										{location.address && (
											<div className="text-muted-foreground">
												{location.address}
											</div>
										)}
										{(location.city || location.state) && (
											<div className="text-muted-foreground">
												{location.city}
												{location.city && location.state ? ", " : ""}
												{location.state} {location.zipCode}
											</div>
										)}
									</div>
								</div>
							)}

							{/* Notes */}
							{shift.notes && (
								<div className="pt-2 border-t">
									<h4 className="text-sm font-medium mb-1">Notes</h4>
									<p className="text-sm text-muted-foreground">{shift.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Assigned Employees */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl">
									<div className="flex items-center">
										<Users className="mr-2 h-5 w-5" />
										Assigned Employees ({assignedEmployees.length})
									</div>
								</CardTitle>
								<Button
									variant="default"
									size="sm"
									onClick={() => setAddEmployeeDialogOpen(true)}
									disabled={availableEmployees.length === 0}>
									<Plus className="h-4 w-4 mr-1" /> Assign Employee
								</Button>
							</div>
							<CardDescription>Employees working this shift</CardDescription>
						</CardHeader>
						<CardContent>
							{assignedEmployees.length === 0 ? (
								<div className="text-center py-6 text-muted-foreground">
									<Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
									<p>No employees assigned to this shift yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* List of assigned employees */}
									{assignedEmployees.map((employee) => (
										<div
											key={employee.id}
											className="flex items-start gap-4 p-3 bg-muted/30 rounded-md">
											<Avatar className="h-12 w-12">
												<AvatarFallback>
													{employee.name.charAt(0)}
												</AvatarFallback>
												{employee.avatar && (
													<AvatarImage src={employee.avatar} />
												)}
											</Avatar>
											<div className="flex-1 space-y-1">
												<div className="flex items-center justify-between">
													<h3 className="font-medium">{employee.name}</h3>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 text-destructive hover:text-destructive"
														onClick={() => {
															setRemoveEmployeeId(employee.id);
															setRemoveAssignmentId(employee.assignmentId);
															setRemoveEmployeeAlertOpen(true);
														}}>
														<Trash className="h-3.5 w-3.5 mr-1" /> Remove
													</Button>
												</div>
												<div className="text-sm text-muted-foreground">
													{employee.assignmentRole || employee.role}
												</div>
												<div className="text-sm flex items-center mt-1">
													<DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
													{employee.hourlyRate ? (
														<>
															<span className="text-muted-foreground">
																${employee.hourlyRate.toFixed(2)}/hr
															</span>
															<span className="text-muted-foreground mx-1">
																•
															</span>
															<span>${calculateEmployeeCost(employee)}</span>
														</>
													) : (
														"Rate not set"
													)}
												</div>
												{employee.assignmentNotes && (
													<div className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
														{employee.assignmentNotes}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right column - Cost calculation */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">Shift Cost</CardTitle>
							<CardDescription>Based on employee hourly rates</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{assignedEmployees.length > 0 &&
							assignedEmployees.some((e) => e.hourlyRate) ? (
								<div className="space-y-4">
									<div className="space-y-2">
										{assignedEmployees.map((employee) =>
											employee.hourlyRate ? (
												<div
													key={employee.id}
													className="flex justify-between text-sm">
													<span>{employee.name}:</span>
													<span className="font-medium">
														${calculateEmployeeCost(employee)}
													</span>
												</div>
											) : null
										)}

										<Separator />
										<div className="flex justify-between font-medium">
											<span>Total Cost:</span>
											<span className="text-lg">${calculateTotalCost()}</span>
										</div>
									</div>

									<div className="bg-muted/50 p-4 rounded-md text-sm">
										<p className="text-muted-foreground">
											This calculation is based on hourly rates and does not
											include overtime, benefits, or other additional costs.
										</p>
									</div>
								</div>
							) : (
								<div className="text-center py-6 text-muted-foreground">
									<CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
									<p>
										{assignedEmployees.length > 0
											? "Employees have no hourly rates set"
											: "No employees assigned"}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Dialog for adding employee */}
			<Dialog
				open={addEmployeeDialogOpen}
				onOpenChange={setAddEmployeeDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Assign Employee to Shift</DialogTitle>
						<DialogDescription>
							Select an employee to assign to this shift on{" "}
							{format(parseISO(shift.startTime), "MMM d, yyyy")}
							from {format(parseISO(shift.startTime), "h:mm a")} to{" "}
							{format(parseISO(shift.endTime), "h:mm a")}
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

						<ScrollArea className="h-72 rounded-md border">
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
												selectedEmployeeId === emp.id ? "bg-accent/40" : ""
											}`}
											onClick={() => setSelectedEmployeeId(emp.id)}>
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
						<Button
							variant="outline"
							onClick={() => setAddEmployeeDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={!selectedEmployeeId}
							onClick={handleAssignEmployee}>
							Assign Employee
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Alert dialog for removing employee */}
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
		</div>
	);
}
