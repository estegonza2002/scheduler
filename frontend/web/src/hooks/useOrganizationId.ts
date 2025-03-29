import { getOrgId } from "@/lib/organization";

/**
 * A convenience hook that returns the current organization ID
 * for use in components
 *
 * @deprecated Use the getOrgId() function from @/lib/organization instead
 */
export function useOrganizationId(): string {
	const organizationId = getOrgId();
	console.log("useOrganizationId hook returning:", organizationId);
	return organizationId;
}
