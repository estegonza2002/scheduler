import React from "react";
import { createRoot } from "react-dom/client";
import { axe, toHaveNoViolations, AxeResults } from "jest-axe";
import "@testing-library/jest-dom";
import { expect } from "@jest/globals";

// Define the custom matcher type
declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveNoViolations(): R;
		}
	}
}

// Add the custom matcher to Jest
expect.extend({
	toHaveNoViolations: (results: AxeResults) => {
		const pass = results.violations.length === 0;
		return {
			message: () =>
				pass
					? "expected accessibility violations"
					: `found ${results.violations.length} accessibility violations`,
			pass,
		};
	},
});

// Create a helper function for accessibility testing in component tests
export async function checkAccessibility(
	component: React.ReactElement
): Promise<void> {
	const container = document.createElement("div");
	document.body.appendChild(container);

	const root = createRoot(container);
	root.render(component);

	const results = await axe(container);
	(
		expect(results) as unknown as jest.Matchers<AxeResults>
	).toHaveNoViolations();

	root.unmount();
	container.remove();
}
