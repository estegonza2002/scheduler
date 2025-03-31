import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
	CheckCircle2,
	Calendar,
	MessageSquare,
	Users,
	FileText,
	Bell,
	BarChart3,
	Globe,
	ShieldCheck,
	ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { COMPANY_NAME } from "@/constants";

export default function FeaturesPage() {
	return (
		<>
			<Helmet>
				<title>Features | {COMPANY_NAME}</title>
			</Helmet>

			<AppContent>
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-background to-muted py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-5xl font-bold tracking-tight mb-6">
								Powerful Features for Every Team
							</h1>
							<p className="text-xl text-muted-foreground mb-8">
								Discover how {COMPANY_NAME}'s comprehensive toolset can
								transform your scheduling process and boost team productivity.
							</p>
						</div>
					</div>
				</section>

				{/* Key Capabilities */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold mb-4">Key Capabilities</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Everything you need to create, manage, and optimize your team
								schedules
							</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[
								{
									icon: <Calendar className="h-6 w-6 text-primary" />,
									title: "Intuitive Scheduling",
									description:
										"Create and edit schedules with a drag-and-drop interface. Set recurring shifts and templates to save time.",
								},
								{
									icon: <Bell className="h-6 w-6 text-primary" />,
									title: "Automated Notifications",
									description:
										"Send shift reminders, updates, and important announcements automatically via email, SMS, or push notifications.",
								},
								{
									icon: <Users className="h-6 w-6 text-primary" />,
									title: "Team Management",
									description:
										"Manage employee profiles, availability, time-off requests, and positions all in one place.",
								},
								{
									icon: <MessageSquare className="h-6 w-6 text-primary" />,
									title: "Team Communication",
									description:
										"Built-in messaging keeps everyone connected. Share updates and resolve scheduling issues quickly.",
								},
								{
									icon: <BarChart3 className="h-6 w-6 text-primary" />,
									title: "Analytics & Reporting",
									description:
										"Track labor costs, attendance, schedule adherence, and more with detailed reports.",
								},
								{
									icon: <FileText className="h-6 w-6 text-primary" />,
									title: "Labor Compliance",
									description:
										"Stay compliant with labor laws including overtime, breaks, and scheduling regulations.",
								},
								{
									icon: <Globe className="h-6 w-6 text-primary" />,
									title: "Multiple Locations",
									description:
										"Manage schedules across multiple locations or departments with position-based permissions.",
								},
								{
									icon: <ShieldCheck className="h-6 w-6 text-primary" />,
									title: "Enterprise Security",
									description:
										"Advanced security features including SSO, 2FA, and granular access controls for enterprise customers.",
								},
							].map((feature, i) => (
								<div
									key={i}
									className="bg-card rounded-lg p-6 shadow-sm border">
									<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
										{feature.icon}
									</div>
									<h3 className="text-xl font-semibold mb-2">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Industry-Specific Use Cases */}
				<section className="py-20 bg-muted">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold mb-4">
								Solutions for Every Industry
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								See how {COMPANY_NAME} adapts to the unique needs of your
								business
							</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[
								{
									industry: "Restaurants & Hospitality",
									benefits: [
										"Manage front and back-of-house staff",
										"Forecast labor needs based on sales data",
										"Handle shift swaps and last-minute changes",
										"Track labor costs against revenue",
									],
								},
								{
									industry: "Retail",
									benefits: [
										"Schedule based on foot traffic patterns",
										"Manage seasonal staffing fluctuations",
										"Coordinate across multiple store locations",
										"Balance part-time and full-time employees",
									],
								},
								{
									industry: "Healthcare",
									benefits: [
										"Ensure proper coverage for patient care",
										"Manage complex shift rotations",
										"Track certifications and qualifications",
										"Comply with healthcare staffing regulations",
									],
								},
								{
									industry: "Service Businesses",
									benefits: [
										"Coordinate field service technicians",
										"Schedule client appointments efficiently",
										"Manage service area coverage",
										"Track travel time between locations",
									],
								},
								{
									industry: "Education",
									benefits: [
										"Create teaching and administration schedules",
										"Manage substitute coverage",
										"Coordinate across departments",
										"Plan for academic calendar events",
									],
								},
								{
									industry: "Fitness & Recreation",
									benefits: [
										"Schedule instructors and trainers",
										"Manage class and facility schedules",
										"Coordinate across multiple class types",
										"Adjust staffing based on class attendance",
									],
								},
							].map((useCase, i) => (
								<div
									key={i}
									className="bg-card rounded-lg p-6 shadow-sm border">
									<h3 className="text-xl font-semibold mb-4">
										{useCase.industry}
									</h3>
									<ul className="space-y-2">
										{useCase.benefits.map((benefit, j) => (
											<li
												key={j}
												className="flex">
												<CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
												<span className="text-muted-foreground">{benefit}</span>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Competitive Comparison */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold mb-4">How We Compare</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								See why {COMPANY_NAME} is the preferred choice for growing
								businesses
							</p>
						</div>

						<div className="overflow-auto">
							<Table className="min-w-full border">
								<TableHeader>
									<TableRow>
										<TableHead className="w-1/4">Feature</TableHead>
										<TableHead className="text-center bg-primary/5 w-1/4">
											{COMPANY_NAME}
										</TableHead>
										<TableHead className="text-center w-1/4">
											Competitor A
										</TableHead>
										<TableHead className="text-center w-1/4">
											Competitor B
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[
										{
											feature: "Unlimited Locations",
											scheduler: true,
											competitorA: false,
											competitorB: true,
										},
										{
											feature: "Mobile Apps",
											scheduler: true,
											competitorA: true,
											competitorB: true,
										},
										{
											feature: "Real-time Notifications",
											scheduler: true,
											competitorA: true,
											competitorB: false,
										},
										{
											feature: "Labor Cost Forecasting",
											scheduler: true,
											competitorA: false,
											competitorB: false,
										},
										{
											feature: "Shift Swapping",
											scheduler: true,
											competitorA: true,
											competitorB: true,
										},
										{
											feature: "Team Messaging",
											scheduler: true,
											competitorA: false,
											competitorB: true,
										},
										{
											feature: "API Access",
											scheduler: true,
											competitorA: false,
											competitorB: false,
										},
										{
											feature: "24/7 Support",
											scheduler: true,
											competitorA: false,
											competitorB: false,
										},
									].map((row, i) => (
										<TableRow key={i}>
											<TableCell className="font-medium">
												{row.feature}
											</TableCell>
											<TableCell className="text-center bg-primary/5">
												{row.scheduler ? (
													<CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
												) : (
													<span>—</span>
												)}
											</TableCell>
											<TableCell className="text-center">
												{row.competitorA ? (
													<CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
												) : (
													<span>—</span>
												)}
											</TableCell>
											<TableCell className="text-center">
												{row.competitorB ? (
													<CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
												) : (
													<span>—</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary/5">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h2 className="text-3xl font-bold mb-4">
								Ready to Experience {COMPANY_NAME}?
							</h2>
							<p className="text-lg text-muted-foreground mb-8">
								Start your free 14-day trial today. No credit card required.
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Button
									asChild
									size="lg">
									<Link to="/signup">Start Free Trial</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg">
									<Link to="/pricing">View Pricing</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</AppContent>
		</>
	);
}
