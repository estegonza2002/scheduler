import { Helmet } from "react-helmet";
import { AppContent } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import {
	Code,
	Database,
	Key,
	FileCode,
	Shield,
	GitBranch,
	BookOpen,
	CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { COMPANY_NAME, COMPANY_NAME_FULL } from "../../constants";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../components/ui/tabs";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

const apiFormSchema = z.object({
	name: z.string().min(2, { message: "Name is required" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	company: z.string().min(2, { message: "Company name is required" }),
	website: z.string().url({ message: "Please enter a valid URL" }),
	useCase: z.string().min(10, {
		message: "Please describe your use case (at least 10 characters)",
	}),
	agreeTerms: z.boolean().refine((val) => val === true, {
		message: "You must agree to the terms and conditions",
	}),
});

type ApiFormValues = z.infer<typeof apiFormSchema>;

export default function DevelopersPage() {
	const [formSubmitted, setFormSubmitted] = useState(false);

	const form = useForm<ApiFormValues>({
		resolver: zodResolver(apiFormSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			website: "",
			useCase: "",
			agreeTerms: false,
		} as ApiFormValues,
	});

	function onSubmit(values: z.infer<typeof apiFormSchema>) {
		console.log(values);
		// Here you would handle the API access request
		setFormSubmitted(true);
	}

	return (
		<>
			<Helmet>
				<title>Developers | {COMPANY_NAME}</title>
			</Helmet>

			<AppContent>
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-background to-muted py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-5xl font-bold tracking-tight mb-6">
								Developers
							</h1>
							<p className="text-xl text-muted-foreground mb-8">
								Build powerful applications with our Scheduling API
							</p>
							<div className="flex justify-center gap-4">
								<Button asChild>
									<a href="#request-access">Request API Access</a>
								</Button>
								<Button variant="outline">
									<Code className="mr-2 h-4 w-4" /> View Documentation
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* API Features */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center mb-12">
							<h2 className="text-3xl font-bold mb-4">API Features</h2>
							<p className="text-lg text-muted-foreground">
								Our comprehensive API provides everything you need to integrate
								scheduling functionality
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6">
							<Card>
								<CardHeader>
									<Database className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>Data Access</CardTitle>
									<CardDescription>
										Access and manage your schedules, employees, and shifts
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>RESTful endpoints</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>JSON responses</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>Filtering & sorting</span>
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<FileCode className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>SDKs & Libraries</CardTitle>
									<CardDescription>
										Tools to speed up your integration process
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>JavaScript/TypeScript</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>Python libraries</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>Prebuilt Components</span>
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<Shield className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>Security</CardTitle>
									<CardDescription>
										Enterprise-grade security for your data
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>OAuth 2.0 authentication</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>SSL encryption</span>
										</li>
										<li className="flex items-center">
											<CheckCircle className="h-4 w-4 mr-2 text-green-500" />
											<span>Rate limiting</span>
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Code Examples */}
				<section className="py-16 bg-muted/30">
					<div className="container mx-auto px-4">
						<div className="max-w-4xl mx-auto">
							<h2 className="text-3xl font-bold mb-8 text-center">
								Quick Start Examples
							</h2>

							<Tabs
								defaultValue="javascript"
								className="w-full">
								<TabsList className="grid w-full grid-cols-3 mb-8">
									<TabsTrigger value="javascript">JavaScript</TabsTrigger>
									<TabsTrigger value="python">Python</TabsTrigger>
									<TabsTrigger value="curl">cURL</TabsTrigger>
								</TabsList>

								<TabsContent
									value="javascript"
									className="mt-0">
									<Card>
										<CardHeader>
											<CardTitle>JavaScript Example</CardTitle>
											<CardDescription>
												Get all shifts for a specific date range
											</CardDescription>
										</CardHeader>
										<CardContent>
											<pre className="p-4 bg-secondary/30 rounded-md overflow-x-auto">
												<code className="text-sm">
													{`import { SchedulerClient } from '@scheduler/api';

// Initialize the client with your API key
const client = new SchedulerClient({
  apiKey: 'your_api_key'
});

// Get shifts for a date range
async function getShifts() {
  try {
    const shifts = await client.shifts.list({
      startDate: '2023-06-01',
      endDate: '2023-06-07',
      locationId: 'loc_123456'
    });
    
    console.log(\`Found \${shifts.length} shifts\`);
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
  }
}`}
												</code>
											</pre>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent
									value="python"
									className="mt-0">
									<Card>
										<CardHeader>
											<CardTitle>Python Example</CardTitle>
											<CardDescription>
												Get all shifts for a specific date range
											</CardDescription>
										</CardHeader>
										<CardContent>
											<pre className="p-4 bg-secondary/30 rounded-md overflow-x-auto">
												<code className="text-sm">
													{`from scheduler_api import SchedulerClient

# Initialize the client with your API key
client = SchedulerClient(api_key='your_api_key')

# Get shifts for a date range
def get_shifts():
    try:
        shifts = client.shifts.list(
            start_date='2023-06-01',
            end_date='2023-06-07',
            location_id='loc_123456'
        )
        
        print(f"Found {len(shifts)} shifts")
        return shifts
    except Exception as e:
        print(f"Error fetching shifts: {e}")
        
# Call the function
shifts = get_shifts()`}
												</code>
											</pre>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent
									value="curl"
									className="mt-0">
									<Card>
										<CardHeader>
											<CardTitle>cURL Example</CardTitle>
											<CardDescription>
												Get all shifts for a specific date range
											</CardDescription>
										</CardHeader>
										<CardContent>
											<pre className="p-4 bg-secondary/30 rounded-md overflow-x-auto">
												<code className="text-sm">
													{`curl -X GET "https://api.scheduler.com/v1/shifts" \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "start_date": "2023-06-01",
    "end_date": "2023-06-07",
    "location_id": "loc_123456"
  }'`}
												</code>
											</pre>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</section>

				{/* Use Cases */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center mb-12">
							<h2 className="text-3xl font-bold mb-4">Common Use Cases</h2>
							<p className="text-lg text-muted-foreground">
								Discover how other developers are using our API
							</p>
						</div>

						<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
							<Card>
								<CardHeader>
									<CardTitle>Custom Dashboards</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Build custom dashboards showing real-time scheduling data
										alongside your other business metrics.
									</p>
									<p className="text-sm">
										Using our API, you can pull shift coverage, attendance
										rates, and staffing metrics to create comprehensive
										operational views.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Mobile Apps</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Integrate scheduling into your custom employee or business
										management apps.
									</p>
									<p className="text-sm">
										Allow employees to view shifts, request time off, or swap
										shifts directly within your branded application.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Workflow Automation</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Connect scheduling data with other business systems for
										seamless operations.
									</p>
									<p className="text-sm">
										Automatically update payroll systems, trigger notifications,
										or adjust staffing based on sales forecasts.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Business Intelligence</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Incorporate scheduling data into your analytics and
										reporting tools.
									</p>
									<p className="text-sm">
										Generate insights on labor costs, scheduling efficiency, and
										staffing optimization.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Request API Access Form */}
				<section
					id="request-access"
					className="py-16 bg-primary/5">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto">
							<h2 className="text-3xl font-bold mb-8 text-center">
								Request API Access
							</h2>

							{formSubmitted ? (
								<Card className="text-center p-8">
									<div className="flex flex-col items-center justify-center">
										<CheckCircle className="h-16 w-16 text-primary mb-4" />
										<h3 className="text-2xl font-bold mb-2">Thank You!</h3>
										<p className="text-muted-foreground mb-6">
											Your API access request has been submitted. Our team will
											review your application and get back to you within 2
											business days.
										</p>
										<Button asChild>
											<Link to="/">Return to Home</Link>
										</Button>
									</div>
								</Card>
							) : (
								<Card>
									<CardHeader>
										<CardTitle>API Access Application</CardTitle>
										<CardDescription>
											Tell us about your project and how you plan to use our API
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Form {...form}>
											<form
												onSubmit={form.handleSubmit(onSubmit)}
												className="space-y-6">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<FormField
														control={form.control}
														name="name"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Full Name</FormLabel>
																<FormControl>
																	<Input
																		placeholder="John Smith"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="email"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Email</FormLabel>
																<FormControl>
																	<Input
																		placeholder="john@example.com"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													<FormField
														control={form.control}
														name="company"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Company Name</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Acme Inc."
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="website"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Website</FormLabel>
																<FormControl>
																	<Input
																		placeholder="https://example.com"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name="useCase"
													render={({ field }) => (
														<FormItem>
															<FormLabel>How will you use our API?</FormLabel>
															<FormControl>
																<Textarea
																	placeholder="Please describe your use case and integration plans..."
																	className="min-h-32"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="agreeTerms"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={field.onChange}
																/>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel>
																	I agree to the{" "}
																	<Link
																		to="/terms"
																		className="text-primary">
																		Terms of Service
																	</Link>{" "}
																	and{" "}
																	<Link
																		to="/privacy"
																		className="text-primary">
																		Privacy Policy
																	</Link>
																</FormLabel>
																<FormDescription>
																	You must agree to our terms to use the API.
																</FormDescription>
															</div>
															<FormMessage />
														</FormItem>
													)}
												/>

												<Button
													type="submit"
													className="w-full">
													Submit Request
												</Button>
											</form>
										</Form>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</section>

				{/* Resources */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center mb-12">
							<h2 className="text-3xl font-bold mb-4">Developer Resources</h2>
							<p className="text-lg text-muted-foreground">
								Everything you need to get started with our API
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
							<Card>
								<CardHeader>
									<BookOpen className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>API Documentation</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Comprehensive guides and reference material.
									</p>
									<Button
										variant="outline"
										className="w-full">
										Read Docs
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<Code className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>Code Samples</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Ready-to-use examples in multiple languages.
									</p>
									<Button
										variant="outline"
										className="w-full">
										View Samples
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<GitBranch className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>GitHub</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Libraries, SDKs, and sample applications.
									</p>
									<Button
										variant="outline"
										className="w-full">
										<a
											href="https://github.com"
											target="_blank"
											rel="noopener noreferrer"
											className="w-full">
											GitHub Repos
										</a>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>
			</AppContent>
		</>
	);
}
