module.exports = {
	testEnvironment: "jsdom",
	moduleNameMapper: {
		"\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.cjs",
		"\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.cjs",
	},
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.cjs"],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": [
			"babel-jest",
			{ configFile: "./babel.config.cjs" },
		],
	},
	testMatch: ["**/*.a11y.test.{js,jsx,ts,tsx}"],
};
