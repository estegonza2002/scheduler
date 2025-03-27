import { useOrganization } from "@/lib/organization-context";

/**
 * A convenience hook that returns the current organization ID
 * for use in components
 */
export function useOrganizationId(): string {
	const { getCurrentOrganizationId } = useOrganization();
	return getCurrentOrganizationId();
}
