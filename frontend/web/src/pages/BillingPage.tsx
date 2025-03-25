import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { ChevronLeft, CreditCard, Package, Receipt, Check } from "lucide-react";
import { OrganizationsAPI, type Organization } from "../api";
import { ProfileSidebar } from "../components/layout/SecondaryNavbar";
import { Separator } from "../components/ui/separator";

export default function BillingPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "subscription";

	const [isLoading, setIsLoading] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isUpgrading, setIsUpgrading] = useState(false);

	// Handle tab changes
	const handleTabChange = (tab: string) => {
		if (
			tab === "profile" ||
			tab === "password" ||
			tab === "notifications" ||
			tab === "business-profile" ||
			tab === "branding"
		) {
			// Navigate back to profile with the chosen tab
			navigate(`/profile?tab=${tab}`);
			return;
		}

		// For billing tabs, update the URL
		setSearchParams({ tab });
	};

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

	const renderSidebar = () => {
		return (
			<ProfileSidebar
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		);
	};

	if (isLoading && !organization) {
		return (
			<>
				{renderSidebar()}
				<div className="ml-64">
					<div className="flex justify-center items-center min-h-screen">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{renderSidebar()}
			<div className="ml-64 p-6">
				{/* Subscription Content */}
				{activeTab === "subscription" && (
					<div>
						<div className="mb-8">
							<h2 className="text-2xl font-bold">Subscription</h2>
							<p className="text-muted-foreground">
								Manage your subscription plan
							</p>
						</div>

						<div className="rounded-lg border p-4 mb-6">
							<h3 className="text-base font-medium mb-2 flex items-center">
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
							<div className="mb-8 flex justify-end">
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

						{subscriptionPlan === "free" && (
							<>
								<h3 className="text-lg font-medium mt-12 mb-2">
									Available Plans
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Choose a plan that best fits your business
								</p>

								<div className="grid md:grid-cols-2 gap-6">
									<div className="border rounded-lg p-5 border-primary">
										<div className="mb-4">
											<div className="flex justify-between items-center mb-2">
												<h4 className="text-base font-medium">Pro Plan</h4>
												<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
													Recommended
												</div>
											</div>
											<p className="text-sm text-muted-foreground">
												For growing businesses
											</p>
										</div>
										<div className="mb-4">
											<span className="text-3xl font-bold">$29</span>
											<span className="text-muted-foreground"> / month</span>
										</div>
										<ul className="space-y-2 text-sm mb-6">
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Up to 25 employees</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Advanced scheduling features</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>SMS notifications</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Basic reporting</span>
											</li>
										</ul>
										<Button
											disabled={isUpgrading}
											onClick={() => handleUpgrade("pro")}
											className="w-full">
											{isUpgrading ? "Processing..." : "Upgrade Now"}
										</Button>
									</div>
									<div className="border rounded-lg p-5">
										<div className="mb-4">
											<h4 className="text-base font-medium mb-2">
												Business Plan
											</h4>
											<p className="text-sm text-muted-foreground">
												For established businesses
											</p>
										</div>
										<div className="mb-4">
											<span className="text-3xl font-bold">$79</span>
											<span className="text-muted-foreground"> / month</span>
										</div>
										<ul className="space-y-2 text-sm mb-6">
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Unlimited employees</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Premium scheduling features</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>SMS and email notifications</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Advanced reporting & analytics</span>
											</li>
											<li className="flex items-start">
												<Check className="h-4 w-4 mr-2 text-primary" />
												<span>Priority support</span>
											</li>
										</ul>
										<Button
											disabled={isUpgrading}
											onClick={() => handleUpgrade("business")}
											className="w-full"
											variant="outline">
											{isUpgrading ? "Processing..." : "Upgrade Now"}
										</Button>
									</div>
								</div>
							</>
						)}
					</div>
				)}

				{/* Payment Methods Content */}
				{activeTab === "payment-methods" && (
					<div>
						<div className="mb-8">
							<h2 className="text-2xl font-bold">Payment Methods</h2>
							<p className="text-muted-foreground">
								Manage your payment methods
							</p>
						</div>

						<div className="flex items-center justify-between p-4 border rounded-lg mb-6">
							<div className="flex items-center">
								<CreditCard className="h-6 w-6 mr-3 text-primary" />
								<div>
									<p className="font-medium">Visa ending in 4242</p>
									<p className="text-sm text-muted-foreground">Expires 12/25</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm">
									Edit
								</Button>
								<Button
									variant="outline"
									size="sm">
									Remove
								</Button>
							</div>
						</div>

						<div className="flex justify-end">
							<Button>
								<CreditCard className="h-4 w-4 mr-2" /> Add Payment Method
							</Button>
						</div>
					</div>
				)}

				{/* Billing History Content */}
				{activeTab === "billing-history" && (
					<div>
						<div className="mb-8">
							<h2 className="text-2xl font-bold">Billing History</h2>
							<p className="text-muted-foreground">
								View your billing and payment history
							</p>
						</div>

						<div className="overflow-hidden border rounded-lg">
							<table className="min-w-full divide-y divide-border">
								<thead className="bg-muted/50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Amount
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Invoice
										</th>
									</tr>
								</thead>
								<tbody className="bg-background divide-y divide-border">
									<tr>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											Mar 15, 2025
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											$29.00
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
												Paid
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
											<Button
												variant="link"
												className="p-0 h-auto font-normal">
												<Receipt className="h-4 w-4 mr-1" /> View
											</Button>
										</td>
									</tr>
									<tr>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											Feb 15, 2025
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											$29.00
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
												Paid
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
											<Button
												variant="link"
												className="p-0 h-auto font-normal">
												<Receipt className="h-4 w-4 mr-1" /> View
											</Button>
										</td>
									</tr>
									<tr>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											Jan 15, 2025
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											$29.00
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
												Paid
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
											<Button
												variant="link"
												className="p-0 h-auto font-normal">
												<Receipt className="h-4 w-4 mr-1" /> View
											</Button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
