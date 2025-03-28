import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";

type MessageListProps = {
	type: "chats" | "groups" | "active-shifts" | "one-to-one";
	onSelectConversation: (id: string) => void;
	selectedId: string | null;
	fullWidth?: boolean;
};

type Conversation = {
	id: string;
	name: string;
	avatar: string;
	lastMessage: string;
	timestamp: string;
	unread: number;
};

export function MessageList({
	type,
	onSelectConversation,
	selectedId,
	fullWidth,
}: MessageListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [conversations, setConversations] = useState<Conversation[]>([]);

	useEffect(() => {
		// This would be replaced by a real API call in production
		// For now we'll use mock data until the real API is connected

		// Mock data for sample conversations
		const mockConversations: Record<string, Conversation[]> = {
			chats: [
				{
					id: "chat-1",
					name: "General Chat",
					avatar: "",
					lastMessage: "Has anyone seen the new schedule?",
					timestamp: "10:30 AM",
					unread: 3,
				},
				// ... other chats
			],
			groups: [
				{
					id: "group-1",
					name: "Front Desk Team",
					avatar: "",
					lastMessage: "Meeting at 3 PM today",
					timestamp: "9:45 AM",
					unread: 2,
				},
				// ... other groups
			],
			"active-shifts": [
				{
					id: "shift-1",
					name: "Morning Shift (8AM-4PM)",
					avatar: "",
					lastMessage: "Alex: Running late by 15 min",
					timestamp: "Just now",
					unread: 5,
				},
				// ... other active shifts
			],
			"one-to-one": [
				{
					id: "user-1",
					name: "John Smith",
					avatar: "",
					lastMessage: "Can we discuss my schedule?",
					timestamp: "11:20 AM",
					unread: 1,
				},
				// ... other direct messages
			],
		};

		// Get conversations and sort them: first by unread count (descending), then by recency
		const conversations = [...(mockConversations[type] || [])];

		// Sort conversations - first by unread messages, then by recency
		conversations.sort((a, b) => {
			// First sort by unread (more unread messages first)
			if (a.unread !== b.unread) {
				return b.unread - a.unread;
			}

			// Then sort by timestamp (convert relative times to a numeric value for sorting)
			const timeValues: Record<string, number> = {
				"Just now": 6,
				"30 min ago": 5,
				"10:30 AM": 4,
				"11:20 AM": 4,
				"9:45 AM": 4,
				Yesterday: 3,
				"2 days ago": 2,
				"3 days ago": 1,
			};

			const aTimeValue = timeValues[a.timestamp] || 0;
			const bTimeValue = timeValues[b.timestamp] || 0;

			return bTimeValue - aTimeValue;
		});

		setConversations(conversations);
	}, [type]);

	const filteredConversations = conversations.filter(
		(conversation) =>
			conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-3 border-b flex-shrink-0">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
						<div className="bg-muted/30 p-4 rounded-full mb-4">
							<MessageSquare className="h-10 w-10" />
						</div>
						<p className="text-center">No messages found</p>
					</div>
				) : filteredConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
						<div className="bg-muted/30 p-4 rounded-full mb-4">
							<Search className="h-10 w-10" />
						</div>
						<p className="text-center">No matching conversations found</p>
					</div>
				) : (
					// Show conversations
					filteredConversations.map((conversation) => (
						<div
							key={conversation.id}
							className={cn(
								"p-3 flex items-center gap-3 cursor-pointer border-b hover:bg-muted/50 transition-colors",
								{
									"bg-accent": selectedId === conversation.id,
									"w-full": fullWidth,
								}
							)}
							onClick={() => onSelectConversation(conversation.id)}>
							<div className="relative">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={conversation.avatar}
										alt={conversation.name}
									/>
									<AvatarFallback>
										{conversation.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{conversation.unread > 0 && (
									<div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
										{conversation.unread}
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-center mb-1">
									<p className="text-sm font-medium truncate">
										{conversation.name}
									</p>
									<p className="text-xs text-muted-foreground whitespace-nowrap">
										{conversation.timestamp}
									</p>
								</div>
								<p className="text-xs text-muted-foreground truncate">
									{conversation.lastMessage}
								</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
