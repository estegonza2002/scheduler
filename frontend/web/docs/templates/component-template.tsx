import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ComponentName Component
 *
 * [Component description and purpose]
 *
 * @example
 * // Basic usage
 * <ComponentName>Content</ComponentName>
 *
 * // With variants
 * <ComponentName variant="primary" size="lg">Content</ComponentName>
 */

export interface ComponentNameProps
	extends React.HTMLAttributes<HTMLDivElement> {
	/** Description of the variant prop */
	variant?: "default" | "primary" | "secondary";
	/** Description of the size prop */
	size?: "default" | "sm" | "lg";
	/** Description of the children prop */
	children: React.ReactNode;
	/** Optional className for extending styles */
	className?: string;
}

/**
 * ComponentName Component
 */
export function ComponentName({
	variant = "default",
	size = "default",
	children,
	className,
	...props
}: ComponentNameProps) {
	// Define variant classes
	const variantClasses = {
		default: "bg-background border",
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
	};

	// Define size classes
	const sizeClasses = {
		default: "p-4",
		sm: "p-2 text-sm",
		lg: "p-6 text-lg",
	};

	return (
		<div
			className={cn(
				// Base styles
				"rounded-md",
				// Variant styles
				variantClasses[variant],
				// Size styles
				sizeClasses[size],
				// Override with consumer-provided className
				className
			)}
			{...props}>
			{children}
		</div>
	);
}

/**
 * Sub-component for additional functionality
 */
export interface ComponentNameItemProps
	extends React.HTMLAttributes<HTMLDivElement> {
	/** Description of the children prop */
	children: React.ReactNode;
}

export function ComponentNameItem({
	children,
	className,
	...props
}: ComponentNameItemProps) {
	return (
		<div
			className={cn("mt-2 first:mt-0", className)}
			{...props}>
			{children}
		</div>
	);
}
