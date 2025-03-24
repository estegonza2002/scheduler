import * as React from "react";
import { toast as sonnerToast, type ToastT } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

type ToastProps = {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	variant?: "default" | "success" | "destructive" | "warning" | "info";
	duration?: number;
	position?: ToastT["position"];
};

const toastStyles = {
	default: "bg-background text-foreground border-border",
	success:
		"bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
	destructive: "bg-destructive/10 text-destructive border-destructive/20",
	warning:
		"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
	info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const toastIcons = {
	default: Info,
	success: CheckCircle2,
	destructive: XCircle,
	warning: AlertCircle,
	info: Info,
};

export function toast({
	title,
	description,
	action,
	variant = "default",
	duration = 5000,
	position = "top-right",
}: ToastProps) {
	const Icon = toastIcons[variant];

	return sonnerToast(
		<div className={cn("flex items-start gap-3", toastStyles[variant])}>
			<Icon className="h-5 w-5 shrink-0" />
			<div className="flex-1 space-y-1">
				{title && <p className="font-medium">{title}</p>}
				{description && <p className="text-sm opacity-90">{description}</p>}
			</div>
			{action}
		</div>,
		{
			duration,
			position,
			className: "group",
		}
	);
}

export function dismissToast(toastId: string) {
	sonnerToast.dismiss(toastId);
}

export function dismissAllToasts() {
	sonnerToast.dismiss();
}

export function promiseToast<T>(
	promise: Promise<T>,
	{
		loading,
		success,
		error,
	}: {
		loading: string;
		success: string;
		error: string;
	}
) {
	return sonnerToast.promise(promise, {
		loading,
		success,
		error,
	});
}
