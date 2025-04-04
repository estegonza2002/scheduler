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
	Save,
	Upload,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContentContainer } from "@/components/ui/content-container";
import { FormSection } from "@/components/ui/form-section";
import { ContentSection } from "@/components/ui/content-section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Form } from "@/components/ui/form";
import {
	GooglePlacesAutocomplete,
	type GooglePlaceResult,
} from "@/components/GooglePlacesAutocomplete";
import { AppContent } from "@/components/layout/AppLayout";
import { useHeader } from "@/lib/header-context";
import { useOrganization } from "@/lib/organization";
import { useAuth } from "@/lib/auth";

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

export default function BusinessProfilePage() {
	const { updateHeader } = useHeader();
	const navigate = useNavigate();
	const location = useLocation();
	const isInAccountPage = location.pathname.includes("/account/");
	const {
		organization,
		isLoading: isOrgLoading,
		refreshOrganization,
	} = useOrganization();
	const { user: authUser } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(isOrgLoading);
	const [subscriptionPlan, setSubscriptionPlan] = useState<
		"free" | "pro" | "business"
	>("free");
	const [isManualEntry, setIsManualEntry] = useState(false);
	const [isUpgrading, setIsUpgrading] = useState(false);

	// Add local state for new business creation
	const [newBusinessName, setNewBusinessName] = useState("");
	const [newBusinessDescription, setNewBusinessDescription] = useState("");
	const [createBusinessError, setCreateBusinessError] = useState("");

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

	// Set the page header
	useEffect(() => {
		updateHeader({
			title: "Business Profile",
			description: "Manage your business information and settings",
		});
	}, [updateHeader]);

	// Update form values when organization data is loaded from context
	useEffect(() => {
		// Update local loading state based on context
		setIsLoading(isOrgLoading);

		if (organization && !isOrgLoading) {
			// Populate form with context organization data
			// Assuming Organization type from API/context has the correct fields (camelCase)
			form.reset({
				name: organization.name || "",
				description: organization.description || "",
				contactEmail: organization.contactEmail || "", // Use camelCase
				contactPhone: organization.contactPhone || "", // Use camelCase
				// Address might be an object now, adjust if needed
				address:
					typeof organization.address === "string" ? organization.address : "", // Handle address potentially being object
				country:
					// Address from context might not have country, default to empty
					"", // Remove reliance on address.country
				website: organization.website || "",
				businessHours: organization.businessHours || "", // Use camelCase
			});
			// Set subscription plan based on context data
			setSubscriptionPlan(organization.subscriptionPlan || "free");
		} else if (!isOrgLoading && !organization) {
			// Org loading finished, but no org found
			toast.warning(
				"No organization selected or found. Cannot load business profile."
			);
			// Reset form if no org
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
	}, [organization, isOrgLoading, form]);

	// Convert onSubmit to useCallback
	const handleSubmit = useCallback(
		async (values: BusinessProfileFormValues) => {
			// Ensure organization from context is available
			if (!organization) {
				toast.error("No active organization selected. Cannot save profile.");
				return;
			}

			setIsSubmitting(true);
			try {
				// Map form values to update payload (use camelCase matching API)
				const updatedFields = {
					id: organization.id, // Use ID from context organization
					name: values.name,
					description: values.description,
					contactEmail: values.contactEmail,
					contactPhone: values.contactPhone,
					// Handle address potentially being object
					address: values.address, // Assuming API expects string for now, adjust if needed
					website: values.website,
					businessHours: values.businessHours,
					// Do NOT include country if address is just a string
				};

				// Update the organization via API
				const updatedOrg = await OrganizationsAPI.update(updatedFields);

				if (updatedOrg) {
					// Context listener should update the organization state automatically,
					// but we can trigger a refresh just in case or if listener isn't setup/working
					// refreshOrganization(); // Optional: Force refresh context
					toast.success("Business profile updated successfully");
				} else {
					// API call returned null/error (toast likely shown in API handler)
					console.error("Update returned null/undefined");
					// toast.error("Failed to update business profile");
				}
			} catch (error: unknown) {
				console.error("Error during update:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				toast.error("Failed to update business profile: " + errorMessage);
			} finally {
				setIsSubmitting(false);
			}
		},
		[organization] // Depend on context organization
	);

	// Update handler functions to use useCallback
	const goBack = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	// Get business initials for avatar fallback
	const getBusinessInitials = useCallback(() => {
		const name = organization?.name || ""; // Use context organization
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

	if (isLoading) {
		// Show loading state while context is loading
		return (
			<AppContent className="flex justify-center items-center">
				<LoadingState
					message="Loading business profile..."
					type="spinner"
				/>
			</AppContent>
		);
	}

	if (!organization) {
		// Show message if no organization is selected/available
		return (
			<AppContent className="flex justify-center items-center">
				<p className="text-muted-foreground">
					No organization selected. Please select or create an organization.
				</p>
				{/* Optionally add a button to navigate to org selector/creation */}
			</AppContent>
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
						disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save Changes"}
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

								if (!authUser) {
									toast.error(
										"You must be logged in to create a business profile"
									);
									setIsLoading(false);
									return;
								}

								// Use OrganizationsAPI to create the organization
								// This API call now also handles adding the creator as owner/admin
								const newOrg = await OrganizationsAPI.create({
									name: newBusinessName,
									description: newBusinessDescription || undefined,
									// ownerId is set automatically in the API based on authUser
								});

								if (newOrg) {
									toast.success("Business profile created successfully!");

									// Refresh organization context to make the new org available
									refreshOrganization();

									// Update the form with the new organization data (use camelCase)
									form.reset({
										name: newOrg.name || "",
										description: newOrg.description || "",
										contactEmail: newOrg.contactEmail || "",
										contactPhone: newOrg.contactPhone || "",
										address:
											typeof newOrg.address === "string" ? newOrg.address : "",
										country: "", // Address field may not contain country
										website: newOrg.website || "",
										businessHours: newOrg.businessHours || "",
									});
								} else {
									// Error likely handled and toasted within OrganizationsAPI.create
									console.error("OrganizationsAPI.create returned null");
									// Optionally, add a generic error toast here if needed
									// toast.error("Failed to create organization. Please try again.");
								}
							} catch (error: unknown) {
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
		<>
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">Business Profile</h1>
				<p className="mt-2 text-muted-foreground">
					Manage your business information
				</p>
			</div>
			<AppContent>
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
								To manage your subscription and billing details, please visit
								the{" "}
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
			</AppContent>
		</>
	);
}
