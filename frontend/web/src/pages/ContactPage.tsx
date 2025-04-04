import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, FileText, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/lib/organization-context";
import { useEffect, useState } from "react";

const contactFormSchema = z.object({
	name: z.string().min(2, {
		message: "Name is required",
	}),
	email: z.string().email({
		message: "Please enter a valid email address",
	}),
	company: z.string().optional(),
	phone: z.string().optional(),
	topic: z
		.string({
			required_error: "Please select a topic",
		})
		.min(1, {
			message: "Please select a topic",
		}),
	message: z.string().min(10, {
		message: "Message must be at least 10 characters",
	}),
});

export default function ContactPage() {
	const { user } = useAuth();
	const { currentOrganization } = useOrganization();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formInitialized, setFormInitialized] = useState(false);

	// Added state for user information display
	const [userDisplayInfo, setUserDisplayInfo] = useState({
		name: "",
		email: "",
		company: "",
		phone: "",
	});

	const form = useForm<z.infer<typeof contactFormSchema>>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			phone: "",
			topic: "",
			message: "",
		},
		// Only validate on touch and submit, not on initial render
		mode: "onTouched",
	});

	// Watch form values to reactively update UI
	const watchedName = form.watch("name");
	const watchedEmail = form.watch("email");
	const watchedCompany = form.watch("company");
	const watchedPhone = form.watch("phone");

	// Prefill form with user data if logged in
	useEffect(() => {
		console.log("Auth user data:", user);
		console.log("Organization data:", currentOrganization);

		if (user && !formInitialized) {
			const firstName = user.user_metadata?.firstName || "";
			const lastName = user.user_metadata?.lastName || "";
			const fullName =
				`${firstName} ${lastName}`.trim() ||
				user.user_metadata?.full_name ||
				"";

			const companyName =
				currentOrganization?.name ||
				user.user_metadata?.company ||
				user.user_metadata?.organization_name ||
				"";

			const phoneNumber = user.user_metadata?.phone || "";

			console.log("Setting form values:", {
				name: fullName,
				email: user.email,
				company: companyName,
				phone: phoneNumber,
			});

			// Update display info state
			setUserDisplayInfo({
				name: fullName,
				email: user.email || "",
				company: companyName,
				phone: phoneNumber,
			});

			// Set form values without triggering validation
			form.setValue("name", fullName, { shouldValidate: false });
			if (user.email)
				form.setValue("email", user.email, { shouldValidate: false });
			if (phoneNumber)
				form.setValue("phone", phoneNumber, { shouldValidate: false });
			if (companyName)
				form.setValue("company", companyName, { shouldValidate: false });

			setFormInitialized(true);

			// Log form values after setting
			console.log("Form values after setting:", {
				name: form.getValues("name"),
				email: form.getValues("email"),
				company: form.getValues("company"),
				phone: form.getValues("phone"),
			});
		}
	}, [user, currentOrganization, form, formInitialized]);

	// Secondary effect to ensure values are set if they're missing
	useEffect(() => {
		// If we have a user but the form name is empty, try to set it again
		if (user && formInitialized && !watchedName) {
			console.log("Form values missing, reapplying user data");

			const firstName = user.user_metadata?.firstName || "";
			const lastName = user.user_metadata?.lastName || "";
			const fullName =
				`${firstName} ${lastName}`.trim() ||
				user.user_metadata?.full_name ||
				"";

			// Use reset to set all values at once without validation
			form.reset(
				{
					name: fullName,
					email: user.email || "",
					company:
						currentOrganization?.name ||
						user.user_metadata?.company ||
						user.user_metadata?.organization_name ||
						"",
					phone: user.user_metadata?.phone || "",
					topic: form.getValues("topic"),
					message: form.getValues("message"),
				},
				{
					keepValues: false,
					keepDirty: false,
					keepIsSubmitted: false,
					keepTouched: false,
				}
			);
		}
	}, [user, watchedName, formInitialized, form, currentOrganization]);

	function onSubmit(values: z.infer<typeof contactFormSchema>) {
		setIsSubmitting(true);

		console.log(values);
		// Here you would handle the form submission
		setTimeout(() => {
			alert("Thank you for your message! We'll get back to you soon.");
			form.reset();
			setIsSubmitting(false);
		}, 1000);
	}

	return (
		<>
			<Helmet>
				<title>Contact & Support | Scheduler</title>
			</Helmet>

			<AppContent>
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-background to-muted py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-5xl font-bold tracking-tight mb-6">
								Contact & Support
							</h1>
							<p className="text-xl text-muted-foreground mb-8">
								Get in touch with our team for support, questions, or feedback
							</p>
						</div>
					</div>
				</section>

				{/* Contact Methods Tabs */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="max-w-4xl mx-auto">
							<Tabs
								defaultValue="contact"
								className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="contact">Contact Us</TabsTrigger>
									<TabsTrigger value="support">Support</TabsTrigger>
									<TabsTrigger value="help">Help Center</TabsTrigger>
								</TabsList>
								<TabsContent
									value="contact"
									className="mt-6">
									<div className="grid md:grid-cols-3 gap-8">
										{/* Contact Info */}
										<div className="md:col-span-1 space-y-6">
											<Card>
												<CardHeader>
													<CardTitle>Contact Information</CardTitle>
													<CardDescription>
														Reach out to us through these channels
													</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4">
													<div className="flex items-start">
														<Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
														<div>
															<h3 className="font-medium">Email</h3>
															<p className="text-sm text-muted-foreground">
																contact@schedulerapp.com
															</p>
														</div>
													</div>
													<div className="flex items-start">
														<Phone className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
														<div>
															<h3 className="font-medium">Phone</h3>
															<p className="text-sm text-muted-foreground">
																(555) 123-4567
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>

										{/* Contact Form */}
										<Card className="md:col-span-2">
											<CardHeader>
												<CardTitle>Send Us a Message</CardTitle>
												<CardDescription>
													Fill out the form below and we'll get back to you as
													soon as possible
												</CardDescription>
											</CardHeader>
											<CardContent>
												<Form {...form}>
													<form
														onSubmit={form.handleSubmit(onSubmit, (errors) => {
															console.log("Validation errors:", errors);
															// Check specifically for topic error
															if (errors.topic) {
																const topicElement =
																	document.querySelector('[name="topic"]');
																if (topicElement) {
																	topicElement.scrollIntoView({
																		behavior: "smooth",
																		block: "center",
																	});
																}
															}
															// Focus on the first field with an error
															else if (Object.keys(errors).length > 0) {
																const firstErrorField = Object.keys(errors)[0];
																const element = document.querySelector(
																	`[name="${firstErrorField}"]`
																);
																if (element) {
																	element.scrollIntoView({
																		behavior: "smooth",
																		block: "center",
																	});
																}
															}
														})}
														className="space-y-6">
														{/* Show user info summary if logged in */}
														{user && (
															<>
																<div className="bg-muted/30 rounded-lg p-4 mb-2">
																	<div className="grid gap-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-muted-foreground">
																				Name:
																			</span>
																			<span className="font-medium">
																				{userDisplayInfo.name ||
																					"Not available"}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-muted-foreground">
																				Email:
																			</span>
																			<span className="font-medium">
																				{userDisplayInfo.email ||
																					"Not available"}
																			</span>
																		</div>
																		{userDisplayInfo.company && (
																			<div className="flex justify-between">
																				<span className="text-muted-foreground">
																					Company:
																				</span>
																				<span className="font-medium">
																					{userDisplayInfo.company}
																				</span>
																			</div>
																		)}
																		{userDisplayInfo.phone && (
																			<div className="flex justify-between">
																				<span className="text-muted-foreground">
																					Phone:
																				</span>
																				<span className="font-medium">
																					{userDisplayInfo.phone}
																				</span>
																			</div>
																		)}
																	</div>
																</div>
															</>
														)}

														{!user ? (
															<>
																<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																	<FormField
																		control={form.control}
																		name="name"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>Full Name</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="Your name"
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
																						type="email"
																						placeholder="Your email"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																</div>

																<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																	<FormField
																		control={form.control}
																		name="company"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>
																					Company (Optional)
																				</FormLabel>
																				<FormControl>
																					<Input
																						placeholder="Your company name"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="phone"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>Phone (Optional)</FormLabel>
																				<FormControl>
																					<Input
																						type="tel"
																						placeholder="Your phone number"
																						{...field}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																</div>
															</>
														) : (
															<>
																<input
																	type="hidden"
																	{...form.register("name")}
																	value={userDisplayInfo.name}
																/>
																<input
																	type="hidden"
																	{...form.register("email")}
																	value={userDisplayInfo.email}
																/>
																<input
																	type="hidden"
																	{...form.register("company")}
																	value={userDisplayInfo.company || ""}
																/>
																<input
																	type="hidden"
																	{...form.register("phone")}
																	value={userDisplayInfo.phone || ""}
																/>
															</>
														)}

														<FormField
															control={form.control}
															name="topic"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Topic</FormLabel>
																	<Select
																		onValueChange={field.onChange}
																		value={field.value}>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Select a topic" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			<SelectItem value="general">
																				General Inquiry
																			</SelectItem>
																			<SelectItem value="sales">
																				Sales Question
																			</SelectItem>
																			<SelectItem value="support">
																				Technical Support
																			</SelectItem>
																			<SelectItem value="billing">
																				Billing Issue
																			</SelectItem>
																			<SelectItem value="feedback">
																				Product Feedback
																			</SelectItem>
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="message"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Message</FormLabel>
																	<FormControl>
																		<Textarea
																			placeholder="How can we help you?"
																			className="resize-none min-h-[120px]"
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<Button
															type="submit"
															className="w-full"
															disabled={isSubmitting}>
															{isSubmitting ? "Sending..." : "Send Message"}
														</Button>
													</form>
												</Form>
											</CardContent>
										</Card>
									</div>
								</TabsContent>

								<TabsContent
									value="support"
									className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Support Options</CardTitle>
											<CardDescription>
												Choose the support option that works best for you
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid md:grid-cols-2 gap-8">
												{[
													{
														title: "Knowledge Base",
														icon: <FileText className="h-8 w-8 text-primary" />,
														description:
															"Browse our extensive documentation and tutorials to find answers to common questions.",
														link: "/help-center",
														linkText: "Browse Articles",
													},
													{
														title: "Email Support",
														icon: <Mail className="h-8 w-8 text-primary" />,
														description:
															"Send us an email and our team will get back to you within 24 hours on business days.",
														link: "mailto:support@schedulerapp.com",
														linkText: "Email Support",
													},
													{
														title: "Phone Support",
														icon: <Phone className="h-8 w-8 text-primary" />,
														description:
															"Premium and Enterprise customers can access phone support for urgent issues.",
														link: "tel:+15551234567",
														linkText: "Call Support",
														premium: true,
													},
												].map((option, i) => (
													<div
														key={i}
														className="bg-card rounded-lg p-6 shadow-sm border flex flex-col">
														<div className="mb-4 flex justify-center">
															<div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
																{option.icon}
															</div>
														</div>
														<h3 className="text-xl font-semibold text-center mb-2">
															{option.title}
														</h3>
														<p className="text-muted-foreground mb-4 text-center">
															{option.description}
														</p>
														<div className="mt-auto text-center">
															{option.premium ? (
																<div className="flex flex-col items-center">
																	<p className="text-sm text-muted-foreground mb-2">
																		Available for Premium & Enterprise plans
																	</p>
																	<Button
																		variant="outline"
																		asChild
																		className="mt-2">
																		<Link to="/pricing">Upgrade Plan</Link>
																	</Button>
																</div>
															) : (
																<Button
																	variant="default"
																	asChild>
																	<Link to={option.link}>
																		{option.linkText}
																	</Link>
																</Button>
															)}
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent
									value="help"
									className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Help Center</CardTitle>
											<CardDescription>
												Browse help articles by category
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid md:grid-cols-3 gap-6">
												{[
													{
														title: "Getting Started",
														icon: (
															<HelpCircle className="h-8 w-8 text-primary" />
														),
														topics: [
															"Creating your account",
															"Setting up your business profile",
															"Adding team members",
															"Creating your first schedule",
															"Mobile app setup",
														],
													},
													{
														title: "Scheduling",
														icon: <FileText className="h-8 w-8 text-primary" />,
														topics: [
															"Creating and editing shifts",
															"Schedule templates",
															"Time-off requests",
															"Shift swapping",
															"Automated scheduling",
														],
													},
													{
														title: "Billing & Account",
														icon: <FileText className="h-8 w-8 text-primary" />,
														topics: [
															"Managing your subscription",
															"Payment methods",
															"Invoices and receipts",
															"Plan upgrades and downgrades",
															"Account security",
														],
													},
													{
														title: "Team Management",
														icon: <FileText className="h-8 w-8 text-primary" />,
														topics: [
															"Setting roles and permissions",
															"Employee profiles",
															"Availability management",
															"Performance tracking",
															"Team communication",
														],
													},
													{
														title: "Integrations",
														icon: <FileText className="h-8 w-8 text-primary" />,
														topics: [
															"Payroll integrations",
															"Calendar syncing",
															"POS system connections",
															"HR software integration",
															"API documentation",
														],
													},
													{
														title: "Mobile Apps",
														icon: <FileText className="h-8 w-8 text-primary" />,
														topics: [
															"iOS app features",
															"Android app features",
															"Mobile notifications",
															"Offline access",
															"Mobile time tracking",
														],
													},
												].map((category, i) => (
													<Card
														key={i}
														className="h-full">
														<CardHeader className="pb-2">
															<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
																{category.icon}
															</div>
															<CardTitle className="text-lg">
																{category.title}
															</CardTitle>
														</CardHeader>
														<CardContent>
															<ul className="space-y-1">
																{category.topics.map((topic, j) => (
																	<li key={j}>
																		<Link
																			to="#"
																			className="text-sm text-muted-foreground hover:text-primary hover:underline">
																			{topic}
																		</Link>
																	</li>
																))}
															</ul>
														</CardContent>
													</Card>
												))}
											</div>

											<div className="mt-8 text-center">
												<Button
													variant="outline"
													asChild
													className="mt-4">
													<Link to="/help-center">View All Help Articles</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</section>
			</AppContent>
		</>
	);
}
