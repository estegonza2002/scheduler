import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container max-w-4xl mx-auto py-12 px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Terms of Service</h1>
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
						<h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
						<p>
							Welcome to Scheduler. These Terms of Service govern your use of
							our website and services. By accessing or using our services, you
							agree to be bound by these Terms.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">2. Use of Services</h2>
						<p>
							Our services are designed to help businesses manage their employee
							scheduling. You are responsible for maintaining the
							confidentiality of your account information and for all activities
							that occur under your account.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
						<p>
							You retain all rights to the content you upload to our platform.
							By uploading content, you grant us a non-exclusive license to use,
							display, and store your content solely for the purpose of
							providing our services to you.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">
							4. Limitations of Liability
						</h2>
						<p>
							Our services are provided "as is" without warranties of any kind.
							We are not liable for any damages arising from your use of our
							services.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">5. Changes to Terms</h2>
						<p>
							We may modify these Terms at any time. If we make material
							changes, we will notify you through our services or by other
							means.
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
						<p>
							We may terminate or suspend your access to our services
							immediately, without prior notice, for conduct that we believe
							violates these Terms.
						</p>
					</section>
				</div>

				<div className="mt-12 pt-6 border-t border-border">
					<p className="text-sm text-muted-foreground">
						By using our services, you acknowledge that you have read and
						understand these Terms of Service.
					</p>
					<div className="mt-4">
						<Button
							asChild
							variant="outline">
							<Link to="/privacy">View Privacy Policy</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
