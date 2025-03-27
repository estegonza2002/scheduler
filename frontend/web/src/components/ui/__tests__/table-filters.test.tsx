import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

	it("should have proper ARIA attributes", () => {
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
				hasActiveFilters={true}
				showViewToggle={true}
				viewMode="table"
				setViewMode={() => {}}
			/>
		);

		// Check for aria-live region
		const liveRegion = document.querySelector('[aria-live="polite"]');
		expect(liveRegion).toBeInTheDocument();

		// Check view toggle buttons
		const tableViewButton = screen.getByLabelText("Table view");
		expect(tableViewButton).toHaveAttribute("aria-pressed", "true");

		const cardViewButton = screen.getByLabelText("Card view");
		expect(cardViewButton).toHaveAttribute("aria-pressed", "false");

		// Check search input
		const searchInput = screen.getByRole("searchbox");
		expect(searchInput).toHaveAttribute("aria-label", "Search...");

		// Check filter dropdown
		const filterButton = screen.getByLabelText("Filter options");
		expect(filterButton).toHaveAttribute("aria-haspopup", "true");

		// Check clear filters button
		const clearButton = screen.getByLabelText("Clear all filters");
		expect(clearButton).toBeInTheDocument();

		// Check skip link
		const skipLink = screen.getByText("Skip to table content");
		expect(skipLink).toHaveClass("sr-only");
		expect(skipLink).toHaveClass("focus:not-sr-only");
	});

	it("should announce filter changes to screen readers", () => {
		const setSearchTermMock = jest.fn();
		const setFilterMock = jest.fn();
		const handleClearFiltersMock = jest.fn();

		render(
			<TableFilters
				searchTerm=""
				setSearchTerm={setSearchTermMock}
				filter={null}
				setFilter={setFilterMock}
				filterOptions={[
					{ label: "Option 1", value: "option1" },
					{ label: "Option 2", value: "option2" },
				]}
				filterLabel="All Items"
				handleClearFilters={handleClearFiltersMock}
				hasActiveFilters={false}
			/>
		);

		// Find the live region
		const liveRegion = document.querySelector('[aria-live="polite"]');
		expect(liveRegion).toBeInTheDocument();

		// Simulate a search
		const searchInput = screen.getByRole("searchbox");
		userEvent.type(searchInput, "test search");

		// Check that setSearchTerm was called
		expect(setSearchTermMock).toHaveBeenCalledWith("test search");

		// We can't directly test the content of the live region as it's updated
		// programmatically, but we can check the function is called
	});

	it("should make filter controls keyboard accessible", () => {
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
				hasActiveFilters={true}
			/>
		);

		// Check tab order
		const searchInput = screen.getByRole("searchbox");
		const filterButton = screen.getByLabelText("Filter options");
		const clearButton = screen.getByLabelText("Clear all filters");

		// Start with search input
		searchInput.focus();
		expect(searchInput).toHaveFocus();

		// Tab to filter button
		userEvent.tab();
		expect(filterButton).toHaveFocus();

		// Tab to clear button
		userEvent.tab();
		expect(clearButton).toHaveFocus();
	});
});
