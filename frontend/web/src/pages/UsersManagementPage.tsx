import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppContent } from "@/components/layout/AppLayout";
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
import { useHeader } from "@/lib/header-context";
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

// Import new APIs
import { UserAPI, OrganizationMembersAPI } from "@/api";
// Import UserProfile type if needed for mapping
import { UserProfile } from "@/api/types";
// Correct the Firebase User type import and alias it
import { User as FirebaseUser } from "firebase/auth";

// Adjusted User type for page state
interface User {
	id: string; // Firebase User UID or Invite ID
	memberDocId?: string; // Firestore document ID for organizationMembers entry (for updates/deletes)
	name: string;
	email: string;
	role: "owner" | "admin" | "member";
	status: "active" | "pending"; // Keep status for pending invites
	avatarUrl?: string;
	// invitedAt?: string; // Maybe needed if we implement invites properly
}

export default function UsersManagementPage() {
	const { user: firebaseUser } = useAuth(); // Alias the user from useAuth
	const { organization } = useOrganization(); // Using the refactored context
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteName, setInviteName] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("admin");
	const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
	const location = useLocation();
	const isInAccountPage = location.pathname.includes("/account/");
	const { updateHeader } = useHeader();

	// Set page header if not in account page
	useEffect(() => {
		if (!isInAccountPage) {
			updateHeader({
				title: "Users Management",
				description: "Manage users and admin access for your organization",
			});
		}
	}, [updateHeader, isInAccountPage]);

	// Refactored fetchUsers
	const fetchUsers = async () => {
		setLoading(true);
		setError(null);

		if (!organization?.id) {
			console.log("No organization ID found", { organization });
			setLoading(false);
			return;
		}

		try {
			console.log("Fetching organization members for org:", organization.id);

			// 1. Get organization member entries
			const memberEntries = await OrganizationMembersAPI.getAllByOrgId(
				organization.id
			);
			console.log("Fetched member entries:", memberEntries);

			if (!memberEntries || memberEntries.length === 0) {
				console.log("No members found for this organization.");
				setUsers([]);
				setLoading(false);
				return;
			}

			// 2. Fetch user profiles for each member
			const userProfilePromises = memberEntries.map(
				(member) => UserAPI.getProfile(member.userId) // Assuming member object has userId field
			);
			const userProfiles = await Promise.all(userProfilePromises);
			console.log("Fetched user profiles:", userProfiles);

			// 3. Combine member data and user profile data
			const combinedUsers: User[] = memberEntries
				.map((member, index) => {
					const profile = userProfiles[index];

					// Determine name and avatar
					let name = "Unknown User";
					let avatarUrl: string | undefined = undefined;
					if (profile) {
						name =
							profile.displayName ||
							profile.email ||
							`User ${member.userId.substring(0, 6)}`;
						avatarUrl = profile.photoURL;
					} else if (member.userId === firebaseUser?.uid) {
						// Fallback for current user if profile fetch failed
						name =
							firebaseUser?.displayName ||
							firebaseUser?.email ||
							"Current User";
						avatarUrl = firebaseUser?.photoURL || undefined;
					}

					return {
						id: member.userId, // Use Firebase User UID as primary ID
						memberDocId: member.id, // Store Firestore document ID for role updates/deletes
						name: name,
						email: profile?.email || member.email || "unknown@example.com", // Need member.email if invite stored it
						role: member.role as "owner" | "admin" | "member", // Assuming role is stored on member entry
						status: (member.status || "active") as "active" | "pending", // Default to active if status missing
						avatarUrl: avatarUrl,
					};
				})
				.filter((u) => u); // Filter out any null/undefined results

			console.log("Setting combined users:", combinedUsers);
			setUsers(combinedUsers);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching users:", error);
			setError("Failed to load team members. Please try again.");
			toast.error("Failed to load team members");
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [organization?.id]); // Removed user dependency, fetchUsers now gets all members for the org

	// Reset form fields
	const resetInviteForm = () => {
		setInviteEmail("");
		setInviteName("");
		setInviteRole("admin");
	};

	// Refactored handleInviteUser (Placeholder)
	const handleInviteUser = async () => {
		if (!inviteEmail) {
			toast.error("Please enter an email address");
			return;
		}
		if (!organization?.id) {
			toast.error("Organization data not available. Please refresh the page.");
			return;
		}
		if (!firebaseUser?.uid) {
			toast.error("Authentication error. Please log in again.");
			return;
		}

		console.log("Attempting to invite user:", inviteEmail, "Role:", inviteRole);

		// TODO: Full invite implementation needed
		// 1. Check if email already exists in Firebase Auth (optional, depends on flow)
		// 2. Check if user is already a member using OrganizationMembersAPI.getByUserIdAndOrgId (needs lookup by email first)
		// 3. Call OrganizationMembersAPI.inviteUser (or Cloud Function)
		const result = await OrganizationMembersAPI.inviteUser(
			organization.id,
			inviteEmail,
			inviteRole,
			firebaseUser.uid
		);

		if (result) {
			// Assuming inviteUser adds a pending user and returns it
			// We would add this pending user to the local state `users`
			toast.success(`Invitation sent to ${inviteEmail}`);
			resetInviteForm();
			setIsInviteSheetOpen(false);
			// Optionally refresh the list
			fetchUsers();
		} else {
			// Error handled within inviteUser placeholder or specific checks above
			console.log("Invite user failed or not implemented.");
		}
	};

	// Refactored role change handlers
	const handlePromoteToAdmin = async (memberDocId: string | undefined) => {
		if (!memberDocId) {
			toast.error("Cannot update role: Member identifier missing.");
			return;
		}
		await OrganizationMembersAPI.updateRole(memberDocId, "admin");
		// Optimistic UI update or refetch
		setUsers(
			users.map((u) =>
				u.memberDocId === memberDocId ? { ...u, role: "admin" } : u
			)
		);
	};

	const handleDemoteToMember = async (memberDocId: string | undefined) => {
		if (!memberDocId) {
			toast.error("Cannot update role: Member identifier missing.");
			return;
		}
		await OrganizationMembersAPI.updateRole(memberDocId, "member");
		// Optimistic UI update or refetch
		setUsers(
			users.map((u) =>
				u.memberDocId === memberDocId ? { ...u, role: "member" } : u
			)
		);
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
		if (loading) {
			return (
				<LoadingState
					type="spinner"
					message="Loading team members..."
					className="py-6"
				/>
			);
		}

		if (error) {
			return (
				<EmptyState
					title="Error loading team members"
					description={error}
					icon={<AlertCircle className="h-6 w-6" />}
					action={
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					}
				/>
			);
		}

		if (!users.length) {
			return (
				<EmptyState
					title="No team members"
					description="You haven't added any team members yet."
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
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[250px]">User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.avatarUrl}
												alt={user.name}
											/>
											<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium">{user.name}</div>
											<div className="text-sm text-muted-foreground">
												{user.email}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>{renderRoleBadge(user.role)}</TableCell>
								<TableCell>{renderStatusBadge(user.status)}</TableCell>
								<TableCell className="text-right">
									{user.id !== firebaseUser?.uid && user.role !== "owner" && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm">
													Actions
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												{user.role === "member" && (
													<DropdownMenuItem
														onClick={() =>
															handlePromoteToAdmin(user.memberDocId)
														} // Pass memberDocId
													>
														<UserCheck className="mr-2 h-4 w-4" />
														Promote to Admin
													</DropdownMenuItem>
												)}
												{user.role === "admin" && (
													<DropdownMenuItem
														onClick={() =>
															handleDemoteToMember(user.memberDocId)
														} // Pass memberDocId
													>
														<UserX className="mr-2 h-4 w-4" />
														Demote to Member
													</DropdownMenuItem>
												)}
												{/* Remove User Option */}
												<DropdownMenuItem
													className="text-red-600"
													onClick={() => {
														if (
															window.confirm(
																`Are you sure you want to remove ${user.name}?`
															)
														) {
															OrganizationMembersAPI.removeMember(
																user.memberDocId!
															).then((success) => {
																if (success) {
																	// Optimistic UI update or refetch
																	setUsers(
																		users.filter(
																			(u) => u.memberDocId !== user.memberDocId
																		)
																	);
																}
															});
														}
													}}>
													<UserX className="mr-2 h-4 w-4" />
													Remove User
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	// Render the content
	const renderContent = () => (
		<AppContent>
			<ContentSection
				title="Users & Permissions"
				description="Manage access to your organization"
				headerActions={
					<Sheet
						open={isInviteSheetOpen}
						onOpenChange={setIsInviteSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<PlusCircle className="h-4 w-4 mr-2" />
								Invite User
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Invite a User</SheetTitle>
								<SheetDescription>
									Send an invitation to join your organization.
								</SheetDescription>
							</SheetHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										placeholder="Full name"
										value={inviteName}
										onChange={(e) => setInviteName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="Email address"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
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
											<SelectItem value="admin">Administrator</SelectItem>
											<SelectItem value="member">Team Member</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<SheetFooter>
								<Button
									variant="outline"
									onClick={() => setIsInviteSheetOpen(false)}>
									Cancel
								</Button>
								<Button
									type="submit"
									onClick={() => {
										handleInviteUser();
									}}>
									Send Invite
								</Button>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				}>
				{renderUsersTable()}
			</ContentSection>
		</AppContent>
	);

	// If we're in the account section, just return the content
	if (isInAccountPage) {
		return renderContent();
	}

	// Otherwise, render with the header for standalone page
	return renderContent();
}
