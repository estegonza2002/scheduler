import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { Switch } from "../components/ui/switch";

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
	pushNotifications: z.boolean().default(true),
	scheduleUpdates: z.boolean().default(true),
	shiftReminders: z.boolean().default(true),
	systemAnnouncements: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function ProfilePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

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
			pushNotifications: true,
			scheduleUpdates: true,
			shiftReminders: true,
			systemAnnouncements: true,
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

	// Get user initials for avatar fallback
	const getInitials = () => {
		const firstName = user?.user_metadata?.firstName || "";
		const lastName = user?.user_metadata?.lastName || "";
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const goBack = () => {
		navigate(-1);
	};

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-6">
			<Button
				variant="ghost"
				className="mb-6 flex items-center text-muted-foreground"
				onClick={goBack}>
				<ChevronLeft className="h-4 w-4 mr-2" />
				Back to Dashboard
			</Button>

			<div className="flex items-center mb-8">
				<Avatar className="h-16 w-16 mr-4">
					<AvatarImage src={user?.user_metadata?.avatar_url} />
					<AvatarFallback>{getInitials() || "U"}</AvatarFallback>
				</Avatar>
				<div>
					<h1 className="text-2xl font-bold text-primary">
						{user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
					</h1>
					<p className="text-muted-foreground">{user?.email}</p>
				</div>
			</div>

			<Tabs
				defaultValue="profile"
				className="w-full">
				<TabsList className="mb-6 w-full sm:w-auto">
					<TabsTrigger value="profile">Personal Information</TabsTrigger>
					<TabsTrigger value="password">Password</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<div>
						<div>
							<h2 className="text-xl font-semibold mb-1">
								Profile Information
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Update your personal information
							</p>
						</div>

						<form
							onSubmit={profileForm.handleSubmit(onProfileSubmit)}
							className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										placeholder="Enter your first name"
										{...profileForm.register("firstName")}
									/>
									{profileForm.formState.errors.firstName && (
										<p className="text-sm text-red-500">
											{profileForm.formState.errors.firstName.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										placeholder="Enter your last name"
										{...profileForm.register("lastName")}
									/>
									{profileForm.formState.errors.lastName && (
										<p className="text-sm text-red-500">
											{profileForm.formState.errors.lastName.message}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="your@email.com"
									{...profileForm.register("email")}
									disabled // Email shouldn't be editable after registration
								/>
								{profileForm.formState.errors.email && (
									<p className="text-sm text-red-500">
										{profileForm.formState.errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number (Optional)</Label>
								<Input
									id="phone"
									placeholder="Enter your phone number"
									{...profileForm.register("phone")}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="position">Position/Title (Optional)</Label>
								<Input
									id="position"
									placeholder="Enter your position or title"
									{...profileForm.register("position")}
								/>
							</div>

							<Button
								type="submit"
								className="w-full mt-6"
								disabled={isLoading}>
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</div>
				</TabsContent>

				<TabsContent value="password">
					<div>
						<div>
							<h2 className="text-xl font-semibold mb-1">Change Password</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Update your account password
							</p>
						</div>

						<form
							onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
							className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="currentPassword">Current Password</Label>
								<Input
									id="currentPassword"
									type="password"
									placeholder="Enter your current password"
									{...passwordForm.register("currentPassword")}
								/>
								{passwordForm.formState.errors.currentPassword && (
									<p className="text-sm text-red-500">
										{passwordForm.formState.errors.currentPassword.message}
									</p>
								)}
							</div>

							<div className="space-y-2 mt-4">
								<Label htmlFor="newPassword">New Password</Label>
								<Input
									id="newPassword"
									type="password"
									placeholder="Enter your new password"
									{...passwordForm.register("newPassword")}
								/>
								{passwordForm.formState.errors.newPassword && (
									<p className="text-sm text-red-500">
										{passwordForm.formState.errors.newPassword.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirm your new password"
									{...passwordForm.register("confirmPassword")}
								/>
								{passwordForm.formState.errors.confirmPassword && (
									<p className="text-sm text-red-500">
										{passwordForm.formState.errors.confirmPassword.message}
									</p>
								)}
							</div>

							<Button
								type="submit"
								className="w-full mt-6"
								disabled={isLoading}>
								{isLoading ? "Updating..." : "Update Password"}
							</Button>
						</form>
					</div>
				</TabsContent>

				<TabsContent value="notifications">
					<div>
						<div>
							<h2 className="text-xl font-semibold mb-1">
								Notification Preferences
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								Manage your notification settings and preferences
							</p>
						</div>

						<form
							onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
							className="space-y-4">
							<div className="space-y-3">
								<h3 className="text-lg font-medium">Notification Channels</h3>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="emailNotifications"
											className="text-base font-medium">
											Email Notifications
										</Label>
										<p className="text-sm text-muted-foreground">
											Receive updates and alerts via email
										</p>
									</div>
									<Switch
										id="emailNotifications"
										checked={preferencesForm.watch("emailNotifications")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("emailNotifications", checked)
										}
									/>
								</div>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="smsNotifications"
											className="text-base font-medium">
											SMS Notifications
										</Label>
										<p className="text-sm text-muted-foreground">
											Receive updates and alerts via text message
										</p>
									</div>
									<Switch
										id="smsNotifications"
										checked={preferencesForm.watch("smsNotifications")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("smsNotifications", checked)
										}
									/>
								</div>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="pushNotifications"
											className="text-base font-medium">
											Push Notifications
										</Label>
										<p className="text-sm text-muted-foreground">
											Receive push notifications on your device
										</p>
									</div>
									<Switch
										id="pushNotifications"
										checked={preferencesForm.watch("pushNotifications")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("pushNotifications", checked)
										}
									/>
								</div>
							</div>

							<div className="space-y-3 mt-6">
								<h3 className="text-lg font-medium">Notification Types</h3>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="scheduleUpdates"
											className="text-base font-medium">
											Schedule Updates
										</Label>
										<p className="text-sm text-muted-foreground">
											Get notified when your schedule changes
										</p>
									</div>
									<Switch
										id="scheduleUpdates"
										checked={preferencesForm.watch("scheduleUpdates")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("scheduleUpdates", checked)
										}
									/>
								</div>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="shiftReminders"
											className="text-base font-medium">
											Shift Reminders
										</Label>
										<p className="text-sm text-muted-foreground">
											Receive reminders before your scheduled shifts
										</p>
									</div>
									<Switch
										id="shiftReminders"
										checked={preferencesForm.watch("shiftReminders")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("shiftReminders", checked)
										}
									/>
								</div>

								<div className="flex items-center justify-between py-2">
									<div className="space-y-0.5">
										<Label
											htmlFor="systemAnnouncements"
											className="text-base font-medium">
											System Announcements
										</Label>
										<p className="text-sm text-muted-foreground">
											Stay informed about important system updates
										</p>
									</div>
									<Switch
										id="systemAnnouncements"
										checked={preferencesForm.watch("systemAnnouncements")}
										onCheckedChange={(checked) =>
											preferencesForm.setValue("systemAnnouncements", checked)
										}
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full mt-6"
								disabled={isLoading}>
								{isLoading ? "Saving..." : "Save Notifications"}
							</Button>
						</form>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
