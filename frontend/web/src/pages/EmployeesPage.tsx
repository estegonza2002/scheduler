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
	Filter,
	X,
	AlertCircle,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [positionFilter, setPositionFilter] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const navigate = useNavigate();
	const [organization, setOrganization] = useState<Organization | null>(null);

	// Get unique positions for the filter
	const uniquePositions = useMemo(() => {
		return [
			...new Set(
				employees
					.map((employee) => employee.position || employee.role)
					.filter(Boolean)
			),
		].filter(
			(position) => position !== null && position !== undefined
		) as string[];
	}, [employees]);

	// Filter employees by position and search term
	const filteredEmployees = useMemo(() => {
		return employees.filter((employee) => {
			// Apply position filter
			if (
				positionFilter &&
				employee.position !== positionFilter &&
				employee.role !== positionFilter
			) {
				return false;
			}

			// Apply search filter
			if (searchTerm) {
				const lowercaseSearch = searchTerm.toLowerCase();
				const name = (employee.name || "").toLowerCase();
				const email = (employee.email || "").toLowerCase();
				const phone = (employee.phone || "").toLowerCase();
				const position = (
					employee.position ||
					employee.role ||
					""
				).toLowerCase();

				return (
					name.includes(lowercaseSearch) ||
					email.includes(lowercaseSearch) ||
					phone.includes(lowercaseSearch) ||
					position.includes(lowercaseSearch)
				);
			}

			return true;
		});
	}, [employees, positionFilter, searchTerm]);

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
		return <div className="p-6">{renderLoadingSkeleton()}</div>;
	}

	return (
		<div className="p-4">
			{employees.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed rounded-lg">
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
				<div className="space-y-4">
					{/* Search bar */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search employees by name, email, role or position..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Filter controls in a simplified row */}
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
						<div className="flex items-center">
							<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="text-sm font-medium">Filters</span>
						</div>

						<div className="flex items-center">
							<span className="text-sm mr-2">Position</span>
							<Select
								value={positionFilter || "all"}
								onValueChange={(value) =>
									setPositionFilter(value === "all" ? null : value)
								}>
								<SelectTrigger className="w-[160px] h-8">
									<SelectValue placeholder="All positions" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All positions</SelectItem>
									{uniquePositions.map((position) => (
										<SelectItem
											key={position}
											value={position}>
											{position}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Clear filters button */}
						{(positionFilter || searchTerm) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setPositionFilter(null);
									setSearchTerm("");
								}}
								className="h-8 ml-auto">
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						)}
					</div>

					{/* Active filters badges */}
					{positionFilter && (
						<div className="flex flex-wrap gap-2 mb-4">
							<Badge
								variant="outline"
								className="flex items-center gap-1 bg-muted/40 py-1 px-2">
								Position: {positionFilter}
								<Button
									variant="ghost"
									size="icon"
									className="h-4 w-4 ml-1 p-0"
									onClick={() => setPositionFilter(null)}>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						</div>
					)}

					{/* Employee Table */}
					{filteredEmployees.length === 0 ? (
						<div className="bg-muted/30 rounded-lg p-6 text-center">
							<AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
							<h3 className="text-base font-medium mb-1">No employees found</h3>
							<p className="text-sm text-muted-foreground">
								{positionFilter || searchTerm
									? "Try adjusting your filters or search term"
									: "There are no employees in your organization"}
							</p>
						</div>
					) : (
						<>
							<DataTable
								columns={columns}
								data={filteredEmployees}
							/>
						</>
					)}
				</div>
			)}
		</div>
	);
}
