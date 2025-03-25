import { useState } from "react";
import { Employee } from "../api";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Plus, User, Users, Info, CheckCircle } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";
import { BulkEmployeeUpload } from "./BulkEmployeeUpload";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { DialogHeader } from "./ui/dialog-header";

/**
 * Props for the AddEmployeeDialog component
 */
interface AddEmployeeDialogProps {
	/**
	 * The ID of the organization to add employees to
	 */
	organizationId: string;
	/**
	 * Optional custom trigger element
	 */
	trigger?: React.ReactNode;
	/**
	 * Optional callback fired when employees are added
	 */
	onEmployeesAdded?: (employees: Employee[]) => void;
	/**
	 * Optional additional className for the dialog content
	 */
	className?: string;
}

/**
 * Dialog component for adding one or multiple employees
 */
export function AddEmployeeDialog({
	organizationId,
	trigger,
	onEmployeesAdded,
	className,
}: AddEmployeeDialogProps) {
	const [open, setOpen] = useState(false);
	const [newEmployees, setNewEmployees] = useState<Employee[]>([]);
	const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

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

	const handleOpenChange = (newOpenState: boolean) => {
		if (!newOpenState) {
			// Reset state when dialog closes
			setTimeout(() => {
				if (!open) setNewEmployees([]);
			}, 300); // Wait for dialog close animation
		}
		setOpen(newOpenState);
	};

	// Create actions for the dialog header
	const headerActions =
		newEmployees.length > 0 ? (
			<Badge variant="secondary">{newEmployees.length} added</Badge>
		) : undefined;

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Employees
					</Button>
				)}
			</DialogTrigger>
			<DialogContent
				className={cn(
					"sm:max-w-[650px] overflow-hidden flex flex-col",
					className
				)}>
				<DialogHeader
					title="Add Employees"
					description="Add employees to your organization. Choose between adding a single employee with complete details or quickly uploading multiple employees with basic information."
					actions={headerActions}
					titleClassName="flex items-center"
					onClose={() => handleOpenChange(false)}
				/>

				<Tabs
					defaultValue="single"
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as "single" | "bulk")}
					className="flex-1 overflow-hidden flex flex-col">
					<div className="border-b px-1">
						<TabsList className="grid w-full grid-cols-2 mb-2">
							<TabsTrigger
								value="single"
								className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
								<User className="h-4 w-4 mr-2" />
								Single Employee
							</TabsTrigger>
							<TabsTrigger
								value="bulk"
								className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
								<Users className="h-4 w-4 mr-2" />
								Bulk Upload
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent side="bottom">
											Limited to 4 fields only: name, email, phone, and hourly
											rate
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</TabsTrigger>
						</TabsList>
					</div>

					<ScrollArea className="flex-1 overflow-auto">
						<TabsContent
							value="single"
							className="mt-4 border-0 p-0 data-[state=active]:flex-1">
							<EmployeeForm
								organizationId={organizationId}
								onSuccess={handleSingleEmployeeAdded}
							/>
						</TabsContent>

						<TabsContent
							value="bulk"
							className="mt-4 border-0 p-0 data-[state=active]:flex-1">
							<BulkEmployeeUpload
								organizationId={organizationId}
								onSuccess={handleBulkEmployeesAdded}
							/>
						</TabsContent>
					</ScrollArea>
				</Tabs>

				{newEmployees.length > 0 && (
					<DialogFooter className="flex flex-col sm:flex-row px-4 py-3 mt-2 gap-2 border-t">
						<div className="flex items-center text-sm text-muted-foreground mr-auto">
							<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
							<span>
								{newEmployees.length} employee
								{newEmployees.length !== 1 ? "s" : ""} added successfully
							</span>
						</div>
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							Close
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
