import React from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertCardProps {
	/**
	 * The title of the alert
	 */
	title: string;
	/**
	 * The description text for the alert
	 */
	description: string;
	/**
	 * Optional action component to display in the alert
	 */
	action?: React.ReactNode;
	/**
	 * The variant style of the alert
	 * @default "info"
	 */
	variant?: "info" | "warning" | "error" | "success";
	/**
	 * Optional additional className for the alert
	 */
	className?: string;
	/**
	 * Optional icon to override the default for the variant
	 */
	icon?: React.ReactNode;
	/**
	 * Whether to show the dismiss button
	 * @default false
	 */
	dismissible?: boolean;
	/**
	 * Callback when the alert is dismissed
	 */
	onDismiss?: () => void;
}

/**
 * AlertCard component for displaying messages that need attention
 */
export function AlertCard({
	title,
	description,
	action,
	variant = "info",
	className,
	icon,
	dismissible = false,
	onDismiss,
}: AlertCardProps) {
	const [dismissed, setDismissed] = React.useState(false);

	if (dismissed) {
		return null;
	}

	const handleDismiss = () => {
		setDismissed(true);
		onDismiss?.();
	};

	// Default icons based on variant
	const getDefaultIcon = () => {
		switch (variant) {
			case "info":
				return <Info className="h-5 w-5" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5" />;
			case "error":
				return <AlertCircle className="h-5 w-5" />;
			case "success":
				return <CheckCircle className="h-5 w-5" />;
			default:
				return <Info className="h-5 w-5" />;
		}
	};

	// Classes based on variant
	const getVariantClasses = () => {
		switch (variant) {
			case "info":
				return "bg-blue-50 border-blue-200 text-blue-800";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800";
			case "error":
				return "bg-red-50 border-red-200 text-red-800";
			case "success":
				return "bg-green-50 border-green-200 text-green-800";
			default:
				return "bg-blue-50 border-blue-200 text-blue-800";
		}
	};

	return (
		<Alert
			className={cn("border rounded-md p-4", getVariantClasses(), className)}>
			<div className="flex">
				<div className="flex-shrink-0">{icon || getDefaultIcon()}</div>
				<div className="ml-3 flex-1">
					<div className="flex items-center justify-between">
						<AlertTitle className="text-sm font-medium">{title}</AlertTitle>
						{dismissible && (
							<button
								type="button"
								className="bg-transparent text-muted-foreground hover:text-foreground p-1"
								onClick={handleDismiss}>
								<span className="sr-only">Dismiss</span>
								<svg
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true">
									<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
								</svg>
							</button>
						)}
					</div>
					<AlertDescription className="mt-1 text-sm">
						{description}
					</AlertDescription>
					{action && <div className="mt-4">{action}</div>}
				</div>
			</div>
		</Alert>
	);
}
