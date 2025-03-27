import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "spinner" | "dots" | "skeleton" | "pulse";
	size?: "sm" | "default" | "lg";
	fullScreen?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
	(
		{
			className,
			variant = "default",
			size = "default",
			fullScreen = false,
			...props
		},
		ref
	) => {
		const sizeClasses = {
			sm: "h-4 w-4",
			default: "h-6 w-6",
			lg: "h-8 w-8",
		};

		const renderLoadingIndicator = () => {
			switch (variant) {
				case "spinner":
					return (
						<Loader2
							className={cn("animate-spin text-primary", sizeClasses[size])}
						/>
					);
				case "dots":
					return (
						<div className="flex space-x-1">
							{[0, 1, 2].map((i) => (
								<div
									key={i}
									className={cn(
										"animate-bounce rounded-full bg-primary",
										size === "sm" && "h-1.5 w-1.5",
										size === "default" && "h-2 w-2",
										size === "lg" && "h-3 w-3"
									)}
									style={{ animationDelay: `${i * 200}ms` }}
								/>
							))}
						</div>
					);
				case "skeleton":
					return (
						<div
							className={cn(
								"animate-pulse rounded bg-muted",
								size === "sm" && "h-4 w-4",
								size === "default" && "h-6 w-6",
								size === "lg" && "h-8 w-8"
							)}
						/>
					);
				case "pulse":
					return (
						<div
							className={cn(
								"animate-pulse rounded-full bg-primary/20",
								size === "sm" && "h-4 w-4",
								size === "default" && "h-6 w-6",
								size === "lg" && "h-8 w-8"
							)}
						/>
					);
				default:
					return (
						<Loader2
							className={cn("animate-spin text-primary", sizeClasses[size])}
						/>
					);
			}
		};

		if (fullScreen) {
			return (
				<div
					ref={ref}
					className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
					{...props}>
					{renderLoadingIndicator()}
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={cn("flex items-center justify-center", className)}
				{...props}>
				{renderLoadingIndicator()}
			</div>
		);
	}
);

Loading.displayName = "Loading";

export { Loading };
