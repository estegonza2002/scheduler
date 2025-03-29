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
	const [profilePicturePreview, setProfilePicturePreview] = useState<
		string | null
	>(null);
	const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

	// Initialize form with user data from auth context
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
		if (!user?.user_metadata?.firstName || !user?.user_metadata?.lastName)
			return "U";
		return `${user.user_metadata.firstName.charAt(
			0
		)}${user.user_metadata.lastName.charAt(0)}`;
	};

	// Handle profile picture upload
	const handleProfilePictureChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				setProfilePicturePreview(result);
				setIsAvatarRemoved(false);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle removing profile picture
	const handleRemoveProfilePicture = async () => {
		// Immediately update UI state
		setProfilePicturePreview(null);
		setIsAvatarRemoved(true);

		if (user?.user_metadata?.avatar_url) {
			try {
				// Extract the file name from the URL
				const fileUrl = user.user_metadata.avatar_url;
				const fileName = fileUrl.split("/").pop();

				if (fileName) {
					// Create a local copy of metadata without avatar_url
					const updatedMetadata = { ...user.user_metadata };
					delete updatedMetadata.avatar_url;

					// First update the user metadata to remove the avatar_url
					const { error: updateError } = await updateUserMetadata(
						updatedMetadata
					);

					if (updateError) {
						throw new Error(updateError.message);
					}

					// Then try to remove the file from storage
					const { error: deleteError } = await supabase.storage
						.from(BUCKET_NAME)
						.remove([fileName]);

					if (deleteError) {
						console.error("Error deleting avatar file:", deleteError);
						// We don't throw here because updating the metadata is more important
					}

					toast.success("Profile picture removed successfully");

					// Refresh the page after a short delay to ensure UI updates
					setTimeout(() => {
						window.location.reload();
					}, 1500);
				}
			} catch (error) {
				console.error("Error removing profile picture:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				toast.error(`Failed to remove profile picture: ${errorMessage}`);
			}
		}
	};

	// Handle form submission
	const onProfileSubmit = async (values: ProfileFormValues) => {
		setIsLoading(true);
		try {
			// Update user metadata in Supabase
			let avatarUrl = user?.user_metadata?.avatar_url;
			let avatarUploadFailed = false;

			// Handle profile picture if changed
			if (profilePicturePreview) {
				// Upload the image to Supabase storage
				const userId = user?.id;
				if (!userId) throw new Error("User ID not found");

				try {
					// Convert image to blob
					const base64Response = await fetch(profilePicturePreview);
					const blob = await base64Response.blob();

					// Create a unique file name
					const fileExt = blob.type.split("/")[1];
					const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;

					// Upload to existing Supabase Storage bucket
					const { data: storageData, error: storageError } =
						await supabase.storage.from(BUCKET_NAME).upload(fileName, blob, {
							cacheControl: "3600",
							upsert: true,
						});

					if (storageError) {
						throw storageError;
					}

					// Get the public URL
					const { data: publicUrlData } = supabase.storage
						.from(BUCKET_NAME)
						.getPublicUrl(fileName);

					avatarUrl = publicUrlData.publicUrl;

					// Ensure the avatarUrl is properly formatted
					if (avatarUrl && !avatarUrl.startsWith("http")) {
						avatarUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
					}
				} catch (error) {
					// Instead of throwing the error, set a flag and continue
					avatarUploadFailed = true;

					// Show error but don't abort the whole operation
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					toast.error(
						`Avatar upload failed: ${errorMessage}. Your profile will be updated without the new avatar.`
					);

					// Continue with the previous avatar URL if it exists
					avatarUrl = user?.user_metadata?.avatar_url;
				}
			} else if (profilePicturePreview === null && isAvatarRemoved) {
				// If user clicked remove picture
				avatarUrl = undefined; // This will remove the avatar URL
			}

			// Ensure we're passing all previous metadata values plus our changes
			const updatedMetadata: Record<string, any> = {
				...user?.user_metadata,
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone || "",
			};

			// Set avatar_url explicitly (or remove it)
			if (avatarUrl) {
				updatedMetadata.avatar_url = avatarUrl;
			} else if (profilePicturePreview === null && isAvatarRemoved) {
				// If explicitly removed
				delete updatedMetadata.avatar_url;
			}

			const { error } = await updateUserMetadata(updatedMetadata);

			if (error) {
				throw new Error(error.message);
			}

			if (avatarUploadFailed) {
				toast.success("Profile updated successfully, but avatar upload failed");
			} else {
				toast.success("Profile updated successfully");

				// Add page refresh if avatar was updated
				if (profilePicturePreview) {
					setTimeout(() => {
						window.location.reload();
					}, 1500);
				}
			}
		} catch (error) {
			console.error("Error in profile update:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error("Failed to update profile: " + errorMessage);
		} finally {
			setIsLoading(false);
			setProfilePicturePreview(null); // Reset the preview
		}
	};

	return (
		<TabsContent value="profile">
			<div className="space-y-6">
				<Form {...profileForm}>
					<form
						onSubmit={profileForm.handleSubmit(onProfileSubmit)}
						className="space-y-8">
						<FormSection title="Profile Picture">
							<Card>
								<CardContent className="flex flex-col items-center pt-6 pb-4">
									<Avatar className="h-24 w-24 mb-4">
										<AvatarImage
											src={
												profilePicturePreview || user?.user_metadata?.avatar_url
											}
											className={cn(isAvatarRemoved && "hidden")}
										/>
										<AvatarFallback className="text-xl">
											{getInitials()}
										</AvatarFallback>
									</Avatar>

									<div className="flex gap-2 mb-2">
										<label htmlFor="profile-picture-upload">
											<Button
												variant="secondary"
												size="sm"
												asChild>
												<span>
													<Upload className="mr-2 h-4 w-4" />
													Upload Picture
													<input
														id="profile-picture-upload"
														type="file"
														accept="image/*"
														className="sr-only"
														onChange={handleProfilePictureChange}
													/>
												</span>
											</Button>
										</label>

										{(user?.user_metadata?.avatar_url ||
											profilePicturePreview) &&
											!isAvatarRemoved && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={handleRemoveProfilePicture}>
													<Trash2 className="mr-2 h-4 w-4" />
													Remove Picture
												</Button>
											)}
									</div>

									<p className="text-muted-foreground text-xs">
										Recommended: Square image, at least 200x200px.
									</p>
								</CardContent>
							</Card>
						</FormSection>

						<FormSection title="Personal Details">
							<div className="grid gap-6 sm:grid-cols-2">
								<FormField
									control={profileForm.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												First Name <span className="text-destructive">*</span>
											</FormLabel>
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
											<FormLabel>
												Last Name <span className="text-destructive">*</span>
											</FormLabel>
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

							<div className="mt-4">
								<FormField
									control={profileForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Email <span className="text-destructive">*</span>
											</FormLabel>
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
							</div>

							<div className="mt-4">
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
							</div>
						</FormSection>

						<div className="flex items-center justify-between">
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
										variant="destructive">
										<LogOut className="mr-2 h-4 w-4" />
										Log out
									</Button>
								}
							/>

							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</Form>
			</div>
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
							value="security"
							className="flex-1">
							Security
						</TabsTrigger>
					</TabsList>
					<ProfileTab />
					<PreferencesTab />
					<SecurityTab />
				</Tabs>
			</div>
		</AppContent>
	);
}
