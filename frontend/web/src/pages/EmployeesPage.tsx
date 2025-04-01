import { useMemo, useState, useEffect, useCallback } from "react";
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
	MoreHorizontal,
	Trash,
	Briefcase,
	Upload,
	UserX,
	UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteEmployeeDialog } from "@/components/DeleteEmployeeDialog";
import { EmployeeDialog } from "@/components/EmployeeDialog";
import { EmployeeCard } from "@/components/EmployeeCard";
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
import { useEmployeePresenceWithNotifications } from "@/lib/presence";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { cn } from "@/lib/utils";
import { ContentSection } from "@/components/ui/content-section";
import { DataCardGrid } from "@/components/ui/data-card-grid";
import { getDefaultOrganizationId } from "@/lib/utils";
import { getProfileCompletionStatus } from "@/utils/profile-completion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AppHeader,
	AppTitle,
	AppDescription,
} from "@/components/layout/AppLayout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHeader } from "@/lib/header-context";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function EmployeesPage() {
	const { updateHeader } = useHeader();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingPhase, setLoadingPhase] = useState<
		"organization" | "employees"
	>("organization");
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
	const [employeesChannel, setEmployeesChannel] =
		useState<RealtimeChannel | null>(null);

	const {
		initialized: presenceInitialized,
		toggleNotifications,
		notificationsEnabled,
	} = useEmployeePresenceWithNotifications(organization?.id || "");
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// Function to load employee data
	const loadEmployeeData = useCallback(async (orgId: string) => {
		if (!orgId) return;

		try {
			setLoadingPhase("employees");
			console.log("Loading employees for organization:", orgId);

			const fetchedEmployees = await EmployeesAPI.getAll(orgId);
			console.log(`Loaded ${fetchedEmployees.length} employees`);

			setEmployees(fetchedEmployees);
		} catch (error) {
			console.error("Error loading employees:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Setup Supabase real-time subscriptions
	const setupRealtimeSubscriptions = useCallback(
		(orgId: string) => {
			if (!orgId) return;

			console.log(
				`Setting up real-time subscriptions for organization: ${orgId}`
			);

			// Unsubscribe from any existing channel
			if (employeesChannel) {
				employeesChannel.unsubscribe();
			}

			// Subscribe to employees table changes for this organization
			const employeesSubscription = supabase
				.channel("employees-changes")
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "employees",
						filter: `organization_id=eq.${orgId}`,
					},
					(payload) => {
						console.log("Employee data changed:", payload);

						// Handle different types of changes
						if (payload.eventType === "INSERT") {
							console.log("New employee added:", payload.new);
							// Convert from snake_case to camelCase
							const newEmployee = {
								id: payload.new.id,
								organizationId: payload.new.organization_id,
								name: payload.new.name,
								email: payload.new.email,
								position: payload.new.position,
								phone: payload.new.phone,
								hireDate: payload.new.hire_date,
								address: payload.new.address,
								emergencyContact: payload.new.emergency_contact,
								notes: payload.new.notes,
								avatar: payload.new.avatar,
								hourlyRate:
									payload.new.hourly_rate !== null
										? parseFloat(payload.new.hourly_rate)
										: undefined,
								status: payload.new.status,
								isOnline: payload.new.is_online,
								lastActive: payload.new.last_active,
							} as Employee;

							// Update state
							setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
						} else if (payload.eventType === "UPDATE") {
							console.log("Employee updated:", payload.new);
							// Convert from snake_case to camelCase
							const updatedEmployee = {
								id: payload.new.id,
								organizationId: payload.new.organization_id,
								name: payload.new.name,
								email: payload.new.email,
								position: payload.new.position,
								phone: payload.new.phone,
								hireDate: payload.new.hire_date,
								address: payload.new.address,
								emergencyContact: payload.new.emergency_contact,
								notes: payload.new.notes,
								avatar: payload.new.avatar,
								hourlyRate:
									payload.new.hourly_rate !== null
										? parseFloat(payload.new.hourly_rate)
										: undefined,
								status: payload.new.status,
								isOnline: payload.new.is_online,
								lastActive: payload.new.last_active,
							} as Employee;

							// Update state
							setEmployees((prevEmployees) =>
								prevEmployees.map((emp) =>
									emp.id === updatedEmployee.id ? updatedEmployee : emp
								)
							);
						} else if (payload.eventType === "DELETE") {
							console.log("Employee deleted:", payload.old);

							// Update state
							setEmployees((prevEmployees) =>
								prevEmployees.filter((emp) => emp.id !== payload.old.id)
							);
						} else {
							// For any other change, reload all employees
							loadEmployeeData(orgId);
						}
					}
				)
				.subscribe((status) => {
					console.log("Employees subscription status:", status);
				});

			// Save the channel reference for cleanup
			setEmployeesChannel(employeesSubscription);
		},
		[loadEmployeeData]
	);

	// Listen for employee-added events from the system header
	useEffect(() => {
		const handleEmployeeAdded = (event: CustomEvent<Employee>) => {
			if (event.detail) {
				setEmployees((prev) => [...prev, event.detail]);
			}
		};

		const handleEmployeeUpdated = (event: CustomEvent<Employee>) => {
			if (event.detail) {
				setEmployees((prev) =>
					prev.map((emp) => (emp.id === event.detail.id ? event.detail : emp))
				);
			}
		};

		const handleEmployeeDeleted = (event: CustomEvent<string>) => {
			if (event.detail) {
				setEmployees((prev) => prev.filter((emp) => emp.id !== event.detail));
			}
		};

		window.addEventListener(
			"employee-added",
			handleEmployeeAdded as EventListener
		);

		window.addEventListener(
			"employee-updated",
			handleEmployeeUpdated as EventListener
		);

		window.addEventListener(
			"employee-deleted",
			handleEmployeeDeleted as EventListener
		);

		return () => {
			window.removeEventListener(
				"employee-added",
				handleEmployeeAdded as EventListener
			);

			window.removeEventListener(
				"employee-updated",
				handleEmployeeUpdated as EventListener
			);

			window.removeEventListener(
				"employee-deleted",
				handleEmployeeDeleted as EventListener
			);
		};
	}, []);

	// Initial data fetch and setup
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setLoadingPhase("organization");
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);

					// Load employee data
					await loadEmployeeData(orgs[0].id);

					// Setup real-time subscriptions
					setupRealtimeSubscriptions(orgs[0].id);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		// Cleanup function to unsubscribe from channels when component unmounts
		return () => {
			if (employeesChannel) {
				console.log("Cleaning up employees subscription");
				employeesChannel.unsubscribe();
			}
		};
	}, [loadEmployeeData, setupRealtimeSubscriptions]);

	// Calculate pagination for card view
	const paginatedEmployees = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return employees.slice(startIndex, endIndex);
	}, [employees, currentPage, pageSize]);

	// Set the page header on component mount
	useEffect(() => {
		updateHeader({
			title: "Employees",
			description: "View and manage employee information",
			actions: (
				<>
					{/* Pending signup indicator in header */}
					{employees.filter((emp) => emp.status === "invited").length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								// Filter to invited employees
								const invitedParams = new URLSearchParams(searchParams);
								invitedParams.set("status", "invited");
								setSearchParams(invitedParams);
							}}
							className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:text-red-900 gap-1.5">
							<UserX className="h-3.5 w-3.5" />
							<span>
								{employees.filter((emp) => emp.status === "invited").length}{" "}
								Pending Invites
							</span>
						</Button>
					)}

					{/* Profile completion indicator */}
					{employees.filter(
						(emp) => !getProfileCompletionStatus(emp).isComplete
					).length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								// Reset any status filter to show all employees
								const params = new URLSearchParams(searchParams);
								params.delete("status");
								setSearchParams(params);
							}}
							className={
								employees.filter(
									(emp) =>
										!getProfileCompletionStatus(emp).isComplete &&
										getProfileCompletionStatus(emp).missingHighPriority
								).length > 0
									? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900 gap-1.5"
									: "bg-muted border-muted-foreground/20 text-muted-foreground hover:bg-muted/80 gap-1.5"
							}>
							<AlertCircle className="h-3.5 w-3.5" />
							<span>
								{
									employees.filter(
										(emp) => !getProfileCompletionStatus(emp).isComplete
									).length
								}{" "}
								Incomplete
							</span>
						</Button>
					)}

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

					<Button
						className="bg-primary text-primary-foreground"
						onClick={() => setEmployeeDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Employee
					</Button>
					<EmployeeDialog
						open={employeeDialogOpen}
						onOpenChange={setEmployeeDialogOpen}
						onSubmit={async (data) => {
							const newEmployee = await EmployeesAPI.create({
								...data,
								organizationId: organization?.id || getDefaultOrganizationId(),
								position: data.position || "Employee",
								status: "invited",
								isOnline: false,
								lastActive: new Date().toISOString(),
							});
							setEmployees((prev) => [...prev, newEmployee]);
						}}
					/>
				</>
			),
		});
	}, [
		updateHeader,
		employees,
		searchParams,
		toggleNotifications,
		presenceInitialized,
		notificationsEnabled,
		organization?.id,
		organization?.name,
		setSearchParams,
	]);

	const columns = useMemo<ColumnDef<Employee>[]>(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => {
					const employee = row.original;
					const profileStatus = getProfileCompletionStatus(employee);

					return (
						<div className="flex items-center gap-3">
							<div className="relative">
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
								{!profileStatus.isComplete && (
									<span
										className={`h-2 w-2 rounded-full absolute -top-0.5 -right-0.5 border border-background ${
											profileStatus.missingHighPriority
												? "bg-red-500"
												: "bg-amber-400"
										}`}
									/>
								)}
							</div>
							<div className="flex flex-col">
								<div className="flex items-center">
									<span className="font-medium">{employee.name}</span>
									{!profileStatus.isComplete &&
										profileStatus.missingHighPriority && (
											<span className="ml-2 inline-flex items-center">
												<AlertCircle className="h-3 w-3 text-red-500" />
											</span>
										)}
								</div>
								<span className="text-xs text-muted-foreground">
									{employee.position || "Employee"}
								</span>
							</div>
						</div>
					);
				},
				filterFn: (row, id, filterValue) => {
					return row.original.name
						.toLowerCase()
						.includes(filterValue.toLowerCase());
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const employee = row.original;

					// Add special treatment for invited status
					if (employee.status === "invited") {
						return (
							<div className="flex items-center gap-1.5">
								<Badge
									variant="destructive"
									className="bg-red-500 text-white font-medium text-xs whitespace-nowrap">
									<UserX className="h-3 w-3 mr-1" />
									Pending Signup
								</Badge>
							</div>
						);
					}

					return (
						<EmployeeStatusBadge
							status={employee.status as any}
							isOnline={employee.isOnline}
							compact
						/>
					);
				},
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
				filterFn: (row, id, filterValue) => {
					return (
						(row.original.email || "")
							.toLowerCase()
							.includes(filterValue.toLowerCase()) ||
						(row.original.phone || "")
							.toLowerCase()
							.includes(filterValue.toLowerCase())
					);
				},
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
								navigate(`/employees/${employee.id}`);
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

	// Pagination handlers for card view
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when changing page size
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
						{/* No employees */}
						{employees.length === 0 && (
							<EmptyState
								icon={<User className="h-10 w-10" />}
								title="No employees yet"
								description="Add your first employee to get started"
								action={
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												className="h-9 px-4 flex items-center gap-2">
												<UserPlus className="h-4 w-4" />
												Add Employee
											</Button>
										</DialogTrigger>
										<EmployeeDialog
											onSubmit={async (data) => {
												const newEmployee = await EmployeesAPI.create({
													...data,
													organizationId:
														organization?.id || getDefaultOrganizationId(),
													position: data.position || "Employee",
													status: "invited",
													isOnline: false,
													lastActive: new Date().toISOString(),
												});
												setEmployees((prev) => [...prev, newEmployee]);
											}}
										/>
									</Dialog>
								}
							/>
						)}

						{employees.length > 0 && (
							<DataTable
								columns={columns}
								data={employees}
								searchKey="name"
								searchPlaceholder="Search employees..."
								onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
								viewOptions={{
									enableViewToggle: true,
									defaultView: viewMode,
									onViewChange: setViewMode,
									renderCard: (employee: Employee) => (
										<EmployeeCard
											employee={employee}
											variant="standard"
											size="md"
											onViewDetails={() =>
												navigate(`/employees/${employee.id}`)
											}
											showActions={true}
											actions={
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																navigate(`/employees/${employee.id}`);
															}}>
															<Edit className="mr-2 h-4 w-4" />
															View Profile
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
															}}
															asChild>
															<Dialog>
																<DialogTrigger asChild>
																	<button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
																		<Edit className="mr-2 h-4 w-4" />
																		Edit
																	</button>
																</DialogTrigger>
																<EmployeeDialog
																	employee={employee}
																	onSubmit={async (data) => {
																		const updatedEmployee =
																			await EmployeesAPI.update(employee.id, {
																				...data,
																				organizationId:
																					employee.organizationId ||
																					organization?.id ||
																					getDefaultOrganizationId(),
																				position: data.position || "Employee",
																				status: employee.status || "active",
																				isOnline: employee.isOnline || false,
																				lastActive:
																					employee.lastActive ||
																					new Date().toISOString(),
																			});
																		// The event-based approach will handle the state update
																	}}
																/>
															</Dialog>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											}
										/>
									),
									enableFullscreen: true,
								}}
							/>
						)}
					</ContentSection>
				)}
			</ContentContainer>
		</>
	);
}
