import { toast } from "sonner";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

/**
 * Updates the user's current organization and related metadata
 * @param organizationId - The ID of the organization to switch to
 * @param role - Optional role to set for the user
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function switchOrganization(
	organizationId: string,
	role?: "admin" | "member" | "owner"
): Promise<boolean> {
	try {
		// First validate that the organization exists and user has access
		const { data: membership, error: membershipError } = await supabase
			.from("organization_members")
			.select("role")
			.eq("organization_id", organizationId)
			.eq("user_id", (await supabase.auth.getUser()).data.user?.id)
			.single();

		if (membershipError || !membership) {
			toast.error("You don't have access to this organization");
			return false;
		}

		// Update user metadata with new organization ID and role if provided
		const metadata: Record<string, any> = {
			current_organization_id: organizationId,
		};

		if (role) {
			metadata.role = role;
		}

		const { error: updateError } = await supabase.auth.updateUser({
			data: metadata,
		});

		if (updateError) {
			toast.error("Failed to update organization settings");
			console.error("Error updating user metadata:", updateError);
			return false;
		}

		toast.success("Successfully switched organization");
		return true;
	} catch (error) {
		console.error("Error switching organization:", error);
		toast.error("Failed to switch organization");
		return false;
	}
}

/**
 * Validates if a user has access to an organization
 * @param organizationId - The ID of the organization to check
 * @returns Promise<boolean> - True if user has access, false otherwise
 */
export async function validateOrganizationAccess(
	organizationId: string
): Promise<boolean> {
	try {
		const { data, error } = await supabase
			.from("organization_members")
			.select("id")
			.eq("organization_id", organizationId)
			.eq("user_id", (await supabase.auth.getUser()).data.user?.id)
			.single();

		return !error && !!data;
	} catch {
		return false;
	}
}

/**
 * Gets the user's current organization ID from metadata
 * @returns Promise<string | null> - The current organization ID or null if not found
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		return user?.user_metadata?.current_organization_id || null;
	} catch {
		return null;
	}
}

/**
 * Gets the user's current role from metadata
 * @returns Promise<string | null> - The current role or null if not found
 */
export async function getCurrentRole(): Promise<string | null> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		return user?.user_metadata?.role || null;
	} catch {
		return null;
	}
}
