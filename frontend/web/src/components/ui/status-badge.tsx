import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "pending";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	status: StatusType;
	text?: string;
}

const STATUS_VARIANTS: Record<
	StatusType,
	{
		variant: "default" | "secondary" | "destructive" | "outline";
		colorScheme?: string;
	}
> = {
	success: { variant: "outline", colorScheme: "green" },
	warning: { variant: "outline", colorScheme: "amber" },
	error: { variant: "destructive" },
	info: { variant: "outline", colorScheme: "blue" },
	pending: { variant: "secondary" },
};

const STATUS_LABELS: Record<StatusType, string> = {
	success: "Completed",
	warning: "Warning",
	error: "Error",
	info: "Info",
	pending: "Pending",
};

export function StatusBadge({
	status,
	text,
	className,
	...props
}: StatusBadgeProps) {
	const { variant, colorScheme } = STATUS_VARIANTS[status];
	const label = text || STATUS_LABELS[status];

	return (
		<Badge
			variant={variant}
			colorScheme={colorScheme as any}
			className={cn("font-medium", className)}
			{...props}>
			{label}
		</Badge>
	);
}
