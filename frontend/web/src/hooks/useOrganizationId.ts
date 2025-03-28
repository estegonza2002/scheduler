import { getOrganizationId } from "@/lib/organization";

/**
 * A convenience hook that returns the current organization ID
 * for use in components
 *
 * @deprecated Use the getOrganizationId() function from @/lib/organization instead
 */
export function useOrganizationId(): string {
	const organizationId = getOrganizationId();
	console.log("useOrganizationId hook returning:", organizationId);
	return organizationId;
}
