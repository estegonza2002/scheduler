import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { cn } from "../../lib/utils";

interface AvatarWithStatusProps {
	src?: string;
	alt?: string;
	fallback: string;
	size?: "sm" | "md" | "lg" | "xl";
	isOnline?: boolean;
	status?: "invited" | "active" | "disabled";
	className?: string;
}

export function AvatarWithStatus({
	src,
	alt,
	fallback,
	size = "md",
	isOnline,
	status,
	className,
}: AvatarWithStatusProps) {
	// Define size classes
	const sizeClasses = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-16 w-16",
		xl: "h-20 w-20",
	};

	// Define status indicator colors
	const statusColors = {
		invited: "bg-amber-500",
		active: "bg-green-500",
		disabled: "bg-gray-400",
	};

	// Smaller, more subtle indicators
	const indicatorSizes = {
		sm: "h-2 w-2",
		md: "h-2.5 w-2.5",
		lg: "h-3 w-3",
		xl: "h-3.5 w-3.5",
	};

	// Position indicators more subtly in the top-right
	const indicatorPositions = {
		sm: "right-0 top-0 translate-x-1/3 -translate-y-1/3",
		md: "right-0 top-0 translate-x-1/3 -translate-y-1/3",
		lg: "right-0 top-0 translate-x-1/3 -translate-y-1/3",
		xl: "right-0 top-0 translate-x-1/3 -translate-y-1/3",
	};

	return (
		<div className="relative inline-block">
			<Avatar className={cn(sizeClasses[size], className)}>
				<AvatarImage
					src={src}
					alt={alt || fallback}
				/>
				<AvatarFallback
					className={
						size === "xl" ? "text-xl" : size === "lg" ? "text-lg" : "text-sm"
					}>
					{fallback}
				</AvatarFallback>
			</Avatar>

			{/* Status indicators */}
			{isOnline !== undefined && (
				<span
					className={cn(
						"absolute border-[1.5px] border-white rounded-full shadow-sm",
						indicatorSizes[size],
						indicatorPositions[size],
						isOnline ? "bg-green-500" : "bg-gray-400"
					)}
				/>
			)}

			{/* Account status indicator (optional) */}
			{status && !isOnline && (
				<span
					className={cn(
						"absolute border-[1.5px] border-white rounded-full shadow-sm",
						indicatorSizes[size],
						indicatorPositions[size],
						statusColors[status]
					)}
				/>
			)}
		</div>
	);
}
