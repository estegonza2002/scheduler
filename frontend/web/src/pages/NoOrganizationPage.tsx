import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function NoOrganizationPage() {
	const navigate = useNavigate();

	return (
		<div className="container max-w-2xl py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Welcome to the Platform</h1>
					<p className="text-muted-foreground">
						Get started by creating or joining an organization
					</p>
				</div>

				<Card className="border-2 border-dashed">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							No Organization Found
						</CardTitle>
						<CardDescription>
							You currently don't belong to any organization
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							To get started, you can either create your own organization or
							join an existing one using an invite code.
						</p>
					</CardContent>
				</Card>

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
							<p className="text-sm text-muted-foreground">
								Perfect for business owners, entrepreneurs, and team leaders who
								want to set up their workspace.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								onClick={() => navigate("/create-organization")}>
								<Building2 className="h-4 w-4 mr-2" />
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
							<p className="text-sm text-muted-foreground">
								For employees and team members who have been invited to join an
								existing organization.
							</p>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								variant="outline"
								onClick={() => navigate("/join-organization")}>
								<UserPlus className="h-4 w-4 mr-2" />
								Join Organization
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
