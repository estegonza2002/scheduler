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
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { ReactNode } from "react";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";

export interface EmployeeCardProps {
	employee: Employee;
	selected?: boolean;
	onSelect?: () => void;
	selectable?: boolean;
	selectionMode?: "checkbox" | "highlight" | "checkmark";
	locationCount?: number;
	showLocationBadge?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "compact" | "standard" | "detailed" | "profile";
	onViewDetails?: () => void;
	showActions?: boolean;
	actions?: ReactNode;
	topLeftLabel?: string;
	bottomRightContent?: ReactNode;
	hideStatus?: boolean;
	checkboxPosition?: "left" | "right";
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
}: EmployeeCardProps) {
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

	// Location count badge
	const LocationBadge = () => (
		<Badge
			variant="outline"
			className="text-xs py-0.5 px-2 bg-accent/30 flex items-center justify-center gap-1">
			<Building2 className="h-3 w-3" />
			{locationCount} {locationCount === 1 ? "location" : "locations"}
		</Badge>
	);

	// Status indicator as simple text instead of a badge
	const StatusText = () => {
		if (!employee.status || hideStatus) return null;
		return (
			<span
				className={cn(
					"text-xs",
					employee.status === "active"
						? "text-green-600"
						: employee.status === "invited"
						? "text-blue-600"
						: "text-gray-600"
				)}>
				{employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
			</span>
		);
	};

	// Selection indicator
	const SelectionIndicator = () => {
		if (!selected) return null;

		if (selectionMode === "checkbox") {
			return (
				<div
					className={`absolute -top-1 ${
						checkboxPosition === "left" ? "-left-1" : "-right-1"
					} h-5 w-5 bg-primary text-primary-foreground rounded-sm flex items-center justify-center`}>
					<Check className="h-3 w-3" />
				</div>
			);
		}

		return (
			<div
				className={`absolute -top-1 ${
					checkboxPosition === "left" ? "-left-1" : "-right-1"
				} bg-primary text-white rounded-full p-1`}>
				<Check className="h-3 w-3" />
			</div>
		);
	};

	// Checkbox selection component
	const CheckboxSelection = () => {
		if (selectionMode !== "checkbox" || !selectable) return null;

		return (
			<div
				className={`absolute top-2 ${
					checkboxPosition === "left" ? "left-2" : "right-2"
				} z-10`}>
				<Checkbox
					checked={selected}
					onCheckedChange={() => onSelect && onSelect()}
					onClick={(e) => e.stopPropagation()}
					className="h-4 w-4"
				/>
			</div>
		);
	};

	// Determine selection-related classes
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

	// Handle click event
	const handleCardClick = (e: React.MouseEvent) => {
		if (onSelect && (selectable || selected)) {
			e.stopPropagation();
			onSelect();
		}
	};

	// Profile variant - combines employee info and contact details in one card
	if (variant === "profile") {
		return (
			<Card className={cn("overflow-hidden", className)}>
				<CardContent className="p-0">
					{/* Status text in top right */}
					{employee.status && !hideStatus && (
						<div className="absolute top-3 right-3 z-10 text-right">
							<StatusText />
						</div>
					)}

					{/* Top section with avatar and name */}
					<div className="p-6 flex flex-col items-center text-center">
						<Avatar className={avatarSizes.lg}>
							<AvatarFallback className="text-xl font-medium">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="mt-4 space-y-1">
							<h2 className="text-xl font-semibold">{employee.name}</h2>
							<p className="text-muted-foreground">
								{employee.role || "Employee"}
							</p>
						</div>

						{employee.status === "invited" && (
							<Badge
								variant="secondary"
								className="mt-3 bg-red-100 text-red-800 hover:bg-red-100">
								Pending Signup
							</Badge>
						)}
					</div>

					<Separator />

					{/* Contact information section */}
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

				{/* Only show actions if provided */}
				{actions && (
					<CardFooter className="px-6 py-4 flex justify-center">
						{actions}
					</CardFooter>
				)}
			</Card>
		);
	}

	// Compact variant (similar to original but more minimal)
	if (variant === "compact") {
		return (
			<div
				onClick={handleCardClick}
				className={cn(
					"border rounded-md p-3 flex flex-col items-center text-center transition-all relative",
					getSelectionClasses(),
					className
				)}>
				{/* Status text in top right */}
				{employee.status && !hideStatus && (
					<div className="absolute top-2 right-2 text-right">
						<StatusText />
					</div>
				)}

				{/* Top left label (e.g., role in shift) */}
				{topLeftLabel && (
					<div className="absolute top-0 left-0 px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded-br-md">
						{topLeftLabel}
					</div>
				)}

				{/* Checkbox for selection */}
				{selectionMode === "checkbox" && <CheckboxSelection />}

				<div className="relative mb-2 mt-2">
					<Avatar className={avatarSize}>
						<AvatarFallback className="text-lg">{initials}</AvatarFallback>
					</Avatar>
					{(selected || selectable) && selectionMode !== "checkbox" && (
						<SelectionIndicator />
					)}
				</div>
				<div className="w-full">
					<div className="font-medium text-sm truncate max-w-full">
						{employee.name}
					</div>
					{employee.role && (
						<div className="text-xs text-muted-foreground truncate max-w-full">
							{employee.role}
						</div>
					)}
					{showLocationBadge && locationCount > 0 && (
						<div className="mt-1 flex justify-center">
							<LocationBadge />
						</div>
					)}
				</div>

				{/* Display custom actions */}
				{showActions && actions && <div className="mt-2 w-full">{actions}</div>}

				{/* Bottom right content (e.g., cost) */}
				{bottomRightContent && (
					<div className="absolute bottom-0 right-0 p-2 bg-white/80 rounded-tl-md text-sm font-medium">
						{bottomRightContent}
					</div>
				)}
			</div>
		);
	}

	// Standard variant (card-based design for main usage)
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
			{/* Status text in top right */}
			{employee.status && !hideStatus && (
				<div className="absolute top-3 right-3 z-10 text-right">
					<StatusText />
				</div>
			)}

			{/* Top left label (e.g., role in shift) */}
			{topLeftLabel && (
				<div className="absolute top-0 left-0 px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded-br-md z-10">
					{topLeftLabel}
				</div>
			)}

			{/* Selection indicator or checkbox */}
			{selectionMode === "checkbox" ? (
				<CheckboxSelection />
			) : (
				(selected || selectable) && (
					<div
						className={`absolute top-3 ${
							checkboxPosition === "left" ? "left-3" : "right-3"
						} z-10`}>
						{selected && <SelectionIndicator />}
					</div>
				)
			)}

			<CardContent
				className={cn("p-0", variant === "detailed" ? "pt-4" : "pt-4 pb-0")}>
				<div className="flex flex-col items-center">
					<div className="relative mb-3">
						<Avatar className={avatarSize}>
							<AvatarFallback className="text-lg font-medium">
								{initials}
							</AvatarFallback>
						</Avatar>
						{selected &&
							selectionMode !== "checkbox" &&
							selectionMode !== "highlight" && (
								<div
									className={`absolute -top-1 ${
										checkboxPosition === "left" ? "-left-1" : "-right-1"
									} bg-primary text-white rounded-full p-1`}>
									<Check className="h-3 w-3" />
								</div>
							)}
					</div>

					<div className="text-center w-full px-3">
						<h3 className="font-medium text-sm mb-0.5 truncate">
							{employee.name}
						</h3>
						{employee.role && (
							<p className="text-xs text-muted-foreground mb-2 truncate">
								{employee.role}
							</p>
						)}

						{/* Location count badge */}
						{showLocationBadge && locationCount > 0 && (
							<div className="flex items-center justify-center mt-2 mb-3">
								<LocationBadge />
							</div>
						)}
					</div>
				</div>

				{/* Detailed information for the detailed variant */}
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

			{/* Footer with actions */}
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

			{/* Bottom right content (e.g., cost) */}
			{bottomRightContent && (
				<div className="absolute bottom-0 right-0 p-2 bg-white/80 rounded-tl-md text-sm font-medium">
					{bottomRightContent}
				</div>
			)}
		</Card>
	);
}
