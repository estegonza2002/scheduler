# Stripe Integration Guide

This document provides information about our Stripe integration for handling subscriptions, payments, and billing functionality.

## Overview

Our application uses Stripe to handle all billing-related functionality:

- Subscription management
- Payment method handling
- Invoice generation and retrieval
- Checkout workflows

## API Reference

### BillingAPI

The `BillingAPI` provides methods to interact with our Stripe integration:

#### Subscription Methods

```typescript
// Get the current subscription for an organization
const subscription = await BillingAPI.getSubscription(organizationId);

// Update a subscription to a new plan
await BillingAPI.updateSubscription(organizationId, { plan: "pro" });

// Cancel the current subscription (effective at period end)
await BillingAPI.cancelSubscription(organizationId);
```

#### Payment Methods

```typescript
// Get all payment methods for an organization
const paymentMethods = await BillingAPI.getPaymentMethods(organizationId);

// Add a new payment method (paymentMethodId comes from Stripe Elements)
await BillingAPI.addPaymentMethod(organizationId, paymentMethodId);

// Remove a payment method
await BillingAPI.removePaymentMethod(organizationId, paymentMethodId);
```

#### Invoices

```typescript
// Get all invoices for an organization
const invoices = await BillingAPI.getInvoices(organizationId);
```

#### Checkout

```typescript
// Create a checkout session for a new subscription
const session = await BillingAPI.createCheckoutSession(organizationId, "pro");
// Redirect to session.url
```

### StripeProvider

The `StripeProvider` context provides subscription data and methods for components:

```typescript
import { useStripe } from "@/lib/stripe";

function MyComponent() {
	const {
		subscription,
		isLoading,
		refreshSubscription,
		upgradeSubscription,
		cancelSubscription,
	} = useStripe();

	// Use subscription data or actions
}
```

## Implementation Details

### Organization Table Fields

The `organizations` table includes the following Stripe-related fields:

- `stripe_customer_id`: The ID of the customer in Stripe
- `subscription_id`: The ID of the active subscription in Stripe
- `subscription_status`: The current status of the subscription

### Subscription Plans

Our application offers the following subscription plans:

- **Free**: Basic functionality with limitations
- **Pro**: Enhanced features for small businesses
- **Business**: Full feature set for larger organizations

### Integration Points

1. **BillingPage**: The main interface for users to manage their subscription
2. **StripeProvider**: Context provider that manages subscription state
3. **Backend API**: Routes that communicate with the Stripe API
4. **Webhooks**: Endpoints that receive events from Stripe

## Using Stripe Elements

To collect payment information securely:

```tsx
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function PaymentForm() {
	const stripeJs = useStripe();
	const elements = useElements();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!stripeJs || !elements) return;

		const cardElement = elements.getElement(CardElement);

		// Create payment method
		const { error, paymentMethod } = await stripeJs.createPaymentMethod({
			type: "card",
			card: cardElement,
		});

		if (error) {
			console.error(error);
			return;
		}

		// Use paymentMethod.id with our API
		await BillingAPI.addPaymentMethod(organizationId, paymentMethod.id);
	};

	return (
		<form onSubmit={handleSubmit}>
			<CardElement />
			<button type="submit">Save Card</button>
		</form>
	);
}
```

## Webhooks

Our application listens for the following Stripe webhook events:

- `checkout.session.completed`: When a checkout is completed
- `customer.subscription.created`: When a subscription is created
- `customer.subscription.updated`: When a subscription is updated
- `customer.subscription.deleted`: When a subscription is deleted
- `invoice.payment_succeeded`: When an invoice is paid
- `invoice.payment_failed`: When a payment fails

## Testing

Use the following test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Decline**: `4000 0000 0000 0002`

Set the expiration date to any future date and any 3-digit CVC.

## Troubleshooting

Common issues:

1. **Payment method not saved**: Ensure Stripe Elements is configured correctly
2. **Webhook events not received**: Check webhook signature verification
3. **Subscription not updating**: Verify the Stripe customer ID is correct

For detailed logs, check:

- Stripe Dashboard > Developers > Events
- Application logs for webhook processing

## Security Considerations

1. Never log or store full card details
2. Always use Stripe Elements for card collection
3. Verify webhook signatures to prevent spoofing
4. Use HTTPS for all communications with Stripe
5. Implement proper authorization for billing operations
