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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 25,
	});

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
			: setPagination,
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
		if (isExternalPagination) {
			return table.getRowModel().rows;
		} else {
			return table.getRowModel().rows;
		}
	};

	return (
		<div>
			{/* Search Controls - Top Section */}
			{searchKey && (
				<div className="flex items-center py-2">
					<Input
						placeholder={searchPlaceholder}
						value={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table.getColumn(searchKey)?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
				</div>
			)}

			{/* Table */}
			{!hideTable && (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							{table
								.getHeaderGroups()
								.map((headerGroup: HeaderGroup<TData>) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map(
											(header: Header<TData, unknown>) => {
												return (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															  )}
													</TableHead>
												);
											}
										)}
									</TableRow>
								))}
						</TableHeader>
						<TableBody>
							{renderRows().length ? (
								renderRows().map((row: Row<TData>) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className={
											onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
										}
										onClick={
											onRowClick ? () => onRowClick(row.original) : undefined
										}>
										{row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Pagination Controls - Bottom Section */}
			{!hidePagination && (
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
					<div className="flex items-center space-x-6">
						<div className="text-sm text-muted-foreground">
							Showing{" "}
							{isExternalPagination ? (
								<span>
									{externalPagination.totalItems > 0
										? externalPagination.pageIndex *
												externalPagination.pageSize +
										  1
										: 0}{" "}
									to{" "}
									{Math.min(
										(externalPagination.pageIndex + 1) *
											externalPagination.pageSize,
										externalPagination.totalItems
									)}{" "}
									of {externalPagination.totalItems} entries
								</span>
							) : (
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
							)}
						</div>

						<div className="flex items-center space-x-2">
							<p className="text-sm text-muted-foreground">Items per page</p>
							<Select
								value={
									isExternalPagination
										? `${externalPagination.pageSize}`
										: `${table.getState().pagination.pageSize}`
								}
								onValueChange={(value) => {
									const newPageSize = Number(value);
									if (isExternalPagination) {
										externalPagination.setPageSize(newPageSize);
										externalPagination.setPageIndex(0);
									} else {
										table.setPageSize(newPageSize);
									}
								}}>
								<SelectTrigger className="h-8 w-[80px]">
									<SelectValue
										placeholder={
											isExternalPagination
												? externalPagination.pageSize
												: table.getState().pagination.pageSize
										}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[25, 50, 100, 200].map((pageSize) => (
										<SelectItem
											key={pageSize}
											value={`${pageSize}`}>
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
								if (isExternalPagination) {
									externalPagination.setPageIndex(
										Math.max(0, externalPagination.pageIndex - 1)
									);
								} else {
									table.previousPage();
								}
							}}
							disabled={
								isExternalPagination
									? externalPagination.pageIndex === 0
									: !table.getCanPreviousPage()
							}>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>

						<div className="text-sm">
							Page{" "}
							{isExternalPagination
								? externalPagination.pageIndex + 1
								: table.getState().pagination.pageIndex + 1}{" "}
							of{" "}
							{isExternalPagination
								? Math.ceil(
										externalPagination.totalItems / externalPagination.pageSize
								  ) || 1
								: table.getPageCount() || 1}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (isExternalPagination) {
									const maxPage =
										Math.ceil(
											externalPagination.totalItems /
												externalPagination.pageSize
										) - 1;
									externalPagination.setPageIndex(
										Math.min(maxPage, externalPagination.pageIndex + 1)
									);
								} else {
									table.nextPage();
								}
							}}
							disabled={
								isExternalPagination
									? externalPagination.pageIndex >=
									  Math.ceil(
											externalPagination.totalItems /
												externalPagination.pageSize
									  ) -
											1
									: !table.getCanNextPage()
							}>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
