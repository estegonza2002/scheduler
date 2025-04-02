import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useStripeContext } from "../lib/stripe";
import { useOrganization } from "../lib/organization";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Type for the plans
type SubscriptionPlan = "free" | "pro" | "business";

// Type for billing cycle
type BillingCycle = "monthly" | "annually";

// Subscription modal props
interface SubscriptionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedPlan: SubscriptionPlan;
	billingCycle: BillingCycle;
	price: number;
	features: string[];
}

// Steps in the subscription flow
type SubscriptionStep =
	| "plan-confirmation"
	| "account-details"
	| "confirmation";

// Form schema for account information
const accountFormSchema = z.object({
	name: z.string().min(2, { message: "Name is required" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	company: z.string().optional(),
});

export default function SubscriptionModal({
	open,
	onOpenChange,
	selectedPlan,
	billingCycle,
	price,
	features,
}: SubscriptionModalProps) {
	// State for the current step
	const [currentStep, setCurrentStep] =
		useState<SubscriptionStep>("plan-confirmation");
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingError, setProcessingError] = useState<string | null>(null);
	const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

	// Form definition
	const form = useForm<z.infer<typeof accountFormSchema>>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
		},
	});

	// Get context
	const { upgradeSubscription } = useStripeContext();
	const { organization } = useOrganization();

	// Get billing period text
	const billingPeriodText = billingCycle === "monthly" ? "monthly" : "annually";

	// Handle form submission
	const onSubmit = async (data: z.infer<typeof accountFormSchema>) => {
		setIsProcessing(true);
		setProcessingError(null);

		try {
			// In a real implementation, you would send this to your backend
			console.log("Account information:", data);

			if (organization) {
				try {
					// Upgrade subscription using the context
					await upgradeSubscription(selectedPlan);

					// Artificial delay to avoid jarring UX
					await new Promise((resolve) => setTimeout(resolve, 1000));

					// Move to confirmation step
					setSubscriptionSuccess(true);
					setCurrentStep("confirmation");
				} catch (subscriptionError) {
					console.error("Subscription error:", subscriptionError);
					throw new Error(
						typeof subscriptionError === "string"
							? subscriptionError
							: (subscriptionError as Error).message ||
							  "Failed to create subscription"
					);
				}
			}
		} catch (error) {
			console.error("Processing error:", error);
			setProcessingError(
				typeof error === "string" ? error : (error as Error).message
			);
		} finally {
			setIsProcessing(false);
		}
	};

	// Handle next step
	const handleNextStep = () => {
		if (currentStep === "plan-confirmation") {
			setCurrentStep("account-details");
		} else if (currentStep === "account-details") {
			form.handleSubmit(onSubmit)();
		}
	};

	// Handle previous step
	const handlePreviousStep = () => {
		if (currentStep === "account-details") {
			setCurrentStep("plan-confirmation");
		}
	};

	// Handle closing the modal
	const handleClose = () => {
		// Reset state when modal is closed
		setCurrentStep("plan-confirmation");
		setProcessingError(null);
		setSubscriptionSuccess(false);
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				{/* Progress indicators */}
				<div className="flex justify-between mb-6">
					{["Plan", "Account", "Confirmation"].map((step, index) => (
						<div
							key={index}
							className="flex flex-col items-center">
							<div
								className={cn(
									"w-8 h-8 rounded-full flex items-center justify-center border-2",
									(index === 0 && currentStep === "plan-confirmation") ||
										(index === 1 && currentStep === "account-details") ||
										(index === 2 && currentStep === "confirmation")
										? "border-primary bg-primary text-primary-foreground"
										: index <
										  (currentStep === "account-details"
												? 1
												: currentStep === "confirmation"
												? 2
												: 0)
										? "border-primary bg-primary/20 text-primary"
										: "border-muted bg-muted/20 text-muted-foreground"
								)}>
								{index <
								(currentStep === "account-details"
									? 1
									: currentStep === "confirmation"
									? 2
									: -1) ? (
									<Check className="h-4 w-4" />
								) : (
									<span>{index + 1}</span>
								)}
							</div>
							<span
								className={cn(
									"text-xs mt-1",
									(index === 0 && currentStep === "plan-confirmation") ||
										(index === 1 && currentStep === "account-details") ||
										(index === 2 && currentStep === "confirmation")
										? "text-primary font-medium"
										: "text-muted-foreground"
								)}>
								{step}
							</span>
						</div>
					))}
				</div>

				{/* Step 1: Plan Confirmation */}
				{currentStep === "plan-confirmation" && (
					<>
						<DialogHeader>
							<DialogTitle>Confirm Your Subscription</DialogTitle>
							<DialogDescription>
								Review your selected plan before proceeding to start your free
								trial.
							</DialogDescription>
						</DialogHeader>

						<div className="py-4 space-y-4">
							<div className="bg-muted/30 p-4 rounded-lg">
								<div className="flex justify-between items-center mb-2">
									<h3 className="font-medium">
										{selectedPlan.toUpperCase()} PLAN
									</h3>
									<span className="text-xl font-bold">${price}</span>
								</div>
								<p className="text-sm text-muted-foreground">
									Billed {billingPeriodText} after trial
								</p>

								<div className="bg-primary/10 p-3 rounded-lg my-4">
									<p className="text-sm font-medium">
										14-day free trial with no credit card required
									</p>
								</div>

								<div className="space-y-2">
									<h4 className="text-sm font-medium">Includes:</h4>
									<ul className="space-y-1">
										{features.map((feature, index) => (
											<li
												key={index}
												className="flex items-center text-sm">
												<Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={handleNextStep}>
								Continue
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</DialogFooter>
					</>
				)}

				{/* Step 2: Account Details */}
				{currentStep === "account-details" && (
					<>
						<DialogHeader>
							<DialogTitle>Account Information</DialogTitle>
							<DialogDescription>
								Enter your information to start your free trial.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input
													placeholder="John Doe"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<Input
													placeholder="john@example.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="company"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Your Company"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{processingError && (
									<p className="text-sm text-red-500">{processingError}</p>
								)}
							</form>
						</Form>

						<div className="mt-2 text-sm text-muted-foreground">
							No credit card required. You'll receive an email before your trial
							ends to add payment details.
						</div>

						<DialogFooter className="mt-6">
							<Button
								variant="outline"
								onClick={handlePreviousStep}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button
								onClick={handleNextStep}
								disabled={isProcessing}>
								{isProcessing ? "Processing..." : "Start Free Trial"}
							</Button>
						</DialogFooter>
					</>
				)}

				{/* Step 3: Confirmation */}
				{currentStep === "confirmation" && (
					<>
						<DialogHeader>
							<DialogTitle>Free Trial Started!</DialogTitle>
							<DialogDescription>
								Your free trial has been successfully activated.
							</DialogDescription>
						</DialogHeader>

						<div className="py-6 flex flex-col items-center justify-center">
							<div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
								<Check className="h-8 w-8 text-green-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Thank You!</h3>
							<p className="text-center text-muted-foreground">
								Your {selectedPlan.toUpperCase()} plan trial begins today. We'll
								email you before your trial ends.
							</p>

							<div className="bg-muted/30 p-4 rounded-lg mt-4 w-full">
								<h4 className="font-medium mb-2">Subscription Summary</h4>
								<div className="flex justify-between">
									<span>Plan:</span>
									<span className="font-medium">
										{selectedPlan.toUpperCase()}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Price after trial:</span>
									<span className="font-medium">
										${price}/{billingCycle === "monthly" ? "mo" : "yr"}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Billing after trial:</span>
									<span className="font-medium capitalize">
										{billingPeriodText}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Trial Ends:</span>
									<span className="font-medium">
										{new Date(
											Date.now() + 14 * 24 * 60 * 60 * 1000
										).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleClose}>Done</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
