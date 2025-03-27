/**
 * Debug utilities to help troubleshoot React errors
 */

/**
 * Enhanced console error logging
 * Call this function at the application entry point to get more detailed React error logs
 */
export function setupErrorLogging() {
	const originalConsoleError = console.error;

	console.error = function (...args) {
		// Check if this is a React Fragment prop type error
		if (
			args[0] &&
			typeof args[0] === "string" &&
			args[0].includes("React.Fragment")
		) {
			console.warn("FRAGMENT ERROR DETECTED:", args);
			console.trace("Fragment error stack trace:");
		}

		// Check if this is a failed network request
		if (args[0] && args[0].toString().includes("Failed to load resource")) {
			console.warn("NETWORK ERROR DETECTED:", args);
			console.trace("Network error stack trace:");
		}

		// Call the original console.error
		originalConsoleError.apply(console, args);
	};
}
