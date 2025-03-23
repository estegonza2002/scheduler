import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Employee, EmployeesAPI } from "../api";
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

export default function EmployeeDetailPage() {
	const { employeeId } = useParams<{ employeeId: string }>();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("employee");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		const fetchEmployee = async () => {
			if (!employeeId) return;

			try {
				setLoading(true);
				setLoadingPhase("employee");
				const employeeData = await EmployeesAPI.getById(employeeId);
				if (!employeeData) {
					toast.error("Employee not found");
					navigate("/employees");
					return;
				}
				setEmployee(employeeData);
			} catch (error) {
				console.error("Error fetching employee details:", error);
				toast.error("Failed to load employee details");
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchEmployee();
	}, [employeeId, navigate]);

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

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-48" />

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-8 w-64" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>
				</div>

				<Skeleton className="h-32 w-full rounded-md" />
				<Skeleton className="h-48 w-full rounded-md" />
				<Skeleton className="h-48 w-full rounded-md" />
			</div>
		);
	};

	if (loading) {
		return <div className="px-4 sm:px-6 py-6">{renderLoadingSkeleton()}</div>;
	}

	if (!employee) {
		return (
			<div className="px-4 sm:px-6 py-6">
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h1 className="text-xl font-semibold mb-4">Employee not found</h1>
					<Button
						variant="outline"
						onClick={() => navigate("/employees")}
						className="mt-2">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
					</Button>
				</div>
			</div>
		);
	}

	const initials = getInitials(employee.name);

	return (
		<div className="px-4 sm:px-6 py-6">
			<div className="mb-6 flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/employees")}
					className="flex items-center">
					<ChevronLeft className="h-4 w-4 mr-1" /> Back to Employees
				</Button>
			</div>

			{/* Header with navigation and actions */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex flex-col">
						<h1 className="text-xl font-bold">Employee Profile</h1>
						<p className="text-sm text-muted-foreground mt-1">
							View and manage employee information
						</p>
						{loading && (
							<div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span>Loading employee details...</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1"
							onClick={() => navigate(`/edit-employee/${employee.id}`)}>
							<Edit className="h-4 w-4" /> Edit
						</Button>

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
										This will permanently delete this employee record. This
										action cannot be undone.
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
					</div>
				</div>
			</div>

			<div className="grid gap-6">
				{/* Profile Header */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage
								src={employee.avatar}
								alt={employee.name}
							/>
							<AvatarFallback className="text-xl">{initials}</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-2xl font-semibold">{employee.name}</h2>
							<p className="text-muted-foreground text-lg">
								{employee.position || employee.role}
							</p>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h2 className="text-lg font-semibold mb-4">Contact Information</h2>
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
				</div>

				{/* Employment Details */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h2 className="text-lg font-semibold mb-4">Employment Details</h2>
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
				</div>

				{/* Additional Information */}
				{(employee.emergencyContact || employee.notes) && (
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold mb-4">
							Additional Information
						</h2>
						<div className="space-y-4">
							{employee.emergencyContact && (
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
										<AlertCircle className="h-5 w-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium">Emergency Contact</div>
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
					</div>
				)}
			</div>
		</div>
	);
}
