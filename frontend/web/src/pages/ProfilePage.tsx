import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Trash2, Loader2, LogOut, Upload } from "lucide-react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AppContent } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormSection } from "@/components/ui/form-section";
import { Switch } from "@/components/ui/switch";
import { FormDescription } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useHeader } from "@/lib/header-context";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmployeeCard } from "@/components/EmployeeCard";
import { Employee } from "@/api";

// Get the Supabase URL from environment or use a fallback
const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";

/*
TROUBLESHOOTING SUPABASE STORAGE PERMISSIONS:

If you're getting "row-level security policy" errors when uploading files:

1. Go to Supabase Dashboard → Storage → avatars bucket → Policies
2. Check the INSERT policy:
   - Make sure it has auth.role() = 'authenticated' without other conditions
   - Remove any folder path conditions or bucket restrictions

For the simplest INSERT policy, use:
CREATE POLICY "Allow authenticated users to upload files" 
ON storage.objects FOR INSERT 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

Alternative policy that allows any authenticated user to upload to any path:
CREATE POLICY "Allow authenticated users to upload any file" 
ON storage.objects FOR INSERT 
TO authenticated 
USING (auth.role() = 'authenticated');
*/

// Define form schema for validation
const profileSchema = z.object({
	firstName: z.string().min(2, "First name is required"),
	lastName: z.string().min(2, "Last name is required"),
	email: z.string().email("Invalid email address"),
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || isValidPhoneNumber(val),
			"Please enter a valid phone number"
		),
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
	country: z.string().optional(),
	website: z.string().url("Invalid URL").optional(),
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

// Look for the exact name of your bucket in Supabase storage
// Replace "avatars" with the exact bucket name
const BUCKET_NAME = "avatars"; // Make sure this matches the bucket name in Supabase

// Security tab component
function SecurityTab() {
	const { signOut, user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const passwordForm = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onPasswordSubmit = async (values: PasswordFormValues) => {
		setIsLoading(true);
		try {
			// Update user password in Supabase
			const { error } = await supabase.auth.updateUser({
				password: values.newPassword,
			});

			if (error) throw new Error(error.message);

			toast.success("Password updated successfully");
			passwordForm.reset();
		} catch (error) {
			console.error("Error updating password:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to update password: " + errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const isAdmin = user?.user_metadata?.role === "admin";

	const handleAccountAction = async (action: string) => {
		if (action === "delete") {
			if (
				window.confirm(
					"Are you sure you want to delete your account? This action cannot be undone."
				)
			) {
				try {
					// Delete user account logic here
					const { error } = await supabase.auth.admin.deleteUser(
						user?.id as string
					);
					if (error) throw error;
					await signOut();
					toast.success("Account deleted successfully");
				} catch (error) {
					console.error("Error deleting account:", error);
					toast.error("Failed to delete account");
				}
			}
		}
	};

	return (
		<TabsContent value="security">
			<div className="space-y-6">
				<div className="mb-6">
					<h3 className="text-lg font-medium">Security</h3>
					<p className="text-sm text-muted-foreground">
						Update your password and manage your account
					</p>
				</div>
				<Form {...passwordForm}>
					<form
						onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
						className="space-y-4">
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

						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Password"
							)}
						</Button>
					</form>
				</Form>

				<Separator className="my-6" />

				<div className="space-y-2">
					<h3 className="text-lg font-medium">Danger Zone</h3>
					<p className="text-sm text-muted-foreground">
						Permanent account actions
					</p>

					<div className="mt-4">
						<Button
							variant="destructive"
							className="w-full justify-start"
							onClick={() => handleAccountAction("delete")}>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Account
						</Button>
					</div>
				</div>
			</div>
		</TabsContent>
	);
}

// Profile tab component
function ProfileTab() {
	const { user, signOut, updateUserMetadata } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	// Create an employee object from the user data for EmployeeCard
	const employeeData: Employee = {
		id: user?.id || "",
		organizationId: user?.user_metadata?.organization_id || "",
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`.trim(),
		email: user?.email || "",
		role: user?.user_metadata?.role || "employee",
		phone: user?.user_metadata?.phone || "",
		status: "active",
		address: user?.user_metadata?.address || "",
		hireDate: user?.user_metadata?.hireDate || "",
		hourlyRate: user?.user_metadata?.hourlyRate || 20,
		isOnline: false,
		lastActive: new Date().toISOString(),
	};

	const profileForm = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: user?.user_metadata?.firstName || "",
			lastName: user?.user_metadata?.lastName || "",
			email: user?.email || "",
			phone: user?.user_metadata?.phone || "",
		},
	});

	// Get user initials for avatar fallback
	const getInitials = () => {
		const firstName = user?.user_metadata?.firstName || "";
		const lastName = user?.user_metadata?.lastName || "";
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	// Handle profile picture upload
	const handleProfilePictureChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		const reader = new FileReader();

		reader.onload = () => {
			const result = reader.result as string;
			setProfileImage(result);
		};
		reader.readAsDataURL(file);
	};

	// Handle removing profile picture
	const handleRemoveProfilePicture = async () => {
		setProfileImage(null);

		if (user?.user_metadata?.avatar_url) {
			try {
				// Extract the file name from the URL
				const avatarUrl = user.user_metadata.avatar_url;
				const splitUrl = avatarUrl.split("/");
				const fileName = splitUrl[splitUrl.length - 1];

				if (fileName) {
					// First update the user metadata to remove the avatar_url
					const updatedMetadata = { ...user.user_metadata };
					delete updatedMetadata.avatar_url;

					const { error: updateError } = await updateUserMetadata(
						updatedMetadata
					);

					if (updateError) {
						throw new Error(updateError.message);
					}

					// Then delete the file from storage
					const { error } = await supabase.storage
						.from(BUCKET_NAME)
						.remove([fileName]);

					if (error) {
						throw new Error(error.message);
					}

					toast.success("Profile picture removed");
				}
			} catch (error) {
				console.error("Error removing profile picture:", error);
				toast.error("Failed to remove profile picture");
			}
		}
	};

	// Get profile image URL if available
	useEffect(() => {
		if (user?.user_metadata?.avatar_url) {
			setProfileImage(user.user_metadata.avatar_url);
		}
	}, [user]);

	// Handle form submission
	const onProfileSubmit = async (values: ProfileFormValues) => {
		setIsLoading(true);
		try {
			// Prepare the metadata to update
			const updatedMetadata: Record<string, any> = {
				...user?.user_metadata,
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
			};

			// Handle profile picture if changed
			let avatarUrl;
			if (profileImage && !user?.user_metadata?.avatar_url) {
				// Upload the image to Supabase storage
				const userId = user?.id;
				if (!userId) throw new Error("User ID is required");

				try {
					// Convert image to blob
					const base64Response = await fetch(profileImage);
					const blob = await base64Response.blob();

					// Create a unique filename
					const fileExt = blob.type.split("/")[1];
					const fileName = `${userId}-${Date.now()}.${fileExt}`;

					// Upload to Supabase Storage
					const { error: uploadError, data: uploadData } =
						await supabase.storage.from(BUCKET_NAME).upload(fileName, blob, {
							upsert: true,
						});

					if (uploadError) throw new Error(uploadError.message);

					// Get public URL for the file
					const { data: publicUrlData } = supabase.storage
						.from(BUCKET_NAME)
						.getPublicUrl(fileName);

					avatarUrl = publicUrlData.publicUrl;
				} catch (error) {
					console.error("Error uploading avatar:", error);
					// Continue with the rest of the update even if avatar upload fails
					toast.error(
						"Failed to upload avatar, but continuing with profile update"
					);
					avatarUrl = user?.user_metadata?.avatar_url;
				}
			} else if (profileImage === null) {
				// If user clicked remove picture
				avatarUrl = undefined; // This will remove the avatar URL
			}

			// Add avatar URL to metadata if we have one
			if (avatarUrl) {
				updatedMetadata.avatar_url = avatarUrl;
			} else if (profileImage === null) {
				// If explicitly removed
				delete updatedMetadata.avatar_url;
			}

			const { error } = await updateUserMetadata(updatedMetadata);

			if (error) {
				throw new Error(error.message);
			}

			// Also update email if it changed
			if (values.email !== user?.email) {
				const { error: emailError } = await supabase.auth.updateUser({
					email: values.email,
				});

				if (emailError) throw new Error(emailError.message);
			}

			toast.success("Profile updated successfully");

			// If changing email, show confirmation message
			if (values.email !== user?.email) {
				toast.info(
					"Email verification sent. Please check your inbox to confirm your new email."
				);
			} else {
				// Add page refresh if avatar was updated
				if (profileImage) {
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				}
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to update profile: " + errorMessage);
		} finally {
			setIsLoading(false);
			// Don't reset profileImage here to prevent UI flicker
		}
	};

	return (
		<TabsContent
			value="profile"
			className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Profile Card */}
				<div>
					<EmployeeCard
						employee={employeeData}
						variant="profile"
						className="shadow-sm"
					/>
				</div>

				{/* Edit Form */}
				<Card>
					<CardContent className="pt-6">
						<h3 className="text-lg font-medium mb-4">Edit Profile</h3>
						<Form {...profileForm}>
							<form
								onSubmit={profileForm.handleSubmit(onProfileSubmit)}
								className="space-y-4">
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

								<FormField
									control={profileForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
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
												<FormPhoneInput
													control={profileForm.control}
													name="phone"
													placeholder="Enter your phone number"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Updating...
										</>
									) : (
										"Update Profile"
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="pt-6">
					<FormSection
						title="Profile Picture"
						description="Upload a profile picture for your account">
						<div className="flex items-start gap-4">
							<Avatar className="h-24 w-24">
								{profileImage ? (
									<AvatarImage
										src={profileImage}
										alt={`${user?.user_metadata?.firstName} ${user?.user_metadata?.lastName}`}
									/>
								) : (
									<AvatarFallback className="text-2xl">
										{getInitials()}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex-1 space-y-2">
								<div className="flex flex-col gap-2 sm:flex-row">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="relative">
										<input
											type="file"
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
											onChange={handleProfilePictureChange}
											accept="image/*"
										/>
										<Upload className="mr-2 h-4 w-4" />
										Upload New Image
									</Button>
									{profileImage && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleRemoveProfilePicture}>
											<Trash2 className="mr-2 h-4 w-4" />
											Remove
										</Button>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									Recommended: Square JPG, PNG, or GIF, at least 500x500 pixels.
								</p>

								<div className="mt-4">
									<ConfirmDialog
										title="Log Out"
										description="Are you sure you want to log out? You'll need to sign in again to access your account."
										confirmLabel="Log Out"
										cancelLabel="Cancel"
										destructive={true}
										onConfirm={() => signOut()}
										trigger={
											<Button
												type="button"
												variant="destructive"
												size="sm">
												<LogOut className="mr-2 h-4 w-4" />
												Log out
											</Button>
										}
									/>
								</div>
							</div>
						</div>
					</FormSection>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// Preferences tab component
function PreferencesTab() {
	const { user, updateUserMetadata } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	// Initialize form with user preferences
	const preferencesForm = useForm<PreferencesFormValues>({
		resolver: zodResolver(preferencesSchema),
		defaultValues: {
			emailNotifications:
				user?.user_metadata?.preferences?.emailNotifications ?? true,
			smsNotifications:
				user?.user_metadata?.preferences?.smsNotifications ?? false,
			pushNotifications:
				user?.user_metadata?.preferences?.pushNotifications ?? false,
			scheduleUpdates:
				user?.user_metadata?.preferences?.scheduleUpdates ?? true,
			shiftReminders: user?.user_metadata?.preferences?.shiftReminders ?? true,
			systemAnnouncements:
				user?.user_metadata?.preferences?.systemAnnouncements ?? true,
			requestUpdates: user?.user_metadata?.preferences?.requestUpdates ?? true,
			newSchedulePublished:
				user?.user_metadata?.preferences?.newSchedulePublished ?? true,
		},
	});

	const onPreferencesSubmit = async (values: PreferencesFormValues) => {
		setIsLoading(true);
		try {
			// Update user preferences in metadata
			const updatedMetadata = {
				...user?.user_metadata,
				preferences: values,
			};

			const { error } = await updateUserMetadata(updatedMetadata);

			if (error) throw new Error(error.message);

			toast.success("Preferences updated successfully");
		} catch (error) {
			console.error("Error updating preferences:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to update preferences: " + errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<TabsContent value="preferences">
			<div className="space-y-6">
				<div className="mb-6">
					<h3 className="text-lg font-medium">Notification Preferences</h3>
					<p className="text-sm text-muted-foreground">
						Manage how and when you receive notifications
					</p>
				</div>

				<Form {...preferencesForm}>
					<form
						onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
						className="space-y-8">
						<FormSection title="Notification Channels">
							<div className="space-y-4">
								<FormField
									control={preferencesForm.control}
									name="emailNotifications"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Email Notifications
												</FormLabel>
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													SMS Notifications
												</FormLabel>
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Push Notifications
												</FormLabel>
												<FormDescription>
													Receive push notifications in your browser
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Schedule Updates
												</FormLabel>
												<FormDescription>
													Notify me when my schedule is updated
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Shift Reminders
												</FormLabel>
												<FormDescription>
													Notify me before my scheduled shifts
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													System Announcements
												</FormLabel>
												<FormDescription>
													Receive important system announcements
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Request Updates
												</FormLabel>
												<FormDescription>
													Notify me when my time-off requests are updated
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
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													New Schedule Published
												</FormLabel>
												<FormDescription>
													Notify me when a new schedule is published
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

						<Button
							type="submit"
							disabled={isLoading}
							className="ml-auto">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Preferences"
							)}
						</Button>
					</form>
				</Form>
			</div>
		</TabsContent>
	);
}

function AppearanceTab() {
	return (
		<TabsContent value="appearance">
			<div className="space-y-6">
				<div className="mb-6">
					<h3 className="text-lg font-medium">Appearance</h3>
					<p className="text-sm text-muted-foreground">
						Customize the app's appearance and theme settings
					</p>
				</div>

				<Card>
					<CardContent className="pt-6">
						<ThemeToggle />
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
}

export default function ProfilePage() {
	const { updateHeader } = useHeader();

	// Set page header
	useEffect(() => {
		updateHeader({
			title: "Profile Settings",
			description: "Manage your account settings and preferences",
		});
	}, [updateHeader]);

	return (
		<AppContent>
			<div className="w-full py-6">
				<Tabs
					defaultValue="profile"
					className="w-full">
					<TabsList className="w-full">
						<TabsTrigger
							value="profile"
							className="flex-1">
							Profile
						</TabsTrigger>
						<TabsTrigger
							value="preferences"
							className="flex-1">
							Preferences
						</TabsTrigger>
						<TabsTrigger
							value="appearance"
							className="flex-1">
							Appearance
						</TabsTrigger>
						<TabsTrigger
							value="security"
							className="flex-1">
							Security
						</TabsTrigger>
					</TabsList>
					<ProfileTab />
					<PreferencesTab />
					<AppearanceTab />
					<SecurityTab />
				</Tabs>
			</div>
		</AppContent>
	);
}
