import React from "react";
import { cn } from "@/lib/utils";

interface ContentContainerProps {
	/**
	 * The content to display within the container
	 */
	children: React.ReactNode;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * Optional maximum width for the container
	 * @default "w-full"
	 */
	maxWidth?: string;
	/**
	 * Whether to apply default padding
	 * @default true
	 */
	withPadding?: boolean;
}

/**
 * ContentContainer component for wrapping page content with consistent padding and max-width
 */
export function ContentContainer({
	children,
	className,
	maxWidth = "w-full",
	withPadding = true,
}: ContentContainerProps) {
	return (
		<div
			className={cn(
				"content-container-wrapper w-full",
				withPadding ? "px-0 py-6" : "",
				className
			)}>
			{children}
		</div>
	);
}
