import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingStateProps {
	/**
	 * Optional message to display during loading
	 * @default "Loading..."
	 */
	message?: string;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * The type of loading indicator to display
	 * @default "spinner"
	 */
	type?: "spinner" | "skeleton" | "dots";
	/**
	 * Optional number of skeleton items to display if type is "skeleton"
	 * @default 3
	 */
	skeletonCount?: number;
	/**
	 * Optional height for skeleton items
	 * @default 20
	 */
	skeletonHeight?: number;
	/**
	 * Optional className for skeleton items
	 */
	skeletonClassName?: string;
	/**
	 * Whether to show the loading message
	 * @default true
	 */
	showMessage?: boolean;
}

/**
 * LoadingState component for displaying consistent loading UI
 */
export function LoadingState({
	message = "Loading...",
	className,
	type = "spinner",
	skeletonCount = 3,
	skeletonHeight = 20,
	skeletonClassName,
	showMessage = true,
}: LoadingStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center p-8",
				className
			)}>
			{type === "spinner" && (
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			)}

			{type === "dots" && (
				<div className="flex space-x-2">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								"h-2.5 w-2.5 rounded-full bg-muted-foreground/30 animate-pulse",
								i === 0 && "animation-delay-0",
								i === 1 && "animation-delay-150",
								i === 2 && "animation-delay-300"
							)}
							style={{
								animationDelay: `${i * 150}ms`,
							}}
						/>
					))}
				</div>
			)}

			{type === "skeleton" && (
				<div className="w-full space-y-2">
					{Array.from({ length: skeletonCount }).map((_, i) => (
						<Skeleton
							key={i}
							className={cn(skeletonClassName)}
							style={{ height: `${skeletonHeight}px` }}
						/>
					))}
				</div>
			)}

			{showMessage && (
				<p className="mt-4 text-sm text-muted-foreground">{message}</p>
			)}
		</div>
	);
}
