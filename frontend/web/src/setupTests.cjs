// Import any global test setup here
require("@testing-library/jest-dom");

// Add any global test setup code here
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));
