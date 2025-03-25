import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { ChevronLeft, CreditCard, Package, Receipt, Check } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { OrganizationsAPI, type Organization } from "../api";
import { ContentContainer } from "../components/ui/content-container";
import { ContentSection } from "../components/ui/content-section";

export default function BillingPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isUpgrading, setIsUpgrading] = useState(false);

	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				setIsLoading(true);
				// In a real implementation, we would fetch the organization by the user's organization_id
				// For now, we'll use the first organization from the mock data
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
					// In a real implementation, this would fetch the subscription plan from the organization data
					// For now, we'll assume it's "free"
					setSubscriptionPlan("free");
				}
			} catch (error) {
				console.error("Error fetching organization:", error);
				toast.error("Failed to load billing information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganization();
	}, []);

	const goBack = () => {
		navigate(-1);
	};

	const handleUpgrade = async (plan: "pro" | "business") => {
		try {
			setIsUpgrading(true);
			// In a real implementation, this would call an API to upgrade the subscription
			// For now, we'll just simulate a delay and update the state
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSubscriptionPlan(plan);
			toast.success(`Successfully upgraded to ${plan} plan!`);
		} catch (error) {
			toast.error("Failed to upgrade subscription");
		} finally {
			setIsUpgrading(false);
		}
	};

	if (isLoading && !organization) {
		return (
			<ContentContainer>
				<div className="flex justify-center items-center min-h-screen">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			</ContentContainer>
		);
	}

	return (
		<>
			<ContentContainer>
				<Tabs
					defaultValue="subscription"
					className="w-full">
					<TabsList className="mb-6 w-full max-w-md">
						<TabsTrigger value="subscription">Subscription</TabsTrigger>
						<TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
						<TabsTrigger value="billing-history">Billing History</TabsTrigger>
					</TabsList>

					<TabsContent value="subscription">
						<ContentSection
							title="Current Subscription"
							description="Your current plan and subscription details">
							<div className="rounded-lg border p-4">
								<h3 className="text-lg font-medium mb-2 flex items-center">
									<Package className="h-5 w-5 mr-2 text-primary" />
									{subscriptionPlan === "free" && "Free Plan"}
									{subscriptionPlan === "pro" && "Pro Plan"}
									{subscriptionPlan === "business" && "Business Plan"}
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
									{subscriptionPlan === "free" &&
										"Your business is currently on the free plan."}
									{subscriptionPlan === "pro" &&
										"Your business is subscribed to the Pro plan."}
									{subscriptionPlan === "business" &&
										"Your business is subscribed to the Business plan."}
								</p>
								<ul className="space-y-2 text-sm mb-6">
									{subscriptionPlan === "free" && (
										<>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Up to 5 employees</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Basic scheduling features</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Email notifications</span>
											</li>
											<li className="flex items-start text-muted-foreground">
												<span className="mr-2">✗</span>
												<span>Advanced reporting</span>
											</li>
											<li className="flex items-start text-muted-foreground">
												<span className="mr-2">✗</span>
												<span>Team management tools</span>
											</li>
										</>
									)}
									{subscriptionPlan === "pro" && (
										<>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Up to 25 employees</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Advanced scheduling features</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>SMS notifications</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Basic reporting</span>
											</li>
											<li className="flex items-start text-muted-foreground">
												<span className="mr-2">✗</span>
												<span>Advanced analytics</span>
											</li>
										</>
									)}
									{subscriptionPlan === "business" && (
										<>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Unlimited employees</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Premium scheduling features</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>SMS and email notifications</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Advanced reporting & analytics</span>
											</li>
											<li className="flex items-start">
												<span className="mr-2">✓</span>
												<span>Priority support</span>
											</li>
										</>
									)}
								</ul>
							</div>
							{subscriptionPlan !== "business" && (
								<div className="mt-6 flex justify-end">
									<Button
										disabled={isUpgrading}
										onClick={() =>
											subscriptionPlan === "free"
												? handleUpgrade("pro")
												: handleUpgrade("business")
										}>
										{isUpgrading
											? "Processing..."
											: subscriptionPlan === "free"
											? "Upgrade to Pro"
											: "Upgrade to Business"}
									</Button>
								</div>
							)}
						</ContentSection>

						{subscriptionPlan === "free" && (
							<ContentSection
								title="Available Plans"
								description="Choose a plan that best fits your business">
								<div className="grid md:grid-cols-2 gap-6">
									<Card className="border-primary">
										<CardHeader>
											<div className="flex justify-between items-center">
												<CardTitle>Pro Plan</CardTitle>
												<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
													Recommended
												</div>
											</div>
											<CardDescription>For growing businesses</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mb-4">
												<span className="text-3xl font-bold">$29</span>
												<span className="text-muted-foreground"> / month</span>
											</div>
											<ul className="space-y-2 text-sm">
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Up to 25 employees</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Advanced scheduling features</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>SMS notifications</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Basic reporting</span>
												</li>
											</ul>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={() => handleUpgrade("pro")}
												disabled={isUpgrading}>
												{isUpgrading ? "Processing..." : "Select Plan"}
											</Button>
										</CardFooter>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Business Plan</CardTitle>
											<CardDescription>
												For larger organizations
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mb-4">
												<span className="text-3xl font-bold">$79</span>
												<span className="text-muted-foreground"> / month</span>
											</div>
											<ul className="space-y-2 text-sm">
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Unlimited employees</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Premium scheduling features</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>SMS and email notifications</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Advanced reporting & analytics</span>
												</li>
											</ul>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={() => handleUpgrade("business")}
												disabled={isUpgrading}
												variant="outline">
												{isUpgrading ? "Processing..." : "Select Plan"}
											</Button>
										</CardFooter>
									</Card>
								</div>
							</ContentSection>
						)}

						{subscriptionPlan === "pro" && (
							<ContentSection
								title="Available Upgrades"
								description="Take your business to the next level">
								<div className="grid md:grid-cols-1 gap-6 max-w-md">
									<Card>
										<CardHeader>
											<CardTitle>Business Plan</CardTitle>
											<CardDescription>
												For larger organizations
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mb-4">
												<span className="text-3xl font-bold">$79</span>
												<span className="text-muted-foreground"> / month</span>
											</div>
											<ul className="space-y-2 text-sm">
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Unlimited employees</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Premium scheduling features</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>SMS and email notifications</span>
												</li>
												<li className="flex items-start">
													<span className="mr-2">✓</span>
													<span>Advanced reporting & analytics</span>
												</li>
											</ul>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={() => handleUpgrade("business")}
												disabled={isUpgrading}>
												{isUpgrading ? "Processing..." : "Upgrade to Business"}
											</Button>
										</CardFooter>
									</Card>
								</div>
							</ContentSection>
						)}
					</TabsContent>

					<TabsContent value="payment-methods">
						<ContentSection
							title="Payment Methods"
							description="Manage your payment methods for subscription charges">
							<div className="py-8 text-center">
								<CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground mb-4">
									No payment methods have been added yet.
								</p>
								<Button variant="outline">Add Payment Method</Button>
							</div>
						</ContentSection>
					</TabsContent>

					<TabsContent value="billing-history">
						<ContentSection
							title="Billing History"
							description="View your past invoices and payment history">
							<div className="py-8 text-center">
								<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground mb-4">
									No billing history available.
								</p>
								<Button
									variant="outline"
									disabled>
									Download Invoices
								</Button>
							</div>
						</ContentSection>
					</TabsContent>
				</Tabs>
			</ContentContainer>
		</>
	);
}
