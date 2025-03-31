import { Helmet } from "react-helmet";
import { AppContent } from "../components/layout/AppLayout";
import { Button } from "../components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import {
	COMPANY_NAME,
	COMPANY_NAME_FULL,
	COMPANY_LEGAL_NAME,
} from "../constants";

export default function AboutPage() {
	return (
		<>
			<Helmet>
				<title>About Us | {COMPANY_NAME}</title>
			</Helmet>

			<AppContent>
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-background to-muted py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-5xl font-bold tracking-tight mb-6">
								About {COMPANY_NAME_FULL}
							</h1>
							<p className="text-xl text-muted-foreground mb-8">
								Transforming how businesses schedule and manage their teams
							</p>
						</div>
					</div>
				</section>

				{/* Our Story */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto">
							<h2 className="text-3xl font-bold mb-6">Our Story</h2>
							<p className="text-lg mb-6">
								{COMPANY_NAME_FULL} was founded in 2023 with a simple mission:
								to make workforce scheduling effortless for businesses of all
								sizes. Our founders experienced firsthand the challenges of
								managing employee schedules, tracking time off, and optimizing
								staffing levels.
							</p>
							<p className="text-lg mb-6">
								What began as a solution for a small local business has evolved
								into a comprehensive platform used by organizations across
								multiple industries. We're proud to have simplified scheduling
								for thousands of businesses and their employees.
							</p>
						</div>
					</div>
				</section>

				{/* Our Mission */}
				<section className="py-16 bg-muted/30">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto">
							<h2 className="text-3xl font-bold mb-6">Our Mission</h2>
							<p className="text-lg mb-6">
								We believe that effective scheduling is about more than just
								filling shifts—it's about creating harmony between business
								needs and employee work-life balance. Our mission is to provide
								intuitive tools that save time, reduce stress, and create better
								workplaces.
							</p>
							<div className="grid md:grid-cols-3 gap-8 mt-12">
								<div className="flex flex-col items-center text-center">
									<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
										<span className="text-2xl font-bold text-primary">1</span>
									</div>
									<h3 className="text-xl font-medium mb-2">Simplify</h3>
									<p className="text-muted-foreground">
										Making complex scheduling tasks straightforward and
										accessible
									</p>
								</div>
								<div className="flex flex-col items-center text-center">
									<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
										<span className="text-2xl font-bold text-primary">2</span>
									</div>
									<h3 className="text-xl font-medium mb-2">Optimize</h3>
									<p className="text-muted-foreground">
										Helping businesses make data-driven staffing decisions
									</p>
								</div>
								<div className="flex flex-col items-center text-center">
									<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
										<span className="text-2xl font-bold text-primary">3</span>
									</div>
									<h3 className="text-xl font-medium mb-2">Balance</h3>
									<p className="text-muted-foreground">
										Creating harmony between business needs and employee
										wellbeing
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Our Team */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto">
							<h2 className="text-3xl font-bold mb-6">Our Team</h2>
							<p className="text-lg mb-6">
								{COMPANY_NAME_FULL} is powered by a dedicated team of
								professionals passionate about creating innovative solutions for
								workforce management. Our diverse backgrounds in technology,
								business operations, and customer service allow us to understand
								the unique challenges our users face.
							</p>
							<p className="text-lg mb-12">
								We're committed to continuous improvement, regularly
								incorporating user feedback to enhance our platform and deliver
								the features that matter most to our customers.
							</p>
						</div>
					</div>
				</section>

				{/* Contact CTA */}
				<section className="py-16 bg-primary/5">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
							<p className="text-lg mb-8">
								Have questions about our company or want to learn more about how
								we can help your business?
							</p>
							<div className="flex justify-center gap-4 flex-wrap">
								<Button
									asChild
									size="lg">
									<Link to="/contact">Contact Us</Link>
								</Button>
								<Button
									variant="outline"
									asChild
									size="lg">
									<Link to="/enterprise">Enterprise Solutions</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</AppContent>
		</>
	);
}
