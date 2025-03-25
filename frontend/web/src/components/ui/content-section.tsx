import React from "react";
import { cn } from "../../lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./card";

interface ContentSectionProps {
	/**
	 * The title of the section
	 */
	title: string;
	/**
	 * Optional description text to display under the title
	 */
	description?: string;
	/**
	 * The content to display within the section
	 */
	children: React.ReactNode;
	/**
	 * Optional footer content to display at the bottom of the section
	 */
	footer?: React.ReactNode;
	/**
	 * Optional additional className for the section container
	 */
	className?: string;
	/**
	 * Optional additional className for the content area
	 */
	contentClassName?: string;
	/**
	 * Optional header actions to display in the top-right of the section
	 */
	headerActions?: React.ReactNode;
	/**
	 * Whether to render the section without a Card wrapper
	 * @default false
	 */
	flat?: boolean;
}

/**
 * ContentSection component for dividing content into logical sections
 * Uses standardized spacing variables from header-spacing.css
 */
export function ContentSection({
	title,
	description,
	children,
	footer,
	className,
	contentClassName,
	headerActions,
	flat = false,
}: ContentSectionProps) {
	const sectionContent = (
		<>
			<div className="mb-[var(--section-content-spacing)]">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-[length:var(--section-title-size)] font-[var(--section-title-weight)]">
							{title}
						</h2>
						{description && (
							<p className="text-sm text-muted-foreground mt-1">
								{description}
							</p>
						)}
					</div>
					{headerActions && (
						<div className="flex items-center gap-2">{headerActions}</div>
					)}
				</div>
			</div>
			<div className={cn(contentClassName)}>{children}</div>
			{footer && (
				<div className="mt-[var(--section-content-spacing)]">{footer}</div>
			)}
		</>
	);

	if (flat) {
		return <div className={cn("mb-8", className)}>{sectionContent}</div>;
	}

	return (
		<Card className={cn("mb-6", className)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{title}</CardTitle>
						{description && <CardDescription>{description}</CardDescription>}
					</div>
					{headerActions && (
						<div className="flex items-center gap-2">{headerActions}</div>
					)}
				</div>
			</CardHeader>
			<CardContent className={contentClassName}>{children}</CardContent>
			{footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
		</Card>
	);
}
