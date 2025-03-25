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
import { ContentContainer } from "../components/ui/content-container";
import { SearchInput } from "../components/ui/search-input";
import { FilterGroup } from "../components/ui/filter-group";
import { EmptyState } from "../components/ui/empty-state";
import { LoadingState } from "../components/ui/loading-state";

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [positionFilter, setPositionFilter] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const navigate = useNavigate();
	const [organization, setOrganization] = useState<Organization | null>(null);

	// Get unique positions for the filter
	const uniquePositions = useMemo(() => {
		return [
			...new Set(
				employees
					.map((employee) => employee.position || employee.role)
					.filter((pos) => pos && pos.trim() !== "")
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
		toast.success(
			`${newEmployees.length} employee${
				newEmployees.length !== 1 ? "s" : ""
			} added`
		);
	};

	const handleEmployeeUpdated = (updatedEmployee: Employee) => {
		setEmployees((prev) =>
			prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
		);
	};

	const handleEmployeeDeleted = (employeeId: string) => {
		setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchTerm("");
		setPositionFilter(null);
	};

	if (isLoading) {
		return (
			<ContentContainer>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "employees"
					}...`}
					type="skeleton"
					skeletonCount={6}
					skeletonHeight={80}
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer className="flex gap-6">
			<div className="w-72 flex-shrink-0">
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
						<CardDescription>
							Filter employees by their attributes
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Position</label>
							<Select
								value={positionFilter || "all_positions"}
								onValueChange={(value: string) =>
									setPositionFilter(value === "all_positions" ? null : value)
								}>
								<SelectTrigger>
									<SelectValue placeholder="All positions" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all_positions">All positions</SelectItem>
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
					</CardContent>
				</Card>
			</div>
			<div className="flex-1">
				<div className="flex flex-col space-y-4">
					<div className="flex items-center justify-between">
						<SearchInput
							placeholder="Search employees..."
							value={searchTerm}
							onChange={(value: string) => setSearchTerm(value)}
							className="w-64"
						/>

						<div className="flex items-center gap-2">
							<AddEmployeeDialog
								organizationId={organization?.id || ""}
								onEmployeesAdded={handleEmployeesAdded}
								trigger={
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										New Employee
									</Button>
								}
							/>
							<div className="flex rounded-md overflow-hidden border">
								<Button
									variant={viewMode === "cards" ? "secondary" : "ghost"}
									size="sm"
									className="rounded-none px-3"
									onClick={() => setViewMode("cards")}>
									<LayoutGrid className="h-4 w-4" />
								</Button>
								<Button
									variant={viewMode === "table" ? "secondary" : "ghost"}
									size="sm"
									className="rounded-none px-3"
									onClick={() => setViewMode("table")}>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{employees.length === 0 ? (
						<EmptyState
							title="No employees found"
							description="Start by adding employees to your organization"
							icon={<User className="h-6 w-6" />}
							action={
								organization && (
									<AddEmployeeDialog
										organizationId={organization.id}
										onEmployeesAdded={handleEmployeesAdded}
										trigger={
											<Button>
												<Plus className="mr-2 h-4 w-4" />
												Add First Employee
											</Button>
										}
									/>
								)
							}
						/>
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
			</div>
		</ContentContainer>
	);
}
