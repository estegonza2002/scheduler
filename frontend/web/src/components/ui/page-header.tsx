import React from "react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
	/**
	 * The title of the page
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * Optional action buttons to display in the header
	 */
	actions?: React.ReactNode;
	/**
	 * Optional additional className for the header container
	 */
	className?: string;
	/**
	 * Optional additional className for the title text
	 */
	titleClassName?: string;
	/**
	 * Optional additional className for the description text
	 */
	descriptionClassName?: string;
	/**
	 * Optional additional className for the actions container
	 */
	actionsClassName?: string;
}

/**
 * PageHeader component for consistent page headers across the application
 * Uses standardized spacing variables from header-spacing.css
 */
export function PageHeader({
	title,
	description,
	actions,
	className,
	titleClassName,
	descriptionClassName,
	actionsClassName,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"border-b",
				"py-[var(--header-spacing-y)] px-[var(--header-spacing-x)] sm:px-[var(--header-spacing-sm-x)] lg:px-[var(--header-spacing-lg-x)]",
				className
			)}>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1
						className={cn(
							"text-[length:var(--header-title-size)] font-[var(--header-title-weight)] text-primary",
							titleClassName
						)}>
						{title}
					</h1>
					{description && (
						<p
							className={cn(
								"text-muted-foreground mt-1",
								descriptionClassName
							)}>
							{description}
						</p>
					)}
				</div>
				{actions && (
					<div className={cn("flex items-center gap-2", actionsClassName)}>
						{actions}
					</div>
				)}
			</div>
		</div>
	);
}
