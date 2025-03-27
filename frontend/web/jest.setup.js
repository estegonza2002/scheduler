// jest.setup.js
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

// Add jest-axe matchers
expect.extend(toHaveNoViolations);
