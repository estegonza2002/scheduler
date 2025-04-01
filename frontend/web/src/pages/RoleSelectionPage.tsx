import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { switchOrganization } from "@/lib/organization-utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function RoleSelectionPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleCreateOrg = async () => {
		setIsLoading(true);
		try {
			// Set user's role to admin in preparation for org creation
			await switchOrganization(
				user?.user_metadata?.current_organization_id || "",
				"admin"
			);
			// Redirect to organization creation
			navigate("/create-organization", { replace: true });
		} catch (error) {
			console.error("Error setting user role:", error);
			toast.error("Failed to set user role");
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinOrg = async () => {
		setIsLoading(true);
		try {
			// Set user's role to employee
			await switchOrganization(
				user?.user_metadata?.current_organization_id || "",
				"member"
			);
			// Redirect to organization joining
			navigate("/join-organization", { replace: true });
		} catch (error) {
			console.error("Error setting user role:", error);
			toast.error("Failed to set user role");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container max-w-2xl py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Welcome to the Platform</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Choose how you want to get started
					</p>
				</div>
				<Separator />
				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Create an Organization</CardTitle>
							<CardDescription>
								Start fresh with your own organization
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Perfect for business owners, entrepreneurs, and team leaders who
								want to set up their workspace.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								onClick={handleCreateOrg}
								disabled={isLoading}>
								Create Organization
							</Button>
						</CardFooter>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Join an Organization</CardTitle>
							<CardDescription>Join an existing organization</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								For employees and team members who have been invited to join an
								existing organization.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								variant="outline"
								onClick={handleJoinOrg}
								disabled={isLoading}>
								Join Organization
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
