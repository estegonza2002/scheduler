import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
	/**
	 * The title of the form section
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * The form fields and content
	 */
	children: React.ReactNode;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * Optional additional className for the content area
	 */
	contentClassName?: string;
	/**
	 * Optional additional className for the title
	 */
	titleClassName?: string;
	/**
	 * Optional additional className for the description
	 */
	descriptionClassName?: string;
	/**
	 * Optional id for the section
	 */
	id?: string;
}

/**
 * FormSection component for grouping related form fields
 */
export function FormSection({
	title,
	description,
	children,
	className,
	contentClassName,
	titleClassName,
	descriptionClassName,
	id,
}: FormSectionProps) {
	return (
		<div
			className={cn("space-y-6", className)}
			id={id}>
			<div>
				<h3 className={cn("text-lg font-medium leading-6", titleClassName)}>
					{title}
				</h3>
				{description && (
					<p
						className={cn(
							"mt-1 text-sm text-muted-foreground",
							descriptionClassName
						)}>
						{description}
					</p>
				)}
			</div>
			<div className={cn("space-y-6", contentClassName)}>{children}</div>
		</div>
	);
}
