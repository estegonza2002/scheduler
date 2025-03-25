import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useLayoutEffect,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useLayout } from "../lib/layout-context";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import {
	Building2,
	Users,
	Calendar,
	ClipboardList,
	Plus,
	PieChart,
	Mail,
	Phone,
	Loader2,
} from "lucide-react";
import { Organization, OrganizationsAPI, EmployeesAPI, Employee } from "../api";
import { AddEmployeeDialog } from "../components/AddEmployeeDialog";
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog";
import { Skeleton } from "../components/ui/skeleton";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";
import {
	PageContentSpacing,
	SectionContentSpacing,
} from "../components/ui/header-content-spacing";

export default function AdminDashboardPage() {
	const { user } = useAuth();
	const { updatePageHeader } = useLayout();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPhase, setLoadingPhase] = useState<string>("organization");
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [viewMode, setViewMode] = useState<"card" | "list">("card");
	const [selectedOrganization, setSelectedOrganization] = useState<string>("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
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
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
				setLoadingPhase("");
			}
		};

		fetchData();
	}, []);

	const handleEmployeesAdded = useCallback((newEmployees: Employee[]) => {
		setEmployees((prev) => [...prev, ...newEmployees]);
	}, []);

	// Render loading skeleton
	const renderLoadingSkeleton = () => {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-8 w-48" />
				</div>

				<Skeleton className="h-24 w-full rounded-md mb-6" />

				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-36 w-full rounded-md"
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	// Combined effect to handle both setup and cleanup
	useEffect(() => {
		// Only update the header if not loading
		if (!loading) {
			// Define simpler, inline header actions
			const actions = (
				<div className="flex gap-2">
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
					<Link to="/business-profile">
						<Button variant="outline">
							<Building2 className="mr-2 h-4 w-4" />
							Edit Business
						</Button>
					</Link>
				</div>
			);
		}

		// Cleanup function
		return () => {
			updatePageHeader({ title: "" });
		};
	}, [
		loading,
		organization?.id,
		user?.user_metadata?.firstName,
		updatePageHeader,
		handleEmployeesAdded,
	]);

	if (loading) {
		return <ContentContainer>{renderLoadingSkeleton()}</ContentContainer>;
	}

	return (
		<ContentContainer>
			<Card>
				<CardContent className="p-6">
					<Tabs
						defaultValue="overview"
						className="mb-6">
						<TabsList className="w-full mb-4">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="employees">Employees</TabsTrigger>
							<TabsTrigger value="schedules">Schedules</TabsTrigger>
							<TabsTrigger value="shifts">Shifts</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value="overview">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground mb-2">
											Total Employees
										</div>
										<div className="flex justify-between items-end">
											<div className="text-2xl font-bold">
												{employees.length}
											</div>
											<Users className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground mb-2">
											Active Schedules
										</div>
										<div className="flex justify-between items-end">
											<div className="text-2xl font-bold">2</div>
											<Calendar className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground mb-2">
											Open Shifts
										</div>
										<div className="flex justify-between items-end">
											<div className="text-2xl font-bold">4</div>
											<ClipboardList className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground mb-2">
											This Week's Hours
										</div>
										<div className="flex justify-between items-end">
											<div className="text-2xl font-bold">120</div>
											<PieChart className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Quick Actions */}
							<SectionContentSpacing>
								<ContentSection
									title="Quick Actions"
									description="Get started with managing your business">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<Card className="bg-black text-white">
											<CardContent className="p-6 flex flex-col items-center justify-center gap-4">
												<Users className="h-12 w-12" />
												<div className="text-center">
													<h3 className="text-lg font-medium">Add Employees</h3>
												</div>
												{organization && (
													<AddEmployeeDialog
														organizationId={organization.id}
														onEmployeesAdded={handleEmployeesAdded}
														trigger={
															<Button
																variant="outline"
																className="w-full text-white border-white hover:bg-white/20">
																Add Employees
															</Button>
														}
													/>
												)}
											</CardContent>
										</Card>

										<Card className="bg-black text-white">
											<CardContent className="p-6 flex flex-col items-center justify-center gap-4">
												<Calendar className="h-12 w-12" />
												<div className="text-center">
													<h3 className="text-lg font-medium">
														Create Schedule
													</h3>
												</div>
												<Button
													variant="outline"
													className="w-full text-white border-white hover:bg-white/20"
													onClick={() => navigate("/schedule")}>
													Create Schedule
												</Button>
											</CardContent>
										</Card>

										<Card className="bg-black text-white">
											<CardContent className="p-6 flex flex-col items-center justify-center gap-4">
												<ClipboardList className="h-12 w-12" />
												<div className="text-center">
													<h3 className="text-lg font-medium">Assign Shifts</h3>
												</div>
												<Button
													variant="outline"
													className="w-full text-white border-white hover:bg-white/20"
													onClick={() => navigate("/daily-shifts")}>
													Assign Shifts
												</Button>
											</CardContent>
										</Card>
									</div>
								</ContentSection>
							</SectionContentSpacing>
						</TabsContent>

						<TabsContent value="employees">
							<ContentSection
								title="Employees"
								description="Manage your team members"
								headerActions={
									organization && (
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
									)
								}>
								{employees.length === 0 ? (
									<div className="text-center py-12 border-2 border-dashed rounded-lg">
										<Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-lg font-medium mb-2">
											No employees yet
										</h3>
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
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{employees.map((employee) => (
											<div
												key={employee.id}
												className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
												onClick={() =>
													navigate(`/employee-detail/${employee.id}`)
												}>
												<div className="w-full">
													<div className="p-4">
														<div className="flex items-center gap-3">
															<div className="relative">
																<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
																	<span className="text-primary font-medium">
																		{employee.name
																			.split(" ")
																			.map((n) => n[0])
																			.join("")
																			.toUpperCase()}
																	</span>
																</div>
															</div>
															<div>
																<h4 className="font-medium">{employee.name}</h4>
																<p className="text-sm text-muted-foreground">
																	{employee.position || employee.role}
																</p>
															</div>
														</div>
													</div>
													<div className="p-4 border-t bg-muted/10">
														<div className="flex items-center text-sm mb-1">
															<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
															<span>{employee.email}</span>
														</div>
														{employee.phone && (
															<div className="flex items-center text-sm">
																<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
																<span>{employee.phone}</span>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</ContentSection>
						</TabsContent>

						<TabsContent value="schedules">
							<ContentSection
								title="Schedules"
								description="View and manage schedules"
								headerActions={
									<Button
										variant="default"
										className="bg-black hover:bg-black/90 text-white"
										onClick={() => navigate("/schedule")}>
										<Plus className="mr-2 h-4 w-4" />
										Create Schedule
									</Button>
								}>
								<div className="text-center py-12 border-2 border-dashed rounded-lg">
									<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-medium mb-2">
										No schedules created
									</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Start by creating a schedule for your employees
									</p>
									<Button
										variant="default"
										className="bg-black hover:bg-black/90 text-white"
										onClick={() => navigate("/schedule")}>
										<Plus className="mr-2 h-4 w-4" />
										Create First Schedule
									</Button>
								</div>
							</ContentSection>
						</TabsContent>

						<TabsContent value="shifts">
							<ContentSection
								title="Shifts"
								description="Manage and assign shifts"
								headerActions={
									<Button
										variant="default"
										className="bg-black hover:bg-black/90 text-white">
										<Plus className="mr-2 h-4 w-4" />
										Create Shift
									</Button>
								}>
								<div className="text-center py-12 border-2 border-dashed rounded-lg">
									<ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-medium mb-2">
										No shifts created
									</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Start by creating shifts for your employees
									</p>
									<Button
										variant="default"
										className="bg-black hover:bg-black/90 text-white">
										<Plus className="mr-2 h-4 w-4" />
										Create First Shift
									</Button>
								</div>
							</ContentSection>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</ContentContainer>
	);
}
