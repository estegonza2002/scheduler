import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./auth";
import { supabase } from "./supabase";
import { Organization } from "@/api";
import { OrganizationsAPI } from "@/api/real/api";
import {
	switchOrganization,
	validateOrganizationAccess,
	getCurrentOrganizationId,
} from "./organization-utils";

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
	getCurrentOrganizationId: () => string | null;
	tablesInitialized: boolean;
	switchOrganization: (
		organizationId: string,
		role?: "admin" | "member" | "owner"
	) => Promise<boolean>;
}

// Create context
const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined
);

// Custom hook to use the context
export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (!context) {
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
	const { user } = useAuth();
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
				const { error } = await supabase
					.from("organizations")
					.select("id")
					.limit(1);

				if (error && error.code === "42P01") {
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
			setCurrentOrganization(null);
			setOrganizations([]);
			setIsLoading(false);
		}
	}, [user, tablesInitialized]);

	// Load all organizations the user has access to
	const loadOrganizations = async () => {
		if (!user) return;

		setIsLoading(true);
		setError(null); // Clear any previous errors

		try {
			const { data: orgs, error } = await supabase
				.from("organizations")
				.select(
					`
					*,
					organization_members!inner(
						role
					)
				`
				)
				.eq("organization_members.user_id", user.id);

			if (error) throw error;

			if (!orgs || orgs.length === 0) {
				console.warn("User has no organizations");
				setOrganizations([]);
				setCurrentOrganization(null);
				setIsLoading(false);
				return;
			}

			// Clean up the nested structure and include role
			const cleanOrgs = orgs.map((org) => ({
				...org,
				role: org.organization_members[0].role,
				organization_members: undefined,
			}));

			setOrganizations(cleanOrgs);

			// Get the user's current organization
			const currentOrgId = await getCurrentOrganizationId();

			// If the user has a current organization set and it exists in the list
			if (currentOrgId && cleanOrgs.some((org) => org.id === currentOrgId)) {
				const current = cleanOrgs.find((org) => org.id === currentOrgId);
				if (current) {
					setCurrentOrganization(current);
					console.log(`Restored previous organization: ${current.name}`);
				} else {
					throw new Error("Failed to find current organization");
				}
			} else if (cleanOrgs.length > 0) {
				// Default to the first organization
				const defaultOrg = cleanOrgs[0];
				setCurrentOrganization(defaultOrg);
				await switchOrganization(defaultOrg.id);
				console.log(`Defaulted to organization: ${defaultOrg.name}`);
			}

			setError(null);
		} catch (err) {
			console.error("Error loading organizations:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load organizations";
			setError(new Error(errorMessage));
			toast.error(errorMessage);

			// Recovery: Try to set a valid organization if possible
			if (organizations.length > 0) {
				const fallbackOrg = organizations[0];
				setCurrentOrganization(fallbackOrg);
				await switchOrganization(fallbackOrg.id);
				console.log(
					`Recovered using fallback organization: ${fallbackOrg.name}`
				);
			}
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

			const newOrg = await OrganizationsAPI.create({
				name,
				description,
				owner_id: user.id,
			} as any);

			// Add to local state
			setOrganizations((prev) => [...prev, newOrg]);

			// Set as current organization
			setCurrentOrganization(newOrg);

			// Update user metadata
			await switchOrganization(newOrg.id, "owner");

			return newOrg;
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

			// Validate access and update metadata
			const success = await switchOrganization(organizationId);

			if (success) {
				setCurrentOrganization(org);
			}
		} catch (err) {
			console.error("Error selecting organization:", err);
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

			// Validate access before updating
			const hasAccess = await validateOrganizationAccess(organizationId);
			if (!hasAccess) {
				toast.error("You don't have permission to update this organization");
				return null;
			}

			const updatedOrg = await OrganizationsAPI.update({
				id: organizationId,
				...data,
			});

			if (updatedOrg) {
				// Update in local state
				setOrganizations((prev) =>
					prev.map((org) => (org.id === organizationId ? updatedOrg : org))
				);

				// Update current organization if it's the one being updated
				if (currentOrganization?.id === organizationId) {
					setCurrentOrganization(updatedOrg);
				}

				return updatedOrg;
			}

			return null;
		} catch (err) {
			console.error("Error updating organization:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to update organization")
			);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to get the current organization ID safely
	const getCurrentOrganizationId = (): string | null => {
		if (!tablesInitialized) {
			console.warn("Organization tables not initialized");
			return null;
		}

		if (currentOrganization) {
			return currentOrganization.id;
		}

		if (organizations.length > 0) {
			return organizations[0].id;
		}

		console.warn("No organization available");
		return null;
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
		switchOrganization,
	};

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}
