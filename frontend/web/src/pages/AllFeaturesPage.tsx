import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Link } from "react-router-dom";
import {
	Calendar,
	FileCheck,
	Zap,
	ListChecks,
	Clock,
	ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AllFeaturesPage() {
	const features = [
		{
			icon: <Calendar className="h-12 w-12 text-primary" />,
			title: "Shift Scheduling Software",
			description:
				"Create and share your schedule in minutes, keeping your team updated on any changes.",
			href: "/features/shift-scheduling",
		},
		{
			icon: <FileCheck className="h-12 w-12 text-primary" />,
			title: "Leave Management Software",
			description: "Manage time off and annual leave request all in one place.",
			href: "/features/leave-management",
		},
		{
			icon: <Zap className="h-12 w-12 text-primary" />,
			title: "Auto Scheduling Software",
			description:
				"Save hours managing your team with Blend's automatic rota schedule maker.",
			href: "/features/auto-scheduling",
		},
		{
			icon: <ListChecks className="h-12 w-12 text-primary" />,
			title: "Task Management Software",
			description:
				"Monitor, create and manage your teams one-off or recurring tasks all in one place.",
			href: "/features/task-management",
		},
		{
			icon: <Clock className="h-12 w-12 text-primary" />,
			title: "Clock-In/Out Software",
			description:
				"Easy time tracking for precise payroll and effective workforce management.",
			href: "/features/clock-in-out",
		},
	];

	const additionalFeatures = [
		"Reports & Analytics",
		"Team Communication",
		"Today's Dashboard",
		"Mobile Applications",
		"Employee Management",
		"Payroll Integration",
	];

	return (
		<>
			<Helmet>
				<title>All Features | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-5xl font-bold tracking-tight mb-6">
							Complete Feature Overview
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Discover all the ways {COMPANY_NAME} can help you streamline your
							workforce management.
						</p>
					</div>
				</div>
			</section>

			{/* Main Features */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-5xl mx-auto">
						<div className="space-y-12">
							{features.map((feature, i) => (
								<div
									key={i}
									className="flex flex-col md:flex-row border rounded-lg p-6 bg-card transition-all hover:shadow-md">
									<div className="md:w-1/6 flex justify-center mb-6 md:mb-0">
										<div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
											{feature.icon}
										</div>
									</div>
									<div className="md:w-5/6 md:pl-6">
										<h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
										<p className="text-muted-foreground mb-4">
											{feature.description}
										</p>
										<Button
											variant="outline"
											size="sm"
											asChild>
											<Link
												to={feature.href}
												className="inline-flex items-center">
												Learn more <ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Additional Features */}
			<section className="py-16 bg-muted">
				<div className="container mx-auto px-4">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-3xl font-bold mb-10 text-center">
							More Features
						</h2>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{additionalFeatures.map((feature, i) => (
								<div
									key={i}
									className="flex items-start p-4 bg-card rounded-lg border">
									<div className="mr-4 flex-shrink-0">
										<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
											<ArrowRight className="h-4 w-4 text-primary" />
										</div>
									</div>
									<div>
										<h3 className="text-lg font-semibold">{feature}</h3>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="bg-primary/5 border rounded-lg p-8 text-center max-w-3xl mx-auto">
						<h2 className="text-2xl font-bold mb-4">
							Ready to see these features in action?
						</h2>
						<p className="text-muted-foreground mb-6">
							Schedule a demo to see how {COMPANY_NAME} can transform your
							workforce management.
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
