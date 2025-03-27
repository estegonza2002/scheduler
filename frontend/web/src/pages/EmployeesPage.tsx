import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Employee, EmployeesAPI, OrganizationsAPI, Organization } from "@/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteEmployeeDialog } from "@/components/DeleteEmployeeDialog";
import { EmployeeSheet } from "@/components/EmployeeSheet";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ContentContainer } from "@/components/ui/content-container";
import { SearchInput } from "@/components/ui/search-input";
import { FilterGroup } from "@/components/ui/filter-group";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { EmployeeStatusBadge } from "@/components/ui/employee-status-badge";
import { useEmployeePresence } from "@/lib/presence";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSection } from "@/components/ui/content-section";

export default function EmployeesPage() {
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<
		"organization" | "employees"
	>("organization");
	const [searchTerm, setSearchTerm] = useState("");
	const [positionFilter, setPositionFilter] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
	const {
		employeePresence,
		initialized: presenceInitialized,
		toggleNotifications,
		notificationsEnabled,
	} = useEmployeePresence(organization?.id || "");
	const navigate = useNavigate();

	// Get unique positions for filtering
	const uniquePositions = useMemo(() => {
		return Array.from(
			new Set(employees.map((emp) => emp.position || emp.role).filter(Boolean))
		);
	}, [employees]);

	// Apply filters to get filtered employees
	const filteredEmployees = useMemo(() => {
		return employees.filter((employee) => {
			const matchesSearch =
				!searchTerm ||
				employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employee.phone?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesPosition =
				!positionFilter ||
				employee.position === positionFilter ||
				employee.role === positionFilter;

			return matchesSearch && matchesPosition;
		});
	}, [employees, searchTerm, positionFilter]);

	// Listen for employee-added events from the system header
	useEffect(() => {
		const handleEmployeeAdded = (event: CustomEvent<Employee>) => {
			if (event.detail) {
				setEmployees((prev) => [...prev, event.detail]);
			}
		};

		window.addEventListener(
			"employee-added",
			handleEmployeeAdded as EventListener
		);

		return () => {
			window.removeEventListener(
				"employee-added",
				handleEmployeeAdded as EventListener
			);
		};
	}, []);

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
				cell: ({ row }) => (
					<span>{row.original.position || row.original.role}</span>
				),
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
				cell: ({ row }) => (
					<div className="flex items-center">
						<DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
						<span>
							{row.original.hourlyRate
								? `$${row.original.hourlyRate.toFixed(2)}/hr`
								: "-"}
						</span>
					</div>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const employee = row.original;
					return (
						<Button
							variant="ghost"
							size="sm"
							className="h-8"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/employee-detail/${employee.id}`);
							}}>
							<ChevronRight className="h-4 w-4" />
							View
						</Button>
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
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					setLoadingPhase("employees");

					const fetchedEmployees = await EmployeesAPI.getAll(orgs[0].id);
					setEmployees(fetchedEmployees);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleClearFilters = () => {
		setPositionFilter(null);
		setSearchTerm("");
	};

	// Check if any filters are active
	const hasActiveFilters = useMemo(() => {
		return Boolean(searchTerm || positionFilter);
	}, [searchTerm, positionFilter]);

	// Get position filter label for display
	const getPositionFilterLabel = () => {
		return positionFilter || "All Positions";
	};

	if (isLoading) {
		return (
			<ContentContainer>
				<LoadingState
					message={`Loading ${
						loadingPhase === "organization" ? "organization" : "employees"
					}...`}
					type="spinner"
					className="py-12"
				/>
			</ContentContainer>
		);
	}

	return (
		<>
			<PageHeader
				title="Employees"
				description="Manage your team and employee information"
				actions={
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => toggleNotifications()}
									disabled={!presenceInitialized}
									className={cn(
										"relative",
										notificationsEnabled && "text-primary"
									)}>
									{notificationsEnabled ? (
										<BellRing className="h-4 w-4" />
									) : (
										<BellOff className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{notificationsEnabled
									? "Disable status notifications"
									: "Enable status notifications"}
							</TooltipContent>
						</Tooltip>

						<Button onClick={() => navigate("/employees/add")}>
							<Plus className="h-4 w-4 mr-2" />
							Add Employee
						</Button>
					</div>
				}
			/>
				<ContentContainer>
					{isLoading ? (
						<LoadingState
							message={
								loadingPhase === "organization"
									? "Loading organization information..."
									: "Loading employee data..."
							}
							type="spinner"
						/>
					) : (
						<ContentSection title="Employee Directory">
							{/* Filters and view controls */}
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
									<SearchInput
										placeholder="Search employees..."
										value={searchTerm}
										onChange={handleSearch}
										className="w-full sm:w-[300px]"
									/>

									<div className="relative">
										<Button
											variant="outline"
											onClick={() => setPositionFilter(null)}
											className="flex items-center gap-2">
											<Filter className="h-4 w-4" />
											{getPositionFilterLabel()}
										</Button>
									</div>
								</div>

								<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												onClick={() => setViewMode("table")}
												className={
													viewMode === "table" ? "bg-muted" : "bg-transparent"
												}>
												<List className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>List view</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												onClick={() => setViewMode("cards")}
												className={
													viewMode === "cards" ? "bg-muted" : "bg-transparent"
												}>
												<LayoutGrid className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Card view</TooltipContent>
									</Tooltip>
								</div>
							</div>

							{/* No employees */}
							{employees.length === 0 && (
								<EmptyState
									icon={<User className="h-10 w-10" />}
									title="No employees yet"
									description="Add your first employee to get started"
									action={
										<Button onClick={() => navigate("/employees/add")}>
											<Plus className="h-4 w-4 mr-2" />
											Add Employee
										</Button>
									}
								/>
							)}

							{/* Employees exist, but none match filters */}
							{employees.length > 0 && filteredEmployees.length === 0 && (
								<EmptyState
									icon={<AlertCircle className="h-10 w-10" />}
									title="No matching employees"
									description={`No employees match the current filters. Try adjusting your search or filters.`}
									action={
										<Button
											variant="outline"
											onClick={handleClearFilters}>
											Clear all filters
										</Button>
									}
								/>
							)}

							{/* Table view */}
							{filteredEmployees.length > 0 && viewMode === "table" && (
								<DataTable
									columns={columns}
									data={filteredEmployees}
								/>
							)}

							{/* Card view */}
							{filteredEmployees.length > 0 && viewMode === "cards" && (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{filteredEmployees.map((employee) => (
										<Card
											key={employee.id}
											className="cursor-pointer hover:shadow-md transition-shadow"
											onClick={() =>
												navigate(`/employee-detail/${employee.id}`)
											}>
											<CardHeader className="pb-4">
												<div className="flex justify-between items-start">
													<AvatarWithStatus
														fallback={employee.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()}
														isOnline={employee.isOnline}
														status={employee.status as any}
													/>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={(e) => e.stopPropagation()}>
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={(e) => {
																	e.stopPropagation();
																	navigate(`/employee-earnings/${employee.id}`);
																}}>
																<DollarSign className="h-4 w-4 mr-2" />
																View Earnings
															</DropdownMenuItem>
															{/* More dropdown items as needed */}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												<CardTitle className="text-base mt-3">
													{employee.name}
												</CardTitle>
												{(employee.position || employee.role) && (
													<CardDescription>
														{employee.position || employee.role}
													</CardDescription>
												)}
											</CardHeader>
											<CardContent className="pb-4">
												<div className="space-y-2 text-sm">
													<div className="flex items-center text-muted-foreground">
														<Mail className="h-4 w-4 mr-2" />
														{employee.email}
													</div>
													{employee.phone && (
														<div className="flex items-center text-muted-foreground">
															<Phone className="h-4 w-4 mr-2" />
															{employee.phone}
														</div>
													)}
												</div>
											</CardContent>
											<CardFooter className="pt-0 border-t flex justify-between">
												<EmployeeStatusBadge
													status={employee.status as any}
													isOnline={employee.isOnline}
													lastActive={employee.lastActive}
												/>
												<Button
													variant="ghost"
													size="sm"
													asChild
													className="ml-auto">
													<div className="flex items-center">
														View
														<ChevronRight className="h-4 w-4 ml-1" />
													</div>
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</ContentSection>
					)}
				</ContentContainer>
		</>
	);
}
