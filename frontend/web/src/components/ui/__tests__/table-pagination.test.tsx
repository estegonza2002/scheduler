import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { TablePagination } from "../table-pagination";

// Note: This test file assumes you have jest-axe and testing-library set up
// If you encounter errors, you may need to install:
// npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe @types/jest @types/jest-axe

describe("TablePagination Accessibility", () => {
	it("should not have accessibility violations", async () => {
		const { container } = render(
			<TablePagination
				currentPage={1}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={() => {}}
				onPageSizeChange={() => {}}
			/>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should have proper ARIA attributes", () => {
		render(
			<TablePagination
				currentPage={2}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={() => {}}
				onPageSizeChange={() => {}}
			/>
		);

		// Check for navigation role
		const paginationNav = screen.getByRole("navigation");
		expect(paginationNav).toHaveAttribute(
			"aria-label",
			"Pagination Navigation"
		);

		// Check for aria-live region for announcements
		const liveRegion = document.querySelector('[aria-live="polite"]');
		expect(liveRegion).toBeInTheDocument();

		// Check for page buttons
		const prevButton = screen.getByLabelText("Previous page");
		expect(prevButton).toBeInTheDocument();
		expect(prevButton).not.toBeDisabled();

		const nextButton = screen.getByLabelText("Next page");
		expect(nextButton).toBeInTheDocument();
		expect(nextButton).not.toBeDisabled();

		// Check for current page indicator
		const currentPageButton = screen.getByLabelText("Page 2");
		expect(currentPageButton).toHaveAttribute("aria-current", "page");

		// Check for page size selector
		const pageSizeSelector = screen.getByLabelText(
			"Select number of rows per page"
		);
		expect(pageSizeSelector).toBeInTheDocument();
	});

	it("should correctly disable navigation buttons at boundaries", () => {
		// Test first page
		const { rerender } = render(
			<TablePagination
				currentPage={1}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={() => {}}
				onPageSizeChange={() => {}}
			/>
		);

		let prevButton = screen.getByLabelText("Previous page");
		expect(prevButton).toBeDisabled();

		let nextButton = screen.getByLabelText("Next page");
		expect(nextButton).not.toBeDisabled();

		// Test last page
		rerender(
			<TablePagination
				currentPage={5}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={() => {}}
				onPageSizeChange={() => {}}
			/>
		);

		prevButton = screen.getByLabelText("Previous page");
		expect(prevButton).not.toBeDisabled();

		nextButton = screen.getByLabelText("Next page");
		expect(nextButton).toBeDisabled();
	});

	it("should call onPageChange when navigation buttons are clicked", () => {
		const onPageChangeMock = jest.fn();

		render(
			<TablePagination
				currentPage={2}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={onPageChangeMock}
				onPageSizeChange={() => {}}
			/>
		);

		// Click on next button
		const nextButton = screen.getByLabelText("Next page");
		userEvent.click(nextButton);
		expect(onPageChangeMock).toHaveBeenCalledWith(3);

		// Click on previous button
		const prevButton = screen.getByLabelText("Previous page");
		userEvent.click(prevButton);
		expect(onPageChangeMock).toHaveBeenCalledWith(1);

		// Click on specific page
		const page4Button = screen.getByLabelText("Page 4");
		userEvent.click(page4Button);
		expect(onPageChangeMock).toHaveBeenCalledWith(4);
	});

	it("should be keyboard navigable", () => {
		render(
			<TablePagination
				currentPage={2}
				totalPages={5}
				pageSize={10}
				totalItems={48}
				onPageChange={() => {}}
				onPageSizeChange={() => {}}
			/>
		);

		// Get all focusable elements
		const prevButton = screen.getByLabelText("Previous page");
		const pageButtons = screen
			.getAllByRole("button")
			.filter((button) =>
				button.getAttribute("aria-label")?.startsWith("Page ")
			);
		const nextButton = screen.getByLabelText("Next page");
		const pageSizeSelector = screen.getByLabelText(
			"Select number of rows per page"
		);

		// Check the tab order
		prevButton.focus();
		expect(prevButton).toHaveFocus();

		// Tab to page buttons
		pageButtons.forEach((button) => {
			userEvent.tab();
			expect(document.activeElement).toBe(button);
		});

		// Tab to next button
		userEvent.tab();
		expect(nextButton).toHaveFocus();

		// Tab to page size selector
		userEvent.tab();
		expect(pageSizeSelector).toHaveFocus();
	});
});
