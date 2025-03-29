import { Helmet } from "react-helmet";
import PricingPlans from "@/components/PricingPlans";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
	const navigate = useNavigate();

	return (
		<>
			<Helmet>
				<title>Pricing Plans | Scheduler</title>
			</Helmet>

			<PageLayout>
				<div className="container mx-auto px-4 py-8">
					<Button
						variant="ghost"
						className="mb-6"
						onClick={() => navigate(-1)}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back
					</Button>

					<PricingPlans />

					<div className="max-w-2xl mx-auto mt-16 text-center">
						<h2 className="text-2xl font-semibold mb-4">
							Frequently Asked Questions
						</h2>

						<div className="grid gap-6 mt-8">
							<div className="text-left">
								<h3 className="font-medium text-lg">
									What happens after my trial ends?
								</h3>
								<p className="text-muted-foreground mt-1">
									After your 14-day trial period ends, you'll automatically be
									moved to our free plan unless you choose to upgrade. We'll
									send you reminders before your trial ends.
								</p>
							</div>

							<div className="text-left">
								<h3 className="font-medium text-lg">
									Can I change plans later?
								</h3>
								<p className="text-muted-foreground mt-1">
									Yes, you can upgrade, downgrade, or cancel your subscription
									at any time. Changes take effect at the end of your current
									billing cycle.
								</p>
							</div>

							<div className="text-left">
								<h3 className="font-medium text-lg">Is there a setup fee?</h3>
								<p className="text-muted-foreground mt-1">
									No, there are no setup fees or hidden charges. The price you
									see is the price you pay.
								</p>
							</div>

							<div className="text-left">
								<h3 className="font-medium text-lg">
									What payment methods do you accept?
								</h3>
								<p className="text-muted-foreground mt-1">
									We accept all major credit cards (Visa, Mastercard, American
									Express, Discover) and most debit cards.
								</p>
							</div>

							<div className="text-left">
								<h3 className="font-medium text-lg">Do you offer refunds?</h3>
								<p className="text-muted-foreground mt-1">
									We offer a 30-day money-back guarantee. If you're not
									satisfied with our service, contact our support team within 30
									days of purchase for a full refund.
								</p>
							</div>
						</div>
					</div>
				</div>
			</PageLayout>
		</>
	);
}
