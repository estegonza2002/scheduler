import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

// The getDefaultOrganizationId function below was removed because it
// relied on getOrgId which used React hooks incorrectly outside of
// a component context. Any component needing the org ID should use
// the useOrganization hook directly.
