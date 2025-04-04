import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { Organization } from "@/api/types";
import { OrganizationsAPI, UserAPI } from "@/api";
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
	// List of all organizations user belongs to
	organizations: Organization[];
	// Loading state
	isLoading: boolean;
	// Error state
	error: Error | null;
	// Refresh the current organization and list
	refreshOrganization: () => Promise<void>;
	// Get the current organization ID safely (returns null if none)
	getCurrentOrganizationId: () => string | null;
	// Select a specific organization
	selectOrganization: (organizationId: string) => Promise<void>;
	// Create a new organization
	createOrganization: (
		name: string,
		description?: string
	) => Promise<Organization | null>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined
);

// Removed fallback organization ID constant

export function OrganizationProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Fetch the organization data - Refined logic
	const refreshOrganization = async () => {
		if (!user) {
			setOrganization(null);
			setOrganizations([]);
			setIsLoading(false);
			setError(null);
			return;
		}

		setIsLoading(true);
		setError(null); // Clear previous errors
		try {
			// 1. Fetch all orgs the user is a member of
			const fetchedOrgs = await OrganizationsAPI.getAll();
			setOrganizations(fetchedOrgs);

			// 2. Fetch user profile to get preferred org ID
			let userProfile = null;
			try {
				userProfile = await UserAPI.getProfile(user.uid);
			} catch (profileError) {
				console.warn(
					"Could not fetch user profile for org preference:",
					profileError
				);
				// Continue without profile, will default to first org
			}

			// 3. Determine the current organization
			if (fetchedOrgs && fetchedOrgs.length > 0) {
				const preferredOrgId = userProfile?.currentOrganizationId;
				let currentOrg: Organization | null = null;

				if (
					preferredOrgId &&
					fetchedOrgs.some((org) => org.id === preferredOrgId)
				) {
					// User has a preferred org, and it's in their list
					currentOrg =
						fetchedOrgs.find((org) => org.id === preferredOrgId) || null;
					console.log(
						"Set current organization from user profile:",
						currentOrg?.id
					);
				} else {
					// No preference, or preferred org not found, default to first
					currentOrg = fetchedOrgs[0];
					console.log(
						"Set current organization to first in list:",
						currentOrg?.id
					);
					// If no preference was set, update profile with the default
					if (user && currentOrg && !preferredOrgId) {
						console.log(
							"Updating user profile with default org ID:",
							currentOrg.id
						);
						// Fire and forget profile update, don't block UI
						UserAPI.updateProfile(user.uid, {
							currentOrganizationId: currentOrg.id,
						}).catch((updateError) => {
							console.error(
								"Failed to update user profile with default org:",
								updateError
							);
						});
					}
				}
				setOrganization(currentOrg);
			} else {
				// User is not part of any organization
				console.log("No organizations found for user.");
				setOrganization(null);
				setOrganizations([]); // Ensure list is empty
			}
		} catch (error) {
			console.error("Error loading organizations:", error);
			toast.error("Failed to load organization information");
			setError(
				error instanceof Error
					? error
					: new Error("Failed to load organizations")
			);
			// Keep existing state on error? Or clear? Clearing for now.
			setOrganization(null);
			setOrganizations([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Get the current organization ID safely (returns null)
	const getCurrentOrganizationId = (): string | null => {
		if (organization) {
			// console.log("Using organization ID from context:", organization.id); // Too noisy
			return organization.id;
		}
		console.log("No organization selected - returning null organization ID");
		return null;
	};

	// Select a new organization
	const selectOrganization = async (organizationId: string): Promise<void> => {
		if (!user) return;

		const org = organizations.find((o) => o.id === organizationId);
		if (!org) {
			toast.error("Organization not found in your list.");
			console.error(
				`Attempted to select non-member organization: ${organizationId}`
			);
			return;
		}

		// Optimistic update locally first
		setOrganization(org);

		try {
			// Update the preference in the user's profile
			await UserAPI.updateProfile(user.uid, {
				currentOrganizationId: org.id,
			});
			toast.success(`Switched to ${org.name}`);
			console.log(
				`Switched organization and updated profile for user ${user.uid} to org ${org.id}`
			);
		} catch (err) {
			console.error(
				"Error updating user profile for organization selection:",
				err
			);
			toast.error("Failed to save organization preference.");
			// Revert optimistic update? Or leave it? Leaving for now.
			// Consider fetching profile again to be sure.
		}
	};

	// Create a new organization
	const createOrganization = async (
		name: string,
		description?: string
	): Promise<Organization | null> => {
		if (!user) {
			toast.error("You must be logged in to create an organization.");
			return null;
		}

		// Potentially set loading state specifically for creation?
		// setIsLoading(true); // Maybe use a different loading state?

		try {
			const newOrg = await OrganizationsAPI.create({ name, description });

			if (newOrg) {
				// Manually add to local list and select it
				setOrganizations((prev) => [...prev, newOrg]);
				setOrganization(newOrg);

				// Update user profile to make this the current org
				// Fire-and-forget is acceptable here as the local state is updated
				UserAPI.updateProfile(user.uid, {
					currentOrganizationId: newOrg.id,
				}).catch((updateError) => {
					console.error(
						"Failed to update profile after org creation:",
						updateError
					);
				});

				toast.success(`Organization "${name}" created successfully`);
				return newOrg;
			}
			// API call returned null (should have shown toast)
			return null;
		} catch (err) {
			// Error should have been handled/toasted within OrganizationsAPI.create
			console.error("Error creating organization via context:", err);
			// setError(err instanceof Error ? err : new Error("Failed to create organization")); // Maybe set context error?
			return null; // Indicate failure
		} finally {
			// setIsLoading(false); // Turn off loading state if used
		}
	};

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
		organizations,
		isLoading,
		error,
		refreshOrganization,
		getCurrentOrganizationId,
		selectOrganization,
		createOrganization,
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
