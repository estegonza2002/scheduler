import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	pageSizeOptions?: number[];
	showPageSizeSelector?: boolean;
}

export function TablePagination({
	currentPage,
	totalPages,
	pageSize,
	totalItems,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 25, 50, 100],
	showPageSizeSelector = true,
}: TablePaginationProps) {
	// Create a ref for live announcements
	const announceRef = useRef<HTMLDivElement>(null);

	// Function to announce page changes to screen readers
	const announcePage = (page: number) => {
		if (announceRef.current) {
			announceRef.current.textContent = `Page ${page} of ${totalPages}`;
		}
	};

	// Announce current page on mount and when it changes
	useEffect(() => {
		announcePage(currentPage);
	}, [currentPage, totalPages]);

	// Handle page changes with screen reader announcements
	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		onPageChange(page);
		announcePage(page);
	};

	// Calculate the range of items being displayed
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);

	// Generate page buttons with proper aria attributes
	const renderPageButtons = () => {
		const buttons = [];
		const maxButtons = 5;

		let startPage = Math.max(1, currentPage - 2);
		let endPage = Math.min(totalPages, startPage + maxButtons - 1);

		if (endPage - startPage + 1 < maxButtons) {
			startPage = Math.max(1, endPage - maxButtons + 1);
		}

		// First page button if not in range
		if (startPage > 1) {
			buttons.push(
				<Button
					key="first"
					variant="outline"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => handlePageChange(1)}
					aria-label="Go to first page"
					title="First Page">
					1
				</Button>
			);

			if (startPage > 2) {
				buttons.push(
					<span
						key="ellipsis1"
						className="mx-1">
						...
					</span>
				);
			}
		}

		// Page number buttons
		for (let i = startPage; i <= endPage; i++) {
			buttons.push(
				<Button
					key={i}
					variant={i === currentPage ? "default" : "outline"}
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => handlePageChange(i)}
					aria-label={`Page ${i}`}
					aria-current={i === currentPage ? "page" : undefined}
					title={`Page ${i}`}>
					{i}
				</Button>
			);
		}

		// Last page button if not in range
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				buttons.push(
					<span
						key="ellipsis2"
						className="mx-1">
						...
					</span>
				);
			}

			buttons.push(
				<Button
					key="last"
					variant="outline"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => handlePageChange(totalPages)}
					aria-label={`Go to last page, page ${totalPages}`}
					title={`Last Page (${totalPages})`}>
					{totalPages}
				</Button>
			);
		}

		return buttons;
	};

	return (
		<>
			{/* Screen reader announcements */}
			<div
				ref={announceRef}
				className="sr-only"
				aria-live="polite"
				aria-atomic="true"
			/>

			<div
				className="flex flex-col sm:flex-row justify-between items-center px-2 mt-4"
				role="navigation"
				aria-label="Pagination Navigation">
				{/* Items per page selector */}
				{showPageSizeSelector && (
					<div className="flex items-center space-x-2 mb-4 sm:mb-0">
						<span className="text-sm text-muted-foreground">Rows per page</span>
						<Select
							value={String(pageSize)}
							onValueChange={(value) => onPageSizeChange(Number(value))}>
							<SelectTrigger
								className="h-8 w-[70px]"
								aria-label="Select number of rows per page">
								<SelectValue placeholder={pageSize} />
							</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((size) => (
									<SelectItem
										key={size}
										value={String(size)}
										aria-label={`Show ${size} rows per page`}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Page navigation */}
				<div className="flex items-center justify-between w-full sm:w-auto sm:justify-end">
					<div className="flex-1 text-sm text-muted-foreground mr-4">
						{totalItems > 0
							? `Showing ${startItem}-${endItem} of ${totalItems}`
							: "No results"}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							aria-label="Previous page"
							title="Previous Page">
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<div className="hidden sm:flex items-center space-x-2">
							{totalPages > 0 && renderPageButtons()}
						</div>

						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages || totalPages === 0}
							aria-label="Next page"
							title="Next Page">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
