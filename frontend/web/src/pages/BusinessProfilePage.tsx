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
import { Form } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";

// Define form schema for validation
const businessProfileSchema = z.object({
	name: z.string().min(2, "Business name is required"),
	description: z.string().optional().or(z.literal("")),
	contactEmail: z
		.string()
		.email("Invalid email address")
		.optional()
		.or(z.literal("")),
	contactPhone: z
		.string()
		.optional()
		.or(z.literal(""))
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
	address: z.string().optional().or(z.literal("")),
	city: z.string().optional().or(z.literal("")),
	state: z.string().optional().or(z.literal("")),
	zipCode: z.string().optional().or(z.literal("")),
	country: z.string().optional().or(z.literal("")),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	businessHours: z.string().optional().or(z.literal("")),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

// Add an extended type to handle database column names
interface DBOrganization extends Organization {
	// Add database column names (lowercase)
	contactemail?: string;
	contactphone?: string;
	zipcode?: string;
	businesshours?: string;
	// Plus the original fields from Organization
}

export default function BusinessProfilePage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isUpgrading, setIsUpgrading] = useState(false);

	// Add local state for new business creation
	const [newBusinessName, setNewBusinessName] = useState("");
	const [newBusinessDescription, setNewBusinessDescription] = useState("");
	const [createBusinessError, setCreateBusinessError] = useState("");

	// Initialize form with default empty values first
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
	});

	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				setIsLoading(true);

				// Direct SQL query to check if any organizations exist
				console.log("Checking organizations with SQL query...");
				const { data: userData } = await supabase.auth.getUser();
				const userId = userData.user?.id;

				if (userId) {
					const { data: directData, error: directError } = await supabase.rpc(
						"get_user_organizations",
						{ user_id_param: userId }
					);

					if (directError) {
						console.error("Error with RPC call:", directError);

						// Try a simple direct query instead
						const { data: sqlData, error: sqlError } = await supabase
							.from("organizations")
							.select("*");

						if (sqlError) {
							console.error("Error with direct SQL query:", sqlError);
						} else {
							console.log("Direct SQL organizations result:", sqlData);
						}
					} else {
						console.log("RPC organizations result:", directData);
					}
				}

				// Try to get organizations using the API
				const orgs = await OrganizationsAPI.getAll();
				console.log("Fetched organizations:", orgs);

				if (orgs && orgs.length > 0) {
					// We have organizations - set the first one for the business profile
					const currentOrg = orgs[0] as DBOrganization;
					console.log("Selected organization:", currentOrg);
					setOrganization(currentOrg);

					// Pre-populate the form with organization data
					form.reset({
						name: currentOrg.name || "",
						description: currentOrg.description || "",
						contactEmail: currentOrg.contactemail || "",
						contactPhone: currentOrg.contactphone || "",
						address: currentOrg.address || "",
						city: currentOrg.city || "",
						state: currentOrg.state || "",
						zipCode: currentOrg.zipcode || "",
						country: currentOrg.country || "",
						website: currentOrg.website || "",
						businessHours: currentOrg.businesshours || "",
					});
				} else {
					// No organizations found
					console.log("No organizations found for this user");
					toast.warning(
						"No business profile found. Please create a business profile first."
					);

					// Initialize the form with empty values
					form.reset({
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
					});
				}
			} catch (error) {
				console.error("Error fetching organization:", error);
				toast.error("Failed to load business information");

				// Reset form on error
				form.reset({
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
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganization();
	}, []);

	// Update form values when organization data is loaded
	useEffect(() => {
		if (organization) {
			const dbOrg = organization as DBOrganization;
			form.reset({
				name: dbOrg.name || "",
				description: dbOrg.description || "",
				contactEmail: dbOrg.contactemail || "",
				contactPhone: dbOrg.contactphone || "",
				address: dbOrg.address || "",
				city: dbOrg.city || "",
				state: dbOrg.state || "",
				zipCode: dbOrg.zipcode || "",
				country: dbOrg.country || "",
				website: dbOrg.website || "",
				businessHours: dbOrg.businesshours || "",
			});
		}
	}, [organization, form]);

	async function onSubmit(values: BusinessProfileFormValues) {
		setIsLoading(true);
		try {
			if (!organization) {
				console.error("No organization found when attempting to save");
				toast.error(
					"No organization found. Please create a business profile first."
				);

				// Show create button dialog if no organization exists
				const createProfileSection = document.querySelector(".mt-8.p-6.border");
				if (createProfileSection) {
					createProfileSection.scrollIntoView({ behavior: "smooth" });
					// Highlight the create profile section
					createProfileSection.classList.add("animate-pulse", "border-primary");
					setTimeout(() => {
						createProfileSection.classList.remove(
							"animate-pulse",
							"border-primary"
						);
					}, 2000);
				}

				setIsLoading(false);
				return;
			}

			console.log("Updating organization with values:", values);

			// Map the values to match the database column names
			const updatedFields = {
				id: organization.id,
				name: values.name,
				description: values.description,
				contactemail: values.contactEmail,
				contactphone: values.contactPhone,
				address: values.address,
				city: values.city,
				state: values.state,
				zipcode: values.zipCode,
				country: values.country,
				website: values.website,
				businesshours: values.businessHours,
			};

			// Update the organization in the database via API
			const updatedOrg = await OrganizationsAPI.update(updatedFields as any);

			if (updatedOrg) {
				console.log("Successfully updated organization:", updatedOrg);
				setOrganization(updatedOrg);
				toast.success("Business profile updated successfully");
			} else {
				console.error("Update returned null/undefined");
				toast.error("Failed to update business profile");
			}
		} catch (error: unknown) {
			console.error("Error during update:", error);
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
			{/* Debug panel */}
			{process.env.NODE_ENV !== "production" && (
				<div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
					<h3 className="font-bold">Debug Panel</h3>
					<pre className="text-xs overflow-auto max-h-[150px]">
						{JSON.stringify(
							{
								organization,
								isLoading,
								formValues: form.getValues(),
								formErrors: form.formState.errors,
							},
							null,
							2
						)}
					</pre>
				</div>
			)}

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

				<TabsContent
					value="profile"
					className="pt-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6 pb-8">
							<FormSection
								title="Business Information"
								description="Update your business details">
								<div className="space-y-2">
									<Label htmlFor="name">
										Business Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="name"
										placeholder="Enter your business name"
										{...form.register("name")}
										className={
											form.formState.errors.name ? "border-red-500" : ""
										}
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
										className={
											form.formState.errors.description ? "border-red-500" : ""
										}
									/>
									{form.formState.errors.description && (
										<p className="text-sm text-red-500">
											{form.formState.errors.description.message}
										</p>
									)}
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
											className={
												form.formState.errors.contactEmail
													? "border-red-500"
													: ""
											}
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
									{form.formState.errors.contactPhone && (
										<p className="text-sm text-red-500">
											{form.formState.errors.contactPhone.message}
										</p>
									)}
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
										className={
											form.formState.errors.website ? "border-red-500" : ""
										}
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
					</Form>

					{/* Add a button to create an organization if none exists */}
					{!organization && (
						<div className="mt-8 p-6 border rounded-lg bg-muted/20">
							<h3 className="text-lg font-medium mb-2">
								No Business Profile Found
							</h3>
							<p className="text-muted-foreground mb-4">
								You need to create a business profile to use this feature.
							</p>
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-3">
									<div className="space-y-2">
										<Label htmlFor="new-business-name">
											Business Name <span className="text-red-500">*</span>
										</Label>
										<Input
											id="new-business-name"
											placeholder="Enter your business name"
											value={newBusinessName}
											onChange={(e) => {
												setNewBusinessName(e.target.value);
												setCreateBusinessError("");
											}}
										/>
										{createBusinessError && (
											<p className="text-sm text-red-500">
												{createBusinessError}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="new-business-description">
											Business Description
										</Label>
										<Textarea
											id="new-business-description"
											placeholder="Briefly describe your business"
											value={newBusinessDescription}
											onChange={(e) =>
												setNewBusinessDescription(e.target.value)
											}
											rows={3}
										/>
									</div>
								</div>
								<Button
									onClick={async () => {
										try {
											// Validate business name
											if (!newBusinessName || newBusinessName.length < 2) {
												setCreateBusinessError(
													"Business name is required (min 2 characters)"
												);
												return;
											}

											setIsLoading(true);
											console.log("Creating new organization...");

											// Get the current user
											const { data: userData } = await supabase.auth.getUser();
											const userId = userData.user?.id;

											if (!userId) {
												toast.error(
													"You must be logged in to create a business profile"
												);
												return;
											}

											// Use direct Supabase query to create organization
											console.log(
												"Creating organization with owner_id:",
												userId
											);
											const { data, error } = await supabase
												.from("organizations")
												.insert({
													name: newBusinessName,
													description: newBusinessDescription || "",
													owner_id: userId,
													// Don't include the additional columns if they don't exist in the DB yet
												})
												.select()
												.single();

											if (error) {
												console.error("Error creating organization:", error);
												toast.error(
													`Failed to create organization: ${error.message}`
												);

												if (
													error.message.includes("column") &&
													error.message.includes("does not exist")
												) {
													toast.error(
														"Database schema needs to be updated. Please run the SQL script in update_organization_schema.sql"
													);
												}
											} else if (data) {
												console.log("Created organization:", data);
												toast.success("Business profile created successfully!");

												try {
													// Get the user's email
													const userData = await supabase.auth.getUser();
													const userEmail = userData.data.user?.email;

													// First check if member already exists
													const { data: existingMember, error: checkError } =
														await supabase
															.from("organization_members")
															.select("*")
															.eq("organization_id", data.id)
															.eq("user_id", userId)
															.single();

													if (existingMember) {
														console.log(
															"User is already a member of this organization:",
															existingMember
														);
														// Set the organization in state
														setOrganization(data);

														// Update the form with the new organization data
														form.reset({
															name: data.name || "",
															description: data.description || "",
															contactEmail: data.contactemail || "",
															contactPhone: data.contactphone || "",
															address: data.address || "",
															city: data.city || "",
															state: data.state || "",
															zipCode: data.zipcode || "",
															country: data.country || "",
															website: data.website || "",
															businessHours: data.businesshours || "",
														});

														toast.success("Business profile ready to use!");
														return;
													}

													// Add user as organization member
													const { error: memberError } = await supabase
														.from("organization_members")
														.insert({
															organization_id: data.id,
															user_id: userId,
															role: "admin",
														});

													if (memberError) {
														console.error("Error adding member:", memberError);

														if (
															memberError.message.includes(
																"violates foreign key constraint"
															)
														) {
															toast.error(
																"Can't add you as a member because of a database constraint issue. Please run the updated SQL script that fixes the foreign key relationships."
															);
														} else {
															toast.error(
																`Failed to add member: ${memberError.message}`
															);
														}

														// Even with member error, we can still show the organization
														setOrganization(data);

														// Update the form with the new organization data
														form.reset({
															name: data.name || "",
															description: data.description || "",
															contactEmail: data.contactemail || "",
															contactPhone: data.contactphone || "",
															address: data.address || "",
															city: data.city || "",
															state: data.state || "",
															zipCode: data.zipcode || "",
															country: data.country || "",
															website: data.website || "",
															businessHours: data.businesshours || "",
														});

														toast.warning(
															"Organization created, but you weren't added as a member due to a database constraint. Some features may be limited."
														);
													} else {
														// Set the organization in state instead of reloading
														setOrganization(data);

														// Update the form with the new organization data
														form.reset({
															name: data.name || "",
															description: data.description || "",
															contactEmail: data.contactemail || "",
															contactPhone: data.contactphone || "",
															address: data.address || "",
															city: data.city || "",
															state: data.state || "",
															zipCode: data.zipcode || "",
															country: data.country || "",
															website: data.website || "",
															businessHours: data.businesshours || "",
														});

														toast.success("Business profile ready to use!");
													}
												} catch (memberError) {
													console.error(
														"Exception adding member:",
														memberError
													);
													toast.error(
														"Failed to add you as a member, but organization was created"
													);

													// Still set the organization in state
													setOrganization(data);
													form.reset({
														name: data.name || "",
														description: data.description || "",
														// other fields
													});
												}
											}
										} catch (error) {
											console.error("Exception creating organization:", error);
											toast.error("Failed to create organization");
										} finally {
											setIsLoading(false);
										}
									}}
									disabled={isLoading}
									className="w-full">
									{isLoading ? "Creating..." : "Create Business Profile"}
								</Button>
							</div>
						</div>
					)}
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
