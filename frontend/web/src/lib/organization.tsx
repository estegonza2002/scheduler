import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { Organization } from "@/api/types";
import { OrganizationsAPI } from "@/api";
import { useAuth } from "./auth";
import { supabase } from "./supabase";
import { toast } from "sonner";

// Context type that includes all necessary functionality
interface OrganizationContextType {
	// Current organization from the API
	organization: Organization | null;
	// Loading state
	isLoading: boolean;
	// Refresh the current organization
	refreshOrganization: () => Promise<void>;
	// Get the current organization ID safely (with fallback)
	getCurrentOrganizationId: () => string;
	// Select a specific organization (future support for multi-org)
	selectOrganization?: (organizationId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined
);

// Removed fallback organization ID constant

export function OrganizationProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch the organization data
	const refreshOrganization = async () => {
		try {
			setIsLoading(true);
			const orgs = await OrganizationsAPI.getAll();
			if (orgs.length > 0) {
				// Use the first organization (most common case)
				setOrganization(orgs[0]);
				console.log("Set current organization:", orgs[0].id);
			} else {
				setOrganization(null);
			}
		} catch (error) {
			console.error("Error fetching organization:", error);
			toast.error("Failed to load organization information");
		} finally {
			setIsLoading(false);
		}
	};

	// Get the current organization ID safely (without fallback)
	const getCurrentOrganizationId = (): string => {
		if (organization) {
			console.log("Using organization ID from context:", organization.id);
			return organization.id;
		}

		// Instead of throwing an error, return null
		console.log("No organization found - returning null organization ID");
		return "";
	};

	// Initial data fetch
	useEffect(() => {
		if (user) {
			refreshOrganization();
		} else {
			setOrganization(null);
			setIsLoading(false);
		}
	}, [user]);

	// Set up real-time subscription for organization updates
	useEffect(() => {
		if (!organization) return;

		const subscription = supabase
			.channel("organization-updates")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "organizations",
					filter: `id=eq.${organization.id}`,
				},
				() => {
					refreshOrganization();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [organization]);

	// Context value
	const contextValue: OrganizationContextType = {
		organization,
		isLoading,
		refreshOrganization,
		getCurrentOrganizationId,
	};

	return (
		<OrganizationContext.Provider value={contextValue}>
			{children}
		</OrganizationContext.Provider>
	);
}

// Custom hook to use the organization context
export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error(
			"useOrganization must be used within an OrganizationProvider"
		);
	}
	return context;
}

// Utility function to get organization ID (can be used in any context)
export function getOrgId(): string {
	try {
		// This will work in component contexts
		const { getCurrentOrganizationId } = useOrganization();
		const orgId = getCurrentOrganizationId();

		// If no organization found, return empty string rather than throwing
		if (!orgId) {
			console.log("No organization found in getOrgId - returning empty string");
			return "";
		}

		return orgId;
	} catch (error) {
		// No more error throwing - return empty string
		console.log("Error in getOrgId - returning empty string:", error);
		return "";
	}
}
