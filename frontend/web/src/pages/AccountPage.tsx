import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { ContentContainer } from "@/components/ui/content-container";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, CreditCard, ExternalLink } from "lucide-react";
import { useOrganization } from "@/lib/organization-context";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import { Separator } from "@/components/ui/separator";
import { useStripeContext } from "@/lib/stripe";
import { useHeader } from "@/lib/header-context";
import { AppContent } from "@/components/layout/AppLayout";

// Overview tab component that displays the business summary cards
function OverviewTab() {
	const { user, isLoading: isLoadingAuth } = useAuth();
	const { currentOrganization, isLoading: isLoadingOrg } = useOrganization();
	const { subscription } = useStripeContext();
	const navigate = useNavigate();

	// Get business initials for avatar fallback
	const getBusinessInitials = () => {
		const name = currentOrganization?.name || "";
		const words = name.split(" ");
		if (words.length >= 2) {
			return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	if (isLoadingOrg || isLoadingAuth) {
		return <LoadingState message="Loading account information..." />;
	}

	return (
		<TabsContent value="overview">
			<div className="space-y-6">
				{/* Business Profile Summary Card */}
				<ContentSection
					title="Business Profile"
					description="Your business information and settings">
					<div className="grid md:grid-cols-2 gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Business Information
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<div className="flex items-start space-x-4">
									<Avatar className="h-14 w-14">
										<AvatarFallback>{getBusinessInitials()}</AvatarFallback>
									</Avatar>
									<div className="space-y-1">
										<h3 className="text-lg font-semibold">
											{currentOrganization?.name || "Your Business"}
										</h3>
										<p className="text-sm text-muted-foreground">
											{currentOrganization?.description ||
												"No description provided"}
										</p>
										{currentOrganization?.address && (
											<p className="text-sm flex items-center gap-1">
												<Building2 className="h-3.5 w-3.5" />
												{currentOrganization.address}
											</p>
										)}
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => navigate("/account/business-profile")}>
									<ExternalLink className="h-4 w-4 mr-2" />
									Manage Business Profile
								</Button>
							</CardFooter>
						</Card>

						{/* Users Summary Card */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Users Management
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm">Account Owner</span>
										<span className="text-sm font-medium">
											{user?.email || "Unknown"}
										</span>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<span className="text-sm">Team Members</span>
										<span className="text-sm font-medium">
											Manage team access and permissions
										</span>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => navigate("/account/users")}>
									<ExternalLink className="h-4 w-4 mr-2" />
									Manage Team
								</Button>
							</CardFooter>
						</Card>

						{/* Billing Summary Card */}
						<Card className="md:col-span-2">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Subscription & Billing
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											{subscription?.plan
												? `${subscription.plan
														.charAt(0)
														.toUpperCase()}${subscription.plan.slice(1)} Plan`
												: "Free Plan"}
										</h3>
										<p className="text-sm text-muted-foreground">
											{subscription?.status === "active"
												? "Subscription active"
												: "No active subscription"}
										</p>
									</div>
									<Button
										variant="secondary"
										onClick={() => navigate("/account/billing")}>
										<CreditCard className="h-4 w-4 mr-2" />
										Manage Billing
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</ContentSection>
			</div>
		</TabsContent>
	);
}

// Business Profile tab component - empty wrapper for the Outlet content
function BusinessProfileTab() {
	return (
		<TabsContent value="business-profile">
			<Outlet />
		</TabsContent>
	);
}

// Users Management tab component - empty wrapper for the Outlet content
function UsersTab() {
	return (
		<TabsContent value="users">
			<Outlet />
		</TabsContent>
	);
}

// Billing tab component - empty wrapper for the Outlet content
function BillingTab() {
	return (
		<TabsContent value="billing">
			<Outlet />
		</TabsContent>
	);
}

export default function AccountPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { updateHeader } = useHeader();

	// Update the header
	useEffect(() => {
		updateHeader({
			title: "Account",
			description: "Manage your organization settings and user access",
		});
	}, [updateHeader]);

	// Determine which tab is active
	const getActiveTab = () => {
		const path = location.pathname;
		if (path.includes("/account/users")) return "users";
		if (path.includes("/account/billing")) return "billing";
		if (path.includes("/account/business-profile")) return "business-profile";
		return "overview"; // Default to overview tab
	};

	// Handle tab changes
	const handleTabChange = (value: string) => {
		if (value === "overview") {
			navigate("/account");
		} else {
			navigate(`/account/${value}`);
		}
	};

	return (
		<AppContent>
			<div className="w-full py-6">
				<Tabs
					value={getActiveTab()}
					onValueChange={handleTabChange}
					className="w-full">
					<TabsList className="w-full">
						<TabsTrigger
							value="overview"
							className="flex-1">
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="business-profile"
							className="flex-1">
							Business Profile
						</TabsTrigger>
						<TabsTrigger
							value="users"
							className="flex-1">
							Users
						</TabsTrigger>
						<TabsTrigger
							value="billing"
							className="flex-1">
							Billing
						</TabsTrigger>
					</TabsList>

					<OverviewTab />
					<BusinessProfileTab />
					<UsersTab />
					<BillingTab />
				</Tabs>
			</div>
		</AppContent>
	);
}
