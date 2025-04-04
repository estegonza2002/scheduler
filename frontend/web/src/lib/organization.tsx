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
import { toast } from "sonner";
import { db } from "./firebase";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

// Add the helper function (copied from api.ts)
const mapDocToOrganization = (docData: any, id: string): Organization => {
	// Ensure timestamps are handled correctly (e.g., converted to ISO strings)
	const createdAt =
		docData.createdAt instanceof Timestamp
			? docData.createdAt.toDate().toISOString()
			: docData.createdAt;
	const updatedAt =
		docData.updatedAt instanceof Timestamp
			? docData.updatedAt.toDate().toISOString()
			: docData.updatedAt;

	// Map other fields, handling potential undefined values and camelCase
	return {
		id: id,
		name: docData.name || "",
		description: docData.description || undefined,
		logoUrl: docData.logoUrl || undefined,
		ownerId: docData.ownerId || "",
		createdAt: createdAt,
		updatedAt: updatedAt,
		address: docData.address || undefined,
		contactEmail: docData.contactEmail || undefined,
		contactPhone: docData.contactPhone || undefined,
		website: docData.website || undefined,
		businessHours: docData.businessHours || undefined,
		stripeCustomerId: docData.stripeCustomerId || undefined,
		subscriptionId: docData.subscriptionId || undefined,
		subscriptionStatus: docData.subscriptionStatus || undefined,
		subscriptionPlan: docData.subscriptionPlan || undefined,
	};
};

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

	// Set up real-time subscription for organization updates using Firestore
	useEffect(() => {
		if (!organization?.id) return () => {}; // No org selected, nothing to subscribe to

		console.log(
			`Setting up Firestore listener for organization: ${organization.id}`
		);
		const orgRef = doc(db, "organizations", organization.id);

		const unsubscribe = onSnapshot(
			orgRef,
			(docSnap) => {
				if (docSnap.exists()) {
					console.log("Organization data updated via snapshot:", docSnap.id);
					// Map data and update state
					const updatedOrg = mapDocToOrganization(docSnap.data(), docSnap.id);
					setOrganization(updatedOrg);
				} else {
					console.log("Current organization document deleted.");
					setOrganization(null);
					// Optionally, trigger refreshOrganization to load other orgs if needed
					// refreshOrganization();
				}
			},
			(error) => {
				console.error("Error listening to organization updates:", error);
				toast.error("Real-time connection issue with organization data.");
			}
		);

		// Cleanup function to unsubscribe when component unmounts or org changes
		return () => {
			console.log(
				`Unsubscribing from Firestore listener for org: ${organization.id}`
			);
			unsubscribe();
		};
	}, [organization?.id]); // Rerun effect if the organization ID changes

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
