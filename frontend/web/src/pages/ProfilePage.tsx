import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useForm, ControllerRenderProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/lib/header-context";
import { Pencil } from "lucide-react";

// Define Zod schema for profile form validation
const profileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	// Add other fields as needed, e.g., photoURL, phone number
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
	const { updateHeader } = useHeader();
	const {
		user,
		updateUserProfile,
		signOut,
		// updateUserMetadata, // Removed - Supabase specific
		updatePassword, // Assuming this exists in useAuth for password change
	} = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const navigate = useNavigate();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
		},
	});

	// Set page header correctly
	useEffect(() => {
		updateHeader({
			title: "My Profile",
			description: "Manage your personal details and settings.",
		});
	}, [updateHeader]);

	// Populate form with user data when user object is available
	useEffect(() => {
		if (user) {
			const nameParts = user.displayName?.split(" ") || [];
			form.reset({
				firstName: nameParts[0] || "",
				lastName: nameParts.slice(1).join(" ") || "",
				email: user.email || "",
			});
		}
	}, [user, form, isEditing]); // Re-populate if editing is cancelled

	// Handle profile update submission
	const onSubmit = async (values: ProfileFormValues) => {
		setIsLoading(true);
		setError(null);
		try {
			const displayName = `${values.firstName} ${values.lastName}`.trim();
			console.log("Attempting to update profile with Firebase...");

			// Update standard profile data (displayName)
			await updateUserProfile({ displayName });

			// Handle email update attempt (requires verification)
			if (user && values.email !== user.email) {
				toast.info(
					"Updating email requires verification. Functionality not yet implemented."
				);
				// TODO: Implement email update flow (e.g., verifyBeforeUpdateEmail)
				// You might want to prevent the form from saving if email changed
				// or handle it separately.
				// For now, we just update the name.
			}

			toast.success("Profile updated successfully!");
			setIsEditing(false);
		} catch (err: any) {
			console.error("Profile update error:", err);
			const errorMessage = err.message || "Failed to update profile.";
			setError(errorMessage);
			toast.error(`Error: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle account deletion request
	const handleDeleteAccount = async () => {
		if (!user) return;
		if (
			!window.confirm(
				"Are you sure you want to delete your account? This action cannot be undone and requires backend support."
			)
		) {
			return;
		}

		console.warn("Account deletion requested for user:", user.uid);
		toast.info(
			"Account deletion functionality requires a backend function which is not yet implemented. Please contact support if you wish to proceed."
		);
		// TODO: Implement account deletion via a Cloud Function call
		// try {
		// 	setIsLoading(true);
		// 	// const deleteAccountFunction = httpsCallable(functions, 'deleteUserAccount');
		// 	// await deleteAccountFunction();
		// 	// await signOut();
		// 	// navigate("/");
		// 	// toast.success("Account deleted successfully.");
		// } catch (err: any) { ... handle error ... } finally { setIsLoading(false); }
	};

	if (!user) {
		// Optional: Show loading state while auth resolves
		return <div>Loading profile...</div>;
	}

	// Simplified JSX structure using react-hook-form and standard Firebase user properties
	return (
		<div className="space-y-6 p-4 md:p-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Personal Information</CardTitle>
							<CardDescription>Update your personal details.</CardDescription>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsEditing(!isEditing)}
							disabled={isLoading}>
							<Pencil className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4">
							<div className="flex items-center space-x-4 mb-6">
								<Avatar className="h-16 w-16">
									<AvatarImage src={user.photoURL || undefined} />
									<AvatarFallback>
										{form.watch("firstName")?.[0]}
										{form.watch("lastName")?.[0]}
									</AvatarFallback>
								</Avatar>
								{/* TODO: Add photo upload functionality if needed */}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({
										field,
									}: {
										field: ControllerRenderProps<
											ProfileFormValues,
											"firstName"
										>;
									}) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input
													disabled={!isEditing || isLoading}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastName"
									render={({
										field,
									}: {
										field: ControllerRenderProps<ProfileFormValues, "lastName">;
									}) => (
										<FormItem>
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input
													disabled={!isEditing || isLoading}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												disabled // Email changes require verification - disable for now
												// disabled={!isEditing || isLoading}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Changing your email requires verification (not yet
											implemented).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{isEditing && (
								<div className="flex justify-end space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsEditing(false);
											form.reset(); // Reset form to original values
											setError(null);
										}}
										disabled={isLoading}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isLoading}>
										{isLoading ? "Saving..." : "Save Changes"}
									</Button>
								</div>
							)}
							{error && <p className="text-sm text-destructive">{error}</p>}
						</form>
					</Form>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle>Security</CardTitle>
					<CardDescription>
						Manage your account security settings.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						variant="outline"
						onClick={() => setShowPasswordModal(true)} // TODO: Create Password Change Modal
						// disabled={isLoading} // Disable if needed
					>
						Change Password
					</Button>
					<Button
						variant="destructive"
						onClick={handleDeleteAccount}
						disabled={isLoading}>
						Delete Account
					</Button>
					<p className="text-xs text-muted-foreground">
						Account deletion requires backend support and cannot be undone.
					</p>
				</CardContent>
			</Card>

			{/* TODO: Implement Password Change Modal */}
			{/* <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} /> */}
		</div>
	);
}
