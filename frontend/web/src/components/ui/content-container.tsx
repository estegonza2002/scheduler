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
}

/**
 * ContentContainer component for wrapping page content with consistent padding and max-width
 */
export function ContentContainer({
	children,
	className,
}: ContentContainerProps) {
	return <div className={cn("w-full p-6", className)}>{children}</div>;
}
