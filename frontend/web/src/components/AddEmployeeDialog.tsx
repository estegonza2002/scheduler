import { useState } from "react";
import { Employee } from "../api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { BulkEmployeeUpload } from "./BulkEmployeeUpload";

interface AddEmployeeDialogProps {
	organizationId: string;
	trigger?: React.ReactNode;
	onEmployeesAdded?: (employees: Employee[]) => void;
}

export function AddEmployeeDialog({
	organizationId,
	trigger,
	onEmployeesAdded,
}: AddEmployeeDialogProps) {
	const [open, setOpen] = useState(false);
	const [newEmployees, setNewEmployees] = useState<Employee[]>([]);

	const handleSingleEmployeeAdded = (employee: Employee) => {
		setNewEmployees((prev) => [...prev, employee]);
		if (onEmployeesAdded) {
			onEmployeesAdded([employee]);
		}
	};

	const handleBulkEmployeesAdded = (employees: Employee[]) => {
		setNewEmployees((prev) => [...prev, ...employees]);
		if (onEmployeesAdded) {
			onEmployeesAdded(employees);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Employees
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>Add Employees</DialogTitle>
					<DialogDescription>
						Add a single employee with complete details or quickly upload
						multiple employees with basic information.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					defaultValue="single"
					className="mt-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="single">Single Employee</TabsTrigger>
						<TabsTrigger value="bulk">Bulk Upload (4 fields only)</TabsTrigger>
					</TabsList>

					<TabsContent
						value="single"
						className="mt-4">
						<EmployeeForm
							organizationId={organizationId}
							onSuccess={handleSingleEmployeeAdded}
						/>
					</TabsContent>

					<TabsContent
						value="bulk"
						className="mt-4">
						<BulkEmployeeUpload
							organizationId={organizationId}
							onSuccess={handleBulkEmployeesAdded}
						/>
					</TabsContent>
				</Tabs>

				{newEmployees.length > 0 && (
					<div className="mt-4 pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							{newEmployees.length} employee
							{newEmployees.length !== 1 ? "s" : ""} added
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
