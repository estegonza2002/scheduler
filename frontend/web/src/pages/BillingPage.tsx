import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Package, Receipt, Check } from "lucide-react";
import { OrganizationsAPI, type Organization } from "@/api";
import { ProfileSidebar } from "@/components/layout/SecondaryNavbar";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";

import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { SecondaryLayout } from "@/components/layout/SecondaryLayout";
import { LoadingState } from "@/components/ui/loading-state";

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

	if (isLoading && !organization) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<LoadingState
					message="Loading billing information..."
					type="spinner"
				/>
			</div>
		);
	}

	return (
		<SecondaryLayout
			title="Billing & Subscription"
			description="Manage your billing information and subscription plan"
			sidebar={
				<ProfileSidebar
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>
			}>
			{/* Subscription Content */}
			{activeTab === "subscription" && (
				<>
					<ContentSection
						title="Available Plans"
						description="Choose a plan that best fits your business needs">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Free Plan */}
							<div
								className={`border rounded-lg p-5 transition-all ${
									subscriptionPlan === "free"
										? "bg-card border-primary"
										: "bg-muted/10 hover:bg-card"
								}`}>
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Free Plan</h4>
										{subscriptionPlan === "free" && (
											<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
												Current Plan
											</div>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										For personal or small teams
									</p>
								</div>
								<div className="mb-4">
									<span className="text-3xl font-bold">$0</span>
									<span className="text-muted-foreground"> / month</span>
								</div>
								<ul className="space-y-2 text-sm mb-6">
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Up to 5 employees</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Basic scheduling features</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Email notifications</span>
									</li>
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>Advanced reporting</span>
									</li>
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>SMS notifications</span>
									</li>
								</ul>
								{subscriptionPlan === "free" ? (
									<Button
										disabled
										className="w-full">
										Current Plan
									</Button>
								) : (
									<Button
										variant="outline"
										className="w-full"
										disabled={
											subscriptionPlan === "pro" ||
											subscriptionPlan === "business"
										}
										onClick={() => setSubscriptionPlan("free")}>
										{subscriptionPlan === "pro" ||
										subscriptionPlan === "business"
											? "Downgrade"
											: "Select Plan"}
									</Button>
								)}
							</div>

							{/* Pro Plan */}
							<div
								className={`border border-primary rounded-lg p-6 shadow-lg transform scale-105 z-10 transition-all ${
									subscriptionPlan === "pro"
										? "bg-card"
										: "bg-muted/10 hover:bg-card"
								} relative`}>
								{subscriptionPlan !== "pro" && (
									<div className="absolute -top-3 left-0 right-0 flex justify-center">
										<div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
											Recommended
										</div>
									</div>
								)}
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Pro Plan</h4>
										{subscriptionPlan === "pro" && (
											<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
												Current Plan
											</div>
										)}
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
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>Advanced analytics</span>
									</li>
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>Priority support</span>
									</li>
								</ul>
								{subscriptionPlan === "pro" ? (
									<Button
										disabled
										className="w-full">
										Current Plan
									</Button>
								) : subscriptionPlan === "business" ? (
									<Button
										variant="outline"
										className="w-full"
										disabled={isUpgrading}
										onClick={() => handleUpgrade("pro")}>
										{isUpgrading ? "Processing..." : "Downgrade to Pro"}
									</Button>
								) : (
									<Button
										disabled={isUpgrading}
										onClick={() => handleUpgrade("pro")}
										className="w-full">
										{isUpgrading ? "Processing..." : "Upgrade Now"}
									</Button>
								)}
							</div>

							{/* Business Plan */}
							<div
								className={`border rounded-lg p-5 transition-all ${
									subscriptionPlan === "business"
										? "bg-card border-primary"
										: "bg-muted/10 hover:bg-card"
								}`}>
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Business Plan</h4>
										{subscriptionPlan === "business" && (
											<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
												Current Plan
											</div>
										)}
									</div>
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
								{subscriptionPlan === "business" ? (
									<Button
										disabled
										className="w-full">
										Current Plan
									</Button>
								) : (
									<Button
										disabled={isUpgrading}
										onClick={() => handleUpgrade("business")}
										className="w-full"
										variant="outline">
										{isUpgrading ? "Processing..." : "Upgrade Now"}
									</Button>
								)}
							</div>
						</div>
					</ContentSection>

					<ContentSection
						title="Additional Information"
						description="More details about our plans and custom options">
						<div className="text-sm text-muted-foreground">
							<p>
								All plans include unlimited schedule creation and basic customer
								support.
							</p>
							<p className="mt-2">
								Need a custom plan for your enterprise?{" "}
								<Button
									variant="link"
									className="h-auto p-0">
									Contact us
								</Button>
							</p>
						</div>
					</ContentSection>
				</>
			)}

			{/* Payment Methods Content */}
			{activeTab === "payment-methods" && (
				<ContentSection
					title="Payment Methods"
					description="Manage your payment methods and billing information"
					headerActions={
						<Button>
							<CreditCard className="h-4 w-4 mr-2" /> Add Payment Method
						</Button>
					}>
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 border rounded-lg">
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
					</div>
				</ContentSection>
			)}

			{/* Billing History Content */}
			{activeTab === "billing-history" && (
				<ContentSection
					title="Billing History"
					description="View your past invoices and billing history">
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
				</ContentSection>
			)}
		</SecondaryLayout>
	);
}
