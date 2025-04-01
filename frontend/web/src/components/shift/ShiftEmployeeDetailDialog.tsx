import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import {
	DollarSign,
	Clock,
	User,
	ArrowUpRight,
	CheckCircle,
	XCircle,
	CalendarClock,
	ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AssignedEmployee } from "@/types/shift-types";
import { calculateEmployeeCost } from "@/utils/time-calculations";

interface ShiftEmployeeDetailDialogProps {
	employee: AssignedEmployee;
	shiftStartTime: string;
	shiftEndTime: string;
	isCompleted: boolean;
	trigger?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ShiftEmployeeDetailDialog({
	employee,
	shiftStartTime,
	shiftEndTime,
	isCompleted,
	trigger,
	open,
	onOpenChange,
}: ShiftEmployeeDetailDialogProps) {
	// Generate employee initials for avatar
	const initials = employee.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	// Calculate shift details
	const startDate = new Date(shiftStartTime);
	const endDate = new Date(shiftEndTime);
	const scheduledHours = (
		(endDate.getTime() - startDate.getTime()) /
		(1000 * 60 * 60)
	).toFixed(2);

	// Calculate costs
	const estimatedCost = calculateEmployeeCost(
		shiftStartTime,
		shiftEndTime,
		employee
	);

	// For completed shifts, simulate actual values with variance
	// In a real app, these would come from clock-in/out data
	const getActualHours = () => {
		if (!isCompleted) return scheduledHours;

		const scheduledHoursNum = parseFloat(scheduledHours);
		const variance = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.25);
		const actualHours = scheduledHoursNum + variance;

		return actualHours.toFixed(2);
	};

	const getActualCost = () => {
		if (!isCompleted) return estimatedCost;

		const estimatedCostNum = parseFloat(estimatedCost);
		const variance = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.15);
		const actualCost = estimatedCostNum * (1 + variance);

		return actualCost.toFixed(2);
	};

	const actualHours = getActualHours();
	const actualCost = getActualCost();

	// Simulate some shift activities (in a real app, these would come from a database)
	const activities = [
		{
			time: new Date(startDate.getTime() + 5 * 60000), // 5 minutes after start
			description: "Employee clocked in",
			type: "clock-in",
		},
		{
			time: new Date(startDate.getTime() + 15 * 60000), // 15 minutes after start
			description: "Completed opening checklist",
			type: "checklist",
		},
		{
			time: new Date(startDate.getTime() + 120 * 60000), // 2 hours after start
			description: "Break started",
			type: "break-start",
		},
		{
			time: new Date(startDate.getTime() + 150 * 60000), // 2.5 hours after start
			description: "Break ended",
			type: "break-end",
		},
		{
			time: new Date(endDate.getTime() - 15 * 60000), // 15 minutes before end
			description: "Completed closing checklist",
			type: "checklist",
		},
		{
			time: new Date(endDate.getTime() + 5 * 60000), // 5 minutes after end
			description: "Employee clocked out",
			type: "clock-out",
		},
	];

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5 text-primary" />
						Employee Shift Details
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="flex-1 -mx-6 px-6">
					<div className="space-y-6 py-4">
						{/* Employee Header */}
						<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
							<Avatar className="h-16 w-16">
								<AvatarFallback className="text-lg bg-primary/10 text-primary">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div>
								<h2 className="text-xl font-semibold">{employee.name}</h2>
								<p className="text-muted-foreground">
									{employee.position || "Employee"}
								</p>
								{employee.hourlyRate !== undefined && (
									<div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
										<DollarSign className="h-3.5 w-3.5" />
										<span>${employee.hourlyRate.toFixed(2)}/hr</span>
									</div>
								)}
							</div>
						</div>

						{/* Shift Info */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base flex items-center gap-2">
									<CalendarClock className="h-4 w-4 text-muted-foreground" />
									Shift Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">Date:</span>
										<span className="font-medium">
											{format(parseISO(shiftStartTime), "EEEE, MMMM d, yyyy")}
										</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">
											Scheduled Time:
										</span>
										<span className="font-medium">
											{format(parseISO(shiftStartTime), "h:mm a")} -{" "}
											{format(parseISO(shiftEndTime), "h:mm a")}
										</span>
									</div>
									<Separator className="my-2" />
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">
											Scheduled Hours:
										</span>
										<span className="font-medium">{scheduledHours}h</span>
									</div>
									{isCompleted && (
										<div className="flex justify-between items-center text-sm">
											<span className="text-muted-foreground">
												Actual Hours:
											</span>
											<span className="font-medium text-green-600">
												{actualHours}h
											</span>
										</div>
									)}
									<Separator className="my-2" />
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">
											Estimated Cost:
										</span>
										<span className="font-medium">${estimatedCost}</span>
									</div>
									{isCompleted && (
										<div className="flex justify-between items-center text-sm">
											<span className="text-muted-foreground">
												Actual Cost:
											</span>
											<span className="font-medium text-green-600">
												${actualCost}
											</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Activity Timeline */}
						{isCompleted && (
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base flex items-center gap-2">
										<ClipboardCheck className="h-4 w-4 text-muted-foreground" />
										Shift Activity Timeline
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{activities.map((activity, index) => (
											<div
												key={index}
												className="relative pl-6 pb-4 last:pb-0">
												{/* Timeline connector */}
												{index < activities.length - 1 && (
													<div className="absolute top-6 bottom-0 left-[9px] w-[2px] bg-muted-foreground/20" />
												)}

												{/* Activity dot */}
												<div
													className={cn(
														"absolute left-0 top-1 h-[18px] w-[18px] rounded-full border-2 border-background flex items-center justify-center",
														activity.type === "clock-in" ||
															activity.type === "clock-out"
															? "bg-blue-100"
															: activity.type.includes("break")
															? "bg-amber-100"
															: "bg-green-100"
													)}>
													{activity.type === "clock-in" && (
														<ArrowUpRight className="h-3 w-3 text-blue-600" />
													)}
													{activity.type === "clock-out" && (
														<ArrowUpRight className="h-3 w-3 text-blue-600 rotate-180" />
													)}
													{activity.type === "checklist" && (
														<CheckCircle className="h-3 w-3 text-green-600" />
													)}
													{activity.type === "break-start" && (
														<Clock className="h-3 w-3 text-amber-600" />
													)}
													{activity.type === "break-end" && (
														<Clock className="h-3 w-3 text-amber-600" />
													)}
												</div>

												{/* Activity content */}
												<div>
													<p className="text-sm font-medium">
														{activity.description}
													</p>
													<p className="text-xs text-muted-foreground">
														{format(activity.time, "h:mm a")}
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
