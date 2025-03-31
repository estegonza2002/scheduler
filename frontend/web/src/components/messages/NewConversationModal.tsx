import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, Search, User, Users, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "../../lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { EmployeesAPI, Employee } from "@/api";
import { LoadingState } from "../ui/loading-state";
import { useOrganization } from "@/lib/organization-context";
import { toast } from "sonner";

type NewConversationModalProps = {
	onStartConversation: (userId: string, isGroup?: boolean) => void;
	isOpen?: boolean;
	onClose?: () => void;
	trigger?: React.ReactNode;
};

type User = {
	id: string;
	name: string;
	avatar: string;
	position: string;
};

type Group = {
	id: string;
	name: string;
	description: string;
	avatar: string;
	memberCount: number;
};

export function NewConversationModal({
	onStartConversation,
	isOpen,
	onClose,
	trigger,
}: NewConversationModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [groupName, setGroupName] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const { user } = useAuth();
	const { getCurrentOrganizationId } = useOrganization();

	// Use external open state if provided, otherwise use internal state
	const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
	const setDialogOpen = (value: boolean) => {
		if (isOpen !== undefined && onClose) {
			if (!value) onClose();
		} else {
			setInternalOpen(value);
		}
	};

	// Fetch users when the modal opens
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				setError(null);
				const organizationId = getCurrentOrganizationId();
				const employees = await EmployeesAPI.getAll(organizationId);

				// Map employees to users format
				const mappedUsers = employees.map((employee) => ({
					id: employee.id,
					name: employee.name,
					avatar: employee.avatar || "",
					position: employee.position || "Employee",
				}));

				setUsers(mappedUsers);
			} catch (err) {
				console.error("Error fetching users:", err);
				setError("Failed to load users");
				toast.error("Failed to load users");
			} finally {
				setLoading(false);
			}
		};

		if (dialogOpen) {
			fetchUsers();
		}
	}, [dialogOpen, getCurrentOrganizationId]);

	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.position.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleStartOneOnOne = (userId: string) => {
		onStartConversation(userId, false);
		setDialogOpen(false);
	};

	const handleStartGroup = () => {
		if (selectedUsers.length > 0 && groupName.trim()) {
			onStartConversation(groupName, true);
			setDialogOpen(false);
		}
	};

	const toggleUserSelection = (userId: string) => {
		setSelectedUsers((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	const removeSelectedUser = (userId: string) => {
		setSelectedUsers((prev) => prev.filter((id) => id !== userId));
	};

	const getSelectedUsersList = () => {
		return users.filter((user) => selectedUsers.includes(user.id));
	};

	return (
		<Dialog
			open={dialogOpen}
			onOpenChange={setDialogOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Start New Conversation</DialogTitle>
					<DialogDescription>
						Choose between starting a one-on-one or group conversation
					</DialogDescription>
				</DialogHeader>
				<Tabs
					defaultValue="one-on-one"
					className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="one-on-one">One-on-One</TabsTrigger>
						<TabsTrigger value="group">Group</TabsTrigger>
					</TabsList>
					<div className="mt-4">
						<TabsContent
							value="one-on-one"
							className="mt-0">
							<div className="relative mb-4">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search users..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							{loading ? (
								<LoadingState
									message="Loading users..."
									type="spinner"
									className="py-8"
								/>
							) : error ? (
								<div className="py-8 text-center text-muted-foreground">
									<p className="text-red-500">{error}</p>
									<Button
										variant="outline"
										onClick={() => setDialogOpen(false)}
										className="mt-4">
										Close
									</Button>
								</div>
							) : (
								<ScrollArea className="h-[300px]">
									<div className="space-y-2">
										{filteredUsers.length === 0 ? (
											<div className="py-8 text-center text-muted-foreground">
												<p>No users found</p>
											</div>
										) : (
											filteredUsers.map((user) => (
												<Button
													key={user.id}
													variant="ghost"
													className="w-full justify-start gap-3 h-auto py-3"
													onClick={() => handleStartOneOnOne(user.id)}>
													<Avatar>
														<AvatarImage src={user.avatar} />
														<AvatarFallback>
															{user.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div className="flex flex-col items-start">
														<span className="font-medium">{user.name}</span>
														<span className="text-xs text-muted-foreground">
															{user.position}
														</span>
													</div>
												</Button>
											))
										)}
									</div>
								</ScrollArea>
							)}
						</TabsContent>
						<TabsContent
							value="group"
							className="mt-0">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="group-name">Group Name</Label>
									<Input
										id="group-name"
										placeholder="Enter group name..."
										value={groupName}
										onChange={(e) => setGroupName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>Select Members</Label>
									<div className="relative mb-2">
										<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search users..."
											className="pl-8"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									{selectedUsers.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-4">
											{getSelectedUsersList().map((user) => (
												<Badge
													key={user.id}
													variant="secondary"
													className="flex items-center gap-1">
													<Avatar className="h-4 w-4">
														<AvatarImage src={user.avatar} />
														<AvatarFallback>
															{user.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<span>{user.name}</span>
													<X
														className="h-3 w-3 cursor-pointer"
														onClick={() => removeSelectedUser(user.id)}
													/>
												</Badge>
											))}
										</div>
									)}
									{loading ? (
										<LoadingState
											message="Loading users..."
											type="spinner"
											className="py-8"
										/>
									) : error ? (
										<div className="py-8 text-center text-muted-foreground">
											<p className="text-red-500">{error}</p>
										</div>
									) : (
										<ScrollArea className="h-[200px]">
											<div className="space-y-2">
												{filteredUsers.length === 0 ? (
													<div className="py-8 text-center text-muted-foreground">
														<p>No users found</p>
													</div>
												) : (
													filteredUsers.map((user) => (
														<Button
															key={user.id}
															variant={
																selectedUsers.includes(user.id)
																	? "default"
																	: "ghost"
															}
															className="w-full justify-start gap-3 h-auto py-3"
															onClick={() => toggleUserSelection(user.id)}>
															<Avatar>
																<AvatarImage src={user.avatar} />
																<AvatarFallback>
																	{user.name.charAt(0)}
																</AvatarFallback>
															</Avatar>
															<div className="flex flex-col items-start">
																<span className="font-medium">{user.name}</span>
																<span className="text-xs text-muted-foreground">
																	{user.position}
																</span>
															</div>
															{selectedUsers.includes(user.id) && (
																<Check className="h-4 w-4 ml-auto" />
															)}
														</Button>
													))
												)}
											</div>
										</ScrollArea>
									)}
								</div>
								<Button
									className="w-full"
									onClick={handleStartGroup}
									disabled={
										loading ||
										!!error ||
										selectedUsers.length === 0 ||
										!groupName.trim()
									}>
									Create Group ({selectedUsers.length} members)
								</Button>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
