# Testing Guide

This document provides guidelines and examples for writing tests in our application.

## Testing Stack

Our testing infrastructure uses:

- **Jest**: Testing framework for running tests
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end tests
- **MSW**: For mocking API calls

## Directory Structure

Tests should be placed close to the code they test:

```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  hooks/
    useTheme.ts
    useTheme.test.ts
  providers/
    ThemeProvider.tsx
    ThemeProvider.test.tsx
```

## Writing Different Types of Tests

### Unit Tests

Unit tests focus on testing individual functions or components in isolation.

#### Testing Utility Functions

```typescript
// utils.ts
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

// utils.test.ts
import { formatCurrency } from "./utils";

describe("formatCurrency", () => {
	it("formats numbers as USD currency", () => {
		expect(formatCurrency(1000)).toBe("$1,000.00");
		expect(formatCurrency(10.5)).toBe("$10.50");
		expect(formatCurrency(0)).toBe("$0.00");
	});
});
```

#### Testing Hooks

```typescript
// useCounter.ts
import { useState } from "react";

export function useCounter(initialValue = 0) {
	const [count, setCount] = useState(initialValue);

	const increment = () => setCount((prev) => prev + 1);
	const decrement = () => setCount((prev) => prev - 1);

	return { count, increment, decrement };
}

// useCounter.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
	it("should initialize with the default value", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current.count).toBe(0);
	});

	it("should initialize with the provided value", () => {
		const { result } = renderHook(() => useCounter(10));
		expect(result.current.count).toBe(10);
	});

	it("should increment the counter", () => {
		const { result } = renderHook(() => useCounter());
		act(() => {
			result.current.increment();
		});
		expect(result.current.count).toBe(1);
	});

	it("should decrement the counter", () => {
		const { result } = renderHook(() => useCounter(5));
		act(() => {
			result.current.decrement();
		});
		expect(result.current.count).toBe(4);
	});
});
```

### Component Tests

Component tests verify that UI components render and behave correctly.

```tsx
// Button.tsx
import React from "react";

type ButtonProps = {
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
};

export function Button({ onClick, children, disabled = false }: ButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`btn ${disabled ? "btn-disabled" : "btn-primary"}`}>
			{children}
		</button>
	);
}

// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
	it("renders children correctly", () => {
		render(<Button onClick={() => {}}>Click me</Button>);
		expect(screen.getByRole("button")).toHaveTextContent("Click me");
	});

	it("calls onClick when clicked", () => {
		const handleClick = jest.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = jest.fn();
		render(
			<Button
				onClick={handleClick}
				disabled>
				Click me
			</Button>
		);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("has the correct CSS classes", () => {
		const { rerender } = render(<Button onClick={() => {}}>Click me</Button>);
		expect(screen.getByRole("button")).toHaveClass("btn btn-primary");

		rerender(
			<Button
				onClick={() => {}}
				disabled>
				Click me
			</Button>
		);
		expect(screen.getByRole("button")).toHaveClass("btn btn-disabled");
	});
});
```

### Testing with Context Providers

Many components rely on context providers. We need to set up proper wrappers for testing:

```tsx
// test-utils.tsx
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { OrganizationProvider } from "@/lib/organization";
import { LocationProvider } from "@/lib/location";

const AllProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<OrganizationProvider>
			<LocationProvider>{children}</LocationProvider>
		</OrganizationProvider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
```

Then in your tests:

```tsx
// LocationPage.test.tsx
import { render, screen, waitFor } from "../test-utils";
import { LocationPage } from "./LocationPage";

describe("LocationPage", () => {
	it("renders locations after loading", async () => {
		render(<LocationPage />);

		// First, there should be a loading state
		expect(screen.getByText(/loading/i)).toBeInTheDocument();

		// After loading, locations should appear
		await waitFor(() => {
			expect(screen.getByText("Headquarters")).toBeInTheDocument();
		});
	});
});
```

### Mocking API Calls

Use Mock Service Worker (MSW) to mock API requests:

```typescript
// mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
	rest.get("/api/organizations/:id", (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				id: req.params.id,
				name: "Test Organization",
				description: "A test organization",
			})
		);
	}),

	rest.get("/api/locations", (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json([
				{ id: "1", name: "Headquarters", organizationId: "123" },
				{ id: "2", name: "Branch Office", organizationId: "123" },
			])
		);
	}),
];

// setupTests.ts
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## End-to-End Testing with Cypress

End-to-end tests verify complete user workflows:

```javascript
// cypress/integration/login.spec.js
describe("Login Flow", () => {
	beforeEach(() => {
		cy.visit("/login");
	});

	it("should log in successfully with valid credentials", () => {
		cy.get('input[name="email"]').type("test@example.com");
		cy.get('input[name="password"]').type("password123");
		cy.get('button[type="submit"]').click();

		// Should redirect to dashboard
		cy.url().should("include", "/dashboard");
		cy.contains("Welcome, Test User").should("be.visible");
	});

	it("should show error with invalid credentials", () => {
		cy.get('input[name="email"]').type("test@example.com");
		cy.get('input[name="password"]').type("wrongpassword");
		cy.get('button[type="submit"]').click();

		// Should show error message
		cy.contains("Invalid email or password").should("be.visible");
		// Should still be on login page
		cy.url().should("include", "/login");
	});
});
```

## Testing Best Practices

1. **Test behavior, not implementation details**

   - Focus on what the component does, not how it does it
   - Avoid testing implementation details that might change

2. **Write maintainable tests**

   - Use meaningful test names
   - Follow the AAA pattern (Arrange, Act, Assert)
   - Keep tests independent from each other

3. **Use proper assertions**

   - Be specific in your assertions
   - Use the right matcher for the job

4. **Test edge cases**

   - Empty states
   - Error conditions
   - Boundary values

5. **Mock external dependencies**

   - API calls
   - Third-party services
   - Browser APIs when necessary

6. **Test accessibility**
   - Check that components are accessible
   - Test keyboard navigation when relevant

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run end-to-end tests
npm run cypress:open
```

## Debugging Tests

1. **Use console.log in tests**

   ```typescript
   test("something", () => {
   	const result = someFunction();
   	console.log("Result:", result);
   	expect(result).toBe(expected);
   });
   ```

2. **Use screen.debug() for React components**

   ```typescript
   test("renders correctly", () => {
   	render(<MyComponent />);
   	screen.debug(); // Prints the current DOM
   	expect(screen.getByText("Hello")).toBeInTheDocument();
   });
   ```

3. **Use the --debug flag with Jest**
   ```bash
   npm test -- --debug
   ```

## Further Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
