import { useState } from "react";
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
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormSection } from "@/components/ui/form-section";
import { Switch } from "@/components/ui/switch";
import { FormDescription } from "@/components/ui/form";

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
			<div>
				<h3>Security</h3>
				<p>Update your password and manage your account</p>
			</div>
			<Form {...passwordForm}>
				<form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
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

			<Separator />

			<div>
				<h3>Danger Zone</h3>
				<p>Permanent account actions</p>

				<div>
					<Button
						variant="destructive"
						onClick={() => handleAccountAction("delete")}>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Account
					</Button>
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
			<Form {...profileForm}>
				<form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
					<FormSection title="Profile Picture">
						<Card>
							<CardContent className="flex items-start gap-6 pt-6">
								<Avatar>
									<AvatarImage
										src={
											profilePicturePreview || user?.user_metadata?.avatar_url
										}
										className={cn(isAvatarRemoved && "hidden")}
									/>
									<AvatarFallback>{getInitials()}</AvatarFallback>
								</Avatar>

								<div>
									<label htmlFor="profile-picture-upload">
										<Button asChild>
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

									{(user?.user_metadata?.avatar_url || profilePicturePreview) &&
										!isAvatarRemoved && (
											<Button
												type="button"
												variant="outline"
												onClick={handleRemoveProfilePicture}>
												<Trash2 className="mr-2 h-4 w-4" />
												Remove Picture
											</Button>
										)}

									<p className="text-muted-foreground text-sm mt-2">
										Recommended: Square image, at least 200x200px.
									</p>
								</div>
							</CardContent>
						</Card>
					</FormSection>

					<FormSection title="Personal Details">
						<div>
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
					</FormSection>

					<div>
						<Button
							type="button"
							variant="outline"
							onClick={() => signOut()}>
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</Button>

						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</Form>
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
			<div>
				<h3>Notification Preferences</h3>
				<p>Manage how and when you receive notifications</p>
			</div>

			<Form {...preferencesForm}>
				<form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}>
					<FormSection title="Notification Channels">
						<FormField
							control={preferencesForm.control}
							name="emailNotifications"
							render={({ field }) => (
								<FormItem>
									<div>
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
								<FormItem>
									<div>
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
								<FormItem>
									<div>
										<FormLabel>Push Notifications</FormLabel>
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
					</FormSection>

					<FormSection title="Notification Types">
						<FormField
							control={preferencesForm.control}
							name="scheduleUpdates"
							render={({ field }) => (
								<FormItem>
									<div>
										<FormLabel>Schedule Updates</FormLabel>
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
								<FormItem>
									<div>
										<FormLabel>Shift Reminders</FormLabel>
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
								<FormItem>
									<div>
										<FormLabel>System Announcements</FormLabel>
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
								<FormItem>
									<div>
										<FormLabel>Request Updates</FormLabel>
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
								<FormItem>
									<div>
										<FormLabel>New Schedule Published</FormLabel>
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
					</FormSection>

					<Button
						type="submit"
						disabled={isLoading}>
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
		</TabsContent>
	);
}

export default function ProfilePage() {
	return (
		<PageLayout>
			<Tabs defaultValue="profile">
				<TabsList>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="preferences">Preferences</TabsTrigger>
					<TabsTrigger value="security">Security</TabsTrigger>
				</TabsList>
				<ProfileTab />
				<PreferencesTab />
				<SecurityTab />
			</Tabs>
		</PageLayout>
	);
}
