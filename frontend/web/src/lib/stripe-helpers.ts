import Stripe from "stripe";

// In a browser environment, we should import Stripe from @stripe/stripe-js
// But for now, we'll create a browser-safe version
let stripe: any;

// Only initialize Stripe on the server, not in the browser
if (typeof window === "undefined") {
	// Server-side code
	stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
} else {
	// Browser-side code
	console.warn(
		"Stripe server SDK cannot be used in the browser. Consider using @stripe/stripe-js for browser-side Stripe operations."
	);
	stripe = {
		// Mock implementation or placeholders
		customers: { create: async () => ({}) },
		subscriptions: {
			create: async () => ({}),
			retrieve: async () => ({ items: { data: [{ id: "" }] } }),
			update: async () => ({}),
		},
		paymentMethods: {
			list: async () => ({ data: [] }),
			attach: async () => ({}),
			detach: async () => ({}),
		},
		invoices: { list: async () => ({ data: [] }) },
		checkout: { sessions: { create: async () => ({}) } },
		webhooks: { constructEvent: () => ({}) },
	};
}

// Enum for subscription plans
export enum SubscriptionPlan {
	FREE = "free",
	PRO = "pro",
	BUSINESS = "business",
}

// Mapping of plans to Stripe price IDs
export const STRIPE_PRICE_IDS: Record<SubscriptionPlan, string> = {
	[SubscriptionPlan.FREE]: "", // Free has no price ID
	[SubscriptionPlan.PRO]: "price_pro", // Replace with actual Stripe price ID
	[SubscriptionPlan.BUSINESS]: "price_business", // Replace with actual Stripe price ID
};

// Helper function to create a customer in Stripe
export const createCustomer = async (
	email: string,
	name: string,
	metadata: Record<string, string> = {}
) => {
	return stripe.customers.create({
		email,
		name,
		metadata,
	});
};

// Helper function to create a subscription
export const createSubscription = async (
	customerId: string,
	priceId: string
) => {
	return stripe.subscriptions.create({
		customer: customerId,
		items: [{ price: priceId }],
		payment_behavior: "default_incomplete",
		expand: ["latest_invoice.payment_intent"],
	});
};

// Helper function to update a subscription
export const updateSubscription = async (
	subscriptionId: string,
	priceId: string
) => {
	return stripe.subscriptions
		.retrieve(subscriptionId)
		.then((subscription: any) => {
			return stripe.subscriptions.update(subscriptionId, {
				items: [
					{
						id: subscription.items.data[0].id,
						price: priceId,
					},
				],
			});
		});
};

// Helper function to cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
	return stripe.subscriptions.update(subscriptionId, {
		cancel_at_period_end: true,
	});
};

// Helper function to get all payment methods for a customer
export const getPaymentMethods = async (customerId: string) => {
	return stripe.paymentMethods.list({
		customer: customerId,
		type: "card",
	});
};

// Helper function to attach a payment method to a customer
export const attachPaymentMethod = async (
	paymentMethodId: string,
	customerId: string
) => {
	return stripe.paymentMethods.attach(paymentMethodId, {
		customer: customerId,
	});
};

// Helper function to detach a payment method
export const detachPaymentMethod = async (paymentMethodId: string) => {
	return stripe.paymentMethods.detach(paymentMethodId);
};

// Helper function to get invoices for a customer
export const getInvoices = async (customerId: string) => {
	return stripe.invoices.list({
		customer: customerId,
	});
};

// Helper function to create a checkout session
export const createCheckoutSession = async (
	customerId: string,
	priceId: string,
	successUrl: string,
	cancelUrl: string,
	metadata: Record<string, string> = {}
) => {
	return stripe.checkout.sessions.create({
		customer: customerId,
		payment_method_types: ["card"],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: "subscription",
		success_url: successUrl,
		cancel_url: cancelUrl,
		metadata,
	});
};

// Helper function to verify webhook signature
export const verifyWebhookSignature = (rawBody: string, signature: string) => {
	// In a browser environment, we'll skip this
	if (typeof window !== "undefined") {
		console.warn("Webhook verification cannot be performed in the browser");
		return {};
	}

	const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		throw new Error("Webhook secret is not defined");
	}

	try {
		return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
	} catch (err) {
		throw new Error(
			`Webhook signature verification failed: ${
				err instanceof Error ? err.message : "Unknown error"
			}`
		);
	}
};

export default stripe;
