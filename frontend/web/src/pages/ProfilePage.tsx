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
	Calendar,
	Users,
	Briefcase,
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import { supabase } from "../lib/supabase";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { ShiftsAPI, LocationsAPI, Shift, Location } from "../api";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { calculateHours } from "../utils/time-calculations";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { PageHeader } from "../components/ui/page-header";
import { PageContentSpacing } from "../components/ui/header-content-spacing";
import { SecondaryLayout } from "../components/layout/SecondaryLayout";

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

// Look for the exact name of your bucket in Supabase storage
// Replace "avatars" with the exact bucket name
const BUCKET_NAME = "avatars"; // Make sure this matches the bucket name in Supabase

// ShiftsSection component to display shift information
interface ShiftsSectionProps {
	userId: string;
}

function ShiftsSection({ userId }: ShiftsSectionProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [locations, setLocations] = useState<Record<string, Location>>({});
	const [assignedLocation, setAssignedLocation] = useState<Location | null>(
		null
	);
	const now = new Date();

	useEffect(() => {
		const fetchUserShifts = async () => {
			try {
				setIsLoading(true);
				// Fetch shifts for the user - we're calling the mock API
				// which accepts dateOrScheduleId and organizationId
				// For user shifts, we'll filter client-side
				const allShifts = await ShiftsAPI.getAll();
				// Filter for this specific user's shifts
				const userShifts = allShifts.filter(
					(shift) => shift.employeeId === userId
				);
				setShifts(userShifts);

				// Collect all location IDs
				const locationIds = new Set<string>();
				userShifts.forEach((shift) => {
					if (shift.locationId) {
						locationIds.add(shift.locationId);
					}
				});

				// Fetch all needed locations
				const locationsMap: Record<string, Location> = {};
				for (const locationId of locationIds) {
					const location = await LocationsAPI.getById(locationId);
					if (location) {
						locationsMap[locationId] = location;
					}
				}
				setLocations(locationsMap);

				// Set assigned location (primary location for the user)
				if (userShifts.length > 0 && userShifts[0].locationId) {
					setAssignedLocation(locationsMap[userShifts[0].locationId] || null);
				}
			} catch (error) {
				console.error("Error fetching user shifts:", error);
				toast.error("Failed to load shifts information");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserShifts();
	}, [userId]);

	// Filter shifts into current, upcoming, and previous
	const currentShifts = shifts.filter(
		(shift) =>
			isAfter(parseISO(shift.endTime), now) &&
			isBefore(parseISO(shift.startTime), now)
	);

	const upcomingShifts = shifts
		.filter((shift) => isAfter(parseISO(shift.startTime), now))
		.sort(
			(a, b) =>
				parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
		)
		.slice(0, 5); // Get next 5 upcoming shifts

	const previousShifts = shifts
		.filter((shift) => isBefore(parseISO(shift.endTime), now))
		.sort(
			(a, b) =>
				parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()
		)
		.slice(0, 5); // Get last 5 previous shifts

	// Helper function to get location name
	const getLocationName = (locationId?: string) => {
		if (!locationId) return "Unassigned";
		return locations[locationId]?.name || "Unknown Location";
	};

	// Helper function to render a shift card
	const renderShiftCard = (shift: Shift) => {
		return (
			<Card
				key={shift.id}
				className="mb-3 hover:shadow-sm transition-all">
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<div>
							<h4 className="font-medium">
								{format(parseISO(shift.startTime), "EEE, MMM d")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{format(parseISO(shift.startTime), "h:mm a")} -{" "}
								{format(parseISO(shift.endTime), "h:mm a")}
								<span className="mx-1">•</span>
								{calculateHours(shift.startTime, shift.endTime)} hours
							</p>
						</div>
						<div>
							{shift.role && (
								<Badge
									variant="outline"
									className="text-xs">
									{shift.role}
								</Badge>
							)}
						</div>
					</div>
					{shift.locationId && (
						<div className="mt-2 text-xs flex items-center text-muted-foreground">
							<MapPin className="h-3 w-3 mr-1" />
							<span>{getLocationName(shift.locationId)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-24 bg-gray-200 rounded animate-pulse"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Assigned Location Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
					Assigned Location
				</h3>
				{assignedLocation ? (
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col">
								<h4 className="font-medium">{assignedLocation.name}</h4>
								{assignedLocation.address && (
									<p className="text-sm text-muted-foreground">
										{assignedLocation.address}
										{assignedLocation.city && `, ${assignedLocation.city}`}
										{assignedLocation.state && `, ${assignedLocation.state}`}
										{assignedLocation.zipCode && ` ${assignedLocation.zipCode}`}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No location currently assigned
						</CardContent>
					</Card>
				)}
			</div>

			{/* Current Shifts Section */}
			{currentShifts.length > 0 && (
				<div>
					<h3 className="text-lg font-medium mb-4 flex items-center">
						<Clock className="h-5 w-5 mr-2 text-muted-foreground" />
						Current Shift
					</h3>
					{currentShifts.map(renderShiftCard)}
				</div>
			)}

			{/* Upcoming Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
					Upcoming Shifts
				</h3>
				{upcomingShifts.length > 0 ? (
					upcomingShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No upcoming shifts scheduled
						</CardContent>
					</Card>
				)}
			</div>

			{/* Previous Shifts Section */}
			<div>
				<h3 className="text-lg font-medium mb-4 flex items-center">
					<Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
					Previous Shifts
				</h3>
				{previousShifts.length > 0 ? (
					previousShifts.map(renderShiftCard)
				) : (
					<Card>
						<CardContent className="p-4 text-muted-foreground">
							No previous shifts found
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

export default function ProfilePage() {
	const { user, updateUserMetadata, updatePassword, signIn } = useAuth();
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
			console.log("Starting profile update process");
			// Update user metadata in Supabase
			let avatarUrl = user?.user_metadata?.avatar_url;
			let avatarUploadFailed = false;

			// Handle profile picture if changed
			if (profilePicturePreview) {
				console.log("Uploading new profile picture");
				// Upload the image to Supabase storage
				const userId = user?.id;
				if (!userId) throw new Error("User ID not found");

				try {
					// Skip bucket checks and creation since the bucket already exists
					// Just focus on uploading the file
					console.log("Converting image to blob");
					const base64Response = await fetch(profilePicturePreview);
					const blob = await base64Response.blob();

					// Create a unique file name
					const fileExt = blob.type.split("/")[1];
					const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
					console.log("File name:", fileName);

					// Upload to existing Supabase Storage bucket
					console.log("Uploading file to storage");
					const { data: storageData, error: storageError } =
						await supabase.storage.from(BUCKET_NAME).upload(fileName, blob, {
							cacheControl: "3600",
							upsert: true,
						});

					if (storageError) {
						console.error("Error uploading file:", storageError);
						console.error(
							"Error details:",
							JSON.stringify(storageError, null, 2)
						);
						throw storageError;
					}

					// Get the public URL
					console.log("Getting public URL");
					const { data: publicUrlData } = supabase.storage
						.from(BUCKET_NAME)
						.getPublicUrl(fileName);

					avatarUrl = publicUrlData.publicUrl;
					console.log("Raw Avatar URL:", avatarUrl);

					// Test if the avatar URL is accessible
					fetch(avatarUrl, { method: "HEAD" })
						.then((response) => {
							console.log(
								"Avatar URL test response:",
								response.status,
								response.statusText
							);
							if (!response.ok) {
								console.error("Avatar URL is not accessible:", response);
							}
						})
						.catch((err) => {
							console.error("Error testing avatar URL:", err);
						});

					// Ensure the avatarUrl is properly formatted
					if (avatarUrl && !avatarUrl.startsWith("http")) {
						avatarUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
						console.log("Fixed Avatar URL:", avatarUrl);
					}
				} catch (error) {
					// Instead of throwing the error, set a flag and continue
					// This allows the user profile to be updated even if avatar upload fails
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
			} else if (profilePicturePreview === null) {
				// If user clicked remove picture but there was a previous avatar
				avatarUrl = undefined; // This will remove the avatar URL
				console.log("Removing profile picture");
			}

			// Update user metadata with the new avatar_url (or undefined to remove it)
			console.log("Updating user metadata with:", {
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone || "",
				position: values.position || "",
				avatar_url: avatarUrl,
			});

			// Ensure we're passing all previous metadata values plus our changes
			const updatedMetadata: Record<string, any> = {
				...user?.user_metadata,
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone || "",
				position: values.position || "",
			};

			// Set avatar_url explicitly (or remove it)
			if (avatarUrl) {
				updatedMetadata.avatar_url = avatarUrl;
			} else if (profilePicturePreview === null) {
				// If explicitly removed
				delete updatedMetadata.avatar_url;
			}

			console.log("Final metadata update:", updatedMetadata);

			const { error } = await updateUserMetadata(updatedMetadata);

			if (error) {
				console.error("Error updating user metadata:", error);
				throw new Error(error.message);
			}

			// Add this section to log the final state and force user refresh
			console.log(
				"Successfully updated user metadata with avatar:",
				updatedMetadata
			);

			// Force a user data refresh
			try {
				const { data: refreshedUser, error: refreshError } =
					await supabase.auth.getUser();
				if (refreshError) {
					console.error("Error refreshing user data:", refreshError);
				} else {
					console.log("Refreshed user data:", refreshedUser);
				}
			} catch (refreshErr) {
				console.error("Error in user refresh:", refreshErr);
			}

			if (avatarUploadFailed) {
				toast.success("Profile updated successfully, but avatar upload failed");
			} else {
				toast.success("Profile updated successfully");

				// Add page refresh if avatar was updated
				if (profilePicturePreview) {
					console.log(
						"Profile picture successfully uploaded - refreshing page in 1.5 seconds"
					);

					// Refresh the page after a short delay to ensure UI updates
					setTimeout(() => {
						window.location.reload();
					}, 1500);
				}
			}
		} catch (error: any) {
			console.error("Profile update error:", error);
			toast.error(
				"Failed to update profile: " + (error.message || "Unknown error")
			);
		} finally {
			setIsLoading(false);
		}
	}

	async function onPasswordSubmit(values: PasswordFormValues) {
		setIsLoading(true);
		try {
			// First, verify the current password by attempting a login
			const { error: loginError } = await signIn({
				email: user?.email || "",
				password: values.currentPassword,
			});

			if (loginError) {
				toast.error("Current password is incorrect");
				return;
			}

			// Update password via Supabase
			const { error } = await updatePassword(values.newPassword);

			if (error) {
				throw new Error(error.message);
			}

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
							contactEmail: orgs[0].contactEmail || "",
							contactPhone: orgs[0].contactPhone || "",
							address: orgs[0].address || "",
							city: orgs[0].city || "",
							state: orgs[0].state || "",
							zipCode: orgs[0].zipCode || "",
							country: orgs[0].country || "",
							website: orgs[0].website || "",
							businessHours: orgs[0].businessHours || "",
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

			// Update the organization in the database
			const updatedOrg = await OrganizationsAPI.update({
				id: organization.id,
				name: values.name,
				description: values.description,
				contactEmail: values.contactEmail,
				contactPhone: values.contactPhone,
				address: values.address,
				city: values.city,
				state: values.state,
				zipCode: values.zipCode,
				country: values.country,
				website: values.website,
				businessHours: values.businessHours,
			});

			if (updatedOrg) {
				setOrganization(updatedOrg);
				toast.success("Business profile updated successfully");
			} else {
				toast.error("Failed to update business profile");
			}
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
		/* Temporarily disabled branding navigation
		if (tab === "branding") {
			// Navigate to the branding page when branding tab is clicked
			navigate("/branding");
			return;
		}
		*/
		setActiveTab(tab);
		setSearchParams({ tab });
	};

	useEffect(() => {
		// Update the activeTab if the URL parameter changes
		setActiveTab(tabParam);
	}, [tabParam]);

	const renderSidebar = () => {
		return (
			<ProfileSidebar
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>
		);
	};

	// Now modify the ProfileSidebar component to include all needed tabs including Shifts
	useEffect(() => {
		// Navigate to the correct tab based on URL params
		// This effect runs after the component mounts
		const newSidebar = document.querySelector(".secondary-navbar");
		if (newSidebar) {
			// Update sidebar buttons for profile navigation
			const sidebarContent = newSidebar.querySelector("div.space-y-1");
			if (sidebarContent) {
				// Clear existing buttons
				// sidebarContent.innerHTML = '';
				// Create buttons manually if needed
				// For simplicity, we'll rely on the default implementation
				// but add customization here if needed in the future
			}
		}
	}, []);

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

	const handleProfilePictureChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				console.log(
					"Setting profile picture preview:",
					result.substring(0, 50) + "..."
				);
				setProfilePicturePreview(result);
				setIsAvatarRemoved(false);
			};
			reader.readAsDataURL(file);
		}
	};

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

	// Add this after the existing useEffects
	useEffect(() => {
		// Reset isAvatarRemoved if the user has an avatar URL in their metadata
		if (user?.user_metadata?.avatar_url) {
			setIsAvatarRemoved(false);
		}
	}, [user]);

	return (
		<SecondaryLayout
			title={`${user?.user_metadata?.firstName || ""} ${
				user?.user_metadata?.lastName || ""
			}'s Profile`}
			description="Manage your personal information and preferences"
			sidebar={
				<ProfileSidebar
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>
			}>
			{/* Profile Tab Content */}
			{activeTab === "profile" && (
				<div className="md:col-span-3 space-y-8">
					<Form {...profileForm}>
						<form
							onSubmit={profileForm.handleSubmit(onProfileSubmit)}
							className="space-y-6">
							<FormSection title="Profile Picture">
								<div className="flex items-start gap-6">
									<Avatar className="h-24 w-24 border">
										<AvatarImage
											src={
												profilePicturePreview || user?.user_metadata?.avatar_url
											}
											className={cn(
												"object-cover",
												isAvatarRemoved && "hidden"
											)}
										/>
										<AvatarFallback className="text-2xl">
											{getInitials()}
										</AvatarFallback>
									</Avatar>

									<div className="flex flex-col gap-3">
										<label
											htmlFor="profile-picture-upload"
											className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
											<Upload className="mr-2 h-4 w-4" />
											Upload Picture
											<input
												id="profile-picture-upload"
												type="file"
												accept="image/*"
												className="sr-only"
												onChange={handleProfilePictureChange}
											/>
										</label>

										{(user?.user_metadata?.avatar_url ||
											profilePicturePreview) &&
											!isAvatarRemoved && (
												<Button
													type="button"
													variant="outline"
													onClick={handleRemoveProfilePicture}
													className="justify-start">
													<Trash2 className="mr-2 h-4 w-4" />
													Remove Picture
												</Button>
											)}

										<p className="text-xs text-muted-foreground mt-2">
											Recommended: Square image, at least 200x200px.
										</p>
									</div>
								</div>
							</FormSection>

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

							<FormSection title="Security">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-sm font-medium">Password</h4>
											<p className="text-sm text-muted-foreground">
												Update your password to keep your account secure
											</p>
										</div>
										<Dialog>
											<DialogTrigger asChild>
												<Button
													type="button"
													variant="outline">
													Update Password
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Update Password</DialogTitle>
													<DialogDescription>
														Enter your current password and new password
													</DialogDescription>
												</DialogHeader>
												<Form {...passwordForm}>
													<form
														onSubmit={passwordForm.handleSubmit(
															onPasswordSubmit
														)}
														className="space-y-6">
														<FormField
															control={passwordForm.control}
															name="currentPassword"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Current Password</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Enter your current password"
																			type="password"
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
																			placeholder="Enter your new password"
																			type="password"
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
																	<FormLabel>Confirm Password</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Confirm your new password"
																			type="password"
																			{...field}
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
															{isLoading && (
																<span className="mr-2">
																	<svg
																		className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24">
																		<circle
																			className="opacity-25"
																			cx="12"
																			cy="12"
																			r="10"
																			stroke="currentColor"
																			strokeWidth="4"></circle>
																		<path
																			className="opacity-75"
																			fill="currentColor"
																			d="M4 12a8 8 0 018-8v8z"></path>
																	</svg>
																</span>
															)}
															Update Password
														</Button>
													</form>
												</Form>
											</DialogContent>
										</Dialog>
									</div>
								</div>
							</FormSection>

							{/* Form Submission */}
							<div className="flex justify-end">
								<Button
									type="submit"
									className="min-w-[150px]"
									disabled={
										isLoading ||
										!profileForm.formState.isDirty ||
										profileForm.formState.isSubmitting
									}>
									{isLoading ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24">
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8v8z"></path>
											</svg>
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			)}

			{/* Shifts Section */}
			{activeTab === "shifts" && (
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="text-2xl font-bold">My Shifts</h2>
							<p className="text-muted-foreground">
								View your current, upcoming, and previous shifts.
							</p>
						</div>
					</div>

					<ShiftsSection userId={user?.id || ""} />
				</div>
			)}

			{activeTab === "notifications" && (
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="text-2xl font-bold">Notifications</h2>
							<p className="text-muted-foreground">
								Manage your notification preferences.
							</p>
						</div>
					</div>

					<Form {...preferencesForm}>
						<form
							onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
							className="space-y-6">
							<FormSection title="Notification Channels">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="email-notifications">
												Email Notifications
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive notifications via email
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="emailNotifications"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="email-notifications"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="sms-notifications">
												SMS Notifications
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive notifications via text message
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="smsNotifications"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="sms-notifications"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="push-notifications">
												Push Notifications
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive push notifications on this device
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="pushNotifications"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="push-notifications"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
							</FormSection>

							<FormSection title="Notification Type">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="schedule-updates">Schedule Updates</Label>
											<p className="text-sm text-muted-foreground">
												Receive notifications when the schedule changes
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="scheduleUpdates"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="schedule-updates"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="shift-reminders">Shift Reminders</Label>
											<p className="text-sm text-muted-foreground">
												Receive reminders before your shifts start
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="shiftReminders"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="shift-reminders"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="system-announcements">
												System Announcements
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive important system announcements
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="systemAnnouncements"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="system-announcements"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="request-updates">Request Updates</Label>
											<p className="text-sm text-muted-foreground">
												Receive updates on your time-off requests
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="requestUpdates"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="request-updates"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="new-schedule-published">
												New Schedule Published
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive notification when a new schedule is published
											</p>
										</div>
										<FormField
											control={preferencesForm.control}
											name="newSchedulePublished"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Switch
															id="new-schedule-published"
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
							</FormSection>

							{/* Form Submission */}
							<div className="flex justify-end">
								<Button
									type="submit"
									className="min-w-[150px]"
									disabled={
										isLoading ||
										!preferencesForm.formState.isDirty ||
										preferencesForm.formState.isSubmitting
									}>
									{isLoading ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24">
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8v8z"></path>
											</svg>
											Saving...
										</>
									) : (
										"Save Preferences"
									)}
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
											{organization?.description || "No description provided"}
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
		</SecondaryLayout>
	);
}
