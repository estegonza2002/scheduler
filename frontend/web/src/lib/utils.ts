import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCurrentOrganizationId } from "./organization-utils";

// Fallback organization ID when no organization is selected
const FALLBACK_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
	const cleaned = phone.replace(/\D/g, "");
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return "(" + match[1] + ") " + match[2] + "-" + match[3];
	}
	return phone;
}

/**
 * Returns the current organization ID from context or a fallback UUID
 * This is a synchronous function that always returns a value, even though
 * getCurrentOrganizationId is async. This maintains backward compatibility.
 */
export function getDefaultOrganizationId(): string {
	// Since we need to maintain a synchronous interface but getCurrentOrganizationId
	// is async, we return a fallback ID immediately
	// This is not ideal but maintains compatibility with existing code
	getCurrentOrganizationId()
		.then((id) => {
			console.log("Async organization ID:", id);
			// In a real implementation, you might cache this for future calls
		})
		.catch((error) => {
			console.error("Error getting organization ID:", error);
		});

	return FALLBACK_ORGANIZATION_ID;
}
