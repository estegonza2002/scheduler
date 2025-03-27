module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
		"\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
	},
	transform: {
		"^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
	},
	testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
	collectCoverageFrom: [
		"src/**/*.{js,jsx,ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.stories.{js,jsx,ts,tsx}",
	],
	coverageDirectory: "coverage",
	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
	maxWorkers: "50%",
};
