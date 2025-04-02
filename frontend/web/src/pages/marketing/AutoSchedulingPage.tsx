import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
	Calendar,
	Zap,
	CheckCircle2,
	Clock,
	Brain,
	TrendingUp,
} from "lucide-react";

export default function AutoSchedulingPage() {
	return (
		<>
			<Helmet>
				<title>Auto Scheduling Software | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="md:w-1/3 flex justify-center">
								<div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
									<Zap className="h-12 w-12 text-primary" />
								</div>
							</div>
							<div className="md:w-2/3 text-center md:text-left">
								<h1 className="text-4xl font-bold tracking-tight mb-4">
									Auto Scheduling Software
								</h1>
								<p className="text-xl text-muted-foreground">
									Save hours managing your team with {COMPANY_NAME}'s automatic
									rota schedule maker.
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
							<h2 className="text-3xl font-bold mb-6">AI-Powered Scheduling</h2>
							<ul className="space-y-4">
								{[
									"One-click schedule generation based on your rules",
									"Automatic consideration of employee availability",
									"Smart distribution of shifts to prevent burnout",
									"Fair allocation of preferred and less-desirable shifts",
									"Automatic scheduling based on employee qualifications",
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
									Intelligent Rota Creation
								</h3>
								<p className="text-muted-foreground mb-4">
									Our AI analyzes your past schedules, employee preferences, and
									business needs to create optimal schedules that maximize
									coverage while minimizing costs.
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
								title: "Save Hours Each Week",
								description:
									"Create schedules in seconds rather than hours with our automated scheduler.",
							},
							{
								icon: <Brain className="h-10 w-10 text-primary" />,
								title: "Intelligent Optimization",
								description:
									"Balance staffing needs, labor costs, and employee preferences automatically.",
							},
							{
								icon: <TrendingUp className="h-10 w-10 text-primary" />,
								title: "Improve Satisfaction",
								description:
									"Fair and consistent scheduling leads to happier employees and lower turnover.",
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

			{/* How It Works */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">
						How Auto Scheduling Works
					</h2>
					<div className="max-w-4xl mx-auto space-y-10">
						{[
							{
								step: "1",
								title: "Set Your Rules",
								description:
									"Define your staffing requirements, shift patterns, and scheduling rules.",
							},
							{
								step: "2",
								title: "Input Constraints",
								description:
									"Add employee availability, time-off requests, and special requirements.",
							},
							{
								step: "3",
								title: "Generate Schedule",
								description:
									"Let our AI create an optimized schedule that meets all your criteria.",
							},
							{
								step: "4",
								title: "Review and Adjust",
								description:
									"Make any necessary manual adjustments before publishing the schedule.",
							},
						].map((step, i) => (
							<div
								key={i}
								className="flex items-start">
								<div className="mr-6 flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
										{step.step}
									</div>
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">{step.title}</h3>
									<p className="text-muted-foreground">{step.description}</p>
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
							Ready to automate your scheduling?
						</h2>
						<p className="text-muted-foreground mb-6">
							Join thousands of businesses that have saved time with automated
							scheduling.
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
