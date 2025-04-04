import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as AuthUser } from "@supabase/supabase-js"; // Alias to avoid name clash
import { User, Trash2, Loader2, Upload } from "lucide-react"; // User icon used for fallback
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription, // Added for avatar hint text
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FormSection } from "@/components/ui/form-section";

// Define form schema for validation (copied from ProfilePage)
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
	// Avatar is handled separately, not part of form data validation
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Bucket name (copied from ProfilePage)
const BUCKET_NAME = "avatars";

interface EditProfileModalProps {
	user: AuthUser | null;
	updateUserMetadata: (
		metadata: Record<string, any>
	) => Promise<{ error: any }>;
	onClose: () => void;
}

export function EditProfileModal({
	user,
	updateUserMetadata,
	onClose,
}: EditProfileModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [profileImage, setProfileImage] = useState<string | null>(null); // Base64 or URL
	const [imageFile, setImageFile] = useState<File | null>(null); // For upload

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
		if (!firstName && !lastName) return <User className="h-8 w-8" />; // Default icon
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	// Get profile image URL on initial load
	useEffect(() => {
		if (user?.user_metadata?.avatar_url) {
			setProfileImage(user.user_metadata.avatar_url);
		} else {
			setProfileImage(null); // Ensure it's reset if no URL
		}
	}, [user]); // Depend only on user object

	// Handle profile picture selection
	const handleProfilePictureChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		setImageFile(file); // Store the file for upload

		// Show preview
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			setProfileImage(result); // Show base64 preview
		};
		reader.readAsDataURL(file);
	};

	// Handle removing profile picture
	const handleRemoveProfilePicture = async () => {
		setImageFile(null); // Clear selected file
		setProfileImage(null); // Clear preview
	};

	// Handle form submission
	const onProfileSubmit = async (values: ProfileFormValues) => {
		setIsLoading(true);
		try {
			let avatarUrl = user?.user_metadata?.avatar_url; // Start with existing URL
			let deleteOldAvatar = false;
			const oldAvatarFileName = avatarUrl
				? avatarUrl.split(`/${BUCKET_NAME}/`).pop()
				: null;

			// 1. Handle Avatar Upload/Removal
			if (imageFile) {
				// New image selected for upload
				const userId = user?.id;
				if (!userId) throw new Error("User ID is required for avatar upload");

				// Delete old avatar if it exists
				if (oldAvatarFileName) {
					deleteOldAvatar = true;
				}

				// Corrected string splitting for file extension
				const fileExt = imageFile.name.split(".").pop();
				const fileName = `${userId}-${Date.now()}.${fileExt}`;
				const filePath = `${fileName}`; // Store at bucket root for simplicity

				// Upload to Supabase Storage
				const { error: uploadError, data: uploadData } = await supabase.storage
					.from(BUCKET_NAME)
					.upload(filePath, imageFile, {
						upsert: true, // Overwrite if somehow filename clashes (unlikely)
					});

				if (uploadError)
					throw new Error(`Avatar Upload Failed: ${uploadError.message}`);

				// Get public URL for the file
				const { data: publicUrlData } = supabase.storage
					.from(BUCKET_NAME)
					.getPublicUrl(filePath);

				avatarUrl = publicUrlData.publicUrl;
			} else if (profileImage === null && user?.user_metadata?.avatar_url) {
				// Image explicitly removed (profileImage is null, but metadata had one)
				avatarUrl = undefined; // Signal to remove the URL from metadata
				if (oldAvatarFileName) {
					deleteOldAvatar = true;
				}
			}

			// 2. Update User Metadata
			const updatedMetadata: Record<string, any> = {
				...user?.user_metadata,
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
				avatar_url: avatarUrl, // Set new URL or undefined to remove
			};
			// Ensure avatar_url is actually deleted if undefined
			if (avatarUrl === undefined) {
				delete updatedMetadata.avatar_url;
			}

			const { error: metadataError } = await updateUserMetadata(
				updatedMetadata
			);
			if (metadataError) {
				// If metadata update fails, try to roll back avatar upload? Maybe too complex. Log error.
				console.error("Metadata update failed:", metadataError);
				throw new Error(`Failed to update profile: ${metadataError.message}`);
			}

			// 3. Update Email (if changed) - Separate Auth call
			if (values.email !== user?.email) {
				const { error: emailError } = await supabase.auth.updateUser({
					email: values.email,
				});
				if (emailError)
					throw new Error(`Email Update Failed: ${emailError.message}`);
				toast.info(
					"Verification email sent. Please check your inbox to confirm your new email address."
				);
			}

			// 4. Delete Old Avatar from Storage (if necessary and metadata update succeeded)
			if (deleteOldAvatar && oldAvatarFileName) {
				const { error: deleteError } = await supabase.storage
					.from(BUCKET_NAME)
					.remove([oldAvatarFileName]);
				if (deleteError) {
					// Log error but don't fail the whole operation, metadata is updated
					console.error("Failed to delete old avatar:", deleteError);
					toast.warning(
						"Profile updated, but failed to remove old avatar image."
					);
				}
			}

			toast.success("Profile updated successfully!");
			onClose(); // Close modal on success
			// Optionally trigger a refresh on the parent page if needed, especially for avatar
			// window.location.reload(); // Or pass a refresh callback
		} catch (error) {
			console.error("Error updating profile:", error);
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";
			toast.error(`Failed to update profile: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Form Section for Name, Email, Phone */}
			<Form {...profileForm}>
				<form
					id="edit-profile-form" // ID for DialogFooter button to trigger submit
					onSubmit={profileForm.handleSubmit(onProfileSubmit)}
					className="space-y-4 pt-4">
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
						render={(
							{ field } // field contains { value, onChange, onBlur, name, ref }
						) => (
							<FormItem>
								<FormLabel>Phone Number</FormLabel>
								<FormControl>
									{/* Pass control and name to the custom phone input */}
									<FormPhoneInput
										control={profileForm.control}
										name="phone"
										placeholder="Enter your phone number"
										// The 'field' object from render is automatically handled by FormPhoneInput's useController
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>

			{/* FormSection for Profile Picture */}
			<FormSection
				title="Profile Picture"
				description="Upload or remove your profile picture."
				className="pt-6" // Add some top padding
			>
				<div className="flex items-center gap-4">
					{" "}
					{/* Changed from items-start */}
					<Avatar className="h-20 w-20">
						{" "}
						{/* Slightly smaller avatar */}
						{profileImage ? (
							<AvatarImage
								src={profileImage}
								alt="Profile Preview"
							/>
						) : (
							<AvatarFallback>{getInitials()}</AvatarFallback>
						)}
					</Avatar>
					<div className="flex flex-col gap-2">
						{" "}
						{/* Use column layout for buttons */}
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="relative">
							<input
								type="file"
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								onChange={handleProfilePictureChange}
								accept="image/png, image/jpeg, image/gif" // Be specific
							/>
							<Upload className="mr-2 h-4 w-4" />
							{profileImage ? "Change Image" : "Upload Image"}
						</Button>
						{profileImage && ( // Show remove button only if there's an image (preview or existing)
							<Button
								type="button"
								variant="ghost" // Use ghost for less emphasis
								size="sm"
								className="text-red-600 hover:text-red-700" // Destructive intent
								onClick={handleRemoveProfilePicture}
								disabled={isLoading} // Disable while submitting
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Remove
							</Button>
						)}
						<FormDescription>
							{" "}
							{/* Added description */}
							Max 5MB. Recommended: Square JPG, PNG, GIF.
						</FormDescription>
					</div>
				</div>
			</FormSection>
			{/* Note: DialogFooter with Save/Cancel buttons is expected to be rendered by the parent (<ProfileTab>) */}
		</>
	);
}
