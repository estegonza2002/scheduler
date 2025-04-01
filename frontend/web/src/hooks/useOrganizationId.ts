import { useState, useEffect } from "react";
import { getCurrentOrganizationId } from "@/lib/organization-utils";

/**
 * A convenience hook that returns the current organization ID
 * for use in components
 *
 * @deprecated Use the getOrgId() function from @/lib/organization instead
 */
export function useOrganizationId(): string {
	const [organizationId, setOrganizationId] = useState<string>("");

	useEffect(() => {
		async function fetchOrganizationId() {
			const id = await getCurrentOrganizationId();
			setOrganizationId(id || "");
			console.log("useOrganizationId hook updated to:", id);
		}

		fetchOrganizationId();
	}, []);

	return organizationId;
}
