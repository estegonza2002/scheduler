import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
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
} from "lucide-react";
import { Organization, OrganizationsAPI, EmployeesAPI, Employee } from "../api";
import { AddEmployeeDialog } from "../components/AddEmployeeDialog";
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog";

export default function AdminDashboardPage() {
	const { user } = useAuth();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [viewMode, setViewMode] = useState<"card" | "list">("card");
	const [selectedOrganization, setSelectedOrganization] = useState<string>("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				// In a real implementation, we would get the user's organization
				// For now, we'll use the first organization from the mock data
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					const fetchedEmployees = await EmployeesAPI.getAll(orgs[0].id);
					setEmployees(fetchedEmployees);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleEmployeesAdded = (newEmployees: Employee[]) => {
		setEmployees((prev) => [...prev, ...newEmployees]);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="py-6 px-8 md:px-10 w-full">
			{/* Welcome Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-primary">
					Welcome back, {user?.user_metadata?.firstName || "Admin"}!
				</h1>
				<p className="text-muted-foreground mt-1">
					Here's an overview of your business.
				</p>
			</div>

			{/* Organization Info */}
			<div className="mb-8">
				<Card>
					<CardContent className="p-6">
						<div className="flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-semibold">
									{organization?.name || "Your Business"}
								</h2>
								<p className="text-muted-foreground">
									{organization?.description || "Business description..."}
								</p>
							</div>
							<Link to="/business-profile">
								<Button>
									<Building2 className="mr-2 h-4 w-4" />
									Edit Business
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Dashboard Tabs */}
			<Tabs
				defaultValue="overview"
				className="mb-8">
				<TabsList className="mb-6 w-full sm:w-auto">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="employees">Employees</TabsTrigger>
					<TabsTrigger value="schedules">Schedules</TabsTrigger>
					<TabsTrigger value="shifts">Shifts</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Employees
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-end">
									<div className="text-3xl font-bold">{employees.length}</div>
									<Users className="h-5 w-5 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Active Schedules
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-end">
									<div className="text-3xl font-bold">2</div>
									<Calendar className="h-5 w-5 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Open Shifts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-end">
									<div className="text-3xl font-bold">4</div>
									<ClipboardList className="h-5 w-5 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									This Week's Hours
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-end">
									<div className="text-3xl font-bold">120</div>
									<PieChart className="h-5 w-5 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>
									Get started with managing your business
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{organization && (
										<AddEmployeeDialog
											organizationId={organization.id}
											onEmployeesAdded={handleEmployeesAdded}
											trigger={
												<Button className="h-auto flex-col py-4 px-2 space-y-2">
													<Users className="h-6 w-6" />
													<span>Add Employees</span>
												</Button>
											}
										/>
									)}

									<Button className="h-auto flex-col py-4 px-2 space-y-2">
										<Calendar className="h-6 w-6" />
										<span>Create Schedule</span>
									</Button>

									<Button className="h-auto flex-col py-4 px-2 space-y-2">
										<ClipboardList className="h-6 w-6" />
										<span>Assign Shifts</span>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Employees Tab */}
				<TabsContent value="employees">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Employees</CardTitle>
								<CardDescription>Manage your team members</CardDescription>
							</div>
							{organization && (
								<AddEmployeeDialog
									organizationId={organization.id}
									onEmployeesAdded={handleEmployeesAdded}
								/>
							)}
						</CardHeader>
						<CardContent>
							{employees.length === 0 ? (
								<div className="text-center py-12 border-2 border-dashed rounded-lg">
									<Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-medium mb-2">No employees yet</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Start by adding employees to your organization
									</p>
									{organization && (
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
									)}
								</div>
							) : (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{employees.map((employee) => (
										<Card
											key={employee.id}
											className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
											onClick={() =>
												navigate(`/employee-detail/${employee.id}`)
											}>
											<div className="w-full">
												<CardHeader className="p-4">
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
															<CardTitle className="text-base">
																{employee.name}
															</CardTitle>
															<CardDescription>
																{employee.position || employee.role}
															</CardDescription>
														</div>
													</div>
												</CardHeader>
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
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Schedules Tab */}
				<TabsContent value="schedules">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Schedules</CardTitle>
								<CardDescription>Create and manage schedules</CardDescription>
							</div>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Schedule
							</Button>
						</CardHeader>
						<CardContent>
							<div className="text-center py-12 border-2 border-dashed rounded-lg">
								<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">No schedules yet</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Start by creating a schedule for your organization
								</p>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create First Schedule
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Shifts Tab */}
				<TabsContent value="shifts">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Shifts</CardTitle>
								<CardDescription>Manage and assign shifts</CardDescription>
							</div>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Shift
							</Button>
						</CardHeader>
						<CardContent>
							<div className="text-center py-12 border-2 border-dashed rounded-lg">
								<ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">No shifts created</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Start by creating shifts for your employees
								</p>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create First Shift
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
