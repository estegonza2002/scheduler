import React from "react";
import { createRoot } from "react-dom/client";
import { axe, toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";
import { expect } from "@jest/globals";

// Add the custom matcher to Jest
expect.extend(toHaveNoViolations);

// Create a helper function for accessibility testing in component tests
export async function checkAccessibility(
	component: React.ReactElement
): Promise<void> {
	const container = document.createElement("div");
	document.body.appendChild(container);

	const root = createRoot(container);
	root.render(component);

	const results = await axe(container);
	expect(results).toHaveNoViolations();

	root.unmount();
	container.remove();
}
