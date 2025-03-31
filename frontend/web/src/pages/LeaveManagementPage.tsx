import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
	Calendar,
	FileCheck,
	CheckCircle2,
	ArrowRight,
	Clock,
	ThumbsUp,
} from "lucide-react";

export default function LeaveManagementPage() {
	return (
		<>
			<Helmet>
				<title>Leave Management Software | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="md:w-1/3 flex justify-center">
								<div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
									<FileCheck className="h-12 w-12 text-primary" />
								</div>
							</div>
							<div className="md:w-2/3 text-center md:text-left">
								<h1 className="text-4xl font-bold tracking-tight mb-4">
									Leave Management Software
								</h1>
								<p className="text-xl text-muted-foreground">
									Manage time off and annual leave requests all in one place.
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
								Streamlined Leave Management
							</h2>
							<ul className="space-y-4">
								{[
									"Centralized dashboard for all time-off requests",
									"Set customizable leave types (vacation, sick, personal)",
									"Automated leave balance calculations",
									"Simple request and approval workflows",
									"Calendar integration for team visibility",
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
								<Calendar className="h-24 w-24 text-muted-foreground/40" />
							</div>
							<div className="p-6">
								<h3 className="text-xl font-semibold mb-2">
									Leave Calendar View
								</h3>
								<p className="text-muted-foreground mb-4">
									Visualize team availability with our comprehensive leave
									calendar. Quickly spot potential staffing gaps and plan
									accordingly.
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
								icon: <Clock className="h-10 w-10 text-primary" />,
								title: "Save Administrative Time",
								description:
									"Eliminate paperwork and manual tracking with digital leave management.",
							},
							{
								icon: <ThumbsUp className="h-10 w-10 text-primary" />,
								title: "Improve Employee Satisfaction",
								description:
									"Transparent processes and quick responses to leave requests.",
							},
							{
								icon: <Calendar className="h-10 w-10 text-primary" />,
								title: "Prevent Scheduling Conflicts",
								description:
									"Automatic alerts for overlapping leave requests that might affect your operations.",
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

			{/* Features List */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-8 text-center">
						Comprehensive Leave Management
					</h2>
					<div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
						{[
							{
								title: "Leave Request Workflow",
								description:
									"Simple interface for employees to submit requests and managers to approve or deny.",
							},
							{
								title: "Leave Balance Tracking",
								description:
									"Automatic calculation of remaining leave days by type.",
							},
							{
								title: "Policy Enforcement",
								description:
									"Configure rules to automatically enforce your organization's leave policies.",
							},
							{
								title: "Documentation Storage",
								description:
									"Upload and store supporting documents for medical leave or other special requests.",
							},
						].map((feature, i) => (
							<div
								key={i}
								className="flex">
								<div className="mr-4 mt-1">
									<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
										<CheckCircle2 className="h-5 w-5 text-primary" />
									</div>
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-1">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">{feature.description}</p>
								</div>
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
							Ready to simplify leave management?
						</h2>
						<p className="text-muted-foreground mb-6">
							Join thousands of businesses that have streamlined their leave
							processes.
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
