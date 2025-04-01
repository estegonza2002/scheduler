import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/lib/organization-context";
import { switchOrganization } from "@/lib/organization-utils";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export default function OrganizationSelectionPage() {
	const navigate = useNavigate();
	const { organizations, isLoading, error } = useOrganization();

	// If user only has one org, redirect to dashboard
	useEffect(() => {
		if (!isLoading && organizations.length === 1) {
			navigate("/dashboard", { replace: true });
		}
	}, [isLoading, organizations, navigate]);

	const handleSelectOrg = async (orgId: string) => {
		const success = await switchOrganization(orgId);
		if (success) {
			navigate("/dashboard", { replace: true });
		}
	};

	if (isLoading) {
		return (
			<div className="container max-w-4xl py-8">
				<div className="space-y-6">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						{[1, 2].map((i) => (
							<Card
								key={i}
								className="relative">
								<CardHeader>
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4 mt-2" />
								</CardContent>
								<CardFooter>
									<Skeleton className="h-9 w-full" />
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-4xl py-8">
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="text-destructive">
							Error Loading Organizations
						</CardTitle>
						<CardDescription>
							There was a problem loading your organizations. Please try again
							later.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">{error.message}</p>
					</CardContent>
					<CardFooter>
						<Button onClick={() => window.location.reload()}>Retry</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-4xl py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Select Organization</h1>
					<p className="text-muted-foreground">
						Choose which organization you want to access
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{organizations.map((org) => (
						<Card
							key={org.id}
							className="relative">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="truncate">{org.name}</CardTitle>
									<Badge variant="outline">{org.role || "member"}</Badge>
								</div>
								{org.description && (
									<CardDescription className="line-clamp-2">
										{org.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm text-muted-foreground">
									<CalendarDays className="mr-2 h-4 w-4" />
									<time dateTime={org.created_at}>
										Joined {new Date(org.created_at).toLocaleDateString()}
									</time>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									className="w-full"
									onClick={() => handleSelectOrg(org.id)}>
									Select Organization
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
