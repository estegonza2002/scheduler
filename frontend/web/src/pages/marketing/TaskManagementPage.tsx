import { Helmet } from "react-helmet";
import { COMPANY_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
	ListChecks,
	CheckCircle2,
	Clock,
	Users,
	BarChart2,
} from "lucide-react";

export default function TaskManagementPage() {
	return (
		<>
			<Helmet>
				<title>Task Management Software | {COMPANY_NAME}</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="md:w-1/3 flex justify-center">
								<div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
									<ListChecks className="h-12 w-12 text-primary" />
								</div>
							</div>
							<div className="md:w-2/3 text-center md:text-left">
								<h1 className="text-4xl font-bold tracking-tight mb-4">
									Task Management Software
								</h1>
								<p className="text-xl text-muted-foreground">
									Monitor, create and manage your teams one-off or recurring
									tasks all in one place.
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
								Comprehensive Task Management
							</h2>
							<ul className="space-y-4">
								{[
									"Create, assign, and track tasks in a centralized system",
									"Set due dates, priorities, and dependencies",
									"Create recurring tasks for routine activities",
									"Attach files, notes, and comments to tasks",
									"Monitor task progress with real-time status updates",
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
								<ListChecks className="h-24 w-24 text-muted-foreground/40" />
							</div>
							<div className="p-6">
								<h3 className="text-xl font-semibold mb-2">
									Team Task Dashboard
								</h3>
								<p className="text-muted-foreground mb-4">
									Get a complete overview of all tasks across your team. Track
									progress, identify bottlenecks, and ensure nothing falls
									through the cracks.
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
								title: "Boost Productivity",
								description:
									"Clear task assignments and deadlines keep everyone focused and accountable.",
							},
							{
								icon: <Users className="h-10 w-10 text-primary" />,
								title: "Improve Collaboration",
								description:
									"Team members can share updates, comments, and resources on specific tasks.",
							},
							{
								icon: <BarChart2 className="h-10 w-10 text-primary" />,
								title: "Track Performance",
								description:
									"Analyze task completion rates and identify areas for workflow improvement.",
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

			{/* Task Workflow */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">
						Streamlined Task Workflow
					</h2>
					<div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
						{[
							{
								step: "Create",
								description: "Quickly create tasks with all necessary details",
							},
							{
								step: "Assign",
								description:
									"Assign tasks to team members with clear instructions",
							},
							{
								step: "Track",
								description: "Monitor progress with real-time status updates",
							},
							{
								step: "Complete",
								description: "Mark tasks as done and analyze performance",
							},
						].map((phase, i) => (
							<div
								key={i}
								className="text-center">
								<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold">{i + 1}</span>
								</div>
								<h3 className="text-lg font-semibold mb-2">{phase.step}</h3>
								<p className="text-muted-foreground text-sm">
									{phase.description}
								</p>
								{i < 3 && (
									<div className="hidden md:block h-0.5 w-full bg-border relative top-[-50px]">
										<div className="absolute right-0 top-[-4px] h-3 w-3 bg-primary rounded-full"></div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-16 bg-muted/50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-10 text-center">
						Powerful Task Features
					</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{[
							{
								title: "Task Templates",
								description: "Create reusable templates for common tasks",
							},
							{
								title: "Automated Reminders",
								description: "Schedule reminders for approaching deadlines",
							},
							{
								title: "Time Tracking",
								description:
									"Log time spent on tasks for productivity analysis",
							},
							{
								title: "Task Dependencies",
								description: "Link related tasks to streamline workflows",
							},
							{
								title: "Custom Fields",
								description:
									"Add custom fields to capture task-specific information",
							},
							{
								title: "Task Analytics",
								description:
									"Analyze task completion metrics and team performance",
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
							Ready to streamline your team's tasks?
						</h2>
						<p className="text-muted-foreground mb-6">
							Join thousands of businesses that have improved productivity with
							our task management system.
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
