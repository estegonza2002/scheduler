import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
	Clock,
	CheckCircle2,
	BarChart2,
	DollarSign,
	Shield,
} from "lucide-react";

export default function ClockInOutPage() {
	return (
		<>
			<Helmet>
				<title>Clock-In/Out Software | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="md:w-1/3 flex justify-center">
								<div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
									<Clock className="h-12 w-12 text-primary" />
								</div>
							</div>
							<div className="md:w-2/3 text-center md:text-left">
								<h1 className="text-4xl font-bold tracking-tight mb-4">
									Clock-In/Out Software
								</h1>
								<p className="text-xl text-muted-foreground">
									Easy time tracking for precise payroll and effective workforce
									management.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Features */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-2 gap-12">
						<div>
							<h2 className="text-3xl font-bold mb-6">
								Accurate Time Tracking
							</h2>
							<ul className="space-y-4">
								{[
									"Simple clock in/out with mobile or web applications",
									"GPS location verification to prevent time theft",
									"Automatic break time calculation",
									"Overtime tracking and alerts",
									"Daily and weekly hour summaries for employees",
								].map((feature, i) => (
									<li
										key={i}
										className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="rounded-lg overflow-hidden border bg-card shadow-sm">
							<div className="aspect-video bg-muted flex items-center justify-center">
								<Clock className="h-24 w-24 text-muted-foreground/40" />
							</div>
							<div className="p-6">
								<h3 className="text-xl font-semibold mb-2">
									Real-Time Attendance Dashboard
								</h3>
								<p className="text-muted-foreground mb-4">
									Get an instant view of who's currently working, who's on
									break, and who's running late. Monitor attendance patterns
									across your entire workforce.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-16 bg-muted">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">Key Benefits</h2>
					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: <DollarSign className="h-10 w-10 text-primary" />,
								title: "Accurate Payroll",
								description:
									"Eliminate manual time-tracking errors and ensure accurate pay for your employees.",
							},
							{
								icon: <BarChart2 className="h-10 w-10 text-primary" />,
								title: "Improved Productivity",
								description:
									"Analyze working patterns and identify opportunities to optimize scheduling.",
							},
							{
								icon: <Shield className="h-10 w-10 text-primary" />,
								title: "Compliance Confidence",
								description:
									"Stay compliant with labor laws by maintaining accurate time records.",
							},
						].map((benefit, i) => (
							<div
								key={i}
								className="bg-card p-6 rounded-lg border shadow-sm">
								<div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
									{benefit.icon}
								</div>
								<h3 className="text-xl font-semibold mb-2 text-center">
									{benefit.title}
								</h3>
								<p className="text-muted-foreground text-center">
									{benefit.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Manager vs Employee Views */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">
						Tailored For Everyone
					</h2>

					<div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
						{/* Manager View */}
						<div className="border rounded-lg p-6 bg-card">
							<h3 className="text-2xl font-bold mb-4">Manager View</h3>
							<ul className="space-y-3">
								{[
									"Real-time attendance monitoring",
									"Customizable reporting dashboard",
									"Overtime and absence alerts",
									"Timesheet approval workflow",
									"Labor cost tracking and forecasting",
									"Schedule vs. actual hours comparison",
								].map((feature, i) => (
									<li
										key={i}
										className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Employee View */}
						<div className="border rounded-lg p-6 bg-card">
							<h3 className="text-2xl font-bold mb-4">Employee View</h3>
							<ul className="space-y-3">
								{[
									"Simple one-tap clock in/out",
									"Current shift status indicator",
									"Break time tracking",
									"Weekly hour totals",
									"View upcoming scheduled shifts",
									"Past timesheet review",
								].map((feature, i) => (
									<li
										key={i}
										className="flex items-start">
										<CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Integration Features */}
			<section className="py-16 bg-muted/50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">
						Seamless Integration
					</h2>
					<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{[
							{
								title: "Payroll Integration",
								description:
									"Automatically send verified time data to popular payroll systems",
							},
							{
								title: "Schedule Sync",
								description:
									"Compare actual hours worked against scheduled shifts",
							},
							{
								title: "POS Systems",
								description:
									"Connect with your Point of Sale system for labor cost analysis",
							},
							{
								title: "HR Software",
								description:
									"Integrate with your existing HR management platform",
							},
							{
								title: "Mobile App",
								description:
									"Allow employees to clock in/out from their smartphones",
							},
							{
								title: "Biometric Options",
								description:
									"Support for fingerprint or face recognition time tracking",
							},
						].map((feature, i) => (
							<div
								key={i}
								className="bg-card p-5 rounded-lg border">
								<h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
								<p className="text-muted-foreground text-sm">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="bg-primary/5 border rounded-lg p-8 text-center max-w-3xl mx-auto">
						<h2 className="text-2xl font-bold mb-4">
							Ready for accurate time tracking?
						</h2>
						<p className="text-muted-foreground mb-6">
							Join thousands of businesses that have streamlined their time
							tracking and payroll processes.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								asChild
								size="lg">
								<Link to="/pricing">Get Started</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								asChild>
								<Link to="/contact">Request Demo</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
