import React from "react";
import { Button } from "./button";
import { Input } from "./input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { Badge } from "./badge";
import { List, LayoutGrid, Search, Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
	label: string;
	value: string;
}

interface TableFiltersProps {
	viewMode?: "table" | "cards";
	setViewMode?: (mode: "table" | "cards") => void;
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	searchPlaceholder?: string;
	filter: string | null;
	setFilter: (filter: string | null) => void;
	filterOptions: FilterOption[];
	filterLabel: string;
	handleClearFilters: () => void;
	hasActiveFilters: boolean;
	showViewToggle?: boolean;
}

export function TableFilters({
	viewMode = "table",
	setViewMode,
	searchTerm,
	setSearchTerm,
	searchPlaceholder = "Search...",
	filter,
	setFilter,
	filterOptions,
	filterLabel,
	handleClearFilters,
	hasActiveFilters,
	showViewToggle = true,
}: TableFiltersProps) {
	// Ref for announcing filter changes to screen readers
	const announceRef = React.useRef<HTMLDivElement>(null);

	// Function to announce filter changes to screen readers
	const announceFilterChange = (message: string) => {
		if (announceRef.current) {
			announceRef.current.textContent = message;
		}
	};

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		if (e.target.value) {
			announceFilterChange(
				`Filtering results by search term: ${e.target.value}`
			);
		} else {
			announceFilterChange("Search filter cleared");
		}
	};

	// Handle filter selection
	const handleFilterSelect = (value: string | null) => {
		setFilter(value);
		const selectedLabel = value
			? filterOptions.find((opt) => opt.value === value)?.label || value
			: "All items";
		announceFilterChange(`Filter set to: ${selectedLabel}`);
	};

	// Handle clear filters
	const handleClear = () => {
		handleClearFilters();
		announceFilterChange("All filters cleared");
	};

	return (
		<>
			{/* Screen reader announcement area (visually hidden) */}
			<div
				ref={announceRef}
				className="sr-only"
				aria-live="polite"
				aria-atomic="true"
			/>

			<div className="flex flex-col sm:flex-row justify-between mb-4">
				{/* Left side: View toggles */}
				{showViewToggle && setViewMode && (
					<div className="flex items-center gap-2 mb-4 sm:mb-0">
						<div className="border rounded-md overflow-hidden">
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 px-2 rounded-none",
									viewMode === "table" && "bg-muted"
								)}
								onClick={() => setViewMode("table")}
								aria-label="Table view"
								aria-pressed={viewMode === "table"}>
								<List className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 px-2 rounded-none",
									viewMode === "cards" && "bg-muted"
								)}
								onClick={() => setViewMode("cards")}
								aria-label="Card view"
								aria-pressed={viewMode === "cards"}>
								<LayoutGrid className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Right side: Search and filters */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Search Input */}
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={searchTerm}
							onChange={handleSearchChange}
							className="pl-8"
							aria-label={searchPlaceholder}
							type="search"
						/>
					</div>

					{/* Filter Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="justify-between text-left font-normal w-full sm:w-40"
								aria-label="Filter options"
								aria-haspopup="true">
								<div className="flex items-center">
									<Filter className="mr-2 h-4 w-4" />
									{filterLabel}
								</div>
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56">
							<DropdownMenuItem
								onSelect={() => handleFilterSelect(null)}
								role="menuitemradio"
								aria-checked={filter === null}>
								All Items
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{filterOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onSelect={() => handleFilterSelect(option.value)}
									role="menuitemradio"
									aria-checked={filter === option.value}>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Applied filters display */}
			{hasActiveFilters && (
				<div
					className="flex items-center gap-2 mt-4 mb-4"
					aria-live="polite"
					aria-atomic="true">
					<span className="text-sm font-medium text-muted-foreground">
						Active filters:
					</span>
					<div className="flex flex-wrap gap-2">
						{filter && (
							<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
								<span>{filterLabel}</span>
								<button
									onClick={() => handleFilterSelect(null)}
									className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
									aria-label={`Remove filter: ${filterLabel}`}>
									<X className="h-3 w-3 text-muted-foreground" />
								</button>
							</Badge>
						)}

						<button
							onClick={handleClear}
							className="text-xs text-muted-foreground hover:text-foreground underline"
							aria-label="Clear all filters">
							Clear all
						</button>
					</div>
				</div>
			)}

			{/* Skip link for keyboard users */}
			<button
				className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-background focus:border focus:rounded"
				onClick={() => {
					// Find and focus the first row in the table or content
					const tableElement = document.querySelector('[role="table"]');
					if (tableElement) {
						(tableElement as HTMLElement).focus();
					}
				}}>
				Skip to table content
			</button>
		</>
	);
}
