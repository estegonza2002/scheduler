import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
	GooglePlacesAutocomplete,
	type GooglePlaceResult,
} from "@/components/GooglePlacesAutocomplete";

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
	const location = useLocation();
	const isInAccountPage = location.pathname.includes("/account/");
	const [isLoading, setIsLoading] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isUpgrading, setIsUpgrading] = useState(false);
	const [isManualEntry, setIsManualEntry] = useState(false);

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
			country: "",
			website: "",
			businessHours: "",
		},
	});

	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				setIsLoading(true);

				// Try to get organizations using the API
				const orgs = await OrganizationsAPI.getAll();

				if (orgs && orgs.length > 0) {
					// We have organizations - set the first one for the business profile
					const currentOrg = orgs[0] as DBOrganization;
					setOrganization(currentOrg);

					// Pre-populate the form with organization data
					form.reset({
						name: currentOrg.name || "",
						description: currentOrg.description || "",
						contactEmail: currentOrg.contactemail || "",
						contactPhone: currentOrg.contactphone || "",
						address: currentOrg.address || "",
						country: currentOrg.country || "",
						website: currentOrg.website || "",
						businessHours: currentOrg.businesshours || "",
					});
				} else {
					// No organizations found
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

			// Map the values to match the database column names
			const updatedFields = {
				id: organization.id,
				name: values.name,
				description: values.description,
				contactemail: values.contactEmail,
				contactphone: values.contactPhone,
				address: values.address,
				country: values.country,
				website: values.website,
				businesshours: values.businessHours,
			};

			// Update the organization in the database via API
			const updatedOrg = await OrganizationsAPI.update(updatedFields as any);

			if (updatedOrg) {
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

	// Update handler functions to use useCallback
	const goBack = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	// Get business initials for avatar fallback
	const getBusinessInitials = useCallback(() => {
		const name = organization?.name || "";
		const words = name.split(" ");
		if (words.length >= 2) {
			return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}, [organization]);

	// Add the handleUpgrade function from BillingPage
	const handleUpgrade = useCallback(async (plan: "pro" | "business") => {
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
	}, []);

	// Add handleTabChange function
	const handleTabChange = useCallback(
		(tab: string) => {
			// If we're in the account page context, don't handle navigation as AccountPage manages it
			if (isInAccountPage) return;

			if (
				tab === "profile" ||
				tab === "password" ||
				tab === "notifications" ||
				tab === "branding" ||
				tab === "billing"
			) {
				navigate(`/profile?tab=${tab}`);
			}
		},
		[navigate, isInAccountPage]
	);

	// Convert onSubmit to useCallback
	const handleSubmit = useCallback(
		async (values: BusinessProfileFormValues) => {
			setIsLoading(true);
			try {
				if (!organization) {
					console.error("No organization found when attempting to save");
					toast.error(
						"No organization found. Please create a business profile first."
					);

					// Show create button dialog if no organization exists
					const createProfileSection =
						document.querySelector(".mt-8.p-6.border");
					if (createProfileSection) {
						createProfileSection.scrollIntoView({ behavior: "smooth" });
						// Highlight the create profile section
						createProfileSection.classList.add(
							"animate-pulse",
							"border-primary"
						);
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

				// Map the values to match the database column names
				const updatedFields = {
					id: organization.id,
					name: values.name,
					description: values.description,
					contactemail: values.contactEmail,
					contactphone: values.contactPhone,
					address: values.address,
					country: values.country,
					website: values.website,
					businesshours: values.businessHours,
				};

				// Update the organization in the database via API
				const updatedOrg = await OrganizationsAPI.update(updatedFields as any);

				if (updatedOrg) {
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
		},
		[organization]
	);

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

	// Render the main form content
	const renderFormContent = () => (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
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
							className={form.formState.errors.name ? "border-red-500" : ""}
							aria-required="true"
							aria-invalid={!!form.formState.errors.name}
						/>
						{form.formState.errors.name && (
							<p
								className="text-sm text-red-500"
								role="alert">
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
							aria-invalid={!!form.formState.errors.description}
						/>
						{form.formState.errors.description && (
							<p
								className="text-sm text-red-500"
								role="alert">
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
									form.formState.errors.contactEmail ? "border-red-500" : ""
								}
								aria-invalid={!!form.formState.errors.contactEmail}
							/>
							{form.formState.errors.contactEmail && (
								<p
									className="text-sm text-red-500"
									role="alert">
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
							<p
								className="text-sm text-red-500"
								role="alert">
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
							<div className="flex justify-between items-center">
								<Label htmlFor="address">Business Address</Label>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setIsManualEntry(!isManualEntry)}
									className="text-xs">
									{isManualEntry ? "Use Address Search" : "Manual Entry"}
								</Button>
							</div>
							{!isManualEntry && (
								<>
									<GooglePlacesAutocomplete
										defaultValue={
											form.getValues("address") ? form.getValues("address") : ""
										}
										placeholder="Search for your business address"
										className="w-full"
										onPlaceSelect={(place: GooglePlaceResult) => {
											// Update address-related fields
											form.setValue("address", place.address);
											form.setValue("country", place.country || "");
										}}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Start typing to search for your business address. Select a
										location from the dropdown to automatically fill address
										details.
									</p>
								</>
							)}
						</div>

						{isManualEntry && (
							<>
								<div className="space-y-2">
									<Label htmlFor="address">
										Address (Street, Building, etc.)
									</Label>
									<Input
										id="address"
										placeholder="Enter address manually"
										{...form.register("address")}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="country">Country</Label>
									<Input
										id="country"
										placeholder="Country"
										{...form.register("country")}
									/>
									<p className="text-xs text-muted-foreground">
										You can now edit the address and country manually.
									</p>
								</div>
							</>
						)}
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
							className={form.formState.errors.website ? "border-red-500" : ""}
							aria-invalid={!!form.formState.errors.website}
						/>
						{form.formState.errors.website && (
							<p
								className="text-sm text-red-500"
								role="alert">
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
							aria-invalid={!!form.formState.errors.businessHours}
						/>
						{form.formState.errors.businessHours && (
							<p
								className="text-sm text-red-500"
								role="alert">
								{form.formState.errors.businessHours.message}
							</p>
						)}
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
	);

	// Render the create organization section if no organization exists
	const renderCreateOrganization = () => {
		if (organization) return null;

		return (
			<div className="mt-8 p-6 border rounded-lg bg-muted/20">
				<h3 className="text-lg font-medium mb-2">No Business Profile Found</h3>
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
								<p className="text-sm text-red-500">{createBusinessError}</p>
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
								onChange={(e) => setNewBusinessDescription(e.target.value)}
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
								const { data, error } = await supabase
									.from("organizations")
									.insert({
										name: newBusinessName,
										description: newBusinessDescription || "",
										owner_id: userId,
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
											// Set the organization in state
											setOrganization(data);

											// Update the form with the new organization data
											form.reset({
												name: data.name || "",
												description: data.description || "",
												contactEmail: data.contactemail || "",
												contactPhone: data.contactphone || "",
												address: data.address || "",
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
												country: data.country || "",
												website: data.website || "",
												businessHours: data.businesshours || "",
											});

											toast.success("Business profile ready to use!");
										}
									} catch (memberError) {
										console.error("Exception adding member:", memberError);
										toast.error(
											"Failed to add you as a member, but organization was created"
										);

										// Still set the organization in state
										setOrganization(data);
										form.reset({
											name: data.name || "",
											description: data.description || "",
											contactEmail: data.contactemail || "",
											contactPhone: data.contactphone || "",
											address: data.address || "",
											country: data.country || "",
											website: data.website || "",
											businessHours: data.businesshours || "",
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
		);
	};

	// Create the main content that will be used in both contexts
	const renderContent = () => (
		<>
			{renderFormContent()}
			{renderCreateOrganization()}
		</>
	);

	// If we're in the account context, just return the content
	if (isInAccountPage) {
		return renderContent();
	}

	// For standalone page (not inside account)
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

				<TabsContent
					value="profile"
					className="pt-4">
					{renderContent()}
				</TabsContent>

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
