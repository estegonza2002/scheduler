import { supabase } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/stripe-helpers";
import Stripe from "stripe";

// Handle Stripe webhook events
export async function handleStripeWebhook(body: string, signature: string) {
	try {
		// Verify the webhook signature
		const event = verifyWebhookSignature(body, signature);

		// Handle different event types
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				await handleCheckoutSessionCompleted(session);
				break;
			}
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionUpdated(subscription);
				break;
			}
			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionDeleted(subscription);
				break;
			}
			case "invoice.paid": {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaid(invoice);
				break;
			}
			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaymentFailed(invoice);
				break;
			}
			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return { status: "success" };
	} catch (err) {
		console.error("Error handling webhook:", err);
		throw err;
	}
}

// Handle checkout.session.completed events
async function handleCheckoutSessionCompleted(
	session: Stripe.Checkout.Session
) {
	const organizationId = session.metadata?.organizationId;

	if (!organizationId) {
		console.error("No organization ID in session metadata");
		return;
	}

	if (!session.subscription) {
		console.error("No subscription in completed checkout session");
		return;
	}

	// Update the organization with the subscription ID
	const { error } = await supabase
		.from("organizations")
		.update({
			subscription_id: session.subscription as string,
			stripe_customer_id: session.customer as string,
		})
		.eq("id", organizationId);

	if (error) {
		console.error("Error updating organization with subscription ID:", error);
	}
}

// Handle subscription updated events
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
	// Find organization with this subscription ID
	const { data: organizations, error } = await supabase
		.from("organizations")
		.select("id")
		.eq("subscription_id", subscription.id);

	if (error || !organizations.length) {
		console.error("Organization not found for subscription:", subscription.id);
		return;
	}

	const organizationId = organizations[0].id;

	// Determine the plan based on the price ID
	let plan = "free";

	if (subscription.items.data[0]?.price.id) {
		const priceId = subscription.items.data[0].price.id;
		// Map the price ID to the plan - this depends on your Stripe configuration
		if (priceId.includes("pro")) {
			plan = "pro";
		} else if (priceId.includes("business")) {
			plan = "business";
		}
	}

	// Update the organization's subscription status
	const { error: updateError } = await supabase
		.from("organizations")
		.update({
			subscription_status: subscription.status,
			subscription_plan: plan,
		})
		.eq("id", organizationId);

	if (updateError) {
		console.error(
			"Error updating organization subscription status:",
			updateError
		);
	}
}

// Handle subscription deleted events
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
	// Find organization with this subscription ID
	const { data: organizations, error } = await supabase
		.from("organizations")
		.select("id")
		.eq("subscription_id", subscription.id);

	if (error || !organizations.length) {
		console.error("Organization not found for subscription:", subscription.id);
		return;
	}

	const organizationId = organizations[0].id;

	// Update the organization to free plan
	const { error: updateError } = await supabase
		.from("organizations")
		.update({
			subscription_id: "free_subscription",
			subscription_status: "active",
			subscription_plan: "free",
		})
		.eq("id", organizationId);

	if (updateError) {
		console.error(
			"Error updating organization subscription status:",
			updateError
		);
	}
}

// Handle invoice paid events
async function handleInvoicePaid(invoice: Stripe.Invoice) {
	// For paid invoices, we might want to record payment or update usage limits
	console.log("Invoice paid:", invoice.id);
}

// Handle invoice payment failed events
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
	// For failed payments, we might want to notify the user or restrict access
	console.log("Invoice payment failed:", invoice.id);

	// Find customer's organization
	if (!invoice.customer) return;

	const { data: organizations, error } = await supabase
		.from("organizations")
		.select("id")
		.eq("stripe_customer_id", invoice.customer);

	if (error || !organizations.length) {
		console.error("Organization not found for customer:", invoice.customer);
		return;
	}

	// You could send a notification or update the subscription status
	// depending on your business logic
}
