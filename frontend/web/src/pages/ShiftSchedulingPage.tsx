import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, CheckCircle2, ArrowRight } from "lucide-react";

export default function ShiftSchedulingPage() {
	return (
		<>
			<Helmet>
				<title>Shift Scheduling Software | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="md:w-1/3 flex justify-center">
								<div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
									<Calendar className="h-12 w-12 text-primary" />
								</div>
							</div>
							<div className="md:w-2/3 text-center md:text-left">
								<h1 className="text-4xl font-bold tracking-tight mb-4">
									Shift Scheduling Software
								</h1>
								<p className="text-xl text-muted-foreground">
									Create and share your schedule in minutes, keeping your team
									updated on any changes.
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
								Effortless Schedule Creation
							</h2>
							<ul className="space-y-4">
								{[
									"Drag-and-drop interface for quick scheduling",
									"Create recurring shifts with a few clicks",
									"Copy schedules from previous periods",
									"Set shift templates for faster planning",
									"Automatically assign qualified employees",
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
									Visual Scheduling Calendar
								</h3>
								<p className="text-muted-foreground mb-4">
									See your entire schedule at a glance with our intuitive
									calendar view. Color-coded shifts make it easy to identify
									different positions and employees.
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
								title: "Save Time",
								description:
									"Create schedules in minutes, not hours. Automate recurring shifts and use templates.",
							},
							{
								icon: <Users className="h-10 w-10 text-primary" />,
								title: "Improve Team Communication",
								description:
									"Instantly notify staff of new schedules and changes via email, SMS, or push notifications.",
							},
							{
								icon: <Calendar className="h-10 w-10 text-primary" />,
								title: "Prevent Scheduling Conflicts",
								description:
									"System alerts for overlapping shifts, time-off requests, and availability conflicts.",
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

			{/* CTA Section */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="bg-primary/5 border rounded-lg p-8 text-center max-w-3xl mx-auto">
						<h2 className="text-2xl font-bold mb-4">
							Ready to simplify your scheduling?
						</h2>
						<p className="text-muted-foreground mb-6">
							Join thousands of businesses that have improved their scheduling
							process.
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
