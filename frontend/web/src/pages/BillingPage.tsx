import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	ChevronLeft,
	CreditCard,
	Package,
	Receipt,
	Check,
	AlertCircle,
	Plus,
	Trash,
} from "lucide-react";
import {
	type Organization,
	BillingAPI,
	type Invoice as InvoiceType,
	type PaymentMethod,
} from "@/api";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { LoadingState } from "@/components/ui/loading-state";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useStripeContext } from "@/lib/stripe";
import { useOrganization } from "@/lib/organization";
import {
	CardElement,
	useStripe as useStripeJs,
	useElements,
} from "@stripe/react-stripe-js";
import { AppContent } from "@/components/layout/AppLayout";
import { useHeader } from "@/lib/header-context";

// Define columns for invoices table
const invoiceColumns: ColumnDef<InvoiceType>[] = [
	{
		accessorKey: "created",
		header: "Date",
		cell: ({ row }) => {
			return format(new Date(row.original.created * 1000), "MMM dd, yyyy");
		},
	},
	{
		accessorKey: "number",
		header: "Invoice",
		cell: ({ row }) => {
			return row.original.number;
		},
	},
	{
		accessorKey: "amount_paid",
		header: "Amount",
		cell: ({ row }) => {
			// Format amount as currency
			const amount = row.original.amount_paid / 100; // Convert from cents
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: row.original.currency.toUpperCase(),
			}).format(amount);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<span
					className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
						status === "paid"
							? "bg-green-100 text-green-800"
							: status === "open"
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
					}`}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: "Invoice",
		cell: ({ row }) => {
			return (
				<div className="flex gap-2">
					<Button
						variant="link"
						className="p-0 h-auto font-normal"
						onClick={() =>
							window.open(row.original.hosted_invoice_url, "_blank")
						}>
						<Receipt className="h-4 w-4 mr-1" /> View
					</Button>
					<Button
						variant="link"
						className="p-0 h-auto font-normal"
						onClick={() => window.open(row.original.pdf, "_blank")}>
						Download PDF
					</Button>
				</div>
			);
		},
	},
];

export default function BillingPage() {
	const { updateHeader } = useHeader();
	const navigate = useNavigate();
	const location = useLocation();
	const isInAccountPage = location.pathname.includes("/account/");
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "subscription";
	const { organization } = useOrganization();
	const {
		subscription,
		isLoading: isLoadingSubscription,
		upgradeSubscription,
		cancelSubscription,
	} = useStripeContext();

	const [isLoading, setIsLoading] = useState(false);
	const [isUpgrading, setIsUpgrading] = useState(false);
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [newCardError, setNewCardError] = useState<string | null>(null);
	const stripeJs = useStripeJs();
	const elements = useElements();

	// Check if the page was loaded after a successful checkout
	const success = searchParams.get("success");
	const sessionId = searchParams.get("session_id");

	// Set the page header
	useEffect(() => {
		updateHeader({
			title: "Billing & Subscription",
			description: "Manage your subscription plan and payment methods",
		});
	}, [updateHeader]);

	// Load invoices and payment methods
	useEffect(() => {
		const fetchBillingData = async () => {
			if (!organization) return;

			try {
				setIsLoading(true);

				// Check if success parameter is present and remove it
				if (success === "true" && sessionId) {
					// Clear the URL parameters
					setSearchParams({ tab: activeTab });
					toast.success(
						"Payment successful! Your subscription has been updated."
					);
				}

				// Fetch invoices
				if (activeTab === "billing-history") {
					const invoiceData = await BillingAPI.getInvoices(organization.id);
					setInvoices(invoiceData);
				}

				// Fetch payment methods
				if (activeTab === "payment-methods") {
					const paymentMethodsData = await BillingAPI.getPaymentMethods(
						organization.id
					);
					setPaymentMethods(paymentMethodsData);
				}
			} catch (error) {
				console.error("Error fetching billing data:", error);
				toast.error("Failed to load billing information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchBillingData();
	}, [organization, activeTab, success, sessionId]);

	// Handle subscription upgrade
	const handleUpgrade = async (plan: "pro" | "business") => {
		try {
			setIsUpgrading(true);
			await upgradeSubscription(plan);
			toast.success(`Successfully upgraded to ${plan} plan!`);
		} catch (error) {
			toast.error("Failed to upgrade subscription");
		} finally {
			setIsUpgrading(false);
		}
	};

	// Handle cancel subscription
	const handleCancelSubscription = async () => {
		try {
			setIsLoading(true);
			await cancelSubscription();
		} catch (error) {
			toast.error("Failed to cancel subscription");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle adding a new payment method
	const handleAddPaymentMethod = async () => {
		if (!organization || !stripeJs || !elements) return;

		try {
			setIsLoading(true);
			setNewCardError(null);

			const cardElement = elements.getElement(CardElement);
			if (!cardElement) {
				toast.error("Card element not found");
				return;
			}

			// Create payment method
			const { error, paymentMethod } = await stripeJs.createPaymentMethod({
				type: "card",
				card: cardElement,
			});

			if (error) {
				setNewCardError(error.message || "Failed to add payment method");
				return;
			}

			// Add payment method to the organization
			await BillingAPI.addPaymentMethod(organization.id, paymentMethod.id);

			// Clear card input and refresh payment methods
			cardElement.clear();

			// Fetch updated payment methods
			const updatedPaymentMethods = await BillingAPI.getPaymentMethods(
				organization.id
			);
			setPaymentMethods(updatedPaymentMethods);

			toast.success("Payment method added successfully");
		} catch (error) {
			console.error("Error adding payment method:", error);
			toast.error("Failed to add payment method");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle removing a payment method
	const handleRemovePaymentMethod = async (paymentMethodId: string) => {
		if (!organization) return;

		try {
			setIsLoading(true);

			// Remove payment method
			await BillingAPI.removePaymentMethod(organization.id, paymentMethodId);

			// Update payment methods list
			const updatedPaymentMethods = await BillingAPI.getPaymentMethods(
				organization.id
			);
			setPaymentMethods(updatedPaymentMethods);

			toast.success("Payment method removed successfully");
		} catch (error) {
			console.error("Error removing payment method:", error);
			toast.error("Failed to remove payment method");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingSubscription && !subscription) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<LoadingState
					message="Loading billing information..."
					type="spinner"
				/>
			</div>
		);
	}

	// Create the content section that will be used in both contexts
	const renderContent = () => (
		<>
			{/* Subscription Content */}
			{activeTab === "subscription" && (
				<>
					{subscription?.status === "past_due" && (
						<Alert
							variant="destructive"
							className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Payment Past Due</AlertTitle>
							<AlertDescription>
								Your payment is past due. Please update your payment method to
								continue using your subscription.
							</AlertDescription>
						</Alert>
					)}

					<ContentSection
						title="Available Plans"
						description="Choose a plan that best fits your business needs">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Free Plan */}
							<div
								className={`border rounded-lg p-5 transition-all ${
									subscription?.plan === "free"
										? "bg-card border-primary"
										: "bg-muted/10 hover:bg-card"
								}`}>
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Free Plan</h4>
										{subscription?.plan === "free" && (
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
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>Premium support</span>
									</li>
								</ul>
								{subscription?.plan === "free" || !subscription?.plan ? (
									<Button
										variant="outline"
										disabled
										className="w-full">
										Current Plan
									</Button>
								) : (
									<Button
										variant="outline"
										disabled={isUpgrading}
										onClick={() => handleCancelSubscription()}
										className="w-full">
										Downgrade to Free
									</Button>
								)}
							</div>

							{/* Pro Plan */}
							<div
								className={`border rounded-lg p-5 transition-all ${
									subscription?.plan === "pro"
										? "bg-card border-primary"
										: "bg-muted/10 hover:bg-card"
								}`}>
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Pro Plan</h4>
										{subscription?.plan === "pro" && (
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
										<span>Email notifications</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Basic reporting</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>SMS notifications</span>
									</li>
									<li className="flex items-start text-muted-foreground">
										<span className="mr-2">✗</span>
										<span>Premium support</span>
									</li>
								</ul>
								{subscription?.plan !== "pro" ? (
									<Button
										variant="default"
										disabled={isUpgrading}
										onClick={() => handleUpgrade("pro")}
										className="w-full">
										{isUpgrading ? (
											<>
												<span className="animate-spin mr-2">↻</span>{" "}
												Upgrading...
											</>
										) : subscription?.plan === "business" ? (
											"Downgrade to Pro"
										) : (
											"Upgrade to Pro"
										)}
									</Button>
								) : (
									<Button
										variant="outline"
										disabled
										className="w-full">
										Current Plan
									</Button>
								)}
							</div>

							{/* Business Plan */}
							<div
								className={`border rounded-lg p-5 transition-all ${
									subscription?.plan === "business"
										? "bg-card border-primary"
										: "bg-muted/10 hover:bg-card"
								}`}>
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h4 className="text-lg font-semibold">Business Plan</h4>
										{subscription?.plan === "business" && (
											<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
												Current Plan
											</div>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										For larger organizations
									</p>
								</div>
								<div className="mb-4">
									<span className="text-3xl font-bold">$99</span>
									<span className="text-muted-foreground"> / month</span>
								</div>
								<ul className="space-y-2 text-sm mb-6">
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Unlimited employees</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Advanced scheduling features</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Email notifications</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Advanced reporting</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>SMS notifications</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 mr-2 text-primary" />
										<span>Premium support</span>
									</li>
								</ul>
								{subscription?.plan !== "business" ? (
									<Button
										variant="default"
										disabled={isUpgrading}
										onClick={() => handleUpgrade("business")}
										className="w-full">
										{isUpgrading ? (
											<>
												<span className="animate-spin mr-2">↻</span>{" "}
												Upgrading...
											</>
										) : (
											"Upgrade to Business"
										)}
									</Button>
								) : (
									<Button
										variant="outline"
										disabled
										className="w-full">
										Current Plan
									</Button>
								)}
							</div>
						</div>
					</ContentSection>

					{subscription?.status === "active" &&
						subscription.plan !== "free" && (
							<ContentSection
								title="Current Subscription"
								description="Manage your current subscription">
								<Card>
									<CardHeader>
										<CardTitle>
											{subscription.plan.charAt(0).toUpperCase() +
												subscription.plan.slice(1)}{" "}
											Plan
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-sm space-y-2">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Status:</span>
												<span className="font-medium">
													{subscription.status.charAt(0).toUpperCase() +
														subscription.status.slice(1)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													Current period:
												</span>
												<span className="font-medium">
													{format(
														new Date(subscription.current_period_start),
														"MMM dd, yyyy"
													)}{" "}
													-{" "}
													{format(
														new Date(subscription.current_period_end),
														"MMM dd, yyyy"
													)}
												</span>
											</div>
											{subscription.cancel_at_period_end && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Cancellation:
													</span>
													<span className="font-medium text-yellow-600">
														Cancels at period end
													</span>
												</div>
											)}
											{subscription.trial_end && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Trial ends:
													</span>
													<span className="font-medium">
														{format(
															new Date(subscription.trial_end),
															"MMM dd, yyyy"
														)}
													</span>
												</div>
											)}
										</div>
									</CardContent>
									<CardFooter className="flex justify-end space-x-2">
										{!subscription.cancel_at_period_end && (
											<Button
												variant="outline"
												onClick={handleCancelSubscription}
												disabled={isLoading}>
												{isLoading ? "Canceling..." : "Cancel Subscription"}
											</Button>
										)}
									</CardFooter>
								</Card>
							</ContentSection>
						)}
				</>
			)}

			{/* Payment Methods Content */}
			{activeTab === "payment-methods" && (
				<ContentSection
					title="Payment Methods"
					description="Manage your payment methods and billing information">
					{isLoading ? (
						<LoadingState
							message="Loading payment methods..."
							type="spinner"
						/>
					) : (
						<>
							<div className="space-y-6">
								{/* Existing Payment Methods */}
								{paymentMethods.length > 0 ? (
									<div className="space-y-4">
										{paymentMethods.map((method) => (
											<Card key={method.id}>
												<CardContent className="p-4">
													<div className="flex justify-between items-center">
														<div className="flex items-center">
															<CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
															<div>
																<p className="font-medium capitalize">
																	{method.card?.brand} •••• {method.card?.last4}
																</p>
																<p className="text-sm text-muted-foreground">
																	Expires {method.card?.exp_month}/
																	{method.card?.exp_year}
																</p>
															</div>
														</div>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																handleRemovePaymentMethod(method.id)
															}
															disabled={isLoading}>
															<Trash className="h-4 w-4 mr-1" />
															Remove
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<Alert>
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>No payment methods</AlertTitle>
										<AlertDescription>
											You don't have any payment methods set up yet.
										</AlertDescription>
									</Alert>
								)}

								{/* Add New Payment Method */}
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">
											Add Payment Method
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="border rounded-md p-3">
												<CardElement
													options={{
														style: {
															base: {
																fontSize: "16px",
																color: "#424770",
																"::placeholder": {
																	color: "#aab7c4",
																},
															},
															invalid: {
																color: "#9e2146",
															},
														},
													}}
												/>
											</div>
											{newCardError && (
												<Alert variant="destructive">
													<AlertCircle className="h-4 w-4" />
													<AlertDescription>{newCardError}</AlertDescription>
												</Alert>
											)}
										</div>
									</CardContent>
									<CardFooter>
										<Button
											onClick={handleAddPaymentMethod}
											disabled={isLoading}>
											<Plus className="h-4 w-4 mr-2" />
											{isLoading ? "Adding..." : "Add Payment Method"}
										</Button>
									</CardFooter>
								</Card>
							</div>
						</>
					)}
				</ContentSection>
			)}

			{/* Billing History Content */}
			{activeTab === "billing-history" && (
				<ContentSection
					title="Billing History"
					description="View your past invoices and billing history">
					{isLoading ? (
						<LoadingState
							message="Loading billing history..."
							type="spinner"
						/>
					) : invoices.length > 0 ? (
						<DataTable
							columns={invoiceColumns}
							data={invoices}
						/>
					) : (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>No invoices found</AlertTitle>
							<AlertDescription>
								You don't have any invoices yet. They will appear here once you
								upgrade to a paid plan.
							</AlertDescription>
						</Alert>
					)}
				</ContentSection>
			)}
		</>
	);

	// If we're in the account page, just return the content
	if (isInAccountPage) {
		return renderContent();
	}

	// Otherwise, use PageLayout for standalone page
	return (
		<>
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">
					Billing & Subscription
				</h1>
				<p className="mt-2 text-muted-foreground">
					Manage your subscription plan and payment methods
				</p>
			</div>
			<AppContent>{renderContent()}</AppContent>
		</>
	);
}
