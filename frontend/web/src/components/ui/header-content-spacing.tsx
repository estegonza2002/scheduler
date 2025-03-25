import React from "react";
import { cn } from "../../lib/utils";

interface HeaderContentSpacingProps {
	/**
	 * Content to be displayed with standardized spacing after a header
	 */
	children: React.ReactNode;

	/**
	 * The type of spacing to apply
	 * - "page": Spacing after a page header
	 * - "section": Spacing after a section header
	 * - "content": Spacing between content blocks
	 * @default "page"
	 */
	type?: "page" | "section" | "content";

	/**
	 * Optional additional className
	 */
	className?: string;
}

/**
 * Utility component that ensures consistent spacing between headers and content
 * Uses standardized spacing variables from header-spacing.css
 */
export function HeaderContentSpacing({
	children,
	type = "page",
	className,
}: HeaderContentSpacingProps) {
	const spacingClass = {
		page: "header-content-spacing",
		section: "section-header-spacing",
		content: "section-content-spacing",
	}[type];

	return <div className={cn(spacingClass, className)}>{children}</div>;
}

/**
 * Page-specific spacing component
 */
export function PageContentSpacing({
	children,
	className,
}: Omit<HeaderContentSpacingProps, "type">) {
	return (
		<HeaderContentSpacing
			type="page"
			className={className}>
			{children}
		</HeaderContentSpacing>
	);
}

/**
 * Section-specific spacing component
 */
export function SectionContentSpacing({
	children,
	className,
}: Omit<HeaderContentSpacingProps, "type">) {
	return (
		<HeaderContentSpacing
			type="section"
			className={className}>
			{children}
		</HeaderContentSpacing>
	);
}
