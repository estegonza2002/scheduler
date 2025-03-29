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
import { ChevronRight, ArrowLeft, Edit, Trash, LockIcon } from "lucide-react";
import { ShiftStatus } from "./ShiftStatus";

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
	// Check if shift has ended
	const isShiftCompleted = () => {
		const endTime = new Date(shift.end_time);
		const now = new Date();
		return now > endTime;
	};

	const shiftCompleted = isShiftCompleted();

	return (
		<>
			{/* Header Section */}
			<div className="bg-white rounded-lg shadow-sm border mb-6">
				<div className="border-b p-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-xl font-bold">Shift Details</h1>
								<ShiftStatus shift={shift} />
								{shiftCompleted && (
									<Badge
										variant="outline"
										className="bg-gray-100 text-gray-700">
										<LockIcon className="h-3 w-3 mr-1" />
										Locked
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Badge
									variant={
										assignedEmployeesCount > 0 ? "default" : "destructive"
									}>
									{assignedEmployeesCount > 0
										? `${assignedEmployeesCount} Assigned`
										: "Unassigned"}
								</Badge>
								<p className="text-muted-foreground">
									{format(parseISO(shift.start_time), "EEEE, MMMM d, yyyy")} ·
									{format(parseISO(shift.start_time), "h:mm a")} -{" "}
									{format(parseISO(shift.end_time), "h:mm a")}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 self-end sm:self-auto">
							<Button
								variant="outline"
								size="sm"
								className="h-9"
								asChild>
								<Link
									to={`/daily-shifts?date=${formatDateParam(shift.start_time)}${
										window.location.search.includes("organizationId")
											? "&" + window.location.search.substring(1)
											: ""
									}`}>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Link>
							</Button>

							{!shiftCompleted ? (
								<>
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
													This will permanently delete this shift from the
													schedule. This action cannot be undone.
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
								</>
							) : (
								<>
									<Button
										variant="outline"
										size="sm"
										className="h-9 gap-1"
										disabled>
										<Edit className="h-4 w-4" />
										Edit Shift
									</Button>

									<Button
										variant="outline"
										size="sm"
										className="h-9 text-muted-foreground border-muted/30"
										disabled>
										<Trash className="h-4 w-4 mr-2" /> Delete
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
