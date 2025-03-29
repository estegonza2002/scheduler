import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { ContentContainer } from "@/components/ui/content-container";
import { ContentSection } from "@/components/ui/content-section";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck, UserX, Mail } from "lucide-react";
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

// Mock user types for demonstration - will be replaced with actual API types
interface User {
	id: string;
	name: string;
	email: string;
	role: "owner" | "admin" | "member";
	status: "active" | "pending";
	avatarUrl?: string;
}

// Mock data for demonstration - will be replaced with API calls
const mockUsers: User[] = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		role: "owner",
		status: "active",
		avatarUrl: "https://i.pravatar.cc/150?u=1",
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "admin",
		status: "active",
		avatarUrl: "https://i.pravatar.cc/150?u=2",
	},
	{
		id: "3",
		name: "Mike Johnson",
		email: "mike@example.com",
		role: "member",
		status: "active",
	},
	{
		id: "4",
		name: "Sarah Williams",
		email: "sarah@example.com",
		role: "member",
		status: "pending",
	},
];

export default function UsersManagementPage() {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [inviteEmail, setInviteEmail] = useState("");
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

	useEffect(() => {
		// Simulate API loading
		const loadUsers = async () => {
			try {
				setLoading(true);
				// In a real app, this would be an API call
				// const response = await UsersAPI.getAll();
				// setUsers(response);

				// Using mock data for now
				setTimeout(() => {
					setUsers(mockUsers);
					setLoading(false);
				}, 1000);
			} catch (error) {
				console.error("Error loading users:", error);
				toast.error("Failed to load users");
				setLoading(false);
			}
		};

		loadUsers();
	}, []);

	const handleInviteUser = async () => {
		if (!inviteEmail) {
			toast.error("Please enter an email address");
			return;
		}

		try {
			// In a real app, this would call an API
			// await UsersAPI.inviteUser({ email: inviteEmail, role: "member" });

			// Simulate successful invite
			toast.success(`Invitation sent to ${inviteEmail}`);

			// Add to the UI immediately for demo purposes
			setUsers([
				...users,
				{
					id: `temp-${Date.now()}`,
					name: inviteEmail.split("@")[0],
					email: inviteEmail,
					role: "member",
					status: "pending",
				},
			]);

			setInviteEmail("");
			setIsInviteDialogOpen(false);
		} catch (error) {
			console.error("Error inviting user:", error);
			toast.error("Failed to send invitation");
		}
	};

	const handlePromoteToAdmin = (userId: string) => {
		// In a real app, this would call an API
		// await UsersAPI.updateRole(userId, "admin");

		// Update UI
		setUsers(users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));

		toast.success("User promoted to admin");
	};

	const handleDemoteToMember = (userId: string) => {
		// In a real app, this would call an API
		// await UsersAPI.updateRole(userId, "member");

		// Update UI
		setUsers(
			users.map((u) => (u.id === userId ? { ...u, role: "member" } : u))
		);

		toast.success("User changed to member");
	};

	const handleResendInvite = (email: string) => {
		// In a real app, this would call an API
		// await UsersAPI.resendInvite(email);

		toast.success(`Invitation resent to ${email}`);
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

	return (
		<>
			<PageHeader
				title="Users Management"
				description="Manage users and admin access for your organization"
			/>

			<ContentContainer>
				<ContentSection title="Team Members">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-semibold">Team Members</h2>

						<Dialog
							open={isInviteDialogOpen}
							onOpenChange={setIsInviteDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<PlusCircle className="h-4 w-4 mr-2" />
									Invite User
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite New User</DialogTitle>
									<DialogDescription>
										Send an email invitation to add a new user to your team.
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<Input
											id="email"
											type="email"
											placeholder="colleague@example.com"
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
										/>
									</div>
								</div>

								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setIsInviteDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleInviteUser}>
										<Mail className="h-4 w-4 mr-2" />
										Send Invite
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					{loading ? (
						<LoadingState
							type="spinner"
							message="Loading users..."
						/>
					) : (
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
									{users.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar>
														<AvatarImage src={user.avatarUrl} />
														<AvatarFallback>
															{getInitials(user.name)}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium">{user.name}</span>
												</div>
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{renderRoleBadge(user.role)}</TableCell>
											<TableCell>{renderStatusBadge(user.status)}</TableCell>
											<TableCell className="text-right">
												{user.role !== "owner" && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="sm">
																Actions
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{user.status === "pending" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleResendInvite(user.email)
																	}>
																	<Mail className="h-4 w-4 mr-2" />
																	Resend Invite
																</DropdownMenuItem>
															)}

															{user.role === "member" && (
																<DropdownMenuItem
																	onClick={() => handlePromoteToAdmin(user.id)}>
																	<UserCheck className="h-4 w-4 mr-2" />
																	Make Admin
																</DropdownMenuItem>
															)}

															{user.role === "admin" && (
																<DropdownMenuItem
																	onClick={() => handleDemoteToMember(user.id)}>
																	<UserX className="h-4 w-4 mr-2" />
																	Remove Admin
																</DropdownMenuItem>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</ContentSection>
			</ContentContainer>
		</>
	);
}
