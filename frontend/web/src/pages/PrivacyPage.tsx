import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container max-w-4xl mx-auto py-12 px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Privacy Policy</h1>
					<Button
						variant="outline"
						asChild>
						<Link to="/">Back to Home</Link>
					</Button>
				</div>

				<div className="prose max-w-none">
					<p className="text-muted-foreground mb-6">
						Last updated: {new Date().toLocaleDateString()}
					</p>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">
							1. Information We Collect
						</h2>
						<p>
							We collect information you provide directly to us when you create
							an account, use our services, or communicate with us. This
							includes:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>Account information (name, email, password)</li>
							<li>
								Business information (business name, address, contact details)
							</li>
							<li>Employee scheduling information</li>
							<li>Usage data (how you interact with our services)</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">
							2. How We Use Your Information
						</h2>
						<p>We use the information we collect to:</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>Provide, maintain, and improve our services</li>
							<li>Create and maintain your account</li>
							<li>Process transactions</li>
							<li>Send you technical notices and support messages</li>
							<li>Respond to your comments and questions</li>
						</ul>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
						<p>
							We take reasonable measures to help protect your personal
							information from loss, theft, misuse, and unauthorized access.
							However, no security system is impenetrable, and we cannot
							guarantee the security of your data.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
						<p>
							We retain personal information for as long as necessary to fulfill
							the purposes for which it was collected, including for the
							purposes of satisfying any legal, accounting, or reporting
							requirements.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
						<p>
							Depending on your location, you may have certain rights regarding
							your personal information, such as the right to access, correct,
							or delete your data. Contact us to exercise these rights.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">
							6. Changes to This Policy
						</h2>
						<p>
							We may update this Privacy Policy from time to time. We will
							notify you of any changes by posting the new policy on this page.
						</p>
					</section>
				</div>

				<div className="mt-12 pt-6 border-t border-border">
					<p className="text-sm text-muted-foreground">
						By using our services, you acknowledge that you have read and
						understand this Privacy Policy.
					</p>
					<div className="mt-4">
						<Button
							asChild
							variant="outline">
							<Link to="/terms">View Terms of Service</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
