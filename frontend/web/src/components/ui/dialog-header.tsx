import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogHeaderProps {
	/**
	 * The title of the dialog
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
	 * Optional function to close the dialog
	 */
	onClose?: () => void;
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
 * DialogHeader component for consistent dialog headers across the application
 * Follows the same design patterns as the PageHeader component
 * Uses standardized spacing variables from header-spacing.css
 */
export function DialogHeader({
	title,
	description,
	actions,
	onClose,
	className,
	titleClassName,
	descriptionClassName,
	actionsClassName,
}: DialogHeaderProps) {
	return (
		<div className={cn("border-b", "py-4 px-4 sm:px-6 lg:px-8", className)}>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2
						className={cn(
							"text-[length:var(--dialog-title-size)] font-[var(--dialog-title-weight)]",
							titleClassName
						)}>
						{title}
					</h2>
					{onClose && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="h-8 w-8"
							aria-label="Close dialog">
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
				{description && (
					<p
						className={cn(
							"text-sm text-muted-foreground",
							descriptionClassName
						)}>
						{description}
					</p>
				)}
				{actions && (
					<div className={cn("flex items-center gap-2", actionsClassName)}>
						{actions}
					</div>
				)}
			</div>
		</div>
	);
}
