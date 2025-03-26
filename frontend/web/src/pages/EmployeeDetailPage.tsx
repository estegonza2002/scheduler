import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
	Employee,
	EmployeesAPI,
	Shift,
	ShiftsAPI,
	LocationsAPI,
	Location,
} from "../api";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	User,
	Info,
	ClipboardList,
	AlertCircle,
	DollarSign,
	ArrowLeft,
	Edit,
	Trash,
	ChevronLeft,
	Loader2,
	Clock,
	Briefcase,
} from "lucide-react";
import { toast } from "sonner";
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
import { Skeleton } from "../components/ui/skeleton";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import { LoadingState } from "../components/ui/loading-state";
import { EmployeeSheet } from "../components/EmployeeSheet";
import { EmployeeStatusBadge } from "../components/ui/employee-status-badge";
import { useEmployeePresence } from "../lib/presence";
import { AvatarWithStatus } from "../components/ui/avatar-with-status";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { calculateHours } from "../utils/time-calculations";

// Shifts section component for employee details
function EmployeeShiftsSection({ employeeId }: { employeeId: string }) {
	const [isLoading, setIsLoading] = useState(true);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [assignedLocation, setAssignedLocation] = useState<Location | null>(
		null
	);
	const now = new Date();

	useEffect(() => {
		const fetchEmployeeShifts = async () => {
			try {
				setIsLoading(true);
				// Fetch shifts for the employee
				const allShifts = await ShiftsAPI.getAll();
				// Filter for this specific employee's shifts
				const employeeShifts = allShifts.filter(
					(shift) => shift.employeeId === employeeId
				);
				setShifts(employeeShifts);

				// Collect all location IDs
				const locationIds = new Set<string>();
				employeeShifts.forEach((shift) => {
					if (shift.locationId) {
						locationIds.add(shift.locationId);
					}
				});

				// Fetch all needed locations
				const locationsMap: Record<string, Location> = {};
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);

				// Set assigned location (primary location for the employee)
				if (employeeShifts.length > 0 && employeeShifts[0].locationId) {
					setAssignedLocation(
						locationsMap[employeeShifts[0].locationId] || null
					);
				}
			} catch (error) {
				console.error("Error fetching employee shifts:", error);
				toast.error("Failed to load shifts information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchEmployeeShifts();
	}, [employeeId]);

	// Filter shifts into current, upcoming, and previous
	const currentShifts = shifts.filter(
		(shift) =>
			isAfter(parseISO(shift.endTime), now) &&
			isBefore(parseISO(shift.startTime), now)
	);

	const upcomingShifts = shifts
		.filter((shift) => isAfter(parseISO(shift.startTime), now))
		.sort(
			(a, b) =>
				parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
		)
		.slice(0, 5); // Get next 5 upcoming shifts

	const previousShifts = shifts
		.filter((shift) => isBefore(parseISO(shift.endTime), now))
		.sort(
			(a, b) =>
				parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()
		)
		.slice(0, 5); // Get last 5 previous shifts

	// Helper function to get location name
	const getLocationName = (locationId?: string) => {
		if (!locationId) return "Unassigned";
		return locations[locationId]?.name || "Unknown Location";
	};

	// Helper function to render a shift card
	const renderShiftCard = (shift: Shift) => {
		return (
			<Card
				key={shift.id}
				className="mb-3 hover:shadow-sm transition-all">
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{format(parseISO(shift.startTime), "EEE, MMM d")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{format(parseISO(shift.startTime), "h:mm a")} -{" "}
								{format(parseISO(shift.endTime), "h:mm a")}
								<span className="mx-1">•</span>
								{calculateHours(shift.startTime, shift.endTime)} hours
							</p>
						</div>
						<div>
							{shift.role && (
								<Badge
									variant="outline"
									className="text-xs">
									{shift.role}
								</Badge>
							)}
						</div>
					</div>
					{shift.locationId && (
						<div className="mt-2 text-xs flex items-center text-muted-foreground">
							<MapPin className="h-3 w-3 mr-1" />
							<span>{getLocationName(shift.locationId)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Assigned Location Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
					Assigned Location
				</h3>
				{assignedLocation ? (
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col">
								<h4 className="font-medium">{assignedLocation.name}</h4>
								{assignedLocation.address && (
									<p className="text-sm text-muted-foreground">
										{assignedLocation.address}
										{assignedLocation.city && `, ${assignedLocation.city}`}
										{assignedLocation.state && `, ${assignedLocation.state}`}
										{assignedLocation.zipCode && ` ${assignedLocation.zipCode}`}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No location currently assigned
						</CardContent>
					</Card>
				)}
			</div>

			{/* Current Shifts Section */}
			{currentShifts.length > 0 && (
				<div>
					<h3 className="text-lg font-medium mb-4 flex items-center">
						<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
						Current Shift
					</h3>
					{currentShifts.map(renderShiftCard)}
				</div>
			)}

			{/* Upcoming Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
					Upcoming Shifts
				</h3>
				{upcomingShifts.length > 0 ? (
					upcomingShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No upcoming shifts scheduled
						</CardContent>
					</Card>
				)}
			</div>

			{/* Previous Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					Previous Shifts
				</h3>
				{previousShifts.length > 0 ? (
					previousShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No previous shifts found
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

export default function EmployeeDetailPage() {
	const { employeeId } = useParams();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Initialize the presence service when we have an employee
	const { employeePresence, initialized: presenceInitialized } =
		useEmployeePresence(employee?.organizationId || "");

	// Get the latest presence data for this employee
	const employeeWithPresence =
		presenceInitialized && employee
			? {
					...employee,
					isOnline:
						employeePresence[employee.id]?.isOnline || employee.isOnline,
					lastActive:
						employeePresence[employee.id]?.lastActive || employee.lastActive,
			  }
			: employee;

	useEffect(() => {
		if (!employeeId) return;

		const fetchEmployee = async () => {
			try {
				setLoading(true);
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (employeeData) {
					setEmployee(employeeData);
				}
			} catch (error) {
				console.error("Error fetching employee:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEmployee();
	}, [employeeId]);

	const handleDeleteEmployee = async () => {
		if (!employee) return;

		try {
			await EmployeesAPI.delete(employee.id);
			toast.success("Employee deleted successfully");
			navigate("/employees");
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		}
	};

	// Generate user initials for the avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	// Back button to return to employees list
	const BackButton = (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => navigate("/employees")}
			className="mb-2">
			<ChevronLeft className="h-4 w-4 mr-1" /> Back to Employees
		</Button>
	);

	// Action buttons for the header
	const ActionButtons = (
		<>
			{employee && (
				<EmployeeSheet
					organizationId={employee.organizationId}
					employee={employee}
					onEmployeeUpdated={(updatedEmployee) => setEmployee(updatedEmployee)}
					trigger={
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1">
							<Edit className="h-4 w-4" /> Edit
						</Button>
					}
				/>
			)}

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}>
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
							This will permanently delete this employee record. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteEmployee}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);

	if (loading) {
		return (
			<ContentContainer>
				{BackButton}
				<LoadingState
					type="skeleton"
					skeletonCount={4}
					skeletonHeight={60}
					message="Loading employee information..."
				/>
			</ContentContainer>
		);
	}

	if (!employee) {
		return (
			<ContentContainer>
				{BackButton}
				<ContentSection
					title="Employee not found"
					description="The requested employee could not be found."
					footer={
						<Button
							variant="outline"
							onClick={() => navigate("/employees")}
							className="mt-2">
							Back to Employees
						</Button>
					}>
					<p>
						The employee you're looking for may have been removed or doesn't
						exist.
					</p>
				</ContentSection>
			</ContentContainer>
		);
	}

	const initials = getInitials(employee.name);

	return (
		<>
			<ContentContainer>
				{BackButton}

				<div className="grid gap-6 mt-6">
					{/* Profile Header */}
					<ContentSection
						title="Overview"
						flat
						headerActions={ActionButtons}>
						<div className="flex items-center gap-4">
							<AvatarWithStatus
								src={employeeWithPresence?.avatar}
								alt={employeeWithPresence?.name}
								fallback={initials}
								size="xl"
								isOnline={employeeWithPresence?.isOnline}
								status={employeeWithPresence?.status as any}
							/>
							<div>
								<h2 className="text-2xl font-semibold">
									{employeeWithPresence?.name}
								</h2>
								<p className="text-muted-foreground text-lg">
									{employeeWithPresence?.position || employeeWithPresence?.role}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<EmployeeStatusBadge
										status={employeeWithPresence?.status as any}
										isOnline={employeeWithPresence?.isOnline}
										lastActive={employeeWithPresence?.lastActive}
									/>
								</div>
							</div>
						</div>
					</ContentSection>

					{/* Contact Information */}
					<ContentSection title="Contact Information">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Email</div>
									<div className="text-sm">{employee.email}</div>
								</div>
							</div>

							{employee.phone && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Phone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Phone</div>
										<div className="text-sm">{employee.phone}</div>
									</div>
								</div>
							)}

							{employee.address && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<MapPin className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Address</div>
										<div className="text-sm">{employee.address}</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>

					{/* Employment Details */}
					<ContentSection title="Employment Details">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
									<User className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="text-sm font-medium">Role</div>
									<div className="text-sm">{employee.role}</div>
								</div>
							</div>

							{employee.position && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Info className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Position</div>
										<div className="text-sm">{employee.position}</div>
									</div>
								</div>
							)}

							{employee.hourlyRate !== undefined && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<DollarSign className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Hourly Rate</div>
										<div className="text-sm">
											${employee.hourlyRate.toFixed(2)}
										</div>
									</div>
								</div>
							)}

							{employee.hireDate && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<Calendar className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Hire Date</div>
										<div className="text-sm">
											{new Date(employee.hireDate).toLocaleDateString()}
										</div>
									</div>
								</div>
							)}
						</div>
					</ContentSection>

					{/* Additional Information */}
					{(employee.emergencyContact || employee.notes) && (
						<ContentSection title="Additional Information">
							<div className="space-y-4">
								{employee.emergencyContact && (
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
											<AlertCircle className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">
												Emergency Contact
											</div>
											<div className="text-sm">{employee.emergencyContact}</div>
										</div>
									</div>
								)}

								{employee.notes && (
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center mt-1">
											<ClipboardList className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="text-sm font-medium">Notes</div>
											<div className="text-sm text-muted-foreground">
												{employee.notes}
											</div>
										</div>
									</div>
								)}
							</div>
						</ContentSection>
					)}

					{/* Shifts & Scheduling Section */}
					<ContentSection title="Shifts & Scheduling">
						{employee && employeeId ? (
							<EmployeeShiftsSection employeeId={employeeId} />
						) : (
							<div className="text-muted-foreground">
								No shift information available
							</div>
						)}
					</ContentSection>
				</div>
			</ContentContainer>
		</>
	);
}
