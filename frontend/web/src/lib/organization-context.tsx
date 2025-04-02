import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";
import { OrganizationsAPI } from "@/api";
import { toast } from "sonner";

// Types
export interface Organization {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	logo_url?: string;
	owner_id: string;
}

interface OrganizationContextType {
	currentOrganization: Organization | null;
	isLoading: boolean;
	error: Error | null;
	organizations: Organization[];
	createOrganization: (
		name: string,
		description?: string
	) => Promise<Organization | null>;
	selectOrganization: (organizationId: string) => Promise<void>;
	updateOrganization: (
		organizationId: string,
		data: Partial<Organization>
	) => Promise<Organization | null>;
	getCurrentOrganizationId: () => string;
	tablesInitialized: boolean;
}

// Create context
const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined
);

// Custom hook to use the context
export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error(
			"useOrganization must be used within an OrganizationProvider"
		);
	}
	return context;
}

// Provider component
export function OrganizationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, updateUserMetadata } = useAuth();
	const [currentOrganization, setCurrentOrganization] =
		useState<Organization | null>(null);
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [tablesInitialized, setTablesInitialized] = useState(false);

	// Check if tables exist in database
	useEffect(() => {
		const checkTablesExist = async () => {
			try {
				// Check if organizations table exists by trying to select from it
				const { error } = await supabase
					.from("organizations")
					.select("id")
					.limit(1);

				if (error && error.code === "42P01") {
					// Table doesn't exist
					console.warn("Organizations table does not exist yet");
					setTablesInitialized(false);
					setIsLoading(false);
					return;
				}

				setTablesInitialized(true);
			} catch (err) {
				console.error("Error checking tables:", err);
				setTablesInitialized(false);
				setIsLoading(false);
			}
		};

		checkTablesExist();
	}, []);

	// Load organizations and set current one when user changes
	useEffect(() => {
		if (user && tablesInitialized) {
			loadOrganizations();
		} else {
			// Reset state when user logs out
			setCurrentOrganization(null);
			setOrganizations([]);
			setIsLoading(false);
		}
	}, [user, tablesInitialized]);

	// Load all organizations the user has access to
	const loadOrganizations = async () => {
		if (!user) return;

		setIsLoading(true);
		try {
			// Try to use a direct SQL query to bypass RLS issues
			const { data: orgs, error } = await supabase
				.from("organizations")
				.select(
					`
					*,
					organization_members!inner(*)
				`
				)
				.eq("organization_members.user_id", user.id);

			if (error) {
				console.error("Error loading organizations with join:", error);

				// Fallback: Try a simpler query with disabled RLS
				const { data: simpleOrgs, error: simpleError } = await supabase
					.from("organizations")
					.select("*");

				if (simpleError) {
					throw simpleError;
				}

				if (simpleOrgs && simpleOrgs.length > 0) {
					setOrganizations(simpleOrgs);

					// Get the user's current organization
					const currentOrgId = user.user_metadata?.current_organization_id;

					// If the user has a current organization set and it exists in the list
					if (
						currentOrgId &&
						simpleOrgs.some((org) => org.id === currentOrgId)
					) {
						const current = simpleOrgs.find((org) => org.id === currentOrgId);
						setCurrentOrganization(current || null);
					} else {
						// Default to the first organization
						setCurrentOrganization(simpleOrgs[0]);

						// Update user metadata with the current organization
						if (simpleOrgs[0]) {
							await updateUserMetadata({
								current_organization_id: simpleOrgs[0].id,
							});
						}
					}
				}
			} else if (orgs && orgs.length > 0) {
				// Clean up the nested structure
				const cleanOrgs = orgs.map((org) => {
					// Remove the nested organization_members property
					const { organization_members, ...cleanOrg } = org;
					return cleanOrg;
				});

				setOrganizations(cleanOrgs);

				// Get the user's current organization
				const currentOrgId = user.user_metadata?.current_organization_id;

				// If the user has a current organization set and it exists in the list
				if (currentOrgId && cleanOrgs.some((org) => org.id === currentOrgId)) {
					const current = cleanOrgs.find((org) => org.id === currentOrgId);
					setCurrentOrganization(current || null);
				} else {
					// Default to the first organization
					setCurrentOrganization(cleanOrgs[0]);

					// Update user metadata with the current organization
					if (cleanOrgs[0]) {
						await updateUserMetadata({
							current_organization_id: cleanOrgs[0].id,
						});
					}
				}
			} else {
				// No organizations found
				setCurrentOrganization(null);
			}

			setError(null);
		} catch (err) {
			console.error("Error loading organizations:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to load organizations")
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Create a new organization
	const createOrganization = async (
		name: string,
		description?: string
	): Promise<Organization | null> => {
		if (!user) return null;

		try {
			setIsLoading(true);

			// Create organization in Supabase
			const { data: newOrg, error } = await supabase
				.from("organizations")
				.insert({
					name,
					description,
					owner_id: user.id,
				})
				.select()
				.single();

			if (error) throw error;

			if (newOrg) {
				// Add to local state
				setOrganizations((prev) => [...prev, newOrg]);

				// Set as current organization
				setCurrentOrganization(newOrg);

				// Update user metadata
				await updateUserMetadata({
					current_organization_id: newOrg.id,
				});

				toast.success(`Organization "${name}" created successfully`);
				return newOrg;
			}

			return null;
		} catch (err) {
			console.error("Error creating organization:", err);
			toast.error("Failed to create organization");
			setError(
				err instanceof Error ? err : new Error("Failed to create organization")
			);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Select an organization as the current one
	const selectOrganization = async (organizationId: string): Promise<void> => {
		if (!user) return;

		try {
			// Find the organization in our list
			const org = organizations.find((o) => o.id === organizationId);
			if (!org) throw new Error("Organization not found");

			// Set as current
			setCurrentOrganization(org);

			// Update user metadata
			await updateUserMetadata({
				current_organization_id: org.id,
			});

			toast.success(`Switched to ${org.name}`);
		} catch (err) {
			console.error("Error selecting organization:", err);
			toast.error("Failed to switch organization");
			setError(
				err instanceof Error ? err : new Error("Failed to select organization")
			);
		}
	};

	// Update an organization
	const updateOrganization = async (
		organizationId: string,
		data: Partial<Organization>
	): Promise<Organization | null> => {
		if (!user) return null;

		try {
			setIsLoading(true);

			// Update in Supabase
			const { data: updatedOrg, error } = await supabase
				.from("organizations")
				.update(data)
				.eq("id", organizationId)
				.select()
				.single();

			if (error) throw error;

			if (updatedOrg) {
				// Update in local state
				setOrganizations((prev) =>
					prev.map((org) => (org.id === organizationId ? updatedOrg : org))
				);

				// Update current organization if it's the one being updated
				if (currentOrganization?.id === organizationId) {
					setCurrentOrganization(updatedOrg);
				}

				toast.success("Organization updated successfully");
				return updatedOrg;
			}

			return null;
		} catch (err) {
			console.error("Error updating organization:", err);
			toast.error("Failed to update organization");
			setError(
				err instanceof Error ? err : new Error("Failed to update organization")
			);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to get the current organization ID safely
	const getCurrentOrganizationId = (): string => {
		// If we don't have organization tables initialized, throw an error
		if (!tablesInitialized) {
			throw new Error("Organization tables not initialized");
		}

		if (currentOrganization) {
			return currentOrganization.id;
		}

		// If we don't have a current organization but we do have organizations
		if (organizations.length > 0) {
			return organizations[0].id;
		}

		// No organization available, throw an error
		throw new Error(
			"No organization available - user must create or join an organization"
		);
	};

	// Context value
	const value = {
		currentOrganization,
		isLoading,
		error,
		organizations,
		createOrganization,
		selectOrganization,
		updateOrganization,
		getCurrentOrganizationId,
		tablesInitialized,
	};

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}
