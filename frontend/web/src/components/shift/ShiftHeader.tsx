import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Shift } from "../../api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { ChevronRight, ArrowLeft, Edit, Trash } from "lucide-react";

interface ShiftHeaderProps {
	shift: Shift;
	assignedEmployeesCount: number;
	onDeleteClick: () => void;
	onEditClick: () => void;
	deleteAlertOpen: boolean;
	setDeleteAlertOpen: (open: boolean) => void;
	formatDateParam: (date: string) => string;
}

export function ShiftHeader({
	shift,
	assignedEmployeesCount,
	onDeleteClick,
	onEditClick,
	deleteAlertOpen,
	setDeleteAlertOpen,
	formatDateParam,
}: ShiftHeaderProps) {
	return (
		<>
			{/* Breadcrumb Navigation */}
			<div className="flex items-center text-sm text-muted-foreground mb-4">
				<Link
					to="/schedule"
					className="hover:text-foreground">
					Schedule
				</Link>
				<ChevronRight className="h-4 w-4 mx-1" />
				<Link
					to={`/daily-shifts?date=${formatDateParam(shift.startTime)}${
						window.location.search.includes("organizationId")
							? "&" + window.location.search.substring(1)
							: ""
					}`}
					className="hover:text-foreground">
					{format(parseISO(shift.startTime), "MMMM d, yyyy")}
				</Link>
				<ChevronRight className="h-4 w-4 mx-1" />
				<span className="text-foreground font-medium">Shift Details</span>
			</div>

			{/* Header Section */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="border-b p-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h1 className="text-xl font-bold flex items-center">
								Shift Details
								<Badge
									className="ml-2"
									variant={
										assignedEmployeesCount > 0 ? "default" : "destructive"
									}>
									{assignedEmployeesCount > 0
										? `${assignedEmployeesCount} Assigned`
										: "Unassigned"}
								</Badge>
							</h1>
							<p className="text-muted-foreground mt-1">
								{format(parseISO(shift.startTime), "EEEE, MMMM d, yyyy")} ·
								{format(parseISO(shift.startTime), "h:mm a")} -{" "}
								{format(parseISO(shift.endTime), "h:mm a")}
							</p>
						</div>

						<div className="flex items-center gap-2 self-end sm:self-auto">
							<Button
								variant="outline"
								size="sm"
								className="h-9"
								asChild>
								<Link
									to={`/daily-shifts?date=${formatDateParam(shift.startTime)}${
										window.location.search.includes("organizationId")
											? "&" + window.location.search.substring(1)
											: ""
									}`}>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Link>
							</Button>

							<Button
								variant="outline"
								size="sm"
								className="h-9 gap-1"
								onClick={onEditClick}>
								<Edit className="h-4 w-4" />
								Edit Shift
							</Button>

							<AlertDialog
								open={deleteAlertOpen}
								onOpenChange={(open) => setDeleteAlertOpen(open)}>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="h-9 text-destructive border-destructive/30">
										<Trash className="h-4 w-4 mr-2" /> Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This will permanently delete this shift from the schedule.
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={onDeleteClick}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
