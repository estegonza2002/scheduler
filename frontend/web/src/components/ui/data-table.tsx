import * as React from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	ColumnFiltersState,
	getFilteredRowModel,
	HeaderGroup,
	Header,
	Row,
	Cell,
	PaginationState,
	Column,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";
import { Button } from "./button";
import { Input } from "./input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import {
	ChevronLeft,
	ChevronRight,
	List,
	LayoutGrid,
	Search,
	X,
	Maximize2,
	Minimize2,
	Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableViewOptions {
	enableViewToggle?: boolean;
	defaultView?: "table" | "cards";
	onViewChange?: (view: "table" | "cards") => void;
	renderCard?: (item: any) => React.ReactNode;
	enableFullscreen?: boolean;
	onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface CustomFilter {
	id: string;
	label: string;
	render: () => React.ReactNode;
	column?: string;
	value?: any;
	onValueChange?: (value: any) => void;
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	hidePagination?: boolean;
	hideTable?: boolean;
	externalPagination?: {
		pageIndex: number;
		pageSize: number;
		totalItems: number;
		setPageIndex: (pageIndex: number) => void;
		setPageSize: (pageSize: number) => void;
	};
	onRowClick?: (row: TData) => void;
	tableCaption?: string;
	viewOptions?: DataTableViewOptions;
	customFilters?: CustomFilter[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search...",
	hidePagination = false,
	hideTable = false,
	externalPagination,
	onRowClick,
	tableCaption,
	viewOptions,
	customFilters,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 25,
	});
	const [viewMode, setViewMode] = React.useState<"table" | "cards">(
		viewOptions?.defaultView || "table"
	);
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const [showFilters, setShowFilters] = React.useState(false);

	// Auto-detect a searchable column if none is provided
	const effectiveSearchKey = React.useMemo(() => {
		if (searchKey) return searchKey;

		// Look for the first column with a text-based key that's not 'actions'
		const textColumn = columns.find((col) => {
			const key = (col as any).accessorKey;
			return key && typeof key === "string" && key !== "actions";
		});

		return textColumn ? (textColumn as any).accessorKey : undefined;
	}, [columns, searchKey]);

	// Ref for screen reader announcements
	const announceRef = React.useRef<HTMLDivElement>(null);
	// Ref for fullscreen container
	const containerRef = React.useRef<HTMLDivElement>(null);

	// Function to announce changes to screen readers
	const announce = (message: string) => {
		if (announceRef.current) {
			announceRef.current.textContent = message;
		}
	};

	// Handle view mode change
	const handleViewModeChange = (mode: "table" | "cards") => {
		setViewMode(mode);
		viewOptions?.onViewChange?.(mode);
	};

	// Handle fullscreen toggle
	const toggleFullscreen = () => {
		const newState = !isFullscreen;
		setIsFullscreen(newState);
		viewOptions?.onFullscreenChange?.(newState);

		if (newState) {
			announce("Entered fullscreen mode");
		} else {
			announce("Exited fullscreen mode");
		}
	};

	// Toggle filters visibility
	const toggleFilters = () => {
		setShowFilters(!showFilters);
		announce(showFilters ? "Filters hidden" : "Filters shown");
	};

	// Listen for escape key to exit fullscreen
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isFullscreen) {
				toggleFullscreen();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFullscreen]);

	const isExternalPagination = !!externalPagination;

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...(isExternalPagination
			? {}
			: { getPaginationRowModel: getPaginationRowModel() }),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: isExternalPagination
			? () => {
					// This will be handled externally
			  }
			: (newPagination) => {
					setPagination(newPagination);
					// Use the new pagination state safely
					const newState =
						typeof newPagination === "function"
							? newPagination(pagination)
							: newPagination;
					const pageNumber = newState.pageIndex + 1;
					const totalPages = Math.ceil(data.length / newState.pageSize);
					announce(`Page ${pageNumber} of ${totalPages}`);
			  },
		manualPagination: isExternalPagination,
		pageCount: isExternalPagination
			? Math.ceil(externalPagination.totalItems / externalPagination.pageSize)
			: undefined,
		state: {
			sorting,
			columnFilters,
			pagination: isExternalPagination
				? {
						pageIndex: externalPagination.pageIndex,
						pageSize: externalPagination.pageSize,
				  }
				: pagination,
		},
	});

	const renderRows = () => {
		const rows = isExternalPagination
			? table.getRowModel().rows
			: table.getRowModel().rows;

		if (!rows || rows.length === 0) {
			return (
				<TableRow>
					<TableCell
						colSpan={columns.length}
						className="h-24 text-center text-muted-foreground">
						No results found.
					</TableCell>
				</TableRow>
			);
		}

		return rows.map((row: Row<TData>) => (
			<TableRow
				key={row.id}
				data-state={row.getIsSelected() && "selected"}
				className={
					onRowClick
						? "cursor-pointer hover:bg-primary/5 transition-colors"
						: "hover:bg-muted/30 transition-colors"
				}
				onClick={onRowClick ? () => onRowClick(row.original) : undefined}
				tabIndex={onRowClick ? 0 : undefined}
				onKeyDown={
					onRowClick
						? (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onRowClick(row.original);
								}
						  }
						: undefined
				}
				aria-selected={row.getIsSelected()}
				role="row">
				{row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
					<TableCell
						key={cell.id}
						role="cell">
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				))}
			</TableRow>
		));
	};

	// Handle search input change with announcement
	const handleSearchChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		columnId: string
	) => {
		const value = event.target.value;
		table.getColumn(columnId)?.setFilterValue(value);

		// Announce filter changes to screen readers
		if (value) {
			announce(`Filtering results by ${columnId}: ${value}`);
		} else {
			announce("Filter cleared");
		}
	};

	// Check if there are any active filters
	const hasActiveFilters = columnFilters.length > 0;

	// Reset all filters
	const handleResetFilters = () => {
		setColumnFilters([]);

		// Call onValueChange with null/default for each custom filter
		customFilters?.forEach((filter) => {
			if (filter.onValueChange) {
				filter.onValueChange(null);
			}
		});

		announce("All filters cleared");
	};

	// Check if we have custom filters to show the filter button
	const hasCustomFilters = customFilters && customFilters.length > 0;

	// Apply custom filters to the table
	React.useEffect(() => {
		if (!customFilters) return;

		customFilters.forEach((filter) => {
			const columnId = filter.column || filter.id;
			if (filter.value !== undefined) {
				const column = table.getColumn(columnId);
				if (column) {
					console.log(`Setting filter for column ${columnId}:`, filter.value);
					column.setFilterValue(filter.value);
				} else {
					console.warn(
						`Column "${columnId}" not found in the table. Skipping filter.`
					);
				}
			}
		});
	}, [customFilters, table]);

	React.useEffect(() => {
		// For debugging React Fragment errors
		console.log("DataTable render - checking for React Fragment issues");
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative transition-all duration-300",
				isFullscreen && "fixed inset-0 z-50 bg-background p-6 overflow-auto"
			)}>
			{/* Screen reader announcements */}
			<div
				ref={announceRef}
				className="sr-only"
				aria-live="polite"
				aria-atomic="true"
			/>

			{/* Top Controls: Search and View Toggle */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
				{/* Search Controls */}
				<div className="flex items-center gap-2 w-full sm:w-auto">
					{effectiveSearchKey && (
						<div className="relative flex-1 sm:flex-none sm:w-80">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={searchPlaceholder}
								value={
									(table
										.getColumn(effectiveSearchKey)
										?.getFilterValue() as string) ?? ""
								}
								onChange={(event) =>
									handleSearchChange(event, effectiveSearchKey)
								}
								className="pl-8 w-full"
								aria-label={searchPlaceholder}
								type="search"
							/>
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleResetFilters}
									className="absolute right-1 top-1.5 h-7 w-7 p-0"
									aria-label="Clear search">
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}

					{/* Filter button */}
					{hasCustomFilters && (
						<Button
							variant="outline"
							size="sm"
							onClick={toggleFilters}
							className={cn("h-9 px-3", showFilters && "bg-muted")}
							aria-label={showFilters ? "Hide filters" : "Show filters"}
							aria-expanded={showFilters}>
							<Filter className="h-4 w-4 mr-2" />
							Filters
						</Button>
					)}
				</div>

				{/* View Toggle and Fullscreen */}
				<div className="flex items-center gap-2">
					{viewOptions?.enableViewToggle && (
						<div className="border rounded-md overflow-hidden">
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 px-2 rounded-none",
									viewMode === "table" && "bg-muted"
								)}
								onClick={() => handleViewModeChange("table")}>
								<List className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 px-2 rounded-none",
									viewMode === "cards" && "bg-muted"
								)}
								onClick={() => handleViewModeChange("cards")}>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							{viewOptions?.enableFullscreen !== false && (
								<Button
									variant="ghost"
									size="sm"
									onClick={toggleFullscreen}
									className={cn(
										"h-8 px-2 rounded-none",
										isFullscreen && "bg-muted"
									)}
									aria-label={
										isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
									}>
									{isFullscreen ? (
										<Minimize2 className="h-4 w-4" />
									) : (
										<Maximize2 className="h-4 w-4" />
									)}
								</Button>
							)}
						</div>
					)}

					{/* Standalone fullscreen button when view toggle is disabled */}
					{!viewOptions?.enableViewToggle &&
						viewOptions?.enableFullscreen !== false && (
							<Button
								variant="outline"
								size="sm"
								onClick={toggleFullscreen}
								className="h-8 px-2"
								aria-label={
									isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
								}>
								{isFullscreen ? (
									<Minimize2 className="h-4 w-4" />
								) : (
									<Maximize2 className="h-4 w-4" />
								)}
							</Button>
						)}
				</div>
			</div>

			{/* Custom Filters Section */}
			{hasCustomFilters && showFilters && (
				<div className="mb-4 p-4 border rounded-md bg-background shadow-sm">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-medium">Filter Options</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleResetFilters}
							className="h-8 text-xs"
							aria-label="Reset all filters">
							Reset filters
						</Button>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{customFilters?.map((filter) => (
							<div
								key={filter.id}
								className="flex flex-col">
								<label className="text-sm font-medium mb-1.5">
									{filter.label}
								</label>
								{filter.render()}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Card View */}
			{viewOptions?.renderCard && viewMode === "cards" && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{table.getRowModel().rows.map((row) => (
						<div
							key={row.id}
							onClick={() => onRowClick?.(row.original)}>
							{viewOptions.renderCard?.(row.original)}
						</div>
					))}
				</div>
			)}

			{/* Table View */}
			{(viewMode === "table" || !viewOptions?.enableViewToggle) &&
				!hideTable && (
					<div className="rounded-lg border shadow-sm overflow-hidden">
						<Table>
							{tableCaption && (
								<caption className="sr-only">{tableCaption}</caption>
							)}
							<TableHeader>
								{table
									.getHeaderGroups()
									.map((headerGroup: HeaderGroup<TData>) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map(
												(header: Header<TData, unknown>) => (
													<TableHead
														key={header.id}
														scope="col"
														className="bg-muted/50 font-medium"
														aria-sort={
															header.column.getIsSorted()
																? header.column.getIsSorted() === "asc"
																	? "ascending"
																	: "descending"
																: undefined
														}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												)
											)}
										</TableRow>
									))}
							</TableHeader>
							<TableBody>{renderRows()}</TableBody>
						</Table>
					</div>
				)}

			{/* Pagination Controls - Bottom Section */}
			{!hidePagination &&
				!isExternalPagination &&
				(viewMode === "table" || !viewOptions?.enableViewToggle) && (
					<div
						className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4"
						role="navigation"
						aria-label="Pagination Navigation">
						<div className="flex items-center space-x-6">
							<div
								className="text-sm text-muted-foreground"
								aria-live="polite">
								Showing{" "}
								<span>
									{table.getFilteredRowModel().rows.length > 0
										? table.getState().pagination.pageIndex *
												table.getState().pagination.pageSize +
										  1
										: 0}{" "}
									to{" "}
									{Math.min(
										(table.getState().pagination.pageIndex + 1) *
											table.getState().pagination.pageSize,
										table.getFilteredRowModel().rows.length
									)}{" "}
									of {table.getFilteredRowModel().rows.length} entries
								</span>
							</div>

							<div className="flex items-center space-x-2">
								<p className="text-sm text-muted-foreground">Items per page</p>
								<Select
									value={`${table.getState().pagination.pageSize}`}
									onValueChange={(value) => {
										table.setPageSize(Number(value));
										announce(`Showing ${value} items per page`);
									}}>
									<SelectTrigger
										className="h-8 w-[70px]"
										aria-label="Select number of items per page">
										<SelectValue
											placeholder={table.getState().pagination.pageSize}
										/>
									</SelectTrigger>
									<SelectContent side="top">
										{[25, 50, 100, 200].map((pageSize) => (
											<SelectItem
												key={pageSize}
												value={`${pageSize}`}
												aria-label={`Show ${pageSize} items per page`}>
												{pageSize}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									table.previousPage();
									announce(
										`Page ${
											table.getState().pagination.pageIndex + 1
										} of ${table.getPageCount()}`
									);
								}}
								disabled={!table.getCanPreviousPage()}
								aria-label="Previous page"
								title="Previous Page">
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>

							<div
								className="text-sm"
								aria-live="polite"
								aria-atomic="true">
								Page {table.getState().pagination.pageIndex + 1} of{" "}
								{table.getPageCount() || 1}
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									table.nextPage();
									announce(
										`Page ${
											table.getState().pagination.pageIndex + 1
										} of ${table.getPageCount()}`
									);
								}}
								disabled={!table.getCanNextPage()}
								aria-label="Next page"
								title="Next Page">
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</div>
				)}
		</div>
	);
}
