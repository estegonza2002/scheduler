import React from "react";
import { Badge } from "./badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, User } from "lucide-react";

interface EmployeeStatusBadgeProps {
	status?: "invited" | "active" | "disabled";
	isOnline?: boolean;
	lastActive?: string;
	compact?: boolean;
	className?: string;
}

export function EmployeeStatusBadge({
	status = "invited",
	isOnline = false,
	lastActive,
	compact = false,
	className,
}: EmployeeStatusBadgeProps) {
	// Define colors and icons based on status
	const statusConfig = {
		invited: {
			icon: Clock,
			label: "Invited",
			variant: "outline",
			tooltip: "User has been invited but hasn't set up their account",
			color: "text-amber-500",
		},
		active: {
			icon: CheckCircle,
			label: "Active",
			variant: "outline",
			tooltip: "User has verified their email and set up their account",
			color: "text-green-500",
		},
		disabled: {
			icon: AlertTriangle,
			label: "Disabled",
			variant: "outline",
			tooltip: "User account has been disabled",
			color: "text-destructive",
		},
	};

	const config = statusConfig[status];
	const StatusIcon = config.icon;

	// Format last active time if provided
	const lastActiveFormatted = lastActive
		? new Date(lastActive).toLocaleString()
		: undefined;

	// Prepare the online status indicator
	const onlineIndicator = (
		<div className="relative">
			<div
				className={cn(
					"absolute -top-1 -right-1 w-2 h-2 rounded-full",
					isOnline ? "bg-green-500" : "bg-gray-300"
				)}
			/>
		</div>
	);

	// Create combined tooltip content
	const tooltipContent = (
		<div className="text-xs">
			<div>
				<strong>Status:</strong> {config.tooltip}
			</div>
			{lastActiveFormatted && (
				<div>
					<strong>Last active:</strong> {lastActiveFormatted}
				</div>
			)}
		</div>
	);

	// Render compact version for table rows/cards
	if (compact) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className={cn("flex items-center gap-1", className)}>
							<StatusIcon className={cn("h-3 w-3", config.color)} />
							{isOnline && (
								<div className="w-2 h-2 rounded-full bg-green-500" />
							)}
						</div>
					</TooltipTrigger>
					<TooltipContent side="top">{tooltipContent}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Render full badge
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Badge
						variant="outline"
						className={cn(
							"flex items-center gap-1 px-2 py-1 h-auto",
							className
						)}>
						<StatusIcon className={cn("h-3 w-3 mr-1", config.color)} />
						<span className="text-xs">{config.label}</span>
						{isOnline && (
							<div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
						)}
					</Badge>
				</TooltipTrigger>
				<TooltipContent side="top">{tooltipContent}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
