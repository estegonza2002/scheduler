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
		"ShiftCard rendering with shift:",
		shift,
		"and employees:",
		assignedEmployees
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

		// Get status badge styling
		const getStatusBadge = () => {
			switch (status) {
				case "in-progress":
					return (
						<Badge className="bg-blue-500 hover:bg-blue-600 text-white">
							<Play className="h-3 w-3 mr-1" />
							In Progress
						</Badge>
					);
				case "completed":
					return (
						<Badge className="bg-green-500 hover:bg-green-600 text-white">
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Completed
						</Badge>
					);
				case "canceled":
					return (
						<Badge className="bg-red-500 hover:bg-red-600 text-white">
							<AlertCircle className="h-3 w-3 mr-1" />
							Canceled
						</Badge>
					);
				case "scheduled":
				default:
					return (
						<Badge
							variant="outline"
							className="bg-blue-50 text-blue-700 border border-blue-200">
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
			return name.charAt(0).toUpperCase();
		};

		return (
			<Card
				className={`cursor-pointer hover:bg-muted/50 transition-all ${
					status === "in-progress" ? "border-l-4 border-l-blue-500" : ""
				}`}
				onClick={() => navigate(`/shifts/${shift.id}`)}>
				<CardContent className="p-4">
					<div className="space-y-3">
						{/* Status and Today/Tomorrow Badge */}
						<div className="flex justify-between items-center mb-1">
							{getStatusBadge()}

							<div className="flex items-center gap-1">
								{isToday && (
									<Badge className="bg-green-500 hover:bg-green-600">
										Today
									</Badge>
								)}

								{isTomorrow && (
									<Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
										Tomorrow
									</Badge>
								)}
							</div>
						</div>

						{/* Time information */}
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
							<div>
								<div className="text-lg font-medium">
									{startTime} - {endTime}{" "}
									<span className="text-sm text-muted-foreground">
										{durationText}
									</span>
								</div>
							</div>
						</div>

						{/* Date */}
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4 flex-shrink-0" />
							<span>{startDate}</span>
						</div>

						{/* Status and Assignment */}
						<div className="flex justify-between items-center mt-2">
							<div className="flex items-center">
								{isLoading ? (
									<div className="flex items-center">
										<div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-sm animate-pulse">
											<Users className="h-4 w-4 text-primary" />
										</div>
										<span className="ml-2 text-sm text-muted-foreground animate-pulse">
											Loading assignments...
										</span>
									</div>
								) : assignedEmployees.length > 0 ? (
									<div className="flex items-center">
										<div className="flex -space-x-2">
											{assignedEmployees
												.slice(0, maxDisplayedAvatars)
												.map((employee, index) => (
													<div
														key={employee.id || index}
														className="h-8 w-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-sm font-medium text-primary"
														style={{ zIndex: 10 - index }}>
														{getInitial(employee.name)}
													</div>
												))}
											{assignedEmployees.length > maxDisplayedAvatars && (
												<div
													className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
													style={{ zIndex: 10 - maxDisplayedAvatars }}>
													+{assignedEmployees.length - maxDisplayedAvatars}
												</div>
											)}
										</div>
										<div className="ml-2 flex items-center text-sm text-muted-foreground">
											<Users className="h-4 w-4 mr-1" />
											<span>{assignedEmployees.length}</span>
										</div>
									</div>
								) : (
									<div className="flex items-center">
										<div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
											<User className="h-4 w-4 text-gray-400" />
										</div>
										<span className="ml-2 text-sm text-muted-foreground">
											Unassigned
										</span>
									</div>
								)}
							</div>

							{showLocationName && (
								<div className="flex items-center text-sm text-muted-foreground">
									<MapPin className="h-4 w-4 mr-1" />
									<span>{locationName}</span>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	} catch (error) {
		console.error("Error in ShiftCard:", error);
		return (
			<Card className="cursor-pointer hover:bg-muted/50 transition-all">
				<CardContent className="p-4">
					<div className="space-y-3">
						{/* Status and Today/Tomorrow Badge */}
						<div className="flex justify-between items-center mb-1">
							<Badge className="bg-red-500 hover:bg-red-600 text-white">
								Error
							</Badge>
						</div>

						{/* Time information */}
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
							<div>
								<div className="text-lg font-medium">
									Error parsing shift data
								</div>
							</div>
						</div>

						{/* Date */}
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4 flex-shrink-0" />
							<span>Error</span>
						</div>

						{/* Status and Assignment */}
						<div className="flex justify-between items-center mt-2">
							<div className="flex items-center">
								<div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
									<User className="h-4 w-4 text-gray-400" />
								</div>
								<span className="ml-2 text-sm text-muted-foreground">
									Error
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}
}
