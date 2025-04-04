import { Employee } from "@/api";
import {
	Mail,
	Phone,
	ExternalLink,
	Building2,
	Check,
	MapPin,
	Calendar,
	DollarSign,
	UserMinus,
	Clock,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { ReactNode, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { AssignedEmployee } from "@/types/shift-types";
import { calculateEmployeeCost } from "@/utils/time-calculations";
import { ShiftEmployeeDetailDialog } from "./shift/ShiftEmployeeDetailDialog";

export interface EmployeeCardProps {
	employee: Employee | AssignedEmployee;
	selected?: boolean;
	onSelect?: () => void;
	selectable?: boolean;
	selectionMode?: "checkbox" | "highlight" | "checkmark";
	locationCount?: number;
	showLocationBadge?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "compact" | "standard" | "detailed" | "profile" | "shift";
	onViewDetails?: () => void;
	showActions?: boolean;
	actions?: ReactNode;
	topLeftLabel?: string;
	bottomRightContent?: ReactNode;
	hideStatus?: boolean;
	checkboxPosition?: "left" | "right";
	// Shift-specific props
	shiftStartTime?: string;
	shiftEndTime?: string;
	onRemove?: (employeeId: string, assignmentId: string) => void;
	isCompleted?: boolean;
}

export function EmployeeCard({
	employee,
	selected = false,
	onSelect,
	selectable = false,
	selectionMode = "checkmark",
	locationCount = 0,
	showLocationBadge = false,
	className,
	size = "md",
	variant = "standard",
	onViewDetails,
	showActions = false,
	actions,
	topLeftLabel,
	bottomRightContent,
	hideStatus = false,
	checkboxPosition = "right",
	// Shift-specific props
	shiftStartTime,
	shiftEndTime,
	onRemove,
	isCompleted = false,
}: EmployeeCardProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);

	// Determine avatar size based on the size prop
	const avatarSizes = {
		sm: "h-12 w-12",
		md: "h-16 w-16",
		lg: "h-20 w-20",
	};

	const avatarSize = avatarSizes[size];

	// Generate avatar initials from employee name
	const initials = employee.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	// Format phone number to display in a readable format
	const formatPhoneNumber = (phone?: string) => {
		if (!phone) return "";
		// Basic formatting for US phone numbers
		const cleaned = phone.replace(/\D/g, "");
		if (cleaned.length === 10) {
			return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(
				3,
				6
			)}-${cleaned.substring(6, 10)}`;
		} else if (cleaned.length === 11 && cleaned.startsWith("1")) {
			return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(
				4,
				7
			)}-${cleaned.substring(7, 11)}`;
		}
		return phone; // Return as is if not standard format
	};

	// Calculate shift cost if in shift variant
	const cost =
		variant === "shift" && shiftStartTime && shiftEndTime
			? calculateEmployeeCost(
					shiftStartTime,
					shiftEndTime,
					employee as AssignedEmployee
			  )
			: undefined;

	// Formatted employee name
	const formattedName = employee.name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

	// Status text class based on employee status
	const getStatusTextClass = () => {
		if (!employee.status || hideStatus) return "";

		return cn(
			"text-xs",
			employee.status === "active"
				? "text-green-600"
				: employee.status === "invited"
				? "text-blue-600"
				: "text-gray-600"
		);
	};

	// Selection classes for card
	const getSelectionClasses = () => {
		if (!selectable && !selected) return "";

		if (selectionMode === "highlight") {
			return selected
				? "bg-primary/10 border-primary shadow-sm"
				: selectable
				? "cursor-pointer hover:bg-accent/50 hover:border-accent"
				: "";
		}

		return selected
			? "border-primary shadow-sm"
			: selectable
			? "cursor-pointer hover:border-primary/50"
			: "";
	};

	// Handle card click event
	const handleCardClick = (e: React.MouseEvent) => {
		if (onSelect && (selectable || selected)) {
			e.stopPropagation();
			onSelect();
		}
	};

	// Profile variant
	if (variant === "profile") {
		return (
			<Card className={cn("overflow-hidden", className)}>
				<CardContent className="p-0">
					{employee.status && !hideStatus && (
						<span
							className={cn(
								getStatusTextClass(),
								"absolute top-3 right-3 z-10 text-right"
							)}>
							{employee.status.charAt(0).toUpperCase() +
								employee.status.slice(1)}
						</span>
					)}

					<div className="p-6 flex flex-col items-center text-center">
						<div className="relative mb-4">
							<Avatar className={avatarSizes.lg}>
								<AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
									{initials}
								</AvatarFallback>
							</Avatar>
							{!hideStatus && (
								<span
									className={cn(
										"absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white z-10",
										employee.isOnline
											? "bg-green-500 animate-pulse"
											: "bg-gray-400"
									)}></span>
							)}
						</div>

						<h3 className="font-medium text-sm">{formattedName}</h3>

						{employee.position && (
							<span className="text-sm text-muted-foreground whitespace-nowrap truncate">
								{employee.position || "Employee"}
							</span>
						)}

						{employee.status === "invited" && (
							<Badge
								variant="secondary"
								className="mt-3 bg-red-100 text-red-800 hover:bg-red-100">
								Pending Signup
							</Badge>
						)}
					</div>

					<Separator />

					<div className="p-6">
						<h3 className="text-lg font-medium mb-4">Contact Information</h3>

						<div className="space-y-4">
							{employee.email && (
								<div className="flex items-start gap-3">
									<Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Email</p>
										<p className="text-sm font-medium break-all">
											{employee.email}
										</p>
									</div>
								</div>
							)}

							{employee.phone && (
								<div className="flex items-start gap-3">
									<Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Phone</p>
										<p className="text-sm font-medium">
											{formatPhoneNumber(employee.phone)}
										</p>
									</div>
								</div>
							)}

							{employee.address && (
								<div className="flex items-start gap-3">
									<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Address</p>
										<p className="text-sm font-medium">{employee.address}</p>
									</div>
								</div>
							)}

							{employee.hireDate && (
								<div className="flex items-start gap-3">
									<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Hire Date</p>
										<p className="text-sm font-medium">{employee.hireDate}</p>
									</div>
								</div>
							)}

							{employee.hourlyRate !== undefined && (
								<div className="flex items-start gap-3">
									<DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Hourly Rate</p>
										<p className="text-sm font-medium">
											${employee.hourlyRate}/hr
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</CardContent>

				{actions && (
					<CardFooter className="px-6 py-4 flex justify-center">
						{actions}
					</CardFooter>
				)}
			</Card>
		);
	}

	// Compact variant
	if (variant === "compact") {
		return (
			<Card
				onClick={handleCardClick}
				className={cn(
					"p-3 flex flex-col items-center text-center transition-all relative",
					getSelectionClasses(),
					className
				)}>
				{employee.status && !hideStatus && (
					<span
						className={cn(
							getStatusTextClass(),
							"absolute top-2 right-2 text-right"
						)}>
						{employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
					</span>
				)}

				{topLeftLabel && (
					<span className="absolute top-0 left-0 px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded-br-md">
						{topLeftLabel}
					</span>
				)}

				{selectionMode === "checkbox" && (
					<Checkbox
						checked={selected}
						onCheckedChange={() => onSelect && onSelect()}
						onClick={(e) => e.stopPropagation()}
						className={cn(
							"h-4 w-4 absolute top-2 z-10",
							checkboxPosition === "left" ? "left-2" : "right-2"
						)}
					/>
				)}

				<div className="relative mb-4">
					<Avatar className={avatarSize}>
						<AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					{!hideStatus && (
						<span
							className={cn(
								"absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white z-10",
								employee.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
							)}></span>
					)}
				</div>

				<h3 className="font-medium text-sm">{formattedName}</h3>

				{employee.position && (
					<span className="text-sm text-muted-foreground whitespace-nowrap truncate">
						{employee.position || "Employee"}
					</span>
				)}

				{showActions && actions && <div className="mt-2 w-full">{actions}</div>}

				{bottomRightContent && (
					<div className="absolute bottom-0 right-0 p-2 bg-white/80 rounded-tl-md text-sm font-medium">
						{bottomRightContent}
					</div>
				)}
			</Card>
		);
	}

	// Shift variant
	if (variant === "shift") {
		// Calculate estimated cost based on scheduled times
		const estimatedCost = cost || "--";

		// For completed shifts, add a simulated actual cost with a small variance
		// In production, this would come from actual clock-in/out data
		const getActualCost = () => {
			if (!cost || cost === "0.00" || cost === "--") return "--";

			const estimatedCostNumber = parseFloat(cost);
			const variance = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.15);
			const actualCost = estimatedCostNumber * (1 + variance);

			return actualCost.toFixed(2);
		};

		// Only calculate actual cost if the shift has ended
		const actualCost = isCompleted ? getActualCost() : "--";

		// Calculate actual hours with a small variance for completed shifts
		const getActualHours = () => {
			if (!shiftStartTime || !shiftEndTime) return "--";

			const startDate = new Date(shiftStartTime);
			const endDate = new Date(shiftEndTime);
			const scheduledHours =
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

			// Add a small random variance
			const variance = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.25);
			const actualHours = scheduledHours + variance;

			return actualHours.toFixed(2);
		};

		const actualHours = isCompleted ? getActualHours() : "--";
		const scheduledHours =
			shiftStartTime && shiftEndTime
				? (
						(new Date(shiftEndTime).getTime() -
							new Date(shiftStartTime).getTime()) /
						(1000 * 60 * 60)
				  ).toFixed(2)
				: "--";

		// Handle card click for completed shifts
		const handleCardClick = () => {
			if (isCompleted) {
				setDetailsOpen(true);
			}
		};

		return (
			<>
				<Card
					className={cn(
						"relative overflow-hidden group h-full transition-all hover:border-primary/50 hover:shadow-sm",
						isCompleted && "opacity-90 cursor-pointer",
						className
					)}
					onClick={handleCardClick}>
					<CardContent className="p-4">
						<div className="flex flex-col items-center text-center mb-4">
							<div className="relative">
								<Avatar className={avatarSize}>
									<AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
										{initials}
									</AvatarFallback>
								</Avatar>
								{!hideStatus && (
									<span
										className={cn(
											"absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white z-10",
											employee.isOnline
												? "bg-green-500 animate-pulse"
												: "bg-gray-400"
										)}></span>
								)}
							</div>

							<h3 className="font-medium text-sm">{formattedName}</h3>

							{employee.position && (
								<span className="text-sm text-muted-foreground whitespace-nowrap truncate">
									{employee.position || "Employee"}
								</span>
							)}
						</div>

						<div className="space-y-2">
							{/* Hourly Rate Row */}
							<div className="bg-muted/30 rounded-md p-2 flex justify-between items-center">
								<div className="flex items-center text-xs text-muted-foreground">
									<DollarSign className="h-3 w-3 mr-1" />
									Hourly Rate
								</div>
								<div className="font-medium text-sm">
									{employee.hourlyRate
										? `$${employee.hourlyRate.toFixed(2)}/hr`
										: "--"}
								</div>
							</div>

							{/* Scheduled Hours Row */}
							<div className="bg-muted/30 rounded-md p-2 flex justify-between items-center">
								<div className="flex items-center text-xs text-muted-foreground">
									<Clock className="h-3 w-3 mr-1" />
									Scheduled Hours
								</div>
								<div className="font-medium text-sm">
									{scheduledHours !== "--" ? `${scheduledHours}h` : "--"}
								</div>
							</div>

							{/* Actual Hours Row (for completed shifts) */}
							{isCompleted && (
								<div className="bg-green-50 rounded-md p-2 flex justify-between items-center">
									<div className="flex items-center text-xs text-green-700">
										<Clock className="h-3 w-3 mr-1" />
										Actual Hours
									</div>
									<div className="font-medium text-sm text-green-700">
										{actualHours !== "--" ? `${actualHours}h` : "--"}
									</div>
								</div>
							)}

							{/* Estimated Cost Row */}
							<div className="bg-amber-50 rounded-md p-2 flex justify-between items-center">
								<div className="flex items-center text-xs text-amber-700">
									<DollarSign className="h-3 w-3 mr-1" />
									Est. Cost
								</div>
								<div className="font-medium text-sm text-amber-700">
									{estimatedCost !== "--" ? `$${estimatedCost}` : "--"}
								</div>
							</div>

							{/* Actual Cost Row (for completed shifts) */}
							{isCompleted && (
								<div className="bg-green-50 rounded-md p-2 flex justify-between items-center">
									<div className="flex items-center text-xs text-green-700">
										<DollarSign className="h-3 w-3 mr-1" />
										Actual Cost
									</div>
									<div className="font-medium text-sm text-green-700">
										{actualCost !== "--" ? `$${actualCost}` : "--"}
									</div>
								</div>
							)}
						</div>
					</CardContent>

					{!isCompleted && onRemove && "assignmentId" in employee && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 backdrop-blur-sm rounded-md p-0.5 shadow-sm"
							onClick={(e) => {
								e.stopPropagation();
								onRemove(employee.id, employee.assignmentId);
							}}>
							<UserMinus className="h-3.5 w-3.5 mr-1" />
							Remove
						</Button>
					)}

					{isCompleted && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
							<Badge
								variant="secondary"
								className="bg-white shadow-sm">
								View Details
							</Badge>
						</div>
					)}
				</Card>

				{/* Employee Shift Details Dialog */}
				{isCompleted &&
					"assignmentId" in employee &&
					shiftStartTime &&
					shiftEndTime && (
						<ShiftEmployeeDetailDialog
							employee={employee as AssignedEmployee}
							shiftStartTime={shiftStartTime}
							shiftEndTime={shiftEndTime}
							isCompleted={isCompleted}
							open={detailsOpen}
							onOpenChange={setDetailsOpen}
						/>
					)}
			</>
		);
	}

	// Standard variant
	return (
		<Card
			className={cn(
				"overflow-hidden transition-all relative",
				selectionMode === "highlight"
					? selected
						? "bg-primary/5 border-primary"
						: selectable
						? "hover:bg-accent/5 hover:border-accent"
						: ""
					: selected
					? "border-primary"
					: selectable
					? "hover:border-primary/50"
					: "",
				(selectable || onSelect) && "cursor-pointer",
				className
			)}
			onClick={handleCardClick}>
			{employee.status && !hideStatus && (
				<span
					className={cn(
						getStatusTextClass(),
						"absolute top-3 right-3 z-10 text-right"
					)}>
					{employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
				</span>
			)}

			{topLeftLabel && (
				<span className="absolute top-0 left-0 px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded-br-md z-10">
					{topLeftLabel}
				</span>
			)}

			{selectionMode === "checkbox" ? (
				<Checkbox
					checked={selected}
					onCheckedChange={() => onSelect && onSelect()}
					onClick={(e) => e.stopPropagation()}
					className={cn(
						"h-4 w-4 absolute top-3 z-10",
						checkboxPosition === "left" ? "left-3" : "right-3"
					)}
				/>
			) : (
				selected && (
					<span
						className={cn(
							"absolute -top-1 z-10 flex items-center justify-center",
							checkboxPosition === "left" ? "-left-1" : "-right-1",
							"bg-primary text-white rounded-full p-1"
						)}>
						<Check className="h-3 w-3" />
					</span>
				)
			)}

			<CardContent
				className={cn("p-0", variant === "detailed" ? "pt-4" : "pt-4 pb-0")}>
				<div className="flex flex-col items-center">
					<div className="relative mb-4">
						<Avatar className={avatarSize}>
							<AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						{!hideStatus && (
							<span
								className={cn(
									"absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white z-10",
									employee.isOnline
										? "bg-green-500 animate-pulse"
										: "bg-gray-400"
								)}></span>
						)}
					</div>

					<h3 className="font-medium text-sm">{formattedName}</h3>

					{employee.position && (
						<span className="text-sm text-muted-foreground whitespace-nowrap truncate">
							{employee.position || "Employee"}
						</span>
					)}

					{showLocationBadge && locationCount > 0 && (
						<Badge
							variant="outline"
							className="text-xs py-0.5 px-2 bg-accent/30 flex items-center justify-center gap-1 mt-2 mb-3">
							<Building2 className="h-3 w-3" />
							{locationCount} {locationCount === 1 ? "location" : "locations"}
						</Badge>
					)}
				</div>

				{variant === "detailed" && (
					<div className="pt-2 px-3 pb-3 mt-1 border-t border-border">
						{employee.email && (
							<div className="flex items-center text-xs py-1.5">
								<Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
								<span className="truncate">{employee.email}</span>
							</div>
						)}
						{employee.phone && (
							<div className="flex items-center text-xs py-1.5">
								<Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
								<span>{formatPhoneNumber(employee.phone)}</span>
							</div>
						)}
						{employee.hourlyRate !== undefined && (
							<div className="text-xs py-1.5 flex items-center">
								<span className="font-medium">Rate:</span>
								<span className="ml-1">
									${employee.hourlyRate.toFixed(2)}/hr
								</span>
							</div>
						)}
					</div>
				)}
			</CardContent>

			{(showActions || onViewDetails || actions) && (
				<CardFooter className="p-3 pt-0 flex justify-center flex-wrap gap-2">
					{onViewDetails && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs h-8"
							onClick={(e) => {
								e.stopPropagation();
								onViewDetails();
							}}>
							<ExternalLink className="h-3.5 w-3.5 mr-1.5" />
							View Details
						</Button>
					)}
					{actions}
				</CardFooter>
			)}

			{bottomRightContent && (
				<div className="absolute bottom-0 right-0 p-2 bg-white/80 rounded-tl-md text-sm font-medium">
					{bottomRightContent}
				</div>
			)}
		</Card>
	);
}
