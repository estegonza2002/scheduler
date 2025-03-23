import { useMemo, useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Employee, EmployeesAPI, OrganizationsAPI, Organization } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
	Edit,
	Search,
	Plus,
	MoreVertical,
	User,
	Mail,
	Phone,
	DollarSign,
	ArrowUpDown,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AddEmployeeDialog } from "../components/AddEmployeeDialog";
import { EditEmployeeDialog } from "../components/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DataTable } from "../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "../components/ui/skeleton";

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const navigate = useNavigate();
	const [organization, setOrganization] = useState<Organization | null>(null);

	const columns = useMemo<ColumnDef<Employee>[]>(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="pl-0">
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-primary font-medium text-xs">
								{row.original.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</span>
						</div>
						<span className="font-medium">{row.original.name}</span>
					</div>
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Contact
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<div className="flex flex-col">
						<div className="flex items-center text-sm">
							<Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
							<span>{row.original.email}</span>
						</div>
						{row.original.phone && (
							<div className="flex items-center text-sm mt-1">
								<Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
								<span>{row.original.phone}</span>
							</div>
						)}
					</div>
				),
			},
			{
				accessorKey: "position",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Position
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => <>{row.original.position || row.original.role}</>,
			},
			{
				accessorKey: "hourlyRate",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Hourly Rate
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => {
					const hourlyRate = row.original.hourlyRate;
					return hourlyRate !== undefined ? (
						<div className="flex items-center">
							<DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
							<span>{hourlyRate.toFixed(2)}/hr</span>
						</div>
					) : (
						"-"
					);
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const employee = row.original;
					return (
						<div onClick={(e) => e.stopPropagation()}>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0">
										<span className="sr-only">Open menu</span>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() => navigate(`/employee-detail/${employee.id}`)}>
										View Details
									</DropdownMenuItem>
									<EditEmployeeDialog
										employee={employee}
										onEmployeeUpdated={handleEmployeeUpdated}
										trigger={
											<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
												Edit Employee
											</DropdownMenuItem>
										}
									/>
									<DropdownMenuSeparator />
									<DeleteEmployeeDialog
										employee={employee}
										onEmployeeDeleted={handleEmployeeDeleted}
										trigger={
											<DropdownMenuItem
												className="text-destructive"
												onSelect={(e) => e.preventDefault()}>
												Delete Employee
											</DropdownMenuItem>
										}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[navigate]
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setLoadingPhase("organization");
				// In a real implementation, we would get the user's organization
				// For now, we'll use the first organization from the mock data
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					setLoadingPhase("employees");
					const fetchedEmployees = await EmployeesAPI.getAll(orgs[0].id);
					setEmployees(fetchedEmployees);
				}
			} catch (error) {
				console.error("Error fetching employees:", error);
			} finally {
				setIsLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, []);

	const handleEmployeesAdded = (newEmployees: Employee[]) => {
		setEmployees((prev) => [...prev, ...newEmployees]);
	};

	const handleEmployeeUpdated = (updatedEmployee: Employee) => {
		setEmployees((prev) =>
			prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
		);
	};

	const handleEmployeeDeleted = (employeeId: string) => {
		setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
	};

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-8 w-48" />
				</div>

				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-16 w-full rounded-md" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-24 w-full rounded-md"
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	if (isLoading) {
		return <div className="px-4 sm:px-6 py-6">{renderLoadingSkeleton()}</div>;
	}

	return (
		<div className="px-4 sm:px-6 py-6">
			{/* Header with title */}
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Employees</h1>
			</div>

			{/* Employee management header card */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-bold">Employee Directory</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Manage your team members and their information
						</p>
						{isLoading && (
							<div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span>
									{loadingPhase === "organization"
										? "Loading organization..."
										: "Loading employees..."}
								</span>
							</div>
						)}
					</div>
					{organization && (
						<AddEmployeeDialog
							organizationId={organization.id}
							onEmployeesAdded={handleEmployeesAdded}
							trigger={
								<Button
									variant="default"
									className="bg-black hover:bg-black/90 text-white">
									<Plus className="h-4 w-4 mr-2" />
									Add Employee
								</Button>
							}
						/>
					)}
				</div>
			</div>

			{/* Employee data table container */}
			<div className="bg-white rounded-lg shadow-sm border">
				{employees.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg m-4">
						<User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No employees found</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Start by adding employees to your organization
						</p>
						{organization && (
							<AddEmployeeDialog
								organizationId={organization.id}
								onEmployeesAdded={handleEmployeesAdded}
								trigger={
									<Button
										variant="default"
										className="bg-black hover:bg-black/90 text-white">
										<Plus className="mr-2 h-4 w-4" />
										Add First Employee
									</Button>
								}
							/>
						)}
					</div>
				) : (
					<div className="p-4">
						<DataTable
							columns={columns}
							data={employees}
							searchKey="name"
							searchPlaceholder="Search employees..."
						/>
					</div>
				)}
			</div>
		</div>
	);
}
