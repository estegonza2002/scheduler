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
import { User, Trash2, Loader2, LogOut, Upload, Edit } from "lucide-react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileModal } from "@/components/EditProfileModal";

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
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Create an employee object from the user data for EmployeeCard
	const employeeData: Employee = {
		id: user?.id || "",
		organizationId: user?.user_metadata?.organization_id || "",
		name: `${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`.trim(),
		email: user?.email || "",
		phone: user?.user_metadata?.phone || "",
		status: "active",
		address: user?.user_metadata?.address || "",
		hireDate: user?.user_metadata?.hireDate || "",
		hourlyRate: user?.user_metadata?.hourlyRate || 20,
		isOnline: false,
		lastActive: new Date().toISOString(),
		position: user?.user_metadata?.position || "Employee",
	};

	return (
		<TabsContent
			value="profile"
			className="space-y-6">
			<Dialog
				open={isModalOpen}
				onOpenChange={setIsModalOpen}>
				<div className="grid grid-cols-1 gap-6">
					<div className="relative">
						<EmployeeCard
							employee={employeeData}
							variant="profile"
							className="shadow-sm"
						/>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="absolute top-4 right-4">
								<Edit className="h-4 w-4" />
								<span className="sr-only">Edit Profile</span>
							</Button>
						</DialogTrigger>
						<div className="absolute bottom-4 right-4">
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

				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile below. Click save when done.
						</DialogDescription>
					</DialogHeader>

					<EditProfileModal
						user={user}
						updateUserMetadata={updateUserMetadata}
						onClose={() => setIsModalOpen(false)}
					/>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-profile-form">
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</TabsContent>
	);
}

// Preferences tab component - Renamed to SettingsTab
function SettingsTab() {
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
		<TabsContent value="settings">
			<div className="space-y-6">
				<div className="mb-6">
					<h3 className="text-lg font-medium">Settings</h3>
					<p className="text-sm text-muted-foreground">
						Manage your notification preferences and app appearance
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

				<FormSection title="Appearance">
					<p className="text-sm text-muted-foreground pb-4">
						Customize the app's appearance and theme settings
					</p>
					<Card>
						<CardContent className="pt-6">
							<ThemeToggle />
						</CardContent>
					</Card>
				</FormSection>
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
							value="settings"
							className="flex-1">
							Settings
						</TabsTrigger>
						<TabsTrigger
							value="security"
							className="flex-1">
							Security
						</TabsTrigger>
					</TabsList>
					<ProfileTab />
					<SettingsTab />
					<SecurityTab />
				</Tabs>
			</div>
		</AppContent>
	);
}
