module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.cjs"],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": [
			"babel-jest",
			{ configFile: "./babel.config.cjs" },
		],
	},
	testMatch: ["**/*.a11y.test.{js,jsx,ts,tsx}"],
};
