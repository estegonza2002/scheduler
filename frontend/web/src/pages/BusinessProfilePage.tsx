import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { OrganizationsAPI, type Organization } from "../api";
import {
	MapPin,
	Phone,
	Globe,
	Clock,
	ChevronLeft,
	CreditCard,
	Package,
	Receipt,
	Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";
import { ContentSection } from "../components/ui/content-section";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

// Define form schema for validation
const businessProfileSchema = z.object({
	name: z.string().min(2, "Business name is required"),
	description: z.string().optional(),
	contactEmail: z.string().email("Invalid email address").optional(),
	contactPhone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	businessHours: z.string().optional(),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

export default function BusinessProfilePage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isUpgrading, setIsUpgrading] = useState(false);

	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				setIsLoading(true);
				// In a real implementation, we would fetch the organization by the user's organization_id
				// For now, we'll use the first organization from the mock data
				const orgs = await OrganizationsAPI.getAll();
				if (orgs.length > 0) {
					setOrganization(orgs[0]);
				}
			} catch (error) {
				console.error("Error fetching organization:", error);
				toast.error("Failed to load business information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganization();
	}, []);

	// Initialize form with organization data when it's loaded
	const form = useForm<BusinessProfileFormValues>({
		resolver: zodResolver(businessProfileSchema),
		defaultValues: {
			name: "",
			description: "",
			contactEmail: "",
			contactPhone: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
			website: "",
			businessHours: "",
		},
		values: organization
			? {
					name: organization.name || "",
					description: organization.description || "",
					contactEmail: organization.contactEmail || "",
					contactPhone: organization.contactPhone || "",
					address: organization.address || "",
					city: organization.city || "",
					state: organization.state || "",
					zipCode: organization.zipCode || "",
					country: organization.country || "",
					website: organization.website || "",
					businessHours: organization.businessHours || "",
			  }
			: undefined,
	});

	// Update form values when organization data is loaded
	useEffect(() => {
		if (organization) {
			form.reset({
				name: organization.name || "",
				description: organization.description || "",
				contactEmail: organization.contactEmail || "",
				contactPhone: organization.contactPhone || "",
				address: organization.address || "",
				city: organization.city || "",
				state: organization.state || "",
				zipCode: organization.zipCode || "",
				country: organization.country || "",
				website: organization.website || "",
				businessHours: organization.businessHours || "",
			});
		}
	}, [organization, form]);

	async function onSubmit(values: BusinessProfileFormValues) {
		setIsLoading(true);
		try {
			if (!organization) {
				toast.error("No organization found");
				return;
			}

			// Update the organization in the database
			const updatedOrg = await OrganizationsAPI.update({
				id: organization.id,
				name: values.name,
				description: values.description,
				contactEmail: values.contactEmail,
				contactPhone: values.contactPhone,
				address: values.address,
				city: values.city,
				state: values.state,
				zipCode: values.zipCode,
				country: values.country,
				website: values.website,
				businessHours: values.businessHours,
			});

			if (updatedOrg) {
				setOrganization(updatedOrg);
				toast.success("Business profile updated successfully");
			} else {
				toast.error("Failed to update business profile");
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to update business profile: " + errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	const goBack = () => {
		navigate(-1);
	};

	// Get business initials for avatar fallback
	const getBusinessInitials = () => {
		const name = organization?.name || "";
		const words = name.split(" ");
		if (words.length >= 2) {
			return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	// Add the handleUpgrade function from BillingPage
	const handleUpgrade = async (plan: "pro" | "business") => {
		try {
			setIsUpgrading(true);
			// In a real implementation, this would call an API to upgrade the subscription
			// For now, we'll just simulate a delay and update the state
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSubscriptionPlan(plan);
			toast.success(`Successfully upgraded to ${plan} plan!`);
		} catch (error) {
			toast.error("Failed to upgrade subscription");
		} finally {
			setIsUpgrading(false);
		}
	};

	if (isLoading && !organization) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<>
			<ContentContainer>
				<Tabs
					defaultValue="profile"
					className="w-full">
					<TabsList className="mb-6 w-full sm:w-auto">
						<TabsTrigger value="profile">Business Profile</TabsTrigger>
						{/* Branding tab hidden temporarily 
						<TabsTrigger value="branding">Branding</TabsTrigger>
						*/}
						<TabsTrigger value="billing">Billing</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							<FormSection
								title="Business Information"
								description="Update your business details">
								<div className="space-y-2">
									<Label htmlFor="name">Business Name</Label>
									<Input
										id="name"
										placeholder="Enter your business name"
										{...form.register("name")}
									/>
									{form.formState.errors.name && (
										<p className="text-sm text-red-500">
											{form.formState.errors.name.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Business Description</Label>
									<Textarea
										id="description"
										placeholder="Enter a description of your business"
										rows={4}
										{...form.register("description")}
									/>
								</div>
							</FormSection>

							<FormSection
								title="Contact Information"
								description="Update contact details for your business"
								className="pt-2">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="contactEmail">Contact Email</Label>
										<Input
											id="contactEmail"
											type="email"
											placeholder="contact@yourbusiness.com"
											{...form.register("contactEmail")}
										/>
										{form.formState.errors.contactEmail && (
											<p className="text-sm text-red-500">
												{form.formState.errors.contactEmail.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="contactPhone">Contact Phone</Label>
										<Input
											id="contactPhone"
											placeholder="(123) 456-7890"
											{...form.register("contactPhone")}
										/>
									</div>
								</div>
							</FormSection>

							<FormSection
								title="Address"
								description="Update the physical address of your business"
								className="pt-2">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="address">Street Address</Label>
										<Input
											id="address"
											placeholder="123 Main St"
											{...form.register("address")}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="city">City</Label>
											<Input
												id="city"
												placeholder="City"
												{...form.register("city")}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="state">State/Province</Label>
											<Input
												id="state"
												placeholder="State"
												{...form.register("state")}
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="zipCode">ZIP/Postal Code</Label>
											<Input
												id="zipCode"
												placeholder="ZIP"
												{...form.register("zipCode")}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="country">Country</Label>
											<Input
												id="country"
												placeholder="Country"
												{...form.register("country")}
											/>
										</div>
									</div>
								</div>
							</FormSection>

							<FormSection
								title="Online Presence"
								description="Add your website and online details"
								className="pt-2">
								<div className="space-y-2">
									<Label htmlFor="website">Website</Label>
									<Input
										id="website"
										placeholder="https://www.example.com"
										{...form.register("website")}
									/>
									{form.formState.errors.website && (
										<p className="text-sm text-red-500">
											{form.formState.errors.website.message}
										</p>
									)}
								</div>
							</FormSection>

							<FormSection
								title="Business Hours"
								description="Specify when your business is open"
								className="pt-2">
								<div className="space-y-2">
									<Label htmlFor="businessHours">Hours of Operation</Label>
									<Textarea
										id="businessHours"
										placeholder="Monday-Friday: 9am-5pm&#10;Saturday: 10am-3pm&#10;Sunday: Closed"
										rows={3}
										{...form.register("businessHours")}
									/>
								</div>
							</FormSection>

							<div className="flex justify-end pt-4">
								<Button
									type="submit"
									disabled={isLoading}>
									{isLoading ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</TabsContent>

					{/* Branding tab content hidden temporarily 
					<TabsContent value="branding">
						<FormSection
							title="Business Logo"
							description="Upload your business logo. Recommended size: 400x400px.">
							<div className="flex items-center gap-4">
								<Button variant="outline">Upload Logo</Button>
							</div>
						</FormSection>

						<FormSection
							title="Company Colors"
							description="Choose colors that represent your brand. These colors will be displayed throughout your account."
							className="pt-2">
							<div className="flex items-center gap-4">
								<div className="space-y-2">
									<Label htmlFor="primaryColor">Primary Color</Label>
									<div className="flex items-center gap-2">
										<div className="h-10 w-10 rounded-md bg-primary" />
										<Input
											id="primaryColor"
											value="Primary Theme Color"
											disabled
										/>
									</div>
								</div>
							</div>
						</FormSection>

						<p className="text-center text-muted-foreground pt-8">
							Advanced branding options will be available in a future update.
						</p>
					</TabsContent>
					*/}

					<TabsContent value="billing">
						<Tabs
							defaultValue="subscription"
							className="w-full">
							<TabsList className="mb-6 w-full max-w-md">
								<TabsTrigger value="subscription">Subscription</TabsTrigger>
								<TabsTrigger value="payment-methods">
									Payment Methods
								</TabsTrigger>
								<TabsTrigger value="billing-history">
									Billing History
								</TabsTrigger>
							</TabsList>

							<TabsContent value="subscription">
								<ContentSection
									title="Current Subscription"
									description="Your current plan and subscription details">
									<div className="rounded-lg border p-4">
										<h3 className="text-lg font-medium mb-2 flex items-center">
											<Package className="h-5 w-5 mr-2 text-primary" />
											{subscriptionPlan === "free" && "Free Plan"}
											{subscriptionPlan === "pro" && "Pro Plan"}
											{subscriptionPlan === "business" && "Business Plan"}
										</h3>
										<p className="text-sm text-muted-foreground mb-4">
											{subscriptionPlan === "free" &&
												"Your business is currently on the free plan."}
											{subscriptionPlan === "pro" &&
												"Your business is subscribed to the Pro plan."}
											{subscriptionPlan === "business" &&
												"Your business is subscribed to the Business plan."}
										</p>
										<ul className="space-y-2 text-sm mb-6">
											{subscriptionPlan === "free" && (
												<>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Up to 5 employees</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Basic scheduling features</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Email notifications</span>
													</li>
													<li className="flex items-start text-muted-foreground">
														<span className="mr-2">✗</span>
														<span>Advanced reporting</span>
													</li>
													<li className="flex items-start text-muted-foreground">
														<span className="mr-2">✗</span>
														<span>Team management tools</span>
													</li>
												</>
											)}
											{subscriptionPlan === "pro" && (
												<>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Up to 25 employees</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Advanced scheduling features</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>SMS notifications</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Basic reporting</span>
													</li>
													<li className="flex items-start text-muted-foreground">
														<span className="mr-2">✗</span>
														<span>Advanced analytics</span>
													</li>
												</>
											)}
											{subscriptionPlan === "business" && (
												<>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Unlimited employees</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Premium scheduling features</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>SMS and email notifications</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Advanced reporting & analytics</span>
													</li>
													<li className="flex items-start">
														<span className="mr-2">✓</span>
														<span>Priority support</span>
													</li>
												</>
											)}
										</ul>
									</div>
									{subscriptionPlan !== "business" && (
										<div className="mt-6 flex justify-end">
											<Button
												disabled={isUpgrading}
												onClick={() =>
													subscriptionPlan === "free"
														? handleUpgrade("pro")
														: handleUpgrade("business")
												}>
												{isUpgrading
													? "Processing..."
													: subscriptionPlan === "free"
													? "Upgrade to Pro"
													: "Upgrade to Business"}
											</Button>
										</div>
									)}
								</ContentSection>

								{subscriptionPlan === "free" && (
									<ContentSection
										title="Available Plans"
										description="Choose a plan that best fits your business">
										<div className="grid md:grid-cols-2 gap-6">
											<Card className="border-primary">
												<CardHeader>
													<div className="flex justify-between items-center">
														<CardTitle>Pro Plan</CardTitle>
														<div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
															Recommended
														</div>
													</div>
													<CardDescription>
														For growing businesses
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="mb-4">
														<span className="text-3xl font-bold">$29</span>
														<span className="text-muted-foreground">
															{" "}
															/ month
														</span>
													</div>
													<ul className="space-y-2 text-sm">
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Up to 25 employees</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Advanced scheduling features</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>SMS notifications</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Basic reporting</span>
														</li>
													</ul>
												</CardContent>
												<CardFooter>
													<Button
														className="w-full"
														onClick={() => handleUpgrade("pro")}
														disabled={isUpgrading}>
														{isUpgrading ? "Processing..." : "Select Plan"}
													</Button>
												</CardFooter>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle>Business Plan</CardTitle>
													<CardDescription>
														For larger organizations
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="mb-4">
														<span className="text-3xl font-bold">$79</span>
														<span className="text-muted-foreground">
															{" "}
															/ month
														</span>
													</div>
													<ul className="space-y-2 text-sm">
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Unlimited employees</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Premium scheduling features</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>SMS and email notifications</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Advanced reporting & analytics</span>
														</li>
													</ul>
												</CardContent>
												<CardFooter>
													<Button
														className="w-full"
														onClick={() => handleUpgrade("business")}
														disabled={isUpgrading}
														variant="outline">
														{isUpgrading ? "Processing..." : "Select Plan"}
													</Button>
												</CardFooter>
											</Card>
										</div>
									</ContentSection>
								)}

								{subscriptionPlan === "pro" && (
									<ContentSection
										title="Available Upgrades"
										description="Take your business to the next level">
										<div className="grid md:grid-cols-1 gap-6 max-w-md">
											<Card>
												<CardHeader>
													<CardTitle>Business Plan</CardTitle>
													<CardDescription>
														For larger organizations
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="mb-4">
														<span className="text-3xl font-bold">$79</span>
														<span className="text-muted-foreground">
															{" "}
															/ month
														</span>
													</div>
													<ul className="space-y-2 text-sm">
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Unlimited employees</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Premium scheduling features</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>SMS and email notifications</span>
														</li>
														<li className="flex items-start">
															<span className="mr-2">✓</span>
															<span>Advanced reporting & analytics</span>
														</li>
													</ul>
												</CardContent>
												<CardFooter>
													<Button
														className="w-full"
														onClick={() => handleUpgrade("business")}
														disabled={isUpgrading}>
														{isUpgrading
															? "Processing..."
															: "Upgrade to Business"}
													</Button>
												</CardFooter>
											</Card>
										</div>
									</ContentSection>
								)}
							</TabsContent>

							<TabsContent value="payment-methods">
								<ContentSection
									title="Payment Methods"
									description="Manage your payment methods for subscription charges">
									<div className="py-8 text-center">
										<CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground mb-4">
											No payment methods have been added yet.
										</p>
										<Button variant="outline">Add Payment Method</Button>
									</div>
								</ContentSection>
							</TabsContent>

							<TabsContent value="billing-history">
								<ContentSection
									title="Billing History"
									description="View your past invoices and payment history">
									<div className="py-8 text-center">
										<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground mb-4">
											No billing history available.
										</p>
										<Button
											variant="outline"
											disabled>
											Download Invoices
										</Button>
									</div>
								</ContentSection>
							</TabsContent>
						</Tabs>
					</TabsContent>
				</Tabs>
			</ContentContainer>
		</>
	);
}
