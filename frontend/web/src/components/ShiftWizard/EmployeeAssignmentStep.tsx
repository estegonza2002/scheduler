import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Employee } from "../../api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { ArrowLeft, Check } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";

type EmployeeData = {
	employeeId: string;
};

type ShiftData = {
	date: string;
	startTime: string;
	endTime: string;
	notes?: string;
};

type LocationData = {
	locationId: string;
};

interface EmployeeAssignmentStepProps {
	employeeForm: UseFormReturn<EmployeeData>;
	locationData: LocationData;
	shiftData: ShiftData;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	searchFilter: "name" | "role" | "all";
	setSearchFilter: (value: "name" | "role" | "all") => void;
	filteredEmployees: Employee[];
	loadingEmployees: boolean;
	getLocationName: (locationId: string) => string;
	handleEmployeeAssignSubmit: (data: EmployeeData) => void;
	onBack: () => void;
	loading: boolean;
}

export function EmployeeAssignmentStep({
	employeeForm,
	locationData,
	shiftData,
	searchTerm,
	setSearchTerm,
	searchFilter,
	setSearchFilter,
	filteredEmployees,
	loadingEmployees,
	getLocationName,
	handleEmployeeAssignSubmit,
	onBack,
	loading,
}: EmployeeAssignmentStepProps) {
	return (
		<div className="flex-1 flex flex-col">
			{/* Shift summary */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Shift Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<p>
							<strong>Location:</strong>{" "}
							{getLocationName(locationData.locationId)}
						</p>
						<p>
							<strong>Date:</strong>{" "}
							{format(new Date(shiftData.date), "EEEE, MMMM d, yyyy")}
						</p>
						<p>
							<strong>Time:</strong> {shiftData.startTime} - {shiftData.endTime}
						</p>
						{shiftData.notes && (
							<p>
								<strong>Notes:</strong> {shiftData.notes}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			<form
				onSubmit={employeeForm.handleSubmit(handleEmployeeAssignSubmit)}
				className="flex-1 flex flex-col">
				<div className="mb-4">
					<h3 className="font-medium">Assign Employee</h3>
					<p className="text-muted-foreground">
						Select an employee to assign to this shift
					</p>
				</div>

				{/* Search and filter controls */}
				<div className="flex gap-3 mb-4">
					<div className="flex-1">
						<Input
							type="text"
							placeholder="Search employees..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select
						value={searchFilter}
						onValueChange={(value) =>
							setSearchFilter(value as "name" | "role" | "all")
						}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Filter by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Fields</SelectItem>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="role">Role</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Employee list */}
				<div className="flex-1 overflow-y-auto">
					{loadingEmployees ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
							<p>Loading employees...</p>
						</div>
					) : filteredEmployees.length === 0 ? (
						<Card>
							<CardContent className="p-6">
								<h3 className="font-medium">No employees found</h3>
								<p className="text-muted-foreground">
									{searchTerm
										? `No employees match "${searchTerm}"`
										: "There are no employees available"}
								</p>
								{searchTerm && (
									<Button
										variant="link"
										onClick={() => setSearchTerm("")}>
										Clear search
									</Button>
								)}
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{filteredEmployees.map((employee) => (
								<Card
									key={employee.id}
									onClick={() =>
										employeeForm.setValue("employeeId", employee.id)
									}>
									<input
										type="radio"
										id={`employee-${employee.id}`}
										value={employee.id}
										className="sr-only"
										{...employeeForm.register("employeeId")}
									/>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarFallback>
														{employee.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{employee.name}</p>
													{employee.role && (
														<p className="text-muted-foreground">
															{employee.role}
														</p>
													)}
												</div>
											</div>
											{employeeForm.watch("employeeId") === employee.id && (
												<Check className="h-4 w-4" />
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				{/* Create shift without employee option */}
				<div className="mt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => employeeForm.setValue("employeeId", "")}>
						Create shift without assigning an employee
					</Button>
				</div>

				{/* Error message */}
				{employeeForm.formState.errors.employeeId && (
					<p className="text-destructive mt-2">
						{employeeForm.formState.errors.employeeId.message}
					</p>
				)}

				{/* Navigation buttons */}
				<Separator className="my-4" />
				<div className="flex justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button
						type="submit"
						disabled={loading}>
						{loading ? (
							<>
								<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
								Creating...
							</>
						) : (
							"Create Shift"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
