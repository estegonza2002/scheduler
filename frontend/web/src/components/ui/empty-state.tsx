import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Search } from "lucide-react";

interface EmptyStateProps {
	/**
	 * The title text to display in the empty state
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * Optional icon to display above the title
	 * @default AlertCircle icon
	 */
	icon?: React.ReactNode;
	/**
	 * Optional action button to display below the description
	 */
	action?: React.ReactNode;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * Optional size of the empty state component
	 * @default "default"
	 */
	size?: "small" | "default" | "large";
}

/**
 * EmptyState component for displaying when no data is available
 */
export function EmptyState({
	title,
	description,
	icon,
	action,
	className,
	size = "default",
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center text-center rounded-lg border border-dashed",
				className
			)}>
			<div
				className={cn(
					"flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mt-8",
					size === "small" && "h-10 w-10 mt-4",
					size === "large" && "h-16 w-16 mt-12"
				)}>
				{icon || (
					<AlertCircle
						className={cn(
							"h-6 w-6",
							size === "small" && "h-5 w-5",
							size === "large" && "h-8 w-8"
						)}
					/>
				)}
			</div>
			<h3
				className={cn(
					"mt-4 font-semibold",
					size === "small" && "text-sm",
					size === "default" && "text-lg",
					size === "large" && "text-xl"
				)}>
				{title}
			</h3>
			{description && (
				<p
					className={cn(
						"mt-2 text-sm text-muted-foreground",
						size === "small" && "text-xs",
						size === "large" && "text-base"
					)}>
					{description}
				</p>
			)}
			{action && <div className="mt-6 mb-8">{action}</div>}
		</div>
	);
}
