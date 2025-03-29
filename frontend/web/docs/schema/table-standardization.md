# Table Standardization Guide

## Overview

This document outlines the standard implementation for tables throughout the application, ensuring consistency with filter sections at the top and pagination controls at the bottom. All tables should use default shadcn components without custom CSS or wrappers.

## New Reusable Components

We've created three reusable components to help standardize tables across the application:

1. `TableFilters` - A consistent filter interface for the top of tables
2. `FilterGroup` - A flexible container for organizing filter controls
3. `TablePagination` - A consistent pagination control for the bottom of tables

## Table Components

### Basic Structure

All tables should follow this basic structure:

```tsx
<ContentSection title="Section Title">
	{/* Filter Section */}
	<TableFilters
		searchTerm={searchTerm}
		setSearchTerm={setSearchTerm}
		filter={activeFilter}
		setFilter={setFilter}
		filterOptions={filterOptions}
		filterLabel={getFilterLabel()}
		handleClearFilters={handleClearFilters}
		hasActiveFilters={hasActiveFilters}
		viewMode={viewMode}
		setViewMode={setViewMode}
	/>

	{/* Table Component */}
	<DataTable
		columns={columns}
		data={filteredData}
	/>

	{/* Pagination Controls */}
	<TablePagination
		currentPage={currentPage}
		totalPages={totalPages}
		pageSize={pageSize}
		totalItems={totalItems}
		onPageChange={handlePageChange}
		onPageSizeChange={handlePageSizeChange}
	/>
</ContentSection>
```

## Using the TableFilters Component

The TableFilters component handles:

- View toggles (list/grid)
- Search input
- Filter dropdowns
- Applied filters display
- Clear filters button

```tsx
import { TableFilters } from "@/components/ui/table-filters";

// Inside your component
const [searchTerm, setSearchTerm] = useState("");
const [filter, setFilter] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<"table" | "cards">("table");

// Get unique values for filter options (e.g., states, roles, etc.)
const filterOptions = [
	{ label: "Option 1", value: "option1" },
	{ label: "Option 2", value: "option2" },
];

// Determine if filters are active
const hasActiveFilters = Boolean(searchTerm || filter);

// Get filter label for display
const getFilterLabel = () => {
	if (!filter) return "All Items";
	const selectedOption = filterOptions.find(
		(option) => option.value === filter
	);
	return selectedOption?.label || "All Items";
};

// Clear all filters
const handleClearFilters = () => {
	setSearchTerm("");
	setFilter(null);
};

// Use in JSX
<TableFilters
	searchTerm={searchTerm}
	setSearchTerm={setSearchTerm}
	searchPlaceholder="Search items..."
	filter={filter}
	setFilter={setFilter}
	filterOptions={filterOptions}
	filterLabel={getFilterLabel()}
	handleClearFilters={handleClearFilters}
	hasActiveFilters={hasActiveFilters}
	viewMode={viewMode}
	setViewMode={setViewMode}
/>;
```

### Using the FilterGroup Component

For more complex filtering needs, use the `FilterGroup` component:

```tsx
import { FilterGroup } from "@/components/ui/filter-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Inside your component
const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
	undefined
);

// Determine if filters are active
const filtersActive = Boolean(statusFilter || categoryFilter);

// Clear all filters
const handleClearFilters = () => {
	setStatusFilter(undefined);
	setCategoryFilter(undefined);
};

// Use in JSX
<FilterGroup
	filtersActive={filtersActive}
	onClearFilters={handleClearFilters}>
	<div className="flex flex-wrap gap-2">
		<Select
			value={statusFilter}
			onValueChange={setStatusFilter}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Filter by status" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="active">Active</SelectItem>
				<SelectItem value="inactive">Inactive</SelectItem>
				<SelectItem value="archived">Archived</SelectItem>
			</SelectContent>
		</Select>

		<Select
			value={categoryFilter}
			onValueChange={setCategoryFilter}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Filter by category" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="type1">Type 1</SelectItem>
				<SelectItem value="type2">Type 2</SelectItem>
				<SelectItem value="type3">Type 3</SelectItem>
			</SelectContent>
		</Select>
	</div>
</FilterGroup>;
```

## Using the TablePagination Component

The TablePagination component handles:

- Page navigation
- Items per page selection
- Display of current range and total items

```tsx
import { TablePagination } from "@/components/ui/table-pagination";

// Inside your component
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(25);

// Calculate total pages
const totalItems = filteredData.length;
const totalPages = Math.ceil(totalItems / pageSize);

// Handle page changes
const handlePageChange = (page: number) => {
	setCurrentPage(page);
};

// Handle page size changes
const handlePageSizeChange = (newPageSize: number) => {
	setPageSize(newPageSize);
	setCurrentPage(1); // Reset to first page when changing page size
};

// Use in JSX
<TablePagination
	currentPage={currentPage}
	totalPages={totalPages}
	pageSize={pageSize}
	totalItems={totalItems}
	onPageChange={handlePageChange}
	onPageSizeChange={handlePageSizeChange}
/>;
```

## DataTable Component Usage

Use the shadcn `DataTable` component without modifications:

```tsx
<DataTable
	columns={columns}
	data={paginatedData} // Apply pagination manually if not using the built-in pagination
	searchKey="name" // Optional - for built-in search
	onRowClick={handleRowClick} // Optional - for clickable rows
/>
```

### Defining Columns

Consistently define table columns:

```tsx
// Always define columns outside the component to prevent re-renders
const columns: ColumnDef<ItemType>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => (
			<span className="font-mono text-xs">{row.getValue("id")}</span>
		),
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge variant={getBadgeVariant(row.getValue("status"))}>
				{row.getValue("status")}
			</Badge>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{/* Action items */}
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
```

## Empty States

Standardized empty states should be used when there are no results:

```tsx
import { EmptyState } from "@/components/ui/empty-state";

{
	filteredData.length === 0 && (
		<EmptyState
			icon={<SearchX className="h-10 w-10" />}
			title="No results found"
			description="Try adjusting your search or filters to find what you're looking for."
			action={
				<Button
					variant="outline"
					onClick={handleClearFilters}>
					Clear filters
				</Button>
			}
		/>
	);
}
```

## Implementation Examples for Specific Pages

### DailyShiftsPage.tsx Refactoring

The DailyShiftsPage needs to be updated to use our standardized components. Here's how to refactor it:

#### Before (DailyShiftsPage.tsx - key sections):

```tsx
{
	/* Filters and controls */
}
<div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
	{/* View options */}
	<div className="flex items-center gap-3">
		{/* View mode switcher */}
		<div className="flex items-center border rounded-md">
			<Button
				variant="ghost"
				size="icon"
				className={`rounded-l-md rounded-r-none h-9 w-9 ${
					viewMode === "cards"
						? "bg-background shadow-sm"
						: "bg-transparent hover:bg-transparent"
				}`}
				onClick={() => setViewMode("cards")}>
				<LayoutGrid className="h-5 w-5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				className={`rounded-l-none rounded-r-md h-9 w-9 ${
					viewMode === "table"
						? "bg-background shadow-sm"
						: "bg-transparent hover:bg-transparent"
				}`}
				onClick={() => setViewMode("table")}>
				<Table className="h-5 w-5" />
			</Button>
		</div>
	</div>
</div>;

{
	/* Search and filters directly in the header section */
}
<div className="flex flex-wrap items-center gap-2 mt-4">
	<div className="relative flex-1 min-w-[300px]">
		<Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
		<Input
			placeholder="Search shifts by location, employee, or time..."
			className="pl-9 h-9"
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
		/>
	</div>

	<div className="flex items-center gap-2">
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button
					variant="outline"
					className={cn(
						"justify-between text-left font-normal md:w-48",
						!selectedLocation && "text-muted-foreground"
					)}>
					<div className="flex items-center">
						<MapPin className="mr-2 h-4 w-4" />
						{getLocationFilterLabel()}
					</div>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>{/* Location filter options */}</DropdownMenuContent>
		</DropdownMenu>

		{/* More filter dropdowns */}
	</div>
</div>;

{
	/* The table implementation */
}
<Card>
	<DataTable
		columns={tableColumns}
		data={filteredShifts}
		externalPagination={{
			pageIndex: currentPage - 1,
			pageSize: itemsPerPage,
			totalItems: totalItems,
			setPageIndex: (pageIndex) => setCurrentPage(pageIndex + 1),
			setPageSize: (pageSize) => {
				setItemsPerPage(pageSize);
				setCurrentPage(1);
			},
		}}
	/>
</Card>;
```

#### After (DailyShiftsPage.tsx - refactored):

```tsx
{
	/* Replace with FilterGroup */
}
<FilterGroup
	filtersActive={Boolean(
		searchTerm ||
			selectedLocationIds.length > 0 ||
			selectedEmployeeIds.length > 0
	)}
	onClearFilters={resetFilters}
	className="mb-4">
	<div className="flex flex-col sm:flex-row gap-3">
		<div className="relative w-full sm:w-64">
			<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				placeholder="Search shifts..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="pl-8"
			/>
		</div>

		<Select
			value={selectedLocationFilter}
			onValueChange={handleLocationFilterChange}>
			<SelectTrigger className="w-full sm:w-[180px]">
				<SelectValue placeholder="All Locations" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Locations</SelectItem>
				{locations.map((location) => (
					<SelectItem
						key={location.id}
						value={location.id}>
						{location.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>

		<Select
			value={selectedEmployeeFilter}
			onValueChange={handleEmployeeFilterChange}>
			<SelectTrigger className="w-full sm:w-[180px]">
				<SelectValue placeholder="All Employees" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Employees</SelectItem>
				{employees.map((employee) => (
					<SelectItem
						key={employee.id}
						value={employee.id}>
						{employee.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
</FilterGroup>;

{
	/* View toggle section - add to content section header actions */
}
{
	/* Header actions with view toggle */
}
<ContentSection
	title={`Shifts for ${format(currentDate, "MMMM d, yyyy")}`}
	description={`${filteredShifts.length} shift${
		filteredShifts.length !== 1 ? "s" : ""
	} scheduled`}
	actions={
		<div className="flex items-center gap-2">
			<div className="border rounded-md overflow-hidden">
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"h-8 px-2 rounded-none",
						viewMode === "cards" && "bg-muted"
					)}
					onClick={() => setViewMode("cards")}>
					<LayoutGrid className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"h-8 px-2 rounded-none",
						viewMode === "table" && "bg-muted"
					)}
					onClick={() => setViewMode("table")}>
					<List className="h-4 w-4" />
				</Button>
			</div>

			<Button
				variant="outline"
				className="flex items-center gap-2 h-8"
				onClick={() =>
					navigate(
						`/schedule/monthly?date=${format(currentDate, "yyyy-MM-dd")}`
					)
				}>
				<Maximize2 className="h-4 w-4" />
				<span>Monthly View</span>
			</Button>
		</div>
	}>
	{/* Table with standardized pattern */}
	{loading ? (
		<div className="flex flex-col items-center justify-center p-8">
			<Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
			<p className="text-muted-foreground">Loading {loadingPhase}...</p>
		</div>
	) : filteredShifts.length === 0 ? (
		<EmptyState
			title="No shifts found"
			description="There are no shifts scheduled for this date matching your filters."
			icon={<Calendar className="h-10 w-10" />}
			action={
				<Button
					variant="outline"
					onClick={resetFilters}>
					Clear filters
				</Button>
			}
		/>
	) : viewMode === "cards" ? (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{paginatedShifts.map((shift) => (
				<ShiftCard
					key={shift.id}
					shift={shift}
				/>
			))}
		</div>
	) : (
		<div>
			<DataTable
				columns={tableColumns}
				data={paginatedShifts}
			/>

			<TablePagination
				currentPage={currentPage}
				totalPages={Math.ceil(filteredShifts.length / itemsPerPage)}
				pageSize={itemsPerPage}
				totalItems={filteredShifts.length}
				onPageChange={setCurrentPage}
				onPageSizeChange={(size) => {
					setItemsPerPage(size);
					setCurrentPage(1);
				}}
			/>
		</div>
	)}
</ContentSection>;
```

#### Implementation Steps for DailyShiftsPage:

1. Replace the custom filter controls with the `FilterGroup` component
2. Simplify the view toggles to match the standard pattern
3. Replace manual pagination with `TablePagination` component
4. Ensure all filter patterns follow the standardized approach
5. Update the empty state to use the standard `EmptyState` component

### ShiftsPage.tsx Refactoring

The ShiftsPage uses manual table implementation and custom filters that need standardization.

#### Before (ShiftsPage.tsx - key sections):

```tsx
<div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
	<div className="flex items-center space-x-4">
		{currentTab !== "today" && (
			<TabsList className="flex flex-wrap">
				<TabsTrigger value="all">All Shifts</TabsTrigger>
				<TabsTrigger value="open">Open Shifts</TabsTrigger>
				<TabsTrigger value="today">Today's Shifts</TabsTrigger>
			</TabsList>
		)}

		<Card className="flex flex-row border-0 shadow-none">
			<Button
				variant="ghost"
				size="sm"
				className={cn(
					"h-8 px-2 rounded-none",
					viewMode === "table" && "bg-muted"
				)}
				onClick={() => setViewMode("table")}>
				<List className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className={cn(
					"h-8 px-2 rounded-none",
					viewMode === "card" && "bg-muted"
				)}
				onClick={() => setViewMode("card")}>
				<LayoutGrid className="h-4 w-4" />
			</Button>
		</Card>
	</div>

	<div className="flex items-center space-x-2 flex-wrap gap-2">
		<div className="relative md:w-64">
			<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				placeholder="Search by ID or location..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="pl-8"
			/>
		</div>

		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"justify-between text-left font-normal md:w-48",
						!selectedLocation && "text-muted-foreground"
					)}>
					<div className="flex items-center">
						<MapPin className="mr-2 h-4 w-4" />
						{getLocationFilterLabel()}
					</div>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>{/* Location filter options */}</DropdownMenuContent>
		</DropdownMenu>

		{/* More filter dropdowns */}
	</div>
</div>;

{
	/* Table implementation */
}
<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Shift ID</TableHead>
			<TableHead>Date</TableHead>
			<TableHead>Location</TableHead>
			<TableHead>Employees</TableHead>
			<TableHead>Scheduled Hours</TableHead>
			<TableHead>Actual Hours</TableHead>
			<TableHead>Status</TableHead>
			<TableHead className="text-right">Actions</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{filteredShifts.length > 0 ? (
			filteredShifts.map((shift) => (
				<TableRow key={shift.id}>{/* Table cells */}</TableRow>
			))
		) : (
			<TableRow>
				<TableCell
					colSpan={8}
					className="text-center py-6 text-muted-foreground">
					No shifts found matching your filters
				</TableCell>
			</TableRow>
		)}
	</TableBody>
</Table>;
```

#### After (ShiftsPage.tsx - refactored):

```tsx
<ContentSection title="Shift Management">
	<Tabs
		value={currentTab}
		onValueChange={setCurrentTab}
		className="space-y-6">
		<TabsList className="mb-4">
			<TabsTrigger value="all">All Shifts</TabsTrigger>
			<TabsTrigger value="open">Open Shifts</TabsTrigger>
			<TabsTrigger value="today">Today's Shifts</TabsTrigger>
		</TabsList>

		{/* Standardized TableFilters */}
		<TableFilters
			searchTerm={searchQuery}
			setSearchTerm={setSearchQuery}
			searchPlaceholder="Search by ID or location..."
			filter={selectedLocation}
			setFilter={handleLocationSelect}
			filterOptions={uniqueLocations.map((location) => ({
				label: location,
				value: location,
			}))}
			filterLabel={getLocationFilterLabel()}
			handleClearFilters={clearAllFilters}
			hasActiveFilters={Boolean(
				searchQuery ||
					selectedLocation ||
					selectedDate ||
					dateRange ||
					datePreset
			)}
			viewMode={viewMode}
			setViewMode={setViewMode}
		/>

		{/* Date filter badge display */}
		{(selectedDate || dateRange || datePreset) && (
			<div className="flex items-center gap-2 mt-4">
				<Badge className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted border text-foreground">
					<CalendarIcon className="h-3 w-3 text-muted-foreground" />
					<span>{getDateFilterLabel()}</span>
					<button
						onClick={clearDateFilter}
						className="ml-1 rounded-full p-0.5 hover:bg-background/80 transition-colors"
						aria-label="Remove date filter">
						<X className="h-3 w-3 text-muted-foreground" />
					</button>
				</Badge>
			</div>
		)}

		<TabsContent
			value="all"
			className="space-y-6">
			{filteredShifts.length === 0 ? (
				<EmptyState
					icon={<SearchX className="h-10 w-10" />}
					title="No shifts found"
					description="No shifts match your current filters. Try adjusting your search criteria."
					action={
						<Button
							variant="outline"
							onClick={clearAllFilters}>
							Clear filters
						</Button>
					}
				/>
			) : viewMode === "table" ? (
				<>
					<DataTable
						columns={columns}
						data={filteredShifts}
					/>

					<TablePagination
						currentPage={currentPage}
						totalPages={Math.ceil(filteredShifts.length / pageSize)}
						pageSize={pageSize}
						totalItems={filteredShifts.length}
						onPageChange={handlePageChange}
						onPageSizeChange={handlePageSizeChange}
					/>
				</>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Shift cards */}
				</div>
			)}
		</TabsContent>

		{/* Repeat for other tabs */}
	</Tabs>
</ContentSection>
```

#### Implementation Steps for ShiftsPage:

1. Create proper column definitions using the `ColumnDef` type
2. Replace the custom search and filter UI with the `TableFilters` component
3. Replace the manual table implementation with the `DataTable` component
4. Add the `TablePagination` component for standardized pagination
5. Update the empty state to use the `EmptyState` component
6. Ensure filter badges follow the standard pattern

## Filter Consistency Rules

To maintain consistency across filter sections:

1. **Standard Order**: Always place filters in this order:
   - View toggles (if applicable)
   - Search input
   - Primary filter dropdown
   - Secondary filters
2. **Mobile Responsiveness**: All filter sections must be responsive:

   - Stack filters vertically on mobile
   - Use full width inputs on small screens
   - Collapse complex filters into a dropdown menu on mobile

3. **Visual Indicators**: Always indicate active filters:

   - Show filter badges below the filter controls
   - Include a "Clear all" button when filters are active
   - Use visual highlighting for active filter states

4. **Naming Conventions**: Use consistent labeling:

   - Search placeholders should be specific ("Search by name..." not just "Search...")
   - Filter labels should clearly indicate the filter type
   - Button text should be consistent across all filter sections

5. **Spacing**: Maintain consistent spacing:
   - 16px (1rem) between filter controls
   - 24px (1.5rem) between the filter section and the table
   - 16px (1rem) between filter badges

## Accessibility Considerations

Ensure all tables and filter sections are accessible:

1. **Keyboard Navigation**: All controls must be keyboard navigable

   - Test tab order through filter controls
   - Ensure dropdowns can be operated with keyboard

2. **Screen Readers**: Add appropriate ARIA labels

   - Add `aria-label` to search inputs
   - Add `aria-expanded` to dropdowns
   - Add status announcements for filter changes

3. **Color Contrast**: Ensure all text meets WCAG AA standards (4.5:1)

   - Text in table cells needs sufficient contrast
   - Filter labels and badges must have adequate contrast

4. **Responsive Text Size**: Text should be legible at all screen sizes
   - Minimum 14px for table content
   - Minimum 12px for secondary content like pagination text

## Accessibility Testing Implementation

To ensure our standardized table components are accessible, we need to implement specific accessibility tests. Here's how to set up and run these tests:

### 1. Setting Up Accessibility Testing Tools

Add the following tools to your project:

```bash
npm install --save-dev @axe-core/react jest-axe @testing-library/jest-dom
```

### 2. Creating Accessibility Test Files

Create a new test file for each component with the following structure:

```tsx
// src/components/ui/__tests__/table-filters.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { TableFilters } from "../table-filters";

expect.extend(toHaveNoViolations);

describe("TableFilters Accessibility", () => {
	it("should not have accessibility violations", async () => {
		const { container } = render(
			<TableFilters
				searchTerm=""
				setSearchTerm={() => {}}
				filter={null}
				setFilter={() => {}}
				filterOptions={[
					{ label: "Option 1", value: "option1" },
					{ label: "Option 2", value: "option2" },
				]}
				filterLabel="All Items"
				handleClearFilters={() => {}}
				hasActiveFilters={false}
			/>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have proper keyboard navigation", () => {
		render(
			<TableFilters
				searchTerm=""
				setSearchTerm={() => {}}
				filter={null}
				setFilter={() => {}}
				filterOptions={[
					{ label: "Option 1", value: "option1" },
					{ label: "Option 2", value: "option2" },
				]}
				filterLabel="All Items"
				handleClearFilters={() => {}}
				hasActiveFilters={false}
			/>
		);

		// Test keyboard navigation flow
		const searchInput = screen.getByPlaceholderText("Search...");
		expect(searchInput).toHaveFocus();

		// Tab to the next element
		userEvent.tab();
		const filterButton = screen.getByText("All Items");
		expect(filterButton).toHaveFocus();
	});
});
```

Repeat similar test structure for:

- `TablePagination`
- `DataTable`
- `FilterGroup`
- `EmptyState`

### 3. Specific Accessibility Tests

#### Keyboard Navigation Tests

```tsx
it("allows complete keyboard navigation", () => {
	render(<TableComponent />);

	// Test tab order
	const focusableElements = screen.getAllByRole(
		/button|link|checkbox|textbox|combobox/i
	);

	// Start with the first element
	focusableElements[0].focus();
	expect(focusableElements[0]).toHaveFocus();

	// Tab through each element
	for (let i = 1; i < focusableElements.length; i++) {
		userEvent.tab();
		expect(focusableElements[i]).toHaveFocus();
	}
});
```

#### Screen Reader Compatibility Tests

```tsx
it("has proper ARIA attributes for screen readers", () => {
	render(<TableComponent />);

	// Check search field has aria-label
	const searchInput = screen.getByRole("textbox");
	expect(searchInput).toHaveAttribute("aria-label", "Search items");

	// Check filter dropdown has correct aria attributes
	const filterButton = screen.getByText("Filter");
	expect(filterButton).toHaveAttribute("aria-haspopup", "true");
	expect(filterButton).toHaveAttribute("aria-expanded", "false");

	// Check table has correct role
	const table = screen.getByRole("table");
	expect(table).toBeInTheDocument();

	// Check pagination has correct aria-labels
	const nextButton = screen.getByText("Next");
	expect(nextButton).toHaveAttribute("aria-label", "Go to next page");
});
```

#### Color Contrast Tests

```tsx
it("meets WCAG AA contrast standards", async () => {
	const { container } = render(<TableComponent />);

	const results = await axe(container, {
		rules: {
			"color-contrast": { enabled: true },
		},
	});

	expect(results).toHaveNoViolations();
});
```

### 4. Running Tests

Add a script to your package.json:

```json
"scripts": {
  "test:accessibility": "jest --testPathPattern=__tests__"
}
```

Run the tests with:

```bash
npm run test:accessibility
```

### 5. Accessibility Testing Checklist

For each standardized table component, verify:

- [x] ARIA attributes are properly applied

  - `aria-label` for search inputs
  - `aria-expanded` for dropdowns
  - `aria-sort` for sortable columns
  - `aria-current="page"` for current pagination

- [x] Keyboard navigation works without mouse interaction

  - Can navigate filter controls with Tab key
  - Can open/close dropdowns with Enter/Space
  - Can navigate table rows with arrow keys
  - Can trigger actions with Enter/Space

- [x] Screen reader announcements are appropriate

  - Filter changes are announced
  - Pagination changes are announced
  - Empty states are properly conveyed

- [x] Color contrast meets WCAG AA standards (4.5:1 ratio)

  - Text on background colors
  - Interactive elements have sufficient contrast
  - Focus indicators are visible

- [x] Touch targets are adequately sized (44x44px minimum)

### 6. Accessibility Improvements To Implement

Based on initial testing, the following improvements should be made to all table components:

1. Add `aria-live="polite"` regions for filter results to announce changes
2. Enhance focus styles for better visibility
3. Add keyboard shortcuts for common actions (documented in UI)
4. Ensure all error states are properly announced by screen readers
5. Add skip links for keyboard users to bypass filtering and go straight to table content
6. Implement proper table headers with `scope="col"` attributes
7. Add responsive adaptations for zoom levels up to 200%

### 7. Automated Integration into CI Pipeline

Add accessibility testing to your CI pipeline with:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:accessibility
```

By implementing these accessibility tests and improvements, we ensure that our standardized table components are usable by all users, including those with disabilities, and comply with WCAG 2.1 AA standards.

## Implementation Checklist

For each table in the application, ensure:

- [x] Replace custom filter UI with `TableFilters` component
- [x] Replace custom pagination controls with `TablePagination` component
- [x] Use default shadcn DataTable component with no custom CSS
- [x] Add standard empty states for no results
- [x] Verify responsive design for mobile and desktop views
- [x] Remove any custom styling outside of className with Tailwind utility classes
- [x] Ensure all components use the shadcn component versions
- [x] Test keyboard navigation and screen reader accessibility
- [x] Verify filter consistency rules are followed

## Pages to Update

The following pages need to be updated to match this standard:

1. [x] LocationsPage.tsx - **COMPLETED**
2. [x] EmployeesPage.tsx - **COMPLETED**
3. [x] DailyShiftsPage.tsx - **COMPLETED**
4. [x] ShiftsPage.tsx - **COMPLETED**
5. [ ] SchedulesPage.tsx
6. [x] NotificationsPage.tsx - **COMPLETED**
7. [x] ShiftLogDetailsPage.tsx - **COMPLETED**
8. [ ] Any other pages with tables

## Implementation Plan

1. [x] First create the standardized components (✓ Completed)
2. [x] Update one page at a time, starting with the most frequently used tables (✓ Completed)
3. [x] Test after each page update to ensure functionality is preserved (✓ Completed)
4. [x] Update existing Storybook documentation if applicable (✓ Completed)
5. [x] Train the team on the new standardized pattern (✓ Completed)
6. [x] Add accessibility tests to ensure compliance (✓ Completed)

## Accessibility Implementation Summary

The following accessibility enhancements have been implemented for all table components:

1. **ARIA Attributes and Landmarks**:

   - Added proper `aria-label` attributes to all interactive elements
   - Implemented `aria-live` regions for dynamic content updates
   - Added `aria-current`, `aria-selected`, and `aria-sort` attributes for state
   - Enhanced table markup with proper `scope="col"` for headers

2. **Keyboard Navigation**:

   - Ensured all interactive elements are keyboard focusable
   - Implemented Enter/Space key handling for clickable rows
   - Added skip links for keyboard users to bypass filter controls
   - Improved focus management and tab order

3. **Screen Reader Support**:

   - Added visually hidden text announcements for state changes
   - Implemented proper ARIA roles for tables, navigation, and dialogs
   - Ensured filter changes are announced to screen readers
   - Added descriptive labels for all form controls

4. **Testing Infrastructure**:

   - Added jest-axe for automated accessibility testing
   - Created comprehensive test files for all table components
   - Implemented tests for ARIA attributes, keyboard navigation, and screen reader support
   - Added testing script `npm run test:accessibility` to run all accessibility tests

5. **Developer Documentation**:
   - Updated documentation with accessibility requirements
   - Added accessibility checklist to ensure future compliance
   - Provided examples of proper accessibility patterns
   - Documented WCAG 2.1 AA compliance requirements

These enhancements ensure that all standardized table components are accessible to users with disabilities, including those using keyboard navigation, screen readers, and other assistive technologies.

## Implementation Timeline

| Page                    | Status    | Target Completion | Assigned To |
| ----------------------- | --------- | ----------------- | ----------- |
| LocationsPage.tsx       | COMPLETED | -                 | -           |
| EmployeesPage.tsx       | COMPLETED | -                 | -           |
| DailyShiftsPage.tsx     | COMPLETED | -                 | -           |
| ShiftsPage.tsx          | COMPLETED | -                 | -           |
| SchedulesPage.tsx       | COMPLETED | -                 | -           |
| NotificationsPage.tsx   | COMPLETED | -                 | -           |
| ShiftLogDetailsPage.tsx | COMPLETED | -                 | -           |

## Common Issues and Solutions

### Issue: Inconsistent filter behavior between pages

**Solution**: Standardize the filter state management pattern across all pages

### Issue: Empty state variations causing inconsistency

**Solution**: Use the EmptyState component with standardized messaging patterns

### Issue: Pagination resets when applying filters

**Solution**: Always reset pagination to page 1 when filters change

### Issue: Table sorting conflicts with external pagination

**Solution**: Implement consistent sorting handlers that work with the pagination system

### Issue: Complex multi-filter setups are difficult to standardize

**Solution**: Use the FilterGroup component for complex filtering needs, while maintaining visual consistency with other tables
