import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { OrganizationsAPI, UserAPI } from "@/api";
import { toast } from "sonner";
import { Organization } from "@/api/types";

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
		data: Partial<Omit<Organization, "id" | "createdAt" | "updatedAt">>
	) => Promise<Organization | null>;
	getCurrentOrganizationId: () => string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined
);

export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error(
			"useOrganization must be used within an OrganizationProvider"
		);
	}
	return context;
}

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

	useEffect(() => {
		if (user) {
			loadOrganizations();
		} else {
			setCurrentOrganization(null);
			setOrganizations([]);
			setIsLoading(false);
		}
	}, [user]);

	const loadOrganizations = async () => {
		setIsLoading(true);
		try {
			const fetchedOrgs = await OrganizationsAPI.getAll();

			let userProfile = null;
			if (user) {
				userProfile = await UserAPI.getProfile(user.uid);
			}

			if (fetchedOrgs && fetchedOrgs.length > 0) {
				setOrganizations(fetchedOrgs);

				const currentOrgId = userProfile?.currentOrganizationId;

				console.log("Current Org ID from user profile:", currentOrgId);
				console.log(
					"Fetched Orgs:",
					fetchedOrgs.map((o) => o.id)
				);

				if (
					currentOrgId &&
					fetchedOrgs.some((org) => org.id === currentOrgId)
				) {
					const current = fetchedOrgs.find((org) => org.id === currentOrgId);
					console.log("Setting current org from user profile:", current);
					setCurrentOrganization(current || null);
				} else {
					console.log("Setting current org to first in list:", fetchedOrgs[0]);
					setCurrentOrganization(fetchedOrgs[0]);

					if (user && fetchedOrgs[0] && !currentOrgId) {
						console.log(
							"Updating user profile with default org ID:",
							fetchedOrgs[0].id
						);
						await UserAPI.updateProfile(user.uid, {
							currentOrganizationId: fetchedOrgs[0].id,
						});
					}
				}
			} else {
				console.log("No organizations found for user.");
				setCurrentOrganization(null);
				setOrganizations([]);
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

	const createOrganization = async (
		name: string,
		description?: string
	): Promise<Organization | null> => {
		if (!user) return null;

		try {
			setIsLoading(true);

			const newOrg = await OrganizationsAPI.create({ name, description });

			if (newOrg) {
				setOrganizations((prev) => [...prev, newOrg]);

				setCurrentOrganization(newOrg);

				if (user) {
					await UserAPI.updateProfile(user.uid, {
						currentOrganizationId: newOrg.id,
					});
				}

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

	const selectOrganization = async (organizationId: string): Promise<void> => {
		if (!user) return;

		try {
			const org = organizations.find((o) => o.id === organizationId);
			if (!org) throw new Error("Organization not found");

			setCurrentOrganization(org);

			if (user) {
				await UserAPI.updateProfile(user.uid, {
					currentOrganizationId: org.id,
				});
			}

			toast.success(`Switched to ${org.name}`);
		} catch (err) {
			console.error("Error selecting organization:", err);
			toast.error("Failed to switch organization");
			setError(
				err instanceof Error ? err : new Error("Failed to select organization")
			);
		}
	};

	const updateOrganization = async (
		organizationId: string,
		data: Partial<Omit<Organization, "id" | "createdAt" | "updatedAt">>
	): Promise<Organization | null> => {
		if (!user) return null;

		try {
			setIsLoading(true);

			const updatedOrg = await OrganizationsAPI.update({
				id: organizationId,
				...data,
			});

			if (updatedOrg) {
				setOrganizations((prev) =>
					prev.map((org) => (org.id === organizationId ? updatedOrg : org))
				);

				if (currentOrganization?.id === organizationId) {
					setCurrentOrganization(updatedOrg);
				}

				if (user) {
					await UserAPI.updateProfile(user.uid, {
						currentOrganizationId: updatedOrg.id,
					});
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

	const getCurrentOrganizationId = (): string | null => {
		if (currentOrganization) {
			return currentOrganization.id;
		}

		if (organizations.length > 0) {
			return organizations[0].id;
		}

		console.warn(
			"getCurrentOrganizationId called but no organization is available."
		);
		return null;
	};

	const value = {
		currentOrganization,
		isLoading,
		error,
		organizations,
		createOrganization,
		selectOrganization,
		updateOrganization,
		getCurrentOrganizationId,
	};

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}
