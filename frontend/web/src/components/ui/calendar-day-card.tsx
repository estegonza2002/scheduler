import * as React from "react";
import { cn } from "../../lib/utils";

interface CalendarDayCardProps extends React.HTMLAttributes<HTMLDivElement> {
	isCurrentMonth?: boolean;
	isSelected?: boolean;
	isToday?: boolean;
	dayNumber?: number | string;
	badgeCount?: number;
}

export function CalendarDayCard({
	className,
	children,
	isCurrentMonth = true,
	isSelected = false,
	isToday = false,
	dayNumber,
	badgeCount,
	...props
}: CalendarDayCardProps) {
	return (
		<div
			className={cn(
				"h-[120px] p-2 border hover:bg-accent/50 transition-colors relative cursor-pointer overflow-hidden",
				!isCurrentMonth && "bg-muted/50 text-muted-foreground",
				isSelected && "bg-accent",
				className
			)}
			{...props}>
			{/* Day header with optional badge count */}
			<div className="flex items-center justify-between mb-1">
				{dayNumber && (
					<div
						className={cn(
							"flex items-center justify-center w-6 h-6 text-sm font-medium",
							isToday && "rounded-full bg-primary text-primary-foreground"
						)}>
						{dayNumber}
					</div>
				)}

				{badgeCount && badgeCount > 0 && (
					<span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium">
						{badgeCount}
					</span>
				)}
			</div>

			{/* Calendar day content */}
			<div className="space-y-1 mt-1">{children}</div>
		</div>
	);
}

export function CalendarDayItem({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"text-xs rounded px-1.5 py-0.5 truncate font-medium",
				className
			)}
			{...props}>
			{children}
		</div>
	);
}

export function CalendarDayMoreIndicator({ count }: { count: number }) {
	return (
		<div className="text-xs text-muted-foreground font-medium bg-muted/50 rounded px-1.5 py-0.5 text-center">
			+{count} more
		</div>
	);
}
