import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth"; // Keep useAuth import
import { User } from "firebase/auth"; // Import User directly from firebase/auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { uploadImage, deleteImage } from "@/lib/storage"; // Import storage functions
import { Loader2, Upload, X } from "lucide-react"; // Import icons
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Define form schema without avatar (handled separately)
const profileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
});

type EditProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
	user: User | null; // Use the imported User type
	onClose: () => void;
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
	const { updateUserProfile } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
		null
	); // For local preview
	const [imageFile, setImageFile] = useState<File | null>(null); // The actual file to upload
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [imageRemoved, setImageRemoved] = useState(false); // Flag to track if user explicitly removed image

	const form = useForm<EditProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
		},
	});

	// Populate form and image preview effect
	useEffect(() => {
		if (user) {
			const nameParts = user.displayName?.split(" ") || [];
			form.reset({
				firstName: nameParts[0] || "",
				lastName: nameParts.slice(1).join(" ") || "",
				email: user.email || "",
			});
			setProfileImagePreview(user.photoURL); // Set initial preview from user profile
			setImageFile(null); // Reset selected file
			setImageRemoved(false); // Reset removal flag
		}
	}, [user, form]);

	// Handle new image selection
	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file.");
				return;
			}
			if (file.size > 2 * 1024 * 1024) {
				// 2MB limit
				toast.error("Image size must be less than 2MB.");
				return;
			}
			setImageFile(file);
			setProfileImagePreview(URL.createObjectURL(file)); // Show local preview
			setImageRemoved(false); // If a new image is selected, it overrides removal intent
			event.target.value = ""; // Clear input value
		}
	};

	// Handle removal of the selected/current image preview
	const handleRemoveImage = () => {
		setImageFile(null); // Clear selected file
		setProfileImagePreview(null); // Clear preview
		setImageRemoved(true); // Mark that the user wants to remove the image
	};

	const onSubmit = async (values: EditProfileFormValues) => {
		if (!user) {
			toast.error("User data not available.");
			return;
		}
		setIsLoading(true);
		setIsUploadingAvatar(true); // Show loading indicator for potential upload

		let photoUrlToUpdate: string | null = user.photoURL; // Start with existing URL
		let uploadError = false;

		try {
			// 1. Handle Image Upload/Removal
			if (imageFile) {
				// Upload new image
				const storagePath = `profile-images/${user.uid}/${imageFile.name}`;
				try {
					const newPhotoURL = await uploadImage(imageFile, storagePath);
					// Delete old image *after* successful upload of new one
					if (user.photoURL) {
						try {
							await deleteImage(user.photoURL);
						} catch (deleteErr) {
							console.warn("Failed to delete old profile image:", deleteErr);
							// Non-critical, proceed with update
						}
					}
					photoUrlToUpdate = newPhotoURL;
				} catch (uploadErr) {
					console.error("Failed to upload new profile image:", uploadErr);
					toast.error(
						`Failed to upload image: ${
							uploadErr instanceof Error ? uploadErr.message : "Unknown error"
						}`
					);
					uploadError = true; // Flag error to prevent profile update if desired
				}
			} else if (imageRemoved && user.photoURL) {
				// Remove existing image if flagged and one exists
				try {
					await deleteImage(user.photoURL);
					photoUrlToUpdate = null; // Set to null for removal
				} catch (deleteErr) {
					console.warn("Failed to delete profile image:", deleteErr);
					toast.warning(
						`Failed to delete image from storage, but it will be removed from your profile.`
					);
					// Still set to null even if storage deletion failed
					photoUrlToUpdate = null;
				}
			}

			// 2. Update Profile (only if image operations didn't critically fail)
			if (!uploadError) {
				const displayName = `${values.firstName} ${values.lastName}`.trim();
				const profileData: { displayName?: string; photoURL?: string | null } =
					{};

				let profileUpdated = false;
				if (displayName !== user.displayName) {
					profileData.displayName = displayName;
					profileUpdated = true;
				}
				// Only include photoURL in update if it changed
				if (photoUrlToUpdate !== user.photoURL) {
					profileData.photoURL = photoUrlToUpdate;
					profileUpdated = true;
				}

				if (profileUpdated) {
					await updateUserProfile(profileData);
					toast.success("Profile updated successfully!");
				} else {
					toast.info("No changes detected.");
				}

				// Close modal only on success or no changes
				onClose();
			}
		} catch (error: any) {
			console.error("Failed to update profile:", error);
			toast.error(`Update failed: ${error.message}`);
		} finally {
			setIsLoading(false);
			setIsUploadingAvatar(false);
		}
	};

	const getInitials = (name: string | null | undefined): string => {
		if (!name) return "?";
		const parts = name.split(" ");
		if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
		return (
			(parts[0][0]?.toUpperCase() || "") +
			(parts[parts.length - 1][0]?.toUpperCase() || "")
		);
	};

	return (
		<Form {...form}>
			<form
				id="edit-profile-form" // ID for potential external submit button
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 pt-4">
				{/* Avatar Section */}
				<div className="space-y-2 flex flex-col items-center">
					<Label htmlFor="profile-picture-upload">Profile Picture</Label>
					<Avatar className="h-24 w-24">
						<AvatarImage src={profileImagePreview || undefined} />
						<AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
					</Avatar>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							type="button"
							asChild>
							<Label
								htmlFor="profile-picture-upload"
								className="cursor-pointer">
								{isUploadingAvatar ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Upload className="mr-2 h-4 w-4" />
								)}
								Upload
							</Label>
						</Button>
						<Input
							id="profile-picture-upload"
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
							disabled={isUploadingAvatar || isLoading}
						/>
						{profileImagePreview && (
							<Button
								size="sm"
								variant="ghost"
								type="button"
								onClick={handleRemoveImage}
								disabled={isUploadingAvatar || isLoading}>
								<X className="mr-2 h-4 w-4" /> Remove
							</Button>
						)}
					</div>
					<p className="text-xs text-muted-foreground">
						Recommended size: 200x200px, Max 2MB.
					</p>
				</div>

				{/* Form Fields */}
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your first name"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your last name"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter your email"
									{...field}
									disabled // Keep disabled - email change handled elsewhere
								/>
							</FormControl>
							<FormDescription>Email cannot be changed here.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Submit button is likely handled by a DialogFooter in the parent component */}
			</form>
		</Form>
	);
}
