import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Employee, EmployeesAPI, OrganizationsAPI, Organization } from "../api";
import { AddEmployeeDialog } from "../components/AddEmployeeDialog";
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog";
import { EditEmployeeDialog } from "../components/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import {
	Mail,
	Phone,
	MoreVertical,
	Search,
	Plus,
	DollarSign,
} from "lucide-react";

export default function EmployeesPage() {
	const [loading, setLoading] = useState<boolean>(true);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");

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
					setFilteredEmployees(fetchedEmployees);
				}
			} catch (error) {
				console.error("Error fetching employees:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		// Filter employees when search query changes
		if (searchQuery.trim() === "") {
			setFilteredEmployees(employees);
		} else {
			const query = searchQuery.toLowerCase();
			const filtered = employees.filter(
				(employee) =>
					employee.name.toLowerCase().includes(query) ||
					employee.email.toLowerCase().includes(query) ||
					employee.position?.toLowerCase().includes(query) ||
					employee.role.toLowerCase().includes(query)
			);
			setFilteredEmployees(filtered);
		}
	}, [searchQuery, employees]);

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

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold text-primary">Employees</h1>
					<p className="text-muted-foreground mt-1">
						Manage your team members and their information
					</p>
				</div>
				{organization && (
					<AddEmployeeDialog
						organizationId={organization.id}
						onEmployeesAdded={handleEmployeesAdded}
					/>
				)}
			</div>

			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Employee Directory</h2>
				<div className="flex items-center gap-2">
					<div className="relative w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search employees..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					{organization && (
						<AddEmployeeDialog
							organizationId={organization.id}
							onEmployeesAdded={handleEmployeesAdded}
							trigger={
								<Button size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add
								</Button>
							}
						/>
					)}
				</div>
			</div>

			<p className="text-muted-foreground mb-4">
				{filteredEmployees.length} total employees
			</p>

			{filteredEmployees.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed rounded-lg">
					<h3 className="text-lg font-medium mb-2">No employees found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{employees.length === 0
							? "Start by adding employees to your organization"
							: "Try a different search query"}
					</p>
					{employees.length === 0 && organization && (
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
				<div className="border rounded-md bg-background">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Position</TableHead>
								<TableHead>Hourly Rate</TableHead>
								<TableHead className="w-[80px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredEmployees.map((employee) => (
								<TableRow key={employee.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="text-primary font-medium text-xs">
													{employee.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()}
												</span>
											</div>
											<span>{employee.name}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<div className="flex items-center text-sm">
												<Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
												<span>{employee.email}</span>
											</div>
											{employee.phone && (
												<div className="flex items-center text-sm mt-1">
													<Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
													<span>{employee.phone}</span>
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>{employee.position || employee.role}</TableCell>
									<TableCell>
										{employee.hourlyRate !== undefined ? (
											<div className="flex items-center">
												<DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
												<span>{employee.hourlyRate.toFixed(2)}/hr</span>
											</div>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>
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
												<EmployeeDetailDialog
													employee={employee}
													trigger={
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}>
															View Details
														</DropdownMenuItem>
													}
												/>
												<EditEmployeeDialog
													employee={employee}
													onEmployeeUpdated={handleEmployeeUpdated}
													trigger={
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}>
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
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
