import { useState } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TeamSize = "small" | "medium" | "large";
type BillingCycle = "monthly" | "annually";

interface PricePlanProps {
	title: string;
	price: {
		monthly: number;
		annually: number;
	};
	description: string;
	features: string[];
	popular?: boolean;
	disabled?: boolean;
	teamSize: TeamSize;
	billingCycle: BillingCycle;
	plan: "free" | "pro" | "business";
	onSelect: (plan: "free" | "pro" | "business") => void;
}

// Individual pricing plan card component
const PricePlan = ({
	title,
	price,
	description,
	features,
	popular,
	disabled,
	teamSize,
	billingCycle,
	plan,
	onSelect,
}: PricePlanProps) => {
	// Calculate total price based on billing cycle
	const displayPrice =
		billingCycle === "monthly" ? price.monthly : price.annually;

	// Calculate billing period text
	const billingPeriod = billingCycle === "monthly" ? "per month" : "per month";

	// Calculate total billed amount
	const totalBilled =
		billingCycle === "monthly"
			? `$${price.monthly} billed every 1 month`
			: `$${
					price.annually * (billingCycle === "annually" ? 12 : 6)
			  } billed every ${billingCycle === "annually" ? 12 : 6} months`;

	// Calculate savings
	const savings =
		billingCycle === "monthly" ? null : billingCycle === "annually" ? 96 : 24;

	// Determine button state
	const buttonLabel = "Start Free Trial";

	return (
		<Card className={cn("flex flex-col", popular && "border-primary relative")}>
			{popular && (
				<div className="absolute top-0 left-0 right-0">
					<div className="bg-primary text-primary-foreground text-center py-1 px-4 rounded-t-lg">
						Most Popular
					</div>
				</div>
			)}

			<CardHeader className={cn(popular && "pt-8")}>
				<CardTitle className="text-xl font-semibold">{title}</CardTitle>
			</CardHeader>

			<CardContent className="flex-1">
				<div className="flex flex-col space-y-6">
					<div>
						<div className="flex items-baseline">
							<span className="text-5xl font-bold">${displayPrice}</span>
							<span className="text-sm text-muted-foreground ml-2">
								{billingPeriod}
							</span>
						</div>
						<div className="text-sm text-muted-foreground mt-1">
							{totalBilled}
						</div>
					</div>

					{savings && (
						<div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-md">
							Save ${savings}
						</div>
					)}

					<ul className="space-y-2">
						{features.map((feature, i) => (
							<li
								key={i}
								className="flex items-center">
								<Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
								<span className="text-sm">{feature}</span>
							</li>
						))}
					</ul>
				</div>
			</CardContent>

			<CardFooter className="pt-4">
				<Button
					className="w-full"
					variant={popular ? "default" : "outline"}
					onClick={() => onSelect(plan)}>
					{buttonLabel}
				</Button>
			</CardFooter>
		</Card>
	);
};

// Team size toggle options
const teamSizeOptions = [
	{ label: "1-5", value: "small" },
	{ label: "6-10", value: "medium" },
	{ label: "11+", value: "large" },
];

// Public pricing plans component that doesn't require organization
export default function PublicPricingPlans() {
	const [teamSize, setTeamSize] = useState<TeamSize>("small");
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const navigate = useNavigate();

	// Define pricing plans based on team size and billing cycle
	const pricingPlans = {
		small: {
			monthly: {
				free: { price: 0 },
				pro: { price: 29 },
				business: { price: 49 },
			},
			annually: {
				free: { price: 0 },
				pro: { price: 25 },
				business: { price: 39 },
			},
		},
		medium: {
			monthly: {
				free: { price: 0 },
				pro: { price: 49 },
				business: { price: 79 },
			},
			annually: {
				free: { price: 0 },
				pro: { price: 39 },
				business: { price: 69 },
			},
		},
		large: {
			monthly: {
				free: { price: 0 },
				pro: { price: 99 },
				business: { price: 149 },
			},
			annually: {
				free: { price: 0 },
				pro: { price: 89 },
				business: { price: 129 },
			},
		},
	};

	// Features for each plan
	const features = {
		free: [
			"Up to 5 team members",
			"Basic scheduling",
			"Email notifications",
			"1 location",
		],
		pro: [
			"Up to 10 team members",
			"Advanced scheduling",
			"Email & SMS notifications",
			"5 locations",
			"Custom branding",
			"Priority support",
		],
		business: [
			"Unlimited team members",
			"Enterprise scheduling",
			"All notification channels",
			"Unlimited locations",
			"Custom branding",
			"API access",
			"24/7 premium support",
			"Advanced analytics",
		],
	};

	// Handle plan selection - redirect to signup
	const handleSelectPlan = (plan: "free" | "pro" | "business") => {
		// Redirect to signup page with selected plan
		navigate(`/signup?plan=${plan}&cycle=${billingCycle}&size=${teamSize}`);
	};

	// Get current price based on selected plan, team size and billing cycle
	const getCurrentPlanPrice = (plan: "free" | "pro" | "business") => {
		const cycleType = billingCycle === "monthly" ? "monthly" : "annually";
		return pricingPlans[teamSize][cycleType][plan].price;
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center max-w-4xl mx-auto mb-10">
				<h1 className="text-4xl font-bold tracking-tight mb-4">
					Simple, Transparent Pricing
				</h1>
				<p className="text-xl text-muted-foreground mb-4">
					Start your 14-day free trial today. No credit card required.
				</p>
				<p className="text-xl font-bold tracking-tight mb-2">
					Free for all teams of 5 or less
				</p>
				<p className="text-lg text-muted-foreground mb-8">
					All plans include a{" "}
					<span className="font-semibold">2 week Free Trial</span>. No Card
					Required. Cancel Anytime.
				</p>

				{/* Team size toggle */}
				<div className="inline-flex flex-col items-center mb-8">
					<p className="text-base font-medium mb-2">Select your team size:</p>
					<div className="inline-flex items-center bg-muted p-1 rounded-md">
						<Button
							variant={teamSize === "small" ? "default" : "ghost"}
							className="rounded-md"
							onClick={() => setTeamSize("small")}>
							<span className="font-bold">0-5</span>
							<span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
								FREE
							</span>
						</Button>
						<Button
							variant={teamSize === "medium" ? "default" : "ghost"}
							className="rounded-md"
							onClick={() => setTeamSize("medium")}>
							6-10
						</Button>
						<Button
							variant={teamSize === "large" ? "default" : "ghost"}
							className="rounded-md"
							onClick={() => setTeamSize("large")}>
							11+
						</Button>
					</div>
				</div>

				{/* Billing toggle */}
				<div className="inline-flex flex-col items-center mb-12">
					<p className="text-base font-medium mb-2">Billing cycle:</p>
					<div className="inline-flex items-center bg-muted p-1 rounded-md">
						<Button
							variant={billingCycle === "monthly" ? "default" : "ghost"}
							className="rounded-md"
							onClick={() => setBillingCycle("monthly")}>
							Monthly
						</Button>
						<Button
							variant={billingCycle === "annually" ? "default" : "ghost"}
							className="rounded-md"
							onClick={() => setBillingCycle("annually")}>
							Annually
							<span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
								Save 20%
							</span>
						</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				{/* Free Plan */}
				<PricePlan
					title="Free"
					price={{
						monthly: 0,
						annually: 0,
					}}
					description="Basic scheduling for small teams"
					features={features.free}
					teamSize={teamSize}
					billingCycle={billingCycle}
					plan="free"
					onSelect={handleSelectPlan}
					disabled={teamSize !== "small"}
				/>

				{/* Pro Plan */}
				<PricePlan
					title="Pro"
					price={{
						monthly: getCurrentPlanPrice("pro"),
						annually: getCurrentPlanPrice("pro"),
					}}
					description="Advanced features for growing teams"
					features={features.pro}
					popular={true}
					teamSize={teamSize}
					billingCycle={billingCycle}
					plan="pro"
					onSelect={handleSelectPlan}
				/>

				{/* Business Plan */}
				<PricePlan
					title="Business"
					price={{
						monthly: getCurrentPlanPrice("business"),
						annually: getCurrentPlanPrice("business"),
					}}
					description="Enterprise features for larger teams"
					features={features.business}
					teamSize={teamSize}
					billingCycle={billingCycle}
					plan="business"
					onSelect={handleSelectPlan}
				/>
			</div>
		</div>
	);
}
