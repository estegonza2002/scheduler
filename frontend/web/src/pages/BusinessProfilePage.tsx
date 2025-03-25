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
import { MapPin, Phone, Globe, Clock, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";

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
			name: organization?.name || "",
			description: organization?.description || "",
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
		values: {
			name: organization?.name || "",
			description: organization?.description || "",
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
	});

	// Update form values when organization data is loaded
	useEffect(() => {
		if (organization) {
			form.reset({
				name: organization.name || "",
				description: organization.description || "",
				contactEmail: "",
				contactPhone: "",
				address: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
				website: "",
				businessHours: "",
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

			// In a real implementation, this would update the organization in the database
			const updatedOrg = await OrganizationsAPI.create({
				name: values.name,
				description: values.description,
			});

			setOrganization(updatedOrg);
			toast.success("Business profile updated successfully");
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
				<div className="flex items-center mb-8">
					<Avatar className="h-20 w-20 mr-6">
						<AvatarImage src={""} />
						<AvatarFallback className="text-xl">
							{getBusinessInitials()}
						</AvatarFallback>
					</Avatar>
				</div>

				<Tabs
					defaultValue="profile"
					className="w-full">
					<TabsList className="mb-6 w-full sm:w-auto">
						<TabsTrigger value="profile">Business Profile</TabsTrigger>
						<TabsTrigger value="branding">Branding</TabsTrigger>
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

					<TabsContent value="branding">
						<FormSection
							title="Business Logo"
							description="Upload your business logo. Recommended size: 400x400px.">
							<div className="flex items-center gap-4">
								<Avatar className="h-24 w-24">
									<AvatarFallback className="text-2xl">
										{getBusinessInitials()}
									</AvatarFallback>
								</Avatar>
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
				</Tabs>
			</ContentContainer>
		</>
	);
}
