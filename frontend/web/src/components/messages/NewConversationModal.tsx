import { useState } from "react";
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

type NewConversationModalProps = {
	onStartConversation: (userId: string, isGroup?: boolean) => void;
};

type User = {
	id: string;
	name: string;
	avatar: string;
	role: string;
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
}: NewConversationModalProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [groupName, setGroupName] = useState("");
	const { user } = useAuth();

	// Mock users data - in a real app, this would come from an API
	const users: User[] = [
		{
			id: "user-1",
			name: "John Smith",
			avatar: "",
			role: "Front Desk",
		},
		{
			id: "user-2",
			name: "Emma Johnson",
			avatar: "",
			role: "Kitchen Staff",
		},
		{
			id: "user-3",
			name: "Michael Brown",
			avatar: "",
			role: "Wait Staff",
		},
		{
			id: "user-4",
			name: "Lisa Davis",
			avatar: "",
			role: "Manager",
		},
	];

	// Mock groups data
	const groups: Group[] = [
		{
			id: "group-1",
			name: "Front Desk Team",
			description: "All front desk staff members",
			avatar: "",
			memberCount: 5,
		},
		{
			id: "group-2",
			name: "Kitchen Staff",
			description: "Kitchen and food preparation team",
			avatar: "",
			memberCount: 8,
		},
		{
			id: "group-3",
			name: "Wait Staff",
			description: "All waiters and waitresses",
			avatar: "",
			memberCount: 12,
		},
	];

	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.role.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredGroups = groups.filter(
		(group) =>
			group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			group.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleStartOneOnOne = (userId: string) => {
		onStartConversation(userId, false);
		setOpen(false);
	};

	const handleStartGroup = () => {
		if (selectedUsers.length > 0 && groupName.trim()) {
			onStartConversation(groupName, true);
			setOpen(false);
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
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full">
					<Plus className="h-4 w-4 mr-2" />
					New Conversation
				</Button>
			</DialogTrigger>
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
							<ScrollArea className="h-[300px]">
								<div className="space-y-2">
									{filteredUsers.map((user) => (
										<Button
											key={user.id}
											variant="ghost"
											className="w-full justify-start gap-3 h-auto py-3"
											onClick={() => handleStartOneOnOne(user.id)}>
											<Avatar>
												<AvatarImage src={user.avatar} />
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start">
												<span className="font-medium">{user.name}</span>
												<span className="text-xs text-muted-foreground">
													{user.role}
												</span>
											</div>
										</Button>
									))}
								</div>
							</ScrollArea>
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
									<ScrollArea className="h-[200px]">
										<div className="space-y-2">
											{filteredUsers.map((user) => (
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
															{user.role}
														</span>
													</div>
													{selectedUsers.includes(user.id) && (
														<Check className="h-4 w-4 ml-auto" />
													)}
												</Button>
											))}
										</div>
									</ScrollArea>
								</div>
								<Button
									className="w-full"
									onClick={handleStartGroup}
									disabled={selectedUsers.length === 0 || !groupName.trim()}>
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
