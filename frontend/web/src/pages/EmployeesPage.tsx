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
	LayoutGrid,
	List,
	Building2,
	ChevronRight,
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
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "../components/ui/card";

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [positionFilter, setPositionFilter] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
					{/* Search and view mode controls */}
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search employees..."
								className="pl-10"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={viewMode === "cards" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("cards")}>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "table" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("table")}>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Content */}
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
							{/* Table View */}
							{viewMode === "table" && (
								<DataTable
									columns={columns}
									data={filteredEmployees}
								/>
							)}

							{/* Card View */}
							{viewMode === "cards" && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{filteredEmployees.map((employee) => (
										<Card
											key={employee.id}
											className="hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
											onClick={() =>
												navigate(`/employee-detail/${employee.id}`)
											}>
											<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
											<div className="p-4">
												<div className="flex items-start gap-4">
													<Avatar className="h-12 w-12 border-2 border-primary/10">
														<AvatarImage src={employee.avatar} />
														<AvatarFallback className="bg-primary/10 text-primary">
															{employee.name
																.split(" ")
																.map((n) => n[0])
																.join("")
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between gap-2 group/name">
															<CardTitle className="text-lg truncate">
																{employee.name}
															</CardTitle>
															<ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-colors group-hover/name:text-primary shrink-0" />
														</div>
														<span className="text-sm text-muted-foreground">
															{employee.position || employee.role || "No role"}
														</span>
													</div>
												</div>
											</div>
											<div className="border-t px-4 py-3 space-y-2">
												<div className="flex items-center gap-3 text-sm">
													<Mail className="h-4 w-4 text-muted-foreground shrink-0" />
													<span className="truncate">
														{employee.email || "No email"}
													</span>
												</div>
												<div className="flex items-center gap-3 text-sm">
													<Phone className="h-4 w-4 text-muted-foreground shrink-0" />
													<span>{employee.phone || "No phone"}</span>
												</div>
												{employee.hourlyRate !== undefined && (
													<div className="flex items-center gap-3 text-sm">
														<DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
														<span>${employee.hourlyRate.toFixed(2)}/hr</span>
													</div>
												)}
											</div>
										</Card>
									))}
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}
