import React from "react";
import { cn } from "../../lib/utils";
import { Filter, X } from "lucide-react";
import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "./dropdown-menu";

interface FilterGroupProps {
	/**
	 * Filter controls to display
	 */
	children: React.ReactNode;
	/**
	 * Whether filters are currently active
	 */
	filtersActive?: boolean;
	/**
	 * Callback to clear all filters
	 */
	onClearFilters?: () => void;
	/**
	 * Optional additional className for the container
	 */
	className?: string;
	/**
	 * Whether to show filters in a dropdown on mobile
	 * @default true
	 */
	collapseOnMobile?: boolean;
	/**
	 * Label for dropdown trigger on mobile
	 * @default "Filters"
	 */
	mobileLabel?: string;
}

/**
 * FilterGroup component for organizing filter controls
 */
export function FilterGroup({
	children,
	filtersActive,
	onClearFilters,
	className,
	collapseOnMobile = true,
	mobileLabel = "Filters",
}: FilterGroupProps) {
	// Check if there are any children
	const hasChildren = React.Children.count(children) > 0;

	if (!hasChildren) {
		return null;
	}

	const content = (
		<div className="flex flex-wrap items-center gap-2">
			{children}
			{filtersActive && onClearFilters && (
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-2 text-xs"
					onClick={onClearFilters}>
					<X className="h-3.5 w-3.5 mr-1" />
					Clear
				</Button>
			)}
		</div>
	);

	// If we're not collapsing on mobile, just return the content
	if (!collapseOnMobile) {
		return (
			<div className={cn("flex items-center gap-2", className)}>{content}</div>
		);
	}

	// Return responsive version with dropdown for mobile
	return (
		<>
			{/* Desktop view */}
			<div className={cn("hidden md:flex items-center gap-2", className)}>
				{content}
			</div>

			{/* Mobile view */}
			<div className={cn("flex md:hidden", className)}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className={cn("h-8 gap-1", filtersActive && "bg-muted")}>
							<Filter className="h-3.5 w-3.5" />
							{mobileLabel}
							{filtersActive && (
								<span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
									!
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-[220px] p-4">
						<div className="flex flex-col space-y-4">{children}</div>
						{filtersActive && onClearFilters && (
							<Button
								variant="ghost"
								size="sm"
								className="mt-4 h-8 px-2 text-xs w-full justify-center"
								onClick={onClearFilters}>
								<X className="h-3.5 w-3.5 mr-1" />
								Clear filters
							</Button>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
