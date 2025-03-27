import React from "react";
import { cn } from "@/lib/utils";
import { ItemCard } from "./item-card";
import { EmptyState } from "./empty-state";
import { SearchX } from "lucide-react";
import { Button } from "./button";

interface DataCardGridProps<TData> {
	data: TData[];
	totalItems?: number;
	renderCard: (item: TData) => React.ReactNode;
	keyExtractor: (item: TData) => string | number;
	className?: string;
	emptyStateProps?: {
		title?: string;
		description?: string;
		icon?: React.ReactNode;
		action?: React.ReactNode;
	};
	pagination?: {
		currentPage: number;
		totalPages: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	};
}

export function DataCardGrid<TData>({
	data,
	totalItems,
	renderCard,
	keyExtractor,
	className,
	emptyStateProps,
	pagination,
}: DataCardGridProps<TData>) {
	if (!data.length) {
		return (
			<EmptyState
				title={emptyStateProps?.title || "No items found"}
				description={
					emptyStateProps?.description || "No items match your current filters."
				}
				icon={emptyStateProps?.icon || <SearchX className="h-10 w-10" />}
				action={emptyStateProps?.action}
				size="small"
			/>
		);
	}

	return (
		<div className="space-y-6">
			<div
				className={cn(
					"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
					className
				)}>
				{data.map((item) => (
					<div key={keyExtractor(item)}>{renderCard(item)}</div>
				))}
			</div>

			{pagination && (
				<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
					Showing page {pagination.currentPage} of {pagination.totalPages} (
					{totalItems || data.length} items total)
				</div>
			)}
		</div>
	);
}
