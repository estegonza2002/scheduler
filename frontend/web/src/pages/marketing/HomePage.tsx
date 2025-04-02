import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { RequestDemo } from "@/components/marketing";
import { COMPANY_NAME } from "@/constants";

export default function HomePage() {
	return (
		<>
			<Helmet>
				<title>{COMPANY_NAME} | Simplify Employee Scheduling</title>
			</Helmet>

			<AppContent>
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-background to-muted py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-5xl font-bold tracking-tight mb-6">
								Simplify Your Team Scheduling
							</h1>
							<p className="text-xl text-muted-foreground mb-8">
								{COMPANY_NAME} helps businesses create, manage, and optimize
								employee shifts with powerful automation and real-time
								communication.
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Button
									asChild
									size="lg">
									<Link to="/pricing">Get Started</Link>
								</Button>
								<RequestDemo>
									<Button
										variant="outline"
										size="lg">
										Request Demo
									</Button>
								</RequestDemo>
							</div>
							<p className="text-sm text-muted-foreground mt-4">
								No credit card required · 14-day free trial
							</p>
						</div>
					</div>
				</section>

				{/* Features Overview */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold mb-4">
								Everything You Need to Manage Your Team
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								{COMPANY_NAME} provides all the tools to create optimal
								schedules, reduce administrative work, and keep your team
								connected.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							<div className="bg-card rounded-lg p-6 shadow-sm border">
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6 text-primary">
										<rect
											width="18"
											height="18"
											x="3"
											y="3"
											rx="2"
										/>
										<path d="M3 9h18" />
										<path d="M9 21V9" />
										<path d="m16 16-3-3 3-3" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
								<p className="text-muted-foreground">
									Create, manage, and share employee schedules effortlessly with
									drag-and-drop simplicity and conflict detection.
								</p>
							</div>

							<div className="bg-card rounded-lg p-6 shadow-sm border">
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6 text-primary">
										<path d="M2 12h10" />
										<path d="M9 4v16" />
										<path d="m3 9 3 3-3 3" />
										<path d="M14 8h7a2 2 0 0 1 0 4h-7" />
										<path d="M14 16h7a2 2 0 0 0 0-4h-7" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Team Communication
								</h3>
								<p className="text-muted-foreground">
									Automated notifications, shift changes, and team messaging
									keep everyone informed in real-time.
								</p>
							</div>

							<div className="bg-card rounded-lg p-6 shadow-sm border">
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-6 w-6 text-primary">
										<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
										<path d="M19 17.5v-1a2.5 2.5 0 0 0-5 0v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2Z" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold mb-2">Data Insights</h3>
								<p className="text-muted-foreground">
									Analyze labor costs, staff performance, and schedule
									effectiveness with powerful reporting tools.
								</p>
							</div>
						</div>

						<div className="text-center mt-12">
							<Button
								asChild
								variant="outline">
								<Link
									to="/features"
									className="flex items-center">
									Explore All Features <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Social Proof */}
				<section className="py-20 bg-muted">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold mb-4">
								Trusted by Growing Businesses
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Join thousands of teams that rely on {COMPANY_NAME} every day
							</p>
						</div>

						{/* Logos Section */}
						<div className="flex flex-wrap justify-center gap-8 mb-16 opacity-80">
							{/* Placeholder for company logos */}
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-10 w-32 bg-card rounded flex items-center justify-center">
									<div className="text-lg font-bold text-muted-foreground">
										Logo {i + 1}
									</div>
								</div>
							))}
						</div>

						{/* Testimonials */}
						<div className="grid md:grid-cols-3 gap-8">
							{/* Testimonial Cards */}
							{[
								{
									name: "Sarah Johnson",
									role: "Manager, Café Sunrise",
									quote: `${COMPANY_NAME} reduced our time spent on scheduling by 80% and improved staff satisfaction.`,
								},
								{
									name: "David Chen",
									role: "Owner, Fitness Plus",
									quote:
										"The ability to manage multiple locations and track labor costs has been a game-changer for our gym chain.",
								},
								{
									name: "Michael Rodriguez",
									role: "Director, Community Health Clinic",
									quote: `Our staff communication has improved dramatically since implementing ${COMPANY_NAME}.`,
								},
							].map((testimonial, i) => (
								<div
									key={i}
									className="bg-card rounded-lg p-6 shadow-sm border">
									<div className="flex items-center mb-4">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="h-4 w-4 fill-primary text-primary"
											/>
										))}
									</div>
									<p className="text-muted-foreground mb-4">
										"{testimonial.quote}"
									</p>
									<div>
										<p className="font-semibold">{testimonial.name}</p>
										<p className="text-sm text-muted-foreground">
											{testimonial.role}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary/5">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h2 className="text-3xl font-bold mb-4">
								Ready to Transform Your Schedule Management?
							</h2>
							<p className="text-lg text-muted-foreground mb-8">
								Join thousands of businesses that have simplified their
								scheduling process
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Button
									asChild
									size="lg">
									<Link to="/pricing">Get Started</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg">
									<Link to="/contact">Contact Sales</Link>
								</Button>
							</div>
							<div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
								<CheckCircle className="h-4 w-4 text-primary" />
								<span>No credit card required</span>
								<span className="mx-2">•</span>
								<CheckCircle className="h-4 w-4 text-primary" />
								<span>14-day free trial</span>
								<span className="mx-2">•</span>
								<CheckCircle className="h-4 w-4 text-primary" />
								<span>Cancel anytime</span>
							</div>
						</div>
					</div>
				</section>
			</AppContent>
		</>
	);
}
