import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationsAPI, type Organization } from "@/api";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContentContainer } from "@/components/ui/content-container";
import { FormSection } from "@/components/ui/form-section";
import { ContentSection } from "@/components/ui/content-section";
import { PageHeader } from "@/components/ui/page-header";
import { SecondaryLayout } from "@/components/layout/SecondaryLayout";

import { ProfileSidebar } from "@/components/layout/SecondaryNavbar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";

// Define form schema for validation
const businessProfileSchema = z.object({
	name: z.string().min(2, "Business name is required"),
	description: z.string().optional(),
	contactEmail: z.string().email("Invalid email address").optional(),
	contactPhone: z
		.string()
		.optional()
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
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

	// Add handleTabChange function
	const handleTabChange = (tab: string) => {
		if (
			tab === "profile" ||
			tab === "password" ||
			tab === "notifications" ||
			tab === "branding" ||
			tab === "billing"
		) {
			navigate(`/profile?tab=${tab}`);
		}
	};

	if (isLoading && !organization) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<LoadingState
					message="Loading business profile..."
					type="spinner"
				/>
			</div>
		);
	}

	return (
		<SecondaryLayout
			title="Business Profile"
			description="Manage your business information"
			sidebar={
				<ProfileSidebar
					activeTab="business-profile"
					onTabChange={handleTabChange}
				/>
			}>
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

								<FormPhoneInput
									control={form.control}
									name="contactPhone"
									label="Contact Phone"
									placeholder="Enter phone number"
									countryField="country"
								/>
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
					<ContentSection
						title="Billing Information"
						description="View and manage your subscription and billing details">
						<p>
							To manage your subscription and billing details, please visit the{" "}
							<Button
								variant="link"
								className="p-0 h-auto"
								onClick={() => navigate("/billing")}>
								Billing page
							</Button>
							.
						</p>
					</ContentSection>
				</TabsContent>
			</Tabs>
		</SecondaryLayout>
	);
}
