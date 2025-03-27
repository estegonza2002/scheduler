import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOrganization } from "./organization-context";

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
 * This should be used in components that require an organization ID
 */
export function getDefaultOrganizationId(): string {
	try {
		// This won't work in non-component contexts, so we use try/catch
		const { getCurrentOrganizationId } = useOrganization();
		return getCurrentOrganizationId();
	} catch (error) {
		// Fall back to default if we're not in a component context
		console.warn("Using fallback organization ID - not in component context");
	}

	// Fallback to the UUID from our existing organization in Supabase
	return "79a0cd70-b7e6-4ea4-8b00-a88dfea38e25";
}
