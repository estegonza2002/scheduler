import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Subscription, SubscriptionPlan } from "@/api/types";
import { BillingAPI } from "@/api";
import { useOrganization } from "./organization";
import { supabase } from "./supabase";

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripeContextType {
	subscription: Subscription | null;
	isLoading: boolean;
	refreshSubscription: () => Promise<void>;
	upgradeSubscription: (plan: SubscriptionPlan) => Promise<void>;
	cancelSubscription: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function StripeProvider({ children }: { children: ReactNode }) {
	const { organization } = useOrganization();
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshSubscription = async () => {
		if (!organization) return;

		try {
			setIsLoading(true);
			const data = await BillingAPI.getCurrentSubscription(organization.id);
			setSubscription(data);
		} catch (error) {
			console.error("Error fetching subscription:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const upgradeSubscription = async (plan: SubscriptionPlan) => {
		if (!organization) return;

		try {
			await BillingAPI.updateSubscription(organization.id, { plan });
			await refreshSubscription();
		} catch (error) {
			console.error("Error upgrading subscription:", error);
			throw error;
		}
	};

	const cancelSubscription = async () => {
		if (!organization) return;

		try {
			await BillingAPI.cancelSubscription(organization.id);
			await refreshSubscription();
		} catch (error) {
			console.error("Error canceling subscription:", error);
			throw error;
		}
	};

	useEffect(() => {
		if (organization) {
			refreshSubscription();

			// Set up real-time subscription for webhooks
			const subscription = supabase
				.channel("organization-updates")
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "organizations",
						filter: `id=eq.${organization.id}`,
					},
					() => {
						refreshSubscription();
					}
				)
				.subscribe();

			return () => {
				subscription.unsubscribe();
			};
		}
	}, [organization]);

	// Value for the context provider
	const contextValue: StripeContextType = {
		subscription,
		isLoading,
		refreshSubscription,
		upgradeSubscription,
		cancelSubscription,
	};

	return (
		<StripeContext.Provider value={contextValue}>
			<Elements stripe={stripePromise}>{children}</Elements>
		</StripeContext.Provider>
	);
}

// Custom hook to use the Stripe context
export function useStripeContext() {
	const context = useContext(StripeContext);
	if (context === undefined) {
		throw new Error("useStripe must be used within a StripeProvider");
	}
	return context;
}
