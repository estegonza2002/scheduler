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
	BellRing,
	BellOff,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { EmployeeSheet } from "../components/EmployeeSheet";
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
import { EmployeesSidebar } from "../components/layout/SecondaryNavbar";
import { EmployeeStatusBadge } from "../components/ui/employee-status-badge";
import { useEmployeePresence } from "../lib/presence";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../components/ui/tooltip";
import { AvatarWithStatus } from "../components/ui/avatar-with-status";

export default function EmployeesPage() {
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<
		"organization" | "employees" | ""
	>("");
	const [searchTerm, setSearchTerm] = useState("");
	const [positionFilter, setPositionFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
	const navigate = useNavigate();

	// Initialize the presence service when we have an organization
	const {
		employeePresence,
		initialized: presenceInitialized,
		toggleNotifications,
		notificationsEnabled,
	} = useEmployeePresence(organization?.id || "");

	// Get unique positions for filtering
	const uniquePositions = useMemo(() => {
		const positions = new Set<string>();
		employees.forEach((employee) => {
			if (employee.position) {
				positions.add(employee.position);
			} else if (employee.role) {
				positions.add(employee.role);
			}
		});
		return Array.from(positions);
	}, [employees]);

	// Apply filtering
	const filteredEmployees = useMemo(() => {
		// Update employee online status with presence data
		const employeesWithPresence = employees.map((employee) => {
			if (!presenceInitialized) return employee;

			const presence = employeePresence[employee.id];
			if (!presence) return employee;

			return {
				...employee,
				isOnline: presence.isOnline,
				lastActive: presence.lastActive,
			};
		});

		return employeesWithPresence.filter((employee) => {
			// Apply position/role filter
			if (positionFilter) {
				const position = employee.position || employee.role || "";
				if (position !== positionFilter) {
					return false;
				}
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
	}, [
		employees,
		positionFilter,
		searchTerm,
		employeePresence,
		presenceInitialized,
	]);

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
						<AvatarWithStatus
							fallback={row.original.name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase()}
							isOnline={row.original.isOnline}
							status={row.original.status as any}
							size="sm"
						/>
						<span className="font-medium">{row.original.name}</span>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<div className="flex items-center">
						<EmployeeStatusBadge
							status={row.original.status as any}
							isOnline={row.original.isOnline}
							lastActive={row.original.lastActive}
						/>
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
									<EmployeeSheet
										employee={employee}
										organizationId={employee.organizationId}
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

	// Handler for when an employee is added
	const handleEmployeeAdded = (employee: Employee) => {
		setEmployees((prev) => [...prev, employee]);
		toast.success("Employee added successfully!");
	};

	// Handler for when employees are added in bulk
	const handleEmployeesAdded = (newEmployees: Employee[]) => {
		setEmployees((prev) => [...prev, ...newEmployees]);
		toast.success(`${newEmployees.length} employees added successfully!`);
	};

	const handleEmployeeUpdated = (updatedEmployee: Employee) => {
		setEmployees((prev) =>
			prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
		);
	};

	const handleEmployeeDeleted = (employeeId: string) => {
		setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
	};

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleClearFilters = () => {
		setPositionFilter(null);
		setSearchTerm("");
	};

	// Component for sidebar
	const renderSidebar = () => {
		return (
			<EmployeesSidebar
				onSearch={handleSearch}
				positionFilter={positionFilter}
				onPositionFilterChange={setPositionFilter}
				onClearFilters={handleClearFilters}
				positions={uniquePositions}
			/>
		);
	};

	if (isLoading) {
		return (
			<div>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "employees"
					}...`}
					type="skeleton"
					skeletonCount={6}
					skeletonHeight={80}
				/>
			</div>
		);
	}

	return (
		<>
			{renderSidebar()}
			<div className="ml-64">
				<div className="p-4">
					<div className="text-right mb-4">
						<div className="flex items-center justify-between">
							<SearchInput
								value={searchTerm}
								onChange={setSearchTerm}
								placeholder="Search employees..."
								className="md:w-72"
							/>

							<div className="flex items-center gap-2">
								<div className="inline-flex rounded-md overflow-hidden border">
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

								{presenceInitialized && (
									<Badge
										variant="outline"
										className="mr-2">
										<div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
										{
											Object.values(employeePresence).filter((p) => p.isOnline)
												.length
										}{" "}
										online
									</Badge>
								)}

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className={
													notificationsEnabled
														? "text-primary"
														: "text-muted-foreground"
												}
												onClick={toggleNotifications}>
												{notificationsEnabled ? (
													<BellRing className="h-4 w-4" />
												) : (
													<BellOff className="h-4 w-4" />
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{notificationsEnabled
												? "Disable login notifications"
												: "Enable login notifications"}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<EmployeeSheet
									organizationId={organization?.id || ""}
									onEmployeeUpdated={handleEmployeeAdded}
								/>
							</div>
						</div>
					</div>

					{employees.length === 0 ? (
						<div className="text-center my-12">
							<EmptyState
								title="No employees yet"
								description="Add your first employee to get started"
								icon={<User size={48} />}
								action={
									<EmployeeSheet
										organizationId={organization?.id || ""}
										onEmployeeUpdated={handleEmployeeAdded}
									/>
								}
							/>
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
											className="cursor-pointer"
											onClick={() =>
												navigate(`/employee-detail/${employee.id}`)
											}>
											<div className="p-4">
												<div className="flex items-center">
													<AvatarWithStatus
														fallback={employee.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()}
														isOnline={employee.isOnline}
														status={employee.status as any}
														size="sm"
														className="mr-4"
													/>
													<div className="flex-1">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																<h3 className="font-medium text-sm">
																	{employee.name}
																</h3>
																<EmployeeStatusBadge
																	status={employee.status as any}
																	isOnline={employee.isOnline}
																	lastActive={employee.lastActive}
																	compact
																/>
															</div>
															<ChevronRight className="h-5 w-5 text-gray-400" />
														</div>
														<span className="text-sm text-gray-500">
															{employee.position || employee.role || "No role"}
														</span>
													</div>
												</div>
											</div>
											<div className="border-t px-4 py-2">
												<div className="flex items-center text-sm mb-1">
													<Mail className="h-4 w-4 mr-2 text-gray-500" />
													<span className="truncate">
														{employee.email || "No email"}
													</span>
												</div>
												<div className="flex items-center text-sm mb-1">
													<Phone className="h-4 w-4 mr-2 text-gray-500" />
													<span>{employee.phone || "No phone"}</span>
												</div>
												{employee.hourlyRate !== undefined && (
													<div className="flex items-center text-sm">
														<DollarSign className="h-4 w-4 mr-2 text-gray-500" />
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
		</>
	);
}
