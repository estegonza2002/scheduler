import { useState, useEffect, useCallback } from "react";
import {
	useNavigate,
	Link,
	useSearchParams,
	useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
	CalendarDays,
	Clock10,
	BellRing,
	Trash,
	Download,
	ClipboardList,
	ChevronDown,
	Check,
	Coffee,
	ChevronsUp,
	CreditCard,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ContentContainer } from "@/components/ui/content-container";
import { FormSection } from "@/components/ui/form-section";
import { ProfileSidebar } from "@/components/layout/SecondaryNavbar";
import { OrganizationsAPI, type Organization } from "@/api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ShiftsAPI, LocationsAPI, Shift, Location } from "@/api";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { calculateHours } from "@/utils/time-calculations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

import { SecondaryLayout } from "@/components/layout/SecondaryLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { ContentSection } from "@/components/ui/content-section";
import { FormPhoneInput } from "@/components/ui/form-phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { ThemeToggle } from "@/components/ThemeToggle";

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
				// Fetch shifts for the user
				const getAll = (ShiftsAPI as any).getAll;
				const allShifts = await getAll({
					is_schedule: false,
				});
				// Filter for this specific user's shifts
				const userShifts = allShifts.filter(
					(shift: Shift) => shift.user_id === userId
				);
				setShifts(userShifts);

				// Collect all location IDs
				const locationIds = new Set<string>();
				userShifts.forEach((shift: Shift) => {
					if (shift.location_id) {
						locationIds.add(shift.location_id);
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
				if (userShifts.length > 0 && userShifts[0].location_id) {
					setAssignedLocation(locationsMap[userShifts[0].location_id] || null);
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
			isAfter(parseISO(shift.end_time), now) &&
			isBefore(parseISO(shift.start_time), now)
	);

	const upcomingShifts = shifts
		.filter((shift) => isAfter(parseISO(shift.start_time), now))
		.sort(
			(a, b) =>
				parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
		)
		.slice(0, 5); // Get next 5 upcoming shifts

	const previousShifts = shifts
		.filter((shift) => isBefore(parseISO(shift.end_time), now))
		.sort(
			(a, b) =>
				parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime()
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
								{format(parseISO(shift.start_time), "EEE, MMM d")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{format(parseISO(shift.start_time), "h:mm a")} -{" "}
								{format(parseISO(shift.end_time), "h:mm a")}
								<span className="mx-1">•</span>
								{calculateHours(shift.start_time, shift.end_time)} hours
							</p>
						</div>
						<div>
							{shift.position && (
								<Badge
									variant="outline"
									className="text-xs">
									{shift.position}
								</Badge>
							)}
						</div>
					</div>
					{shift.location_id && (
						<div className="mt-2 text-xs flex items-center text-muted-foreground">
							<MapPin className="h-3 w-3 mr-1" />
							<span>{getLocationName(shift.location_id)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<LoadingState
				type="spinner"
				message="Loading shift information..."
				className="py-8"
			/>
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
	const [isManualAddressEntry, setIsManualAddressEntry] = useState(false);

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

	// Convert onProfileSubmit to use useCallback
	const onProfileSubmit = useCallback(
		async (values: ProfileFormValues) => {
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
					toast.success(
						"Profile updated successfully, but avatar upload failed"
					);
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
			} catch (error) {
				console.error("Error in profile update:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				toast.error("Failed to update profile: " + errorMessage);
			} finally {
				setIsLoading(false);
				setProfilePicturePreview(null); // Reset the preview
			}
		},
		[user, profilePicturePreview, updateUserMetadata]
	);

	// Convert onPasswordSubmit to use useCallback
	const onPasswordSubmit = useCallback(
		async (values: PasswordFormValues) => {
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
		},
		[passwordForm]
	);

	// Convert onPreferencesSubmit to use useCallback
	const onPreferencesSubmit = useCallback(
		async (values: PreferencesFormValues) => {
			setIsLoading(true);
			try {
				// Here you would typically save preferences to your backend
				console.log("Preferences submitted:", values);

				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				toast.success("Notification preferences updated successfully");
			} catch (error) {
				console.error("Error updating preferences:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				toast.error("Failed to update preferences: " + errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	// Convert getInitials to use useCallback
	const getInitials = useCallback(() => {
		if (!user?.user_metadata?.firstName || !user?.user_metadata?.lastName)
			return "U";
		return `${user.user_metadata.firstName.charAt(
			0
		)}${user.user_metadata.lastName.charAt(0)}`;
	}, [user]);

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
			tab === "profile" ||
			tab === "password" ||
			tab === "notifications" ||
			tab === "branding" ||
			tab === "appearance" ||
			tab === "billing"
		) {
			setActiveTab(tab);
			setSearchParams({ tab });
		} else if (tab === "business-profile") {
			// Navigate to the business profile page
			navigate("/business-profile");
		}
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
								<Card className="flex items-start gap-6 p-4">
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
								</Card>
							</FormSection>

							<FormSection title="Personal Details">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">
											First Name <span className="text-red-500">*</span>
										</Label>
										<Input
											id="firstName"
											placeholder="Enter your first name"
											{...profileForm.register("firstName")}
											className={
												profileForm.formState.errors.firstName
													? "border-red-500"
													: ""
											}
											aria-required="true"
											aria-invalid={!!profileForm.formState.errors.firstName}
										/>
										{profileForm.formState.errors.firstName && (
											<p
												className="text-sm text-red-500"
												role="alert">
												{profileForm.formState.errors.firstName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="lastName">
											Last Name <span className="text-red-500">*</span>
										</Label>
										<Input
											id="lastName"
											placeholder="Enter your last name"
											{...profileForm.register("lastName")}
											className={
												profileForm.formState.errors.lastName
													? "border-red-500"
													: ""
											}
											aria-required="true"
											aria-invalid={!!profileForm.formState.errors.lastName}
										/>
										{profileForm.formState.errors.lastName && (
											<p
												className="text-sm text-red-500"
												role="alert">
												{profileForm.formState.errors.lastName.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">
										Email <span className="text-red-500">*</span>
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										{...profileForm.register("email")}
										className={
											profileForm.formState.errors.email ? "border-red-500" : ""
										}
										aria-required="true"
										aria-invalid={!!profileForm.formState.errors.email}
									/>
									{profileForm.formState.errors.email && (
										<p
											className="text-sm text-red-500"
											role="alert">
											{profileForm.formState.errors.email.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										placeholder="Enter your phone number"
										{...profileForm.register("phone")}
										className={
											profileForm.formState.errors.phone ? "border-red-500" : ""
										}
										aria-invalid={!!profileForm.formState.errors.phone}
									/>
									{profileForm.formState.errors.phone && (
										<p
											className="text-sm text-red-500"
											role="alert">
											{profileForm.formState.errors.phone.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="position">Position/Title</Label>
									<Input
										id="position"
										placeholder="Enter your job title or position"
										{...profileForm.register("position")}
										className={
											profileForm.formState.errors.position
												? "border-red-500"
												: ""
										}
										aria-invalid={!!profileForm.formState.errors.position}
									/>
									{profileForm.formState.errors.position && (
										<p
											className="text-sm text-red-500"
											role="alert">
											{profileForm.formState.errors.position.message}
										</p>
									)}
								</div>
							</FormSection>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={isLoading}>
									{isLoading ? "Saving..." : "Save Profile"}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			)}

			{/* Password Tab Content */}
			{activeTab === "password" && (
				<div className="md:col-span-3">
					<Form {...passwordForm}>
						<form
							onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
							className="space-y-6">
							<FormSection title="Change Password">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="currentPassword">
											Current Password <span className="text-red-500">*</span>
										</Label>
										<Input
											id="currentPassword"
											type="password"
											placeholder="Enter your current password"
											{...passwordForm.register("currentPassword")}
											className={
												passwordForm.formState.errors.currentPassword
													? "border-red-500"
													: ""
											}
											aria-required="true"
											aria-invalid={
												!!passwordForm.formState.errors.currentPassword
											}
										/>
										{passwordForm.formState.errors.currentPassword && (
											<p
												className="text-sm text-red-500"
												role="alert">
												{passwordForm.formState.errors.currentPassword.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="newPassword">
											New Password <span className="text-red-500">*</span>
										</Label>
										<Input
											id="newPassword"
											type="password"
											placeholder="Enter your new password"
											{...passwordForm.register("newPassword")}
											className={
												passwordForm.formState.errors.newPassword
													? "border-red-500"
													: ""
											}
											aria-required="true"
											aria-invalid={!!passwordForm.formState.errors.newPassword}
										/>
										{passwordForm.formState.errors.newPassword && (
											<p
												className="text-sm text-red-500"
												role="alert">
												{passwordForm.formState.errors.newPassword.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirm Password <span className="text-red-500">*</span>
										</Label>
										<Input
											id="confirmPassword"
											type="password"
											placeholder="Confirm your new password"
											{...passwordForm.register("confirmPassword")}
											className={
												passwordForm.formState.errors.confirmPassword
													? "border-red-500"
													: ""
											}
											aria-required="true"
											aria-invalid={
												!!passwordForm.formState.errors.confirmPassword
											}
										/>
										{passwordForm.formState.errors.confirmPassword && (
											<p
												className="text-sm text-red-500"
												role="alert">
												{passwordForm.formState.errors.confirmPassword.message}
											</p>
										)}
									</div>
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
				</div>
			)}

			{/* Notifications Tab Content */}
			{activeTab === "notifications" && (
				<div className="md:col-span-3">
					<Form {...preferencesForm}>
						<form
							onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
							className="space-y-6">
							<FormSection
								title="Notification Preferences"
								description="Manage how you receive notifications">
								<div className="space-y-4">
									<FormField
										control={preferencesForm.control}
										name="emailNotifications"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Email Notifications</Label>
													<p className="text-sm text-muted-foreground">
														Receive notifications via email
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle email notifications"
												/>
											</div>
										)}
									/>

									<FormField
										control={preferencesForm.control}
										name="smsNotifications"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>SMS Notifications</Label>
													<p className="text-sm text-muted-foreground">
														Receive notifications via text message
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle SMS notifications"
												/>
											</div>
										)}
									/>

									<FormField
										control={preferencesForm.control}
										name="pushNotifications"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Push Notifications</Label>
													<p className="text-sm text-muted-foreground">
														Receive push notifications on your device
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle push notifications"
												/>
											</div>
										)}
									/>
								</div>
							</FormSection>

							<FormSection
								title="Notification Types"
								description="Choose which types of notifications to receive">
								<div className="space-y-4">
									<FormField
										control={preferencesForm.control}
										name="scheduleUpdates"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Schedule Updates</Label>
													<p className="text-sm text-muted-foreground">
														Notifications about schedule changes
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle schedule update notifications"
												/>
											</div>
										)}
									/>

									<FormField
										control={preferencesForm.control}
										name="shiftReminders"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Shift Reminders</Label>
													<p className="text-sm text-muted-foreground">
														Reminders about upcoming shifts
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle shift reminders"
												/>
											</div>
										)}
									/>

									<FormField
										control={preferencesForm.control}
										name="systemAnnouncements"
										render={({ field }) => (
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>System Announcements</Label>
													<p className="text-sm text-muted-foreground">
														Important updates about the system
													</p>
												</div>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													aria-label="Toggle system announcements"
												/>
											</div>
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
				</div>
			)}

			{/* Shifts Tab Content */}
			{activeTab === "shifts" && user?.id && (
				<div className="md:col-span-3">
					<ShiftsSection userId={user.id} />
				</div>
			)}

			{/* Branding Tab Content */}
			{activeTab === "branding" && (
				<div className="md:col-span-3">
					<Form {...brandingForm}>
						<form
							onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}
							className="space-y-6">
							<FormSection
								title="Logo"
								description="Upload your organization's logo">
								<div className="flex items-start gap-6">
									<div className="flex-shrink-0 w-24 h-24 rounded-md border flex items-center justify-center overflow-hidden">
										{logoPreview ? (
											<img
												src={logoPreview}
												alt="Logo preview"
												className="w-full h-full object-contain"
											/>
										) : (
											<Image className="w-8 h-8 text-muted-foreground" />
										)}
									</div>

									<div className="flex flex-col gap-3">
										<label
											htmlFor="logo-upload"
											className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
											<Upload className="mr-2 h-4 w-4" />
											Upload Logo
											<input
												id="logo-upload"
												type="file"
												accept="image/*"
												className="sr-only"
												onChange={handleLogoChange}
											/>
										</label>

										{logoPreview && (
											<Button
												type="button"
												variant="outline"
												onClick={handleRemoveLogo}
												className="justify-start">
												<Trash2 className="mr-2 h-4 w-4" />
												Remove Logo
											</Button>
										)}

										<p className="text-xs text-muted-foreground mt-2">
											Recommended: Square image, at least 200x200px.
										</p>
									</div>
								</div>
							</FormSection>

							<FormSection
								title="Brand Colors"
								description="Choose colors for your organization's branding">
								<div className="space-y-6">
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

			{/* Appearance Tab Content */}
			{activeTab === "appearance" && (
				<div className="space-y-6">
					<ContentSection
						title="Display Settings"
						description="Customize the appearance of your application">
						<div className="space-y-6">
							<ThemeToggle />

							<Separator className="my-4" />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Compact Mode</Label>
									<p className="text-sm text-muted-foreground">
										Use a more compact view with less whitespace
									</p>
								</div>
								<Switch
									id="compact-mode"
									// These handlers would be implemented later
									checked={false}
									onCheckedChange={() => {}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Reduce Motion</Label>
									<p className="text-sm text-muted-foreground">
										Reduce animations and transitions throughout the app
									</p>
								</div>
								<Switch
									id="reduce-motion"
									// These handlers would be implemented later
									checked={false}
									onCheckedChange={() => {}}
								/>
							</div>
						</div>
					</ContentSection>
				</div>
			)}
		</SecondaryLayout>
	);
}
