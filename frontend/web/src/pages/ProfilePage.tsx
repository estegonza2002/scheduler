import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { ChevronLeft, RotateCcw, User } from "lucide-react";
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

import { ContentContainer } from "../components/ui/content-container";
import { FormSection } from "../components/ui/form-section";

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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function ProfilePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const searchParams = useSearchParams()[0];
	const tabParam = searchParams.get("tab");

	const [isLoading, setIsLoading] = useState(false);
	const [activeDeliveryTab, setActiveDeliveryTab] = useState("email");

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

	const fullName =
		`${user?.user_metadata?.firstName || ""} ${
			user?.user_metadata?.lastName || ""
		}`.trim() || "Your Profile";

	return (
		<>
			<ContentContainer>
				<div className="flex items-center mb-8">
					<Avatar className="h-16 w-16 mr-4">
						<AvatarImage src={user?.user_metadata?.avatar_url} />
						<AvatarFallback>{getInitials() || "U"}</AvatarFallback>
					</Avatar>
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
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									Update your personal information and contact details
								</CardDescription>
							</CardHeader>
							<CardContent>
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
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="password">
						<Card>
							<CardHeader>
								<CardTitle>Change Password</CardTitle>
								<CardDescription>
									Update your password to keep your account secure
								</CardDescription>
							</CardHeader>
							<CardContent>
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
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="notifications">
						<Card>
							<CardHeader>
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>
									Choose how and when you would like to be notified
								</CardDescription>
							</CardHeader>
							<CardContent>
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
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</ContentContainer>
		</>
	);
}
