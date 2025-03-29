import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getOrgId } from "./organization";

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
 *
 * @deprecated Use getOrgId from @/lib/organization instead
 */
export function getDefaultOrganizationId(): string {
	return getOrgId();
}
