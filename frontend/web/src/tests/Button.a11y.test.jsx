import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./mocks/button";

// Add custom matcher
expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
	it("should not have accessibility violations", async () => {
		const { container } = render(<Button>Click me</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should not have accessibility violations when disabled", async () => {
		const { container } = render(<Button disabled>Click me</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should not have accessibility violations with different variants", async () => {
		const { container } = render(
			<>
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should not have accessibility violations with different sizes", async () => {
		const { container } = render(
			<>
				<Button size="default">Default</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">Icon</Button>
			</>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should not have accessibility violations with icon", async () => {
		const { container } = render(
			<Button>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					className="mr-2 h-4 w-4">
					<circle
						cx="12"
						cy="12"
						r="10"
					/>
					<line
						x1="12"
						y1="8"
						x2="12"
						y2="16"
					/>
					<line
						x1="8"
						y1="12"
						x2="16"
						y2="12"
					/>
				</svg>
				Add Item
			</Button>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("should not have accessibility violations when used as a link button", async () => {
		const { container } = render(
			<Button onClick={() => (window.location.href = "#example")}>
				Link Button
			</Button>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
