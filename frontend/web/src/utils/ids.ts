// Helper function for generating unique IDs that works in all browsers
export function generateUniqueId(): string {
	// Use crypto.randomUUID if available (modern browsers)
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	// Fallback for browsers without crypto.randomUUID
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}
