import * as React from "react";
import { cn } from "../../lib/utils";
import {
	FileQuestion,
	Search,
	Inbox,
	FolderPlus,
	Users,
	Calendar,
	Settings,
	AlertCircle,
	LucideIcon,
} from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	variant?: "default" | "search" | "no-data" | "no-results" | "error";
	size?: "sm" | "default" | "lg";
	image?: React.ReactNode;
}

const defaultIcons: Record<string, LucideIcon> = {
	default: FileQuestion,
	search: Search,
	"no-data": Inbox,
	"no-results": FolderPlus,
	error: AlertCircle,
};

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
	variant = "default",
	size = "default",
	image,
	...props
}: EmptyStateProps) {
	const sizeClasses = {
		sm: {
			container: "min-h-[200px] p-4",
			icon: "h-8 w-8",
			title: "text-base",
			description: "text-xs",
		},
		default: {
			container: "min-h-[400px] p-8",
			icon: "h-10 w-10",
			title: "text-lg",
			description: "text-sm",
		},
		lg: {
			container: "min-h-[600px] p-12",
			icon: "h-12 w-12",
			title: "text-xl",
			description: "text-base",
		},
	};

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-lg border border-dashed animate-in fade-in-50",
				sizeClasses[size].container,
				variant === "error" && "border-destructive/50",
				className
			)}
			{...props}>
			{image ? (
				<div className="mb-4">{image}</div>
			) : (
				<div
					className={cn(
						"mx-auto flex items-center justify-center rounded-full bg-muted mb-4",
						sizeClasses[size].icon
					)}>
					{icon ||
						React.createElement(defaultIcons[variant], {
							className: "h-1/2 w-1/2 text-muted-foreground",
						})}
				</div>
			)}
			<h3
				className={cn(
					"mt-2 font-semibold",
					sizeClasses[size].title,
					variant === "error" && "text-destructive"
				)}>
				{title}
			</h3>
			{description && (
				<p
					className={cn(
						"mt-1 text-muted-foreground",
						sizeClasses[size].description
					)}>
					{description}
				</p>
			)}
			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
