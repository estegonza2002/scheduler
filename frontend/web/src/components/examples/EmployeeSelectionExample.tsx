import { useState } from "react";
import { EmployeeCard } from "../EmployeeCard";
import { Button } from "../ui/button";
import { Employee } from "../../api";

// Example component to demonstrate how to use EmployeeCard for selection
export function EmployeeSelectionExample() {
	// Sample employee data
	const employees = {
		"1": {
			id: "1",
			name: "John Smith",
			position: "Manager",
			email: "john@example.com",
			phone: "555-1234",
			organizationId: "org1",
			status: "active",
			isOnline: true,
			lastActive: new Date().toISOString(),
		},
		"2": {
			id: "2",
			name: "Sarah Johnson",
			position: "Supervisor",
			email: "sarah@example.com",
			phone: "555-5678",
			organizationId: "org1",
			status: "active",
			isOnline: false,
			lastActive: new Date().toISOString(),
		},
		"3": {
			id: "3",
			name: "Michael Brown",
			position: "Team Lead",
			email: "michael@example.com",
			phone: "555-9012",
			organizationId: "org1",
			status: "active",
			isOnline: true,
			lastActive: new Date().toISOString(),
		},
		"4": {
			id: "4",
			name: "Jessica Davis",
			position: "Associate",
			email: "jessica@example.com",
			phone: "555-3456",
			organizationId: "org1",
			status: "active",
			isOnline: false,
			lastActive: new Date().toISOString(),
		},
		"5": {
			id: "5",
			name: "David Wilson",
			position: "Developer",
			email: "david@example.com",
			phone: "555-7890",
			organizationId: "org1",
			status: "active",
			isOnline: true,
			lastActive: new Date().toISOString(),
		},
		"6": {
			id: "6",
			name: "Emily Martinez",
			position: "Designer",
			email: "emily@example.com",
			phone: "555-2345",
			organizationId: "org1",
			status: "active",
			isOnline: false,
			lastActive: new Date().toISOString(),
		},
	} as Record<string, Employee>;

	// State for selected employees
	const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

	// Toggle employee selection
	const toggleSelection = (employeeId: string) => {
		setSelectedEmployees((prev) =>
			prev.includes(employeeId)
				? prev.filter((id) => id !== employeeId)
				: [...prev, employeeId]
		);
	};

	// State for selection mode
	const [selectionMode, setSelectionMode] = useState<
		"checkbox" | "highlight" | "checkmark"
	>("checkmark");

	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold">Employee Selection</h2>
				<p className="text-muted-foreground">
					Click on an employee card to select it. Selected employees will be
					highlighted.
				</p>
			</div>

			<div className="flex space-x-4 my-4">
				<div className="space-y-2">
					<p className="text-sm font-medium">Selection Mode</p>
					<div className="flex space-x-2">
						<Button
							variant={selectionMode === "checkmark" ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectionMode("checkmark")}>
							Checkmark
						</Button>
						<Button
							variant={selectionMode === "checkbox" ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectionMode("checkbox")}>
							Checkbox
						</Button>
						<Button
							variant={selectionMode === "highlight" ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectionMode("highlight")}>
							Highlight
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium">Actions</p>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSelectedEmployees([])}>
							Clear Selection
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSelectedEmployees(Object.keys(employees))}>
							Select All
						</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{Object.values(employees).map((employee) => (
					<EmployeeCard
						key={employee.id}
						employee={employee}
						selectable={true}
						selected={selectedEmployees.includes(employee.id)}
						onSelect={() => toggleSelection(employee.id)}
						selectionMode={selectionMode}
						variant="standard"
						size="md"
						actions={
							selectedEmployees.includes(employee.id) ? (
								<Button
									variant="ghost"
									size="sm"
									className="text-xs"
									onClick={(e) => {
										e.stopPropagation();
										toggleSelection(employee.id);
									}}>
									Deselect
								</Button>
							) : null
						}
					/>
				))}
			</div>

			<div className="mt-6 p-4 border rounded-md bg-muted/20">
				<h3 className="text-lg font-medium mb-2">
					Selected Employees ({selectedEmployees.length})
				</h3>
				{selectedEmployees.length > 0 ? (
					<ul className="list-disc list-inside">
						{selectedEmployees.map((id) => {
							const employee = employees[id];
							return employee ? (
								<li key={id}>
									{employee.name} - {employee.position}
								</li>
							) : null;
						})}
					</ul>
				) : (
					<p className="text-muted-foreground">No employees selected</p>
				)}
			</div>
		</div>
	);
}
