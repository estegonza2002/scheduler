import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
	CheckCircle2,
	Building2,
	LockKeyhole,
	FileText,
	Users,
	LineChart,
	Headphones,
	Globe,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RequestDemo } from "@/components/marketing";

export default function EnterprisePage() {
	return (
		<>
			<Helmet>
				<title>Enterprise Solutions | Scheduler</title>
			</Helmet>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-b from-background to-muted py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-5xl font-bold tracking-tight mb-6">
							Enterprise Scheduling Solutions
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Tailored scheduling and workforce management for large
							organizations with complex requirements
						</p>
						<RequestDemo>
							<Button size="lg">Request a Demo</Button>
						</RequestDemo>
					</div>
				</div>
			</section>

			{/* Enterprise Features */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">
							Built for Enterprise Scale
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Scheduler Enterprise provides the robust features, security, and
							support that large organizations need
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								icon: <Building2 className="h-6 w-6 text-primary" />,
								title: "Multi-Department Management",
								description:
									"Coordinate scheduling across departments, locations, and teams with role-based access controls.",
							},
							{
								icon: <LockKeyhole className="h-6 w-6 text-primary" />,
								title: "Advanced Security",
								description:
									"Enterprise-grade security with SSO, 2FA, and comprehensive audit logs.",
							},
							{
								icon: <FileText className="h-6 w-6 text-primary" />,
								title: "Compliance & Governance",
								description:
									"Built-in tools to ensure compliance with labor laws and corporate policies.",
							},
							{
								icon: <Users className="h-6 w-6 text-primary" />,
								title: "Unlimited Users",
								description:
									"Scale without limits across your organization with no per-user fees.",
							},
							{
								icon: <LineChart className="h-6 w-6 text-primary" />,
								title: "Advanced Analytics",
								description:
									"Comprehensive reporting and data insights to optimize workforce management.",
							},
							{
								icon: <Headphones className="h-6 w-6 text-primary" />,
								title: "Dedicated Support",
								description:
									"24/7 priority support and dedicated account management.",
							},
							{
								icon: <Globe className="h-6 w-6 text-primary" />,
								title: "API Integration",
								description:
									"Full API access for custom integrations with your enterprise systems.",
							},
							{
								icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
								title: "Custom Implementation",
								description:
									"Tailored setup and onboarding to meet your specific requirements.",
							},
						].map((feature, i) => (
							<div
								key={i}
								className="bg-card rounded-lg p-6 shadow-sm border">
								<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									{feature.icon}
								</div>
								<h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Security & Compliance */}
			<section className="py-20 bg-muted">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">Security & Compliance</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Enterprise-grade security features to protect your data and
							maintain compliance
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						<Tabs
							defaultValue="security"
							className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="security">Security</TabsTrigger>
								<TabsTrigger value="compliance">Compliance</TabsTrigger>
								<TabsTrigger value="privacy">Privacy</TabsTrigger>
							</TabsList>
							<TabsContent
								value="security"
								className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Enterprise Security Features</CardTitle>
										<CardDescription>
											Our robust security measures protect your sensitive data
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{[
												"Single Sign-On (SSO) with SAML 2.0 integration",
												"Two-factor authentication (2FA)",
												"Role-based access controls (RBAC)",
												"Data encryption at rest and in transit",
												"Regular security audits and penetration testing",
												"SOC 2 Type II certified infrastructure",
												"Comprehensive audit logs and monitoring",
											].map((item, i) => (
												<li
													key={i}
													className="flex items-start">
													<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent
								value="compliance"
								className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Compliance Standards</CardTitle>
										<CardDescription>
											We maintain compliance with major regulatory standards
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{[
												"GDPR compliant data processing",
												"HIPAA compliant for healthcare organizations",
												"CCPA (California Consumer Privacy Act) compliant",
												"ISO 27001 certified processes",
												"Automated labor law compliance tools",
												"Configurable compliance rule sets",
												"Detailed compliance reporting",
											].map((item, i) => (
												<li
													key={i}
													className="flex items-start">
													<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent
								value="privacy"
								className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Data Privacy Commitment</CardTitle>
										<CardDescription>
											Our approach to protecting your data and privacy
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{[
												"Transparent data processing policies",
												"Data residency options for global companies",
												"Regular data privacy impact assessments",
												"Data minimization and purpose limitation",
												"Right to access, correct, and delete data",
												"Data processing agreements (DPAs) available",
												"Privacy by design and default principles",
											].map((item, i) => (
												<li
													key={i}
													className="flex items-start">
													<CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl font-bold mb-4">
							Ready to Transform Your Enterprise Scheduling?
						</h2>
						<p className="text-lg text-muted-foreground mb-8">
							Connect with our enterprise team to discuss your specific needs
							and see how Scheduler can help your organization improve
							efficiency and reduce costs.
						</p>
						<RequestDemo>
							<Button size="lg">Schedule Your Demo</Button>
						</RequestDemo>
					</div>
				</div>
			</section>
		</>
	);
}
