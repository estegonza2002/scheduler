import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import {
	ChevronLeft,
	RotateCcw,
	User,
	Globe,
	MapPin,
	Phone,
	Clock,
	Building2,
	Upload,
	Trash2,
	Palette,
	Image,
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";
import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";
import { ProfileSidebar } from "../components/layout/SecondaryNavbar";
import { OrganizationsAPI, type Organization } from "../api";

// Define form schema for validation
const profileSchema = z.object({
	firstName: z.string().min(2, "First name is required"),
	lastName: z.string().min(2, "Last name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	position: z.string().optional(),
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

// Define preferences schema
const preferencesSchema = z.object({
	emailNotifications: z.boolean().default(true),
	smsNotifications: z.boolean().default(false),
	pushNotifications: z.boolean().default(false),
	scheduleUpdates: z.boolean().default(true),
	shiftReminders: z.boolean().default(true),
	systemAnnouncements: z.boolean().default(true),
	requestUpdates: z.boolean().default(true),
	newSchedulePublished: z.boolean().default(true),
});

// Define business profile schema
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

// Define branding schema
const brandingSchema = z.object({
	primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	fontFamily: z.string().min(1, "Please select a font family"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;
type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;
type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function ProfilePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const tabParam = searchParams.get("tab") || "profile";

	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState(tabParam);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [faviconFile, setFaviconFile] = useState<File | null>(null);
	const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

	// Initialize form with user data from auth context
	const profileForm = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: user?.user_metadata?.firstName || "",
			lastName: user?.user_metadata?.lastName || "",
			email: user?.email || "",
			phone: user?.user_metadata?.phone || "",
			position: user?.user_metadata?.position || "",
		},
	});

	const passwordForm = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const preferencesForm = useForm<PreferencesFormValues>({
		resolver: zodResolver(preferencesSchema),
		defaultValues: {
			emailNotifications: true,
			smsNotifications: false,
			pushNotifications: false,
			scheduleUpdates: true,
			shiftReminders: true,
			systemAnnouncements: true,
			requestUpdates: true,
			newSchedulePublished: true,
		},
	});

	const businessProfileForm = useForm<BusinessProfileFormValues>({
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

	const brandingForm = useForm<BrandingFormValues>({
		resolver: zodResolver(brandingSchema),
		defaultValues: {
			primaryColor: "#2563eb",
			secondaryColor: "#1e40af",
			accentColor: "#ef4444",
			fontFamily: "Inter",
		},
	});

	async function onProfileSubmit(values: ProfileFormValues) {
		setIsLoading(true);
		try {
			// In a real implementation, this would update the user profile in the database
			// For now, we'll just show a success toast
			toast.success("Profile updated successfully");
			console.log("Profile update values:", values);
		} catch (error: any) {
			toast.error("Failed to update profile: " + error.message);
		} finally {
			setIsLoading(false);
		}
	}

	async function onPasswordSubmit(values: PasswordFormValues) {
		setIsLoading(true);
		try {
			// In a real implementation, this would update the user's password
			// For now, we'll just show a success toast
			toast.success("Password updated successfully");
			passwordForm.reset({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error: any) {
			toast.error("Failed to update password: " + error.message);
		} finally {
			setIsLoading(false);
		}
	}

	async function onPreferencesSubmit(values: PreferencesFormValues) {
		setIsLoading(true);
		try {
			// In a real implementation, this would update the user preferences in the database
			toast.success("Preferences updated successfully");
			console.log("Preferences update values:", values);
		} catch (error: any) {
			toast.error("Failed to update preferences: " + error.message);
		} finally {
			setIsLoading(false);
		}
	}

	// Fetch organization data when business-profile tab is active
	useEffect(() => {
		if (activeTab === "business-profile") {
			const fetchOrganization = async () => {
				try {
					setIsLoading(true);
					const orgs = await OrganizationsAPI.getAll();
					if (orgs.length > 0) {
						setOrganization(orgs[0]);
						businessProfileForm.reset({
							name: orgs[0].name || "",
							description: orgs[0].description || "",
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
				} finally {
					setIsLoading(false);
				}
			};

			fetchOrganization();
		}
	}, [activeTab, businessProfileForm]);

	async function onBusinessProfileSubmit(values: BusinessProfileFormValues) {
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

	// Get user initials for avatar fallback
	const getInitials = () => {
		const firstName = user?.user_metadata?.firstName || "";
		const lastName = user?.user_metadata?.lastName || "";
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

	const fullName =
		`${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`.trim() || "Your Profile";

	const handleTabChange = (tab: string) => {
		if (
			tab === "subscription" ||
			tab === "payment-methods" ||
			tab === "billing-history"
		) {
			// Navigate to the billing page with the appropriate tab
			navigate(`/billing?tab=${tab}`);
			return;
		}
		if (tab === "branding") {
			// Navigate to the branding page when branding tab is clicked
			navigate("/branding");
			return;
		}
		setActiveTab(tab);
		setSearchParams({ tab });
	};

	const renderSidebar = () => {
		return (
			<ProfileSidebar
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		);
	};

	useEffect(() => {
		// Update active tab when URL param changes
		setActiveTab(tabParam);
	}, [tabParam]);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setFaviconFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setFaviconPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
	};

	const handleRemoveFavicon = () => {
		setFaviconFile(null);
		setFaviconPreview(null);
	};

	async function onBrandingSubmit(values: BrandingFormValues) {
		setIsLoading(true);
		try {
			// In a real implementation, this would update the branding in the database
			// and upload the logo and favicon files to a storage service
			console.log("Branding update values:", values);
			console.log("Logo file:", logoFile);
			console.log("Favicon file:", faviconFile);
			toast.success("Branding updated successfully");
		} catch (error: any) {
			toast.error("Failed to update branding: " + error.message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{renderSidebar()}
			<div className="ml-64">
				<div className="p-4">
					<div className="flex items-center mb-8">
						<Avatar className="h-16 w-16 mr-4">
							<AvatarImage src={user?.user_metadata?.avatar_url} />
							<AvatarFallback>{getInitials() || "U"}</AvatarFallback>
						</Avatar>
					</div>

					{/* Profile Tab Content */}
					{activeTab === "profile" && (
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold">Profile Information</h2>
								<p className="text-muted-foreground">
									Update your personal information and contact details
								</p>
							</div>

							<Form {...profileForm}>
								<form
									onSubmit={profileForm.handleSubmit(onProfileSubmit)}
									className="space-y-6">
									<FormSection title="Personal Details">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={profileForm.control}
												name="firstName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>First Name</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your first name"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={profileForm.control}
												name="lastName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Last Name</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your last name"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<FormSection title="Contact Information">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={profileForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email Address</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your email"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={profileForm.control}
												name="phone"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Phone Number</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your phone number"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<FormSection title="Work Information">
										<FormField
											control={profileForm.control}
											name="position"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Position / Role</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter your position"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormSection>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={isLoading}>
											{isLoading ? "Saving..." : "Save Changes"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}

					{/* Password Tab Content */}
					{activeTab === "password" && (
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold">Change Password</h2>
								<p className="text-muted-foreground">
									Update your password to keep your account secure
								</p>
							</div>

							<Form {...passwordForm}>
								<form
									onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
									className="space-y-6">
									<FormSection title="Password Update">
										<div className="space-y-4">
											<FormField
												control={passwordForm.control}
												name="currentPassword"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Current Password</FormLabel>
														<FormControl>
															<Input
																type="password"
																placeholder="Enter your current password"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={passwordForm.control}
												name="newPassword"
												render={({ field }) => (
													<FormItem>
														<FormLabel>New Password</FormLabel>
														<FormControl>
															<Input
																type="password"
																placeholder="Enter your new password"
																{...field}
															/>
														</FormControl>
														<FormDescription>
															Password must be at least 8 characters long
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={passwordForm.control}
												name="confirmPassword"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Confirm New Password</FormLabel>
														<FormControl>
															<Input
																type="password"
																placeholder="Confirm your new password"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={isLoading}>
											{isLoading ? "Updating..." : "Update Password"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}

					{/* Notifications Tab Content */}
					{activeTab === "notifications" && (
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold">Notification Preferences</h2>
								<p className="text-muted-foreground">
									Choose how and when you would like to be notified
								</p>
							</div>

							<Form {...preferencesForm}>
								<form
									onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
									className="space-y-6">
									<FormSection title="Notification Methods">
										<div className="space-y-4">
											<FormField
												control={preferencesForm.control}
												name="emailNotifications"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>Email Notifications</FormLabel>
															<FormDescription>
																Receive notifications via email
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="smsNotifications"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>SMS Notifications</FormLabel>
															<FormDescription>
																Receive notifications via text message
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="pushNotifications"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>Push Notifications</FormLabel>
															<FormDescription>
																Receive notifications via mobile app
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<FormSection title="Notification Types">
										<div className="space-y-4">
											<FormField
												control={preferencesForm.control}
												name="scheduleUpdates"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>Schedule Updates</FormLabel>
															<FormDescription>
																Be notified when your schedule changes
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="shiftReminders"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>Shift Reminders</FormLabel>
															<FormDescription>
																Get reminded before your shifts start
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="systemAnnouncements"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>System Announcements</FormLabel>
															<FormDescription>
																Receive important system-wide announcements
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="requestUpdates"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>Request Updates</FormLabel>
															<FormDescription>
																Be notified when your requests are processed
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={preferencesForm.control}
												name="newSchedulePublished"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
														<div className="space-y-0.5">
															<FormLabel>New Schedule Published</FormLabel>
															<FormDescription>
																Be notified when a new schedule is published
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={isLoading}>
											{isLoading ? "Saving..." : "Save Preferences"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}

					{/* Business Profile Tab Content */}
					{activeTab === "business-profile" && (
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold">Business Profile</h2>
								<p className="text-muted-foreground">
									Manage your business information and settings
								</p>
							</div>

							<Form {...businessProfileForm}>
								<form
									onSubmit={businessProfileForm.handleSubmit(
										onBusinessProfileSubmit
									)}
									className="space-y-6">
									<FormSection
										title="Business Information"
										description="Basic information about your business">
										<div className="flex items-center gap-4 mb-6">
											<Avatar className="h-16 w-16">
												<AvatarFallback className="text-lg">
													{getBusinessInitials()}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="text-lg font-medium">
													{organization?.name || "Your Business"}
												</h3>
												<p className="text-sm text-muted-foreground">
													{organization?.description ||
														"No description provided"}
												</p>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={businessProfileForm.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Business Name</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter your business name"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={businessProfileForm.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Business Description</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Enter a brief description of your business"
															className="min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormSection>

									<FormSection
										title="Contact Information"
										description="How customers and employees can reach your business">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={businessProfileForm.control}
												name="contactEmail"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Business Email</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter business email"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="contactPhone"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Business Phone</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter business phone"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="website"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Website</FormLabel>
														<FormControl>
															<Input
																placeholder="https://yourbusiness.com"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="businessHours"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Business Hours</FormLabel>
														<FormControl>
															<Input
																placeholder="Mon-Fri: 9am-5pm"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<FormSection
										title="Business Address"
										description="Physical location of your business">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={businessProfileForm.control}
												name="address"
												render={({ field }) => (
													<FormItem className="col-span-2">
														<FormLabel>Street Address</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter street address"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="city"
												render={({ field }) => (
													<FormItem>
														<FormLabel>City</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter city"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="state"
												render={({ field }) => (
													<FormItem>
														<FormLabel>State/Province</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter state/province"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="zipCode"
												render={({ field }) => (
													<FormItem>
														<FormLabel>ZIP/Postal Code</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter ZIP/postal code"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={businessProfileForm.control}
												name="country"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Country</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter country"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={isLoading}>
											{isLoading ? "Saving..." : "Save Business Profile"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}

					{/* Branding Tab Content */}
					{activeTab === "branding" && (
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold">Brand Settings</h2>
								<p className="text-muted-foreground">
									Customize your brand appearance and assets
								</p>
							</div>

							<Form {...brandingForm}>
								<form
									onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}
									className="space-y-6">
									<FormSection
										title="Logo & Favicon"
										description="Upload your organization's logo and favicon">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											<div>
												<Label htmlFor="logo-upload">Company Logo</Label>
												<div className="mt-2 flex flex-col gap-4">
													<div className="flex items-center justify-center w-full h-40 rounded-md border-2 border-dashed border-muted-foreground/25 p-4 bg-muted/10">
														{logoPreview ? (
															<div className="relative w-full h-full flex items-center justify-center">
																<img
																	src={logoPreview}
																	alt="Logo preview"
																	className="max-h-32 max-w-full object-contain"
																/>
																<Button
																	type="button"
																	variant="destructive"
																	size="icon"
																	className="absolute -top-2 -right-2 h-8 w-8"
																	onClick={handleRemoveLogo}>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														) : (
															<div className="text-center">
																<Image className="mx-auto h-12 w-12 text-muted-foreground" />
																<p className="mt-2 text-sm text-muted-foreground">
																	Upload your company logo (PNG, JPG, SVG)
																</p>
																<div className="mt-4">
																	<label
																		htmlFor="logo-upload"
																		className="cursor-pointer inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
																		<Upload className="mr-2 h-4 w-4" />
																		Choose File
																		<input
																			id="logo-upload"
																			name="logo"
																			type="file"
																			className="sr-only"
																			accept="image/*"
																			onChange={handleLogoChange}
																		/>
																	</label>
																</div>
															</div>
														)}
													</div>
													<p className="text-xs text-muted-foreground">
														Recommended size: 512x512px. Max file size: 2MB.
													</p>
												</div>
											</div>

											<div>
												<Label htmlFor="favicon-upload">Favicon</Label>
												<div className="mt-2 flex flex-col gap-4">
													<div className="flex items-center justify-center w-full h-40 rounded-md border-2 border-dashed border-muted-foreground/25 p-4 bg-muted/10">
														{faviconPreview ? (
															<div className="relative w-full h-full flex items-center justify-center">
																<img
																	src={faviconPreview}
																	alt="Favicon preview"
																	className="max-h-16 max-w-full object-contain"
																/>
																<Button
																	type="button"
																	variant="destructive"
																	size="icon"
																	className="absolute -top-2 -right-2 h-8 w-8"
																	onClick={handleRemoveFavicon}>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														) : (
															<div className="text-center">
																<Image className="mx-auto h-12 w-12 text-muted-foreground" />
																<p className="mt-2 text-sm text-muted-foreground">
																	Upload your favicon (ICO, PNG)
																</p>
																<div className="mt-4">
																	<label
																		htmlFor="favicon-upload"
																		className="cursor-pointer inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
																		<Upload className="mr-2 h-4 w-4" />
																		Choose File
																		<input
																			id="favicon-upload"
																			name="favicon"
																			type="file"
																			className="sr-only"
																			accept="image/x-icon,image/png"
																			onChange={handleFaviconChange}
																		/>
																	</label>
																</div>
															</div>
														)}
													</div>
													<p className="text-xs text-muted-foreground">
														Recommended size: 32x32px. Max file size: 1MB.
													</p>
												</div>
											</div>
										</div>
									</FormSection>

									<FormSection
										title="Brand Colors"
										description="Define your brand's color palette">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
											<FormField
												control={brandingForm.control}
												name="primaryColor"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Primary Color</FormLabel>
														<div className="flex gap-2 items-center">
															<div
																className="w-10 h-10 rounded-md border"
																style={{ backgroundColor: field.value }}
															/>
															<FormControl>
																<Input
																	{...field}
																	placeholder="#2563eb"
																/>
															</FormControl>
														</div>
														<FormDescription>
															Main color used for primary UI elements
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={brandingForm.control}
												name="secondaryColor"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Secondary Color</FormLabel>
														<div className="flex gap-2 items-center">
															<div
																className="w-10 h-10 rounded-md border"
																style={{ backgroundColor: field.value }}
															/>
															<FormControl>
																<Input
																	{...field}
																	placeholder="#1e40af"
																/>
															</FormControl>
														</div>
														<FormDescription>
															Used for secondary UI elements
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={brandingForm.control}
												name="accentColor"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Accent Color</FormLabel>
														<div className="flex gap-2 items-center">
															<div
																className="w-10 h-10 rounded-md border"
																style={{ backgroundColor: field.value }}
															/>
															<FormControl>
																<Input
																	{...field}
																	placeholder="#ef4444"
																/>
															</FormControl>
														</div>
														<FormDescription>
															Used for highlighting important elements
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormSection>

									<FormSection
										title="Typography"
										description="Choose fonts for your application">
										<FormField
											control={brandingForm.control}
											name="fontFamily"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Font Family</FormLabel>
													<FormControl>
														<select
															{...field}
															className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
															<option value="Inter">Inter</option>
															<option value="Roboto">Roboto</option>
															<option value="Open Sans">Open Sans</option>
															<option value="Lato">Lato</option>
															<option value="Montserrat">Montserrat</option>
															<option value="Source Sans Pro">
																Source Sans Pro
															</option>
														</select>
													</FormControl>
													<FormDescription>
														The main font used throughout your application
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormSection>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={isLoading}>
											{isLoading ? "Saving..." : "Save Brand Settings"}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
