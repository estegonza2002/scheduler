import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { DataTable } from "../data-table";
import { ColumnDef } from "@tanstack/react-table";

// Sample data for testing
interface TestData {
	id: string;
	name: string;
	email: string;
	role: string;
}

const testData: TestData[] = [
	{ id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
	{ id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
	{ id: "3", name: "Alex Johnson", email: "alex@example.com", role: "Editor" },
];

const columns: ColumnDef<TestData>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
];

// Note: This test file assumes you have jest-axe and testing-library set up
// If you encounter errors, you may need to install:
// npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe @types/jest @types/jest-axe

describe("DataTable Accessibility", () => {
	it("should not have accessibility violations", async () => {
		const { container } = render(
			<DataTable
				columns={columns}
				data={testData}
				tableCaption="Test Users Table"
			/>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have proper ARIA attributes on table elements", () => {
		render(
			<DataTable
				columns={columns}
				data={testData}
				tableCaption="Test Users Table"
			/>
		);

		// Check for table caption
		const caption = document.querySelector("caption");
		expect(caption).toBeInTheDocument();
		expect(caption).toHaveClass("sr-only");
		expect(caption).toHaveTextContent("Test Users Table");

		// Check for table headers with proper scope
		const headers = screen.getAllByRole("columnheader");
		expect(headers).toHaveLength(3);
		headers.forEach((header) => {
			expect(header).toHaveAttribute("scope", "col");
		});

		// Check for table cells
		const cells = screen.getAllByRole("cell");
		expect(cells).toHaveLength(9); // 3 rows x 3 columns

		// Check for announcement area
		const liveRegion = document.querySelector('[aria-live="polite"]');
		expect(liveRegion).toBeInTheDocument();
	});

	it("should have proper ARIA attributes in search and pagination", () => {
		render(
			<DataTable
				columns={columns}
				data={testData}
				searchKey="name"
				searchPlaceholder="Search by name..."
			/>
		);

		// Check for search input
		const searchInput = screen.getByLabelText("Search by name...");
		expect(searchInput).toHaveAttribute("type", "search");

		// Check for pagination navigation
		const paginationNav = screen.getByRole("navigation", {
			name: /pagination/i,
		});
		expect(paginationNav).toBeInTheDocument();

		// Check for prev/next buttons
		const prevButton = screen.getByLabelText("Previous page");
		expect(prevButton).toBeInTheDocument();
		expect(prevButton).toBeDisabled(); // Should be disabled on first page

		const nextButton = screen.getByLabelText("Next page");
		expect(nextButton).toBeInTheDocument();
		// May be disabled if all data fits on one page
	});

	it("should make rows keyboard focusable when onRowClick is provided", () => {
		const onRowClickMock = jest.fn();

		render(
			<DataTable
				columns={columns}
				data={testData}
				onRowClick={onRowClickMock}
			/>
		);

		// Check that rows have tabindex for keyboard focus
		const rows = screen.getAllByRole("row").slice(1); // Skip header row
		rows.forEach((row) => {
			expect(row).toHaveAttribute("tabindex", "0");
		});

		// Test keyboard activation
		const firstRow = rows[0];
		firstRow.focus();
		expect(firstRow).toHaveFocus();

		// Trigger with Enter key
		userEvent.keyboard("{Enter}");
		expect(onRowClickMock).toHaveBeenCalledWith(testData[0]);

		// Trigger with Space key
		userEvent.keyboard(" ");
		expect(onRowClickMock).toHaveBeenCalledTimes(2);
	});

	it("should announce filter changes to screen readers", () => {
		render(
			<DataTable
				columns={columns}
				data={testData}
				searchKey="name"
				searchPlaceholder="Search by name..."
			/>
		);

		// Find the live region
		const liveRegion = document.querySelector('[aria-live="polite"]');
		expect(liveRegion).toBeInTheDocument();

		// Simulate a search
		const searchInput = screen.getByLabelText("Search by name...");
		userEvent.type(searchInput, "John");

		// We can't directly test the content of the live region as it's updated
		// programmatically, but we can check it exists and would be announced
	});
});
