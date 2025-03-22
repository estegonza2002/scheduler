import * as React from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
	...props
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
				className
			)}
			{...props}>
			{icon && (
				<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-4">
					{icon}
				</div>
			)}
			<h3 className="mt-2 text-lg font-semibold">{title}</h3>
			{description && (
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			)}
			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
