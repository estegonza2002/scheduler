import { useOrganization } from "@/lib/organization-context";

/**
 * A convenience hook that returns the current organization ID
 * for use in components
 */
export function useOrganizationId(): string {
	const { getCurrentOrganizationId } = useOrganization();
	const organizationId = getCurrentOrganizationId();
	console.log("useOrganizationId hook returning:", organizationId);
	return organizationId;
}
