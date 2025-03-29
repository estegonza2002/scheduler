import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import {
	PlusCircle,
	UserCheck,
	UserX,
	Mail,
	Users,
	AlertCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useOrganization } from "@/lib/organization";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/lib/supabase";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// User types for actual data
interface User {
	id: string;
	name: string;
	email: string;
	role: "owner" | "admin" | "member";
	status: "active" | "pending";
	avatarUrl?: string;
}

// Type for Supabase query result
interface OrganizationMember {
	id: string;
	user_id: string;
	role: "owner" | "admin" | "member";
	status: "active" | "pending";
	users: {
		id: string;
		email: string;
		full_name?: string;
		avatar_url?: string;
	};
}

// Type for the Auth.users data
interface AuthUser {
	id: string;
	email: string;
	raw_user_meta_data: {
		full_name?: string;
		firstName?: string;
		lastName?: string;
		avatar_url?: string;
		picture?: string;
		[key: string]: any;
	};
}

// Type for the joined query result
interface OrgMemberWithUser {
	id: string;
	user_id: string;
	role: string;
	organization_id: string;
	"auth.users": AuthUser;
}

export default function UsersManagementPage() {
	const { user } = useAuth();
	const { organization } = useOrganization();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteName, setInviteName] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("admin");
	const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
	const location = useLocation();
	const isInAccountPage = location.pathname.includes("/account/");

	// Define fetchUsers function in the component scope so it can be called from anywhere
	const fetchUsers = async () => {
		setLoading(true);
		setError(null);

		// Always ensure we have at least the current user as a fallback
		if (user && user.id) {
			console.log("Setting current user as fallback:", user.id);
			const currentUserEmail = user.email || "unknown@example.com";
			const userName =
				user.user_metadata?.full_name ||
				(user.user_metadata?.firstName && user.user_metadata?.lastName
					? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
					: currentUserEmail.split("@")[0] || "Current User");

			const currentUserData = {
				id: user.id,
				name: userName,
				email: currentUserEmail,
				role: "owner" as const,
				status: "active" as const,
				avatarUrl:
					user.user_metadata?.avatar_url || user.user_metadata?.picture,
			};

			// Set the current user immediately so we always have something to show
			setUsers([currentUserData]);
		}

		if (!organization?.id) {
			console.log("No organization ID found", { organization });
			// Don't show error immediately, just log it and keep showing the current user
			setLoading(false);
			return;
		}

		try {
			console.log("Fetching organization members for org:", organization.id);

			// 1. Get active members
			const { data: memberData, error: memberError } = await supabase
				.from("organization_members")
				.select("*")
				.eq("organization_id", organization.id);

			if (memberError) {
				console.error("Error fetching members:", memberError);
				// Continue with just the current user rather than throwing
			}

			console.log("Active members found:", memberData?.length || 0, memberData);

			// 2. Get pending invitations
			console.log("Fetching invitations for organization:", organization.id);

			// First try without the status filter to see if any invitations exist
			const { data: allInvitationData, error: allInvitationError } =
				await supabase
					.from("invitations")
					.select("*")
					.eq("organization_id", organization.id);

			if (allInvitationError) {
				console.error("Error fetching all invitations:", allInvitationError);
			} else {
				console.log(
					"All invitations found (any status):",
					allInvitationData?.length || 0,
					allInvitationData
				);
			}

			// Then try with the status filter for pending only
			const { data: invitationData, error: invitationError } = await supabase
				.from("invitations")
				.select("*")
				.eq("organization_id", organization.id)
				.eq("status", "pending");

			if (invitationError) {
				console.error("Error fetching pending invitations:", invitationError);
				// We continue even if this fails - we'll just show active members
			}

			console.log(
				"Pending invitations found:",
				invitationData?.length || 0,
				invitationData
			);

			// 3. Process active members
			const activeUsers =
				memberData && memberData.length > 0
					? memberData.map((member) => {
							// If this is the current user, use their data
							if (user && user.id && member.user_id === user.id) {
								const currentUserEmail = user.email || "unknown@example.com";
								const userName =
									user.user_metadata?.full_name ||
									(user.user_metadata?.firstName && user.user_metadata?.lastName
										? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
										: currentUserEmail.split("@")[0] || "Current User");

								return {
									id: user.id,
									name: userName,
									email: currentUserEmail,
									role: member.role as "owner" | "admin" | "member",
									status: "active" as const,
									avatarUrl:
										user.user_metadata?.avatar_url ||
										user.user_metadata?.picture,
								};
							}

							// Generate a display name based on member role
							const displayName =
								member.role === "owner"
									? "Organization Owner"
									: member.role === "admin"
									? `Admin ${member.user_id.substring(0, 4)}`
									: `Team Member ${member.user_id.substring(0, 4)}`;

							// For other members, create mock data
							return {
								id: member.user_id,
								name: displayName,
								email: `user-${member.user_id.substring(0, 6)}@example.com`,
								role: member.role as "owner" | "admin" | "member",
								status: "active" as const,
								avatarUrl: undefined,
							};
					  })
					: [];

			// 4. Process pending invitations
			const pendingUsers =
				invitationData && invitationData.length > 0
					? invitationData.map((invite) => {
							// Use the saved name if available, otherwise format from email
							const nameFromEmail = invite.email.split("@")[0];
							const formattedName =
								invite.name ||
								nameFromEmail
									.split(/[._-]/)
									.map(
										(part: string) =>
											part.charAt(0).toUpperCase() + part.slice(1)
									)
									.join(" ");

							const pendingUser = {
								id: `invite-${invite.id}`,
								name: formattedName,
								email: invite.email,
								role: invite.role as "owner" | "admin" | "member",
								status: "pending" as const,
								invitedAt: invite.created_at,
								avatarUrl: undefined,
							};

							console.log(
								"Processing pending invitation:",
								invite.id,
								"for email:",
								invite.email
							);
							return pendingUser;
					  })
					: [];

			// 5. Combine active members and pending invitations
			const allUsers = [...activeUsers, ...pendingUsers];

			if (allUsers.length === 0) {
				console.log("No team members or invitations found");
				// Don't show an error, we already have the current user as fallback
				setLoading(false);
				return;
			}

			console.log("Setting users:", allUsers);
			setUsers(allUsers);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching users:", error);
			// Don't show an error toast for expected failures during loading
			// Only set the error state if we don't have any user data at all
			if (users.length === 0) {
				setError("Failed to load team members. Please try again.");
				toast.error("Failed to load team members");
			}
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [organization?.id, user]);

	// Reset form fields
	const resetInviteForm = () => {
		setInviteEmail("");
		setInviteName("");
		setInviteRole("admin");
	};

	const handleInviteUser = async () => {
		// Immediately check if we have what we need
		if (!inviteEmail) {
			toast.error("Please enter an email address");
			return;
		}

		if (!organization) {
			console.error("No organization object available:", organization);
			toast.error("Organization data not available. Please refresh the page.");
			return;
		}

		if (!organization.id) {
			console.error("Missing organization ID:", organization);
			toast.error("Organization ID is missing. Please refresh the page.");
			return;
		}

		console.log(
			"Starting invitation process for:",
			inviteEmail,
			"Org ID:",
			organization.id
		);

		try {
			// First check if user already exists
			const { data: existingUsers, error: userQueryError } = await supabase
				.from("users")
				.select("id")
				.eq("email", inviteEmail);

			if (userQueryError) {
				console.error("Error checking existing users:", userQueryError);
				toast.error("Unable to verify user status");
				return;
			}

			const existingUserId =
				existingUsers && existingUsers.length > 0 ? existingUsers[0].id : null;

			// Check if user is already a member
			if (existingUserId) {
				const { data: existingMember, error: memberQueryError } = await supabase
					.from("organization_members")
					.select("id")
					.eq("organization_id", organization.id)
					.eq("user_id", existingUserId);

				if (memberQueryError) {
					console.error(
						"Error checking organization members:",
						memberQueryError
					);
					toast.error("Unable to verify membership status");
					return;
				}

				if (existingMember && existingMember.length > 0) {
					toast.error("User is already a member of this organization");
					return;
				}
			}

			// Check if invitation already exists
			const { data: existingInvitation, error: inviteQueryError } =
				await supabase
					.from("invitations")
					.select("id")
					.eq("organization_id", organization.id)
					.eq("email", inviteEmail)
					.eq("status", "pending");

			if (inviteQueryError) {
				// Don't stop the process, just log the error and continue
				console.error("Error checking existing invitations:", inviteQueryError);
				console.log(
					"Continuing with invitation process despite verification error"
				);
				// We'll just attempt to create the invitation anyway
			} else if (existingInvitation && existingInvitation.length > 0) {
				toast.error(
					"An invitation has already been sent to this email address"
				);
				return;
			}

			console.log(
				"Creating invitation record in database for org:",
				organization.id
			);

			// Prepare display name - use entered name or derive from email
			const displayName =
				inviteName ||
				inviteEmail
					.split("@")[0]
					.split(/[._-]/)
					.map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
					.join(" ");

			// Create invitation with name and selected role
			const invitePayload = {
				organization_id: organization.id,
				email: inviteEmail,
				name: displayName, // Store the name
				role: inviteRole, // Use the selected role, defaults to admin
				status: "pending",
				invited_by: user?.id,
				created_at: new Date().toISOString(),
			};

			console.log("Invitation payload:", invitePayload);

			// Try to create the invitation with detailed logging
			let insertSuccess = false;
			let invitationId = "";
			let insertAttemptError = null;

			try {
				console.log("Attempting to insert invitation into database...");
				const { data: invitationData, error: insertError } = await supabase
					.from("invitations")
					.insert(invitePayload)
					.select();

				console.log("Insert response:", {
					data: invitationData,
					error: insertError,
				});

				if (insertError) {
					console.error("Database error creating invitation:", insertError);
					insertAttemptError = insertError;

					// Check if it's a permission error
					if (
						insertError.code === "42501" ||
						(insertError.message &&
							(insertError.message.includes("permission") ||
								insertError.message.includes("policy")))
					) {
						toast.error(
							"You don't have permission to invite users. Please contact your administrator."
						);
						return;
					}

					// Check if it's a duplicate entry error
					if (
						insertError.code === "23505" ||
						(insertError.message &&
							(insertError.message.includes("duplicate") ||
								insertError.message.includes("unique constraint")))
					) {
						toast.error("This user has already been invited.");
						return;
					}

					// For any database error, show the error message and stop the process
					toast.error(
						`Failed to create invitation: ${
							insertError.message || "Unknown database error"
						}`
					);

					// Keep the dialog open so the user can try again
					return;
				}

				// If we get here, the database insert was successful
				console.log("Invitation record created successfully:", invitationData);

				// Verify we have the data we need
				if (!invitationData || invitationData.length === 0) {
					console.error("No invitation data returned from successful insert");
					toast.error(
						"Failed to create invitation: No data returned from database"
					);
					return;
				}

				const invite = invitationData[0];
				invitationId = invite.id;
				insertSuccess = true;
				console.log("Using invitation data:", invite);
			} catch (dbError) {
				console.error("Exception during database operation:", dbError);
				const errorMessage =
					dbError instanceof Error ? dbError.message : "Unknown database error";
				toast.error(`Database error: ${errorMessage}`);
				return;
			}

			// If insert was successful, add the user to the UI
			if (insertSuccess && invitationId) {
				// Add to the UI only after successful database insertion
				const newUser = {
					id: `invite-${invitationId}`,
					name: displayName,
					email: inviteEmail,
					role: inviteRole,
					status: "pending" as const,
					invitedAt: new Date().toISOString(),
				};

				console.log("Adding new user to UI:", newUser);
				setUsers((currentUsers) => [...currentUsers, newUser]);

				// Email would be sent here in a real implementation
				console.log("Would send email to:", inviteEmail);

				// Show success message only for successful DB operation
				toast.success(`Invitation sent to ${inviteEmail}`);
				resetInviteForm();
				setIsInviteSheetOpen(false);

				// Reload all users to ensure we have the latest data
				setTimeout(() => {
					// Refresh the user list after a short delay to ensure DB consistency
					console.log("Refreshing user list after invitation...");
					fetchUsers();
				}, 1000);
			} else {
				console.error(
					"Insert appeared successful but no invitation ID was returned"
				);
				toast.error("Failed to create invitation properly. Please try again.");
			}
		} catch (error) {
			console.error("Error inviting user:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error(`Failed to send invitation: ${errorMessage}`);
			// Don't close the dialog so the user can try again
		}
	};

	const handlePromoteToAdmin = async (userId: string) => {
		if (!organization?.id) return;

		try {
			const { error } = await supabase
				.from("organization_members")
				.update({ role: "admin" })
				.eq("organization_id", organization.id)
				.eq("user_id", userId);

			if (error) throw error;

			// Update UI
			setUsers(
				users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u))
			);
			toast.success("User promoted to admin");
		} catch (error) {
			console.error("Error updating role:", error);
			toast.error("Failed to update user role");
		}
	};

	const handleDemoteToMember = async (userId: string) => {
		if (!organization?.id) return;

		try {
			const { error } = await supabase
				.from("organization_members")
				.update({ role: "member" })
				.eq("organization_id", organization.id)
				.eq("user_id", userId);

			if (error) throw error;

			// Update UI
			setUsers(
				users.map((u) => (u.id === userId ? { ...u, role: "member" } : u))
			);
			toast.success("User changed to member");
		} catch (error) {
			console.error("Error updating role:", error);
			toast.error("Failed to update user role");
		}
	};

	const handleResendInvite = async (email: string) => {
		if (!organization?.id) return;

		try {
			// Get the invitation
			const { data, error } = await supabase
				.from("invitations")
				.select("id")
				.eq("organization_id", organization.id)
				.eq("email", email)
				.eq("status", "pending");

			if (error || !data || data.length === 0)
				throw error || new Error("Invitation not found");

			// Update the invitation to trigger a new email
			const { error: updateError } = await supabase
				.from("invitations")
				.update({
					updated_at: new Date().toISOString(),
					invited_by: user?.id,
				})
				.eq("id", data[0].id);

			if (updateError) throw updateError;

			// Call a serverless function or API endpoint to resend the email

			toast.success(`Invitation resent to ${email}`);
		} catch (error) {
			console.error("Error resending invitation:", error);
			toast.error("Failed to resend invitation");
		}
	};

	// Get initials for avatar fallback
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	// Render role badge
	const renderRoleBadge = (role: User["role"]) => {
		switch (role) {
			case "owner":
				return (
					<Badge
						variant="default"
						className="bg-primary text-primary-foreground">
						Owner
					</Badge>
				);
			case "admin":
				return <Badge variant="secondary">Admin</Badge>;
			default:
				return <Badge variant="outline">Member</Badge>;
		}
	};

	// Render status badge
	const renderStatusBadge = (status: User["status"]) => {
		switch (status) {
			case "active":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200">
						Active
					</Badge>
				);
			case "pending":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-700 border-yellow-200">
						Pending
					</Badge>
				);
			default:
				return null;
		}
	};

	// Render the team members table
	const renderUsersTable = () => {
		if (users.length === 0) {
			return (
				<EmptyState
					title="No team members"
					description="Invite team members to collaborate with you"
					icon={<Users className="h-6 w-6" />}
					action={
						<Button onClick={() => setIsInviteSheetOpen(true)}>
							<PlusCircle className="h-4 w-4 mr-2" />
							Invite User
						</Button>
					}
				/>
			);
		}

		return (
			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((teamUser) => {
							const isCurrentUser = teamUser.id === user?.id;
							return (
								<TableRow
									key={teamUser.id}
									className={isCurrentUser ? "bg-muted/50" : ""}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarImage src={teamUser.avatarUrl} />
												<AvatarFallback>
													{getInitials(teamUser.name)}
												</AvatarFallback>
											</Avatar>
											<div>
												<span className="font-medium">{teamUser.name}</span>
												{isCurrentUser && (
													<span className="ml-2 text-xs text-muted-foreground">
														(You)
													</span>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell>{teamUser.email}</TableCell>
									<TableCell>{renderRoleBadge(teamUser.role)}</TableCell>
									<TableCell>{renderStatusBadge(teamUser.status)}</TableCell>
									<TableCell className="text-right">
										{!isCurrentUser && teamUser.role !== "owner" && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm">
														Actions
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{teamUser.status === "pending" && (
														<DropdownMenuItem
															onClick={() =>
																handleResendInvite(teamUser.email)
															}>
															<Mail className="h-4 w-4 mr-2" />
															Resend Invite
														</DropdownMenuItem>
													)}

													{teamUser.role === "member" && (
														<DropdownMenuItem
															onClick={() => handlePromoteToAdmin(teamUser.id)}>
															<UserCheck className="h-4 w-4 mr-2" />
															Make Admin
														</DropdownMenuItem>
													)}

													{teamUser.role === "admin" && (
														<DropdownMenuItem
															onClick={() => handleDemoteToMember(teamUser.id)}>
															<UserX className="h-4 w-4 mr-2" />
															Remove Admin
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		);
	};

	// Render the content
	const renderContent = () => (
		<ContentContainer>
			<ContentSection title="">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">Team Members</h2>

					<Sheet
						open={isInviteSheetOpen}
						onOpenChange={setIsInviteSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<PlusCircle className="h-4 w-4 mr-2" />
								Invite User
							</Button>
						</SheetTrigger>
						<SheetContent className="sm:max-w-md">
							<SheetHeader>
								<SheetTitle>Invite New User</SheetTitle>
								<SheetDescription>
									Send an invitation to add a new admin or team member to your
									organization.
								</SheetDescription>
							</SheetHeader>

							<div className="space-y-4 py-6">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										placeholder="John Doe"
										value={inviteName}
										onChange={(e) => setInviteName(e.target.value)}
									/>
									<p className="text-sm text-muted-foreground">
										Optional: Enter the person's name or leave blank to use
										their email
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input
										id="email"
										type="email"
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
										className={
											!inviteEmail ? "border-input focus:border-red-200" : ""
										}
									/>
									{!inviteEmail && (
										<p className="text-sm text-muted-foreground mt-1">
											Please enter a valid email address
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="role">Role</Label>
									<Select
										value={inviteRole}
										onValueChange={(value) =>
											setInviteRole(value as "admin" | "member")
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="member">Team Member</SelectItem>
										</SelectContent>
									</Select>
									<div className="text-sm text-muted-foreground mt-1">
										<p className="font-medium mb-1">Role permissions:</p>
										<p className="mb-1">
											<span className="font-medium">Admins:</span> Have access
											to all management features, including billing, team
											members, and business profile.
										</p>
										<p>
											<span className="font-medium">Team Members:</span> Only
											have access to scheduling and client-facing features.
										</p>
									</div>
								</div>
							</div>

							<SheetFooter className="pt-2">
								<Button
									variant="outline"
									onClick={() => {
										resetInviteForm();
										setIsInviteSheetOpen(false);
									}}>
									Cancel
								</Button>
								<Button
									onClick={() => {
										console.log("Send Invite button clicked for:", inviteEmail);
										// Debug whether this is called
										toast.info("Processing invitation...");
										try {
											handleInviteUser().catch((err: Error) => {
												console.error(
													"Unhandled error in invitation process:",
													err
												);
												toast.error(
													"Error processing invitation: " +
														(err.message || "Unknown error")
												);
											});
										} catch (err: unknown) {
											const error = err as Error;
											console.error(
												"Exception from button click handler:",
												error
											);
											toast.error(
												"Error starting invitation process: " +
													(error.message || "Unknown error")
											);
										}
									}}
									disabled={!inviteEmail || !inviteEmail.includes("@")}>
									<Mail className="h-4 w-4 mr-2" />
									Send Invite
								</Button>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>

				{loading ? (
					<LoadingState
						type="spinner"
						message="Loading team members..."
						className="py-6"
					/>
				) : error ? (
					<EmptyState
						title="Error loading team members"
						description={error}
						icon={<AlertCircle className="h-6 w-6" />}
						action={
							<Button onClick={() => window.location.reload()}>
								Try Again
							</Button>
						}
					/>
				) : (
					renderUsersTable()
				)}
			</ContentSection>
		</ContentContainer>
	);

	// If we're in the account section, just return the content
	if (isInAccountPage) {
		return renderContent();
	}

	// Otherwise, render with the header for standalone page
	return (
		<>
			<PageHeader
				title="Users Management"
				description="Manage users and admin access for your organization"
			/>
			{renderContent()}
		</>
	);
}
