import { format, parseISO, differenceInMinutes } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Clock,
	MapPin,
	User,
	Calendar,
	Users,
	CheckCircle2,
	AlertCircle,
	Play,
} from "lucide-react";
import { Shift, Employee } from "@/api";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "./ui/skeleton";

interface ShiftCardProps {
	shift: Shift;
	locationName?: string;
	assignedEmployees?: Employee[];
	showLocationName?: boolean;
	maxDisplayedAvatars?: number;
	isLoading?: boolean;
}

export function ShiftCard({
	shift,
	locationName = "Unassigned",
	assignedEmployees = [],
	showLocationName = true,
	maxDisplayedAvatars = 3,
	isLoading = false,
}: ShiftCardProps) {
	const navigate = useNavigate();

	console.log(
		"[ShiftCard] rendering with shift:",
		shift.id,
		"start_time:",
		shift.start_time,
		"assigned employees:",
		assignedEmployees.length
	);

	// Debug: Log detailed information about each employee
	if (assignedEmployees && assignedEmployees.length > 0) {
		console.log("[ShiftCard] Employee details:");
		assignedEmployees.forEach((emp, index) => {
			console.log(`Employee ${index + 1}:`, {
				id: emp.id,
				name: emp.name,
				email: emp.email,
				keys: Object.keys(emp),
			});
		});
	} else {
		console.log("[ShiftCard] No employees assigned to this shift");
	}

	// Validate the assignedEmployees array is properly defined and has valid entries
	const validAssignedEmployees = Array.isArray(assignedEmployees)
		? assignedEmployees.filter((emp) => {
				const isValid = emp && emp.id && emp.name;
				if (!isValid) {
					console.log("[ShiftCard] Invalid employee data:", emp);
				}
				return isValid;
		  })
		: [];

	console.log(
		"[ShiftCard] Valid assignedEmployees after filtering:",
		validAssignedEmployees.length,
		validAssignedEmployees.map((e) => ({ id: e.id, name: e.name }))
	);

	// Format times for display
	try {
		const startTime = format(parseISO(shift.start_time), "h:mm a");
		const endTime = format(parseISO(shift.end_time), "h:mm a");
		const startDate = format(parseISO(shift.start_time), "MMM d, yyyy");

		// Determine if this is today's shift
		const isToday =
			format(parseISO(shift.start_time), "yyyy-MM-dd") ===
			format(new Date(), "yyyy-MM-dd");

		// Determine if this is tomorrow's shift
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const isTomorrow =
			format(parseISO(shift.start_time), "yyyy-MM-dd") ===
			format(tomorrow, "yyyy-MM-dd");

		// Determine shift status
		const now = new Date();
		const shiftStart = parseISO(shift.start_time);
		const shiftEnd = parseISO(shift.end_time);

		// Calculate actual status based on time
		const calculateTimeBasedStatus = () => {
			if (now < shiftStart) {
				return "scheduled";
			} else if (now >= shiftStart && now <= shiftEnd) {
				return "in-progress";
			} else {
				return "completed";
			}
		};

		// Priority: explicit status values like "canceled" take priority,
		// but for "scheduled" we check if it's actually in progress or completed now
		let status = shift.status || "scheduled";
		const timeBasedStatus = calculateTimeBasedStatus();

		// If the database says "scheduled" but it's actually in progress or completed based on time
		if (status === "scheduled" && timeBasedStatus !== "scheduled") {
			status = timeBasedStatus;
		}

		const isCompleted = status === "completed";

		// Get status badge styling
		const getStatusBadge = () => {
			switch (status) {
				case "in-progress":
					return (
						<Badge
							variant="default"
							className="bg-blue-500 hover:bg-blue-600">
							<Play className="h-3 w-3 mr-1" />
							In Progress
						</Badge>
					);
				case "completed":
					return (
						<Badge
							variant="default"
							className="bg-green-500 hover:bg-green-600">
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Completed
						</Badge>
					);
				case "canceled":
					return (
						<Badge
							variant="default"
							className="bg-red-500 hover:bg-red-600">
							<AlertCircle className="h-3 w-3 mr-1" />
							Canceled
						</Badge>
					);
				case "scheduled":
				default:
					return (
						<Badge
							variant="outline"
							className="bg-blue-50 text-blue-700 border-blue-200">
							Scheduled
						</Badge>
					);
			}
		};

		// Calculate duration
		const durationInMinutes = differenceInMinutes(
			parseISO(shift.end_time),
			parseISO(shift.start_time)
		);
		const hours = Math.floor(durationInMinutes / 60);
		const durationText = `(${hours}h)`;

		// Get first letter of employee name for avatar
		const getInitial = (name: string) => {
			if (!name || typeof name !== "string") {
				return "?";
			}
			return name.charAt(0).toUpperCase();
		};

		return (
			<Card
				className={`cursor-pointer hover:bg-muted/50 transition-all ${
					status === "in-progress" ? "border-l-4 border-l-blue-500" : ""
				}`}
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4 space-y-3">
					{/* Status and Today/Tomorrow Badge */}
					<div className="flex justify-between items-center">
						{getStatusBadge()}

						{(isToday || isTomorrow) && (
							<span
								className={`text-sm font-medium ${
									isToday ? "text-green-600" : "text-amber-600"
								}`}>
								{isToday ? "Today" : "Tomorrow"}
							</span>
						)}
					</div>

					{/* Time information */}
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
						<div className="text-lg font-medium">
							{startTime} - {endTime}{" "}
							<span className="text-sm text-muted-foreground">
								{durationText}
							</span>
						</div>
					</div>

					{/* Date */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4 flex-shrink-0" />
						<span>{startDate}</span>
					</div>

					{/* Status and Assignment */}
					<div className="flex justify-between items-center mt-2">
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							(() => {
								console.log(
									`[ShiftCard] RENDER DECISION for shift ${shift.id}:`
								);
								console.log(
									`[ShiftCard] - Has ${validAssignedEmployees.length} valid employees`
								);
								console.log(
									`[ShiftCard] - Raw assignedEmployees length: ${
										assignedEmployees?.length || 0
									}`
								);

								// Check if we have valid employees
								if (
									validAssignedEmployees &&
									validAssignedEmployees.length > 0
								) {
									console.log(`[ShiftCard] Rendering WITH employees`);
									return (
										<div className="flex items-center">
											<div className="flex -space-x-2">
												{validAssignedEmployees
													.slice(0, maxDisplayedAvatars)
													.map((employee, index) => (
														<Avatar
															key={employee.id || index}
															className="border-2 border-background"
															style={{ zIndex: 10 - index }}>
															<AvatarFallback className="bg-primary/10 text-primary">
																{getInitial(employee.name)}
															</AvatarFallback>
														</Avatar>
													))}
												{validAssignedEmployees.length >
													maxDisplayedAvatars && (
													<Avatar
														className="border-2 border-background"
														style={{ zIndex: 10 - maxDisplayedAvatars }}>
														<AvatarFallback className="bg-muted text-muted-foreground text-xs">
															+
															{validAssignedEmployees.length -
																maxDisplayedAvatars}
														</AvatarFallback>
													</Avatar>
												)}
											</div>
											<div className="ml-2 flex items-center text-sm text-muted-foreground">
												<Users className="h-4 w-4 mr-1" />
												<span>{validAssignedEmployees.length}</span>
											</div>
										</div>
									);
								}

								console.log(`[ShiftCard] Rendering as UNASSIGNED`);
								return (
									<div className="flex items-center">
										<Avatar className="border-2 border-background">
											<AvatarFallback className="bg-muted">
												<User className="h-4 w-4 text-muted-foreground" />
											</AvatarFallback>
										</Avatar>
										<span className="ml-2 text-sm text-muted-foreground">
											Unassigned
										</span>
									</div>
								);
							})()
						)}

						{showLocationName && (
							<div className="flex items-center text-sm text-muted-foreground">
								<MapPin className="h-4 w-4 mr-1" />
								<span>{locationName}</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		);
	} catch (error) {
		console.error("Error in ShiftCard:", error);
		return (
			<Card className="cursor-pointer hover:bg-muted/50 transition-all">
				<CardContent className="p-4">
					<div className="text-sm text-muted-foreground">
						Error rendering shift
					</div>
				</CardContent>
			</Card>
		);
	}
}
